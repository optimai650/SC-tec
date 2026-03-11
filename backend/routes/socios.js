const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/socios — todos los socios activos con proyectos publicados de la feria activa
router.get('/', async (req, res, next) => {
  try {
    const activeFair = await prisma.fair.findFirst({ where: { isActive: true } });

    const socios = await prisma.socioFormador.findMany({
      where: { status: 'Activo' },
      include: {
        projects: {
          where: {
            status: 'Publicado',
            ...(activeFair ? { period: { fairPeriods: { some: { fairId: activeFair.id } } } } : {})
          },
          include: { period: true }
        }
      }
    });

    res.json(socios);
  } catch (err) {
    next(err);
  }
});

// GET /api/socios/all — todos los socios (para admin)
router.get('/all', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const socios = await prisma.socioFormador.findMany({
      include: { _count: { select: { projects: true, users: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(socios);
  } catch (err) {
    next(err);
  }
});

// POST /api/socios — crear socio (solo superadmin)
router.post('/', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, contactEmail, logo, description, status } = req.body;
    const socio = await prisma.socioFormador.create({
      data: { name, contactEmail, logo, description, status: status || 'Activo' }
    });
    res.status(201).json(socio);
  } catch (err) {
    next(err);
  }
});

// PUT /api/socios/:id — editar socio (solo superadmin)
router.put('/:id', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const { name, contactEmail, logo, description, status } = req.body;
    const socio = await prisma.socioFormador.update({
      where: { id: req.params.id },
      data: { name, contactEmail, logo, description, status }
    });
    res.json(socio);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/socios/:id — borrar socio (solo superadmin)
router.delete('/:id', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    await prisma.socioFormador.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/socios/:id/admin-user — crear usuario admin para el socio
router.post('/:id/admin-user', requireAuth, requireRole('superadmin'), async (req, res, next) => {
  try {
    const bcrypt = require('bcryptjs');
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'socio_admin',
        socioFormadorId: req.params.id
      }
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
