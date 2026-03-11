const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireRole } = require('../middleware/auth');
const crypto = require('crypto');
const prisma = new PrismaClient();

function generateCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// GET /api/projects/public — proyectos publicados de la feria activa
router.get('/public', async (req, res, next) => {
  try {
    const activeFair = await prisma.fair.findFirst({ where: { isActive: true } });
    if (!activeFair) return res.json([]);

    const fairPeriods = await prisma.fairPeriod.findMany({
      where: { fairId: activeFair.id }
    });
    const periodIds = fairPeriods.map(fp => fp.periodId);

    const projects = await prisma.project.findMany({
      where: {
        status: { not: 'Borrador' },
        periodId: { in: periodIds }
      },
      include: {
        socioFormador: true,
        period: true,
        _count: { select: { inscriptions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/by-token/:qrToken — info pública por qrToken
router.get('/by-token/:qrToken', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { qrToken: req.params.qrToken },
      include: { socioFormador: true, period: true }
    });
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects — todos los proyectos (admin)
router.get('/', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        socioFormador: true,
        period: true,
        _count: { select: { inscriptions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/my — proyectos del socio logueado
router.get('/my', requireAuth, requireRole('socio_admin'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { socioFormador: true }
    });
    if (!user?.socioFormadorId) {
      return res.status(403).json({ error: 'No asociado a un socio formador' });
    }

    const projects = await prisma.project.findMany({
      where: { socioFormadorId: user.socioFormadorId },
      include: {
        period: true,
        socioFormador: true,
        inscriptions: {
          include: {
            alumno: { select: { id: true, matricula: true, firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects — crear proyecto (admin)
router.post('/', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { title, description, location, totalSlots, socioFormadorId, periodId, status } = req.body;
    const qrToken = crypto.randomBytes(16).toString('hex');
    const project = await prisma.project.create({
      data: {
        title, description, location,
        totalSlots: parseInt(totalSlots),
        remainingSlots: parseInt(totalSlots),
        socioFormadorId, periodId,
        status: status || 'Publicado',
        qrToken
      },
      include: { socioFormador: true, period: true }
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id — editar proyecto
router.put('/:id', requireAuth, requireRole('superadmin', 'socio_admin'), async (req, res, next) => {
  try {
    const { title, description, location, totalSlots, socioFormadorId, periodId, status } = req.body;

    // socio_admin solo puede editar sus propios proyectos
    if (req.user.role === 'socio_admin') {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const project = await prisma.project.findUnique({ where: { id: req.params.id } });
      if (!project || project.socioFormadorId !== user.socioFormadorId) {
        return res.status(403).json({ error: 'Sin permisos para editar este proyecto' });
      }
    }

    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (location) data.location = location;
    if (status) data.status = status;
    if (totalSlots !== undefined) {
      const currentProject = await prisma.project.findUnique({ where: { id: req.params.id } });
      const inscribed = currentProject.totalSlots - currentProject.remainingSlots;
      data.totalSlots = parseInt(totalSlots);
      data.remainingSlots = Math.max(0, parseInt(totalSlots) - inscribed);
    }
    if (socioFormadorId) data.socioFormadorId = socioFormadorId;
    if (periodId) data.periodId = periodId;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: { socioFormador: true, period: true }
    });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id — borrar proyecto (admin)
router.delete('/:id', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/generate-code — generar código de inscripción (socio_admin)
router.post('/:id/generate-code', requireAuth, requireRole('socio_admin'), async (req, res, next) => {
  try {
    const { matricula } = req.body;
    if (!matricula) return res.status(400).json({ error: 'Matrícula requerida' });

    // Obtener proyecto
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    // Verificar ownership PRIMERO (antes de consultar matricula o inscripciones)
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (req.user.socioFormadorId !== project.socioFormadorId && user.socioFormadorId !== project.socioFormadorId) {
      return res.status(403).json({ error: 'Sin permisos para este proyecto' });
    }

    // Obtener feria activa y validar matrícula
    const activeFair = await prisma.fair.findFirst({ where: { isActive: true } });
    if (!activeFair) {
      return res.status(400).json({ error: 'No hay una feria activa' });
    }

    const preregistered = await prisma.preregisteredMatricula.findFirst({
      where: { matricula, fairId: activeFair.id }
    });
    if (!preregistered) {
      return res.status(400).json({ error: 'Esta matrícula no está registrada para la feria activa' });
    }

    // Validar que el alumno NO tenga inscripción activa
    const alumnoUser = await prisma.user.findUnique({ where: { matricula } });
    if (alumnoUser) {
      const existingInscription = await prisma.inscription.findUnique({
        where: { alumnoId: alumnoUser.id }
      });
      if (existingInscription) {
        return res.status(400).json({ error: 'El alumno ya tiene una inscripción activa' });
      }
    }

    // Validar que el proyecto tenga cupos
    if (project.remainingSlots <= 0) {
      return res.status(400).json({ error: 'El proyecto no tiene cupos disponibles' });
    }

    // Generar código único con manejo de fallo
    let code;
    let tries = 0;
    do {
      code = generateCode(8);
      tries++;
      if (tries >= 10) return res.status(500).json({ error: 'No se pudo generar un código único, intenta de nuevo' });
      const existing = await prisma.inscriptionCode.findUnique({ where: { code } });
      if (!existing) break;
    } while (true);

    await prisma.inscriptionCode.create({
      data: { code, projectId: project.id, matricula }
    });

    res.json({ code });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
