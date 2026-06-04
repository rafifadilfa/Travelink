import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Text, useColorModeValue, Spinner,
  VStack, HStack, Button, Link, Alert, AlertIcon,
  Image, Divider, SimpleGrid, useToast,
} from '@chakra-ui/react';
import { FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface Booking {
  id: number; booking_status: string; paid_at: string | null;
  payment_proof_url: string | null; payment_verified_at: string | null;
  transaction: {
    transaction_code: string; tour_date: string; total_amount: number;
    participant_count: number; payment_status: string;
    user: { id: number; name: string; email: string } | null;
    guide: { id: number; name: string; email: string } | null;
    tour: { id: number; name: string } | null;
  } | null;
}

const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : '—';

const AdminPaymentDetail: React.FC = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const toast      = useToast();
  const secondary     = useColorModeValue('gray.500', 'gray.400');
  const cardBg        = useColorModeValue('white', 'gray.800');
  const emptyProofBg  = useColorModeValue('gray.100', 'gray.700');

  const [booking,   setBooking]   = useState<Booking | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    adminApiClient.get(`/admin/payments/${id}`)
      .then(res => setBooking(res.data.booking))
      .catch(() => toast({ title: 'Gagal memuat detail', status: 'error', duration: 4000, isClosable: true }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await adminApiClient.post(`/admin/payments/${id}/verify`);
      toast({ title: 'Pembayaran berhasil diverifikasi!', status: 'success', duration: 4000, isClosable: true });
      navigate('/admin/payments');
    } catch (err: any) {
      toast({ title: 'Gagal verifikasi', description: err.response?.data?.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await adminApiClient.post(`/admin/payments/${id}/reject-payment`);
      toast({ title: 'Bukti ditolak. Wisatawan diminta upload ulang.', status: 'info', duration: 4000, isClosable: true });
      navigate('/admin/payments');
    } catch (err: any) {
      toast({ title: 'Gagal menolak', description: err.response?.data?.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return <AdminLayout><Flex justify="center" align="center" h="60vh"><Spinner size="xl" color="purple.500" /></Flex></AdminLayout>;
  }

  const tx = booking?.transaction;
  const isPending = booking?.booking_status === 'menunggu_verifikasi_pembayaran';

  return (
    <AdminLayout>
      <Box maxW="container.lg" mx="auto">
        <Button leftIcon={<FiArrowLeft />} variant="ghost" mb={6} onClick={() => navigate('/admin/payments')}>
          Kembali ke Daftar
        </Button>

        <Heading as="h1" size="xl" mb={6}>Detail Verifikasi Pembayaran</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Kiri: Detail pesanan */}
          <VStack spacing={4} align="stretch">
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Detail Pesanan</Heading>
              <VStack align="stretch" spacing={3} fontSize="sm">
                <HStack justify="space-between"><Text color={secondary}>Kode</Text><Text fontFamily="mono" fontWeight="bold">{tx?.transaction_code}</Text></HStack>
                <HStack justify="space-between"><Text color={secondary}>Tour</Text><Text>{tx?.tour?.name}</Text></HStack>
                <HStack justify="space-between"><Text color={secondary}>Wisatawan</Text><Text>{tx?.user?.name}</Text></HStack>
                <HStack justify="space-between"><Text color={secondary}>Pemandu</Text><Text>{tx?.guide?.name}</Text></HStack>
                <HStack justify="space-between"><Text color={secondary}>Tanggal Trip</Text><Text>{tx?.tour_date ? new Date(tx.tour_date).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '—'}</Text></HStack>
                <HStack justify="space-between"><Text color={secondary}>Peserta</Text><Text>{tx?.participant_count} orang</Text></HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text color={secondary}>Total Pembayaran</Text>
                  <Text fontWeight="bold" fontSize="lg" color="blue.500">{tx?.total_amount ? fmt(tx.total_amount) : '—'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color={secondary}>Bukti Dikirim</Text>
                  <Text>{fmtDate(booking?.paid_at ?? null)}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Aksi */}
            {isPending && (
              <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                <Heading size="md" mb={4}>Ambil Tindakan</Heading>
                <VStack spacing={3}>
                  <Button w="full" colorScheme="green" leftIcon={<FiCheckCircle />}
                    isLoading={verifying} onClick={handleVerify}>
                    Verifikasi Pembayaran
                  </Button>
                  <Button w="full" variant="outline" colorScheme="red" leftIcon={<FiXCircle />}
                    isLoading={rejecting} onClick={handleReject}>
                    Tolak (Minta Upload Ulang)
                  </Button>
                </VStack>
              </Box>
            )}
            {!isPending && (
              <Alert status="info" borderRadius="lg">
                <AlertIcon />
                Pesanan ini sudah diproses (status: {booking?.booking_status}).
              </Alert>
            )}
          </VStack>

          {/* Kanan: Bukti pembayaran */}
          <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={4}>Bukti Pembayaran</Heading>
            {booking?.payment_proof_url ? (
              <VStack spacing={3}>
                <Image
                  src={booking.payment_proof_url} alt="Bukti Pembayaran"
                  borderRadius="md" maxH="400px" objectFit="contain" w="full"
                  fallback={<Flex h="300px" align="center" justify="center" bg={emptyProofBg} borderRadius="md" color={secondary}><Text>Pratinjau tidak tersedia</Text></Flex>}
                />
                <Link
                  href={booking.payment_proof_url}
                  isExternal
                  fontSize="sm"
                  color="blue.500"
                  textDecoration="underline"
                >
                  Buka di tab baru
                </Link>
              </VStack>
            ) : (
              <Flex h="200px" align="center" justify="center" bg={emptyProofBg} borderRadius="md">
                <Text color={secondary}>Tidak ada bukti pembayaran.</Text>
              </Flex>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </AdminLayout>
  );
};

export default AdminPaymentDetail;
