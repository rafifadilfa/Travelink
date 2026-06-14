import React, { useEffect, useState } from 'react';
import {
  As,
  Box, Button, Flex, Text, Heading, Container, Grid, Input, Select,
  useColorModeValue, Icon, Badge, VStack, HStack, Tabs,
  TabList, TabPanels, Tab, TabPanel, Avatar, Divider, useToast,
  Spinner, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  FormControl, FormErrorMessage,
} from '@chakra-ui/react';
import {
  ChevronRightIcon, EditIcon, CheckIcon, CloseIcon, SettingsIcon, CalendarIcon,
  EmailIcon, ChatIcon, TimeIcon, InfoOutlineIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// --- Keyframes ---
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const iconWiggle = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(8deg) scale(1.08); }
  50% { transform: rotate(-4deg) scale(1.04); }
  75% { transform: rotate(8deg) scale(1.08); }
`;
const subtleFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  joined_date: string;
  bookings_count: number;
  reviews_count: number;
  ot_age: number | null;
  ot_budget_level: number | null;
  ot_interests: number[];
}

interface InfoCardProps {
  label: string;
  value: string;
  iconAs?: As;
  primaryColor: string;
  secondaryTextColor: string;
  primaryTextColor: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, iconAs, primaryColor, secondaryTextColor, primaryTextColor }) => {
  const bg = useColorModeValue('white', 'gray.750');
  return (
    <Box
      bg={bg} p={4} borderRadius="lg"
      boxShadow="md" animation={`${fadeIn} 0.5s ease-out forwards`}
      borderLeft="3px solid" borderColor={primaryColor}
      transition="all 0.2s ease-in-out"
      _hover={{ transform: 'translateY(-4px) scale(1.01)', boxShadow: 'lg' }}
    >
      <HStack spacing={2} mb={1}>
        {iconAs && <Icon as={iconAs} boxSize={4} color={primaryColor} mr={1} />}
        <Text fontSize="xs" color={secondaryTextColor} fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
      </HStack>
      <Text fontSize="md" color={primaryTextColor} fontWeight="semibold" noOfLines={1}>
        {value || '-'}
      </Text>
    </Box>
  );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isEditing, setIsEditing]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userData, setUserData]       = useState<UserProfile | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData]       = useState({
    name: '', email: '', phone_number: '',
    ot_age: '', ot_budget_level: '',
  });
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Semua hook di level atas
  const overallBg          = useColorModeValue('blue.50', 'gray.900');
  const cardBg             = useColorModeValue('white', 'gray.800');
  const glassBg            = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
  const primaryColor       = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor  = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor   = useColorModeValue('gray.700', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const subtleBorderColor  = useColorModeValue('gray.200', 'gray.700');
  const accentGradientFrom = useColorModeValue('purple.400', 'purple.300');
  const accentGradientTo   = useColorModeValue('blue.500', 'blue.400');
  const accentGradient     = `linear(to-br, ${accentGradientFrom}, ${accentGradientTo})`;

  const focusBoxShadow      = useColorModeValue('blue.200', 'blue.700');
  const primaryBtnGradFrom  = useColorModeValue('blue.400', 'blue.300');
  const primaryBtnHoverTo   = useColorModeValue('blue.500', 'blue.400');
  const secondaryBtnHoverBg = useColorModeValue('blue.50', 'rgba(49,130,206,0.1)');

  const avatarBorderColor   = useColorModeValue('white', 'gray.700');
  const tabHoverBg          = useColorModeValue('blue.100', 'gray.700');
  const inputBg             = useColorModeValue('gray.100', 'gray.700');
  const inputHoverBg        = useColorModeValue('gray.200', 'gray.600');
  const inputFocusShadow    = useColorModeValue('blue.300', 'blue.600');
  const inputFocusBg        = useColorModeValue('white', 'gray.700');

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "44px",
    px: 5, fontSize: "sm",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${focusBoxShadow}` }
  };

  const primaryButtonStyle = {
    ...baseButtonStyle,
    bgGradient: `linear(to-r, ${primaryColor}, ${primaryBtnGradFrom})`,
    color: 'white', boxShadow: "md",
    _hover: {
      bgGradient: `linear(to-r, ${primaryHoverColor}, ${primaryBtnHoverTo})`,
      transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg'
    },
  };

  const secondaryButtonStyle = {
    ...baseButtonStyle, bg: 'transparent', color: primaryColor,
    border: "2px solid", borderColor: primaryColor,
    _hover: {
      bg: secondaryBtnHoverBg, borderColor: primaryHoverColor,
      color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
    },
  };


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/user/profile');
        const user: UserProfile = res.data.user;
        setUserData(user);
        setFormData({
          name: user.name, email: user.email, phone_number: user.phone_number ?? '',
          ot_age: user.ot_age?.toString() ?? '',
          ot_budget_level: user.ot_budget_level?.toString() ?? '',
        });
      } catch {
        toast({ title: 'Gagal memuat profil', status: 'error', duration: 3000, position: 'top' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number || null,
        ot_age: formData.ot_age ? Number(formData.ot_age) : null,
        ot_budget_level: formData.ot_budget_level ? Number(formData.ot_budget_level) : null,
      };
      const res = await apiClient.put('/user/profile', payload);
      const updated: UserProfile = res.data.user;
      setUserData(updated);
      setIsEditing(false);
      toast({ title: 'Profil berhasil diperbarui', status: 'success', duration: 3000, position: 'top' });
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } };
      if (apiErr.response?.status === 422 && apiErr.response.data?.errors) {
        const errs: Record<string, string> = {};
        for (const [field, msgs] of Object.entries(apiErr.response.data.errors)) {
          errs[field] = (msgs as string[])[0];
        }
        setFieldErrors(errs);
      } else {
        toast({ title: 'Gagal menyimpan perubahan', status: 'error', duration: 3000, position: 'top' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userData) {
      setFormData({
        name: userData.name, email: userData.email, phone_number: userData.phone_number ?? '',
        ot_age: userData.ot_age?.toString() ?? '',
        ot_budget_level: userData.ot_budget_level?.toString() ?? '',
      });
    }
    setFieldErrors({});
    setIsEditing(false);
    toast({ title: 'Edit dibatalkan', status: 'info', duration: 2000, position: 'top-right' });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const res = await apiClient.post('/user/profile/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserData(prev => prev ? { ...prev, profile_picture: res.data.photo_url } : prev);
      toast({ title: 'Foto profil diperbarui!', status: 'success', duration: 3000, position: 'top' });
    } catch {
      toast({ title: 'Gagal mengupload foto', status: 'error', duration: 3000, position: 'top' });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const infoCardProps = { primaryColor, secondaryTextColor, primaryTextColor };

  const tabs = [
    { label: "Detail Profil", icon: SettingsIcon },
    { label: "Riwayat Booking", icon: CalendarIcon },
  ];

  const fields = userData ? [
    { label: "Nama Lengkap", name: "name", type: "text", value: formData.name, iconAs: InfoOutlineIcon },
    { label: "Alamat Email", name: "email", type: "email", value: formData.email, iconAs: EmailIcon },
    { label: "Nomor Telepon", name: "phone_number", type: "tel", value: formData.phone_number, iconAs: ChatIcon },
  ] : [];

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={overallBg}>
        <Spinner size="xl" color={primaryColor} />
      </Flex>
    );
  }

  if (!userData) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={overallBg}>
        <Text color={primaryTextColor}>Gagal memuat profil.</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
      <TouristNavbar />

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondaryTextColor}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/dashboard')}>Beranda</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="blue.500" fontWeight="medium">Profil Saya</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.6s ease-out`}>
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} gap={{ base: 5, md: 8 }}>
            <VStack spacing={2.5} align={{ base: "center", md: "flex-start" }}>
              <Avatar size="xl" name={userData.name} src={userData.profile_picture ?? undefined} border="4px solid" borderColor={avatarBorderColor} boxShadow={`0 0 12px ${primaryColor}`} />
              <input type="file" accept="image/*" ref={photoInputRef} style={{ display: 'none' }} onChange={handlePhotoChange} />
              <Button
                size="xs" variant="ghost" colorScheme="blue"
                isLoading={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                Ganti Foto
              </Button>
            </VStack>
            <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
              <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} animation={`${slideInUp} 0.7s ease-out 0.1s both`}>
                {isEditing ? `Edit Profil: ${formData.name}` : `Selamat datang, ${userData.name}`}
              </Heading>
              <Badge px={3} py={1} borderRadius="full" bgGradient={accentGradient} color="white" fontSize="sm" fontWeight="bold" mb={3} display="inline-flex" alignItems="center" animation={`${slideInUp} 0.7s ease-out 0.2s both`} boxShadow="md">
                <Icon viewBox="0 0 24 24" boxSize={3.5} mr={1.5} fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></Icon>
                {userData.email}
              </Badge>
              <Text color={secondaryTextColor} fontSize="md" mb={4} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
                Bergabung sejak {userData.joined_date}. Kelola informasi dan preferensi Anda di bawah ini.
              </Text>
              <HStack spacing={6} justify={{ base: 'center', md: 'flex-start' }} animation={`${slideInUp} 0.7s ease-out 0.4s both`} divider={<Box h="30px" borderLeft="1px solid" borderColor={subtleBorderColor} />}>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="extrabold" color={primaryColor}>{userData.bookings_count}</Text>
                  <Text fontSize="sm" color={secondaryTextColor}>Booking</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="extrabold" color={primaryColor}>{userData.reviews_count}</Text>
                  <Text fontSize="sm" color={secondaryTextColor}>Ulasan</Text>
                </Box>
              </HStack>
            </Box>
            {!isEditing && activeTabIndex === 0 && (
              <Button {...primaryButtonStyle} leftIcon={<EditIcon boxSize={4} />} onClick={() => setIsEditing(true)} alignSelf={{ base: 'stretch', md: 'flex-start' }} mt={{ base: 4, md: 0 }} animation={`${fadeIn} 0.8s ease-out 0.5s both`}>
                Edit Profil
              </Button>
            )}
          </Flex>
        </Box>

        <Tabs index={activeTabIndex} onChange={setActiveTabIndex} variant="unstyled" isLazy>
          <TabList display="flex" justifyContent="space-around" bg={cardBg} p={1.5} borderRadius="lg" boxShadow="md" mb={8} border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
            {tabs.map((tab, index) => (
              <Tab
                key={tab.label} flex={1} py={2.5} borderRadius="md" fontWeight="medium" fontSize="sm"
                color={activeTabIndex === index ? 'white' : secondaryTextColor}
                bg={activeTabIndex === index ? primaryColor : 'transparent'}
                boxShadow={activeTabIndex === index ? 'md' : 'none'}
                transition="all 0.3s ease"
                _hover={{ bg: activeTabIndex !== index ? tabHoverBg : primaryHoverColor, color: activeTabIndex !== index ? primaryColor : 'white' }}
                _selected={{ color: 'white', bg: primaryColor, boxShadow: 'lg' }}
              >
                <Icon as={tab.icon} mr={2} boxSize={4} /> {tab.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {/* Tab 1: Detail Profil */}
            <TabPanel p={0}>
              <Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} animation={`${fadeIn} 0.5s ease-out`}>
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={5} align="stretch">
                      <Heading size="lg" color={primaryTextColor} mb={2} textAlign="center">Perbarui Informasi Anda</Heading>
                      {fields.map(field => (
                        <FormControl key={field.name} isInvalid={!!fieldErrors[field.name]}>
                          <HStack as="label" htmlFor={field.name} fontSize="sm" fontWeight="medium" color={secondaryTextColor} mb={1.5} display="flex" align="center">
                            {field.iconAs && <Icon as={field.iconAs} color={primaryColor} boxSize={4} />}
                            <Text ml={field.iconAs != null ? 1 : 0}>{field.label}</Text>
                          </HStack>
                          <Input
                            id={field.name} name={field.name} type={field.type} value={field.value}
                            onChange={handleInputChange}
                            variant="filled" bg={inputBg} h="46px" borderRadius="md" fontSize="sm"
                            _hover={{ bg: inputHoverBg }}
                            _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${inputFocusShadow}`, bg: inputFocusBg }}
                          />
                          {fieldErrors[field.name] && (
                            <FormErrorMessage fontSize="xs">{fieldErrors[field.name]}</FormErrorMessage>
                          )}
                        </FormControl>
                      ))}
                      {/* HIDDEN: Preferensi Smart Open Trip (form edit) — sembunyikan sementara, jangan hapus
                      <Box pt={2} borderTop="1px dashed" borderColor={subtleBorderColor}>
                        <Text fontSize="sm" fontWeight="semibold" color={primaryColor} mb={3}>Preferensi Smart Open Trip</Text>
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" color={secondaryTextColor} mb={1.5}>Usia Anda</Text>
                            <Input
                              type="number" min={1} max={120} placeholder="contoh: 25"
                              value={formData.ot_age}
                              onChange={e => setFormData(p => ({ ...p, ot_age: e.target.value }))}
                              variant="filled" bg={inputBg} h="46px" borderRadius="md" fontSize="sm"
                              _hover={{ bg: inputHoverBg }}
                              _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${inputFocusShadow}`, bg: inputFocusBg }}
                            />
                          </Box>
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" color={secondaryTextColor} mb={1.5}>Level Budget</Text>
                            <Select
                              value={formData.ot_budget_level}
                              onChange={e => setFormData(p => ({ ...p, ot_budget_level: e.target.value }))}
                              variant="filled" bg={inputBg} h="46px" borderRadius="md" fontSize="sm"
                              _hover={{ bg: inputHoverBg }}
                              _focus={{ borderColor: primaryColor, bg: inputFocusBg }}
                            >
                              <option value="">Pilih budget...</option>
                              <option value="1">1 — Di bawah Rp 500rb</option>
                              <option value="2">2 — Rp 500rb–1jt</option>
                              <option value="3">3 — Rp 1jt–2jt</option>
                              <option value="4">4 — Rp 2jt–5jt</option>
                              <option value="5">5 — Di atas Rp 5jt</option>
                            </Select>
                          </Box>
                        </Grid>
                      </Box>
                      */}
                      <HStack justifyContent="flex-end" spacing={3} pt={4} mt={2} borderTop="1px dashed" borderColor={subtleBorderColor}>
                        <Button {...secondaryButtonStyle} onClick={handleCancelEdit} leftIcon={<CloseIcon boxSize={3} />}>Batal</Button>
                        <Button {...primaryButtonStyle} type="submit" isLoading={saving} leftIcon={<CheckIcon boxSize={3} />}>Simpan Perubahan</Button>
                      </HStack>
                    </VStack>
                  </form>
                ) : (
                  <VStack spacing={6} align="stretch">
                    <Heading size="lg" color={primaryTextColor} mb={1} textAlign="center">Informasi Profil Anda</Heading>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                      <InfoCard label="Nama Lengkap" value={userData.name} iconAs={InfoOutlineIcon} {...infoCardProps} />
                      <InfoCard label="Alamat Email" value={userData.email} iconAs={EmailIcon} {...infoCardProps} />
                      <InfoCard label="Nomor Telepon" value={userData.phone_number || '-'} iconAs={ChatIcon} {...infoCardProps} />
                      <InfoCard label="Bergabung Sejak" value={userData.joined_date} iconAs={TimeIcon} {...infoCardProps} />
                    </Grid>
                    {/* HIDDEN: Preferensi Smart Open Trip (tampilan) — sembunyikan sementara, jangan hapus
                    <Box pt={4} borderTop="1px dashed" borderColor={subtleBorderColor}>
                      <Text fontSize="sm" fontWeight="semibold" color={primaryColor} mb={3}>Preferensi Smart Open Trip</Text>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                        <InfoCard
                          label="Usia"
                          value={userData.ot_age != null ? `${userData.ot_age} tahun` : 'Belum diisi'}
                          iconAs={InfoOutlineIcon} {...infoCardProps}
                        />
                        <InfoCard
                          label="Level Budget"
                          value={
                            userData.ot_budget_level != null
                              ? ['', 'Di bawah Rp 500rb', 'Rp 500rb–1jt', 'Rp 1jt–2jt', 'Rp 2jt–5jt', 'Di atas Rp 5jt'][userData.ot_budget_level] ?? 'Belum diisi'
                              : 'Belum diisi'
                          }
                          iconAs={InfoOutlineIcon} {...infoCardProps}
                        />
                      </Grid>
                    </Box>
                    */}
                  </VStack>
                )}
              </Box>
            </TabPanel>

            {/* Tab 2: Riwayat Booking */}
            <TabPanel p={0}>
              <Box bg={cardBg} p={{ base: 6, md: 8 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} textAlign="center" minH="300px" display="flex" flexDirection="column" justifyContent="center" alignItems="center" animation={`${fadeIn} 0.5s ease-out`}>
                <Icon as={CalendarIcon} boxSize="48px" color={primaryColor} mb={4} animation={`${iconWiggle} 3.5s ease-in-out infinite 0.2s`} />
                <Heading size="lg" color={primaryTextColor} mb={3}>Lihat Booking Anda</Heading>
                <Text color={secondaryTextColor} mb={6} maxW="md" fontSize="md">
                  Tinjau riwayat perjalanan lengkap Anda, termasuk semua booking mendatang dan yang sudah selesai.
                </Text>
                <Button {...primaryButtonStyle} size="md" onClick={() => navigate('/bookings')} rightIcon={<ChevronRightIcon boxSize={5} />} animation={`${subtleFloat} 2s ease-in-out infinite`}>Lihat Semua Booking</Button>
              </Box>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default Profile;
