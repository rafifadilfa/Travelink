import React, { useEffect, useState } from 'react';
import {
  Box, Button, Flex, Text, Heading, Image, Container, Grid,
  useColorModeValue, IconButton, Icon, Badge, VStack, HStack,
  Spinner, Avatar,
} from '@chakra-ui/react';
import { ArrowForwardIcon, StarIcon as ChakraStarIcon } from '@chakra-ui/icons';
import TouristNavbar from '../components/TouristNavbar';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ApiTour {
  id: number;
  name: string;
  image_url: string | null;
  description: string | null;
  rating: number;
  reviews_count: number;
  price: number;
  categories: string[];
  featured: boolean;
  is_open_trip: boolean;
  location: string;
}

interface ApiGuide {
  id: number;
  name: string;
  avatar: string | null;
  location: string;
  rating: number;
  total_tours: number;
  specialty: string | null;
}

interface ApiBooking {
  id: number;
  booking_status: string;
  transaction: {
    tour_date: string;
    tour: {
      id: number;
      name: string;
      location: string;
      image_url: string | null;
    } | null;
  } | null;
}

const ShineIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M12 0L13.845 10.155L24 12L13.845 13.845L12 24L10.155 13.845L0 12L10.155 10.155L12 0Z" />
  </Icon>
);

// ── Status label helper ───────────────────────────────────────────────────────
const bookingStatusLabel = (status: string): { label: string; color: string } => {
  const map: Record<string, { label: string; color: string }> = {
    menunggu_pembayaran:        { label: 'Menunggu Pembayaran', color: 'yellow' },
    menunggu_konfirmasi_pemandu:{ label: 'Menunggu Konfirmasi', color: 'orange' },
    terkonfirmasi:              { label: 'Dikonfirmasi', color: 'green' },
    selesai:                    { label: 'Selesai', color: 'blue' },
    dibatalkan:                 { label: 'Dibatalkan', color: 'red' },
  };
  return map[status] ?? { label: status, color: 'gray' };
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Data dari API
  const [featuredTours, setFeaturedTours]       = useState<ApiTour[]>([]);
  const [topGuides, setTopGuides]               = useState<ApiGuide[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<ApiBooking[]>([]);
  const [loadingTours, setLoadingTours]         = useState(true);
  const [loadingGuides, setLoadingGuides]       = useState(true);
  const [loadingBookings, setLoadingBookings]   = useState(true);

  // ── Semua useColorModeValue di level atas ─────────────────────────────────
  const overallBg          = useColorModeValue('blue.50', 'gray.900');
  const cardBg             = useColorModeValue('white', 'gray.800');
  const primaryColor       = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor  = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor   = useColorModeValue('gray.800', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleBorderColor  = useColorModeValue('gray.200', 'gray.700');
  const accentGradFrom     = useColorModeValue('purple.400', 'purple.300');
  const accentGradTo       = useColorModeValue('blue.500', 'blue.400');
  const accentGradient     = `linear(to-br, ${accentGradFrom}, ${accentGradTo})`;
  const glowColorStart     = useColorModeValue('rgba(49, 130, 206, 0.4)', 'rgba(99, 179, 237, 0.4)');
  const glowColorEnd       = useColorModeValue('rgba(128, 90, 213, 0.6)', 'rgba(159, 122, 234, 0.6)');

  const focusShadow        = useColorModeValue('blue.200', 'blue.700');
  const primaryBtnGradFrom = useColorModeValue('blue.400', 'blue.300');
  const primaryBtnHoverTo  = useColorModeValue('blue.500', 'blue.400');
  const secondaryHoverBg   = useColorModeValue('blue.50', 'rgba(49,130,206,0.08)');
  const bgPatternOpacity   = useColorModeValue(0.02, 0.01);
const ratingBadgeBg      = useColorModeValue('whiteAlpha.900', 'blackAlpha.700');
  const starEmptyColor     = useColorModeValue('gray.300', 'gray.600');

  // ── Keyframes ─────────────────────────────────────────────────────────────
  const fadeIn     = keyframes`from { opacity: 0; } to { opacity: 1; }`;
  const slideInUp  = keyframes`from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); }`;
  const slideInLeft  = keyframes`from { opacity: 0; transform: translateX(-25px); } to { opacity: 1; transform: translateX(0); }`;
  const slideInRight = keyframes`from { opacity: 0; transform: translateX(25px); } to { opacity: 1; transform: translateX(0); }`;
  const floatAnim  = keyframes`0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); }`;
  const pulseAnim  = keyframes`0%, 100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.5); } 50% { box-shadow: 0 0 0 6px rgba(72, 187, 120, 0); }`;
  const pulsingGlow = keyframes`0% { box-shadow: 0 0 8px 2px ${glowColorStart}; } 50% { box-shadow: 0 0 18px 5px ${glowColorEnd}; } 100% { box-shadow: 0 0 8px 2px ${glowColorStart}; }`;
  const iconSparkle = keyframes`0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); }`;

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "44px", px: 5, fontSize: "sm",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${focusShadow}` },
  };
  const primaryButtonStyle = {
    ...baseButtonStyle,
    bgGradient: `linear(to-r, ${primaryColor}, ${primaryBtnGradFrom})`, color: 'white', boxShadow: "md",
    _hover: { bgGradient: `linear(to-r, ${primaryHoverColor}, ${primaryBtnHoverTo})`, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg' },
  };
  const secondaryButtonStyle = {
    ...baseButtonStyle, bg: 'transparent', color: primaryColor, border: "2px solid", borderColor: primaryColor,
    _hover: { bg: secondaryHoverBg, borderColor: primaryHoverColor, color: primaryHoverColor, transform: 'translateY(-2px)', boxShadow: 'md' },
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);


  // ── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Tour featured (ambil semua published, filter featured di frontend)
    apiClient.get('/tours').then(res => {
      const all: ApiTour[] = res.data.data ?? [];
      const featured = all.filter(t => t.featured).slice(0, 3);
      setFeaturedTours(featured.length > 0 ? featured : all.slice(0, 3));
    }).catch(() => {}).finally(() => setLoadingTours(false));

    // Top guides
    apiClient.get('/guides?limit=3').then(res => {
      setTopGuides(res.data.data ?? []);
    }).catch(() => {}).finally(() => setLoadingGuides(false));

    // Upcoming bookings (private trips)
    apiClient.get('/bookings').then(res => {
      const all: ApiBooking[] = res.data.data ?? [];
      const active = all.filter(b =>
        b.booking_status !== 'dibatalkan' && b.booking_status !== 'selesai'
      ).slice(0, 3);
      setUpcomingBookings(active);
    }).catch(() => {}).finally(() => setLoadingBookings(false));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg={overallBg} position="relative" animation={`${fadeIn} 0.5s ease-out`}>
      {/* Background pattern */}
      <Box
        position="fixed" top={0} left={0} right={0} bottom={0}
        opacity={bgPatternOpacity}
        backgroundImage={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}
        zIndex={0} pointerEvents="none"
      />

      <TouristNavbar />

      <Container maxW="container.xl" py={{ base: 6, md: 10 }} position="relative" zIndex={1}>
        {/* Hero */}
        <Box borderRadius={{ base: "2xl", md: "3xl" }} overflow="hidden" mb={{ base: 10, md: 16 }} position="relative" minH={{ base: "60vh", md: "70vh", lg: "75vh" }} display="flex" alignItems="flex-end" p={{ base: 6, md: 10, lg: 12 }} backgroundImage="url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" backgroundSize="cover" backgroundPosition="center" boxShadow="xl" textAlign={{ base: 'center', md: 'left' }}>
          <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-t, blackAlpha.800 25%, blackAlpha.600 55%, transparent 100%)" />
          <Box display={{ base: 'none', lg: 'block' }} position="absolute" top="10%" left="5%" boxSize={{ lg: "80px", xl: "120px" }} borderRadius="full" bg="whiteAlpha.200" filter="blur(2px)" animation={`${floatAnim} 6s ease-in-out infinite alternate`} />
          <Box display={{ base: 'none', lg: 'block' }} position="absolute" bottom="15%" right="8%" boxSize={{ lg: "60px", xl: "80px" }} borderRadius="2xl" bg="whiteAlpha.200" filter="blur(2px)" animation={`${floatAnim} 8s ease-in-out infinite alternate-reverse`} />
          <Container maxW="container.md" position="relative" zIndex={2}>
            <Box maxW={{ base: "100%", md: "80%" }}>
              <Badge px={4} py={1.5} borderRadius="full" bgGradient={accentGradient} color="white" fontSize="sm" fontWeight="bold" mb={4} display="inline-flex" alignItems="center" animation={`${slideInUp} 0.6s ease-out`} boxShadow="md">
                Petualangan Baru Menanti!
              </Badge>
              <Heading as="h1" fontSize={{ base: "2rem", sm: "2.8rem", md: "3.5rem", lg: "4.2rem" }} mb={4} color="white" fontWeight="black" lineHeight="1.15" textShadow="0 3px 15px rgba(0,0,0,0.6)" animation={`${slideInUp} 0.8s ease-out 0.1s both`}>
                Perjalananmu, Lebih Berkesan.
              </Heading>
              <Text fontSize={{ base: "md", md: "lg", lg: "xl" }} mb={8} color="gray.100" lineHeight="1.7" fontWeight="normal" textShadow="0 1px 4px rgba(0,0,0,0.5)" animation={`${slideInUp} 0.8s ease-out 0.25s both`} maxW={{ base: "100%", md: "90%" }}>
                Pengalaman tak terlupakan bersama pemandu lokal terbaik. Jelajahi keindahan Indonesia bersama Travelink.
              </Text>
              <Button {...primaryButtonStyle} size="lg" fontSize="lg" px={10} h="60px" onClick={() => navigate('/tours')} animation={`${slideInUp} 0.8s ease-out 0.4s both, ${pulsingGlow} 3s ease-in-out infinite 1.2s`}
                leftIcon={<Box mr={1} animation={`${iconSparkle} 2s ease-in-out infinite 1.5s`}><ShineIcon color="yellow.300" boxSize="24px" /></Box>}>
                Temukan Tour
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Featured Destinations */}
        <Box mb={16}>
          <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 2 }}>
            <Box>
              <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} display="flex" alignItems="center">
                <Text as="span" fontSize="2xl" mr={3} role="img">🌟</Text> Destinasi Unggulan
              </Heading>
              <Text color={secondaryTextColor} fontSize="md">Tour pilihan terbaik untuk Anda.</Text>
            </Box>
            <Button {...secondaryButtonStyle} size="sm" h="42px" onClick={() => navigate('/tours')} rightIcon={<ArrowForwardIcon ml={1} />}>Lihat Semua</Button>
          </Flex>

          {loadingTours ? (
            <Flex justify="center" py={12}><Spinner size="lg" color={primaryColor} /></Flex>
          ) : (
            <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 6, md: 8 }}>
              {featuredTours.map((tour, index) => (
                <Box
                  key={tour.id} bg={cardBg} borderRadius="xl" overflow="hidden"
                  boxShadow="lg" border="1px solid" borderColor={subtleBorderColor}
                  transition="all 0.35s cubic-bezier(.08,.52,.52,1)" cursor="pointer"
                  _hover={{ boxShadow: 'xl', borderColor: primaryColor, transform: 'translateY(-6px) scale(1.01)' }}
                  onClick={() => navigate(`/tours/${tour.id}`, { state: { is_open_trip: tour.is_open_trip, tour_id: tour.id } })}
                  animation={`${slideInUp} 0.6s ease-out ${index * 0.1}s both`}
                  role="group"
                >
                  <Box position="relative" h="250px" overflow="hidden">
                    <Image
                      src={tour.image_url ?? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E"}
                      alt={tour.name} w="full" h="full" objectFit="cover"
                      transition="transform 0.5s ease-in-out" _groupHover={{ transform: 'scale(1.08)' }}
                    />
                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-t, blackAlpha.700 15%, transparent 70%)" />
                    <HStack position="absolute" top={4} left={4} spacing={2}>
                      {tour.categories.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="solid" bgGradient={accentGradient} color="white" px={2.5} py={1} borderRadius="md" fontSize="xs" boxShadow="sm">{tag}</Badge>
                      ))}
                    </HStack>
                    {tour.is_open_trip && (
                      <Badge
                        position="absolute" top={4} right={4}
                        colorScheme="purple" variant="solid"
                        px={3} py={1} borderRadius="full"
                        fontSize="xs" fontWeight="bold"
                        boxShadow="md" pointerEvents="none"
                      >
                        ✨ Smart Open Trip
                      </Badge>
                    )}
                    <Flex position="absolute" bottom={4} left={4} bg={ratingBadgeBg} backdropFilter="blur(8px)" px={3} py={1.5} borderRadius="lg" alignItems="center" boxShadow="md">
                      <Icon as={ChakraStarIcon} fill="yellow.400" color="yellow.400" boxSize={4} mr={1.5} />
                      <Text fontWeight="bold" color={primaryTextColor} fontSize="sm">{tour.rating.toFixed(1)}</Text>
                      <Text fontSize="xs" color={secondaryTextColor} ml={1.5}>({tour.reviews_count} ulasan)</Text>
                    </Flex>
                  </Box>
                  <Box p={{ base: 4, md: 5 }}>
                    <Heading size="md" mb={1.5} color={primaryTextColor} fontWeight="semibold" noOfLines={1}>{tour.name}</Heading>
                    <Text color={secondaryTextColor} mb={3} fontSize="sm" lineHeight="1.6" noOfLines={2}>{tour.description}</Text>
                    <Flex justify="space-between" align="center" mt={2}>
                      <Box>
                        <Text fontWeight="bold" color={primaryColor} fontSize="lg">{formatPrice(tour.price)}</Text>
                        <Text fontSize="xs" color={secondaryTextColor}>{tour.is_open_trip ? 'per paket' : 'per orang'}</Text>
                      </Box>
                      <Button {...primaryButtonStyle} size="sm" h="40px" px={5} onClick={e => { e.stopPropagation(); navigate(`/tours/${tour.id}`); }}>Pesan</Button>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {/* Smart Open Trip Banner */}
        <Box mb={16} animation={`${slideInUp} 0.7s ease-out 0.15s both`}>
          <Box borderRadius={{ base: '2xl', md: '3xl' }} overflow="hidden" position="relative" bgGradient="linear(135deg, teal.700 0%, teal.600 50%, green.600 100%)" boxShadow="xl">
            <Box position="absolute" top="-80px" left="-80px" boxSize="300px" borderRadius="full" bg="whiteAlpha.100" filter="blur(50px)" pointerEvents="none" />
            <Box position="absolute" bottom="-50px" right="15%" boxSize="220px" borderRadius="full" bg="whiteAlpha.100" filter="blur(40px)" pointerEvents="none" />
            <Flex direction={{ base: 'column', lg: 'row' }} align={{ base: 'flex-start', lg: 'center' }} px={{ base: 6, md: 10, lg: 14 }} py={{ base: 10, md: 12 }} gap={{ base: 8, lg: 10 }} minH={{ lg: '320px' }}>
              <Box flex="1" zIndex={1}>
                <Badge display="inline-flex" alignItems="center" bg="whiteAlpha.200" color="white" border="1px solid" borderColor="whiteAlpha.300" backdropFilter="blur(8px)" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold" mb={5}>
                  <ShineIcon boxSize="10px" color="yellow.200" mr={1.5} /> Fitur Unggulan
                </Badge>
                <Heading as="h2" fontSize={{ base: '2xl', md: '3xl', lg: '3xl' }} color="white" fontWeight="black" lineHeight="1.2" mb={3} textShadow="0 2px 8px rgba(0,0,0,0.15)">
                  Traveling Lebih Hemat,<br />Bareng Sesama Traveler
                </Heading>
                <Text color="whiteAlpha.900" fontSize={{ base: 'sm', md: 'md' }} lineHeight="1.75" mb={7} maxW={{ base: 'full', lg: '500px' }}>
                  Smart Open Trip mencocokkan kamu dengan traveler lain yang punya selera perjalanan serupa. Daftar, tunggu match, berangkat bareng — biaya dibagi adil.
                </Text>
                <VStack spacing={3} align="flex-start" mb={8}>
                  {['Harga lebih hemat karena biaya dibagi bersama', 'Dicocokkan otomatis berdasarkan minat & budgetmu', 'Pemandu wisata lokal terverifikasi'].map(benefit => (
                    <HStack key={benefit} spacing={3} align="flex-start">
                      <Flex align="center" justify="center" flexShrink={0} boxSize="20px" mt="2px" borderRadius="full" bg="whiteAlpha.300" border="1px solid" borderColor="whiteAlpha.400">
                        <Icon viewBox="0 0 24 24" boxSize="11px" color="white"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></Icon>
                      </Flex>
                      <Text color="whiteAlpha.900" fontSize="sm" fontWeight="medium">{benefit}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Button bg="white" color="teal.700" fontWeight="bold" h="50px" px={8} borderRadius="lg" fontSize="sm" boxShadow="lg" onClick={() => navigate('/tours')} rightIcon={<ArrowForwardIcon />} _hover={{ bg: 'gray.50', transform: 'translateY(-2px)', boxShadow: 'xl' }} _active={{ transform: 'translateY(1px)', boxShadow: 'md' }} transition="all 0.25s cubic-bezier(.08,.52,.52,1)">
                  Cari Tour Open Trip
                </Button>
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Your Upcoming Tours + Meet Your Guides */}
        <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 2.2fr) minmax(0, 1fr)" }} gap={{ base: 10, md: 8 }} mb={16}>
          {/* Upcoming Tours */}
          <Box>
            <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 2 }}>
              <Box>
                <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} display="flex" alignItems="center">
                  <Text as="span" fontSize="2xl" mr={3} role="img">🗓️</Text> Tour Mendatang Anda
                </Heading>
                <Text color={secondaryTextColor} fontSize="md">Bersiap untuk pengalaman luar biasa ini!</Text>
              </Box>
            </Flex>

            {loadingBookings ? (
              <Flex justify="center" py={12}><Spinner size="lg" color={primaryColor} /></Flex>
            ) : upcomingBookings.length > 0 ? (
              <VStack spacing={5} align="stretch">
                {upcomingBookings.map((booking, index) => {
                  const tour = booking.transaction?.tour;
                  const statusInfo = bookingStatusLabel(booking.booking_status);
                  return (
                    <Box
                      key={booking.id} bg={cardBg} borderRadius="xl" overflow="hidden"
                      boxShadow="lg" transition="all 0.3s ease-out" border="1px solid" borderColor={subtleBorderColor}
                      _hover={{ boxShadow: 'xl', borderColor: primaryColor, transform: 'translateX(3px)' }}
                      animation={`${slideInLeft} 0.6s ease-out ${index * 0.12}s both`}
                    >
                      <Flex direction={{ base: 'column', sm: 'row' }} p={4}>
                        <Image
                          src={tour?.image_url ?? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='140' viewBox='0 0 150 140'%3E%3Crect width='150' height='140' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3ETour%3C/text%3E%3C/svg%3E"}
                          alt={tour?.name ?? 'Tour'}
                          w={{ base: 'full', sm: '150px' }} h={{ base: "180px", sm: "140px" }}
                          objectFit="cover" borderRadius="lg"
                          mr={{ sm: 4 }} mb={{ base: 3, sm: 0 }}
                          fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='140' viewBox='0 0 150 140'%3E%3Crect width='150' height='140' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3ETour%3C/text%3E%3C/svg%3E"
                        />
                        <Box flex="1" display="flex" flexDirection="column" justifyContent="space-between">
                          <Box>
                            <Flex justify="space-between" align="flex-start" mb={1}>
                              <Heading size="sm" color={primaryTextColor} fontWeight="semibold" noOfLines={2}>{tour?.name ?? 'Tour'}</Heading>
                              <Badge colorScheme={statusInfo.color} variant="subtle" fontSize="xs" px={2.5} py={1} borderRadius="md">{statusInfo.label}</Badge>
                            </Flex>
                            {tour?.location && (
                              <HStack spacing={1.5} color={secondaryTextColor} fontSize="xs" mb={1}>
                                <Icon viewBox="0 0 24 24" boxSize={3.5} fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></Icon>
                                <Text>{tour.location}</Text>
                              </HStack>
                            )}
                            {booking.transaction?.tour_date && (
                              <HStack spacing={1.5} color={secondaryTextColor} fontSize="xs" mb={3}>
                                <Icon viewBox="0 0 24 24" boxSize={3.5} fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></Icon>
                                <Text>{new Date(booking.transaction.tour_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
                              </HStack>
                            )}
                          </Box>
                          <Flex gap={3} mt="auto" alignSelf={{ base: 'stretch', sm: 'flex-end' }}>
                            <Button {...primaryButtonStyle} size="xs" px={4} h="36px" onClick={() => navigate(`/bookings`)}>Lihat Detail</Button>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <VStack bg={cardBg} p={{ base: 6, md: 10 }} borderRadius="xl" boxShadow="lg" textAlign="center" border="1px solid" borderColor={subtleBorderColor} spacing={4} minH="280px" justifyContent="center">
                <Text fontSize="4xl">🎉</Text>
                <Heading size="md" color={primaryTextColor} fontWeight="semibold">Tidak Ada Tour Mendatang</Heading>
                <Text color={secondaryTextColor} fontSize="sm" maxW="sm">Sepertinya jadwal Anda masih kosong. Yuk, booking tour baru yang seru!</Text>
                <Button {...primaryButtonStyle} px={6} h="42px" onClick={() => navigate('/tours')} mt={2} rightIcon={<Text as="span" ml={1}>🚀</Text>}>Cari Tour</Button>
              </VStack>
            )}
          </Box>

          {/* Meet Your Guides */}
          <Box>
            <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 2 }}>
              <Box>
                <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} display="flex" alignItems="center">
                  <Text as="span" fontSize="2xl" mr={3} role="img">👋</Text> Pemandu Terbaik
                </Heading>
                <Text color={secondaryTextColor} fontSize="md">Pemandu lokal berperingkat tertinggi.</Text>
              </Box>
            </Flex>

            {loadingGuides ? (
              <Flex justify="center" py={12}><Spinner size="lg" color={primaryColor} /></Flex>
            ) : topGuides.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {topGuides.map((guide, index) => (
                  <Box
                    key={guide.id} bg={cardBg} p={4} borderRadius="xl"
                    boxShadow="lg" transition="all 0.3s ease-out" border="1px solid" borderColor={subtleBorderColor}
                    cursor="pointer"
                    _hover={{ boxShadow: 'xl', borderColor: primaryColor, transform: 'matrix(1.01, 0.01, -0.01, 1.01, 0, -3)' }}
                    onClick={() => navigate(`/guides/${guide.id}`)}
                    animation={`${slideInRight} 0.6s ease-out ${index * 0.12}s both`}
                  >
                    <Flex align="center">
                      <Box position="relative" mr={3} flexShrink={0}>
                        <Avatar src={guide.avatar ?? undefined} name={guide.name} boxSize="60px" borderRadius="lg" boxShadow="md" />
                        <Box position="absolute" bottom="-2px" right="-2px" boxSize="16px" bg="green.400" borderRadius="full" border="2.5px solid" borderColor={cardBg} animation={`${pulseAnim} 1.8s infinite`} />
                      </Box>
                      <Box flex="1" minW={0}>
                        <Heading size="sm" mb="1px" color={primaryTextColor} fontWeight="semibold" noOfLines={1}>{guide.name}</Heading>
                        <Text fontSize="xs" color={secondaryTextColor} noOfLines={1}>{guide.specialty ?? guide.location}</Text>
                        <HStack spacing={0.5} mt={1}>
                          {[...Array(5)].map((_, i) => (
                            <Icon key={i} as={ChakraStarIcon} boxSize={3.5} color={i < Math.floor(guide.rating) ? "yellow.400" : starEmptyColor} />
                          ))}
                          <Text fontWeight="semibold" color={primaryTextColor} fontSize="xs" ml={1}>{guide.rating.toFixed(1)}</Text>
                          <Text fontSize="2xs" color={secondaryTextColor}>({guide.total_tours} tour)</Text>
                        </HStack>
                      </Box>
                      <IconButton variant="ghost" colorScheme="blue" size="sm" onClick={e => { e.stopPropagation(); navigate(`/guides/${guide.id}`); }} aria-label={`Lihat profil ${guide.name}`} icon={<ArrowForwardIcon boxSize={4.5} />} />
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color={secondaryTextColor} textAlign="center" py={8}>Belum ada pemandu tersedia.</Text>
            )}
          </Box>
        </Grid>
      </Container>

    </Box>
  );
};

export default Dashboard;
