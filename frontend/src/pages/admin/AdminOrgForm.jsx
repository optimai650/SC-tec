import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function AdminOrgForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    contactEmail: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.description || !form.contactEmail || !form.adminEmail || !form.adminPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (form.adminPassword.length < 6) {
      setError('La contraseña del admin debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.createOrganization(form);
      navigate('/admin/organizaciones');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la organización');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link to="/admin/organizaciones" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Volver a organizaciones
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crear nueva organización</h1>
        <p className="text-gray-500 mt-1">
          Completa el formulario para registrar una nueva organización y su administrador.
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization data */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Datos de la organización
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="name">Nombre de la organización *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej: Cruz Verde"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe brevemente a la organización..."
                  className="input min-h-[100px] resize-y"
                  required
                />
              </div>

              <div>
                <label className="label" htmlFor="contactEmail">Email de contacto *</label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="contacto@organizacion.com"
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Admin data */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Cuenta del administrador
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="adminEmail">Email del administrador *</label>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={form.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@organizacion.com"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se creará una cuenta con este email para que el admin pueda iniciar sesión.
                </p>
              </div>

              <div>
                <label className="label" htmlFor="adminPassword">Contraseña temporal *</label>
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="text"
                  value={form.adminPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comparte esta contraseña con el administrador para que pueda acceder. Se registrará en los logs.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-semibold mb-1">⚠️ Nota importante</p>
            <p>La organización se creará en estado <strong>Pendiente</strong>. Deberás aprobarla manualmente desde el listado de organizaciones.</p>
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creando...' : 'Crear organización'}
            </button>
            <Link to="/admin/organizaciones" className="btn-secondary flex-1 text-center">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
