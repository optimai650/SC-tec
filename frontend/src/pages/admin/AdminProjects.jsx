import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getAllProjects, createProject, updateProject, deleteProject } from '../../services/projects';
import { getAllSocios, getPeriods, getFairs } from '../../services/admin';

const emptyForm = { title: '', description: '', location: '', totalSlots: '', socioFormadorId: '', periodId: '', status: 'Publicado' };

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [socios, setSocios] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [fairs, setFairs] = useState([]);
  const [selectedFairId, setSelectedFairId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrProject, setQrProject] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, s, per, fs] = await Promise.all([getAllProjects(), getAllSocios(), getPeriods(), getFairs()]);
    setProjects(p);
    setSocios(s);
    setPeriods(per);
    setFairs(fs);
    // Seleccionar feria activa por defecto
    const active = fs.find(f => f.isActive);
    if (active) setSelectedFairId(active.id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = (project = null) => {
    setEditProject(project);
    setForm(project ? {
      title: project.title,
      description: project.description,
      location: project.location,
      totalSlots: project.totalSlots,
      socioFormadorId: project.socioFormadorId,
      periodId: project.periodId,
      status: project.status
    } : emptyForm);
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editProject) {
        await updateProject(editProject.id, form);
      } else {
        await createProject(form);
      }
      setModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await deleteProject(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const qrUrl = (token) => `${window.location.origin}/qr/${token}`;

  // Filtrar proyectos por feria seleccionada
  const filteredProjects = selectedFairId
    ? (() => {
        const fair = fairs.find(f => f.id === selectedFairId);
        const periodIds = fair ? fair.periods.map(fp => fp.periodId) : [];
        return projects.filter(p => periodIds.includes(p.periodId));
      })()
    : projects;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Atrás</button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedFairId}
              onChange={e => setSelectedFairId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#003087] focus:border-[#003087]"
            >
              <option value="">Todas las ferias</option>
              {fairs.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.isActive ? ' (activa)' : ''}
                </option>
              ))}
            </select>
            <Button onClick={() => openModal()}>+ Nuevo proyecto</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Proyecto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Socio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Periodo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cupos</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3 text-gray-600">{p.socioFormador?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.period?.name}</td>
                    <td className="px-4 py-3">
                      <span className={p.remainingSlots > 0 ? 'text-green-600' : 'text-red-600'}>{p.remainingSlots}</span>
                      <span className="text-gray-400">/{p.totalSlots}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'Publicado' ? 'success' : 'default'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {p.qrToken && (
                          <Button size="sm" variant="accent" onClick={() => { setQrProject(p); setQrModal(true); }}>QR</Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openModal(p)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>Eliminar</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProjects.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">📋</div>
                <p>No hay proyectos registrados</p>
              </div>
            )}
          </div>
        )}

        {/* Project Modal */}
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editProject ? 'Editar proyecto' : 'Nuevo proyecto'} size="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cupos totales</label>
                <input type="number" value={form.totalSlots} onChange={e => setForm(f => ({ ...f, totalSlots: e.target.value }))}
                  min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Socio Formador</label>
                <select value={form.socioFormadorId} onChange={e => setForm(f => ({ ...f, socioFormadorId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm">
                  <option value="">Seleccionar...</option>
                  {socios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
                <select value={form.periodId} onChange={e => setForm(f => ({ ...f, periodId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm">
                  <option value="">Seleccionar...</option>
                  {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm">
                <option>Publicado</option>
                <option>Cerrado</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} disabled={!form.title || !form.socioFormadorId || !form.periodId || !form.totalSlots}>
                Guardar
              </Button>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            </div>
          </div>
        </Modal>

        {/* QR Modal */}
        <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title={`QR — ${qrProject?.title}`}>
          {qrProject?.qrToken && (
            <div className="text-center space-y-4">
              <div className="flex justify-center p-6 bg-white rounded-xl border">
                <QRCodeSVG value={qrUrl(qrProject.qrToken)} size={220} level="H" />
              </div>
              <p className="text-sm text-gray-600 font-mono break-all">{qrUrl(qrProject.qrToken)}</p>
              <p className="text-xs text-gray-500">Los alumnos escanean este QR para inscribirse con su código.</p>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
