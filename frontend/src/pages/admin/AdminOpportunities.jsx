import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const STATUS_LABELS = {
  Draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
  Published: { label: 'Publicada', color: 'bg-green-100 text-green-700' },
  Closed: { label: 'Cerrada', color: 'bg-red-100 text-red-700' },
  Full: { label: 'Llena', color: 'bg-yellow-100 text-yellow-700' },
};

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await adminAPI.listOpportunities();
      setOpportunities(res.data);
    } catch (err) {
      setError('Error al cargar oportunidades.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = opportunities.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
    o.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Todas las Oportunidades</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por título, organización o ubicación..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organización</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugares</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No hay oportunidades que mostrar.
                </td>
              </tr>
            ) : (
              filtered.map(op => {
                const s = STATUS_LABELS[op.status] || { label: op.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{op.title}</td>
                    <td className="px-6 py-4 text-gray-600">{op.organization?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{op.location}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(op.startDate).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {op.remainingSlots} / {op.totalSlots}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-400">{filtered.length} oportunidad(es) encontradas</p>
    </div>
  );
}
