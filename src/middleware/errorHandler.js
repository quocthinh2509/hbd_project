/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express app.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log full error in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  } else {
    // In production, log minimal info (no sensitive data)
    console.error(`[Error] ${status} ${req.method} ${req.path}: ${message}`);
  }

  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
