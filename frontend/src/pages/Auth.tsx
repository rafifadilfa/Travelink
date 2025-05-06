import React, { useState } from 'react';
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

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Define passwordType without using showPassword state
  const passwordType = "password";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would verify credentials here
    console.log('Logging in with:', { email, password });
    
    // Navigate to dashboard after successful login
    navigate('/dashboard');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would create a new account here
    console.log('Signing up with:', { username, email, password });
    
    // Navigate to dashboard after successful signup
    navigate('/dashboard');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send a password reset email
    console.log('Resetting password for:', email);
    
    // Show message and switch to login
    alert(`Password reset instructions sent to ${email}`);
    setActiveTab('login');
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Left Panel - Image Side */}
      <Box 
        display={{ base: 'none', md: 'block' }} 
        bg="blue.600" 
        w={{ md: '50%', lg: '60%' }}
        backgroundImage="url('https://images.unsplash.com/photo-1573790387438-4da905039392?ixlib=rb-4.0.3')"
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
            <Heading size="lg" mb={2}>Travelink</Heading>
            <Text fontSize="sm">Discover Indonesia with local guides</Text>
          </Box>
          
          <Heading size="2xl" mb={6}>
            Explore the beauty of Indonesia with our trusted local guides
          </Heading>
          
          <Text fontSize="lg">
            From stunning beaches to vibrant cities and ancient temples, 
            experience personalized travel adventures with knowledgeable local guides.
          </Text>
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
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Password</Text>
                  <Input 
                    type={passwordType}
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  Sign In
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
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Email</Text>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Password</Text>
                  <Input 
                    type={passwordType}
                    placeholder="Create a password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Box>
                
                <Box>
                  <Text as="label" fontWeight="medium" mb={2} display="block">Confirm Password</Text>
                  <Input 
                    type={passwordType}
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Box>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg" 
                  w="full"
                  mt={2}
                >
                  Create Account
                </Button>
              </Flex>
            </form>
          )}
          
          {/* Reset Password Form */}
          {activeTab === 'reset' && (
            <form onSubmit={handleReset}>
              <Flex direction="column" gap={4}>
                <Heading size="md" mb={4}>Forgot Password?</Heading>
                <Text mb={4}>Please enter your email</Text>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  size="lg" 
                  w="full"
                  mt={2}
                >
                  Reset Password
                </Button>
                
                <Button 
                  variant="outline" 
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
                <Button flex="1" variant="outline" onClick={() => navigate('/dashboard')}>
                  Google
                </Button>
                <Button flex="1" variant="outline" onClick={() => navigate('/dashboard')}>
                  Facebook
                </Button>
                <Button flex="1" variant="outline" onClick={() => navigate('/dashboard')}>
                  Apple
                </Button>
              </Flex>
            </>
          )}
          
          {/* Toggle between login and signup */}
          {activeTab !== 'reset' && (
            <Text mt={8} textAlign="center">
              {activeTab === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <Box 
                    as="span" 
                    color="blue.500" 
                    fontWeight="semibold"
                    cursor="pointer"
                    onClick={() => setActiveTab('signup')}
                  >
                    Sign up
                  </Box>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Box 
                    as="span" 
                    color="blue.500" 
                    fontWeight="semibold"
                    cursor="pointer"
                    onClick={() => setActiveTab('login')}
                  >
                    Sign in
                  </Box>
                </>
              )}
            </Text>
          )}
        </Container>
      </Box>
    </Flex>
  );
};

export default Auth;