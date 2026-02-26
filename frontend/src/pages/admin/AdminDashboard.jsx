import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('No se pudieron cargar las estadisticas.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Organizaciones',
      value: stats?.totalOrgs ?? '-',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      icon: '🏢',
      link: '/admin/organizaciones',
      linkLabel: 'Gestionar',
    },
    {
      label: 'Oportunidades',
      value: stats?.totalOpportunities ?? '-',
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: '📋',
      link: '/admin/oportunidades',
      linkLabel: 'Ver todas',
    },
    {
      label: 'Registros activos',
      value: stats?.totalSignups ?? '-',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: '✅',
      link: '/admin/registros',
      linkLabel: 'Ver detalle',
    },
    {
      label: 'Voluntarios',
      value: stats?.totalUsers ?? '-',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      icon: '👥',
      link: '/admin/voluntarios',
      linkLabel: 'Ver detalle',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de administración</h1>
        <p className="text-gray-500">Bienvenido al panel de control de Voluntariado Maguen David.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card) => (
            <div key={card.label} className="card hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {card.icon}
              </div>
              <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}</div>
              <div className="text-sm text-gray-500 mb-4">{card.label}</div>
              <Link to={card.link} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">
                {card.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/organizaciones/nueva" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl mr-4 group-hover:bg-indigo-600 transition-colors">
                🏢
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Crear organización</h3>
                <p className="text-sm text-gray-500">Registrar nueva organización y admin</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/organizaciones" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl mr-4 group-hover:bg-green-600 transition-colors">
                ✓
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Aprobar organizaciones</h3>
                <p className="text-sm text-gray-500">Revisar solicitudes pendientes</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/oportunidades" className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl mr-4 group-hover:bg-blue-600 transition-colors">
                📋
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver oportunidades</h3>
                <p className="text-sm text-gray-500">Todas las oportunidades de la plataforma</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
