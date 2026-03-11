import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { getMyProjects, generateCode } from '../../services/projects';
import { useAuth } from '../../context/AuthContext';

function SocioProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [matriculaConfirm, setMatriculaConfirm] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const slotsUsed = project.totalSlots - project.remainingSlots;
  const isValid = matricula && matriculaConfirm && matricula === matriculaConfirm && /^A\d{8}$/.test(matricula);

  const handleGenerateCode = async () => {
    setGenError('');
    setGenLoading(true);
    try {
      const data = await generateCode(project.id, matricula);
      setGeneratedCode(data.code);
    } catch (err) {
      setGenError(err.response?.data?.error || 'Error al generar código');
    } finally {
      setGenLoading(false);
    }
  };

  const handleCloseModal = () => {
    setAddModal(false);
    setMatricula('');
    setMatriculaConfirm('');
    setGenError('');
    setGeneratedCode('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{project.period?.name}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <Badge variant={project.remainingSlots > 0 ? 'success' : 'danger'}>
            {project.remainingSlots}/{project.totalSlots} cupos
          </Badge>
          <Badge variant={project.status === 'Publicado' ? 'primary' : project.status === 'Lleno' ? 'warning' : 'default'}>
            {project.status}
          </Badge>
          <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 pb-5">
          <div className="flex items-center justify-between py-4">
            <h4 className="font-medium text-gray-700 text-sm">Alumnos inscritos ({slotsUsed})</h4>
            <Button size="sm" onClick={() => setAddModal(true)} disabled={project.remainingSlots <= 0}>
              + Agregar alumno
            </Button>
          </div>

          {project.inscriptions?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="pb-2">Matrícula</th>
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {project.inscriptions.map(ins => (
                  <tr key={ins.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-gray-900">{ins.alumno?.matricula || '—'}</td>
                    <td className="py-2 text-gray-700">{ins.alumno?.firstName} {ins.alumno?.lastName}</td>
                    <td className="py-2 text-gray-500">{new Date(ins.createdAt).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">No hay alumnos inscritos aún</p>
          )}
        </div>
      )}

      {/* Modal: Agregar alumno */}
      <Modal isOpen={addModal} onClose={handleCloseModal} title="Generar código de inscripción">
        {!generatedCode ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Ingresa la matrícula del alumno y confirma. El código generado es de un solo uso.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula del alumno</label>
              <input
                type="text"
                value={matricula}
                onChange={e => setMatricula(e.target.value.toUpperCase())}
                placeholder="A01234567"
                maxLength={9}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar matrícula</label>
              <input
                type="text"
                value={matriculaConfirm}
                onChange={e => setMatriculaConfirm(e.target.value.toUpperCase())}
                placeholder="A01234567"
                maxLength={9}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] font-mono ${
                  matriculaConfirm && matricula !== matriculaConfirm ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {matriculaConfirm && matricula !== matriculaConfirm && (
                <p className="text-red-500 text-xs mt-1">Las matrículas no coinciden</p>
              )}
            </div>
            {genError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{genError}</div>
            )}
            <div className="flex gap-3">
              <Button onClick={handleGenerateCode} loading={genLoading} disabled={!isValid}>
                Generar código
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="bg-[#003087]/5 rounded-xl p-6 border-2 border-[#003087]/20">
              <p className="text-sm text-gray-600 mb-2">Código de inscripción</p>
              <p className="text-5xl font-mono font-bold text-[#003087] tracking-widest">{generatedCode}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
              📋 Entrega este código al alumno para que lo use al escanear el QR del proyecto.
              <br />El código es de <strong>un solo uso</strong>.
            </div>
            <p className="text-sm text-gray-500">Matrícula: <span className="font-mono font-medium">{matricula}</span></p>
            <Button onClick={handleCloseModal} className="w-full">Cerrar</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function SocioDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getMyProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

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

  const socioName = projects[0]?.socioFormador?.name || 'Mi Organización';
  const socioLogo = projects[0]?.socioFormador?.logo;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Atrás</button>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {socioLogo ? (
            <img src={socioLogo} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#003087] flex items-center justify-center text-white font-bold text-2xl">
              {socioName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{socioName}</h1>
            <p className="text-gray-500">Panel del Socio Formador</p>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map(project => (
              <SocioProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg font-medium">No tienes proyectos asignados</p>
              <p className="text-sm">Contacta al administrador para asignarte proyectos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
