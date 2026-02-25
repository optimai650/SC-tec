const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getMine(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId },
      include: { users: { select: { id: true, email: true, role: true } } },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organización no encontrada' });
    }

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function updateMine(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const { name, contactEmail, logo, description } = req.body;

    const org = await prisma.organization.update({
      where: { id: req.user.organizationId },
      data: { name, contactEmail, logo, description },
    });

    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function getMyOpportunities(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { organizationId: req.user.organizationId },
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

async function createOpportunity(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const { title, description, location, startDate, endDate, totalSlots } = req.body;

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
        organizationId: req.user.organizationId,
        status: 'Draft',
      },
    });

    res.status(201).json(opportunity);
  } catch (err) {
    next(err);
  }
}

async function updateOpportunity(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const { id } = req.params;
    const { title, description, location, startDate, endDate, totalSlots } = req.body;

    const existing = await prisma.opportunity.findFirst({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        title,
        description,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalSlots: totalSlots ? parseInt(totalSlots) : undefined,
      },
    });

    res.json(opportunity);
  } catch (err) {
    next(err);
  }
}

async function updateOpportunityStatus(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Draft', 'Published', 'Closed', 'Full'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const existing = await prisma.opportunity.findFirst({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: { status },
    });

    res.json(opportunity);
  } catch (err) {
    next(err);
  }
}

async function getOpportunityVolunteers(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const { id } = req.params;

    const opportunity = await prisma.opportunity.findFirst({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    const signups = await prisma.signup.findMany({
      where: { opportunityId: id },
      include: {
        volunteer: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(signups);
  } catch (err) {
    next(err);
  }
}

async function updateVolunteerAttendance(req, res, next) {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({ error: 'No tienes una organización asignada' });
    }

    const { id, signupId } = req.params;

    const opportunity = await prisma.opportunity.findFirst({
      where: { id, organizationId: req.user.organizationId },
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
  getMine,
  updateMine,
  getMyOpportunities,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStatus,
  getOpportunityVolunteers,
  updateVolunteerAttendance,
};
