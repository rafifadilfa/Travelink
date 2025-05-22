import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Payment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('mastercard');

  // Enhanced color scheme for better visibility
  const styles = {
    // Colors
    primaryColor: '#3182CE', // Blue 600
    primaryDark: '#2C5282', // Blue 800
    primaryLight: '#EBF8FF', // Blue 50
    primaryLighter: '#F0F9FF', // Even lighter blue
    successColor: '#38A169', // Green 600
    textPrimary: '#1A202C', // Gray 900
    textSecondary: '#4A5568', // Gray 700
    textTertiary: '#718096', // Gray 600
    borderColor: '#E2E8F0', // Gray 200
    bgLight: '#F7FAFC', // Gray 50
    white: '#FFFFFF',
    
    // Typography
    headingLarge: '1.75rem',
    headingMedium: '1.5rem',
    headingSmall: '1.25rem',
    textRegular: '1rem',
    textSmall: '0.875rem',
    textXSmall: '0.75rem',
    
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

  // Simple formatting for price
  function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  }

  // Hardcoded tour data
  const tourPrice = 1200000;
  const persons = 2;
  const totalPrice = tourPrice * persons;

  // Handle form submission
  function handlePaymentSubmit() {
    alert('Payment successful! Your booking has been confirmed.');
    // In a real app, we would navigate to the bookings page
    navigate('/bookings');
  }

  // Payment methods
  const paymentMethods = [
    { id: 'mastercard', name: 'Mastercard', icon: '💳' },
    { id: 'qris', name: 'QRIS', icon: '🔲' },
    { id: 'visa', name: 'VISA', icon: '💳' },
    { id: 'gopay', name: 'GoPay', icon: '📱' },
    { id: 'paypal', name: 'PayPal', icon: '💸' },
    { id: 'ovo', name: 'OVO', icon: '📱' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      height: '100%',
      width: '100%',
      backgroundColor: styles.bgLight, 
      padding: 0,
      margin: 0,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ width: '100%', flex: 1 }}>
        {/* Enhanced Header */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingMd,
          width: '100%',
          borderBottom: `1px solid ${styles.borderColor}`,
          boxShadow: styles.boxShadow,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: `0 ${styles.spacingLg}`
          }}>
            <div 
              style={{ 
                fontWeight: 'bold', 
                fontSize: styles.headingMedium, 
                color: styles.primaryColor, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: styles.spacingSm
              }}
              onClick={() => navigate('/dashboard')}
            >
              <span role="img" aria-label="airplane" style={{ fontSize: '1.5rem' }}>✈️</span> Travelink
            </div>
            <button 
              style={{ 
                padding: `${styles.spacingSm} ${styles.spacingLg}`, 
                backgroundColor: styles.primaryLight, 
                color: styles.primaryColor, 
                border: 'none', 
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
                e.currentTarget.style.backgroundColor = styles.primaryLighter;
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.primaryLight;
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
              onClick={() => navigate(-1)}
            >
              <span role="img" aria-label="back" style={{ fontSize: '1.2rem' }}>←</span>
              Back
            </button>
          </div>
        </div>

        {/* Main Content Container */}
        <div style={{
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto',
          padding: `${styles.spacingXl} ${styles.spacingLg}`,
          display: 'flex',
          flexDirection: 'column',
          gap: styles.spacingXl
        }}>
          <h1 style={{ 
            fontSize: styles.headingLarge, 
            fontWeight: 'bold', 
            color: styles.textPrimary,
            borderBottom: `2px solid ${styles.borderColor}`,
            paddingBottom: styles.spacingMd
          }}>
            Choose Payment
          </h1>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: styles.spacingXl,
            width: '100%'
          }}>
            {/* Payment Methods Section */}
            <div style={{ 
              backgroundColor: styles.white, 
              padding: styles.spacingXl, 
              borderRadius: styles.borderRadiusLg, 
              boxShadow: styles.boxShadow,
              border: `1px solid ${styles.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: styles.headingSmall, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                color: styles.primaryColor,
                display: 'flex',
                alignItems: 'center',
                gap: styles.spacingSm
              }}>
                <span role="img" aria-label="credit card" style={{ fontSize: '1.5rem' }}>💳</span> 
                Payment Methods
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: styles.spacingMd
              }}>
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    style={{ 
                      border: `2px solid ${method.id === selectedMethod ? styles.primaryColor : styles.borderColor}`,
                      borderRadius: styles.borderRadius,
                      padding: styles.spacingLg,
                      cursor: 'pointer',
                      backgroundColor: method.id === selectedMethod ? styles.primaryLight : styles.white,
                      display: 'flex',
                      alignItems: 'center',
                      gap: styles.spacingMd,
                      transition: 'all 0.2s ease',
                      boxShadow: method.id === selectedMethod ? styles.boxShadow : 'none'
                    }}
                    onClick={() => setSelectedMethod(method.id)}
                    onMouseOver={(e) => {
                      if (method.id !== selectedMethod) {
                        e.currentTarget.style.boxShadow = styles.boxShadow;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (method.id !== selectedMethod) {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      border: `2px solid ${method.id === selectedMethod ? styles.primaryColor : styles.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {method.id === selectedMethod && (
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%',
                          backgroundColor: styles.primaryColor
                        }}></div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      backgroundColor: method.id === selectedMethod ? styles.white : styles.bgLight,
                      borderRadius: '8px'
                    }}>
                      {method.icon}
                    </div>
                    <div style={{ 
                      fontWeight: method.id === selectedMethod ? 'bold' : 'medium',
                      color: method.id === selectedMethod ? styles.primaryColor : styles.textPrimary,
                      fontSize: styles.textRegular
                    }}>
                      {method.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Section */}
            <div style={{ 
              backgroundColor: styles.white, 
              padding: styles.spacingXl, 
              borderRadius: styles.borderRadiusLg, 
              boxShadow: styles.boxShadow,
              border: `1px solid ${styles.borderColor}`
            }}>
              <h2 style={{ 
                fontSize: styles.headingSmall, 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                color: styles.primaryColor,
                display: 'flex',
                alignItems: 'center',
                gap: styles.spacingSm
              }}>
                <span role="img" aria-label="receipt" style={{ fontSize: '1.5rem' }}>🧾</span> 
                Invoice
              </h2>
              
              {/* Invoice Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 100px 120px', 
                borderBottom: `2px solid ${styles.borderColor}`, 
                paddingBottom: styles.spacingSm, 
                marginBottom: styles.spacingMd,
                fontWeight: 'bold',
                color: styles.textPrimary
              }}>
                <div>Item Description</div>
                <div>Time</div>
                <div style={{ textAlign: 'right' }}>Price</div>
              </div>
              
              {/* Invoice Details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 100px 120px', 
                marginBottom: styles.spacingLg,
                padding: styles.spacingLg,
                backgroundColor: styles.bgLight,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.borderColor}`
              }}>
                <div>
                  <div style={{ 
                    fontWeight: 'bold',
                    color: styles.textPrimary,
                    fontSize: styles.textRegular,
                    marginBottom: styles.spacingXs
                  }}>
                    Bali Beach Hopping Adventure
                  </div>
                  <div style={{ 
                    fontSize: styles.textSmall, 
                    color: styles.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '2px'
                  }}>
                    <span role="img" aria-label="calendar" style={{ fontSize: '1rem' }}>📅</span>
                    Monday, May 25, 2025
                  </div>
                  <div style={{ 
                    fontSize: styles.textSmall, 
                    color: styles.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span role="img" aria-label="people" style={{ fontSize: '1rem' }}>👥</span>
                    {persons} people
                  </div>
                </div>
                <div style={{ 
                  color: styles.textPrimary,
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  08:30 AM
                </div>
                <div style={{ 
                  textAlign: 'right',
                  color: styles.primaryColor,
                  fontWeight: 'bold'
                }}>
                  {formatPrice(tourPrice)}
                </div>
              </div>
              
              <div style={{ 
                height: '1px', 
                backgroundColor: styles.borderColor, 
                margin: `${styles.spacingLg} 0` 
              }}></div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold', 
                marginBottom: styles.spacingLg,
                padding: styles.spacingMd,
                backgroundColor: styles.primaryLight,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.borderColor}`
              }}>
                <div style={{ 
                  color: styles.textPrimary,
                  fontSize: styles.textRegular
                }}>
                  Total (IDR):
                </div>
                <div style={{ 
                  color: styles.primaryColor,
                  fontSize: styles.headingSmall
                }}>
                  {formatPrice(totalPrice)}
                </div>
              </div>
              
              <button 
                style={{ 
                  width: '100%', 
                  padding: styles.spacingLg, 
                  backgroundColor: styles.successColor, 
                  color: styles.white, 
                  border: 'none', 
                  borderRadius: styles.borderRadius, 
                  fontSize: styles.headingSmall,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: styles.boxShadow,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: styles.spacingSm
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2F855A'; // Darker green
                  e.currentTarget.style.boxShadow = styles.boxShadowHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = styles.successColor;
                  e.currentTarget.style.boxShadow = styles.boxShadow;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={handlePaymentSubmit}
              >
                <span role="img" aria-label="check" style={{ fontSize: '1.25rem' }}>✓</span>
                Book Now
              </button>
              
              <div style={{ 
                fontSize: styles.textXSmall, 
                color: styles.textSecondary, 
                textAlign: 'center', 
                marginTop: styles.spacingMd,
                backgroundColor: styles.bgLight,
                padding: styles.spacingSm,
                borderRadius: styles.borderRadius
              }}>
                By clicking "Book Now", you agree to our Terms of Service and Privacy Policy.
                Payment will be processed securely.
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{
          backgroundColor: styles.white,
          padding: `${styles.spacingLg} ${styles.spacingXl}`,
          borderTop: `1px solid ${styles.borderColor}`,
          marginTop: 'auto',
          textAlign: 'center'
        }}>
          <p style={{ color: styles.textSecondary, fontSize: styles.textSmall }}>
            © 2025 Travelink. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Payment;