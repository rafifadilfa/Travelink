import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftAddon,
  Textarea,
  Select,
  Switch,
  SimpleGrid,
  Image,
  useToast,
  CloseButton,
  Spinner,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface ItineraryStep {
    time: string;
    activity: string;
}

interface ExistingImage {
    id: number;
    url: string;
}

const EditTour: React.FC = () => {
    const navigate   = useNavigate();
    const { tourId } = useParams<{ tourId: string }>();
    const toast      = useToast();

    const [loading,      setLoading]      = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Field form ────────────────────────────────────────────────
    const [title,       setTitle]       = useState('');
    const [description, setDescription] = useState('');
    const [location,    setLocation]    = useState('');
    const [priceRaw,    setPriceRaw]    = useState('');  // digit murni
    const [duration,    setDuration]    = useState('');
    const [category,    setCategory]    = useState('');
    const [isOpenTrip,  setIsOpenTrip]  = useState(false);

    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const [itinerary, setItinerary] = useState<ItineraryStep[]>([{ time: '', activity: '' }]);
    const [included,  setIncluded]  = useState<string[]>(['']);
    const [excluded,  setExcluded]  = useState<string[]>(['']);

    // ── Foto ──────────────────────────────────────────────────────
    const [existingImages,  setExistingImages]  = useState<ExistingImage[]>([]);
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
    const [photoFiles,      setPhotoFiles]      = useState<File[]>([]);
    const [photoPreviews,   setPhotoPreviews]   = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cardBg        = useColorModeValue('white', 'gray.800');
    const inputBg       = useColorModeValue('gray.50', 'gray.700');
    const dropzoneBorder = useColorModeValue('gray.300', 'gray.600');

    const DAY_LABELS = [
        { value: 1, label: 'Senin' }, { value: 2, label: 'Selasa' },
        { value: 3, label: 'Rabu' },  { value: 4, label: 'Kamis' },
        { value: 5, label: 'Jumat' }, { value: 6, label: 'Sabtu' },
        { value: 0, label: 'Minggu' },
    ];

    const toggleDay = (val: number) =>
        setSelectedDays(prev =>
            prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
        );

    // ── Format tampilan harga ─────────────────────────────────────
    const formatPrice = (raw: string): string => {
        if (!raw) return '';
        return Number(raw).toLocaleString('id-ID');
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/[^0-9]/g, '');
        setPriceRaw(digits ? String(Number(digits)) : '');
    };

    // ── Load data tour saat mount ─────────────────────────────────
    useEffect(() => {
        if (!tourId) return;
        guideApiClient.get(`/guide/tours/${tourId}`)
            .then(res => {
                const t = res.data.tour;
                setTitle(t.title ?? '');
                setDescription(t.description ?? '');
                setLocation(t.location ?? '');
                setPriceRaw(t.price ?? '0');
                setDuration(t.duration ?? '');
                setCategory(t.category ?? '');
                setIsOpenTrip(Boolean(t.is_open_trip));
                setSelectedDays(Array.isArray(t.available_days) ? t.available_days.map(Number) : []);
                setItinerary(t.itinerary?.length  ? t.itinerary  : [{ time: '', activity: '' }]);
                setIncluded(t.included?.length    ? t.included   : ['']);
                setExcluded(t.excluded?.length    ? t.excluded   : ['']);
                setExistingImages(t.images ?? []);
            })
            .catch(() => {
                toast({ title: 'Tour tidak ditemukan', status: 'error' });
                navigate('/guide/tours');
            })
            .finally(() => setLoading(false));
    }, [tourId]);

    // ── Foto baru ─────────────────────────────────────────────────
    const totalPhotoCount = existingImages.length + photoFiles.length;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const remaining = 10 - totalPhotoCount;
        const accepted  = files.slice(0, remaining);

        setPhotoFiles(prev => [...prev, ...accepted]);
        accepted.forEach(f => {
            const reader = new FileReader();
            reader.onload = ev => {
                setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(f);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeNewPhoto = (index: number) => {
        setPhotoFiles(prev    => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // ── Hapus foto lama ───────────────────────────────────────────
    const removeExistingImage = async (imageId: number) => {
        setDeletingImageId(imageId);
        try {
            await guideApiClient.delete(`/guide/tours/${tourId}/images/${imageId}`);
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch {
            toast({ title: 'Gagal menghapus foto', status: 'error', duration: 3000, isClosable: true });
        } finally {
            setDeletingImageId(null);
        }
    };

    // ── Itinerary & list helpers ──────────────────────────────────
    const handleItineraryChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setItinerary(prev => prev.map((item, i) =>
            i === index ? { ...item, [name as keyof ItineraryStep]: value } : item
        ));
    };

    const handleListChange = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        list: string[], index: number,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const values = [...list];
        values[index] = event.target.value;
        setter(values);
    };

    // ── Submit ────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDays.length === 0) {
            toast({ title: 'Pilih minimal satu hari ketersediaan paket', status: 'error', duration: 4000, isClosable: true });
            return;
        }
        setIsSubmitting(true);
        try {
            await guideApiClient.put(`/guide/tours/${tourId}`, {
                title,
                description,
                location,
                price:          Number(priceRaw) || 0,
                duration,
                category,
                is_open_trip:   isOpenTrip,
                available_days: selectedDays,
                itinerary:      itinerary.filter(s => s.activity.trim()),
                included:       included.filter(s => s.trim()),
                excluded:       excluded.filter(s => s.trim()),
            });

            // Upload foto baru (kalau ada)
            if (photoFiles.length > 0) {
                const formData = new FormData();
                photoFiles.forEach(f => formData.append('images[]', f));
                await guideApiClient.post(`/guide/tours/${tourId}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            toast({
                title:       'Tour berhasil diperbarui!',
                status:      'success',
                duration:    5000,
                isClosable:  true,
                position:    'top',
            });
            navigate('/guide/tours');
        } catch (err: any) {
            toast({
                title:       'Gagal memperbarui tour',
                description: err.response?.data?.message ?? 'Coba lagi.',
                status:      'error',
                duration:    5000,
                isClosable:  true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <GuideLayout>
                <Flex justify="center" align="center" height="50vh">
                    <Spinner size="xl" />
                    <Text ml={4}>Memuat data tour...</Text>
                </Flex>
            </GuideLayout>
        );
    }

    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Heading as="h1" size="xl" mb={8}>
                    Edit Tour
                </Heading>

                <form onSubmit={handleSubmit}>
                    <VStack spacing={8} align="stretch">
                        {/* ── Informasi Dasar ───────────────────────────── */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Informasi Dasar</Heading>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Judul Tour</FormLabel>
                                    <Input
                                        placeholder="cth. Jakarta Historical City Tour"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        bg={inputBg}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Deskripsi</FormLabel>
                                    <Textarea
                                        placeholder="Tulis deskripsi menarik tentang tour ini."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        bg={inputBg}
                                        rows={5}
                                    />
                                </FormControl>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Lokasi</FormLabel>
                                        <Input
                                            placeholder="cth. Bali, Indonesia"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            bg={inputBg}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Kategori</FormLabel>
                                        <Select
                                            placeholder="Pilih kategori"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            bg={inputBg}
                                        >
                                            <option value="Beach">Pantai</option>
                                            <option value="Mountain">Pegunungan</option>
                                            <option value="City">Perkotaan</option>
                                            <option value="Culture">Budaya</option>
                                            <option value="Diving">Diving</option>
                                            <option value="Nature">Alam</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>{isOpenTrip ? 'Harga Paket' : 'Harga per Orang'}</FormLabel>
                                        <InputGroup>
                                            <InputLeftAddon>Rp</InputLeftAddon>
                                            <Input
                                                placeholder="cth. 500000"
                                                value={formatPrice(priceRaw)}
                                                onChange={handlePriceChange}
                                                bg={inputBg}
                                                borderLeftRadius={0}
                                            />
                                        </InputGroup>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Durasi Tour</FormLabel>
                                        <Input
                                            placeholder="cth. 8 jam atau 3 hari"
                                            value={duration}
                                            onChange={e => setDuration(e.target.value)}
                                            bg={inputBg}
                                        />
                                    </FormControl>
                                </SimpleGrid>
                                <FormControl display="flex" alignItems="center" gap={3}>
                                    <Switch
                                        id="is-open-trip"
                                        colorScheme="purple"
                                        isChecked={isOpenTrip}
                                        onChange={e => setIsOpenTrip(e.target.checked)}
                                    />
                                    <FormLabel htmlFor="is-open-trip" mb={0} cursor="pointer">
                                        Jadikan Smart Open Trip
                                    </FormLabel>
                                </FormControl>

                                {/* TC-031: Jadwal Ketersediaan */}
                                <FormControl isRequired>
                                    <FormLabel>Jadwal Ketersediaan</FormLabel>
                                    <Wrap spacing={2}>
                                        {DAY_LABELS.map(d => (
                                            <WrapItem key={d.value}>
                                                <Button
                                                    size="sm"
                                                    variant={selectedDays.includes(d.value) ? 'solid' : 'outline'}
                                                    colorScheme="blue"
                                                    onClick={() => toggleDay(d.value)}
                                                    type="button"
                                                >
                                                    {d.label}
                                                </Button>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                    <FormHelperText>
                                        Pilih hari-hari saat Anda tersedia untuk memandu tour ini. Pilih minimal 1 hari.
                                    </FormHelperText>
                                </FormControl>
                            </VStack>
                        </Box>

                        {/* ── Foto Tour ─────────────────────────────────── */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={2}>Foto Tour</Heading>
                            <Text fontSize="sm" color="gray.500" mb={4}>
                                Maksimal 10 foto (JPG/PNG/WebP, maks 5 MB per foto)
                            </Text>

                            {/* Foto yang sudah ada */}
                            {existingImages.length > 0 && (
                                <Box mb={4}>
                                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                                        Foto tersimpan ({existingImages.length})
                                    </Text>
                                    <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3}>
                                        {existingImages.map(img => (
                                            <Box key={img.id} position="relative">
                                                <Image
                                                    src={img.url}
                                                    alt={`foto-${img.id}`}
                                                    borderRadius="md"
                                                    objectFit="cover"
                                                    w="full"
                                                    h="90px"
                                                />
                                                <CloseButton
                                                    size="sm"
                                                    position="absolute"
                                                    top={1} right={1}
                                                    bg="blackAlpha.600"
                                                    color="white"
                                                    borderRadius="full"
                                                    isDisabled={deletingImageId === img.id}
                                                    onClick={() => removeExistingImage(img.id)}
                                                    _hover={{ bg: 'red.500' }}
                                                />
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            )}

                            {/* Area upload foto baru */}
                            <Flex
                                border="2px dashed"
                                borderColor={dropzoneBorder}
                                borderRadius="lg" p={8}
                                align="center" justify="center" direction="column"
                                cursor={totalPhotoCount >= 10 ? 'not-allowed' : 'pointer'}
                                _hover={totalPhotoCount < 10 ? { borderColor: 'blue.400' } : {}}
                                opacity={totalPhotoCount >= 10 ? 0.5 : 1}
                                onClick={() => totalPhotoCount < 10 && fileInputRef.current?.click()}
                            >
                                <Icon as={FiUploadCloud} w={10} h={10} color="gray.500" />
                                <Text mt={3} color="gray.500" fontWeight="medium">
                                    Klik untuk tambah foto
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                    {totalPhotoCount}/10 foto
                                </Text>
                            </Flex>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {/* Preview foto baru yang dipilih */}
                            {photoPreviews.length > 0 && (
                                <Box mt={4}>
                                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                                        Foto baru ({photoPreviews.length})
                                    </Text>
                                    <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3}>
                                        {photoPreviews.map((src, i) => (
                                            <Box key={i} position="relative">
                                                <Image
                                                    src={src}
                                                    alt={`preview-${i}`}
                                                    borderRadius="md"
                                                    objectFit="cover"
                                                    w="full"
                                                    h="90px"
                                                />
                                                <CloseButton
                                                    size="sm"
                                                    position="absolute"
                                                    top={1} right={1}
                                                    bg="blackAlpha.600"
                                                    color="white"
                                                    borderRadius="full"
                                                    onClick={() => removeNewPhoto(i)}
                                                    _hover={{ bg: 'red.500' }}
                                                />
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            )}
                        </Box>

                        {/* ── Itinerary ─────────────────────────────────── */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Itinerary</Heading>
                            <VStack spacing={4} align="stretch">
                                {itinerary.map((step, index) => (
                                    <HStack key={index} spacing={4}>
                                        <Input
                                            placeholder="Waktu (cth. 09:00)"
                                            name="time" value={step.time}
                                            onChange={e => handleItineraryChange(index, e)}
                                            bg={inputBg} w="150px"
                                        />
                                        <Input
                                            placeholder="Deskripsi aktivitas"
                                            name="activity" value={step.activity}
                                            onChange={e => handleItineraryChange(index, e)}
                                            bg={inputBg}
                                        />
                                        <IconButton
                                            icon={<FiTrash2 />} aria-label="Hapus langkah"
                                            colorScheme="red" variant="ghost"
                                            onClick={() => {
                                                if (itinerary.length > 1)
                                                    setItinerary(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            isDisabled={itinerary.length === 1}
                                        />
                                    </HStack>
                                ))}
                                <Button
                                    leftIcon={<FiPlus />}
                                    onClick={() => setItinerary(prev => [...prev, { time: '', activity: '' }])}
                                    alignSelf="flex-start"
                                >
                                    Tambah Langkah
                                </Button>
                            </VStack>
                        </Box>

                        {/* ── Termasuk & Tidak Termasuk ─────────────────── */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Yang Termasuk & Tidak Termasuk</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="green.400">Termasuk</Heading>
                                    {included.map((item, index) => (
                                        <HStack key={index}>
                                            <Input
                                                value={item}
                                                onChange={e => handleListChange(setIncluded, included, index, e)}
                                                placeholder="cth. Antar-jemput hotel" bg={inputBg}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />} aria-label="Hapus"
                                                onClick={() => { if (included.length > 1) setIncluded(prev => prev.filter((_, i) => i !== index)); }}
                                                variant="ghost" isDisabled={included.length === 1}
                                            />
                                        </HStack>
                                    ))}
                                    <Button size="sm" onClick={() => setIncluded(prev => [...prev, ''])} leftIcon={<FiPlus />}>
                                        Tambah Item
                                    </Button>
                                </VStack>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="red.400">Tidak Termasuk</Heading>
                                    {excluded.map((item, index) => (
                                        <HStack key={index}>
                                            <Input
                                                value={item}
                                                onChange={e => handleListChange(setExcluded, excluded, index, e)}
                                                placeholder="cth. Pengeluaran pribadi" bg={inputBg}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />} aria-label="Hapus"
                                                onClick={() => { if (excluded.length > 1) setExcluded(prev => prev.filter((_, i) => i !== index)); }}
                                                variant="ghost" isDisabled={excluded.length === 1}
                                            />
                                        </HStack>
                                    ))}
                                    <Button size="sm" onClick={() => setExcluded(prev => [...prev, ''])} leftIcon={<FiPlus />}>
                                        Tambah Item
                                    </Button>
                                </VStack>
                            </SimpleGrid>
                        </Box>

                        {/* ── Aksi ──────────────────────────────────────── */}
                        <Flex justify="flex-end" gap={4} py={4}>
                            <Button variant="ghost" onClick={() => navigate('/guide/tours')}>Batal</Button>
                            <Button colorScheme="blue" type="submit" isLoading={isSubmitting} loadingText="Menyimpan...">
                                Simpan Perubahan
                            </Button>
                        </Flex>
                    </VStack>
                </form>
            </Box>
        </GuideLayout>
    );
};

export default EditTour;
