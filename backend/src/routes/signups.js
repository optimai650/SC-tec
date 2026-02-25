const express = require('express');
const router = express.Router();
const { createSignup, cancelSignup, getMySignups } = require('../controllers/signupController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('volunteer'));

router.post('/', createSignup);
router.delete('/:id', cancelSignup);
router.get('/mine', getMySignups);

module.exports = router;
