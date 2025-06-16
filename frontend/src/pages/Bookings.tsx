import React, { useState } from 'react';
import {
  Box, Flex, Text, Button, Image, Badge, Container, Grid, GridItem,
  useColorModeValue, Icon, Heading, Divider, Tabs, TabList, TabPanels, Tab, TabPanel, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Textarea, VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon, CalendarIcon, StarIcon, TimeIcon, InfoOutlineIcon,
  CheckCircleIcon, WarningIcon, CloseIcon, LinkIcon
} from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const iconWiggle = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(8deg) scale(1.08); }
  50% { transform: rotate(-4deg) scale(1.04); }
  75% { transform: rotate(8deg) scale(1.08); }
`;
const subtleFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

const upcomingBookingsData = [
  {
    id: 1,
    tourName: 'Bali Beach Hopping Adventure',
    location: 'Bali',
    date: 'August 15, 2025',
    time: '08:30 AM',
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392',
    price: 1200000,
    people: 2,
    guideName: 'Wayan Sudiarta',
    meetingPoint: 'Hotel Lobby Central',
    paymentStatus: 'paid',
  },
  {
    id: 2,
    tourName: 'Gili Islands Snorkeling Expedition',
    location: 'Lombok',
    date: 'September 02, 2025',
    time: '09:00 AM',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    price: 1500000,
    people: 1,
    guideName: 'Putu Wijaya',
    meetingPoint: 'Lombok Main Harbor, Pier B',
    paymentStatus: 'unpaid',
  },
];

const initialPastBookings = [
  {
    id: 4,
    tourName: 'Historical Jakarta City Tour',
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
    paymentStatus: 'paid',
  },
  {
    id: 5,
    tourName: 'Borobudur Temple Sunrise Experience',
    location: 'Yogyakarta',
    date: 'March 25, 2025',
    time: '04:30 AM',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0',
    price: 950000,
    people: 2,
    guideName: 'Putu Wijaya',
    rating: 0,
    hasReview: false,
    paymentStatus: 'paid',
  },
];

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const [pastBookings, setPastBookings] = useState(initialPastBookings);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const overallBg = useColorModeValue('blue.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(26, 32, 44, 0.80)');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
  const infoBoxBg = useColorModeValue('gray.50', 'gray.700');
  const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${primaryColor})`;
  const yellowStarColor = useColorModeValue('yellow.400', 'yellow.300');

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "42px", px: 5, fontSize: "md",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${useColorModeValue('blue.200', 'blue.700')}` }
  };
  const primaryButtonStyle = {
    ...baseButtonStyle, bgGradient: `linear(to-r, ${primaryColor}, ${useColorModeValue('blue.400', 'blue.300')})`, color: 'white',
    boxShadow: "md",
    _hover: { bgGradient: `linear(to-r, ${primaryHoverColor}, ${useColorModeValue('blue.500', 'blue.400')})`, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg' },
  };
  const secondaryButtonStyle = {
    ...baseButtonStyle, bg: 'transparent', color: primaryColor, border: "2px solid", borderColor: primaryColor,
    _hover: { bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'), borderColor: primaryHoverColor, color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md' },
  };
  const successButtonStyle = {
    ...baseButtonStyle, bgGradient: `linear(to-r, ${useColorModeValue('green.500','green.400')}, ${useColorModeValue('green.400','green.300')})`, color: 'white',
    boxShadow: "md",
    _hover: { bgGradient: `linear(to-r, ${useColorModeValue('green.600','green.500')}, ${useColorModeValue('green.500','green.400')})`, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg' },
  };
  const warningButtonStyle = {
    ...baseButtonStyle, bgGradient: `linear(to-r, ${useColorModeValue('yellow.500','yellow.400')}, ${useColorModeValue('yellow.400','yellow.300')})`, color: 'white',
    boxShadow: "md",
    _hover: { bgGradient: `linear(to-r, ${useColorModeValue('yellow.600','yellow.500')}, ${useColorModeValue('yellow.500','yellow.400')})`, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg' },
  };
  const dangerButtonStyle = {
    ...baseButtonStyle, bg: useColorModeValue('red.500', 'red.600'), color: 'white',
    boxShadow: "md",
    _hover: { bg: useColorModeValue('red.600', 'red.700'), transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg' },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = (bookingId: number) => {
    navigate(`/payment/${bookingId}`);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <Badge colorScheme="green" px={3} py={1} borderRadius="full" display="inline-flex" alignItems="center" variant="solid">
            <Icon as={CheckCircleIcon} mr={1.5} boxSize={3.5}/> Paid
          </Badge>
        );
      case 'unpaid':
        return (
          <Badge colorScheme="red" px={3} py={1} borderRadius="full" display="inline-flex" alignItems="center" variant="solid">
            <Icon as={WarningIcon} mr={1.5} boxSize={3.5}/> Unpaid
          </Badge>
        );
      default:
        return (
          <Badge colorScheme="gray" px={3} py={1} borderRadius="full" display="inline-flex" alignItems="center">
            <Icon as={InfoOutlineIcon} mr={1.5} boxSize={3.5}/> {status}
          </Badge>
        );
    }
  };

  const calculateDaysDifference = (dateStr: string) => {
    const bookingDate = new Date(dateStr).getTime();
    const today = new Date().setHours(0,0,0,0);
    const diffTime = bookingDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const handleOpenReviewModal = (booking: any) => {
    setSelectedBooking(booking);
    setCurrentRating(0);
    setReviewText('');
    onOpen();
  };

  const handleReviewSubmit = () => {
    if (currentRating === 0) {
      alert("Please select a star rating.");
      return;
    }
    setPastBookings(prevBookings =>
      prevBookings.map(b =>
        b.id === selectedBooking.id
          ? { ...b, hasReview: true, rating: currentRating }
          : b
      )
    );
    console.log(`Review Submitted for booking ${selectedBooking.id}: ${currentRating} stars, Text: "${reviewText}"`);
    onClose();
  };


  const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string | number, isPrice?: boolean }> = ({ icon, label, value, isPrice }) => (
    <Box>
      <HStack spacing={1.5} mb={0.5} alignItems="center">
        <Icon as={icon} color={primaryColor} boxSize="1em" />
        <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium" textTransform="uppercase">
          {label}
        </Text>
      </HStack>
      <Text fontSize="md" fontWeight={isPrice ? "bold" : "medium"} color={isPrice ? primaryColor : primaryTextColor} noOfLines={1}>
        {value}
      </Text>
    </Box>
  );

  const renderBookingCard = (booking: any, isUpcoming: boolean) => {
    const daysDiff = isUpcoming ? calculateDaysDifference(booking.date) : Math.floor((new Date().getTime() - new Date(booking.date).getTime()) / (1000 * 60 * 60 * 24));
    let countdownText = "";
    if (isUpcoming) {
        if (daysDiff > 0) countdownText = `${daysDiff} day${daysDiff > 1 ? 's' : ''} left`;
        else if (daysDiff === 0) countdownText = "Today!";
        else countdownText = "Tour has passed";
    } else {
        countdownText = `${daysDiff} day${daysDiff !== 1 ? 's' : ''} ago`;
    }

    return (
      <Box
        key={booking.id}
        borderRadius="xl" overflow="hidden" bg={cardBg} boxShadow="xl"
        transition="all 0.3s ease" _hover={{ boxShadow: "2xl", transform: "translateY(-4px)" }}
        border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.5s ease-out forwards`}
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          <Box w={{ base: '100%', md: '280px' }} h={{ base: '220px', md: 'auto' }} position="relative">
            <Image
              src={booking.image} alt={booking.tourName} objectFit="cover" w="100%" h="100%"
              filter={!isUpcoming ? "grayscale(50%)" : "none"} opacity={!isUpcoming ? "0.8" : "1"}
            />
            <Badge
              position="absolute" top={3} right={3}
              colorScheme={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'orange' : 'blue'}
              variant="solid" px={3} py={1.5} borderRadius="md" fontSize="xs" fontWeight="bold" textTransform="uppercase" boxShadow="md"
            >
              {booking.status}
            </Badge>
            <Badge
              position="absolute" bottom={3} left={3} bg="blackAlpha.700" color="white"
              px={3} py={1.5} borderRadius="md" fontSize="xs" fontWeight="bold"
              display="flex" alignItems="center"
            >
              <Icon as={isUpcoming ? TimeIcon : CalendarIcon} mr={1.5} /> {countdownText}
            </Badge>
          </Box>

          <Box p={{ base: 4, md: 6 }} flex="1">
            <Flex justify="space-between" align="flex-start" mb={{base: 2, md: 3}}>
              <Heading as="h3" size="md" color={primaryTextColor} fontWeight="bold" lineHeight="1.3" mr={3}>
                {booking.tourName}
              </Heading>
              {getPaymentStatusBadge(booking.paymentStatus)}
            </Flex>

            <HStack color={secondaryTextColor} fontSize="sm" mb={4} alignItems="center">
              <Icon as={LinkIcon} color={primaryColor} boxSize={4}/>
              <Text fontWeight="medium">{booking.location}</Text>
            </HStack>
            
            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)"}}
              gap={{ base: 3, md: 4 }} mb={5} p={4} bg={infoBoxBg} borderRadius="lg"
              border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')}
            >
              <DetailItem icon={CalendarIcon} label="Date" value={booking.date} />
              <DetailItem icon={TimeIcon} label="Time" value={booking.time} />
              <DetailItem icon={InfoOutlineIcon} label="People" value={booking.people} />
              <DetailItem icon={InfoOutlineIcon} label="Total Price" value={formatPrice(booking.price * booking.people)} isPrice />
              <GridItem colSpan={{ base: 2, md: 2 }}>
                <DetailItem icon={InfoOutlineIcon} label="Meeting Point" value={booking.meetingPoint} />
              </GridItem>
            </Grid>
            
            <Divider my={4} borderColor={subtleBorderColor} />

            <Flex
              justify="space-between" align={{ base: "stretch", sm: "center" }}
              direction={{ base: "column", sm: "row" }} gap={{ base: 4, sm: 2 }}
            >
              <Flex align="center" gap={3} mb={{base: isUpcoming && booking.paymentStatus === 'unpaid' ? 0 : 3, sm: 0}}>
                <Box
                  width="40px" height="40px" borderRadius="full" bgGradient={accentGradient}
                  display="flex" alignItems="center" justifyContent="center" boxShadow="md"
                  color="white" fontSize="lg" fontWeight="bold"
                >
                  {booking.guideName.substring(0,1)}
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color={primaryTextColor}>{booking.guideName}</Text>
                  <Text fontSize="xs" color={secondaryTextColor}>Your Guide</Text>
                </Box>
              </Flex>

              <Flex gap={3} wrap={{ base: "wrap", md: "nowrap" }} justify={{ base: "center", md: "flex-end" }} width={{base:"100%", sm:"auto"}}>
                {isUpcoming && booking.paymentStatus === 'unpaid' && (
                  <Button {...successButtonStyle} leftIcon={<Icon as={CheckCircleIcon} />} onClick={() => handlePayment(booking.id)} flexGrow={{base:1, sm:0}}>
                    Pay Now
                  </Button>
                )}
                {!isUpcoming && !booking.hasReview && (
                  <Button {...warningButtonStyle} leftIcon={<Icon as={StarIcon} />} onClick={() => handleOpenReviewModal(booking)} flexGrow={{base:1, sm:0}}>
                    Leave Review
                  </Button>
                )}
                <Button {...secondaryButtonStyle} onClick={() => navigate(`/tours/${booking.id}`)} flexGrow={{base:1, sm:0}}>
                  {isUpcoming ? 'Tour Details' : 'Book Again'}
                </Button>
                {isUpcoming && (
                  <Button {...dangerButtonStyle} leftIcon={<Icon as={CloseIcon} boxSize={3}/>} onClick={() => alert(`Cancel booking ${booking.id}`)} flexGrow={{base:1, sm:0}}>
                    Cancel
                  </Button>
                )}
              </Flex>
            </Flex>
            
            {!isUpcoming && booking.hasReview && (
              <Flex alignItems="center" mt={4} p={2} bg={useColorModeValue("green.50", "green.800")} borderRadius="md" borderLeft="3px solid" borderColor={useColorModeValue("green.500", "green.300")}>
                  <Icon as={CheckCircleIcon} color={useColorModeValue("green.500", "green.300")} mr={2} />
                  <Text fontSize="sm" fontWeight="medium" color={useColorModeValue("green.700", "green.200")}>You've left a review for this tour.</Text>
              </Flex>
            )}
            {!isUpcoming && booking.hasReview && (
              <Flex alignItems="center" mt={booking.hasReview ? 2 : 4}>
                <Text fontSize="sm" color={secondaryTextColor} mr={2}>Your Rating:</Text>
                {[...Array(5)].map((_, i) => (
                    <Icon key={i} as={StarIcon} color={i < booking.rating ? yellowStarColor : useColorModeValue("gray.300", "gray.600")} boxSize={4}/>
                ))}
                <Text fontWeight="bold" fontSize="sm" ml={1.5} color={primaryTextColor}>
                    {booking.rating}/5
                </Text>
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>
    );
  };
  
  const EmptyState: React.FC<{icon: React.ElementType, title: string, description: string, buttonText: string}> = ({icon, title, description, buttonText}) => (
    <Box
      textAlign="center" py={16} px={6} bg={cardBg} borderRadius="xl" boxShadow="xl"
      border="1px solid" borderColor={subtleBorderColor}
      animation={`${fadeIn} 0.5s ease-out`}
      minH="400px" display="flex" flexDirection="column" justifyContent="center" alignItems="center"
    >
      <Icon as={icon} boxSize="56px" color={primaryColor} mb={5} animation={`${iconWiggle} 3.5s ease-in-out infinite`} />
      <Heading size="lg" color={primaryTextColor} mb={3}>{title}</Heading>
      <Text color={secondaryTextColor} mb={8} maxW="md" fontSize="md">{description}</Text>
      <Button {...primaryButtonStyle} size="lg" onClick={() => navigate('/tours')} rightIcon={<ChevronRightIcon />} animation={`${subtleFloat} 2s ease-in-out infinite 0.5s`}>
          {buttonText}
      </Button>
    </Box>
  );

  return (
    <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
      <Box bg={glassBg} backdropFilter="blur(12px) saturate(180%)" boxShadow="md" position="sticky" top={0} zIndex={1000} borderBottom="1px solid" borderColor={subtleBorderColor}>
        <Container maxW="container.xl">
          <Flex h="68px" justify="space-between" align="center">
            <Flex align="center" gap={2.5} onClick={() => navigate('/dashboard')} cursor="pointer">
              <Flex alignItems="center" justifyContent="center" boxSize="40px" borderRadius="lg" bgGradient={accentGradient} boxShadow="lg" transition="all 0.3s ease" _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}>
                <Text fontSize="xl" color="white" fontWeight="bold">✈</Text>
              </Flex>
              <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold">
                Travelink
              </Heading>
            </Flex>
            <HStack spacing={3}>
              <Button {...secondaryButtonStyle} size="sm" onClick={() => navigate('/tours')} leftIcon={<Text as="span" role="img" aria-label="explore" mr={0.5}>🧭</Text>}>Explore Tours</Button>
              <Button {...primaryButtonStyle} size="sm" onClick={() => navigate('/profile')} leftIcon={<Text as="span" role="img" aria-label="profile" mr={0.5}>👤</Text>}>My Profile</Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
        <Flex align="center" mb={{ base: 5, md: 8 }} animation={`${slideInUp} 0.6s ease-out 0.1s both`}>
          <Icon as={CalendarIcon} color={primaryColor} boxSize={{ base: 6, md: 7 }} mr={3} />
          <Heading as="h2" size={{ base: "lg", md: "xl" }} fontWeight="bold" color={primaryTextColor}>
            My Bookings
          </Heading>
        </Flex>

        <Tabs index={activeTabIndex} onChange={(index) => setActiveTabIndex(index)} variant="unstyled" isLazy>
          <TabList display="flex" justifyContent="space-around" bg={cardBg} p={1.5} borderRadius="lg" boxShadow="lg" mb={8} border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
            {[
              { label: "Upcoming", icon: TimeIcon, count: upcomingBookingsData.length },
              { label: "Past", icon: CheckCircleIcon, count: pastBookings.length }
            ].map((tab, index) => (
              <Tab
                key={tab.label} flex={1} py={3} borderRadius="md" fontWeight="semibold" fontSize="md"
                color={activeTabIndex === index ? 'white' : secondaryTextColor}
                bg={activeTabIndex === index ? primaryColor : 'transparent'}
                boxShadow={activeTabIndex === index ? 'md' : 'none'}
                transition="all 0.3s ease"
                _hover={{ bg: activeTabIndex !== index ? useColorModeValue('blue.100', 'gray.700') : primaryHoverColor, color: activeTabIndex !== index ? primaryColor : 'white' }}
                _selected={{ color: 'white', bg: primaryColor, boxShadow: 'lg' }}
                display="flex" alignItems="center" justifyContent="center"
              >
                <Icon as={tab.icon} mr={2} boxSize={5} /> {tab.label} ({tab.count})
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              {upcomingBookingsData.length === 0 ? (
                <EmptyState icon={InfoOutlineIcon} title="No Upcoming Adventures Yet" description="Your next journey awaits! Find incredible tours and experiences to fill this space." buttonText="Explore Tours Now"/>
              ) : (
                <Flex direction="column" gap={8}>
                  {upcomingBookingsData.map((booking) => renderBookingCard(booking, true))}
                </Flex>
              )}
            </TabPanel>
            <TabPanel p={0}>
              {pastBookings.length === 0 ? (
                <EmptyState icon={LinkIcon} title="No Past Journeys Logged" description="Once you've completed a tour, it will appear here. Let's make some memories!" buttonText="Find Your Next Tour"/>
              ) : (
                <Flex direction="column" gap={8}>
                  {pastBookings.map((booking) => renderBookingCard(booking, false))}
                </Flex>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {selectedBooking && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
          <ModalContent bg={cardBg} borderRadius="xl" boxShadow="2xl">
            <ModalHeader color={primaryTextColor} fontWeight="bold" borderBottomWidth="1px" borderColor={subtleBorderColor}>
              Leave a review for "{selectedBooking.tourName}"
            </ModalHeader>
            <ModalCloseButton _focus={{ boxShadow: 'outline' }} />
            <ModalBody py={6}>
              <VStack spacing={5}>
                <Text color={secondaryTextColor} fontWeight="medium">How was your experience?</Text>
                <HStack spacing={1} onMouseLeave={() => setHoverRating(0)}>
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <Icon
                        key={ratingValue}
                        as={StarIcon}
                        boxSize={{base: 8, md: 10}}
                        color={ratingValue <= (hoverRating || currentRating) ? yellowStarColor : useColorModeValue("gray.300", "gray.600")}
                        onClick={() => setCurrentRating(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        cursor="pointer"
                        transition="all 0.2s ease"
                        _hover={{ transform: 'scale(1.2)' }}
                      />
                    );
                  })}
                </HStack>
                
                <Textarea
                  placeholder="Share details of your own experience on this tour. What did you like or dislike?"
                  bg={infoBoxBg}
                  borderColor={subtleBorderColor}
                  focusBorderColor={primaryColor}
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </VStack>
            </ModalBody>
            <ModalFooter borderTopWidth="1px" borderColor={subtleBorderColor}>
              <Button {...secondaryButtonStyle} mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button {...primaryButtonStyle} onClick={handleReviewSubmit} isDisabled={currentRating === 0}>
                Submit Review
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default Bookings;