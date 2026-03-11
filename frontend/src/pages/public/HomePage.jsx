import { useState, useEffect } from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getPublicProjects } from '../../services/projects';
import api from '../../services/api';

function SocioInitial({ name, logo }) {
  if (logo) {
    return <img src={logo} alt={name} className="w-12 h-12 rounded-full object-cover" />;
  }
  return (
    <div className="w-12 h-12 rounded-full bg-[#003087] flex items-center justify-center text-white font-bold text-lg">
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [activeFair, setActiveFair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterSocio, setFilterSocio] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, activeFairData] = await Promise.all([
          getPublicProjects(),
          api.get('/public/active-fair').catch(() => ({ data: null })).then(r => r.data || null)
        ]);
        setProjects(projectsData);
        setActiveFair(activeFairData);
      } catch {
        try {
          const projectsData = await getPublicProjects();
          setProjects(projectsData);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extraer socios y periodos únicos
  const socios = [...new Map(projects.map(p => [p.socioFormador?.id, p.socioFormador])).values()].filter(Boolean);
  const periods = [...new Map(projects.map(p => [p.period?.id, p.period])).values()].filter(Boolean);

  const filtered = projects.filter(p => {
    if (filterSocio && p.socioFormadorId !== filterSocio) return false;
    if (filterPeriod && p.periodId !== filterPeriod) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <PublicNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#003087] to-[#0051a8] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Feria de Servicio Social</h1>
          <p className="text-blue-200 text-lg">Tecnológico de Monterrey</p>
          {activeFair && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{activeFair.name} — Activa</span>
            </div>
          )}
        </div>
      </div>

      {/* Banner informativo — cómo participar */}
      <div className="max-w-7xl mx-auto mt-6 px-4">
        <div className="bg-[#e8f0fb] border-l-4 border-[#003087] rounded-lg px-6 py-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📋</span>
                <h2 className="text-lg font-bold text-[#003087]">¿Cómo participar en la Feria?</h2>
              </div>
              <ol className="text-sm text-gray-700 space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#003087] min-w-[1.5rem]">1.</span>
                  <span><strong>Explora</strong> — Revisa los proyectos disponibles en esta página y elige el que más te interese.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#003087] min-w-[1.5rem]">2.</span>
                  <span><strong>Pre-regístrate</strong> — Haz tu pre-registro en Microsoft Bookings para poder asistir a la feria.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#003087] min-w-[1.5rem]">3.</span>
                  <span><strong>Acude a la feria</strong> — Visita presencialmente la Feria de Servicio Social.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-[#003087] min-w-[1.5rem]">4.</span>
                  <span><strong>Inscríbete</strong> — Escanea el QR del socio formador que te interesa, ingresa el código que te den y ¡listo!</span>
                </li>
              </ol>
            </div>
            <div className="flex-shrink-0 flex items-center md:items-start md:mt-1">
              <a
                href="https://outlook.office365.com/book/FeriaServicioSocialTec@itesm.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#003087] hover:bg-[#00256e] text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-md whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Hacer pre-registro en Microsoft Bookings
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterSocio}
            onChange={e => setFilterSocio(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          >
            <option value="">Todos los socios</option>
            {socios.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          >
            <option value="">Todos los periodos</option>
            {periods.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {(filterSocio || filterPeriod) && (
            <button
              onClick={() => { setFilterSocio(''); setFilterPeriod(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{filtered.length} proyecto{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(project => (
                <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-medium">No hay proyectos disponibles</p>
                <p className="text-sm">Prueba con otros filtros</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.title}
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SocioInitial name={selectedProject.socioFormador?.name} logo={selectedProject.socioFormador?.logo} />
              <div>
                <p className="font-medium text-gray-900">{selectedProject.socioFormador?.name}</p>
                <p className="text-sm text-gray-500">{selectedProject.period?.name}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Ubicación</p>
                <p className="text-sm text-gray-900 mt-1">📍 {selectedProject.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Cupos disponibles</p>
                <p className="text-sm mt-1">
                  <span className={`font-bold ${selectedProject.remainingSlots > 5 ? 'text-green-600' : selectedProject.remainingSlots > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {selectedProject.remainingSlots}
                  </span>
                  <span className="text-gray-500"> / {selectedProject.totalSlots}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              <Badge variant="primary">{selectedProject.period?.name}</Badge>
              <Badge variant={selectedProject.status === 'Publicado' ? 'success' : 'warning'}>
                {selectedProject.status}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ProjectCard({ project, onClick }) {
  const slots = project.remainingSlots;
  const slotVariant = slots > 5 ? 'success' : slots > 0 ? 'warning' : 'danger';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {project.socioFormador?.logo ? (
              <img src={project.socioFormador.logo} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center text-white font-bold">
                {project.socioFormador?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{project.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{project.socioFormador?.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 truncate">📍 {project.location}</span>
          <Badge variant={slotVariant}>{slots} cupo{slots !== 1 ? 's' : ''}</Badge>
        </div>
        <div className="mt-2">
          <Badge variant="primary">{project.period?.name}</Badge>
        </div>
      </div>
    </div>
  );
}
