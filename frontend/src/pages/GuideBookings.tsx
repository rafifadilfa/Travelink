import React, { useState } from 'react'; // Impor useState
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  Tag,
  Divider,
  useToast // Impor useToast
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout'; 

// Data awal, kita ubah namanya agar jelas ini adalah data inisial
const initialGuideBookingsData = [
    { bookingId: 'BK-001', tourist: { name: 'Sarah Anderson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Jakarta Historical City Tour', date: 'July 15, 2025', time: '09:00 AM', guests: 2, totalPrice: 'Rp 1.600.000', status: 'Pending' },
    { bookingId: 'BK-002', tourist: { name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Bali Highlands Cultural Trip', date: 'August 02, 2025', time: '10:30 AM', guests: 4, totalPrice: 'Rp 4.400.000', status: 'Confirmed' },
    { bookingId: 'BK-003', tourist: { name: 'Emily Rodriguez', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Lombok Beach & Surfing Lessons', date: 'June 25, 2025', time: '08:00 AM', guests: 1, totalPrice: 'Rp 950.000', status: 'Completed' },
    { bookingId: 'BK-004', tourist: { name: 'David Lee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Jakarta Historical City Tour', date: 'May 10, 2025', time: '10:00 AM', guests: 3, totalPrice: 'Rp 2.400.000', status: 'Cancelled' },
];

const StatusTag = ({ status }: { status: string }) => {
    const colorScheme = { Pending: 'yellow', Confirmed: 'green', Completed: 'blue', Cancelled: 'red' }[status] || 'gray';
    return <Tag size="md" variant="subtle" colorScheme={colorScheme}>{status}</Tag>;
};

// Komponen Card diubah untuk menerima fungsi onConfirm
const BookingCard = ({ booking, onConfirm }: { booking: typeof initialGuideBookingsData[0], onConfirm: (id: string) => void }) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const navigate = useNavigate();

    return (
        <Box bg={cardBg} borderRadius="lg" boxShadow="md" border="1px solid" borderColor={borderColor} p={5} transition="all 0.3s" _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}>
            <VStack spacing={4} align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                    <HStack>
                        <Avatar name={booking.tourist.name} src={booking.tourist.avatar} size="md" />
                        <Box>
                            <Text fontWeight="bold" fontSize="lg">{booking.tourist.name}</Text>
                            <Text fontSize="sm" color="gray.500">Booking ID: {booking.bookingId}</Text>
                        </Box>
                    </HStack>
                    <StatusTag status={booking.status} />
                </Flex>
                <Divider />
                <Box>
                    <Heading size="sm" mb={2}>{booking.tourTitle}</Heading>
                    <HStack spacing={6} color={useColorModeValue('gray.600', 'gray.400')}>
                        <HStack><Icon as={FiCalendar} /><Text fontSize="sm">{booking.date}</Text></HStack>
                        <HStack><Icon as={FiClock} /><Text fontSize="sm">{booking.time}</Text></HStack>
                        <HStack><Icon as={FiUsers} /><Text fontSize="sm">{booking.guests} Guest(s)</Text></HStack>
                    </HStack>
                </Box>
                <Divider />
                <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                        <Text fontSize="sm" color="gray.500">Total Payment</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">{booking.totalPrice}</Text>
                    </Box>
                    <HStack>
                        {booking.status === 'Pending' && (
                            // Tombol Confirm sekarang memanggil fungsi onConfirm
                            <Button colorScheme="green" size="sm" leftIcon={<FiCheckCircle />} onClick={() => onConfirm(booking.bookingId)}>
                                Confirm Booking
                            </Button>
                        )}
                        {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                            <Button variant="outline" colorScheme="red" size="sm" leftIcon={<FiXCircle />} onClick={() => navigate(`/guide/bookings/cancel/${booking.bookingId}`)}>
                                Cancel Booking
                            </Button>
                        )}
                    </HStack>
                </Flex>
            </VStack>
        </Box>
    );
};

const GuideBookings: React.FC = () => {
    const toast = useToast();
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    
    // STATE BARU untuk menyimpan dan memanipulasi data booking
    const [bookings, setBookings] = useState(initialGuideBookingsData);

    // FUNGSI BARU UNTUK KONFIRMASI BOOKING
    const handleConfirmBooking = (bookingId: string) => {
        setBookings(currentBookings =>
            currentBookings.map(booking => {
                if (booking.bookingId === bookingId) {
                    return { ...booking, status: 'Confirmed' }; // Ubah statusnya
                }
                return booking;
            })
        );
        toast({
            title: "Booking Confirmed!",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    // Filter data berdasarkan state `bookings` yang terbaru
    const upcomingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed');
    const pastBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Flex justifyContent="space-between" alignItems="center" mb={8}>
                    <Box>
                        <Heading as="h1" size="xl">Client Bookings</Heading>
                        <Text color={secondaryTextColor} mt={1}>Review and manage all tour bookings from your clients.</Text>
                    </Box>
                </Flex>
                <Tabs variant="soft-rounded" colorScheme="blue">
                    <TabList>
                        <Tab>Upcoming ({upcomingBookings.length})</Tab>
                        <Tab>Past ({pastBookings.length})</Tab>
                    </TabList>
                    <TabPanels mt={6}>
                        <TabPanel p={0}>
                            <VStack spacing={5} align="stretch">
                                {upcomingBookings.length > 0 ? (
                                    // Gunakan state `bookings` dan kirim fungsi sebagai prop
                                    upcomingBookings.map(booking => <BookingCard key={booking.bookingId} booking={booking} onConfirm={handleConfirmBooking} />)
                                ) : (<Text p={10} textAlign="center" color={secondaryTextColor}>No upcoming bookings found.</Text>)}
                            </VStack>
                        </TabPanel>
                        <TabPanel p={0}>
                             <VStack spacing={5} align="stretch">
                                {pastBookings.length > 0 ? (
                                    pastBookings.map(booking => <BookingCard key={booking.bookingId} booking={booking} onConfirm={handleConfirmBooking} />)
                                ) : (<Text p={10} textAlign="center" color={secondaryTextColor}>No past bookings found.</Text>)}
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </GuideLayout>
    );
};

export default GuideBookings;