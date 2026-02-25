import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizationsAPI } from '../../services/api';

function StatusBadge({ status }) {
  const styles = {
    Draft: 'bg-gray-100 text-gray-600',
    Published: 'bg-green-100 text-green-700',
    Closed: 'bg-red-100 text-red-700',
    Full: 'bg-yellow-100 text-yellow-700',
  };
  const labels = {
    Draft: 'Borrador',
    Published: 'Publicada',
    Closed: 'Cerrada',
    Full: 'Llena',
  };
  return (
    <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrgDashboard() {
  const [org, setOrg] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [orgRes, oppRes] = await Promise.all([
          organizationsAPI.getMine(),
          organizationsAPI.getMyOpportunities(),
        ]);
        setOrg(orgRes.data);
        setOpportunities(oppRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalSlots = opportunities.reduce((acc, o) => acc + o.totalSlots, 0);
  const totalRegistered = opportunities.reduce(
    (acc, o) => acc + (o.totalSlots - o.remainingSlots),
    0
  );
  const published = opportunities.filter((o) => o.status === 'Published').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xl">
            {org?.name?.[0] || 'O'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org?.name}</h1>
            <span className={`badge ${org?.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {org?.status === 'Approved' ? 'Aprobada' : org?.status}
            </span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1">{org?.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="card text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-1">{opportunities.length}</div>
          <div className="text-sm text-gray-500">Oportunidades</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{published}</div>
          <div className="text-sm text-gray-500">Publicadas</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{totalRegistered}</div>
          <div className="text-sm text-gray-500">Voluntarios</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{totalSlots}</div>
          <div className="text-sm text-gray-500">Cupos totales</div>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Oportunidades recientes</h2>
        <Link to="/org/oportunidades" className="btn-primary text-sm py-2">
          Ver todas →
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes oportunidades aún</h3>
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cupos</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {opportunities.slice(0, 5).map((opp) => (
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/org/oportunidades/${opp.id}/voluntarios`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Voluntarios
                        </Link>
                        <Link
                          to={`/org/oportunidades/${opp.id}/editar`}
                          className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                        >
                          Editar
                        </Link>
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
