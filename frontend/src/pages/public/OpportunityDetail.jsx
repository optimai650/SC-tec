import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { opportunitiesAPI, signupsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSignups, setUserSignups] = useState([]);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await opportunitiesAPI.getById(id);
        setOpportunity(res.data);
      } catch {
        navigate('/oportunidades');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (user && user.role === 'volunteer') {
      signupsAPI.getMine().then((res) => setUserSignups(res.data)).catch(() => {});
    }
  }, [user]);

  const isAlreadyRegistered = userSignups.some(
    (s) => s.opportunityId === id && s.status !== 'Cancelado'
  );

  async function handleRegister() {
    if (!user) {
      navigate('/login', { state: { from: `/oportunidades/${id}` } });
      return;
    }

    setRegistering(true);
    setMessage(null);
    try {
      await signupsAPI.create({ opportunityId: id });
      setMessage({ type: 'success', text: '¡Te has registrado exitosamente! Recibirás más información pronto.' });
      // Reload opportunity to update slots
      const res = await opportunitiesAPI.getById(id);
      setOpportunity(res.data);
      setUserSignups((prev) => [...prev, { opportunityId: id, status: 'Registrado' }]);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al registrarse' });
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!opportunity) return null;

  const isFull = opportunity.remainingSlots === 0 || opportunity.status === 'Full';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link to="/oportunidades" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Volver a oportunidades
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Organization */}
            {opportunity.organization && (
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                  {opportunity.organization.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-600">{opportunity.organization.name}</p>
                  <p className="text-xs text-gray-500">{opportunity.organization.contactEmail}</p>
                </div>
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {opportunity.title}
            </h1>

            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              {opportunity.description}
            </p>

            {/* Organization description */}
            {opportunity.organization?.description && (
              <div className="bg-indigo-50 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">Sobre la organización</h3>
                <p className="text-sm text-indigo-700">{opportunity.organization.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details Card */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detalles</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ubicación</p>
                  <p className="text-sm text-gray-900 font-medium">{opportunity.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Inicio</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(opportunity.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fin</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(opportunity.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <svg className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cupos</p>
                  {isFull ? (
                    <p className="text-sm text-red-600 font-semibold">Sin cupos disponibles</p>
                  ) : (
                    <p className="text-sm font-semibold">
                      <span className="text-green-600">{opportunity.remainingSlots} disponibles</span>
                      <span className="text-gray-400"> / {opportunity.totalSlots} total</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Slots progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, ((opportunity.totalSlots - opportunity.remainingSlots) / opportunity.totalSlots) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {opportunity.totalSlots - opportunity.remainingSlots} de {opportunity.totalSlots} registrados
              </p>
            </div>
          </div>

          {/* Action Card */}
          <div className="card">
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {isAlreadyRegistered ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-semibold mb-1">Ya estás registrado</p>
                <p className="text-sm text-gray-500">Puedes gestionar tu registro desde tu cuenta.</p>
                <Link to="/mi-cuenta" className="btn-secondary w-full mt-4 text-sm py-2.5 block text-center">
                  Ver mis registros
                </Link>
              </div>
            ) : !user ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4 text-sm">Inicia sesión para registrarte en esta oportunidad.</p>
                <Link to="/login" className="btn-primary w-full block text-center mb-3">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="text-sm text-indigo-600 hover:text-indigo-800">
                  ¿No tienes cuenta? Regístrate
                </Link>
              </div>
            ) : user.role !== 'volunteer' ? (
              <p className="text-sm text-gray-500 text-center">Solo los voluntarios pueden registrarse.</p>
            ) : isFull ? (
              <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed">
                Sin cupos disponibles
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="btn-primary w-full text-center"
              >
                {registering ? 'Registrando...' : '¡Registrarme ahora!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
