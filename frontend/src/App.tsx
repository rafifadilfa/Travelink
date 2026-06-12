import React, { ReactNode, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Auth from './pages/Auth';
import Dashboard from './pages/dashboard';
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
import GuideReviews from './pages/GuideReviews';
import GuideWallet from './pages/GuideWallet';
import AdminAuth from './pages/AdminAuth';
import AdminKycList from './pages/AdminKycList';
import AdminKycDetail from './pages/AdminKycDetail';
import AdminGuideList from './pages/AdminGuideList';
import AdminPaymentList from './pages/AdminPaymentList';
import AdminPaymentDetail from './pages/AdminPaymentDetail';
import AdminWithdrawalList from './pages/AdminWithdrawalList';
// HIDDEN: import AdminUserList from './pages/AdminUserList';
import SmartOpenTripForm from './pages/SmartOpenTripForm';
import WaitingRoom from './pages/WaitingRoom';
import SearchResults from './pages/SearchResults';
import NotificationsPage from './pages/NotificationsPage';

interface ComingSoonProps { pageName: string; }
interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'tourist' | 'guide' | 'admin';
  requireVerified?: boolean;
}

const NotFound: React.FC = () => <div>404 - Page Not Found</div>;

const ComingSoon: React.FC<ComingSoonProps> = ({ pageName }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{pageName}</h1>
    <p style={{ fontSize: '1.25rem', color: '#718096', marginBottom: '2rem' }}>Halaman ini segera hadir!</p>
    <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3182ce', color: 'white',
      border: 'none', borderRadius: '0.375rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
      onClick={() => window.history.back()}>Kembali</button>
  </div>
);

const App: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children, role = 'tourist', requireVerified = false,
  }) => {
    if (role === 'admin') {
      if (!localStorage.getItem('admin_token')) return <Navigate to="/admin/auth" replace />;
      return <>{children}</>;
    }
    if (role === 'guide') {
      if (!localStorage.getItem('guide_token')) return <Navigate to="/guide/auth" replace />;
      if (requireVerified) {
        const g = localStorage.getItem('guide') ? JSON.parse(localStorage.getItem('guide')!) : null;
        if (g?.verification_status !== 'verified') return <Navigate to="/guide/dashboard" replace />;
      }
      return <>{children}</>;
    }
    if (!localStorage.getItem('token')) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Auth />} />
      <Route path="/guide/auth" element={<GuideAuth />} />
      <Route path="/admin/auth" element={<AdminAuth />} />

      {/* Admin */}
      <Route path="/admin/kyc"              element={<ProtectedRoute role="admin"><AdminKycList /></ProtectedRoute>} />
      <Route path="/admin/kyc/:id"          element={<ProtectedRoute role="admin"><AdminKycDetail /></ProtectedRoute>} />
      <Route path="/admin/guides"           element={<ProtectedRoute role="admin"><AdminGuideList /></ProtectedRoute>} />
      <Route path="/admin/payments"         element={<ProtectedRoute role="admin"><AdminPaymentList /></ProtectedRoute>} />
      <Route path="/admin/payments/:id"     element={<ProtectedRoute role="admin"><AdminPaymentDetail /></ProtectedRoute>} />
      <Route path="/admin/withdrawals"      element={<ProtectedRoute role="admin"><AdminWithdrawalList /></ProtectedRoute>} />
      {/* HIDDEN: <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUserList /></ProtectedRoute>} /> */}

      {/* Guide — tidak butuh verified */}
      <Route path="/guide/dashboard"        element={<ProtectedRoute role="guide"><GuideDashboard /></ProtectedRoute>} />
      <Route path="/guide/profile"          element={<ProtectedRoute role="guide"><GuideEditProfile /></ProtectedRoute>} />
      <Route path="/guide/settings"         element={<ProtectedRoute role="guide"><GuideSettings /></ProtectedRoute>} />
      <Route path="/guide/reviews"          element={<ProtectedRoute role="guide"><GuideReviews /></ProtectedRoute>} />
      <Route path="/guide/wallet"           element={<ProtectedRoute role="guide"><GuideWallet /></ProtectedRoute>} />

      {/* Guide — butuh verified */}
      <Route path="/guide/tours"            element={<ProtectedRoute role="guide" requireVerified><GuideTours /></ProtectedRoute>} />
      <Route path="/guide/tours/new"        element={<ProtectedRoute role="guide" requireVerified><CreateTour /></ProtectedRoute>} />
      <Route path="/guide/tours/edit/:tourId" element={<ProtectedRoute role="guide" requireVerified><EditTour /></ProtectedRoute>} />
      <Route path="/guide/bookings"         element={<ProtectedRoute role="guide" requireVerified><GuideBookings /></ProtectedRoute>} />
      <Route path="/guide/bookings/cancel/:bookingId" element={<ProtectedRoute role="guide" requireVerified><CancelBooking /></ProtectedRoute>} />
      
      
      {/* --- User Section Routes --- */}
      <Route path="/open-trip/join/:tourId" element={<ProtectedRoute><SmartOpenTripForm /></ProtectedRoute>} />
      <Route path="/open-trip/waiting/:participantId" element={<ProtectedRoute><WaitingRoom /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tours" element={<ProtectedRoute><ViewAllTours /></ProtectedRoute>} />
      <Route path="/tours/:id" element={<ProtectedRoute><TourDetail /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
      <Route path="/guides/:id" element={<ProtectedRoute><GuideProfile /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
     
      
      {/* Notifikasi — semua role, ProtectedRoute cukup cek tourist token;
          resolveClient() di dalam halaman yang memilih client yang tepat */}
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Settings (if needed) */}
      <Route
        path="/settings"
        element={<ProtectedRoute><ComingSoon pageName="Settings Page" /></ProtectedRoute>}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
