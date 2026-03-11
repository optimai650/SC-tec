import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import {
  getFairs, createFair, updateFair, deleteFair, activateFair, setFairPeriods,
  getPeriods, createPeriod, updatePeriod, deletePeriod
} from '../../services/admin';

export default function AdminFairs() {
  const navigate = useNavigate();
  const [fairs, setFairs] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('fairs');

  // Fair modals
  const [fairModal, setFairModal] = useState(false);
  const [editFair, setEditFair] = useState(null);
  const [fairName, setFairName] = useState('');
  const [fairPeriods, setFairPeriodsState] = useState([]);
  const [fairSaving, setFairSaving] = useState(false);

  // Period modals
  const [periodModal, setPeriodModal] = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [periodName, setPeriodName] = useState('');
  const [periodSaving, setPeriodSaving] = useState(false);

  // Activate confirm
  const [activateConfirm, setActivateConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    const [f, p] = await Promise.all([getFairs(), getPeriods()]);
    setFairs(f);
    setPeriods(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openFairModal = (fair = null) => {
    setEditFair(fair);
    setFairName(fair?.name || '');
    setFairPeriodsState(fair?.periods?.map(fp => fp.periodId) || []);
    setFairModal(true);
  };

  const handleSaveFair = async () => {
    setFairSaving(true);
    try {
      let fair;
      if (editFair) {
        fair = await updateFair(editFair.id, { name: fairName });
      } else {
        fair = await createFair({ name: fairName });
      }
      await setFairPeriods(fair.id, fairPeriods);
      setFairModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    } finally {
      setFairSaving(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateFair(id);
      setActivateConfirm(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleDeleteFair = async (id) => {
    if (!confirm('¿Eliminar esta feria?')) return;
    try {
      await deleteFair(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const openPeriodModal = (period = null) => {
    setEditPeriod(period);
    setPeriodName(period?.name || '');
    setPeriodModal(true);
  };

  const handleSavePeriod = async () => {
    setPeriodSaving(true);
    try {
      if (editPeriod) {
        await updatePeriod(editPeriod.id, { name: periodName });
      } else {
        await createPeriod({ name: periodName });
      }
      setPeriodModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    } finally {
      setPeriodSaving(false);
    }
  };

  const handleDeletePeriod = async (id) => {
    if (!confirm('¿Eliminar este periodo?')) return;
    try {
      await deletePeriod(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar (puede tener proyectos asociados)');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Atrás</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Ferias y Periodos</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b">
          {['fairs', 'periods'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-[#003087] text-[#003087]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'fairs' ? '📅 Ferias' : '🗓️ Periodos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
          </div>
        ) : tab === 'fairs' ? (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => openFairModal()}>+ Nueva feria</Button>
            </div>
            <div className="space-y-4">
              {fairs.map(fair => (
                <div key={fair.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{fair.name}</h3>
                        {fair.isActive && <Badge variant="success">Activa</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Periodos: {fair.periods?.map(fp => fp.period?.name).join(', ') || 'Sin periodos'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!fair.isActive && (
                        <Button size="sm" variant="accent" onClick={() => setActivateConfirm(fair)}>
                          Activar
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => openFairModal(fair)}>Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteFair(fair.id)}>Eliminar</Button>
                    </div>
                  </div>
                </div>
              ))}
              {fairs.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-5xl mb-4">📅</div>
                  <p>No hay ferias registradas</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => openPeriodModal()}>+ Nuevo periodo</Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openPeriodModal(p)}>Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeletePeriod(p.id)}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {periods.length === 0 && (
                <div className="text-center py-12 text-gray-500">No hay periodos registrados</div>
              )}
            </div>
          </>
        )}

        {/* Fair Modal */}
        <Modal isOpen={fairModal} onClose={() => setFairModal(false)} title={editFair ? 'Editar feria' : 'Nueva feria'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la feria</label>
              <input
                type="text"
                value={fairName}
                onChange={e => setFairName(e.target.value)}
                placeholder="Ej: Feria 1 - 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periodos asociados</label>
              <div className="space-y-2">
                {periods.map(p => (
                  <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fairPeriods.includes(p.id)}
                      onChange={e => {
                        if (e.target.checked) setFairPeriodsState(prev => [...prev, p.id]);
                        else setFairPeriodsState(prev => prev.filter(id => id !== p.id));
                      }}
                      className="rounded border-gray-300 text-[#003087] focus:ring-[#003087]"
                    />
                    <span className="text-sm text-gray-700">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveFair} loading={fairSaving} disabled={!fairName.trim()}>Guardar</Button>
              <Button variant="secondary" onClick={() => setFairModal(false)}>Cancelar</Button>
            </div>
          </div>
        </Modal>

        {/* Period Modal */}
        <Modal isOpen={periodModal} onClose={() => setPeriodModal(false)} title={editPeriod ? 'Editar periodo' : 'Nuevo periodo'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del periodo</label>
              <input
                type="text"
                value={periodName}
                onChange={e => setPeriodName(e.target.value)}
                placeholder="Ej: Febrero-Junio"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSavePeriod} loading={periodSaving} disabled={!periodName.trim()}>Guardar</Button>
              <Button variant="secondary" onClick={() => setPeriodModal(false)}>Cancelar</Button>
            </div>
          </div>
        </Modal>

        {/* Activate Confirm Modal */}
        <Modal isOpen={!!activateConfirm} onClose={() => setActivateConfirm(null)} title="Activar feria">
          <div className="space-y-4">
            <p className="text-gray-600">
              ¿Activar <strong>{activateConfirm?.name}</strong>? Esto desactivará la feria activa actual.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => handleActivate(activateConfirm.id)}>Sí, activar</Button>
              <Button variant="secondary" onClick={() => setActivateConfirm(null)}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
