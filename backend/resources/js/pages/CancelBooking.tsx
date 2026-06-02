import React from 'react';
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Textarea,
  useToast,
  FormControl,
  FormLabel,
  Divider,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FiCalendar, FiUser } from 'react-icons/fi';
// import { useNavigate, useParams } from 'react-router-dom';
import { Link, useForm } from '@inertiajs/react';
import GuideLayout from '../layouts/GuideLayout';

// --- DATA & FUNGSI SIMULASI ---
// Di aplikasi nyata, data ini akan diambil dari API
// const getBookingDetails = (bookingId: string) => {
//   const mockBookings = [
//     { bookingId: 'BK-001', touristName: 'Sarah Anderson', tourTitle: 'Jakarta Historical City Tour', date: 'July 15, 2025' },
//     { bookingId: 'BK-002', touristName: 'Michael Chen', tourTitle: 'Bali Highlands Cultural Trip', date: 'August 02, 2025' }
//   ];
//   return mockBookings.find(b => b.bookingId === bookingId);
// };

interface Guide{
  id: number;
  name: string;
}

interface User{
  id: number;
  name: string;
}

interface booking{
  id: number;
  booking_status: string;
  cancelation_reason: string;
}

interface TransactionTour{
  id: number;
  name: string;
  slug: string;
}

interface Transaction{
  id: number;
  user: User;
  guide: Guide;
  tour: TransactionTour;
  transaction_code: string;
  participant_count: number;
  tour_date: string;
  payment_status: string;
  total_amount: number;
  booking: booking;
}

interface Props{
  guide: Guide;
  transaction:Transaction;
}


// --- KOMPONEN UTAMA ---
export default function CancelBooking( {guide, transaction}:Props ){
  const toast = useToast();

  const { data, setData: setCancelationData, post, processing} = useForm({
    transactionID: transaction.id,
    bookingID: transaction.booking.id,
    Booking_status: transaction.booking.booking_status,
    guideID: guide.id,
    cancelation_reason: '',
  });

  const handlesubmit = (e: React.FormEvent) => {

    e.preventDefault();

    if (data.cancelation_reason.trim() === '') {
      toast({
        title: 'Please Provide Reason For Cancelation',
        description: 'Reason for Cancelation Cannot be Empty',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    post(route('guide.cancel.booking.submit'))
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const cancelMessageColor = useColorModeValue('gray.600', 'gray.400');
  const bookingInfoColor = useColorModeValue('gray.500', 'gray.400');

  if (!transaction) {
    return (
      <GuideLayout>
        <Heading>Booking Not Found</Heading>
        <Text>The requested booking could not be found.</Text>

        <Link href={route('guide.bookings')}>

          <Button mt={4} >Go Back to Bookings</Button>

        </Link>


      </GuideLayout>
    );
  }

  return (
    <GuideLayout>
      <Box maxW="container.md" mx="auto">
        <Heading as="h1" size="xl" mb={4}>
          Cancel Booking
        </Heading>
        <Text color={cancelMessageColor} mb={8}>
          You are about to cancel the booking for {transaction.user.name}. Please provide a reason for the cancellation.
        </Text>

        <VStack
          bg={cardBg}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          spacing={6}
          align="stretch"
        >
          <form onSubmit={handlesubmit}>

            <Box>
              <Heading size="md" mb={4}>{transaction.tour.name}</Heading>
              <HStack spacing={6} color={bookingInfoColor}>
                <HStack><Icon as={FiUser} /><Text>{transaction.user.name}</Text></HStack>
                <HStack><Icon as={FiCalendar} /><Text>{transaction.tour_date}</Text></HStack>
              </HStack>
            </Box>
            <Divider />
            <FormControl isRequired>
              <FormLabel htmlFor="cancellation-reason">Reason for Cancellation</FormLabel>
              <Textarea
                id="cancellation-reason"
                value={data.cancelation_reason}
                onChange={(e) => setCancelationData('cancelation_reason', e.target.value)}
                placeholder="e.g., Unexpected personal matter, tour slot is no longer available, etc."
                rows={5}
              />
            </FormControl>
            <HStack justify="flex-end" spacing={4} marginTop={3}>

              <Link href={route('guide.bookings')}>
                <Button variant="ghost">
                  Go Back
                </Button>            
              </Link>

              
              <Button colorScheme="red" type='submit' disabled = {processing}>
                {processing ? 'Processing...' : 'Confirm Cancellation'}
              </Button>
            </HStack>
            
          </form>

        </VStack>
      </Box>
    </GuideLayout>
  );
};