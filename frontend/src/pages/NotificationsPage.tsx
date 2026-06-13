import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FiBell, FiArrowLeft, FiCheck, FiInbox } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient, { adminApiClient, guideApiClient } from '../services/api';
import type { AxiosInstance } from 'axios';
import TouristNavbar from '../components/TouristNavbar';

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

// ── Pilih API client berdasarkan ?role= di URL
function resolveClient(role: string | null): AxiosInstance {
  if (role === 'admin')   return adminApiClient;
  if (role === 'guide')   return guideApiClient;
  if (role === 'tourist') return apiClient;
  if (localStorage.getItem('admin_token')) return adminApiClient;
  if (localStorage.getItem('guide_token')) return guideApiClient;
  return apiClient;
}

// ── Utilitas: waktu relatif ───────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

// ── Satu baris notifikasi (compact) ──────────────────────────────────────────
const NotificationRow = ({
  notif,
  onClick,
  isLast,
}: {
  notif: AppNotification;
  onClick: (id: number) => void;
  isLast: boolean;
}) => {
  const readBg   = useColorModeValue('white',   'gray.800');
  const unreadBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg  = useColorModeValue('gray.50', 'gray.700');
  const sub      = useColorModeValue('gray.500', 'gray.400');

  return (
    <>
      <Box
        px={5} py={3}
        bg={notif.is_read ? readBg : unreadBg}
        borderLeft="3px solid"
        borderLeftColor={notif.is_read ? 'transparent' : 'blue.400'}
        cursor={notif.is_read ? 'default' : 'pointer'}
        onClick={() => !notif.is_read && onClick(notif.id)}
        _hover={notif.is_read ? undefined : { bg: hoverBg }}
        transition="background 0.15s"
      >
        <Flex align="flex-start" gap={3}>
          {/* Ikon */}
          <Box
            mt={0.5} p={1.5} borderRadius="md" flexShrink={0}
            bg={notif.is_read ? 'gray.100' : 'blue.100'}
            color={notif.is_read ? 'gray.400' : 'blue.500'}
          >
            <Icon as={FiBell} boxSize={3.5} />
          </Box>

          {/* Konten */}
          <Box flex={1} minW={0}>
            <Flex justify="space-between" align="center" gap={2}>
              <HStack spacing={1.5} flex={1} minW={0}>
                <Text
                  fontWeight={notif.is_read ? 'normal' : 'semibold'}
                  fontSize="sm"
                  noOfLines={1}
                >
                  {notif.title}
                </Text>
                {!notif.is_read && (
                  <Badge
                    colorScheme="blue" fontSize="9px"
                    px={1.5} borderRadius="full" flexShrink={0}
                  >
                    Baru
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color={sub} flexShrink={0} whiteSpace="nowrap">
                {relativeTime(notif.created_at)}
              </Text>
            </Flex>
            <Text fontSize="xs" color={sub} mt={0.5} noOfLines={2} lineHeight="short">
              {notif.message}
            </Text>
          </Box>
        </Flex>
      </Box>
      {!isLast && <Divider />}
    </>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const NotificationsPage: React.FC = () => {
  const toast    = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const client = resolveClient(searchParams.get('role'));

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [marking,       setMarking]       = useState(false);

  const pageBg   = useColorModeValue('gray.50',  'gray.900');
  const cardBg   = useColorModeValue('white',    'gray.800');
  const borderC  = useColorModeValue('gray.200', 'gray.700');
  const sub      = useColorModeValue('gray.500', 'gray.400');
  const emptyCol = useColorModeValue('gray.400', 'gray.500');

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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
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

  const role = searchParams.get('role');

  return (
    <Box minH="100vh" bg={pageBg}>
      {role === 'tourist' && <TouristNavbar />}

      <Container maxW="container.xl" py={6} px={{ base: 4, md: 6 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '240px 1fr' }}
          gap={5}
          alignItems="flex-start"
        >
          {/* ── Sidebar kiri ─────────────────────────────────────────────── */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderC}
            p={5}
            position={{ base: 'static', lg: 'sticky' }}
            top="20px"
            boxShadow="sm"
          >
            {/* Judul */}
            <HStack spacing={3} mb={4}>
              <Box p={2} borderRadius="lg" bg="blue.50" color="blue.500">
                <Icon as={FiBell} boxSize={5} />
              </Box>
              <Box>
                <Heading size="sm">Notifikasi</Heading>
                <Text fontSize="xs" color={sub}>Pusat aktivitas Anda</Text>
              </Box>
            </HStack>

            <Divider mb={4} />

            {/* Statistik */}
            <VStack align="stretch" spacing={2} mb={4}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={sub}>Belum dibaca</Text>
                <Badge
                  colorScheme={unreadCount > 0 ? 'red' : 'gray'}
                  borderRadius="full" px={2}
                >
                  {unreadCount}
                </Badge>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color={sub}>Total</Text>
                <Text fontSize="sm" fontWeight="medium">{notifications.length}</Text>
              </Flex>
            </VStack>

            <Divider mb={4} />

            {/* Aksi */}
            <VStack align="stretch" spacing={2}>
              <Button
                size="sm" variant="ghost" leftIcon={<FiArrowLeft />}
                justifyContent="flex-start"
                onClick={() => navigate(-1)}
              >
                Kembali
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  bg="blue.500" color="white" _hover={{ bg: 'blue.600' }}
                  leftIcon={<FiCheck />}
                  onClick={markAllRead}
                  isLoading={marking}
                  loadingText="Menandai..."
                >
                  Tandai Semua Dibaca
                </Button>
              )}
            </VStack>
          </Box>

          {/* ── Panel kanan: daftar notifikasi ───────────────────────────── */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderC}
            overflow="hidden"
            boxShadow="sm"
          >
            {/* Header panel */}
            <Flex
              px={5} py={3}
              borderBottom="1px solid"
              borderColor={borderC}
              align="center"
              justify="space-between"
            >
              <Text fontWeight="semibold" fontSize="sm">
                {loading ? 'Memuat...' : `${notifications.length} notifikasi`}
              </Text>
              {unreadCount > 0 && (
                <Text fontSize="xs" color="blue.500" fontWeight="medium">
                  {unreadCount} belum dibaca — klik untuk tandai
                </Text>
              )}
            </Flex>

            {/* Isi */}
            {loading ? (
              <Flex justify="center" py={16}>
                <Spinner color="blue.400" size="md" />
              </Flex>
            ) : notifications.length === 0 ? (
              <Flex
                direction="column" align="center" justify="center"
                py={16} gap={3} color={emptyCol}
              >
                <Icon as={FiInbox} boxSize={10} />
                <Text fontWeight="medium" fontSize="sm">Belum ada notifikasi</Text>
                <Text fontSize="xs" textAlign="center" maxW="260px">
                  Notifikasi akan muncul di sini saat ada aktivitas baru.
                </Text>
              </Flex>
            ) : (
              <Box>
                {notifications.map((n, idx) => (
                  <NotificationRow
                    key={n.id}
                    notif={n}
                    onClick={markRead}
                    isLast={idx === notifications.length - 1}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default NotificationsPage;
