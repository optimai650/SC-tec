import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">Voluntarios</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Conectamos personas con ganas de ayudar con organizaciones que necesitan apoyo. Juntos hacemos la diferencia.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Plataforma</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/oportunidades" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                  Ver oportunidades
                </Link>
              </li>
              <li>
                <Link to="/registro" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                  Ser voluntario
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Organizaciones</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-500">
                  ¿Quieres registrar tu organización? Contáctanos.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Voluntarios App. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
