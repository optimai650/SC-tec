const express = require('express');
const router = express.Router();
const {
  getMine,
  updateMine,
  getMyOpportunities,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStatus,
  getOpportunityVolunteers,
  updateVolunteerAttendance,
} = require('../controllers/organizationController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('org_admin'));

router.get('/mine', getMine);
router.put('/mine', updateMine);
router.get('/mine/opportunities', getMyOpportunities);
router.post('/mine/opportunities', createOpportunity);
router.put('/mine/opportunities/:id', updateOpportunity);
router.put('/mine/opportunities/:id/status', updateOpportunityStatus);
router.get('/mine/opportunities/:id/volunteers', getOpportunityVolunteers);
router.put('/mine/opportunities/:id/volunteers/:signupId', updateVolunteerAttendance);

module.exports = router;
