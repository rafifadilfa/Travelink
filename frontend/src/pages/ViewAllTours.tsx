import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Button,
    Flex,
    Text,
    Heading,
    Container,
    Grid,
    Input,
    useColorModeValue,
    Icon,
    Badge,
    VStack,
    HStack,
    Select,
    Spinner,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Image,
    LinkBox,
    LinkOverlay,
} from '@chakra-ui/react';
import {
    SearchIcon,
    ChevronRightIcon,
    RepeatIcon,
    StarIcon,
    ArrowForwardIcon,
    ArrowLeftIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// --- Keyframes ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Types ---
interface TourGuide {
    id: number;
    name: string;
    rating: number;
}

interface Tour {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    rating: number;
    reviews_count: number;
    featured: boolean;
    is_open_trip: boolean;
    location: string;
    image_url: string | null;
    categories: string[];
    guide: TourGuide | null;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';

const categories = [
    { value: 'Beach',    label: 'Beach',    icon: '🏖️' },
    { value: 'Mountain', label: 'Mountain', icon: '🏔️' },
    { value: 'City',     label: 'City',     icon: '🏙️' },
    { value: 'Cultural', label: 'Culture',  icon: '🏛️' },
    { value: 'Diving',   label: 'Diving',   icon: '🤿' },
    { value: 'Nature',   label: 'Nature',   icon: '🌿' },
];

const ViewAllTours: React.FC = () => {
    const navigate = useNavigate();
    const [allTours, setAllTours]           = useState<Tour[]>([]);
    const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
    const [loading, setLoading]             = useState(true);
    const [fetchError, setFetchError]       = useState<string | null>(null);
    const [searchQuery, setSearchQuery]     = useState(() => {
        try { return (JSON.parse(sessionStorage.getItem('tours_filter') ?? '{}')).searchQuery ?? ''; } catch { return ''; }
    });
    const [selectedCategory, setSelectedCategory] = useState(() => {
        try { return (JSON.parse(sessionStorage.getItem('tours_filter') ?? '{}')).selectedCategory ?? ''; } catch { return ''; }
    });
    const [sortOrder, setSortOrder]         = useState<'price-low' | 'price-high' | 'rating'>(() => {
        try { return (JSON.parse(sessionStorage.getItem('tours_filter') ?? '{}')).sortOrder ?? 'rating'; } catch { return 'rating'; }
    });
    const [minPrice, setMinPrice]           = useState(() => {
        try { return (JSON.parse(sessionStorage.getItem('tours_filter') ?? '{}')).minPrice ?? ''; } catch { return ''; }
    });
    const [maxPrice, setMaxPrice]           = useState(() => {
        try { return (JSON.parse(sessionStorage.getItem('tours_filter') ?? '{}')).maxPrice ?? ''; } catch { return ''; }
    });
    const [currentPage, setCurrentPage]     = useState(1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchBoxRef = useRef<HTMLDivElement>(null);
    const toursPerPage = 6;

    const overallBg          = useColorModeValue('blue.50', 'gray.900');
    const cardBg             = useColorModeValue('white', 'gray.800');
    const primaryColor       = useColorModeValue('blue.500', 'blue.400');
    const primaryHoverColor  = useColorModeValue('blue.600', 'blue.500');
    const primaryTextColor   = useColorModeValue('gray.700', 'whiteAlpha.900');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const subtleBorderColor  = useColorModeValue('gray.200', 'gray.700');
    const ratingBadgeBg      = useColorModeValue('whiteAlpha.800', 'blackAlpha.600');
    const suggestionBg       = useColorModeValue('white', 'gray.800');
    const suggestionHoverBg  = useColorModeValue('blue.50', 'gray.700');

    // Fetch tour dari API saat mount
    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const res = await apiClient.get<{ data: Tour[]; total: number }>('/tours');
                setAllTours(res.data.data);
            } catch {
                setFetchError('Gagal memuat daftar tour. Pastikan server backend berjalan.');
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    // Filter & sort client-side setiap kali filter/sort berubah
    const filterTours = useCallback(() => {
        setCurrentPage(1);
        let results = [...allTours];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            results = results.filter(
                t =>
                    t.name.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q) ||
                    t.location.toLowerCase().includes(q)
            );
        }

        if (selectedCategory) {
            results = results.filter(t =>
                t.categories.some(c => c.toLowerCase() === selectedCategory.toLowerCase())
            );
        }

        const min = minPrice !== '' ? Number(minPrice) : null;
        const max = maxPrice !== '' ? Number(maxPrice) : null;
        if (min !== null && !isNaN(min)) results = results.filter(t => t.price >= min);
        if (max !== null && !isNaN(max)) results = results.filter(t => t.price <= max);

        switch (sortOrder) {
            case 'price-low':  results.sort((a, b) => a.price - b.price); break;
            case 'price-high': results.sort((a, b) => b.price - a.price); break;
            case 'rating':
            default:           results.sort((a, b) => b.rating - a.rating); break;
        }

        setFilteredTours(results);
    }, [allTours, searchQuery, selectedCategory, sortOrder, minPrice, maxPrice]);

    useEffect(() => {
        filterTours();
    }, [filterTours]);

    useEffect(() => {
        sessionStorage.setItem('tours_filter', JSON.stringify({ searchQuery, selectedCategory, sortOrder, minPrice, maxPrice }));
    }, [searchQuery, selectedCategory, sortOrder, minPrice, maxPrice]);

    const totalPages      = Math.ceil(filteredTours.length / toursPerPage);
    const indexOfLast     = currentPage * toursPerPage;
    const indexOfFirst    = indexOfLast - toursPerPage;
    const paginatedTours  = filteredTours.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const suggestions = searchQuery.length >= 1
        ? allTours
            .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.location.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 6)
        : [];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortOrder('rating');
        setMinPrice('');
        setMaxPrice('');
        sessionStorage.removeItem('tours_filter');
    };

    const baseButtonStyle = {
        borderRadius: 'lg', fontWeight: 'semibold', h: '44px', px: 5, fontSize: 'sm',
        transition: 'all 0.25s cubic-bezier(.08,.52,.52,1)',
        _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
        _focus:  { boxShadow: `0 0 0 3px ${useColorModeValue('blue.200', 'blue.700')}` },
    };

    const primaryButtonStyle = {
        ...baseButtonStyle,
        bgGradient: `linear(to-r, ${primaryColor}, ${useColorModeValue('blue.400', 'blue.300')})`,
        color: 'white', boxShadow: 'md',
        _hover: {
            bgGradient: `linear(to-r, ${primaryHoverColor}, ${useColorModeValue('blue.500', 'blue.400')})`,
            transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg',
        },
    };

    const secondaryButtonStyle = {
        ...baseButtonStyle,
        bg: 'transparent', color: primaryColor, border: '2px solid', borderColor: primaryColor,
        _hover: {
            bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'),
            borderColor: primaryHoverColor, color: primaryHoverColor,
            transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md',
        },
        _disabled: {
            bg: useColorModeValue('gray.100', 'gray.700'),
            borderColor: useColorModeValue('gray.200', 'gray.600'),
            color: useColorModeValue('gray.400', 'gray.500'),
            cursor: 'not-allowed', transform: 'none', boxShadow: 'none', opacity: 0.7,
        },
    };

    const categoryLabel = (cats: string[]) => {
        if (cats.length === 0) return '';
        const match = categories.find(c => c.value === cats[0]);
        return match ? `${match.icon} ${match.label}` : cats[0];
    };

    return (
        <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
            {/* Navbar */}
            <TouristNavbar />

            <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
                <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={6}>
                    <BreadcrumbItem>
                        <BreadcrumbLink onClick={() => navigate('/dashboard')} color={secondaryTextColor} _hover={{ color: primaryColor }}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#" color={primaryTextColor} fontWeight="medium">Tours</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <Heading as="h1" size="2xl" fontWeight="black" color={primaryTextColor} mb={3} animation={`${slideInUp} 0.5s ease-out`}>
                    Explore All Tours
                </Heading>
                <Text fontSize="lg" color={secondaryTextColor} mb={10} maxW="container.md" animation={`${slideInUp} 0.5s ease-out 0.1s both`}>
                    Temukan petualangan tak terlupakan di kepulauan Indonesia bersama pemandu lokal terpercaya.
                </Text>

                {/* Filter bar */}
                <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} animation={`${slideInUp} 0.5s ease-out 0.2s both`} borderTop="4px solid" borderColor={primaryColor}>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '2fr 1fr 1fr auto' }} gap={6} alignItems="flex-end">
                        <Box ref={searchBoxRef} position="relative">
                            <Text as="label" htmlFor="search-input" display="block" mb={1.5} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Cari Tour</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" h="44px" children={<SearchIcon color={secondaryTextColor} />} />
                                <Input
                                    id="search-input" type="text" placeholder="contoh: Bali, Menyelam, Candi"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                    onFocus={() => setShowSuggestions(true)}
                                    h="44px" borderRadius="lg" bg={useColorModeValue('gray.100', 'gray.700')}
                                    borderColor={subtleBorderColor} variant="filled"
                                    _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                                    _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                                    autoComplete="off"
                                />
                            </InputGroup>
                            {showSuggestions && suggestions.length > 0 && (
                                <Box
                                    position="absolute" top="100%" left={0} right={0} zIndex={20}
                                    bg={suggestionBg} borderRadius="lg" boxShadow="lg"
                                    border="1px solid" borderColor={subtleBorderColor} mt={1} overflow="hidden"
                                >
                                    {suggestions.map(t => (
                                        <Flex
                                            key={t.id} px={4} py={2.5} cursor="pointer" align="center" gap={2}
                                            _hover={{ bg: suggestionHoverBg }}
                                            onMouseDown={() => { setSearchQuery(t.name); setShowSuggestions(false); }}
                                        >
                                            <SearchIcon boxSize={3} color={secondaryTextColor} />
                                            <Box>
                                                <Text fontSize="sm" fontWeight="medium" color={primaryTextColor}>{t.name}</Text>
                                                <Text fontSize="xs" color={secondaryTextColor}>{t.location}</Text>
                                            </Box>
                                        </Flex>
                                    ))}
                                </Box>
                            )}
                        </Box>
                        <Box>
                            <Text as="label" htmlFor="category-select" display="block" mb={1.5} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Kategori</Text>
                            <Select
                                id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                                h="44px" borderRadius="lg" bg={useColorModeValue('gray.100', 'gray.700')}
                                borderColor={subtleBorderColor} variant="filled"
                                _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                                iconColor={secondaryTextColor}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                ))}
                            </Select>
                        </Box>
                        <Box>
                            <Text as="label" htmlFor="sort-select" display="block" mb={1.5} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Urutkan</Text>
                            <Select
                                id="sort-select" value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'price-low' | 'price-high' | 'rating')}
                                h="44px" borderRadius="lg" bg={useColorModeValue('gray.100', 'gray.700')}
                                borderColor={subtleBorderColor} variant="filled"
                                _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                                iconColor={secondaryTextColor}
                            >
                                <option value="rating">Rating Tertinggi</option>
                                <option value="price-low">Harga: Terendah</option>
                                <option value="price-high">Harga: Tertinggi</option>
                            </Select>
                        </Box>
                        <Button {...secondaryButtonStyle} onClick={resetFilters} leftIcon={<RepeatIcon />}>Reset</Button>
                    </Grid>

                    {/* Baris kedua: filter harga */}
                    <Box mt={4} pt={4} borderTop="1px solid" borderColor={subtleBorderColor}>
                        <Text display="block" mb={2} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Rentang Harga (Rp)</Text>
                        <HStack spacing={3}>
                            <Input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                h="40px"
                                borderRadius="lg"
                                bg={useColorModeValue('gray.100', 'gray.700')}
                                borderColor={subtleBorderColor}
                                variant="filled"
                                maxW="160px"
                                fontSize="sm"
                                _focus={{ borderColor: primaryColor, bg: useColorModeValue('white', 'gray.700') }}
                            />
                            <Text color={secondaryTextColor} flexShrink={0}>—</Text>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                h="40px"
                                borderRadius="lg"
                                bg={useColorModeValue('gray.100', 'gray.700')}
                                borderColor={subtleBorderColor}
                                variant="filled"
                                maxW="160px"
                                fontSize="sm"
                                _focus={{ borderColor: primaryColor, bg: useColorModeValue('white', 'gray.700') }}
                            />
                            {(minPrice || maxPrice) && (
                                <Text fontSize="xs" color={primaryColor}>
                                    Filter aktif: {minPrice ? `≥ ${formatPrice(Number(minPrice))}` : ''}{minPrice && maxPrice ? ' & ' : ''}{maxPrice ? `≤ ${formatPrice(Number(maxPrice))}` : ''}
                                </Text>
                            )}
                        </HStack>
                    </Box>
                </Box>

                <Flex justify="space-between" align="center" mb={6}>
                    <Text color={primaryTextColor} fontSize="lg" fontWeight="medium">
                        Menampilkan <Text as="span" fontWeight="bold" color={primaryColor}>{filteredTours.length}</Text> tour
                    </Text>
                </Flex>

                {/* State: loading / error / kosong / grid */}
                {loading ? (
                    <Flex justify="center" align="center" minH="400px">
                        <VStack spacing={4}>
                            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color={primaryColor} size="xl" />
                            <Text color={secondaryTextColor} fontSize="lg">Memuat tour...</Text>
                        </VStack>
                    </Flex>
                ) : fetchError ? (
                    <VStack bg={cardBg} p={{ base: 8, md: 16 }} borderRadius="2xl" boxShadow="xl" textAlign="center" borderTop="4px solid" borderColor="red.400" spacing={5} minH="300px" justifyContent="center">
                        <Text fontSize="5xl">⚠️</Text>
                        <Heading size="lg" color={primaryTextColor}>Gagal Memuat Tour</Heading>
                        <Text color={secondaryTextColor}>{fetchError}</Text>
                        <Button {...primaryButtonStyle} onClick={() => window.location.reload()}>Coba Lagi</Button>
                    </VStack>
                ) : filteredTours.length === 0 ? (
                    <VStack bg={cardBg} p={{ base: 8, md: 16 }} borderRadius="2xl" boxShadow="xl" textAlign="center" borderTop="4px solid" borderColor={primaryColor} spacing={5} minH="400px" justifyContent="center" animation={`${fadeIn} 0.5s ease-out`}>
                        <Text fontSize="6xl" role="img" aria-label="Kaca pembesar">🔍</Text>
                        <Heading size="xl" color={primaryTextColor} fontWeight="bold">Tidak Ada Tour Ditemukan</Heading>
                        <Text color={secondaryTextColor} fontSize="lg" maxW="md">
                            Tidak ada tour yang cocok dengan pencarian Anda. Coba ubah filter atau kata kunci!
                        </Text>
                        <Button {...primaryButtonStyle} onClick={resetFilters} mt={4} leftIcon={<RepeatIcon />}>Reset Filter</Button>
                    </VStack>
                ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} animation={`${fadeIn} 0.5s ease-out`}>
                        {paginatedTours.map((tour, index) => (
                            <LinkBox
                                as="article" key={tour.id} bg={cardBg} borderRadius="xl" overflow="hidden"
                                boxShadow="lg" transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                                _hover={{ boxShadow: '2xl', transform: 'translateY(-6px) scale(1.02)' }}
                                border="1px solid" borderColor={subtleBorderColor}
                                animation={`${slideInUp} 0.6s ease-out ${index * 0.07}s both`}
                            >
                                {/* Gambar tour */}
                                <Box position="relative" h="220px" overflow="hidden">
                                    <Image
                                        src={tour.image_url ?? FALLBACK_IMAGE}
                                        alt={tour.name}
                                        w="full" h="full" objectFit="cover"
                                        transition="transform 0.5s ease-in-out"
                                        _hover={{ transform: 'scale(1.1)' }}
                                        fallbackSrc={FALLBACK_IMAGE}
                                    />
                                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-t, blackAlpha.600 10%, transparent 60%)" />

                                    {/* Badge featured */}
                                    {tour.featured && (
                                        <Badge position="absolute" top={3} left={3} colorScheme="pink" variant="solid" px={3} py={1} borderRadius="md" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                                            Featured
                                        </Badge>
                                    )}

                                    {/* Badge Smart Open Trip — label informasi, tidak bisa diklik */}
                                    {tour.is_open_trip && (
                                        <Badge
                                            position="absolute"
                                            top={tour.featured ? '40px' : '12px'}
                                            left={3}
                                            mt={tour.featured ? 1 : 0}
                                            bgGradient="linear(to-r, purple.500, blue.500)"
                                            color="white"
                                            px={3} py={1}
                                            borderRadius="md"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            letterSpacing="wide"
                                            textTransform="uppercase"
                                            boxShadow="md"
                                            pointerEvents="none"
                                        >
                                            ✨ Smart Open Trip
                                        </Badge>
                                    )}

                                    {/* Rating */}
                                    <Flex position="absolute" bottom={3} right={3} bg={ratingBadgeBg} backdropFilter="blur(5px)" px={2.5} py={1} borderRadius="lg" alignItems="center" boxShadow="md">
                                        <Icon as={StarIcon} color="yellow.400" boxSize={4} mr={1.5} />
                                        <Text fontWeight="bold" color={primaryTextColor} fontSize="sm">{tour.rating > 0 ? tour.rating.toFixed(1) : 'Baru'}</Text>
                                        <Text fontSize="xs" color={secondaryTextColor} ml={1}>({tour.reviews_count})</Text>
                                    </Flex>
                                </Box>

                                {/* Konten kartu */}
                                <Box p={5}>
                                    <HStack justify="space-between" mb={1.5}>
                                        <Text fontSize="sm" color={primaryColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                                            {tour.location} {tour.categories.length > 0 && `• ${categoryLabel(tour.categories)}`}
                                        </Text>
                                        <Text fontSize="xs" color={secondaryTextColor}>{tour.duration} jam</Text>
                                    </HStack>

                                    <LinkOverlay href="#" onClick={(e) => { e.preventDefault(); navigate(`/tours/${tour.id}`, { state: { is_open_trip: tour.is_open_trip, tour_id: tour.id } }); }}>
                                        <Heading size="md" color={primaryTextColor} fontWeight="bold" noOfLines={2} minH="3em" mb={2} _hover={{ color: primaryColor }} transition="color 0.2s">
                                            {tour.name}
                                        </Heading>
                                    </LinkOverlay>

                                    <Text color={secondaryTextColor} mb={3} fontSize="sm" lineHeight="1.55" noOfLines={3} minH="4.65em">
                                        {tour.description}
                                    </Text>

                                    {/* Info guide */}
                                    {tour.guide && (
                                        <HStack spacing={1.5} mb={3}>
                                            <Text fontSize="xs" color={secondaryTextColor}>🧭 Dipandu oleh</Text>
                                            <Text
                                                fontSize="xs" color={primaryColor} fontWeight="semibold"
                                                cursor="pointer" _hover={{ textDecoration: 'underline' }}
                                                onClick={(e) => { e.preventDefault(); navigate(`/guides/${tour.guide!.id}`); }}
                                            >
                                                {tour.guide.name}
                                            </Text>
                                        </HStack>
                                    )}

                                    <Flex justify="space-between" align="center" mt={2}>
                                        <Box>
                                            <Text fontWeight="black" color={primaryColor} fontSize="lg">{formatPrice(tour.price)}</Text>
                                            <Text fontSize="xs" color={secondaryTextColor}>per orang</Text>
                                        </Box>
                                        <Button
                                            {...primaryButtonStyle} size="sm" h="40px" px={5}
                                            rightIcon={<ArrowForwardIcon />}
                                            onClick={() => navigate(`/tours/${tour.id}`, { state: { is_open_trip: tour.is_open_trip, tour_id: tour.id } })}
                                        >
                                            Lihat Detail
                                        </Button>
                                    </Flex>
                                </Box>
                            </LinkBox>
                        ))}
                    </SimpleGrid>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <Flex justify="center" mt={12} animation={`${fadeIn} 0.5s ease-out 0.5s both`}>
                        <HStack spacing={3}>
                            <Button
                                {...secondaryButtonStyle} size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                isDisabled={currentPage === 1}
                                leftIcon={<ArrowLeftIcon boxSize={3} />}
                            >
                                Sebelumnya
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    {...(currentPage === page ? primaryButtonStyle : secondaryButtonStyle)}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                {...secondaryButtonStyle} size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                isDisabled={currentPage === totalPages}
                                rightIcon={<ArrowForwardIcon boxSize={3} />}
                            >
                                Berikutnya
                            </Button>
                        </HStack>
                    </Flex>
                )}
            </Container>
        </Box>
    );
};

export default ViewAllTours;
