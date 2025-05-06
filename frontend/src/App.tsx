import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';

// Placeholder components for other pages (to be implemented later)
const Dashboard = () => <div>Dashboard Page (Coming Soon)</div>;
const Tours = () => <div>Tours Page (Coming Soon)</div>;
const TourDetail = () => <div>Tour Detail Page (Coming Soon)</div>;
const Profile = () => <div>Profile Page (Coming Soon)</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

const App: React.FC = () => {
  // Simple auth check - in a real app, this would use context or state management
  const isAuthenticated = false;

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Auth />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tours" 
        element={
          <ProtectedRoute>
            <Tours />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tours/:id" 
        element={
          <ProtectedRoute>
            <TourDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;