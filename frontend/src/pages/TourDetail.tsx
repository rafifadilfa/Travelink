import React, { useState, useEffect } from 'react';
import {
    Alert,
    AlertIcon,
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    Image,
    Input,
    SimpleGrid,
    Spinner,
    Text,
    useColorModeValue,
    useToast,
    VStack,
    Wrap,
    WrapItem,
    Avatar,
} from '@chakra-ui/react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { FiCalendar, FiClock, FiMapPin, FiMessageCircle, FiStar } from 'react-icons/fi';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// ─── Animasi ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Tipe data dari API ─────────────────────────────────────────────────────
interface TourData {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string;
    rating: number;
    reviews_count: number;
    is_open_trip: boolean;
    status: string;
    location: string;
    categories: string[];
    images: { id: number; url: string }[];
    itinerary: { time: string; activity: string }[];
    included: string[];
    excluded: string[];
    available_days: { day_of_week: number; label: string }[];
    guide: {
        id: number;
        name: string;
        rating: number;
        avatar: string | null;
    } | null;
}

const TourDetail: React.FC = () => {
    const navigate   = useNavigate();
    const toast      = useToast();
    const { id }     = useParams<{ id: string }>();
    const { state }  = useLocation() as { state: { is_open_trip?: boolean } | null };

    const [tour,           setTour]           = useState<TourData | null>(null);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState(false);
    const [activeImage,    setActiveImage]    = useState(0);
    const [activeTab,      setActiveTab]      = useState(0);
    const [participants,   setParticipants]   = useState(1);
    const [tourDate,       setTourDate]       = useState('');
    const [dateError,      setDateError]      = useState('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isBooking,      setIsBooking]      = useState(false);
    const [loadingAvail,   setLoadingAvail]   = useState(false);

    // ── Fetch data tour ──────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        apiClient.get(`/tours/${id}`)
            .then(res => setTour(res.data.tour))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Fetch jadwal ketersediaan ────────────────────────────────
    useEffect(() => {
        if (!id) return;
        setLoadingAvail(true);
        apiClient.get(`/tours/${id}/availabilities`)
            .then(res => setAvailableDates(res.data.available_dates ?? []))
            .catch(() => {}) // non-fatal
            .finally(() => setLoadingAvail(false));
    }, [id]);

    // is_open_trip bisa dari state navigasi (dari ViewAllTours) atau dari data API
    const isOpenTrip = state?.is_open_trip ?? tour?.is_open_trip ?? false;

    // ── Warna ────────────────────────────────────────────────────
    const overallBg           = useColorModeValue('gray.50', 'gray.900');
    const cardBg              = useColorModeValue('white', 'gray.800');
    const primaryColor        = useColorModeValue('blue.500', 'blue.400');
    const primaryHoverColor   = useColorModeValue('blue.600', 'blue.500');
    const primaryTextColor    = useColorModeValue('gray.800', 'whiteAlpha.900');
    const secondaryTextColor  = useColorModeValue('gray.600', 'gray.400');
    const subtleBorderColor   = useColorModeValue('gray.200', 'gray.700');
    const accentSuccess       = useColorModeValue('green.500', 'green.400');
    const accentError         = useColorModeValue('red.500', 'red.400');
    const subtleInputBg       = useColorModeValue('gray.100', 'gray.700');
    const accentGradient      = `linear(to-br, ${useColorModeValue('purple.400','purple.300')}, ${useColorModeValue('blue.500','blue.400')})`;

    const ctaButtonStyle = {
        borderRadius: 'lg', fontWeight: 'bold', h: '52px',
        px: 6, fontSize: 'md',
        transition: 'all 0.3s ease',
        _active:  { transform: 'translateY(1px) scale(0.97)' },
        _hover:   { transform: 'translateY(-3px)', boxShadow: 'xl' },
    };

    const formatPrice = (price: number): string =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    // ── Loading & error state ─────────────────────────────────────
    if (loading) {
        return (
            <Box minH="100vh" bg={overallBg} display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" color="blue.400" />
            </Box>
        );
    }

    if (error || !tour) {
        return (
            <Box minH="100vh" bg={overallBg} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
                <Text fontSize="xl" color={secondaryTextColor}>Tour tidak ditemukan.</Text>
                <Button colorScheme="blue" onClick={() => navigate('/tours')}>Kembali ke Daftar Tour</Button>
            </Box>
        );
    }

    const totalPrice   = tour.price * participants;
    const tourImages   = tour.images.length > 0 ? tour.images : [];
    const maxGroupSize = 10;
    const minGroupSize = 1;
    const noSchedule   = !loadingAvail && availableDates.length === 0;

    const handleIncreaseParticipants = () => { if (participants < maxGroupSize) setParticipants(p => p + 1); };
    const handleDecreaseParticipants = () => { if (participants > minGroupSize)  setParticipants(p => p - 1); };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v) && v >= minGroupSize && v <= maxGroupSize) setParticipants(v);
        else if (e.target.value === '') setParticipants(minGroupSize);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTourDate(val);
        if (!val) { setDateError(''); return; }
        if (availableDates.length > 0 && !availableDates.includes(val)) {
            setDateError('Tanggal ini tidak tersedia. Pilih tanggal yang tersedia sesuai jadwal pemandu.');
        } else {
            setDateError('');
        }
    };

    // TC-041: Buat booking langsung via API, lalu redirect ke /bookings
    const handleBookNow = async () => {
        if (!tourDate) {
            toast({ title: 'Pilih tanggal tour terlebih dahulu.', status: 'warning', duration: 3000, isClosable: true });
            return;
        }
        if (availableDates.length > 0 && !availableDates.includes(tourDate)) {
            toast({ title: 'Tanggal tidak tersedia.', description: 'Pilih tanggal sesuai jadwal ketersediaan pemandu.', status: 'error', duration: 4000, isClosable: true });
            return;
        }
        setIsBooking(true);
        try {
            await apiClient.post('/bookings', {
                tour_id:      tour.id,
                participants,
                tour_date:    tourDate,
            });
            toast({
                title: 'Booking berhasil dibuat!',
                description: 'Pemandu akan segera mengonfirmasi pesanan Anda.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            navigate('/bookings');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({ title: msg ?? 'Gagal membuat booking. Coba lagi.', status: 'error', duration: 4000, isClosable: true });
        } finally {
            setIsBooking(false);
        }
    };

    // Tanggal minimum yang bisa dipilih (besok)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    // Tanggal maksimum 3 bulan ke depan
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
            {/* ── Sticky Header ── */}
            <TouristNavbar />

            <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
                {/* ── Breadcrumbs ── */}
                <Flex fontSize="sm" color={secondaryTextColor} mb={4} align="center" animation={`${slideInUp} 0.6s ease-out`}>
                    <Text cursor="pointer" _hover={{ color: primaryColor }} onClick={() => navigate('/dashboard')}>Beranda</Text>
                    <Text mx={2}>/</Text>
                    <Text cursor="pointer" _hover={{ color: primaryColor }} onClick={() => navigate('/tours')}>Tour</Text>
                    <Text mx={2}>/</Text>
                    <Text fontWeight="medium" color={primaryTextColor}>{tour.name}</Text>
                </Flex>

                {/* ── Judul & rating ── */}
                <Box pb={{ base: 5, md: 6 }} mb={10} borderBottom="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.1s both`}>
                    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
                        <Box>
                            <Heading as="h1" size="xl" color={primaryTextColor} mb={3} fontWeight="bold">{tour.name}</Heading>
                            <HStack spacing={3} flexWrap="wrap">
                                <Badge variant="subtle" colorScheme="blue" px={3} py={1.5} borderRadius="full" display="flex" alignItems="center">
                                    <Icon as={FiMapPin} mr={1.5} />
                                    {tour.location}
                                </Badge>
                                {tour.rating > 0 && (
                                    <Badge variant="subtle" colorScheme="yellow" px={3} py={1.5} borderRadius="full" display="flex" alignItems="center">
                                        <Icon as={FiStar} color="yellow.500" mr={1.5} />
                                        <Text fontWeight="bold" mr={1} color={primaryTextColor}>{tour.rating.toFixed(1)}</Text>
                                        <Text color={secondaryTextColor}>({tour.reviews_count} ulasan)</Text>
                                    </Badge>
                                )}
                                {isOpenTrip && (
                                    <Badge colorScheme="purple" px={3} py={1.5} borderRadius="full">
                                        ✨ Smart Open Trip
                                    </Badge>
                                )}
                            </HStack>
                        </Box>
                        <Box mt={{ base: 4, md: 0 }} flexShrink={0}>
                            <Badge bgGradient={accentGradient} color="white" px={5} py={3} borderRadius="lg" fontSize="xl" fontWeight="bold" boxShadow="lg">
                                {formatPrice(tour.price)}
                                <Text as="span" fontSize="sm" fontWeight="normal" ml={1.5} opacity={0.9}>{isOpenTrip ? '/paket' : '/orang'}</Text>
                            </Badge>
                        </Box>
                    </Flex>
                </Box>

                <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, md: 8 }} mb={10}>
                    {/* ── Galeri Foto ── */}
                    <Box flex="1.5" animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
                        {tourImages.length > 0 ? (
                            <>
                                <Box position="relative" borderRadius="xl" overflow="hidden" boxShadow="xl" mb={4} h={{ base: '300px', md: '450px' }} bg={useColorModeValue('gray.200', 'gray.700')}>
                                    <Image
                                        src={tourImages[activeImage]?.url}
                                        alt={`${tour.name} - Foto ${activeImage + 1}`}
                                        w="100%" h="100%" objectFit="cover"
                                        transition="transform 0.4s ease-in-out"
                                        _hover={{ transform: 'scale(1.05)' }}
                                    />
                                    {tourImages.length > 1 && (
                                        <Flex position="absolute" bottom="15px" left="50%" transform="translateX(-50%)" bg="blackAlpha.600" backdropFilter="blur(5px)" borderRadius="full" py={1.5} px={3} gap={2.5}>
                                            {tourImages.map((_, index) => (
                                                <Box key={index} w="10px" h="10px" borderRadius="full" bg={activeImage === index ? primaryColor : 'whiteAlpha.700'} cursor="pointer" onClick={() => setActiveImage(index)} transition="all 0.3s ease" />
                                            ))}
                                        </Flex>
                                    )}
                                </Box>
                                {tourImages.length > 1 && (
                                    <HStack spacing={3} overflowX="auto" pb={3}>
                                        {tourImages.map((image, index) => (
                                            <Box key={index} borderRadius="lg" overflow="hidden" borderWidth={activeImage === index ? '3px' : '0px'} borderColor={activeImage === index ? primaryColor : 'transparent'} w="120px" h="80px" cursor="pointer" onClick={() => setActiveImage(index)} flexShrink={0} transition="all 0.3s ease" _hover={{ transform: 'scale(1.05)', borderColor: primaryHoverColor }}>
                                                <Image src={image.url} alt={`Thumbnail ${index + 1}`} width="100%" height="100%" objectFit="cover" />
                                            </Box>
                                        ))}
                                    </HStack>
                                )}
                            </>
                        ) : (
                            <Flex h={{ base: '300px', md: '450px' }} bg={useColorModeValue('gray.200', 'gray.700')} borderRadius="xl" align="center" justify="center">
                                <Text color={secondaryTextColor}>Belum ada foto tour</Text>
                            </Flex>
                        )}
                    </Box>

                    {/* ── Kartu Booking ── */}
                    <Box flex="1" bg={cardBg} p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="xl" height="fit-content" borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
                        <Heading size="lg" mb={6} color={primaryTextColor} fontWeight="bold" pb={3} borderBottom="2px solid" borderColor={subtleBorderColor}>Pesan Tour Ini</Heading>
                        <VStack spacing={5} align="stretch">

                            {/* TC-038: Jadwal Ketersediaan */}
                            {loadingAvail ? (
                                <Flex align="center" gap={2}>
                                    <Spinner size="xs" color="blue.400" />
                                    <Text fontSize="sm" color={secondaryTextColor}>Memuat jadwal...</Text>
                                </Flex>
                            ) : tour.available_days && tour.available_days.length > 0 ? (
                                <Box bg={useColorModeValue('blue.50', 'blue.900')} p={3} borderRadius="lg" border="1px solid" borderColor={useColorModeValue('blue.100', 'blue.700')}>
                                    <HStack mb={2}>
                                        <Icon as={FiCalendar} color={primaryColor} />
                                        <Text fontSize="sm" fontWeight="semibold" color={primaryColor}>Jadwal Ketersediaan</Text>
                                    </HStack>
                                    <Wrap spacing={2}>
                                        {tour.available_days.map(d => (
                                            <WrapItem key={d.day_of_week}>
                                                <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1} fontSize="xs">{d.label}</Badge>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </Box>
                            ) : null}

                            {/* TC-040: Tidak ada jadwal tersedia */}
                            {noSchedule && !isOpenTrip && (
                                <Alert status="warning" borderRadius="lg" fontSize="sm">
                                    <AlertIcon />
                                    <Box>
                                        <Text fontWeight="semibold">Tidak ada jadwal tersedia</Text>
                                        <Text>Paket ini belum memiliki jadwal ketersediaan. Coba paket wisata lain.</Text>
                                    </Box>
                                </Alert>
                            )}

                            {/* TC-039: Pilih Tanggal Tour — hanya untuk Private Tour */}
                            {!noSchedule && !isOpenTrip && (
                                <Box>
                                    <Text fontWeight="bold" fontSize="md" color={primaryTextColor} mb={2}>Tanggal Tour</Text>
                                    {availableDates.length > 0 && (
                                        <Text fontSize="xs" color={secondaryTextColor} mb={2}>
                                            Pilih tanggal sesuai jadwal ketersediaan pemandu
                                        </Text>
                                    )}
                                    <Input
                                        type="date"
                                        value={tourDate}
                                        min={minDateStr}
                                        max={maxDateStr}
                                        onChange={handleDateChange}
                                        focusBorderColor={dateError ? 'red.400' : primaryColor}
                                        borderColor={dateError ? 'red.400' : undefined}
                                        bg={subtleInputBg}
                                        borderRadius="lg"
                                        h="42px"
                                    />
                                    {dateError && (
                                        <Text fontSize="xs" color="red.500" mt={1}>{dateError}</Text>
                                    )}
                                </Box>
                            )}

                            {!noSchedule && !isOpenTrip && (
                                <Box>
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontWeight="bold" fontSize="md" color={primaryTextColor}>Jumlah Peserta</Text>
                                        <Badge colorScheme="blue" variant="solid" px={2} py={0.5} borderRadius="md" fontSize="xs">Maks {maxGroupSize}</Badge>
                                    </HStack>
                                    <Flex align="center" justify="space-between" bg={useColorModeValue('gray.100', 'gray.700')} p={3} borderRadius="lg">
                                        <HStack>
                                            <Button size="sm" isDisabled={participants <= minGroupSize} onClick={handleDecreaseParticipants} borderRadius="full" w="36px" h="36px">-</Button>
                                            <Input type="number" value={participants} onChange={handleInputChange} min={minGroupSize} max={maxGroupSize} mx={1} textAlign="center" fontWeight="bold" w="60px" h="36px" bg={cardBg} focusBorderColor={primaryColor} />
                                            <Button size="sm" isDisabled={participants >= maxGroupSize} onClick={handleIncreaseParticipants} borderRadius="full" w="36px" h="36px">+</Button>
                                        </HStack>
                                        <Text color={secondaryTextColor} fontWeight="medium" fontSize="sm" pr={2}>× {formatPrice(tour.price)}</Text>
                                    </Flex>
                                </Box>
                            )}

                            {!noSchedule && !isOpenTrip && (
                                <Box bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="lg" borderLeft="5px solid" borderColor={primaryColor} boxShadow="md">
                                    <Flex justify="space-between" align="center">
                                        <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>Total Harga</Text>
                                        <Text fontSize="xl" fontWeight="extrabold" color={primaryColor}>{formatPrice(totalPrice)}</Text>
                                    </Flex>
                                    <Text fontSize="xs" color={secondaryTextColor} mt={1}>{participants} orang × {formatPrice(tour.price)}</Text>
                                </Box>
                            )}

                            {isOpenTrip && (
                                <Box>
                                    <Button
                                        {...ctaButtonStyle}
                                        w="full"
                                        bgGradient="linear(to-r, purple.500, blue.500)"
                                        color="white"
                                        _hover={{ bgGradient: 'linear(to-r, purple.600, blue.600)', transform: 'translateY(-3px)', boxShadow: 'xl' }}
                                        onClick={() => navigate(`/open-trip/join/${id}`)}
                                        leftIcon={<Text fontSize="xl">✨</Text>}
                                    >
                                        Ikut Smart Open Trip
                                    </Button>
                                    <Text fontSize="xs" color={secondaryTextColor} textAlign="center" mt={2}>
                                        Bergabung dengan wisatawan lain &amp; hemat biaya bersama
                                    </Text>
                                </Box>
                            )}

                            {/* TC-041: Tombol booking langsung ke API */}
                            {!noSchedule && !isOpenTrip && (
                                <Button
                                    {...ctaButtonStyle}
                                    bgGradient="linear(to-r, green.400, green.500)"
                                    color="white"
                                    _hover={{ bgGradient: 'linear(to-r, green.500, green.600)' }}
                                    onClick={handleBookNow}
                                    isLoading={isBooking}
                                    loadingText="Memproses..."
                                    isDisabled={!!dateError}
                                    leftIcon={<Text fontSize="xl">🎫</Text>}
                                >
                                    Pesan Sekarang
                                </Button>
                            )}

                            {noSchedule && !isOpenTrip && (
                                <Button
                                    {...ctaButtonStyle}
                                    w="full"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => navigate('/tours')}
                                >
                                    Lihat Paket Lain
                                </Button>
                            )}

                            {!noSchedule && (
                                <Text fontSize="sm" color={secondaryTextColor} textAlign="center">✨ Pembatalan gratis hingga 24 jam sebelum tour</Text>
                            )}
                        </VStack>
                    </Box>
                </Flex>

                {/* ── Info & Guide ── */}
                <Box bg={cardBg} p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="xl" mb={10} animation={`${slideInUp} 0.7s ease-out 0.4s both`} border="1px solid" borderColor={subtleBorderColor}>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="start">
                        <Box>
                            <Heading size="lg" mb={6} color={primaryTextColor} fontWeight="bold">Detail Tour</Heading>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5}>
                                {tour.duration && (
                                    <Flex align="center" bg={useColorModeValue('gray.100', 'gray.700')} p={4} borderRadius="lg">
                                        <Icon as={FiClock} boxSize={6} color={primaryColor} mr={4} />
                                        <Box>
                                            <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium">Durasi</Text>
                                            <Text fontWeight="bold" color={primaryTextColor}>{tour.duration}</Text>
                                        </Box>
                                    </Flex>
                                )}
                                {tour.location && (
                                    <Flex align="center" bg={useColorModeValue('gray.100', 'gray.700')} p={4} borderRadius="lg">
                                        <Icon as={FiMapPin} boxSize={6} color={primaryColor} mr={4} />
                                        <Box>
                                            <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium">Lokasi</Text>
                                            <Text fontWeight="bold" color={primaryTextColor}>{tour.location}</Text>
                                        </Box>
                                    </Flex>
                                )}
                                {tour.categories.length > 0 && (
                                    <Flex align="center" bg={useColorModeValue('gray.100', 'gray.700')} p={4} borderRadius="lg">
                                        <Icon as={FiMessageCircle} boxSize={6} color={primaryColor} mr={4} />
                                        <Box>
                                            <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium">Kategori</Text>
                                            <Text fontWeight="bold" color={primaryTextColor}>{tour.categories.join(', ')}</Text>
                                        </Box>
                                    </Flex>
                                )}
                                {/* TC-038: Tampilkan jadwal ketersediaan di detail */}
                                {tour.available_days && tour.available_days.length > 0 && (
                                    <Flex align="flex-start" bg={useColorModeValue('gray.100', 'gray.700')} p={4} borderRadius="lg" flexDir="column">
                                        <HStack mb={2}>
                                            <Icon as={FiCalendar} boxSize={5} color={primaryColor} />
                                            <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium">Tersedia</Text>
                                        </HStack>
                                        <Wrap spacing={1}>
                                            {tour.available_days.map(d => (
                                                <WrapItem key={d.day_of_week}>
                                                    <Badge colorScheme="blue" fontSize="xs" borderRadius="md">{d.label}</Badge>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                    </Flex>
                                )}
                            </SimpleGrid>
                        </Box>

                        {tour.guide && (
                            <Box>
                                <Heading size="lg" mb={6} color={primaryTextColor} fontWeight="bold">Pemandu Wisata</Heading>
                                <Flex bg={useColorModeValue('gray.100', 'gray.700')} p={5} borderRadius="lg" alignItems="center" transition="all 0.2s ease" _hover={{ transform: 'translateY(-3px)', boxShadow: 'lg' }}>
                                    <Avatar size="lg" name={tour.guide.name} src={tour.guide.avatar ?? undefined} mr={5} boxShadow="md" border="3px solid" borderColor={primaryColor} />
                                    <Box flex="1">
                                        <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>{tour.guide.name}</Text>
                                        {tour.guide.rating > 0 && (
                                            <HStack spacing={1.5} align="center">
                                                <Icon as={FiStar} color="yellow.400" fill="yellow.400" />
                                                <Text fontWeight="bold" fontSize="sm" color={primaryTextColor}>{tour.guide.rating.toFixed(1)}</Text>
                                            </HStack>
                                        )}
                                    </Box>
                                    <Button ml="auto" colorScheme="blue" variant="outline" size="sm" onClick={() => navigate(`/guides/${tour.guide!.id}`)} _hover={{ bg: primaryColor, color: 'white' }}>
                                        Lihat Profil
                                    </Button>
                                </Flex>
                            </Box>
                        )}
                    </SimpleGrid>
                </Box>

                {/* ── Tab Deskripsi / Itinerary / Termasuk ── */}
                <Box bg={cardBg} borderRadius="xl" boxShadow="xl" overflow="hidden" border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.5s both`}>
                    <Flex borderBottom="1px solid" borderColor={subtleBorderColor}>
                        {['Deskripsi', 'Itinerary', 'Fasilitas'].map((tabName, index) => (
                            <Box
                                key={tabName}
                                py={4} px={{ base: 4, md: 8 }}
                                fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}
                                borderBottom={activeTab === index ? '3px solid' : '3px solid transparent'}
                                borderColor={activeTab === index ? primaryColor : 'transparent'}
                                color={activeTab === index ? primaryColor : secondaryTextColor}
                                cursor="pointer" onClick={() => setActiveTab(index)}
                                transition="all 0.3s ease"
                                bg={activeTab === index ? useColorModeValue('blue.50', 'gray.700') : 'transparent'}
                                _hover={{ color: primaryColor, bg: useColorModeValue('blue.50', 'gray.700') }}
                                flex={1} textAlign="center"
                            >
                                {tabName}
                            </Box>
                        ))}
                    </Flex>

                    <Box p={{ base: 5, md: 8 }}>
                        {/* Tab 0 — Deskripsi */}
                        {activeTab === 0 && (
                            <VStack spacing={6} align="stretch" animation={`${fadeIn} 0.5s ease`}>
                                <Text fontSize="md" lineHeight="1.8" color={secondaryTextColor}>
                                    {tour.description || 'Belum ada deskripsi untuk tour ini.'}
                                </Text>
                            </VStack>
                        )}

                        {/* Tab 1 — Itinerary */}
                        {activeTab === 1 && (
                            <VStack spacing={5} align="stretch" animation={`${fadeIn} 0.5s ease`}>
                                {tour.itinerary.length === 0 ? (
                                    <Text color={secondaryTextColor}>Belum ada itinerary untuk tour ini.</Text>
                                ) : (
                                    tour.itinerary.map((item, index) => (
                                        <Flex key={index} gap={5} p={5} borderRadius="lg" bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.100', 'gray.750')} border="1px solid" borderColor={subtleBorderColor} transition="all 0.25s ease" _hover={{ borderColor: primaryColor, boxShadow: 'lg', transform: 'translateY(-3px)' }}>
                                            <Box minW="40px" h="40px" borderRadius="full" bgGradient={accentGradient} color="white" display="flex" justifyContent="center" alignItems="center" fontWeight="bold" fontSize="lg" boxShadow="md" flexShrink={0}>{index + 1}</Box>
                                            <Box flex="1">
                                                <Flex justify="space-between" align="flex-start" mb={1.5} flexWrap="wrap" gap={2}>
                                                    <Heading size="sm" color={primaryTextColor} fontWeight="semibold">{item.activity}</Heading>
                                                    {item.time && (
                                                        <Badge bg={primaryColor} color="white" py={1} px={3} borderRadius="full" fontWeight="bold" fontSize="xs">{item.time}</Badge>
                                                    )}
                                                </Flex>
                                            </Box>
                                        </Flex>
                                    ))
                                )}
                            </VStack>
                        )}

                        {/* Tab 2 — Fasilitas */}
                        {activeTab === 2 && (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} animation={`${fadeIn} 0.5s ease`}>
                                <Box>
                                    <Heading size="md" mb={6} color={accentSuccess} display="flex" alignItems="center">
                                        <Text mr={3}>✓</Text> Yang Termasuk
                                    </Heading>
                                    {tour.included.length === 0 ? (
                                        <Text color={secondaryTextColor} fontSize="sm">Tidak ada informasi.</Text>
                                    ) : (
                                        <VStack spacing={4} align="stretch">
                                            {tour.included.map((item, i) => (
                                                <Flex key={i} align="center" bg={useColorModeValue('green.50', 'green.900')} p={3.5} borderRadius="md" borderLeft="4px solid" borderColor={accentSuccess} boxShadow="sm">
                                                    <Text color={accentSuccess} fontWeight="bold" mr={3} fontSize="lg">✓</Text>
                                                    <Text fontWeight="medium" fontSize="sm" color={primaryTextColor}>{item}</Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    )}
                                </Box>
                                <Box>
                                    <Heading size="md" mb={6} color={accentError} display="flex" alignItems="center">
                                        <Text mr={3}>✕</Text> Tidak Termasuk
                                    </Heading>
                                    {tour.excluded.length === 0 ? (
                                        <Text color={secondaryTextColor} fontSize="sm">Tidak ada informasi.</Text>
                                    ) : (
                                        <VStack spacing={4} align="stretch">
                                            {tour.excluded.map((item, i) => (
                                                <Flex key={i} align="center" bg={useColorModeValue('red.50', 'red.900')} p={3.5} borderRadius="md" borderLeft="4px solid" borderColor={accentError} boxShadow="sm">
                                                    <Text color={accentError} fontWeight="bold" mr={3} fontSize="lg">✕</Text>
                                                    <Text fontWeight="medium" fontSize="sm" color={primaryTextColor}>{item}</Text>
                                                </Flex>
                                            ))}
                                        </VStack>
                                    )}
                                </Box>
                            </SimpleGrid>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default TourDetail;
