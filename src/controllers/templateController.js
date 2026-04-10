const templateService = require('../services/templateService');

/**
 * GET /api/v1/templates
 */
async function listTemplates(req, res, next) {
  try {
    const { tag, is_active, page = 1, limit = 20, search } = req.query;
    const isActiveFilter = is_active !== undefined ? is_active === 'true' : undefined;
    const result = await templateService.listTemplates({
      tag,
      is_active: isActiveFilter,
      page: +page,
      limit: Math.min(+limit, 100),
      search,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/templates/:id
 */
async function getTemplate(req, res, next) {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    if (!template) return res.status(404).json({ error: `Template '${req.params.id}' not found` });
    res.json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/templates
 */
async function createTemplate(req, res, next) {
  try {
    const { name, description, canvas_json, tag_ids } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing required field: name' });
    if (!canvas_json) return res.status(400).json({ error: 'Missing required field: canvas_json' });

    const template = await templateService.createTemplate({ name, description, canvas_json, tag_ids });
    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/templates/:id
 */
async function updateTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await templateService.updateTemplate(id, req.body);
    if (!updated) return res.status(404).json({ error: `Template '${id}' not found` });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/templates/:id
 * Soft delete – sets is_active = false
 */
async function deleteTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await templateService.deleteTemplate(id);
    if (!deleted) return res.status(404).json({ error: `Template '${id}' not found` });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/templates/:id/duplicate
 */
async function duplicateTemplate(req, res, next) {
  try {
    const { id } = req.params;
    const copy = await templateService.duplicateTemplate(id);
    if (!copy) return res.status(404).json({ error: `Template '${id}' not found` });
    res.status(201).json(copy);
  } catch (err) {
    next(err);
  }
}

module.exports = { listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate };
