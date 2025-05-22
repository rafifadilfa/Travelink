// Enhanced Chat component with improved visibility and styling
function Chat() {
  // Enhanced color scheme for better visibility
  const styles = {
    // Colors
    primaryColor: '#3182CE', // blue.600
    primaryDark: '#2C5282', // blue.800
    primaryLight: '#EBF8FF', // blue.50
    primaryLighter: '#F0F9FF',
    secondaryColor: '#38A169', // green.600
    textPrimary: '#1A202C', // gray.900
    textSecondary: '#4A5568', // gray.700
    textTertiary: '#718096', // gray.600
    borderColor: '#E2E8F0', // gray.200
    bgLight: '#F7FAFC', // gray.50
    white: '#FFFFFF',
    
    // Spacing
    spacingXs: '5px',
    spacingSm: '10px',
    spacingMd: '15px',
    spacingLg: '20px',
    spacingXl: '30px',
    
    // Borders and effects
    borderRadius: '8px',
    borderRadiusLg: '12px',
    borderRadiusXl: '16px',
    borderRadiusFull: '9999px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    boxShadowMd: '0 4px 6px rgba(0,0,0,0.1)',
    boxShadowLg: '0 10px 15px rgba(0,0,0,0.1)',
    
    // Typography
    fontSizeXs: '12px',
    fontSizeSm: '14px',
    fontSizeMd: '16px',
    fontSizeLg: '18px',
    fontSizeXl: '24px',
    fontSizeXxl: '30px',
    fontWeightMedium: '500',
    fontWeightBold: '700',
  };

  return (
    <div style={{ 
      padding: styles.spacingLg, 
      minHeight: '100vh',
      backgroundColor: styles.bgLight,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        boxShadow: styles.boxShadowLg,
        borderRadius: styles.borderRadiusLg,
        backgroundColor: styles.white,
        overflow: 'hidden',
        border: `1px solid ${styles.borderColor}`
      }}>
        <div style={{ 
          backgroundColor: styles.primaryColor, 
          padding: styles.spacingLg,
          color: styles.white,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: styles.fontSizeXl,
            fontWeight: styles.fontWeightBold
          }}>
            Messages
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: styles.spacingSm,
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: `${styles.spacingXs} ${styles.spacingMd}`,
            borderRadius: styles.borderRadiusFull
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#38A169' // green
            }}></div>
            <span style={{ fontSize: styles.fontSizeSm }}>3 active conversations</span>
          </div>
        </div>
        
        <div style={{ display: "flex", height: "80vh" }}>
          {/* Conversation list with improved styling */}
          <div style={{ 
            width: "350px", 
            borderRight: `1px solid ${styles.borderColor}`, 
            backgroundColor: styles.white,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: styles.spacingLg, 
              borderBottom: `1px solid ${styles.borderColor}`,
              backgroundColor: styles.bgLight
            }}>
              <div style={{
                position: 'relative',
                marginBottom: styles.spacingSm
              }}>
                <input 
                  placeholder="Search conversations..." 
                  style={{
                    width: '100%',
                    padding: `${styles.spacingMd} ${styles.spacingLg} ${styles.spacingMd} ${styles.spacingXl}`,
                    borderRadius: styles.borderRadius,
                    border: `1px solid ${styles.borderColor}`,
                    fontSize: styles.fontSizeMd,
                    backgroundColor: styles.white,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: styles.spacingSm,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: styles.textTertiary
                }}>
                  🔍
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: styles.spacingSm
              }}>
                <button style={{
                  flex: 1,
                  padding: `${styles.spacingXs} ${styles.spacingSm}`,
                  backgroundColor: styles.primaryColor,
                  color: styles.white,
                  border: 'none',
                  borderRadius: styles.borderRadius,
                  fontWeight: styles.fontWeightBold,
                  fontSize: styles.fontSizeSm,
                  cursor: 'pointer'
                }}>
                  All
                </button>
                <button style={{
                  flex: 1,
                  padding: `${styles.spacingXs} ${styles.spacingSm}`,
                  backgroundColor: styles.white,
                  color: styles.textPrimary,
                  border: `1px solid ${styles.borderColor}`,
                  borderRadius: styles.borderRadius,
                  fontWeight: styles.fontWeightMedium,
                  fontSize: styles.fontSizeSm,
                  cursor: 'pointer'
                }}>
                  Guides
                </button>
                <button style={{
                  flex: 1,
                  padding: `${styles.spacingXs} ${styles.spacingSm}`,
                  backgroundColor: styles.white,
                  color: styles.textPrimary,
                  border: `1px solid ${styles.borderColor}`,
                  borderRadius: styles.borderRadius,
                  fontWeight: styles.fontWeightMedium,
                  fontSize: styles.fontSizeSm,
                  cursor: 'pointer'
                }}>
                  Support
                </button>
              </div>
            </div>

            <div style={{ 
              overflow: 'auto',
              flex: 1,
              padding: styles.spacingSm
            }}>
              <div style={{ 
                padding: styles.spacingMd, 
                backgroundColor: styles.primaryLighter, 
                borderRadius: styles.borderRadius, 
                marginBottom: styles.spacingMd, 
                cursor: "pointer",
                border: `2px solid ${styles.primaryColor}`,
                boxShadow: styles.boxShadow,
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    width: "50px", 
                    height: "50px", 
                    borderRadius: "50%", 
                    backgroundColor: styles.primaryColor, 
                    marginRight: styles.spacingMd,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: styles.white,
                    fontWeight: styles.fontWeightBold,
                    boxShadow: styles.boxShadow,
                    border: `2px solid ${styles.white}`
                  }}>
                    SW
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: styles.fontWeightBold, 
                      fontSize: styles.fontSizeMd,
                      marginBottom: '2px',
                      color: styles.textPrimary
                    }}>
                      Sarah Wilson
                    </div>
                    <div style={{ 
                      fontSize: styles.fontSizeSm, 
                      color: styles.textSecondary 
                    }}>
                      Hi there, your beach tour is set for tomorrow
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    <div style={{
                      fontSize: styles.fontSizeXs,
                      color: styles.textTertiary
                    }}>
                      10:32 AM
                    </div>
                    <div style={{
                      backgroundColor: styles.primaryColor,
                      color: styles.white,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: styles.fontSizeXs,
                      fontWeight: styles.fontWeightBold
                    }}>
                      3
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: styles.spacingMd, 
                backgroundColor: styles.white,
                borderRadius: styles.borderRadius, 
                marginBottom: styles.spacingMd, 
                cursor: "pointer",
                border: `1px solid ${styles.borderColor}`,
                transition: 'all 0.2s ease',
                _hover: {
                  backgroundColor: styles.bgLight,
                  boxShadow: styles.boxShadow
                }
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.bgLight;
                e.currentTarget.style.boxShadow = styles.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.white;
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    width: "50px", 
                    height: "50px", 
                    borderRadius: "50%", 
                    backgroundColor: styles.primaryColor, 
                    marginRight: styles.spacingMd,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: styles.white,
                    fontWeight: styles.fontWeightBold
                  }}>
                    MC
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: styles.fontWeightBold, 
                      fontSize: styles.fontSizeMd,
                      marginBottom: '2px',
                      color: styles.textPrimary
                    }}>
                      Mike Chen
                    </div>
                    <div style={{ 
                      fontSize: styles.fontSizeSm, 
                      color: styles.textSecondary 
                    }}>
                      Please confirm your booking details
                    </div>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: styles.fontSizeXs,
                    color: styles.textTertiary
                  }}>
                    Yesterday
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: styles.spacingMd, 
                backgroundColor: styles.white,
                borderRadius: styles.borderRadius, 
                marginBottom: styles.spacingMd, 
                cursor: "pointer",
                border: `1px solid ${styles.borderColor}`,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.bgLight;
                e.currentTarget.style.boxShadow = styles.boxShadow;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.white;
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    width: "50px", 
                    height: "50px", 
                    borderRadius: "50%", 
                    backgroundColor: '#805AD5', // Purple for support
                    marginRight: styles.spacingMd,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: styles.white,
                    fontWeight: styles.fontWeightBold
                  }}>
                    TS
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: styles.fontWeightBold, 
                      fontSize: styles.fontSizeMd,
                      marginBottom: '2px',
                      color: styles.textPrimary
                    }}>
                      Travelink Support
                    </div>
                    <div style={{ 
                      fontSize: styles.fontSizeSm, 
                      color: styles.textSecondary 
                    }}>
                      How can we help you today?
                    </div>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: styles.fontSizeXs,
                    color: styles.textTertiary
                  }}>
                    Monday
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat area with improved styling */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Chat header */}
            <div style={{ 
              padding: styles.spacingMd, 
              borderBottom: `1px solid ${styles.borderColor}`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              backgroundColor: styles.white
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ 
                  width: "50px", 
                  height: "50px", 
                  borderRadius: "50%", 
                  backgroundColor: styles.primaryColor, 
                  marginRight: styles.spacingMd,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: styles.white,
                  fontWeight: styles.fontWeightBold,
                  boxShadow: styles.boxShadow
                }}>
                  SW
                </div>
                <div>
                  <div style={{ 
                    fontWeight: styles.fontWeightBold, 
                    fontSize: styles.fontSizeLg,
                    color: styles.textPrimary
                  }}>
                    Sarah Wilson
                  </div>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: styles.secondaryColor
                    }}></div>
                    <div style={{ 
                      fontSize: styles.fontSizeSm, 
                      color: styles.secondaryColor,
                      fontWeight: styles.fontWeightMedium
                    }}>
                      Online
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: styles.spacingSm
              }}>
                <button 
                  style={{ 
                    padding: `${styles.spacingXs} ${styles.spacingMd}`, 
                    backgroundColor: styles.white, 
                    color: styles.primaryColor,
                    border: `2px solid ${styles.primaryColor}`,
                    borderRadius: styles.borderRadius, 
                    cursor: "pointer",
                    fontWeight: styles.fontWeightBold,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryLight;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = styles.white;
                  }}
                  onClick={() => window.history.back()}
                >
                  View Profile
                </button>
                
                <button 
                  style={{ 
                    padding: `${styles.spacingXs} ${styles.spacingMd}`, 
                    backgroundColor: styles.primaryColor, 
                    color: styles.white, 
                    border: 'none', 
                    borderRadius: styles.borderRadius, 
                    cursor: "pointer",
                    fontWeight: styles.fontWeightBold,
                    boxShadow: styles.boxShadow,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryDark;
                    e.currentTarget.style.boxShadow = styles.boxShadowMd;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = styles.primaryColor;
                    e.currentTarget.style.boxShadow = styles.boxShadow;
                  }}
                  onClick={() => window.history.back()}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              padding: styles.spacingMd, 
              backgroundColor: styles.bgLight, 
              overflowY: "auto",
              display: 'flex',
              flexDirection: 'column',
              gap: styles.spacingMd
            }}>
              <div style={{ 
                textAlign: "center", 
                margin: `${styles.spacingMd} 0` 
              }}>
                <span style={{ 
                  backgroundColor: styles.borderColor, 
                  padding: `${styles.spacingXs} ${styles.spacingMd}`, 
                  borderRadius: styles.borderRadiusFull, 
                  fontSize: styles.fontSizeXs,
                  fontWeight: styles.fontWeightMedium,
                  color: styles.textSecondary
                }}>
                  Today
                </span>
              </div>

              {/* Received message with improved styling */}
              <div style={{ display: "flex", marginBottom: styles.spacingMd }}>
                <div style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: styles.primaryColor, 
                  marginRight: styles.spacingMd,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: styles.white,
                  fontWeight: styles.fontWeightBold,
                  fontSize: styles.fontSizeXs
                }}>
                  SW
                </div>
                <div style={{ 
                  backgroundColor: styles.white, 
                  padding: styles.spacingMd, 
                  borderRadius: styles.borderRadiusLg, 
                  maxWidth: "70%",
                  boxShadow: styles.boxShadow,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <div style={{
                    color: styles.textPrimary,
                    fontWeight: styles.fontWeightMedium,
                    fontSize: styles.fontSizeMd
                  }}>
                    Hi there, your beach tour is set for tomorrow
                  </div>
                  <div style={{ 
                    fontSize: styles.fontSizeXs, 
                    textAlign: "right", 
                    color: styles.textTertiary, 
                    marginTop: styles.spacingXs 
                  }}>
                    10:15 AM
                  </div>
                </div>
              </div>

              {/* Sent message with improved styling */}
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                marginBottom: styles.spacingMd 
              }}>
                <div style={{ 
                  backgroundColor: styles.primaryColor, 
                  color: styles.white, 
                  padding: styles.spacingMd, 
                  borderRadius: styles.borderRadiusLg, 
                  maxWidth: "70%",
                  boxShadow: styles.boxShadow
                }}>
                  <div style={{
                    fontWeight: styles.fontWeightMedium,
                    fontSize: styles.fontSizeMd
                  }}>
                    Great! What time should I be ready?
                  </div>
                  <div style={{ 
                    fontSize: styles.fontSizeXs, 
                    textAlign: "right", 
                    color: "rgba(255,255,255,0.8)", 
                    marginTop: styles.spacingXs,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                  }}>
                    <span>10:20 AM</span>
                    <span style={{ fontSize: '10px' }}>✓✓</span>
                  </div>
                </div>
              </div>

              {/* Received message */}
              <div style={{ display: "flex", marginBottom: styles.spacingMd }}>
                <div style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: styles.primaryColor, 
                  marginRight: styles.spacingMd,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: styles.white,
                  fontWeight: styles.fontWeightBold,
                  fontSize: styles.fontSizeXs
                }}>
                  SW
                </div>
                <div style={{ 
                  backgroundColor: styles.white, 
                  padding: styles.spacingMd, 
                  borderRadius: styles.borderRadiusLg, 
                  maxWidth: "70%",
                  boxShadow: styles.boxShadow,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <div style={{
                    color: styles.textPrimary,
                    fontWeight: styles.fontWeightMedium,
                    fontSize: styles.fontSizeMd
                  }}>
                    The pickup is scheduled for 8:30 AM from your hotel. Make sure to bring sunscreen, a hat, and a swimsuit!
                  </div>
                  <div style={{ 
                    fontSize: styles.fontSizeXs, 
                    textAlign: "right", 
                    color: styles.textTertiary, 
                    marginTop: styles.spacingXs 
                  }}>
                    10:25 AM
                  </div>
                </div>
              </div>

              {/* Sent message */}
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                marginBottom: styles.spacingMd 
              }}>
                <div style={{ 
                  backgroundColor: styles.primaryColor, 
                  color: styles.white, 
                  padding: styles.spacingMd, 
                  borderRadius: styles.borderRadiusLg, 
                  maxWidth: "70%",
                  boxShadow: styles.boxShadow
                }}>
                  <div style={{
                    fontWeight: styles.fontWeightMedium,
                    fontSize: styles.fontSizeMd
                  }}>
                    Perfect! I'm staying at Hotel Paradiso. Will you come to the lobby?
                  </div>
                  <div style={{ 
                    fontSize: styles.fontSizeXs, 
                    textAlign: "right", 
                    color: "rgba(255,255,255,0.8)", 
                    marginTop: styles.spacingXs,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                  }}>
                    <span>10:30 AM</span>
                    <span style={{ fontSize: '10px' }}>✓✓</span>
                  </div>
                </div>
              </div>

              {/* Received message */}
              <div style={{ display: "flex", marginBottom: styles.spacingMd }}>
                <div style={{ 
                  width: "36px", 
                  height: "36px", 
                  borderRadius: "50%", 
                  backgroundColor: styles.primaryColor, 
                  marginRight: styles.spacingMd,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: styles.white,
                  fontWeight: styles.fontWeightBold,
                  fontSize: styles.fontSizeXs
                }}>
                  SW
                </div>
                <div style={{ 
                  backgroundColor: styles.white, 
                  padding: styles.spacingMd, 
                  borderRadius: styles.borderRadiusLg, 
                  maxWidth: "70%",
                  boxShadow: styles.boxShadow,
                  border: `1px solid ${styles.borderColor}`
                }}>
                  <div style={{
                    color: styles.textPrimary,
                    fontWeight: styles.fontWeightMedium,
                    fontSize: styles.fontSizeMd
                  }}>
                    Yes, I'll meet you in the lobby at 8:30 AM sharp. Looking forward to showing you the beautiful beaches of Bali!
                  </div>
                  <div style={{ 
                    fontSize: styles.fontSizeXs, 
                    textAlign: "right", 
                    color: styles.textTertiary, 
                    marginTop: styles.spacingXs 
                  }}>
                    10:32 AM
                  </div>
                </div>
              </div>
            </div>

            {/* Message input with improved styling */}
            <div style={{ 
              padding: styles.spacingMd, 
              borderTop: `1px solid ${styles.borderColor}`, 
              display: "flex", 
              gap: styles.spacingMd,
              backgroundColor: styles.white
            }}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                style={{ 
                  flex: 1, 
                  padding: styles.spacingMd, 
                  border: `1px solid ${styles.borderColor}`, 
                  borderRadius: styles.borderRadius,
                  fontSize: styles.fontSizeMd,
                  color: styles.textPrimary,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                }} 
              />
              <button 
                style={{ 
                  padding: `${styles.spacingMd} ${styles.spacingLg}`, 
                  backgroundColor: styles.primaryColor, 
                  color: styles.white, 
                  border: "none", 
                  borderRadius: styles.borderRadius, 
                  cursor: "pointer",
                  fontWeight: styles.fontWeightBold,
                  boxShadow: styles.boxShadow,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primaryDark;
                  e.currentTarget.style.boxShadow = styles.boxShadowMd;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primaryColor;
                  e.currentTarget.style.boxShadow = styles.boxShadow;
                }}
              >
                <span style={{ fontSize: styles.fontSizeLg }}>📨</span>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;