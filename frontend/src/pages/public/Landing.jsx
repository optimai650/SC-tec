import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesAPI } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';

export default function Landing() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    opportunitiesAPI.list().then((res) => {
      setOpportunities(res.data.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Tu tiempo puede{' '}
              <span className="text-yellow-300">cambiar vidas</span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 leading-relaxed">
              Conectamos personas con ganas de ayudar con organizaciones que necesitan apoyo. Encuentra oportunidades de voluntariado cerca de ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/oportunidades"
                className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl text-lg hover:bg-yellow-300 hover:text-indigo-800 transition-colors text-center"
              >
                Ver oportunidades →
              </Link>
              <Link
                to="/registro"
                className="border-2 border-white text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-white hover:text-indigo-600 transition-colors text-center"
              >
                Ser voluntario
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-500 font-medium">Voluntarios registrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-500 font-medium">Organizaciones activas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">1,200+</div>
              <div className="text-gray-500 font-medium">Horas de voluntariado</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              En tres pasos sencillos puedes empezar a hacer la diferencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: '👤',
                title: 'Crea tu cuenta',
                description: 'Regístrate gratis en menos de 2 minutos. Solo necesitas tu email y una contraseña.',
              },
              {
                step: '2',
                icon: '🔍',
                title: 'Encuentra oportunidades',
                description: 'Explora las oportunidades disponibles y filtra por ubicación, fecha o tipo de actividad.',
              },
              {
                step: '3',
                icon: '🤝',
                title: 'Participa y ayuda',
                description: 'Regístrate en las que más te interesen y empieza a hacer el bien en tu comunidad.',
              },
            ].map((item) => (
              <div key={item.step} className="card text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto -mt-12 mb-4 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Opportunities */}
      {opportunities.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Oportunidades recientes</h2>
                <p className="text-gray-500">Estas son las oportunidades más recientes disponibles para ti.</p>
              </div>
              <Link to="/oportunidades" className="hidden sm:block btn-secondary text-sm py-2">
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/oportunidades" className="btn-secondary">
                Ver todas las oportunidades →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para marcar la diferencia?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Únete a nuestra comunidad de voluntarios y empieza a hacer el bien hoy mismo.
          </p>
          <Link
            to="/registro"
            className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-xl text-lg hover:bg-yellow-300 hover:text-indigo-800 transition-colors inline-block"
          >
            Registrarme gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
