const { renderCard, previewCard } = require('../services/renderService');

/**
 * POST /api/v1/render
 * Receives employee data + tag → returns binary PNG
 */
async function renderCardHandler(req, res, next) {
  try {
    const { tag, data, width, height } = req.body;

    // Validate required fields
    if (!tag) return res.status(400).json({ error: 'Missing required field: tag' });
    if (!data) return res.status(400).json({ error: 'Missing required field: data' });
    if (!data.name) return res.status(400).json({ error: 'Missing required field: data.name' });

    const pngBuffer = await renderCard(tag, data, { width, height });

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="birthday_card_${Date.now()}.png"`,
      'Content-Length': pngBuffer.length,
      'Cache-Control': 'no-store',
    });
    res.status(200).send(pngBuffer);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message?.includes('timeout') || err.message?.includes('exceed')) {
      return res.status(504).json({ error: 'Render timeout exceeded 30s' });
    }
    next(err);
  }
}

/**
 * POST /api/v1/preview
 * Render with canvas_json directly (no DB lookup) → returns base64 PNG
 */
async function previewCardHandler(req, res, next) {
  try {
    const { canvas_json, data } = req.body;

    if (!canvas_json) return res.status(400).json({ error: 'Missing required field: canvas_json' });

    const imageBase64 = await previewCard(canvas_json, data || {});
    res.json({ image_base64: imageBase64 });
  } catch (err) {
    if (err.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Render timeout exceeded 30s' });
    }
    next(err);
  }
}

module.exports = { renderCard: renderCardHandler, previewCard: previewCardHandler };
