import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Tag,
  TagLabel,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ArrowForwardIcon, ChevronRightIcon, SearchIcon, StarIcon } from '@chakra-ui/icons';
import { FiMapPin, FiUser, FiBook } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';
import TouristNavbar from '../components/TouristNavbar';

// ─── Animasi ─────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuideResult {
  id: number;
  name: string;
  avatar: string | null;
  location: string;
  rating: number;
  total_tours: number;
  specialty: string | null;
}

interface TourResult {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  rating: number;
  reviews_count: number;
  is_open_trip: boolean;
  location: string;
  image_url: string | null;
  categories: string[];
  guide: { id: number; name: string; rating: number } | null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatPrice = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  return Array.from({ length: 5 }, (_, i) => (
    <Icon key={i} as={StarIcon} boxSize={3} color={i < full ? 'yellow.400' : 'gray.300'} />
  ));
};

// ─── Skeleton guide card ──────────────────────────────────────────────────────

const GuideCardSkeleton: React.FC = () => (
  <Box borderRadius="xl" overflow="hidden" boxShadow="md" p={5} display="flex" gap={4}>
    <SkeletonCircle size="16" flexShrink={0} />
    <Box flex="1">
      <Skeleton height="14px" width="70%" mb={2} />
      <Skeleton height="11px" width="50%" mb={3} />
      <SkeletonText noOfLines={2} spacing={2} />
    </Box>
  </Box>
);

// ─── Skeleton tour card ───────────────────────────────────────────────────────

const TourCardSkeleton: React.FC = () => (
  <Box borderRadius="xl" overflow="hidden" boxShadow="md">
    <Skeleton height="160px" />
    <Box p={4}>
      <Skeleton height="14px" width="60%" mb={2} />
      <SkeletonText noOfLines={2} spacing={2} mb={3} />
      <Skeleton height="12px" width="40%" />
    </Box>
  </Box>
);

// ─── GuideCard ───────────────────────────────────────────────────────────────

interface GuideCardProps { guide: GuideResult; index: number; }

const GuideCard: React.FC<GuideCardProps> = ({ guide, index }) => {
  const navigate = useNavigate();
  const cardBg       = useColorModeValue('white', 'gray.800');
  const borderColor  = useColorModeValue('gray.200', 'gray.700');
  const nameColor    = useColorModeValue('gray.800', 'white');
  const subtleColor  = useColorModeValue('gray.500', 'gray.400');
  const primaryColor = useColorModeValue('blue.600', 'blue.400');

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={5}
      boxShadow="sm"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gap={4}
      alignItems={{ base: 'center', md: 'flex-start' }}
      animation={`${fadeUp} 0.35s ease both`}
      style={{ animationDelay: `${index * 60}ms` }}
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s ease' }}
      transition="all 0.2s ease"
    >
      <Avatar
        src={guide.avatar ?? undefined}
        name={guide.name}
        size="lg"
        flexShrink={0}
        cursor="pointer"
        onClick={() => navigate(`/guides/${guide.id}`)}
        _hover={{ opacity: 0.85 }}
      />

      <Box flex="1" minW={0} w="full" textAlign={{ base: 'center', md: 'left' }}>
        <Heading
          size="sm"
          color={nameColor}
          mb={1}
          noOfLines={1}
          cursor="pointer"
          _hover={{ color: primaryColor }}
          onClick={() => navigate(`/guides/${guide.id}`)}
        >
          {guide.name}
        </Heading>

        {/* Rating */}
        <HStack spacing={1} mb={2} justify={{ base: 'center', md: 'flex-start' }}>
          {renderStars(guide.rating)}
          <Text fontSize="xs" color={subtleColor} ml={1}>
            {guide.rating > 0 ? guide.rating.toFixed(1) : 'Belum ada rating'}
          </Text>
        </HStack>

        {/* Info baris */}
        <VStack spacing={1} align={{ base: 'center', md: 'flex-start' }} mb={3}>
          <HStack spacing={1.5} fontSize="xs" color={subtleColor}>
            <Icon as={FiMapPin} boxSize={3} />
            <Text>{guide.location}</Text>
          </HStack>
          {guide.specialty && (
            <HStack spacing={1.5} fontSize="xs" color={subtleColor}>
              <Icon as={FiUser} boxSize={3} />
              <Text>{guide.specialty}</Text>
            </HStack>
          )}
          <HStack spacing={1.5} fontSize="xs" color={subtleColor}>
            <Icon as={FiBook} boxSize={3} />
            <Text>{guide.total_tours} paket aktif</Text>
          </HStack>
        </VStack>

        <Button
          size="xs"
          colorScheme="blue"
          variant="outline"
          rightIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/guides/${guide.id}`)}
        >
          Lihat Profil
        </Button>
      </Box>
    </Box>
  );
};

// ─── TourCard ─────────────────────────────────────────────────────────────────

interface TourCardProps { tour: TourResult; index: number; }

const TourCard: React.FC<TourCardProps> = ({ tour, index }) => {
  const navigate = useNavigate();
  const cardBg       = useColorModeValue('white', 'gray.800');
  const borderColor  = useColorModeValue('gray.200', 'gray.700');
  const nameColor    = useColorModeValue('gray.800', 'white');
  const subtleColor  = useColorModeValue('gray.500', 'gray.400');
  const primaryColor = useColorModeValue('blue.600', 'blue.400');
  const placeholderBg = useColorModeValue('blue.50', 'gray.700');

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="sm"
      animation={`${fadeUp} 0.35s ease both`}
      style={{ animationDelay: `${index * 60}ms` }}
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s ease' }}
      transition="all 0.2s ease"
    >
      {/* Gambar */}
      <Box position="relative" h="150px" bg={placeholderBg} overflow="hidden">
        {tour.image_url ? (
          <Image src={tour.image_url} alt={tour.name} w="100%" h="100%" objectFit="cover" />
        ) : (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="3xl">🏝️</Text>
          </Flex>
        )}
        {tour.is_open_trip && (
          <Badge
            position="absolute" top={2} left={2}
            colorScheme="purple" variant="solid" fontSize="2xs" px={2} py={0.5} borderRadius="full"
          >
            Smart Open Trip
          </Badge>
        )}
        <Flex
          position="absolute" bottom={2} right={2}
          bg="blackAlpha.600" px={2} py={0.5} borderRadius="md"
          align="center" gap={1}
        >
          <Icon as={StarIcon} color="yellow.300" boxSize={3} />
          <Text fontSize="xs" color="white" fontWeight="bold">
            {tour.rating > 0 ? tour.rating.toFixed(1) : 'Baru'}
          </Text>
          <Text fontSize="2xs" color="whiteAlpha.700">({tour.reviews_count})</Text>
        </Flex>
      </Box>

      {/* Konten */}
      <Box p={4}>
        <Text fontSize="xs" color={primaryColor} fontWeight="semibold" mb={1} noOfLines={1}>
          {tour.location} {tour.categories.length > 0 && `• ${tour.categories[0]}`}
        </Text>

        <Heading size="sm" color={nameColor} noOfLines={2} mb={2} minH="2.6em">
          {tour.name}
        </Heading>

        {tour.guide && (
          <Text fontSize="xs" color={subtleColor} mb={3} noOfLines={1}>
            🧭{' '}
            <Text
              as="span"
              color={primaryColor}
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              onClick={(e) => { e.stopPropagation(); navigate(`/guides/${tour.guide!.id}`); }}
            >
              {tour.guide.name}
            </Text>
          </Text>
        )}

        <Flex justify="space-between" align="center">
          <Box>
            <Text fontWeight="black" color={primaryColor} fontSize="md">{formatPrice(tour.price)}</Text>
            <Text fontSize="2xs" color={subtleColor}>{tour.is_open_trip ? 'per paket' : 'per orang'}</Text>
          </Box>
          <Button
            size="sm"
            colorScheme="blue"
            rightIcon={<ArrowForwardIcon />}
            onClick={() => navigate(`/tours/${tour.id}`)}
          >
            Detail
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

interface EmptyProps { type: 'guide' | 'tour'; keyword: string; }

const EmptyState: React.FC<EmptyProps> = ({ type, keyword }) => {
  const subtleColor  = useColorModeValue('gray.500', 'gray.400');
  const suggestionBg = useColorModeValue('blue.50', 'blue.900');
  const primaryColor = useColorModeValue('blue.600', 'blue.300');
  return (
    <Box textAlign="center" py={8}>
      <Text fontSize="2xl" mb={2}>{type === 'guide' ? '🧭' : '🗺️'}</Text>
      <Text color={subtleColor} fontSize="sm" mb={3}>
        Tidak ada {type === 'guide' ? 'pemandu' : 'paket wisata'} ditemukan untuk{' '}
        <Text as="span" fontWeight="semibold">"{keyword}"</Text>.
      </Text>
      <Box bg={suggestionBg} borderRadius="lg" p={3} display="inline-block" textAlign="left" maxW="360px">
        <Text fontSize="xs" color={primaryColor} fontWeight="semibold" mb={1}>Saran filter alternatif:</Text>
        <Text fontSize="xs" color={subtleColor}>• Coba kata kunci yang lebih umum (misal: "Bali" atau "pantai")</Text>
        <Text fontSize="xs" color={subtleColor}>• Periksa ejaan kata kunci pencarian</Text>
        <Text fontSize="xs" color={subtleColor}>• Hapus filter untuk melihat semua {type === 'guide' ? 'pemandu' : 'paket wisata'}</Text>
      </Box>
    </Box>
  );
};

// ─── Komponen utama ───────────────────────────────────────────────────────────

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const query = searchParams.get('q') ?? '';
  const [inputValue, setInputValue]     = useState(query);
  const [guides, setGuides]             = useState<GuideResult[]>([]);
  const [tours, setTours]               = useState<TourResult[]>([]);
  const [allTours, setAllTours]         = useState<TourResult[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [loadingTours, setLoadingTours]   = useState(false);
  const [toursLoaded, setToursLoaded]     = useState(false);

  const pageBg       = useColorModeValue('gray.50', 'gray.900');
  const cardSectionBg = useColorModeValue('white', 'gray.850');
  const titleColor   = useColorModeValue('gray.800', 'white');
  const subtleColor  = useColorModeValue('gray.500', 'gray.400');
  const primaryColor = useColorModeValue('blue.600', 'blue.400');
  const borderColor  = useColorModeValue('gray.200', 'gray.700');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg      = useColorModeValue('white', 'gray.800');

  // Fetch semua tour sekali saja; filter client-side sesuai query
  const fetchAllTours = useCallback(async () => {
    if (toursLoaded) return;
    setLoadingTours(true);
    try {
      const res = await apiClient.get<{ data: TourResult[] }>('/tours');
      setAllTours(res.data.data);
      setToursLoaded(true);
    } catch {
      toast({ title: 'Gagal memuat data paket wisata', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoadingTours(false);
    }
  }, [toursLoaded, toast]);

  // Filter tour dari allTours sesuai query
  useEffect(() => {
    if (!toursLoaded) return;
    if (!query) { setTours([]); return; }
    const q = query.toLowerCase();
    setTours(allTours.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.categories.some(c => c.toLowerCase().includes(q)) ||
      (t.guide?.name ?? '').toLowerCase().includes(q)
    ));
  }, [query, allTours, toursLoaded]);

  // Fetch guides dari server berdasarkan query
  const fetchGuides = useCallback(async (kw: string) => {
    if (!kw) { setGuides([]); return; }
    setLoadingGuides(true);
    try {
      const res = await apiClient.get<{ data: GuideResult[] }>(`/guides?search=${encodeURIComponent(kw)}`);
      setGuides(res.data.data);
    } catch {
      toast({ title: 'Gagal memuat data pemandu', status: 'error', duration: 3000, isClosable: true });
      setGuides([]);
    } finally {
      setLoadingGuides(false);
    }
  }, [toast]);

  // Jalankan pencarian saat query URL berubah
  useEffect(() => {
    setInputValue(query);
    fetchGuides(query);
    fetchAllTours();
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const kw = inputValue.trim();
    if (!kw) return;
    setSearchParams({ q: kw });
  };

  const totalResults = guides.length + tours.length;

  return (
    <Box minH="100vh" bg={pageBg}>
      <TouristNavbar />

      <Container maxW="container.xl" py={8}>
        {/* Breadcrumb */}
        <Breadcrumb
          spacing="8px"
          separator={<ChevronRightIcon color="gray.400" />}
          mb={6}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/dashboard')} color={subtleColor} _hover={{ color: primaryColor }}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color={titleColor} fontWeight="medium">Hasil Pencarian</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Search bar */}
        <Box mb={8}>
          <Heading size="lg" color={titleColor} mb={4} fontWeight="bold">
            Cari Pemandu & Paket Wisata
          </Heading>
          <Flex gap={3} maxW="600px">
            <InputGroup flex="1">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Cari nama pemandu, spesialisasi, atau destinasi..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                size="lg"
              />
            </InputGroup>
            <Button
              colorScheme="blue"
              size="lg"
              px={8}
              leftIcon={<SearchIcon />}
              onClick={handleSearch}
              isLoading={loadingGuides || loadingTours}
            >
              Cari
            </Button>
          </Flex>

          {/* Ringkasan hasil */}
          {query && !loadingGuides && !loadingTours && (
            <Text fontSize="sm" color={subtleColor} mt={3}>
              Menampilkan{' '}
              <Text as="span" fontWeight="bold" color={primaryColor}>{totalResults}</Text> hasil untuk{' '}
              <Text as="span" fontWeight="bold">"{query}"</Text>
              {' '}({guides.length} pemandu, {tours.length} paket)
            </Text>
          )}
        </Box>

        {/* Placeholder saat belum ada query */}
        {!query && (
          <Box textAlign="center" py={20}>
            <Text fontSize="5xl" mb={4}>🔍</Text>
            <Heading size="md" color={titleColor} mb={2}>Temukan Pemandu & Paket Wisata</Heading>
            <Text color={subtleColor} maxW="400px" mx="auto">
              Ketik nama pemandu, spesialisasi, atau destinasi wisata di kolom pencarian di atas.
            </Text>
          </Box>
        )}

        {/* Hasil pencarian */}
        {query && (
          <VStack spacing={10} align="stretch">

            {/* ── Seksi Pemandu Wisata ── */}
            <Box>
              <Flex align="center" gap={3} mb={5} pb={3} borderBottom="2px solid" borderColor={dividerColor}>
                <Text fontSize="xl">🧭</Text>
                <Heading size="md" color={titleColor}>Pemandu Wisata</Heading>
                {!loadingGuides && (
                  <Badge colorScheme={guides.length > 0 ? 'blue' : 'gray'} borderRadius="full" px={2}>
                    {guides.length} hasil
                  </Badge>
                )}
              </Flex>

              {loadingGuides ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                  {[1, 2, 3].map(i => <GuideCardSkeleton key={i} />)}
                </SimpleGrid>
              ) : guides.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                  {guides.map((g, idx) => (
                    <GuideCard key={g.id} guide={g} index={idx} />
                  ))}
                </SimpleGrid>
              ) : (
                <EmptyState type="guide" keyword={query} />
              )}
            </Box>

            {/* ── Seksi Paket Wisata ── */}
            <Box>
              <Flex align="center" gap={3} mb={5} pb={3} borderBottom="2px solid" borderColor={dividerColor}>
                <Text fontSize="xl">🗺️</Text>
                <Heading size="md" color={titleColor}>Paket Wisata</Heading>
                {!loadingTours && (
                  <Badge colorScheme={tours.length > 0 ? 'blue' : 'gray'} borderRadius="full" px={2}>
                    {tours.length} hasil
                  </Badge>
                )}
              </Flex>

              {loadingTours ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                  {[1, 2, 3].map(i => <TourCardSkeleton key={i} />)}
                </SimpleGrid>
              ) : tours.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                  {tours.map((t, idx) => (
                    <TourCard key={t.id} tour={t} index={idx} />
                  ))}
                </SimpleGrid>
              ) : (
                <EmptyState type="tour" keyword={query} />
              )}
            </Box>

          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults;
