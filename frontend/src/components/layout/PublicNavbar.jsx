import { Link } from 'react-router-dom';

export default function PublicNavbar() {
  return (
    <nav className="bg-[#003087] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#003087] font-bold text-sm">T</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none block">Feria de Servicio Social</span>
              <span className="text-blue-200 text-xs">Tecnológico de Monterrey</span>
            </div>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-white border border-white/40 hover:bg-white/10 px-4 py-1.5 rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
