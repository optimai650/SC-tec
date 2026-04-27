const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { initKeys, buildPayload, signPayload } = require('../utils/certificates');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');
  initKeys();

  // ─── SUPERADMIN ───────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@tec.mx' },
    update: {},
    create: {
      email: 'admin@tec.mx',
      passwordHash: await bcrypt.hash('Admin1234!', 10),
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
    },
  });

  // ─── PERIODOS ─────────────────────────────────────────────────────────────
  // Los periodos son fijos y se reutilizan cada año. El contexto del año lo da la feria.
  const periods = [
    { id: 'period-feb-jun',             name: 'Febrero-Junio' },
    { id: 'period-intensivo-invierno',  name: 'Intensivo de Invierno' },
    { id: 'period-intensivo-verano',    name: 'Intensivo de Verano' },
    { id: 'period-ago-dic',             name: 'Agosto-Diciembre' },
  ];
  for (const p of periods) {
    await prisma.period.upsert({ where: { id: p.id }, update: {}, create: p });
  }

  // ─── FERIAS ───────────────────────────────────────────────────────────────
  const ferias = [
    { id: 'feria-1-2024', name: 'Feria SC 1 - 2024', isActive: false },
    { id: 'feria-2-2024', name: 'Feria SC 2 - 2024', isActive: false },
    { id: 'feria-1-2025', name: 'Feria SC 1 - 2025', isActive: true },
    { id: 'feria-2-2025', name: 'Feria SC 2 - 2025', isActive: false },
  ];
  for (const f of ferias) {
    await prisma.fair.upsert({ where: { id: f.id }, update: {}, create: f });
  }

  // ─── FAIR PERIODS ─────────────────────────────────────────────────────────
  // Feria 1 (primer semestre) → Feb-Jun + Intensivo de Invierno
  // Feria 2 (segundo semestre) → Verano + Ago-Dic
  const fairPeriods = [
    { fairId: 'feria-1-2024', periodId: 'period-feb-jun' },
    { fairId: 'feria-1-2024', periodId: 'period-intensivo-invierno' },
    { fairId: 'feria-2-2024', periodId: 'period-intensivo-verano' },
    { fairId: 'feria-2-2024', periodId: 'period-ago-dic' },
    { fairId: 'feria-1-2025', periodId: 'period-feb-jun' },
    { fairId: 'feria-1-2025', periodId: 'period-intensivo-invierno' },
    { fairId: 'feria-2-2025', periodId: 'period-intensivo-verano' },
    { fairId: 'feria-2-2025', periodId: 'period-ago-dic' },
  ];
  for (const fp of fairPeriods) {
    await prisma.fairPeriod.upsert({
      where: { fairId_periodId: { fairId: fp.fairId, periodId: fp.periodId } },
      update: {},
      create: fp,
    });
  }

  // ─── SOCIOS FORMADORES ────────────────────────────────────────────────────
  const socios = [
    { id: 'socio-cruz-roja',        name: 'Cruz Roja Monterrey',             contactEmail: 'admin@cruzroja.mx',       description: 'Cruz Roja Mexicana Delegación Nuevo León. Atención de emergencias, donación de sangre y capacitación en primeros auxilios.', status: 'Activo' },
    { id: 'socio-banco-alimentos',  name: 'Banco de Alimentos NL',           contactEmail: 'admin@bancoalimentos.mx', description: 'Banco de Alimentos de Nuevo León. Recuperación, clasificación y distribución de alimentos a familias vulnerables.', status: 'Activo' },
    { id: 'socio-caritas',          name: 'Cáritas Monterrey',               contactEmail: 'admin@caritasmty.mx',    description: 'Organización de asistencia social de la Arquidiócesis de Monterrey. Atención a personas en situación de pobreza.', status: 'Activo' },
    { id: 'socio-techo',            name: 'TECHO México',                    contactEmail: 'admin@techo.mx',         description: 'Construcción de viviendas de emergencia y desarrollo comunitario en asentamientos irregulares de México.', status: 'Activo' },
    { id: 'socio-aldeas',           name: 'Aldeas Infantiles SOS NL',        contactEmail: 'admin@aldeas.mx',        description: 'Cuidado, protección y desarrollo de niñas, niños y jóvenes sin cuidado parental o en riesgo de perderlo.', status: 'Activo' },
    { id: 'socio-merced',           name: 'Fundación Merced NL',             contactEmail: 'admin@merced.mx',        description: 'Fortalecimiento institucional de OSC, apoyo a microemprendedores y desarrollo de capacidades comunitarias.', status: 'Activo' },
    { id: 'socio-proteccion-civil', name: 'Voluntarios Protección Civil NL', contactEmail: 'admin@pcivil.mx',        description: 'Capacitación ciudadana en gestión de riesgos, primeros respondientes y protección civil comunitaria.', status: 'Activo' },
    { id: 'socio-banco-ropa',       name: 'Banco de Ropa NL',               contactEmail: 'admin@bancoropa.mx',     description: 'Recolección, clasificación y distribución de ropa y calzado a personas y familias en situación vulnerable.', status: 'Activo' },
    { id: 'socio-ambiental',        name: 'Colectivo Ambiental MTY',         contactEmail: 'admin@ambientalmty.mx', description: 'Reforestación, limpieza de cuerpos de agua y educación ambiental en áreas naturales de Nuevo León.', status: 'Activo' },
    { id: 'socio-cij',              name: 'Centro de Integración Juvenil NL', contactEmail: 'admin@cij.mx',         description: 'Prevención de adicciones y talleres de habilidades para la vida dirigidos a jóvenes de 12 a 24 años.', status: 'Activo' },
  ];
  for (const s of socios) {
    await prisma.socioFormador.upsert({ where: { id: s.id }, update: {}, create: s });
  }

  // ─── USUARIOS SOCIO_ADMIN ─────────────────────────────────────────────────
  const socioAdmins = [
    { email: 'admin@cruzroja.mx',      firstName: 'María',       lastName: 'Reséndiz Garza',   socioId: 'socio-cruz-roja' },
    { email: 'admin@bancoalimentos.mx', firstName: 'Roberto',     lastName: 'Cavazos Treviño',  socioId: 'socio-banco-alimentos' },
    { email: 'admin@caritasmty.mx',    firstName: 'Rosa',         lastName: 'Villarreal Hdez',  socioId: 'socio-caritas' },
    { email: 'admin@techo.mx',         firstName: 'Andrés',       lastName: 'Salinas Leal',     socioId: 'socio-techo' },
    { email: 'admin@aldeas.mx',        firstName: 'Claudia',      lastName: 'Ríos Montemayor',  socioId: 'socio-aldeas' },
    { email: 'admin@merced.mx',        firstName: 'Gabriel',      lastName: 'Montoya Escamilla', socioId: 'socio-merced' },
    { email: 'admin@pcivil.mx',        firstName: 'Juan Carlos',  lastName: 'Pérez Longoria',   socioId: 'socio-proteccion-civil' },
    { email: 'admin@bancoropa.mx',     firstName: 'Guadalupe',    lastName: 'Garza Flores',     socioId: 'socio-banco-ropa' },
    { email: 'admin@ambientalmty.mx',  firstName: 'Diana',        lastName: 'Vásquez Morales',  socioId: 'socio-ambiental' },
    { email: 'admin@cij.mx',           firstName: 'Ramón',        lastName: 'Estrada Fuentes',  socioId: 'socio-cij' },
  ];
  const socioAdminPw = await bcrypt.hash('Socio1234!', 10);
  for (const sa of socioAdmins) {
    await prisma.user.upsert({
      where: { email: sa.email },
      update: {},
      create: {
        email: sa.email,
        passwordHash: socioAdminPw,
        role: 'socio_admin',
        firstName: sa.firstName,
        lastName: sa.lastName,
        socioFormadorId: sa.socioId,
      },
    });
  }

  // ─── PROYECTOS ────────────────────────────────────────────────────────────
  // QR tokens fijos para que el seed sea idempotente
  const projects = [
    // ── Cruz Roja (4) ──────────────────────────────────────────────────────
    {
      id: 'proj-brigadas-salud',
      title: 'Brigadas de Salud Comunitaria',
      description: 'Apoya en brigadas de salud en comunidades vulnerables de Monterrey. Actividades incluyen toma de presión arterial, glucometría, orientación médica básica y canalización a servicios de salud.',
      location: 'Col. Independencia, MTY',
      totalSlots: 20, remainingSlots: 15, status: 'Publicado',
      qrToken: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
      socioId: 'socio-cruz-roja', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-primeros-auxilios',
      title: 'Capacitación en Primeros Auxilios',
      description: 'Imparte talleres de primeros auxilios básicos a empresas, escuelas y comunidades del área metropolitana de Monterrey. Incluye RCP, manejo de heridas y traslado de lesionados.',
      location: 'Sede Cruz Roja MTY, San Nicolás NL',
      totalSlots: 15, remainingSlots: 12, status: 'Publicado',
      qrToken: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
      socioId: 'socio-cruz-roja', periodId: 'period-intensivo-invierno',
    },
    {
      id: 'proj-donacion-sangre',
      title: 'Campaña de Donación de Sangre',
      description: 'Organización y promoción de jornadas de donación de sangre en universidades, empresas y espacios públicos. Incluye logística, registro de donantes y apoyo post-donación.',
      location: 'Campus Monterrey y zona metropolitana',
      totalSlots: 25, remainingSlots: 25, status: 'Borrador',
      qrToken: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
      socioId: 'socio-cruz-roja', periodId: 'period-ago-dic',
    },
    {
      id: 'proj-emergencias-2024',
      title: 'Respuesta a Emergencias Comunitarias 2024',
      description: 'Apoyo en simulacros y respuesta a emergencias menores en colonias vulnerables. Proyecto concluido exitosamente con más de 200 familias beneficiadas.',
      location: 'Zona Norte MTY',
      totalSlots: 20, remainingSlots: 0, status: 'Cerrado',
      qrToken: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
      socioId: 'socio-cruz-roja', periodId: 'period-ago-dic',
    },

    // ── Banco de Alimentos (4) ─────────────────────────────────────────────
    {
      id: 'proj-clasificacion',
      title: 'Clasificación y Distribución de Alimentos',
      description: 'Apoya en la clasificación, empaque y distribución de alimentos a familias en situación vulnerable del área metropolitana. Sábados de 9am a 1pm en la Bodega Central.',
      location: 'Bodega Central, Guadalupe NL',
      totalSlots: 30, remainingSlots: 25, status: 'Publicado',
      qrToken: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      socioId: 'socio-banco-alimentos', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-campana-recoleccion',
      title: 'Campañas de Recolección de Alimentos',
      description: 'Organización y ejecución de campañas de recolección en centros comerciales y puntos de alta afluencia. Los voluntarios promueven la donación y gestionan los puntos de acopio.',
      location: 'Varios centros comerciales MTY',
      totalSlots: 25, remainingSlots: 23, status: 'Publicado',
      qrToken: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
      socioId: 'socio-banco-alimentos', periodId: 'period-intensivo-verano',
    },
    {
      id: 'proj-huerto-comunitario',
      title: 'Huertos Comunitarios Sustentables',
      description: 'Implementación y mantenimiento de huertos comunitarios en colonias de alta marginación para promover la soberanía alimentaria y hábitos de alimentación saludable.',
      location: 'Col. Tierra Propia, Apodaca NL',
      totalSlots: 20, remainingSlots: 20, status: 'Publicado',
      qrToken: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
      socioId: 'socio-banco-alimentos', periodId: 'period-ago-dic',
    },
    {
      id: 'proj-alimentos-2024',
      title: 'Distribución Navideña 2024',
      description: 'Campaña especial de recolección y distribución de despensas navideñas para más de 1,500 familias. Proyecto concluido.',
      location: 'Bodega Central y puntos de distribución NL',
      totalSlots: 50, remainingSlots: 0, status: 'Cerrado',
      qrToken: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
      socioId: 'socio-banco-alimentos', periodId: 'period-intensivo-invierno',
    },

    // ── Cáritas (2) ────────────────────────────────────────────────────────
    {
      id: 'proj-caritas-catequesis',
      title: 'Apoyo en Catequesis Social',
      description: 'Acompaña a facilitadores en talleres de valores, ciudadanía y habilidades socioemocionales en comunidades vulnerables del norte de Monterrey.',
      location: 'Parroquia San Pablo, MTY',
      totalSlots: 15, remainingSlots: 14, status: 'Publicado',
      qrToken: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4',
      socioId: 'socio-caritas', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-caritas-adultos',
      title: 'Acompañamiento a Adultos Mayores',
      description: 'Visitas domiciliarias, actividades recreativas y apoyo psicosocial para adultos mayores en situación de abandono o soledad en zonas de alta marginación.',
      location: 'Zona Cumbres y San Bernabé, MTY',
      totalSlots: 20, remainingSlots: 20, status: 'Borrador',
      qrToken: 'd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5',
      socioId: 'socio-caritas', periodId: 'period-ago-dic',
    },

    // ── TECHO (4) ─────────────────────────────────────────────────────────
    {
      id: 'proj-techo-construccion',
      title: 'Construcción de Viviendas de Emergencia',
      description: 'Participa en la construcción de mediaguas para familias que viven en condiciones de extrema precariedad en asentamientos irregulares. Trabajo físico en campo, fin de semana completo.',
      location: 'Asentamiento El Mezquital, García NL',
      totalSlots: 40, remainingSlots: 37, status: 'Publicado',
      qrToken: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
      socioId: 'socio-techo', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-techo-diagnostico',
      title: 'Diagnóstico Comunitario Participativo',
      description: 'Levantamiento de información socioeconómica en comunidades para identificar necesidades prioritarias de intervención habitacional y social.',
      location: 'Municipios del AMM',
      totalSlots: 30, remainingSlots: 28, status: 'Publicado',
      qrToken: 'f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
      socioId: 'socio-techo', periodId: 'period-intensivo-invierno',
    },
    {
      id: 'proj-techo-educacion',
      title: 'Programa Yo Estudio y Trabajo',
      description: 'Tutorías y apoyo escolar para niños y jóvenes de asentamientos irregulares en riesgo de deserción escolar. Actividades de lunes a viernes en horario vespertino.',
      location: 'Col. Tierra y Libertad, MTY',
      totalSlots: 25, remainingSlots: 25, status: 'Publicado',
      qrToken: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
      socioId: 'socio-techo', periodId: 'period-intensivo-verano',
    },
    {
      id: 'proj-techo-2024',
      title: 'Gran Techo NL 2024',
      description: 'Jornada masiva anual de construcción de viviendas. Se construyeron 45 mediaguas en un fin de semana. Proyecto concluido.',
      location: 'Zona Metropolitana NL',
      totalSlots: 60, remainingSlots: 0, status: 'Cerrado',
      qrToken: 'b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
      socioId: 'socio-techo', periodId: 'period-ago-dic',
    },

    // ── Aldeas Infantiles (2) ──────────────────────────────────────────────
    {
      id: 'proj-aldeas-educacion',
      title: 'Tutorías para Niñas y Niños en Acogimiento',
      description: 'Apoyo escolar, lectura guiada y actividades educativas para niños y jóvenes bajo cuidado alternativo de la organización. Miércoles y viernes 3-6pm.',
      location: 'Aldeas Infantiles SOS, Monterrey',
      totalSlots: 20, remainingSlots: 20, status: 'Publicado',
      qrToken: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
      socioId: 'socio-aldeas', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-aldeas-recreacion',
      title: 'Campamento de Verano Aldeas',
      description: 'Actividades deportivas, artísticas y de desarrollo personal durante el verano para niños en acogimiento. Los voluntarios diseñan y facilitan talleres creativos.',
      location: 'Aldeas Infantiles SOS, Monterrey',
      totalSlots: 15, remainingSlots: 13, status: 'Publicado',
      qrToken: 'd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
      socioId: 'socio-aldeas', periodId: 'period-intensivo-verano',
    },

    // ── Fundación Merced (2) ───────────────────────────────────────────────
    {
      id: 'proj-merced-microfinanzas',
      title: 'Asesoría a Microemprendedores',
      description: 'Acompaña y asesora a microempresarios de comunidades vulnerables en gestión financiera, contabilidad básica, marketing digital y formalización ante el SAT.',
      location: 'Centro de Monterrey',
      totalSlots: 10, remainingSlots: 9, status: 'Publicado',
      qrToken: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      socioId: 'socio-merced', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-merced-emprendimiento',
      title: 'Incubadora Social Comunitaria',
      description: 'Taller de emprendimiento e innovación social para jóvenes de colonias con alta vulnerabilidad económica. 8 sesiones sabatinas con mentoría personalizada.',
      location: 'Fundación Merced, San Pedro NL',
      totalSlots: 12, remainingSlots: 12, status: 'Publicado',
      qrToken: 'f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      socioId: 'socio-merced', periodId: 'period-ago-dic',
    },

    // ── Protección Civil (2) ───────────────────────────────────────────────
    {
      id: 'proj-pc-simulacro',
      title: 'Simulacros y Prevención de Desastres',
      description: 'Organización y ejecución de simulacros de sismo, incendio e inundación en escuelas primarias y colonias populares. Incluye capacitación de brigadistas y evaluación de rutas de evacuación.',
      location: 'Varias colonias, MTY',
      totalSlots: 50, remainingSlots: 47, status: 'Publicado',
      qrToken: 'a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      socioId: 'socio-proteccion-civil', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-pc-capacitacion',
      title: 'Brigadas Comunitarias de Emergencia',
      description: 'Formación de brigadas vecinales capacitadas para responder ante emergencias menores hasta la llegada de autoridades. Módulos de primeros respondientes y evacuación.',
      location: 'Municipios de Escobedo, Apodaca y Juárez NL',
      totalSlots: 35, remainingSlots: 33, status: 'Publicado',
      qrToken: 'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      socioId: 'socio-proteccion-civil', periodId: 'period-intensivo-invierno',
    },

    // ── Banco de Ropa (2) ─────────────────────────────────────────────────
    {
      id: 'proj-ropa-clasificacion',
      title: 'Clasificación y Acopio de Ropa',
      description: 'Clasificación, revisión y empaque de ropa donada para su distribución a familias en situación de vulnerabilidad. Sábados de 10am a 2pm.',
      location: 'Bodega Banco de Ropa, Guadalupe NL',
      totalSlots: 20, remainingSlots: 18, status: 'Publicado',
      qrToken: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      socioId: 'socio-banco-ropa', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-ropa-campana',
      title: 'Campaña Ropa de Invierno',
      description: 'Recolección y distribución emergente de ropa de invierno para personas sin hogar y familias afectadas por frío extremo en la ZMM.',
      location: 'Centro MTY y zona norte',
      totalSlots: 25, remainingSlots: 25, status: 'Publicado',
      qrToken: 'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
      socioId: 'socio-banco-ropa', periodId: 'period-intensivo-invierno',
    },

    // ── Colectivo Ambiental (3) ────────────────────────────────────────────
    {
      id: 'proj-ambiental-reforestacion',
      title: 'Reforestación Parque La Pastora',
      description: 'Siembra de árboles nativos, mantenimiento de plantas y limpieza de áreas naturales en el Parque La Pastora. Domingos 7am-12pm. Incluye formación y herramientas.',
      location: 'Parque La Pastora, Guadalupe NL',
      totalSlots: 30, remainingSlots: 28, status: 'Publicado',
      qrToken: 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      socioId: 'socio-ambiental', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-ambiental-limpieza',
      title: 'Limpieza de Ríos y Arroyos',
      description: 'Jornadas de limpieza y monitoreo de calidad del agua en el Río Santa Catarina y sus afluentes principales. Incluye manejo de residuos y registro de especies.',
      location: 'Río Santa Catarina, varios puntos MTY',
      totalSlots: 40, remainingSlots: 40, status: 'Publicado',
      qrToken: 'f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
      socioId: 'socio-ambiental', periodId: 'period-intensivo-verano',
    },
    {
      id: 'proj-ambiental-educacion',
      title: 'Educación Ambiental en Primarias',
      description: 'Talleres interactivos de educación ambiental para niños de 3° a 6° de primaria en zonas de alta marginación. Los voluntarios diseñan y facilitan los talleres.',
      location: 'Escuelas primarias zona norte MTY',
      totalSlots: 20, remainingSlots: 20, status: 'Borrador',
      qrToken: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
      socioId: 'socio-ambiental', periodId: 'period-ago-dic',
    },

    // ── CIJ (2) ───────────────────────────────────────────────────────────
    {
      id: 'proj-cij-prevencion',
      title: 'Prevención de Adicciones en Secundarias',
      description: 'Implementación del programa "Chimalli" de prevención de conductas de riesgo y adicciones en escuelas secundarias de la zona poniente de MTY.',
      location: 'Secundarias zona poniente MTY',
      totalSlots: 15, remainingSlots: 14, status: 'Publicado',
      qrToken: 'b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
      socioId: 'socio-cij', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-cij-talleres',
      title: 'Talleres de Habilidades para la Vida',
      description: 'Talleres de resiliencia, manejo de emociones e inteligencia emocional para jóvenes en riesgo de 15 a 24 años. 10 sesiones quincenales.',
      location: 'CIJ Monterrey Norte',
      totalSlots: 20, remainingSlots: 20, status: 'Publicado',
      qrToken: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
      socioId: 'socio-cij', periodId: 'period-ago-dic',
    },

    // ── Proyectos con IDs legacy del seed original ─────────────────────────
    {
      id: 'proj-1',
      title: 'Brigadas de Salud (Edición Feb-Jun)',
      description: 'Apoyo en brigadas de salud en comunidades vulnerables. Proyecto del período Febrero-Junio (ID legacy).',
      location: 'Col. Independencia, MTY',
      totalSlots: 20, remainingSlots: 20, status: 'Cerrado',
      qrToken: '11223344556677889900aabbccddeeff',
      socioId: 'socio-cruz-roja', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-2',
      title: 'Primeros Auxilios Empresarial (Legacy)',
      description: 'Capacitación en primeros auxilios a empresas y comunidades (ID legacy).',
      location: 'Sede Cruz Roja MTY',
      totalSlots: 15, remainingSlots: 15, status: 'Cerrado',
      qrToken: '22334455667788990011bbccddeeffaa',
      socioId: 'socio-cruz-roja', periodId: 'period-intensivo-invierno',
    },
    {
      id: 'proj-3',
      title: 'Clasificación de Alimentos (Legacy)',
      description: 'Clasificación y distribución de alimentos (ID legacy).',
      location: 'Bodega Central, Guadalupe NL',
      totalSlots: 30, remainingSlots: 30, status: 'Cerrado',
      qrToken: '3344556677889900112233ddeeffaabb',
      socioId: 'socio-banco-alimentos', periodId: 'period-feb-jun',
    },
    {
      id: 'proj-4',
      title: 'Campañas de Recolección (Legacy)',
      description: 'Organización de campañas de recolección de alimentos (ID legacy).',
      location: 'Varios centros comerciales MTY',
      totalSlots: 25, remainingSlots: 25, status: 'Cerrado',
      qrToken: '445566778899001122334455ffeeddcc',
      socioId: 'socio-banco-alimentos', periodId: 'period-intensivo-verano',
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        title: p.title,
        description: p.description,
        location: p.location,
        totalSlots: p.totalSlots,
        remainingSlots: p.remainingSlots,
        status: p.status,
        qrToken: p.qrToken,
        socioFormadorId: p.socioId,
        periodId: p.periodId,
      },
    });
  }

  // ─── ALUMNOS ──────────────────────────────────────────────────────────────
  const careers = [
    'Ing. en Sistemas Computacionales', // 0
    'Ing. Industrial',                  // 1
    'Ing. Civil',                       // 2
    'Ing. Biomédica',                   // 3
    'Ing. Mecánica',                    // 4
    'Administración y Finanzas',        // 5
    'Derecho',                          // 6
    'Medicina',                         // 7
    'Psicología',                       // 8
    'Arquitectura',                     // 9
    'Ing. en Robótica',                 // 10
    'Nutrición y Bienestar',            // 11
  ];

  const alumnosData = [
    { m: 'A01234560', fn: 'Carlos',     ln: 'García Mendoza',      c: 0,  s: '6' },
    { m: 'A01234561', fn: 'María',      ln: 'López Hernández',     c: 7,  s: '4' },
    { m: 'A01234562', fn: 'José',       ln: 'Martínez Pérez',      c: 1,  s: '8' },
    { m: 'A01234563', fn: 'Ana',        ln: 'González Torres',     c: 8,  s: '5' },
    { m: 'A01234564', fn: 'Luis',       ln: 'Rodríguez Sánchez',   c: 2,  s: '7' },
    { m: 'A01234565', fn: 'Laura',      ln: 'Hernández Flores',    c: 0,  s: '3' },
    { m: 'A01234566', fn: 'Miguel',     ln: 'Pérez Rivera',        c: 3,  s: '6' },
    { m: 'A01234567', fn: 'Sofía',      ln: 'Sánchez Morales',     c: 9,  s: '4' },
    { m: 'A01234568', fn: 'Ricardo',    ln: 'Ramírez Jiménez',     c: 5,  s: '8' },
    { m: 'A01234569', fn: 'Valentina',  ln: 'Torres Vargas',       c: 7,  s: '2' },
    { m: 'A01234570', fn: 'Diego',      ln: 'Flores Castro',       c: 0,  s: '5' },
    { m: 'A01234571', fn: 'Isabella',   ln: 'Rivera Mendoza',      c: 11, s: '7' },
    { m: 'A01234572', fn: 'Alejandro',  ln: 'Morales Guerrero',    c: 1,  s: '9' },
    { m: 'A01234573', fn: 'Camila',     ln: 'Jiménez Ortiz',       c: 6,  s: '3' },
    { m: 'A01234574', fn: 'Andrés',     ln: 'Vargas Ruiz',         c: 2,  s: '6' },
    { m: 'A01234575', fn: 'Gabriela',   ln: 'Castro Aguilar',      c: 8,  s: '4' },
    { m: 'A01234576', fn: 'Daniel',     ln: 'Mendoza Gutiérrez',   c: 4,  s: '7' },
    { m: 'A01234577', fn: 'Fernanda',   ln: 'Guerrero Núñez',      c: 9,  s: '5' },
    { m: 'A01234578', fn: 'Sebastián',  ln: 'Ortiz Medina',        c: 0,  s: '8' },
    { m: 'A01234579', fn: 'Valeria',    ln: 'Ruiz Delgado',        c: 11, s: '2' },
    { m: 'A01234580', fn: 'Jorge',      ln: 'Aguilar Herrera',     c: 1,  s: '6' },
    { m: 'A01234581', fn: 'Natalia',    ln: 'Gutiérrez Suárez',    c: 5,  s: '4' },
    { m: 'A01234582', fn: 'Eduardo',    ln: 'Núñez Vega',          c: 2,  s: '7' },
    { m: 'A01234583', fn: 'Daniela',    ln: 'Medina Cruz',         c: 7,  s: '3' },
    { m: 'A01234584', fn: 'Roberto',    ln: 'Delgado Reyes',       c: 0,  s: '9' },
    { m: 'A01234585', fn: 'Paulina',    ln: 'Herrera Cabrera',     c: 3,  s: '5' },
    { m: 'A01234586', fn: 'Javier',     ln: 'Suárez Moreno',       c: 10, s: '6' },
    { m: 'A01234587', fn: 'Verónica',   ln: 'Vega Silva',          c: 8,  s: '4' },
    { m: 'A01234588', fn: 'Francisco',  ln: 'Cruz Ríos',           c: 6,  s: '8' },
    { m: 'A01234589', fn: 'Mariana',    ln: 'Reyes Romero',        c: 9,  s: '2' },
    { m: 'A01234590', fn: 'Héctor',     ln: 'Cabrera Salinas',     c: 0,  s: '7' },
    { m: 'A01234591', fn: 'Sandra',     ln: 'Moreno Mendez',       c: 11, s: '5' },
    { m: 'A01234592', fn: 'Arturo',     ln: 'Silva Díaz',          c: 1,  s: '3' },
    { m: 'A01234593', fn: 'Patricia',   ln: 'Ríos Acosta',         c: 5,  s: '6' },
    { m: 'A01234594', fn: 'Enrique',    ln: 'Romero Fuentes',      c: 2,  s: '8' },
    { m: 'A01234595', fn: 'Mónica',     ln: 'Salinas Ramos',       c: 7,  s: '4' },
    { m: 'A01234596', fn: 'Gerardo',    ln: 'Mendez Luna',         c: 4,  s: '5' },
    { m: 'A01234597', fn: 'Lucía',      ln: 'Díaz Peña',           c: 9,  s: '7' },
    { m: 'A01234598', fn: 'Omar',       ln: 'Acosta Vázquez',      c: 0,  s: '6' },
    { m: 'A01234599', fn: 'Alicia',     ln: 'Fuentes Navarro',     c: 11, s: '4' },
  ];

  // Pre-registrar todos en la feria activa
  for (const a of alumnosData) {
    await prisma.preregisteredMatricula.upsert({
      where: { matricula_fairId: { matricula: a.m, fairId: 'feria-1-2025' } },
      update: {},
      create: { matricula: a.m, nombre: `${a.fn} ${a.ln}`, fairId: 'feria-1-2025' },
    });
  }

  // Crear usuarios alumno (hashes en paralelo para velocidad)
  const pwHashes = await Promise.all(alumnosData.map(a => bcrypt.hash(a.m, 8)));

  const alumnoUserIds = {};
  for (let i = 0; i < alumnosData.length; i++) {
    const a = alumnosData[i];
    const user = await prisma.user.upsert({
      where: { matricula: a.m },
      update: {},
      create: {
        matricula: a.m,
        passwordHash: pwHashes[i],
        role: 'alumno',
        firstName: a.fn,
        lastName: a.ln,
        career: careers[a.c],
        semester: a.s,
        tecEmail: `${a.m.toLowerCase()}@tec.mx`,
        personalEmail: `${a.m.toLowerCase()}@gmail.com`,
      },
    });
    alumnoUserIds[a.m] = user.id;
  }

  // ─── INSCRIPCIONES ────────────────────────────────────────────────────────
  const inscriptions = [
    // Brigadas de Salud → 5 inscripciones (totalSlots=20, remaining=15)
    { m: 'A01234560', projectId: 'proj-brigadas-salud' },
    { m: 'A01234561', projectId: 'proj-brigadas-salud' },
    { m: 'A01234562', projectId: 'proj-brigadas-salud' },
    { m: 'A01234563', projectId: 'proj-brigadas-salud' },
    { m: 'A01234564', projectId: 'proj-brigadas-salud' },
    // Primeros Auxilios → 3 (total=15, remaining=12)
    { m: 'A01234565', projectId: 'proj-primeros-auxilios' },
    { m: 'A01234566', projectId: 'proj-primeros-auxilios' },
    { m: 'A01234567', projectId: 'proj-primeros-auxilios' },
    // Clasificación de Alimentos → 5 (total=30, remaining=25)
    { m: 'A01234568', projectId: 'proj-clasificacion' },
    { m: 'A01234569', projectId: 'proj-clasificacion' },
    { m: 'A01234570', projectId: 'proj-clasificacion' },
    { m: 'A01234571', projectId: 'proj-clasificacion' },
    { m: 'A01234572', projectId: 'proj-clasificacion' },
    // Campaña Recolección → 2 (total=25, remaining=23)
    { m: 'A01234573', projectId: 'proj-campana-recoleccion' },
    { m: 'A01234574', projectId: 'proj-campana-recoleccion' },
    // TECHO Construcción → 3 (total=40, remaining=37)
    { m: 'A01234575', projectId: 'proj-techo-construccion' },
    { m: 'A01234576', projectId: 'proj-techo-construccion' },
    { m: 'A01234577', projectId: 'proj-techo-construccion' },
    // PC Simulacros → 3 (total=50, remaining=47)
    { m: 'A01234578', projectId: 'proj-pc-simulacro' },
    { m: 'A01234579', projectId: 'proj-pc-simulacro' },
    { m: 'A01234580', projectId: 'proj-pc-simulacro' },
    // PC Capacitación → 2 (total=35, remaining=33)
    { m: 'A01234581', projectId: 'proj-pc-capacitacion' },
    { m: 'A01234582', projectId: 'proj-pc-capacitacion' },
    // Cáritas → 1 (total=15, remaining=14)
    { m: 'A01234583', projectId: 'proj-caritas-catequesis' },
    // Fundación Merced → 1 (total=10, remaining=9)
    { m: 'A01234584', projectId: 'proj-merced-microfinanzas' },
    // Banco de Ropa → 2 (total=20, remaining=18)
    { m: 'A01234585', projectId: 'proj-ropa-clasificacion' },
    { m: 'A01234586', projectId: 'proj-ropa-clasificacion' },
    // Reforestación → 2 (total=30, remaining=28)
    { m: 'A01234587', projectId: 'proj-ambiental-reforestacion' },
    { m: 'A01234588', projectId: 'proj-ambiental-reforestacion' },
    // Aldeas Recreación → 2 (total=15, remaining=13)
    { m: 'A01234589', projectId: 'proj-aldeas-recreacion' },
    { m: 'A01234590', projectId: 'proj-aldeas-recreacion' },
    // TECHO Diagnóstico → 2 (total=30, remaining=28)
    { m: 'A01234591', projectId: 'proj-techo-diagnostico' },
    { m: 'A01234592', projectId: 'proj-techo-diagnostico' },
    // CIJ Prevención → 1 (total=15, remaining=14)
    { m: 'A01234593', projectId: 'proj-cij-prevencion' },
  ];

  // Build lookup maps for certificate payload generation
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const socioMap = Object.fromEntries(socios.map(s => [s.id, s.name]));
  const periodMap = Object.fromEntries(periods.map(p => [p.id, p.name]));
  const alumnoNombreMap = Object.fromEntries(alumnosData.map(a => [a.m, `${a.fn} ${a.ln}`]));
  const activeFairId = 'feria-1-2025';
  const activeFairName = 'Feria SC 1 - 2025';

  for (const ins of inscriptions) {
    const alumnoId = alumnoUserIds[ins.m];
    if (!alumnoId) continue;

    const inscId = `insc-${ins.m}-${ins.projectId}`;
    const proj = projectMap[ins.projectId];
    const createdAt = new Date('2025-02-01T14:00:00Z');

    const payloadStr = buildPayload({
      inscriptionId: inscId,
      alumnoMatricula: ins.m,
      alumnoNombre: alumnoNombreMap[ins.m],
      projectId: ins.projectId,
      projectTitle: proj.title,
      socioFormador: socioMap[proj.socioId],
      periodo: periodMap[proj.periodId],
      feria: activeFairName,
      fairId: activeFairId,
      createdAt,
    });
    const { signature, hash, signedAt } = signPayload(payloadStr);

    await prisma.inscription.upsert({
      where: { id: inscId },
      update: {},
      create: {
        id: inscId,
        alumnoId,
        projectId: ins.projectId,
        periodId: proj.periodId,
        fairId: activeFairId,
        status: 'Inscrito',
        createdAt,
        certificatePayload: payloadStr,
        certificateSignature: signature,
        certificateHash: hash,
        certificateSignedAt: signedAt,
      },
    });
  }

  // ─── CÓDIGOS QR DE INSCRIPCIÓN ────────────────────────────────────────────
  const qrCodes = [
    // Códigos ya usados (QR escaneado exitosamente)
    { code: 'QR-BRIGADAS-001', projectId: 'proj-brigadas-salud',       matricula: 'A01234560', usedAt: new Date('2025-02-15T10:30:00Z'), usedBy: 'A01234560' },
    { code: 'QR-BRIGADAS-002', projectId: 'proj-brigadas-salud',       matricula: 'A01234561', usedAt: new Date('2025-02-15T10:45:00Z'), usedBy: 'A01234561' },
    { code: 'QR-BRIGADAS-003', projectId: 'proj-brigadas-salud',       matricula: 'A01234562', usedAt: new Date('2025-02-22T11:00:00Z'), usedBy: 'A01234562' },
    { code: 'QR-CLASIF-001',   projectId: 'proj-clasificacion',        matricula: 'A01234568', usedAt: new Date('2025-02-20T09:00:00Z'), usedBy: 'A01234568' },
    { code: 'QR-CLASIF-002',   projectId: 'proj-clasificacion',        matricula: 'A01234569', usedAt: new Date('2025-02-20T09:15:00Z'), usedBy: 'A01234569' },
    { code: 'QR-PAUX-001',     projectId: 'proj-primeros-auxilios',    matricula: 'A01234565', usedAt: new Date('2025-01-18T14:00:00Z'), usedBy: 'A01234565' },
    // Códigos pendientes (generados pero aún sin escanear)
    { code: 'QR-TECHO-001',    projectId: 'proj-techo-construccion',   matricula: 'A01234575', usedAt: null, usedBy: null },
    { code: 'QR-TECHO-002',    projectId: 'proj-techo-construccion',   matricula: 'A01234576', usedAt: null, usedBy: null },
    { code: 'QR-TECHO-003',    projectId: 'proj-techo-construccion',   matricula: 'A01234577', usedAt: null, usedBy: null },
    { code: 'QR-AMBIENT-001',  projectId: 'proj-ambiental-reforestacion', matricula: 'A01234587', usedAt: null, usedBy: null },
    { code: 'QR-AMBIENT-002',  projectId: 'proj-ambiental-reforestacion', matricula: 'A01234588', usedAt: null, usedBy: null },
    { code: 'QR-PC-001',       projectId: 'proj-pc-simulacro',         matricula: 'A01234578', usedAt: null, usedBy: null },
    { code: 'QR-PC-002',       projectId: 'proj-pc-simulacro',         matricula: 'A01234579', usedAt: null, usedBy: null },
    { code: 'QR-ALDEAS-001',   projectId: 'proj-aldeas-recreacion',    matricula: 'A01234589', usedAt: null, usedBy: null },
    { code: 'QR-CIJ-001',      projectId: 'proj-cij-prevencion',       matricula: 'A01234593', usedAt: null, usedBy: null },
  ];

  for (const c of qrCodes) {
    await prisma.inscriptionCode.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        projectId: c.projectId,
        matricula: c.matricula,
        usedAt: c.usedAt,
        usedBy: c.usedBy,
      },
    });
  }

  // ─── ACTION LOGS ──────────────────────────────────────────────────────────
  const existingLogs = await prisma.actionLog.count();
  if (existingLogs === 0) {
    await prisma.actionLog.createMany({
      data: [
        { action: 'CREATE_FAIR',    details: 'Feria "SC 1 - 2025" creada y activada',                                      createdAt: new Date('2025-01-01T00:00:00Z') },
        { action: 'CSV_IMPORT',     details: 'Importación masiva: 40 matrículas cargadas para Feria SC 1 - 2025',          createdAt: new Date('2025-01-05T08:00:00Z') },
        { action: 'CREATE_SOCIO',   details: 'Socio Formador "TECHO México" registrado',                                   createdAt: new Date('2024-12-15T10:00:00Z') },
        { action: 'CREATE_SOCIO',   details: 'Socio Formador "Colectivo Ambiental MTY" registrado',                        createdAt: new Date('2024-12-16T11:30:00Z') },
        { action: 'CREATE_PROJECT', details: 'Proyecto "Brigadas de Salud Comunitaria" publicado',                         createdAt: new Date('2025-01-10T08:00:00Z') },
        { action: 'CREATE_PROJECT', details: 'Proyecto "Clasificación y Distribución de Alimentos" publicado',             createdAt: new Date('2025-01-11T09:30:00Z') },
        { action: 'CREATE_PROJECT', details: 'Proyecto "Construcción de Viviendas de Emergencia" publicado',               createdAt: new Date('2025-01-12T11:00:00Z') },
        { action: 'CREATE_PROJECT', details: 'Proyecto "Simulacros y Prevención de Desastres" publicado',                  createdAt: new Date('2025-01-13T10:15:00Z') },
        { action: 'CREATE_PROJECT', details: 'Proyecto "Reforestación Parque La Pastora" publicado',                       createdAt: new Date('2025-01-14T09:00:00Z') },
        { action: 'INSCRIPCION',    details: 'A01234560 (Carlos García) se inscribió en "Brigadas de Salud Comunitaria"',  createdAt: new Date('2025-02-01T14:00:00Z') },
        { action: 'INSCRIPCION',    details: 'A01234561 (María López) se inscribió en "Brigadas de Salud Comunitaria"',    createdAt: new Date('2025-02-01T14:05:00Z') },
        { action: 'INSCRIPCION',    details: 'A01234568 (Ricardo Ramírez) se inscribió en "Clasificación de Alimentos"',   createdAt: new Date('2025-02-02T10:00:00Z') },
        { action: 'INSCRIPCION',    details: 'A01234575 (Gabriela Castro) se inscribió en "Construcción de Viviendas"',    createdAt: new Date('2025-02-03T11:30:00Z') },
        { action: 'INSCRIPCION',    details: 'A01234578 (Sebastián Ortiz) se inscribió en "Simulacros y Prevención"',      createdAt: new Date('2025-02-03T12:00:00Z') },
        { action: 'QR_SCAN',        details: 'A01234560 escaneó QR en "Brigadas de Salud Comunitaria" — Inscripción OK',   createdAt: new Date('2025-02-15T10:30:00Z') },
        { action: 'QR_SCAN',        details: 'A01234561 escaneó QR en "Brigadas de Salud Comunitaria" — Inscripción OK',   createdAt: new Date('2025-02-15T10:45:00Z') },
        { action: 'QR_SCAN',        details: 'A01234562 escaneó QR en "Brigadas de Salud Comunitaria" — Inscripción OK',   createdAt: new Date('2025-02-22T11:00:00Z') },
        { action: 'QR_SCAN',        details: 'A01234568 escaneó QR en "Clasificación de Alimentos" — Inscripción OK',      createdAt: new Date('2025-02-20T09:00:00Z') },
        { action: 'QR_SCAN',        details: 'A01234569 escaneó QR en "Clasificación de Alimentos" — Inscripción OK',      createdAt: new Date('2025-02-20T09:15:00Z') },
        { action: 'QR_SCAN',        details: 'A01234565 escaneó QR en "Primeros Auxilios" — Inscripción OK',               createdAt: new Date('2025-01-18T14:00:00Z') },
        { action: 'UPDATE_PROJECT', details: 'Proyecto "Campaña Donación de Sangre" actualizado a estado Borrador',        createdAt: new Date('2025-03-01T16:00:00Z') },
        { action: 'CLOSE_PROJECT',  details: 'Proyecto "Gran Techo NL 2024" cerrado — 60/60 cupos utilizados',             createdAt: new Date('2024-12-20T18:00:00Z') },
        { action: 'CLOSE_PROJECT',  details: 'Proyecto "Distribución Navideña 2024" cerrado — 50/50 cupos utilizados',     createdAt: new Date('2024-12-26T20:00:00Z') },
        { action: 'CLOSE_PROJECT',  details: 'Proyecto "Respuesta a Emergencias 2024" cerrado — 20/20 cupos',              createdAt: new Date('2024-12-31T23:59:00Z') },
      ],
    });
  }

  console.log('');
  console.log('✅ Seed completado exitosamente:');
  console.log('   👤  1  superadmin        (admin@tec.mx / Admin1234!)');
  console.log('   📅  4  periodos          (fijos, reutilizables)');
  console.log('   🏟️   4  ferias            (1 activa: feria-1-2025)');
  console.log('   🤝  10 socios formadores');
  console.log('   🔑  10 usuarios socio_admin (password: Socio1234!)');
  console.log('   📋  31 proyectos          (Publicado/Borrador/Cerrado)');
  console.log('   🎓  40 alumnos            (password = matrícula)');
  console.log('   📝  33 inscripciones');
  console.log('   📱  15 códigos QR         (6 usados, 9 pendientes)');
  console.log('   📜  24 registros de acción');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
