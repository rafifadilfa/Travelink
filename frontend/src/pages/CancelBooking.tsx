import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Textarea,
  useToast,
  Spinner,
  FormControl,
  FormLabel,
  Divider,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';

// --- DATA & FUNGSI SIMULASI ---
// Di aplikasi nyata, data ini akan diambil dari API
const getBookingDetails = (bookingId: string) => {
  const mockBookings = [
    { bookingId: 'BK-001', touristName: 'Sarah Anderson', tourTitle: 'Jakarta Historical City Tour', date: 'July 15, 2025' },
    { bookingId: 'BK-002', touristName: 'Michael Chen', tourTitle: 'Bali Highlands Cultural Trip', date: 'August 02, 2025' }
  ];
  return mockBookings.find(b => b.bookingId === bookingId);
};

// --- KOMPONEN UTAMA ---
const CancelBooking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [booking, setBooking] = useState<{ touristName: string; tourTitle: string; date: string; } | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      // Simulasi pengambilan data
      setTimeout(() => {
        const details = getBookingDetails(bookingId);
        if (details) {
          setBooking(details);
        }
        setIsLoading(false);
      }, 500);
    }
  }, [bookingId]);

  const handleConfirmCancellation = () => {
    if (reason.trim() === '') {
      toast({
        title: 'Reason is required',
        description: 'Please provide a reason for cancellation.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    console.log(`Booking ${bookingId} cancelled. Reason: ${reason}`);

    toast({
      title: 'Booking Cancelled',
      description: 'The booking has been successfully cancelled.',
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
    navigate('/guide/bookings');
  };

  const cardBg = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return (
      <GuideLayout>
        <Flex justify="center" align="center" h="60vh"><Spinner size="xl" /></Flex>
      </GuideLayout>
    );
  }

  if (!booking) {
    return (
      <GuideLayout>
        <Heading>Booking Not Found</Heading>
        <Text>The requested booking could not be found.</Text>
        <Button mt={4} onClick={() => navigate('/guide/bookings')}>Go Back to Bookings</Button>
      </GuideLayout>
    );
  }

  return (
    <GuideLayout>
      <Box maxW="container.md" mx="auto">
        <Heading as="h1" size="xl" mb={4}>
          Cancel Booking
        </Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')} mb={8}>
          You are about to cancel the booking for {booking.touristName}. Please provide a reason for the cancellation.
        </Text>

        <VStack
          bg={cardBg}
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          spacing={6}
          align="stretch"
        >
          <Box>
            <Heading size="md" mb={4}>{booking.tourTitle}</Heading>
            <HStack spacing={6} color={useColorModeValue('gray.500', 'gray.400')}>
              <HStack><Icon as={FiUser} /><Text>{booking.touristName}</Text></HStack>
              <HStack><Icon as={FiCalendar} /><Text>{booking.date}</Text></HStack>
            </HStack>
          </Box>
          <Divider />
          <FormControl isRequired>
            <FormLabel htmlFor="cancellation-reason">Reason for Cancellation</FormLabel>
            <Textarea
              id="cancellation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Unexpected personal matter, tour slot is no longer available, etc."
              rows={5}
            />
          </FormControl>
          <HStack justify="flex-end" spacing={4}>
            <Button variant="ghost" onClick={() => navigate('/guide/bookings')}>
              Go Back
            </Button>
            <Button colorScheme="red" onClick={handleConfirmCancellation}>
              Confirm Cancellation
            </Button>
          </HStack>
        </VStack>
      </Box>
    </GuideLayout>
  );
};

export default CancelBooking;