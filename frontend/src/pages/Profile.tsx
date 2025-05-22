import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock user data
const userData = {
  name: 'Sarah Anderson',
  email: 'sarah.anderson@example.com',
  phone: '+62 821 1234 5678',
  location: 'Jakarta, Indonesia',
  joinedDate: 'January 2023',
  bookingsCount: 12,
  reviewsCount: 8,
  profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
};

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    location: userData.location
  });

  // Enhanced color scheme for better visibility
  const styles = {
    // Colors
    primaryColor: '#3182CE', // Blue 600
    primaryDark: '#2C5282', // Blue 800
    primaryLight: '#EBF8FF', // Blue 50
    textPrimary: '#1A202C', // Gray 900
    textSecondary: '#4A5568', // Gray 700
    textTertiary: '#718096', // Gray 600
    borderColor: '#E2E8F0', // Gray 200
    bgLight: '#F7FAFC', // Gray 50
    white: '#FFFFFF',
    dangerColor: '#E53E3E', // Red 600
    dangerLight: '#FFF5F5', // Red 50
    dangerBorder: '#FC8181', // Red 300
    
    // Typography
    headingLarge: '1.75rem',
    headingMedium: '1.5rem',
    headingSmall: '1.25rem',
    textRegular: '1rem',
    textSmall: '0.875rem',
    
    // Spacing
    spacingXs: '0.5rem',
    spacingSm: '0.75rem',
    spacingMd: '1rem',
    spacingLg: '1.5rem',
    spacingXl: '2rem',
    
    // Borders and effects
    borderRadius: '0.5rem',
    borderRadiusLg: '0.75rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    boxShadowHover: '0 10px 15px rgba(0,0,0,0.1)',
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send an API request to update the user's profile
    console.log('Profile update:', formData);
    
    // Simulate API call success
    setTimeout(() => {
      setIsEditing(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: styles.bgLight, 
      padding: styles.spacingXl,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Enhanced Header */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingMd, 
          marginBottom: styles.spacingXl, 
          borderRadius: styles.borderRadius, 
          boxShadow: styles.boxShadow,
          border: `1px solid ${styles.borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div 
              style={{ 
                fontWeight: 'bold', 
                fontSize: styles.headingMedium, 
                color: styles.primaryColor, 
                cursor: 'pointer' 
              }}
              onClick={() => navigate('/dashboard')}
            >
              Travelink
            </div>
            <div style={{ display: 'flex', gap: styles.spacingMd }}>
              <button 
                style={{ 
                  padding: `${styles.spacingSm} ${styles.spacingLg}`, 
                  backgroundColor: styles.white, 
                  color: styles.primaryColor, 
                  border: `2px solid ${styles.primaryColor}`, 
                  borderRadius: styles.borderRadius, 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: styles.textRegular,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primaryLight;
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = styles.white;
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
                onClick={() => navigate('/tours')}
              >
                Explore Tours
              </button>
              <button 
                style={{ 
                  padding: `${styles.spacingSm} ${styles.spacingLg}`, 
                  backgroundColor: styles.primaryColor, 
                  color: styles.white, 
                  border: 'none', 
                  borderRadius: styles.borderRadius, 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: styles.textRegular,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primaryDark;
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primaryColor;
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => navigate('/bookings')}
              >
                My Bookings
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Profile Header */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingXl, 
          borderRadius: styles.borderRadiusLg, 
          boxShadow: styles.boxShadow,
          marginBottom: styles.spacingXl,
          border: `1px solid ${styles.borderColor}`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: styles.spacingXl,
            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
          }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              overflow: 'hidden', 
              border: `3px solid ${styles.white}`,
              boxShadow: styles.boxShadow
            }}>
              <img 
                src={userData.profilePicture} 
                alt={userData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h1 style={{ 
                fontSize: styles.headingLarge, 
                fontWeight: 'bold', 
                margin: '0 0 0.5rem 0',
                color: styles.textPrimary
              }}>
                {userData.name}
              </h1>
              <div style={{ 
                display: 'inline-block',
                margin: '0 0 0.75rem 0', 
                backgroundColor: styles.primaryLight,
                color: styles.primaryColor,
                padding: `${styles.spacingXs} ${styles.spacingMd}`,
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: styles.textSmall
              }}>
                <span style={{ marginRight: '4px' }}>📍</span> {userData.location}
              </div>
              <p style={{ 
                margin: '0 0 0.5rem 0', 
                color: styles.textSecondary,
                fontSize: styles.textRegular
              }}>
                Member since {userData.joinedDate}
              </p>
              <div style={{ 
                display: 'flex', 
                gap: styles.spacingLg, 
                marginTop: styles.spacingMd,
                backgroundColor: styles.bgLight,
                padding: styles.spacingMd,
                borderRadius: styles.borderRadius,
                width: 'fit-content'
              }}>
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: styles.primaryColor,
                    fontSize: styles.headingSmall
                  }}>
                    {userData.bookingsCount}
                  </span>
                  <span style={{ 
                    color: styles.textSecondary,
                    marginLeft: '4px'
                  }}>
                    bookings
                  </span>
                </div>
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: styles.primaryColor,
                    fontSize: styles.headingSmall
                  }}>
                    {userData.reviewsCount}
                  </span>
                  <span style={{ 
                    color: styles.textSecondary,
                    marginLeft: '4px'
                  }}>
                    reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Tabs Navigation */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingMd, 
          borderRadius: styles.borderRadiusLg, 
          boxShadow: styles.boxShadow, 
          marginBottom: styles.spacingXl,
          border: `1px solid ${styles.borderColor}`
        }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: `1px solid ${styles.borderColor}`,
            overflowX: 'auto'
          }}>
            <div 
              style={{ 
                padding: `${styles.spacingMd} ${styles.spacingLg}`, 
                cursor: 'pointer',
                borderBottom: activeTab === 'profile' ? `3px solid ${styles.primaryColor}` : 'none',
                color: activeTab === 'profile' ? styles.primaryColor : styles.textSecondary,
                fontWeight: activeTab === 'profile' ? 'bold' : 'medium',
                backgroundColor: activeTab === 'profile' ? styles.primaryLight : 'transparent',
                borderTopLeftRadius: styles.borderRadius,
                borderTopRightRadius: styles.borderRadius,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </div>
            <div 
              style={{ 
                padding: `${styles.spacingMd} ${styles.spacingLg}`, 
                cursor: 'pointer',
                borderBottom: activeTab === 'bookings' ? `3px solid ${styles.primaryColor}` : 'none',
                color: activeTab === 'bookings' ? styles.primaryColor : styles.textSecondary,
                fontWeight: activeTab === 'bookings' ? 'bold' : 'medium',
                backgroundColor: activeTab === 'bookings' ? styles.primaryLight : 'transparent',
                borderTopLeftRadius: styles.borderRadius,
                borderTopRightRadius: styles.borderRadius,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings
            </div>
            <div 
              style={{ 
                padding: `${styles.spacingMd} ${styles.spacingLg}`, 
                cursor: 'pointer',
                borderBottom: activeTab === 'reviews' ? `3px solid ${styles.primaryColor}` : 'none',
                color: activeTab === 'reviews' ? styles.primaryColor : styles.textSecondary,
                fontWeight: activeTab === 'reviews' ? 'bold' : 'medium',
                backgroundColor: activeTab === 'reviews' ? styles.primaryLight : 'transparent',
                borderTopLeftRadius: styles.borderRadius,
                borderTopRightRadius: styles.borderRadius,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </div>
            <div 
              style={{ 
                padding: `${styles.spacingMd} ${styles.spacingLg}`, 
                cursor: 'pointer',
                borderBottom: activeTab === 'settings' ? `3px solid ${styles.primaryColor}` : 'none',
                color: activeTab === 'settings' ? styles.primaryColor : styles.textSecondary,
                fontWeight: activeTab === 'settings' ? 'bold' : 'medium',
                backgroundColor: activeTab === 'settings' ? styles.primaryLight : 'transparent',
                borderTopLeftRadius: styles.borderRadius,
                borderTopRightRadius: styles.borderRadius,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </div>
          </div>
        </div>
        
        {/* Enhanced Tab Content */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingXl, 
          borderRadius: styles.borderRadiusLg, 
          boxShadow: styles.boxShadow,
          border: `1px solid ${styles.borderColor}`
        }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: styles.spacingXl,
                alignItems: 'center',
                borderBottom: `2px solid ${styles.borderColor}`,
                paddingBottom: styles.spacingMd
              }}>
                <h2 style={{ 
                  fontSize: styles.headingMedium, 
                  fontWeight: 'bold',
                  color: styles.primaryColor
                }}>
                  Personal Information
                </h2>
                {!isEditing && (
                  <button 
                    style={{ 
                      padding: `${styles.spacingSm} ${styles.spacingLg}`, 
                      backgroundColor: styles.primaryLight, 
                      color: styles.primaryColor, 
                      border: `2px solid ${styles.primaryColor}`, 
                      borderRadius: styles.borderRadius, 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = styles.primaryLight;
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = styles.primaryLight;
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: styles.spacingLg }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: styles.spacingSm, 
                      fontWeight: 'bold',
                      color: styles.textPrimary
                    }}>
                      Full Name
                    </label>
                    <input 
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: styles.spacingMd, 
                        border: `1px solid ${styles.borderColor}`, 
                        borderRadius: styles.borderRadius,
                        fontSize: styles.textRegular,
                        color: styles.textPrimary,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.primaryColor;
                        e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = styles.borderColor;
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: styles.spacingLg }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: styles.spacingSm, 
                      fontWeight: 'bold',
                      color: styles.textPrimary 
                    }}>
                      Email Address
                    </label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: styles.spacingMd, 
                        border: `1px solid ${styles.borderColor}`, 
                        borderRadius: styles.borderRadius,
                        fontSize: styles.textRegular,
                        color: styles.textPrimary,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.primaryColor;
                        e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = styles.borderColor;
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: styles.spacingLg }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: styles.spacingSm, 
                      fontWeight: 'bold',
                      color: styles.textPrimary
                    }}>
                      Phone Number
                    </label>
                    <input 
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: styles.spacingMd, 
                        border: `1px solid ${styles.borderColor}`, 
                        borderRadius: styles.borderRadius,
                        fontSize: styles.textRegular,
                        color: styles.textPrimary,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.primaryColor;
                        e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = styles.borderColor;
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: styles.spacingLg }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: styles.spacingSm, 
                      fontWeight: 'bold',
                      color: styles.textPrimary 
                    }}>
                      Location
                    </label>
                    <input 
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      style={{ 
                        width: '100%', 
                        padding: styles.spacingMd, 
                        border: `1px solid ${styles.borderColor}`, 
                        borderRadius: styles.borderRadius,
                        fontSize: styles.textRegular,
                        color: styles.textPrimary,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = styles.primaryColor;
                        e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = styles.borderColor;
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                      }}
                    />
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: styles.spacingMd, 
                    justifyContent: 'flex-end',
                    borderTop: `1px solid ${styles.borderColor}`,
                    paddingTop: styles.spacingLg,
                    marginTop: styles.spacingXl
                  }}>
                    <button 
                      type="button"
                      style={{ 
                        padding: `${styles.spacingMd} ${styles.spacingXl}`, 
                        backgroundColor: styles.white, 
                        color: styles.textPrimary, 
                        border: `1px solid ${styles.borderColor}`, 
                        borderRadius: styles.borderRadius, 
                        cursor: 'pointer',
                        fontWeight: 'medium',
                        fontSize: styles.textRegular,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = styles.bgLight;
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = styles.white;
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                      }}
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={{ 
                        padding: `${styles.spacingMd} ${styles.spacingXl}`, 
                        backgroundColor: styles.primaryColor, 
                        color: styles.white, 
                        border: 'none', 
                        borderRadius: styles.borderRadius, 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: styles.textRegular,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = styles.primaryDark;
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = styles.primaryColor;
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: styles.spacingXl
                  }}>
                    <div style={{ 
                      backgroundColor: styles.bgLight,
                      padding: styles.spacingLg,
                      borderRadius: styles.borderRadius,
                      border: `1px solid ${styles.borderColor}`
                    }}>
                      <h3 style={{ 
                        fontSize: styles.textSmall, 
                        color: styles.textTertiary, 
                        marginBottom: styles.spacingSm,
                        fontWeight: 'bold'
                      }}>
                        Full Name
                      </h3>
                      <p style={{ 
                        fontWeight: 'bold',
                        color: styles.textPrimary,
                        fontSize: styles.textRegular
                      }}>
                        {userData.name}
                      </p>
                    </div>
                    <div style={{ 
                      backgroundColor: styles.bgLight,
                      padding: styles.spacingLg,
                      borderRadius: styles.borderRadius,
                      border: `1px solid ${styles.borderColor}`
                    }}>
                      <h3 style={{ 
                        fontSize: styles.textSmall, 
                        color: styles.textTertiary, 
                        marginBottom: styles.spacingSm,
                        fontWeight: 'bold'
                      }}>
                        Email Address
                      </h3>
                      <p style={{ 
                        fontWeight: 'bold',
                        color: styles.textPrimary,
                        fontSize: styles.textRegular
                      }}>
                        {userData.email}
                      </p>
                    </div>
                    <div style={{ 
                      backgroundColor: styles.bgLight,
                      padding: styles.spacingLg,
                      borderRadius: styles.borderRadius,
                      border: `1px solid ${styles.borderColor}`
                    }}>
                      <h3 style={{ 
                        fontSize: styles.textSmall, 
                        color: styles.textTertiary, 
                        marginBottom: styles.spacingSm,
                        fontWeight: 'bold'
                      }}>
                        Phone Number
                      </h3>
                      <p style={{ 
                        fontWeight: 'bold',
                        color: styles.textPrimary,
                        fontSize: styles.textRegular
                      }}>
                        {userData.phone}
                      </p>
                    </div>
                    <div style={{ 
                      backgroundColor: styles.bgLight,
                      padding: styles.spacingLg,
                      borderRadius: styles.borderRadius,
                      border: `1px solid ${styles.borderColor}`
                    }}>
                      <h3 style={{ 
                        fontSize: styles.textSmall, 
                        color: styles.textTertiary, 
                        marginBottom: styles.spacingSm,
                        fontWeight: 'bold'
                      }}>
                        Location
                      </h3>
                      <p style={{ 
                        fontWeight: 'bold',
                        color: styles.textPrimary,
                        fontSize: styles.textRegular
                      }}>
                        {userData.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <h2 style={{ 
                fontSize: styles.headingMedium, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                color: styles.primaryColor,
                borderBottom: `2px solid ${styles.borderColor}`,
                paddingBottom: styles.spacingMd
              }}>
                Your Bookings
              </h2>
              
              <div style={{ 
                textAlign: 'center', 
                padding: `${styles.spacingXl} 0`,
                backgroundColor: styles.bgLight,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.borderColor}`,
                marginTop: styles.spacingXl
              }}>
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  backgroundColor: styles.primaryLight,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: styles.spacingLg,
                  boxShadow: styles.boxShadow
                }}>
                  <span role="img" aria-label="bookings" style={{ fontSize: '2rem' }}>🗓️</span>
                </div>
                <p style={{ 
                  marginBottom: styles.spacingLg,
                  color: styles.textPrimary,
                  fontWeight: 'medium',
                  fontSize: styles.textRegular
                }}>
                  View all your bookings and manage your upcoming tours in one place
                </p>
                <button 
                  style={{ 
                    padding: `${styles.spacingMd} ${styles.spacingXl}`, 
                    backgroundColor: styles.primaryColor, 
                    color: styles.white, 
                    border: 'none', 
                    borderRadius: styles.borderRadius, 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: styles.textRegular,
                    boxShadow: styles.boxShadow,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryDark;
                    e.currentTarget.style.boxShadow = styles.boxShadowHover;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryColor;
                    e.currentTarget.style.boxShadow = styles.boxShadow;
                  }}
                  onClick={() => navigate('/bookings')}
                >
                  Go to Bookings
                </button>
              </div>
            </div>
          )}
          
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h2 style={{ 
                fontSize: styles.headingMedium, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                color: styles.primaryColor,
                borderBottom: `2px solid ${styles.borderColor}`,
                paddingBottom: styles.spacingMd
              }}>
                Your Reviews
              </h2>
              
              <div style={{ 
                backgroundColor: styles.primaryLight,
                border: `1px solid ${styles.borderColor}`,
                borderRadius: styles.borderRadius,
                padding: styles.spacingLg,
                marginBottom: styles.spacingXl
              }}>
                <p style={{ 
                  color: styles.textPrimary, 
                  marginBottom: styles.spacingMd,
                  fontWeight: 'medium',
                  fontSize: styles.textRegular
                }}>
                  You have written <span style={{ fontWeight: 'bold', color: styles.primaryColor }}>{userData.reviewsCount}</span> reviews for tours you've taken.
                </p>
                
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: styles.spacingSm,
                  color: styles.textSecondary
                }}>
                  <span role="img" aria-label="info" style={{ fontSize: '1.25rem' }}>ℹ️</span>
                  <p style={{ fontSize: styles.textSmall }}>
                    Your reviews help other travelers make better decisions!
                  </p>
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                padding: `${styles.spacingXl} 0`,
                backgroundColor: styles.bgLight,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.borderColor}`
              }}>
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#FFF8E1', // Yellow light
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: styles.spacingLg,
                  boxShadow: styles.boxShadow
                }}>
                  <span role="img" aria-label="star" style={{ fontSize: '2rem' }}>⭐</span>
                </div>
                <p style={{ 
                  marginBottom: styles.spacingLg,
                  color: styles.textPrimary,
                  fontWeight: 'medium',
                  fontSize: styles.textRegular
                }}>
                  View and manage all your reviews in the bookings section
                </p>
                <button 
                  style={{ 
                    padding: `${styles.spacingMd} ${styles.spacingXl}`, 
                    backgroundColor: styles.primaryColor, 
                    color: styles.white, 
                    border: 'none', 
                    borderRadius: styles.borderRadius, 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: styles.textRegular,
                    boxShadow: styles.boxShadow,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryDark;
                    e.currentTarget.style.boxShadow = styles.boxShadowHover;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryColor;
                    e.currentTarget.style.boxShadow = styles.boxShadow;
                  }}
                  onClick={() => navigate('/bookings')}
                >
                  Go to Bookings
                </button>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ 
                fontSize: styles.headingMedium, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                color: styles.primaryColor,
                borderBottom: `2px solid ${styles.borderColor}`,
                paddingBottom: styles.spacingMd
              }}>
                Account Settings
              </h2>
              
              <div style={{ marginBottom: styles.spacingXl }}>
                <h3 style={{ 
                  fontSize: styles.headingSmall, 
                  fontWeight: 'bold', 
                  marginBottom: styles.spacingMd,
                  color: styles.textPrimary
                }}>
                  Notification Preferences
                </h3>
                
                <div style={{ 
                  marginBottom: styles.spacingLg,
                  backgroundColor: styles.bgLight,
                  padding: styles.spacingLg,
                  borderRadius: styles.borderRadius,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: styles.spacingSm 
                  }}>
                    <input 
                      type="checkbox" 
                      id="emailNotif" 
                      defaultChecked 
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        accentColor: styles.primaryColor
                      }}
                    />
                    <label 
                      htmlFor="emailNotif" 
                      style={{ 
                        marginLeft: styles.spacingSm,
                        fontWeight: 'bold',
                        color: styles.textPrimary,
                        fontSize: styles.textRegular
                      }}
                    >
                      Email Notifications
                    </label>
                  </div>
                  <p style={{ 
                    fontSize: styles.textSmall, 
                    color: styles.textSecondary,
                    marginLeft: '26px'
                  }}>
                    Receive emails about your bookings, special offers, and travel tips
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: styles.bgLight,
                  padding: styles.spacingLg,
                  borderRadius: styles.borderRadius,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: styles.spacingSm 
                  }}>
                    <input 
                      type="checkbox" 
                      id="smsNotif" 
                      defaultChecked 
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        accentColor: styles.primaryColor
                      }}
                    />
                    <label 
                      htmlFor="smsNotif" 
                      style={{ 
                        marginLeft: styles.spacingSm,
                        fontWeight: 'bold',
                        color: styles.textPrimary,
                        fontSize: styles.textRegular
                      }}
                    >
                      SMS Notifications
                    </label>
                  </div>
                  <p style={{ 
                    fontSize: styles.textSmall, 
                    color: styles.textSecondary,
                    marginLeft: '26px'
                  }}>
                    Receive text messages for booking confirmations and updates
                  </p>
                </div>
              </div>
              
              <div style={{ 
                marginBottom: styles.spacingXl,
                backgroundColor: styles.bgLight,
                padding: styles.spacingLg,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.borderColor}`
              }}>
                <h3 style={{ 
                  fontSize: styles.headingSmall, 
                  fontWeight: 'bold', 
                  marginBottom: styles.spacingMd,
                  color: styles.textPrimary
                }}>
                  Password
                </h3>
                
                <button 
                  style={{ 
                    padding: `${styles.spacingSm} ${styles.spacingLg}`, 
                    backgroundColor: styles.primaryLight, 
                    color: styles.primaryColor, 
                    border: `2px solid ${styles.primaryColor}`, 
                    borderRadius: styles.borderRadius, 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: styles.textRegular,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: styles.spacingSm
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#DBEAFE'; // Slightly darker blue light
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryLight;
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🔒</span>
                  Change Password
                </button>
              </div>
              
              <div style={{ 
                backgroundColor: styles.dangerLight,
                padding: styles.spacingLg,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.dangerBorder}`
              }}>
                <h3 style={{ 
                  fontSize: styles.headingSmall, 
                  fontWeight: 'bold', 
                  marginBottom: styles.spacingMd, 
                  color: styles.dangerColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: styles.spacingSm
                }}>
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span> Danger Zone
                </h3>
                
                <button 
                  style={{ 
                    padding: `${styles.spacingSm} ${styles.spacingLg}`, 
                    backgroundColor: styles.dangerLight, 
                    color: styles.dangerColor, 
                    border: `2px solid ${styles.dangerColor}`, 
                    borderRadius: styles.borderRadius, 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: styles.textRegular,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: styles.spacingSm
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = styles.dangerColor;
                    e.currentTarget.style.color = styles.white;
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = styles.dangerLight;
                    e.currentTarget.style.color = styles.dangerColor;
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🗑️</span>
                  Delete Account
                </button>
              </div>
            </div>
          )}a
        </div>
      </div>
    </div>
  );
};

export default Profile;