import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { organizationsAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OrgOpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    totalSlots: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      organizationsAPI.getMyOpportunities().then((res) => {
        const opp = res.data.find((o) => o.id === id);
        if (opp) {
          setForm({
            title: opp.title,
            description: opp.description,
            location: opp.location,
            startDate: toDatetimeLocal(opp.startDate),
            endDate: toDatetimeLocal(opp.endDate),
            totalSlots: String(opp.totalSlots),
          });
        }
      }).finally(() => setFetching(false));
    }
  }, [id, isEditing]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.location || !form.startDate || !form.endDate || !form.totalSlots) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('La fecha de inicio debe ser antes que la fecha de fin');
      return;
    }

    if (parseInt(form.totalSlots) < 1) {
      setError('El número de cupos debe ser al menos 1');
      return;
    }

    setLoading(true);
    const payload = { ...form, totalSlots: parseInt(form.totalSlots, 10) };
    try {
      if (isEditing) {
        await organizationsAPI.updateOpportunity(id, payload);
      } else {
        await organizationsAPI.createOpportunity(payload);
      }
      navigate('/org/oportunidades');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la oportunidad');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar oportunidad' : 'Nueva oportunidad'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditing ? 'Modifica los detalles de esta oportunidad.' : 'Completa el formulario para crear una nueva oportunidad.'}
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label" htmlFor="title">Título *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Distribución de alimentos en el centro"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe la oportunidad, qué harán los voluntarios, qué se requiere..."
              className="input min-h-[120px] resize-y"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="location">Ubicación *</label>
            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="Ej: Centro Comunitario Norte, Ciudad de México"
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label" htmlFor="startDate">Fecha y hora de inicio *</label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="endDate">Fecha y hora de fin *</label>
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="totalSlots">Número de cupos *</label>
            <input
              id="totalSlots"
              name="totalSlots"
              type="number"
              min="1"
              max="1000"
              value={form.totalSlots}
              onChange={handleChange}
              placeholder="Ej: 20"
              className="input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing
                ? 'Nota: cambiar el total de cupos no actualiza automáticamente los cupos restantes.'
                : 'Los cupos restantes se inicializarán con este valor.'}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear oportunidad'}
            </button>
            <Link to="/org/oportunidades" className="btn-secondary flex-1 text-center">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
