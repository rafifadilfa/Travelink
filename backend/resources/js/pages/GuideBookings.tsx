import { useEffect } from 'react'; // Impor useState
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
  useToast,
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiUsers } from 'react-icons/fi';
import GuideLayout from '../layouts/GuideLayout';
import { Link, router } from '@inertiajs/react';

interface User{
  id: number;
  name: string;
  profile_photo_path: string | null;
}

interface Guide{
  id: number;
  name: string;
}

interface TourLocation{
  id: number;
  name: string;
}

interface TourMeetingPoint{
  id: number;
  name: string;
}

interface booking{
  id: number;
  booking_status: string;
  tour_reviewed: boolean;
  guide_reviewed: boolean;
  cancelation_reason: string;
}

interface TransactionTour{
  id: number;
  name: string;
  location: TourLocation;
  meeting_point: TourMeetingPoint | null;
  tour_price: number;
  tour_duration: number;
  tour_start_time: string;
  slug: string;
}

interface Transactions{
  id: number;
  user: User;
  guide: Guide;
  tour: TransactionTour;
  transaction_code: string;
  participant_count: number;
  price_per_participant: number;
  tour_date: string;
  payment_status: string;
  total_amount: number;
  booking: booking;
}

interface FlashMessage {
  success?: string;
  error?: string;
}

interface Props{
    transactions:Transactions[];
    flash: FlashMessage;

}

// Data awal, kita ubah namanya agar jelas ini adalah data inisial
// const initialGuideBookingsData = [
//     { bookingId: 'BK-001', tourist: { name: 'Sarah Anderson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Jakarta Historical City Tour', date: 'July 15, 2025', time: '09:00 AM', guests: 2, totalPrice: 'Rp 1.600.000', status: 'Pending' },
//     { bookingId: 'BK-002', tourist: { name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Bali Highlands Cultural Trip', date: 'August 02, 2025', time: '10:30 AM', guests: 4, totalPrice: 'Rp 4.400.000', status: 'Confirmed' },
//     { bookingId: 'BK-003', tourist: { name: 'Emily Rodriguez', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Lombok Beach & Surfing Lessons', date: 'June 25, 2025', time: '08:00 AM', guests: 1, totalPrice: 'Rp 950.000', status: 'Completed' },
//     { bookingId: 'BK-004', tourist: { name: 'David Lee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=60' }, tourTitle: 'Jakarta Historical City Tour', date: 'May 10, 2025', time: '10:00 AM', guests: 3, totalPrice: 'Rp 2.400.000', status: 'Cancelled' },
// ];

const StatusTag = ({ status }: { status: string }) => {
    const colorScheme = { pending: 'yellow', confirmed: 'green', completed: 'blue', cancelled: 'red' }[status] || 'gray';
    return <Tag size="md" variant="subtle" colorScheme={colorScheme}>{status}</Tag>;
};

// Komponen Card diubah untuk menerima fungsi onConfirm
const BookingCard = ({ transaction, onConfirm }: { transaction: Transactions, onConfirm: (transaction: Transactions) => void }) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box bg={cardBg} borderRadius="lg" boxShadow="md" border="1px solid" borderColor={borderColor} p={5} transition="all 0.3s" _hover={{ boxShadow: 'lg', transform: 'translateY(-4px)' }}>
            <VStack spacing={4} align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                    <HStack>
                        <Avatar name={transaction.user.name} src={transaction.user.profile_photo_path ? `/storage/${transaction.user.profile_photo_path}` : `https://ui-avatars.com/api/?name=${transaction.user.name}`} size="md" />
                        <Box>
                            <Text fontWeight="bold" fontSize="lg">{transaction.user.name}</Text>
                            <Text fontSize="sm" color="gray.500">Transaction Code: {transaction.transaction_code}</Text>
                        </Box>
                    </HStack>
                    <StatusTag status={transaction.booking.booking_status} />
                </Flex>
                <Divider />
                <Box>
                    <Heading size="sm" mb={2}>{transaction.tour.name}</Heading>
                    <HStack spacing={6} color={useColorModeValue('gray.600', 'gray.400')}>
                        <HStack><Icon as={FiCalendar} /><Text fontSize="sm">{transaction.tour_date}</Text></HStack>
                        <HStack><Icon as={FiClock} /><Text fontSize="sm">{transaction.tour.tour_start_time}</Text></HStack>
                        <HStack><Icon as={FiUsers} /><Text fontSize="sm">{transaction.participant_count} Guest(s)</Text></HStack>
                    </HStack>
                </Box>
                <Divider />
                <Flex justifyContent="space-between" alignItems="center">
                    <Box>

                        <Text fontSize="sm" color="gray.500">Total Payment</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.500">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(transaction.total_amount)}
                        </Text>

                    </Box>
                    <HStack>
                        {(transaction.booking.booking_status === 'pending' && transaction.payment_status === 'paid') && (
                            // Tombol Confirm sekarang memanggil fungsi onConfirm
                            <Button colorScheme="green" size="sm" leftIcon={<FiCheckCircle />} onClick={() => onConfirm(transaction)}>
                                Confirm Booking
                            </Button>
                        )}
                        {((transaction.booking.booking_status === 'pending' || transaction.booking.booking_status === 'confirmed') && transaction.payment_status === 'paid') && (
                            
                            <Link href={route('guide.cancel.booking.show', {transaction: transaction.id})}>
                                <Button variant="outline" colorScheme="red" size="sm" leftIcon={<FiXCircle />}>
                                    Cancel Booking
                                </Button>                            
                            </Link>

                        )}

                        {transaction.booking.booking_status === 'canceled' &&(
                            <text>
                                Cancelation Reason: {transaction.booking.cancelation_reason}
                            </text>
                        )}



                        {(transaction.payment_status === 'unpaid') && transaction.booking.booking_status !== 'canceled' && (
                            <text>
                                User has not paid the booking
                            </text>
                        )}


                    </HStack>
                </Flex>
            </VStack>
        </Box>
    );
};

export default function GuideBookings( {transactions, flash}: Props ){

    // Get today date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Split transaction record by date
    const upcomingBookings = transactions.filter(t => new Date(t.tour_date) >= today && t.booking.booking_status != "canceled");
    const pastBookings = transactions.filter(t => new Date(t.tour_date) < today && t.booking.booking_status != "canceled");
    const canceledBookings = transactions.filter(t => t.booking.booking_status == "canceled");

    const toast = useToast();
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');

    useEffect(() => {
    // If a success message exists in the props, show the toast
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
    
    const handleConfirmBooking = (transaction: Transactions) => {
        const url = route('guide.booking.status.update', { booking: transaction.booking.id });

        const payload = {
            transaction_id: transaction.id,
        };

        router.patch(url, payload, {
            onSuccess: () => {
                toast({
                    title: "Booking Confirmed!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Could not confirm the booking.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        });
    };

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
                        <Tab>Canceled ({canceledBookings.length})</Tab>
                    </TabList>
                    <TabPanels mt={6}>
                        <TabPanel p={0}>
                            <VStack spacing={5} align="stretch">
                                {upcomingBookings.length > 0 ? (
                                    // Gunakan state `bookings` dan kirim fungsi sebagai prop
                                    upcomingBookings.map(booking => <BookingCard key={booking.id} transaction={booking} onConfirm={handleConfirmBooking} />)
                                ) : (<Text p={10} textAlign="center" color={secondaryTextColor}>No upcoming bookings found.</Text>)}
                            </VStack>
                        </TabPanel>
                        <TabPanel p={0}>
                             <VStack spacing={5} align="stretch">
                                {pastBookings.length > 0 ? (
                                    pastBookings.map(booking => <BookingCard key={booking.id} transaction={booking} onConfirm={handleConfirmBooking} />)
                                ) : (<Text p={10} textAlign="center" color={secondaryTextColor}>No past bookings found.</Text>)}
                            </VStack>
                        </TabPanel>
                        <TabPanel p={0}>
                             <VStack spacing={5} align="stretch">
                                {canceledBookings.length > 0 ? (
                                    canceledBookings.map(booking => <BookingCard key={booking.id} transaction={booking} onConfirm={handleConfirmBooking} />)
                                ) : (<Text p={10} textAlign="center" color={secondaryTextColor}>No Canceled bookings found.</Text>)}
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </GuideLayout>
    );
};