import {
  Box, Button, Flex, Text, Heading, Container, Avatar, Badge,
  HStack, VStack, Icon, useColorModeValue, Tag, Wrap, WrapItem,
  Grid,
} from '@chakra-ui/react';
import {
  ChatIcon, StarIcon, TimeIcon, InfoOutlineIcon,CheckIcon, ViewIcon,
} from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';
import { Link } from '@inertiajs/react';
import { text } from 'stream/consumers';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// const guideData = {
//   id: 'guide123',
//   name: 'Sarah Johnson',
//   avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
//   location: 'Bali, Indonesia',
//   rating: 4.9,
//   reviews: 189,
//   languages: ['English', 'Indonesian', 'Japanese'],
//   specialties: ['Cultural Tours', 'Beach Activities', 'Adventure Sports', 'Culinary Experiences', 'Yoga Retreats'],
//   experience: '5+ years',
//   about: "Professional travel guide with 5+ years of experience in Bali. Specialized in cultural tours and beach activities. I love sharing the beauty and culture of Indonesia with travelers from around the world. Let's create unforgettable memories together!",
// };

// const offeredTours = [
//   {
//     id: 'tour001',
//     title: 'Jungle ATV Adventure',
//     tag: 'Morning Tour',
//     tagColorScheme: 'green',
//     duration: '3 hours',
//     timeOfDay: 'Morning',
//     timeOfDayIcon: SunIcon,
//     description: "Experience the thrill of riding ATVs through Bali's lush jungle terrain. Perfect for adventure seekers!",
//     price: 750000,
//   },
//   {
//     id: 'tour002',
//     title: 'Thrilling Watersports in Nusa Dua',
//     tag: 'Midday Tour',
//     tagColorScheme: 'purple',
//     duration: '4 hours',
//     timeOfDay: 'Midday',
//     timeOfDayIcon: SunIcon,
//     description: 'Try various exciting watersports activities including jet skiing, parasailing, and banana boat rides.',
//     price: 950000,
//   },
//   {
//     id: 'tour003',
//     title: 'Sunset Seafood Dinner by the Ocean',
//     tag: 'Evening Tour',
//     tagColorScheme: 'orange',
//     duration: '3 hours',
//     timeOfDay: 'Evening',
//     timeOfDayIcon: MoonIcon,
//     description: 'Enjoy a luxurious seafood dinner at Jimbaran Bay while watching the stunning sunset over the ocean.',
//     price: 1200000,
//   },
// ];

interface User{
  id: number;
  name: string;
  profile_photo_path: string | null;
}

interface Languages{
  id: number;
  name: string;
}

interface Country{
  id: number;
  country_name: string;
}

interface Specialities{
  id: number;
  name: string;
}

interface TourDayPhase{
  id: number;
  name: string;
}

interface Tours{
  id: number;
  name: string;
  tour_description: string;
  tour_price: number;
  tour_duration: number;
  dayphase: TourDayPhase;
}

interface Guide{
  id: number;
  name: string;
  rating: number;
  review: number;
  profile_picture: string;
  about: string;
  experience_years: number;
  languages: Languages[];
  country: Country;
  specialities: Specialities[];
  tours: Tours[];
}

interface Props{
  user: User;
  guide: Guide;
  languages: Languages[];
}

export default function GuideProfile({ user, guide, languages }: Props){

  const overallBg = useColorModeValue('blue.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
  const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;

  const specialityColorScheme = useColorModeValue('blue', 'teal');
  const tourBg = useColorModeValue('gray.50', 'gray.700');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "44px",
    px: 5, fontSize: "sm",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${useColorModeValue('blue.200', 'blue.700')}` }
  };

  const primaryButtonStyle = {
    ...baseButtonStyle, bgGradient: `linear(to-r, ${primaryColor}, ${useColorModeValue('blue.400', 'blue.300')})`, color: 'white',
    boxShadow: "md",
    _hover: {
      bgGradient: `linear(to-r, ${primaryHoverColor}, ${useColorModeValue('blue.500', 'blue.400')})`,
      transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg'
    },
  };
  
  const secondaryButtonStyle = {
    ...baseButtonStyle, bg: 'transparent', color: primaryColor,
    border: "2px solid", borderColor: primaryColor,
    _hover: {
      bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'), borderColor: primaryHoverColor,
      color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
    },
  };

  const getDayphaseColorScheme = (dayphaseName?: string): string => {
        switch (dayphaseName) {
            case 'Morning':
                return 'green';

            case 'Afternoon':
                return 'yellow';

            case 'Evening':
                return 'orange';
            
            case 'Night':
              return 'gray';

            default:
                return 'red';
        }
  };

  return (
    <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
      <Box bg={glassBg} backdropFilter="blur(18px)" boxShadow="sm" position="sticky" top={0} zIndex={1000} borderBottom="1px solid" borderColor={subtleBorderColor}>
        <Container maxW="container.xl">
          <Flex h="68px" justify="space-between" align="center">
                      
            <Link href="/dashboard">
              <Flex align="center" gap={2.5}>
                <Flex alignItems="center" justifyContent="center" boxSize="40px" borderRadius="lg" bgGradient={accentGradient} boxShadow="lg" transition="all 0.3s ease" _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}>
                  <Text fontSize="xl" color="white" fontWeight="bold">✈</Text>
                </Flex>
                <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold">
                  Travelink
                </Heading>
              </Flex>
            </Link>

            <HStack spacing={3}>

              <Link href="/ViewAllTour">

                <Button {...secondaryButtonStyle} h="42px" leftIcon={<Text as="span" mr={1}>🧭</Text>}>Explore</Button>
              
              </Link>

              <Link href="/Bookings">

                <Button {...primaryButtonStyle} h="42px" leftIcon={<Text as="span" mr={1}>💼</Text>}>My Bookings</Button>

              </Link>

              <Link href='/profile'>

                <Box position="relative" cursor="pointer" title="My Profile">
                  <Avatar
                    name= {user.name}
                    src= {user.profile_photo_path ? `/storage/${user.profile_photo_path}` : `https://ui-avatars.com/api/?name=${user.name}`}
                    boxSize="42px"
                    border="2px solid"
                    borderColor="transparent"
                    _hover={{ borderColor: primaryColor, transform: 'scale(1.08)', boxShadow: 'lg' }}
                    transition="all 0.2s ease-in-out"
                    boxShadow="md"
                  />
                  <Box position="absolute" top="-1px" right="-1px" boxSize="12px" borderRadius="full" bg="green.400" border="2px solid" borderColor={cardBg} boxShadow="sm" />
                </Box>      

              </Link>

            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.6s ease-out`}>
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} gap={{ base: 5, md: 8 }}>
            <VStack spacing={3} align={{ base: "center", md: "flex-start" }}>
              <Avatar size="xl" name={guide.name} src={guide.profile_picture? `/storage/${guide.profile_picture}` : `https://ui-avatars.com/api/?name=${guide.profile_picture}`} border="4px solid" borderColor={useColorModeValue('white', 'gray.700')} boxShadow={`0 0 12px ${useColorModeValue(primaryColor, 'blue.300')}`} />
            </VStack>
            <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
              <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5}>
                {guide.name}
              </Heading>
              <HStack spacing={2} mb={3} justify={{ base: 'center', md: 'flex-start' }} flexWrap="wrap">
                <Badge px={3} py={1} borderRadius="full" colorScheme="blue" fontSize="sm" fontWeight="medium" display="inline-flex" alignItems="center">
                  <Icon as={InfoOutlineIcon} mr={1.5} /> {guide.country.country_name}
                </Badge>
                <Badge px={3} py={1} borderRadius="full" colorScheme="yellow" fontSize="sm" fontWeight="medium" display="inline-flex" alignItems="center">
                  <StarIcon mr={1.5} /> {guide.rating} ({guide.review} Reviews)
                </Badge>
              </HStack>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={3} mb={4}>
                  <HStack bg={useColorModeValue('gray.50', 'gray.700')} p={2.5} borderRadius="md" borderLeft="3px solid" borderColor={primaryColor}>
                    <Icon as={ChatIcon} color={primaryColor} boxSize={4}/>

                    <Text fontSize="sm" color={secondaryTextColor}>
                      <Text as="span" fontWeight="medium" color={primaryTextColor}>
                        Languages:
                      </Text>{" "}
                      {guide.languages.slice(0, 3).map((langID, index) => {
                        const language = languages.find(l => l.id === langID.id);
                        if (!language) return null;

                        return (
                          <Text as="span" key={langID.id}>
                            {language.name}
                            {index < Math.min(guide.languages.length, 3) - 1 ? ", " : ""}
                          </Text>
                        );
                      })}
                      {guide.languages.length > 3 && (
                        <Text as="span"> and {(guide.languages.length) - 3} more</Text>
                      )}
                    </Text>

                  </HStack>
                  <HStack bg={useColorModeValue('gray.50', 'gray.700')} p={2.5} borderRadius="md" borderLeft="3px solid" borderColor={primaryColor}>
                    <Icon as={TimeIcon} color={primaryColor} boxSize={4}/>
                    <Text fontSize="sm" color={secondaryTextColor}><Text as="span" fontWeight="medium" color={primaryTextColor}>Experience:</Text> {guide.experience_years} Years</Text>
                  </HStack>
              </Grid>
            </Box>
          </Flex>
        </Box>

        <Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" mb={8} animation={`${slideInUp} 0.7s ease-out 0.1s both`}>
          <Heading size="lg" color={primaryColor} mb={4} pb={2} borderBottom="2px solid" borderColor={subtleBorderColor}>
            About {guide.name.split(' ')[0]}
          </Heading>
          <Text color={primaryTextColor} lineHeight="1.8" mb={5} fontSize="md">
            {guide.about}
          </Text>
          <Heading size="md" color={primaryTextColor} mb={3} mt={6}>
            Specialties
          </Heading>
          <Wrap spacing={3}>
            {guide.specialities.map((specialty, index) => (
              <WrapItem key={index}>
                <Tag size="lg" variant="subtle" colorScheme={specialityColorScheme} borderRadius="full" p={2.5} px={4}>
                  <Icon as={CheckIcon} mr={2} boxSize={3.5}/> {specialty.name}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" mb={8} animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
          <Heading size="lg" color={primaryColor} mb={6} pb={2} borderBottom="2px solid" borderColor={subtleBorderColor}>
            Tour Offerings by {guide.name.split(' ')[0]}
          </Heading>
          <VStack spacing={6} align="stretch">
            {guide.tours.map((tour) => (
              <Box
                key={tour.id}
                bg={tourBg}
                p={5}
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor={subtleBorderColor}
                transition="all 0.3s ease-in-out"
                position="relative"
                overflow="hidden"
                _hover={{
                  boxShadow: 'xl',
                  borderColor: primaryColor,
                  transform: 'translateY(-4px) scale(1.01)',
                }}
              >
                <Tag
                  size="sm"
                  colorScheme={getDayphaseColorScheme(tour.dayphase?.name)}
                  variant="solid"
                  position="absolute"
                  top={3}
                  right={3}
                  borderRadius="md"
                >
                  {tour.dayphase.name}
                </Tag>
                <Heading size="md" color={primaryTextColor} mb={2.5} noOfLines={1}>
                  {tour.name}
                </Heading>
                <HStack spacing={4} color={secondaryTextColor} fontSize="sm" mb={3}>
                  <HStack>
                    <Icon as={TimeIcon} /> <Text>{tour.tour_duration} Hours</Text>
                  </HStack>
                  {/* <HStack>
                    <Icon as={tour.timeOfDayIcon} /> <Text>{tour.timeOfDay}</Text>
                  </HStack> */}
                </HStack>
                <Text color={secondaryTextColor} fontSize="sm" mb={4} noOfLines={2}>
                  {tour.tour_description}
                </Text>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" color={primaryColor} fontSize="xl">
                    {formatPrice(tour.tour_price)}
                    <Text as="span" fontSize="xs" color={secondaryTextColor} fontWeight="normal"> /person</Text>
                  </Text>

                  <Link href={route('tour.show', { tour: tour.id})}>
                    <Button
                      {...secondaryButtonStyle}
                      size="sm"
                      h="40px"
                      leftIcon={<ViewIcon />}
                    >
                      View Details
                    </Button>
                  </Link>
                  
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};