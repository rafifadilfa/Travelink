import React, { useRef, useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  useDisclosure,
  useToast,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiUsers, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

// ── Tipe: Private Trip Booking ─────────────────────────────────────────────────
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

// ── Tipe: Smart Open Trip Group ────────────────────────────────────────────────
interface OpenTripGroupData {
  id: number;
  tour_id: number;
  tour_name: string | null;
  trip_date: string | null;
  member_count: number;
  paid_count: number;
  matched_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

// ── Helper label & warna status booking ───────────────────────────────────────
const statusLabel: Record<string, string> = {
  menunggu_konfirmasi_pemandu:    'Menunggu Konfirmasi',
  menunggu_pembayaran:            'Menunggu Pembayaran',
  menunggu_verifikasi_pembayaran: 'Verifikasi Pembayaran',
  terkonfirmasi:                  'Terkonfirmasi',
  selesai:                        'Selesai',
  ditolak:                        'Ditolak',
  dibatalkan:                     'Dibatalkan',
};

const statusColor: Record<string, string> = {
  menunggu_konfirmasi_pemandu:    'yellow',
  menunggu_pembayaran:            'green',
  menunggu_verifikasi_pembayaran: 'blue',
  terkonfirmasi:                  'teal',
  selesai:                        'teal',
  ditolak:                        'red',
  dibatalkan:                     'red',
};

const StatusTag = ({ status }: { status: string }) => (
  <Tag size="md" variant="subtle" colorScheme={statusColor[status] ?? 'gray'}>
    {statusLabel[status] ?? status}
  </Tag>
);

const fmt     = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// ── Card: satu Private Trip booking ───────────────────────────────────────────
const BookingCard = ({
  booking,
  onAccept,
  onReject,
}: {
  booking: Booking;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) => {
  const cardBg      = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subColor    = useColorModeValue('gray.600', 'gray.400');
  const tx          = booking.transaction;

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
                Booking #{booking.id}
                {tx?.transaction_code ? ` · ${tx.transaction_code}` : ''}
              </Text>
            </Box>
          </HStack>
          <StatusTag status={booking.booking_status} />
        </Flex>
        <Divider />
        <Box>
          <Heading size="sm" mb={2}>{tx?.tour?.name ?? '—'}</Heading>
          <HStack spacing={6} color={subColor} flexWrap="wrap">
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

// ── Card: satu Smart Open Trip Group ──────────────────────────────────────────
const OpenTripGroupCard = ({
  group,
  onReject,
}: {
  group: OpenTripGroupData;
  onReject?: (id: number) => void;
}) => {
  const cardBg      = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.200', 'purple.700');
  const subColor    = useColorModeValue('gray.600', 'gray.400');
  const allPaid     = group.member_count > 0 && group.paid_count === group.member_count;
  const somePaid    = group.paid_count > 0 && !allPaid;

  const paymentColorScheme = allPaid ? 'green' : somePaid ? 'yellow' : 'gray';
  const paymentLabel       = allPaid ? 'Semua Lunas' : somePaid ? 'Sebagian Lunas' : 'Belum Dibayar';

  // Tombol Tolak hanya muncul jika 0 anggota sudah bayar dan callback disediakan
  const canReject = onReject !== undefined && group.paid_count === 0;

  return (
    <Box
      bg={cardBg} borderRadius="lg" boxShadow="md"
      border="2px solid" borderColor={borderColor}
      p={5} transition="all 0.3s"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}
    >
      <VStack spacing={4} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack>
            <Box
              w={10} h={10} borderRadius="full"
              bg="purple.500" display="flex" alignItems="center" justifyContent="center"
            >
              <Icon as={FiUsers} color="white" boxSize={5} />
            </Box>
            <Box>
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="lg">{group.tour_name ?? '—'}</Text>
                <Badge colorScheme="purple" fontSize="xs">Smart Open Trip</Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">Grup #{group.id}</Text>
            </Box>
          </HStack>
          <Tag size="md" variant="subtle" colorScheme={paymentColorScheme}>
            {paymentLabel}
          </Tag>
        </Flex>

        <Divider />

        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
          <HStack spacing={6} color={subColor} flexWrap="wrap">
            <HStack>
              <Icon as={FiCalendar} />
              <Text fontSize="sm">{fmtDate(group.trip_date)}</Text>
            </HStack>
            <HStack>
              <Icon as={FiUsers} />
              <Text fontSize="sm">{group.member_count} Peserta</Text>
            </HStack>
            <HStack>
              <Icon as={FiDollarSign} />
              <Text fontSize="sm">{group.paid_count}/{group.member_count} Sudah Bayar</Text>
            </HStack>
          </HStack>

          {canReject && (
            <Button
              variant="outline" colorScheme="red" size="sm" leftIcon={<FiXCircle />}
              onClick={() => onReject(group.id)}
            >
              Tolak Grup
            </Button>
          )}
        </Flex>
      </VStack>
    </Box>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyState = ({ message }: { message: string }) => {
  const color = useColorModeValue('gray.500', 'gray.400');
  return (
    <Text p={10} textAlign="center" color={color}>{message}</Text>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────────
const GuideBookings: React.FC = () => {
  const toast    = useToast();
  const navigate = useNavigate();
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

  const [activeBookings,    setActiveBookings]    = useState<Booking[]>([]);
  const [historyBookings,   setHistoryBookings]   = useState<Booking[]>([]);
  const [activeOpenTrips,   setActiveOpenTrips]   = useState<OpenTripGroupData[]>([]);
  const [historyOpenTrips,  setHistoryOpenTrips]  = useState<OpenTripGroupData[]>([]);
  const [loadingActive,     setLoadingActive]     = useState(true);
  const [loadingHistory,    setLoadingHistory]    = useState(true);

  // ── State dialog konfirmasi tolak grup ──────────────────────────────────────
  const [rejectGroupId,   setRejectGroupId]   = useState<number | null>(null);
  const [isRejecting,     setIsRejecting]     = useState(false);
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const rejectCancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    guideApiClient.get('/guide/bookings?tab=active')
      .then(res => {
        setActiveBookings(res.data.data ?? []);
        setActiveOpenTrips(res.data.open_trip_groups ?? []);
      })
      .catch(() => toast({ title: 'Gagal memuat booking aktif', status: 'error', duration: 3000 }))
      .finally(() => setLoadingActive(false));

    guideApiClient.get('/guide/bookings?tab=history')
      .then(res => {
        setHistoryBookings(res.data.data ?? []);
        setHistoryOpenTrips(res.data.open_trip_groups ?? []);
      })
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
      toast({
        title: 'Gagal menerima pesanan',
        description: err.response?.data?.message,
        status: 'error',
        duration: 4000,
      });
    }
  };

  const handleReject = (id: number) => {
    navigate(`/guide/bookings/cancel/${id}`);
  };

  // Buka dialog konfirmasi tolak grup
  const openRejectDialog = (groupId: number) => {
    setRejectGroupId(groupId);
    onRejectOpen();
  };

  // Eksekusi penolakan grup setelah guide konfirmasi di dialog
  const confirmRejectGroup = async () => {
    if (rejectGroupId === null) return;
    setIsRejecting(true);
    try {
      await guideApiClient.post(`/guide/open-trip-groups/${rejectGroupId}/reject`);
      setActiveOpenTrips(prev => prev.filter(g => g.id !== rejectGroupId));
      toast({
        title: 'Grup berhasil ditolak.',
        description: 'Semua peserta telah dikeluarkan dari grup.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      onRejectClose();
    } catch (err: any) {
      toast({
        title: 'Gagal menolak grup',
        description: err.response?.data?.message ?? 'Terjadi kesalahan.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const activeTotal  = activeBookings.length  + activeOpenTrips.length;
  const historyTotal = historyBookings.length + historyOpenTrips.length;

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Flex justifyContent="space-between" alignItems="center" mb={8}>
          <Box>
            <Heading as="h1" size="xl">Client Bookings</Heading>
            <Text color={secondaryTextColor} mt={1}>
              Kelola semua pesanan dan Smart Open Trip dari klien Anda.
            </Text>
          </Box>
        </Flex>

        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList>
            <Tab>Upcoming ({loadingActive ? '…' : activeTotal})</Tab>
            <Tab>Past ({loadingHistory ? '…' : historyTotal})</Tab>
          </TabList>

          <TabPanels mt={6}>
            {/* ── Tab Upcoming ────────────────────────────────────────── */}
            <TabPanel p={0}>
              {loadingActive ? (
                <Flex justify="center" py={10}><Spinner color="blue.400" size="lg" /></Flex>
              ) : activeTotal === 0 ? (
                <EmptyState message="Tidak ada booking atau Smart Open Trip yang akan datang." />
              ) : (
                <VStack spacing={5} align="stretch">
                  {activeOpenTrips.map(g => (
                    <OpenTripGroupCard key={`ot-${g.id}`} group={g} onReject={openRejectDialog} />
                  ))}
                  {activeBookings.map(b => (
                    <BookingCard key={`bk-${b.id}`} booking={b} onAccept={handleAccept} onReject={handleReject} />
                  ))}
                </VStack>
              )}
            </TabPanel>

            {/* ── Tab Past ────────────────────────────────────────────── */}
            <TabPanel p={0}>
              {loadingHistory ? (
                <Flex justify="center" py={10}><Spinner color="blue.400" size="lg" /></Flex>
              ) : historyTotal === 0 ? (
                <EmptyState message="Belum ada riwayat booking atau Smart Open Trip." />
              ) : (
                <VStack spacing={5} align="stretch">
                  {historyOpenTrips.map(g => (
                    <OpenTripGroupCard key={`ot-${g.id}`} group={g} />
                  ))}
                  {historyBookings.map(b => (
                    <BookingCard key={`bk-${b.id}`} booking={b} onAccept={handleAccept} onReject={handleReject} />
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* ── Dialog konfirmasi tolak grup Smart Open Trip ────────── */}
      <AlertDialog
        isOpen={isRejectOpen}
        leastDestructiveRef={rejectCancelRef as React.RefObject<HTMLElement>}
        onClose={onRejectClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl" mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="gray.800">
              Tolak Grup Smart Open Trip?
            </AlertDialogHeader>
            <AlertDialogBody color="gray.600" fontSize="sm">
              Grup #{rejectGroupId} akan ditolak. Semua peserta akan dikeluarkan
              dari grup dan dapat mendaftar ulang ke trip lain.
              <br /><br />
              <strong>Tindakan ini tidak dapat dibatalkan.</strong>
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                ref={rejectCancelRef}
                onClick={onRejectClose}
                size="sm"
                variant="ghost"
                isDisabled={isRejecting}
              >
                Batal
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                onClick={confirmRejectGroup}
                isLoading={isRejecting}
                loadingText="Menolak..."
              >
                Ya, Tolak Grup
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </GuideLayout>
  );
};

export default GuideBookings;
