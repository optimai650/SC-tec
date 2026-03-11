import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title = 'Feria de Servicio Social' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#003087] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#003087] font-bold text-sm">T</span>
            </div>
            <span className="text-white font-bold text-lg">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-blue-200 text-sm">
                {user.firstName} {user.lastName || ''} · {user.role === 'superadmin' ? 'Administrador' : user.role === 'socio_admin' ? 'Socio Formador' : 'Alumno'}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-white hover:text-blue-200 text-sm transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
