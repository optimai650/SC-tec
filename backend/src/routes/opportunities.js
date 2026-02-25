const express = require('express');
const router = express.Router();
const { listPublished, getById } = require('../controllers/opportunityController');

router.get('/', listPublished);
router.get('/:id', getById);

module.exports = router;
