import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  SkeletonText,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  CheckCircleIcon,
  InfoOutlineIcon,
  StarIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// ─── Animasi ────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface GroupInfo {
  id: number;
  member_count: number;
  expires_at: string | null;
  seconds_remaining: number;
  is_active: boolean;
}

interface OpenTripBooking {
  participant_id: number;
  tour_id: number;
  tour_name: string;
  tour_location: string | null;
  tour_price: number;
  trip_date: string;
  status: 'waiting' | 'matched' | 'cancelled';
  matching_score: number | null;
  group_id: number | null;
  group: GroupInfo | null;
}

// Tipe minimal untuk modal detail grup (reuse dari groupDetail endpoint)
interface CriteriaMatch { age: boolean; interest: boolean; preference: boolean; budget: boolean }
interface ScoreDetail {
  weights: { age: number; interest: number; preference: number; budget: number };
  ncf: number; nsf: number; score: number;
  criteria_match: CriteriaMatch; match_count: number;
}
interface Member {
  participant_id: number; user_id: number; name: string;
  profile_picture: string | null; age: number; budget_level: number;
  interests: string[]; activities: string[];
  matching_score: number; score_detail: ScoreDetail;
}
interface GroupDetail {
  id: number; tour_id: number; tour_name: string;
  tour_location: string | null; tour_price: number;
  trip_date: string; member_count: number;
}
interface GroupDetailResponse {
  group: GroupDetail;
  members: Member[];
}

// ─── Types (Private Booking) ────────────────────────────────────────────────

interface PrivateBookingTour {
  id: number;
  name: string;
  location: string;
  image_url: string | null;
  guide: { id: number; name: string } | null;
}

interface PrivateBookingTransaction {
  id: number;
  transaction_code: string;
  tour_date: string;
  participant_count: number;
  price_per_participant: number;
  total_amount: number;
  payment_status: string;
  tour: PrivateBookingTour | null;
}

interface PrivateBooking {
  id: number;
  booking_status: string;
  paid_at: string | null;
  created_at: string;
  transaction: PrivateBookingTransaction | null;
}

const PRIVATE_STATUS_CONFIG: Record<string, { label: string; colorScheme: string }> = {
  menunggu_pembayaran:            { label: 'Menunggu Pembayaran',  colorScheme: 'orange' },
  menunggu_konfirmasi_pemandu:    { label: 'Menunggu Konfirmasi',  colorScheme: 'blue'   },
  menunggu_verifikasi_pembayaran: { label: 'Dalam Verifikasi',     colorScheme: 'purple' },
  terkonfirmasi:                  { label: 'Terkonfirmasi',        colorScheme: 'green'  },
  selesai:                        { label: 'Selesai',              colorScheme: 'gray'   },
  ditolak:                        { label: 'Ditolak',              colorScheme: 'red'    },
  dibatalkan:                     { label: 'Dibatalkan',           colorScheme: 'red'    },
};

const PRIVATE_TERMINAL = ['selesai', 'ditolak', 'dibatalkan'];

// ─── Konstanta ──────────────────────────────────────────────────────────────

const BUDGET_LABELS: Record<number, string> = {
  1: '< Rp 500rb', 2: 'Rp 500rb–1jt', 3: 'Rp 1jt–2jt', 4: 'Rp 2jt–5jt', 5: '> Rp 5jt',
};

const CRITERIA_LABELS: Record<keyof CriteriaMatch, string> = {
  age: 'Umur', interest: 'Minat', preference: 'Aktivitas', budget: 'Budget',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const formatDate = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

const isPast = (dateStr: string) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00') < today;
};

const scorePercent = (score: number) => Math.round((score / 5) * 100);

// ─── Config badge status ─────────────────────────────────────────────────────

const STATUS_CONFIG = {
  waiting: {
    label: 'Menunggu Dicocokkan',
    colorScheme: 'orange',
    icon: TimeIcon,
  },
  matched: {
    label: 'Grup Terbentuk',
    colorScheme: 'green',
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: 'Dibatalkan',
    colorScheme: 'red',
    icon: InfoOutlineIcon,
  },
} as const;

// ─── Sub-komponen: Skeleton card ─────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" p={5} boxShadow="sm">
    <Flex justify="space-between" align="flex-start" mb={4}>
      <Skeleton height="22px" width="130px" borderRadius="full" />
      <Skeleton height="18px" width="100px" borderRadius="md" />
    </Flex>
    <SkeletonText mt={2} noOfLines={1} skeletonHeight="20px" width="70%" />
    <SkeletonText mt={3} noOfLines={1} skeletonHeight="14px" width="40%" />
    <Skeleton mt={4} height="58px" borderRadius="lg" />
    <Flex mt={4} gap={3}>
      <Skeleton flex={1} height="38px" borderRadius="lg" />
      <Skeleton flex={1} height="38px" borderRadius="lg" />
    </Flex>
  </Box>
);

// ─── Sub-komponen: Empty state ────────────────────────────────────────────────

interface EmptyStateProps {
  tab: 'upcoming' | 'past';
  onExplore: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab, onExplore }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const subtleColor = useColorModeValue('gray.400', 'gray.500');

  if (tab === 'upcoming') {
    return (
      <Box
        textAlign="center" py={16} px={6}
        bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
        boxShadow="sm" animation={`${fadeIn} 0.3s ease`}
      >
        <Text fontSize="3xl" mb={4}>🧭</Text>
        <Heading size="md" color={textColor} mb={2}>Belum ada perjalanan mendatang</Heading>
        <Text color={subtleColor} fontSize="sm" mb={6} maxW="320px" mx="auto">
          Ikut Smart Open Trip untuk otomatis dicocokkan dengan peserta lain yang punya minat serupa.
        </Text>
        <Button
          colorScheme="blue" size="md" onClick={onExplore}
          rightIcon={<Icon as={CalendarIcon} />}
        >
          Jelajahi Tour
        </Button>
      </Box>
    );
  }

  return (
    <Box
      textAlign="center" py={16} px={6}
      bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100"
      boxShadow="sm" animation={`${fadeIn} 0.3s ease`}
    >
      <Text fontSize="3xl" mb={4}>🗺️</Text>
      <Heading size="md" color={textColor} mb={2}>Riwayat perjalanan masih kosong</Heading>
      <Text color={subtleColor} fontSize="sm" maxW="300px" mx="auto">
        Trip yang sudah selesai atau dibatalkan akan tercatat di sini.
      </Text>
    </Box>
  );
};

// ─── Sub-komponen: Stat row (info grup) ──────────────────────────────────────

interface StatRowProps {
  memberCount: number;
  matchingScore: number | null;
  tourPrice: number;
  memberCountForSplit: number;
}

const StatRow: React.FC<StatRowProps> = ({ memberCount, matchingScore, tourPrice, memberCountForSplit }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.800', 'white');

  const items = [
    {
      icon: '👥',
      label: 'Anggota',
      value: `${memberCount} orang`,
    },
    ...(matchingScore !== null ? [{
      icon: '🎯',
      label: 'Kecocokan',
      value: `${scorePercent(matchingScore)}%`,
    }] : []),
    {
      icon: '💰',
      label: 'Est. per orang',
      value: formatRupiah(Math.round(tourPrice / memberCountForSplit)),
    },
  ];

  return (
    <Flex
      bg={bgColor} border="1px solid" borderColor={borderColor}
      borderRadius="lg" overflow="hidden"
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && <Divider orientation="vertical" h="auto" />}
          <Box flex={1} px={3} py={2.5} textAlign="center">
            <Text fontSize="xs" color={labelColor} mb={0.5}>{item.icon} {item.label}</Text>
            <Text fontSize="sm" fontWeight="semibold" color={valueColor}>{item.value}</Text>
          </Box>
        </React.Fragment>
      ))}
    </Flex>
  );
};

// ─── Sub-komponen: Trip card ──────────────────────────────────────────────────

interface TripCardProps {
  item: OpenTripBooking;
  isUpcoming: boolean;
  index: number;
  onViewDetail: (item: OpenTripBooking) => void;
  myUserId: number | null;
}

const TripCard: React.FC<TripCardProps> = ({ item, isUpcoming, index, onViewDetail }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtleColor = useColorModeValue('gray.500', 'gray.400');
  const hoverBorderColor = useColorModeValue('blue.200', 'blue.600');
  const waitingBoxBg = useColorModeValue('orange.50', 'orange.900');
  const waitingTextColor = useColorModeValue('orange.700', 'orange.200');
  const dividerColor = useColorModeValue('gray.100', 'gray.700');

  const cfg = STATUS_CONFIG[item.status];
  const tripIsPast = isPast(item.trip_date);

  // Tentukan status label yang lebih kontekstual
  const statusLabel =
    item.status === 'matched' && tripIsPast ? 'Selesai' : cfg.label;
  const statusColorScheme =
    item.status === 'matched' && tripIsPast ? 'blue' : cfg.colorScheme;

  const handlePrimaryAction = () => {
    if (isUpcoming) {
      navigate(
        `/open-trip/waiting/${item.participant_id}?tour_id=${item.tour_id}&date=${item.trip_date}`
      );
    } else {
      onViewDetail(item);
    }
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      transition="border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease"
      _hover={{ borderColor: hoverBorderColor, boxShadow: 'md', transform: 'translateY(-1px)' }}
      animation={`${fadeUp} 0.2s ease ${index * 0.05}s both`}
      overflow="hidden"
    >
      {/* Status strip — bukan side-stripe, melainkan top bar tipis berwarna */}
      <Box
        h="3px"
        bgGradient={
          statusColorScheme === 'green' ? 'linear(to-r, green.300, teal.300)' :
          statusColorScheme === 'orange' ? 'linear(to-r, orange.300, yellow.300)' :
          statusColorScheme === 'blue' ? 'linear(to-r, blue.300, cyan.300)' :
          'linear(to-r, gray.300, gray.200)'
        }
      />

      <Box p={5}>
        {/* Baris atas: badge + tanggal */}
        <Flex justify="space-between" align="center" mb={3}>
          <Badge
            colorScheme={statusColorScheme}
            variant="subtle"
            px={2.5} py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            display="flex" alignItems="center" gap={1.5}
          >
            <Icon as={cfg.icon} boxSize={3} />
            {statusLabel}
          </Badge>
          <HStack spacing={1} color={subtleColor}>
            <Icon as={CalendarIcon} boxSize={3} />
            <Text fontSize="xs">{formatDate(item.trip_date)}</Text>
          </HStack>
        </Flex>

        {/* Nama tour */}
        <Heading as="h3" size="sm" color={titleColor} mb={1.5} noOfLines={2} lineHeight="1.4">
          {item.tour_name}
        </Heading>

        {/* Lokasi */}
        {item.tour_location && (
          <HStack spacing={1} color={subtleColor} mb={4}>
            <Text fontSize="xs">📍</Text>
            <Text fontSize="sm">{item.tour_location}</Text>
          </HStack>
        )}

        {/* Stat row — hanya tampil jika sudah ada grup */}
        {item.group && item.status !== 'cancelled' && (
          <Box mb={4}>
            <StatRow
              memberCount={item.group.member_count}
              matchingScore={item.matching_score}
              tourPrice={item.tour_price}
              memberCountForSplit={item.group.member_count}
            />
          </Box>
        )}

        {/* Jika masih waiting, tampilkan info status */}
        {item.status === 'waiting' && (
          <Box
            bg={waitingBoxBg}
            borderRadius="lg"
            px={3} py={2.5}
            mb={4}
          >
            <Text fontSize="xs" color={waitingTextColor}>
              Sistem sedang mencocokkan preferensimu dengan peserta lain di pool yang sama.
              Halaman ini diperbarui otomatis.
            </Text>
          </Box>
        )}

        <Divider mb={4} borderColor={dividerColor} />

        {/* Tombol aksi */}
        <Flex gap={2.5} wrap="wrap">
          {/* Tombol utama */}
          {item.status !== 'cancelled' && (
            <Button
              size="sm"
              colorScheme="blue"
              variant={isUpcoming ? 'solid' : 'outline'}
              onClick={handlePrimaryAction}
              flex={1}
              minW="100px"
            >
              {isUpcoming ? 'Lihat Status' : 'Lihat Detail Grup'}
            </Button>
          )}

          {/* Placeholder: Bayar Sekarang (Upcoming) */}
          {isUpcoming && item.status === 'matched' && (
            <Tooltip
              label="Fitur pembayaran akan segera hadir"
              hasArrow
              placement="top"
            >
              {/* wrapper span needed for disabled button tooltip */}
              <Box flex={1} minW="100px">
                <Button
                  size="sm"
                  colorScheme="green"
                  isDisabled
                  width="100%"
                  cursor="not-allowed"
                  opacity={0.5}
                >
                  Bayar Sekarang
                </Button>
              </Box>
            </Tooltip>
          )}

          {/* Placeholder: Tulis Ulasan (Past, completed) */}
          {!isUpcoming && item.status === 'matched' && (
            <Tooltip
              label="Fitur ulasan akan segera hadir"
              hasArrow
              placement="top"
            >
              <Box flex={1} minW="100px">
                <Button
                  size="sm"
                  colorScheme="yellow"
                  variant="outline"
                  isDisabled
                  width="100%"
                  cursor="not-allowed"
                  opacity={0.5}
                  leftIcon={<Icon as={StarIcon} boxSize={3} />}
                >
                  Tulis Ulasan
                </Button>
              </Box>
            </Tooltip>
          )}

          {/* Dibatalkan — tidak ada aksi */}
          {item.status === 'cancelled' && (
            <Text fontSize="xs" color={subtleColor} alignSelf="center">
              Pendaftaran ini dibatalkan.
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

// ─── Midtrans Snap loader (sama persis pola WaitingRoom) ────────────────────

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess: (r: unknown) => void;
        onPending: (r: unknown) => void;
        onError:   (r: unknown) => void;
        onClose:   () => void;
      }) => void;
    };
  }
}

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

// ─── Sub-komponen: Private Booking Card ──────────────────────────────────────

interface PrivateBookingCardProps {
  booking: PrivateBooking;
  onPaymentComplete: () => void;
}

const PrivateBookingCard: React.FC<PrivateBookingCardProps> = ({ booking, onPaymentComplete }) => {
  const toast                       = useToast();
  const [isPaying, setIsPaying]     = useState(false);
  const [localStatus, setLocalStatus] = useState(booking.booking_status);
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardBg      = useColorModeValue('white',    'gray.800');
  const borderCol   = useColorModeValue('gray.100', 'gray.700');
  const hoverBorder = useColorModeValue('blue.200', 'blue.600');
  const titleColor  = useColorModeValue('gray.800', 'white');
  const subtleColor = useColorModeValue('gray.500', 'gray.400');

  const tx      = booking.transaction;
  const tour    = tx?.tour;
  const cfg     = PRIVATE_STATUS_CONFIG[localStatus] ?? { label: localStatus, colorScheme: 'gray' };
  const isPaid  = localStatus === 'terkonfirmasi' || localStatus === 'selesai';

  const stripGradient =
    cfg.colorScheme === 'green'  ? 'linear(to-r, green.300, teal.300)'    :
    cfg.colorScheme === 'orange' ? 'linear(to-r, orange.300, yellow.300)' :
    cfg.colorScheme === 'blue'   ? 'linear(to-r, blue.300, cyan.300)'     :
    cfg.colorScheme === 'purple' ? 'linear(to-r, purple.300, pink.300)'   :
    'linear(to-r, gray.300, gray.200)';

  const pollPayment = useCallback((bId: number) => {
    let tries = 0;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      tries++;
      try {
        const res = await apiClient.get<{ payment_status: string; booking_status: string }>(
          `/bookings/${bId}/payment`
        );
        if (res.data.payment_status === 'paid') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setLocalStatus(res.data.booking_status);
          toast({ title: 'Pembayaran berhasil!', description: 'Booking terkonfirmasi.', status: 'success', duration: 5000, isClosable: true });
          onPaymentComplete();
        }
      } catch { /* abaikan error polling sementara */ }
      if (tries >= 20) { clearInterval(pollRef.current!); pollRef.current = null; }
    }, 3000);
  }, [toast, onPaymentComplete]);

  const handlePay = useCallback(async () => {
    setIsPaying(true);
    try {
      await loadSnapScript();
      const res = await apiClient.post<{ snap_token: string }>(`/bookings/${booking.id}/payment`);
      window.snap!.pay(res.data.snap_token, {
        onSuccess: () => pollPayment(booking.id),
        onPending: () => {
          toast({ title: 'Pembayaran pending.', description: 'Status akan diperbarui otomatis.', status: 'info', duration: 5000, isClosable: true });
          pollPayment(booking.id);
        },
        onError:  () => toast({ title: 'Pembayaran gagal.', description: 'Silakan coba lagi.', status: 'error', duration: 5000, isClosable: true }),
        onClose:  () => pollPayment(booking.id),
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: msg ?? 'Gagal memulai pembayaran.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsPaying(false);
    }
  }, [booking.id, pollPayment, toast]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  return (
    <Box
      bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderCol} boxShadow="sm"
      transition="border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease"
      _hover={{ borderColor: hoverBorder, boxShadow: 'md', transform: 'translateY(-1px)' }}
      animation={`${fadeUp} 0.25s ease`} overflow="hidden"
    >
      {/* strip warna status */}
      <Box h="3px" bgGradient={stripGradient} />

      <Box p={5}>
        {/* Baris atas: badge + kode transaksi */}
        <Flex justify="space-between" align="center" mb={3} gap={2}>
          <Badge colorScheme={cfg.colorScheme} variant="subtle" px={2.5} py={1} borderRadius="full" fontSize="xs" fontWeight="semibold">
            {cfg.label}
          </Badge>
          <Text fontSize="xs" color={subtleColor} noOfLines={1}>{tx?.transaction_code ?? '-'}</Text>
        </Flex>

        {/* Nama tour */}
        <Heading as="h3" size="sm" color={titleColor} mb={1} noOfLines={2} lineHeight="1.4">
          {tour?.name ?? 'Tour'}
        </Heading>

        {/* Lokasi */}
        {tour?.location && (
          <HStack spacing={1} color={subtleColor} mb={3}>
            <Text fontSize="xs">📍</Text>
            <Text fontSize="sm">{tour.location}</Text>
          </HStack>
        )}

        {/* Info: tanggal + peserta */}
        <HStack spacing={4} mb={3} flexWrap="wrap">
          <HStack spacing={1.5} fontSize="xs" color={subtleColor}>
            <Icon as={CalendarIcon} boxSize={3} />
            <Text>{tx?.tour_date ? formatDate(tx.tour_date) : '-'}</Text>
          </HStack>
          <HStack spacing={1.5} fontSize="xs" color={subtleColor}>
            <Text>👥</Text>
            <Text>{tx?.participant_count ?? 1} orang</Text>
          </HStack>
        </HStack>

        {/* Pemandu */}
        {tour?.guide && (
          <HStack spacing={1.5} fontSize="xs" color={subtleColor} mb={3}>
            <Text>🧭</Text>
            <Text>{tour.guide.name}</Text>
          </HStack>
        )}

        {/* Total */}
        <Flex justify="space-between" align="center" mb={localStatus === 'menunggu_pembayaran' ? 4 : 0}>
          <Text fontSize="sm" color={subtleColor}>Total Pembayaran</Text>
          <Text fontWeight="bold" fontSize="md" color={titleColor}>
            {tx ? formatRupiah(tx.total_amount) : '-'}
          </Text>
        </Flex>

        {/* Tombol aksi */}
        {localStatus === 'menunggu_pembayaran' && (
          <Button size="sm" colorScheme="green" width="100%"
            isLoading={isPaying} loadingText="Memuat pembayaran..."
            onClick={handlePay}
          >
            Bayar Sekarang via Midtrans
          </Button>
        )}
        {isPaid && (
          <HStack justify="center" mt={1}>
            <Icon as={CheckCircleIcon} color="green.400" boxSize={4} />
            <Text fontSize="sm" color="green.500" fontWeight="medium">Pembayaran lunas</Text>
          </HStack>
        )}
      </Box>
    </Box>
  );
};

// ─── Sub-komponen: Modal detail grup (Past) ──────────────────────────────────

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OpenTripBooking | null;
  myUserId: number | null;
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ isOpen, onClose, item, myUserId }) => {
  const [groupData, setGroupData] = useState<GroupDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const subtleColor = useColorModeValue('gray.500', 'gray.400');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');
  const memberMeBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    if (!isOpen || !item?.group_id) return;

    setLoading(true);
    setGroupData(null);

    apiClient.get<GroupDetailResponse>(`/open-trip/group/${item.group_id}`)
      .then(res => setGroupData(res.data))
      .catch(() => {
        toast({ title: 'Gagal memuat detail grup.', status: 'error', duration: 4000, isClosable: true });
      })
      .finally(() => setLoading(false));
  }, [isOpen, item?.group_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
          <Text fontSize="md" fontWeight="bold" noOfLines={1}>{item.tour_name}</Text>
          <Text fontSize="xs" color={subtleColor} fontWeight="normal" mt={0.5}>
            {formatDate(item.trip_date)}{item.tour_location ? ` · ${item.tour_location}` : ''}
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={5}>
          {loading && (
            <VStack spacing={3}>
              <Skeleton height="60px" borderRadius="lg" />
              <SkeletonText noOfLines={3} skeletonHeight="14px" />
              <SkeletonText noOfLines={3} skeletonHeight="14px" />
            </VStack>
          )}

          {!loading && groupData && (
            <VStack spacing={5} align="stretch">
              {/* Ringkasan grup */}
              <Flex
                bg={bgColor} border="1px solid" borderColor={borderColor}
                borderRadius="lg" overflow="hidden"
              >
                <Box flex={1} px={3} py={3} textAlign="center">
                  <Text fontSize="xs" color={subtleColor}>Anggota</Text>
                  <Text fontWeight="bold" fontSize="lg">{groupData.members.length}</Text>
                </Box>
                <Divider orientation="vertical" h="auto" />
                <Box flex={1} px={3} py={3} textAlign="center">
                  <Text fontSize="xs" color={subtleColor}>Harga Paket</Text>
                  <Text fontWeight="bold" fontSize="md">
                    {formatRupiah(groupData.group.tour_price)}
                  </Text>
                </Box>
                <Divider orientation="vertical" h="auto" />
                <Box flex={1} px={3} py={3} textAlign="center">
                  <Text fontSize="xs" color={subtleColor}>Per Orang</Text>
                  <Text fontWeight="bold" fontSize="md" color="blue.500">
                    {formatRupiah(Math.round(groupData.group.tour_price / groupData.members.length))}
                  </Text>
                </Box>
              </Flex>

              {/* Daftar anggota */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={subtleColor} mb={3}>
                  ANGGOTA GRUP
                </Text>
                <VStack spacing={3} align="stretch">
                  {groupData.members.map((m, idx) => {
                    const isMe = m.user_id === myUserId;
                    const pct = scorePercent(m.matching_score);
                    const scoreColor = pct >= 80 ? 'green.500' : pct >= 60 ? 'blue.500' : 'orange.500';

                    return (
                      <Box
                        key={m.participant_id}
                        border="1px solid"
                        borderColor={isMe ? 'blue.200' : borderColor}
                        bg={isMe ? memberMeBg : bgColor}
                        borderRadius="xl"
                        p={3}
                        animation={`${fadeUp} 0.2s ease ${idx * 0.06}s both`}
                      >
                        <Flex align="center" gap={3} mb={m.interests.length > 0 ? 2 : 0}>
                          <Avatar
                            size="sm"
                            name={m.name}
                            src={m.profile_picture ?? undefined}
                            bg="blue.400"
                          />
                          <Box flex={1}>
                            <HStack spacing={2}>
                              <Text fontSize="sm" fontWeight="semibold">{m.name}</Text>
                              {isMe && (
                                <Badge colorScheme="blue" fontSize="2xs">Kamu</Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color={subtleColor}>
                              Umur {m.age} · {BUDGET_LABELS[m.budget_level] ?? `Level ${m.budget_level}`}
                            </Text>
                          </Box>
                          <Box textAlign="right">
                            <Text fontWeight="bold" fontSize="sm" color={scoreColor}>{pct}%</Text>
                            <Text fontSize="2xs" color={subtleColor}>cocok</Text>
                          </Box>
                        </Flex>

                        {m.interests.length > 0 && (
                          <Wrap mt={1.5}>
                            {m.interests.map(i => (
                              <WrapItem key={i}>
                                <Tag size="sm" colorScheme="teal" borderRadius="full" variant="subtle">
                                  <TagLabel fontSize="xs">{i}</TagLabel>
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}

                        {/* Kriteria cocok */}
                        <Flex mt={2} gap={1.5} flexWrap="wrap">
                          {(Object.keys(CRITERIA_LABELS) as Array<keyof CriteriaMatch>).map(key => (
                            <Badge
                              key={key}
                              colorScheme={m.score_detail.criteria_match[key] ? 'green' : 'gray'}
                              variant="subtle"
                              fontSize="2xs"
                              px={1.5} py={0.5}
                              borderRadius="md"
                            >
                              {m.score_detail.criteria_match[key] ? '✓' : '✗'} {CRITERIA_LABELS[key]}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </Box>

              {/* Breakdown NCF/NSF saya */}
              {(() => {
                const myMember = groupData.members.find(m => m.user_id === myUserId);
                if (!myMember) return null;
                return (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color={subtleColor} mb={3}>
                      SKOR KECOCOKANMU
                    </Text>
                    <Flex gap={3}>
                      <Stat flex={1} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="xl" p={3}>
                        <StatLabel fontSize="xs" color="blue.500">Core Factor (60%)</StatLabel>
                        <StatNumber fontSize="lg">{myMember.score_detail.ncf}</StatNumber>
                        <StatHelpText fontSize="xs">Minat + Aktivitas</StatHelpText>
                      </Stat>
                      <Stat flex={1} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="xl" p={3}>
                        <StatLabel fontSize="xs" color="purple.500">Secondary (40%)</StatLabel>
                        <StatNumber fontSize="lg">{myMember.score_detail.nsf}</StatNumber>
                        <StatHelpText fontSize="xs">Umur + Budget</StatHelpText>
                      </Stat>
                    </Flex>
                  </Box>
                );
              })()}

              {/* Placeholder: Tulis Ulasan */}
              <Tooltip label="Fitur ulasan akan segera hadir" hasArrow>
                <Box>
                  <Button
                    width="100%" colorScheme="yellow" variant="outline"
                    isDisabled opacity={0.5} cursor="not-allowed"
                    leftIcon={<Icon as={StarIcon} boxSize={3.5} />}
                  >
                    Tulis Ulasan untuk Trip Ini
                  </Button>
                </Box>
              </Tooltip>
            </VStack>
          )}

          {!loading && !groupData && (
            <Box textAlign="center" py={8}>
              <Text color={subtleColor} fontSize="sm">Gagal memuat data grup.</Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// ─── Komponen Tab selector ────────────────────────────────────────────────────

interface TabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
}

const TabButton: React.FC<TabButtonProps> = ({ label, count, isActive, onClick, icon }) => {
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const inactiveHoverColor = useColorModeValue('gray.700', 'gray.200');
  const activeBg = useColorModeValue('white', 'gray.800');
  const inactiveBg = 'transparent';

  return (
    <Button
      flex={1}
      variant="unstyled"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={2.5}
      borderRadius="lg"
      bg={isActive ? activeBg : inactiveBg}
      color={isActive ? activeColor : inactiveColor}
      fontWeight={isActive ? 'semibold' : 'medium'}
      fontSize="sm"
      boxShadow={isActive ? 'sm' : 'none'}
      transition="all 0.15s ease"
      _hover={{ color: isActive ? activeColor : inactiveHoverColor }}
      onClick={onClick}
      h="auto"
    >
      <Icon as={icon} boxSize={4} />
      {label}
      <Badge
        ml={0.5}
        colorScheme={isActive ? 'blue' : 'gray'}
        variant={isActive ? 'solid' : 'subtle'}
        borderRadius="full"
        fontSize="xs"
        px={1.5}
        minW="18px"
        textAlign="center"
      >
        {count}
      </Badge>
    </Button>
  );
};

// ─── Komponen utama ───────────────────────────────────────────────────────────

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [trips, setTrips] = useState<OpenTripBooking[]>([]);
  const [privateBookings, setPrivateBookings] = useState<PrivateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedItem, setSelectedItem] = useState<OpenTripBooking | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtleColor = useColorModeValue('gray.500', 'gray.400');
  const tabBarBg = useColorModeValue('gray.100', 'gray.800');

  // Ambil user ID dari localStorage
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try { setMyUserId(JSON.parse(raw)?.id ?? null); } catch { /* ignore */ }
    }
  }, []);

  // Fetch Smart Open Trip + Private Booking secara paralel
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const [openRes, privateRes] = await Promise.allSettled([
        apiClient.get<{ data: OpenTripBooking[] }>('/open-trip/my-trips'),
        apiClient.get<{ data: PrivateBooking[] }>('/bookings'),
      ]);
      if (openRes.status === 'fulfilled') setTrips(openRes.value.data.data);
      if (privateRes.status === 'fulfilled') setPrivateBookings(privateRes.value.data.data);
    } catch {
      toast({
        title: 'Gagal memuat data pesanan',
        description: 'Coba muat ulang halaman.',
        status: 'error', duration: 4000, isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Pisahkan upcoming vs past — Smart Open Trip
  const upcomingTrips = trips.filter(t =>
    (t.status === 'waiting' || t.status === 'matched') && !isPast(t.trip_date)
  );
  const pastTrips = trips.filter(t =>
    t.status === 'cancelled' || (t.status === 'matched' && isPast(t.trip_date))
  );
  const activeTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

  // Pisahkan upcoming vs past — Private Booking
  const upcomingPrivate = privateBookings.filter(b => {
    const tourDate = b.transaction?.tour_date;
    const isTerminal = PRIVATE_TERMINAL.includes(b.booking_status);
    return !isTerminal && (!tourDate || !isPast(tourDate));
  });
  const pastPrivate = privateBookings.filter(b => {
    const tourDate = b.transaction?.tour_date;
    const isTerminal = PRIVATE_TERMINAL.includes(b.booking_status);
    return isTerminal || (tourDate ? isPast(tourDate) : false);
  });
  const activePrivate = activeTab === 'upcoming' ? upcomingPrivate : pastPrivate;

  const handleViewDetail = (item: OpenTripBooking) => {
    setSelectedItem(item);
    onOpen();
  };

  return (
    <Box minH="100vh" bg={pageBg} animation={`${fadeIn} 0.25s ease`}>
      {/* Navbar */}
      <TouristNavbar />

      <Container maxW="container.md" py={{ base: 6, md: 10 }}>
        {/* Header halaman */}
        <Box mb={8} animation={`${fadeUp} 0.2s ease`}>
          <Heading size="lg" color={titleColor} fontWeight="bold">
            Pesanan Saya
          </Heading>
          <Text color={subtleColor} fontSize="sm" mt={1}>
            Smart Open Trip yang kamu ikuti
          </Text>
        </Box>

        {/* Tab selector */}
        <Box
          bg={tabBarBg} borderRadius="xl" p={1.5} mb={6}
          animation={`${fadeUp} 0.25s ease 0.05s both`}
        >
          <Flex gap={1}>
            <TabButton
              label="Upcoming"
              count={loading ? 0 : upcomingTrips.length + upcomingPrivate.length}
              isActive={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
              icon={TimeIcon}
            />
            <TabButton
              label="Riwayat"
              count={loading ? 0 : pastTrips.length + pastPrivate.length}
              isActive={activeTab === 'past'}
              onClick={() => setActiveTab('past')}
              icon={CheckCircleIcon}
            />
          </Flex>
        </Box>

        {/* Konten tab */}
        <Box animation={`${fadeIn} 0.2s ease`}>
          {/* Loading skeleton */}
          {loading && (
            <VStack spacing={4} align="stretch">
              {[1, 2].map(i => <SkeletonCard key={i} />)}
            </VStack>
          )}

          {/* Ada data — tampilkan Smart Open Trip + Private Booking */}
          {!loading && (activeTrips.length > 0 || activePrivate.length > 0) && (
            <VStack spacing={4} align="stretch">
              {activeTrips.map((item, idx) => (
                <TripCard
                  key={item.participant_id}
                  item={item}
                  isUpcoming={activeTab === 'upcoming'}
                  index={idx}
                  onViewDetail={handleViewDetail}
                  myUserId={myUserId}
                />
              ))}
              {activePrivate.map(b => (
                <PrivateBookingCard
                  key={b.id}
                  booking={b}
                  onPaymentComplete={fetchTrips}
                />
              ))}
            </VStack>
          )}

          {/* Empty state — tidak ada trip maupun private booking */}
          {!loading && activeTrips.length === 0 && activePrivate.length === 0 && (
            <EmptyState tab={activeTab} onExplore={() => navigate('/tours')} />
          )}
        </Box>
      </Container>

      {/* Modal detail grup (Past) */}
      <GroupDetailModal
        isOpen={isOpen}
        onClose={onClose}
        item={selectedItem}
        myUserId={myUserId}
      />
    </Box>
  );
};

export default Bookings;
