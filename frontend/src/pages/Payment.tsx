import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Flex, Text, Button, Heading, Container,
  useColorModeValue, Icon, VStack, HStack, Divider,
  useToast, Spinner, Badge,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckCircleIcon, CalendarIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { FiFileText, FiMapPin, FiUser as FiUserIcon, FiUsers } from 'react-icons/fi';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// Tambahkan tipe snap ke window global agar TypeScript tidak complain
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void;
        onPending: (result: unknown) => void;
        onError:   (result: unknown) => void;
        onClose:   () => void;
      }) => void;
    };
  }
}

interface BookingDetails {
  tourId:         number;
  tourName:       string;
  tourLocation:   string;
  participants:   number;
  pricePerPerson: number;
  totalPrice:     number;
  tourDate:       string;
  guideName:      string;
}

// Load Snap.js dari CDN Midtrans Sandbox (sama persis pola WaitingRoom)
const loadSnapScript = (): Promise<void> =>
  new Promise(resolve => {
    if (window.snap) { resolve(); return; }
    const existing = document.getElementById('midtrans-snap');
    if (existing) { existing.addEventListener('load', () => resolve()); return; }

    const script = document.createElement('script');
    script.id  = 'midtrans-snap';
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? '');
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

const POLL_MAX   = 20;
const POLL_MS    = 3000;

const Payment: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();

  const details: BookingDetails | undefined = (location.state as { bookingDetails?: BookingDetails })?.bookingDetails;

  const [snapLoaded,  setSnapLoaded]  = useState(false);
  const [isPaying,    setIsPaying]    = useState(false);
  const [paid,        setPaid]        = useState(false);
  const [bookingId,   setBookingId]   = useState<number | null>(null);
  const [txCode,      setTxCode]      = useState('');
  const [creatingBooking, setCreatingBooking] = useState(false);

  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTries  = useRef(0);

  // ── Warna (semua dideklarasikan sebelum return/kondisional) ──────────
  const overallBg         = useColorModeValue('blue.50',  'gray.900');
  const cardBg            = useColorModeValue('white',    'gray.800');
  const glassBg           = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(26,32,44,0.85)');
  const primaryColor      = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor  = useColorModeValue('gray.700', 'whiteAlpha.900');
  const secondaryText     = useColorModeValue('gray.500', 'gray.400');
  const borderColor       = useColorModeValue('gray.200', 'gray.700');
  const summaryBg         = useColorModeValue('gray.50',  'gray.750');
  const totalBg           = useColorModeValue('blue.100', 'blue.900');
  const totalBorderColor  = useColorModeValue('blue.200', 'blue.700');
  const accentGradient    = `linear(to-br, ${useColorModeValue('purple.400','purple.300')}, ${primaryColor})`;
  const successGradient   = `linear(to-r, green.400, green.500)`;
  const successHoverGrad  = `linear(to-r, green.500, green.600)`;
  const focusShadow       = useColorModeValue('blue.200', 'blue.700');

  const baseBtn = {
    borderRadius: 'lg', fontWeight: 'semibold', h: '44px', px: 5, fontSize: 'sm',
    transition: 'all 0.25s cubic-bezier(.08,.52,.52,1)',
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${focusShadow}` },
  };
  const outlineBtn = {
    ...baseBtn, bg: 'transparent', color: primaryColor,
    border: '2px solid', borderColor: primaryColor,
    _hover: { bg: useColorModeValue('blue.50','rgba(49,130,206,0.1)'), borderColor: primaryHoverColor, color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md' },
  };
  const payBtn = {
    ...baseBtn,
    bgGradient: successGradient, color: 'white', boxShadow: 'md',
    fontSize: { base: 'md', md: 'lg' }, h: { base: '48px', md: '52px' }, px: 6,
    _hover: { bgGradient: successHoverGrad, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg' },
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // ── Load Snap.js saat mount ─────────────────────────────────
  useEffect(() => {
    loadSnapScript().then(() => setSnapLoaded(true));
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Polling status pembayaran ────────────────────────────────
  const startPolling = useCallback((bId: number) => {
    pollTries.current = 0;
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      pollTries.current += 1;
      try {
        const res = await apiClient.get<{ payment_status: string; booking_status: string }>(
          `/bookings/${bId}/payment`
        );
        if (res.data.payment_status === 'paid') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPaid(true);
          toast({
            title: 'Pembayaran berhasil!',
            description: 'Booking kamu sudah terkonfirmasi.',
            status: 'success', duration: 6000, isClosable: true,
          });
        }
      } catch { /* abaikan error sementara */ }

      if (pollTries.current >= POLL_MAX) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    }, POLL_MS);
  }, [toast]);

  // ── Alur utama: buat booking → buat snap token → bayar ──────
  const handlePay = useCallback(async () => {
    if (!details) return;
    if (!snapLoaded) {
      toast({ title: 'Sistem pembayaran sedang dimuat, coba lagi.', status: 'warning', duration: 3000 });
      return;
    }
    setIsPaying(true);

    try {
      // Step 1: buat booking di backend jika belum ada
      let bId = bookingId;
      let code = txCode;

      if (!bId) {
        setCreatingBooking(true);
        const bookRes = await apiClient.post<{
          booking_id: number;
          transaction_code: string;
          total_amount: number;
        }>('/bookings', {
          tour_id:      details.tourId,
          participants: details.participants,
          tour_date:    details.tourDate,
        });
        bId  = bookRes.data.booking_id;
        code = bookRes.data.transaction_code;
        setBookingId(bId);
        setTxCode(code);
        setCreatingBooking(false);
      }

      // Step 2: minta snap token dari backend
      const payRes = await apiClient.post<{ snap_token: string; total_amount: number }>(
        `/bookings/${bId}/payment`
      );

      // Step 3: tampilkan popup Midtrans Snap
      window.snap!.pay(payRes.data.snap_token, {
        onSuccess: () => {
          startPolling(bId!);
        },
        onPending: () => {
          toast({ title: 'Pembayaran menunggu konfirmasi.', description: 'Status akan diperbarui otomatis.', status: 'info', duration: 5000, isClosable: true });
          startPolling(bId!);
        },
        onError: () => {
          toast({ title: 'Pembayaran gagal.', description: 'Silakan coba lagi.', status: 'error', duration: 5000, isClosable: true });
        },
        onClose: () => {
          // User tutup popup — polling satu putaran untuk cek apakah sempat bayar
          startPolling(bId!);
        },
      });
    } catch (err: unknown) {
      setCreatingBooking(false);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: msg ?? 'Gagal memulai pembayaran.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsPaying(false);
    }
  }, [details, snapLoaded, bookingId, txCode, startPolling, toast]);

  // ── Redirect jika tidak ada data booking ────────────────────
  if (!details) {
    return (
      <Box minH="100vh" bg={overallBg} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
        <Text fontSize="xl" color={secondaryText}>Data booking tidak ditemukan.</Text>
        <Button colorScheme="blue" onClick={() => navigate('/tours')}>Pilih Tour</Button>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={overallBg}>
      <TouristNavbar />

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondaryText}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/dashboard')}>Beranda</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/bookings')} color={secondaryText}>Pesanan Saya</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="blue.500" fontWeight="medium">Pembayaran</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Heading as="h1" size={{ base: 'lg', md: 'xl' }} fontWeight="bold" color={primaryTextColor}
            borderBottom="2px solid" borderColor={borderColor} pb={3} textAlign="center">
            {paid ? 'Pembayaran Berhasil' : 'Ringkasan Pesanan'}
          </Heading>

          {/* ── Status sukses ── */}
          {paid && (
            <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" border="2px solid" borderColor="green.400" textAlign="center">
              <Icon as={CheckCircleIcon} boxSize={16} color="green.400" mb={4} />
              <Heading size="lg" color="green.500" mb={2}>Booking Terkonfirmasi!</Heading>
              {txCode && <Text color={secondaryText} mb={1}>Kode: <strong>{txCode}</strong></Text>}
              <Text color={secondaryText} mb={6}>Pembayaran kamu telah diterima. Selamat menikmati tour!</Text>
              <HStack justify="center" spacing={4} flexWrap="wrap">
                <Button colorScheme="blue" onClick={() => navigate('/bookings')}>Lihat Booking Saya</Button>
                <Button variant="outline" colorScheme="blue" onClick={() => navigate('/tours')}>Jelajahi Tour Lain</Button>
              </HStack>
            </Box>
          )}

          {/* ── Order Summary ── */}
          {!paid && (
            <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={borderColor}>
              <Heading as="h2" size={{ base: 'md', md: 'lg' }} fontWeight="bold" mb={6} color={primaryColor}
                display="flex" alignItems="center" gap={2}>
                <Icon as={FiFileText} boxSize={5} /> Ringkasan Pesanan
              </Heading>

              <Box bg={summaryBg} p={{ base: 4, md: 6 }} borderRadius="lg" border="1px solid" borderColor={borderColor} mb={6} boxShadow="sm">
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color={primaryTextColor} pb={3} mb={2} borderBottom="1px dashed" borderColor={borderColor}>
                    {details.tourName}
                  </Heading>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryText}>
                      <Icon as={FiMapPin} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Lokasi</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{details.tourLocation}</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryText}>
                      <Icon as={CalendarIcon} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Tanggal Tour</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{formatDate(details.tourDate)}</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryText}>
                      <Icon as={FiUsers} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Jumlah Peserta</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{details.participants} orang</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryText}>
                      <Icon as={InfoOutlineIcon} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Harga per orang</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{formatPrice(details.pricePerPerson)}</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryText}>
                      <Icon as={FiUserIcon} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Pemandu</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{details.guideName}</Text>
                  </HStack>
                </VStack>
              </Box>

              <Divider my={6} borderColor={borderColor} />

              {/* Total */}
              <Flex justifyContent="space-between" alignItems="center" fontWeight="bold" mb={8}
                p={{ base: 4, md: 5 }} bg={totalBg} borderRadius="lg" border="1px solid" borderColor={totalBorderColor}>
                <Text color={primaryTextColor} fontSize={{ base: 'md', md: 'lg' }}>Total Pembayaran</Text>
                <Text color={primaryColor} fontSize={{ base: 'xl', md: '2xl' }} fontWeight="extrabold">
                  {formatPrice(details.totalPrice)}
                </Text>
              </Flex>

              {txCode && (
                <Box mb={4} textAlign="center">
                  <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                    Kode: {txCode}
                  </Badge>
                </Box>
              )}

              {/* Tombol bayar */}
              <Button
                {...payBtn}
                w="100%"
                leftIcon={creatingBooking ? <Spinner size="sm" /> : <CheckCircleIcon boxSize={5} />}
                onClick={handlePay}
                isLoading={isPaying || creatingBooking}
                loadingText={creatingBooking ? 'Membuat pesanan...' : 'Memuat pembayaran...'}
                isDisabled={paid}
              >
                {bookingId ? 'Lanjutkan Pembayaran' : 'Bayar Sekarang via Midtrans'}
              </Button>

              <Text fontSize="xs" color={secondaryText} textAlign="center" mt={6}
                bg={useColorModeValue('gray.100','gray.750')} p={3} borderRadius="md">
                Dengan mengklik "Bayar Sekarang", kamu menyetujui Syarat & Ketentuan Travelink.
                Pembayaran diproses aman melalui Midtrans.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>

      <Box bg={cardBg} py={6} px={{ base: 4, md: 8 }} borderTop="1px solid" borderColor={borderColor} mt={10}>
        <Text textAlign="center" color={secondaryText} fontSize="sm">
          © {new Date().getFullYear()} Travelink. Semua hak dilindungi.
        </Text>
      </Box>
    </Box>
  );
};

export default Payment;
