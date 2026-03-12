import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  // Profile + code form
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    personalEmail: '',
    tecEmail: '',
    career: '',
    semester: '',
    code: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [codeLoading, setCodeLoading] = useState(false);

  // Pre-fill form when user logs in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        personalEmail: user.personalEmail || '',
        tecEmail: user.tecEmail || (user.matricula ? `${user.matricula}@tec.mx` : ''),
        career: user.career || '',
        semester: user.semester || '',
      }));
    }
  }, [user]);

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

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'Nombre requerido';
    if (!form.lastName.trim()) errors.lastName = 'Apellido requerido';
    if (!form.phone.trim()) errors.phone = 'Teléfono requerido';
    if (!form.personalEmail.trim()) errors.personalEmail = 'Email personal requerido';
    if (!form.tecEmail.trim()) errors.tecEmail = 'Email Tec requerido';
    else if (!form.tecEmail.endsWith('@tec.mx')) errors.tecEmail = 'El email debe terminar en @tec.mx';
    if (!form.career.trim()) errors.career = 'Carrera requerida';
    if (!form.semester) errors.semester = 'Semestre requerido';
    if (!form.code.trim()) errors.code = 'Código requerido';
    return errors;
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setCodeLoading(true);
    try {
      await redeemCode({ ...form, code: form.code.trim().toUpperCase() });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Código inválido';
      if (msg.includes('ya tiene una inscripción') || msg.includes('Ya tienes')) {
        setFormErrors(prev => ({ ...prev, code: 'Ya estás inscrito en un proyecto. Ve a tu dashboard para verlo.' }));
      } else {
        setFormErrors(prev => ({ ...prev, code: msg }));
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
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Atrás</button>
          <Link to="/" className="text-sm text-[#003087] hover:underline flex items-center gap-1">← Ver oferta de proyectos</Link>
        </div>
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

            {/* Profile + Code Section */}
            {(user?.role === 'alumno') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Datos de perfil e inscripción</h2>
                <p className="text-gray-500 text-sm mb-5">Completa tu perfil e ingresa el código que te dio el socio formador</p>
                <form onSubmit={handleRedeem} className="space-y-4">
                  {/* Nombre */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={e => handleFormChange('firstName', e.target.value)}
                        placeholder="Juan"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                      />
                      {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellido <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={e => handleFormChange('lastName', e.target.value)}
                        placeholder="Pérez"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.lastName ? 'border-red-400' : 'border-gray-300'}`}
                      />
                      {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => handleFormChange('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="8110001234"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* Email personal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email personal <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.personalEmail}
                      onChange={e => handleFormChange('personalEmail', e.target.value)}
                      placeholder="juan@gmail.com"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.personalEmail ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {formErrors.personalEmail && <p className="text-red-500 text-xs mt-1">{formErrors.personalEmail}</p>}
                  </div>

                  {/* Email Tec */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Tec <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.tecEmail}
                      onChange={e => handleFormChange('tecEmail', e.target.value)}
                      placeholder="a01234567@tec.mx"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.tecEmail ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {formErrors.tecEmail && <p className="text-red-500 text-xs mt-1">{formErrors.tecEmail}</p>}
                  </div>

                  {/* Carrera + Semestre */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Carrera <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.career}
                        onChange={e => handleFormChange('career', e.target.value)}
                        placeholder="Ing. en Sistemas"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.career ? 'border-red-400' : 'border-gray-300'}`}
                      />
                      {formErrors.career && <p className="text-red-500 text-xs mt-1">{formErrors.career}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semestre <span className="text-red-500">*</span></label>
                      <select
                        value={form.semester}
                        onChange={e => handleFormChange('semester', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-sm ${formErrors.semester ? 'border-red-400' : 'border-gray-300'}`}
                      >
                        <option value="">Seleccionar</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1)}>{i + 1}° semestre</option>
                        ))}
                      </select>
                      {formErrors.semester && <p className="text-red-500 text-xs mt-1">{formErrors.semester}</p>}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de inscripción <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={e => handleFormChange('code', e.target.value.toUpperCase())}
                      placeholder="XXXXXXXX"
                      maxLength={8}
                      className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] text-center text-3xl font-mono tracking-widest ${formErrors.code ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {formErrors.code && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm mt-2">{formErrors.code}</div>
                    )}
                  </div>

                  <Button type="submit" loading={codeLoading} className="w-full" size="lg">
                    Confirmar inscripción
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
