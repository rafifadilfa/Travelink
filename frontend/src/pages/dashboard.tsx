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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" boxShadow="sm" position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
          <Flex py={4} justify="space-between" align="center">
            <Flex align="center">
              <Box
                fontWeight="bold"
                fontSize="2xl"
                color="blue.600"
                cursor="pointer"
                onClick={() => navigate('/dashboard')}
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
                />
              </Box>

              <Button 
                variant="ghost" 
                colorScheme="blue" 
                mr={2}
                onClick={() => navigate('/tours')}
              >
                Explore
              </Button>
              <Button 
                variant="ghost" 
                colorScheme="blue" 
                mr={2}
                onClick={() => navigate('/bookings')}
              >
                My Bookings
              </Button>
              <Box position="relative">
                <Box 
                  width="32px" 
                  height="32px" 
                  borderRadius="full" 
                  bg="blue.500" 
                  color="white" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => navigate('/profile')}
                >
                  U
                </Box>
              </Box>
            </Flex>

            {/* Mobile Navigation Button */}
            <Box display={{ base: 'block', md: 'none' }}>
              <Button onClick={toggleDrawer}>
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
          bg="white" 
          boxShadow="lg" 
          zIndex={20}
          p={4}
        >
          <Flex justify="space-between" mb={6}>
            <Heading size="md">Menu</Heading>
            <Button variant="ghost" onClick={toggleDrawer}>✕</Button>
          </Flex>
          <Flex direction="column" gap={4}>
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              w="full" 
              onClick={() => {
                navigate('/tours');
                toggleDrawer();
              }}
            >
              Explore
            </Button>
            <Button 
              w="full" 
              onClick={() => {
                navigate('/bookings');
                toggleDrawer();
              }}
            >
              My Bookings
            </Button>
            <Button 
              w="full" 
              onClick={() => {
                navigate('/profile');
                toggleDrawer();
              }}
            >
              Profile
            </Button>
            <Button 
              w="full" 
              onClick={() => {
                navigate('/settings');
                toggleDrawer();
              }}
            >
              Settings
            </Button>
            <Button 
              w="full" 
              colorScheme="red" 
              variant="outline"
              onClick={() => {
                navigate('/');
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
        {/* Welcome Section */}
        <Box 
          bg="blue.600" 
          color="white" 
          borderRadius="xl" 
          p={8} 
          mb={8}
          position="relative"
          overflow="hidden"
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
              opacity={0.5}
            />
          </Box>
          <Box position="relative" maxW={{ lg: '60%' }}>
            <Heading size="xl" mb={4}>Welcome back!</Heading>
            <Text fontSize="lg" mb={6}>
              Discover personalized travel experiences in Indonesia with our trusted local guides.
            </Text>
            <Button
              bg="white"
              color="blue.600"
              size="lg"
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/tours')}
            >
              Explore Tours
            </Button>
          </Box>
        </Box>
        
        {/* Featured Destinations */}
        <Box mb={10}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">Featured Destinations</Heading>
            <Button 
              variant="link" 
              color="blue.500"
              onClick={() => navigate('/tours')}
            >
              View All →
            </Button>
          </Flex>
          
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={6}
          >
            {featuredDestinations.map((destination) => (
              <Box
                key={destination.id}
                bg="white"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                cursor="pointer"
                onClick={() => navigate(`/tours/${destination.id}`)}
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
                    bottom={2}
                    left={2}
                    bg="blackAlpha.700"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    align="center"
                  >
                    <Text fontWeight="bold" mr={1}>
                      {destination.rating}
                    </Text>
                    <Text fontSize="sm">
                      ({destination.reviews} reviews)
                    </Text>
                  </Flex>
                </Box>
                
                <Box p={4}>
                  <Heading size="md" mb={2}>{destination.name}</Heading>
                  <Text color="gray.600" noOfLines={2} mb={4}>
                    {destination.description}
                  </Text>
                  
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold" color="blue.600">
                      {formatPrice(destination.price)}
                      <Box as="span" fontWeight="normal" fontSize="sm" color="gray.500">
                        /person
                      </Box>
                    </Text>
                    <Button 
                      colorScheme="blue" 
                      size="sm"
                    >
                      Explore
                    </Button>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Upcoming Tours and Top Guides Section */}
        <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={8}>
          {/* Upcoming Tours */}
          <Box>
            <Heading size="lg" mb={4}>Your Upcoming Tours</Heading>
            
            {upcomingTours.length > 0 ? (
              <Flex direction="column" gap={4}>
                {upcomingTours.map((tour) => (
                  <Flex
                    key={tour.id}
                    bg="white"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    direction={{ base: 'column', sm: 'row' }}
                  >
                    <Image 
                      src={tour.image} 
                      alt={tour.name}
                      w={{ base: 'full', sm: '200px' }}
                      h={{ base: '150px', sm: '100%' }}
                      objectFit="cover"
                    />
                    <Flex p={4} flex="1" direction="column" justify="space-between">
                      <Box>
                        <Heading size="md" mb={1}>{tour.name}</Heading>
                        <Text color="gray.600" mb={3}>
                          {tour.location}
                        </Text>
                        <Flex align="center" mb={2}>
                          <Box color="gray.500" mr={2}>
                            📅
                          </Box>
                          <Text>{tour.date}</Text>
                        </Flex>
                        <Flex align="center">
                          <Box color="gray.500" mr={2}>
                            ⏰
                          </Box>
                          <Text>{tour.time}</Text>
                        </Flex>
                      </Box>
                      <Flex mt={4} justify="space-between" align="center">
                        <Badge colorScheme="green" py={1} px={2} borderRadius="md">
                          Confirmed
                        </Badge>
                        <Button
                          variant="outline"
                          colorScheme="blue"
                          size="sm"
                          onClick={() => navigate(`/bookings/${tour.id}`)}
                        >
                          View Details
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            ) : (
              <Box 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="md"
                textAlign="center"
              >
                <Text fontSize="lg" mb={4}>You have no upcoming tours</Text>
                <Button 
                  colorScheme="blue"
                  onClick={() => navigate('/tours')}
                >
                  Explore Tours
                </Button>
              </Box>
            )}
          </Box>

          {/* Top Guides */}
          <Box>
            <Heading size="lg" mb={4}>Top Guides</Heading>
            <Flex direction="column" gap={4}>
              {topGuides.map((guide) => (
                <Flex
                  key={guide.id}
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  boxShadow="md"
                  align="center"
                  cursor="pointer"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                  onClick={() => navigate(`/guides/${guide.id}`)}
                >
                  <Box 
                    width="64px" 
                    height="64px"
                    borderRadius="full"
                    overflow="hidden"
                    mr={4}
                    position="relative"
                  >
                    <Image 
                      src={guide.avatar} 
                      alt={guide.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      fallback={
                        <Box 
                          width="100%" 
                          height="100%" 
                          bg="blue.500" 
                          color="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xl"
                          fontWeight="bold"
                        >
                          {guide.name.charAt(0)}
                        </Box>
                      }
                    />
                  </Box>
                  <Box flex="1">
                    <Heading size="sm" mb={1}>{guide.name}</Heading>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      {guide.location} • {guide.tours} tours
                    </Text>
                    <Flex align="center">
                      <Text color="yellow.500" mr={1}>★</Text>
                      <Text fontWeight="bold">{guide.rating}</Text>
                    </Flex>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                  >
                    View Profile
                  </Button>
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