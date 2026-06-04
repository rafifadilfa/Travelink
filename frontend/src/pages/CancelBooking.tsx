import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Textarea,
  useToast,
  Spinner,
  FormControl,
  FormLabel,
  Divider,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface BookingDetail {
  id: number;
  booking_status: string;
  transaction: {
    tour_date: string | null;
    tour: { name: string } | null;
    user: { name: string } | null;
  } | null;
}

const CancelBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    guideApiClient.get(`/guide/bookings/${bookingId}`)
      .then(res => setBooking(res.data.booking))
      .catch(() => {
        toast({ title: 'Booking tidak ditemukan', status: 'error', duration: 3000 });
        navigate('/guide/bookings');
      })
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const handleConfirmCancellation = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Alasan wajib diisi',
        description: 'Mohon berikan alasan penolakan/pembatalan.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await guideApiClient.post(`/guide/bookings/${bookingId}/reject`, {
        rejection_reason: reason,
      });
      toast({
        title: 'Booking berhasil ditolak',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/guide/bookings');
    } catch (err: any) {
      toast({
        title: 'Gagal menolak booking',
        description: err.response?.data?.message ?? 'Coba lagi.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return (
      <GuideLayout>
        <Flex justify="center" align="center" h="60vh"><Spinner size="xl" /></Flex>
      </GuideLayout>
    );
  }

  if (!booking) {
    return (
      <GuideLayout>
        <Heading>Booking Tidak Ditemukan</Heading>
        <Text>Booking yang diminta tidak ada.</Text>
        <Button mt={4} onClick={() => navigate('/guide/bookings')}>Kembali ke Bookings</Button>
      </GuideLayout>
    );
  }

  const tourName    = booking.transaction?.tour?.name ?? '—';
  const touristName = booking.transaction?.user?.name ?? 'Wisatawan';
  const tourDate    = booking.transaction?.tour_date
    ? new Date(booking.transaction.tour_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <GuideLayout>
      <Box maxW="container.md" mx="auto">
        <Heading as="h1" size="xl" mb={4}>
          Cancel Booking
        </Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')} mb={8}>
          Anda akan menolak booking dari {touristName}. Mohon berikan alasan yang jelas.
        </Text>

        <VStack
          bg={cardBg}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          spacing={6}
          align="stretch"
        >
          <Box>
            <Heading size="md" mb={4}>{tourName}</Heading>
            <HStack spacing={6} color={useColorModeValue('gray.500', 'gray.400')}>
              <HStack><Icon as={FiUser} /><Text>{touristName}</Text></HStack>
              <HStack><Icon as={FiCalendar} /><Text>{tourDate}</Text></HStack>
            </HStack>
          </Box>
          <Divider />
          <FormControl isRequired>
            <FormLabel htmlFor="cancellation-reason">Alasan Penolakan/Pembatalan</FormLabel>
            <Textarea
              id="cancellation-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="cth. Saya tidak tersedia pada tanggal tersebut, slot penuh, dsb."
              rows={5}
            />
          </FormControl>
          <HStack justify="flex-end" spacing={4}>
            <Button variant="ghost" onClick={() => navigate('/guide/bookings')}>
              Kembali
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmCancellation}
              isLoading={isSubmitting}
              loadingText="Memproses..."
            >
              Konfirmasi Penolakan
            </Button>
          </HStack>
        </VStack>
      </Box>
    </GuideLayout>
  );
};

export default CancelBooking;
