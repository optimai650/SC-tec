const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/inscriptions/me — inscripción del alumno logueado
router.get('/me', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const inscription = await prisma.inscription.findUnique({
      where: { alumnoId: req.user.id },
      include: {
        project: {
          include: { socioFormador: true, period: true }
        }
      }
    });
    res.json(inscription || null);
  } catch (err) {
    next(err);
  }
});

// POST /api/inscriptions/redeem — canjear código
router.post('/redeem', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const { code, firstName, lastName, phone, personalEmail, tecEmail, career, semester } = req.body;
    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Validar código
    const inscCode = await prisma.inscriptionCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!inscCode) return res.status(400).json({ error: 'Código inválido' });
    if (inscCode.usedAt) return res.status(400).json({ error: 'Este código ya fue utilizado' });

    // Validar que el código es para esta matrícula
    if (inscCode.matricula !== user.matricula) {
      return res.status(403).json({ error: 'Este código no corresponde a tu matrícula' });
    }

    // Validar que no tenga inscripción activa
    const existingInscription = await prisma.inscription.findUnique({
      where: { alumnoId: req.user.id }
    });
    if (existingInscription) {
      return res.status(400).json({ error: 'Ya tienes una inscripción activa' });
    }

    // Transacción: actualizar perfil, crear inscripción, marcar código, decrementar cupos
    const result = await prisma.$transaction(async (tx) => {
      // Verificar cupos disponibles dentro de la transacción (evita race condition)
      const projectCheck = await tx.project.findUnique({ where: { id: inscCode.projectId } });
      if (!projectCheck || projectCheck.remainingSlots <= 0) {
        throw Object.assign(new Error('El proyecto ya no tiene cupos disponibles'), { statusCode: 400 });
      }

      // Actualizar datos de perfil del alumno
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          personalEmail: personalEmail || undefined,
          tecEmail: tecEmail || undefined,
          career: career || undefined,
          semester: semester || undefined,
        }
      });

      // Crear inscripción
      const inscription = await tx.inscription.create({
        data: {
          alumnoId: req.user.id,
          projectId: inscCode.projectId,
          status: 'Inscrito'
        }
      });

      // Marcar código como usado
      await tx.inscriptionCode.update({
        where: { id: inscCode.id },
        data: { usedAt: new Date(), usedBy: req.user.id }
      });

      // Decrementar cupos
      const project = await tx.project.update({
        where: { id: inscCode.projectId },
        data: {
          remainingSlots: { decrement: 1 }
        }
      });

      // Si llega a 0, cambiar status a "Lleno"
      if (project.remainingSlots <= 0) {
        await tx.project.update({
          where: { id: inscCode.projectId },
          data: { status: 'Lleno' }
        });
      }

      return inscription;
    });

    const fullInscription = await prisma.inscription.findUnique({
      where: { id: result.id },
      include: {
        project: { include: { socioFormador: true, period: true } }
      }
    });

    res.json(fullInscription);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/inscriptions/me — cancelar inscripción propia
router.delete('/me', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const inscription = await prisma.inscription.findUnique({
      where: { alumnoId: req.user.id }
    });
    if (!inscription) return res.status(404).json({ error: 'No tienes inscripción activa' });

    await prisma.$transaction(async (tx) => {
      // Eliminar inscripción
      await tx.inscription.delete({ where: { id: inscription.id } });

      // Incrementar cupos
      const project = await tx.project.update({
        where: { id: inscription.projectId },
        data: { remainingSlots: { increment: 1 } }
      });

      // Si estaba "Lleno", volver a "Publicado"
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

module.exports = router;
