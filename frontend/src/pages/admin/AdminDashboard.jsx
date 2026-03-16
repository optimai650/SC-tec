import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { getStats } from '../../services/admin';

function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-[#003087]',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFairId, setSelectedFairId] = useState('');

  const load = useCallback(async (fairId) => {
    setLoading(true);
    try {
      const data = await getStats(fairId || undefined);
      setStats(data);
      // Si no hay fairId seleccionado, usar la feria activa como default
      if (!fairId && data.feriaActiva) {
        setSelectedFairId(data.feriaActiva.id);
      }
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleFairChange = (fairId) => {
    setSelectedFairId(fairId);
    load(fairId);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 p-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Atrás</button>
        
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          {stats?.allFairs?.length > 0 && (
            <select
              value={selectedFairId}
              onChange={e => handleFairChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
            >
              {stats.allFairs.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.isActive ? ' ●' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="text-gray-500 mb-8">Estadísticas de la feria seleccionada</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {stats?.feriaActiva && (
              <div className="bg-gradient-to-r from-[#003087] to-[#0051a8] text-white rounded-xl p-5 mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${stats.feriaActiva.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-blue-200 text-sm">{stats.feriaActiva.isActive ? 'Feria activa' : 'Feria'}</p>
                  <p className="text-xl font-bold">{stats.feriaActiva.name}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Matrículas registradas" value={stats?.matriculasTotal} icon="🎓" color="blue" />
              <StatCard label="Alumnos inscritos" value={stats?.alumnosInscritos} icon="✅" color="green" />
              <StatCard label="Proyectos publicados" value={stats?.proyectosPublicados} icon="📋" color="purple" />
              <StatCard label="Cupos disponibles" value={stats?.cuposDisponibles} icon="💺" color="yellow" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
