const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  createCertificatePayload,
  stringifyCertificatePayload,
  hashCertificatePayload,
  signCertificatePayload,
  verifyCertificateSignature,
} = require('../utils/certificateCrypto');
const prisma = new PrismaClient();

function serializeCertificate(inscription) {
  if (!inscription?.certificatePayload || !inscription?.certificateSignature) {
    return null;
  }

  let payload = null;
  try {
    payload = JSON.parse(inscription.certificatePayload);
  } catch {
    payload = inscription.certificatePayload;
  }

  return {
    payload,
    signature: inscription.certificateSignature,
    hash: inscription.certificateHash,
    signedAt: inscription.certificateSignedAt,
    verified: verifyCertificateSignature(
      inscription.certificatePayload,
      inscription.certificateSignature
    ),
    revokedAt: inscription.revokedAt,
    revokedReason: inscription.revokedReason,
  };
}

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

    if (!inscription) {
      return res.json(null);
    }

    res.json({
      ...inscription,
      certificate: serializeCertificate(inscription),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/inscriptions/me/certificate — certificado firmado del alumno
router.get('/me/certificate', requireAuth, requireRole('alumno'), async (req, res, next) => {
  try {
    const inscription = await prisma.inscription.findUnique({
      where: { alumnoId: req.user.id },
      include: {
        project: {
          include: { socioFormador: true, period: true }
        }
      }
    });

    if (!inscription) {
      return res.status(404).json({ error: 'No tienes inscripción activa' });
    }

    const certificate = serializeCertificate(inscription);
    if (!certificate) {
      return res.status(404).json({ error: 'Todavía no existe un certificado para esta inscripción' });
    }

    res.json({
      inscriptionId: inscription.id,
      status: inscription.status,
      project: inscription.project,
      alumno: req.user,
      certificate,
    });
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
      return res.status(400).json({ error: 'Ya tienes una inscripción activa o cancelada registrada en el sistema' });
    }

    // Transacción: actualizar perfil, crear inscripción, firmar certificado, marcar código, decrementar cupos
    const result = await prisma.$transaction(async (tx) => {
      // Verificar cupos disponibles dentro de la transacción (evita race condition)
      const projectCheck = await tx.project.findUnique({
        where: { id: inscCode.projectId },
        include: { socioFormador: true, period: true }
      });
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

      const certificatePayloadObject = createCertificatePayload({
        inscription,
        alumno: {
          id: user.id,
          matricula: user.matricula,
        },
        project: projectCheck,
      });
      const certificatePayload = stringifyCertificatePayload(certificatePayloadObject);
      const certificateSignature = signCertificatePayload(certificatePayload);
      const certificateHash = hashCertificatePayload(certificatePayload);

      const signedInscription = await tx.inscription.update({
        where: { id: inscription.id },
        data: {
          certificatePayload,
          certificateSignature,
          certificateHash,
          certificateSignedAt: new Date(),
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

      return signedInscription;
    });

    const fullInscription = await prisma.inscription.findUnique({
      where: { id: result.id },
      include: {
        project: { include: { socioFormador: true, period: true } }
      }
    });

    res.json({
      ...fullInscription,
      certificate: serializeCertificate(fullInscription),
    });
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
    if (inscription.status === 'Cancelado') {
      return res.status(400).json({ error: 'Tu inscripción ya está cancelada' });
    }

    await prisma.$transaction(async (tx) => {
      // Marcar inscripción como cancelada en vez de borrarla
      await tx.inscription.update({
        where: { id: inscription.id },
        data: {
          status: 'Cancelado',
          revokedAt: new Date(),
          revokedReason: 'Cancelación solicitada por el alumno',
        }
      });

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
