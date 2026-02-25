const express = require('express');
const router = express.Router();
const {
  listOrganizations,
  createOrganization,
  updateOrganizationStatus,
  listAllOpportunities,
  listAllSignups,
  getDashboardStats,
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('superadmin'));

router.get('/stats', getDashboardStats);
router.get('/organizations', listOrganizations);
router.post('/organizations', createOrganization);
router.put('/organizations/:id/status', updateOrganizationStatus);
router.get('/opportunities', listAllOpportunities);
router.get('/signups', listAllSignups);

module.exports = router;
