import React, { useEffect } from 'react';
import {
  Box, Flex, Text, Heading, 
  useColorModeValue, VStack, HStack,
  Button, IconButton, Tag, useToast
} from '@chakra-ui/react';
import {
    FiPlus, FiEdit, FiEye, FiPower
} from 'react-icons/fi';
import GuideLayout from '../layouts/GuideLayout'; 
import { Link } from '@inertiajs/react';

// const initialGuideTours = [
//     {
//         id: 'tour-01',
//         title: 'Jakarta Historical City Tour',
//         status: 'Published',
//         bookings: 12,
//         rating: 4.8,
//         price: 'Rp 800.000'
//     },
//     {
//         id: 'tour-02',
//         title: 'Bali Highlands Cultural Trip',
//         status: 'Published',
//         bookings: 25,
//         rating: 4.9,
//         price: 'Rp 1.100.000'
//     },
//     {
//         id: 'tour-03',
//         title: 'Lombok Beach & Surfing Lessons',
//         status: 'Draft',
//         bookings: 0,
//         rating: null,
//         price: 'Rp 950.000'
//     }
// ];

interface FlashMessage {
  success?: string;
  error?: string;
}

interface Tour{
  id: number;
  name: string;
  tour_price: number;
  tour_status: string;
  tour_rating: number;
  transactions_count: number;
  deleted_at: string;
}
interface Props{
    tours: Tour[];
    flash: FlashMessage;
}


export default function GuideTours( {tours, flash}:Props ){
    
    const toast = useToast();

    const cardBg = useColorModeValue('white', 'gray.800');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
    if (flash.success) {
        toast({
            title: 'Success!',
            description: flash.success, // Use the message from the backend
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
        });
    }

    // You can do the same for errors
    if (flash.error) {
        toast({
            title: 'An Error Occurred',
            description: flash.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
        });
    }
    }, [flash, toast]);
    
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
                        as={Link}
                        leftIcon={<FiPlus />}
                        colorScheme="blue"
                        href={route('guide.create.tour.show')}
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
                                <Heading size="md">{tour.name}</Heading>
                                <HStack>
                                    {tour.tour_status === 'published' && (
                                        <Tag
                                            size="sm"
                                            variant="subtle"
                                            colorScheme={tour.tour_status === 'published' ? 'green' : 'yellow'}
                                        >
                                        {tour.tour_status}
                                        </Tag>
                                    )}

                                    {tour.tour_status === 'draft' && (
                                        <Tag
                                            size="sm"
                                            variant="subtle"
                                            colorScheme={tour.tour_status === 'draft' ? 'yellow' : 'red'}
                                        >
                                        {tour.tour_status}
                                        </Tag>
                                    )}                                    

                                    {tour.tour_status === 'disabled' && (
                                        <Tag
                                            size="sm"
                                            variant="subtle"
                                            colorScheme={tour.tour_status === 'disabled' ? 'red' : 'yellow'}
                                        >
                                        {tour.tour_status}
                                        </Tag>
                                    )}

                                    <Text fontSize="sm" color={secondaryTextColor}>
                                        • {tour.transactions_count} bookings
                                    </Text>
                                    <Text fontSize="sm" color={secondaryTextColor}>
                                        • ⭐ {tour.tour_rating.toFixed(1)}
                                    </Text>
                                </HStack>
                            </VStack>
                            <Text fontWeight="bold" fontSize="lg" color="blue.500" mx={4}>
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tour.tour_price)}
                            </Text>
                            <HStack spacing={2}>
                                <IconButton
                                    as={Link}
                                    href={route('guide.tour.details', { tour: tour.id })}
                                    
                                    icon={<FiEye />}
                                    aria-label="View Tour"
                                    variant="ghost"
                                />

                                <IconButton
                                    as={Link}
                                    href={route('guide.edit.tour.show', { tour: tour.id })}
                                    
                                    icon={<FiEdit />}
                                    aria-label="Edit Tour"
                                    variant="ghost"
                                    colorScheme="blue"
                                />
                                
                                {!tour.deleted_at && (

                                    <IconButton
                                        as={Link}
                                        href={route('guide.delete.tour', {tour: tour.id})} method="delete"
                                        onBefore={() => confirm('Are you sure you want to delete this tour?')}
                                        icon={<FiPower />}
                                        aria-label="Delete Tour"
                                        variant="ghost"
                                        colorScheme="red"
                                    />
                                )}

                                {tour.deleted_at && (

                                    <IconButton
                                        as={Link}
                                        href={route('guide.restore.tour', {tour: tour.id})} method="post"
                                        onBefore={() => confirm('Are you sure you want to restore this tour?')}
                                        icon={<FiPower />}
                                        aria-label="Restore Tour"
                                        variant="ghost"
                                        colorScheme="green"
                                    />
                                )}

                            </HStack>
                        </Flex>
                    ))}
                </VStack>
            </Box>

            {/* <AlertDialog
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
                            
                            <Link href={route('guide.delete.tour', {tour: tourToDelete})} method="delete"
                            onBefore={() => confirm('Are you sure you want to delete this tour?')}
                            >
                                <Button colorScheme="red" ml={3}>
                                    Delete
                                </Button>                            
                            </Link>
                        
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog> */}
        </GuideLayout>
    );    
};