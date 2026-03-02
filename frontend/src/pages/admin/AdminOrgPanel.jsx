import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

// ---- Helpers ----

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function OppStatusBadge({ status }) {
  const styles = {
    Draft: 'bg-gray-100 text-gray-600',
    Published: 'bg-green-100 text-green-700',
    Closed: 'bg-red-100 text-red-700',
    Full: 'bg-yellow-100 text-yellow-700',
  };
  const labels = { Draft: 'Borrador', Published: 'Publicada', Closed: 'Cerrada', Full: 'Llena' };
  return <span className={`badge ${styles[status] || ''}`}>{labels[status] || status}</span>;
}

function SignupStatusBadge({ status }) {
  const styles = {
    Registrado: 'bg-blue-100 text-blue-700',
    Completado: 'bg-green-100 text-green-700',
    Cancelado: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    Registrado: 'Registrado',
    Completado: 'Asistio',
    Cancelado: 'Cancelado',
  };
  return <span className={`badge ${styles[status] || ''}`}>{labels[status] || status}</span>;
}

// ---- Tab: Org Info ----

function TabOrgInfo({ orgId, org, onUpdated }) {
  const [form, setForm] = useState({ name: '', description: '', contactEmail: '', logo: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name || '',
        description: org.description || '',
        contactEmail: org.contactEmail || '',
        logo: org.logo || '',
      });
    }
  }, [org]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setMessage({ type: 'error', text: 'El logo no debe superar 500KB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm(prev => ({ ...prev, logo: ev.target.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await adminAPI.updateOrg(orgId, form);
      setMessage({ type: 'success', text: 'Organización actualizada correctamente.' });
      onUpdated();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Información de la organización</h2>

      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="name">Nombre *</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="description">Descripción *</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} className="input min-h-[100px] resize-y" required />
        </div>
        <div>
          <label className="label" htmlFor="contactEmail">Email de contacto *</label>
          <input id="contactEmail" name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="logo">Logo</label>
          {form.logo && (
            <img src={form.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover mb-3" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="text-xs text-gray-400 mt-1">Maximo 500KB. Se guardara como imagen.</p>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- Opportunity Edit Modal / Inline Form ----

function OppForm({ orgId, opp, onSaved, onCancel }) {
  const isEditing = Boolean(opp);
  const [form, setForm] = useState({
    title: opp?.title || '',
    description: opp?.description || '',
    location: opp?.location || '',
    startDate: opp ? toDatetimeLocal(opp.startDate) : '',
    endDate: opp ? toDatetimeLocal(opp.endDate) : '',
    totalSlots: opp ? String(opp.totalSlots) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.description || !form.location || !form.startDate || !form.endDate || !form.totalSlots) {
      setError('Todos los campos son requeridos');
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('La fecha de inicio debe ser antes que la de fin');
      return;
    }
    setLoading(true);
    const payload = { ...form, totalSlots: parseInt(form.totalSlots, 10) };
    try {
      if (isEditing) {
        await adminAPI.updateOrgOpportunity(orgId, opp.id, payload);
      } else {
        await adminAPI.createOrgOpportunity(orgId, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la oportunidad');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mt-4">
      <h3 className="text-base font-semibold text-indigo-900 mb-4">
        {isEditing ? `Editando: ${opp.title}` : 'Nueva oportunidad'}
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="opp-title">Título *</label>
            <input id="opp-title" name="title" type="text" value={form.title} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="opp-location">Ubicación *</label>
            <input id="opp-location" name="location" type="text" value={form.location} onChange={handleChange} className="input" required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="opp-description">Descripción *</label>
          <textarea id="opp-description" name="description" value={form.description} onChange={handleChange} className="input min-h-[80px] resize-y" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label" htmlFor="opp-startDate">Inicio *</label>
            <input id="opp-startDate" name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="opp-endDate">Fin *</label>
            <input id="opp-endDate" name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="opp-totalSlots">Cupos *</label>
            <input id="opp-totalSlots" name="totalSlots" type="number" min="1" value={form.totalSlots} onChange={handleChange} className="input" required />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear oportunidad'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- Tab: Opportunities ----

function TabOpportunities({ orgId, onOppsLoaded }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingOpp, setEditingOpp] = useState(null); // null = closed, 'new' = creating, opp obj = editing
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const loadOpps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listOrgOpportunities(orgId);
      setOpportunities(res.data);
      if (onOppsLoaded) onOppsLoaded(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar las oportunidades.' });
    } finally {
      setLoading(false);
    }
  }, [orgId, onOppsLoaded]);

  useEffect(() => {
    loadOpps();
  }, [loadOpps]);

  async function handleStatusChange(oppId, newStatus) {
    setUpdatingStatus(oppId);
    setMessage(null);
    try {
      await adminAPI.updateOrgOpportunityStatus(orgId, oppId, newStatus);
      setMessage({ type: 'success', text: 'Estado actualizado.' });
      loadOpps();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al actualizar' });
    } finally {
      setUpdatingStatus(null);
    }
  }

  function handleSaved() {
    setEditingOpp(null);
    setMessage({ type: 'success', text: 'Oportunidad guardada correctamente.' });
    loadOpps();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Oportunidades</h2>
        {editingOpp === null && (
          <button onClick={() => setEditingOpp('new')} className="btn-primary text-sm py-2 px-4">
            + Nueva oportunidad
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {editingOpp === 'new' && (
        <OppForm orgId={orgId} opp={null} onSaved={handleSaved} onCancel={() => setEditingOpp(null)} />
      )}
      {editingOpp && editingOpp !== 'new' && (
        <OppForm orgId={orgId} opp={editingOpp} onSaved={handleSaved} onCancel={() => setEditingOpp(null)} />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card text-center py-10">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-gray-500">Esta organización no tiene oportunidades.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0 mt-4">
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
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{opp.title}</p>
                      <p className="text-xs text-gray-500">📍 {opp.location}</p>
                    </td>
                    <td className="px-6 py-4"><OppStatusBadge status={opp.status} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(opp.startDate)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-green-600 font-medium">{opp.remainingSlots}</span>
                      <span className="text-gray-400"> / {opp.totalSlots}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{opp._count?.signups || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setEditingOpp(opp)}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium hover:bg-gray-200"
                        >
                          Editar
                        </button>
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

// ---- Tab: Volunteers by Opportunity ----

function TabVolunteers({ orgId, opportunities }) {
  const [selectedOppId, setSelectedOppId] = useState('');
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [marking, setMarking] = useState(null);
  const [reverting, setReverting] = useState(null);

  const loadVolunteers = useCallback(async () => {
    if (!selectedOppId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await adminAPI.getOrgOpportunityVolunteers(orgId, selectedOppId);
      setSignups(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar voluntarios.' });
    } finally {
      setLoading(false);
    }
  }, [orgId, selectedOppId]);

  useEffect(() => {
    if (selectedOppId) {
      loadVolunteers();
    } else {
      setSignups([]);
    }
  }, [selectedOppId, loadVolunteers]);

  async function handleMarkAttendance(signupId) {
    setMarking(signupId);
    setMessage(null);
    try {
      await adminAPI.markOrgVolunteerAttendance(orgId, selectedOppId, signupId);
      setMessage({ type: 'success', text: 'Asistencia marcada correctamente.' });
      loadVolunteers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al marcar asistencia' });
    } finally {
      setMarking(null);
    }
  }

  async function handleRevert(signupId) {
    setReverting(signupId);
    setMessage(null);
    try {
      await adminAPI.updateOrgVolunteerStatus(orgId, selectedOppId, signupId, 'Registrado');
      setMessage({ type: 'success', text: 'Registro revertido correctamente.' });
      loadVolunteers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al revertir registro' });
    } finally {
      setReverting(null);
    }
  }

  const registered = signups.filter((s) => s.status === 'Registrado');
  const completed = signups.filter((s) => s.status === 'Completado');

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Voluntarios por oportunidad</h2>

      <div className="card mb-6">
        <label className="label">Seleccionar oportunidad</label>
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(e.target.value)}
          className="input"
        >
          <option value="">Selecciona una oportunidad</option>
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title} ({new Date(opp.startDate).toLocaleDateString('es-MX')})
            </option>
          ))}
        </select>
      </div>

      {!selectedOppId ? (
        <div className="card text-center py-10">
          <div className="text-3xl mb-3">👆</div>
          <p className="text-gray-500">Selecciona una oportunidad para ver sus voluntarios.</p>
        </div>
      ) : (
        <>
          {message && (
            <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{signups.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{registered.length}</div>
              <div className="text-xs text-gray-500">Registrados</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{completed.length}</div>
              <div className="text-xs text-gray-500">Completados</div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : signups.length === 0 ? (
            <div className="card text-center py-10">
              <div className="text-3xl mb-3">👥</div>
              <p className="text-gray-500">No hay voluntarios registrados en esta oportunidad.</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Voluntario</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {signups.map((signup) => (
                      <tr key={signup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs mr-2">
                              {signup.volunteer?.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{signup.volunteer?.email}</p>
                              {signup.volunteer?.community && (
                                <p className="text-xs text-gray-500">{signup.volunteer.community}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {signup.volunteer?.phone || <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-6 py-4">
                          <SignupStatusBadge status={signup.status} />
                        </td>
                        <td className="px-6 py-4">
                          {signup.status === 'Registrado' ? (
                            <button
                              onClick={() => handleMarkAttendance(signup.id)}
                              disabled={marking === signup.id}
                              className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100"
                            >
                              {marking === signup.id ? 'Marcando...' : '✓ Marcar asistencia'}
                            </button>
                          ) : signup.status === 'Completado' ? (
                            <button
                              onClick={() => handleRevert(signup.id)}
                              disabled={reverting === signup.id}
                              className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg font-medium hover:bg-yellow-100"
                            >
                              {reverting === signup.id ? 'Revirtiendo...' : 'Revertir'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---- Main Component ----

export default function AdminOrgPanel() {
  const { orgId } = useParams();
  const [org, setOrg] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState('');

  const loadOrg = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getOrg(orgId);
      setOrg(res.data);
    } catch {
      setError('No se pudo cargar la organizacion.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const loadOpps = useCallback(async () => {
    try {
      const res = await adminAPI.listOrgOpportunities(orgId);
      setOpportunities(res.data);
    } catch {
      // Oportunidades son opcionales, org puede mostrarse igual
      setOpportunities([]);
    }
  }, [orgId]);

  useEffect(() => {
    loadOrg();
    loadOpps();
  }, [loadOrg, loadOpps]);

  const tabs = [
    { id: 'info', label: '🏢 Info de la org' },
    { id: 'opportunities', label: '📋 Oportunidades' },
    { id: 'volunteers', label: '👥 Voluntarios' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-4xl mb-4">{error ? '⚠️' : '❌'}</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {error || 'Organizacion no encontrada'}
        </h2>
        <Link to="/admin/organizaciones" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
          ← Volver a organizaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {org.logo ? (
          <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold text-xl">
            {org.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
          <p className="text-gray-500 text-sm">{org.contactEmail}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <TabOrgInfo orgId={orgId} org={org} onUpdated={loadOrg} />
      )}
      {activeTab === 'opportunities' && (
        <TabOpportunities orgId={orgId} onOppsLoaded={setOpportunities} />
      )}
      {activeTab === 'volunteers' && (
        <TabVolunteers orgId={orgId} opportunities={opportunities} />
      )}
    </div>
  );
}
