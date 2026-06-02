import React, { useState, FormEvent} from 'react';
import {
  Box, Flex, Text, Button, Heading, Container, Grid,
  useColorModeValue, Icon, VStack, HStack, Divider
} from '@chakra-ui/react';
import {
  ArrowBackIcon, CheckCircleIcon, CalendarIcon, TimeIcon, InfoOutlineIcon
} from '@chakra-ui/icons';
import { Link, useForm } from '@inertiajs/react';

interface User{
  id: number;
  name: string;
  profile_photo_path: string;
}

interface TransactionTour{
  id: number;
  name: string;
  tour_start_time: string;
}

interface Transaction{
  id: number;
  transaction_code: string;
  tour: TransactionTour;
  participant_count: number;
  price_per_participant: number;
  tour_date: string;
  total_amount: number;
}

interface PaymentMethods{
  id: number;
  name: string;
}

interface Props{
  user : User;
  transaction: Transaction;
  payment_methods: PaymentMethods[];
}

export default function Payment({ transaction, payment_methods }: Props){

  const [selectedMethod, setSelectedMethod] = useState('Credit Card');
  const [paymentMethodId, setPaymentMethodId] = useState(1);
  
  const overallBg = useColorModeValue('blue.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const successColor = useColorModeValue('green.500', 'green.400');
  const successHoverColor = useColorModeValue('green.600', 'green.500');
  const primaryTextColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
  const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${primaryColor})`;
  const selectedMethodBg = useColorModeValue('blue.50', 'blue.800');

  const baseButtonStyle = {
    borderRadius: "lg", fontWeight: "semibold", h: "44px",
    px: 5, fontSize: "sm",
    transition: "all 0.25s cubic-bezier(.08,.52,.52,1)",
    _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
    _focus: { boxShadow: `0 0 0 3px ${useColorModeValue('blue.200', 'blue.700')}` }
  };

  const primaryGradientButtonStyle = {
    ...baseButtonStyle,
    bgGradient: `linear(to-r, ${successColor}, ${useColorModeValue('green.400', 'green.300')})`,
    color: 'white',
    boxShadow: "md",
    fontSize: { base: "md", md: "lg"},
    h: {base: "48px", md: "52px"},
    px: 6,
    _hover: {
      bgGradient: `linear(to-r, ${successHoverColor}, ${useColorModeValue('green.500', 'green.400')})`,
      transform: 'translateY(-2px) scale(1.02)', boxShadow: 'lg'
    },
  };

  
  const secondaryButtonStyle = {
    ...baseButtonStyle, bg: 'transparent', color: primaryColor,
    border: "2px solid", borderColor: primaryColor,
    _hover: {
      bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'), borderColor: primaryHoverColor,
      color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const {setData, post, processing} = useForm({
    transaction_id: transaction.id,
    payment_method_id: paymentMethodId,
  });

  const handlePaymentMethodChange = (method: PaymentMethods) => {
      // Use setData to update the form's state. This is the key change.
      setPaymentMethodId(method.id)
      setData('payment_method_id', method.id);
      setSelectedMethod(method.name);
  };

  const ConfirmPayment = (e: FormEvent) => {
      e.preventDefault();
      post(route('transaction.update'));
  };

  const PaymentMethodIcons = (name?: string): string => {
    switch(name){
      case 'Credit Card':
        return '💳';
      
      case 'Debit Card':
        return '💳';

      case 'Qris':
        return '📱';

      case 'PayPal':
        return '📱';

      case 'Bank Transfer':
        return '💸';
      
      case 'Cash on Arrival':
        return '💸'
      
      default:
        return '💳';
    }
  };

  return (
    <Box minH="100vh" bg={overallBg}>
      <Box 
        bg={glassBg} 
        backdropFilter="blur(18px)" 
        boxShadow="md" 
        position="sticky" 
        top={0} 
        zIndex={1000} 
        borderBottom="1px solid" 
        borderColor={subtleBorderColor}
      >
        <Container maxW="container.xl">
          <Flex h="68px" justify="space-between" align="center">
            <Flex h="68px" justify="space-between" align="center">

              <Link href='/dashboard'>
                  <Flex align="center" gap={2.5} cursor="pointer">
                  <Flex
                      alignItems="center" justifyContent="center"
                      boxSize="40px" borderRadius="lg"
                      bgGradient={accentGradient}
                      boxShadow="lg" transition="all 0.3s ease"
                      _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}
                  >
                      <Text fontSize="xl" color="white" fontWeight="bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>✈</Text>
                  </Flex>
                  <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold" fontFamily="'Inter', sans-serif">
                      Travelink
                  </Heading>
                  </Flex>     
              </Link>
          </Flex>

            <Button 
              {...secondaryButtonStyle} 
              size="sm" 
              onClick={() => window.history.back()}
              leftIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            

          </Flex>
        </Container>
      </Box>

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Heading 
            as="h1" 
            size={{ base: "lg", md: "xl" }}
            fontWeight="bold" 
            color={primaryTextColor}
            borderBottom="2px solid"
            borderColor={subtleBorderColor}
            pb={3}
            textAlign="center"
          >
            Complete Your Payment
          </Heading>

          {/* Start */}
          <form onSubmit={ConfirmPayment}>  
            <Box 
              bg={cardBg} 
              p={{ base: 5, md: 8 }} 
              borderRadius="xl" 
              boxShadow="xl"
              border="1px solid"
              borderColor={subtleBorderColor}
            >
              <Heading 
                as="h2" 
                size={{ base: "md", md: "lg"}} 
                fontWeight="bold" 
                mb={6}
                color={primaryColor}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Text as="span" fontSize="2xl">💳</Text>
                Select Payment Method
              </Heading>
              
              <Grid 
                templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} 
                gap={5}
              >
                {payment_methods.map((method) => (
                  <Flex
                    key={method.id}
                    border="2px solid"
                    borderColor={method.name === selectedMethod ? primaryColor : subtleBorderColor}
                    borderRadius="lg"
                    p={5}
                    cursor="pointer"
                    bg={method.name === selectedMethod ? selectedMethodBg : cardBg}
                    alignItems="center"
                    gap={4}
                    transition="all 0.2s ease"
                    boxShadow={method.name === selectedMethod ? "lg" : "md"}
                    _hover={{ 
                      boxShadow: "xl", 
                      transform: "translateY(-3px)",
                      borderColor: primaryColor
                    }}
                    onClick={() => handlePaymentMethodChange(method)}
                    // onClick={() => setSelectedMethod(method.name)}
                  >
                    <Box 
                      w="24px" h="24px" borderRadius="full" 
                      border="2px solid" 
                      borderColor={method.name === selectedMethod ? primaryColor : secondaryTextColor}
                      display="flex" alignItems="center" justifyContent="center"
                      flexShrink={0}
                    >
                      {method.name === selectedMethod && (
                        <Box w="12px" h="12px" borderRadius="full" bg={primaryColor}></Box>
                      )}
                    </Box>
                    <Text fontSize={{ base: "2xl", md: "3xl"}}>{PaymentMethodIcons(method.name)}</Text>
                    <Text 
                      fontWeight={method.name === selectedMethod ? "bold" : "medium"}
                      color={method.name === selectedMethod ? primaryColor : primaryTextColor}
                      fontSize={{ base: "sm", md: "md"}}
                    >
                      {method.name}
                    </Text>
                  </Flex>
                ))}
              </Grid>
            </Box>

            <Box 
              bg={cardBg} 
              p={{ base: 5, md: 8 }} 
              borderRadius="xl" 
              boxShadow="xl"
              border="1px solid"
              borderColor={subtleBorderColor}
            >
              <Heading 
                as="h2" 
                size={{ base: "md", md: "lg"}}
                fontWeight="bold" 
                mb={6}
                color={primaryColor}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Text as="span" fontSize="2xl">🧾</Text>
                Order Summary
              </Heading>
              
              <Box
                bg={useColorModeValue('gray.50', 'gray.750')}
                p={{ base: 4, md: 6 }}
                borderRadius="lg"
                border="1px solid"
                borderColor={subtleBorderColor}
                mb={6}
                boxShadow="sm"
              >
                <VStack spacing={4} align="stretch">
                  <Heading 
                    size="md" 
                    color={primaryTextColor} 
                    pb={3}
                    mb={2}
                    borderBottom="1px dashed"
                    borderColor={subtleBorderColor}
                  >
                    {transaction.tour.name}
                  </Heading>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryTextColor}>
                      <Icon as={CalendarIcon} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Date:</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{transaction.tour_date}</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryTextColor}>
                      <Icon as={TimeIcon} boxSize={5} />
                      <Text fontSize="md" fontWeight="medium">Time:</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{transaction.tour.tour_start_time}</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryTextColor}>
                      <Icon as={InfoOutlineIcon} boxSize={5} /> 
                      <Text fontSize="md" fontWeight="medium">Guests:</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{transaction.participant_count} person(s)</Text>
                  </HStack>

                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack spacing={3} color={secondaryTextColor}>
                      <Text fontSize="xl" lineHeight="1" color={primaryColor}>💲</Text>
                      <Text fontSize="md" fontWeight="medium">Price per person:</Text>
                    </HStack>
                    <Text fontSize="md" color={primaryTextColor} fontWeight="semibold">{formatPrice(transaction.price_per_participant)}</Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Divider my={6} borderColor={subtleBorderColor}/>
              
              <Flex 
                justifyContent="space-between" 
                alignItems="center"
                fontWeight="bold" 
                mb={8}
                p={{ base: 4, md: 5}}
                bg={useColorModeValue('blue.100', 'blue.900')} 
                borderRadius="lg"
                border="1px solid"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
              >
                <Text color={primaryTextColor} fontSize={{ base: "md", md: "lg"}}>
                  Total Amount Due:
                </Text>
                <Text color={primaryColor} fontSize={{ base: "xl", md: "2xl"}} fontWeight="extrabold">
                  {formatPrice(transaction.total_amount)}
                </Text>
              </Flex>
              
              <Button 
                {...primaryGradientButtonStyle}
                type='submit'
                w="100%"
                leftIcon={<CheckCircleIcon boxSize={5}/>}
                disabled = {processing}
                >
                {processing ? 'Processing...' : 'Pay Now'}
              </Button>
              
              <Text 
                fontSize="xs" 
                color={secondaryTextColor} 
                textAlign="center" 
                mt={6}
                bg={useColorModeValue('gray.100', 'gray.750')}
                p={3}
                borderRadius="md"
              >
                By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy.
                Payment will be processed securely.
              </Text>
            </Box>
          </form>
        </VStack>
      </Container>
      
      <Box 
        bg={cardBg} 
        py={6}
        px={{ base: 4, md: 8}} 
        borderTop="1px solid" 
        borderColor={subtleBorderColor}
        mt={10}
      >
        <Text textAlign="center" color={secondaryTextColor} fontSize="sm">
          © {new Date().getFullYear()} Travelink. All rights reserved. Secure Payment Gateway.
        </Text>
      </Box>
    </Box>
  );
}