const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listPublished(req, res, next) {
  try {
    const { location, startDate } = req.query;

    const where = { status: 'Published' };

    if (location) {
      where.location = { contains: location };
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    res.json(opportunities);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true, logo: true, description: true, contactEmail: true } },
        _count: { select: { signups: true } },
      },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    res.json(opportunity);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublished, getById };
