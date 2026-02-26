import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function StatusBadge({ status }) {
  const styles = {
    Registrado: 'bg-blue-100 text-blue-700',
    Completado: 'bg-green-100 text-green-700',
    Cancelado: 'bg-gray-100 text-gray-500',
  };
  return <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminSignups() {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.listSignups();
      setSignups(res.data);
    } catch {
      setError('Error al cargar los registros.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    setUpdating(id + newStatus);
    setMessage(null);
    try {
      await adminAPI.updateSignupStatus(id, newStatus);
      setMessage({ type: 'success', text: 'Estado actualizado correctamente.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar el estado' });
    } finally {
      setUpdating(null);
    }
  }

  const filtered = signups.filter((s) => {
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    const matchSearch = search
      ? s.volunteer?.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.opportunity?.title?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Todos los registros</h1>
        <p className="text-gray-500">Gestiona todos los registros de voluntarios en oportunidades.</p>
        <p className="text-gray-500 text-sm">Filtra por estado para ver solo los registros activos.</p>
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

      {/* Filters */}
      <div className="card mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Buscar por email de voluntario o nombre de oportunidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {['', 'Registrado', 'Completado', 'Cancelado'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay registros</h3>
          <p className="text-gray-500">No se encontraron registros con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b bg-gray-50">
            <span className="text-sm font-medium text-gray-500">
              {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Voluntario</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Oportunidad</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Organización</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha inicio</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((signup) => (
                  <tr key={signup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-xs mr-2">
                          {signup.volunteer?.email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900">{signup.volunteer?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{signup.opportunity?.title}</p>
                      <p className="text-xs text-gray-500">📍 {signup.opportunity?.location}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {signup.opportunity?.organization?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(signup.opportunity?.startDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={signup.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {signup.status === 'Registrado' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(signup.id, 'Completado')}
                              disabled={!!updating}
                              className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-100 disabled:opacity-50"
                            >
                              ✓ Completar
                            </button>
                            <button
                              onClick={() => handleStatusChange(signup.id, 'Cancelado')}
                              disabled={!!updating}
                              className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-100 disabled:opacity-50"
                            >
                              ✗ Cancelar
                            </button>
                          </>
                        )}
                        {signup.status === 'Completado' && (
                          <button
                            onClick={() => handleStatusChange(signup.id, 'Registrado')}
                            disabled={!!updating}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium hover:bg-blue-100 disabled:opacity-50"
                          >
                            ↩ Reactivar
                          </button>
                        )}
                        {signup.status === 'Cancelado' && (
                          <button
                            onClick={() => handleStatusChange(signup.id, 'Registrado')}
                            disabled={!!updating}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium hover:bg-blue-100 disabled:opacity-50"
                          >
                            ↩ Reactivar
                          </button>
                        )}
                      </div>
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
