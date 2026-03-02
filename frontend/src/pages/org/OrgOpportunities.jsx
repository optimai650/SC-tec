import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizationsAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

function StatusBadge({ status }) {
  const styles = {
    Draft: 'bg-gray-100 text-gray-600',
    Published: 'bg-green-100 text-green-700',
    Closed: 'bg-red-100 text-red-700',
    Full: 'bg-yellow-100 text-yellow-700',
  };
  const labels = { Draft: 'Borrador', Published: 'Publicada', Closed: 'Cerrada', Full: 'Llena' };
  return <span className={`badge ${styles[status] || ''}`}>{labels[status] || status}</span>;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function OrgOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await organizationsAPI.getMyOpportunities();
      setOpportunities(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    setUpdatingStatus(id);
    setMessage(null);
    try {
      await organizationsAPI.updateOpportunityStatus(id, newStatus);
      setMessage({ type: 'success', text: 'Estado actualizado correctamente.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    } finally {
      setUpdatingStatus(null);
    }
  }

  const filtered = statusFilter
    ? opportunities.filter((o) => o.status === statusFilter)
    : opportunities;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Mis oportunidades</h1>
          <p className="text-gray-500">Gestiona las oportunidades de voluntariado de tu organización.</p>
        </div>
        <Link to="/org/oportunidades/nueva" className="btn-primary">
          + Nueva oportunidad
        </Link>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {['', 'Draft', 'Published', 'Closed', 'Full'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? 'Todas' : s === 'Draft' ? 'Borrador' : s === 'Published' ? 'Publicadas' : s === 'Closed' ? 'Cerradas' : 'Llenas'}
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
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay oportunidades</h3>
          <p className="text-gray-500 mb-6">Crea tu primera oportunidad de voluntariado.</p>
          <Link to="/org/oportunidades/nueva" className="btn-primary">
            Crear oportunidad
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha inicio</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cupos</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Voluntarios</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{opp.title}</p>
                      <p className="text-xs text-gray-500">📍 {opp.location}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={opp.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(opp.startDate)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-green-600 font-medium">{opp.remainingSlots}</span>
                      <span className="text-gray-400"> / {opp.totalSlots}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {opp._count?.signups || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/org/oportunidades/${opp.id}/voluntarios`}
                          className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium hover:bg-indigo-100"
                        >
                          Voluntarios
                        </Link>
                        <Link
                          to={`/org/oportunidades/${opp.id}/editar`}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-200"
                        >
                          Editar
                        </Link>
                        {opp.status === 'Draft' && (
                          <button
                            onClick={() => handleStatusChange(opp.id, 'Published')}
                            disabled={updatingStatus === opp.id}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-100"
                          >
                            Publicar
                          </button>
                        )}
                        {opp.status === 'Published' && (
                          <button
                            onClick={() => handleStatusChange(opp.id, 'Closed')}
                            disabled={updatingStatus === opp.id}
                            className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-100"
                          >
                            Cerrar
                          </button>
                        )}
                        {opp.status === 'Closed' && (
                          <button
                            onClick={() => handleStatusChange(opp.id, 'Draft')}
                            disabled={updatingStatus === opp.id}
                            className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-100"
                          >
                            Reabrir
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
