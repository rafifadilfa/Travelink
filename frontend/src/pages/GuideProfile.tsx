import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GuideProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Simple guide data
  const guideData = {
    name: 'Sarah Johnson',
    location: 'Bali, Indonesia',
    rating: 4.9,
    reviews: 189,
    languages: ['English', 'Indonesian', 'Japanese'],
    specialties: ['Cultural Tours', 'Beach Activities', 'Adventure Sports'],
    experience: '5+ years'
  };

  // Enhanced color scheme for better visibility
  const styles = {
    // Colors
    primaryColor: '#3182CE', // Blue 600
    primaryDark: '#2C5282', // Blue 800
    primaryLight: '#EBF8FF', // Blue 50
    textPrimary: '#1A202C', // Gray 900
    textSecondary: '#4A5568', // Gray 700
    accentYellow: '#F6E05E', // Yellow 400
    borderColor: '#E2E8F0', // Gray 200
    white: '#FFFFFF',
    
    // Typography
    headingLarge: '1.75rem',
    headingMedium: '1.5rem',
    headingSmall: '1.25rem',
    textMedium: '1rem',
    textSmall: '0.875rem',
    
    // Spacing
    spacingXs: '0.5rem',
    spacingSm: '0.75rem',
    spacingMd: '1rem',
    spacingLg: '1.5rem',
    spacingXl: '2rem',
    
    // Borders
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    boxShadowHover: '0 10px 15px rgba(0,0,0,0.1)',
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: styles.spacingLg,
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
                  fontSize: styles.textMedium,
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
                  fontSize: styles.textMedium,
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
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Guide Profile */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingXl, 
          borderRadius: styles.borderRadius, 
          boxShadow: styles.boxShadow,
          marginBottom: styles.spacingXl,
          border: `1px solid ${styles.borderColor}`
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacingLg }}>
            {/* Profile Header with Enhanced Styling */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: styles.spacingLg,
              padding: styles.spacingLg,
              backgroundColor: styles.primaryLight,
              borderRadius: styles.borderRadius,
              border: `1px solid ${styles.borderColor}`
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
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt={guideData.name}
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
                  {guideData.name}
                </h1>
                <div style={{ 
                  display: 'inline-block',
                  margin: '0 0 0.75rem 0', 
                  backgroundColor: styles.primaryColor,
                  color: styles.white,
                  padding: `${styles.spacingXs} ${styles.spacingMd}`,
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: styles.textSmall
                }}>
                  <span style={{ marginRight: '4px' }}>📍</span> {guideData.location}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: `${styles.spacingXs} ${styles.spacingMd}`,
                  backgroundColor: styles.white,
                  borderRadius: '20px',
                  width: 'fit-content',
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <span style={{ color: styles.accentYellow, fontSize: styles.textMedium, marginRight: '4px' }}>★</span>
                  <span style={{ fontWeight: 'bold', color: styles.textPrimary }}>{guideData.rating}</span>
                  <span style={{ color: styles.textSecondary, marginLeft: '4px' }}>({guideData.reviews} reviews)</span>
                </div>
              </div>
              
              {/* Quick Info Cards */}
              <div style={{
                marginLeft: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: styles.spacingSm
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: styles.white,
                  padding: styles.spacingSm,
                  borderRadius: styles.borderRadius,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <span style={{ color: styles.primaryColor, marginRight: styles.spacingSm, fontSize: styles.textMedium }}>
                    🌐
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: styles.textSmall, color: styles.textSecondary }}>
                      Languages
                    </div>
                    <div style={{ fontWeight: 'medium', color: styles.textPrimary }}>
                      {guideData.languages.join(', ')}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: styles.white,
                  padding: styles.spacingSm,
                  borderRadius: styles.borderRadius,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <span style={{ color: styles.primaryColor, marginRight: styles.spacingSm, fontSize: styles.textMedium }}>
                    ⏱️
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: styles.textSmall, color: styles.textSecondary }}>
                      Experience
                    </div>
                    <div style={{ fontWeight: 'medium', color: styles.textPrimary }}>
                      {guideData.experience}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* About Section */}
            <div style={{ 
              marginTop: styles.spacingMd,
              backgroundColor: styles.white,
              padding: styles.spacingLg,
              borderRadius: styles.borderRadius,
              border: `1px solid ${styles.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: styles.headingMedium, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingMd,
                color: styles.primaryColor,
                borderBottom: `2px solid ${styles.primaryLight}`,
                paddingBottom: styles.spacingXs
              }}>
                About Me
              </h2>
              <p style={{ 
                color: styles.textPrimary, 
                lineHeight: '1.7',
                fontSize: styles.textMedium
              }}>
                Professional travel guide with 5+ years of experience in Bali. Specialized in cultural tours and beach activities. 
                I love sharing the beauty and culture of Indonesia with travelers from around the world.
              </p>
              
              <div style={{ 
                marginTop: styles.spacingLg,
                display: 'flex',
                gap: styles.spacingMd,
                flexWrap: 'wrap'
              }}>
                {guideData.specialties.map((specialty, index) => (
                  <div key={index} style={{
                    backgroundColor: styles.primaryLight,
                    color: styles.primaryColor,
                    padding: `${styles.spacingXs} ${styles.spacingMd}`,
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: styles.textSmall,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '6px' }}>✓</span> {specialty}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tour Offerings */}
            <div style={{ marginTop: styles.spacingMd }}>
              <h2 style={{ 
                fontSize: styles.headingMedium, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                color: styles.primaryColor,
                borderBottom: `2px solid ${styles.primaryLight}`,
                paddingBottom: styles.spacingXs
              }}>
                Tour Offerings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: styles.spacingMd }}>
                {/* Tour Card 1 */}
                <div style={{ 
                  padding: styles.spacingLg, 
                  border: `1px solid ${styles.borderColor}`, 
                  borderRadius: styles.borderRadius,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = styles.boxShadowHover;
                  e.currentTarget.style.borderColor = styles.primaryColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = styles.borderColor;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ 
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: styles.primaryColor,
                    color: styles.white,
                    padding: `${styles.spacingXs} ${styles.spacingMd}`,
                    borderBottomLeftRadius: styles.borderRadius,
                    fontWeight: 'bold',
                    fontSize: styles.textSmall
                  }}>
                    Morning Tour
                  </div>
                  <h3 style={{ 
                    fontSize: styles.headingSmall, 
                    fontWeight: 'bold', 
                    marginBottom: styles.spacingSm,
                    color: styles.textPrimary
                  }}>
                    Jungle ATV Adventure
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: styles.spacingLg,
                    marginBottom: styles.spacingMd
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: styles.textSecondary
                    }}>
                      <span>⏱️</span>
                      <span>3 hours</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: styles.textSecondary
                    }}>
                      <span>🌄</span>
                      <span>Morning</span>
                    </div>
                  </div>
                  <p style={{ marginBottom: styles.spacingMd, color: styles.textSecondary }}>
                    Experience the thrill of riding ATVs through Bali's lush jungle terrain. Perfect for adventure seekers!
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      color: styles.primaryColor,
                      fontSize: styles.headingSmall 
                    }}>
                      Rp 750,000<span style={{ fontSize: styles.textSmall, fontWeight: 'normal', color: styles.textSecondary }}>/person</span>
                    </p>
                    <button style={{
                      backgroundColor: styles.primaryColor,
                      color: styles.white,
                      border: 'none',
                      borderRadius: styles.borderRadius,
                      padding: `${styles.spacingXs} ${styles.spacingMd}`,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>View Details</button>
                  </div>
                </div>

                {/* Tour Card 2 */}
                <div style={{ 
                  padding: styles.spacingLg, 
                  border: `1px solid ${styles.borderColor}`, 
                  borderRadius: styles.borderRadius,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = styles.boxShadowHover;
                  e.currentTarget.style.borderColor = styles.primaryColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = styles.borderColor;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ 
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: '#805AD5', // Purple for midday
                    color: styles.white,
                    padding: `${styles.spacingXs} ${styles.spacingMd}`,
                    borderBottomLeftRadius: styles.borderRadius,
                    fontWeight: 'bold',
                    fontSize: styles.textSmall
                  }}>
                    Midday Tour
                  </div>
                  <h3 style={{ 
                    fontSize: styles.headingSmall, 
                    fontWeight: 'bold', 
                    marginBottom: styles.spacingSm,
                    color: styles.textPrimary
                  }}>
                    Thrilling Watersports in Nusa Dua
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: styles.spacingLg,
                    marginBottom: styles.spacingMd
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: styles.textSecondary
                    }}>
                      <span>⏱️</span>
                      <span>4 hours</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: styles.textSecondary
                    }}>
                      <span>🌞</span>
                      <span>Midday</span>
                    </div>
                  </div>
                  <p style={{ marginBottom: styles.spacingMd, color: styles.textSecondary }}>
                    Try various exciting watersports activities including jet skiing, parasailing, and banana boat rides.
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      color: styles.primaryColor,
                      fontSize: styles.headingSmall 
                    }}>
                      Rp 950,000<span style={{ fontSize: styles.textSmall, fontWeight: 'normal', color: styles.textSecondary }}>/person</span>
                    </p>
                    <button style={{
                      backgroundColor: styles.primaryColor,
                      color: styles.white,
                      border: 'none',
                      borderRadius: styles.borderRadius,
                      padding: `${styles.spacingXs} ${styles.spacingMd}`,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>View Details</button>
                  </div>
                </div>

                {/* Tour Card 3 */}
                <div style={{ 
                  padding: styles.spacingLg, 
                  border: `1px solid ${styles.borderColor}`, 
                  borderRadius: styles.borderRadius,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = styles.boxShadowHover;
                  e.currentTarget.style.borderColor = styles.primaryColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = styles.borderColor;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ 
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: '#DD6B20', // Orange for evening
                    color: styles.white,
                    padding: `${styles.spacingXs} ${styles.spacingMd}`,
                    borderBottomLeftRadius: styles.borderRadius,
                    fontWeight: 'bold',
                    fontSize: styles.textSmall
                  }}>
                    Evening Tour
                  </div>
                  <h3 style={{ 
                    fontSize: styles.headingSmall, 
                    fontWeight: 'bold', 
                    marginBottom: styles.spacingSm,
                    color: styles.textPrimary
                  }}>
                    Sunset Seafood Dinner by the Ocean
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: styles.spacingLg,
                    marginBottom: styles.spacingMd
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: styles.textSecondary
                    }}>
                      <span>⏱️</span>
                      <span>3 hours</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: styles.textSecondary
                    }}>
                      <span>🌅</span>
                      <span>Evening</span>
                    </div>
                  </div>
                  <p style={{ marginBottom: styles.spacingMd, color: styles.textSecondary }}>
                    Enjoy a luxurious seafood dinner at Jimbaran Bay while watching the stunning sunset over the ocean.
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      color: styles.primaryColor,
                      fontSize: styles.headingSmall 
                    }}>
                      Rp 1,200,000<span style={{ fontSize: styles.textSmall, fontWeight: 'normal', color: styles.textSecondary }}>/person</span>
                    </p>
                    <button style={{
                      backgroundColor: styles.primaryColor,
                      color: styles.white,
                      border: 'none',
                      borderRadius: styles.borderRadius,
                      padding: `${styles.spacingXs} ${styles.spacingMd}`,
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}>View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            marginTop: styles.spacingXl, 
            display: 'flex', 
            justifyContent: 'space-between',
            borderTop: `1px solid ${styles.borderColor}`,
            paddingTop: styles.spacingLg
          }}>
            <button 
              style={{ 
                padding: `${styles.spacingMd} ${styles.spacingXl}`, 
                backgroundColor: styles.white,
                color: styles.primaryColor, 
                border: `2px solid ${styles.primaryColor}`, 
                borderRadius: styles.borderRadius, 
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.primaryLight;
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.white;
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
              onClick={() => navigate(`/chat/${id}`)}
            >
              <span>💬</span> Message Guide
            </button>
            <button 
              style={{ 
                padding: `${styles.spacingMd} ${styles.spacingXl}`, 
                backgroundColor: '#38A169', // Green 600
                color: styles.white, 
                border: 'none', 
                borderRadius: styles.borderRadius, 
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2F855A'; // Green 700
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#38A169'; // Green 600
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
              onClick={() => navigate(`/payment/${id}`)}
            >
              <span>🗓️</span> Book a Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfile;