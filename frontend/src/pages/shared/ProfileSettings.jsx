import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    community: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Cargar datos actuales del usuario
  useEffect(() => {
    if (user) {
      setLoading(true);
      authAPI.me().then((res) => {
        const u = res.data;
        setForm((prev) => ({
          ...prev,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          community: u.community || '',
        }));
        setLoading(false);
      }).catch(() => {
        setMessage({ type: 'error', text: 'No se pudo cargar tu perfil. Recarga la pagina.' });
        setLoading(false);
      });
    }
  }, [user]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    // Validar email básico
    if (!form.email || !form.email.includes('@')) {
      setMessage({ type: 'error', text: 'Ingresa un email válido.' });
      return;
    }

    // Validar contraseñas si se ingresó una nueva
    if (form.password) {
      if (form.password.length < 8) {
        setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
        return;
      }
      if (!/[A-Z]/.test(form.password)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener al menos una letra mayúscula' });
        return;
      }
      if (!/[a-z]/.test(form.password)) {
        setMessage({ type: 'error', text: 'La contraseña debe contener al menos una letra minúscula' });
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
        return;
      }
    }

    if (form.phone) {
      const phoneDigits = form.phone.replace(/\s|-/g, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        setMessage({ type: 'error', text: 'El teléfono debe tener 10 dígitos' });
        return;
      }
    }

    setLoading(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      community: form.community,
    };
    if (form.password) {
      payload.password = form.password;
    }

    try {
      await authAPI.updateProfile(payload);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      // Limpiar campos de contraseña
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar el perfil.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Configuración de perfil</h1>
        <p className="text-gray-500">Actualiza tu información personal y contraseña.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información personal */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
              Información personal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="firstName">Nombre(s)</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Ej. Juan"
                  className="input"
                  required
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="label" htmlFor="lastName">Apellidos</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Ej. Pérez García"
                  className="input"
                  required
                  autoComplete="family-name"
                />
              </div>

              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="phone">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 dígitos, ej. 5512345678"
                  className="input"
                />
              </div>

              {/* Comunidad: solo visible para voluntarios */}
              {user?.role === 'volunteer' && (
                <div>
                  <label className="label" htmlFor="community">Comunidad</label>
                  <select
                    id="community"
                    name="community"
                    value={form.community}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Selecciona tu comunidad</option>
                    <option value="Maguen David">Maguen David</option>
                    <option value="Monte Sinai">Monte Sinai</option>
                    <option value="Bet-El">Bet-El</option>
                    <option value="Otros">Otros</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Tu comunidad o sinagoga de pertenencia (opcional).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">
              Cambiar contraseña
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Deja estos campos vacíos si no deseas cambiar tu contraseña.
            </p>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres, una mayúscula y una minúscula"
                  className="input"
                />
              </div>

              <div>
                <label className="label" htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite la nueva contraseña"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
