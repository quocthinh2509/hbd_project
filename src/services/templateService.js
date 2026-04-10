const { query, pool } = require('../models/db');

/**
 * Helper – fetch tags for a list of template IDs
 */
async function fetchTagsForTemplates(templateIds) {
  if (!templateIds.length) return {};
  const { rows } = await query(
    `SELECT tt.template_id, t.id, t.name, t.color
     FROM template_tags tt
     JOIN tags t ON t.id = tt.tag_id
     WHERE tt.template_id = ANY($1)`,
    [templateIds]
  );
  const map = {};
  for (const row of rows) {
    if (!map[row.template_id]) map[row.template_id] = [];
    map[row.template_id].push({ id: row.id, name: row.name, color: row.color });
  }
  return map;
}

/**
 * List templates with optional filters
 */
async function listTemplates({ tag, is_active, page = 1, limit = 20, search } = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (typeof is_active === 'boolean') {
    conditions.push(`t.is_active = $${idx++}`);
    values.push(is_active);
  }

  if (search) {
    conditions.push(`t.name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  // Filter by tag name
  let joinClause = '';
  if (tag) {
    joinClause = `
      JOIN template_tags tt2 ON tt2.template_id = t.id
      JOIN tags tg ON tg.id = tt2.tag_id AND tg.name = $${idx++}
    `;
    values.push(tag);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT DISTINCT t.id, t.name, t.description, t.thumbnail_url, t.is_active, t.created_at, t.updated_at
    FROM templates t
    ${joinClause}
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(limit, offset);

  const countQuery = `
    SELECT COUNT(DISTINCT t.id)::int AS total
    FROM templates t
    ${joinClause}
    ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, values),
    query(countQuery, values.slice(0, -2)), // remove limit/offset from count
  ]);

  const templates = dataResult.rows;
  const tagMap = await fetchTagsForTemplates(templates.map((t) => t.id));

  return {
    data: templates.map((t) => ({ ...t, tags: tagMap[t.id] || [] })),
    total: countResult.rows[0].total,
    page,
    limit,
  };
}

/**
 * Get single template by ID (includes canvas_json and tags)
 */
async function getTemplateById(id) {
  const { rows } = await query('SELECT * FROM templates WHERE id = $1', [id]);
  if (!rows.length) return null;
  const template = rows[0];
  const tagMap = await fetchTagsForTemplates([id]);
  template.tags = tagMap[id] || [];
  return template;
}

/**
 * Find active templates by tag name – returns the most recently updated one
 */
async function findActiveTemplateByTag(tagName) {
  const { rows } = await query(
    `SELECT t.*
     FROM templates t
     JOIN template_tags tt ON tt.template_id = t.id
     JOIN tags tg ON tg.id = tt.tag_id
     WHERE tg.name = $1 AND t.is_active = TRUE
     ORDER BY t.updated_at DESC
     LIMIT 1`,
    [tagName]
  );
  return rows[0] || null;
}

/**
 * Create a new template with optional tag assignments
 */
async function createTemplate({ name, description, canvas_json, tag_ids = [] }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO templates (name, description, canvas_json)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, JSON.stringify(canvas_json)]
    );
    const template = rows[0];

    if (tag_ids.length) {
      const placeholders = tag_ids.map((_, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO template_tags (template_id, tag_id) VALUES ${placeholders}`,
        [template.id, ...tag_ids]
      );
    }

    await client.query('COMMIT');
    template.tags = [];
    return template;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update an existing template
 */
async function updateTemplate(id, { name, description, canvas_json, thumbnail_url, is_active, tag_ids }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE templates SET
         name          = COALESCE($2, name),
         description   = COALESCE($3, description),
         canvas_json   = COALESCE($4, canvas_json),
         thumbnail_url = COALESCE($5, thumbnail_url),
         is_active     = COALESCE($6, is_active)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        name || null,
        description !== undefined ? description : null,
        canvas_json ? JSON.stringify(canvas_json) : null,
        thumbnail_url || null,
        is_active !== undefined ? is_active : null,
      ]
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return null;
    }

    // Update tags if provided
    if (Array.isArray(tag_ids)) {
      await client.query('DELETE FROM template_tags WHERE template_id = $1', [id]);
      if (tag_ids.length) {
        const placeholders = tag_ids.map((_, i) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO template_tags (template_id, tag_id) VALUES ${placeholders}`,
          [id, ...tag_ids]
        );
      }
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Soft delete – sets is_active = false
 */
async function deleteTemplate(id) {
  const { rowCount } = await query(
    'UPDATE templates SET is_active = FALSE WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}

/**
 * Duplicate a template – creates a copy with "Copy of ..." prefix
 */
async function duplicateTemplate(id) {
  const original = await getTemplateById(id);
  if (!original) return null;

  const tagIds = original.tags.map((t) => t.id);
  return createTemplate({
    name: `Copy of ${original.name}`,
    description: original.description,
    canvas_json: original.canvas_json,
    tag_ids: tagIds,
  });
}

module.exports = {
  listTemplates,
  getTemplateById,
  findActiveTemplateByTag,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
};
