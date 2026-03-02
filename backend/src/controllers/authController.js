const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendWelcomeVolunteer } = require('../utils/emailService');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cambia-esto-en-produccion';

async function register(req, res, next) {
  try {
    const { email, password, phone, community, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contrasena son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres' });
    }

    // For volunteers, phone and community are required
    const role = req.body.role || 'volunteer';
    if (role === 'volunteer') {
      if (!firstName) {
        return res.status(400).json({ error: 'El nombre es requerido para voluntarios' });
      }
      if (!lastName) {
        return res.status(400).json({ error: 'El apellido es requerido para voluntarios' });
      }
      if (!phone) {
        return res.status(400).json({ error: 'El telefono es requerido para voluntarios' });
      }
      if (!community) {
        return res.status(400).json({ error: 'La comunidad es requerida para voluntarios' });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'volunteer',
        emailVerified: true,
        firstName: firstName,
        lastName: lastName,
        phone: phone || null,
        community: community || null,
      },
    });

    if (user.role === 'volunteer') {
      sendWelcomeVolunteer({ volunteer: user }).catch(() => {});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, organizationId: true, emailVerified: true, createdAt: true, firstName: true, lastName: true, phone: true, community: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { email, phone, community, password, firstName, lastName } = req.body;

    const updateData = {};

    // Validar y actualizar email
    if (email !== undefined) {
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Email inválido' });
      }
      // Verificar que no exista otro usuario con ese email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ error: 'Ya existe otra cuenta con ese email' });
      }
      updateData.email = email;
    }

    if (firstName !== undefined) {
      updateData.firstName = firstName || null;
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName || null;
    }

    if (phone !== undefined) {
      updateData.phone = phone || null;
    }

    if (community !== undefined) {
      updateData.community = community || null;
    }

    // Si viene contraseña nueva, hacer bcrypt hash
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        community: true,
        organizationId: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateProfile };
