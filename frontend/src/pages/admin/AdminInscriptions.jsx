import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getAllInscriptions, deleteInscription, getAllSocios, getPeriods, getFairs, exportInscriptionsCSV } from '../../services/admin';

function CertBadge({ valid }) {
  if (valid === null || valid === undefined) return <span className="text-xs text-gray-400">Sin cert.</span>;
  return valid
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Válida</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">✗ Inválida</span>;
}

export default function AdminInscriptions() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [socios, setSocios] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fairs, setFairs] = useState([]);
  const [filterFair, setFilterFair] = useState('');
  const [filterSocio, setFilterSocio] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [certOpen, setCertOpen] = useState(false);

  const load = async (fairId) => {
    setLoading(true);
    try {
      const [insc, s, p, fs] = await Promise.all([getAllInscriptions(fairId), getAllSocios(), getPeriods(), getFairs()]);
      setInscriptions(insc);
      setSocios(s);
      setPeriods(p);
      setFairs(fs);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cargar inscripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filterFair || undefined); }, [filterFair]);

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta inscripción? El comprobante se conservará.')) return;
    try {
      await deleteInscription(id);
      load(filterFair || undefined);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportInscriptionsCSV(filterFair || undefined);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al exportar CSV');
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
          <Button variant="secondary" onClick={handleExportCSV}>
            ↓ Descargar CSV con firmas
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterFair} onChange={e => setFilterFair(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            <option value="">Todas las ferias</option>
            {fairs.map(f => (
              <option key={f.id} value={f.id}>{f.name}{f.isActive ? ' (activa)' : ''}</option>
            ))}
          </select>
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
          {(filterFair || filterSocio || filterPeriod || filterStatus) && (
            <button onClick={() => { setFilterFair(''); setFilterSocio(''); setFilterPeriod(''); setFilterStatus(''); }}
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Firma</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ins => (
                  <tr key={ins.id} className={`border-b last:border-0 hover:bg-gray-50 ${ins.revokedAt ? 'opacity-60' : ''}`}>
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
                    <td className="px-4 py-3">
                      <CertBadge valid={ins.certificateValid} />
                    </td>
                    <td className="px-4 py-3 text-right flex gap-2 justify-end">
                      <Button size="sm" variant="secondary" onClick={() => { setDetailModal(ins); setCertOpen(false); }}>Ver</Button>
                      {!ins.revokedAt && (
                        <Button size="sm" variant="danger" onClick={() => handleCancel(ins.id)}>Cancelar</Button>
                      )}
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

        {/* Detail Modal */}
        {detailModal && (
          <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detalle del alumno">
            <div className="space-y-3 text-sm max-h-[80vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Matrícula</p>
                  <p className="font-mono font-semibold">{detailModal.alumno?.matricula || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Estado</p>
                  <Badge variant={detailModal.status === 'Inscrito' ? 'success' : 'default'}>{detailModal.status}</Badge>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Nombre</p>
                  <p>{detailModal.alumno?.firstName || '—'} {detailModal.alumno?.lastName || ''}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Teléfono</p>
                  <p>{detailModal.alumno?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Email personal</p>
                  <p className="break-all">{detailModal.alumno?.personalEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Email Tec</p>
                  <p className="break-all">{detailModal.alumno?.tecEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Carrera</p>
                  <p>{detailModal.alumno?.career || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium">Semestre</p>
                  <p>{detailModal.alumno?.semester ? `${detailModal.alumno.semester}° semestre` : '—'}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-gray-500 text-xs uppercase font-medium">Proyecto</p>
                <p className="font-medium">{detailModal.project?.title}</p>
                <p className="text-gray-500 text-xs">{detailModal.project?.socioFormador?.name} · {detailModal.project?.period?.name}</p>
              </div>

              <div className="border-t pt-3">
                <p className="text-gray-500 text-xs uppercase font-medium">Fecha de inscripción</p>
                <p>{new Date(detailModal.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
              </div>

              {detailModal.revokedAt && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 text-xs uppercase font-medium">Cancelación</p>
                  <p>{new Date(detailModal.revokedAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>
                  <p className="text-gray-500 text-xs">{detailModal.revokedReason}</p>
                </div>
              )}

              {/* Comprobante firmado */}
              <div className="border-t pt-3">
                <button
                  onClick={() => setCertOpen(o => !o)}
                  className="text-sm text-[#003087] hover:underline font-medium flex items-center gap-1"
                >
                  {certOpen ? '▾' : '▸'} Comprobante firmado
                </button>
                {certOpen && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <CertBadge valid={detailModal.certificateValid} />
                      {detailModal.revokedAt
                        ? <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Revocado</span>
                        : <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Vigente</span>
                      }
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                      <div>
                        <p className="text-gray-400 uppercase font-medium mb-0.5">Fecha de firma</p>
                        <p className="font-mono">{detailModal.certificateSignedAt ? new Date(detailModal.certificateSignedAt).toLocaleString('es-MX') : '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-medium mb-0.5">SHA-256 (huella)</p>
                        <p className="font-mono break-all">{detailModal.certificateHash || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-medium mb-0.5">Firma Ed25519 (Base64)</p>
                        <p className="font-mono break-all">{detailModal.certificateSignature || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-medium mb-0.5">Payload</p>
                        <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                          {detailModal.certificatePayload
                            ? (() => { try { return JSON.stringify(JSON.parse(detailModal.certificatePayload), null, 2); } catch { return detailModal.certificatePayload; } })()
                            : '—'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button className="w-full" variant="secondary" onClick={() => setDetailModal(null)}>Cerrar</Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
