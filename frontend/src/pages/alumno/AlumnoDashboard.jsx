import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getMyInscriptions, cancelMyInscription } from '../../services/inscriptions';

function CertBadge({ valid }) {
  if (valid === null || valid === undefined) return null;
  return valid
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">✓ Firma válida</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">✗ Firma inválida</span>;
}

function StatusBadge({ revokedAt }) {
  return revokedAt
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">Revocado</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Vigente</span>;
}

function CertificatePanel({ ins }) {
  const [open, setOpen] = useState(false);
  if (!ins.certificatePayload) return null;

  let payloadPretty = ins.certificatePayload;
  try { payloadPretty = JSON.stringify(JSON.parse(ins.certificatePayload), null, 2); } catch {}

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-[#003087] hover:underline flex items-center gap-1 font-medium"
      >
        {open ? '▾' : '▸'} Ver comprobante firmado
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <CertBadge valid={ins.certificateValid} />
            <StatusBadge revokedAt={ins.revokedAt} />
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 uppercase font-medium mb-1">Fecha de firma</p>
              <p className="font-mono text-gray-700">
                {ins.certificateSignedAt ? new Date(ins.certificateSignedAt).toLocaleString('es-MX') : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 uppercase font-medium mb-1">SHA-256 (huella)</p>
              <p className="font-mono text-gray-700 break-all">{ins.certificateHash || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 uppercase font-medium mb-1">Firma Ed25519 (Base64)</p>
              <p className="font-mono text-gray-700 break-all text-xs leading-relaxed">{ins.certificateSignature || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 uppercase font-medium mb-1">Datos firmados (payload)</p>
              <pre className="font-mono text-gray-700 text-xs overflow-x-auto whitespace-pre-wrap break-all">{payloadPretty}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlumnoDashboard() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    getMyInscriptions()
      .then(setInscriptions)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      await cancelMyInscription(cancelModal.id);
      setInscriptions(prev =>
        prev.map(i => i.id === cancelModal.id
          ? { ...i, revokedAt: new Date().toISOString(), status: 'Cancelado' }
          : i
        )
      );
      setCancelModal(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const activas = inscriptions.filter(i => !i.revokedAt);
  const revocadas = inscriptions.filter(i => i.revokedAt);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Atrás</button>
          <Link to="/" className="text-sm text-[#003087] hover:underline flex items-center gap-1">← Ver oferta de proyectos</Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-2">Mi Servicio Social</h1>

        {inscriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No estás inscrito en ningún proyecto</h2>
            <p className="text-gray-500 mb-8">Acude a la Feria de Servicio Social para inscribirte escaneando el código QR del proyecto.</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Inscripciones activas */}
            {activas.length > 0 && (
              <div className="space-y-6">
                {activas.map(inscription => (
                  <div key={inscription.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#003087] to-[#0051a8] p-6 text-white">
                      <div className="flex items-center gap-4">
                        {inscription.project?.socioFormador?.logo ? (
                          <img src={inscription.project.socioFormador.logo} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                            {inscription.project?.socioFormador?.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-blue-200 text-sm">Socio Formador</p>
                          <p className="text-xl font-bold">{inscription.project?.socioFormador?.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Proyecto</p>
                        <h2 className="text-xl font-semibold text-gray-900">{inscription.project?.title}</h2>
                      </div>
                      <p className="text-gray-600">{inscription.project?.description}</p>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Periodo</p>
                          <p className="text-sm font-medium text-gray-900">{inscription.project?.period?.name}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Ubicación</p>
                          <p className="text-sm font-medium text-gray-900">{inscription.project?.location}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Estado</p>
                          <Badge variant="success">{inscription.status}</Badge>
                        </div>
                      </div>

                      <CertificatePanel ins={inscription} />

                      <div className="pt-4 border-t flex gap-3">
                        <Button variant="danger" onClick={() => setCancelModal(inscription)}>
                          Salir del proyecto
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inscripciones revocadas */}
            {revocadas.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Historial de inscripciones anteriores</h2>
                <div className="space-y-4">
                  {revocadas.map(inscription => (
                    <div key={inscription.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-70">
                      <div className="bg-gray-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-500">
                          {inscription.project?.socioFormador?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Socio Formador</p>
                          <p className="font-semibold text-gray-600">{inscription.project?.socioFormador?.name}</p>
                        </div>
                        <div className="ml-auto">
                          <StatusBadge revokedAt={inscription.revokedAt} />
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="font-medium text-gray-700">{inscription.project?.title}</p>
                        <p className="text-xs text-gray-400">
                          {inscription.project?.period?.name} · Cancelado el {new Date(inscription.revokedAt).toLocaleDateString('es-MX')}
                          {inscription.revokedReason ? ` · ${inscription.revokedReason}` : ''}
                        </p>
                        <CertificatePanel ins={inscription} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="¿Salir del proyecto?">
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas salir del proyecto <strong>{cancelModal?.project?.title}</strong>?
          </p>
          <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Tu comprobante firmado se conservará como historial, pero no podrás volver a inscribirte en este periodo.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" loading={cancelLoading} onClick={handleCancel}>Sí, salir del proyecto</Button>
            <Button variant="secondary" onClick={() => setCancelModal(null)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
