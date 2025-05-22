import React, { useState, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/dashboard';
import ViewAllTours from './pages/ViewAllTours';
import TourDetail from './pages/TourDetail';
import Bookings from './pages/Bookings';
import GuideProfile from './pages/GuideProfile';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Type definitions
interface ComingSoonProps {
  pageName: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

// NotFound component for 404 routes
const NotFound: React.FC = () => <div>404 - Page Not Found</div>;

// Simple component for pages that aren't fully implemented yet
const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh', 
    textAlign: 'center', 
    padding: '20px' 
  }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{pageName}</h1>
    <p style={{ fontSize: '1.25rem', color: '#718096', marginBottom: '2rem' }}>
      This page is coming soon!
    </p>
    <button 
      style={{ 
        padding: '0.75rem 1.5rem', 
        backgroundColor: '#3182ce', 
        color: 'white', 
        border: 'none', 
        borderRadius: '0.375rem', 
        fontSize: '1rem', 
        fontWeight: 'bold', 
        cursor: 'pointer' 
      }} 
      onClick={() => window.history.back()}
    >
      Go Back
    </button>
  </div>
);

const App: React.FC = () => {
  // Simplified auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  
  // Login/logout functions (not actually used in this demo)
  const login = (): void => setIsAuthenticated(true);
  const logout = (): void => setIsAuthenticated(false);
  
  // Protected route component
  // For development purposes, this always renders the children regardless of auth state
  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    return <>{children}</>;
  };
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Auth />} />
      
      {/* Main app routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Tour related routes */}
      <Route path="/tours" element={<ProtectedRoute><ViewAllTours /></ProtectedRoute>} />
      <Route path="/tours/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
      <Route path="/tour/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
      
      {/* Booking routes */}
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/bookings/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
      
      {/* Payment routes */}
      <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      
      {/* Guide routes */}
      <Route path="/guides/:id" element={<ProtectedRoute><GuideProfile /></ProtectedRoute>} />
      <Route path="/guides/:id/profile" element={<ProtectedRoute><GuideProfile /></ProtectedRoute>} />
      <Route path="/guide/:id" element={<ProtectedRoute><GuideProfile /></ProtectedRoute>} />
      
      {/* User profile */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      {/* Chat routes */}
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:contactId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      
      {/* Settings (if needed) */}
      <Route 
        path="/settings" 
        element={<ProtectedRoute><ComingSoon pageName="Settings Page" /></ProtectedRoute>} 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;