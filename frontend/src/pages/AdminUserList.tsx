import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { SearchIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface AppUser {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
}

const AdminUserList: React.FC = () => {
  const navigate   = useNavigate();
  const toast      = useToast();
  const [users, setUsers]     = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const cardBg  = useColorModeValue('white', 'gray.800');
  const borderC = useColorModeValue('gray.200', 'gray.700');
  const subC    = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    adminApiClient.get('/admin/users')
      .then(res => setUsers(res.data.users ?? []))
      .catch(() => toast({ title: 'Gagal memuat daftar pengguna', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AdminLayout>
      <Box maxW="container.xl" mx="auto">
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={4} fontSize="sm">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/admin/kyc')} color={subC}>Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="purple.500" fontWeight="medium">Pengguna</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg">Daftar Pengguna</Heading>
            <Text color={subC} fontSize="sm" mt={1}>
              Semua wisatawan yang terdaftar di Travelink
            </Text>
          </Box>
          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
            {users.length} pengguna
          </Badge>
        </Flex>

        <InputGroup mb={5} maxW="360px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            borderRadius="lg"
          />
        </InputGroup>

        <Box bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderC} overflow="hidden" boxShadow="sm">
          {loading ? (
            <Flex justify="center" py={16}><Spinner color="purple.400" size="lg" /></Flex>
          ) : filtered.length === 0 ? (
            <Text textAlign="center" py={12} color={subC}>
              {search ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna terdaftar.'}
            </Text>
          ) : (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Tr>
                    <Th>#</Th>
                    <Th>Nama</Th>
                    <Th>Email</Th>
                    <Th>No. Telepon</Th>
                    <Th>Tanggal Daftar</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((u, idx) => (
                    <Tr key={u.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td color={subC} fontSize="xs">{idx + 1}</Td>
                      <Td fontWeight="medium">{u.name}</Td>
                      <Td color={subC} fontSize="sm">{u.email}</Td>
                      <Td color={subC} fontSize="sm">{u.phone_number ?? '—'}</Td>
                      <Td color={subC} fontSize="sm">{fmtDate(u.created_at)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AdminUserList;
