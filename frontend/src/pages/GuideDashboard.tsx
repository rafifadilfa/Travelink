import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Badge,
  Button,
  Divider,
  Spinner,
  SimpleGrid,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import {
  FiBriefcase,
  FiCalendar,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiAlertCircle,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

// ── Tipe ──────────────────────────────────────────────────────────────────
interface GuideData {
  id: number;
  name: string;
  email: string;
  verification_status: 'pending' | 'verified' | 'rejected';
}

interface Completeness {
  profile_picture: boolean;
  about: boolean;
  languages: boolean;
  specialities: boolean;
  experience_years: boolean;
  base_rate: boolean;
  ktp_document: boolean;
  selfie_ktp_document: boolean;
  certificate_document: boolean;
  portfolio_document: boolean;
}

// ── ActionCard untuk dashboard verified ───────────────────────────────────
const ActionCard = ({
  title, description, icon, path,
}: { title: string; description: string; icon: IconType; path: string }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex
      p={6} bg={bg} borderRadius="lg" boxShadow="md"
      border="1px solid" borderColor={borderColor} align="center"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', borderColor: 'blue.400' }}
      cursor="pointer" onClick={() => navigate(path)}
    >
      <Icon as={icon} w={10} h={10} color="blue.400" mr={5} flexShrink={0} />
      <Box>
        <Heading size="md">{title}</Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')} mt={1} fontSize="sm">{description}</Text>
      </Box>
      <Icon as={FiArrowRight} w={6} h={6} color="gray.400" ml="auto" flexShrink={0} />
    </Flex>
  );
};

// ── Komponen satu langkah verifikasi ─────────────────────────────────────
interface StepProps {
  step: number;
  label: string;
  description: string;
  status: 'done' | 'current' | 'waiting';
}

const VerificationStep = ({ step, label, description, status }: StepProps) => {
  const isDone    = status === 'done';
  const isCurrent = status === 'current';
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const descColor  = useColorModeValue('gray.500', 'gray.400');

  const iconEl = isDone
    ? <Icon as={FiCheckCircle} color="green.400" boxSize={6} />
    : isCurrent
      ? <Icon as={FiClock} color="blue.400" boxSize={6} />
      : <Icon as={FiAlertCircle} color="gray.300" boxSize={6} />;

  return (
    <HStack align="start" spacing={4} opacity={status === 'waiting' ? 0.45 : 1}>
      <Box flexShrink={0} mt={0.5}>{iconEl}</Box>
      <Box>
        <HStack spacing={2} flexWrap="wrap">
          <Text fontWeight="bold" fontSize="sm" color={labelColor}>
            Langkah {step}: {label}
          </Text>
          {isDone    && <Badge colorScheme="green" fontSize="xs">Selesai</Badge>}
          {isCurrent && <Badge colorScheme="blue"  fontSize="xs">Dalam Proses</Badge>}
        </HStack>
        <Text fontSize="sm" color={descColor} mt={0.5}>{description}</Text>
      </Box>
    </HStack>
  );
};

// ── Halaman utama ─────────────────────────────────────────────────────────
const GuideDashboard: React.FC = () => {
  const navigate = useNavigate();
  const secondaryText    = useColorModeValue('gray.500', 'gray.400');
  const cardBg           = useColorModeValue('white', 'gray.800');
  const pendingBorderColor = useColorModeValue('blue.200', 'blue.600');

  // Baca data guide dari localStorage (disimpan saat login)
  const guideRaw = localStorage.getItem('guide');
  const guide: GuideData | null = guideRaw ? JSON.parse(guideRaw) : null;

  const firstName  = guide?.name?.split(' ')[0] ?? 'Guide';
  const isPending  = guide?.verification_status === 'pending';
  const isRejected = guide?.verification_status === 'rejected';

  // State untuk kelengkapan profil — hanya di-fetch kalau guide masih pending/rejected
  const [completeness, setCompleteness] = useState<Completeness | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(isPending || isRejected);

  useEffect(() => {
    if (!isPending && !isRejected) return; // guide verified tidak perlu fetch ini

    const fetchCompleteness = async () => {
      try {
        const res = await guideApiClient.get('/guide/profile');
        const g = res.data.guide;
        setCompleteness(g.completeness);
        setIsProfileComplete(g.is_profile_complete);
      } catch {
        // Kalau gagal fetch, tetap tampilkan UI dengan step 2 "current"
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchCompleteness();
  }, [isPending, isRejected]);

  // ── Hitung status tiap langkah secara dinamis ──────────────────────────
  //
  // Step 1 — Daftar Akun         : selalu 'done' (guide sudah login)
  // Step 2 — Lengkapi Profil     : 'done' kalau is_profile_complete, else 'current'
  // Step 3 — Menunggu Admin      : 'current' kalau profil sudah lengkap (& masih pending)
  //                                'waiting' kalau profil belum lengkap
  // Step 4 — Akun Aktif          : selalu 'waiting' (hanya berubah kalau admin approve)

  const step2Status = isProfileComplete ? 'done'    : 'current';
  const step3Status = isProfileComplete ? 'current' : 'waiting';

  // ── Tampilan guide PENDING atau REJECTED ──────────────────────────────
  if (isPending || isRejected) {
    return (
      <GuideLayout>
        <Box maxW="2xl">
          <Heading as="h1" size="xl" mb={1}>Halo, {firstName}!</Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color={secondaryText} mb={8}>
            {isPending
              ? 'Akun Anda sedang dalam proses verifikasi.'
              : 'Verifikasi akun Anda membutuhkan tindakan lebih lanjut.'}
          </Text>

          {/* Card status verifikasi */}
          <Box
            bg={cardBg} borderRadius="xl" boxShadow="md"
            border="1px solid" borderColor={pendingBorderColor}
            p={{ base: 5, md: 8 }}
          >
            <HStack spacing={3} mb={2}>
              <Icon
                as={FiClock}
                color={isRejected ? 'orange.400' : isProfileComplete ? 'blue.400' : 'yellow.500'}
                boxSize={6}
              />
              <Heading size="md">
                {isRejected
                  ? 'Verifikasi Memerlukan Perhatian'
                  : loadingProfile
                    ? 'Memuat status akun...'
                    : isProfileComplete
                      ? 'Menunggu Verifikasi Admin'
                      : 'Lengkapi Profil Anda'}
              </Heading>
            </HStack>
            <Text color={secondaryText} mb={6} fontSize="sm">
              {isRejected
                ? 'Verifikasi akun Anda ditolak. Silakan hubungi admin atau lengkapi profil Anda dan ajukan ulang.'
                : loadingProfile
                  ? ''
                  : isProfileComplete
                    ? 'Admin sedang meninjau akun Anda. Proses ini biasanya memakan waktu 1–3 hari kerja. Anda dapat mengelola dan menjual paket tour setelah akun diverifikasi.'
                    : 'Harap lengkapi profil Anda terlebih dahulu untuk mendapatkan akses penuh aplikasi.'}
            </Text>

            <Divider mb={6} />

            {/* Langkah-langkah */}
            {loadingProfile ? (
              <Flex justify="center" py={4}>
                <Spinner color="blue.400" />
              </Flex>
            ) : (
              <VStack align="stretch" spacing={5}>
                <VerificationStep
                  step={1} label="Daftar Akun" status="done"
                  description="Akun pemandu wisata Anda berhasil dibuat."
                />
                <VerificationStep
                  step={2} label="Lengkapi Profil" status={step2Status}
                  description={
                    step2Status === 'done'
                      ? 'Profil Anda sudah lengkap — foto, tentang saya, bahasa, spesialisasi, dan dokumen KYC terpenuhi.'
                      : 'Isi foto profil, tentang saya, bahasa, spesialisasi, dan upload dokumen KYC (KTP + sertifikat).'
                  }
                />
                <VerificationStep
                  step={3} label="Menunggu Persetujuan Admin" status={step3Status}
                  description="Admin Travelink akan meninjau profil dan dokumen kelayakan Anda sebagai pemandu wisata."
                />
                <VerificationStep
                  step={4} label="Akun Aktif & Mulai Berjualan" status="waiting"
                  description="Setelah diverifikasi, Anda dapat membuat paket tour dan menerima booking dari wisatawan."
                />
              </VStack>
            )}

            {/* Detail kriteria yang belum terpenuhi */}
            {!isProfileComplete && completeness && (
              <>
                <Divider my={5} />
                <Text fontSize="sm" fontWeight="semibold" mb={3} color={secondaryText}>
                  Kriteria yang belum terpenuhi:
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                  {[
                    { key: 'profile_picture',      label: 'Foto profil' },
                    { key: 'about',                label: 'Tentang saya' },
                    { key: 'languages',            label: 'Minimal 1 bahasa' },
                    { key: 'specialities',         label: 'Minimal 1 spesialisasi' },
                    { key: 'experience_years',     label: 'Tahun Pengalaman' },
                    { key: 'base_rate',            label: 'Tarif Dasar (Rp)' },
                    { key: 'ktp_document',         label: 'Dokumen KTP' },
                    { key: 'selfie_ktp_document',  label: 'Selfie bersama KTP' },
                    { key: 'portfolio_document',   label: 'Portofolio Trip' },
                  ].map(({ key, label }) => {
                    const done = completeness[key as keyof Completeness];
                    return (
                      <HStack key={key} spacing={2}>
                        <Icon
                          as={done ? FiCheckCircle : FiAlertCircle}
                          color={done ? 'green.400' : 'orange.400'}
                          boxSize={4}
                        />
                        <Text fontSize="sm" color={done ? 'green.600' : secondaryText}
                          textDecoration={done ? 'line-through' : 'none'}
                        >
                          {label}
                        </Text>
                      </HStack>
                    );
                  })}
                </SimpleGrid>
              </>
            )}

            <Divider my={6} />

            <Button
              colorScheme="blue" leftIcon={<FiUser />}
              onClick={() => navigate('/guide/profile')}
              size="lg" w="full"
            >
              {isProfileComplete ? 'Lihat Profil Saya' : 'Lengkapi Profil Saya'}
            </Button>
          </Box>
        </Box>
      </GuideLayout>
    );
  }

  // ── Tampilan dashboard normal untuk guide VERIFIED ────────────────────
  return (
    <GuideLayout>
      <Heading as="h1" size="xl" mb={2}>Selamat datang, {firstName}!</Heading>
      <Text fontSize={{ base: 'md', md: 'lg' }} color={secondaryText} mb={10}>
        Ini adalah pusat kendali Anda untuk mengelola tour dan booking.
      </Text>

      <VStack spacing={6} align="stretch">
        <ActionCard
          title="Kelola Paket Tour"
          description="Buat tour baru, edit listing yang ada, dan atur ketersediaan Anda."
          icon={FiBriefcase}
          path="/guide/tours"
        />
        <ActionCard
          title="Lihat Booking"
          description="Lihat siapa saja yang telah booking tour Anda dan kelola jadwal mendatang."
          icon={FiCalendar}
          path="/guide/bookings"
        />
      </VStack>
    </GuideLayout>
  );
};

export default GuideDashboard;
