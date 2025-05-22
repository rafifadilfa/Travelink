import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  Input,
  IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Tour data
const tourName = 'Bali Beach Hopping Adventure';
const tourLocation = 'Bali, Indonesia';
const tourImages = [
  'https://images.unsplash.com/photo-1573790387438-4da905039392',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  'https://images.unsplash.com/photo-1512100356356-de1b84283e18',
  'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992',
];
const tourDescription = 'Experience the magic of Bali with this exclusive beach hopping tour, visiting the most stunning coastal spots on the island. Our professional guides will take you to hidden gems along the coastline, showcasing the incredible beauty of Bali\'s beaches. You\'ll have opportunities for swimming, sunbathing, and capturing amazing photos throughout the day.';
const tourPrice = 1200000;
const tourDuration = '8 hours';
const tourStartTime = '8:30 AM';
const tourRating = 4.9;
const tourReviewCount = 145;
const tourMaxGroupSize = 10;
const tourMinGroupSize = 1;

// Guide info
const guideName = 'Wayan Sudiarta';
const guideRating = 4.9;
const guideReviews = 189;

// Included items
const includedItems = [
  'Hotel pickup and drop-off',
  'Air-conditioned vehicle',
  'Professional local guide',
  'Lunch at local restaurant',
  'Bottled water',
  'Snorkeling equipment'
];

// Excluded items
const excludedItems = [
  'Alcoholic beverages',
  'Personal expenses',
  'Additional activities',
  'Gratuities (optional)'
];

// Itinerary
const tourSteps = [
  {
    time: '08:30 AM',
    activity: 'Hotel pickup',
    description: 'Our guide will pick you up from your hotel in an air-conditioned vehicle.'
  },
  {
    time: '09:30 AM',
    activity: 'Balangan Beach',
    description: 'Visit this hidden gem known for its white sand and crystal clear waters.'
  },
  {
    time: '11:00 AM',
    activity: 'Padang Padang Beach',
    description: 'Explore the famous beach from "Eat Pray Love" with unique rock formations.'
  },
  {
    time: '12:30 PM',
    activity: 'Lunch at Uluwatu',
    description: 'Enjoy a delicious Indonesian lunch at a cliff-top restaurant with ocean views.'
  },
  {
    time: '14:00 PM',
    activity: 'Dreamland Beach',
    description: 'Relax at this beautiful beach with opportunities for swimming and sunbathing.'
  },
  {
    time: '16:30 PM',
    activity: 'Return to hotel',
    description: 'Drop off at your hotel after a day of beach exploration.'
  }
];

const TourDetail: React.FC = () => {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [participants, setParticipants] = useState(2); // Default to 2 participants
  
  // Enhanced color scheme for better visibility
  const primaryColor = "blue.600";
  const primaryDark = "blue.700";
  const primaryLight = "blue.50";
  const textPrimary = "gray.800";
  const textSecondary = "gray.600";
  const accentSuccess = "green.500";
  const accentError = "red.500";
  const yellowRating = "yellow.400";
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Calculate total price based on number of participants
  const totalPrice = tourPrice * participants;

  // Handle participant count changes
  const handleIncreaseParticipants = () => {
    if (participants < tourMaxGroupSize) {
      setParticipants(participants + 1);
    }
  };

  const handleDecreaseParticipants = () => {
    if (participants > tourMinGroupSize) {
      setParticipants(participants - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= tourMinGroupSize && value <= tourMaxGroupSize) {
      setParticipants(value);
    }
  };
  
  const handleBookNow = () => {
    // Save booking info to pass to the next page
    const bookingDetails = {
      tourId: 1, // Example ID
      tourName: tourName,
      tourLocation: tourLocation,
      participants: participants,
      pricePerPerson: tourPrice,
      totalPrice: totalPrice,
      date: 'May 25, 2025', // Would normally be selected by user
      time: tourStartTime,
      guideName: guideName
    };
    
    // In a real app, we would save this to state/context/localStorage
    console.log('Booking details:', bookingDetails);
    
    // Navigate to payment page with booking ID
    navigate('/payment/new', { state: { bookingDetails } });
  };
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        {/* Breadcrumbs navigation */}
        <Flex fontSize="sm" color="gray.500" mb={4} align="center">
          <Text cursor="pointer" _hover={{ color: primaryColor }} onClick={() => navigate('/')}>Home</Text>
          <Text mx={2}>/</Text>
          <Text cursor="pointer" _hover={{ color: primaryColor }} onClick={() => navigate('/tours')}>Tours</Text>
          <Text mx={2}>/</Text>
          <Text fontWeight="medium" color="gray.700">{tourName}</Text>
        </Flex>
        
        {/* Tour Title and Rating */}
        <Box mb={8}>
          <Flex 
            justify="space-between" 
            align="center"
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 4, md: 0 }}
          >
            <Box>
              <Heading 
                size="xl" 
                color={primaryDark} 
                mb={2}
                fontWeight="bold"
              >
                {tourName}
              </Heading>
              <Flex 
                align="center" 
                flexWrap="wrap"
                gap={4}
              >
                <Flex 
                  align="center" 
                  bg={primaryLight} 
                  py={1} 
                  px={3} 
                  borderRadius="full"
                >
                  <Text fontSize="lg" mr={1}>📍</Text>
                  <Text fontWeight="medium" color={textPrimary}>{tourLocation}</Text>
                </Flex>
                <Flex 
                  align="center" 
                  bg={primaryLight} 
                  py={1} 
                  px={3} 
                  borderRadius="full"
                >
                  <Text color="yellow.400" mr={1} fontSize="lg">★</Text>
                  <Text fontWeight="bold" mr={1} color={textPrimary}>{tourRating}</Text>
                  <Text color={textPrimary}>({tourReviewCount} reviews)</Text>
                </Flex>
              </Flex>
            </Box>
            <Box>
              <Badge 
                bg={primaryColor}
                color="white"
                p={3} 
                borderRadius="lg" 
                fontSize="xl"
                fontWeight="bold"
                boxShadow="md"
              >
                {formatPrice(tourPrice)}<Text as="span" fontSize="sm" ml={1}>/person</Text>
              </Badge>
            </Box>
          </Flex>
        </Box>
        
        {/* Tour Images and Info */}
        <Flex 
          direction={{ base: 'column', lg: 'row' }}
          gap={8}
          mb={10}
        >
          {/* Tour Images */}
          <Box flex="1.5">
            <Box 
              position="relative" 
              borderRadius="xl" 
              overflow="hidden" 
              boxShadow="lg"
              mb={4}
              h={{ base: "300px", md: "400px" }}
              border="1px solid"
              borderColor="gray.200"
            >
              <Image 
                src={tourImages[activeImage]} 
                alt={`${tourName} - Image ${activeImage + 1}`}
                w="100%"
                h="100%"
                objectFit="cover"
              />
              
              {/* Image navigation indicators */}
              <Flex 
                position="absolute" 
                bottom="10px" 
                left="50%" 
                transform="translateX(-50%)"
                bg="blackAlpha.600"
                borderRadius="full"
                py={1}
                px={3}
                gap={2}
              >
                {tourImages.map((_, index) => (
                  <Box 
                    key={index}
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={activeImage === index ? "white" : "whiteAlpha.500"}
                    cursor="pointer"
                    onClick={() => setActiveImage(index)}
                  />
                ))}
              </Flex>
            </Box>
            <Flex gap={4} overflowX="auto" pb={2}>
              {tourImages.map((image, index) => (
                <Box 
                  key={index}
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow={activeImage === index ? "lg" : "md"}
                  borderWidth={activeImage === index ? "3px" : "1px"}
                  borderColor={activeImage === index ? primaryColor : "gray.200"}
                  width="100px"
                  height="70px"
                  cursor="pointer"
                  onClick={() => setActiveImage(index)}
                  flexShrink={0}
                  transition="all 0.2s ease"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Image 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </Flex>
          </Box>
          
          {/* Tour Quick Info */}
          <Box 
            flex="1"
            bg="white" 
            p={6} 
            borderRadius="xl" 
            boxShadow="md"
            height="fit-content"
            border="1px solid"
            borderColor="gray.200"
          >
            <Heading size="lg" mb={6} color={primaryDark} fontWeight="bold">Tour Details</Heading>
            
            <Flex direction="column" gap={5} mb={6}>
              <Flex align="center" bg="gray.50" p={3} borderRadius="lg" borderLeft="4px solid" borderColor={primaryColor}>
                <Text fontSize="xl" color={primaryColor} mr={3}>⏱️</Text>
                <Box>
                  <Text fontSize="sm" color={textSecondary} fontWeight="medium">Duration</Text>
                  <Text fontWeight="bold" color={textPrimary}>{tourDuration}</Text>
                </Box>
              </Flex>
              
              <Flex align="center" bg="gray.50" p={3} borderRadius="lg" borderLeft="4px solid" borderColor={primaryColor}>
                <Text fontSize="xl" color={primaryColor} mr={3}>🕒</Text>
                <Box>
                  <Text fontSize="sm" color={textSecondary} fontWeight="medium">Start Time</Text>
                  <Text fontWeight="bold" color={textPrimary}>{tourStartTime}</Text>
                </Box>
              </Flex>
              
              <Flex align="center" bg="gray.50" p={3} borderRadius="lg" borderLeft="4px solid" borderColor={primaryColor}>
                <Text fontSize="xl" color={primaryColor} mr={3}>👥</Text>
                <Box>
                  <Text fontSize="sm" color={textSecondary} fontWeight="medium">Group Size</Text>
                  <Text fontWeight="bold" color={textPrimary}>Max {tourMaxGroupSize} people</Text>
                </Box>
              </Flex>
              
              <Flex align="center" bg="gray.50" p={3} borderRadius="lg" borderLeft="4px solid" borderColor={primaryColor}>
                <Text fontSize="xl" color={primaryColor} mr={3}>🗣️</Text>
                <Box>
                  <Text fontSize="sm" color={textSecondary} fontWeight="medium">Languages</Text>
                  <Text fontWeight="bold" color={textPrimary}>English, Indonesian</Text>
                </Box>
              </Flex>
            </Flex>
            
            <Box h="1px" bg="gray.200" w="100%" my={6}></Box>
            
            <Box mb={6}>
              <Heading size="md" mb={4} color={primaryDark} fontWeight="bold">Tour Guide</Heading>
              <Flex align="center" bg="gray.50" p={3} borderRadius="lg">
                <Box 
                  width="56px"
                  height="56px"
                  borderRadius="full"
                  mr={4}
                  bg="blue.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="md"
                  border="2px solid"
                  borderColor={primaryLight}
                >
                  <Text fontSize="2xl">👨‍🦱</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={textPrimary}>{guideName}</Text>
                  <Flex align="center">
                    <Text color="yellow.400" mr={1} fontSize="md">★</Text>
                    <Text fontWeight="bold" color={textPrimary}>{guideRating}</Text>
                    <Text color={textSecondary} ml={1}>({guideReviews} reviews)</Text>
                  </Flex>
                </Box>
                <Button 
                  ml="auto" 
                  bg={primaryColor}
                  color="white"
                  fontWeight="bold"
                  _hover={{ bg: primaryDark, boxShadow: "md" }}
                  boxShadow="sm"
                  onClick={() => navigate('/guide/1')}
                >
                  View Profile
                </Button>
              </Flex>
            </Box>
            
            <Box h="1px" bg="gray.200" w="100%" my={6}></Box>
            
            {/* Enhanced Booking Section with Number of People Selector */}
            <Box>
              <Heading size="md" mb={4} color={primaryDark} fontWeight="bold">Book This Tour</Heading>
              
              {/* Number of Participants Selector */}
              <Box mb={5} bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold" color={textPrimary}>Select Number of People</Text>
                  <Badge colorScheme="blue">Max {tourMaxGroupSize}</Badge>
                </Flex>
                
                <Flex align="center" justify="space-between">
                  <Flex align="center">
                    <Button
                      aria-label="Decrease participants"
                      size="sm"
                      variant="solid"
                      colorScheme="blue"
                      isDisabled={participants <= tourMinGroupSize}
                      onClick={handleDecreaseParticipants}
                      minW="32px"
                      h="32px"
                      p={0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={participants}
                      onChange={handleInputChange}
                      min={tourMinGroupSize}
                      max={tourMaxGroupSize}
                      mx={2}
                      textAlign="center"
                      fontWeight="bold"
                      w="60px"
                      bg="white"
                      color="black"
                    />
                    <Button
                      aria-label="Increase participants"
                      size="sm"
                      variant="solid"
                      colorScheme="blue"
                      isDisabled={participants >= tourMaxGroupSize}
                      onClick={handleIncreaseParticipants}
                      minW="32px"
                      h="32px"
                      p={0}
                    >
                      +
                    </Button>
                  </Flex>
                  <Text color={textSecondary} fontWeight="medium">× {formatPrice(tourPrice)}</Text>
                </Flex>
              </Box>
              
              {/* Price Summary */}
              <Box mb={4} bg="blue.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="blue.600">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="md" color={textPrimary}>Total Price</Text>
                  <Badge 
                    px={3}
                    py={2}
                    bg="blue.600"
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                    borderRadius="md"
                  >
                    {formatPrice(totalPrice)}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color={textSecondary} mt={1}>
                  {participants} {participants === 1 ? 'person' : 'people'} × {formatPrice(tourPrice)}
                </Text>
              </Box>
              
              <Button 
                bg="green.500" 
                color="white"
                size="lg" 
                w="full"
                height="56px"
                fontSize="lg"
                fontWeight="bold"
                boxShadow="md"
                _hover={{ bg: "green.600", boxShadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.3s ease"
                onClick={handleBookNow}
              >
                <Flex align="center" justify="center" width="100%">
                  <Text fontSize="xl" mr={2}>🎫</Text>
                  <Text>Book Now</Text>
                </Flex>
              </Button>
              
              <Text fontSize="sm" color={textSecondary} textAlign="center" mt={3}>
                Free cancellation up to 24 hours before the tour
              </Text>
              
              {/* Social proof */}
              <Box mt={4} p={3} bg="gray.50" borderRadius="md" borderTop="3px solid" borderColor="blue.400">
                <Text fontSize="sm" fontWeight="medium" textAlign="center" color={textPrimary}>
                  <Text as="span" fontWeight="bold" color="green.500">148 people</Text> have booked this tour in the last month
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
        
        {/* Tour Content */}
        <Box 
          bg="white" 
          borderRadius="xl" 
          boxShadow="md"
          mb={10}
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
        >
          {/* Custom Tabs */}
          <Flex borderBottom="1px solid" borderColor="gray.200">
            <Box 
              py={4} 
              px={6} 
              fontWeight="bold"
              borderBottom={activeTab === 0 ? "3px solid" : "none"}
              borderColor={primaryColor}
              color={activeTab === 0 ? primaryColor : textSecondary}
              cursor="pointer"
              onClick={() => setActiveTab(0)}
              transition="all 0.2s"
              bg={activeTab === 0 ? primaryLight : "transparent"}
              _hover={{ color: primaryColor }}
            >
              Description
            </Box>
            <Box 
              py={4} 
              px={6} 
              fontWeight="bold"
              borderBottom={activeTab === 1 ? "3px solid" : "none"}
              borderColor={primaryColor}
              color={activeTab === 1 ? primaryColor : textSecondary}
              cursor="pointer"
              onClick={() => setActiveTab(1)}
              transition="all 0.2s"
              bg={activeTab === 1 ? primaryLight : "transparent"}
              _hover={{ color: primaryColor }}
            >
              Itinerary
            </Box>
            <Box 
              py={4} 
              px={6} 
              fontWeight="bold"
              borderBottom={activeTab === 2 ? "3px solid" : "none"}
              borderColor={primaryColor}
              color={activeTab === 2 ? primaryColor : textSecondary}
              cursor="pointer"
              onClick={() => setActiveTab(2)}
              transition="all 0.2s"
              bg={activeTab === 2 ? primaryLight : "transparent"}
              _hover={{ color: primaryColor }}
            >
              Inclusions
            </Box>
          </Flex>
          
          <Box p={{ base: 4, md: 8 }}>
                          {/* Description Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Text fontSize="lg" lineHeight="1.7" color={textPrimary} mb={6}>{tourDescription}</Text>
                
                {/* Key highlights */}
                <Box mt={6} p={4} bg="blue.50" borderRadius="md">
                  <Heading size="md" mb={4} color="blue.700">Key Highlights</Heading>
                  <Flex wrap="wrap" gap={2}>
                    <Badge colorScheme="green" p={2} borderRadius="md">Beach Exploration</Badge>
                    <Badge colorScheme="green" p={2} borderRadius="md">Swimming</Badge>
                    <Badge colorScheme="green" p={2} borderRadius="md">Cultural Experience</Badge>
                    <Badge colorScheme="green" p={2} borderRadius="md">Local Cuisine</Badge>
                    <Badge colorScheme="green" p={2} borderRadius="md">Photography</Badge>
                  </Flex>
                </Box>
              </Box>
            )}
            
            {/* Itinerary Tab Content */}
            {activeTab === 1 && (
              <Box>
                {tourSteps.map((item, index) => (
                  <Flex 
                    key={index}
                    mb={6}
                    gap={4}
                    bg={index % 2 === 0 ? "white" : "gray.50"}
                    p={4}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ borderColor: primaryColor, boxShadow: "md" }}
                    transition="all 0.2s"
                  >
                    <Box
                      minW="40px"
                      h="40px"
                      borderRadius="full"
                      bg={primaryColor}
                      color="white"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      fontWeight="bold"
                      fontSize="lg"
                      boxShadow="md"
                    >
                      {index + 1}
                    </Box>
                    
                    <Box flex="1">
                      <Flex 
                        justify="space-between" 
                        align="center"
                        mb={2}
                        flexWrap="wrap"
                        gap={2}
                      >
                        <Heading size="md" color={textPrimary}>{item.activity}</Heading>
                        <Badge 
                          bg={primaryColor} 
                          color="white" 
                          py={1} 
                          px={3} 
                          borderRadius="full"
                          fontWeight="bold"
                        >
                          {item.time}
                        </Badge>
                      </Flex>
                      <Text color={textPrimary} fontSize="md">{item.description}</Text>
                    </Box>
                  </Flex>
                ))}
              </Box>
            )}
            
            {/* Inclusions Tab Content */}
            {activeTab === 2 && (
              <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
                <Box flex="1">
                  <Heading 
                    size="md" 
                    mb={6} 
                    color={accentSuccess}
                    display="flex"
                    alignItems="center"
                  >
                    <Text mr={2}>✓</Text> What's Included
                  </Heading>
                  <Flex direction="column" gap={4}>
                    {includedItems.map((item, index) => (
                      <Flex 
                        key={index} 
                        align="center"
                        bg="green.50"
                        p={3}
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderColor={accentSuccess}
                      >
                        <Text color={accentSuccess} fontWeight="bold" mr={3} fontSize="lg">✓</Text>
                        <Text fontWeight="medium" color={textPrimary}>{item}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Box>
                
                <Box flex="1">
                  <Heading 
                    size="md" 
                    mb={6} 
                    color={accentError}
                    display="flex"
                    alignItems="center"
                  >
                    <Text mr={2}>✕</Text> What's Not Included
                  </Heading>
                  <Flex direction="column" gap={4}>
                    {excludedItems.map((item, index) => (
                      <Flex 
                        key={index} 
                        align="center"
                        bg="red.50"
                        p={3}
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderColor={accentError}
                      >
                        <Text color={accentError} fontWeight="bold" mr={3} fontSize="lg">✕</Text>
                        <Text fontWeight="medium" color={textPrimary}>{item}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Box>
              </Flex>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TourDetail;