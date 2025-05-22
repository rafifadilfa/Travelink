import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Define types for our component props and state
interface AuthProps {
  onLogin?: () => void;
}

// Define type for destinations
interface Destination {
  name: string;
  image: string;
  description: string;
}

// Featured destinations for background slideshow
const destinations: Destination[] = [
  {
    name: 'Bali',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392',
    description: 'Experience the magic of Bali with our trusted guides'
  },
  {
    name: 'Lombok',
    image: 'https://images.unsplash.com/photo-1606152536277-5aa1fd33e150',
    description: 'Discover pristine beaches and breathtaking landscapes'
  },
  {
    name: 'Raja Ampat',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf',
    description: 'Explore the underwater paradise of Indonesia'
  },
  {
    name: 'Borobudur Temple',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0',
    description: 'Visit ancient temples and experience cultural wonders'
  },
];

/**
 * Enhanced Auth component with improved UI/UX
 */
const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDestination, setCurrentDestination] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // Background image slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    
    // For demo purposes, navigate directly without validation
    setTimeout(() => {
      // Call onLogin callback if provided
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }, 1000);
  };
  
  const handleSignUp = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    
    // For demo purposes, navigate directly to dashboard
    setTimeout(() => {
      // Call onLogin callback if provided
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }, 1000);
  };
  
  const handleReset = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    
    // Show success message
    setTimeout(() => {
      alert(`Reset email sent to ${email || 'your email'}!`);
      setActiveTab('login');
      setLoading(false);
    }, 1000);
  };
  
  const handleSocialLogin = (provider: string): void => {
    setLoading(true);
    
    // Go directly to dashboard
    setTimeout(() => {
      // Call onLogin callback if provided
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }, 1000);
  };
  
  // Calculate window width for responsive design
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 768;
  
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Left Panel - Image Side */}
      <div style={{
        display: windowWidth < 768 ? 'none' : 'block',
        width: '60%',
        backgroundColor: '#2b6cb0',
        backgroundImage: `url('${destinations[currentDestination].image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        transition: 'background-image 1s ease'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        
        {/* Content */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          padding: '40px',
          color: 'white'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '28px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '12px' }}>✈️</span> Travelink
            </h1>
            <p style={{ fontSize: '16px' }}>Discover Indonesia with local guides</p>
          </div>
          
          <h2 style={{
            fontSize: '42px',
            marginBottom: '24px',
            fontWeight: 'bold',
            lineHeight: 1.2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Explore the beauty of Indonesia with our trusted local guides
          </h2>
          
          <p style={{ fontSize: '18px', maxWidth: '500px' }}>
            From stunning beaches to vibrant cities and ancient temples,
            experience personalized travel adventures with knowledgeable local guides.
          </p>
          
          {/* Destination indicator */}
          <div style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {destinations.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: index === currentDestination ? "white" : "rgba(255, 255, 255, 0.5)",
                  margin: '0 6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onClick={() => setCurrentDestination(index)}
              ></div>
            ))}
          </div>
          
          {/* Current location label */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '8px 16px',
            borderRadius: '4px'
          }}>
            <p style={{ fontSize: '14px' }}>
              📍 {destinations[currentDestination].name}, Indonesia
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form Side */}
      <div style={{
        width: windowWidth < 768 ? '100%' : '40%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '90%',
          padding: '40px 20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{
              marginBottom: '8px',
              color: '#2d3748',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {activeTab === 'login' ? 'Sign in to Travelink' :
                activeTab === 'signup' ? 'Create your account' : 'Reset Password'}
            </h2>
            <p style={{ color: '#718096' }}>
              {activeTab === 'login' ? 'Welcome back! Please enter your details' :
                activeTab === 'signup' ? 'Join us and start exploring' : 'Enter your email to reset your password'}
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            marginBottom: '24px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div
              style={{
                padding: '12px',
                cursor: 'pointer',
                borderBottom: activeTab === 'login' ? '2px solid #3182ce' : 'none',
                color: activeTab === 'login' ? '#3182ce' : '#718096',
                fontWeight: activeTab === 'login' ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </div>
            <div
              style={{
                padding: '12px',
                cursor: 'pointer',
                borderBottom: activeTab === 'signup' ? '2px solid #3182ce' : 'none',
                color: activeTab === 'signup' ? '#3182ce' : '#718096',
                fontWeight: activeTab === 'signup' ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </div>
          </div>
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#4a5568'
                  }}>
                    Email or Username
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px' 
                  }}>
                    <label style={{
                      fontWeight: '500',
                      color: '#4a5568'
                    }}>
                      Password
                    </label>
                    <span
                      style={{
                        color: '#3182ce',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      onClick={() => setActiveTab('reset')}
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#f7fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease'
                      }}
                    />
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
                        color: '#718096',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#3182ce',
                    color: 'white',
                    padding: '12px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '16px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          )}
          
          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#4a5568'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#4a5568'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#4a5568'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#f7fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease'
                      }}
                    />
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
                        color: '#718096',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#4a5568'
                  }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#3182ce',
                    color: 'white',
                    padding: '12px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '16px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}
          
          {/* Reset Password Form */}
          {activeTab === 'reset' && (
            <form onSubmit={handleReset}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: '#4a5568', lineHeight: '1.6' }}>
                  Please enter your email to receive reset instructions
                </p>
                <div>
                  <label style={{
                    fontWeight: '500',
                    marginBottom: '8px',
                    display: 'block',
                    color: '#4a5568'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#f7fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#3182ce',
                    color: 'white',
                    padding: '12px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={loading}
                >
                  {loading ? "Sending Reset Email..." : "Reset Password"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#3182ce',
                    padding: '8px',
                    border: '1px solid #3182ce',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
          
          {/* Social Login */}
          {activeTab !== 'reset' && (
            <>
              <div style={{
                position: 'relative',
                margin: '32px 0',
                textAlign: 'center'
              }}>
                <div style={{
                  height: '1px',
                  backgroundColor: '#e2e8f0'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  padding: '0 16px'
                }}>
                  <span style={{
                    color: '#718096',
                    fontSize: '14px'
                  }}>
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  style={{
                    flex: 1,
                    backgroundColor: '#f56565',
                    color: 'white',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={loading}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  style={{
                    flex: 1,
                    backgroundColor: '#4299e1',
                    color: 'white',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={loading}
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  style={{
                    flex: 1,
                    backgroundColor: '#718096',
                    color: 'white',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  disabled={loading}
                >
                  Apple
                </button>
              </div>
            </>
          )}
          
          {/* Footer section */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#718096' }}>
              By signing in or creating an account, you agree to our{' '}
              <span style={{
                color: '#3182ce',
                cursor: 'pointer'
              }}>
                Terms & Conditions
              </span>{' '}
              and{' '}
              <span style={{
                color: '#3182ce',
                cursor: 'pointer'
              }}>
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;