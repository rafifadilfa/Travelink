import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
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
  useToast,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiEye,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface TourRow {
    id: number;
    title: string;
    status: string;
    bookings: number;
    rating: number | null;
    price: number;
    is_open_trip: boolean;
}

const GuideTours: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const guideRaw   = localStorage.getItem('guide');
    const guide      = guideRaw ? JSON.parse(guideRaw) : null;
    const isVerified = guide?.verification_status === 'verified';

    useEffect(() => {
        if (!isVerified) navigate('/guide/dashboard');
    }, []);

    const [tours, setTours] = useState<TourRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [tourToDelete, setTourToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const cancelRef = useRef<HTMLButtonElement>(null);

    const cardBg = useColorModeValue('white', 'gray.800');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const fetchTours = async () => {
        try {
            const res = await guideApiClient.get('/guide/tours');
            setTours(res.data.tours);
        } catch {
            toast({ title: 'Gagal memuat tour', status: 'error', duration: 3000, isClosable: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTours(); }, []);

    const openDeleteDialog = (tourId: number) => {
        setTourToDelete(tourId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!tourToDelete) return;
        setIsDeleting(true);
        try {
            await guideApiClient.delete(`/guide/tours/${tourToDelete}`);
            setTours(prev => prev.filter(t => t.id !== tourToDelete));
            toast({ title: 'Tour berhasil dihapus', status: 'success', duration: 3000, isClosable: true });
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast({
                title: msg ?? 'Gagal menghapus tour',
                status: msg ? 'warning' : 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setTourToDelete(null);
        }
    };

    if (!isVerified) {
        return <Flex justify="center" align="center" h="60vh"><Spinner size="xl" color="blue.400" /></Flex>;
    }

    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondaryTextColor}>
                  <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/guide/dashboard')}>Dashboard</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage><BreadcrumbLink color="blue.500" fontWeight="medium">Paket Tour</BreadcrumbLink></BreadcrumbItem>
                </Breadcrumb>
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
                        onClick={() => navigate('/guide/tours/new')}
                    >
                        Create New Tour
                    </Button>
                </Flex>

                {loading ? (
                    <Flex justify="center" py={16}><Spinner size="xl" color="blue.400" /></Flex>
                ) : tours.length === 0 ? (
                    <Box textAlign="center" py={16}>
                        <Text color={secondaryTextColor} mb={4}>Belum ada tour. Mulai buat tour pertama Anda!</Text>
                        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => navigate('/guide/tours/new')}>
                            Buat Tour Baru
                        </Button>
                    </Box>
                ) : (
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
                                _hover={{ boxShadow: 'lg', transform: 'translateY(-3px)' }}
                            >
                                <VStack align="flex-start" flex={1} minW="250px">
                                    <Heading size="md">{tour.title}</Heading>
                                    <HStack>
                                        <Tag
                                            size="sm"
                                            variant="subtle"
                                            colorScheme={tour.status === 'published' ? 'green' : 'yellow'}
                                        >
                                            {tour.status === 'published' ? 'Published' : 'Draft'}
                                        </Tag>
                                        <Tag
                                            size="sm"
                                            variant="subtle"
                                            colorScheme={tour.is_open_trip ? 'purple' : 'gray'}
                                        >
                                            {tour.is_open_trip ? 'Smart Open Trip' : 'Regular Trip'}
                                        </Tag>
                                        <Text fontSize="sm" color={secondaryTextColor}>
                                            • {tour.bookings} bookings
                                        </Text>
                                        {tour.rating != null && (
                                            <Text fontSize="sm" color={secondaryTextColor}>
                                                • ⭐ {tour.rating}
                                            </Text>
                                        )}
                                    </HStack>
                                </VStack>
                                <Text fontWeight="bold" fontSize="lg" color="blue.500" mx={4}>
                                    Rp {tour.price.toLocaleString('id-ID')}
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
                )}
            </Box>

            <AlertDialog
                isOpen={isDeleteDialogOpen}
                leastDestructiveRef={cancelRef as any}
                onClose={() => setIsDeleteDialogOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Hapus Paket Wisata?
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Apakah Anda yakin ingin menghapus paket wisata ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={isDeleting}>
                                ya, Hapus
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </GuideLayout>
    );
};

export default GuideTours;
