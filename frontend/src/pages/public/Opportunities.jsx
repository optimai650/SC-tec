import React, { useState, useEffect } from 'react';
import { opportunitiesAPI } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: '', startDate: '' });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities(params = {}) {
    setLoading(true);
    try {
      const res = await opportunitiesAPI.list(params);
      setOpportunities(res.data);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (filters.location) params.location = filters.location;
    if (filters.startDate) params.startDate = filters.startDate;
    fetchOpportunities(params);
  }

  function handleReset() {
    setFilters({ location: '', startDate: '' });
    fetchOpportunities();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Oportunidades de voluntariado
        </h1>
        <p className="text-lg text-gray-500">
          Encuentra la oportunidad perfecta para ti y empieza a hacer el bien.
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar oportunidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Ubicación</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Ej: Ciudad de México"
              className="input"
            />
          </div>
          <div>
            <label className="label">Fecha desde</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input"
            />
          </div>
          <div className="flex items-end gap-3">
            <button type="submit" className="btn-primary flex-1 text-sm py-3">
              Buscar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary flex-1 text-sm py-3"
            >
              Limpiar
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron oportunidades</h3>
          <p className="text-gray-500">Intenta cambiar los filtros de búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {opportunities.length} oportunidad{opportunities.length !== 1 ? 'es' : ''} encontrada{opportunities.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
