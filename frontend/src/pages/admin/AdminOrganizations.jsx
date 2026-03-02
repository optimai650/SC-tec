import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import BackButton from '../../components/BackButton';


function OrgStatusBadge({ status }) {
  const styles = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Disabled: 'bg-gray-100 text-gray-600',
  };
  const labels = {
    Pending: 'Pendiente',
    Approved: 'Aprobada',
    Rejected: 'Rechazada',
    Disabled: 'Deshabilitada',
  };
  return <span className={`badge ${styles[status] || ''}`}>{labels[status] || status}</span>;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_LABELS = {
  '': 'Todas',
  Pending: 'Pendientes',
  Approved: 'Aprobadas',
  Rejected: 'Rechazadas',
  Disabled: 'Deshabilitadas',
};

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminAPI.listOrganizations();
      setOrganizations(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar las organizaciones.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    setUpdating(id + status);
    setMessage(null);
    try {
      await adminAPI.updateOrgStatus(id, status);
      setMessage({ type: 'success', text: `Organización ${status === 'Approved' ? 'aprobada' : status === 'Rejected' ? 'rechazada' : 'deshabilitada'} correctamente.` });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    } finally {
      setUpdating(null);
    }
  }

  const filtered = statusFilter ? organizations.filter((o) => o.status === statusFilter) : organizations;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Organizaciones</h1>
          <p className="text-gray-500">Gestiona todas las organizaciones de la plataforma.</p>
        </div>
        <Link to="/admin/organizaciones/nueva" className="btn-primary">
          + Crear organización
        </Link>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {['', 'Pending', 'Approved', 'Rejected', 'Disabled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_LABELS[s]}
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
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay organizaciones</h3>
          <p className="text-gray-500 mb-6">Crea la primera organización de la plataforma.</p>
          <Link to="/admin/organizaciones/nueva" className="btn-primary">Crear organización</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Organización</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email contacto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Oportunidades</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Creada</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="w-8 h-8 rounded-full object-cover mr-3 shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm mr-3">
                            {org.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{org.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{org.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{org.contactEmail}</td>
                    <td className="px-6 py-4"><OrgStatusBadge status={org.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{org._count?.opportunities || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(org.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/organizaciones/${org.id}/panel`}
                          className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium hover:bg-indigo-100"
                        >
                          🏢 Panel
                        </Link>
                        {org.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'Approved')}
                            disabled={updating === org.id + 'Approved'}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-100"
                          >
                            ✓ Aprobar
                          </button>
                        )}
                        {org.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'Rejected')}
                            disabled={updating === org.id + 'Rejected'}
                            className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded font-medium hover:bg-red-100"
                          >
                            ✗ Rechazar
                          </button>
                        )}
                        {org.status !== 'Disabled' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'Disabled')}
                            disabled={updating === org.id + 'Disabled'}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium hover:bg-gray-200"
                          >
                            Deshabilitar
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
