import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

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

  const [editingOpp, setEditingOpp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [viewingOpp, setViewingOpp] = useState(null);
  const [viewingVolunteers, setViewingVolunteers] = useState([]);
  const [viewingLoading, setViewingLoading] = useState(false);

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

  async function openView(op) {
    setViewingOpp(op);
    setEditingOpp(null);
    setViewingVolunteers([]);
    setViewingLoading(true);
    try {
      const res = await adminAPI.getOrgOpportunityVolunteers(op.organizationId, op.id);
      setViewingVolunteers(res.data);
    } catch {
      setViewingVolunteers([]);
    } finally {
      setViewingLoading(false);
    }
  }

  function openEdit(op) {
    setViewingOpp(null);
    const pad = (n) => String(n).padStart(2, '0');
    const toLocal = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
    };
    setEditForm({
      title: op.title,
      description: op.description,
      location: op.location,
      startDate: toLocal(op.startDate),
      endDate: toLocal(op.endDate),
      totalSlots: String(op.totalSlots),
    });
    setEditingOpp(op);
    setEditError('');
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (new Date(editForm.startDate) >= new Date(editForm.endDate)) {
      setEditError('La fecha de inicio debe ser antes que la de fin');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await adminAPI.updateOrgOpportunity(editingOpp.organizationId, editingOpp.id, {
        ...editForm,
        totalSlots: parseInt(editForm.totalSlots, 10),
      });
      setEditingOpp(null);
      fetchOpportunities();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setEditLoading(false);
    }
  }

  const filtered = opportunities.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
    o.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BackButton />
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

      {viewingOpp && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          {/* Header del panel */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{viewingOpp.title}</h3>
              <p className="text-sm text-indigo-600 font-medium">{viewingOpp.organization?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(viewingOpp)}
                className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                Editar
              </button>
              <button
                onClick={() => setViewingOpp(null)}
                className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Info de la oportunidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Descripción</p>
              <p className="text-sm text-gray-700">{viewingOpp.description}</p>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5 uppercase font-semibold">Ubicación</p>
                <p className="text-sm text-gray-700">📍 {viewingOpp.location}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5 uppercase font-semibold">Fechas</p>
                <p className="text-sm text-gray-700">
                  🗓️ {new Date(viewingOpp.startDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' → '}
                  {new Date(viewingOpp.endDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5 uppercase font-semibold">Cupos</p>
                <p className="text-sm text-gray-700">
                  <span className="text-green-600 font-semibold">{viewingOpp.remainingSlots}</span> disponibles de <span className="font-semibold">{viewingOpp.totalSlots}</span> totales
                </p>
              </div>
            </div>
          </div>

          {/* Lista de voluntarios */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b">
              Voluntarios registrados
            </h4>
            {viewingLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : viewingVolunteers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin voluntarios registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Comunidad</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewingVolunteers.map((signup) => {
                      const v = signup.volunteer;
                      const name = v?.firstName ? `${v.firstName} ${v.lastName || ''}`.trim() : v?.email;
                      const statusColors = {
                        Registrado: 'bg-blue-100 text-blue-700',
                        Completado: 'bg-green-100 text-green-700',
                        Cancelado: 'bg-gray-100 text-gray-500',
                      };
                      return (
                        <tr key={signup.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{name}</td>
                          <td className="px-4 py-3 text-gray-600">{v?.email}</td>
                          <td className="px-4 py-3 text-gray-600">{v?.phone || <span className="text-gray-300">-</span>}</td>
                          <td className="px-4 py-3 text-gray-600">{v?.community || <span className="text-gray-300">-</span>}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[signup.status] || 'bg-gray-100 text-gray-600'}`}>
                              {signup.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {editingOpp && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h3 className="text-base font-semibold text-indigo-900 mb-4">
            Editando: {editingOpp.title}
          </h3>
          {editError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{editError}</div>
          )}
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Título *</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({...p, title: e.target.value}))} className="input" required />
              </div>
              <div>
                <label className="label">Ubicación *</label>
                <input type="text" value={editForm.location} onChange={e => setEditForm(p => ({...p, location: e.target.value}))} className="input" required />
              </div>
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} className="input min-h-[80px] resize-y" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Inicio *</label>
                <input type="datetime-local" value={editForm.startDate} onChange={e => setEditForm(p => ({...p, startDate: e.target.value}))} className="input" required />
              </div>
              <div>
                <label className="label">Fin *</label>
                <input type="datetime-local" value={editForm.endDate} onChange={e => setEditForm(p => ({...p, endDate: e.target.value}))} className="input" required />
              </div>
              <div>
                <label className="label">Cupos *</label>
                <input type="number" min="1" value={editForm.totalSlots} onChange={e => setEditForm(p => ({...p, totalSlots: e.target.value}))} className="input" required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={editLoading} className="btn-primary">
                {editLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={() => setEditingOpp(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                  No hay oportunidades que mostrar.
                </td>
              </tr>
            ) : (
              filtered.map(op => {
                const s = STATUS_LABELS[op.status] || { label: op.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{op.title}</td>
                    <td className="px-6 py-4 text-gray-600">{op.organization?.name || '-'}</td>
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openView(op)}
                          className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => openEdit(op)}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200"
                        >
                          Editar
                        </button>
                      </div>
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
