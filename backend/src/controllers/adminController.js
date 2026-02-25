const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listOrganizations(req, res, next) {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        users: { select: { id: true, email: true, role: true } },
        _count: { select: { opportunities: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(organizations);
  } catch (err) {
    next(err);
  }
}

async function createOrganization(req, res, next) {
  try {
    const { name, description, contactEmail, adminEmail, adminPassword } = req.body;

    if (!name || !description || !contactEmail || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar que el admin email no exista
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email de admin' });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Crear organización y admin en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name, description, contactEmail, status: 'Pending' },
      });

      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: 'org_admin',
          emailVerified: true,
          organizationId: org.id,
        },
      });

      return { org, admin };
    });

    console.log(`[EMAIL] Cuenta creada para ${adminEmail} como admin de "${name}". Contraseña temporal: ${adminPassword}`);

    res.status(201).json({
      organization: result.org,
      admin: { id: result.admin.id, email: result.admin.email },
    });
  } catch (err) {
    next(err);
  }
}

async function updateOrganizationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Disabled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const org = await prisma.organization.update({
      where: { id },
      data: { status },
    });

    console.log(`[EMAIL] La organización "${org.name}" ha sido ${status}`);

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function listAllOpportunities(req, res, next) {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        organization: { select: { id: true, name: true } },
        _count: { select: { signups: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
}

async function listAllSignups(req, res, next) {
  try {
    const signups = await prisma.signup.findMany({
      include: {
        volunteer: { select: { id: true, email: true } },
        opportunity: {
          select: {
            id: true,
            title: true,
            organization: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(signups);
  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const [totalOrgs, totalOpportunities, totalSignups, totalUsers] = await Promise.all([
      prisma.organization.count(),
      prisma.opportunity.count(),
      prisma.signup.count({ where: { status: { not: 'Cancelado' } } }),
      prisma.user.count({ where: { role: 'volunteer' } }),
    ]);

    res.json({ totalOrgs, totalOpportunities, totalSignups, totalUsers });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listOrganizations,
  createOrganization,
  updateOrganizationStatus,
  listAllOpportunities,
  listAllSignups,
  getDashboardStats,
};
