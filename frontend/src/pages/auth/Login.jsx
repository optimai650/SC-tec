import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
    if (user.role === 'org_admin') return <Navigate to="/org" replace />;
    return <Navigate to="/mi-cuenta" replace />;
  }

  const from = location.state?.from || null;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);

      const role = res.data.user.role;
      if (from) navigate(from, { replace: true });
      else if (role === 'superadmin') navigate('/admin', { replace: true });
      else if (role === 'org_admin') navigate('/org', { replace: true });
      else navigate('/mi-cuenta', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <BackButton />
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Voluntariado Maguen David" className="h-16 w-auto mx-auto mb-4" onError={(e) => { e.target.style.display='none' }} />
          <h1 className="text-3xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="text-gray-500 mt-2">Bienvenido a Voluntariado Maguen David</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                className="input"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-indigo-600 font-semibold hover:text-indigo-800">
              Regístrate gratis
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 card bg-indigo-50 border-indigo-100">
          <p className="text-xs font-semibold text-indigo-800 mb-3 uppercase tracking-wide">Cuentas de demostración</p>
          <div className="space-y-2 text-xs text-indigo-700">
            <div className="flex justify-between">
              <span className="font-medium">Super Admin:</span>
              <span>admin@voluntarios.app / Admin1234!</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Org Admin:</span>
              <span>org@cruzver.de / Org1234!</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Voluntario:</span>
              <span>voluntario@test.com / Voluntario1234!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
