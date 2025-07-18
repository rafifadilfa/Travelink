import React, { ReactNode, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

// Corrected import paths based on your file structure
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ViewAllTours from './pages/ViewAllTours';
import TourDetail from './pages/TourDetail';
import Bookings from './pages/Bookings';
import GuideProfile from './pages/GuideProfile';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import GuideDashboard from './pages/GuideDashboard';
import GuideTours from './pages/GuideTours';
import CreateTour from './pages/CreateTour'; 
import GuideBookings from './pages/GuideBookings';
import EditTour from './pages/EditTour';
import GuideEditProfile from './pages/GuideEditProfile';
import GuideAuth from './pages/GuideAuth';
import CancelBooking from './pages/CancelBooking';
import GuideSettings from './pages/GuideSettings';

// Type definitions
interface ComingSoonProps {
  pageName: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

// NotFound component for 404 routes
const NotFound: React.FC = () => <div>404 - Page Not Found</div>;

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
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // In a real app, you would add logic here to check if the user is authenticated.
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Auth />} />
      <Route path="/guide/auth" element={<GuideAuth />} />

      {/* --- Guide Section Routes --- */}
      <Route path="/guide/dashboard" element={<ProtectedRoute><GuideDashboard /></ProtectedRoute>} />
      <Route path="/guide/tours" element={<ProtectedRoute><GuideTours /></ProtectedRoute>} />
      {/* Corrected component name in the route */}
      <Route path="/guide/tours/new" element={<ProtectedRoute><CreateTour /></ProtectedRoute>} />
      <Route path="/guide/bookings" element={<ProtectedRoute><GuideBookings /></ProtectedRoute>} />
      <Route path="/guide/tours/edit/:tourId" element={<ProtectedRoute><EditTour /></ProtectedRoute>} />
      <Route path="/guide/profile" element={<ProtectedRoute><GuideEditProfile /></ProtectedRoute>} />
      <Route path="/guide/bookings/cancel/:bookingId" element={<ProtectedRoute><CancelBooking /></ProtectedRoute>} />
      <Route path="/guide/settings" element={<ProtectedRoute><GuideSettings /></ProtectedRoute>} />
      
      
      {/* --- User Section Routes --- */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tours" element={<ProtectedRoute><ViewAllTours /></ProtectedRoute>} />
      <Route path="/tours/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/guides/:id" element={<ProtectedRoute><GuideProfile /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
     
      
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
