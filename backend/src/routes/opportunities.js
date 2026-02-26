const express = require('express');
const router = express.Router();
const { listPublished, getById, listLocations } = require('../controllers/opportunityController');

// IMPORTANT: /locations must come before /:id to avoid conflict
router.get('/locations', listLocations);
router.get('/', listPublished);
router.get('/:id', getById);

module.exports = router;
