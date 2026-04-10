const { listRenderLogs } = require('../services/renderLogService');

/**
 * GET /api/v1/logs
 */
async function getLogs(req, res, next) {
  try {
    const { status, template_id, date_from, date_to, page = 1, limit = 50 } = req.query;
    const result = await listRenderLogs({
      status,
      template_id,
      date_from,
      date_to,
      page: +page,
      limit: Math.min(+limit, 200),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getLogs };
