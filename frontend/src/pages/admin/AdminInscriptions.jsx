import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getAllInscriptions, deleteInscription, getAllSocios, getPeriods } from '../../services/admin';

export default function AdminInscriptions() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [socios, setSocios] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSocio, setFilterSocio] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null); // inscription object

  const load = async () => {
    setLoading(true);
    const [insc, s, p] = await Promise.all([getAllInscriptions(), getAllSocios(), getPeriods()]);
    setInscriptions(insc);
    setSocios(s);
    setPeriods(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta inscripción?')) return;
    try {
      await deleteInscription(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const filtered = inscriptions.filter(i => {
    if (filterSocio && i.project?.socioFormadorId !== filterSocio) return false;
    if (filterPeriod && i.project?.periodId !== filterPeriod) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Atrás</button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inscripciones</h1>
            <p className="text-gray-500 text-sm">{filtered.length} de {inscriptions.length} inscripciones</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterSocio} onChange={e => setFilterSocio(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            <option value="">Todos los socios</option>
            {socios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            <option value="">Todos los periodos</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            <option value="">Todos los estados</option>
            <option>Inscrito</option>
            <option>Cancelado</option>
          </select>
          {(filterSocio || filterPeriod || filterStatus) && (
            <button onClick={() => { setFilterSocio(''); setFilterPeriod(''); setFilterStatus(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline">
              Limpiar
            </button>
          )}
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Alumno</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Proyecto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Socio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Periodo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ins => (
                  <tr key={ins.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-gray-900">{ins.alumno?.matricula || '—'}</p>
                      <p className="text-gray-500 text-xs">{ins.alumno?.firstName} {ins.alumno?.lastName}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{ins.project?.title}</td>
                    <td className="px-4 py-3 text-gray-600">{ins.project?.socioFormador?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{ins.project?.period?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(ins.createdAt).toLocaleDateString('es-MX')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ins.status === 'Inscrito' ? 'success' : 'default'}>{ins.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="danger" onClick={() => handleCancel(ins.id)}>Cancelar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">✅</div>
                <p>No hay inscripciones con estos filtros</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
