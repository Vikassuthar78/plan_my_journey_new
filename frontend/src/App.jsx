import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout (always loaded)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingElements from './components/ui/FloatingElements';

// Auth Pages (always loaded - entry points)
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Landing (always loaded)
import Landing from './pages/Landing';

// Lazy-loaded page groups
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const JourneyBuilder = lazy(() => import('./pages/customer/JourneyBuilder'));
const TripDetail = lazy(() => import('./pages/customer/TripDetail'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const MyTrips = lazy(() => import('./pages/customer/MyTrips'));
const BookingConfirmation = lazy(() => import('./pages/customer/BookingConfirmation'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminBookings = lazy(() => import('./pages/admin/Bookings'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminGuides = lazy(() => import('./pages/admin/Guides'));
const AdminTrips = lazy(() => import('./pages/admin/Trips'));
const AdminDestinations = lazy(() => import('./pages/admin/Destinations'));

const GuideDashboard = lazy(() => import('./pages/guide/Dashboard'));
const GuideTripDetail = lazy(() => import('./pages/guide/TripDetail'));
const GuideMyTrips = lazy(() => import('./pages/guide/MyTrips'));
const GuideSchedule = lazy(() => import('./pages/guide/Schedule'));
const GuideNotifications = lazy(() => import('./pages/guide/Notifications'));

const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader" />
        <p>Loading your journey...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'guide' ? '/guide' : '/dashboard'} replace />;
  }

  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <FloatingElements />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div className="page-loader"><div className="loader" /><p>Loading...</p></div>}>
        <Routes>
          {/* Public */}
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'guide' ? '/guide' : '/dashboard'} /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'guide' ? '/guide' : '/dashboard'} /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

          {/* Customer */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/journey/new" element={<ProtectedRoute allowedRoles={['customer']}><JourneyBuilder /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute allowedRoles={['customer']}><TripDetail /></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute allowedRoles={['customer']}><MyTrips /></ProtectedRoute>} />
          <Route path="/booking/confirmation/:id" element={<ProtectedRoute allowedRoles={['customer']}><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer', 'admin', 'guide']}><Profile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/guides" element={<ProtectedRoute allowedRoles={['admin']}><AdminGuides /></ProtectedRoute>} />
          <Route path="/admin/trips" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrips /></ProtectedRoute>} />
          <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={['admin']}><AdminDestinations /></ProtectedRoute>} />

          {/* Guide */}
          <Route path="/guide" element={<ProtectedRoute allowedRoles={['guide']}><GuideDashboard /></ProtectedRoute>} />
          <Route path="/guide/trips" element={<ProtectedRoute allowedRoles={['guide']}><GuideMyTrips /></ProtectedRoute>} />
          <Route path="/guide/trips/:id" element={<ProtectedRoute allowedRoles={['guide']}><GuideTripDetail /></ProtectedRoute>} />
          <Route path="/guide/schedule" element={<ProtectedRoute allowedRoles={['guide']}><GuideSchedule /></ProtectedRoute>} />
          <Route path="/guide/notifications" element={<ProtectedRoute allowedRoles={['guide']}><GuideNotifications /></ProtectedRoute>} />

          {/* Public Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
