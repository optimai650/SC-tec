const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

const adminOnly = [requireAuth, requireRole('superadmin')];

// ========== MATRÍCULAS ==========

// GET /api/admin/matriculas
router.get('/matriculas', ...adminOnly, async (req, res, next) => {
  try {
    const { fairId } = req.query;
    const where = fairId ? { fairId } : {};
    const [matriculas, fairs] = await Promise.all([
      prisma.preregisteredMatricula.findMany({
        where,
        include: { fair: true },
        orderBy: { importedAt: 'desc' }
      }),
      prisma.fair.findMany({ orderBy: { createdAt: 'desc' } })
    ]);
    res.json({ matriculas, fairs });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/matriculas — importar CSV
router.post('/matriculas', ...adminOnly, async (req, res, next) => {
  try {
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ error: 'CSV requerido' });

    // Obtener feria activa
    const activeFair = await prisma.fair.findFirst({ where: { isActive: true } });
    if (!activeFair) {
      return res.status(400).json({ error: 'No hay una feria activa. Activa una feria antes de importar matrículas.' });
    }

    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    let imported = 0;
    const errors = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      const matricula = parts[0];
      const nombre = parts[1] || null;
      const email = parts[2] || null;

      if (!matricula) continue;

      try {
        await prisma.preregisteredMatricula.upsert({
          where: { matricula_fairId: { matricula, fairId: activeFair.id } },
          update: { nombre, email },
          create: { matricula, nombre, email, fairId: activeFair.id }
        });

        // El User es global — solo crear si no existe
        const existingUser = await prisma.user.findUnique({ where: { matricula } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              matricula,
              passwordHash: await bcrypt.hash(matricula, 10),
              role: 'alumno',
              firstName: nombre || undefined,
              email: email || undefined
            }
          });
        }

        imported++;
      } catch (e) {
        errors.push({ matricula, error: e.message });
      }
    }

    res.json({ imported, total: lines.length, errors });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/matriculas/:id
router.delete('/matriculas/:id', ...adminOnly, async (req, res, next) => {
  try {
    await prisma.preregisteredMatricula.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ========== FERIAS ==========

// GET /api/admin/fairs
router.get('/fairs', ...adminOnly, async (req, res, next) => {
  try {
    const fairs = await prisma.fair.findMany({
      include: {
        periods: { include: { period: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(fairs);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/fairs
router.post('/fairs', ...adminOnly, async (req, res, next) => {
  try {
    const { name, isActive } = req.body;
    const fair = await prisma.fair.create({
      data: { name, isActive: isActive || false }
    });
    res.status(201).json(fair);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/fairs/:id
router.put('/fairs/:id', ...adminOnly, async (req, res, next) => {
  try {
    const { name } = req.body;
    const fair = await prisma.fair.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(fair);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/fairs/:id
router.delete('/fairs/:id', ...adminOnly, async (req, res, next) => {
  try {
    await prisma.fair.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/fairs/:id/activate
router.post('/fairs/:id/activate', ...adminOnly, async (req, res, next) => {
  try {
    // Desactivar todas
    await prisma.fair.updateMany({ data: { isActive: false } });
    // Activar la seleccionada
    const fair = await prisma.fair.update({
      where: { id: req.params.id },
      data: { isActive: true }
    });
    res.json(fair);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/fairs/:id/periods
router.post('/fairs/:id/periods', ...adminOnly, async (req, res, next) => {
  try {
    const { periodIds } = req.body;
    const fairId = req.params.id;

    // Borrar asociaciones existentes
    await prisma.fairPeriod.deleteMany({ where: { fairId } });

    // Crear nuevas
    if (periodIds && periodIds.length > 0) {
      await prisma.fairPeriod.createMany({
        data: periodIds.map(periodId => ({ fairId, periodId }))
      });
    }

    const fair = await prisma.fair.findUnique({
      where: { id: fairId },
      include: { periods: { include: { period: true } } }
    });
    res.json(fair);
  } catch (err) {
    next(err);
  }
});

// ========== PERIODOS ==========

// GET /api/admin/periods
router.get('/periods', ...adminOnly, async (req, res, next) => {
  try {
    const periods = await prisma.period.findMany({ orderBy: { name: 'asc' } });
    res.json(periods);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/periods
router.post('/periods', ...adminOnly, async (req, res, next) => {
  try {
    const { name } = req.body;
    const period = await prisma.period.create({ data: { name } });
    res.status(201).json(period);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/periods/:id
router.put('/periods/:id', ...adminOnly, async (req, res, next) => {
  try {
    const { name } = req.body;
    const period = await prisma.period.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(period);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/periods/:id
router.delete('/periods/:id', ...adminOnly, async (req, res, next) => {
  try {
    await prisma.period.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ========== INSCRIPCIONES ==========

// GET /api/admin/inscriptions
router.get('/inscriptions', ...adminOnly, async (req, res, next) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
      include: {
        alumno: { select: { id: true, matricula: true, firstName: true, lastName: true, phone: true, personalEmail: true, tecEmail: true, career: true, semester: true } },
        project: { include: { socioFormador: true, period: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(inscriptions);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/inscriptions/:id
router.delete('/inscriptions/:id', ...adminOnly, async (req, res, next) => {
  try {
    const inscription = await prisma.inscription.findUnique({
      where: { id: req.params.id }
    });
    if (!inscription) return res.status(404).json({ error: 'Inscripción no encontrada' });

    await prisma.$transaction(async (tx) => {
      await tx.inscription.delete({ where: { id: req.params.id } });
      const project = await tx.project.update({
        where: { id: inscription.projectId },
        data: { remainingSlots: { increment: 1 } }
      });
      if (project.status === 'Lleno') {
        await tx.project.update({
          where: { id: inscription.projectId },
          data: { status: 'Publicado' }
        });
      }
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ========== ESTADÍSTICAS ==========

// GET /api/admin/stats
router.get('/stats', ...adminOnly, async (req, res, next) => {
  try {
    const { fairId } = req.query;

    // Obtener la feria a consultar (si no se pasa fairId, usar la activa)
    const fair = fairId
      ? await prisma.fair.findUnique({ where: { id: fairId }, include: { periods: { include: { period: true } } } })
      : await prisma.fair.findFirst({ where: { isActive: true }, include: { periods: { include: { period: true } } } });

    // Si se pasó fairId explícito pero no existe, retornar 404
    if (fairId && !fair) {
      return res.status(404).json({ error: 'Feria no encontrada' });
    }

    // IDs de periodos de esa feria
    const periodIds = fair ? fair.periods.map(fp => fp.periodId) : [];

    // Contar matrículas registradas para esa feria
    const matriculasTotal = fair
      ? await prisma.preregisteredMatricula.count({ where: { fairId: fair.id } })
      : 0;

    // Contar proyectos publicados en esa feria (por periodo)
    const proyectosPublicados = periodIds.length > 0
      ? await prisma.project.count({ where: { status: 'Publicado', periodId: { in: periodIds } } })
      : 0;

    // Cupos disponibles en esa feria
    const cuposAgg = periodIds.length > 0
      ? await prisma.project.aggregate({
          where: { status: 'Publicado', periodId: { in: periodIds } },
          _sum: { remainingSlots: true }
        })
      : { _sum: { remainingSlots: 0 } };

    // Alumnos inscritos en proyectos de esa feria
    const alumnosInscritos = periodIds.length > 0
      ? await prisma.inscription.count({
          where: { project: { periodId: { in: periodIds } } }
        })
      : 0;

    // Todas las ferias para el selector
    const allFairs = await prisma.fair.findMany({ orderBy: { createdAt: 'asc' } });

    res.json({
      matriculasTotal,
      alumnosInscritos,
      proyectosPublicados,
      cuposDisponibles: cuposAgg._sum.remainingSlots || 0,
      feriaActiva: fair,
      allFairs,
    });
  } catch (err) {
    next(err);
  }
});

// ========== CARGA MASIVA ==========

// POST /api/admin/socios/bulk — importar socios CSV
// CSV formato: nombre,contactEmail,descripcion
router.post('/socios/bulk', ...adminOnly, async (req, res, next) => {
  try {
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ error: 'CSV requerido' });
    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    let imported = 0;
    const errors = [];
    for (const line of lines) {
      const [name, contactEmail, description] = line.split(',').map(s => s?.trim());
      if (!name || !contactEmail || !description) {
        errors.push(`Línea inválida: ${line}`);
        continue;
      }
      try {
        await prisma.socioFormador.upsert({
          where: { contactEmail },
          update: { name, description },
          create: { name, contactEmail, description, status: 'Activo' }
        });
        imported++;
      } catch (e) {
        errors.push(`Error en ${name}: ${e.message}`);
      }
    }
    res.json({ imported, total: lines.length, errors });
  } catch (err) { next(err); }
});

// POST /api/admin/projects/bulk — importar proyectos CSV
// CSV: titulo,descripcion,ubicacion,cuposTotales,socioEmail,periodoNombre
router.post('/projects/bulk', ...adminOnly, async (req, res, next) => {
  try {
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ error: 'CSV requerido' });
    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    let imported = 0;
    const errors = [];
    for (const line of lines) {
      const [title, description, location, slotsStr, socioEmail, periodName] = line.split(',').map(s => s?.trim());
      const totalSlots = parseInt(slotsStr);
      if (!title || !description || !location || isNaN(totalSlots) || !socioEmail || !periodName) {
        errors.push(`Línea inválida: ${line}`);
        continue;
      }
      try {
        const socio = await prisma.socioFormador.findUnique({ where: { contactEmail: socioEmail } });
        if (!socio) { errors.push(`Socio no encontrado: ${socioEmail}`); continue; }
        const period = await prisma.period.findFirst({ where: { name: { contains: periodName } } });
        if (!period) { errors.push(`Periodo no encontrado: ${periodName}`); continue; }
        await prisma.project.create({
          data: {
            title, description, location, totalSlots, remainingSlots: totalSlots,
            status: 'Publicado', socioFormadorId: socio.id, periodId: period.id,
            qrToken: crypto.randomBytes(16).toString('hex')
          }
        });
        imported++;
      } catch (e) {
        errors.push(`Error en ${title}: ${e.message}`);
      }
    }
    res.json({ imported, total: lines.length, errors });
  } catch (err) { next(err); }
});

module.exports = router;
