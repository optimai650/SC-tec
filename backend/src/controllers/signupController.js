const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSignup(req, res, next) {
  try {
    const { opportunityId } = req.body;
    const volunteerId = req.user.id;

    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId es requerido' });
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }

    if (opportunity.status !== 'Published') {
      return res.status(400).json({ error: 'Esta oportunidad no está disponible' });
    }

    if (opportunity.remainingSlots <= 0) {
      return res.status(400).json({ error: 'No hay cupos disponibles' });
    }

    // Verificar duplicados
    const existing = await prisma.signup.findUnique({
      where: { volunteerId_opportunityId: { volunteerId, opportunityId } },
    });

    if (existing && existing.status !== 'Cancelado') {
      return res.status(400).json({ error: 'Ya estás registrado en esta oportunidad' });
    }

    let signup;
    if (existing && existing.status === 'Cancelado') {
      // Re-registrar
      signup = await prisma.signup.update({
        where: { id: existing.id },
        data: { status: 'Registrado' },
      });
    } else {
      signup = await prisma.signup.create({
        data: { volunteerId, opportunityId, status: 'Registrado' },
      });
    }

    // Decrementar slots
    const newRemaining = opportunity.remainingSlots - 1;
    const newStatus = newRemaining <= 0 ? 'Full' : opportunity.status;

    await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { remainingSlots: newRemaining, status: newStatus },
    });

    console.log(`[EMAIL] Confirmación de registro para ${req.user.email} en "${opportunity.title}"`);

    res.status(201).json(signup);
  } catch (err) {
    next(err);
  }
}

async function cancelSignup(req, res, next) {
  try {
    const { id } = req.params;
    const volunteerId = req.user.id;

    const signup = await prisma.signup.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!signup) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    if (signup.volunteerId !== volunteerId) {
      return res.status(403).json({ error: 'No tienes permisos para cancelar este registro' });
    }

    if (signup.status === 'Cancelado') {
      return res.status(400).json({ error: 'Este registro ya está cancelado' });
    }

    if (signup.status === 'Completado') {
      return res.status(400).json({ error: 'No puedes cancelar un registro ya completado' });
    }

    if (new Date(signup.opportunity.startDate) <= new Date()) {
      return res.status(400).json({ error: 'No puedes cancelar un registro de una oportunidad que ya comenzó' });
    }

    await prisma.signup.update({
      where: { id },
      data: { status: 'Cancelado' },
    });

    // Devolver slot
    const opp = signup.opportunity;
    const newRemaining = opp.remainingSlots + 1;
    const newStatus = opp.status === 'Full' ? 'Published' : opp.status;

    await prisma.opportunity.update({
      where: { id: opp.id },
      data: { remainingSlots: newRemaining, status: newStatus },
    });

    res.json({ message: 'Registro cancelado correctamente' });
  } catch (err) {
    next(err);
  }
}

async function getMySignups(req, res, next) {
  try {
    const volunteerId = req.user.id;

    const signups = await prisma.signup.findMany({
      where: { volunteerId, status: { not: 'Cancelado' } },
      include: {
        opportunity: {
          include: {
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

module.exports = { createSignup, cancelSignup, getMySignups };
