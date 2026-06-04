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
  Icon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface GuideRow {
  id: number;
  name: string;
  email: string;
  verification_status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; colorScheme: string; icon: React.ElementType }> = {
  pending:             { label: 'Belum Verifikasi', colorScheme: 'gray',   icon: FiClock       },
  menunggu_verifikasi: { label: 'Menunggu Review',  colorScheme: 'orange', icon: FiClock       },
  verified:            { label: 'Aktif',            colorScheme: 'green',  icon: FiCheckCircle },
  rejected:            { label: 'Ditolak',          colorScheme: 'red',    icon: FiXCircle     },
};

const AdminGuideList: React.FC = () => {
  const navigate = useNavigate();
  const cardBg       = useColorModeValue('white', 'gray.800');
  const borderColor  = useColorModeValue('gray.200', 'gray.700');
  const secondaryTxt = useColorModeValue('gray.500', 'gray.400');
  const tableHover   = useColorModeValue('purple.50', 'gray.700');
  // Dipindah ke sini (top-level) agar tidak melanggar Rules of Hooks
  const theadBg      = useColorModeValue('gray.50', 'gray.750');

  const [guides, setGuides]   = useState<GuideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await adminApiClient.get('/admin/guides');
        setGuides(res.data.guides);
      } catch {
        setError('Gagal memuat data. Pastikan Anda sudah login sebagai admin.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

  // Hitung ringkasan per status
  const counts: Record<string, number> = guides.reduce(
    (acc: Record<string, number>, g) => {
      acc[g.verification_status] = (acc[g.verification_status] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <AdminLayout>
      {/* Header */}
      <Flex align="center" mb={2}>
        <Icon as={FiUsers} color="purple.500" boxSize={7} mr={3} />
        <Heading size="lg">Semua Pemandu Wisata</Heading>
      </Flex>
      <Text color={secondaryTxt} mb={8}>
        Daftar seluruh guide yang terdaftar di platform Travelink.
      </Text>

      {/* Stat cards */}
      <HStack spacing={4} mb={6} flexWrap="wrap">
        {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig[keyof typeof statusConfig]][]).map(
          ([status, cfg]) => (
            <Box
              key={status}
              bg={cardBg} borderRadius="xl" boxShadow="sm"
              border="1px solid" borderColor={borderColor}
              p={4} display="flex" alignItems="center" gap={3}
              minW="140px"
            >
              <Icon as={cfg.icon} color={`${cfg.colorScheme}.400`} boxSize={5} />
              <Box>
                <Text fontSize="xl" fontWeight="bold" lineHeight={1}>{counts[status] ?? 0}</Text>
                <Text fontSize="xs" color={secondaryTxt}>{cfg.label}</Text>
              </Box>
            </Box>
          )
        )}
      </HStack>

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
          <Icon as={FiUsers} color="gray.300" boxSize={12} mb={4} />
          <Heading size="md" mb={2}>Belum Ada Guide</Heading>
          <Text color={secondaryTxt}>Belum ada pemandu wisata yang mendaftar.</Text>
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
                <Th>Status Verifikasi</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {guides.map((g) => {
                const cfg = statusConfig[g.verification_status];
                return (
                  <Tr
                    key={g.id}
                    _hover={{ bg: tableHover }}
                    cursor={g.verification_status === 'pending' ? 'pointer' : 'default'}
                    onClick={() => {
                      if (g.verification_status === 'pending') {
                        navigate(`/admin/kyc/${g.id}`);
                      }
                    }}
                  >
                    <Td fontWeight="semibold">{g.name}</Td>
                    <Td color={secondaryTxt} fontSize="sm">{g.email}</Td>
                    <Td fontSize="sm">{formatDate(g.created_at)}</Td>
                    <Td>
                      <Badge
                        colorScheme={cfg.colorScheme}
                        display="inline-flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Icon as={cfg.icon} boxSize={3} />
                        {cfg.label}
                      </Badge>
                    </Td>
                    <Td>
                      {g.verification_status === 'pending' && (
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
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </AdminLayout>
  );
};

export default AdminGuideList;
