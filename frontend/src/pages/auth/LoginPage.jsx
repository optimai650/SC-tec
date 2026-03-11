import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

function detectInputType(value) {
  if (/^A\d{8}$/.test(value)) return 'matricula';
  return 'email';
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const inputType = detectInputType(identifier);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credentials = inputType === 'matricula'
        ? { matricula: identifier, password }
        : { email: identifier, password };
      const user = await login(credentials);
      if (user.role === 'superadmin') navigate('/admin');
      else if (user.role === 'socio_admin') navigate('/socio');
      else navigate('/alumno');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <div className="bg-[#003087] py-6 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#003087] font-bold">T</span>
          </div>
          <div>
            <p className="text-white font-bold">Feria de Servicio Social</p>
            <p className="text-blue-200 text-sm">Tecnológico de Monterrey</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-md p-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">← Atrás</button>
            <Link to="/" className="text-sm text-[#003087] hover:underline flex items-center gap-1">← Ver oferta de proyectos</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mb-6">Ingresa con tu matrícula o correo institucional</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {identifier.length > 0
                  ? inputType === 'matricula'
                    ? '🎓 Matrícula'
                    : '📧 Correo electrónico'
                  : 'Matrícula o Correo electrónico'
                }
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="A01234567 o usuario@tec.mx"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent text-sm"
              />
              {identifier.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {inputType === 'matricula' ? 'Se usará tu matrícula para iniciar sesión' : 'Se usará tu correo para iniciar sesión'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003087] focus:border-transparent text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Si eres alumno, tu contraseña inicial es tu número de matrícula
          </p>
        </div>
      </div>
    </div>
  );
}
