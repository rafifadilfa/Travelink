import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Link,
  Spinner,
  Flex,
  HStack,
  VStack,
  Icon,
  Avatar,
  Badge,
  Divider,
  SimpleGrid,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiFile,
  FiUser,
  FiMail,
  FiCalendar,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminApiClient } from '../services/api';

interface GuideDetail {
  id: number;
  name: string;
  email: string;
  about: string | null;
  profile_picture: string | null;
  verification_status: 'pending' | 'menunggu_verifikasi' | 'verified' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  languages: string[];
  specialities: string[];
  ktp_url: string | null;
  selfie_ktp_url: string | null;
  certificate_url: string | null;
  portfolio_url: string | null;
}

// ── Komponen preview dokumen ─────────────────────────────────
const DocPreview = ({ label, url }: { label: string; url: string | null }) => {
  const cardBg      = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!url) {
    return (
      <Box
        bg={cardBg} borderRadius="lg" border="2px dashed"
        borderColor={borderColor} p={8} textAlign="center"
      >
        <Icon as={FiFile} boxSize={8} color="gray.300" mb={3} />
        <Text fontSize="sm" color="gray.400">{label} belum diupload</Text>
      </Box>
    );
  }

  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <Box borderRadius="lg" overflow="hidden" border="1px solid" borderColor={borderColor}>
      <Box bg={cardBg} px={4} py={2} borderBottom="1px solid" borderColor={borderColor}>
        <HStack>
          <Icon as={FiFile} color="purple.400" />
          <Text fontSize="sm" fontWeight="semibold">{label}</Text>
          <Link
            href={url}
            isExternal
            ml="auto"
            fontSize="xs"
            color="purple.500"
            fontWeight="semibold"
            px={2}
            py={1}
            borderRadius="md"
            _hover={{ bg: 'purple.50', textDecoration: 'none' }}
          >
            Buka di tab baru
          </Link>
        </HStack>
      </Box>
      {isPdf ? (
        <iframe
          src={url}
          width="100%"
          height="320px"
          style={{ display: 'block', border: 'none' }}
          title={label}
        />
      ) : (
        <img
          src={url}
          alt={label}
          style={{ width: '100%', maxHeight: '320px', objectFit: 'contain', background: '#f9fafb' }}
        />
      )}
    </Box>
  );
};

// ── Halaman utama ─────────────────────────────────────────────
const AdminKycDetail: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast    = useToast();

  const cardBg       = useColorModeValue('white', 'gray.800');
  const borderColor  = useColorModeValue('gray.200', 'gray.700');
  const secondaryTxt = useColorModeValue('gray.500', 'gray.400');

  const [guide, setGuide]         = useState<GuideDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal tolak
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError]   = useState('');
  const initialFocusRef = useRef<HTMLTextAreaElement>(null);

  const apiBase = ((import.meta.env.VITE_API_URL as string) ?? '').replace('/api', '');

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await adminApiClient.get(`/admin/kyc/${id}`);
        setGuide(res.data.guide);
      } catch {
        setError('Guide tidak ditemukan atau Anda tidak punya akses.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  const handleApprove = async () => {
    if (!guide) return;
    setActionLoading(true);
    try {
      await adminApiClient.post(`/admin/kyc/${guide.id}/approve`);
      toast({
        title: 'Verifikasi berhasil',
        description: `${guide.name} sekarang bisa menggunakan akun guide-nya.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/admin/kyc');
    } catch {
      toast({ title: 'Gagal menyetujui', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Alasan penolakan wajib diisi.');
      return;
    }
    setRejectError('');
    setActionLoading(true);
    try {
      await adminApiClient.post(`/admin/kyc/${guide!.id}/reject`, {
        rejection_reason: rejectReason.trim(),
      });
      toast({
        title: 'Verifikasi ditolak',
        description: `Alasan penolakan telah disimpan untuk ${guide!.name}.`,
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      onClose();
      navigate('/admin/kyc');
    } catch {
      toast({ title: 'Gagal menolak', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

  const avatarSrc = guide?.profile_picture
    ? `${apiBase}/storage/${guide.profile_picture}`
    : undefined;

  if (loading) {
    return (
      <AdminLayout>
        <Flex justify="center" py={20}><Spinner color="purple.500" size="xl" /></Flex>
      </AdminLayout>
    );
  }

  if (error || !guide) {
    return (
      <AdminLayout>
        <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="lg" p={6}>
          <Text color="red.600">{error || 'Guide tidak ditemukan.'}</Text>
          <Button mt={4} size="sm" onClick={() => navigate('/admin/kyc')}>Kembali</Button>
        </Box>
      </AdminLayout>
    );
  }

  const hasKyc = !!(guide.ktp_url && guide.selfie_ktp_url && guide.portfolio_url);

  return (
    <AdminLayout>
      <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondaryTxt}>
        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/admin/kyc')}>Admin</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/admin/kyc')} color="purple.400">Verifikasi KYC</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem isCurrentPage><BreadcrumbLink color="purple.500" fontWeight="medium">Detail</BreadcrumbLink></BreadcrumbItem>
      </Breadcrumb>
      {/* Tombol kembali */}
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        size="sm"
        mb={6}
        onClick={() => navigate('/admin/kyc')}
      >
        Kembali ke daftar
      </Button>

      <Heading size="lg" mb={1}>Tinjau Pendaftaran Guide</Heading>
      <Text color={secondaryTxt} mb={8}>
        Periksa profil dan dokumen KYC sebelum mengambil keputusan.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* ── Kolom kiri: info profil ── */}
        <VStack spacing={6} align="stretch">
          {/* Card profil */}
          <Box
            bg={cardBg} borderRadius="xl" boxShadow="sm"
            border="1px solid" borderColor={borderColor} p={6}
          >
            <HStack spacing={4} mb={5}>
              <Avatar
                size="lg"
                src={avatarSrc}
                name={guide.name}
              />
              <Box>
                <Heading size="md">{guide.name}</Heading>
                <Badge
                  colorScheme={
                    guide.verification_status === 'verified' ? 'green'
                      : guide.verification_status === 'rejected' ? 'red'
                      : 'orange'
                  }
                  mt={1}
                >
                  {guide.verification_status === 'pending'  ? 'Menunggu Verifikasi'
                   : guide.verification_status === 'verified' ? 'Terverifikasi'
                   : 'Ditolak'}
                </Badge>
              </Box>
            </HStack>

            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FiMail} color="gray.400" flexShrink={0} />
                <Text fontSize="sm">{guide.email}</Text>
              </HStack>
              <HStack>
                <Icon as={FiCalendar} color="gray.400" flexShrink={0} />
                <Text fontSize="sm">Daftar: {formatDate(guide.created_at)}</Text>
              </HStack>
              {guide.about && (
                <HStack align="start">
                  <Icon as={FiUser} color="gray.400" flexShrink={0} mt={0.5} />
                  <Text fontSize="sm">{guide.about}</Text>
                </HStack>
              )}
            </VStack>

            {(guide.languages.length > 0 || guide.specialities.length > 0) && (
              <>
                <Divider my={4} />
                {guide.languages.length > 0 && (
                  <Box mb={3}>
                    <Text fontSize="xs" fontWeight="semibold" color={secondaryTxt} mb={2}>
                      BAHASA
                    </Text>
                    <HStack flexWrap="wrap" gap={2}>
                      {guide.languages.map((l) => (
                        <Badge key={l} colorScheme="blue" variant="subtle">{l}</Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
                {guide.specialities.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color={secondaryTxt} mb={2}>
                      SPESIALISASI
                    </Text>
                    <HStack flexWrap="wrap" gap={2}>
                      {guide.specialities.map((s) => (
                        <Badge key={s} colorScheme="teal" variant="subtle">{s}</Badge>
                      ))}
                    </HStack>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Card kelengkapan KYC */}
          <Box
            bg={cardBg} borderRadius="xl" boxShadow="sm"
            border="1px solid" borderColor={hasKyc ? 'green.200' : 'orange.200'} p={5}
          >
            <HStack mb={3}>
              <Icon
                as={hasKyc ? FiCheckCircle : FiAlertTriangle}
                color={hasKyc ? 'green.400' : 'orange.400'}
                boxSize={5}
              />
              <Text fontWeight="semibold" fontSize="sm">
                {hasKyc ? 'Dokumen KYC Lengkap' : 'Dokumen KYC Belum Lengkap'}
              </Text>
            </HStack>
            <VStack align="stretch" spacing={2}>
              {[
                { label: 'KTP', ok: !!guide.ktp_url },
                { label: 'Selfie bersama KTP', ok: !!guide.selfie_ktp_url },
                { label: 'Sertifikat Pemandu (opsional)', ok: !!guide.certificate_url },
                { label: 'Portofolio Trip', ok: !!guide.portfolio_url },
              ].map(({ label, ok }) => (
                <HStack key={label}>
                  <Icon
                    as={ok ? FiCheckCircle : FiXCircle}
                    color={ok ? 'green.400' : 'red.300'}
                    boxSize={4}
                  />
                  <Text fontSize="sm" color={ok ? 'green.700' : secondaryTxt}>{label}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Aksi */}
          <Box
            bg={cardBg} borderRadius="xl" boxShadow="sm"
            border="1px solid" borderColor={borderColor} p={5}
          >
            <Text fontSize="sm" fontWeight="semibold" mb={4}>Ambil Keputusan</Text>
            {guide.verification_status === 'menunggu_verifikasi' ? (
              <VStack spacing={3}>
                <Button
                  colorScheme="green"
                  leftIcon={<FiCheckCircle />}
                  w="full"
                  isLoading={actionLoading}
                  onClick={handleApprove}
                >
                  Setujui Verifikasi
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  leftIcon={<FiXCircle />}
                  w="full"
                  isDisabled={actionLoading}
                  onClick={onOpen}
                >
                  Tolak Verifikasi
                </Button>
              </VStack>
            ) : (
              <Box
                bg={guide.verification_status === 'verified' ? 'green.50' : 'red.50'}
                borderRadius="lg" p={4}
              >
                <Text
                  fontSize="sm"
                  color={guide.verification_status === 'verified' ? 'green.700' : 'red.700'}
                  fontWeight="semibold"
                >
                  {guide.verification_status === 'verified'
                    ? '✅ Guide ini sudah diverifikasi.'
                    : guide.verification_status === 'rejected'
                    ? '❌ Verifikasi guide ini sudah ditolak.'
                    : 'ℹ️ Pengajuan KYC belum dikirim.'}
                </Text>
                {guide.rejection_reason && (
                  <Text fontSize="sm" color="red.600" mt={2}>
                    Alasan: {guide.rejection_reason}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </VStack>

        {/* ── Kolom kanan: dokumen KYC ── */}
        <VStack spacing={6} align="stretch">
          <Box
            bg={cardBg} borderRadius="xl" boxShadow="sm"
            border="1px solid" borderColor={borderColor} p={6}
          >
            <Heading size="sm" mb={5}>Dokumen KYC</Heading>
            <VStack spacing={5} align="stretch">
              <DocPreview label="Kartu Tanda Penduduk (KTP)" url={guide.ktp_url} />
              <DocPreview label="Selfie bersama KTP" url={guide.selfie_ktp_url} />
              <DocPreview label="Sertifikat Pemandu Wisata (opsional)" url={guide.certificate_url} />
              <DocPreview label="Portofolio Trip" url={guide.portfolio_url} />
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>

      {/* ── Modal penolakan ── */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialFocusRef}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tolak Verifikasi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={secondaryTxt} mb={4}>
              Berikan alasan penolakan. Alasan ini akan disimpan dan bisa dilihat
              oleh guide di halaman dashboard mereka.
            </Text>
            <Textarea
              ref={initialFocusRef}
              placeholder="Contoh: Foto KTP buram dan tidak terbaca, harap upload ulang dengan kualitas yang lebih baik."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError('');
              }}
              rows={4}
              maxLength={500}
            />
            {rejectError && (
              <Text color="red.500" fontSize="sm" mt={2}>{rejectError}</Text>
            )}
            <Text fontSize="xs" color={secondaryTxt} mt={1} textAlign="right">
              {rejectReason.length}/500
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={actionLoading}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              isLoading={actionLoading}
              onClick={handleReject}
            >
              Tolak Verifikasi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default AdminKycDetail;
