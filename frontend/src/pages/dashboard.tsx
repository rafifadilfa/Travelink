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
  Badge,
  Input,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Mock data
const featuredDestinations = [
  {
    id: 1,
    name: 'Bali',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392',
    description: 'Experience the magic of Bali with our trusted guides',
    rating: 4.9,
    reviews: 145,
    price: 1000000,
  },
  {
    id: 2,
    name: 'Lombok',
    image: 'https://images.unsplash.com/photo-1606152536277-5aa1fd33e150',
    description: 'Discover pristine beaches and breathtaking landscapes',
    rating: 4.8,
    reviews: 112,
    price: 1200000,
  },
  {
    id: 3,
    name: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af',
    description: 'Explore the vibrant capital city with local experts',
    rating: 4.7,
    reviews: 98,
    price: 900000,
  },
];

const topGuides = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    location: 'Bali',
    tours: 156,
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Putu Wijaya',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    location: 'Lombok',
    tours: 123,
    rating: 4.8,
  },
  {
    id: 3,
    name: 'Wayan Sudiarta',
    avatar: 'https://randomuser.me/api/portraits/men/68.jpg',
    location: 'Ubud',
    tours: 189,
    rating: 4.9,
  },
];

const upcomingTours = [
  {
    id: 1,
    name: 'Sunrise Mount Batur Trek',
    location: 'Bali',
    date: '15 May 2025',
    time: '03:30 AM',
    image: 'https://images.unsplash.com/photo-1604665942242-00b9821da418',
  },
  {
    id: 2,
    name: 'Gili Islands Snorkeling',
    location: 'Lombok',
    date: '18 May 2025',
    time: '09:00 AM',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced color values for better visibility
  const headerBg = 'white';
  const sectionBg = 'gray.50';
  const cardBg = 'white';
  const primaryText = 'gray.800';
  const secondaryText = 'gray.600';
  const highlightColor = 'blue.600';
  const buttonColor = 'blue.600';
  const buttonText = 'white';
  const sectionHeadingColor = 'gray.800';
  const badgeBg = 'green.500';
  const badgeText = 'white';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box minH="100vh" bg={sectionBg}>
      {/* Header with improved contrast */}
      <Box bg={headerBg} boxShadow="md" position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
          <Flex py={4} justify="space-between" align="center">
            <Flex align="center">
              <Box
                fontWeight="bold"
                fontSize="2xl"
                color={highlightColor}
                cursor="pointer"
                onClick={() => navigateTo('/dashboard')}
              >
                Travelink
              </Box>
            </Flex>

            {/* Desktop Navigation */}
            <Flex display={{ base: 'none', md: 'flex' }} align="center">
              <Box maxW="320px" mr={4} position="relative">
                <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                  🔍
                </Box>
                <Input
                  placeholder="Search destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pl={10}
                  borderRadius="full"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{ borderColor: highlightColor, boxShadow: `0 0 0 1px ${highlightColor}` }}
                />
              </Box>

              <Button 
                bg={buttonColor} 
                color={buttonText}
                _hover={{ bg: 'blue.700' }}
                mr={2}
                onClick={() => navigateTo('/tours')}
                fontWeight="semibold"
              >
                Explore
              </Button>
              <Button 
                bg={buttonColor}
                color={buttonText}
                _hover={{ bg: 'blue.700' }}
                mr={2}
                onClick={() => navigateTo('/bookings')}
                fontWeight="semibold"
              >
                My Bookings
              </Button>
              <Box position="relative">
                <Box 
                  width="36px" 
                  height="36px" 
                  borderRadius="full" 
                  bg={highlightColor}
                  color="white" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => navigateTo('/profile')}
                  fontSize="sm"
                >
                  U
                </Box>
              </Box>
            </Flex>

            {/* Mobile Navigation Button */}
            <Box display={{ base: 'block', md: 'none' }}>
              <Button onClick={toggleDrawer} bg={buttonColor} color={buttonText}>
                ☰
              </Button>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer (simplified version) */}
      {isDrawerOpen && (
        <Box 
          position="fixed" 
          top="0" 
          right="0" 
          bottom="0" 
          width="250px" 
          bg={cardBg}
          boxShadow="lg" 
          zIndex={20}
          p={4}
        >
          <Flex justify="space-between" mb={6}>
            <Heading size="md" color={primaryText}>Menu</Heading>
            <Button bg={buttonColor} color={buttonText} onClick={toggleDrawer}>✕</Button>
          </Flex>
          <Flex direction="column" gap={4}>
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              borderColor="gray.300"
            />
            <Button 
              w="full" 
              bg={buttonColor}
              color={buttonText}
              _hover={{ bg: 'blue.700' }}
              onClick={() => {
                navigateTo('/tours');
                toggleDrawer();
              }}
            >
              Explore
            </Button>
            <Button 
              w="full" 
              bg={buttonColor}
              color={buttonText}
              _hover={{ bg: 'blue.700' }}
              onClick={() => {
                navigateTo('/bookings');
                toggleDrawer();
              }}
            >
              My Bookings
            </Button>
            <Button 
              w="full" 
              bg={buttonColor}
              color={buttonText}
              variant="outline"
              _hover={{ bg: 'blue.50' }}
              onClick={() => {
                navigateTo('/profile');
                toggleDrawer();
              }}
            >
              Profile
            </Button>
            <Button 
              w="full" 
              variant="outline"
              borderColor={buttonColor}
              color={buttonColor}
              _hover={{ bg: 'blue.50' }}
              onClick={() => {
                navigateTo('/settings');
                toggleDrawer();
              }}
            >
              Settings
            </Button>
            <Button 
              w="full" 
              colorScheme="red" 
              onClick={() => {
                navigateTo('/');
                toggleDrawer();
              }}
            >
              Logout
            </Button>
          </Flex>
        </Box>
      )}

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {/* Welcome Section with improved contrast */}
        <Box 
          bg={buttonColor}
          color="white" 
          borderRadius="xl" 
          p={8} 
          mb={8}
          position="relative"
          overflow="hidden"
          boxShadow="lg"
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            width="40%"
            backgroundImage="url('https://images.unsplash.com/photo-1537996194471-e657df975ab4')"
            backgroundSize="cover"
            backgroundPosition="center"
            display={{ base: 'none', lg: 'block' }}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blue.600"
              opacity={0.6}
            />
          </Box>
          <Box position="relative" maxW={{ lg: '60%' }}>
            <Heading size="xl" mb={4} color="white" textShadow="0px 1px 2px rgba(0,0,0,0.2)">Welcome back!</Heading>
            <Text fontSize="lg" mb={6} color="white" textShadow="0px 1px 2px rgba(0,0,0,0.2)">
              Discover personalized travel experiences in Indonesia with our trusted local guides.
            </Text>
            <Box>
              <Button
                bg="white"
                color={buttonColor}
                size="lg"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigateTo('/tours')}
                fontWeight="bold"
                boxShadow="md"
              >
                Explore Tours
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Featured Destinations */}
        <Box mb={10}>
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="lg" color={sectionHeadingColor} fontWeight="bold">Featured Destinations</Heading>
            <Box>
              <Button 
                bg={buttonColor}
                color={buttonText}
                _hover={{ bg: 'blue.700' }}
                onClick={() => navigateTo('/tours')}
              >
                View All →
              </Button>
            </Box>
          </Flex>
          
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={6}
          >
            {featuredDestinations.map((destination) => (
              <Box
                key={destination.id}
                bg={cardBg}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}
                transition="all 0.3s ease"
                cursor="pointer"
                onClick={() => navigateTo(`/tours/${destination.id}`)}
              >
                <Box position="relative" h="200px">
                  <Image 
                    src={destination.image} 
                    alt={destination.name}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                  <Flex 
                    position="absolute"
                    bottom={3}
                    left={3}
                    bg="rgba(0,0,0,0.8)"
                    color="white"
                    px={3}
                    py={1.5}
                    borderRadius="md"
                    align="center"
                    boxShadow="md"
                  >
                    <Text fontWeight="bold" mr={1} fontSize="md">
                      {destination.rating}
                    </Text>
                    <Text fontSize="sm">
                      ({destination.reviews} reviews)
                    </Text>
                  </Flex>
                </Box>
                
                <Box p={5}>
                  <Heading size="md" mb={2} color={primaryText}>{destination.name}</Heading>
                  <Text color={secondaryText} mb={4} fontWeight="normal">
                    {destination.description}
                  </Text>
                  
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color={highlightColor} fontSize="lg">
                      {formatPrice(destination.price)}
                      <Box as="span" fontWeight="normal" fontSize="sm" color={secondaryText} ml={1}>
                        /person
                      </Box>
                    </Text>
                    <Box>
                      <Button 
                        bg={buttonColor}
                        color={buttonText}
                        _hover={{ bg: 'blue.700' }}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(`/tours/${destination.id}`);
                        }}
                      >
                        Explore
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Upcoming Tours and Top Guides Section */}
        <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={8}>
          {/* Upcoming Tours with improved visibility */}
          <Box>
            <Heading size="lg" mb={5} color={sectionHeadingColor} pb={2} borderBottom="2px solid" borderColor="gray.200">
              Your Upcoming Tours
            </Heading>
            
            {upcomingTours.length > 0 ? (
              <Flex direction="column" gap={5}>
                {upcomingTours.map((tour) => (
                  <Flex
                    key={tour.id}
                    bg={cardBg}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    _hover={{ boxShadow: 'lg' }}
                    transition="all 0.3s ease"
                    direction={{ base: 'column', sm: 'row' }}
                  >
                    <Image 
                      src={tour.image} 
                      alt={tour.name}
                      w={{ base: 'full', sm: '200px' }}
                      h={{ base: '150px', sm: '100%' }}
                      objectFit="cover"
                    />
                    <Flex p={5} flex="1" direction="column" justify="space-between">
                      <Box>
                        <Heading size="md" mb={2} color={primaryText}>{tour.name}</Heading>
                        <Text color={primaryText} fontWeight="medium" mb={3}>
                          {tour.location}
                        </Text>
                        <Flex align="center" mb={3}>
                          <Box color={buttonColor} mr={2} fontSize="lg">
                            📅
                          </Box>
                          <Text color={primaryText} fontWeight="medium">{tour.date}</Text>
                        </Flex>
                        <Flex align="center">
                          <Box color={buttonColor} mr={2} fontSize="lg">
                            ⏰
                          </Box>
                          <Text color={primaryText} fontWeight="medium">{tour.time}</Text>
                        </Flex>
                      </Box>
                      <Flex mt={4} justify="space-between" align="center">
                        <Badge bg={badgeBg} color={badgeText} py={1.5} px={3} borderRadius="md" fontWeight="bold">
                          Confirmed
                        </Badge>
                        <Box>
                          <Button
                            bg={buttonColor}
                            color={buttonText}
                            _hover={{ bg: 'blue.700' }}
                            onClick={() => navigateTo(`/bookings/${tour.id}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Flex>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            ) : (
              <Box 
                bg={cardBg}
                p={8} 
                borderRadius="lg" 
                boxShadow="md"
                textAlign="center"
              >
                <Text fontSize="lg" mb={4} color={primaryText}>You have no upcoming tours</Text>
                <Box>
                  <Button 
                    bg={buttonColor}
                    color={buttonText}
                    _hover={{ bg: 'blue.700' }}
                    onClick={() => navigateTo('/tours')}
                  >
                    Explore Tours
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {/* Top Guides with improved visibility */}
          <Box>
            <Heading size="lg" mb={5} color={sectionHeadingColor} pb={2} borderBottom="2px solid" borderColor="gray.200">
              Top Guides
            </Heading>
            <Flex direction="column" gap={4}>
              {topGuides.map((guide) => (
                <Flex
                  key={guide.id}
                  bg={cardBg}
                  p={4}
                  borderRadius="lg"
                  boxShadow="md"
                  _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.3s ease"
                  align="center"
                  cursor="pointer"
                  onClick={() => navigateTo(`/guides/${guide.id}`)}
                >
                  <Box 
                    width="64px" 
                    height="64px"
                    borderRadius="full"
                    overflow="hidden"
                    mr={4}
                    position="relative"
                    boxShadow="md"
                  >
                    <Image 
                      src={guide.avatar} 
                      alt={guide.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                    <Box 
                      position="absolute" 
                      bottom="2px" 
                      right="2px" 
                      width="12px" 
                      height="12px" 
                      bg="green.500" 
                      borderRadius="full" 
                      border="2px solid white"
                    />
                  </Box>
                  <Box flex="1">
                    <Heading size="md" mb={1} color={primaryText}>{guide.name}</Heading>
                    <Text fontSize="sm" color={secondaryText} mb={1} fontWeight="medium">
                      {guide.location} • {guide.tours} tours
                    </Text>
                    <Flex align="center">
                      <Box color="yellow.500" fontWeight="bold" mr={1}>★★★★★</Box>
                      <Text fontWeight="bold" color={primaryText}>{guide.rating}</Text>
                    </Flex>
                  </Box>
                  <Box>
                    <Button
                      bg={buttonColor}
                      color={buttonText}
                      _hover={{ bg: 'blue.700' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo(`/guides/${guide.id}/profile`);
                      }}
                    >
                      View Profile
                    </Button>
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;