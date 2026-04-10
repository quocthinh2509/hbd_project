const tagService = require('../services/tagService');

/**
 * GET /api/v1/tags
 */
async function listTags(req, res, next) {
  try {
    const { page = 1, limit = 100 } = req.query;
    const result = await tagService.listTags({ page: +page, limit: +limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/tags
 */
async function createTag(req, res, next) {
  try {
    const { name, color, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing required field: name' });

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(name)) {
      return res.status(400).json({ error: 'Tag name must be lowercase slug format (a-z, 0-9, hyphens only)' });
    }

    const tag = await tagService.createTag({ name, color, description });
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Tag name '${req.body.name}' already exists` });
    }
    next(err);
  }
}

/**
 * PUT /api/v1/tags/:id
 */
async function updateTag(req, res, next) {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    if (name && !/^[a-z0-9-]+$/.test(name)) {
      return res.status(400).json({ error: 'Tag name must be lowercase slug format' });
    }

    const tag = await tagService.updateTag(id, { name, color, description });
    if (!tag) return res.status(404).json({ error: `Tag '${id}' not found` });
    res.json(tag);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Tag name '${req.body.name}' already exists` });
    }
    next(err);
  }
}

/**
 * DELETE /api/v1/tags/:id
 */
async function deleteTag(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await tagService.deleteTag(id);
    if (!deleted) return res.status(404).json({ error: `Tag '${id}' not found` });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTags, createTag, updateTag, deleteTag };
