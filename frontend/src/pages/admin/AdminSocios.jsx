import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getAllSocios, createSocio, updateSocio, deleteSocio, createSocioAdminUser } from '../../services/admin';

const emptyForm = { name: '', contactEmail: '', description: '', logo: '', status: 'Activo' };

export default function AdminSocios() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editSocio, setEditSocio] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Admin user modal
  const [adminModal, setAdminModal] = useState(false);
  const [adminSocio, setAdminSocio] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState('');

  const load = () => {
    setLoading(true);
    getAllSocios().then(setSocios).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = (socio = null) => {
    setEditSocio(socio);
    setForm(socio ? { name: socio.name, contactEmail: socio.contactEmail, description: socio.description, logo: socio.logo || '', status: socio.status } : emptyForm);
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editSocio) {
        await updateSocio(editSocio.id, form);
      } else {
        await createSocio(form);
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
    if (!confirm('¿Eliminar este socio formador?')) return;
    try {
      await deleteSocio(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, logo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const openAdminModal = (socio) => {
    setAdminSocio(socio);
    setAdminEmail('');
    setAdminPassword('');
    setAdminError('');
    setAdminModal(true);
  };

  const handleCreateAdmin = async () => {
    setAdminSaving(true);
    setAdminError('');
    try {
      await createSocioAdminUser(adminSocio.id, { email: adminEmail, password: adminPassword });
      setAdminModal(false);
      alert('Usuario administrador creado exitosamente');
    } catch (err) {
      setAdminError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Socios Formadores</h1>
          <Button onClick={() => openModal()}>+ Nuevo socio</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {socios.map(socio => (
              <div key={socio.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  {socio.logo ? (
                    <img src={socio.logo} alt="" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#003087] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {socio.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{socio.name}</h3>
                      <Badge variant={socio.status === 'Activo' ? 'success' : 'default'}>{socio.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{socio.contactEmail}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{socio.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="secondary" onClick={() => openModal(socio)}>Editar</Button>
                      <Button size="sm" variant="ghost" onClick={() => openAdminModal(socio)}>+ Admin</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(socio.id)}>Eliminar</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {socios.length === 0 && (
              <div className="col-span-2 text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">🏢</div>
                <p>No hay socios formadores registrados</p>
              </div>
            )}
          </div>
        )}

        {/* Socio Modal */}
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editSocio ? 'Editar socio' : 'Nuevo socio formador'} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contacto</label>
                <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm">
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
                {form.logo && <img src={form.logo} alt="" className="w-12 h-12 rounded-full object-cover mt-2" />}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} disabled={!form.name || !form.contactEmail}>Guardar</Button>
              <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            </div>
          </div>
        </Modal>

        {/* Admin User Modal */}
        <Modal isOpen={adminModal} onClose={() => setAdminModal(false)} title={`Crear usuario admin — ${adminSocio?.name}`}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Crea un usuario con rol socio_admin para esta organización.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm" />
            </div>
            {adminError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{adminError}</div>}
            <div className="flex gap-3">
              <Button onClick={handleCreateAdmin} loading={adminSaving} disabled={!adminEmail || !adminPassword}>Crear usuario</Button>
              <Button variant="secondary" onClick={() => setAdminModal(false)}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
