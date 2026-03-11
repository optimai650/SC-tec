import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import AlumnoDashboard from './pages/alumno/AlumnoDashboard';
import SocioDashboard from './pages/socio/SocioDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSocios from './pages/admin/AdminSocios';
import AdminProjects from './pages/admin/AdminProjects';
import AdminFairs from './pages/admin/AdminFairs';
import AdminMatriculas from './pages/admin/AdminMatriculas';
import AdminInscriptions from './pages/admin/AdminInscriptions';
import QRRedeemPage from './pages/qr/QRRedeemPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
    if (user.role === 'socio_admin') return <Navigate to="/socio" replace />;
    return <Navigate to="/alumno" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/qr/:qrToken" element={<QRRedeemPage />} />

      <Route path="/alumno" element={
        <ProtectedRoute roles={['alumno']}>
          <AlumnoDashboard />
        </ProtectedRoute>
      } />

      <Route path="/socio" element={
        <ProtectedRoute roles={['socio_admin']}>
          <SocioDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roles={['superadmin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/socios" element={
        <ProtectedRoute roles={['superadmin']}>
          <AdminSocios />
        </ProtectedRoute>
      } />
      <Route path="/admin/projects" element={
        <ProtectedRoute roles={['superadmin']}>
          <AdminProjects />
        </ProtectedRoute>
      } />
      <Route path="/admin/fairs" element={
        <ProtectedRoute roles={['superadmin']}>
          <AdminFairs />
        </ProtectedRoute>
      } />
      <Route path="/admin/matriculas" element={
        <ProtectedRoute roles={['superadmin']}>
          <AdminMatriculas />
        </ProtectedRoute>
      } />
      <Route path="/admin/inscriptions" element={
        <ProtectedRoute roles={['superadmin']}>
          <AdminInscriptions />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
