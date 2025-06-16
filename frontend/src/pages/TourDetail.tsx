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
    SimpleGrid,
    useColorModeValue,
    Icon,
    HStack,
    VStack,
    Avatar
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';

import { FiClock, FiCalendar, FiUsers, FiMessageCircle, FiStar } from 'react-icons/fi';



const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;


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

// --- Guide Info ---
const guideName = 'Wayan Sudiarta';
const guideRating = 4.9;
const guideReviews = 189;
const guideAvatarUrl = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80'


// --- Included/Excluded Items ---
const includedItems = ['Hotel pickup and drop-off', 'Air-conditioned vehicle', 'Professional local guide', 'Lunch at local restaurant', 'Bottled water', 'Snorkeling equipment'];
const excludedItems = ['Alcoholic beverages', 'Personal expenses', 'Additional activities', 'Gratuities (optional)'];

// --- Itinerary ---
const tourSteps = [
    { time: '08:30 AM', activity: 'Hotel pickup', description: 'Our guide will pick you up from your hotel in a modern, air-conditioned vehicle.' },
    { time: '09:30 AM', activity: 'Balangan Beach', description: 'Visit this hidden gem known for its pristine white sand and crystal clear turquoise waters.' },
    { time: '11:00 AM', activity: 'Padang Padang Beach', description: 'Explore the famous beach from "Eat Pray Love" with its unique and dramatic rock formations.' },
    { time: '12:30 PM', activity: 'Lunch at Uluwatu', description: 'Enjoy a delicious Indonesian lunch at a stunning cliff-top restaurant with panoramic ocean views.' },
    { time: '14:00 PM', activity: 'Dreamland Beach', description: 'Relax and unwind at this beautiful beach, with ample opportunities for swimming and sunbathing.' },
    { time: '16:30 PM', activity: 'Return to Hotel', description: 'We will drop you off at your hotel, filled with memories of a wonderful day of beach exploration.' }
];

const TourDetail: React.FC = () => {
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [participants, setParticipants] = useState(2);

    
    const overallBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const glassBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
    const primaryColor = useColorModeValue('blue.500', 'blue.400');
    const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
    const primaryTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
    const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
    const accentSuccess = useColorModeValue('green.500', 'green.400');
    const accentError = useColorModeValue('red.500', 'red.400');
    const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;

    const baseButtonStyle = {
        borderRadius: "lg", fontWeight: "semibold", h: "44px",
        px: 5, fontSize: "sm",
        transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
        _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    };

    const primaryNavButtonStyle = {
        ...baseButtonStyle,
        bgGradient: `linear(to-r, ${primaryColor}, ${useColorModeValue('blue.400', 'blue.300')})`,
        color: 'white',
        boxShadow: "md",
        _hover: {
            bgGradient: `linear(to-r, ${primaryHoverColor}, ${useColorModeValue('blue.500', 'blue.400')})`,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: 'lg'
        },
    };
    
    const secondaryNavButtonStyle = {
        ...baseButtonStyle,
        bg: 'transparent',
        color: primaryColor,
        border: "2px solid",
        borderColor: primaryColor,
        _hover: {
            bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'),
            borderColor: primaryHoverColor,
            color: primaryHoverColor,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: 'md'
        },
    };

    const ctaButtonStyle = {
        borderRadius: "lg", fontWeight: "bold", h: "52px",
        px: 6, fontSize: "md",
        transition: "all 0.3s ease",
        _active: { transform: 'translateY(1px) scale(0.97)' },
        _hover: { transform: 'translateY(-3px)', boxShadow: 'xl' },
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
        }).format(price);
    };

    const totalPrice = tourPrice * participants;

    const handleIncreaseParticipants = () => { if (participants < tourMaxGroupSize) setParticipants(participants + 1); };
    const handleDecreaseParticipants = () => { if (participants > tourMinGroupSize) setParticipants(participants - 1); };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= tourMinGroupSize && value <= tourMaxGroupSize) {
            setParticipants(value);
        } else if (e.target.value === '') {
            setParticipants(tourMinGroupSize);
        }
    };

    const handleBookNow = () => {
        const bookingDetails = {
            tourId: 1, tourName, tourLocation, participants,
            pricePerPerson: tourPrice, totalPrice,
            date: 'June 8, 2025', time: tourStartTime, guideName
        };
        console.log('Booking details:', bookingDetails);
        navigate('/payment/new', { state: { bookingDetails } });
    };
    
    return (
        <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
            {/* --- Sticky Header --- */}
            <Box bg={glassBg} backdropFilter="blur(15px)" boxShadow="sm" position="sticky" top={0} zIndex={1000} borderBottom="1px solid" borderColor={subtleBorderColor}>
                <Container maxW="container.xl">
                    <Flex h="68px" justify="space-between" align="center">
                        <Flex align="center" gap={2.5} onClick={() => navigate('/dashboard')} cursor="pointer">
                            <Flex alignItems="center" justifyContent="center" boxSize="40px" borderRadius="lg" bgGradient={accentGradient} boxShadow="lg" transition="all 0.3s ease" _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}>
                                <Text fontSize="xl" color="white" fontWeight="bold">✈</Text>
                            </Flex>
                            <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold" display={{base: "none", sm: "block"}}>
                                Travelink
                            </Heading>
                        </Flex>
                        <HStack spacing={3}>
                            <Button {...secondaryNavButtonStyle} size="sm" onClick={() => navigate('/tours')} leftIcon={<Text as="span" role="img" aria-label="explore" mr={1}>🧭</Text>}>Explore</Button>
                            <Button {...primaryNavButtonStyle} size="sm" onClick={() => navigate('/bookings')} leftIcon={<Text as="span" role="img" aria-label="bookings" mr={1}>💼</Text>}>My Trips</Button>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
                {/* --- Breadcrumbs --- */}
                <Flex fontSize="sm" color={secondaryTextColor} mb={4} align="center" animation={`${slideInUp} 0.6s ease-out`}>
                    <Text cursor="pointer" _hover={{ color: primaryColor, textDecoration: "underline" }} onClick={() => navigate('/dashboard')}>Home</Text>
                    <Text mx={2}>/</Text>
                    <Text cursor="pointer" _hover={{ color: primaryColor, textDecoration: "underline" }} onClick={() => navigate('/tours')}>Tours</Text>
                    <Text mx={2}>/</Text>
                    <Text fontWeight="medium" color={primaryTextColor}>{tourName}</Text>
                </Flex>

                <Box
                    pb={{ base: 5, md: 6 }}
                    mb={10}
                    borderBottom="1px solid"
                    borderColor={subtleBorderColor}
                    animation={`${slideInUp} 0.7s ease-out 0.1s both`}
                >
                    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
                        <Box>
                            <Heading as="h1" size="xl" color={primaryTextColor} mb={3} fontWeight="bold">{tourName}</Heading>
                            <HStack spacing={3}>
                                <Badge variant="subtle" colorScheme="blue" px={3} py={1.5} borderRadius="full" display="flex" alignItems="center">
                                    <Icon viewBox="0 0 24 24" boxSize={4} mr={1.5} fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></Icon>
                                    {tourLocation}
                                </Badge>
                                <Badge variant="subtle" colorScheme="yellow" px={3} py={1.5} borderRadius="full" display="flex" alignItems="center">
                                    <Icon as={() => <Text>⭐</Text>} color="yellow.500" mr={1.5} fontSize="md" />
                                    <Text fontWeight="bold" mr={1} color={primaryTextColor}>{tourRating}</Text>
                                    <Text color={secondaryTextColor}>({tourReviewCount} reviews)</Text>
                                </Badge>
                            </HStack>
                        </Box>
                        <Box mt={{ base: 4, md: 0 }} flexShrink={0}>
                            <Badge bgGradient={accentGradient} color="white" px={5} py={3} borderRadius="lg" fontSize="xl" fontWeight="bold" boxShadow="lg">
                                {formatPrice(tourPrice)}
                                <Text as="span" fontSize="sm" fontWeight="normal" ml={1.5} opacity={0.9}>/person</Text>
                            </Badge>
                        </Box>
                    </Flex>
                </Box>

                <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, md: 8 }} mb={10}>
                    {/* --- Left Column: Image Gallery --- */}
                    <Box flex="1.5" animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
                        <Box position="relative" borderRadius="xl" overflow="hidden" boxShadow="xl" mb={4} h={{ base: "300px", md: "450px" }} bg={useColorModeValue('gray.200', 'gray.700')}>
                            <Image src={tourImages[activeImage]} alt={`${tourName} - Image ${activeImage + 1}`} w="100%" h="100%" objectFit="cover" transition="transform 0.4s ease-in-out, filter 0.4s ease" _hover={{ transform: "scale(1.05)", filter: "brightness(1.1)" }} />
                            <Flex position="absolute" bottom="15px" left="50%" transform="translateX(-50%)" bg="blackAlpha.600" backdropFilter="blur(5px)" borderRadius="full" py={1.5} px={3} gap={2.5}>
                                {tourImages.map((_, index) => (
                                    <Box key={index} w="10px" h="10px" borderRadius="full" bg={activeImage === index ? primaryColor : "whiteAlpha.700"} cursor="pointer" onClick={() => setActiveImage(index)} transition="all 0.3s ease" _hover={{ bg: primaryColor }} />
                                ))}
                            </Flex>
                        </Box>
                        <HStack spacing={3} overflowX="auto" pb={3}>
                            {tourImages.map((image, index) => (
                                <Box key={index} borderRadius="lg" overflow="hidden" boxShadow={activeImage === index ? "outline" : "md"} borderWidth={activeImage === index ? "3px" : "0px"} borderColor={activeImage === index ? primaryColor : "transparent"} w="120px" h="80px" cursor="pointer" onClick={() => setActiveImage(index)} flexShrink={0} transition="all 0.3s ease" _hover={{ transform: "scale(1.05) translateY(-2px)", borderColor: primaryHoverColor, boxShadow: 'lg' }}>
                                    <Image src={image} alt={`Thumbnail ${index + 1}`} width="100%" height="100%" objectFit="cover" />
                                </Box>
                            ))}
                        </HStack>
                    </Box>

                    {/* --- Right Column: Booking Card --- */}
                    <Box flex="1" bg={cardBg} p={{ base: 5, md: 7 }} borderRadius="xl" boxShadow="xl" height="fit-content" borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
                        <Heading size="lg" mb={6} color={primaryTextColor} fontWeight="bold" pb={3} borderBottom="2px solid" borderColor={subtleBorderColor}>Book This Tour</Heading>
                        <VStack spacing={5} align="stretch">
                            <Box>
                                <HStack justify="space-between" mb={3}>
                                    <Text fontWeight="bold" fontSize="md" color={primaryTextColor}>Number of Travelers</Text>
                                    <Badge colorScheme="blue" variant="solid" px={2} py={0.5} borderRadius="md" fontSize="xs">Max {tourMaxGroupSize}</Badge>
                                </HStack>
                                <Flex align="center" justify="space-between" bg={useColorModeValue('gray.100', 'gray.700')} p={3} borderRadius="lg">
                                    <HStack>
                                        <Button aria-label="Decrease participants" size="sm" isDisabled={participants <= tourMinGroupSize} onClick={handleDecreaseParticipants} borderRadius="full" w="36px" h="36px">-</Button>
                                        <Input type="number" value={participants} onChange={handleInputChange} min={tourMinGroupSize} max={tourMaxGroupSize} mx={1} textAlign="center" fontWeight="bold" w="60px" h="36px" bg={cardBg} focusBorderColor={primaryColor} />
                                        <Button aria-label="Increase participants" size="sm" isDisabled={participants >= tourMaxGroupSize} onClick={handleIncreaseParticipants} borderRadius="full" w="36px" h="36px">+</Button>
                                    </HStack>
                                    <Text color={secondaryTextColor} fontWeight="medium" fontSize="sm" pr={2}>× {formatPrice(tourPrice)}</Text>
                                </Flex>
                            </Box>
                            
                            <Box bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="lg" borderLeft="5px solid" borderColor={primaryColor} boxShadow="md">
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>Total Price</Text>
                                    <Text fontSize="xl" fontWeight="extrabold" color={primaryColor}>{formatPrice(totalPrice)}</Text>
                                </Flex>
                                <Text fontSize="xs" color={secondaryTextColor} mt={1}>{participants} {participants === 1 ? 'person' : 'people'} × {formatPrice(tourPrice)}</Text>
                            </Box>

                            <Button {...ctaButtonStyle} bgGradient="linear(to-r, green.400, green.500)" _hover={{ bgGradient: "linear(to-r, green.500, green.600)" }} onClick={handleBookNow} leftIcon={<Text fontSize="xl">🎫</Text>}>Book Now & Secure Your Spot</Button>

                            <Text fontSize="sm" color={secondaryTextColor} textAlign="center">✨ Free cancellation up to 24 hours before the tour</Text>

                            <Box p={3.5} bg={useColorModeValue('teal.50', 'teal.900')} borderRadius="md" borderTop="3px solid" borderColor={useColorModeValue('teal.400', 'teal.600')} textAlign="center">
                                <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('teal.700', 'teal.200')}>
                                    <Text as="span" fontWeight="bold">📈 {tourReviewCount + 3} people</Text> booked this tour in the last month!
                                </Text>
                            </Box>
                        </VStack>
                    </Box>
                </Flex>
                
                <Box
                    bg={cardBg}
                    p={{ base: 5, md: 7 }}
                    borderRadius="xl"
                    boxShadow="xl"
                    mb={10}
                    animation={`${slideInUp} 0.7s ease-out 0.4s both`}
                    border="1px solid"
                    borderColor={subtleBorderColor}
                >
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="start">
                        {/* Tour Essentials Section */}
                        <Box>
                            <Heading size="lg" mb={6} color={primaryTextColor} fontWeight="bold">Tour Essentials</Heading>
                            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5}>
                                {[
                                    { label: 'Duration', value: tourDuration, icon: FiClock },
                                    { label: 'Start Time', value: tourStartTime, icon: FiCalendar },
                                    { label: 'Group Size', value: `Max ${tourMaxGroupSize} people`, icon: FiUsers },
                                    { label: 'Languages', value: 'English, Indonesian', icon: FiMessageCircle },
                                ].map(item => (
                                    <Flex key={item.label} align="center" bg={useColorModeValue('gray.100', 'gray.700')} p={4} borderRadius="lg" transition="all 0.2s ease" _hover={{ bg: useColorModeValue('gray.200', 'gray.600'), transform: "translateY(-2px)", boxShadow: "md" }}>
                                        <Icon as={item.icon} boxSize={6} color={primaryColor} mr={4}/>
                                        <Box>
                                            <Text fontSize="sm" color={secondaryTextColor} fontWeight="medium">{item.label}</Text>
                                            <Text fontWeight="bold" color={primaryTextColor} fontSize="md">{item.value}</Text>
                                        </Box>
                                    </Flex>
                                ))}
                            </SimpleGrid>
                        </Box>

                        {/* Meet Your Guide Section */}
                        <Box>
                            <Heading size="lg" mb={6} color={primaryTextColor} fontWeight="bold">Meet Your Guide</Heading>
                            <Flex bg={useColorModeValue('gray.100', 'gray.700')} p={5} borderRadius="lg" alignItems="center" transition="all 0.2s ease" _hover={{transform: 'translateY(-3px)', boxShadow: 'lg'}}>
                                <Avatar size="lg" name={guideName} src={guideAvatarUrl} mr={5} boxShadow="md" border="3px solid" borderColor={primaryColor} />
                                <Box flex="1">
                                    <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>{guideName}</Text>
                                    <HStack spacing={1.5} align="center">
                                        <Icon as={FiStar} color="yellow.400" fill="yellow.400"/>
                                        <Text fontWeight="bold" fontSize="sm" color={primaryTextColor}>{guideRating}</Text>
                                        <Text color={secondaryTextColor} fontSize="sm">({guideReviews} reviews)</Text>
                                    </HStack>
                                </Box>
                                <Button
                                    ml="auto"
                                    colorScheme="blue"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/guide/1')}
                                    _hover={{ bg: primaryColor, color: 'white' }}
                                >
                                    View Profile
                                </Button>
                            </Flex>
                        </Box>
                    </SimpleGrid>
                </Box>

                {/* --- Details Tabs Section --- */}
                <Box bg={cardBg} borderRadius="xl" boxShadow="xl" overflow="hidden" border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.5s both`}>
                    <Flex borderBottom="1px solid" borderColor={subtleBorderColor}>
                        {['Description', 'Itinerary', 'Inclusions'].map((tabName, index) => (
                            <Box key={tabName} py={4} px={{ base: 4, md: 8 }} fontWeight="bold" fontSize={{ base: "sm", md: "md" }} borderBottom={activeTab === index ? "3px solid" : "3px solid transparent"} borderColor={activeTab === index ? primaryColor : "transparent"} color={activeTab === index ? primaryColor : secondaryTextColor} cursor="pointer" onClick={() => setActiveTab(index)} transition="all 0.3s ease" bg={activeTab === index ? useColorModeValue('blue.50', 'gray.700') : "transparent"} _hover={{ color: primaryColor, bg: useColorModeValue('blue.50', 'gray.700') }} flex={1} textAlign="center">
                                {tabName}
                            </Box>
                        ))}
                    </Flex>

                    <Box p={{ base: 5, md: 8 }}>
                        {activeTab === 0 && (
                            <VStack spacing={6} align="stretch" animation={`${fadeIn} 0.5s ease`}>
                                <Text fontSize="md" lineHeight="1.8" color={secondaryTextColor}>{tourDescription}</Text>
                                <Box mt={4} p={5} bg={useColorModeValue('blue.50', 'gray.750')} borderRadius="lg" border="1px solid" borderColor={useColorModeValue('blue.200', 'blue.800')}>
                                    <Heading size="md" mb={4} color={useColorModeValue('blue.700', 'blue.200')}>🏝️ Key Highlights</Heading>
                                    <Flex wrap="wrap" gap={3}>
                                        {['Beach Exploration', 'Swimming', 'Cultural Experience', 'Local Cuisine', 'Photography', 'Hidden Gems'].map(highlight => (
                                            <Badge key={highlight} variant="solid" colorScheme="green" px={3} py={1.5} borderRadius="md" fontSize="xs" fontWeight="bold">
                                                {highlight}
                                            </Badge>
                                        ))}
                                    </Flex>
                                </Box>
                            </VStack>
                        )}

                        {activeTab === 1 && (
                            <VStack spacing={5} align="stretch" animation={`${fadeIn} 0.5s ease`}>
                                {tourSteps.map((item, index) => (
                                    <Flex key={index} gap={5} p={5} borderRadius="lg" bg={index % 2 === 0 ? "transparent" : useColorModeValue("gray.100", "gray.750")} border="1px solid" borderColor={subtleBorderColor} transition="all 0.25s ease" _hover={{ borderColor: primaryColor, boxShadow: "lg", transform: "translateY(-3px)" }}>
                                        <Box minW="40px" h="40px" borderRadius="full" bgGradient={accentGradient} color="white" display="flex" justifyContent="center" alignItems="center" fontWeight="bold" fontSize="lg" boxShadow="md" flexShrink={0}>{index + 1}</Box>
                                        <Box flex="1">
                                            <Flex justify="space-between" align="flex-start" mb={1.5} flexWrap="wrap" gap={2}>
                                                <Heading size="sm" color={primaryTextColor} fontWeight="semibold">{item.activity}</Heading>
                                                <Badge bg={primaryColor} color="white" py={1} px={3} borderRadius="full" fontWeight="bold" fontSize="xs">{item.time}</Badge>
                                            </Flex>
                                            <Text color={secondaryTextColor} fontSize="sm" lineHeight="1.6">{item.description}</Text>
                                        </Box>
                                    </Flex>
                                ))}
                            </VStack>
                        )}

                        {activeTab === 2 && (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} animation={`${fadeIn} 0.5s ease`}>
                                <Box>
                                    <Heading size="md" mb={6} color={accentSuccess} display="flex" alignItems="center">
                                        <Icon as={() => <Text>✓</Text>} mr={3} fontSize="xl"/> What's Included
                                    </Heading>
                                    <VStack spacing={4} align="stretch">
                                        {includedItems.map((item) => (
                                            <Flex key={item} align="center" bg={useColorModeValue('green.50', 'green.900')} p={3.5} borderRadius="md" borderLeft="4px solid" borderColor={accentSuccess} boxShadow="sm">
                                                <Text color={accentSuccess} fontWeight="bold" mr={3} fontSize="lg">✓</Text>
                                                <Text fontWeight="medium" fontSize="sm" color={primaryTextColor}>{item}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                                <Box>
                                    <Heading size="md" mb={6} color={accentError} display="flex" alignItems="center">
                                        <Icon as={() => <Text>✕</Text>} mr={3} fontSize="xl"/> What's Not Included
                                    </Heading>
                                    <VStack spacing={4} align="stretch">
                                        {excludedItems.map((item) => (
                                            <Flex key={item} align="center" bg={useColorModeValue('red.50', 'red.900')} p={3.5} borderRadius="md" borderLeft="4px solid" borderColor={accentError} boxShadow="sm">
                                                <Text color={accentError} fontWeight="bold" mr={3} fontSize="lg">✕</Text>
                                                <Text fontWeight="medium" fontSize="sm" color={primaryTextColor}>{item}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>
                                </Box>
                            </SimpleGrid>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default TourDetail;