import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Heading, Text, useColorModeValue, Spinner,
  Table, Thead, Tbody, Tr, Th, Td, Button, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, FormControl, FormLabel, Textarea, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface Withdrawal {
  id: number; amount: number; bank_name: string;
  bank_account_number: string; bank_account_holder: string;
  status: string; created_at: string;
  guide: { id: number; name: string; email: string; available_balance: number } | null;
}

const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { dateStyle: 'medium' });

const AdminWithdrawalList: React.FC = () => {
  const navigate   = useNavigate();
  const toast      = useToast();
  const secondary  = useColorModeValue('gray.500', 'gray.400');
  const cardBg     = useColorModeValue('white', 'gray.800');
  const cancelRef  = useRef<HTMLButtonElement>(null);

  const [withdrawals,  setWithdrawals]  = useState<Withdrawal[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [processId,    setProcessId]    = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectId,     setRejectId]     = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting,  setIsRejecting]  = useState(false);

  const fetchData = () => {
    setLoading(true);
    adminApiClient.get('/admin/withdrawals')
      .then(res => setWithdrawals(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleProcess = async () => {
    if (!processId) return;
    setIsProcessing(true);
    try {
      await adminApiClient.post(`/admin/withdrawals/${processId}/process`);
      toast({ title: 'Pencairan berhasil diproses!', status: 'success', duration: 4000, isClosable: true });
      setProcessId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Gagal memproses', description: err.response?.data?.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      await adminApiClient.post(`/admin/withdrawals/${rejectId}/reject`, { rejection_reason: rejectReason });
      toast({ title: 'Pencairan ditolak.', status: 'info', duration: 3000, isClosable: true });
      setRejectId(null); setRejectReason('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Gagal menolak', description: err.response?.data?.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <AdminLayout>
      <Box maxW="container.xl" mx="auto">
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondary}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/admin/kyc')}>Admin</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="purple.500" fontWeight="medium">Pencairan Dana</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <Heading as="h1" size="xl" mb={2}>Verifikasi Pencairan Dana</Heading>
        <Text color={secondary} mb={6}>Daftar permintaan pencairan yang perlu diproses.</Text>

        {loading ? (
          <Flex justify="center" py={20}><Spinner size="xl" color="purple.500" /></Flex>
        ) : withdrawals.length === 0 ? (
          <Box bg={cardBg} p={10} borderRadius="lg" textAlign="center" boxShadow="md">
            <Text color={secondary}>Tidak ada permintaan pencairan yang perlu diproses.</Text>
          </Box>
        ) : (
          <Box bg={cardBg} borderRadius="lg" boxShadow="md" overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Pemandu</Th>
                    <Th>Jumlah</Th>
                    <Th>Rekening Bank</Th>
                    <Th>Saldo Available</Th>
                    <Th>Diajukan</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {withdrawals.map(w => (
                    <Tr key={w.id}>
                      <Td>
                        <Text fontWeight="medium">{w.guide?.name ?? '—'}</Text>
                        <Text fontSize="xs" color={secondary}>{w.guide?.email}</Text>
                      </Td>
                      <Td fontWeight="bold" color="blue.500">{fmt(w.amount)}</Td>
                      <Td fontSize="sm">
                        <Text>{w.bank_name}</Text>
                        <Text color={secondary}>{w.bank_account_number}</Text>
                        <Text color={secondary}>a/n {w.bank_account_holder}</Text>
                      </Td>
                      <Td fontSize="sm" color={w.guide && w.guide.available_balance >= w.amount ? 'green.500' : 'red.500'}>
                        {w.guide ? fmt(w.guide.available_balance) : '—'}
                      </Td>
                      <Td fontSize="sm">{fmtDate(w.created_at)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button size="sm" colorScheme="green" onClick={() => setProcessId(w.id)}>
                            Proses
                          </Button>
                          <Button size="sm" variant="outline" colorScheme="red"
                            onClick={() => { setRejectId(w.id); setRejectReason(''); }}>
                            Tolak
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>

      {/* Konfirmasi Proses */}
      <AlertDialog isOpen={!!processId} leastDestructiveRef={cancelRef as any}
        onClose={() => setProcessId(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Proses Pencairan</AlertDialogHeader>
            <AlertDialogBody>
              Pastikan Anda sudah melakukan transfer manual ke rekening pemandu sebelum mengklik "Proses".
              Tindakan ini akan mengurangi saldo pemandu.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setProcessId(null)}>Batal</Button>
              <Button colorScheme="green" isLoading={isProcessing} onClick={handleProcess} ml={3}>
                Konfirmasi Proses
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal Tolak */}
      <Modal isOpen={!!rejectId} onClose={() => setRejectId(null)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tolak Permintaan Pencairan</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Alasan Penolakan</FormLabel>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                placeholder="cth: Data rekening tidak valid, silakan perbarui rekening Anda" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setRejectId(null)}>Batal</Button>
            <Button colorScheme="red" isLoading={isRejecting}
              isDisabled={!rejectReason.trim()} onClick={handleRejectSubmit}>
              Tolak Pencairan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default AdminWithdrawalList;
