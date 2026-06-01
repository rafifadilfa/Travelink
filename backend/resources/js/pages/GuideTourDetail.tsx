import React, { useState } from 'react';
import {
    Box, Container, Flex, Heading,
    Text, Button, Image, Badge,
    Input, SimpleGrid, useColorModeValue,
    Icon, HStack, VStack, Avatar
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { FiClock, FiCalendar, FiUsers, FiMessageCircle, FiStar } from 'react-icons/fi';
import "react-datepicker/dist/react-datepicker.css"; // Import the styles

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface TourImage{
  id: number;
  image_path: string;
  image_order: number;
  image_caption: string;
}

interface TourTag{
  id: number;
  name: string;
}

interface Location{
    id: number;
    name: string;
}

interface Category{
    id: number;
    name: string;
}

interface Itineraries{
    id: number;
    step_number: number;
    start_time: string;
    activity: string;
    description: string;
}

interface Guide{
    id: number;
    name: string;
    rating: number;
    review: number;
    profile_picture: string;
}

interface Items{
    id: number;
    name: string;
    pivot: {
        is_included: boolean;
    };
}

interface Tour{
    id: number;
    name: string;
    location: Location;
    tour_description: string;
    tour_rating: number;
    tour_review_count: number;
    tour_price: number;
    tour_duration: number;
    featured: boolean;
    tour_min_participants: number;
    tour_max_participants: number;
    tour_start_time: string;
    slug: string;
    categories: Category[];
    images: TourImage[];
    tags: TourTag[];
    itineraries: Itineraries[];
    items: Items[];
    guide: Guide;
    transactions_count: number;
}

interface Props{
  tour: Tour;
}

export default function TourDetail( { tour }: Props ){

    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState(0);

    const overallBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const primaryColor = useColorModeValue('blue.500', 'blue.400');
    const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
    const primaryTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
    const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
    const accentSuccess = useColorModeValue('green.500', 'green.400');
    const accentError = useColorModeValue('red.500', 'red.400');
    const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;

    const imageGalleryBg = useColorModeValue('gray.200', 'gray.700');
    const formInputBg = useColorModeValue('gray.100', 'gray.700');
    const totalPriceBg = useColorModeValue('blue.50', 'blue.900');
    const numberOfBookerBg = useColorModeValue('teal.50', 'teal.900');
    const numberOfBookerColor = useColorModeValue('teal.700', 'teal.200');
    const numberOfBookerBorder = useColorModeValue('teal.400', 'teal.600');
    const itemLabelBg = useColorModeValue('gray.100', 'gray.700');
    const itemLabelHoverBg = useColorModeValue('gray.200', 'gray.600');
    const tourDetailsBg = useColorModeValue('blue.50', 'gray.700');
    const tourDescriptionBg = useColorModeValue('blue.50', 'gray.750');
    const tourDescriptionColor = useColorModeValue('blue.700', 'blue.200');
    const tourDescriptionBorderColor = useColorModeValue('blue.200', 'blue.800');
    const tourItineraryBg = useColorModeValue("gray.100", "gray.750");
    const includedItemsBg = useColorModeValue('green.50', 'green.900');
    const excludedItemsBg = useColorModeValue('red.50', 'red.900');

    const baseButtonStyle = {
        borderRadius: "lg", fontWeight: "semibold", h: "44px",
        px: 5, fontSize: "sm",
        transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
        _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    };

    const includedItems = tour.items.filter(item => item.pivot.is_included);
    const excludedItems = tour.items.filter(item => !item.pivot.is_included);

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
        }).format(price);
    };

    const totalPrice = tour.tour_price * tour.tour_min_participants;

    const secondaryButtonStyle = {
    ...baseButtonStyle, bg: 'transparent', color: primaryColor,
    border: "2px solid", borderColor: primaryColor,
    _hover: {
        bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'), borderColor: primaryHoverColor,
        color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
    },
    };

    return (
        <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>

            <Container maxW="container.xl" py={{ base: 6, md: 10 }}>

                <Button 
                {...secondaryButtonStyle}
                animation={`${fadeIn} 0.5s ease-out`}
                size="sm"
                marginBottom = {10}
                onClick={() => window.history.back()}
                leftIcon={<ArrowBackIcon />}
                >
                Back
                </Button>

                <Box
                    pb={{ base: 5, md: 6 }}
                    mb={10}
                    borderBottom="1px solid"
                    borderColor={subtleBorderColor}
                    animation={`${slideInUp} 0.7s ease-out 0.1s both`}
                >
                    <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
                        <Box>
                            <Heading as="h1" size="xl" color={primaryTextColor} mb={3} fontWeight="bold">{tour.name}</Heading>
                            <HStack spacing={3}>
                                <Badge variant="subtle" colorScheme="blue" px={3} py={1.5} borderRadius="full" display="flex" alignItems="center">
                                    <Icon viewBox="0 0 24 24" boxSize={4} mr={1.5} fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></Icon>
                                    {tour.location.name}
                                </Badge>
                                <Badge variant="subtle" colorScheme="yellow" px={3} py={1.5} borderRadius="full" display="flex" alignItems="center">
                                    <Icon as={() => <Text>⭐</Text>} color="yellow.500" mr={1.5} fontSize="md" />
                                    <Text fontWeight="bold" mr={1} color={primaryTextColor}>{tour.tour_rating}</Text>
                                    <Text color={secondaryTextColor}>({tour.tour_review_count} reviews)</Text>
                                </Badge>
                            </HStack>
                        </Box>
                        <Box mt={{ base: 4, md: 0 }} flexShrink={0}>
                            <Badge bgGradient={accentGradient} color="white" px={5} py={3} borderRadius="lg" fontSize="xl" fontWeight="bold" boxShadow="lg">
                                {formatPrice(tour.tour_price)}
                                <Text as="span" fontSize="sm" fontWeight="normal" ml={1.5} opacity={0.9}>/ Person</Text>
                            </Badge>
                        </Box>
                    </Flex>
                </Box>

                <form>
                    <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 6, md: 8 }} mb={10}>

                        {/* --- Left Column: Image Gallery --- */}

                        <Box flex="1.5" animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
                            <Box position="relative" borderRadius="xl" overflow="hidden" boxShadow="xl" mb={4} h={{ base: "300px", md: "450px" }} bg={imageGalleryBg}>
                                
                                {/* Use tour.images and safely access the active image */}
                                <Image
                                    src={tour.images[activeImage] ? `/storage/${tour.images[activeImage].image_path}` : 'https://via.placeholder.com/800x600?text=Image'}
                                    alt={tour.images[activeImage]?.image_caption ?? tour.name}
                                    w="100%" h="100%" objectFit="cover"
                                    transition="transform 0.4s ease-in-out, filter 0.4s ease" 
                                    _hover={{ transform: "scale(1.05)", filter: "brightness(1.1)" }}
                                />
                                
                                <Flex position="absolute" bottom="15px" left="50%" transform="translateX(-50%)" bg="blackAlpha.600" backdropFilter="blur(5px)" borderRadius="full" py={1.5} px={3} gap={2.5} >
                                    {/* Map over tour.images to create the indicator dots */}
                                    {tour.images.map((_, index) => (
                                        <Box key={index} w="10px" h="10px" borderRadius="full" bg={activeImage === index ? primaryColor : "whiteAlpha.700"} cursor="pointer" onClick={() => setActiveImage(index)} transition="all 0.3s ease" _hover={{ bg: primaryColor }} />
                                    ))}
                                </Flex>
                            </Box>
                            <HStack spacing={3} overflowX="auto" pb={3}>
                                {/* Map over tour.images to create the thumbnails */}
                                {tour.images.map((image, index) => (
                                    <Box key={index} 
                                    borderRadius="lg" 
                                    overflow="hidden" 
                                    boxShadow={activeImage === index ? "outline" : "md"} 
                                    borderWidth={activeImage === index ? "3px" : "0px"} 
                                    borderColor={activeImage === index ? primaryColor : "transparent"} 
                                    w="120px" h="80px" 
                                    cursor="pointer" 
                                    onClick={() => setActiveImage(index)} 
                                    flexShrink={0} transition="all 0.3s ease" 
                                    _hover={{ transform: "scale(1.05) translateY(-2px)", 
                                    borderColor: primaryHoverColor, boxShadow: 'lg' }}
                                    >
                                        <Image 
                                            src={`/storage/${image.image_path}`} 
                                            alt={image.image_caption} 
                                            width="100%" height="100%" objectFit="cover" 
                                        />
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
                                        <Badge colorScheme="blue" variant="solid" px={2} py={0.5} borderRadius="md" fontSize="xs">Max {tour.tour_max_participants}</Badge>
                                    </HStack>
                                    <Flex align="center" justify="space-between" bg={formInputBg} p={3} borderRadius="lg">
                                        <HStack>
                                            <Button aria-label="Decrease participants" size="sm" isDisabled= {true} borderRadius="full" w="36px" h="36px">-</Button>
                                                <Input type="number" value={tour.tour_min_participants} isDisabled = {true} min={tour.tour_min_participants} max={tour.tour_max_participants} mx={1} textAlign="center" fontWeight="bold" w="60px" h="36px" bg={cardBg} focusBorderColor={primaryColor} />
                                            <Button aria-label="Increase participants" size="sm" isDisabled={true} borderRadius="full" w="36px" h="36px">+</Button>
                                        </HStack>
                                        <Text color={secondaryTextColor} fontWeight="medium" fontSize="sm" pr={2}>× {formatPrice(tour.tour_price)}</Text>
                                    </Flex>
                                </Box>
                                
                                <Box bg={totalPriceBg} p={4} borderRadius="lg" borderLeft="5px solid" borderColor={primaryColor} boxShadow="md">
                                    <Flex justify="space-between" align="center">
                                        <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>Total Price</Text>
                                        <Text fontSize="xl" fontWeight="extrabold" color={primaryColor}>{formatPrice(totalPrice)}</Text>
                                    </Flex>
                                    <Text fontSize="xs" color={secondaryTextColor} mt={1}>{tour.tour_min_participants} {tour.tour_min_participants === 1 ? 'person' : 'people'} × {formatPrice(tour.tour_price)}</Text>
                                </Box>
                                
                                <Button isDisabled = {true} bgGradient="linear(to-r, green.400, green.500)" _hover={{ bgGradient: "linear(to-r, green.500, green.600)" }} leftIcon={<Text fontSize="xl">🎫</Text>}>Book Now & Secure Your Spot</Button>

                                <Box p={3.5} bg={numberOfBookerBg} borderRadius="md" borderTop="3px solid" borderColor={numberOfBookerBorder} textAlign="center">
                                    <Text fontSize="sm" fontWeight="medium" color={numberOfBookerColor}>
                                        <Text as="span" fontWeight="bold">📈 {tour.transactions_count} people</Text> booked this tour in the last month!
                                    </Text>
                                </Box>
                            </VStack>
                        </Box>                        
                    </Flex>
                </form>
                
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
                                    { label: 'Duration', value: tour.tour_duration, icon: FiClock },
                                    { label: 'Start Time', value: tour.tour_start_time, icon: FiCalendar },
                                    { label: 'Group Size', value: `Max ${tour.tour_max_participants} people`, icon: FiUsers },
                                    { label: 'Languages', value: 'English, Indonesian', icon: FiMessageCircle },
                                ].map(item => (
                                    <Flex key={item.label} align="center" bg={itemLabelBg} p={4} borderRadius="lg" transition="all 0.2s ease" _hover={{ bg: itemLabelHoverBg, transform: "translateY(-2px)", boxShadow: "md" }}>
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
                                <Avatar size="lg" 
                                name={tour.guide.name} 
                                src={tour.guide.profile_picture ? `/storage/${tour.guide.profile_picture}` : "https://via.placeholder.com/150x140?text=Image"}
                                mr={5} boxShadow="md" 
                                border="3px solid" 
                                borderColor={primaryColor} />
                                <Box flex="1">
                                    <Text fontWeight="bold" fontSize="lg" color={primaryTextColor}>{tour.guide.name}</Text>
                                    <HStack spacing={1.5} align="center">
                                        <Icon as={FiStar} color="yellow.400" fill="yellow.400"/>
                                        <Text fontWeight="bold" fontSize="sm" color={primaryTextColor}>{tour.guide.rating}</Text>
                                        <Text color={secondaryTextColor} fontSize="sm">({tour.guide.review} reviews)</Text>
                                    </HStack>
                                </Box>
                            </Flex>
                        </Box>
                    </SimpleGrid>
                </Box>

                {/* --- Details Tabs Section --- */}
                <Box bg={cardBg} borderRadius="xl" boxShadow="xl" overflow="hidden" border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.5s both`}>
                    <Flex borderBottom="1px solid" borderColor={subtleBorderColor}>
                        {['Description', 'Itinerary', 'Inclusions'].map((tabName, index) => (
                            <Box key={tabName} py={4} px={{ base: 4, md: 8 }} fontWeight="bold" fontSize={{ base: "sm", md: "md" }} borderBottom={activeTab === index ? "3px solid" : "3px solid transparent"} borderColor={activeTab === index ? primaryColor : "transparent"} color={activeTab === index ? primaryColor : secondaryTextColor} cursor="pointer" onClick={() => setActiveTab(index)} transition="all 0.3s ease" bg={activeTab === index ? tourDetailsBg : "transparent"} _hover={{ color: primaryColor, bg: tourDetailsBg }} flex={1} textAlign="center">
                                {tabName}
                            </Box>
                        ))}
                    </Flex>

                    <Box p={{ base: 5, md: 8 }}>
                        {activeTab === 0 && (
                            <VStack spacing={6} align="stretch" animation={`${fadeIn} 0.5s ease`}>
                                <Text fontSize="md" lineHeight="1.8" color={secondaryTextColor}>{tour.tour_description}</Text>
                                <Box mt={4} p={5} bg={tourDescriptionBg} borderRadius="lg" border="1px solid" borderColor={tourDescriptionBorderColor}>
                                    <Heading size="md" mb={4} color={tourDescriptionColor}>🏝️ Key Highlights</Heading>
                                    <Flex wrap="wrap" gap={3}>
                                        {tour.tags.map(tag => (
                                            <Badge key={tag.id} variant="solid" colorScheme="green" px={3} py={1.5} borderRadius="md" fontSize="xs" fontWeight="bold">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </Flex>
                                </Box>
                            </VStack>
                        )}

                        {activeTab === 1 && (
                            <VStack spacing={5} align="stretch" animation={`${fadeIn} 0.5s ease`}>
                                {tour.itineraries?.map((item, index) => (
                                    <Flex key={index} gap={5} p={5} borderRadius="lg" bg={index % 2 === 0 ? "transparent" : tourItineraryBg} border="1px solid" borderColor={subtleBorderColor} transition="all 0.25s ease" _hover={{ borderColor: primaryColor, boxShadow: "lg", transform: "translateY(-3px)" }}>
                                        <Box minW="40px" h="40px" borderRadius="full" bgGradient={accentGradient} color="white" display="flex" justifyContent="center" alignItems="center" fontWeight="bold" fontSize="lg" boxShadow="md" flexShrink={0}>{index + 1}</Box>
                                        <Box flex="1">
                                            <Flex justify="space-between" align="flex-start" mb={1.5} flexWrap="wrap" gap={2}>
                                                <Heading size="sm" color={primaryTextColor} fontWeight="semibold">{item.activity}</Heading>
                                                <Badge bg={primaryColor} color="white" py={1} px={3} borderRadius="full" fontWeight="bold" fontSize="xs">{item.start_time}</Badge>
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

                                    {/* Included ITems */}
                                    
                                    <VStack spacing={4} align="stretch">
                                        {excludedItems?.map((item) => (
                                            <Flex key={item.id} align="center" bg={includedItemsBg} p={3.5} borderRadius="md" borderLeft="4px solid" borderColor={accentSuccess} boxShadow="sm">
                                                <Text color={accentSuccess} fontWeight="bold" mr={3} fontSize="lg">✓</Text>
                                                <Text fontWeight="medium" fontSize="sm" color={primaryTextColor}>{item.name}</Text>
                                            </Flex>
                                        ))}
                                    </VStack>

                                </Box>

                                <Box>
                                    <Heading size="md" mb={6} color={accentError} display="flex" alignItems="center">
                                        <Icon as={() => <Text>✕</Text>} mr={3} fontSize="xl"/> What's Not Included
                                    </Heading>

                                    {/* Excluded Items */}

                                    <VStack spacing={4} align="stretch">
                                        {includedItems?.map((item) => (
                                            <Flex key={item.id} align="center" bg={excludedItemsBg} p={3.5} borderRadius="md" borderLeft="4px solid" borderColor={accentError} boxShadow="sm">
                                                <Text color={accentError} fontWeight="bold" mr={3} fontSize="lg">✕</Text>
                                                <Text fontWeight="medium" fontSize="sm" color={primaryTextColor}>{item.name}</Text>
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