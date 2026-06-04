import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, VStack, HStack,
  Button, Tabs, TabList, TabPanels, Tab, TabPanel, Avatar,
  Tag, Divider, useToast, Spinner, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, FormControl, FormLabel,
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiXCircle, FiUsers, FiDollarSign } from 'react-icons/fi';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface BookingUser { id: number; name: string; email: string; avatar_url: string | null; }
interface BookingTour { id: number; name: string; }
interface BookingTransaction {
  id: number; transaction_code: string; tour_date: string;
  participant_count: number; total_amount: number; payment_status: string;
  tour: BookingTour | null; user: BookingUser | null;
}
interface Booking {
  id: number; booking_status: string; cancelation_reason: string | null;
  payment_proof_url: string | null; paid_at: string | null;
  created_at: string; transaction: BookingTransaction | null;
}

const STATUS: Record<string, { label: string; color: string }> = {
  menunggu_konfirmasi_pemandu:    { label: 'Menunggu Konfirmasi', color: 'yellow' },
  menunggu_pembayaran:            { label: 'Menunggu Pembayaran', color: 'orange' },
  menunggu_verifikasi_pembayaran: { label: 'Verifikasi Pembayaran', color: 'blue' },
  terkonfirmasi:                  { label: 'Terkonfirmasi', color: 'green'  },
  selesai:                        { label: 'Selesai',       color: 'gray'   },
  ditolak:                        { label: 'Ditolak',       color: 'red'    },
  dibatalkan:                     { label: 'Dibatalkan',    color: 'red'    },
  dibatalkan_otomatis:            { label: 'Batal Otomatis',color: 'red'    },
};

const fmt = (amount: number) => 'Rp ' + amount.toLocaleString('id-ID');
const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });

const BookingCard = ({
  booking, onAccept, onReject,
}: {
  booking: Booking;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const border  = useColorModeValue('gray.200', 'gray.700');
  const sub     = useColorModeValue('gray.600', 'gray.400');
  const tx      = booking.transaction;
  const st      = STATUS[booking.booking_status] ?? { label: booking.booking_status, color: 'gray' };
  const isConfirmable = booking.booking_status === 'menunggu_konfirmasi_pemandu';

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="md" border="1px solid" borderColor={border}
      p={5} transition="all 0.2s" _hover={{ boxShadow: 'lg' }}>
      <VStack spacing={4} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <HStack>
            <Avatar name={tx?.user?.name ?? 'Wisatawan'} src={tx?.user?.avatar_url ?? undefined} size="md" />
            <Box>
              <Text fontWeight="bold">{tx?.user?.name ?? 'Wisatawan'}</Text>
              <Text fontSize="sm" color="gray.500">{tx?.transaction_code}</Text>
            </Box>
          </HStack>
          <Tag colorScheme={st.color} variant="subtle" size="md">{st.label}</Tag>
        </Flex>
        <Divider />
        <Box>
          <Heading size="sm" mb={2}>{tx?.tour?.name ?? '—'}</Heading>
          <HStack spacing={6} color={sub} flexWrap="wrap">
            <HStack spacing={1}><FiCalendar /><Text fontSize="sm">{tx?.tour_date ? fmtDate(tx.tour_date) : '—'}</Text></HStack>
            <HStack spacing={1}><FiUsers /><Text fontSize="sm">{tx?.participant_count ?? '—'} peserta</Text></HStack>
          </HStack>
        </Box>
        <Divider />
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={1} color="blue.500">
            <FiDollarSign />
            <Text fontWeight="bold" fontSize="lg">{tx?.total_amount ? fmt(tx.total_amount) : '—'}</Text>
          </HStack>
          {isConfirmable && (
            <HStack>
              <Button colorScheme="green" size="sm" leftIcon={<FiCheckCircle />} onClick={() => onAccept(booking.id)}>
                Terima Pesanan
              </Button>
              <Button variant="outline" colorScheme="red" size="sm" leftIcon={<FiXCircle />} onClick={() => onReject(booking.id)}>
                Tolak Pesanan
              </Button>
            </HStack>
          )}
        </Flex>
        {booking.cancelation_reason && (
          <Text fontSize="sm" color="red.400" fontStyle="italic">Alasan: {booking.cancelation_reason}</Text>
        )}
      </VStack>
    </Box>
  );
};

const GuideBookings: React.FC = () => {
  const toast      = useToast();
  const secondary  = useColorModeValue('gray.500', 'gray.400');

  const [activeBookings,  setActiveBookings]  = useState<Booking[]>([]);
  const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
  const [loadingActive,   setLoadingActive]   = useState(true);
  const [loadingHistory,  setLoadingHistory]  = useState(true);

  // State untuk modal tolak
  const [rejectId,        setRejectId]        = useState<number | null>(null);
  const [rejectReason,    setRejectReason]    = useState('');
  const [isRejecting,     setIsRejecting]     = useState(false);

  const fetchActive = () => {
    setLoadingActive(true);
    guideApiClient.get('/guide/bookings?tab=active')
      .then(res => setActiveBookings(res.data.data))
      .catch(() => toast({ title: 'Gagal memuat pesanan aktif', status: 'error', duration: 4000, isClosable: true }))
      .finally(() => setLoadingActive(false));
  };

  const fetchHistory = () => {
    setLoadingHistory(true);
    guideApiClient.get('/guide/bookings?tab=history')
      .then(res => setHistoryBookings(res.data.data))
      .catch(() => toast({ title: 'Gagal memuat riwayat', status: 'error', duration: 4000, isClosable: true }))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => { fetchActive(); fetchHistory(); }, []);

  const handleAccept = async (id: number) => {
    try {
      await guideApiClient.post(`/guide/bookings/${id}/accept`);
      toast({ title: 'Pesanan diterima! Wisatawan akan diminta melakukan pembayaran.', status: 'success', duration: 4000, isClosable: true });
      fetchActive();
    } catch (err: any) {
      toast({ title: 'Gagal menerima pesanan', description: err.response?.data?.message, status: 'error', duration: 4000, isClosable: true });
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      await guideApiClient.post(`/guide/bookings/${rejectId}/reject`, { rejection_reason: rejectReason });
      toast({ title: 'Pesanan ditolak.', status: 'info', duration: 3000, isClosable: true });
      setRejectId(null);
      setRejectReason('');
      fetchActive();
      fetchHistory();
    } catch (err: any) {
      toast({ title: 'Gagal menolak', description: err.response?.data?.message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Heading as="h1" size="xl" mb={2}>Pesanan Masuk</Heading>
        <Text color={secondary} mb={6}>Tinjau dan kelola semua pesanan dari wisatawan.</Text>

        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList>
            <Tab>Pesanan Aktif ({activeBookings.length})</Tab>
            <Tab>Riwayat ({historyBookings.length})</Tab>
          </TabList>

          <TabPanels mt={6}>
            {/* Pesanan Aktif */}
            <TabPanel p={0}>
              {loadingActive ? (
                <Flex justify="center" py={20}><Spinner size="xl" color="blue.400" /></Flex>
              ) : activeBookings.length === 0 ? (
                <Text p={10} textAlign="center" color={secondary}>Belum ada pesanan aktif.</Text>
              ) : (
                <VStack spacing={5} align="stretch">
                  {activeBookings.map(b => (
                    <BookingCard key={b.id} booking={b}
                      onAccept={handleAccept}
                      onReject={id => { setRejectId(id); setRejectReason(''); }} />
                  ))}
                </VStack>
              )}
            </TabPanel>

            {/* Riwayat */}
            <TabPanel p={0}>
              {loadingHistory ? (
                <Flex justify="center" py={20}><Spinner size="xl" color="blue.400" /></Flex>
              ) : historyBookings.length === 0 ? (
                <Text p={10} textAlign="center" color={secondary}>Belum ada riwayat pesanan.</Text>
              ) : (
                <VStack spacing={5} align="stretch">
                  {historyBookings.map(b => (
                    <BookingCard key={b.id} booking={b}
                      onAccept={() => {}} onReject={() => {}} />
                  ))}
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal Tolak Pesanan */}
      <Modal isOpen={!!rejectId} onClose={() => setRejectId(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tolak Pesanan</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Alasan Penolakan</FormLabel>
              <Textarea
                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Tulis alasan penolakan untuk wisatawan..." rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setRejectId(null)}>Batal</Button>
            <Button colorScheme="red" isLoading={isRejecting}
              isDisabled={!rejectReason.trim()} onClick={handleRejectSubmit}>
              Tolak Pesanan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </GuideLayout>
  );
};

export default GuideBookings;
