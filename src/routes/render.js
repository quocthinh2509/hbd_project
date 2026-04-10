const express = require('express');
const router = express.Router();
const renderController = require('../controllers/renderController');

router.post('/render', renderController.renderCard);
router.post('/preview', renderController.previewCard);

module.exports = router;
