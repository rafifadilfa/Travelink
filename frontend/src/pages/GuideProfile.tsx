import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Flex, Text, Heading, Container,
  Avatar, Badge, HStack, VStack, Icon, useColorModeValue,
  Tag, Wrap, WrapItem, Grid, Spinner,
} from '@chakra-ui/react';
import {
  ArrowBackIcon, ChatIcon, StarIcon, TimeIcon, InfoOutlineIcon,
  CheckIcon, ExternalLinkIcon, ViewIcon,
} from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import apiClient from '../services/api';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface ReviewItem {
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface GuideData {
  id: number;
  name: string;
  avatar: string | null;
  location: string;
  rating: number;
  reviews_count: number;
  reviews: ReviewItem[];
  languages: string[];
  specialties: string[];
  experience: string;
  about: string;
  total_tours: number;
}

interface TourItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  is_open_trip: boolean;
  rating: number;
  image_url: string | null;
  categories: string[];
}

const GuideProfile: React.FC = () => {
  const navigate   = useNavigate();
  const { id }     = useParams<{ id: string }>();

  const [guide, setGuide]   = useState<GuideData | null>(null);
  const [tours, setTours]   = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  // Semua hook di level atas
  const overallBg          = useColorModeValue('blue.50', 'gray.900');
  const cardBg             = useColorModeValue('white', 'gray.800');
  const glassBg            = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
  const primaryColor       = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor  = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor   = useColorModeValue('gray.800', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleBorderColor  = useColorModeValue('gray.200', 'gray.700');
  const accentGradientFrom = useColorModeValue('purple.400', 'purple.300');
  const accentGradientTo   = useColorModeValue('blue.500', 'blue.400');
  const accentGradient     = `linear(to-br, ${accentGradientFrom}, ${accentGradientTo})`;

  const avatarBorderColor  = useColorModeValue('white', 'gray.700');
  const infoBg             = useColorModeValue('gray.50', 'gray.700');
  const tourCardBg         = useColorModeValue('gray.50', 'gray.700');
  const focusShadow        = useColorModeValue('blue.200', 'blue.700');
  const primaryBtnGradFrom = useColorModeValue('blue.400', 'blue.300');
  const primaryBtnHoverTo  = useColorModeValue('blue.500', 'blue.400');
  const secondaryHoverBg   = useColorModeValue('blue.50', 'rgba(49,130,206,0.1)');
  const starEmptyColor     = useColorModeValue('gray.300', 'gray.600');

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "44px",
    px: 5, fontSize: "sm",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${focusShadow}` }
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
      bg: secondaryHoverBg, borderColor: primaryHoverColor,
      color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
    },
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await apiClient.get(`/guides/${id}`);
        setGuide({ ...res.data.guide, reviews: res.data.guide.reviews ?? [] });
        setTours(res.data.tours ?? []);
      } catch {
        setError('Profil pemandu tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={overallBg}>
        <Spinner size="xl" color={primaryColor} />
      </Flex>
    );
  }

  if (error || !guide) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={overallBg}>
        <Text color="red.500">{error || 'Pemandu tidak ditemukan.'}</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
      {/* Navbar */}
      <Box bg={glassBg} backdropFilter="blur(18px)" boxShadow="sm" position="sticky" top={0} zIndex={1000} borderBottom="1px solid" borderColor={subtleBorderColor}>
        <Container maxW="container.xl">
          <Flex h="68px" justify="space-between" align="center">
            <Flex align="center" gap={2.5} onClick={() => navigate('/dashboard')} cursor="pointer">
              <Flex alignItems="center" justifyContent="center" boxSize="40px" borderRadius="lg" bgGradient={accentGradient} boxShadow="lg" transition="all 0.3s ease" _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}>
                <Text fontSize="xl" color="white" fontWeight="bold">✈</Text>
              </Flex>
              <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold">Travelink</Heading>
            </Flex>
            <HStack spacing={3}>
              <Button {...secondaryButtonStyle} size="sm" onClick={() => navigate('/tours')} leftIcon={<ExternalLinkIcon />}>Explore Tour</Button>
              <Button {...primaryButtonStyle} size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ArrowBackIcon />}>Dashboard</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        {/* Header guide */}
        <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.6s ease-out`}>
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} gap={{ base: 5, md: 8 }}>
            <VStack spacing={3} align={{ base: "center", md: "flex-start" }}>
              <Avatar size="xl" name={guide.name} src={guide.avatar ?? undefined} border="4px solid" borderColor={avatarBorderColor} boxShadow={`0 0 12px ${primaryColor}`} />
            </VStack>
            <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
              <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5}>{guide.name}</Heading>
              <HStack spacing={2} mb={3} justify={{ base: 'center', md: 'flex-start' }} flexWrap="wrap">
                <Badge px={3} py={1} borderRadius="full" colorScheme="blue" fontSize="sm" fontWeight="medium" display="inline-flex" alignItems="center">
                  <Icon as={InfoOutlineIcon} mr={1.5} /> {guide.location}
                </Badge>
                <Badge px={3} py={1} borderRadius="full" colorScheme="yellow" fontSize="sm" fontWeight="medium" display="inline-flex" alignItems="center">
                  <StarIcon mr={1.5} /> {guide.rating.toFixed(1)} ({guide.reviews_count} ulasan)
                </Badge>
              </HStack>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3} mb={4}>
                {guide.languages.length > 0 && (
                  <HStack bg={infoBg} p={2.5} borderRadius="md" borderLeft="3px solid" borderColor={primaryColor}>
                    <Icon as={ChatIcon} color={primaryColor} boxSize={4} />
                    <Text fontSize="sm" color={secondaryTextColor}>
                      <Text as="span" fontWeight="medium" color={primaryTextColor}>Bahasa:</Text> {guide.languages.join(', ')}
                    </Text>
                  </HStack>
                )}
                <HStack bg={infoBg} p={2.5} borderRadius="md" borderLeft="3px solid" borderColor={primaryColor}>
                  <Icon as={TimeIcon} color={primaryColor} boxSize={4} />
                  <Text fontSize="sm" color={secondaryTextColor}>
                    <Text as="span" fontWeight="medium" color={primaryTextColor}>Pengalaman:</Text> {guide.experience}
                  </Text>
                </HStack>
              </Grid>
            </Box>
          </Flex>
        </Box>

        {/* Tentang pemandu */}
        {guide.about && (
          <Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" mb={8} animation={`${slideInUp} 0.7s ease-out 0.1s both`}>
            <Heading size="lg" color={primaryColor} mb={4} pb={2} borderBottom="2px solid" borderColor={subtleBorderColor}>
              Tentang {guide.name.split(' ')[0]}
            </Heading>
            <Text color={primaryTextColor} lineHeight="1.8" mb={5} fontSize="md">{guide.about}</Text>
            {guide.specialties.length > 0 && (
              <>
                <Heading size="md" color={primaryTextColor} mb={3} mt={6}>Spesialisasi</Heading>
                <Wrap spacing={3}>
                  {guide.specialties.map((s, i) => (
                    <WrapItem key={i}>
                      <Tag size="lg" variant="subtle" colorScheme="blue" borderRadius="full" p={2.5} px={4}>
                        <Icon as={CheckIcon} mr={2} boxSize={3.5} /> {s}
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </>
            )}
          </Box>
        )}

        {/* Tour yang ditawarkan */}
        <Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" mb={8} animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
          <Heading size="lg" color={primaryColor} mb={6} pb={2} borderBottom="2px solid" borderColor={subtleBorderColor}>
            Tour oleh {guide.name.split(' ')[0]}
          </Heading>

          {tours.length === 0 ? (
            <Text color={secondaryTextColor} textAlign="center" py={8}>Belum ada tour yang tersedia.</Text>
          ) : (
            <VStack spacing={6} align="stretch">
              {tours.map(tour => (
                <Box
                  key={tour.id}
                  bg={tourCardBg} p={5} borderRadius="lg" boxShadow="md"
                  border="1px solid" borderColor={subtleBorderColor}
                  transition="all 0.3s ease-in-out" position="relative" overflow="hidden"
                  _hover={{ boxShadow: 'xl', borderColor: primaryColor, transform: 'translateY(-4px) scale(1.01)' }}
                >
                  <Tag
                    size="sm" colorScheme={tour.is_open_trip ? 'teal' : 'purple'} variant="solid"
                    position="absolute" top={3} right={3} borderRadius="md"
                  >
                    {tour.is_open_trip ? 'Open Trip' : 'Private Trip'}
                  </Tag>
                  <Heading size="md" color={primaryTextColor} mb={2.5} noOfLines={1}>{tour.name}</Heading>
                  <HStack spacing={4} color={secondaryTextColor} fontSize="sm" mb={3}>
                    {tour.duration && (
                      <HStack><Icon as={TimeIcon} /><Text>{tour.duration}</Text></HStack>
                    )}
                    {tour.rating > 0 && (
                      <HStack>
                        <Icon as={StarIcon} color="yellow.400" />
                        <Text>{tour.rating.toFixed(1)}</Text>
                      </HStack>
                    )}
                    {tour.categories.slice(0, 2).map(cat => (
                      <Badge key={cat} colorScheme="blue" variant="subtle" fontSize="xs">{cat}</Badge>
                    ))}
                  </HStack>
                  {tour.description && (
                    <Text color={secondaryTextColor} fontSize="sm" mb={4} noOfLines={2}>{tour.description}</Text>
                  )}
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color={primaryColor} fontSize="xl">
                      {formatPrice(tour.price)}
                      <Text as="span" fontSize="xs" color={secondaryTextColor} fontWeight="normal"> /orang</Text>
                    </Text>
                    <Button
                      {...secondaryButtonStyle} size="sm" h="40px" leftIcon={<ViewIcon />}
                      onClick={() => navigate(`/tours/${tour.id}`)}
                    >
                      Lihat Detail
                    </Button>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Ulasan Wisatawan */}
        {guide.reviews.length > 0 && (
          <Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" mb={8} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
            <Heading size="lg" color={primaryColor} mb={6} pb={2} borderBottom="2px solid" borderColor={subtleBorderColor}>
              Ulasan Wisatawan
            </Heading>
            <VStack spacing={4} align="stretch">
              {guide.reviews.map((review, idx) => (
                <Box
                  key={idx}
                  bg={infoBg} p={4} borderRadius="lg"
                  border="1px solid" borderColor={subtleBorderColor}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="semibold" fontSize="sm" color={primaryTextColor}>
                      {review.reviewer_name}
                    </Text>
                    <Text fontSize="xs" color={secondaryTextColor}>{review.created_at}</Text>
                  </Flex>
                  <HStack spacing={0.5} mb={review.comment ? 2 : 0}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon
                        key={star}
                        as={StarIcon}
                        boxSize={3}
                        color={star <= review.rating ? 'yellow.400' : starEmptyColor}
                      />
                    ))}
                  </HStack>
                  {review.comment && (
                    <Text fontSize="sm" color={primaryTextColor} lineHeight="1.6">
                      {review.comment}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default GuideProfile;
