import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  useToast,
  Link as ChakraLink,
  Icon,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiTrendingUp, FiCalendar, FiHeart } from 'react-icons/fi';

// Komponen kecil untuk menampilkan poin keuntungan
const BenefitItem = ({ icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
  <HStack align="start" spacing={4}>
    <Icon as={icon} boxSize={8} color="cyan.300" mt={1} />
    <Box>
      <Text fontWeight="bold" color="white" fontSize="lg">{title}</Text>
      <Text fontSize="md" color="whiteAlpha.800">{children}</Text>
    </Box>
  </HStack>
);

const GuideAuth: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Login Successful',
      description: "Welcome back, Guide!",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/guide/dashboard');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Account Created',
      description: "Your guide account has been created. Please sign in.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setActiveTab(0);
  };

  const formBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('gray.100', 'gray.800');
  const tabBorderColor = useColorModeValue('gray.200', 'gray.600');
  const tabSelectedColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Kolom Kiri: Visual & Motivasi */}
      <Flex
        w={{ base: 'full', md: '55%' }}
        pos="relative"
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
        justifyContent="center"
      >
        {/* Gambar Background dari Aset Lokal */}
        <Box
            pos="absolute"
            top="0" left="0" right="0" bottom="0"
            bgImage="url('/images/guide-auth-bg.jpg')" // <-- PERUBAHAN DI SINI
            bgSize="cover"
            bgPosition="center"
        />
        {/* Overlay Gelap */}
        <Box
            pos="absolute"
            top="0" left="0" right="0" bottom="0"
            bg="blackAlpha.700"
        />
        
        {/* Konten Teks di atas overlay */}
        <VStack spacing={10} p={{ base: 8, md: 16 }} zIndex={1} maxW="container.sm">
           <Box textAlign="center">
              <Heading size="2xl" fontWeight="bold" color="white" textShadow="0 2px 4px rgba(0,0,0,0.5)">
                Become a Guide, Create Experiences.
              </Heading>
              <Text fontSize="lg" mt={4} color="whiteAlpha.900" textShadow="0 1px 3px rgba(0,0,0,0.5)">
                Join the best community of local guides in Indonesia and start sharing the beauty of your region with the world.
              </Text>
           </Box>

          <VStack spacing={8} align="start" w="full">
            <BenefitItem icon={FiTrendingUp} title="Earn Extra Income">
              Turn your local knowledge and expertise into a promising source of income.
            </BenefitItem>
            <BenefitItem icon={FiCalendar} title="Flexible Schedule">
              You decide when and how often you want to lead a tour.
            </BenefitItem>
            <BenefitItem icon={FiHeart} title="Share Your Passion">
              Do what you love and meet new people from all over the world.
            </BenefitItem>
          </VStack>
        </VStack>
      </Flex>

      {/* Kolom Kanan: Formulir */}
      <Flex
        w={{ base: 'full', md: '45%' }}
        align="center"
        justify="center"
        p={{ base: 6, sm: 8, lg: 12 }}
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <Box w="full" maxW="md">
          <VStack spacing={2} textAlign="center" mb={10}>
             <Heading cursor="pointer" onClick={() => navigate('/')} display="flex" alignItems="center" gap={2}>
                 <Icon as={() => <Text fontSize="3xl">✈️</Text>}/>
                 <Text>Travelink</Text>
             </Heading>
            <Heading fontSize="2xl" fontWeight="bold">Guide Portal</Heading>
            <Text fontSize="md" color={textColor}>
              Access your dashboard or create a new account.
            </Text>
          </VStack>

          <Box bg={formBg} boxShadow="lg" rounded="xl" p={{base:6, md:8}}>
            <Tabs variant="line" colorScheme="blue" index={activeTab} onChange={(index) => setActiveTab(index)} isFitted>
              <TabList borderBottomColor={tabBorderColor}>
                <Tab
                  fontWeight="semibold"
                  _selected={{ color: tabSelectedColor, borderColor: tabSelectedColor }}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.800') }}
                >
                  Sign In
                </Tab>
                <Tab
                  fontWeight="semibold"
                  _selected={{ color: tabSelectedColor, borderColor: tabSelectedColor }}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.800') }}
                >
                  Sign Up
                </Tab>
              </TabList>
              <TabPanels pt={8}>
                {/* Sign In Panel */}
                <TabPanel p={0}>
                  <form onSubmit={handleLogin}>
                    <VStack spacing={5}>
                      <FormControl id="guide-email-login">
                        <FormLabel>Email address</FormLabel>
                        <Input bg={inputBg} type="email" placeholder="youremail@example.com" size="lg" focusBorderColor='blue.400' />
                      </FormControl>
                      <FormControl id="guide-password-login">
                        <FormLabel>Password</FormLabel>
                        <InputGroup size="lg">
                          <Input bg={inputBg} type={showPassword ? 'text' : 'password'} placeholder="••••••••" focusBorderColor='blue.400'/>
                          <InputRightElement>
                            <IconButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              icon={showPassword ? <FiEyeOff /> : <FiEye />}
                              onClick={() => setShowPassword(!showPassword)}
                              variant="ghost"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      <Button colorScheme="blue" w="full" type="submit" size="lg" mt={3}>
                        Sign In
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>

                {/* Sign Up Panel */}
                <TabPanel p={0}>
                  <form onSubmit={handleSignUp}>
                    <VStack spacing={5}>
                      <FormControl id="guide-name-signup">
                        <FormLabel>Full Name</FormLabel>
                        <Input bg={inputBg} type="text" placeholder="e.g., Budi Hartono" size="lg" focusBorderColor='blue.400'/>
                      </FormControl>
                      <FormControl id="guide-email-signup">
                        <FormLabel>Email address</FormLabel>
                        <Input bg={inputBg} type="email" placeholder="youremail@example.com" size="lg" focusBorderColor='blue.400'/>
                      </FormControl>
                      <FormControl id="guide-password-signup">
                        <FormLabel>Password</FormLabel>
                         <InputGroup size="lg">
                          <Input bg={inputBg} type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" focusBorderColor='blue.400' />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              icon={showPassword ? <FiEyeOff /> : <FiEye />}
                              onClick={() => setShowPassword(!showPassword)}
                              variant="ghost"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      <Button colorScheme="blue" w="full" type="submit" size="lg" mt={3}>
                        Create Account
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
          <Text mt={8} textAlign="center" color={textColor} fontSize="sm">
            Not a guide?{' '}
            <ChakraLink color="blue.500" fontWeight="semibold" onClick={() => navigate('/')}>
              Go to Traveler Sign In
            </ChakraLink>
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default GuideAuth;