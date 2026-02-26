const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.signup.deleteMany();
  await prisma.actionLog.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Super Admin
  const adminPasswordHash = await bcrypt.hash('Admin1234!', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@voluntarios.app',
      passwordHash: adminPasswordHash,
      role: 'superadmin',
      emailVerified: true,
      firstName: 'Admin',
      lastName: 'Sistema',
    },
  });
  console.log(`✅ Super Admin creado: ${superAdmin.email}`);

  // 2. Organización Cruz Verde
  const cruzVerde = await prisma.organization.create({
    data: {
      name: 'Cruz Verde',
      contactEmail: 'contacto@cruzver.de',
      description: 'Cruz Verde es una organización sin fines de lucro dedicada a brindar ayuda humanitaria y apoyo comunitario en toda la región.',
      status: 'Approved',
    },
  });
  console.log(`✅ Organización creada: ${cruzVerde.name}`);

  // 3. Admin de Cruz Verde
  const orgPasswordHash = await bcrypt.hash('Org1234!', 10);
  const orgAdmin = await prisma.user.create({
    data: {
      email: 'org@cruzver.de',
      passwordHash: orgPasswordHash,
      role: 'org_admin',
      emailVerified: true,
      organizationId: cruzVerde.id,
      firstName: 'Admin',
      lastName: 'CruzVerde',
    },
  });
  console.log(`✅ Org Admin creado: ${orgAdmin.email}`);

  // 4. Voluntario de prueba
  const volunteerPasswordHash = await bcrypt.hash('Voluntario1234!', 10);
  const volunteer = await prisma.user.create({
    data: {
      email: 'voluntario@test.com',
      passwordHash: volunteerPasswordHash,
      role: 'volunteer',
      emailVerified: true,
      firstName: 'Juan',
      lastName: 'Pérez',
    },
  });
  console.log(`✅ Voluntario creado: ${volunteer.email}`);

  // 5. Oportunidades publicadas
  const now = new Date();

  const opp1 = await prisma.opportunity.create({
    data: {
      title: 'Distribución de alimentos en el barrio Sur',
      description: 'Ayuda a distribuir alimentos a familias necesitadas en el barrio Sur de la ciudad. Se requieren voluntarios para empacar y entregar las cajas de alimentos. No se necesita experiencia previa, solo ganas de ayudar.',
      location: 'Barrio Sur, Ciudad de México',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 17, 0),
      totalSlots: 20,
      remainingSlots: 19,
      status: 'Published',
      organizationId: cruzVerde.id,
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      title: 'Campaña de reforestación en el parque nacional',
      description: 'Participa en nuestra campaña de reforestación donde plantaremos más de 500 árboles nativos en el parque nacional. Ayuda a restaurar el ecosistema local y disfruta de una jornada al aire libre con otros voluntarios comprometidos con el medio ambiente.',
      location: 'Parque Nacional El Tepeyac, CDMX',
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 22, 8, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 22, 14, 0),
      totalSlots: 30,
      remainingSlots: 30,
      status: 'Published',
      organizationId: cruzVerde.id,
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      title: 'Taller de alfabetización para adultos mayores',
      description: 'Brinda apoyo en nuestro taller de alfabetización digital para adultos mayores. Enséñales a usar dispositivos básicos, internet y aplicaciones útiles para su vida diaria. Se requiere paciencia y habilidades básicas de computación.',
      location: 'Centro Comunitario Lomas Verdes, Naucalpan',
      startDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 10, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 5, 13, 0),
      totalSlots: 10,
      remainingSlots: 9,
      status: 'Published',
      organizationId: cruzVerde.id,
    },
  });

  console.log(`✅ 3 oportunidades creadas`);

  // 6. Registrar al voluntario en opp1
  await prisma.signup.create({
    data: {
      volunteerId: volunteer.id,
      opportunityId: opp1.id,
      status: 'Registrado',
    },
  });

  await prisma.signup.create({
    data: {
      volunteerId: volunteer.id,
      opportunityId: opp3.id,
      status: 'Registrado',
    },
  });

  console.log(`✅ Registros de voluntario creados`);
  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Cuentas de prueba:');
  console.log('  Super Admin:  admin@voluntarios.app / Admin1234!');
  console.log('  Org Admin:    org@cruzver.de / Org1234!');
  console.log('  Voluntario:   voluntario@test.com / Voluntario1234!');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
