import React, { useState } from 'react';
import { Box, Flex, Text, Button, Image, Badge, Tooltip } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Enhanced mock data with payment status
const upcomingBookings = [
  {
    id: 1,
    tourName: 'Bali Beach Hopping Adventure',
    location: 'Bali',
    date: 'May 15, 2025',
    time: '08:30 AM',
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392',
    price: 1200000,
    people: 2,
    guideName: 'Wayan Sudiarta',
    meetingPoint: 'Hotel Lobby',
    paymentStatus: 'paid', // Added payment status
  },
  {
    id: 2,
    tourName: 'Gili Islands Snorkeling',
    location: 'Lombok',
    date: 'May 18, 2025',
    time: '09:00 AM',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    price: 1500000,
    people: 1,
    guideName: 'Putu Wijaya',
    meetingPoint: 'Lombok Harbor',
    paymentStatus: 'unpaid', // Added payment status
  },
];

const pastBookings = [
  {
    id: 4,
    tourName: 'Jakarta City Tour',
    location: 'Jakarta',
    date: 'April 10, 2025',
    time: '10:00 AM',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af',
    price: 800000,
    people: 3,
    guideName: 'Wayan Sudiarta',
    rating: 5,
    hasReview: true,
    paymentStatus: 'paid', // Added payment status
  },
  {
    id: 5,
    tourName: 'Borobudur Temple Sunrise',
    location: 'Yogyakarta',
    date: 'March 25, 2025',
    time: '04:30 AM',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0',
    price: 950000,
    people: 2,
    guideName: 'Putu Wijaya',
    rating: 4,
    hasReview: false,
    paymentStatus: 'paid', // Added payment status
  },
];

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Highly contrasted color palette for maximum visibility
  const primaryColor = "blue.600";
  const primaryLighter = "blue.50";
  const headerBg = "white";
  const cardBg = "white";
  const textPrimary = "gray.800";
  const textSecondary = "gray.600";
  const borderColor = "gray.200";
  const successColor = "green.500";
  const warningColor = "orange.500";
  const redColor = "red.500"; 
  const yellowStar = "yellow.400";
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Function to handle payment
  const handlePayment = (bookingId: number) => {
    navigate(`/payment/${bookingId}`);
  };

  // Function to get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge colorScheme="green" px={2} py={1} borderRadius="md">
            <Flex align="center">
              <Text as="span" mr={1}>✓</Text> Paid
            </Flex>
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge colorScheme="red" px={2} py={1} borderRadius="md">
            <Flex align="center">
              <Text as="span" mr={1}>✕</Text> Unpaid
            </Flex>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Enhanced Header */}
      <Box bg={headerBg} boxShadow="lg" position="sticky" top={0} zIndex={10}>
        <Flex 
          maxW="1200px" 
          mx="auto" 
          py={4} 
          px={{ base: 4, md: 6 }}
          justify="space-between" 
          align="center"
        >
          <Box
            fontWeight="bold"
            fontSize={{ base: "xl", md: "2xl" }}
            color={primaryColor}
            cursor="pointer"
            onClick={() => navigate('/dashboard')}
          >
            <Flex align="center">
              <Text as="span" mr={2} fontSize="xl">✈️</Text>
              Travelink
            </Flex>
          </Box>

          <Flex gap={{ base: 2, md: 4 }}>
            <Button 
              bg="white"
              color={primaryColor}
              border="2px solid"
              borderColor={primaryColor}
              size={{ base: "sm", md: "md" }}
              fontWeight="bold"
              fontSize="md"
              boxShadow="sm"
              py={5}
              _hover={{ bg: primaryLighter, boxShadow: "md" }}
              onClick={() => navigate('/tours')}
            >
              Explore Tours
            </Button>
            <Button 
              bg={primaryColor}
              color="white"
              size={{ base: "sm", md: "md" }}
              fontWeight="bold"
              fontSize="md"
              boxShadow="sm"
              py={5}
              _hover={{ bg: "blue.700", boxShadow: "md" }}
              onClick={() => navigate('/profile')}
            >
              My Profile
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content with Improved Spacing */}
      <Box 
        maxW="1200px" 
        mx="auto" 
        py={{ base: 6, md: 8 }} 
        px={{ base: 4, md: 6 }}
      >
        <Flex align="center" mb={{ base: 4, md: 6 }}>
          <Text as="span" fontSize="2xl" mr={2}>🗓️</Text>
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="bold" 
            color={textPrimary}
          >
            My Bookings
          </Text>
        </Flex>
        
        {/* Enhanced Tabs */}
        <Flex 
          mb={{ base: 4, md: 6 }} 
          borderBottom="1px solid" 
          borderColor={borderColor}
          position="relative"
        >
          <Box 
            px={{ base: 3, md: 5 }} 
            py={{ base: 2, md: 3 }} 
            cursor="pointer"
            borderBottom={activeTab === 'upcoming' ? "3px solid" : "none"}
            borderColor={primaryColor}
            color={activeTab === 'upcoming' ? primaryColor : textSecondary}
            fontWeight={activeTab === 'upcoming' ? "bold" : "medium"}
            fontSize={{ base: "sm", md: "md" }}
            onClick={() => setActiveTab('upcoming')}
            transition="all 0.2s"
            _hover={{ color: primaryColor }}
            bg={activeTab === 'upcoming' ? primaryLighter : 'transparent'}
            borderTopLeftRadius="md"
            borderTopRightRadius="md"
          >
            Upcoming ({upcomingBookings.length})
          </Box>
          <Box 
            px={{ base: 3, md: 5 }} 
            py={{ base: 2, md: 3 }} 
            cursor="pointer"
            borderBottom={activeTab === 'past' ? "3px solid" : "none"}
            borderColor={primaryColor}
            color={activeTab === 'past' ? primaryColor : textSecondary}
            fontWeight={activeTab === 'past' ? "bold" : "medium"}
            fontSize={{ base: "sm", md: "md" }}
            onClick={() => setActiveTab('past')}
            transition="all 0.2s"
            _hover={{ color: primaryColor }}
            bg={activeTab === 'past' ? primaryLighter : 'transparent'}
            borderTopLeftRadius="md"
            borderTopRightRadius="md"
          >
            Past ({pastBookings.length})
          </Box>
        </Flex>
        
        {/* Tab Content with Improved Cards */}
        <Box>
          {/* Upcoming Bookings */}
          {activeTab === 'upcoming' && (
            <Box>
              {upcomingBookings.length === 0 ? (
                <Box 
                  textAlign="center" 
                  py={10} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  boxShadow="md"
                  px={4}
                >
                  <Text fontSize="8xl" lineHeight="1" mb={4}>🏖️</Text>
                  <Text fontSize="xl" fontWeight="bold" mb={2} color={textPrimary}>You don't have any upcoming bookings yet</Text>
                  <Text color={textSecondary} mb={6}>Start exploring amazing tours in Indonesia!</Text>
                  <Button 
                    bg={primaryColor}
                    color="white"
                    size="lg"
                    fontWeight="bold"
                    boxShadow="md"
                    _hover={{ bg: "blue.700", boxShadow: "lg" }}
                    onClick={() => navigate('/tours')}
                  >
                    Explore Tours
                  </Button>
                </Box>
              ) : (
                <Flex direction="column" gap={6}>
                  {upcomingBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      borderRadius="xl"
                      overflow="hidden"
                      bg={cardBg}
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.3s ease"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Flex direction={{ base: 'column', md: 'row' }}>
                        <Box
                          w={{ base: '100%', md: '280px' }}
                          h={{ base: '200px', md: 'auto' }}
                          position="relative"
                        >
                          <Image
                            src={booking.image}
                            alt={booking.tourName}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                          />
                          <Box
                            position="absolute"
                            top={3}
                            right={3}
                            bg={booking.status === 'confirmed' ? successColor : warningColor}
                            color="white"
                            px={3}
                            py={1.5}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="bold"
                            textTransform="uppercase"
                            boxShadow="md"
                          >
                            {booking.status}
                          </Box>
                          
                          {/* Countdown Badge */}
                          <Box
                            position="absolute"
                            bottom={3}
                            left={3}
                            bg="blackAlpha.700"
                            color="white"
                            px={3}
                            py={1.5}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                          >
                            <Text mr={1}>⏱️</Text>
                            <Text>
                              {new Date(booking.date).getTime() - new Date().getTime() > 0 
                                ? Math.ceil((new Date(booking.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + " days left" 
                                : "Today!"}
                            </Text>
                          </Box>
                        </Box>
                        
                        <Box p={{ base: 4, md: 6 }} flex="1">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text 
                              fontSize={{ base: "lg", md: "xl" }} 
                              fontWeight="bold" 
                              color={textPrimary}
                              lineHeight="1.3"
                            >
                              {booking.tourName}
                            </Text>
                            
                            {/* Payment Status Badge */}
                            {getPaymentStatusBadge(booking.paymentStatus)}
                          </Flex>
                          
                          <Text 
                            color={textPrimary}
                            fontSize="md" 
                            mb={4}
                            display="flex"
                            alignItems="center"
                            fontWeight="medium"
                          >
                            <Text as="span" fontSize="lg" mr={1.5}>📍</Text>
                            {booking.location}
                          </Text>
                          
                          <Flex 
                            wrap="wrap" 
                            gap={{ base: 3, md: 6 }} 
                            mb={5}
                            px={4}
                            py={3}
                            bg="gray.50"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="gray.200"
                          >
                            <Box minW="120px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>📅</Text>
                                Date
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.date}</Text>
                            </Box>
                            <Box minW="120px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>⏰</Text>
                                Time
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.time}</Text>
                            </Box>
                            <Box minW="90px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center" 
                              >
                                <Text as="span" mr={1.5}>👥</Text>
                                People
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.people}</Text>
                            </Box>
                            <Box minW="150px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>💰</Text>
                                Total
                              </Text>
                              <Text fontWeight="bold" color={primaryColor} fontSize="md">
                                {formatPrice(booking.price * booking.people)}
                              </Text>
                            </Box>
                            
                            <Box flex="1" minW="150px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>🗺️</Text>
                                Meeting Point
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.meetingPoint}</Text>
                            </Box>
                          </Flex>
                          
                          <Box h="1px" bg={borderColor} my={4}></Box>
                          
                          <Flex 
                            justify="space-between" 
                            align="center"
                            direction={{ base: "column", sm: "row" }}
                            gap={{ base: 4, sm: 0 }}
                          >
                            <Flex align="center" gap={3}>
                              <Box
                                width="48px"
                                height="48px"
                                borderRadius="full"
                                bg="blue.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow="md"
                              >
                                <Text fontSize="xl">👤</Text>
                              </Box>
                              <Box>
                                <Text fontSize="md" fontWeight="bold" color={textPrimary}>{booking.guideName}</Text>
                                <Text fontSize="sm" color={textSecondary}>Your Guide</Text>
                              </Box>
                            </Flex>
                            
                            <Flex gap={3} wrap={{ base: "wrap", md: "nowrap" }} justify={{ base: "center", md: "flex-end" }}>
                              {/* Payment Button - Only show for unpaid bookings */}
                              {booking.paymentStatus === 'unpaid' && (
                                <Button 
                                  size="md" 
                                  bg={successColor}
                                  color="white"
                                  fontWeight="bold"
                                  boxShadow="sm"
                                  fontSize="md"
                                  height="42px"
                                  px={6}
                                  leftIcon={<Text>💳</Text>}
                                  _hover={{ bg: "green.600", boxShadow: "md" }}
                                  onClick={() => handlePayment(booking.id)}
                                >
                                  Pay Now
                                </Button>
                              )}
                              
                              <Button 
                                size="md" 
                                bg={primaryColor}
                                color="white"
                                fontWeight="bold"
                                boxShadow="sm"
                                fontSize="md"
                                height="42px"
                                px={6}
                                _hover={{ bg: "blue.700", boxShadow: "md" }}
                                onClick={() => navigate(`/tours/${booking.id}`)}
                              >
                                Tour Details
                              </Button>
                              <Button 
                                size="md" 
                                bg={redColor}
                                color="white"
                                fontWeight="bold"
                                boxShadow="sm"
                                fontSize="md"
                                height="42px"
                                px={6}
                                _hover={{ bg: "red.600", boxShadow: "md" }}
                              >
                                Cancel
                              </Button>
                            </Flex>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>
          )}
          
          {/* Past Bookings with Enhanced Visual Hierarchy */}
          {activeTab === 'past' && (
            <Box>
              {pastBookings.length === 0 ? (
                <Box 
                  textAlign="center" 
                  py={10} 
                  bg={cardBg} 
                  borderRadius="lg" 
                  boxShadow="md"
                  px={4}
                >
                  <Text fontSize="8xl" lineHeight="1" mb={4}>📷</Text>
                  <Text fontSize="xl" fontWeight="bold" mb={2} color={textPrimary}>You don't have any past bookings</Text>
                  <Text color={textSecondary} mb={6}>Explore and book your first adventure!</Text>
                  <Button 
                    bg={primaryColor}
                    color="white"
                    size="lg"
                    fontWeight="bold"
                    boxShadow="md"
                    _hover={{ bg: "blue.700", boxShadow: "lg" }}
                    onClick={() => navigate('/tours')}
                  >
                    Explore Tours
                  </Button>
                </Box>
              ) : (
                <Flex direction="column" gap={6}>
                  {pastBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      borderRadius="xl"
                      overflow="hidden"
                      bg={cardBg}
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.3s ease"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Flex direction={{ base: 'column', md: 'row' }}>
                        <Box
                          w={{ base: '100%', md: '280px' }}
                          h={{ base: '200px', md: 'auto' }}
                          position="relative"
                        >
                          <Image
                            src={booking.image}
                            alt={booking.tourName}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                            filter="grayscale(30%)"
                            opacity="0.9"
                          />
                          <Box
                            position="absolute"
                            top={3}
                            right={3}
                            bg="blue.500"
                            color="white"
                            px={3}
                            py={1.5}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="bold"
                            textTransform="uppercase"
                            boxShadow="md"
                          >
                            {booking.status}
                          </Box>
                          
                          {/* Time Passed Badge */}
                          <Box
                            position="absolute"
                            bottom={3}
                            left={3}
                            bg="blackAlpha.700"
                            color="white"
                            px={3}
                            py={1.5}
                            borderRadius="md"
                            fontSize="sm"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                          >
                            <Text mr={1}>📅</Text>
                            <Text>
                              {Math.floor((new Date().getTime() - new Date(booking.date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </Text>
                          </Box>
                        </Box>
                        
                        <Box p={{ base: 4, md: 6 }} flex="1">
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text 
                              fontSize={{ base: "lg", md: "xl" }} 
                              fontWeight="bold" 
                              color={textPrimary}
                              lineHeight="1.3"
                            >
                              {booking.tourName}
                            </Text>
                            
                            {/* Payment Status Badge */}
                            {getPaymentStatusBadge(booking.paymentStatus)}
                          </Flex>
                          
                          <Text 
                            color={textPrimary} 
                            fontSize="md" 
                            mb={4}
                            display="flex"
                            alignItems="center"
                            fontWeight="medium"
                          >
                            <Text as="span" fontSize="lg" mr={1.5}>📍</Text>
                            {booking.location}
                          </Text>
                          
                          <Flex 
                            wrap="wrap" 
                            gap={{ base: 3, md: 6 }} 
                            mb={5}
                            px={4}
                            py={3}
                            bg="gray.50"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="gray.200"
                          >
                            <Box minW="120px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>📅</Text>
                                Date
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.date}</Text>
                            </Box>
                            <Box minW="120px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>⏰</Text>
                                Time
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.time}</Text>
                            </Box>
                            <Box minW="90px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>👥</Text>
                                People
                              </Text>
                              <Text fontWeight="medium" color="black">{booking.people}</Text>
                            </Box>
                            <Box minW="150px">
                              <Text 
                                fontWeight="bold" 
                                fontSize="sm" 
                                color={textSecondary}
                                mb={1}
                                display="flex"
                                alignItems="center"
                              >
                                <Text as="span" mr={1.5}>💰</Text>
                                Total
                              </Text>
                              <Text fontWeight="bold" color={primaryColor} fontSize="md">
                                {formatPrice(booking.price * booking.people)}
                              </Text>
                            </Box>
                          </Flex>
                          
                          <Box h="1px" bg={borderColor} my={4}></Box>
                          
                          <Flex 
                            justify="space-between" 
                            align="center"
                            direction={{ base: "column", sm: "row" }}
                            gap={{ base: 4, sm: 0 }}
                          >
                            <Flex align="center" direction={{ base: "column", sm: "row" }}>
                              {booking.rating && (
                                <Flex 
                                  mr={{ base: 0, sm: 4 }}
                                  mb={{ base: 2, sm: 0 }}
                                  p={2}
                                  bg="gray.50"
                                  borderRadius="md"
                                  alignItems="center"
                                  boxShadow="sm"
                                  border="1px solid"
                                  borderColor="gray.200"
                                >
                                  {[...Array(5)].map((_, i) => (
                                    <Text 
                                      key={i} 
                                      color={i < booking.rating ? yellowStar : "gray.300"}
                                      fontSize="lg"
                                      mx={0.5}
                                    >
                                      ★
                                    </Text>
                                  ))}
                                  <Text fontWeight="bold" fontSize="sm" ml={2} color="black">
                                    {booking.rating}/5
                                  </Text>
                                </Flex>
                              )}
                              <Text 
                                fontSize="sm" 
                                color={booking.hasReview ? "green.500" : textSecondary}
                                fontWeight={booking.hasReview ? "bold" : "normal"}
                                display="flex"
                                alignItems="center"
                              >
                                {booking.hasReview ? "✓ You left a review" : "No review yet"}
                              </Text>
                            </Flex>
                            
                            <Flex gap={3}>
                              {!booking.hasReview && (
                                <Button 
                                  size="md" 
                                  bg="yellow.500"
                                  color="white"
                                  fontWeight="bold"
                                  boxShadow="sm"
                                  fontSize="md"
                                  height="42px"
                                  px={6}
                                  leftIcon={<Text>⭐</Text>}
                                  _hover={{ bg: "yellow.600", boxShadow: "md" }}
                                >
                                  Leave Review
                                </Button>
                              )}
                              <Button 
                                size="md"
                                bg={primaryColor}
                                color="white"
                                fontWeight="bold"
                                boxShadow="sm"
                                fontSize="md"
                                height="42px"
                                px={6}
                                _hover={{ bg: "blue.700", boxShadow: "md" }}
                                onClick={() => navigate(`/tours/${booking.id}`)}
                              >
                                Book Again
                              </Button>
                            </Flex>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Bookings;