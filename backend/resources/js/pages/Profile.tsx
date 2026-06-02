import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Button, Flex, Text, Heading, Container, Grid, Input,
  useColorModeValue, Icon, VStack, HStack, Tabs,
  TabList, TabPanels, Tab, TabPanel, Avatar, Divider, Switch, useToast, Select
} from '@chakra-ui/react';
import {
  ChevronRightIcon, EditIcon, CheckIcon, CloseIcon, SettingsIcon, CalendarIcon,
  LockIcon, DeleteIcon, WarningTwoIcon, EmailIcon, ChatIcon, TimeIcon, InfoOutlineIcon
} from '@chakra-ui/icons';
import { useForm, Link } from '@inertiajs/react';
import { format } from 'date-fns'
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

interface InfoCardProps {
  label: string;
  value: string | number;
  iconAs?: React.ElementType; 
}

interface Language {
  id: number;
  name: string;
}

interface User{
  id: number;
  name: string;
  email: string;
  password: string;
  phone_number: number | '';
  profile_photo_path: string | null;
  language: Language | null;
  booking_count: number;
  review_count: number;
  created_at: string;
}

interface Props{
  user: User;
  languages: Language[];
}

export default function Profile({ user, languages }: Props) {
  const toast = useToast();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const { data, setData: setProfileData, patch, errors, reset } = useForm({
      name: user.name,
      email: user.email,
      password: user.password,
      phone_number: user.phone_number || '',
      language_id: user.language?.id ?? '',
  });

  const photoInput = useRef<HTMLInputElement>(null);
  const { data: photoData, setData: setPhotoData, post, errors: photoErrors } = useForm({
      photo: null as File | null,
  });

  useEffect(() => {
    if (photoData.photo) {
      post(route('profile.photo.update'), {
        onSuccess: () => {
            toast({
                title: "Photo Updated",
                description: "Your profile photo has been successfully updated.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        },

        onError: (errors) => {
            console.error(errors);
        }
      });
    }
  }, [photoData.photo, post, toast]);

  const overallBg = useColorModeValue('blue.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputHover= useColorModeValue('gray.200', 'gray.600');
  const inputFocus = useColorModeValue('blue.300', 'blue.600');
  const InputFocusBg = useColorModeValue('white', 'gray.700');
  const Email_SMS_Notificatin_PasswordBg = useColorModeValue('gray.50', 'gray.750');
  const WarningTwoIconColor = useColorModeValue('red.500', 'red.300');
  const AccountDeletionBgGradient_1 = useColorModeValue('red.50', 'red.900');
  const AccountDeletionBgGradient_2 = useColorModeValue('orange.50', 'orange.900');
  const AccountDeletionBorderColor = useColorModeValue('red.200', 'red.700');

  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const primaryHoverColor = useColorModeValue('blue.600', 'blue.500');
  const primaryTextColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const subtleBorderColor = useColorModeValue('gray.200', 'gray.700');
  const accentGradient = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;
  const activeTabHoverBg = useColorModeValue('blue.100', 'gray.700');
  const accountSignOutText = useColorModeValue('red.700', 'red.200');

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('Profile.update'), {
        onSuccess: () => {
          setIsEditing(false);

          toast({
            title: "Profile Updated",
            description: "Your information has been successfully saved.",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
      },
    });
  }

  const handleCancelEdit = () => {
    reset();
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const photo = e.target.files[0];
      setPhotoData('photo', photo);
    }
  }

  return (
    <Box minH="100vh" bg={overallBg} animation={`${fadeIn} 0.5s ease-out`}>
      <Box bg={glassBg} backdropFilter="blur(18px)" boxShadow="md" position="sticky" top={0} zIndex={1000} borderBottom="1px solid" borderColor={subtleBorderColor}>
        <Container maxW="container.xl">
          <Flex h="68px" justify="space-between" align="center">
            
            <Link href="/dashboard">
              <Flex align="center" gap={2.5}>
                <Flex alignItems="center" justifyContent="center" boxSize="40px" borderRadius="lg" bgGradient={accentGradient} boxShadow="lg" transition="all 0.3s ease" _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}>
                  <Text fontSize="xl" color="white" fontWeight="bold">✈</Text>
                </Flex>
                <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold">
                  Travelink
                </Heading>
              </Flex>
            </Link>

            <HStack spacing={3}>

              <Link href="/ViewAllTour">

                <Button {...secondaryButtonStyle} h="42px" leftIcon={<Text as="span" mr={1}>🧭</Text>}>Explore</Button>
              
              </Link>

              <Link href="/Bookings">

                <Button {...primaryButtonStyle} h="42px" leftIcon={<Text as="span" mr={1}>💼</Text>}>My Bookings</Button>

              </Link>

            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.lg" py={{ base: 6, md: 10 }}>
        <Box bg={cardBg} p={{ base: 5, md: 8 }} borderRadius="xl" boxShadow="xl" mb={10} borderTop="4px solid" borderColor={primaryColor} animation={`${slideInUp} 0.6s ease-out`}>
          <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'flex-start' }} gap={{ base: 5, md: 8 }}>
            <VStack spacing={2.5} align={{base:"center", md:"flex-start"}}>

              {/* Avatar */}

              <Avatar
                  size="xl"
                  name={user.name}
                  src={user.profile_photo_path ? `/storage/${user.profile_photo_path}` : `https://ui-avatars.com/api/?name=${user.name}`}
                  cursor={isEditing ? 'pointer' : 'default'}
                  onClick={isEditing ? () => photoInput.current?.click() : undefined}
              />

              <input
                  type="file"
                  style={{ display: "none"}}
                  ref={photoInput}
                  onChange={handlePhotoChange}
                  accept="image/*"
              />

              {/* Display any upload errors */}
              {photoErrors.photo && <p style={{ color: 'red' }}>{photoErrors.photo}</p>}

            </VStack>
            <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
              <Heading size="xl" color={primaryTextColor} fontWeight="bold" mb={1.5} animation={`${slideInUp} 0.7s ease-out 0.1s both`}>
                {isEditing ? `Editing Profile: ${user.name}` : `Welcome, ${user.name}`}
              </Heading>
              
              <Text color={secondaryTextColor} fontSize="md" mb={4} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
                Member since {format(new Date(user.created_at), 'MMMM dd, yyyy')}.
              </Text>

              <Text color={secondaryTextColor} fontSize="md" mb={4} animation={`${slideInUp} 0.7s ease-out 0.3s both`}>
                Manage your information and preferences below.
              </Text>

              <HStack spacing={6} justify={{ base: 'center', md: 'flex-start' }} animation={`${slideInUp} 0.7s ease-out 0.4s both`} divider={<Box h="30px" borderLeft="1px solid" borderColor={subtleBorderColor} />}>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="extrabold" color={primaryColor}>{user.booking_count}</Text>
                  <Text fontSize="sm" color={secondaryTextColor}>Bookings</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="extrabold" color={primaryColor}>{user.review_count}</Text>
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
                _hover={{ bg: activeTabIndex !== index ? activeTabHoverBg : primaryHoverColor, color: activeTabIndex !== index ? primaryColor : 'white' }}
                _selected={{ color: 'white', bg: primaryColor, boxShadow: 'lg' }}
              >
                <Icon as={tab.icon} mr={2} boxSize={4} /> {tab.label}
              </Tab>
            ))}
          </TabList>

          {/* Editing Form */}
          <TabPanels>
            <TabPanel p={0}><Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} animation={`${fadeIn} 0.5s ease-out`}>
              {isEditing ? (
                <form onSubmit={submit}>
                  <VStack spacing={5} align="stretch">
                    <Heading size="lg" color={primaryTextColor} mb={2} textAlign="center">Update Your Information</Heading>

                          <Box>
                              <HStack as="label" fontSize="md" fontWeight="medium" color={primaryTextColor} mb={1.5} display="flex" align="center" marginTop={5}>
                                <Icon as={InfoOutlineIcon} color={primaryColor} boxSize={4}/>
                                <Text ml={InfoOutlineIcon != null ? 1 : 0}>Full Name</Text>
                              </HStack>
                              
                              <Input
                                  id={data.name}
                                  name={data.name}
                                  value={data.name ?? ''}
                                  onChange={(e) => setProfileData('name', e.target.value)}
                                  bg={inputBg} h="46px" borderRadius="lg" fontSize="sm"
                                  _hover={{ bg: inputHover }}
                                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${inputFocus}`, bg: InputFocusBg }}
                              />
                              {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}

                              <HStack as="label" fontSize="md" fontWeight="medium" color={primaryTextColor} mb={1.5} display="flex" align="center" marginTop={5}>
                                <Icon as={EmailIcon} color={primaryColor} boxSize={4}/>
                                <Text ml={EmailIcon != null ? 1 : 0}>Email Address</Text>
                              </HStack>

                              <Input
                                  id={data.email}
                                  name={data.email}
                                  value={data.email ?? ''}
                                  onChange={(e) => setProfileData('email', e.target.value)}
                                  bg={inputBg} h="46px" borderRadius="lg" fontSize="sm"
                                  _hover={{ bg: inputHover }}
                                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${inputFocus}`, bg: InputFocusBg }}
                              />
                              {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}

                              <HStack as="label" fontSize="md" fontWeight="medium" color={primaryTextColor} mb={1.5} display="flex" align="center" marginTop={5}>
                                <Icon as={ChatIcon} color={primaryColor} boxSize={4}/>
                                <Text ml={ChatIcon != null ? 1 : 0}>Phone Number</Text>
                              </HStack>

                              <Input
                                  value={data.phone_number ?? ''}
                                  onChange={(e) => setProfileData('phone_number', e.target.value)}
                                  bg={inputBg} h="46px" borderRadius="lg" fontSize="sm"
                                  _hover={{ bg: inputHover }}
                                  _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${inputFocus}`, bg: InputFocusBg }}
                              />
                              {errors.phone_number && <p style={{ color: 'red' }}>{errors.phone_number}</p>}

                              <HStack as="label" fontSize="md" fontWeight="medium" color={primaryTextColor} mb={1.5} display="flex" align="center" marginTop={5}>
                                <Icon as={ChatIcon} color={primaryColor} boxSize={4}/>
                                <Text ml={ChatIcon != null ? 1 : 0}>Language</Text>
                              </HStack>

                              <Select
                                value={data.language_id ?? ''}
                                onChange={(e) => setProfileData('language_id', e.target.value)}
                                variant="filled"
                                bg={inputBg} h="46px" borderRadius="lg" fontSize="sm"
                                _hover={{ bg: inputHover }}
                                _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 2px ${inputFocus}`, bg: InputFocusBg }}
                            >
                                <option value="">-- Select a Language --</option>
                                {languages.map((lang) => (
                                    <option key={lang.id} value={lang.id}>
                                        {lang.name}
                                    </option>
                                ))}
                              </Select>
                              {errors.language_id && <p style={{ color: 'red' }}>{errors.language_id}</p>}
                          </Box>
                      
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
                    <InfoCard label="Full Name" value={user.name} iconAs={InfoOutlineIcon} />
                    <InfoCard label="Email Address" value={user.email} iconAs={EmailIcon} />
                    <InfoCard label="Phone Number" value={user.phone_number? user.phone_number : 'No Phone number Assigned'} iconAs={ChatIcon} />
                    <InfoCard label="Language" value={user.language ? user.language.name :'Not Specified'} iconAs={TimeIcon} />
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

                <Link href="/Bookings">
                  <Button {...primaryButtonStyle} size="md" rightIcon={<ChevronRightIcon boxSize={5}/>} animation={`${subtleFloat} 2s ease-in-out infinite`}>View My Bookings</Button>
                </Link>

            </Box></TabPanel>

            <TabPanel p={0}><Box bg={cardBg} p={{ base: 5, md: 6 }} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor={subtleBorderColor} animation={`${fadeIn} 0.5s ease-out`}>
              <VStack spacing={8} align="stretch">

                {/* Email & SMS Notificatin, Password Management Section */}

                <Box>
                  <Heading size="lg" color={primaryTextColor} mb={6} textAlign="center">Manage Your Account</Heading>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center" p={4} bg={Email_SMS_Notificatin_PasswordBg} borderRadius="lg" boxShadow="inner">
                      <HStack><Icon as={EmailIcon} color={primaryColor} boxSize={5}/><Text fontWeight="medium" color={primaryTextColor} fontSize="md">Email Notifications</Text></HStack>
                      <Switch colorScheme="blue" size="md" defaultChecked />
                    </Flex>
                    <Flex justify="space-between" align="center" p={4} bg={Email_SMS_Notificatin_PasswordBg} borderRadius="lg" boxShadow="inner">
                        <HStack><Icon as={ChatIcon} color={primaryColor} boxSize={5}/><Text fontWeight="medium" color={primaryTextColor} fontSize="md">SMS Notifications for Updates</Text></HStack>
                      <Switch colorScheme="blue" size="md" />
                    </Flex>
                  </VStack>
                </Box>

                {/* End Of Email & SMS Notificatin, Password Management Section */}
                
                <Divider borderColor={subtleBorderColor} />

                {/* Account Deletion Section */}

                <Box p={5} bgGradient={`linear(to-br, ${AccountDeletionBgGradient_1}, ${AccountDeletionBgGradient_2})`} borderRadius="lg" border="1px solid" borderColor={AccountDeletionBorderColor} boxShadow="md">
                  <HStack mb={3} spacing={2.5}>
                    <Icon as={WarningTwoIcon} color={WarningTwoIconColor} boxSize={6} animation={`${iconWiggle} 4s ease-in-out infinite alternate`} />
                    <Heading size="md" color={accountSignOutText}>Account Sign Out</Heading>
                  </HStack>

                  <Button 
                    as={Link}
                    href={route('logout')}
                    method="post"
                    {...dangerButtonStyle}
                    size="md" 
                    leftIcon={<DeleteIcon boxSize={4}/>}
                    >
                    Log out
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