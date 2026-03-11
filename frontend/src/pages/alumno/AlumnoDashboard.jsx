import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getMyInscription, redeemCode, cancelMyInscription } from '../../services/inscriptions';

export default function AlumnoDashboard() {
  const [inscription, setInscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeModal, setCodeModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    getMyInscription()
      .then(setInscription)
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setCodeError('');
    setCodeLoading(true);
    try {
      const result = await redeemCode(code.trim().toUpperCase());
      setInscription(result);
      setCodeModal(false);
      setCode('');
    } catch (err) {
      setCodeError(err.response?.data?.error || 'Código inválido');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelMyInscription();
      setInscription(null);
      setCancelModal(false);
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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Servicio Social</h1>

        {inscription ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Cupos</p>
                  <p className="text-sm font-medium text-gray-900">{inscription.project?.remainingSlots} / {inscription.project?.totalSlots} disponibles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Estado</p>
                  <Badge variant="success">{inscription.status}</Badge>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <Button variant="danger" onClick={() => setCancelModal(true)}>
                  Salir del proyecto
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No estás inscrito en ningún proyecto</h2>
            <p className="text-gray-500 mb-8">Acude a la Feria de Servicio Social para inscribirte.</p>
            <Button onClick={() => setCodeModal(true)}>
              Tengo un código
            </Button>
          </div>
        )}

        {!inscription && (
          <div className="mt-4 flex justify-center">
            <Button variant="ghost" onClick={() => setCodeModal(true)} className="text-sm">
              ¿Ya tienes un código? Ingrésalo aquí
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Ingresar código */}
      <Modal isOpen={codeModal} onClose={() => { setCodeModal(false); setCode(''); setCodeError(''); }} title="Ingresar código de inscripción">
        <form onSubmit={handleRedeem} className="space-y-4">
          <p className="text-gray-600 text-sm">Ingresa el código que te proporcionó el socio formador en la feria.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC12345"
              maxLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-center text-2xl font-mono tracking-widest uppercase"
            />
          </div>
          {codeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{codeError}</div>
          )}
          <div className="flex gap-3">
            <Button type="submit" loading={codeLoading} disabled={!code || code.length < 4}>Canjear código</Button>
            <Button variant="secondary" type="button" onClick={() => { setCodeModal(false); setCode(''); setCodeError(''); }}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar cancelación */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="¿Salir del proyecto?">
        <div className="space-y-4">
          <p className="text-gray-600">¿Estás seguro de que deseas salir del proyecto <strong>{inscription?.project?.title}</strong>? Esta acción no se puede deshacer fácilmente.</p>
          <div className="flex gap-3">
            <Button variant="danger" loading={cancelLoading} onClick={handleCancel}>Sí, salir del proyecto</Button>
            <Button variant="secondary" onClick={() => setCancelModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
