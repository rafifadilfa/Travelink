import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Heading, useColorModeValue, VStack, HStack, Stack,
  Button, Link, FormControl, FormLabel, Input, Textarea, Avatar,
  Icon, Tag, TagLabel, TagCloseButton, InputGroup, InputRightElement,
  Divider, Text, Badge, Spinner, useToast, Alert, AlertIcon,
  Tabs, TabList, TabPanels, Tab, TabPanel, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Progress,
  Box,
  Flex,
  Heading,
  useColorModeValue,
  VStack,
  HStack,
  Stack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputRightElement,
  Divider,
  Text,
  Badge,
  Spinner,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiSave,
  FiUser,
  FiGlobe,
  FiAward,
  FiPlus,
  FiShield,
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

// ── Tipe data profil dari API ──────────────────────────────────────────────
interface GuideProfile {
  id: number;
  name: string;
  email: string;
  about: string | null;
  profile_picture: string | null;
  ktp_document: string | null;
  certificate_document: string | null;
  ktp_url: string | null;
  certificate_url: string | null;
  verification_status: string;
  languages: string[];
  specialities: string[];
  completeness: {
    profile_picture: boolean;
    about: boolean;
    languages: boolean;
    specialities: boolean;
    ktp_document: boolean;
    certificate_document: boolean;
  };
  is_profile_complete: boolean;
}

// ── Komponen badge status dokumen ────────────────────────────────────────────
const DocStatus = ({ uploaded, url, label }: { uploaded: boolean; url: string | null; label?: string }) => (
  <HStack spacing={2}>
    <Icon as={uploaded ? FiCheckCircle : FiAlertCircle} color={uploaded ? 'green.500' : 'orange.400'} />
    <Text fontSize="sm" color={uploaded ? 'green.600' : 'orange.500'} fontWeight="medium">
      {uploaded ? 'Sudah diupload' : (label ?? 'Belum diupload')}
    </Text>
    {uploaded && url && (
      <Link href={url} isExternal fontSize="sm" color="blue.500" textDecoration="underline">
        Lihat file
      </Link>
    )}
  </HStack>
);

// ── Komponen card upload dokumen ─────────────────────────────────────────────
const UploadCard = ({
  title, badge, uploaded, url, file, inputRef,
  onFileChange, onUpload, isUploading, optional = false,
}: {
  title: string; badge: string; uploaded: boolean; url: string | null;
  file: File | null; inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (f: File | null) => void;
  onUpload: () => void; isUploading: boolean; optional?: boolean;
}) => {
  const cardBorder = uploaded ? 'green.300' : optional ? 'gray.300' : 'orange.300';
  const cardBg = useColorModeValue(
    uploaded ? 'green.50' : optional ? 'gray.50' : 'orange.50',
    uploaded ? 'green.900' : optional ? 'gray.700' : 'orange.900'
  );
// ── Komponen badge status dokumen ─────────────────────────────────────────
const DocStatus = ({ uploaded, url }: { uploaded: boolean; url: string | null }) => {
  if (uploaded && url) {
    return (
      <HStack spacing={2}>
        <Icon as={FiCheckCircle} color="green.500" />
        <Text fontSize="sm" color="green.600" fontWeight="medium">Sudah diupload</Text>
        <Text
          as="a" href={url} target="_blank" rel="noopener noreferrer"
          fontSize="sm" color="blue.500" textDecoration="underline"
        >
          Lihat file
        </Text>
      </HStack>
    );
  }
  return (
    <HStack spacing={2}>
      <Icon as={FiAlertCircle} color="orange.400" />
      <Text fontSize="sm" color="orange.500" fontWeight="medium">Belum diupload</Text>
    </HStack>
  );
};

// ── Komponen utama ──────────────────────────────────────────────────────────
const GuideEditProfile: React.FC = () => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const secondaryText = useColorModeValue('gray.500', 'gray.400');

  // State profil
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State form (diisi setelah profil dimuat dari API)
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [newSpeciality, setNewSpeciality] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // State upload KYC
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  // Ref untuk input file (hidden)
  const ktpInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Muat profil dari API saat mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await guideApiClient.get('/guide/profile');
        const g: GuideProfile = res.data.guide;
        setProfile(g);
        setName(g.name ?? '');
        setAbout(g.about ?? '');
        setLanguages(g.languages ?? []);
        setSpecialities(g.specialities ?? []);
      } catch {
        toast({
          title: 'Gagal memuat profil',
          description: 'Silakan refresh halaman dan coba lagi.',
          status: 'error', duration: 4000, isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Tambah / hapus bahasa
  const addLanguage = () => {
    const val = newLanguage.trim();
    if (val && !languages.includes(val)) {
      setLanguages([...languages, val]);
      setNewLanguage('');
    }
  };

  // Tambah / hapus spesialisasi
  const addSpeciality = () => {
    const val = newSpeciality.trim();
    if (val && !specialities.includes(val)) {
      setSpecialities([...specialities, val]);
      setNewSpeciality('');
    }
  };

  // Preview foto sebelum upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Simpan perubahan profil utama
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('about', about);
      if (photoFile) formData.append('profile_picture', photoFile);
      languages.forEach(l => formData.append('languages[]', l));
      specialities.forEach(s => formData.append('specialities[]', s));

      const res = await guideApiClient.post('/guide/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated: GuideProfile = res.data.guide;
      setProfile(updated);
      setName(updated.name ?? '');
      setAbout(updated.about ?? '');
      setLanguages(updated.languages ?? []);
      setSpecialities(updated.specialities ?? []);
      setPhotoFile(null);
      setPhotoPreview(null);

      // Perbarui localStorage supaya GuideDashboard ikut update
      const stored = localStorage.getItem('guide');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('guide', JSON.stringify({ ...parsed, name: updated.name }));
      }

      toast({
        title: 'Profil berhasil disimpan!',
        status: 'success', duration: 3000, isClosable: true, position: 'top',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Gagal menyimpan. Coba lagi.';
      toast({ title: 'Gagal menyimpan', description: msg, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Upload KTP
  const handleKtpUpload = async () => {
    if (!ktpFile) return;
    setIsUploadingKtp(true);
    try {
      const formData = new FormData();
      formData.append('ktp_document', ktpFile);
      const res = await guideApiClient.post('/guide/profile/ktp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => prev ? {
        ...prev,
        ktp_document: 'uploaded',
        ktp_url: res.data.ktp_url,
        completeness: { ...prev.completeness, ktp_document: true },
        is_profile_complete: Object.values({ ...prev.completeness, ktp_document: true }).every(Boolean),
      } : prev);
      setKtpFile(null);
      if (ktpInputRef.current) ktpInputRef.current.value = '';
      toast({ title: 'KTP berhasil diupload!', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Gagal upload KTP', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsUploadingKtp(false);
    }
  };

  // Upload sertifikat
  const handleCertUpload = async () => {
    if (!certFile) return;
    setIsUploadingCert(true);
    try {
      const formData = new FormData();
      formData.append('certificate_document', certFile);
      const res = await guideApiClient.post('/guide/profile/certificate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => prev ? {
        ...prev,
        certificate_document: 'uploaded',
        certificate_url: res.data.certificate_url,
        completeness: { ...prev.completeness, certificate_document: true },
        is_profile_complete: Object.values({ ...prev.completeness, certificate_document: true }).every(Boolean),
      } : prev);
      setCertFile(null);
      if (certInputRef.current) certInputRef.current.value = '';
      toast({ title: 'Sertifikat berhasil diupload!', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Gagal upload sertifikat', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsUploadingCert(false);
    }
  };

  if (isLoading) {
    return (
      <GuideLayout>
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="xl" color="blue.400" />
        </Flex>
      </GuideLayout>
    );
  }

  // Hitung progress kelengkapan profil
  const completeness = profile?.completeness;
  const completedCount = completeness ? Object.values(completeness).filter(Boolean).length : 0;
  const totalCount = 6;

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Heading as="h1" size="xl" mb={2}>Kelola Profil</Heading>
        <Text color={secondaryText} mb={6}>
          Lengkapi semua data di bawah untuk mengajukan verifikasi sebagai pemandu wisata.
        </Text>

        {/* Banner progress kelengkapan */}
        {!profile?.is_profile_complete && (
          <Alert status="warning" borderRadius="lg" mb={6}>
            <AlertIcon />
            Profil {completedCount}/{totalCount} kriteria terpenuhi.
            Lengkapi semua bagian (termasuk dokumen KYC) agar bisa diajukan ke admin.
          </Alert>
        )}
        {profile?.is_profile_complete && (
          <Alert status="success" borderRadius="lg" mb={6}>
            <AlertIcon />
            Profil Anda sudah lengkap! Admin akan segera meninjau dan memverifikasi akun Anda.
          </Alert>
        )}

        <VStack spacing={6} align="stretch">

          {/* ── Personal Information ────────────────────────────────────── */}
          <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={5} display="flex" alignItems="center">
              <Icon as={FiUser} mr={3} /> Informasi Pribadi
            </Heading>
            <VStack spacing={5}>
              {/* Foto profil */}
              <FormControl>
                <FormLabel>Foto Profil</FormLabel>
                <Stack direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} spacing={4}>
                  <Avatar
                    size="lg"
                    name={name}
                    src={photoPreview ?? (profile?.profile_picture
                      ? `http://localhost:8000/storage/${profile.profile_picture.replace('public/', '')}`
                      : undefined)}
                  />
                  <VStack align="flex-start" spacing={1}>
                    <Button size="sm" leftIcon={<FiUpload />} onClick={() => photoInputRef.current?.click()}>
                      {photoFile ? photoFile.name : 'Pilih Foto'}
                    </Button>
                    <Text fontSize="xs" color={secondaryText}>JPG/PNG, maks 2MB</Text>
                  </VStack>
                  <input
                    type="file" accept="image/jpg,image/jpeg,image/png"
                    ref={photoInputRef} style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                </Stack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nama Lengkap</FormLabel>
                <Input value={name} onChange={e => setName(e.target.value)} bg={inputBg} placeholder="Nama lengkap Anda" />
              </FormControl>

              <FormControl>
                <FormLabel>Alamat Email</FormLabel>
                <Input value={profile?.email ?? ''} isReadOnly bg={useColorModeValue('gray.200', 'gray.800')} cursor="not-allowed" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tentang Saya</FormLabel>
                <Textarea
                  value={about} onChange={e => setAbout(e.target.value)}
                  bg={inputBg} placeholder="Ceritakan sedikit tentang diri Anda kepada wisatawan" rows={4}
                />
              </FormControl>
            </VStack>
          </Box>

          {/* ── Bahasa & Spesialisasi ───────────────────────────────────── */}
          <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
            <VStack spacing={6} align="stretch">
              {/* Bahasa */}
              <Box>
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiGlobe} mr={3} /> Bahasa
                </Heading>
                <Flex wrap="wrap" gap={2} mb={4}>
                  {languages.map((lang, i) => (
                    <Tag key={i} size="lg" colorScheme="blue" borderRadius="full">
                      <TagLabel>{lang}</TagLabel>
                      <TagCloseButton onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))} />
                    </Tag>
                  ))}
                  {languages.length === 0 && (
                    <Text fontSize="sm" color={secondaryText}>Belum ada bahasa ditambahkan</Text>
                  )}
                </Flex>
                <InputGroup>
                  <Input
                    value={newLanguage} onChange={e => setNewLanguage(e.target.value)}
                    placeholder="Tambah bahasa (mis. English)" bg={inputBg}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={addLanguage} leftIcon={<FiPlus />}>Tambah</Button>
                  </InputRightElement>
                </InputGroup>
              </Box>

              <Divider />

              {/* Spesialisasi */}
              <Box>
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiAward} mr={3} /> Spesialisasi
                </Heading>
                <Flex wrap="wrap" gap={2} mb={4}>
                  {specialities.map((spec, i) => (
                    <Tag key={i} size="lg" colorScheme="green" borderRadius="full">
                      <TagLabel>{spec}</TagLabel>
                      <TagCloseButton onClick={() => setSpecialities(specialities.filter((_, idx) => idx !== i))} />
                    </Tag>
                  ))}
                  {specialities.length === 0 && (
                    <Text fontSize="sm" color={secondaryText}>Belum ada spesialisasi ditambahkan</Text>
                  )}
                </Flex>
                <InputGroup>
                  <Input
                    value={newSpeciality} onChange={e => setNewSpeciality(e.target.value)}
                    placeholder="mis. Sejarah, Hiking, Kuliner" bg={inputBg}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpeciality(); } }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={addSpeciality} leftIcon={<FiPlus />}>Tambah</Button>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </VStack>
          </Box>

          {/* ── Dokumen Verifikasi (KYC) ───────────────────────────────── */}
          <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={2} display="flex" alignItems="center">
              <Icon as={FiShield} mr={3} color="blue.400" /> Dokumen Verifikasi (KYC)
            </Heading>
            <Text fontSize="sm" color={secondaryText} mb={6}>
              Upload dokumen identitas dan sertifikat Anda. File harus berformat JPG, PNG, atau PDF dengan ukuran maks 2MB.
            </Text>

            <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="stretch">
              {/* Card KTP */}
              <Box flex={1} borderWidth="1px" borderRadius="lg" p={5}
                borderColor={profile?.completeness.ktp_document ? 'green.300' : 'orange.300'}
                bg={useColorModeValue(
                  profile?.completeness.ktp_document ? 'green.50' : 'orange.50',
                  profile?.completeness.ktp_document ? 'green.900' : 'orange.900'
                )}
              >
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold">KTP / Kartu Identitas</Text>
                  <Badge colorScheme={profile?.completeness.ktp_document ? 'green' : 'orange'}>
                    {profile?.completeness.ktp_document ? 'Terupload' : 'Wajib'}
                  </Badge>
                </HStack>
                <DocStatus uploaded={!!profile?.completeness.ktp_document} url={profile?.ktp_url ?? null} />
                <Divider my={3} />
                {/* Input file hidden */}
                <input
                  type="file" accept=".jpg,.jpeg,.png,.pdf"
                  ref={ktpInputRef} style={{ display: 'none' }}
                  onChange={e => setKtpFile(e.target.files?.[0] ?? null)}
                />
                <VStack spacing={2} align="stretch">
                  <Button size="sm" variant="outline" leftIcon={<FiUpload />}
                    onClick={() => ktpInputRef.current?.click()}
                  >
                    {ktpFile ? ktpFile.name : 'Pilih File KTP'}
                  </Button>
                  {ktpFile && (
                    <Button size="sm" colorScheme="blue" isLoading={isUploadingKtp} onClick={handleKtpUpload}>
                      Upload KTP
                    </Button>
                  )}
                </VStack>
              </Box>

              {/* Card Sertifikat */}
              <Box flex={1} borderWidth="1px" borderRadius="lg" p={5}
                borderColor={profile?.completeness.certificate_document ? 'green.300' : 'orange.300'}
                bg={useColorModeValue(
                  profile?.completeness.certificate_document ? 'green.50' : 'orange.50',
                  profile?.completeness.certificate_document ? 'green.900' : 'orange.900'
                )}
              >
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="bold">Sertifikat Pemandu</Text>
                  <Badge colorScheme={profile?.completeness.certificate_document ? 'green' : 'orange'}>
                    {profile?.completeness.certificate_document ? 'Terupload' : 'Wajib'}
                  </Badge>
                </HStack>
                <DocStatus uploaded={!!profile?.completeness.certificate_document} url={profile?.certificate_url ?? null} />
                <Divider my={3} />
                <input
                  type="file" accept=".jpg,.jpeg,.png,.pdf"
                  ref={certInputRef} style={{ display: 'none' }}
                  onChange={e => setCertFile(e.target.files?.[0] ?? null)}
                />
                <VStack spacing={2} align="stretch">
                  <Button size="sm" variant="outline" leftIcon={<FiUpload />}
                    onClick={() => certInputRef.current?.click()}
                  >
                    {certFile ? certFile.name : 'Pilih File Sertifikat'}
                  </Button>
                  {certFile && (
                    <Button size="sm" colorScheme="blue" isLoading={isUploadingCert} onClick={handleCertUpload}>
                      Upload Sertifikat
                    </Button>
                  )}
                </VStack>
              </Box>
            </Stack>
          </Box>

          {/* Tombol Simpan */}
          <Flex justify={{ base: 'stretch', md: 'flex-end' }} py={2}>
            <Button
              colorScheme="blue" leftIcon={<FiSave />}
              onClick={handleSave} isLoading={isSaving} loadingText="Menyimpan..."
              w={{ base: 'full', md: 'auto' }} size="lg"
            >
              Simpan Perubahan
            </Button>
          </Flex>

        </VStack>
      </Box>
    </GuideLayout>
  );
};

export default GuideEditProfile;
