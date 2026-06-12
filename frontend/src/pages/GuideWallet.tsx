import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, VStack, HStack,
  Button, SimpleGrid,
  Spinner, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, FormControl, FormLabel, Input,
  Alert, AlertIcon, useToast,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react';
import { FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface WalletInfo {
  pending_balance: number; available_balance: number;
  total_income: number; can_withdraw: boolean;
}
interface WalletTx {
  id: number; type: string; direction: string; amount: number;
  description: string; created_at: string;
}

const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtDate = (d: string) => new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

const GuideWallet: React.FC = () => {
  const navigate  = useNavigate();
  const toast     = useToast();
  const secondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const border    = useColorModeValue('gray.200', 'gray.700');

  const guideRaw   = localStorage.getItem('guide');
  const guide      = guideRaw ? JSON.parse(guideRaw) : null;
  const isVerified = guide?.verification_status === 'verified';

  useEffect(() => {
    if (!isVerified) navigate('/guide/dashboard');
  }, []);

  const [wallet,  setWallet]   = useState<WalletInfo | null>(null);
  const [txList,  setTxList]   = useState<WalletTx[]>([]);
  const [loading, setLoading]  = useState(true);

  // State modal pencairan
  const [showModal,    setShowModal]    = useState(false);
  const [amount,       setAmount]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWallet = () => {
    setLoading(true);
    guideApiClient.get('/guide/wallet')
      .then(res => {
        setWallet(res.data.wallet);
        setTxList(res.data.data);
      })
      .catch(() => toast({ title: 'Gagal memuat data keuangan', status: 'error', duration: 4000, isClosable: true }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    setIsSubmitting(true);
    try {
      await guideApiClient.post('/guide/withdrawals', { amount: numAmount });
      toast({
        title: 'Permintaan pencairan berhasil diajukan.',
        description: 'Admin akan memproses dalam 1-3 hari kerja.',
        status: 'success', duration: 5000, isClosable: true,
      });
      setShowModal(false);
      setAmount('');
      fetchWallet();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Gagal mengajukan pencairan.';
      toast({ title: 'Gagal', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVerified) {
    return <Flex justify="center" align="center" h="60vh"><Spinner size="xl" color="blue.400" /></Flex>;
  }

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondary}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/guide/dashboard')}>Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="blue.500" fontWeight="medium">Dompet</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <Heading as="h1" size="xl" mb={2}>Dashboard Keuangan</Heading>
        <Text color={secondary} mb={6}>Pantau saldo dan riwayat transaksi Anda.</Text>

        {loading ? (
          <Flex justify="center" py={20}><Spinner size="xl" color="blue.400" /></Flex>
        ) : (
          <>
            {/* Kartu saldo */}
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={6} mb={8}>
              <Box bg="blue.500" p={6} borderRadius="xl" color="white" boxShadow="lg">
                <Text fontSize="sm" opacity={0.8}>Saldo Tersedia</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {fmt(wallet?.available_balance ?? 0)}
                </Text>
                <Text fontSize="xs" opacity={0.7} mt={1}>Siap untuk dicairkan</Text>
              </Box>
              <Box bg="orange.400" p={6} borderRadius="xl" color="white" boxShadow="lg">
                <Text fontSize="sm" opacity={0.8}>Saldo Pending</Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {fmt(wallet?.pending_balance ?? 0)}
                </Text>
                <Text fontSize="xs" opacity={0.7} mt={1}>Trip belum selesai</Text>
              </Box>
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="md" border="1px solid" borderColor={border}>
                <Text fontSize="sm" color={secondary}>Total Penghasilan</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500" mt={1}>
                  {fmt(wallet?.total_income ?? 0)}
                </Text>
                <Text fontSize="xs" color={secondary} mt={1}>Sejak bergabung</Text>
              </Box>
            </SimpleGrid>

            {/* Tombol cairkan */}
            <Flex justify="flex-end" mb={6}>
              {wallet?.can_withdraw ? (
                <Button
                  colorScheme="blue" leftIcon={<FiArrowDownCircle />}
                  onClick={() => { setAmount(''); setShowModal(true); }}
                >
                  Ajukan Pencairan
                </Button>
              ) : (
                <Button isDisabled colorScheme="blue" leftIcon={<FiArrowDownCircle />}
                  title="Saldo tidak mencukupi untuk pencairan">
                  Ajukan Pencairan
                </Button>
              )}
            </Flex>
            {!wallet?.can_withdraw && (
              <Alert status="info" borderRadius="lg" mb={6}>
                <AlertIcon />
                Saldo tidak mencukupi untuk pencairan. Selesaikan lebih banyak trip untuk menambah saldo.
              </Alert>
            )}

            {/* Riwayat transaksi */}
            <Heading size="md" mb={4}>Riwayat Transaksi</Heading>
            {txList.length === 0 ? (
              <Text textAlign="center" py={10} color={secondary}>Belum ada transaksi.</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {txList.map(tx => (
                  <Flex key={tx.id} bg={cardBg} p={4} borderRadius="lg"
                    border="1px solid" borderColor={border} justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Box color={tx.direction === 'credit' ? 'green.400' : 'red.400'} fontSize="xl">
                        {tx.direction === 'credit' ? <FiArrowUpCircle /> : <FiArrowDownCircle />}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">{tx.description}</Text>
                        <Text fontSize="xs" color={secondary}>{fmtDate(tx.created_at)}</Text>
                      </VStack>
                    </HStack>
                    <Text
                      fontWeight="bold"
                      color={tx.direction === 'credit' ? 'green.500' : 'red.500'}
                    >
                      {tx.direction === 'credit' ? '+' : '−'} {fmt(tx.amount)}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            )}
          </>
        )}
      </Box>

      {/* Modal pencairan */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ajukan Pencairan Dana</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color={secondary} mb={4}>
              Saldo tersedia: <Text as="span" fontWeight="bold" color="blue.500">
                {fmt(wallet?.available_balance ?? 0)}
              </Text>
            </Text>
            <FormControl isRequired>
              <FormLabel>Jumlah Pencairan (Rp)</FormLabel>
              <Input
                type="number" value={amount} min={1}
                max={wallet?.available_balance ?? 0}
                onChange={e => setAmount(e.target.value)}
                placeholder="cth: 1000000"
              />
            </FormControl>
            <Alert status="info" mt={4} borderRadius="md" fontSize="sm">
              <AlertIcon />
              Dana akan ditransfer ke rekening bank yang terdaftar di profil Anda.
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setShowModal(false)}>Batal</Button>
            <Button
              colorScheme="blue" isLoading={isSubmitting}
              isDisabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (wallet?.available_balance ?? 0)}
              onClick={handleWithdraw}
            >
              Ajukan Pencairan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </GuideLayout>
  );
};

export default GuideWallet;
