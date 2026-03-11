const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/auth/login
// Acepta { matricula, password } o { email, password }
router.post('/login', async (req, res, next) => {
  try {
    const { matricula, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }

    let user = null;

    if (matricula) {
      // Verificar que esté en PreregisteredMatricula
      const preregistered = await prisma.preregisteredMatricula.findUnique({
        where: { matricula }
      });
      if (!preregistered) {
        return res.status(403).json({ error: 'Matrícula no registrada en el sistema' });
      }
      user = await prisma.user.findUnique({ where: { matricula } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      return res.status(400).json({ error: 'Se requiere matrícula o email' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        matricula: user.matricula,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        matricula: user.matricula,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
