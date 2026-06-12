import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Spinner,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface PendingGuide {
  id: number;
  name: string;
  email: string;
  created_at: string;
  ktp_document: string | null;
  certificate_document: string | null;
}

const AdminKycList: React.FC = () => {
  const navigate = useNavigate();
  const cardBg       = useColorModeValue('white', 'gray.800');
  const borderColor  = useColorModeValue('gray.200', 'gray.700');
  const secondaryTxt = useColorModeValue('gray.500', 'gray.400');
  const tableHover   = useColorModeValue('purple.50', 'gray.700');
  const theadBg      = useColorModeValue('gray.50', 'gray.750');

  const [guides, setGuides]   = useState<PendingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await adminApiClient.get('/admin/kyc');
        setGuides(res.data.guides);
      } catch {
        setError('Gagal memuat data. Pastikan Anda sudah login sebagai admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

  const hasKyc = (g: PendingGuide) => g.ktp_document && g.certificate_document;

  return (
    <AdminLayout>
      <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondaryTxt}>
        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/admin/kyc')}>Admin</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem isCurrentPage><BreadcrumbLink color="purple.500" fontWeight="medium">Verifikasi KYC</BreadcrumbLink></BreadcrumbItem>
      </Breadcrumb>
      {/* Header */}
      <Flex align="center" mb={2}>
        <Icon as={FiShield} color="purple.500" boxSize={7} mr={3} />
        <Heading size="lg">Antrian Verifikasi KYC</Heading>
      </Flex>
      <Text color={secondaryTxt} mb={8}>
        Daftar pemandu wisata yang menunggu persetujuan akun.
      </Text>

      {/* Stat card */}
      <Box
        bg={cardBg} borderRadius="xl" boxShadow="sm"
        border="1px solid" borderColor={borderColor}
        p={5} mb={6} display="inline-flex" alignItems="center" gap={4}
      >
        <Icon as={FiClock} color="orange.400" boxSize={6} />
        <Box>
          <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>{guides.length}</Text>
          <Text fontSize="sm" color={secondaryTxt}>Guide menunggu verifikasi</Text>
        </Box>
      </Box>

      {/* Konten */}
      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner color="purple.500" size="xl" />
        </Flex>
      ) : error ? (
        <Box
          bg="red.50" border="1px solid" borderColor="red.200"
          borderRadius="lg" p={5}
        >
          <Text color="red.600">{error}</Text>
        </Box>
      ) : guides.length === 0 ? (
        <Box
          bg={cardBg} borderRadius="xl" boxShadow="sm"
          border="1px solid" borderColor={borderColor}
          p={12} textAlign="center"
        >
          <Icon as={FiCheckCircle} color="green.400" boxSize={12} mb={4} />
          <Heading size="md" mb={2}>Antrian Kosong</Heading>
          <Text color={secondaryTxt}>Tidak ada guide yang menunggu verifikasi saat ini.</Text>
        </Box>
      ) : (
        <Box
          bg={cardBg} borderRadius="xl" boxShadow="sm"
          border="1px solid" borderColor={borderColor}
          overflow="hidden"
        >
          <Table variant="simple">
            <Thead bg={theadBg}>
              <Tr>
                <Th>Nama Guide</Th>
                <Th>Email</Th>
                <Th>Tanggal Daftar</Th>
                <Th>Dokumen KYC</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {guides.map((g) => (
                <Tr
                  key={g.id}
                  _hover={{ bg: tableHover }}
                  cursor="pointer"
                  onClick={() => navigate(`/admin/kyc/${g.id}`)}
                >
                  <Td fontWeight="semibold">{g.name}</Td>
                  <Td color={secondaryTxt} fontSize="sm">{g.email}</Td>
                  <Td fontSize="sm">{formatDate(g.created_at)}</Td>
                  <Td>
                    {hasKyc(g) ? (
                      <Badge colorScheme="green">Lengkap</Badge>
                    ) : (
                      <Badge colorScheme="orange">Belum Lengkap</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack justify="flex-end">
                      <Button
                        size="sm"
                        colorScheme="purple"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/kyc/${g.id}`);
                        }}
                      >
                        Tinjau
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </AdminLayout>
  );
};

export default AdminKycList;
