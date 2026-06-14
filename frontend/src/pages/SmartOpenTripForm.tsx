import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Activity {
  id: number;
  name: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  open_trip_activities: Activity[];
}

interface TourInfo {
  id: number;
  name: string;
  price: number;
  description: string;
  location: string | null;
}

interface FormDataResponse {
  tour: TourInfo;
  categories: Category[];
  date: string;
  already_joined: boolean;
  registration_count: number;
  registrations_remaining: number;
  can_register: boolean;
  participant: {
    age: number;
    interest_ids: number[];
    preference_ids: number[];
    budget_level: number;
  } | null;
}

interface FormErrors {
  date?: string;
  age?: string;
  interests?: string;
  activities?: string;
  budget?: string;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { value: '1', label: 'Kurang dari Rp 500.000' },
  { value: '2', label: 'Rp 500.000 – Rp 1.000.000' },
  { value: '3', label: 'Rp 1.000.000 – Rp 2.000.000' },
  { value: '4', label: 'Rp 2.000.000 – Rp 5.000.000' },
  { value: '5', label: 'Lebih dari Rp 5.000.000' },
];

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const SmartOpenTripForm: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // ── State ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataResponse | null>(null);

  // Form fields
  const [selectedDate, setSelectedDate] = useState<string>(
    searchParams.get('date') ?? ''
  );
  const [age, setAge] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<string>('');

  const [errors, setErrors] = useState<FormErrors>({});

  // Hari ketersediaan pemandu untuk tour ini
  const [availableDays, setAvailableDays]           = useState<number[]>([]);
  const [availableDayLabels, setAvailableDayLabels] = useState<string[]>([]);

  // Guard agar useEffect tidak dijalankan dua kali oleh React 18 Strict Mode
  const hasFetchedOnMount = useRef(false);

  // ── Fetch form data ────────────────────────────────────────
  const fetchFormData = useCallback(async (date: string) => {
    if (!tourId || !date) return;
    setLoading(true);
    try {
      const res = await apiClient.get<FormDataResponse>('/open-trip/form-data', {
        params: { tour_id: tourId, date },
      });
      setFormData(res.data);

      // Jika sudah pernah join, pre-fill form dengan data sebelumnya
      if (res.data.already_joined && res.data.participant) {
        const p = res.data.participant;
        setAge(String(p.age));
        setSelectedInterests(p.interest_ids.map(String));
        setSelectedActivities(p.preference_ids.map(String));
        setBudgetLevel(String(p.budget_level));
      }
    } catch (err: unknown) {
      type ApiError = {
        response?: {
          status?: number;
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const apiErr = err as ApiError;
      const status  = apiErr?.response?.status;
      const data    = apiErr?.response?.data;

      // 404 → tour tidak ditemukan / bukan Smart Open Trip
      if (status === 404) {
        toast({
          title: 'Tour tidak ditemukan atau belum dibuka sebagai Smart Open Trip.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/tours');
        return;
      }

      // 422 → validasi gagal; tampilkan error field pertama yang spesifik
      if (status === 422 && data?.errors) {
        const fieldErrors = Object.entries(data.errors);
        const [field, messages] = fieldErrors[0] ?? [];
        const fieldLabel: Record<string, string> = {
          tour_id: 'ID Tour',
          date:    'Tanggal',
        };
        const label = field ? (fieldLabel[field] ?? field) : 'Input';
        toast({
          title: `${label}: ${messages?.[0] ?? 'tidak valid'}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Error lain (500, jaringan, dll)
      toast({
        title: data?.message ?? 'Gagal memuat data. Coba lagi.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [tourId, navigate, toast]);

  // Fetch hari ketersediaan pemandu (selalu on mount, tidak perlu date)
  useEffect(() => {
    if (!tourId) return;
    apiClient.get<{ available_days: { day_of_week: number; label: string }[] }>(
      `/tours/${tourId}/availabilities`
    ).then(res => {
      setAvailableDays(res.data.available_days.map(d => d.day_of_week));
      setAvailableDayLabels(res.data.available_days.map(d => d.label));
    }).catch(() => { /* tetap bisa lanjut tanpa validasi hari */ });
  }, [tourId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Jalankan fetch otomatis hanya jika date sudah ada dari URL params,
  // dan hanya sekali meski React Strict Mode double-invoke effect ini.
  useEffect(() => {
    if (selectedDate && !hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
      fetchFormData(selectedDate);
    } else if (!selectedDate) {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cek apakah tanggal yang dipilih jatuh pada hari yang tersedia
  const isDateAvailable = (dateStr: string): boolean => {
    if (availableDays.length === 0) return true;
    const [y, m, d] = dateStr.split('-').map(Number);
    return availableDays.includes(new Date(y, m - 1, d).getDay());
  };

  // ── Aktivitas yang relevan (filter berdasarkan minat dipilih) ──
  const relevantActivities: Activity[] = formData
    ? formData.categories
        .filter((cat) => selectedInterests.includes(String(cat.id)))
        .flatMap((cat) => cat.open_trip_activities)
    : [];

  // Saat minat berubah, hapus aktivitas yang tidak lagi relevan
  const handleInterestChange = (values: string[]) => {
    setSelectedInterests(values);

    if (!formData) return;
    const validActivityIds = formData.categories
      .filter((cat) => values.includes(String(cat.id)))
      .flatMap((cat) => cat.open_trip_activities.map((a) => String(a.id)));

    setSelectedActivities((prev) => prev.filter((id) => validActivityIds.includes(id)));
  };

  // ── Validasi ───────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedDate) {
      newErrors.date = 'Pilih tanggal trip terlebih dahulu.';
    } else if (!isDateAvailable(selectedDate)) {
      newErrors.date = `Hari ini tidak tersedia. Pemandu hanya tersedia pada: ${availableDayLabels.join(', ')}.`;
    }
    if (!age || parseInt(age) < 1 || parseInt(age) > 99) {
      newErrors.age = 'Masukkan umur yang valid (1–99 tahun).';
    }
    if (selectedInterests.length === 0) {
      newErrors.interests = 'Pilih minimal 1 minat wisata.';
    }
    if (selectedActivities.length === 0) {
      newErrors.activities = 'Pilih minimal 1 preferensi aktivitas.';
    }
    if (!budgetLevel) {
      newErrors.budget = 'Pilih rentang budget perjalananmu.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate() || !formData) return;

    setSubmitting(true);
    try {
      const res = await apiClient.post('/open-trip/join', {
        tour_id:      parseInt(tourId!),
        trip_date:    selectedDate,
        age:          parseInt(age),
        interest_ids: selectedInterests.map(Number),
        activity_ids: selectedActivities.map(Number),
        budget_level: parseInt(budgetLevel),
      });

      const { participant } = res.data as {
        participant: { id: number; status: string; group_id: number | null };
      };

      toast({
        title: participant.status === 'matched'
          ? 'Kecocokan ditemukan! Kamu masuk ke grup.'
          : 'Berhasil masuk waiting room!',
        description: participant.status === 'matched'
          ? 'Lihat anggota grupmu sekarang.'
          : 'Sistem sedang mencari peserta yang cocok untukmu.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect ke waiting room — komponen itu yang handle Tahap 1 / Tahap 2
      navigate(
        `/open-trip/waiting/${participant.id}?tour_id=${tourId}&date=${selectedDate}&reg_count=${participant.registration_count ?? 1}`
      );
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
      if (errData?.errors) {
        const firstError = Object.values(errData.errors)[0]?.[0];
        toast({ title: firstError ?? 'Input tidak valid.', status: 'error', duration: 4000, isClosable: true });
      } else {
        toast({ title: errData?.message ?? 'Terjadi kesalahan, coba lagi.', status: 'error', duration: 4000, isClosable: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Tampilkan tanggal Indonesia ────────────────────────────
  const formatDateID = (dateStr: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRupiah = (num: number): string =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  // ─────────────────────────────────────────────────────────
  // Render: loading
  // ─────────────────────────────────────────────────────────
  if (loading && selectedDate) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Memuat data tour...</Text>
        </VStack>
      </Flex>
    );
  }

  // ─────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────
  // Render: pilih tanggal (jika belum ada date param)
  // ─────────────────────────────────────────────────────────
  if (!selectedDate || !formData) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={{ base: 3, md: 4 }}>
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="lg"
          p={{ base: 5, md: 8 }}
          maxW="480px"
          w="full"
          animation={`${fadeIn} 0.4s ease`}
        >
          <Button
            variant="ghost"
            leftIcon={<ArrowBackIcon />}
            mb={6}
            onClick={() => navigate(-1)}
            size="sm"
            color="gray.500"
          >
            Kembali
          </Button>
          <Heading size="md" mb={1} color="gray.800">
            Smart Open Trip
          </Heading>
          <Text color="gray.500" mb={6} fontSize="sm">
            Pilih tanggal trip terlebih dahulu.
          </Text>
          {availableDayLabels.length > 0 && (
            <Box mb={4} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
              <Text fontSize="xs" color="blue.700" fontWeight="semibold" mb={2}>
                Jadwal ketersediaan pemandu:
              </Text>
              <Wrap spacing={1}>
                {availableDayLabels.map(label => (
                  <WrapItem key={label}>
                    <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2} py={0.5} fontSize="xs">
                      {label}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}
          <FormControl isInvalid={!!errors.date}>
            <FormLabel color="gray.700" fontWeight="semibold">
              Tanggal Trip
            </FormLabel>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setErrors(prev => ({ ...prev, date: undefined }));
              }}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: errors.date ? '1px solid #FC8181' : '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                color: '#2D3748',
              }}
            />
            <FormErrorMessage>{errors.date}</FormErrorMessage>
          </FormControl>
          <Button
            mt={6}
            colorScheme="blue"
            w="full"
            onClick={() => {
              if (!selectedDate) {
                setErrors({ date: 'Pilih tanggal trip terlebih dahulu.' });
                return;
              }
              if (!isDateAvailable(selectedDate)) {
                setErrors({ date: `Hari ini tidak tersedia. Pemandu hanya tersedia pada: ${availableDayLabels.join(', ')}.` });
                return;
              }
              fetchFormData(selectedDate);
            }}
          >
            Lanjut
          </Button>
        </Box>
      </Flex>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Render: form utama (4 kriteria)
  // ─────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 4, md: 8 }}>
      <Container maxW="2xl" px={{ base: 3, md: 4 }}>
        {/* Header */}
        <Button
          variant="ghost"
          leftIcon={<ArrowBackIcon />}
          mb={4}
          onClick={() => navigate(-1)}
          size="sm"
          color="gray.500"
        >
          Kembali
        </Button>

        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="sm"
          overflow="hidden"
          animation={`${fadeIn} 0.4s ease`}
        >
          {/* Info tour */}
          <Box bg="blue.600" px={8} py={6}>
            <Badge colorScheme="yellow" mb={2} fontSize="xs" px={2} py={1} borderRadius="md">
              ✨ Smart Open Trip
            </Badge>
            <Heading size="md" color="white" mb={1}>
              {formData.tour.name}
            </Heading>
            <HStack spacing={4} mt={1}>
              {formData.tour.location && (
                <Text color="blue.100" fontSize="sm">
                  📍 {formData.tour.location}
                </Text>
              )}
              <Text color="blue.100" fontSize="sm">
                📅 {formatDateID(selectedDate)}
              </Text>
              <Text color="blue.100" fontSize="sm">
                💰 {formatRupiah(formData.tour.price)} / paket
              </Text>
            </HStack>
          </Box>

          <Box px={8} py={6}>
            {/* Sudah aktif terdaftar (waiting/matched) */}
            {formData.already_joined && (
              <Alert status="info" borderRadius="lg" mb={6} fontSize="sm">
                <AlertIcon />
                Kamu sudah terdaftar di trip ini. Perubahan preferensi akan diperbarui.
              </Alert>
            )}

            {/* Pernah cancel, masih ada sisa kesempatan */}
            {!formData.already_joined && formData.registration_count > 0 && formData.can_register && (
              <Alert status="warning" borderRadius="lg" mb={6} fontSize="sm">
                <AlertIcon />
                Ini adalah pendaftaran ke-{formData.registration_count + 1} kamu untuk trip ini.
                {formData.registrations_remaining === 1
                  ? ' Ini kesempatan terakhirmu.'
                  : ` Sisa ${formData.registrations_remaining} kesempatan.`}
              </Alert>
            )}

            {/* Sudah habis kuota (registration_count >= 3, tidak aktif) */}
            {!formData.already_joined && !formData.can_register && (
              <Alert status="error" borderRadius="lg" mb={6} fontSize="sm">
                <AlertIcon />
                Kamu sudah mencapai batas pendaftaran untuk trip ini (maksimal 3 kali).
                Silakan pilih trip atau tanggal lain.
              </Alert>
            )}

            <Text color="gray.500" fontSize="sm" mb={6}>
              Isi preferensimu agar sistem bisa mencarikan rekan perjalanan yang paling cocok.
              Semua kolom wajib diisi.
            </Text>

            <VStack spacing={8} align="stretch">
              {/* ── Kriteria 1: Umur ── */}
              <FormControl isInvalid={!!errors.age}>
                <FormLabel color="gray.700" fontWeight="semibold" mb={1}>
                  1. Umur
                </FormLabel>
                <FormHelperText color="gray.400" mt={0} mb={3} fontSize="xs">
                  Dipakai untuk mencocokkan dengan peserta seusia.
                </FormHelperText>
                <NumberInput
                  min={1}
                  max={99}
                  value={age}
                  onChange={(val) => setAge(val)}
                  maxW="160px"
                >
                  <NumberInputField
                    placeholder="Contoh: 25"
                    borderColor={errors.age ? 'red.300' : 'gray.200'}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299e1' }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.age}</FormErrorMessage>
              </FormControl>

              <Divider />

              {/* ── Kriteria 2: Minat ── */}
              <FormControl isInvalid={!!errors.interests}>
                <FormLabel color="gray.700" fontWeight="semibold" mb={1}>
                  2. Minat Wisata
                </FormLabel>
                <FormHelperText color="gray.400" mt={0} mb={3} fontSize="xs">
                  Pilih 1 atau lebih kategori wisata yang kamu sukai.
                </FormHelperText>
                <CheckboxGroup
                  value={selectedInterests}
                  onChange={(vals) => handleInterestChange(vals as string[])}
                >
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    {formData.categories.map((cat) => (
                      <Checkbox
                        key={cat.id}
                        value={String(cat.id)}
                        colorScheme="blue"
                        borderColor="gray.300"
                        sx={{
                          '.chakra-checkbox__control': {
                            borderRadius: '4px',
                          },
                        }}
                      >
                        <Text fontSize="sm" color="gray.700">
                          {cat.name}
                        </Text>
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>
                <FormErrorMessage>{errors.interests}</FormErrorMessage>
              </FormControl>

              <Divider />

              {/* ── Kriteria 3: Preferensi Aktivitas ── */}
              <FormControl isInvalid={!!errors.activities}>
                <FormLabel color="gray.700" fontWeight="semibold" mb={1}>
                  3. Preferensi Aktivitas
                </FormLabel>
                <FormHelperText color="gray.400" mt={0} mb={3} fontSize="xs">
                  Aktivitas ditampilkan berdasarkan minat yang kamu pilih. Pilih minimal 1.
                </FormHelperText>

                {selectedInterests.length === 0 ? (
                  <Box
                    bg="gray.50"
                    border="1px dashed"
                    borderColor="gray.200"
                    borderRadius="lg"
                    px={5}
                    py={4}
                  >
                    <Text color="gray.400" fontSize="sm">
                      Pilih minat wisata dulu (bagian 2) untuk melihat pilihan aktivitas.
                    </Text>
                  </Box>
                ) : relevantActivities.length === 0 ? (
                  <Box bg="gray.50" borderRadius="lg" px={5} py={4}>
                    <Text color="gray.400" fontSize="sm">
                      Tidak ada aktivitas untuk minat yang dipilih.
                    </Text>
                  </Box>
                ) : (
                  <>
                    {/* Kelompokkan aktivitas per kategori yang dipilih */}
                    <VStack spacing={4} align="stretch">
                      {formData.categories
                        .filter((cat) => selectedInterests.includes(String(cat.id)))
                        .map((cat) => (
                          <Box key={cat.id}>
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color="blue.500"
                              textTransform="uppercase"
                              letterSpacing="wide"
                              mb={2}
                            >
                              {cat.name}
                            </Text>
                            <CheckboxGroup
                              value={selectedActivities}
                              onChange={(vals) => setSelectedActivities(vals as string[])}
                            >
                              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                                {cat.open_trip_activities.map((act) => (
                                  <Checkbox
                                    key={act.id}
                                    value={String(act.id)}
                                    colorScheme="blue"
                                    borderColor="gray.300"
                                    sx={{
                                      '.chakra-checkbox__control': {
                                        borderRadius: '4px',
                                      },
                                    }}
                                  >
                                    <Text fontSize="sm" color="gray.700">
                                      {act.name}
                                    </Text>
                                  </Checkbox>
                                ))}
                              </SimpleGrid>
                            </CheckboxGroup>
                          </Box>
                        ))}
                    </VStack>
                  </>
                )}
                <FormErrorMessage>{errors.activities}</FormErrorMessage>
              </FormControl>

              <Divider />

              {/* ── Kriteria 4: Budget ── */}
              <FormControl isInvalid={!!errors.budget}>
                <FormLabel color="gray.700" fontWeight="semibold" mb={1}>
                  4. Budget Perjalanan
                </FormLabel>
                <FormHelperText color="gray.400" mt={0} mb={3} fontSize="xs">
                  Rentang budget per orang untuk keseluruhan perjalanan ini.
                </FormHelperText>
                <RadioGroup value={budgetLevel} onChange={setBudgetLevel}>
                  <Stack spacing={3}>
                    {BUDGET_OPTIONS.map((opt) => (
                      <Radio
                        key={opt.value}
                        value={opt.value}
                        colorScheme="blue"
                        borderColor="gray.300"
                      >
                        <Text fontSize="sm" color="gray.700">
                          {opt.label}
                        </Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>{errors.budget}</FormErrorMessage>
              </FormControl>

              {/* ── Submit ── */}
              <Box pt={2}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  loadingText="Menyimpan..."
                  borderRadius="xl"
                  fontWeight="semibold"
                  isDisabled={!formData.already_joined && !formData.can_register}
                >
                  {formData.already_joined ? 'Perbarui Preferensi' : 'Gabung Waiting Room'}
                </Button>
                <Text
                  textAlign="center"
                  color="gray.400"
                  fontSize="xs"
                  mt={3}
                >
                  Dengan bergabung, kamu setuju untuk dicocokkan dengan peserta lain
                  berdasarkan preferensimu.
                </Text>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SmartOpenTripForm;
