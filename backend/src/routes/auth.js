const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
