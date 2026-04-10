/**
 * API Key Authentication Middleware
 * Validates X-API-Key header against API_KEY_SECRET env variable.
 */
function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key. Provide X-API-Key header.' });
  }

  if (apiKey !== process.env.API_KEY_SECRET) {
    return res.status(401).json({ error: 'Invalid API key.' });
  }

  next();
}

module.exports = authMiddleware;
