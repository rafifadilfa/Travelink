import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  Image,
  Container,
  Grid,
  Input,
  useColorModeValue,
  IconButton,
  Icon,
  Badge,
  VStack,
  HStack,
  Avatar,
} from '@chakra-ui/react';
import { ArrowForwardIcon, StarIcon as ChakraStarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';

interface Destination {
  id: number;
  name: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  tags?: string[];
}

interface Guide {
  id: number;
  name: string;
  avatar: string;
  location: string;
  tours: number;
  rating: number;
  specialty?: string;
}

interface Tour {
  id: number;
  name: string;
  location: string;
  date: string;
  time: string;
  image: string;
  status?: 'Confirmed' | 'Pending' | 'Cancelled';
}

const featuredDestinations: Destination[] = [
  { id: 1, name: 'Mystical Bali Highlands', image: 'https://images.unsplash.com/photo-1573790387438-4da905039392', description: 'Lush rice paddies, ancient temples, and vibrant culture await.', rating: 4.9, reviews: 215, price: 1000000, tags: ['Culture', 'Nature', 'Relaxation'] },
  { id: 2, name: 'Lombok\'s Azure Coasts', image: 'https://images.unsplash.com/photo-1606152536277-5aa1fd33e150', description: 'Pristine beaches, world-class surfing, and the majestic Mt. Rinjani.', rating: 4.8, reviews: 182, price: 1200000, tags: ['Beach', 'Adventure', 'Surfing'] },
  { id: 3, name: 'Jakarta Urban Explorer', image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af', description: 'Dive into the bustling metropolis, a city of contrasts and history.', rating: 4.7, reviews: 121, price: 900000, tags: ['City', 'History', 'Food'] },
];
const topGuides: Guide[] = [
  { id: 1, name: 'Sari Dewi', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', location: 'Ubud, Bali', tours: 156, rating: 4.9, specialty: 'Cultural & Wellness Tours' },
  { id: 2, name: 'Budi Hartono', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', location: 'Kuta, Lombok', tours: 123, rating: 4.8, specialty: 'Surfing & Water Sports' },
  { id: 3, name: 'Wayan Adnyana', avatar: 'https://randomuser.me/api/portraits/men/68.jpg', location: 'Seminyak, Bali', tours: 189, rating: 4.9, specialty: 'Luxury & Culinary Trips' },
];
const upcomingTours: Tour[] = [
  { id: 1, name: 'Sunrise Magic: Mt. Batur', location: 'Bali', date: '15 Aug 2025', time: '03:30 AM', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', status: 'Confirmed' },
  { id: 2, name: 'Gili Islands Underwater Adventure', location: 'Lombok', date: '18 Aug 2025', time: '09:00 AM', image: 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', status: 'Confirmed' },
  { id: 3, name: 'Old Town Jakarta Heritage Walk', location: 'Jakarta', date: '22 Aug 2025', time: '02:00 PM', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300', status: 'Pending' },
];

interface MenuItem {
  label: string;
  path: string;
  iconString: string;
}
const menuItems: MenuItem[] = [
  { label: 'Explore', path: '/tours', iconString: '🗺️' },
  { label: 'My Bookings', path: '/bookings', iconString: '📅' },
  { label: 'Profile', path: '/profile', iconString: '👤' },
  { label: 'Settings', path: '/settings', iconString: '⚙️' }
];

const ShineIcon = (props: React.ComponentProps<typeof Icon>) => (
    <Icon viewBox="0 0 24 24" {...props}>
        <path
            fill="currentColor"
            d="M12 0L13.845 10.155L24 12L13.845 13.845L12 24L10.155 13.845L0 12L10.155 10.155L12 0Z"
        />
    </Icon>
);


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<number[]>([2]);

  const overallBg = useColorModeValue('blue.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(26, 32, 44, 0.8)');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
  const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;
  
  const glowColorStart = useColorModeValue('rgba(49, 130, 206, 0.4)', 'rgba(99, 179, 237, 0.4)');
  const glowColorEnd = useColorModeValue('rgba(128, 90, 213, 0.6)', 'rgba(159, 122, 234, 0.6)');

  const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `;
  const slideInUp = keyframes`
    from { opacity: 0; transform: translateY(25px); }
    to { opacity: 1; transform: translateY(0); }
  `;
  const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-25px); }
    to { opacity: 1; transform: translateX(0); }
  `;
  const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(25px); }
    to { opacity: 1; transform: translateX(0); }
  `;
  const floatAnim = keyframes`
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  `;
  const pulseAnim = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.5); }
    50% { box-shadow: 0 0 0 6px rgba(72, 187, 120, 0); }
  `;
  
  const pulsingGlow = keyframes`
    0% { box-shadow: 0 0 8px 2px ${glowColorStart}; }
    50% { box-shadow: 0 0 18px 5px ${glowColorEnd}; }
    100% { box-shadow: 0 0 8px 2px ${glowColorStart}; }
  `;

  const iconSparkle = keyframes`
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(255, 255, 180, 0.6)); }
    50% { transform: scale(1.25); filter: drop-shadow(0 0 5px rgba(255, 255, 180, 1)); }
  `;
  
  const formatPrice = (price: number): string => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const navigateTo = (path: string): void => {
    navigate(path);
  };
  const toggleDrawer = (): void => setIsDrawerOpen(!isDrawerOpen);

  const toggleFavorite = (destinationId: number): void => {
    setFavorites(prev => prev.includes(destinationId) ? prev.filter(id => id !== destinationId) : [...prev, destinationId]);
  };
  const isFavorite = (destinationId: number): boolean => favorites.includes(destinationId);

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "44px",
    px: 5, fontSize: "sm",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${useColorModeValue('blue.200', 'blue.700')}` }
  };

  const primaryButtonStyle = {
    ...baseButtonStyle,
    bgGradient: `linear(to-r, ${primaryColor}, ${useColorModeValue('blue.400', 'blue.300')})`,
    color: 'white',
    boxShadow: "md",
    _hover: {
      bgGradient: `linear(to-r, ${primaryHoverColor}, ${useColorModeValue('blue.500', 'blue.400')})`,
      transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg'
    },
  };

  const secondaryButtonStyle = {
    ...baseButtonStyle,
    bg: 'transparent',
    color: primaryColor,
    border: "2px solid",
    borderColor: primaryColor,
    _hover: {
      bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.08)'),
      borderColor: primaryHoverColor,
      color: primaryHoverColor, transform: 'translateY(-2px)', boxShadow: 'md'
    },
  };

  const FavoriteButtonIcon = ({ isFav }: { isFav: boolean }) => (
    <Icon viewBox="0 0 24 24" boxSize="20px"
      fill={
        isFav
          ? "white"
          : useColorModeValue("gray.100", "gray.700")
      }
      stroke={
        isFav
          ? "red.500"
          : useColorModeValue("gray.500", "gray.300")
      }
      strokeWidth="1.5px"
      transition="all 0.2s ease"
    >
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </Icon>
  );

  interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
  }
  const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon, children }) => (
    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 2 }}>
      <Box>
        <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} display="flex" alignItems="center">
          {icon && (typeof icon === 'string' ? <Text as="span" fontSize="2xl" mr={3} role="img">{icon}</Text> : <Box mr={3}>{icon}</Box>)}
          {title}
        </Heading>
        <Text color={secondaryTextColor} fontSize="md">{subtitle}</Text>
      </Box>
      {children && <Box mt={{ base: 2, md: 0 }}>{children}</Box>}
    </Flex>
  );

  const StarRatingDisplayIcon = (props: React.ComponentProps<typeof Icon>) => (
    <Icon as={ChakraStarIcon} {...props} />
  );

  return (
    <Box minH="100vh" bg={overallBg} position="relative" animation={`${fadeIn} 0.5s ease-out`}>
      <Box
        position="fixed" top={0} left={0} right={0} bottom={0}
        opacity={useColorModeValue(0.02, 0.01)}
        backgroundImage={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}
        zIndex={0} pointerEvents="none"
      />
      <Box
        bg={glassBg} backdropFilter="blur(18px)" boxShadow="md"
        position="sticky" top={0} zIndex={1000}
        borderBottom="1px solid" borderColor={subtleBorderColor}
      >
        <Container maxW="container.xl">
          <Flex h="68px" justify="space-between" align="center">
            <Flex align="center" gap={2.5} onClick={() => navigateTo('/dashboard')} cursor="pointer">
              <Flex
                alignItems="center" justifyContent="center"
                boxSize="40px" borderRadius="lg"
                bgGradient={accentGradient}
                boxShadow="lg" transition="all 0.3s ease"
                _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}
              >
                <Text fontSize="xl" color="white" fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>✈</Text>
              </Flex>
              <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold" fontFamily="'Inter', sans-serif">
                Travelink
              </Heading>
            </Flex>
            <HStack display={{ base: 'none', md: 'flex' }} spacing={3}>
              <Box maxW="280px" mr={2} position="relative">
                <Input
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl={10} pr={4} h="42px" borderRadius="full"
                  bg={useColorModeValue('whiteAlpha.900', 'whiteAlpha.100')}
                  borderColor={subtleBorderColor}
                  boxShadow="inner" fontSize="sm" variant="outline"
                  _hover={{ borderColor: primaryColor }}
                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.750') }}
                />
                <Box position="absolute" left={3.5} top="50%" transform="translateY(-50%)" color={secondaryTextColor} zIndex={1} fontSize="md">🔍</Box>
              </Box>
              <Button {...secondaryButtonStyle} h="42px" onClick={() => navigateTo('/tours')} leftIcon={<Text as="span" mr={1}>🧭</Text>}>Explore</Button>
              <Button {...primaryButtonStyle} h="42px" onClick={() => navigateTo('/bookings')} leftIcon={<Text as="span" mr={1}>💼</Text>}>My Bookings</Button>
              <Box position="relative" onClick={() => navigateTo('/profile')} cursor="pointer" title="My Profile">
                <Avatar
                  name="User Name"
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  boxSize="42px"
                  border="2px solid"
                  borderColor="transparent"
                  _hover={{ borderColor: primaryColor, transform: 'scale(1.08)', boxShadow: 'lg' }}
                  transition="all 0.2s ease-in-out"
                  boxShadow="md"
                />
                <Box position="absolute" top="-1px" right="-1px" boxSize="12px" borderRadius="full" bg="green.400" border="2px solid" borderColor={cardBg} boxShadow="sm" />
              </Box>
            </HStack>
            <Box display={{ base: 'block', md: 'none' }}>
              <IconButton onClick={toggleDrawer} aria-label="Open Menu" variant="ghost" size="lg" icon={<Icon viewBox="0 0 24 24" boxSize="24px"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></Icon>} _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }} />
            </Box>
          </Flex>
        </Container>
      </Box>
      {isDrawerOpen && (
        <>
          <Box position="fixed" top={0} left={0} right={0} bottom={0} bg="blackAlpha.700" backdropFilter="blur(8px)" zIndex={1999} onClick={toggleDrawer} />
          <Box
            position="fixed" top="0" right="0" bottom="0" w="300px"
            bg={glassBg}
            backdropFilter="blur(18px)"
            boxShadow="2xl" zIndex={2000} p={6} display="flex" flexDirection="column"
            transform={isDrawerOpen ? "translateX(0)" : "translateX(100%)"} transition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
          >
            <Flex justify="space-between" mb={8} align="center">
              <Heading size="lg" color={primaryTextColor} fontWeight="bold">Menu</Heading>
              <IconButton aria-label="Close Menu" icon={<Icon viewBox="0 0 24 24" boxSize="20px"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></Icon>} size="md" variant="ghost" onClick={toggleDrawer} _hover={{ bg: useColorModeValue('red.100', 'red.800'), color: useColorModeValue('red.500', 'red.200') }} />
            </Flex>
            <VStack spacing={4} align="stretch">
              <Input placeholder="Search..." bg={useColorModeValue('whiteAlpha.900', 'whiteAlpha.100')} borderColor={subtleBorderColor} borderRadius="full" h="44px" mb={2} _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }} />
              {menuItems.map((item) => (
                <Button
                  key={item.path} w="full" variant="ghost" color={primaryTextColor}
                  _hover={{ bg: useColorModeValue('blue.100', 'rgba(49,130,206,0.15)'), color: primaryColor, transform: 'translateX(4px)' }}
                  onClick={() => { navigateTo(item.path); toggleDrawer(); }}
                  justifyContent="flex-start"
                  leftIcon={<Text as="span" fontSize="xl" mr={3}>{item.iconString}</Text>}
                  h="56px" fontWeight="medium" transition="all 0.2s ease" borderRadius="lg"
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
            <Button
              w="full" bg="red.500" color="white"
              _hover={{ bg: 'red.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
              onClick={() => { navigateTo('/'); toggleDrawer(); }}
              borderRadius="lg" h="56px" fontWeight="bold" transition="all 0.2s ease"
              leftIcon={<Text as="span" fontSize="xl" mr={3}>🚪</Text>}
              mt="auto"
            >
              Logout
            </Button>
          </Box>
        </>
      )}
      <Container maxW="container.xl" py={{ base: 6, md: 10 }} position="relative" zIndex={1}>
        <Box
          borderRadius={{ base: "2xl", md: "3xl" }}
          overflow="hidden" mb={{ base: 10, md: 16 }}
          position="relative" minH={{ base: "60vh", md: "70vh", lg: "75vh" }}
          display="flex" alignItems="flex-end"
          p={{ base: 6, md: 10, lg: 12 }}
          backgroundImage="url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          backgroundSize="cover" backgroundPosition="center"
          boxShadow="xl"
          textAlign={{ base: 'center', md: 'left' }}
        >
          <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-t, blackAlpha.800 25%, blackAlpha.600 55%, transparent 100%)" />
          <Box display={{ base: 'none', lg: 'block' }} position="absolute" top="10%" left="5%" boxSize={{ lg: "80px", xl: "120px" }} borderRadius="full" bg="whiteAlpha.200" filter="blur(2px)" animation={`${floatAnim} 6s ease-in-out infinite alternate`} />
          <Box display={{ base: 'none', lg: 'block' }} position="absolute" bottom="15%" right="8%" boxSize={{ lg: "60px", xl: "80px" }} borderRadius="2xl" bg="whiteAlpha.200" filter="blur(2px)" animation={`${floatAnim} 8s ease-in-out infinite alternate-reverse`} />
          <Container maxW="container.md" position="relative" zIndex={2}>
            <Box maxW={{ base: "100%", md: "80%" }}>
              <Badge
                px={4} py={1.5} borderRadius="full"
                bgGradient={accentGradient}
                color="white" fontSize="sm" fontWeight="bold" mb={4}
                display="inline-flex" alignItems="center"
                animation={`${slideInUp} 0.6s ease-out`} boxShadow="md"
              >
                New Adventures Await!
              </Badge>
              <Heading
                as="h1"
                fontSize={{ base: "2.8rem", sm: "3.2rem", md: "3.8rem", lg: "4.2rem" }}
                mb={4} color="white" fontWeight="black"
                lineHeight="1.1" textShadow="0 3px 15px rgba(0,0,0,0.6)"
                animation={`${slideInUp} 0.8s ease-out 0.1s both`}
              >
                Your Journey, Reimagined.
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg", lg: "xl" }} mb={8} color="gray.100"
                lineHeight="1.7" fontWeight="normal" textShadow="0 1px 4px rgba(0,0,0,0.5)"
                animation={`${slideInUp} 0.8s ease-out 0.25s both`}
                maxW={{ base: "100%", md: "90%" }}
              >
                Unforgettable experiences crafted by local experts. Dive into the heart of Indonesia with Travelink.
              </Text>
              
              <Button
                {...primaryButtonStyle}
                size="lg" fontSize="lg" px={10} h="60px"
                onClick={() => navigateTo('/tours')}
                animation={`${slideInUp} 0.8s ease-out 0.4s both, ${pulsingGlow} 3s ease-in-out infinite 1.2s`}
                leftIcon={
                    <Box mr={1} animation={`${iconSparkle} 2s ease-in-out infinite 1.5s`}>
                        <ShineIcon color="yellow.300" boxSize="24px" />
                    </Box>
                }
              >
                Discover Tours
              </Button>
            </Box>
          </Container>
        </Box>
        
        <Box mb={16}>
          <SectionHeader title="Featured Destinations" subtitle="Handpicked adventures just for you." icon={"🌟"}>
            <Button {...secondaryButtonStyle} size="sm" h="42px" onClick={() => navigateTo('/tours')} rightIcon={<ArrowForwardIcon ml={1} />}>View All</Button>
          </SectionHeader>
          <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 6, md: 8 }}>
            {featuredDestinations.map((destination, index) => (
              <Box
                key={destination.id}
                bg={cardBg}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                border="1px solid" borderColor={subtleBorderColor}
                transition="all 0.35s cubic-bezier(.08,.52,.52,1)"
                cursor="pointer"
                _hover={{
                  boxShadow: 'xl',
                  borderColor: primaryColor,
                  transform: 'translateY(-6px) scale(1.01)',
                }}
                onClick={() => navigateTo(`/tours/${destination.id}`)}
                animation={`${slideInUp} 0.6s ease-out ${index * 0.1}s both`}
                role="group"
              >
                <Box position="relative" h="250px" overflow="hidden">
                  <Image src={destination.image} alt={destination.name} w="full" h="full" objectFit="cover" transition="transform 0.5s ease-in-out" _groupHover={{ transform: 'scale(1.08)' }} />
                  <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-t, blackAlpha.700 15%, transparent 70%)" />
                  <HStack position="absolute" top={4} left={4} spacing={2}>
                    {destination.tags?.map((tag: string) => <Badge key={tag} variant="solid" bgGradient={accentGradient} color="white" px={2.5} py={1} borderRadius="md" fontSize="xs" boxShadow="sm">{tag}</Badge>)}
                  </HStack>
                  <IconButton
                    aria-label={`Favorite ${destination.name}`}
                    icon={<FavoriteButtonIcon isFav={isFavorite(destination.id)} />}
                    isRound size="md"
                    bg={
                      isFavorite(destination.id)
                        ? "red.500"
                        : useColorModeValue("white", "gray.600")
                    }
                    position="absolute" top={4} right={4}
                    boxShadow="md"
                    _hover={{
                      bg: isFavorite(destination.id)
                        ? "red.600"
                        : useColorModeValue("gray.100", "gray.500"),
                      transform: 'scale(1.1)',
                      boxShadow: 'lg'
                    }}
                    transition="all 0.2s ease" zIndex={2}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      void toggleFavorite(destination.id);
                    }}
                  />
                  <Flex position="absolute" bottom={4} left={4} bg={useColorModeValue("whiteAlpha.900", "blackAlpha.700")} backdropFilter="blur(8px)" px={3} py={1.5} borderRadius="lg" alignItems="center" boxShadow="md">
                    <StarRatingDisplayIcon fill="yellow.400" color="yellow.400" boxSize={4} mr={1.5} />
                    <Text fontWeight="bold" color={primaryTextColor} fontSize="sm">{destination.rating}</Text>
                    <Text fontSize="xs" color={secondaryTextColor} ml={1.5}>({destination.reviews} reviews)</Text>
                  </Flex>
                </Box>
                <Box p={{ base: 4, md: 5 }}>
                  <Heading size="md" mb={1.5} color={primaryTextColor} fontWeight="semibold" noOfLines={1}>{destination.name}</Heading>
                  <Text color={secondaryTextColor} mb={3} fontSize="sm" lineHeight="1.6" noOfLines={2}>{destination.description}</Text>
                  <Flex justify="space-between" align="center" mt={2}>
                    <Box>
                      <Text fontWeight="bold" color={primaryColor} fontSize="lg">{formatPrice(destination.price)}</Text>
                      <Text fontSize="xs" color={secondaryTextColor}>per person</Text>
                    </Box>
                    <Button {...primaryButtonStyle} size="sm" h="40px" px={5} onClick={(e) => { e.stopPropagation(); navigateTo(`/tours/${destination.id}`); }}>
                      Book Now
                    </Button>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 2.2fr) minmax(0, 1fr)" }} gap={{ base: 10, md: 8 }} mb={16}>
          <Box>
            <SectionHeader title="Your Upcoming Tours" subtitle="Get ready for these amazing experiences!" icon={"🗓️"} />
            {upcomingTours.length > 0 ? (
              <VStack spacing={5} align="stretch">
                {upcomingTours.map((tour, index) => (
                  <Box key={tour.id}
                    bg={cardBg} borderRadius="xl" overflow="hidden"
                    boxShadow="lg" transition="all 0.3s ease-out" border="1px solid" borderColor={subtleBorderColor}
                    _hover={{ boxShadow: 'xl', borderColor: primaryColor, transform: 'translateX(3px)' }}
                    animation={`${slideInLeft} 0.6s ease-out ${index * 0.12}s both`}
                  >
                    <Flex direction={{ base: 'column', sm: 'row' }} p={4}>
                      <Image
                        src={tour.image} alt={tour.name}
                        w={{ base: 'full', sm: '150px' }} h={{ base: "180px", sm: "140px" }}
                        objectFit="cover" borderRadius="lg"
                        mr={{ sm: 4 }} mb={{ base: 3, sm: 0 }}
                        fallbackSrc="https://via.placeholder.com/150x140?text=Image"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          console.error(`Failed to load image for ${tour.name}:`, (e.target as HTMLImageElement).src);
                        }}
                      />
                      <Box flex="1" display="flex" flexDirection="column" justifyContent="space-between">
                        <Box>
                          <Flex justify="space-between" align="flex-start" mb={1}>
                            <Heading size="sm" color={primaryTextColor} fontWeight="semibold" noOfLines={2}>{tour.name}</Heading>
                            <Badge colorScheme={tour.status === 'Confirmed' ? 'green' : tour.status === 'Pending' ? 'yellow' : 'red'} variant="subtle" fontSize="xs" px={2.5} py={1} borderRadius="md">{tour.status}</Badge>
                          </Flex>
                          <HStack spacing={1.5} color={secondaryTextColor} fontSize="xs" mb={1}>
                            <Icon viewBox="0 0 24 24" boxSize={3.5} fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></Icon>
                            <Text>{tour.location}</Text>
                          </HStack>
                          <HStack spacing={1.5} color={secondaryTextColor} fontSize="xs" mb={3}>
                            <Icon viewBox="0 0 24 24" boxSize={3.5} fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></Icon>
                            <Text>{tour.date} at {tour.time}</Text>
                          </HStack>
                        </Box>
                        <Flex gap={3} mt="auto" alignSelf={{ base: 'stretch', sm: 'flex-end' }}>
                          <Button {...primaryButtonStyle} size="xs" px={4} h="36px" onClick={() => navigateTo(`/bookings/${tour.id}`)}>View Details</Button>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <VStack bg={cardBg} p={{ base: 6, md: 10 }} borderRadius="xl" boxShadow="lg" textAlign="center" border="1px solid" borderColor={subtleBorderColor} spacing={4} minH="280px" justifyContent="center">
                <Text fontSize="4xl">🎉</Text>
                <Heading size="md" color={primaryTextColor} fontWeight="semibold">Your Adventure Slate is Clean!</Heading>
                <Text color={secondaryTextColor} fontSize="sm" maxW="sm">Looks like you're all caught up. Why not book a new unforgettable experience?</Text>
                <Button {...primaryButtonStyle} px={6} h="42px" onClick={() => navigateTo('/tours')} mt={2} rightIcon={<Text as="span" ml={1}>🚀</Text>}>Let's Find One!</Button>
              </VStack>
            )}
          </Box>

          <Box>
            <SectionHeader title="Meet Your Guides" subtitle="Our top-rated local experts." icon={"👋"} />
            <VStack spacing={4} align="stretch">
              {topGuides.map((guide, index) => (
                <Box
                  key={guide.id}
                  bg={cardBg} p={4} borderRadius="xl"
                  boxShadow="lg" transition="all 0.3s ease-out" border="1px solid" borderColor={subtleBorderColor}
                  cursor="pointer"
                  _hover={{
                    boxShadow: 'xl',
                    borderColor: primaryColor,
                    transform: 'matrix(1.01, 0.01, -0.01, 1.01, 0, -3)',
                  }}
                  onClick={() => navigateTo(`/guides/${guide.id}`)}
                  animation={`${slideInRight} 0.6s ease-out ${index * 0.12}s both`}
                >
                  <Flex align="center">
                    <Box position="relative" mr={3} flexShrink={0}>
                      <Avatar src={guide.avatar} name={guide.name} boxSize="60px" borderRadius="lg" boxShadow="md" />
                      <Box position="absolute" bottom="-2px" right="-2px" boxSize="16px" bg="green.400" borderRadius="full" border="2.5px solid" borderColor={cardBg} animation={`${pulseAnim} 1.8s infinite`} />
                    </Box>
                    <Box flex="1" minW={0}>
                      <Heading size="sm" mb="1px" color={primaryTextColor} fontWeight="semibold" noOfLines={1}>{guide.name}</Heading>
                      <Text fontSize="xs" color={secondaryTextColor} noOfLines={1} title={guide.specialty}>{guide.specialty || guide.location}</Text>
                      <HStack spacing={0.5} mt={1}>
                        {[...Array(5)].map((_, i) => (
                          <StarRatingDisplayIcon key={i} boxSize={3.5} color={i < Math.floor(guide.rating) ? "yellow.400" : useColorModeValue("gray.300", "gray.600")} />
                        ))}
                        <Text fontWeight="semibold" color={primaryTextColor} fontSize="xs" ml={1}>{guide.rating.toFixed(1)}</Text>
                        <Text fontSize="2xs" color={secondaryTextColor}>({guide.tours} tours)</Text>
                      </HStack>
                    </Box>
                    <IconButton variant="ghost" colorScheme="blue" size="sm" onClick={(e) => { e.stopPropagation(); navigateTo(`/guides/${guide.id}/profile`); }} aria-label={`View profile of ${guide.name}`} icon={<ArrowForwardIcon boxSize={4.5} />} />
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;