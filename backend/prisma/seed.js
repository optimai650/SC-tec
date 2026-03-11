const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function main() {
  // Superadmin
  await prisma.user.upsert({
    where: { email: 'admin@tec.mx' },
    update: {},
    create: {
      email: 'admin@tec.mx',
      passwordHash: await bcrypt.hash('Admin1234!', 10),
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin'
    }
  });

  // Periodos
  await Promise.all([
    prisma.period.upsert({ where: { id: 'period-feb-jun' }, update: {}, create: { id: 'period-feb-jun', name: 'Febrero-Junio' } }),
    prisma.period.upsert({ where: { id: 'period-intensivo' }, update: {}, create: { id: 'period-intensivo', name: 'Intensivo de Invierno' } }),
    prisma.period.upsert({ where: { id: 'period-verano' }, update: {}, create: { id: 'period-verano', name: 'Verano' } }),
    prisma.period.upsert({ where: { id: 'period-ago-dic' }, update: {}, create: { id: 'period-ago-dic', name: 'Agosto-Diciembre' } }),
  ]);

  // Ferias
  const feria1 = await prisma.fair.upsert({
    where: { id: 'feria-1-2025' },
    update: {},
    create: { id: 'feria-1-2025', name: 'Feria 1 - 2025', isActive: true }
  });
  const feria2 = await prisma.fair.upsert({
    where: { id: 'feria-2-2025' },
    update: {},
    create: { id: 'feria-2-2025', name: 'Feria 2 - 2025', isActive: false }
  });

  // Asociar periodos a ferias
  await prisma.fairPeriod.upsert({ where: { fairId_periodId: { fairId: feria1.id, periodId: 'period-feb-jun' } }, update: {}, create: { fairId: feria1.id, periodId: 'period-feb-jun' } });
  await prisma.fairPeriod.upsert({ where: { fairId_periodId: { fairId: feria1.id, periodId: 'period-intensivo' } }, update: {}, create: { fairId: feria1.id, periodId: 'period-intensivo' } });
  await prisma.fairPeriod.upsert({ where: { fairId_periodId: { fairId: feria2.id, periodId: 'period-verano' } }, update: {}, create: { fairId: feria2.id, periodId: 'period-verano' } });
  await prisma.fairPeriod.upsert({ where: { fairId_periodId: { fairId: feria2.id, periodId: 'period-ago-dic' } }, update: {}, create: { fairId: feria2.id, periodId: 'period-ago-dic' } });

  // Socios Formadores
  const socio1 = await prisma.socioFormador.upsert({
    where: { id: 'socio-cruz-roja' },
    update: {},
    create: { id: 'socio-cruz-roja', name: 'Cruz Roja Monterrey', contactEmail: 'admin@cruzroja.mx', description: 'Cruz Roja Mexicana Delegación Nuevo León', status: 'Activo' }
  });
  const socio2 = await prisma.socioFormador.upsert({
    where: { id: 'socio-banco-alimentos' },
    update: {},
    create: { id: 'socio-banco-alimentos', name: 'Banco de Alimentos NL', contactEmail: 'admin@bancoalimentos.mx', description: 'Banco de Alimentos de Nuevo León', status: 'Activo' }
  });

  // Usuarios socio_admin
  await prisma.user.upsert({
    where: { email: 'admin@cruzroja.mx' },
    update: {},
    create: { email: 'admin@cruzroja.mx', passwordHash: await bcrypt.hash('Socio1234!', 10), role: 'socio_admin', firstName: 'Admin', lastName: 'Cruz Roja', socioFormadorId: socio1.id }
  });
  await prisma.user.upsert({
    where: { email: 'admin@bancoalimentos.mx' },
    update: {},
    create: { email: 'admin@bancoalimentos.mx', passwordHash: await bcrypt.hash('Socio1234!', 10), role: 'socio_admin', firstName: 'Admin', lastName: 'Banco Alimentos', socioFormadorId: socio2.id }
  });

  // Proyectos
  await prisma.project.upsert({
    where: { id: 'proj-1' },
    update: {},
    create: { id: 'proj-1', title: 'Brigadas de Salud Comunitaria', description: 'Apoya en brigadas de salud en comunidades vulnerables de Monterrey.', location: 'Col. Independencia, MTY', totalSlots: 20, remainingSlots: 20, status: 'Publicado', qrToken: crypto.randomBytes(16).toString('hex'), socioFormadorId: socio1.id, periodId: 'period-feb-jun' }
  });
  await prisma.project.upsert({
    where: { id: 'proj-2' },
    update: {},
    create: { id: 'proj-2', title: 'Primeros Auxilios Empresarial', description: 'Capacitación en primeros auxilios a empresas y comunidades.', location: 'Sede Cruz Roja MTY', totalSlots: 15, remainingSlots: 15, status: 'Publicado', qrToken: crypto.randomBytes(16).toString('hex'), socioFormadorId: socio1.id, periodId: 'period-intensivo' }
  });
  await prisma.project.upsert({
    where: { id: 'proj-3' },
    update: {},
    create: { id: 'proj-3', title: 'Clasificación y Distribución de Alimentos', description: 'Apoya en la clasificación y distribución de alimentos a familias en situación vulnerable.', location: 'Bodega Central, Guadalupe NL', totalSlots: 30, remainingSlots: 30, status: 'Publicado', qrToken: crypto.randomBytes(16).toString('hex'), socioFormadorId: socio2.id, periodId: 'period-feb-jun' }
  });
  await prisma.project.upsert({
    where: { id: 'proj-4' },
    update: {},
    create: { id: 'proj-4', title: 'Campañas de Recolección de Alimentos', description: 'Organización y ejecución de campañas de recolección de alimentos en centros comerciales.', location: 'Varios centros comerciales MTY', totalSlots: 25, remainingSlots: 25, status: 'Publicado', qrToken: crypto.randomBytes(16).toString('hex'), socioFormadorId: socio2.id, periodId: 'period-verano' }
  });

  // Matrículas preregistradas
  const matriculas = ['A01234567', 'A01234568', 'A01234569', 'A01234570', 'A01234571'];
  for (let i = 0; i < matriculas.length; i++) {
    const m = matriculas[i];
    const nombre = `Alumno ${i + 1}`;
    await prisma.preregisteredMatricula.upsert({
      where: { matricula_fairId: { matricula: m, fairId: 'feria-1-2025' } },
      update: {},
      create: { matricula: m, nombre, fairId: 'feria-1-2025' }
    });
    await prisma.user.upsert({
      where: { matricula: m },
      update: {},
      create: { matricula: m, passwordHash: await bcrypt.hash(m, 10), role: 'alumno', firstName: 'Alumno', lastName: `${i + 1}` }
    });
  }

  console.log('✅ Seed completado');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
