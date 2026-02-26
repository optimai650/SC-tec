import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signupsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const styles = {
    Registrado: 'bg-blue-100 text-blue-700',
    Completado: 'bg-green-100 text-green-700',
    Cancelado: 'bg-gray-100 text-gray-600',
  };
  const labels = {
    Registrado: 'Registrado',
    Completado: 'Asistio',
    Cancelado: 'Cancelado',
  };
  return (
    <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSignups();
  }, []);

  async function loadSignups() {
    setLoading(true);
    try {
      const res = await signupsAPI.getMine();
      setSignups(res.data);
    } catch {
      setSignups([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(signupId) {
    setCanceling(signupId);
    setMessage(null);
    try {
      await signupsAPI.cancel(signupId);
      setMessage({ type: 'success', text: 'Registro cancelado correctamente.' });
      loadSignups();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al cancelar' });
    } finally {
      setCanceling(null);
    }
  }

  const now = new Date();
  const upcoming = signups.filter(
    (s) => s.status === 'Registrado' && new Date(s.opportunity.startDate) > now
  );
  const history = signups.filter(
    (s) => s.status === 'Completado' || new Date(s.opportunity.startDate) <= now
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi cuenta</h1>
        <p className="text-gray-500">{user.email}</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="card text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-1">{signups.length}</div>
          <div className="text-sm text-gray-500">Registros totales</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{upcoming.length}</div>
          <div className="text-sm text-gray-500">Próximos</div>
        </div>
        <div className="card text-center col-span-2 sm:col-span-1">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {signups.filter((s) => s.status === 'Completado').length}
          </div>
          <div className="text-sm text-gray-500">Asistencias</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Upcoming */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              Próximos registros
            </h2>
            {upcoming.length === 0 ? (
              <div className="card text-center py-10">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-500 mb-4">No tienes registros próximos.</p>
                <Link to="/oportunidades" className="btn-primary text-sm">
                  Ver oportunidades disponibles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((signup) => (
                  <div key={signup.id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={signup.status} />
                          <span className="text-xs text-gray-400">
                            Registrado el {formatDate(signup.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {signup.opportunity.title}
                        </h3>
                        <p className="text-sm text-indigo-600 font-medium mb-2">
                          {signup.opportunity.organization?.name}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>📍 {signup.opportunity.location}</span>
                          <span>📅 {formatDate(signup.opportunity.startDate)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link
                          to={`/oportunidades/${signup.opportunityId}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Ver detalle
                        </Link>
                        <button
                          onClick={() => handleCancel(signup.id)}
                          disabled={canceling === signup.id}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          {canceling === signup.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Historial
            </h2>
            {history.length === 0 ? (
              <div className="card text-center py-10">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">Tu historial de voluntariado aparecerá aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((signup) => (
                  <div key={signup.id} className="card opacity-80">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={signup.status} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {signup.opportunity.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mb-2">
                          {signup.opportunity.organization?.name}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span>📍 {signup.opportunity.location}</span>
                          <span>📅 {formatDate(signup.opportunity.startDate)}</span>
                        </div>
                      </div>
                      <Link
                        to={`/oportunidades/${signup.opportunityId}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
