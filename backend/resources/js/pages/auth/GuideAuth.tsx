import React, { useState, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
  HStack,
} from '@chakra-ui/react';
// import { useNavigate } from 'react-router-dom';
import { Link, useForm } from '@inertiajs/react';
import { FiTrendingUp, FiCalendar, FiHeart } from 'react-icons/fi';

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

const BASE_INPUT_BORDER_COLOR = '#dee2e6';
const FOCUSED_INPUT_BORDER_COLOR = '#007bff';

export default function GuideAuth(){

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHoveringGuideLogin, setIsHoveringGuideLogin] = useState(false);
  

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#f8f9fa',
    border: `1px solid ${BASE_INPUT_BORDER_COLOR}`,
    borderRadius: '8px',
    fontSize: '16px',
    color: '#495057',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  };

  const buttonBaseStyle: React.CSSProperties = {
    color: 'white',
    padding: '14px 20px',
    width: '100%',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#007bff',
  };
  
  const primaryButtonHoverStyle: React.CSSProperties = {
    backgroundColor: '#0056b3',
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)',
  };

  const guideButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#28a745', // Warna hijau untuk login pemandu
    marginTop: '10px'
  }

  const guideButtonHoverStyle: React.CSSProperties = {
      backgroundColor: '#218838',
      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-1px)',
  };

  // Form hook for login
  const { data: logindata, setData: setLoginData, post: postLogin, processing: loginProcessing, errors: loginErrors} = useForm({
    email: '',
    password: '',
    remember: false,
  });

  // Form hook for signup
  const { data: registerData, setData: setRegisterData, post: postRegister, processing: registerProcessing, errors: registerErrors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const loginSubmit = (e: FormEvent) => {
    e.preventDefault();
    postLogin(route('guide.login'));
  };

  const registerSubmit = (e: FormEvent) => {
    e.preventDefault();
    postRegister(route('guide.register'));
  };
  
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 768;

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

        <Box
            pos="absolute"
            top="0" left="0" right="0" bottom="0"
            bgImage="/guide-auth-bg.jpg"
            bgSize="cover"
            bgPosition="center"
        />

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

      {/* Authentication Form */}
      <div style={{
        width: windowWidth < 768 ? '100%' : '45%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
      }}>
        <div style={{
          maxWidth: '420px',
          width: '90%',
          padding: '30px',
          boxShadow: windowWidth >= 768 ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none',
          borderRadius: windowWidth >= 768 ? '12px' : '0',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{
              marginBottom: '10px',
              color: '#1a202c',
              fontSize: '28px',
              fontWeight: '700',
            }}>
              {activeTab === 'login' ? 'Sign in to Travelink' :
                activeTab === 'signup' ? 'Create Your Account' : 'Reset Password'}
            </h2>
            <p style={{ color: '#6c757d', fontSize: '16px' }}>
              {activeTab === 'login' ? 'Welcome back! Please enter your details.' :
                activeTab === 'signup' ? 'Join us and start exploring Indonesia.' : 'Enter your email to reset your password.'}
            </p>
          </div>

          <div style={{
            display: 'flex',
            marginBottom: '28px',
            borderBottom: '1px solid #e2e8f0',
          }}>
            {['login', 'signup'].map(tabName => (
              <div
                key={tabName}
                style={{
                  padding: '14px 10px',
                  cursor: 'pointer',
                  borderBottom: activeTab === tabName ? '3px solid #007bff' : '3px solid transparent',
                  color: activeTab === tabName ? '#007bff' : '#495057',
                  fontWeight: activeTab === tabName ? '600' : '500',
                  transition: 'all 0.3s ease',
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '16px',
                }}
                onClick={() => setActiveTab(tabName as 'login' | 'signup')}
              >
                {tabName === 'login' ? 'Sign In' : 'Sign Up'}
              </div>
            ))}
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={loginSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#343a40'
                  }}>
                    Email or Username
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com or username"
                    value={logindata.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginData('email', e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />

                  {/* Email Error Message */}
                  {loginErrors.email && <p style={{ color: 'red' }}>{loginErrors.email}</p>}

                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <label style={{
                      fontWeight: '500',
                      color: '#343a40'
                    }}>
                      Password
                    </label>
                    <span
                      style={{
                        color: '#007bff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'color 0.2s ease',
                      }}
                      onClick={() => setActiveTab('reset')}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0056b3')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#007bff')}
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={logindata.password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginData('password', e.target.value)}
                      style={inputStyle}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                    />

                    {/* Password Error Message */}
                    {loginErrors.password && <p style={{ color: 'red' }}>{loginErrors.password}</p>}

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#6c757d',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '5px',
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={isHoveringSubmit ? {...primaryButtonStyle, ...primaryButtonHoverStyle} : primaryButtonStyle}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  disabled={loginProcessing}
                >
                  {loginProcessing ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={registerSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={registerData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterData('name', e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterData('email', e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />

                  {/* Email Error Message */}
                  {registerErrors.email && <p style={{ color: 'red' }}>{registerErrors.email}</p>}

                </div>

                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={registerData.password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterData('password', e.target.value)}
                      style={inputStyle}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                    />

                    {/* Password Error Message */}
                    {registerErrors.password && <p style={{ color: 'red' }}>{registerErrors.password}</p>}

                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#6c757d',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '5px',
                        }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerData.password_confirmation}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterData('password_confirmation', e.target.value)}
                      style={inputStyle}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />

                    {/* Password Confirmation Error Message */}
                    {registerErrors.password_confirmation && <p style={{ color: 'red' }}>{registerErrors.password_confirmation}</p>}

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#6c757d',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '5px',
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  
                </div>

                <button
                  type="submit"
                  style={isHoveringSubmit ? {...primaryButtonStyle, ...primaryButtonHoverStyle} : primaryButtonStyle}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  disabled={registerProcessing}
                >
                  {registerProcessing ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <div style={{
            position: 'relative',
            margin: '32px 0',
            textAlign: 'center'
          }}>
            <div style={{
              height: '1px',
              backgroundColor: '#dee2e6',
            }}></div>
            <div style={{
              position: 'absolute',
              top: '-11px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              padding: '0 16px'
            }}>
              <span style={{
                color: '#6c757d',
                fontSize: '16px',
                fontWeight: '500',
                textTransform: 'uppercase',
              }}>
                Or
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link href={route('login')}>
              <button
                style={isHoveringGuideLogin ? {...guideButtonStyle, ...guideButtonHoverStyle} : guideButtonStyle}
                onMouseEnter={() => setIsHoveringGuideLogin(true)}
                onMouseLeave={() => setIsHoveringGuideLogin(false)}
              >
                User Login / Sign Up
              </button>
            </Link>

          </div>

          <div style={{
            marginTop: '32px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#6c757d', lineHeight: 1.6 }}>
              By signing in or creating an account, you agree to our
              <br />
              <a href="/terms" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
                Terms & Conditions
              </a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </Flex>
  );

};