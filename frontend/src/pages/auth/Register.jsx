import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

export default function Register() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', community: '', customCommunity: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) return <Navigate to="/mi-cuenta" replace />;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('La contraseña debe contener al menos una letra mayúscula');
      return;
    }
    if (!/[a-z]/.test(form.password)) {
      setError('La contraseña debe contener al menos una letra minúscula');
      return;
    }

    const phoneDigits = form.phone.replace(/\s|-/g, '');
    if (!/^\d{10}$/.test(phoneDigits)) {
      setError('El teléfono debe tener 10 dígitos');
      return;
    }

    setLoading(true);
    try {
      const communityValue = form.community === 'Otros' ? form.customCommunity : form.community;
      const res = await authAPI.register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone, community: communityValue });
      login(res.data.token, res.data.user);
      navigate('/mi-cuenta', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear la cuenta';
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 mt-2">Únete como voluntario y empieza a ayudar</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Nombre(s) */}
            <div>
              <label className="label" htmlFor="firstName">Nombre(s)</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Ej. Juan"
                className="input"
                required
                autoComplete="given-name"
              />
            </div>

            {/* 2. Apellidos */}
            <div>
              <label className="label" htmlFor="lastName">Apellidos</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Ej. Pérez García"
                className="input"
                required
                autoComplete="family-name"
              />
            </div>

            {/* 3. Email */}
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

            {/* 4. Contraseña */}
            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres, una mayúscula y una minúscula"
                className="input"
                required
                autoComplete="new-password"
              />
            </div>

            {/* 5. Confirmar contraseña */}
            <div>
              <label className="label" htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className="input"
                required
                autoComplete="new-password"
              />
            </div>

            {/* 6. Número de teléfono */}
            <div>
              <label className="label" htmlFor="phone">Número de teléfono</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10 dígitos, ej. 5512345678"
                className="input"
                required
                autoComplete="tel"
              />
            </div>

            {/* 7. Comunidad */}
            <div>
              <label className="label" htmlFor="community">Comunidad</label>
              <select
                id="community"
                name="community"
                value={form.community}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Selecciona tu comunidad</option>
                <option value="Maguen David">Maguen David</option>
                <option value="Monte Sinai">Monte Sinai</option>
                <option value="Bet-El">Bet-El</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* 8. Especifica tu comunidad */}
            {form.community === 'Otros' && (
              <div>
                <label className="label" htmlFor="customCommunity">Especifica tu comunidad</label>
                <input
                  id="customCommunity"
                  type="text"
                  name="customCommunity"
                  value={form.customCommunity}
                  onChange={handleChange}
                  placeholder="Nombre de tu comunidad"
                  className="input"
                  required={form.community === 'Otros'}
                />
              </div>
            )}

            {/* 9. Texto legal */}
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              Al registrarte, aceptas nuestros términos de uso y política de privacidad. Tu cuenta será verificada automáticamente.
            </p>

            {/* 10. Botón */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
