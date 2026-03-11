const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/public/active-fair — feria activa con sus periodos (sin auth)
router.get('/active-fair', async (req, res, next) => {
  try {
    const activeFair = await prisma.fair.findFirst({
      where: { isActive: true },
      include: { periods: { include: { period: true } } }
    });
    res.json(activeFair || null);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
