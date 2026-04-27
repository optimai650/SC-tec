import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import Sidebar from '../../components/layout/Sidebar';
import { getStats } from '../../services/admin';

const BRAND = '#003087';
const COLORS = ['#003087', '#0051a8', '#1e88e5', '#42a5f5', '#90caf9'];
const GREEN = '#16a34a';
const YELLOW = '#d97706';
const RED = '#dc2626';

function StatCard({ label, value, icon, sub, color = 'blue', trend }) {
  const palette = {
    blue:   { bg: 'bg-blue-50',   text: 'text-[#003087]',  border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100' },
    yellow: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100' },
  };
  const p = palette[color];
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${p.border} p-6 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${p.bg}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-4xl font-bold ${p.text}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className="pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span className="font-semibold text-gray-700">{trend}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(trend, 100)}%`,
                backgroundColor: trend >= 75 ? GREEN : trend >= 40 ? YELLOW : RED,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full bg-[#003087] inline-block" />
      {children}
    </h2>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

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
      if (!fairId && data.feriaActiva) setSelectedFairId(data.feriaActiva.id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFairChange = (fairId) => {
    setSelectedFairId(fairId);
    load(fairId);
  };

  const conversionData = stats ? [
    { name: 'Inscritos', value: stats.alumnosInscritos, fill: BRAND },
    { name: 'Sin inscribir', value: Math.max(0, stats.matriculasTotal - stats.alumnosInscritos), fill: '#e2e8f0' },
  ] : [];

  const ocupacionData = stats ? [
    { name: 'Ocupados', value: stats.matriculasTotal - (stats.cuposDisponibles || 0) > 0 ? stats.matriculasTotal - stats.cuposDisponibles : stats.alumnosInscritos, fill: BRAND },
    { name: 'Disponibles', value: stats.cuposDisponibles, fill: '#e2e8f0' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-x-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="text-xs text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1">← Atrás</button>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Estadísticas en tiempo real de la feria</p>
          </div>
          {stats?.allFairs?.length > 0 && (
            <select
              value={selectedFairId}
              onChange={e => handleFairChange(e.target.value)}
              className="border border-gray-200 bg-white rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
            >
              {stats.allFairs.map(f => (
                <option key={f.id} value={f.id}>{f.name}{f.isActive ? ' ●' : ''}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-10 h-10 border-4 border-[#003087] border-t-transparent rounded-full" />
              <p className="text-gray-400 text-sm">Cargando estadísticas…</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Banner feria */}
            {stats?.feriaActiva && (
              <div className="bg-gradient-to-r from-[#003087] via-[#00419e] to-[#0051a8] text-white rounded-2xl p-6 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🎪</div>
                    {stats.feriaActiva.isActive && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
                      {stats.feriaActiva.isActive ? 'Feria en curso' : 'Feria'}
                    </p>
                    <p className="text-2xl font-bold">{stats.feriaActiva.name}</p>
                  </div>
                </div>
                <div className="hidden md:flex gap-8 text-right">
                  <div>
                    <p className="text-3xl font-bold">{stats.tasaConversion}%</p>
                    <p className="text-blue-200 text-xs">tasa de inscripción</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{stats.alumnosInscritos}</p>
                    <p className="text-blue-200 text-xs">alumnos inscritos</p>
                  </div>
                </div>
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard label="Matrículas" value={stats?.matriculasTotal} icon="🎓" color="blue" sub="registradas en la feria" />
              <StatCard label="Inscritos" value={stats?.alumnosInscritos} icon="✅" color="green" sub="alumnos con proyecto"
                trend={stats?.tasaConversion} />
              <StatCard label="Proyectos" value={stats?.proyectosPublicados} icon="📋" color="purple" sub="publicados" />
              <StatCard label="Llenos" value={stats?.proyectosLlenos} icon="🔴" color="red" sub="sin cupos" />
              <StatCard label="Cupos libres" value={stats?.cuposDisponibles} icon="💺" color="yellow" sub="disponibles ahora" />
              <StatCard label="Conversión" value={`${stats?.tasaConversion ?? 0}%`} icon="📈" color="blue" sub="alumnos inscritos / registrados" />
            </div>

            {/* Fila 2: Donut conversión + Barras por periodo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Donut: conversión */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionTitle>Conversión de matrículas</SectionTitle>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {conversionData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-2">
                    <p className="text-4xl font-bold text-[#003087]">{stats?.tasaConversion ?? 0}%</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats?.alumnosInscritos} de {stats?.matriculasTotal} alumnos inscritos
                    </p>
                  </div>
                  <div className="flex gap-6 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#003087]" />Inscritos</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200" />Sin inscribir</span>
                  </div>
                </div>
              </div>

              {/* Barras: inscritos por periodo */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionTitle>Inscripciones por periodo</SectionTitle>
                {stats?.porPeriodo?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.porPeriodo} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="inscritos" name="Inscritos" fill={BRAND} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="disponibles" name="Cupos libres" fill="#bfdbfe" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Sin datos de periodos</div>
                )}
              </div>
            </div>

            {/* Fila 3: Ocupación por periodo + Top socios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Ocupación % por periodo */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionTitle>Ocupación por periodo</SectionTitle>
                {stats?.porPeriodo?.length > 0 ? (
                  <div className="space-y-4 mt-2">
                    {stats.porPeriodo.map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{p.periodo}</span>
                          <span className="text-gray-500">
                            {p.ocupados}/{p.total} cupos
                            <span className={`ml-2 font-bold ${p.ocupacion >= 75 ? 'text-red-500' : p.ocupacion >= 40 ? 'text-amber-500' : 'text-green-600'}`}>
                              {p.ocupacion}%
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-700"
                            style={{
                              width: `${p.ocupacion}%`,
                              backgroundColor: p.ocupacion >= 75 ? RED : p.ocupacion >= 40 ? YELLOW : GREEN,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Sin datos</div>
                )}
              </div>

              {/* Top 5 socios */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionTitle>Top socios por inscripciones</SectionTitle>
                {stats?.topSocios?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.topSocios} layout="vertical" barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="inscritos" name="Inscritos" radius={[0, 6, 6, 0]}>
                        {stats.topSocios.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-52 text-gray-400 text-sm">Sin datos de socios</div>
                )}
              </div>
            </div>

            {/* Fila 4: Top proyectos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <SectionTitle>Top proyectos más demandados</SectionTitle>
              {stats?.topProyectos?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProyectos.map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-6 text-center text-sm font-bold text-gray-400">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{p.titulo}</span>
                          <span className="text-gray-500 ml-2 shrink-0">
                            {p.ocupados}/{p.total}
                            <span className={`ml-1.5 font-bold ${p.disponibles === 0 ? 'text-red-500' : 'text-[#003087]'}`}>
                              {p.total > 0 ? Math.round((p.ocupados / p.total) * 100) : 0}%
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full transition-all duration-700"
                            style={{
                              width: p.total > 0 ? `${(p.ocupados / p.total) * 100}%` : '0%',
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                      {p.disponibles === 0 && (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Lleno</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Sin proyectos con inscripciones</div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
