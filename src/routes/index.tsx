import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import Home from '../pages/Home';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import Categories from '../pages/Categories';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import Checkout from '../pages/Checkout';
import BookingConfirmation from '../pages/BookingConfirmation';
import Support from '../pages/Support';
import TicketDetails from '../pages/TicketDetails';

// Admin Pages
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import EventManagement from '../pages/admin/EventManagement';
import UserManagement from '../pages/admin/UserManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import Analytics from '../pages/admin/Analytics';
import ContentManagement from '../pages/admin/ContentManagement';
import SecurityLogs from '../pages/admin/SecurityLogs';
import SupportManagement from '../pages/admin/SupportManagement';

function DefaultRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} />;
}

function RequireAuth({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      } />
      <Route path="/profile/*" element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      <Route path="/checkout" element={
        <RequireAuth>
          <Checkout />
        </RequireAuth>
      } />
      <Route path="/booking/confirmation/:bookingId" element={
        <RequireAuth>
          <BookingConfirmation />
        </RequireAuth>
      } />
      <Route path="/support" element={
        <RequireAuth>
          <Support />
        </RequireAuth>
      } />
      <Route path="/support/:id" element={
        <RequireAuth>
          <TicketDetails />
        </RequireAuth>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <RequireAuth requireAdmin>
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="events/*" element={<EventManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="security" element={<SecurityLogs />} />
        <Route path="support" element={<SupportManagement />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}