import React, { useState } from 'react';
import {
  As, 
  Box, Button, Flex, Text, Heading, Container, Grid, Input,
  useColorModeValue, Icon, Badge, VStack, HStack, Tabs,
  TabList, TabPanels, Tab, TabPanel, Avatar, Divider, Switch, useToast,
  Tooltip
} from '@chakra-ui/react';
import {
  ChevronRightIcon, EditIcon, CheckIcon, CloseIcon, SettingsIcon, CalendarIcon,
  LockIcon, DeleteIcon, WarningTwoIcon, EmailIcon, ChatIcon, TimeIcon, InfoOutlineIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';

// --- Keyframes ---
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const iconWiggle = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(8deg) scale(1.08); }
  50% { transform: rotate(-4deg) scale(1.04); }
  75% { transform: rotate(8deg) scale(1.08); }
`;
const subtleFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

// Mock user data
const userData = {
  name: 'Sarah Anderson',
  email: 'sarah.anderson@example.com',
  phone: '+62 821 1234 5678',
  location: 'Jakarta, Indonesia',
  joinedDate: 'January 2023',
  bookingsCount: 12,
  reviewsCount: 8,
  profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMHBob3RvJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=200&q=60'
};

interface InfoCardProps {
  label: string;
  value: string;
  iconAs?: As; 
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    location: userData.location,
  });

  const overallBg = useColorModeValue('blue.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
  const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;


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
      bg: useColorModeValue('blue.50', 'rgba(49,130,206,0.1)'), borderColor: primaryHoverColor,
      color: primaryHoverColor, transform: 'translateY(-2px) scale(1.02)', boxShadow: 'md'
    },
  };

  const dangerButtonStyle = {
    ...baseButtonStyle, bg: useColorModeValue('red.50', 'red.800'), color: useColorModeValue('red.600', 'red.200'),
    border: "1px solid", borderColor: useColorModeValue('red.400', 'red.500'),
    _hover: {
      bg: useColorModeValue('red.100', 'red.700'), borderColor: useColorModeValue('red.500', 'red.400'),
      transform: 'translateY(-2px)', boxShadow: 'md'
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile update:', formData);
    Object.assign(userData, formData);
    setIsEditing(false);
    toast({
      title: "Profile Updated", description: "Your information has been successfully saved.",
      status: "success", duration: 4000, isClosable: true, position: "top",
      icon: <Icon as={CheckIcon} w={4} h={4} color="green.500" />
    });
  };

  const handleCancelEdit = () => {
    setFormData({ name: userData.name, email: userData.email, phone: userData.phone, location: userData.location });
    setIsEditing(false);
    toast({ title: "Edit Cancelled", description: "No changes have been saved.", status: "info", duration: 3000, isClosable: true, position: "top-right" });
  };

  const InfoCard = ({ label, value, iconAs }: InfoCardProps) => (
    <Box
      bg={useColorModeValue('white', 'gray.750')} p={4} borderRadius="lg"
      boxShadow="md" animation={`${fadeIn} 0.5s ease-out forwards`}
      borderLeft="3px solid" borderColor={primaryColor}
      transition="all 0.2s ease-in-out"
      _hover={{ transform: 'translateY(-4px) scale(1.01)', boxShadow: 'lg' }}
    >
      <HStack spacing={2} mb={1}>
        {iconAs && <Icon as={iconAs} boxSize={4} color={primaryColor} mr={1} />}
        <Text fontSize="xs" color={secondaryTextColor} fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
      </HStack>
      <Text fontSize="md" color={primaryTextColor} fontWeight="semibold" noOfLines={1}>
        {value}
      </Text>
    </Box>
  );

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

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.6s ease-out`}>
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} gap={{ base: 5, md: 8 }}>
            <VStack spacing={2.5} align={{base:"center", md:"flex-start"}}>
              <Avatar size="xl" name={userData.name} src={userData.profilePicture} border="4px solid" borderColor={useColorModeValue('white', 'gray.700')} boxShadow={`0 0 12px ${useColorModeValue(primaryColor, 'blue.300')}`} />
              {isEditing && <Button size="xs" variant="outline" colorScheme="blue" onClick={()=>alert("Implement photo upload functionality.")}>Change Photo</Button>}
            </VStack>
            <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
              <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} animation={`${slideInUp} 0.7s ease-out 0.1s both`}>
                {isEditing ? `Editing Profile: ${formData.name}` : `Welcome, ${userData.name}`}
              </Heading>
              <Badge px={3} py={1} borderRadius="full" bgGradient={accentGradient} color="white" fontSize="sm" fontWeight="bold" mb={3} display="inline-flex" alignItems="center" animation={`${slideInUp} 0.7s ease-out 0.2s both`} boxShadow="md">
                <Icon viewBox="0 0 24 24" boxSize={3.5} mr={1.5} fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></Icon>
                {isEditing ? `Updating from ${formData.location}` : `${userData.location}`}
              </Badge>
              <Text color={secondaryTextColor} fontSize="md" mb={4} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
                Member since {userData.joinedDate}. Manage your information and preferences below.
              </Text>
              <HStack spacing={6} justify={{ base: 'center', md: 'flex-start' }} animation={`${slideInUp} 0.7s ease-out 0.4s both`} divider={<Box h="30px" borderLeft="1px solid" borderColor={subtleBorderColor} />}>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="extrabold" color={primaryColor}>{userData.bookingsCount}</Text>
                  <Text fontSize="sm" color={secondaryTextColor}>Bookings</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="extrabold" color={primaryColor}>{userData.reviewsCount}</Text>
                  <Text fontSize="sm" color={secondaryTextColor}>Reviews</Text>
                </Box>
              </HStack>
            </Box>
            {!isEditing && (
              <Button {...primaryButtonStyle} leftIcon={<EditIcon boxSize={4}/>} onClick={() => setIsEditing(true)} alignSelf={{ base: 'stretch', md: 'flex-start' }} mt={{ base: 4, md: 0 }} animation={`${fadeIn} 0.8s ease-out 0.5s both`}>
                Edit Profile Details
              </Button>
            )}
          </Flex>
        </Box>

        <Tabs index={activeTabIndex} onChange={(index) => setActiveTabIndex(index)} variant="unstyled" isLazy>
          <TabList display="flex" justifyContent="space-around" bg={cardBg} p={1.5} borderRadius="lg" boxShadow="md" mb={8} border="1px solid" borderColor={subtleBorderColor} animation={`${slideInUp} 0.7s ease-out 0.2s both`}>
            {[
              { label: "Profile Details", icon: SettingsIcon }, { label: "Booking History", icon: CalendarIcon },
              { label: "Account Settings", icon: LockIcon }
            ].map((tab, index) => (
              <Tab
                key={tab.label} flex={1} py={2.5} borderRadius="md" fontWeight="medium" fontSize="sm"
                color={activeTabIndex === index ? 'white' : secondaryTextColor}
                bg={activeTabIndex === index ? primaryColor : 'transparent'}
                boxShadow={activeTabIndex === index ? 'md' : 'none'}
                transition="all 0.3s ease"
                _hover={{ bg: activeTabIndex !== index ? useColorModeValue('blue.100', 'gray.700') : primaryHoverColor, color: activeTabIndex !== index ? primaryColor : 'white' }}
                _selected={{ color: 'white', bg: primaryColor, boxShadow: 'lg' }}
              >
                <Icon as={tab.icon} mr={2} boxSize={4} /> {tab.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p={0}><Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} animation={`${fadeIn} 0.5s ease-out`}>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <VStack spacing={5} align="stretch">
                    <Heading size="lg" color={primaryTextColor} mb={2} textAlign="center">Update Your Information</Heading>
                    {[
                      { label: "Full Name", name: "name", type: "text", value: formData.name, iconAs: InfoOutlineIcon },
                      { label: "Email Address", name: "email", type: "email", value: formData.email, iconAs: EmailIcon },
                      { label: "Phone Number", name: "phone", type: "tel", value: formData.phone, iconAs: ChatIcon },
                      { label: "Current Location", name: "location", type: "text", value: formData.location, iconAs: TimeIcon },
                    ].map(field => (
                      <Box key={field.name}>
                        <HStack as="label" htmlFor={field.name} fontSize="sm" fontWeight="medium" color={secondaryTextColor} mb={1.5} display="flex" align="center">
                          {field.iconAs && <Icon as={field.iconAs} color={primaryColor} boxSize={4}/>} <Text ml={field.iconAs != null ? 1 : 0}>{field.label}</Text>
                        </HStack>
                        <Input id={field.name} name={field.name} type={field.type} value={field.value} onChange={handleInputChange}
                          variant="filled" bg={useColorModeValue('gray.100', 'gray.700')} h="46px" borderRadius="md" fontSize="sm"
                          _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                          _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${useColorModeValue('blue.300', 'blue.600')}`, bg: useColorModeValue('white', 'gray.700') }}
                        />
                      </Box>
                    ))}
                    <HStack justifyContent="flex-end" spacing={3} pt={4} mt={2} borderTop="1px dashed" borderColor={subtleBorderColor}>
                      <Button {...secondaryButtonStyle} onClick={handleCancelEdit} leftIcon={<CloseIcon boxSize={3}/>}>Cancel</Button>
                      <Button {...primaryButtonStyle} type="submit" leftIcon={<CheckIcon boxSize={3}/>}>Save Changes</Button>
                    </HStack>
                  </VStack>
                </form>
              ) : (
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" color={primaryTextColor} mb={1} textAlign="center">Your Profile Information</Heading>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
                    <InfoCard label="Full Name" value={userData.name} iconAs={InfoOutlineIcon} />
                    <InfoCard label="Email Address" value={userData.email} iconAs={EmailIcon} />
                    <InfoCard label="Phone Number" value={userData.phone} iconAs={ChatIcon} />
                    <InfoCard label="Current Location" value={userData.location} iconAs={TimeIcon} />
                  </Grid>
                </VStack>
              )}
            </Box></TabPanel>

            <TabPanel p={0}><Box bg={cardBg} p={{ base: 6, md: 8 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} textAlign="center" minH="300px" display="flex" flexDirection="column" justifyContent="center" alignItems="center" animation={`${fadeIn} 0.5s ease-out`}>
                <Icon as={CalendarIcon} boxSize="48px" color={primaryColor} mb={4} animation={`${iconWiggle} 3.5s ease-in-out infinite 0.2s`} />
                <Heading size="lg" color={primaryTextColor} mb={3}>Access Your Bookings</Heading>
                <Text color={secondaryTextColor} mb={6} maxW="md" fontSize="md">
                    Review your complete travel history, including all upcoming and past adventures you've booked with Travelink.
                </Text>
                <Button {...primaryButtonStyle} size="md" onClick={() => navigate('/bookings')} rightIcon={<ChevronRightIcon boxSize={5}/>} animation={`${subtleFloat} 2s ease-in-out infinite`}>View My Bookings</Button>
            </Box></TabPanel>

            <TabPanel p={0}><Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} animation={`${fadeIn} 0.5s ease-out`}>
              <VStack spacing={8} align="stretch">
                <Box>
                  <Heading size="lg" color={primaryTextColor} mb={6} textAlign="center">Manage Your Account</Heading>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center" p={4} bg={useColorModeValue('gray.50', 'gray.750')} borderRadius="lg" boxShadow="inner">
                      <HStack><Icon as={EmailIcon} color={primaryColor} boxSize={5}/><Text fontWeight="medium" color={primaryTextColor} fontSize="md">Email Notifications</Text></HStack>
                      <Switch colorScheme="blue" size="md" defaultChecked />
                    </Flex>
                    <Flex justify="space-between" align="center" p={4} bg={useColorModeValue('gray.50', 'gray.750')} borderRadius="lg" boxShadow="inner">
                        <HStack><Icon as={ChatIcon} color={primaryColor} boxSize={5}/><Text fontWeight="medium" color={primaryTextColor} fontSize="md">SMS Notifications for Updates</Text></HStack>
                      <Switch colorScheme="blue" size="md" />
                    </Flex>
                    <Tooltip label="This feature is currently under development." placement="top" hasArrow bg="gray.600" color="white">
                      <Button {...secondaryButtonStyle} leftIcon={<LockIcon boxSize={4}/>} justifyContent="flex-start" size="md" w="full" onClick={() => toast({ title: "Feature Coming Soon!", description: "Password change functionality will be available shortly.", status: "info", duration: 3000, position: "top" })}>
                        Change Password
                      </Button>
                    </Tooltip>
                  </VStack>
                </Box>
                <Divider borderColor={subtleBorderColor} />
                <Box p={5} bgGradient={`linear(to-br, ${useColorModeValue('red.50', 'red.900')}, ${useColorModeValue('orange.50', 'orange.900')})`} borderRadius="lg" border="1px solid" borderColor={useColorModeValue('red.200', 'red.700')} boxShadow="md">
                  <HStack mb={3} spacing={2.5}>
                    <Icon as={WarningTwoIcon} color={useColorModeValue('red.500', 'red.300')} boxSize={6} animation={`${iconWiggle} 4s ease-in-out infinite alternate`} />
                    <Heading size="md" color={useColorModeValue('red.700', 'red.200')}>Account Deletion</Heading>
                  </HStack>
                  <Text color={useColorModeValue('red.700', 'red.300')} mb={5} fontSize="sm">
                    Warning: Deleting your account is a permanent action. All your profile information, booking history, and reviews will be irretrievably lost. Please be certain before proceeding.
                  </Text>
                  <Button {...dangerButtonStyle} size="md" leftIcon={<DeleteIcon boxSize={4}/>} onClick={() => toast({ title: "Account Deletion (Simulated)", description: "This is a demonstration only. Your account has not been deleted.", status: "warning", duration: 5000, position: "top", icon: <Icon as={WarningTwoIcon} w={4} h={4} color="orange.500"/>})}>
                    Confirm Account Deletion
                  </Button>
                </Box>
              </VStack>
            </Box></TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default Profile;