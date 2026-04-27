const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireRole } = require('../middleware/auth');
const { buildPayload, signPayload, verifyWithHash, getPublicKeyPem } = require('../utils/certificates');
const prisma = new PrismaClient();

function withCertValid(ins) {
  return {
    ...ins,
    certificateValid: ins.certificatePayload && ins.certificateSignature
      ? verifyWithHash(ins.certificatePayload, ins.certificateSignature, ins.certificateHash)
      : null,
  };
}

// GET /api/inscriptions/me — todas las inscripciones del alumno (activas + revocadas)
router.get('/me', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const inscriptions = await prisma.inscription.findMany({
      where: { alumnoId: req.user.id },
      include: { project: { include: { socioFormador: true, period: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(inscriptions.map(withCertValid));
  } catch (err) {
    next(err);
  }
});

// GET /api/inscriptions/:id/verify — verificar firma de un comprobante
router.get('/:id/verify', requireAuth, async (req, res, next) => {
  try {
    const ins = await prisma.inscription.findUnique({ where: { id: req.params.id } });
    if (!ins) return res.status(404).json({ error: 'Inscripción no encontrada' });
    if (req.user.role !== 'superadmin' && ins.alumnoId !== req.user.id) {
      return res.status(403).json({ error: 'Sin permisos' });
    }
    const valid = ins.certificatePayload && ins.certificateSignature
      ? verifyWithHash(ins.certificatePayload, ins.certificateSignature, ins.certificateHash)
      : null;
    res.json({ valid, publicKey: getPublicKeyPem(), inscription: withCertValid(ins) });
  } catch (err) {
    next(err);
  }
});

// POST /api/inscriptions/redeem — canjear código y generar certificado
router.post('/redeem', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const { code, firstName, lastName, phone, personalEmail, tecEmail, career, semester } = req.body;
    if (!code) return res.status(400).json({ error: 'Código requerido' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const inscCode = await prisma.inscriptionCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!inscCode) return res.status(400).json({ error: 'Código inválido' });
    if (inscCode.usedAt) return res.status(400).json({ error: 'Este código ya fue utilizado' });
    if (inscCode.matricula !== user.matricula) {
      return res.status(403).json({ error: 'Este código no corresponde a tu matrícula' });
    }

    const [project, activeFair] = await Promise.all([
      prisma.project.findUnique({ where: { id: inscCode.projectId }, include: { period: true, socioFormador: true } }),
      prisma.fair.findFirst({ where: { isActive: true } }),
    ]);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const existingInscription = await prisma.inscription.findFirst({
      where: { alumnoId: req.user.id, periodId: project.periodId, revokedAt: null },
    });
    if (existingInscription) {
      return res.status(400).json({ error: 'Ya tienes una inscripción activa en este periodo' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const projectCheck = await tx.project.findUnique({ where: { id: inscCode.projectId } });
      if (!projectCheck || projectCheck.remainingSlots <= 0) {
        throw Object.assign(new Error('El proyecto ya no tiene cupos disponibles'), { statusCode: 400 });
      }

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
        },
      });

      const inscription = await tx.inscription.create({
        data: {
          alumnoId: req.user.id,
          projectId: inscCode.projectId,
          periodId: project.periodId,
          fairId: activeFair?.id ?? null,
          status: 'Inscrito',
        },
      });

      await tx.inscriptionCode.update({
        where: { id: inscCode.id },
        data: { usedAt: new Date(), usedBy: req.user.id },
      });

      const updatedProject = await tx.project.update({
        where: { id: inscCode.projectId },
        data: { remainingSlots: { decrement: 1 } },
      });
      if (updatedProject.remainingSlots <= 0) {
        await tx.project.update({ where: { id: inscCode.projectId }, data: { status: 'Lleno' } });
      }

      return inscription;
    });

    // Generar certificado con datos completos del alumno actualizado
    const alumnoActualizado = await prisma.user.findUnique({ where: { id: req.user.id } });
    const payloadStr = buildPayload({
      inscriptionId: result.id,
      alumnoMatricula: alumnoActualizado.matricula,
      alumnoNombre: `${alumnoActualizado.firstName || ''} ${alumnoActualizado.lastName || ''}`.trim() || alumnoActualizado.matricula,
      projectId: project.id,
      projectTitle: project.title,
      socioFormador: project.socioFormador.name,
      periodo: project.period.name,
      feria: activeFair?.name || null,
      fairId: activeFair?.id || null,
      createdAt: result.createdAt.toISOString(),
    });
    const { signature, hash, signedAt } = signPayload(payloadStr);

    const finalInscription = await prisma.inscription.update({
      where: { id: result.id },
      data: {
        certificatePayload: payloadStr,
        certificateSignature: signature,
        certificateHash: hash,
        certificateSignedAt: signedAt,
      },
      include: { project: { include: { socioFormador: true, period: true } } },
    });

    res.json(withCertValid(finalInscription));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/inscriptions/:id — soft cancel propio del alumno
router.delete('/:id', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const inscription = await prisma.inscription.findUnique({ where: { id: req.params.id } });
    if (!inscription) return res.status(404).json({ error: 'Inscripción no encontrada' });
    if (inscription.alumnoId !== req.user.id) return res.status(403).json({ error: 'Sin permisos' });
    if (inscription.revokedAt) return res.status(400).json({ error: 'Esta inscripción ya fue cancelada' });

    await prisma.$transaction(async (tx) => {
      await tx.inscription.update({
        where: { id: inscription.id },
        data: { revokedAt: new Date(), revokedReason: 'Cancelado por alumno', status: 'Cancelado' },
      });

      const project = await tx.project.update({
        where: { id: inscription.projectId },
        data: { remainingSlots: { increment: 1 } },
      });
      if (project.status === 'Lleno') {
        await tx.project.update({ where: { id: inscription.projectId }, data: { status: 'Publicado' } });
      }
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
