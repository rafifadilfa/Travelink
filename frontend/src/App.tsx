import React, { ReactNode, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

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
import AdminAuth from './pages/AdminAuth';
import AdminKycList from './pages/AdminKycList';
import AdminKycDetail from './pages/AdminKycDetail';
import AdminGuideList from './pages/AdminGuideList';

// Type definitions
interface ComingSoonProps {
  pageName: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
  /** 'tourist' (default) | 'guide' | 'admin' — menentukan localStorage key mana yang dicek */
  role?: 'tourist' | 'guide' | 'admin';
  /**
   * Khusus role 'guide': kalau true, guide dengan status 'pending' atau 'rejected'
   * akan di-redirect ke /guide/dashboard (yang menampilkan halaman menunggu verifikasi).
   * Gunakan ini untuk route yang butuh akun guide sudah verified, misal: buat/edit tour.
   */
  requireVerified?: boolean;
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

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    role = 'tourist',
    requireVerified = false,
  }) => {
    if (role === 'admin') {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) return <Navigate to="/admin/auth" replace />;
      return <>{children}</>;
    }

    if (role === 'guide') {
      const guideToken = localStorage.getItem('guide_token');
      if (!guideToken) return <Navigate to="/guide/auth" replace />;

      // Kalau route ini butuh guide sudah verified, cek status dari localStorage
      if (requireVerified) {
        const guideRaw = localStorage.getItem('guide');
        const guide = guideRaw ? JSON.parse(guideRaw) : null;
        if (guide?.verification_status !== 'verified') {
          // Redirect ke dashboard — di sana guide akan melihat halaman "menunggu verifikasi"
          return <Navigate to="/guide/dashboard" replace />;
        }
      }

      return <>{children}</>;
    }

    // Default: tourist
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Auth />} />
      <Route path="/guide/auth" element={<GuideAuth />} />
      <Route path="/admin/auth" element={<AdminAuth />} />

      {/* --- Admin Section Routes --- */}
      <Route path="/admin/kyc" element={<ProtectedRoute role="admin"><AdminKycList /></ProtectedRoute>} />
      <Route path="/admin/kyc/:id" element={<ProtectedRoute role="admin"><AdminKycDetail /></ProtectedRoute>} />
      <Route path="/admin/guides" element={<ProtectedRoute role="admin"><AdminGuideList /></ProtectedRoute>} />

      {/* --- Guide Section Routes --- */}
      {/* Dashboard & info akun bisa diakses guide pending (untuk lihat status verifikasi) */}
      <Route path="/guide/dashboard" element={<ProtectedRoute role="guide"><GuideDashboard /></ProtectedRoute>} />
      <Route path="/guide/profile" element={<ProtectedRoute role="guide"><GuideEditProfile /></ProtectedRoute>} />
      <Route path="/guide/settings" element={<ProtectedRoute role="guide"><GuideSettings /></ProtectedRoute>} />
      {/* Route berikut BUTUH guide sudah verified — guide pending akan di-redirect ke dashboard */}
      <Route path="/guide/tours" element={<ProtectedRoute role="guide" requireVerified><GuideTours /></ProtectedRoute>} />
      <Route path="/guide/tours/new" element={<ProtectedRoute role="guide" requireVerified><CreateTour /></ProtectedRoute>} />
      <Route path="/guide/tours/edit/:tourId" element={<ProtectedRoute role="guide" requireVerified><EditTour /></ProtectedRoute>} />
      <Route path="/guide/bookings" element={<ProtectedRoute role="guide" requireVerified><GuideBookings /></ProtectedRoute>} />
      <Route path="/guide/bookings/cancel/:bookingId" element={<ProtectedRoute role="guide" requireVerified><CancelBooking /></ProtectedRoute>} />
      
      
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
