import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  SkeletonText,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tag,
  TagLabel,
  Text,
  Textarea,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  CheckCircleIcon,
  InfoOutlineIcon,
  StarIcon,
  TimeIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { FiCompass, FiDollarSign, FiMap, FiMapPin, FiTarget, FiUsers as FiUsersIcon } from 'react-icons/fi';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// Animasi

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// Types

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
  payment_status: string;
  guide_reviewed: boolean;
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

// Types (Private Booking)

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
  guide_reviewed: boolean;
  tour_reviewed: boolean;
  paid_at: string | null;
  created_at: string;
  transaction: PrivateBookingTransaction | null;
}

const PRIVATE_STATUS_CONFIG: Record<string, { label: string; colorScheme: string }> = {
  menunggu_pembayaran:            { label: 'Menunggu Pembayaran',  colorScheme: 'orange' },
  menunggu_konfirmasi_pemandu:    { label: 'Menunggu Konfirmasi',  colorScheme: 'blue'   },
  menunggu_verifikasi_pembayaran: { label: 'Dalam Verifikasi',     colorScheme: 'purple' },
  terkonfirmasi:                  { label: 'Terkonfirmasi',        colorScheme: 'green'  },
  selesai:                        { label: 'Selesai',              colorScheme: 'teal'   },
  ditolak:                        { label: 'Ditolak',              colorScheme: 'red'    },
  dibatalkan:                     { label: 'Dibatalkan',           colorScheme: 'red'    },
  dibatalkan_otomatis:            { label: 'Dibatalkan Otomatis',  colorScheme: 'red'    },
};

const PRIVATE_TERMINAL = ['selesai', 'ditolak', 'dibatalkan', 'dibatalkan_otomatis'];

// Konstanta

const BUDGET_LABELS: Record<number, string> = {
  1: '< Rp 500rb', 2: 'Rp 500rb–1jt', 3: 'Rp 1jt–2jt', 4: 'Rp 2jt–5jt', 5: '> Rp 5jt',
};

const CRITERIA_LABELS: Record<keyof CriteriaMatch, string> = {
  age: 'Umur', interest: 'Minat', preference: 'Aktivitas', budget: 'Budget',
};

// Helpers

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

// Config badge status

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

// Sub-komponen: Skeleton card

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

// Sub-komponen: Empty state

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
        <Icon as={FiCompass} boxSize={10} color="blue.300" mb={4} />
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
      <Icon as={FiMap} boxSize={10} color="gray.300" mb={4} />
      <Heading size="md" color={textColor} mb={2}>Riwayat perjalanan masih kosong</Heading>
      <Text color={subtleColor} fontSize="sm" maxW="300px" mx="auto">
        Trip yang sudah selesai atau dibatalkan akan tercatat di sini.
      </Text>
    </Box>
  );
};

// Sub-komponen: Stat row (info grup)

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
      icon: FiUsersIcon,
      label: 'Anggota',
      value: `${memberCount} orang`,
    },
    ...(matchingScore !== null ? [{
      icon: FiTarget,
      label: 'Kecocokan',
      value: `${scorePercent(matchingScore)}%`,
    }] : []),
    {
      icon: FiDollarSign,
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
          <Box flex={1} px={{ base: 2, md: 3 }} py={2.5} textAlign="center">
            <HStack spacing={1} justify="center" mb={0.5}>
                <Icon as={item.icon} boxSize={3} color={labelColor} />
                <Text fontSize="xs" color={labelColor}>{item.label}</Text>
              </HStack>
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold" color={valueColor} noOfLines={1}>{item.value}</Text>
          </Box>
        </React.Fragment>
      ))}
    </Flex>
  );
};

// Sub-komponen: Star Selector

interface StarSelectorProps {
  value: number;
  onChange: (v: number) => void;
}

const StarSelector: React.FC<StarSelectorProps> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <HStack spacing={1} justify="center">
      {[1, 2, 3, 4, 5].map(star => (
        <Icon
          key={star}
          as={StarIcon}
          boxSize={8}
          cursor="pointer"
          color={(hovered || value) >= star ? 'yellow.400' : 'gray.200'}
          transition="color 0.1s ease"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        />
      ))}
    </HStack>
  );
};

// Sub-komponen: Review Modal

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: number | null;
  participantId?: number | null;
  tourName: string;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen, onClose, transactionId, participantId, tourName, onSuccess,
}) => {
  const toast = useToast();
  const [rating, setRating]           = useState(0);
  const [comment, setComment]         = useState('');
  const [tourRating, setTourRating]   = useState(0);
  const [tourComment, setTourComment] = useState('');
  const [loading, setLoading]         = useState(false);

  // Private booking = transactionId diberikan → tampilkan seksi rating paket
  const showTourReview = !!transactionId;

  // Reset saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setRating(0); setComment('');
      setTourRating(0); setTourComment('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: 'Pilih bintang untuk pemandu terlebih dahulu.', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (showTourReview && tourRating === 0) {
      toast({ title: 'Pilih bintang untuk paket wisata terlebih dahulu.', status: 'warning', duration: 3000, isClosable: true });
      return;
    }

    setLoading(true);
    try {
      const requests: Promise<unknown>[] = [
        apiClient.post('/reviews/guide', {
          ...(transactionId ? { transaction_id: transactionId } : {}),
          ...(participantId  ? { participant_id: participantId  } : {}),
          rating,
          comment: comment.trim() || null,
        }),
      ];

      if (showTourReview) {
        requests.push(
          apiClient.post('/reviews/tour', {
            transaction_id: transactionId,
            rating: tourRating,
            comment: tourComment.trim() || null,
          })
        );
      }

      await Promise.all(requests);

      toast({
        title: 'Ulasan berhasil dikirim!',
        description: 'Terima kasih sudah memberikan penilaian.',
        status: 'success', duration: 4000, isClosable: true,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: msg ?? 'Gagal mengirim ulasan.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const STAR_LABELS: Record<number, string> = {
    1: 'Sangat Kurang',
    2: 'Kurang',
    3: 'Cukup',
    4: 'Bagus',
    5: 'Sangat Bagus',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader borderBottomWidth="1px" pb={4}>
          <Text fontSize="md" fontWeight="bold">Tulis Ulasan</Text>
          <Text fontSize="xs" color="gray.500" fontWeight="normal" mt={0.5} noOfLines={1}>
            {tourName}
          </Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Rating Pemandu */}
            <Box textAlign="center">
              <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={2}>
                Rating Pemandu
              </Text>
              <StarSelector value={rating} onChange={setRating} />
              {rating > 0 && (
                <Text fontSize="sm" color="yellow.500" fontWeight="semibold" mt={2}>
                  {STAR_LABELS[rating]}
                </Text>
              )}
            </Box>

            {/* Komentar Pemandu */}
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1.5}>
                Komentar pemandu <Text as="span" color="gray.400">(opsional)</Text>
              </Text>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ceritakan pengalamanmu bersama pemandu..."
                rows={3}
                resize="none"
                borderRadius="lg"
                maxLength={1000}
                fontSize="sm"
              />
              <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
                {comment.length}/1000
              </Text>
            </Box>

            {/* Seksi Rating Paket — hanya untuk Private Booking */}
            {showTourReview && (
              <>
                <Divider />
                <Box textAlign="center">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={2}>
                    Rating Paket Wisata
                  </Text>
                  <StarSelector value={tourRating} onChange={setTourRating} />
                  {tourRating > 0 && (
                    <Text fontSize="sm" color="yellow.500" fontWeight="semibold" mt={2}>
                      {STAR_LABELS[tourRating]}
                    </Text>
                  )}
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1.5}>
                    Komentar paket <Text as="span" color="gray.400">(opsional)</Text>
                  </Text>
                  <Textarea
                    value={tourComment}
                    onChange={e => setTourComment(e.target.value)}
                    placeholder="Bagaimana pengalamanmu di paket wisata ini?"
                    rows={3}
                    resize="none"
                    borderRadius="lg"
                    maxLength={1000}
                    fontSize="sm"
                  />
                  <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
                    {tourComment.length}/1000
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={loading}>Batal</Button>
          <Button
            colorScheme="yellow"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Mengirim..."
            isDisabled={rating === 0 || (showTourReview && tourRating === 0)}
            leftIcon={<Icon as={StarIcon} />}
          >
            Kirim Ulasan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Sub-komponen: Trip card

interface TripCardProps {
  item: OpenTripBooking;
  isUpcoming: boolean;
  index: number;
  onViewDetail: (item: OpenTripBooking) => void;
  myUserId: number | null;
  onWriteReview: (participantId: number, tourName: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ item, isUpcoming, index, onViewDetail, onWriteReview }) => {
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

  // Bisa tulis ulasan: matched + sudah bayar + tanggal lewat + belum review
  const canReview =
    !isUpcoming &&
    item.status === 'matched' &&
    item.payment_status === 'paid' &&
    !item.guide_reviewed;

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
      {/* Status strip */}
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
            <Icon as={FiMapPin} boxSize={3} />
            <Text fontSize="sm">{item.tour_location}</Text>
          </HStack>
        )}

        {/* Stat row */}
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

        {/* Waiting info */}
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

          {/* Bayar Sekarang (Upcoming) */}
          {isUpcoming && item.status === 'matched' && (
            <Tooltip label="Fitur pembayaran akan segera hadir" hasArrow placement="top">
              <Box flex={1} minW="100px">
                <Button
                  size="sm" colorScheme="green" isDisabled width="100%"
                  cursor="not-allowed" opacity={0.5}
                >
                  Bayar Sekarang
                </Button>
              </Box>
            </Tooltip>
          )}

          {/* Tulis Ulasan (Past, matched, sudah bayar, belum review) */}
          {canReview && (
            <Button
              size="sm"
              colorScheme="yellow"
              variant="outline"
              flex={1}
              minW="100px"
              leftIcon={<Icon as={StarIcon} boxSize={3} />}
              onClick={() => onWriteReview(item.participant_id, item.tour_name)}
            >
              Tulis Ulasan
            </Button>
          )}

          {/* Ulasan sudah dikirim */}
          {!isUpcoming && item.status === 'matched' && item.guide_reviewed && (
            <HStack flex={1} minW="100px" justify="center" color="green.500" spacing={1.5}>
              <Icon as={CheckCircleIcon} boxSize={3.5} />
              <Text fontSize="xs" fontWeight="semibold">Ulasan Terkirim</Text>
            </HStack>
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

// ─── Midtrans Snap loader ────────────────────────────────────────────────────

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
  onWriteReview: (transactionId: number, tourName: string) => void;
  onCancelled: (id: number) => void;
}

const PrivateBookingCard: React.FC<PrivateBookingCardProps> = ({ booking, onPaymentComplete, onWriteReview, onCancelled }) => {
  const toast                       = useToast();
  const navigate                    = useNavigate();
  const [isPaying, setIsPaying]     = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [localStatus, setLocalStatus] = useState(booking.booking_status);
  const [localReviewed, setLocalReviewed] = useState(booking.guide_reviewed);
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelDialogRef             = useRef<HTMLButtonElement>(null);
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();

  const cardBg      = useColorModeValue('white',    'gray.800');
  const borderCol   = useColorModeValue('gray.100', 'gray.700');
  const hoverBorder = useColorModeValue('blue.200', 'blue.600');
  const titleColor  = useColorModeValue('gray.800', 'white');
  const subtleColor = useColorModeValue('gray.500', 'gray.400');

  const tx      = booking.transaction;
  const tour    = tx?.tour;
  const cfg     = PRIVATE_STATUS_CONFIG[localStatus] ?? { label: localStatus, colorScheme: 'gray' };
  const isPaid  = localStatus === 'terkonfirmasi' || localStatus === 'selesai';

  // Trip selesai: status 'selesai' (backend set ini setelah trip + settlement)
  const tripDone = localStatus === 'selesai';

  // TC-062: tombol "Tulis Ulasan" HANYA muncul jika status === 'selesai' (bukan 'terkonfirmasi')
  const canReview = localStatus === 'selesai' && !localReviewed;

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

  const handleReviewSuccess = () => setLocalReviewed(true);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await apiClient.post(`/bookings/${booking.id}/cancel`);
      setLocalStatus('dibatalkan');
      onCancelled(booking.id);
      toast({ title: 'Booking berhasil dibatalkan.', status: 'info', duration: 4000, isClosable: true });
      onCancelClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: msg ?? 'Gagal membatalkan booking.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsCancelling(false);
    }
  };

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
            <Icon as={FiMapPin} boxSize={3} />
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
            <Icon as={FiUsersIcon} boxSize={3} />
            <Text>{tx?.participant_count ?? 1} orang</Text>
          </HStack>
        </HStack>

        {/* Pemandu */}
        {tour?.guide && (
          <HStack spacing={1.5} fontSize="xs" color={subtleColor} mb={3}>
            <Icon as={FiCompass} boxSize={3} />
            <Text>{tour.guide.name}</Text>
          </HStack>
        )}

        {/* Total */}
        <Flex
          justify="space-between" align="center"
          mb={localStatus === 'menunggu_pembayaran' || canReview || localReviewed ? 4 : 0}
        >
          <Text fontSize="sm" color={subtleColor}>Total Pembayaran</Text>
          <Text fontWeight="bold" fontSize="md" color={titleColor}>
            {tx ? formatRupiah(tx.total_amount) : '-'}
          </Text>
        </Flex>

        {/* Tombol Batalkan — hanya saat menunggu konfirmasi pemandu */}
        {localStatus === 'menunggu_konfirmasi_pemandu' && (
          <Button size="sm" colorScheme="red" variant="outline" width="100%"
            leftIcon={<Icon as={WarningIcon} boxSize={3} />}
            onClick={onCancelOpen}
          >
            Batalkan Booking
          </Button>
        )}

        {/* Tombol Bayar */}
        {localStatus === 'menunggu_pembayaran' && (
          <Button size="sm" colorScheme="green" width="100%"
            isLoading={isPaying} loadingText="Memuat pembayaran..."
            onClick={handlePay}
          >
            Bayar Sekarang via Midtrans
          </Button>
        )}

        {/* Sudah lunas */}
        {isPaid && !tripDone && (
          <HStack justify="center" mt={1}>
            <Icon as={CheckCircleIcon} color="green.400" boxSize={4} />
            <Text fontSize="sm" color="green.500" fontWeight="medium">Pembayaran lunas</Text>
          </HStack>
        )}

        {/* Trip selesai: aksi ulasan + pesan lagi */}
        {tripDone && (
          <Box mt={1}>
            {canReview ? (
              <Button
                size="sm"
                colorScheme="yellow"
                variant="outline"
                width="100%"
                leftIcon={<Icon as={StarIcon} boxSize={3} />}
                onClick={() => onWriteReview(tx!.id, tour?.name ?? 'Tour')}
              >
                Tulis Ulasan
              </Button>
            ) : localReviewed ? (
              <HStack justify="center" color="green.500" spacing={1.5}>
                <Icon as={CheckCircleIcon} boxSize={3.5} />
                <Text fontSize="sm" fontWeight="semibold">Ulasan Terkirim</Text>
              </HStack>
            ) : null}
          </Box>
        )}

        {/* Pesan Lagi — semua status terminal (selesai/ditolak/dibatalkan) */}
        {PRIVATE_TERMINAL.includes(localStatus) && tour?.id && (
          <Button
            size="sm" variant="outline" colorScheme="blue" width="100%" mt={2}
            onClick={() => navigate(`/tours/${tour.id}`)}
          >
            Pesan Lagi
          </Button>
        )}
      </Box>

      {/* Dialog konfirmasi batalkan */}
      <AlertDialog
        isOpen={isCancelOpen}
        leastDestructiveRef={cancelDialogRef as React.RefObject<HTMLElement>}
        onClose={onCancelClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl" mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Batalkan Booking?
            </AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.600">
              Booking untuk <strong>{tour?.name ?? 'tour ini'}</strong> akan dibatalkan.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelDialogRef} size="sm" bg="blue.500" color="white" _hover={{ bg: 'blue.600' }} onClick={onCancelClose} isDisabled={isCancelling}>
                Tidak
              </Button>
              <Button size="sm" bg="red.500" color="white" _hover={{ bg: 'red.600' }} onClick={handleConfirmCancel} isLoading={isCancelling} loadingText="Membatalkan...">
                Ya, Batalkan
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

// ─── Sub-komponen: Modal detail grup (Past) ──────────────────────────────────

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OpenTripBooking | null;
  myUserId: number | null;
  onWriteReview: (participantId: number, tourName: string) => void;
}

const GroupDetailModal: React.FC<GroupDetailModalProps> = ({ isOpen, onClose, item, myUserId, onWriteReview }) => {
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

  const tripIsPast = isPast(item.trip_date);
  const canReview  = tripIsPast && item.payment_status === 'paid' && !item.guide_reviewed;

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

              {/* Tulis Ulasan */}
              {canReview ? (
                <Button
                  width="100%" colorScheme="yellow" variant="outline"
                  leftIcon={<Icon as={StarIcon} boxSize={3.5} />}
                  onClick={() => {
                    onClose();
                    onWriteReview(item.participant_id, item.tour_name);
                  }}
                >
                  Tulis Ulasan untuk Trip Ini
                </Button>
              ) : item.guide_reviewed ? (
                <HStack justify="center" color="green.500" spacing={2}>
                  <Icon as={CheckCircleIcon} boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold">Ulasan sudah dikirim</Text>
                </HStack>
              ) : (
                <Tooltip label="Ulasan bisa dikirim setelah trip selesai dan pembayaran lunas" hasArrow>
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
              )}
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
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();

  const [trips, setTrips] = useState<OpenTripBooking[]>([]);
  const [privateBookings, setPrivateBookings] = useState<PrivateBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'transactions'>('upcoming');
  const [selectedItem, setSelectedItem] = useState<OpenTripBooking | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // State untuk review modal
  const [reviewTarget, setReviewTarget] = useState<{
    transactionId?: number;
    participantId?: number;
    tourName: string;
  } | null>(null);

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
    onDetailOpen();
  };

  // Buka ReviewModal dari TripCard atau GroupDetailModal
  const handleWriteReviewOpenTrip = (participantId: number, tourName: string) => {
    setReviewTarget({ participantId, tourName });
    onReviewOpen();
  };

  // Buka ReviewModal dari PrivateBookingCard
  const handleWriteReviewPrivate = (transactionId: number, tourName: string) => {
    setReviewTarget({ transactionId, tourName });
    onReviewOpen();
  };

  const handleBookingCancelled = useCallback((id: number) => {
    setPrivateBookings(prev =>
      prev.map(b => b.id === id ? { ...b, booking_status: 'dibatalkan' } : b)
    );
  }, []);

  // Setelah review sukses: update flag lokal di data trip/booking + tutup modal
  const handleReviewSuccess = useCallback(() => {
    if (reviewTarget?.participantId) {
      setTrips(prev =>
        prev.map(t =>
          t.participant_id === reviewTarget.participantId
            ? { ...t, guide_reviewed: true }
            : t
        )
      );
    }
    if (reviewTarget?.transactionId) {
      setPrivateBookings(prev =>
        prev.map(b =>
          b.transaction?.id === reviewTarget.transactionId
            ? { ...b, guide_reviewed: true, tour_reviewed: true }
            : b
        )
      );
    }
    onReviewClose();
  }, [reviewTarget, onReviewClose]);

  return (
    <Box minH="100vh" bg={pageBg} animation={`${fadeIn} 0.25s ease`}>
      {/* Navbar */}
      <TouristNavbar />

      <Container maxW="container.md" py={{ base: 6, md: 10 }}>
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={subtleColor}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/dashboard')}>Beranda</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="blue.500" fontWeight="medium">Pesanan Saya</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        {/* Header halaman */}
        <Box mb={8} animation={`${fadeUp} 0.2s ease`}>
          <Heading size="lg" color={titleColor} fontWeight="bold">
            Pesanan Saya
          </Heading>
          <Text color={subtleColor} fontSize="sm" mt={1}>
            Semua pesanan Private Trip & Smart Open Trip kamu
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
            {/* HIDDEN: Tab Transaksi — sembunyikan sementara, jangan hapus
            <TabButton
              label="Transaksi"
              count={loading ? 0 : privateBookings.length}
              isActive={activeTab === 'transactions'}
              onClick={() => setActiveTab('transactions')}
              icon={CalendarIcon}
            />
            */}
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

          {/* Ada data */}
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
                  onWriteReview={handleWriteReviewOpenTrip}
                />
              ))}
              {activePrivate.map(b => (
                <PrivateBookingCard
                  key={b.id}
                  booking={b}
                  onPaymentComplete={fetchTrips}
                  onWriteReview={handleWriteReviewPrivate}
                  onCancelled={handleBookingCancelled}
                />
              ))}
            </VStack>
          )}

          {/* Empty state */}
          {!loading && activeTab !== 'transactions' && activeTrips.length === 0 && activePrivate.length === 0 && (
            <EmptyState tab={activeTab} onExplore={() => navigate('/tours')} />
          )}

          {/* HIDDEN: Tab Transaksi — sembunyikan sementara, jangan hapus
          {activeTab === 'transactions' && !loading && (
            privateBookings.length === 0 ? (
              <Box textAlign="center" py={16} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm">
                <Text fontSize="3xl" mb={3}>🧾</Text>
                <Text fontSize="md" fontWeight="medium" color={subtleColor}>Belum ada riwayat transaksi.</Text>
              </Box>
            ) : (
              <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" boxShadow="sm" overflow="hidden">
                <TableContainer>
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Paket</Th>
                        <Th>Kode Transaksi</Th>
                        <Th isNumeric>Total</Th>
                        <Th>Tgl Trip</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {privateBookings.map(b => {
                        const tx = b.transaction;
                        const cfg = PRIVATE_STATUS_CONFIG[b.booking_status] ?? { label: b.booking_status, colorScheme: 'gray' };
                        return (
                          <Tr key={b.id} _hover={{ bg: 'gray.50' }}>
                            <Td maxW="180px">
                              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{tx?.tour?.name ?? '—'}</Text>
                              <Text fontSize="xs" color={subtleColor}>{tx?.tour?.guide?.name ?? ''}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="xs" fontFamily="mono" color={subtleColor}>{tx?.transaction_code ?? '—'}</Text>
                            </Td>
                            <Td isNumeric>
                              <Text fontSize="sm" fontWeight="semibold">{tx ? formatRupiah(tx.total_amount) : '—'}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="xs">{tx?.tour_date ? formatDate(tx.tour_date) : '—'}</Text>
                            </Td>
                            <Td>
                              <Badge colorScheme={cfg.colorScheme} variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                                {cfg.label}
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            )
          )}
          */}
        </Box>
      </Container>

      {/* Modal detail grup (Past) */}
      <GroupDetailModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        item={selectedItem}
        myUserId={myUserId}
        onWriteReview={handleWriteReviewOpenTrip}
      />

      {/* Modal Tulis Ulasan */}
      {reviewTarget && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={onReviewClose}
          transactionId={reviewTarget.transactionId}
          participantId={reviewTarget.participantId}
          tourName={reviewTarget.tourName}
          onSuccess={handleReviewSuccess}
        />
      )}
    </Box>
  );
};

export default Bookings;
