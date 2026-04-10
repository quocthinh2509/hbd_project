const { findActiveTemplateByTag } = require('../services/templateService');
const { writeRenderLog } = require('./renderLogService');
const { fetchAvatarAsBase64 } = require('../puppeteer/avatarFetcher');
const { buildHtml } = require('../puppeteer/htmlBuilder');
const { renderHtmlToPng } = require('../puppeteer/renderEngine');

// In-memory HTML template cache: templateId -> { html, expiry }
const htmlCache = new Map();
const HTML_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Main render orchestrator.
 * Finds template by tag, builds HTML, renders PNG via Puppeteer.
 *
 * @param {string} tag - Tag slug
 * @param {object} data - { name, wish, department, position, birthday, avatar_url }
 * @param {object} overrides - { width, height }
 * @returns {Buffer} PNG image buffer
 */
async function renderCard(tag, data, overrides = {}) {
  const startTime = Date.now();
  let templateId = null;
  let status = 'error';
  let errorMsg = null;

  try {
    // 1. Find template by tag
    const template = await findActiveTemplateByTag(tag);
    if (!template) {
      const err = new Error(`Tag '${tag}' not found or no active template`);
      err.status = 404;
      throw err;
    }
    templateId = template.id;

    const canvasJson = typeof template.canvas_json === 'string'
      ? JSON.parse(template.canvas_json)
      : template.canvas_json;

    const cardWidth  = overrides.width  || canvasJson.card?.width  || 800;
    const cardHeight = overrides.height || canvasJson.card?.height || 450;

    // 2. Fetch avatar as base64 (with fallback to placeholder)
    const avatarBase64 = await fetchAvatarAsBase64(data.avatar_url);

    // 3. Build HTML (use cache if available)
    const cacheKey = `${templateId}:${JSON.stringify(data)}:${cardWidth}x${cardHeight}`;
    let html;
    const cached = htmlCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      html = cached.html;
    } else {
      html = buildHtml(canvasJson, data, avatarBase64);
      htmlCache.set(cacheKey, { html, expiry: Date.now() + HTML_CACHE_TTL_MS });
    }

    // 4. Render with Puppeteer
    const pngBuffer = await renderHtmlToPng(html, cardWidth, cardHeight);

    const duration = Date.now() - startTime;
    status = 'success';

    // 5. Write audit log (non-blocking)
    writeRenderLog({
      template_id: templateId,
      employee_name: data.name,
      payload: { tag, data: { ...data, avatar_url: '[redacted]' } },
      duration_ms: duration,
      status,
    });

    return pngBuffer;
  } catch (err) {
    errorMsg = err.message;
    writeRenderLog({
      template_id: templateId,
      employee_name: data?.name,
      payload: { tag },
      duration_ms: Date.now() - startTime,
      status: 'error',
      error_msg: errorMsg,
    });
    throw err;
  }
}

/**
 * Preview render – uses canvas_json directly (no DB lookup)
 * Returns base64 PNG data URI.
 */
async function previewCard(canvasJson, data) {
  const cardWidth  = canvasJson.card?.width  || 800;
  const cardHeight = canvasJson.card?.height || 450;

  const avatarBase64 = await fetchAvatarAsBase64(data?.avatar_url);
  const html = buildHtml(canvasJson, data || {}, avatarBase64);
  const pngBuffer = await renderHtmlToPng(html, cardWidth, cardHeight);

  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

module.exports = { renderCard, previewCard };
