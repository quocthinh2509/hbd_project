const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const templateRoutes = require('./templates');
const tagRoutes = require('./tags');
const logRoutes = require('./logs');
const renderRoutes = require('./render');

// Health check (no auth required)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply auth + rate limiter to all API routes
router.use(auth);
router.use(rateLimiter);

// Route mounts
router.use('/templates', templateRoutes);
router.use('/tags', tagRoutes);
router.use('/logs', logRoutes);
router.use('/', renderRoutes);

module.exports = router;
