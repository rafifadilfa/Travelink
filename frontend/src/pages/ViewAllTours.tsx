import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Flex,
    Text,
    Heading,
    Container,
    Grid,
    Input,
    useColorModeValue,
    Icon,
    Badge,
    VStack,
    HStack,
    Select,
    Spinner,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Image,
    LinkBox,
    LinkOverlay
} from '@chakra-ui/react';
import {
    SearchIcon,
    ChevronRightIcon,
    RepeatIcon,
    StarIcon,
    ArrowForwardIcon,
    ArrowLeftIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';

// --- Define Keyframes ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Type definitions ---
interface Tour {
    id: number; name: string; location: string; image: string; description: string; price: number; rating: number; reviews: number; duration: string; category: string; featured: boolean;
}

// --- Mock data ---
const tours: Tour[] = [
    { id: 1, name: 'Bali Beach Hopping Adventure', location: 'Bali', image: 'https://images.unsplash.com/photo-1573790387438-4da905039392', description: 'Experience the stunning beaches of Bali with our expert local guides.', price: 1200000, rating: 4.9, reviews: 128, duration: '8 hours', category: 'beach', featured: true, },
    { id: 2, name: 'Mount Rinjani Trek', location: 'Lombok', image: 'https://images.unsplash.com/photo-1726030040596-a8cad43c5363?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Challenging trek to one of Indonesia\'s most beautiful volcanic mountains.', price: 2500000, rating: 4.8, reviews: 95, duration: '3 days', category: 'mountain', featured: true, },
    { id: 3, name: 'Jakarta City Tour', location: 'Jakarta', image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af', description: 'Discover the vibrant capital city with local experts.', price: 800000, rating: 4.7, reviews: 87, duration: '6 hours', category: 'city', featured: false, },
    { id: 4, name: 'Borobudur Temple Sunrise Tour', location: 'Yogyakarta', image: 'https://images.unsplash.com/photo-1631340729644-8b8aad1e9dba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Witness a spectacular sunrise at the UNESCO World Heritage site of Borobudur Temple.', price: 950000, rating: 4.9, reviews: 142, duration: '6 hours', category: 'culture', featured: true, },
    { id: 5, name: 'Raja Ampat Diving Experience', location: 'Papua', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', description: 'Explore the underwater paradise of Raja Ampat with our experienced diving guides.', price: 3200000, rating: 5.0, reviews: 76, duration: '2 days', category: 'diving', featured: true, },
    { id: 6, name: 'Komodo National Park Adventure', location: 'Flores', image: 'https://plus.unsplash.com/premium_photo-1664297926110-7cf2385f8280?q=80&w=2098&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'See the famous Komodo dragons in their natural habitat on this exciting tour.', price: 2800000, rating: 4.8, reviews: 104, duration: '2 days', category: 'nature', featured: false, },
    { id: 7, name: 'Orangutan Jungle Trek', location: 'Sumatra', image: 'https://images.unsplash.com/photo-1654180537506-1825e51b7ce6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Trek through the Sumatran jungle to see wild orangutans.', price: 2200000, rating: 4.9, reviews: 112, duration: '3 days', category: 'nature', featured: false, },
    { id: 8, name: 'Yogyakarta Street Food Tour', location: 'Yogyakarta', image: 'https://images.unsplash.com/photo-1510382844537-64b45768cacf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Taste the best of Javanese cuisine on this delicious street food tour.', price: 500000, rating: 4.8, reviews: 98, duration: '4 hours', category: 'culture', featured: false, },
    { id: 9, name: 'Gili Islands Snorkeling Trip', location: 'Lombok', image: 'https://plus.unsplash.com/premium_photo-1664303700390-b3d0c9b683d4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Snorkel in the crystal clear waters of the Gili Islands and see beautiful coral reefs.', price: 750000, rating: 4.7, reviews: 85, duration: '7 hours', category: 'diving', featured: false, },
];

const categories = [
    { value: 'beach', label: 'Beach', icon: '🏖️' }, { value: 'mountain', label: 'Mountain', icon: '🏔️' },
    { value: 'city', label: 'City', icon: '🏙️' }, { value: 'culture', label: 'Culture', icon: '🏛️' },
    { value: 'diving', label: 'Diving', icon: '🤿' }, { value: 'nature', label: 'Nature', icon: '🌿' },
];

const ViewAllTours: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'price-low' | 'price-high' | 'rating'>('rating');

    
    const [currentPage, setCurrentPage] = useState(1);
    const toursPerPage = 6; 

    const overallBg = useColorModeValue('blue.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const glassBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
    const primaryColor = useColorModeValue('blue.500', 'blue.400');
    const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
    const primaryTextColor = useColorModeValue('gray.700', 'whiteAlpha.900');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
    const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;

    const filterTours = useCallback(() => {
        setLoading(true);
        
        setCurrentPage(1); 
        setTimeout(() => {
            let results = [...tours];
            if (searchQuery) {
                results = results.filter(tour =>
                    tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tour.location.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            if (selectedCategory) {
                results = results.filter(tour => tour.category === selectedCategory);
            }
            switch (sortOrder) {
                case 'price-low': results.sort((a, b) => a.price - b.price); break;
                case 'price-high': results.sort((a, b) => b.price - a.price); break;
                case 'rating': default: results.sort((a, b) => b.rating - a.rating); break;
            }
            setFilteredTours(results);
            setLoading(false);
        }, 500);
    }, [searchQuery, selectedCategory, sortOrder]);

    useEffect(() => {
        filterTours();
    }, [filterTours]);
    

    const totalPages = Math.ceil(filteredTours.length / toursPerPage);
    const indexOfLastTour = currentPage * toursPerPage;
    const indexOfFirstTour = indexOfLastTour - toursPerPage;
    const paginatedTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortOrder('rating');
    };

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
            bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'),
            borderColor: primaryHoverColor, color: primaryHoverColor,
            transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
        },
        _disabled: {
            bg: useColorModeValue('gray.100', 'gray.700'),
            borderColor: useColorModeValue('gray.200', 'gray.600'),
            color: useColorModeValue('gray.400', 'gray.500'),
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
            opacity: 0.7
        },
    };

    return (
        <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
            <Box bg={glassBg} backdropFilter="blur(18px)" boxShadow="md" position="sticky" top={0} zIndex={1000} borderBottom="1px solid" borderColor={subtleBorderColor}>
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
                            <Button {...secondaryButtonStyle} size="sm" onClick={() => navigate('/tours')} leftIcon={<Text as="span" role="img" aria-label="explore" mr={1}>🧭</Text>}>Explore</Button>
                            <Button {...primaryButtonStyle} size="sm" onClick={() => navigate('/bookings')} leftIcon={<Text as="span" role="img" aria-label="bookings" mr={1}>💼</Text>}>My Trips</Button>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="container.xl" py={{ base: 6, md: 10 }}>
                <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={6}>
                    <BreadcrumbItem>
                        <BreadcrumbLink onClick={() => navigate('/dashboard')} color={secondaryTextColor} _hover={{ color: primaryColor }}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href="#" color={primaryTextColor} fontWeight="medium">Tours</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <Heading as="h1" size="2xl" fontWeight="black" color={primaryTextColor} mb={3} animation={`${slideInUp} 0.5s ease-out`}>
                    Explore All Tours
                </Heading>
                <Text fontSize="lg" color={secondaryTextColor} mb={10} maxW="container.md" animation={`${slideInUp} 0.5s ease-out 0.1s both`}>
                    Find your next unforgettable adventure across the beautiful Indonesian archipelago. Tailored experiences with trusted local guides.
                </Text>

                <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} animation={`${slideInUp} 0.5s ease-out 0.2s both`} borderTop="4px solid" borderColor={primaryColor}>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '2fr 1fr 1fr auto' }} gap={6} alignItems="flex-end">
                        <Box>
                            <Text as="label" htmlFor="search-input" display="block" mb={1.5} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Search Tours</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" h="44px" children={<SearchIcon color={secondaryTextColor} />} />
                                <Input
                                    id="search-input" type="text" placeholder="e.g., Bali, Diving, Temple"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    h="44px" borderRadius="lg" bg={useColorModeValue('gray.100', 'gray.700')}
                                    borderColor={subtleBorderColor} variant="filled"
                                    _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                                    _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                                />
                            </InputGroup>
                        </Box>
                        <Box>
                            <Text as="label" htmlFor="category-select" display="block" mb={1.5} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Category</Text>
                            <Select
                                id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                                h="44px" borderRadius="lg" bg={useColorModeValue('gray.100', 'gray.700')}
                                borderColor={subtleBorderColor} variant="filled"
                                _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                                iconColor={secondaryTextColor}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.icon} {category.label}
                                    </option>
                                ))}
                            </Select>
                        </Box>
                        <Box>
                            <Text as="label" htmlFor="sort-select" display="block" mb={1.5} fontWeight="medium" fontSize="sm" color={secondaryTextColor}>Sort By</Text>
                            <Select
                                id="sort-select" value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'price-low' | 'price-high' | 'rating')}
                                h="44px" borderRadius="lg" bg={useColorModeValue('gray.100', 'gray.700')}
                                borderColor={subtleBorderColor} variant="filled"
                                _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                                iconColor={secondaryTextColor}
                            >
                                <option value="rating">Highest Rating</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </Select>
                        </Box>
                        <Button {...secondaryButtonStyle} onClick={resetFilters} leftIcon={<RepeatIcon />} >Reset</Button>
                    </Grid>
                </Box>
                
                <Flex justify="space-between" align="center" mb={6}>
                    <Text color={primaryTextColor} fontSize="lg" fontWeight="medium">
                        Showing <Text as="span" fontWeight="bold" color={primaryColor}>{filteredTours.length}</Text> amazing tours
                    </Text>
                </Flex>

                {loading ? (
                    <Flex justify="center" align="center" minH="400px">
                        <VStack spacing={4}>
                            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color={primaryColor} size="xl" />
                            <Text color={secondaryTextColor} fontSize="lg">Finding your next adventure...</Text>
                        </VStack>
                    </Flex>
                ) : filteredTours.length === 0 ? (
                    <VStack bg={cardBg} p={{ base: 8, md: 16 }} borderRadius="2xl" boxShadow="xl" textAlign="center" borderTop="4px solid" borderColor={primaryColor} spacing={5} minH="400px" justifyContent="center" animation={`${fadeIn} 0.5s ease-out`}>
                        <Text fontSize="6xl" role="img" aria-label="Magnifying glass">🔍</Text>
                        <Heading size="xl" color={primaryTextColor} fontWeight="bold">No Adventures Found</Heading>
                        <Text color={secondaryTextColor} fontSize="lg" maxW="md">
                            We couldn't find any tours matching your criteria. Try adjusting your search or filters!
                        </Text>
                        <Button {...primaryButtonStyle} onClick={resetFilters} mt={4} leftIcon={<RepeatIcon />}>Clear Filters & Search Again</Button>
                    </VStack>
                ) : (
                    
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} animation={`${fadeIn} 0.5s ease-out`}>
                        {paginatedTours.map((tour, index) => (
                            <LinkBox
                                as="article" key={tour.id} bg={cardBg} borderRadius="xl" overflow="hidden"
                                boxShadow="lg" transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                                _hover={{ boxShadow: '2xl', transform: 'translateY(-6px) scale(1.02)' }}
                                border="1px solid" borderColor={subtleBorderColor}
                                animation={`${slideInUp} 0.6s ease-out ${index * 0.07}s both`}
                            >
                                <Box position="relative" h="220px" overflow="hidden">
                                    <Image src={tour.image} alt={tour.name} w="full" h="full" objectFit="cover" transition="transform 0.5s ease-in-out" _hover={{ transform: 'scale(1.1)' }} />
                                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bgGradient="linear(to-t, blackAlpha.600 10%, transparent 60%)" />
                                    {tour.featured && (
                                        <Badge position="absolute" top={3} left={3} colorScheme="pink" variant="solid" px={3} py={1} borderRadius="md" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                                            Featured
                                        </Badge>
                                    )}
                                    <Flex position="absolute" bottom={3} right={3} bg={useColorModeValue("whiteAlpha.800", "blackAlpha.600")} backdropFilter="blur(5px)" px={2.5} py={1} borderRadius="lg" alignItems="center" boxShadow="md">
                                        <Icon as={StarIcon} color="yellow.400" boxSize={4} mr={1.5} />
                                        <Text fontWeight="bold" color={primaryTextColor} fontSize="sm">{tour.rating.toFixed(1)}</Text>
                                        <Text fontSize="xs" color={secondaryTextColor} ml={1}>({tour.reviews})</Text>
                                    </Flex>
                                </Box>
                                <Box p={5}>
                                    <HStack justify="space-between" mb={1.5}>
                                        <Text fontSize="sm" color={primaryColor} fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                                            {tour.location} • {categories.find(c => c.value === tour.category)?.icon} {tour.category}
                                        </Text>
                                        <Text fontSize="xs" color={secondaryTextColor}>{tour.duration}</Text>
                                    </HStack>
                                    <LinkOverlay href="#" onClick={(e) => { e.preventDefault(); navigate(`/tours/${tour.id}`); }}>
                                        <Heading size="md" color={primaryTextColor} fontWeight="bold" noOfLines={2} minH="3em" mb={2} _hover={{ color: primaryColor }} transition="color 0.2s">
                                            {tour.name}
                                        </Heading>
                                    </LinkOverlay>
                                    <Text color={secondaryTextColor} mb={4} fontSize="sm" lineHeight="1.55" noOfLines={3} minH="4.65em">
                                        {tour.description}
                                    </Text>
                                    <Flex justify="space-between" align="center" mt={3}>
                                        <Box>
                                            <Text fontWeight="black" color={primaryColor} fontSize="lg">{formatPrice(tour.price)}</Text>
                                            <Text fontSize="xs" color={secondaryTextColor}>per person</Text>
                                        </Box>
                                        <Button
                                            {...primaryButtonStyle} size="sm" h="40px" px={5}
                                            rightIcon={<ArrowForwardIcon />}
                                            onClick={() => navigate(`/tours/${tour.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </Flex>
                                </Box>
                            </LinkBox>
                        ))}
                    </SimpleGrid>
                )}
                
                
                {!loading && totalPages > 1 && (
                    <Flex justify="center" mt={12} animation={`${fadeIn} 0.5s ease-out 0.5s both`}>
                        <HStack spacing={3}>
                            <Button 
                                {...secondaryButtonStyle} 
                                size="sm" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                isDisabled={currentPage === 1}
                                leftIcon={<ArrowLeftIcon boxSize={3} />}
                            >
                                Previous
                            </Button>
                            
                            {/* Render Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button 
                                    key={page} 
                                    {...(currentPage === page ? primaryButtonStyle : secondaryButtonStyle)}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    isActive={currentPage === page}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button 
                                {...secondaryButtonStyle} 
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                isDisabled={currentPage === totalPages}
                                rightIcon={<ArrowForwardIcon boxSize={3} />}
                            >
                                Next
                            </Button>
                        </HStack>
                    </Flex>
                )}

            </Container>
        </Box>
    );
};

export default ViewAllTours;