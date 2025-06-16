import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onLogin?: () => void;
}

interface Destination {
  name: string;
  image: string;
  description: string;
}

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

const BASE_INPUT_BORDER_COLOR = '#dee2e6';
const FOCUSED_INPUT_BORDER_COLOR = '#007bff';

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
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isHoveringSocialGoogle, setIsHoveringSocialGoogle] = useState(false);
  const [isHoveringSocialFacebook, setIsHoveringSocialFacebook] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }, 1000);
  };

  const handleSignUp = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }, 1000);
  };

  const handleReset = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      alert(`Reset email sent to ${email || 'your email'}!`);
      setActiveTab('login');
      setLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: string): void => {
    setLoading(true);
    console.log(`Attempting login with ${provider}`);
    setTimeout(() => {
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }, 1000);
  };

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 768;

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


  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#eef2f9',
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
    }}>
      <div style={{
        display: windowWidth < 768 ? 'none' : 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '55%',
        backgroundColor: '#1a202c',
        backgroundImage: `url('${destinations[currentDestination].image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        transition: 'background-image 1s ease-in-out',
        padding: '60px',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)', 
          zIndex: 1,
        }}></div>

        <div style={{ 
          position: 'relative',
          zIndex: 2,
          color: 'white'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '32px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '700',
            }}>
              <span style={{ marginRight: '16px', fontSize: '36px' }}>✈️</span> Travelink
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>Discover Indonesia with local guides</p>
          </div>

          <h2 style={{
            fontSize: '48px',
            marginBottom: '28px',
            fontWeight: 'bold',
            lineHeight: 1.3,
            textShadow: '0 2px 5px rgba(0, 0, 0, 0.5)'
          }}>
            {destinations[currentDestination].description}
          </h2>

          <p style={{ fontSize: '20px', maxWidth: '550px', opacity: 0.95, lineHeight: 1.7 }}>
            From stunning beaches to vibrant cities and ancient temples,
            experience personalized travel adventures with knowledgeable local guides.
          </p>
        </div>
        
        <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
            }}>
            {destinations.map((_, index) => (
                <div
                key={index}
                style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: index === currentDestination ? "white" : "rgba(255, 255, 255, 0.4)",
                    margin: '0 5px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease, transform 0.3s ease',
                    transform: index === currentDestination ? 'scale(1.2)' : 'scale(1)',
                }}
                onClick={() => setCurrentDestination(index)}
                ></div>
            ))}
            </div>
            <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 18px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}>
            <p style={{
              fontSize: '16px',
              margin: 0,
              color: '#FFFFFF', 
              fontWeight: '600', 
              textShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}>
                📍 {destinations[currentDestination].name}, Indonesia
            </p>
            </div>
        </div>
      </div>

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

          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
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
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />
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
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      style={inputStyle}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
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
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
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
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      style={inputStyle}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
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
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />
                </div>

                <button
                  type="submit"
                  style={isHoveringSubmit ? {...primaryButtonStyle, ...primaryButtonHoverStyle} : primaryButtonStyle}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'reset' && (
            <form onSubmit={handleReset}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ color: '#495057', lineHeight: '1.6', fontSize: '15px', textAlign: 'center' }}>
                  Enter the email address associated with your account, and we'll send you a link to reset your password.
                </p>
                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block', color: '#343a40' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = FOCUSED_INPUT_BORDER_COLOR}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = BASE_INPUT_BORDER_COLOR}
                  />
                </div>

                <button
                  type="submit"
                  style={isHoveringSubmit ? {...primaryButtonStyle, ...primaryButtonHoverStyle} : primaryButtonStyle}
                  onMouseEnter={() => setIsHoveringSubmit(true)}
                  onMouseLeave={() => setIsHoveringSubmit(false)}
                  disabled={loading}
                >
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    padding: '10px',
                    border: '1px solid #007bff',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    alignSelf: 'center',
                    width: 'auto',
                    marginTop: '8px',
                    transition: 'all 0.2s ease',
                  }}
                   onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                        e.currentTarget.style.borderColor = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = '#007bff';
                    }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {activeTab !== 'reset' && (
            <>
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
                    fontSize: '13px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                  }}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { provider: 'Google', color: '#DB4437', hoverColor: '#C33D2E', icon: 'G', stateSetter: setIsHoveringSocialGoogle, isHovering: isHoveringSocialGoogle },
                  { provider: 'Facebook', color: '#4267B2', hoverColor: '#365899', icon: 'f', stateSetter: setIsHoveringSocialFacebook, isHovering: isHoveringSocialFacebook },
                ].map(({ provider, color, hoverColor, icon, stateSetter, isHovering }) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleSocialLogin(provider)}
                    style={{
                      ...buttonBaseStyle,
                      backgroundColor: isHovering ? hoverColor : color,
                      color: 'white',
                      marginTop: '0',
                      ...(isHovering && { boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', transform: 'translateY(-1px)'}),
                    }}
                    onMouseEnter={() => stateSetter(true)}
                    onMouseLeave={() => stateSetter(false)}
                    disabled={loading}
                  >
                    <span style={{ fontSize: '18px', width: '20px', textAlign: 'center' }}>{icon}</span>
                    Sign in with {provider}
                  </button>
                ))}
                </div>
            </>
          )}

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
    </div>
  );
};

export default Auth;