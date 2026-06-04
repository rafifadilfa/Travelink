import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Heading, Text, useColorModeValue, VStack,
  Button, FormControl, FormLabel, Input, Textarea, Select,
  SimpleGrid, HStack, Checkbox, CheckboxGroup,
  useToast, Spinner, Image, Icon, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface RefItem { id: number; name: string; }
interface DayLabel { [key: number]: string; }
interface RefData {
  locations: RefItem[]; meeting_points: RefItem[];
  day_phases: RefItem[]; day_labels: DayLabel;
}

const EditTour: React.FC = () => {
  const navigate      = useNavigate();
  const { tourId }    = useParams<{ tourId: string }>();
  const toast         = useToast();

  // ── Semua useColorModeValue di sini (sebelum early return) ───────────────
  const cardBg    = useColorModeValue('white', 'gray.800');
  const inputBg   = useColorModeValue('gray.50', 'gray.700');
  const secondary = useColorModeValue('gray.500', 'gray.400');
  const dashedBorderColor = useColorModeValue('gray.300', 'gray.600');

  const [refData,      setRefData]      = useState<RefData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name,         setName]         = useState('');
  const [type,         setType]         = useState('regular');
  const [description,  setDescription]  = useState('');
  const [locationId,   setLocationId]   = useState('');
  const [meetingId,    setMeetingId]    = useState('');
  const [price,        setPrice]        = useState('');
  const [duration,     setDuration]     = useState('8');
  const [startTime,    setStartTime]    = useState('08:00');
  const [periodId,     setPeriodId]     = useState('');
  const [maxPax,       setMaxPax]       = useState('10');
  const [minPax,       setMinPax]       = useState('1');
  const [status,       setStatus]       = useState('draft');
  const [availDays,    setAvailDays]    = useState<string[]>([]);
  const [newImages,    setNewImages]    = useState<File[]>([]);
  const [newPreviews,  setNewPreviews]  = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: number; url: string }[]>([]);
  const [deleteIds,    setDeleteIds]    = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tourRes, refRes] = await Promise.all([
          guideApiClient.get(`/guide/tours/${tourId}`),
          guideApiClient.get('/guide/tours/reference'),
        ]);
        const t = tourRes.data.tour;
        const ref: RefData = refRes.data;

        setRefData(ref);
        setName(t.name ?? '');
        setType(t.type ?? 'regular');
        setDescription(t.description ?? '');
        setLocationId(String(t.location?.id ?? ''));
        setMeetingId(String(t.meeting_point?.id ?? ''));
        setPrice(String(t.price ?? ''));
        setDuration(String(t.duration ?? '8'));
        setStartTime(t.start_time ?? '08:00');
        setPeriodId(String(t.dayphase?.id ?? ''));
        setMaxPax(String(t.max_participants ?? '10'));
        setMinPax(String(t.min_participants ?? '1'));
        setStatus(t.status ?? 'draft');
        setAvailDays((t.availability_days ?? []).map(String));
        setExistingImages(
          (t.images ?? []).map((img: { id: number; url: string }) => ({
            id: img.id, url: img.url,
          }))
        );
      } catch {
        toast({ title: 'Gagal memuat data tour', status: 'error', duration: 4000, isClosable: true });
        navigate('/guide/tours');
      } finally {
        setLoading(false);
      }
    };
    if (tourId) load();
  }, [tourId]);

  // ── Loading state (setelah semua hooks dipanggil) ─────────────────────────
  if (loading) {
    return (
      <GuideLayout>
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="xl" color="blue.400" />
        </Flex>
      </GuideLayout>
    );
  }

  const handleNewImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImages(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNewImage = (idx: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const markDeleteExisting = (id: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setDeleteIds(prev => [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availDays.length === 0) {
      toast({ title: 'Pilih minimal 1 hari ketersediaan', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name); fd.append('type', type);
      fd.append('description', description); fd.append('location_id', locationId);
      fd.append('meeting_point_id', meetingId); fd.append('price', price);
      fd.append('duration', duration); fd.append('start_time', startTime);
      fd.append('period_id', periodId); fd.append('max_participants', maxPax);
      fd.append('min_participants', minPax); fd.append('status', status);
      availDays.forEach(d => fd.append('availability_days[]', d));
      deleteIds.forEach(id => fd.append('delete_image_ids[]', String(id)));
      newImages.forEach(f => fd.append('new_images[]', f));

      await guideApiClient.put(`/guide/tours/${tourId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast({ title: 'Paket wisata berhasil diperbarui!', status: 'success', duration: 3000, isClosable: true });
      navigate('/guide/tours');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      const msg    = errors
        ? Object.values(errors as Record<string, string[]>).flat().join(', ')
        : err.response?.data?.message ?? 'Gagal memperbarui.';
      toast({ title: 'Validasi gagal', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayLabels = refData?.day_labels ?? {};

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
          <Heading as="h1" size="xl">Edit Paket Wisata</Heading>
          <Button variant="outline" onClick={() => navigate('/guide/tours')}>Batal</Button>
        </Flex>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">

            {/* Informasi Dasar */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={5}>Informasi Dasar</Heading>
              <VStack spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Nama Paket</FormLabel>
                    <Input value={name} onChange={e => setName(e.target.value)} bg={inputBg} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Tipe Tour</FormLabel>
                    <Select value={type} onChange={e => setType(e.target.value)} bg={inputBg}>
                      <option value="regular">Reguler (Private)</option>
                      <option value="open_trip">Open Trip</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                <FormControl isRequired>
                  <FormLabel>Deskripsi</FormLabel>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)}
                    bg={inputBg} rows={4} />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Lokasi</FormLabel>
                    <Select value={locationId} onChange={e => setLocationId(e.target.value)} bg={inputBg} placeholder="Pilih lokasi">
                      {refData?.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Titik Kumpul</FormLabel>
                    <Select value={meetingId} onChange={e => setMeetingId(e.target.value)} bg={inputBg} placeholder="Pilih titik kumpul">
                      {refData?.meeting_points.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Harga & Jadwal */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={5}>Harga & Jadwal</Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Harga per Orang (Rp)</FormLabel>
                  <Input type="number" value={price} onChange={e => setPrice(e.target.value)} bg={inputBg} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Durasi (jam)</FormLabel>
                  <NumberInput min={1} max={24} value={duration} onChange={setDuration}>
                    <NumberInputField bg={inputBg} />
                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Jam Mulai</FormLabel>
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} bg={inputBg} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Sesi Waktu</FormLabel>
                  <Select value={periodId} onChange={e => setPeriodId(e.target.value)} bg={inputBg} placeholder="Pilih sesi">
                    {refData?.day_phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Maks Peserta</FormLabel>
                  <NumberInput min={1} value={maxPax} onChange={setMaxPax}>
                    <NumberInputField bg={inputBg} />
                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Min Peserta</FormLabel>
                  <NumberInput min={1} value={minPax} onChange={setMinPax}>
                    <NumberInputField bg={inputBg} />
                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Ketersediaan */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={2}>Jadwal Ketersediaan</Heading>
              <Text fontSize="sm" color={secondary} mb={4}>Pilih hari-hari tour tersedia (minimal 1).</Text>
              <CheckboxGroup value={availDays} onChange={vals => setAvailDays(vals as string[])}>
                <HStack spacing={4} flexWrap="wrap">
                  {Object.entries(dayLabels).map(([day, label]) => (
                    <Checkbox key={day} value={day} colorScheme="blue">{label}</Checkbox>
                  ))}
                </HStack>
              </CheckboxGroup>
            </Box>

            {/* Foto */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={2}>Foto Paket Wisata</Heading>
              <Text fontSize="sm" color={secondary} mb={4}>
                Foto yang sudah ada dapat dihapus. Foto baru dapat ditambahkan (JPG/PNG, maks 5MB).
              </Text>
              <Flex gap={3} flexWrap="wrap" align="center">
                {/* Foto existing */}
                {existingImages.map(img => (
                  <Box key={img.id} position="relative">
                    <Image src={img.url} boxSize="100px" objectFit="cover" borderRadius="md" />
                    <Button size="xs" position="absolute" top={-2} right={-2} borderRadius="full"
                      colorScheme="red" onClick={() => markDeleteExisting(img.id)} p={1}><FiX /></Button>
                  </Box>
                ))}
                {/* Foto baru (preview) */}
                {newPreviews.map((src, i) => (
                  <Box key={`new-${i}`} position="relative">
                    <Image src={src} boxSize="100px" objectFit="cover" borderRadius="md"
                      opacity={0.8} border="2px dashed" borderColor="blue.400" />
                    <Button size="xs" position="absolute" top={-2} right={-2} borderRadius="full"
                      colorScheme="blue" onClick={() => removeNewImage(i)} p={1}><FiX /></Button>
                  </Box>
                ))}
                {/* Tombol tambah */}
                <FormControl display="inline-block" w="auto">
                  <FormLabel
                    htmlFor="edit-tour-images"
                    border={`2px dashed`} borderColor={dashedBorderColor} borderRadius="md"
                    h="100px" w="100px" display="flex" flexDirection="column"
                    alignItems="center" justifyContent="center" cursor="pointer"
                    _hover={{ borderColor: 'blue.400' }} gap={1} m={0}
                  >
                    <Icon as={FiUpload} color={secondary} />
                    <Text fontSize="xs" color={secondary}>Tambah</Text>
                  </FormLabel>
                  <Input id="edit-tour-images" type="file" accept="image/jpg,image/jpeg,image/png"
                    multiple display="none" onChange={handleNewImageAdd} />
                </FormControl>
              </Flex>
            </Box>

            {/* Status */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Status Publikasi</Heading>
              <Select value={status} onChange={e => setStatus(e.target.value)} bg={inputBg} maxW="300px">
                <option value="draft">Draft (Tidak Tampil di Katalog)</option>
                <option value="published">Aktif (Tampil di Katalog)</option>
              </Select>
            </Box>

            <Flex justify={{ base: 'stretch', md: 'flex-end' }} gap={3} pb={4}>
              <Button variant="outline" onClick={() => navigate('/guide/tours')} w={{ base: 'full', md: 'auto' }}>Batal</Button>
              <Button type="submit" colorScheme="blue" leftIcon={<FiSave />}
                isLoading={isSubmitting} loadingText="Menyimpan..."
                w={{ base: 'full', md: 'auto' }}>
                Simpan Perubahan
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default EditTour;
