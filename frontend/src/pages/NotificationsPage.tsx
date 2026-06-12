import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FiBell, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import apiClient, { adminApiClient, guideApiClient } from '../services/api';
import type { AxiosInstance } from 'axios';

// ── Tipe data notifikasi ───────────────────────────────────────────────────────
interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data: Record<string, unknown> | null;
}

// ── Tentukan API client berdasarkan token yang tersedia ───────────────────────
function resolveClient(): { client: AxiosInstance } {
  if (localStorage.getItem('admin_token'))  return { client: adminApiClient };
  if (localStorage.getItem('guide_token'))  return { client: guideApiClient };
  return { client: apiClient };
}

// ── Utilitas: waktu relatif ───────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

// ── Komponen satu baris notifikasi ────────────────────────────────────────────
const NotificationRow = ({
  notif,
  onClick,
}: {
  notif: AppNotification;
  onClick: (id: number) => void;
}) => {
  const unreadBg   = useColorModeValue('blue.50',  'blue.900');
  const readBg     = useColorModeValue('white',    'gray.800');
  const hoverBg    = useColorModeValue('blue.100', 'blue.800');
  const borderCol  = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={notif.is_read ? readBg : unreadBg}
      border="1px solid"
      borderColor={borderCol}
      borderRadius="lg"
      px={5}
      py={4}
      cursor={notif.is_read ? 'default' : 'pointer'}
      onClick={() => !notif.is_read && onClick(notif.id)}
      transition="background 0.2s"
      _hover={notif.is_read ? undefined : { bg: hoverBg }}
    >
      <Flex justify="space-between" align="flex-start" gap={4}>
        <HStack align="flex-start" spacing={3}>
          <Box
            mt={1} p={2} borderRadius="full"
            bg={notif.is_read ? 'gray.100' : 'blue.500'}
            color={notif.is_read ? 'gray.500' : 'white'}
            flexShrink={0}
          >
            <Icon as={FiBell} boxSize={4} />
          </Box>
          <Box>
            <HStack spacing={2} align="center">
              <Text fontWeight="semibold" fontSize="sm">{notif.title}</Text>
              {!notif.is_read && <Badge colorScheme="blue" fontSize="10px">Baru</Badge>}
            </HStack>
            <Text fontSize="sm" color="gray.500" mt={0.5}>
              {notif.message}
            </Text>
          </Box>
        </HStack>
        <Text fontSize="xs" color="gray.400" flexShrink={0} mt={1}>
          {relativeTime(notif.created_at)}
        </Text>
      </Flex>
    </Box>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const NotificationsPage: React.FC = () => {
  const toast    = useToast();
  const navigate = useNavigate();

  const { client } = resolveClient();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [marking,       setMarking]       = useState(false);

  const pageBg    = useColorModeValue('gray.50',  'gray.900');
  const cardBg    = useColorModeValue('white',    'gray.800');
  const borderC   = useColorModeValue('gray.200', 'gray.700');
  const emptyColor = useColorModeValue('gray.400', 'gray.500');

  const fetchNotifications = useCallback(() => {
    client.get('/notifications')
      .then(res => {
        setNotifications(res.data.data ?? []);
        setUnreadCount(res.data.unread_count ?? 0);
      })
      .catch(() =>
        toast({ title: 'Gagal memuat notifikasi', status: 'error', duration: 3000 })
      )
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: number) => {
    try {
      await client.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast({ title: 'Gagal menandai notifikasi', status: 'error', duration: 3000 });
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await client.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({ title: 'Semua notifikasi ditandai sudah dibaca', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Gagal menandai semua notifikasi', status: 'error', duration: 3000 });
    } finally {
      setMarking(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* Mini header */}
      <Box
        bg={cardBg}
        borderBottom="1px solid"
        borderColor={borderC}
        position="sticky"
        top={0}
        zIndex={100}
        boxShadow="sm"
      >
        <Container maxW="container.md" py={4}>
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FiArrowLeft />}
                onClick={() => navigate(-1)}
              >
                Kembali
              </Button>
              <Divider orientation="vertical" h="24px" />
              <HStack spacing={2}>
                <Heading size="md">Notifikasi</Heading>
                {unreadCount > 0 && (
                  <Badge colorScheme="red" borderRadius="full">
                    {unreadCount}
                  </Badge>
                )}
              </HStack>
            </HStack>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<FiCheck />}
                onClick={markAllRead}
                isLoading={marking}
                loadingText="Menandai..."
              >
                Tandai Semua Dibaca
              </Button>
            )}
          </Flex>
        </Container>
      </Box>

      {/* Daftar notifikasi */}
      <Container maxW="container.md" py={8}>
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner color="blue.400" size="lg" />
          </Flex>
        ) : notifications.length === 0 ? (
          <Flex
            direction="column" align="center" justify="center"
            py={20} gap={4} color={emptyColor}
          >
            <Icon as={FiBell} boxSize={12} />
            <Text fontSize="lg" fontWeight="medium">Belum ada notifikasi</Text>
            <Text fontSize="sm">Notifikasi akan muncul di sini saat ada aktivitas baru.</Text>
          </Flex>
        ) : (
          <VStack spacing={3} align="stretch">
            {notifications.map(n => (
              <NotificationRow key={n.id} notif={n} onClick={markRead} />
            ))}
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default NotificationsPage;
