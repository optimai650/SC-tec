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
        volunteer: { select: { id: true, email: true, phone: true, community: true } },
        opportunity: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
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

// ==================== VOLUNTARIOS ====================

async function listVolunteers(req, res, next) {
  try {
    const volunteers = await prisma.user.findMany({
      where: { role: 'volunteer' },
      select: {
        id: true,
        email: true,
        phone: true,
        community: true,
        createdAt: true,
        _count: { select: { signups: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(volunteers);
  } catch (err) {
    next(err);
  }
}

async function deleteVolunteer(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (user.role !== 'volunteer') {
      return res.status(400).json({ error: 'El usuario no es un voluntario' });
    }

    // Cancelar sus signups antes de eliminar
    await prisma.signup.deleteMany({ where: { volunteerId: id } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Voluntario eliminado correctamente' });
  } catch (err) {
    next(err);
  }
}

// ==================== SIGNUPS ====================

async function updateSignupStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Registrado', 'Completado', 'Cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const existing = await prisma.signup.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    const signup = await prisma.signup.update({
      where: { id },
      data: { status },
    });

    res.json(signup);
  } catch (err) {
    next(err);
  }
}

// ==================== ORG PANEL (superadmin) ====================

async function getOrgById(req, res, next) {
  try {
    const { orgId } = req.params;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: { select: { id: true, email: true, role: true } },
        _count: { select: { opportunities: true } },
      },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function updateOrg(req, res, next) {
  try {
    const { orgId } = req.params;
    const { name, description, contactEmail, logo } = req.body;

    const existing = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!existing) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(logo !== undefined && { logo }),
      },
    });

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function listOrgOpportunities(req, res, next) {
  try {
    const { orgId } = req.params;

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { signups: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
}

async function createOrgOpportunity(req, res, next) {
  try {
    const { orgId } = req.params;
    const { title, description, location, startDate, endDate, totalSlots } = req.body;

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }

    if (!title || !description || !location || !startDate || !endDate || !totalSlots) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalSlots: parseInt(totalSlots),
        remainingSlots: parseInt(totalSlots),
        organizationId: orgId,
        status: 'Draft',
      },
    });

    res.status(201).json(opportunity);
  } catch (err) {
    next(err);
  }
}

async function updateOrgOpportunity(req, res, next) {
  try {
    const { orgId, oppId } = req.params;
    const { title, description, location, startDate, endDate, totalSlots } = req.body;

    const existing = await prisma.opportunity.findFirst({
      where: { id: oppId, organizationId: orgId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    if (totalSlots !== undefined) {
      const newTotal = parseInt(totalSlots);
      const activeSignups = await prisma.signup.count({
        where: { opportunityId: oppId, status: { not: 'Cancelado' } },
      });
      if (newTotal < activeSignups) {
        return res.status(400).json({
          error: `No se puede reducir los cupos a ${newTotal} porque ya hay ${activeSignups} voluntarios registrados`,
        });
      }
      updateData.totalSlots = newTotal;
      updateData.remainingSlots = newTotal - activeSignups;
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: oppId },
      data: updateData,
    });

    res.json(opportunity);
  } catch (err) {
    next(err);
  }
}

async function updateOrgOpportunityStatus(req, res, next) {
  try {
    const { orgId, oppId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Draft', 'Published', 'Closed', 'Full'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const existing = await prisma.opportunity.findFirst({
      where: { id: oppId, organizationId: orgId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: oppId },
      data: { status },
    });

    res.json(opportunity);
  } catch (err) {
    next(err);
  }
}

async function getOrgOpportunityVolunteers(req, res, next) {
  try {
    const { orgId, oppId } = req.params;

    const opportunity = await prisma.opportunity.findFirst({
      where: { id: oppId, organizationId: orgId },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const signups = await prisma.signup.findMany({
      where: { opportunityId: oppId },
      include: {
        volunteer: { select: { id: true, email: true, phone: true, community: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(signups);
  } catch (err) {
    next(err);
  }
}

async function markOrgVolunteerAttendance(req, res, next) {
  try {
    const { orgId, oppId, signupId } = req.params;

    const opportunity = await prisma.opportunity.findFirst({
      where: { id: oppId, organizationId: orgId },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const signup = await prisma.signup.update({
      where: { id: signupId },
      data: { status: 'Completado' },
    });

    res.json(signup);
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
  listVolunteers,
  deleteVolunteer,
  updateSignupStatus,
  getOrgById,
  updateOrg,
  listOrgOpportunities,
  createOrgOpportunity,
  updateOrgOpportunity,
  updateOrgOpportunityStatus,
  getOrgOpportunityVolunteers,
  markOrgVolunteerAttendance,
};
