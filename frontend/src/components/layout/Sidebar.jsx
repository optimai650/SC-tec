import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/socios', label: 'Socios Formadores', icon: '🏢' },
  { to: '/admin/projects', label: 'Proyectos', icon: '📋' },
  { to: '/admin/fairs', label: 'Ferias y Periodos', icon: '📅' },
  { to: '/admin/matriculas', label: 'Matrículas', icon: '🎓' },
  { to: '/admin/inscriptions', label: 'Inscripciones', icon: '✅' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 min-h-screen bg-[#003087] flex flex-col">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#003087] font-bold">T</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Feria de Servicio Social</p>
            <p className="text-blue-300 text-xs">Panel Administrativo</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="mb-3 px-4">
          <p className="text-blue-300 text-xs">Sesión iniciada como</p>
          <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
