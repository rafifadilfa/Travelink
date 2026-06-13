import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  Badge,
  Avatar,
  SimpleGrid,
  Divider,
  CircularProgress,
  CircularProgressLabel,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  useDisclosure,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, InfoIcon, StarIcon } from '@chakra-ui/icons';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';

// ─────────────────────────────────────────────────────────────
// Snap.js type augmentation
// ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface StatusResponse {
  participant_id: number;
  status: 'waiting' | 'matched' | 'cancelled_by_guide';
  group_id: number | null;
  matching_score: number | null;
  expires_at?: string;
  seconds_remaining?: number;
  message?: string;
}

interface CriteriaMatch {
  age: boolean;
  interest: boolean;
  preference: boolean;
  budget: boolean;
}

interface ScoreDetail {
  weights: { age: number; interest: number; preference: number; budget: number };
  ncf: number;
  nsf: number;
  score: number;
  criteria_match: CriteriaMatch;
  match_count: number;
}

interface Member {
  participant_id: number;
  user_id: number;
  name: string;
  profile_picture: string | null;
  age: number;
  budget_level: number;
  interests: string[];
  activities: string[];
  matching_score: number;
  score_detail: ScoreDetail;
  payment_status?: 'unpaid' | 'paid';
}

interface GroupDetail {
  id: number;
  tour_id: number;
  tour_name: string;
  tour_location: string | null;
  tour_price: number;
  trip_date: string;
  matched_at: string;
  expires_at: string;
  seconds_remaining: number;
  is_active: boolean;
  member_count: number;
}

interface GuideInfo {
  id: number;
  name: string;
  profile_picture: string | null;
  rating: number | null;
}

interface GroupResponse {
  group: GroupDetail;
  guide: GuideInfo | null;
  group_profile: {
    avg_age: number;
    avg_budget_level: number;
    interest_ids: number[];
    preference_ids: number[];
  };
  members: Member[];
}

interface PaymentStatusMember {
  participant_id: number;
  user_id: number;
  name: string;
  payment_status: 'unpaid' | 'paid';
  is_me: boolean;
}

interface PaymentStatusResponse {
  my_payment_status: 'unpaid' | 'paid';
  paid_count: number;
  total_count: number;
  all_paid: boolean;
  members: PaymentStatusMember[];
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const BUDGET_LABELS: Record<number, string> = {
  1: '< Rp 500rb',
  2: 'Rp 500rb – 1jt',
  3: 'Rp 1jt – 2jt',
  4: 'Rp 2jt – 5jt',
  5: '> Rp 5jt',
};

const CRITERIA_LABELS: Record<keyof CriteriaMatch, string> = {
  age:        'Umur',
  interest:   'Minat',
  preference: 'Aktivitas',
  budget:     'Budget',
};

const POLL_INTERVAL_MS = 4000;

// Interval polling status bayar setelah Snap ditutup (ms)
const PAYMENT_POLL_INTERVAL_MS = 3000;
const PAYMENT_POLL_MAX_TRIES   = 10;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatCountdown = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const scorePercent = (score: number) => Math.round((score / 5) * 100);

// Load Snap.js dari CDN Midtrans Sandbox (sekali saja)
const loadSnapScript = (): Promise<void> => {
  return new Promise((resolve) => {
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
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

const WaitingRoom: React.FC = () => {
  const { participantId } = useParams<{ participantId: string }>();
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const toast             = useToast();

  const tourId   = searchParams.get('tour_id') ?? '';
  const tripDate = searchParams.get('date') ?? '';

  const regCount              = parseInt(searchParams.get('reg_count') ?? '1', 10);
  const remainingAfterCancel  = Math.max(0, 3 - regCount);

  // ── State ──────────────────────────────────────────────────
  const [stage, setStage]         = useState<'loading' | 'stage1' | 'stage2' | 'cancelled_by_guide'>('loading');
  const [groupData, setGroupData] = useState<GroupResponse | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [myUserId, setMyUserId]   = useState<number | null>(null);

  // TC-055/056: Konfirmasi keikutsertaan
  const [myConfirmedAt, setMyConfirmedAt] = useState<string | null>(null);
  const [isConfirming,  setIsConfirming]  = useState(false);

  // Payment state
  const [paymentStatuses, setPaymentStatuses]   = useState<Record<number, 'unpaid' | 'paid'>>({});
  const [myPaymentStatus, setMyPaymentStatus]   = useState<'unpaid' | 'paid'>('unpaid');
  const [isPaying, setIsPaying]                 = useState(false);
  const [snapLoaded, setSnapLoaded]             = useState(false);
  const [amountPerPerson, setAmountPerPerson]   = useState<number | null>(null);

  const pollRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentPollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentPollTries    = useRef(0);
  const cancelRef           = useRef<HTMLButtonElement>(null);

  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [isCancelling, setIsCancelling] = useState(false);

  // ── Load Snap.js saat masuk Tahap 2 ───────────────────────
  useEffect(() => {
    if (stage !== 'stage2') return;
    loadSnapScript().then(() => setSnapLoaded(true));
  }, [stage]);

  // ── Ambil user saat ini ────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setMyUserId(JSON.parse(raw)?.id ?? null); } catch { /* ignore */ }
    }
  }, []);

  // ── Cancel pendaftaran (Tahap 1 saja) ─────────────────────
  const handleCancel = useCallback(async () => {
    if (!participantId) return;
    setIsCancelling(true);
    try {
      await apiClient.delete(`/open-trip/participants/${participantId}`);
      if (pollRef.current) clearInterval(pollRef.current);
      toast({
        title: 'Pendaftaran dibatalkan.',
        description: 'Kamu telah keluar dari waiting room.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        title: msg ?? 'Gagal membatalkan pendaftaran.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsCancelling(false);
      onCancelClose();
    }
  }, [participantId, navigate, toast, onCancelClose]);

  // ── TC-056: Konfirmasi keikutsertaan dalam window 6 jam ────
  const handleConfirm = useCallback(async () => {
    if (!participantId) return;
    setIsConfirming(true);
    try {
      await apiClient.post('/open-trip/confirm', {
        participant_id: parseInt(participantId, 10),
      });
      setMyConfirmedAt(new Date().toISOString());
      toast({
        title: 'Keikutsertaan dikonfirmasi!',
        description: 'Pesanan Anda akan dikirim ke pemandu setelah window 6 jam berakhir.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        title: msg ?? 'Gagal mengkonfirmasi keikutsertaan.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsConfirming(false);
    }
  }, [participantId, toast]);

  // ── Ambil status bayar semua anggota dari backend ─────────
  const fetchPaymentStatuses = useCallback(async (pId: number) => {
    try {
      const res = await apiClient.get<PaymentStatusResponse>(
        `/open-trip/payment/check/${pId}`
      );
      const map: Record<number, 'unpaid' | 'paid'> = {};
      res.data.members.forEach((m) => { map[m.participant_id] = m.payment_status; });
      setPaymentStatuses(map);
      setMyPaymentStatus(res.data.my_payment_status);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  // ── Polling status bayar setelah Snap ditutup ──────────────
  const startPaymentPolling = useCallback((pId: number) => {
    paymentPollTries.current = 0;
    if (paymentPollRef.current) clearInterval(paymentPollRef.current);

    paymentPollRef.current = setInterval(async () => {
      paymentPollTries.current += 1;
      const result = await fetchPaymentStatuses(pId);

      const isPaid = result?.my_payment_status === 'paid';
      const maxTried = paymentPollTries.current >= PAYMENT_POLL_MAX_TRIES;

      if (isPaid || maxTried) {
        clearInterval(paymentPollRef.current!);
        paymentPollRef.current = null;
        if (isPaid) {
          toast({
            title: 'Pembayaran berhasil!',
            description: 'Status kamu sudah "Lunas".',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }, PAYMENT_POLL_INTERVAL_MS);
  }, [fetchPaymentStatuses, toast]);

  // ── Bayar via Midtrans Snap ────────────────────────────────
  const handlePay = useCallback(async () => {
    if (!participantId || !snapLoaded) return;
    setIsPaying(true);

    try {
      const res = await apiClient.post<{
        snap_token: string;
        amount_per_person: number;
        member_count: number;
        tour_price: number;
      }>('/open-trip/payment/create', {
        participant_id: parseInt(participantId, 10),
      });

      setAmountPerPerson(res.data.amount_per_person);

      window.snap!.pay(res.data.snap_token, {
        onSuccess: () => {
          startPaymentPolling(parseInt(participantId, 10));
        },
        onPending: () => {
          toast({
            title: 'Pembayaran menunggu konfirmasi.',
            description: 'Kami akan memperbarui status secara otomatis.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
          startPaymentPolling(parseInt(participantId, 10));
        },
        onError: () => {
          toast({
            title: 'Pembayaran gagal.',
            description: 'Silakan coba lagi.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
        onClose: () => {
          // User tutup popup tanpa bayar — cek sekali saja kalau-kalau sempat bayar
          startPaymentPolling(parseInt(participantId, 10));
        },
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        title: msg ?? 'Gagal memulai pembayaran.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsPaying(false);
    }
  }, [participantId, snapLoaded, startPaymentPolling, toast]);

  // ── Muat detail grup (Tahap 2) ─────────────────────────────
  const loadGroupDetail = useCallback(async (gId: number) => {
    try {
      const res = await apiClient.get<GroupResponse>(`/open-trip/group/${gId}`);
      setGroupData(res.data);
      setCountdown(res.data.group.seconds_remaining);
      setStage('stage2');

      // Ambil status bayar awal
      if (participantId) {
        await fetchPaymentStatuses(parseInt(participantId, 10));
      }
    } catch {
      toast({ title: 'Gagal memuat detail grup.', status: 'error', duration: 4000, isClosable: true });
    }
  }, [toast, participantId, fetchPaymentStatuses]);

  // ── Cek status peserta (polling Tahap 1) ──────────────────
  const checkStatus = useCallback(async () => {
    if (!tourId || !tripDate) return;
    try {
      const res = await apiClient.get<StatusResponse>('/open-trip/status', {
        params: { tour_id: tourId, trip_date: tripDate },
      });

      if (res.data.status === 'cancelled_by_guide') {
        if (pollRef.current) clearInterval(pollRef.current);
        setStage('cancelled_by_guide');
      } else if (res.data.status === 'matched' && res.data.group_id) {
        if (pollRef.current) clearInterval(pollRef.current);
        await loadGroupDetail(res.data.group_id);
      } else {
        setStage('stage1');
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast({ title: 'Data peserta tidak ditemukan.', status: 'error', duration: 5000, isClosable: true });
        navigate('/dashboard');
      }
      setStage('stage1');
    }
  }, [tourId, tripDate, loadGroupDetail, navigate, toast]);

  // ── Bootstrap ─────────────────────────────────────────────
  useEffect(() => {
    checkStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Polling Tahap 1 ───────────────────────────────────────
  useEffect(() => {
    if (stage !== 'stage1') return;
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [stage, checkStatus]);

  // ── Countdown Tahap 2 ─────────────────────────────────────
  useEffect(() => {
    if (stage !== 'stage2') return;
    if (countdown <= 0) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup saat unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (paymentPollRef.current) clearInterval(paymentPollRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // Render: loading
  // ─────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Memeriksa status...</Text>
        </VStack>
      </Flex>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Render: Tahap 1 — menunggu dicocokkan
  // ─────────────────────────────────────────────────────────
  if (stage === 'stage1') {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="lg"
          p={10}
          maxW="520px"
          w="full"
          textAlign="center"
          animation={`${fadeIn} 0.4s ease`}
        >
          <Box
            w={20} h={20}
            borderRadius="full"
            bg="blue.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={6}
          >
            <Box animation={`${pulse} 2s ease-in-out infinite`}>
              <TimeIcon color="blue.400" boxSize={8} />
            </Box>
          </Box>

          <Badge colorScheme="blue" mb={3} px={3} py={1} borderRadius="full" fontSize="xs">
            Tahap 1 — Menunggu Dicocokkan
          </Badge>

          <Heading size="md" color="gray.800" mb={2}>
            Sistem sedang mencocokkan preferensimu
          </Heading>

          <Text color="gray.500" fontSize="sm" mb={6}>
            Saat ditemukan peserta lain dengan preferensi yang cocok,
            kamu akan otomatis masuk ke Waiting Room Tahap 2.
          </Text>

          {tripDate && (
            <Box bg="blue.50" borderRadius="xl" p={4} mb={6}>
              <Text color="blue.700" fontSize="sm" fontWeight="semibold">
                📅 {formatDate(tripDate)}
              </Text>
              <Text color="blue.500" fontSize="xs" mt={1}>
                Halaman ini otomatis diperbarui setiap {POLL_INTERVAL_MS / 1000} detik
              </Text>
            </Box>
          )}

          <Alert status="info" borderRadius="xl" mb={6} fontSize="sm" textAlign="left">
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold" mb={1}>Cara kerja matching:</Text>
              <Text>Sistem mencocokkan umur, minat, aktivitas, dan budget kamu dengan peserta lain di pool yang sama.</Text>
            </Box>
          </Alert>

          <VStack spacing={3}>
            <HStack spacing={2} justify="center">
              <Spinner size="xs" color="blue.400" />
              <Text color="gray.400" fontSize="xs">Mencari peserta yang cocok...</Text>
            </HStack>
            <Button variant="ghost" colorScheme="blue" size="sm" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>
            <Button variant="ghost" colorScheme="red" size="sm" onClick={onCancelOpen}>
              Batalkan Pendaftaran
            </Button>
          </VStack>
        </Box>

        {/* Dialog konfirmasi cancel */}
        <AlertDialog
          isOpen={isCancelOpen}
          leastDestructiveRef={cancelRef as React.RefObject<HTMLElement>}
          onClose={onCancelClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="xl" mx={4}>
              <AlertDialogHeader fontSize="lg" fontWeight="bold" color="gray.800">
                Batalkan Pendaftaran?
              </AlertDialogHeader>
              <AlertDialogBody color="gray.600" fontSize="sm">
                <Text mb={2}>Kamu akan keluar dari waiting room ini.</Text>
                {remainingAfterCancel === 0 ? (
                  <Text>
                    Ini adalah <strong>kesempatan terakhirmu</strong> — setelah dibatalkan,
                    kamu tidak bisa mendaftar lagi untuk trip ini.
                  </Text>
                ) : (
                  <Text>
                    Setelah dibatalkan, kamu masih bisa mendaftar{' '}
                    <strong>{remainingAfterCancel}x lagi</strong> untuk trip ini.
                  </Text>
                )}
              </AlertDialogBody>
              <AlertDialogFooter gap={3}>
                <Button ref={cancelRef} onClick={onCancelClose} size="sm" variant="ghost">
                  Tidak, tetap tunggu
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleCancel}
                  isLoading={isCancelling}
                  loadingText="Membatalkan..."
                >
                  Ya, batalkan
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Render: Grup dibatalkan oleh pemandu
  // ─────────────────────────────────────────────────────────
  if (stage === 'cancelled_by_guide') {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="lg"
          p={10}
          maxW="520px"
          w="full"
          textAlign="center"
          animation={`${fadeIn} 0.4s ease`}
        >
          <Box
            w={20} h={20}
            borderRadius="full"
            bg="red.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={6}
          >
            <Text fontSize="3xl">🚫</Text>
          </Box>

          <Badge colorScheme="red" mb={3} px={3} py={1} borderRadius="full" fontSize="xs">
            Grup Dibatalkan
          </Badge>

          <Heading size="md" color="gray.800" mb={3}>
            Grup Anda dibatalkan oleh pemandu wisata
          </Heading>

          <Text color="gray.500" fontSize="sm" mb={6}>
            Pemandu wisata telah membatalkan grup Smart Open Trip ini sebelum ada pembayaran.
            Anda dapat mendaftar ulang dengan memilih tour atau tanggal yang berbeda.
          </Text>

          <Alert status="info" borderRadius="xl" mb={6} fontSize="sm" textAlign="left">
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold" mb={1}>Langkah selanjutnya:</Text>
              <Text>Kembali ke halaman tour dan pilih jadwal atau pemandu yang berbeda untuk bergabung ke Smart Open Trip baru.</Text>
            </Box>
          </Alert>

          <Button colorScheme="blue" onClick={() => navigate('/dashboard')} w="full">
            Kembali ke Dashboard
          </Button>
        </Box>
      </Flex>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Render: Tahap 2 — grup terbentuk
  // ─────────────────────────────────────────────────────────
  if (stage === 'stage2' && groupData) {
    const { group, guide, members } = groupData;
    const myMember = members.find((m) => m.user_id === myUserId);

    const totalSeconds = Math.max(
      countdown,
      Math.round(
        (new Date(group.expires_at).getTime() - new Date(group.matched_at).getTime()) / 1000
      )
    );
    const countdownPct = totalSeconds > 0 ? Math.round((countdown / totalSeconds) * 100) : 0;

    const paidCount  = Object.values(paymentStatuses).filter((s) => s === 'paid').length;
    const totalCount = members.length;

    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="3xl">

          {/* ── Header countdown ── */}
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            overflow="hidden"
            mb={6}
            animation={`${fadeIn} 0.4s ease`}
          >
            <Box bg="green.500" px={8} py={5}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                <VStack align="flex-start" spacing={1}>
                  <HStack>
                    <CheckCircleIcon color="white" />
                    <Badge colorScheme="green" variant="solid" bg="green.300" color="green.900" fontSize="xs">
                      Tahap 2 — Grup Terbentuk!
                    </Badge>
                  </HStack>
                  <Heading size="md" color="white">{group.tour_name}</Heading>
                  <HStack spacing={4}>
                    {group.tour_location && (
                      <Text color="green.100" fontSize="sm">📍 {group.tour_location}</Text>
                    )}
                    <Text color="green.100" fontSize="sm">📅 {formatDate(group.trip_date)}</Text>
                    <Text color="green.100" fontSize="sm">👥 {group.member_count} anggota</Text>
                  </HStack>
                </VStack>

                <VStack spacing={1} align="center">
                  <CircularProgress
                    value={countdownPct}
                    size="80px"
                    color={countdown > 30 ? 'green.300' : 'orange.300'}
                    trackColor="green.700"
                    thickness="8px"
                  >
                    <CircularProgressLabel color="white" fontSize="sm" fontWeight="bold">
                      {formatCountdown(countdown)}
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text color="green.100" fontSize="xs">
                    {countdown > 0 ? 'Waktu konfirmasi' : 'Waktu habis'}
                  </Text>
                </VStack>
              </Flex>
            </Box>

            {/* Split bill info */}
            <Box px={8} py={4} bg="green.50">
              <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                <Box>
                  <Text color="green.700" fontSize="sm">
                    💰 Tagihan kamu (split bill):
                  </Text>
                  <Text color="green.500" fontSize="xs" mt={0.5}>
                    Harga paket {formatRupiah(group.tour_price)} ÷ {group.member_count} orang
                  </Text>
                </Box>
                <Heading size="md" color="green.700">
                  {formatRupiah(amountPerPerson ?? Math.round(group.tour_price / group.member_count))}
                </Heading>
              </Flex>
            </Box>
          </Box>

          {/* ── Pemandu Wisata ── */}
          {guide && (
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              p={6}
              mb={6}
              animation={`${fadeIn} 0.43s ease`}
            >
              <Text fontWeight="semibold" color="gray.700" fontSize="sm" mb={4}>
                🧭 Pemandu Wisata
              </Text>
              <Flex align="center" gap={4}>
                <Avatar
                  size="lg"
                  name={guide.name}
                  src={guide.profile_picture ?? undefined}
                  bg="teal.400"
                  color="white"
                />
                <VStack align="flex-start" spacing={1}>
                  <Text fontWeight="semibold" color="gray.800" fontSize="md">
                    {guide.name}
                  </Text>
                  {guide.rating !== null ? (
                    <HStack spacing={1}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          boxSize={3}
                          color={star <= Math.round(guide.rating!) ? 'yellow.400' : 'gray.200'}
                        />
                      ))}
                      <Text fontSize="xs" color="gray.500" ml={1}>
                        {guide.rating.toFixed(1)}
                      </Text>
                    </HStack>
                  ) : (
                    <Text fontSize="xs" color="gray.400">Belum ada rating</Text>
                  )}
                  <Text fontSize="xs" color="teal.600" fontWeight="medium">
                    Dana tour dikirim ke pemandu ini
                  </Text>
                </VStack>
              </Flex>
            </Box>
          )}

          {/* ── Ringkasan pembayaran grup ── */}
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            p={6}
            mb={6}
            animation={`${fadeIn} 0.45s ease`}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="semibold" color="gray.700" fontSize="sm">
                💳 Status Pembayaran Grup
              </Text>
              <Badge
                colorScheme={paidCount === totalCount ? 'green' : 'orange'}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
              >
                {paidCount}/{totalCount} Lunas
              </Badge>
            </Flex>

            <VStack spacing={3} align="stretch">
              {members.map((m) => {
                const pStatus = paymentStatuses[m.participant_id] ?? 'unpaid';
                const isPaid  = pStatus === 'paid';
                const isMe    = m.user_id === myUserId;

                return (
                  <Flex
                    key={m.participant_id}
                    align="center"
                    justify="space-between"
                    borderWidth={isMe ? 2 : 1}
                    borderColor={isMe ? 'blue.200' : 'gray.100'}
                    borderRadius="xl"
                    px={4}
                    py={3}
                    bg={isMe ? 'blue.50' : 'white'}
                    wrap="wrap"
                    gap={3}
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={m.name} src={m.profile_picture ?? undefined} bg="blue.400" />
                      <VStack spacing={0} align="flex-start">
                        <HStack>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{m.name}</Text>
                          {isMe && <Badge colorScheme="blue" fontSize="xs">Kamu</Badge>}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {formatRupiah(amountPerPerson ?? Math.round(group.tour_price / group.member_count))}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Status bayar + tombol */}
                    {isPaid ? (
                      <HStack
                        bg="green.50"
                        borderRadius="lg"
                        px={3}
                        py={1.5}
                        spacing={1}
                      >
                        <Icon as={FiCheckCircle} color="green.500" />
                        <Text fontSize="sm" fontWeight="semibold" color="green.600">Lunas</Text>
                      </HStack>
                    ) : isMe ? (
                      <Button
                        colorScheme="blue"
                        size="sm"
                        borderRadius="lg"
                        isLoading={isPaying}
                        loadingText="Memproses..."
                        isDisabled={!snapLoaded || myPaymentStatus === 'paid'}
                        onClick={handlePay}
                      >
                        Bayar Sekarang
                      </Button>
                    ) : (
                      <HStack
                        bg="orange.50"
                        borderRadius="lg"
                        px={3}
                        py={1.5}
                        spacing={1}
                      >
                        <Icon as={FiClock} color="orange.400" />
                        <Text fontSize="sm" color="orange.500">Belum Bayar</Text>
                      </HStack>
                    )}
                  </Flex>
                );
              })}
            </VStack>

            {paidCount === totalCount && (
              <Alert status="success" borderRadius="xl" mt={4} fontSize="sm">
                <AlertIcon />
                Semua anggota sudah membayar! Trip ini siap berjalan.
              </Alert>
            )}
          </Box>

          {/* ── Skor kecocokan saya ── */}
          {myMember && (
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              p={6}
              mb={6}
              animation={`${fadeIn} 0.5s ease`}
            >
              <Text fontWeight="semibold" color="gray.700" mb={4} fontSize="sm">
                <InfoIcon mr={2} color="blue.400" />
                Skor Kecocokanmu dengan Grup
              </Text>

              <Flex align="center" gap={6} wrap="wrap">
                <VStack spacing={1} minW="100px" align="center">
                  <Heading size="2xl" color="blue.600">
                    {scorePercent(myMember.matching_score)}%
                  </Heading>
                  <Text fontSize="xs" color="gray.500">({myMember.matching_score.toFixed(2)} / 5.0)</Text>
                </VStack>

                <SimpleGrid columns={2} spacing={2} flex={1}>
                  {(Object.keys(CRITERIA_LABELS) as Array<keyof CriteriaMatch>).map((key) => {
                    const isMatch = myMember.score_detail.criteria_match[key];
                    const weight  = myMember.score_detail.weights[key];
                    return (
                      <HStack
                        key={key}
                        bg={isMatch ? 'green.50' : 'red.50'}
                        borderRadius="lg"
                        px={3}
                        py={2}
                        spacing={2}
                      >
                        <Text fontSize="lg">{isMatch ? '✅' : '❌'}</Text>
                        <VStack spacing={0} align="flex-start">
                          <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                            {CRITERIA_LABELS[key]}
                          </Text>
                          <Text fontSize="xs" color="gray.500">bobot: {weight}</Text>
                        </VStack>
                      </HStack>
                    );
                  })}
                </SimpleGrid>
              </Flex>

              <Flex mt={4} gap={4} wrap="wrap">
                <Stat flex={1} bg="blue.50" borderRadius="xl" p={3}>
                  <StatLabel fontSize="xs" color="blue.600">Core Factor (60%)</StatLabel>
                  <StatNumber fontSize="lg" color="blue.700">{myMember.score_detail.ncf}</StatNumber>
                  <StatHelpText fontSize="xs" color="blue.500">Minat + Aktivitas</StatHelpText>
                </Stat>
                <Stat flex={1} bg="purple.50" borderRadius="xl" p={3}>
                  <StatLabel fontSize="xs" color="purple.600">Secondary Factor (40%)</StatLabel>
                  <StatNumber fontSize="lg" color="purple.700">{myMember.score_detail.nsf}</StatNumber>
                  <StatHelpText fontSize="xs" color="purple.500">Umur + Budget</StatHelpText>
                </Stat>
                <Stat flex={1} bg="gray.50" borderRadius="xl" p={3}>
                  <StatLabel fontSize="xs" color="gray.600">Kriteria Cocok</StatLabel>
                  <StatNumber fontSize="lg" color="gray.700">
                    {myMember.score_detail.match_count}/4
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">min. 2 untuk bergabung</StatHelpText>
                </Stat>
              </Flex>
            </Box>
          )}

          {/* ── Daftar anggota lengkap ── */}
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="sm"
            p={6}
            animation={`${fadeIn} 0.6s ease`}
          >
            <Text fontWeight="semibold" color="gray.700" mb={5}>
              👥 Anggota Grup ({members.length} orang)
            </Text>

            <VStack spacing={4} align="stretch">
              {members.map((m, idx) => {
                const isMe  = m.user_id === myUserId;
                const pct   = scorePercent(m.matching_score);
                const color = pct >= 80 ? 'green' : pct >= 60 ? 'blue' : 'orange';

                return (
                  <Box
                    key={m.participant_id}
                    borderWidth={isMe ? 2 : 1}
                    borderColor={isMe ? 'blue.300' : 'gray.100'}
                    borderRadius="xl"
                    p={4}
                    bg={isMe ? 'blue.50' : 'white'}
                    animation={`${fadeIn} ${0.4 + idx * 0.1}s ease`}
                  >
                    <Flex align="flex-start" gap={4} wrap="wrap">
                      <HStack spacing={3} minW="160px">
                        <Avatar
                          size="md"
                          name={m.name}
                          src={m.profile_picture ?? undefined}
                          bg="blue.400"
                        />
                        <VStack spacing={0} align="flex-start">
                          <HStack>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                              {m.name}
                            </Text>
                            {isMe && <Badge colorScheme="blue" fontSize="xs">Kamu</Badge>}
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            Umur {m.age} • {BUDGET_LABELS[m.budget_level] ?? `Level ${m.budget_level}`}
                          </Text>
                        </VStack>
                      </HStack>

                      <VStack spacing={1} align="center" minW="70px">
                        <Heading size="md" color={`${color}.500`}>{pct}%</Heading>
                        <Text fontSize="xs" color="gray.400">cocok</Text>
                      </VStack>

                      <VStack spacing={2} align="flex-start" flex={1}>
                        {m.interests.length > 0 && (
                          <Wrap>
                            {m.interests.map((interest) => (
                              <WrapItem key={interest}>
                                <Tag size="sm" colorScheme="teal" borderRadius="full">
                                  <TagLabel>{interest}</TagLabel>
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                        {m.activities.length > 0 && (
                          <Wrap>
                            {m.activities.map((act) => (
                              <WrapItem key={act}>
                                <Tag size="sm" colorScheme="gray" borderRadius="full" variant="outline">
                                  <TagLabel fontSize="xs">{act}</TagLabel>
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </VStack>

                      <VStack spacing={1} align="flex-end" minW="80px">
                        {(Object.keys(m.score_detail.criteria_match) as Array<keyof CriteriaMatch>).map((key) => (
                          <HStack key={key} spacing={1}>
                            <Text fontSize="xs" color="gray.400">{CRITERIA_LABELS[key]}</Text>
                            <Text fontSize="xs">{m.score_detail.criteria_match[key] ? '✅' : '❌'}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>

            <Divider my={5} />

            <VStack spacing={3}>
              {(() => {
                // Hitung deadline konfirmasi: expires_at + 6 jam
                const confirmDeadline = groupData?.group?.expires_at
                  ? new Date(groupData.group.expires_at).getTime() + 6 * 3600 * 1000
                  : null;
                const withinWindow = confirmDeadline && Date.now() < confirmDeadline;

                if (countdown > 0) {
                  // Matching countdown masih berjalan
                  return (
                    <Text color="gray.500" fontSize="sm" textAlign="center">
                      Countdown berakhir dalam <strong>{formatCountdown(countdown)}</strong>.
                    </Text>
                  );
                }

                if (myConfirmedAt) {
                  // Sudah konfirmasi
                  return (
                    <Alert status="success" borderRadius="xl" fontSize="sm">
                      <AlertIcon />
                      Keikutsertaan Anda sudah dikonfirmasi! Menunggu pemandu memproses.
                    </Alert>
                  );
                }

                if (withinWindow) {
                  // Window 6 jam aktif, belum konfirmasi
                  return (
                    <>
                      <Alert status="info" borderRadius="xl" fontSize="sm">
                        <AlertIcon />
                        Konfirmasi keikutsertaan Anda sebelum window 6 jam berakhir.
                      </Alert>
                      <Button
                        colorScheme="green"
                        size="lg"
                        w="full"
                        isLoading={isConfirming}
                        loadingText="Mengkonfirmasi..."
                        onClick={handleConfirm}
                      >
                        Konfirmasi Keikutsertaan
                      </Button>
                    </>
                  );
                }

                // Window sudah berakhir
                return (
                  <Alert status="warning" borderRadius="xl" fontSize="sm">
                    <AlertIcon />
                    Waktu konfirmasi telah berakhir.
                  </Alert>
                );
              })()}
              <Button variant="ghost" colorScheme="blue" size="sm" onClick={() => navigate('/dashboard')}>
                Kembali ke Dashboard
              </Button>
            </VStack>
          </Box>

        </Container>
      </Box>
    );
  }

  return null;
};

export default WaitingRoom;
