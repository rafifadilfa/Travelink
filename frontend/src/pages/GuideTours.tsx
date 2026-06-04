import React, { useState, useRef } from 'react'; // Impor 'useRef' dari react
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Button,
  IconButton,
  Tag,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast
} from '@chakra-ui/react';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiEye
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout'; 

const initialGuideTours = [
    {
        id: 'tour-01',
        title: 'Jakarta Historical City Tour',
        status: 'Published',
        bookings: 12,
        rating: 4.8,
        price: 'Rp 800.000'
    },
    {
        id: 'tour-02',
        title: 'Bali Highlands Cultural Trip',
        status: 'Published',
        bookings: 25,
        rating: 4.9,
        price: 'Rp 1.100.000'
    },
    {
        id: 'tour-03',
        title: 'Lombok Beach & Surfing Lessons',
        status: 'Draft',
        bookings: 0,
        rating: null,
        price: 'Rp 950.000'
    }
];

const GuideTours: React.FC = () => {
    const navigate = useNavigate(); 
    const toast = useToast();
    
    const [tours, setTours] = useState(initialGuideTours);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [tourToDelete, setTourToDelete] = useState<string | null>(null);
    
    // PERBAIKAN FINAL DI SINI
    const cancelRef = useRef<HTMLButtonElement>(null);

    const cardBg = useColorModeValue('white', 'gray.800');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleCreateTour = () => {
        navigate('/guide/tours/new');
    }

    const openDeleteDialog = (tourId: string) => {
        setTourToDelete(tourId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (tourToDelete) {
            setTours(currentTours => currentTours.filter(tour => tour.id !== tourToDelete));
            toast({
                title: 'Tour Deleted',
                description: 'The tour has been successfully removed.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
        setIsDeleteDialogOpen(false);
        setTourToDelete(null);
    };
    
    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={8}
                    direction={{ base: 'column', md: 'row' }}
                    gap={4}
                >
                    <Box>
                        <Heading as="h1" size="xl">My Tours</Heading>
                        <Text color={secondaryTextColor} mt={1}>
                            Manage, edit, and create your tour listings.
                        </Text>
                    </Box>
                    <Button
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        onClick={handleCreateTour} 
                    >
                        Create New Tour
                    </Button>
                </Flex>

                <VStack spacing={5} align="stretch">
                    {tours.map((tour) => (
                        <Flex
                            key={tour.id}
                            p={5}
                            bg={cardBg}
                            borderRadius="lg"
                            boxShadow="md"
                            border="1px solid"
                            borderColor={borderColor}
                            alignItems="center"
                            flexWrap="wrap"
                            gap={4}
                            transition="all 0.2s"
                            _hover={{boxShadow: 'lg', transform: 'translateY(-3px)'}}
                        >
                            <VStack align="flex-start" flex={1} minW="250px">
                                <Heading size="md">{tour.title}</Heading>
                                <HStack>
                                    <Tag
                                        size="sm"
                                        variant="subtle"
                                        colorScheme={tour.status === 'Published' ? 'green' : 'yellow'}
                                    >
                                        {tour.status}
                                    </Tag>
                                    <Text fontSize="sm" color={secondaryTextColor}>
                                        • {tour.bookings} bookings
                                    </Text>
                                    {tour.rating && (
                                        <Text fontSize="sm" color={secondaryTextColor}>
                                            • ⭐ {tour.rating}
                                        </Text>
                                    )}
                                </HStack>
                            </VStack>
                            <Text fontWeight="bold" fontSize="lg" color="blue.500" mx={4}>
                                {tour.price}
                            </Text>
                            <HStack spacing={2}>
                                <IconButton
                                    icon={<FiEye />}
                                    aria-label="View Tour"
                                    variant="ghost"
                                    onClick={() => navigate(`/tours/${tour.id}`)}
                                />
                                <IconButton
                                    icon={<FiEdit />}
                                    aria-label="Edit Tour"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => navigate(`/guide/tours/edit/${tour.id}`)}
                                />
                                <IconButton
                                    icon={<FiTrash2 />}
                                    aria-label="Delete Tour"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => openDeleteDialog(tour.id)}
                                />
                            </HStack>
                        </Flex>
                    ))}
                </VStack>
            </Box>

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                leastDestructiveRef={cancelRef as any}
                onClose={() => setIsDeleteDialogOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Tour
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this tour? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </GuideLayout>
    );
};

export default GuideTours;