const { query } = require('../models/db');

/**
 * List tags with optional pagination
 */
async function listTags({ page = 1, limit = 100 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT t.*, COUNT(tt.template_id)::int AS template_count
     FROM tags t
     LEFT JOIN template_tags tt ON tt.tag_id = t.id
     GROUP BY t.id
     ORDER BY t.name ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const countResult = await query('SELECT COUNT(*)::int AS total FROM tags');
  return { data: rows, total: countResult.rows[0].total, page, limit };
}

/**
 * Get tag by ID
 */
async function getTagById(id) {
  const { rows } = await query('SELECT * FROM tags WHERE id = $1', [id]);
  if (!rows.length) return null;
  return rows[0];
}

/**
 * Get tag by slug name
 */
async function getTagByName(name) {
  const { rows } = await query('SELECT * FROM tags WHERE name = $1', [name]);
  if (!rows.length) return null;
  return rows[0];
}

/**
 * Create a new tag
 */
async function createTag({ name, color, description }) {
  const { rows } = await query(
    `INSERT INTO tags (name, color, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, color || null, description || null]
  );
  return rows[0];
}

/**
 * Update a tag
 */
async function updateTag(id, { name, color, description }) {
  const { rows } = await query(
    `UPDATE tags SET
       name = COALESCE($2, name),
       color = COALESCE($3, color),
       description = COALESCE($4, description)
     WHERE id = $1
     RETURNING *`,
    [id, name || null, color || null, description || null]
  );
  if (!rows.length) return null;
  return rows[0];
}

/**
 * Delete a tag (hard delete – will cascade remove from template_tags)
 */
async function deleteTag(id) {
  const { rowCount } = await query('DELETE FROM tags WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listTags, getTagById, getTagByName, createTag, updateTag, deleteTag };
