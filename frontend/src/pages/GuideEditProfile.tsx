import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Heading, useColorModeValue, VStack, HStack, Stack,
  Button, Link, FormControl, FormLabel, Input, Textarea, Avatar,
  Icon, Tag, TagLabel, TagCloseButton, InputGroup, InputRightElement,
  Divider, Text, Badge, Spinner, useToast, Alert, AlertIcon,
  Tabs, TabList, TabPanels, Tab, TabPanel, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Progress,
} from '@chakra-ui/react';
import {
  FiSave, FiUser, FiGlobe, FiAward, FiPlus, FiShield,
  FiUpload, FiCheckCircle, FiAlertCircle, FiCreditCard, FiSend,
} from 'react-icons/fi';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

// ── Tipe data ────────────────────────────────────────────────────────────────
interface Completeness {
  step1: {
    profile_picture: boolean; about: boolean;
    languages: boolean; specialities: boolean; experience_years: boolean;
    base_rate: boolean;
  };
  step1_complete: boolean;
  step2: {
    ktp_document: boolean; selfie_ktp_document: boolean;
    certificate_document: boolean; portfolio_document: boolean;
  };
  step2_complete: boolean;
}
interface GuideProfile {
  id: number; name: string; email: string;
  about: string | null; experience_years: number | null; base_rate: number | null;
  profile_picture: string | null; avatar_url: string | null;
  bank_name: string | null; bank_account_number: string | null; bank_account_holder: string | null;
  ktp_document: string | null; selfie_ktp_document: string | null;
  certificate_document: string | null; portfolio_document: string | null;
  ktp_url: string | null; selfie_ktp_url: string | null;
  certificate_url: string | null; portfolio_url: string | null;
  verification_status: string; rejection_reason: string | null;
  languages: string[]; specialities: string[];
  completeness: Completeness;
  step1_complete: boolean; step2_complete: boolean;
  can_submit_kyc: boolean;
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
  return (
    <Box flex={1} minW="200px" borderWidth="1px" borderRadius="lg" p={4}
      borderColor={cardBorder} bg={cardBg}>
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold" fontSize="sm">{title}</Text>
        <Badge colorScheme={uploaded ? 'green' : optional ? 'gray' : 'orange'}>
          {uploaded ? 'Terupload' : badge}
        </Badge>
      </HStack>
      <DocStatus uploaded={uploaded} url={url} label="Belum diupload" />
      <Divider my={3} />
      <input type="file" accept=".jpg,.jpeg,.png,.pdf" ref={inputRef}
        style={{ display: 'none' }} onChange={e => onFileChange(e.target.files?.[0] ?? null)} />
      <VStack spacing={2} align="stretch">
        <Button size="sm" variant="outline" leftIcon={<FiUpload />}
          onClick={() => inputRef.current?.click()}>
          {file ? file.name : 'Pilih File'}
        </Button>
        {file && (
          <Button size="sm" colorScheme="blue" isLoading={isUploading} onClick={onUpload}>
            Upload
          </Button>
        )}
      </VStack>
    </Box>
  );
};

// ── Komponen utama ────────────────────────────────────────────────────────────
const GuideEditProfile: React.FC = () => {
  const toast      = useToast();
  const cardBg     = useColorModeValue('white', 'gray.800');
  const inputBg    = useColorModeValue('gray.50', 'gray.700');
  const secondary  = useColorModeValue('gray.500', 'gray.400');
  const readonlyBg = useColorModeValue('gray.200', 'gray.800');

  const [profile,    setProfile]    = useState<GuideProfile | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isSaving,   setIsSaving]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State form Tahap 1
  const [name,           setName]           = useState('');
  const [about,          setAbout]          = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [baseRate,       setBaseRate]       = useState('');
  const [languages,      setLanguages]      = useState<string[]>([]);
  const [specialities,   setSpecialities]   = useState<string[]>([]);
  const [newLang,        setNewLang]        = useState('');
  const [newSpec,        setNewSpec]        = useState('');
  const [photoFile,      setPhotoFile]      = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  // Rekening bank
  const [bankName,       setBankName]       = useState('');
  const [bankAccount,    setBankAccount]    = useState('');
  const [bankHolder,     setBankHolder]     = useState('');

  // State upload KYC (Tahap 2)
  const [ktpFile,      setKtpFile]      = useState<File | null>(null);
  const [selfieFile,   setSelfieFile]   = useState<File | null>(null);
  const [certFile,     setCertFile]     = useState<File | null>(null);
  const [portfolioFile,setPortfolioFile]= useState<File | null>(null);
  const [uploadingKtp,     setUploadingKtp]     = useState(false);
  const [uploadingSelfie,  setUploadingSelfie]  = useState(false);
  const [uploadingCert,    setUploadingCert]    = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const ktpRef      = useRef<HTMLInputElement>(null);
  const selfieRef   = useRef<HTMLInputElement>(null);
  const certRef     = useRef<HTMLInputElement>(null);
  const portfolioRef = useRef<HTMLInputElement>(null);
  const photoRef    = useRef<HTMLInputElement>(null);

  // ── Load profil ──────────────────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      const res = await guideApiClient.get('/guide/profile');
      const g: GuideProfile = res.data.guide;
      setProfile(g);
      setName(g.name ?? '');
      setAbout(g.about ?? '');
      setExperienceYears(g.experience_years ?? 0);
      setBaseRate(g.base_rate ? String(g.base_rate) : '');
      setLanguages(g.languages ?? []);
      setSpecialities(g.specialities ?? []);
      setBankName(g.bank_name ?? '');
      setBankAccount(g.bank_account_number ?? '');
      setBankHolder(g.bank_account_holder ?? '');
    } catch {
      toast({ title: 'Gagal memuat profil', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // ── Simpan profil (Tahap 1) ──────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('about', about);
      fd.append('experience_years', String(experienceYears));
      if (baseRate) fd.append('base_rate', baseRate);
      if (bankName)    fd.append('bank_name', bankName);
      if (bankAccount) fd.append('bank_account_number', bankAccount);
      if (bankHolder)  fd.append('bank_account_holder', bankHolder);
      if (photoFile)   fd.append('profile_picture', photoFile);
      languages.forEach(l => fd.append('languages[]', l));
      specialities.forEach(s => fd.append('specialities[]', s));

      const res = await guideApiClient.post('/guide/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated: GuideProfile = res.data.guide;
      setProfile(updated);
      setPhotoFile(null); setPhotoPreview(null);
      const stored = localStorage.getItem('guide');
      if (stored) {
        localStorage.setItem('guide', JSON.stringify({ ...JSON.parse(stored), name: updated.name }));
      }
      toast({ title: 'Profil berhasil disimpan!', status: 'success', duration: 3000, isClosable: true, position: 'top' });
    } catch (err: any) {
      toast({ title: 'Gagal menyimpan', description: err.response?.data?.message ?? 'Coba lagi.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Upload helpers ───────────────────────────────────────────────────────
  const makeUploader = (
    endpoint: string, fieldName: string,
    setLoading: (v: boolean) => void, setFile: (v: File | null) => void,
    maxSizeKB: number,
  ) => async (file: File | null) => {
    if (!file) return;

    // Validasi ukuran file sebelum kirim ke server
    if (file.size > maxSizeKB * 1024) {
      const maxMB = Math.round(maxSizeKB / 1024);
      toast({
        title: 'Ukuran file terlalu besar',
        description: `File yang Anda pilih melebihi batas maksimum ${maxMB}MB. Harap pilih file yang lebih kecil.`,
        status: 'error', duration: 6000, isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append(fieldName, file);
      await guideApiClient.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      toast({ title: 'Dokumen berhasil diupload!', status: 'success', duration: 3000, isClosable: true });
      await loadProfile();
    } catch (err: any) {
      // Ambil pesan error spesifik dari backend jika ada
      const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
      const serverMsg = errors
        ? Object.values(errors).flat()[0]
        : err.response?.data?.message;
      toast({
        title: 'Gagal upload dokumen',
        description: serverMsg ?? 'Terjadi kesalahan. Coba lagi.',
        status: 'error', duration: 5000, isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // KTP & sertifikat maks 2MB; selfie & portofolio maks 5MB (sesuai validasi backend)
  const handleKtpUpload      = () => makeUploader('/guide/profile/ktp', 'ktp_document', setUploadingKtp, setKtpFile, 2048)(ktpFile);
  const handleSelfieUpload   = () => makeUploader('/guide/profile/selfie-ktp', 'selfie_ktp_document', setUploadingSelfie, setSelfieFile, 5120)(selfieFile);
  const handleCertUpload     = () => makeUploader('/guide/profile/certificate', 'certificate_document', setUploadingCert, setCertFile, 2048)(certFile);
  const handlePortfolioUpload= () => makeUploader('/guide/profile/portfolio', 'portfolio_document', setUploadingPortfolio, setPortfolioFile, 5120)(portfolioFile);

  // ── Kirim untuk verifikasi ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await guideApiClient.post('/guide/profile/submit');
      toast({
        title: 'Dokumen berhasil dikirim!',
        description: 'Admin akan meninjau dan memverifikasi akun Anda.',
        status: 'success', duration: 5000, isClosable: true,
      });
      await loadProfile();
    } catch (err: any) {
      toast({ title: 'Gagal mengirim', description: err.response?.data?.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <GuideLayout>
        <Flex justify="center" align="center" h="60vh"><Spinner size="xl" color="blue.400" /></Flex>
      </GuideLayout>
    );
  }

  const status = profile?.verification_status;
  const comp   = profile?.completeness;
  const step1Pct = comp ? (Object.values(comp.step1).filter(Boolean).length / Object.values(comp.step1).length) * 100 : 0;
  const step2Pct = comp ? ([comp.step2.ktp_document, comp.step2.selfie_ktp_document, comp.step2.portfolio_document].filter(Boolean).length / 3) * 100 : 0;

  const statusBanner = () => {
    if (status === 'menunggu_verifikasi') return <Alert status="info" borderRadius="lg" mb={6}><AlertIcon />Dokumen Anda sedang dalam peninjauan oleh admin. Mohon tunggu.</Alert>;
    if (status === 'verified') return <Alert status="success" borderRadius="lg" mb={6}><AlertIcon />Akun Anda sudah terverifikasi dan aktif!</Alert>;
    if (status === 'rejected') return (
      <Alert status="error" borderRadius="lg" mb={6}>
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Verifikasi ditolak.</Text>
          <Text fontSize="sm">{profile?.rejection_reason}</Text>
          <Text fontSize="sm" mt={1}>Perbaiki dokumen dan kirim ulang.</Text>
        </Box>
      </Alert>
    );
    return null;
  };

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Heading as="h1" size="xl" mb={2}>Kelola Profil</Heading>
        <Text color={secondary} mb={4}>Lengkapi profil dan dokumen KYC untuk mengaktifkan fitur pemandu.</Text>

        {statusBanner()}

        {/* Indikator progres */}
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mb={8}>
          {[
            { label: 'Tahap 1: Profil Profesional', pct: step1Pct, complete: comp?.step1_complete },
            { label: 'Tahap 2: Dokumen KYC',        pct: step2Pct, complete: comp?.step2_complete },
          ].map((step, i) => (
            <Box key={i} flex={1} bg={cardBg} p={4} borderRadius="lg" boxShadow="sm">
              <Flex justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="medium">{step.label}</Text>
                {step.complete && <Icon as={FiCheckCircle} color="green.500" />}
              </Flex>
              <Progress value={step.pct} colorScheme={step.complete ? 'green' : 'blue'} borderRadius="full" size="sm" />
            </Box>
          ))}
        </Stack>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Tahap 1 — Profil Profesional</Tab>
            <Tab>Tahap 2 — Dokumen KYC</Tab>
          </TabList>

          <TabPanels>
            {/* ── TAHAP 1: Profil ─────────────────────────────────────────── */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">

                {/* Informasi Dasar */}
                <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
                  <Heading size="md" mb={5} display="flex" alignItems="center">
                    <Icon as={FiUser} mr={3} /> Informasi Pribadi
                  </Heading>
                  <VStack spacing={5}>
                    {/* Foto */}
                    <FormControl>
                      <FormLabel>Foto Profil</FormLabel>
                      <Stack direction={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} spacing={4}>
                        <Avatar size="lg" name={name} src={photoPreview ?? (profile?.avatar_url ?? undefined)} />
                        <VStack align="flex-start" spacing={1}>
                          <Button size="sm" leftIcon={<FiUpload />} onClick={() => photoRef.current?.click()}>
                            {photoFile ? photoFile.name : 'Pilih Foto'}
                          </Button>
                          <Text fontSize="xs" color={secondary}>JPG/PNG, maks 2MB</Text>
                        </VStack>
                        <input type="file" accept="image/jpg,image/jpeg,image/png" ref={photoRef}
                          style={{ display: 'none' }}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
                          }} />
                      </Stack>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <Input value={name} onChange={e => setName(e.target.value)} bg={inputBg} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Alamat Email</FormLabel>
                      <Input value={profile?.email ?? ''} isReadOnly bg={readonlyBg} cursor="not-allowed" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Tentang Saya</FormLabel>
                      <Textarea value={about} onChange={e => setAbout(e.target.value)} bg={inputBg} rows={4}
                        placeholder="Ceritakan pengalaman dan keahlian Anda kepada wisatawan" />
                    </FormControl>
                    <HStack spacing={4} w="full" flexWrap="wrap">
                      <FormControl flex={1} minW="140px">
                        <FormLabel>Tahun Pengalaman</FormLabel>
                        <NumberInput min={0} max={50} value={experienceYears} onChange={v => setExperienceYears(parseInt(v) || 0)}>
                          <NumberInputField bg={inputBg} />
                          <NumberInputStepper>
                            <NumberIncrementStepper /><NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl flex={1} minW="140px">
                        <FormLabel>Tarif Dasar (Rp)</FormLabel>
                        <Input type="number" value={baseRate} onChange={e => setBaseRate(e.target.value)}
                          bg={inputBg} placeholder="cth: 500000" />
                      </FormControl>
                    </HStack>
                  </VStack>
                </Box>

                {/* Bahasa & Spesialisasi */}
                <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Heading size="md" mb={4} display="flex" alignItems="center">
                        <Icon as={FiGlobe} mr={3} /> Bahasa
                      </Heading>
                      <Flex wrap="wrap" gap={2} mb={4}>
                        {languages.map((l, i) => (
                          <Tag key={i} size="lg" colorScheme="blue" borderRadius="full">
                            <TagLabel>{l}</TagLabel>
                            <TagCloseButton onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))} />
                          </Tag>
                        ))}
                        {languages.length === 0 && <Text fontSize="sm" color={secondary}>Belum ada bahasa.</Text>}
                      </Flex>
                      <InputGroup>
                        <Input value={newLang} onChange={e => setNewLang(e.target.value)} bg={inputBg}
                          placeholder="Tambah bahasa (mis. English)"
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const v = newLang.trim(); if (v && !languages.includes(v)) { setLanguages([...languages, v]); setNewLang(''); } } }} />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" size="sm" leftIcon={<FiPlus />}
                            onClick={() => { const v = newLang.trim(); if (v && !languages.includes(v)) { setLanguages([...languages, v]); setNewLang(''); } }}>
                            Tambah
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Divider />
                    <Box>
                      <Heading size="md" mb={4} display="flex" alignItems="center">
                        <Icon as={FiAward} mr={3} /> Spesialisasi
                      </Heading>
                      <Flex wrap="wrap" gap={2} mb={4}>
                        {specialities.map((s, i) => (
                          <Tag key={i} size="lg" colorScheme="green" borderRadius="full">
                            <TagLabel>{s}</TagLabel>
                            <TagCloseButton onClick={() => setSpecialities(specialities.filter((_, idx) => idx !== i))} />
                          </Tag>
                        ))}
                        {specialities.length === 0 && <Text fontSize="sm" color={secondary}>Belum ada spesialisasi.</Text>}
                      </Flex>
                      <InputGroup>
                        <Input value={newSpec} onChange={e => setNewSpec(e.target.value)} bg={inputBg}
                          placeholder="mis. Sejarah, Hiking, Kuliner"
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const v = newSpec.trim(); if (v && !specialities.includes(v)) { setSpecialities([...specialities, v]); setNewSpec(''); } } }} />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" size="sm" leftIcon={<FiPlus />}
                            onClick={() => { const v = newSpec.trim(); if (v && !specialities.includes(v)) { setSpecialities([...specialities, v]); setNewSpec(''); } }}>
                            Tambah
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                  </VStack>
                </Box>

                {/* Rekening Bank */}
                <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
                  <Heading size="md" mb={5} display="flex" alignItems="center">
                    <Icon as={FiCreditCard} mr={3} /> Rekening Bank (untuk Pencairan Dana)
                  </Heading>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Nama Bank</FormLabel>
                      <Input value={bankName} onChange={e => setBankName(e.target.value)} bg={inputBg} placeholder="cth: BCA, Mandiri, BNI" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)} bg={inputBg} placeholder="cth: 1234567890" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Atas Nama</FormLabel>
                      <Input value={bankHolder} onChange={e => setBankHolder(e.target.value)} bg={inputBg} placeholder="Nama pemilik rekening" />
                    </FormControl>
                  </VStack>
                </Box>

                {/* Tombol Simpan */}
                <Flex justify={{ base: 'stretch', md: 'flex-end' }} py={2}>
                  <Button colorScheme="blue" leftIcon={<FiSave />}
                    onClick={handleSave} isLoading={isSaving} loadingText="Menyimpan..."
                    w={{ base: 'full', md: 'auto' }} size="lg">
                    Simpan Perubahan
                  </Button>
                </Flex>
              </VStack>
            </TabPanel>

            {/* ── TAHAP 2: Dokumen KYC ──────────────────────────────────── */}
            <TabPanel p={0} pt={6}>
              <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md" mb={6}>
                <Heading size="md" mb={2} display="flex" alignItems="center">
                  <Icon as={FiShield} mr={3} color="blue.400" /> Dokumen Verifikasi
                </Heading>
                <Text fontSize="sm" color={secondary} mb={6}>
                  KTP, selfie bersama KTP, dan portofolio trip <strong>wajib</strong> diunggah. Sertifikat opsional.
                  Format yang diterima: JPG, PNG, PDF. Ukuran maks 2–5MB.
                </Text>

                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} flexWrap="wrap">
                  <UploadCard title="KTP / Kartu Identitas" badge="Wajib"
                    uploaded={!!profile?.ktp_document} url={profile?.ktp_url ?? null}
                    file={ktpFile} inputRef={ktpRef}
                    onFileChange={setKtpFile} onUpload={handleKtpUpload} isUploading={uploadingKtp} />
                  <UploadCard title="Selfie Bersama KTP" badge="Wajib"
                    uploaded={!!profile?.selfie_ktp_document} url={profile?.selfie_ktp_url ?? null}
                    file={selfieFile} inputRef={selfieRef}
                    onFileChange={setSelfieFile} onUpload={handleSelfieUpload} isUploading={uploadingSelfie} />
                  <UploadCard title="Portofolio Trip" badge="Wajib"
                    uploaded={!!profile?.portfolio_document} url={profile?.portfolio_url ?? null}
                    file={portfolioFile} inputRef={portfolioRef}
                    onFileChange={setPortfolioFile} onUpload={handlePortfolioUpload} isUploading={uploadingPortfolio} />
                  <UploadCard title="Sertifikat Profesi" badge="Opsional"
                    uploaded={!!profile?.certificate_document} url={profile?.certificate_url ?? null}
                    file={certFile} inputRef={certRef}
                    onFileChange={setCertFile} onUpload={handleCertUpload} isUploading={uploadingCert} optional />
                </Stack>
              </Box>

              {/* Tombol Kirim untuk Verifikasi */}
              {(status === 'pending' || status === 'rejected') && (
                <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
                  <Heading size="sm" mb={3}>Siap untuk Diverifikasi?</Heading>
                  {!profile?.can_submit_kyc && (
                    <Alert status="warning" borderRadius="md" mb={4} fontSize="sm">
                      <AlertIcon />
                      Upload KTP, selfie bersama KTP, dan portofolio trip terlebih dahulu sebelum mengirim.
                    </Alert>
                  )}
                  <Button
                    colorScheme="blue" leftIcon={<FiSend />} size="lg" w={{ base: 'full', md: 'auto' }}
                    isDisabled={!profile?.can_submit_kyc} isLoading={isSubmitting}
                    loadingText="Mengirim..." onClick={handleSubmit}
                  >
                    Kirim untuk Diverifikasi
                  </Button>
                </Box>
              )}
              {status === 'menunggu_verifikasi' && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  Dokumen Anda sedang ditinjau oleh admin. Tidak perlu mengirim ulang.
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </GuideLayout>
  );
};

export default GuideEditProfile;
