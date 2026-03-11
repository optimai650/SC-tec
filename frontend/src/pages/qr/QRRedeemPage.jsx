import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProjectByToken } from '../../services/projects';
import { redeemCode } from '../../services/inscriptions';
import { login as loginService } from '../../services/auth';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PublicNavbar from '../../components/layout/PublicNavbar';

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
            fontSize: '1.5rem',
          }}
        >
          {['🎉', '✨', '🎊', '⭐', '🌟'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
}

export default function QRRedeemPage() {
  const { qrToken } = useParams();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auth form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Code form
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    getProjectByToken(qrToken)
      .then(setProject)
      .catch(() => setError('Proyecto no encontrado'))
      .finally(() => setLoading(false));
  }, [qrToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const isMatricula = /^A\d{8}$/.test(identifier);
      const credentials = isMatricula ? { matricula: identifier, password } : { email: identifier, password };
      const loggedUser = await login(credentials);
      if (loggedUser.role !== 'alumno') {
        setAuthError('Solo los alumnos pueden inscribirse aquí');
        navigate(loggedUser.role === 'superadmin' ? '/admin' : '/socio');
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setCodeError('');
    setCodeLoading(true);
    try {
      await redeemCode(code.trim().toUpperCase());
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Código inválido';
      if (msg.includes('ya tiene una inscripción')) {
        setCodeError('Ya estás inscrito en un proyecto. Ve a tu dashboard para verlo.');
      } else {
        setCodeError(msg);
      }
    } finally {
      setCodeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <PublicNavbar />
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <PublicNavbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-900">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {success && <Confetti />}
      <PublicNavbar />

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Project Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003087] to-[#0051a8] p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              {project.socioFormador?.logo ? (
                <img src={project.socioFormador.logo} alt="" className="w-12 h-12 rounded-full border-2 border-white/50" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {project.socioFormador?.name?.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-blue-200 text-sm">Socio Formador</p>
                <p className="font-bold">{project.socioFormador?.name}</p>
              </div>
            </div>
            <h1 className="text-xl font-bold">{project.title}</h1>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-gray-600 text-sm">{project.description}</p>
            <div className="flex flex-wrap gap-3">
              <span className="text-sm text-gray-500">📍 {project.location}</span>
              <Badge variant="primary">{project.period?.name}</Badge>
              <Badge variant={project.remainingSlots > 0 ? 'success' : 'danger'}>
                {project.remainingSlots} cupo{project.remainingSlots !== 1 ? 's' : ''} disponible{project.remainingSlots !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>

        {success ? (
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Inscripción exitosa!</h2>
            <p className="text-gray-600 mb-6">Quedaste inscrito en <strong>{project.title}</strong>.</p>
            <Button onClick={() => navigate('/alumno')}>Ver mi dashboard</Button>
          </div>
        ) : (
          <>
            {/* Login Section (only if not logged in) */}
            {!user && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="font-semibold text-gray-900 mb-4">Identificación</h2>
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {/^A\d{8}$/.test(identifier) ? '🎓 Matrícula' : 'Matrícula o Correo'}
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="A01234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm"
                    />
                  </div>
                  {authError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{authError}</div>
                  )}
                  <Button type="submit" loading={authLoading} className="w-full">Identificarse</Button>
                </form>
              </div>
            )}

            {/* Code Section */}
            {(user?.role === 'alumno') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Ingresar código</h2>
                <p className="text-gray-500 text-sm mb-4">Ingresa el código que te dio el socio formador</p>
                <form onSubmit={handleRedeem} className="space-y-3">
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    maxLength={8}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-center text-3xl font-mono tracking-widest"
                  />
                  {codeError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{codeError}</div>
                  )}
                  <Button type="submit" loading={codeLoading} disabled={!code || code.length < 4} className="w-full" size="lg">
                    Inscribirme
                  </Button>
                </form>
              </div>
            )}

            {user && user.role !== 'alumno' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-sm text-yellow-800">
                Esta página es solo para alumnos. Tu rol actual es: {user.role}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
