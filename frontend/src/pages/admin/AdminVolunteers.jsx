import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.listVolunteers();
      setVolunteers(res.data);
    } catch {
      setError('Error al cargar los voluntarios.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, email) {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al voluntario ${email}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeleting(id);
    setMessage(null);
    try {
      await adminAPI.deleteVolunteer(id);
      setMessage({ type: 'success', text: `Voluntario ${email} eliminado correctamente.` });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al eliminar el voluntario' });
    } finally {
      setDeleting(null);
    }
  }

  const filtered = search
    ? volunteers.filter((v) => {
        const q = search.toLowerCase();
        return (
          v.email.toLowerCase().includes(q) ||
          (v.firstName && v.firstName.toLowerCase().includes(q)) ||
          (v.lastName && v.lastName.toLowerCase().includes(q))
        );
      })
    : volunteers;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Voluntarios</h1>
        <p className="text-gray-500">Gestiona todos los voluntarios registrados en la plataforma.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {search ? 'No se encontraron voluntarios' : 'No hay voluntarios registrados'}
          </h3>
          <p className="text-gray-500">
            {search ? 'Intenta con otro término de búsqueda.' : 'Los voluntarios que se registren aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {filtered.length} voluntario{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Voluntario</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Comunidad</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase"># Registros</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Registrado el</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((vol) => (
                  <tr key={vol.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm mr-3">
                          {vol.firstName ? vol.firstName[0].toUpperCase() : vol.email[0].toUpperCase()}
                        </div>
                        <div>
                          {(vol.firstName || vol.lastName) && (
                            <p className="text-sm font-medium text-gray-900">
                              {[vol.firstName, vol.lastName].filter(Boolean).join(' ')}
                            </p>
                          )}
                          <p className={`text-sm ${(vol.firstName || vol.lastName) ? 'text-gray-500' : 'font-medium text-gray-900'}`}>{vol.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vol.phone || <span className="text-gray-300">-</span>}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vol.community || <span className="text-gray-300">-</span>}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-indigo-600">{vol._count?.signups || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(vol.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(vol.id, vol.email)}
                        disabled={deleting === vol.id}
                        className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deleting === vol.id ? 'Eliminando...' : '🗑 Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
