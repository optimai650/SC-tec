import React from 'react';
import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function OpportunityCard({ opportunity }) {
  const { id, title, description, location, startDate, endDate, remainingSlots, totalSlots, organization, status } = opportunity;
  const isFull = remainingSlots === 0 || status === 'Full';

  return (
    <div className="card flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
            {title}
          </h3>
          {organization && (
            <div className="flex items-center mt-1">
              {organization.logo ? (
                <img src={organization.logo} alt={organization.name} className="w-8 h-8 rounded-full object-cover mr-2 shrink-0" />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm mr-2 shrink-0">
                  {organization.name[0]}
                </div>
              )}
              <p className="text-sm text-indigo-600 font-medium">{organization.name}</p>
            </div>
          )}
        </div>
        {isFull && (
          <span className="badge bg-red-100 text-red-700 ml-2 shrink-0">Lleno</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{description}</p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(startDate)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {isFull ? (
              <span className="text-red-600 font-medium">Sin cupos disponibles</span>
            ) : (
              <span className="text-green-600 font-medium">{remainingSlots} cupos disponibles</span>
            )}
            <span className="text-gray-400"> / {totalSlots} total</span>
          </span>
        </div>
      </div>

      {/* Action */}
      <Link
        to={`/oportunidades/${id}`}
        className="btn-primary text-center text-sm py-2.5 mt-auto block"
      >
        Ver más →
      </Link>
    </div>
  );
}
