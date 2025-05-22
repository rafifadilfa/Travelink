import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data - tours
const tours = [
  {
    id: 1,
    name: 'Bali Beach Hopping Adventure',
    location: 'Bali',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392',
    description: 'Experience the stunning beaches of Bali with our expert local guides.',
    price: 1200000,
    rating: 4.9,
    reviews: 128,
    duration: '8 hours',
    category: 'beach',
    featured: true,
  },
  {
    id: 2,
    name: 'Mount Rinjani Trek',
    location: 'Lombok',
    image: 'https://images.unsplash.com/photo-1606152536277-5aa1fd33e150',
    description: 'Challenging trek to one of Indonesia\'s most beautiful volcanic mountains.',
    price: 2500000,
    rating: 4.8,
    reviews: 95,
    duration: '3 days',
    category: 'mountain',
    featured: true,
  },
  {
    id: 3,
    name: 'Jakarta City Tour',
    location: 'Jakarta',
    image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af',
    description: 'Discover the vibrant capital city with local experts.',
    price: 800000,
    rating: 4.7,
    reviews: 87,
    duration: '6 hours',
    category: 'city',
    featured: false,
  },
  {
    id: 4,
    name: 'Borobudur Temple Sunrise Tour',
    location: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0',
    description: 'Witness a spectacular sunrise at the UNESCO World Heritage site of Borobudur Temple.',
    price: 950000,
    rating: 4.9,
    reviews: 142,
    duration: '6 hours',
    category: 'culture',
    featured: true,
  },
  {
    id: 5,
    name: 'Raja Ampat Diving Experience',
    location: 'Papua',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    description: 'Explore the underwater paradise of Raja Ampat with our experienced diving guides.',
    price: 3200000,
    rating: 5.0,
    reviews: 76,
    duration: '2 days',
    category: 'diving',
    featured: true,
  },
  {
    id: 6,
    name: 'Komodo National Park Adventure',
    location: 'Flores',
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cddc86',
    description: 'See the famous Komodo dragons in their natural habitat on this exciting tour.',
    price: 2800000,
    rating: 4.8,
    reviews: 104,
    duration: '2 days',
    category: 'nature',
    featured: false,
  },
];

// Categories for filter
const categories = [
  { value: 'beach', label: 'Beach', icon: '🏖️' },
  { value: 'mountain', label: 'Mountain', icon: '🏔️' },
  { value: 'city', label: 'City', icon: '🏙️' },
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'diving', label: 'Diving', icon: '🤿' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
];

// Style constants for better visibility and consistency
const styles = {
  // Colors
  primary: '#3182CE',
  primaryDark: '#2C5282',
  primaryLight: '#EBF8FF',
  secondary: '#718096',
  textDark: '#2D3748',
  textLight: '#A0AEC0',
  bgLight: '#F7FAFC',
  bgDark: '#1A202C',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  success: '#38A169',
  
  // Typography
  headingLarge: '2rem',
  headingMedium: '1.5rem',
  headingSmall: '1.25rem',
  textRegular: '1rem',
  textSmall: '0.875rem',
  
  // Spacing
  spacingSm: '0.5rem',
  spacingMd: '1rem',
  spacingLg: '1.5rem',
  spacingXl: '2rem',
  
  // Borders and shadows
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  boxShadowHover: '0 10px 15px rgba(0,0,0,0.1)',
  
  // Transitions
  transition: 'all 0.3s ease',
};

const ViewAllTours: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredTours, setFilteredTours] = useState(tours);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'price-low' | 'price-high' | 'rating'>('rating');
  
  // Memoize the filter function to optimize performance
  const filterTours = useCallback(() => {
    setLoading(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      let results = [...tours];
      
      // Search query filter
      if (searchQuery) {
        results = results.filter(tour => 
          tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tour.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Category filter
      if (selectedCategory) {
        results = results.filter(tour => tour.category === selectedCategory);
      }
      
      // Sort results
      switch (sortOrder) {
        case 'price-low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
      }
      
      setFilteredTours(results);
      setLoading(false);
    }, 300);
  }, [searchQuery, selectedCategory, sortOrder]);
  
  useEffect(() => {
    filterTours();
  }, [filterTours]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortOrder('rating');
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: styles.bgLight, 
      padding: styles.spacingXl,
      fontFamily: 'Inter, system-ui, sans-serif'
    }}
    role="main"
    >
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: styles.spacingMd }}>
          <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <a 
                href="/" 
                style={{ 
                  color: styles.secondary, 
                  textDecoration: 'none',
                  fontSize: styles.textSmall
                }}
              >
                Home
              </a>
              <span style={{ margin: '0 8px', color: styles.secondary }}>
                /
              </span>
            </li>
            <li style={{ color: styles.textDark, fontSize: styles.textSmall, fontWeight: 500 }}>
              Tours
            </li>
          </ol>
        </nav>

        <h1 style={{ 
          fontSize: styles.headingLarge, 
          fontWeight: 700,
          color: styles.textDark,
          marginBottom: styles.spacingMd 
        }}>
          Explore Tours
        </h1>
        <p style={{ 
          marginBottom: styles.spacingXl,
          fontSize: styles.textRegular,
          color: styles.secondary,
          maxWidth: '800px' 
        }}>
          Discover the best Indonesia has to offer with our local guides
        </p>
        
        {/* Enhanced Filter Section */}
        <div style={{ 
          backgroundColor: styles.white, 
          padding: styles.spacingLg, 
          marginBottom: styles.spacingXl, 
          borderRadius: styles.borderRadius, 
          boxShadow: styles.boxShadow,
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: styles.spacingLg 
          }}>
            <div>
              <label 
                htmlFor="search-input"
                style={{ 
                  display: 'block', 
                  marginBottom: styles.spacingSm,
                  fontWeight: 600,
                  color: styles.textDark,
                  fontSize: styles.textSmall
                }}
              >
                Search Tours
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: styles.secondary
                }}
                aria-hidden="true"
                >
                  🔍
                </span>
                <input 
                  id="search-input"
                  type="text"
                  placeholder="Search tours, locations, or activities..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: `${styles.spacingSm} ${styles.spacingMd} ${styles.spacingSm} 36px`, 
                    borderRadius: styles.borderRadius, 
                    border: `1px solid ${styles.border}`,
                    fontSize: styles.textRegular,
                    color: styles.textDark,
                    backgroundColor: styles.white,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                    transition: styles.transition,
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.border;
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                  }}
                  aria-label="Search tours"
                />
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="category-select"
                style={{ 
                  display: 'block', 
                  marginBottom: styles.spacingSm,
                  fontWeight: 600,
                  color: styles.textDark,
                  fontSize: styles.textSmall
                }}
              >
                Category
              </label>
              <select 
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: styles.spacingSm, 
                  borderRadius: styles.borderRadius, 
                  border: `1px solid ${styles.border}`,
                  fontSize: styles.textRegular,
                  color: styles.textDark,
                  backgroundColor: styles.white,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                  transition: styles.transition,
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '12px',
                  paddingRight: '30px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = styles.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = styles.border;
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                }}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label 
                htmlFor="sort-select"
                style={{ 
                  display: 'block', 
                  marginBottom: styles.spacingSm,
                  fontWeight: 600,
                  color: styles.textDark,
                  fontSize: styles.textSmall
                }}
              >
                Sort By
              </label>
              <select 
                id="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'price-low' | 'price-high' | 'rating')}
                style={{ 
                  width: '100%', 
                  padding: styles.spacingSm, 
                  borderRadius: styles.borderRadius, 
                  border: `1px solid ${styles.border}`,
                  fontSize: styles.textRegular,
                  color: styles.textDark,
                  backgroundColor: styles.white,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                  transition: styles.transition,
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '12px',
                  paddingRight: '30px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = styles.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${styles.primaryLight}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = styles.border;
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)';
                }}
                aria-label="Sort tours"
              >
                <option value="rating">Highest Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={resetFilters}
                style={{ 
                  padding: `${styles.spacingSm} ${styles.spacingMd}`, 
                  backgroundColor: styles.primary, 
                  color: styles.white, 
                  border: 'none', 
                  borderRadius: styles.borderRadius, 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: styles.textRegular,
                  transition: styles.transition,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '38px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primaryDark;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = styles.primary;
                }}
                aria-label="Reset all filters"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Filters & Category Quick Links */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: styles.spacingMd,
          marginBottom: styles.spacingLg 
        }}>
          {/* Active Filters */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <div style={{ color: styles.textDark, fontSize: styles.textRegular }}>
              Found <strong>{filteredTours.length}</strong> tours
            </div>
            
            <div style={{ display: 'flex', gap: styles.spacingSm }}>
              {selectedCategory && (
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: styles.primaryLight,
                  color: styles.primary,
                  padding: `${styles.spacingSm} ${styles.spacingMd}`,
                  borderRadius: '16px',
                  fontSize: styles.textSmall,
                  fontWeight: 500
                }}>
                  {categories.find(c => c.value === selectedCategory)?.icon}{' '}
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => setSelectedCategory('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: styles.primary,
                      marginLeft: styles.spacingSm,
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '10px'
                    }}
                    aria-label={`Remove ${categories.find(c => c.value === selectedCategory)?.label} filter`}
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {searchQuery && (
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: styles.primaryLight,
                  color: styles.primary,
                  padding: `${styles.spacingSm} ${styles.spacingMd}`,
                  borderRadius: '16px',
                  fontSize: styles.textSmall,
                  fontWeight: 500
                }}>
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: styles.primary,
                      marginLeft: styles.spacingSm,
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: '10px'
                    }}
                    aria-label="Clear search query"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Category Quick Links */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: styles.spacingSm,
          }}>
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: `${styles.spacingSm} ${styles.spacingMd}`,
                  backgroundColor: selectedCategory === category.value ? styles.primary : styles.white,
                  color: selectedCategory === category.value ? styles.white : styles.textDark,
                  border: `1px solid ${selectedCategory === category.value ? styles.primary : styles.border}`,
                  borderRadius: styles.borderRadius,
                  fontSize: styles.textSmall,
                  cursor: 'pointer',
                  transition: styles.transition,
                  fontWeight: selectedCategory === category.value ? 600 : 'normal',
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== category.value) {
                    e.currentTarget.style.backgroundColor = styles.primaryLight;
                    e.currentTarget.style.borderColor = styles.primary;
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== category.value) {
                    e.currentTarget.style.backgroundColor = styles.white;
                    e.currentTarget.style.borderColor = styles.border;
                  }
                }}
                aria-pressed={selectedCategory === category.value}
              >
                <span aria-hidden="true">{category.icon}</span> {category.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: styles.spacingXl,
            marginBottom: styles.spacingLg
          }}>
            <div style={{ fontSize: styles.headingMedium, color: styles.primary }}>
              Loading tours...
            </div>
          </div>
        )}
        
        {/* Enhanced Tour Cards */}
        {!loading && filteredTours.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: styles.spacingXl,
            backgroundColor: styles.white,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
            marginTop: styles.spacingLg
          }}>
            <div style={{ fontSize: '3rem', marginBottom: styles.spacingMd }}>
              🔍
            </div>
            <h2 style={{ 
              fontSize: styles.headingMedium, 
              fontWeight: 700,
              color: styles.textDark,
              marginBottom: styles.spacingMd 
            }}>
              No tours found
            </h2>
            <p style={{ 
              marginBottom: styles.spacingLg,
              color: styles.secondary
            }}>
              Try adjusting your filters or search criteria
            </p>
            <button 
              onClick={resetFilters}
              style={{ 
                padding: `${styles.spacingSm} ${styles.spacingMd}`, 
                backgroundColor: styles.primary, 
                color: styles.white, 
                border: 'none', 
                borderRadius: styles.borderRadius, 
                cursor: 'pointer',
                fontWeight: 600,
                transition: styles.transition
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.primaryDark;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.primary;
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : !loading && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: styles.spacingLg 
          }}>
            {filteredTours.map(tour => (
              <div 
                key={tour.id}
                style={{ 
                  backgroundColor: styles.white, 
                  borderRadius: styles.borderRadius, 
                  overflow: 'hidden', 
                  boxShadow: styles.boxShadow, 
                  cursor: 'pointer',
                  transition: styles.transition,
                  border: `1px solid ${styles.border}`,
                  position: 'relative',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = styles.boxShadowHover;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = styles.boxShadow;
                }}
                onClick={() => navigate(`/tours/${tour.id}`)}
                role="link"
                aria-label={`View details of ${tour.name} in ${tour.location}, ${formatPrice(tour.price)} per person`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/tours/${tour.id}`);
                  }
                }}
              >
                <div style={{ 
                  height: '200px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img 
                    src={tour.image} 
                    alt={tour.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: styles.transition
                    }}
                  />
                  {tour.featured && (
                    <div style={{
                      position: 'absolute',
                      top: styles.spacingSm,
                      left: styles.spacingSm,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: styles.white,
                      padding: `${styles.spacingSm} ${styles.spacingMd}`,
                      borderRadius: '4px',
                      fontSize: styles.textSmall,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      zIndex: 2,
                    }}
                    aria-label="Featured tour"
                    >
                      Featured
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: styles.spacingSm,
                    right: styles.spacingSm,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: styles.white,
                    padding: `${styles.spacingSm} ${styles.spacingMd}`,
                    borderRadius: '4px',
                    fontSize: styles.textSmall,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 2,
                  }}
                  aria-label={`Rating: ${tour.rating} out of 5, ${tour.reviews} reviews`}
                  >
                    <span style={{ color: '#FFD700' }}>★</span> {tour.rating} ({tour.reviews})
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }} aria-hidden="true"></div>
                </div>
                
                <div style={{ 
                  padding: styles.spacingMd,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '230px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: styles.spacingSm,
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      fontSize: styles.textSmall, 
                      color: styles.primary,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span aria-hidden="true">📍</span> {tour.location}
                    </div>
                    <div style={{ 
                      fontSize: styles.textSmall, 
                      color: styles.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span aria-hidden="true">⏱️</span> {tour.duration}
                    </div>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: styles.headingSmall, 
                    marginBottom: styles.spacingSm, 
                    fontWeight: 700,
                    color: styles.textDark,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '52px'
                  }}>
                    {tour.name}
                  </h3>
                  
                  <p style={{ 
                    color: styles.secondary, 
                    marginBottom: styles.spacingMd, 
                    fontSize: styles.textSmall, 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                    lineHeight: 1.5
                  }}>
                    {tour.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: styles.textRegular,
                      color: styles.primary
                    }}>
                      {formatPrice(tour.price)}
                      <span style={{ 
                        fontWeight: 400, 
                        fontSize: styles.textSmall,
                        color: styles.secondary,
                        marginLeft: '2px'
                      }}>
                        /person
                      </span>
                    </span>
                    
                    <button 
                      style={{ 
                        padding: `${styles.spacingSm} ${styles.spacingMd}`, 
                        backgroundColor: styles.primary, 
                        color: styles.white, 
                        border: 'none', 
                        borderRadius: styles.borderRadius, 
                        fontSize: styles.textSmall, 
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: styles.transition
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = styles.primaryDark;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = styles.primary;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tours/${tour.id}`);
                      }}
                      aria-label={`View details of ${tour.name}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                
                {/* Category Tag */}
                <div style={{
                  position: 'absolute',
                  top: '200px',
                  left: styles.spacingMd,
                  transform: 'translateY(-50%)',
                  backgroundColor: styles.primary,
                  color: styles.white,
                  padding: `${styles.spacingSm} ${styles.spacingMd}`,
                  borderRadius: '24px',
                  fontSize: styles.textSmall,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                aria-label={`Category: ${tour.category}`}
                >
                  <span aria-hidden="true">{categories.find(c => c.value === tour.category)?.icon}</span> {tour.category}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {filteredTours.length > 0 && !loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: styles.spacingXl,
            gap: styles.spacingSm
          }}
          aria-label="Pagination"
          >
            <button
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.border}`,
                backgroundColor: styles.white,
                cursor: 'pointer',
                transition: styles.transition
              }}
              aria-label="Previous page"
              disabled
            >
              &lt;
            </button>
            
            <button
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: styles.borderRadius,
                border: 'none',
                backgroundColor: styles.primary,
                color: styles.white,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              aria-label="Page 1"
              aria-current="page"
            >
              1
            </button>
            
            <button
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.border}`,
                backgroundColor: styles.white,
                cursor: 'pointer',
                transition: styles.transition,
                color: styles.textDark
              }}
              aria-label="Page 2"
            >
              2
            </button>
            
            <button
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.border}`,
                backgroundColor: styles.white,
                cursor: 'pointer',
                transition: styles.transition
              }}
              aria-label="Next page"
            >
              &gt;
            </button>
          </div>
        )}
        
        {/* Newsletter Subscribe */}
        <div style={{
          backgroundColor: styles.primaryLight,
          marginTop: styles.spacingXl,
          padding: styles.spacingXl,
          borderRadius: styles.borderRadius,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: styles.spacingMd
        }}>
          <h2 style={{
            fontSize: styles.headingMedium,
            fontWeight: 700,
            color: styles.textDark,
          }}>
            Get Travel Inspiration & Deals
          </h2>
          <p style={{
            color: styles.textDark,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Subscribe to our newsletter and be the first to know about new tours and exclusive discounts.
          </p>
          <div style={{
            display: 'flex',
            maxWidth: '500px',
            width: '100%',
            margin: '0 auto',
            gap: styles.spacingSm
          }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: 1,
                padding: `${styles.spacingMd} ${styles.spacingMd}`,
                borderRadius: styles.borderRadius,
                border: `1px solid ${styles.border}`,
                fontSize: styles.textRegular,
                outline: 'none',
              }}
              aria-label="Email for newsletter"
            />
            <button
              style={{
                padding: `${styles.spacingMd} ${styles.spacingLg}`,
                backgroundColor: styles.primary,
                color: styles.white,
                border: 'none',
                borderRadius: styles.borderRadius,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllTours;