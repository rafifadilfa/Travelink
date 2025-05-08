import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  Container,
  Center,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Featured destinations for background slideshow
const destinations = [
  {
    name: 'Bali',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392',
  },
  {
    name: 'Lombok',
    image: 'https://images.unsplash.com/photo-1606152536277-5aa1fd33e150',
  },
  {
    name: 'Raja Ampat',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf',
  },
  {
    name: 'Borobudur Temple',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0',
  },
];

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDestination, setCurrentDestination] = useState(0);
  const navigate = useNavigate();

  // Background image slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Validate email and password (simple validation)
    if (!email || !password) {
      alert('Please enter both email and password');
      setLoading(false);
      return;
    }

    // In a real app, you would authenticate with your backend
    console.log('Logging in with:', { email, password });
    
    // Show success message (without toast)
    alert('Login successful! Redirecting to dashboard...');

    // Navigate to dashboard after successful login
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    // In a real app, you would create a new account here
    console.log('Signing up with:', { username, email, password });
    
    // Show success message (without toast)
    alert('Account created! Welcome to Travelink!');

    // Navigate to dashboard after successful signup
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!email) {
      alert('Please enter your email');
      setLoading(false);
      return;
    }

    // In a real app, you would send a password reset email
    console.log('Resetting password for:', email);
    
    // Show success message (without toast)
    alert(`Reset email sent to ${email}. Check your inbox for instructions.`);

    // Switch to login tab
    setTimeout(() => {
      setActiveTab('login');
      setLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    setLoading(true);
    
    // Show message for demo purposes
    alert(`${provider} login initiated. In a real app, this would connect to your backend.`);

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Left Panel - Image Side */}
      <Box 
        display={{ base: 'none', md: 'block' }} 
        bg="blue.600" 
        w={{ md: '50%', lg: '60%' }}
        backgroundImage={`url('${destinations[currentDestination].image}')`}
        backgroundSize="cover"
        backgroundPosition="center"
        position="relative"
      >
        {/* Overlay */}
        <Box 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          bg="blackAlpha.600"
        />
        
        {/* Content */}
        <Flex 
          position="relative" 
          direction="column" 
          justify="center" 
          h="full" 
          p={10} 
          color="white"
        >
          <Box mb={10}>
            <Heading size="lg" mb={2}>
              ✈️ Travelink
            </Heading>
            <Text fontSize="sm">Discover Indonesia with local guides</Text>
          </Box>
          
          <Heading size="2xl" mb={6}>
            Explore the beauty of Indonesia with our trusted local guides
          </Heading>
          
          <Text fontSize="lg">
            From stunning beaches to vibrant cities and ancient temples, 
            experience personalized travel adventures with knowledgeable local guides.
          </Text>

          {/* Destination indicator */}
          <Flex mt={10} justify="center">
            {destinations.map((_, index) => (
              <Box
                key={index}
                w="10px"
                h="10px"
                borderRadius="full"
                bg={index === currentDestination ? "white" : "whiteAlpha.500"}
                mx={1}
                cursor="pointer"
                onClick={() => setCurrentDestination(index)}
              />
            ))}
          </Flex>

          {/* Current location label */}
          <Box 
            position="absolute" 
            bottom="20px" 
            right="20px"
            bg="blackAlpha.600"
            px={4}
            py={2}
            borderRadius="md"
          >
            <Text fontSize="sm">
              📍 {destinations[currentDestination].name}, Indonesia
            </Text>
          </Box>
        </Flex>
      </Box>
      
      {/* Right Panel - Form Side */}
      <Box 
        w={{ base: '100%', md: '50%', lg: '40%' }} 
        bg="white"
      >
        <Container maxW="md" py={10} px={{ base: 5, sm: 10 }}>
          <Box textAlign="center" mb={8}>
            <Heading mb={1}>
              {activeTab === 'login' ? 'Welcome Back' : 
               activeTab === 'signup' ? 'Create Account' : 'Reset Password'}
            </Heading>
            <Text color="gray.600">
              {activeTab === 'login' ? 'Sign in to continue to Travelink' : 
               activeTab === 'signup' ? 'Sign up and start exploring' : 'Enter your email to reset your password'}
            </Text>
          </Box>
          
          {/* Tab Navigation */}
          <Flex mb={6} borderBottom="1px" borderColor="gray.200">
            <Box 
              px={4} 
              py={2} 
              cursor="pointer"
              borderBottom={activeTab === 'login' ? "2px solid" : "none"}
              borderColor="blue.500"
              color={activeTab === 'login' ? "blue.500" : "gray.500"}
              fontWeight={activeTab === 'login' ? "semibold" : "normal"}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </Box>
            <Box 
              px={4} 
              py={2} 
              cursor="pointer"
              borderBottom={activeTab === 'signup' ? "2px solid" : "none"}
              borderColor="blue.500"
              color={activeTab === 'signup' ? "blue.500" : "gray.500"}
              fontWeight={activeTab === 'signup' ? "semibold" : "normal"}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </Box>
          </Flex>
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <Flex direction="column" gap={4}>
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Email or Username</Text>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.50"
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Password</Text>
                  <Input 
                    type="password"
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.50"
                  />
                </Box>
                
                <Box 
                  as="span" 
                  alignSelf="flex-end" 
                  color="blue.500" 
                  fontSize="sm"
                  cursor="pointer"
                  onClick={() => setActiveTab('reset')}
                >
                  Forgot password?
                </Box>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg" 
                  w="full"
                  mt={2}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Flex>
            </form>
          )}
          
          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp}>
              <Flex direction="column" gap={4}>
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Username</Text>
                  <Input 
                    type="text" 
                    placeholder="Choose a username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    bg="gray.50"
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Email</Text>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.50"
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Password</Text>
                  <Input 
                    type="password"
                    placeholder="Create a password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.50"
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Confirm Password</Text>
                  <Input 
                    type="password"
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    bg="gray.50"
                  />
                </Box>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg" 
                  w="full"
                  mt={2}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Flex>
            </form>
          )}
          
          {/* Reset Password Form */}
          {activeTab === 'reset' && (
            <form onSubmit={handleReset}>
              <Flex direction="column" gap={4}>
                <Heading size="md" mb={4}>Forgot Password?</Heading>
                <Text mb={4}>Please enter your email to receive reset instructions</Text>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="gray.50"
                />
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg" 
                  w="full"
                  mt={2}
                >
                  {loading ? 'Sending Reset Email...' : 'Reset Password'}
                </Button>
                
                <Button 
                  colorScheme="blue"
                  onClick={() => setActiveTab('login')}
                  alignSelf="center"
                >
                  Back to Login
                </Button>
              </Flex>
            </form>
          )}
          
          {/* Social Login */}
          {activeTab !== 'reset' && (
            <>
              <Box position="relative" my={8}>
                <Box h="1px" bg="gray.200" />
                <Center 
                  bg="white" 
                  px={4} 
                  position="absolute" 
                  top="-3px" 
                  left="50%" 
                  transform="translateX(-50%)"
                >
                  <Text color="gray.500" fontSize="sm">
                    OR CONTINUE WITH
                  </Text>
                </Center>
              </Box>
              
              <Flex gap={4}>
                <Button 
                  flex="1" 
                  colorScheme="red" 
                  onClick={() => handleSocialLogin('Google')}
                >
                  Google
                </Button>
                <Button 
                  flex="1" 
                  colorScheme="blue" 
                  onClick={() => handleSocialLogin('Facebook')}
                >
                  Facebook
                </Button>
                <Button 
                  flex="1" 
                  colorScheme="gray" 
                  onClick={() => handleSocialLogin('Apple')}
                >
                  Apple
                </Button>
              </Flex>
            </>
          )}
          
          {/* Footer section */}
          <Box mt={8} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              By signing in or creating an account, you agree to our{' '}
              <Box as="span" color="blue.500" cursor="pointer">
                Terms & Conditions
              </Box>{' '}
              and{' '}
              <Box as="span" color="blue.500" cursor="pointer">
                Privacy Policy
              </Box>
            </Text>
          </Box>
        </Container>
      </Box>
    </Flex>
  );
};

export default Auth;