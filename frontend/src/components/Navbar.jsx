import React, { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setMenuOpen(false);
  }

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'superadmin') return { to: '/admin', label: 'Panel Admin' };
    if (user.role === 'org_admin') return { to: '/org', label: 'Mi Organización' };
    return { to: '/mi-cuenta', label: 'Mi Cuenta' };
  };

  const dashLink = getDashboardLink();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Voluntariado Maguen David"
              className="h-8 w-auto"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <span className="text-xl font-bold text-indigo-600">Voluntariado Maguen David</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/oportunidades"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
              }
            >
              Oportunidades
            </NavLink>

            {user ? (
              <>
                {dashLink && (
                  <NavLink
                    to={dashLink.to}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`
                    }
                  >
                    {dashLink.label}
                  </NavLink>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="btn-primary text-sm py-2 px-4"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/oportunidades"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Oportunidades
            </Link>
            {user ? (
              <>
                {dashLink && (
                  <Link
                    to={dashLink.to}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMenuOpen(false)}
                  >
                    {dashLink.label}
                  </Link>
                )}
                <div className="px-4 py-2 text-xs text-gray-500">{user.email}</div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="block px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
