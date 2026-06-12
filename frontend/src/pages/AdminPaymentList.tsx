import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Text, useColorModeValue, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, Button,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface PaymentItem {
  id: number; booking_status: string; paid_at: string | null;
  transaction: {
    transaction_code: string; tour_date: string; total_amount: number;
    user: { name: string } | null;
    guide: { name: string } | null;
    tour: { name: string } | null;
  } | null;
}

const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—';

const AdminPaymentList: React.FC = () => {
  const navigate  = useNavigate();
  const secondary  = useColorModeValue('gray.500', 'gray.400');
  const cardBg     = useColorModeValue('white', 'gray.800');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');

  const [bookings, setBookings] = useState<PaymentItem[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    adminApiClient.get('/admin/payments')
      .then(res => setBookings(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <Box maxW="container.xl" mx="auto">
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondary}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/admin/kyc')}>Admin</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="purple.500" fontWeight="medium">Verifikasi Pembayaran</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <Heading as="h1" size="xl" mb={2}>Verifikasi Pembayaran</Heading>
        <Text color={secondary} mb={6}>
          Daftar pesanan dengan bukti pembayaran yang perlu diverifikasi.
        </Text>

        {loading ? (
          <Flex justify="center" py={20}><Spinner size="xl" color="purple.500" /></Flex>
        ) : bookings.length === 0 ? (
          <Box bg={cardBg} p={10} borderRadius="lg" textAlign="center" boxShadow="md">
            <Text color={secondary}>Tidak ada pembayaran yang perlu diverifikasi saat ini.</Text>
          </Box>
        ) : (
          <Box bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Kode</Th>
                    <Th>Wisatawan</Th>
                    <Th>Pemandu</Th>
                    <Th>Tour</Th>
                    <Th>Tanggal Trip</Th>
                    <Th>Total</Th>
                    <Th>Bukti Dikirim</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bookings.map(b => (
                    <Tr key={b.id} _hover={{ bg: rowHoverBg }} cursor="pointer"
                      onClick={() => navigate(`/admin/payments/${b.id}`)}>
                      <Td fontSize="sm" fontFamily="mono">{b.transaction?.transaction_code}</Td>
                      <Td fontSize="sm">{b.transaction?.user?.name ?? '—'}</Td>
                      <Td fontSize="sm">{b.transaction?.guide?.name ?? '—'}</Td>
                      <Td fontSize="sm" maxW="150px" isTruncated>{b.transaction?.tour?.name ?? '—'}</Td>
                      <Td fontSize="sm">{fmtDate(b.transaction?.tour_date ?? null)}</Td>
                      <Td fontSize="sm" fontWeight="medium" color="blue.500">
                        {b.transaction?.total_amount ? fmt(b.transaction.total_amount) : '—'}
                      </Td>
                      <Td fontSize="sm">{fmtDate(b.paid_at)}</Td>
                      <Td>
                        <Button size="sm" colorScheme="purple"
                          onClick={e => { e.stopPropagation(); navigate(`/admin/payments/${b.id}`); }}>
                          Tinjau
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminPaymentList;
