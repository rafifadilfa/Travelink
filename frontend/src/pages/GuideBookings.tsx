import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  Tag,
  Divider,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

// ── Tipe ──────────────────────────────────────────────────────────────────────
interface BookingUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface BookingTransaction {
  id: number;
  transaction_code: string;
  tour_date: string | null;
  participant_count: number;
  total_amount: number;
  payment_status: string;
  tour: { id: number; name: string } | null;
  user: BookingUser | null;
}

interface Booking {
  id: number;
  booking_status: string;
  cancelation_reason: string | null;
  created_at: string;
  transaction: BookingTransaction | null;
}

// ── Helper label & warna status ───────────────────────────────────────────────
const statusLabel: Record<string, string> = {
  menunggu_konfirmasi_pemandu:   'Pending',
  menunggu_pembayaran:           'Confirmed',
  menunggu_verifikasi_pembayaran:'Waiting Payment',
  selesai:                       'Completed',
  ditolak:                       'Rejected',
  dibatalkan:                    'Cancelled',
};

const statusColor: Record<string, string> = {
  menunggu_konfirmasi_pemandu:   'yellow',
  menunggu_pembayaran:           'green',
  menunggu_verifikasi_pembayaran:'blue',
  selesai:                       'teal',
  ditolak:                       'red',
  dibatalkan:                    'red',
};

const StatusTag = ({ status }: { status: string }) => (
  <Tag size="md" variant="subtle" colorScheme={statusColor[status] ?? 'gray'}>
    {statusLabel[status] ?? status}
  </Tag>
);

const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// ── Card satu booking ─────────────────────────────────────────────────────────
const BookingCard = ({
  booking,
  onAccept,
  onReject,
}: {
  booking: Booking;
  onAccept: (id: number) => void;
  onReject:  (id: number) => void;
}) => {
  const cardBg     = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tx         = booking.transaction;

  return (
    <Box
      bg={cardBg} borderRadius="lg" boxShadow="md"
      border="1px solid" borderColor={borderColor}
      p={5} transition="all 0.3s"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}
    >
      <VStack spacing={4} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack>
            <Avatar
              name={tx?.user?.name ?? 'Wisatawan'}
              src={tx?.user?.avatar_url ?? undefined}
              size="md"
            />
            <Box>
              <Text fontWeight="bold" fontSize="lg">{tx?.user?.name ?? 'Wisatawan'}</Text>
              <Text fontSize="sm" color="gray.500">
                Booking ID: #{booking.id}
                {tx?.transaction_code ? ` · ${tx.transaction_code}` : ''}
              </Text>
            </Box>
          </HStack>
          <StatusTag status={booking.booking_status} />
        </Flex>
        <Divider />
        <Box>
          <Heading size="sm" mb={2}>{tx?.tour?.name ?? '—'}</Heading>
          <HStack spacing={6} color={useColorModeValue('gray.600', 'gray.400')}>
            <HStack>
              <Icon as={FiCalendar} />
              <Text fontSize="sm">{fmtDate(tx?.tour_date ?? null)}</Text>
            </HStack>
            <HStack>
              <Icon as={FiClock} />
              <Text fontSize="sm">{fmtDate(booking.created_at)}</Text>
            </HStack>
            <HStack>
              <Icon as={FiUsers} />
              <Text fontSize="sm">{tx?.participant_count ?? 1} Tamu</Text>
            </HStack>
          </HStack>
        </Box>
        <Divider />
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text fontSize="sm" color="gray.500">Total Pembayaran</Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              {fmt(tx?.total_amount ?? 0)}
            </Text>
          </Box>
          <HStack>
            {booking.booking_status === 'menunggu_konfirmasi_pemandu' && (
              <>
                <Button
                  colorScheme="green" size="sm" leftIcon={<FiCheckCircle />}
                  onClick={() => onAccept(booking.id)}
                >
                  Terima
                </Button>
                <Button
                  variant="outline" colorScheme="red" size="sm" leftIcon={<FiXCircle />}
                  onClick={() => onReject(booking.id)}
                >
                  Tolak
                </Button>
              </>
            )}
            {booking.booking_status === 'menunggu_pembayaran' && (
              <Button
                variant="outline" colorScheme="red" size="sm" leftIcon={<FiXCircle />}
                onClick={() => onReject(booking.id)}
              >
                Batalkan
              </Button>
            )}
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const GuideBookings: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const [activeBookings,  setActiveBookings]  = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [loadingActive,   setLoadingActive]   = useState(true);
  const [loadingHistory,  setLoadingHistory]  = useState(true);

  useEffect(() => {
    guideApiClient.get('/guide/bookings?tab=active')
      .then(res => setActiveBookings(res.data.data))
      .catch(() => toast({ title: 'Gagal memuat booking aktif', status: 'error', duration: 3000 }))
      .finally(() => setLoadingActive(false));

    guideApiClient.get('/guide/bookings?tab=history')
      .then(res => setHistoryBookings(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleAccept = async (id: number) => {
    try {
      const res = await guideApiClient.post(`/guide/bookings/${id}/accept`);
      const updated: Booking = res.data.booking;
      setActiveBookings(prev => prev.map(b => b.id === id ? updated : b));
      toast({ title: 'Pesanan diterima!', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      toast({ title: 'Gagal menerima pesanan', description: err.response?.data?.message, status: 'error', duration: 4000 });
    }
  };

  const handleReject = (id: number) => {
    navigate(`/guide/bookings/cancel/${id}`);
  };

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <Box>
            <Heading as="h1" size="xl">Client Bookings</Heading>
            <Text color={secondaryTextColor} mt={1}>
              Review and manage all tour bookings from your clients.
            </Text>
          </Box>
        </Flex>

        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList>
            <Tab>Upcoming ({activeBookings.length})</Tab>
            <Tab>Past ({historyBookings.length})</Tab>
          </TabList>
          <TabPanels mt={6}>
            <TabPanel p={0}>
              {loadingActive ? (
                <Flex justify="center" py={10}><Spinner color="blue.400" size="lg" /></Flex>
              ) : activeBookings.length > 0 ? (
                <VStack spacing={5} align="stretch">
                  {activeBookings.map(b => (
                    <BookingCard key={b.id} booking={b} onAccept={handleAccept} onReject={handleReject} />
                  ))}
                </VStack>
              ) : (
                <Text p={10} textAlign="center" color={secondaryTextColor}>No upcoming bookings found.</Text>
              )}
            </TabPanel>
            <TabPanel p={0}>
              {loadingHistory ? (
                <Flex justify="center" py={10}><Spinner color="blue.400" size="lg" /></Flex>
              ) : historyBookings.length > 0 ? (
                <VStack spacing={5} align="stretch">
                  {historyBookings.map(b => (
                    <BookingCard key={b.id} booking={b} onAccept={handleAccept} onReject={handleReject} />
                  ))}
                </VStack>
              ) : (
                <Text p={10} textAlign="center" color={secondaryTextColor}>No past bookings found.</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </GuideLayout>
  );
};

export default GuideBookings;
