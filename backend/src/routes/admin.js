const express = require('express');
const router = express.Router();
const {
  listOrganizations,
  createOrganization,
  updateOrganizationStatus,
  listAllOpportunities,
  listAllSignups,
  getDashboardStats,
  listVolunteers,
  deleteVolunteer,
  updateSignupStatus,
  getOrgById,
  updateOrg,
  listOrgOpportunities,
  createOrgOpportunity,
  updateOrgOpportunity,
  updateOrgOpportunityStatus,
  getOrgOpportunityVolunteers,
  markOrgVolunteerAttendance,
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('superadmin'));

router.get('/stats', getDashboardStats);
router.get('/organizations', listOrganizations);
router.post('/organizations', createOrganization);
router.put('/organizations/:id/status', updateOrganizationStatus);
router.get('/opportunities', listAllOpportunities);
router.get('/signups', listAllSignups);

// Voluntarios
router.get('/volunteers', listVolunteers);
router.delete('/volunteers/:id', deleteVolunteer);

// Signups
router.put('/signups/:id/status', updateSignupStatus);

// Panel de org para superadmin
router.get('/orgs/:orgId', getOrgById);
router.put('/orgs/:orgId', updateOrg);
router.get('/orgs/:orgId/opportunities', listOrgOpportunities);
router.post('/orgs/:orgId/opportunities', createOrgOpportunity);
router.put('/orgs/:orgId/opportunities/:oppId', updateOrgOpportunity);
router.put('/orgs/:orgId/opportunities/:oppId/status', updateOrgOpportunityStatus);
router.get('/orgs/:orgId/opportunities/:oppId/volunteers', getOrgOpportunityVolunteers);
router.put('/orgs/:orgId/opportunities/:oppId/volunteers/:signupId', markOrgVolunteerAttendance);

module.exports = router;
