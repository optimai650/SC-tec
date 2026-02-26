import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Opportunities from './pages/public/Opportunities';
import OpportunityDetail from './pages/public/OpportunityDetail';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

// Org Pages
import OrgDashboard from './pages/org/OrgDashboard';
import OrgOpportunities from './pages/org/OrgOpportunities';
import OrgOpportunityForm from './pages/org/OrgOpportunityForm';
import OrgVolunteers from './pages/org/OrgVolunteers';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrganizations from './pages/admin/AdminOrganizations';
import AdminOrgForm from './pages/admin/AdminOrgForm';
import AdminOpportunities from './pages/admin/AdminOpportunities';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminSignups from './pages/admin/AdminSignups';
import AdminOrgPanel from './pages/admin/AdminOrgPanel';

// Shared Pages
import ProfileSettings from './pages/shared/ProfileSettings';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout><Landing /></Layout>} />
          <Route path="/oportunidades" element={<Layout><Opportunities /></Layout>} />
          <Route path="/oportunidades/:id" element={<Layout><OpportunityDetail /></Layout>} />

          {/* Auth routes */}
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/registro" element={<Layout><Register /></Layout>} />

          {/* Volunteer routes */}
          <Route path="/mi-cuenta" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <Layout><VolunteerDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Org routes */}
          <Route path="/org" element={
            <ProtectedRoute allowedRoles={['org_admin']}>
              <Layout><OrgDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/org/oportunidades" element={
            <ProtectedRoute allowedRoles={['org_admin']}>
              <Layout><OrgOpportunities /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/org/oportunidades/nueva" element={
            <ProtectedRoute allowedRoles={['org_admin']}>
              <Layout><OrgOpportunityForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/org/oportunidades/:id/editar" element={
            <ProtectedRoute allowedRoles={['org_admin']}>
              <Layout><OrgOpportunityForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/org/oportunidades/:id/voluntarios" element={
            <ProtectedRoute allowedRoles={['org_admin']}>
              <Layout><OrgVolunteers /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/organizaciones" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminOrganizations /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/organizaciones/nueva" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminOrgForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/oportunidades" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminOpportunities /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/voluntarios" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminVolunteers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/registros" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminSignups /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/organizaciones/:orgId/panel" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <Layout><AdminOrgPanel /></Layout>
            </ProtectedRoute>
          } />

          {/* Profile (any authenticated role) */}
          <Route path="/perfil/configuracion" element={
            <ProtectedRoute allowedRoles={['superadmin', 'org_admin', 'volunteer']}>
              <Layout><ProfileSettings /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
