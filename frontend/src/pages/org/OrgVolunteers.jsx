import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizationsAPI } from '../../services/api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const styles = {
    Registrado: 'bg-blue-100 text-blue-700',
    Completado: 'bg-green-100 text-green-700',
    Cancelado: 'bg-gray-100 text-gray-500',
  };
  return <span className={`badge ${styles[status] || ''}`}>{status}</span>;
}

export default function OrgVolunteers() {
  const { id } = useParams();
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await organizationsAPI.getOpportunityVolunteers(id);
      setSignups(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete(signupId) {
    setMarking(signupId);
    setMessage(null);
    try {
      await organizationsAPI.markAttendance(id, signupId);
      setMessage({ type: 'success', text: 'Asistencia marcada correctamente.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al marcar asistencia' });
    } finally {
      setMarking(null);
    }
  }

  const registered = signups.filter((s) => s.status === 'Registrado');
  const completed = signups.filter((s) => s.status === 'Completado');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link to="/org/oportunidades" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Volver a oportunidades
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Voluntarios registrados</h1>
        <p className="text-gray-500">Gestiona la asistencia de los voluntarios en esta oportunidad.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">{signups.length}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{registered.length}</div>
          <div className="text-sm text-gray-500">Registrados</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{completed.length}</div>
          <div className="text-sm text-gray-500">Completados</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : signups.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay voluntarios registrados</h3>
          <p className="text-gray-500">Los voluntarios que se registren aparecerán aquí.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Voluntario</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha de registro</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {signups.map((signup) => (
                  <tr key={signup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm mr-3">
                          {signup.volunteer.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{signup.volunteer.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(signup.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={signup.status} />
                    </td>
                    <td className="px-6 py-4">
                      {signup.status === 'Registrado' ? (
                        <button
                          onClick={() => handleMarkComplete(signup.id)}
                          disabled={marking === signup.id}
                          className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100 transition-colors"
                        >
                          {marking === signup.id ? 'Marcando...' : '✓ Marcar completado'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
