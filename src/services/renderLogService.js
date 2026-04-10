const { query } = require('../models/db');

/**
 * Write a render log entry to the database
 */
async function writeRenderLog({ template_id, employee_name, payload, duration_ms, status, error_msg }) {
  try {
    await query(
      `INSERT INTO render_logs (template_id, employee_name, payload, duration_ms, status, error_msg)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        template_id || null,
        employee_name || null,
        payload ? JSON.stringify(payload) : null,
        duration_ms || null,
        status,
        error_msg || null,
      ]
    );
  } catch (err) {
    // Never throw – log errors should not interrupt the main flow
    console.error('[renderLogService] Failed to write log:', err.message);
  }
}

/**
 * List render logs with optional filters
 */
async function listRenderLogs({ status, template_id, date_from, date_to, page = 1, limit = 50 } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`rl.status = $${idx++}`);
    values.push(status);
  }
  if (template_id) {
    conditions.push(`rl.template_id = $${idx++}`);
    values.push(template_id);
  }
  if (date_from) {
    conditions.push(`rl.created_at >= $${idx++}`);
    values.push(date_from);
  }
  if (date_to) {
    conditions.push(`rl.created_at <= $${idx++}`);
    values.push(date_to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT rl.*, t.name AS template_name
     FROM render_logs rl
     LEFT JOIN templates t ON t.id = rl.template_id
     ${whereClause}
     ORDER BY rl.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM render_logs rl ${whereClause}`,
    values
  );

  return { data: rows, total: countResult.rows[0].total, page, limit };
}

module.exports = { writeRenderLog, listRenderLogs };
