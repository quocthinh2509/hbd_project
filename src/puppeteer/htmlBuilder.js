/**
 * HTML Builder – converts canvas_json + data into a complete HTML string
 * for Puppeteer to render.
 */

const AVATAR_SHAPES = {
  circle:  { clipPath: 'circle(50% at 50% 50%)', borderRadius: '' },
  square:  { clipPath: '', borderRadius: '0px' },
  rounded: { clipPath: '', borderRadius: '16px' },
  hexagon: { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderRadius: '' },
  diamond: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', borderRadius: '' },
  star:    {
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    borderRadius: '',
  },
};

/**
 * Replace all {{placeholder}} tokens in a string with data values.
 */
function replacePlaceholders(text, data) {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/g, data.name || '')
    .replace(/\{\{wish\}\}/g, data.wish || '')
    .replace(/\{\{department\}\}/g, data.department || '')
    .replace(/\{\{position\}\}/g, data.position || '')
    .replace(/\{\{birthday\}\}/g, data.birthday || '');
}

/**
 * Escape HTML special chars to prevent XSS in rendered card.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build CSS for avatar border (glow/double use box-shadow for clip-path compat)
 */
function buildAvatarBorderCss(el) {
  const borderW = el.borderW || 0;
  const borderColor = el.borderColor || '#ffffff';
  const borderStyle = el.borderStyle || 'none';

  if (borderStyle === 'none' || borderW === 0) return '';

  switch (borderStyle) {
    case 'glow':
      return `box-shadow: 0 0 0 ${borderW}px ${borderColor}, 0 0 ${borderW * 3}px ${borderColor}88;`;
    case 'double':
      return `box-shadow: 0 0 0 ${Math.max(1, borderW - 2)}px ${borderColor}, 0 0 0 ${borderW}px ${borderColor};`;
    case 'dashed':
      // clip-path blocks CSS border dashed from showing on irregular shapes; use outline w/ border-radius fallback
      return `outline: ${borderW}px dashed ${borderColor};`;
    default:
      return `box-shadow: 0 0 0 ${borderW}px ${borderColor};`;
  }
}

/**
 * Render a single element to HTML string.
 */
function renderElement(el, data, avatarBase64Map) {
  const opacity = (el.opacity !== undefined ? el.opacity : 100) / 100;
  const baseStyle = `position:absolute; left:${el.x}px; top:${el.y}px; opacity:${opacity};`;

  // ── Text-based elements ─────────────────────────────────────────
  const TEXT_TYPES = ['text', 'name', 'wish', 'dept', 'date', 'position', 'logo'];
  if (TEXT_TYPES.includes(el.type)) {
    const textContent = escapeHtml(replacePlaceholders(el.text || '', data));
    
    // Map system fonts to web fonts that support Vietnamese
    const fontName = el.font || 'Georgia';
    const fontMap = {
      'Georgia': '"Georgia", "Lora", serif',
      'Times New Roman': '"Times New Roman", "Lora", serif',
      'Arial': '"Arial", "Roboto", sans-serif',
      'Verdana': '"Verdana", "Inter", sans-serif',
      'Courier New': '"Courier New", monospace',
      'Inter': '"Inter", sans-serif',
      'Roboto': '"Roboto", sans-serif'
    };
    const finalFont = fontMap[fontName] || `"${fontName}", sans-serif`;

    const style = [
      baseStyle,
      `width:${el.width || 300}px;`,
      `font-family:${finalFont};`,
      `font-size:${el.size || 16}px;`,
      `color:${el.color || '#ffffff'};`,
      `font-weight:${el.weight || 'normal'};`,
      `font-style:${el.style || 'normal'};`,
      `text-align:${el.align || 'left'};`,
      `line-height:1.4;`,
      `word-wrap:break-word;`,
      `white-space:pre-wrap;`,
    ].join(' ');

    return `<div style="${style}">${textContent}</div>`;
  }

  // ── Avatar element ──────────────────────────────────────────────
  if (el.type === 'avatar') {
    const size = el.size || 150;
    const shape = AVATAR_SHAPES[el.shape] || AVATAR_SHAPES.circle;
    const imgSrc = avatarBase64Map || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    const borderCss = buildAvatarBorderCss(el);
    const bgColor = el.bg || '#1565c0';

    const containerStyle = [
      baseStyle,
      `width:${size}px; height:${size}px;`,
      `background-color:${bgColor};`,
      shape.clipPath ? `clip-path:${shape.clipPath};` : '',
      shape.borderRadius ? `border-radius:${shape.borderRadius};` : '',
      `overflow:hidden;`,
      borderCss,
    ].join(' ');

    const imgStyle = `width:100%; height:100%; object-fit:cover; display:block;`;

    return `<div style="${containerStyle}"><img src="${imgSrc}" style="${imgStyle}" alt="avatar" /></div>`;
  }

  // ── Shape: rect ─────────────────────────────────────────────────
  if (el.type === 'rect') {
    const style = [
      baseStyle,
      `width:${el.width || 100}px; height:${el.height || 40}px;`,
      `background-color:${el.color || '#ffffff'};`,
      `border-radius:${el.borderRadius || 0}px;`,
    ].join(' ');
    return `<div style="${style}"></div>`;
  }

  // ── Shape: circle ───────────────────────────────────────────────
  if (el.type === 'circle') {
    const d = el.size || 60;
    const style = [
      baseStyle,
      `width:${d}px; height:${d}px;`,
      `background-color:${el.color || '#ffffff'};`,
      `border-radius:50%;`,
    ].join(' ');
    return `<div style="${style}"></div>`;
  }

  // ── Shape: line ─────────────────────────────────────────────────
  if (el.type === 'line') {
    const style = [
      baseStyle,
      `width:${el.width || 200}px; height:${el.thickness || 2}px;`,
      `background-color:${el.color || '#ffffff'};`,
    ].join(' ');
    return `<div style="${style}"></div>`;
  }

  return '';
}

/**
 * Build a complete HTML page from canvas_json and populated data.
 * avatarBase64 is the pre-fetched base64 data URI for the avatar image.
 */
function buildHtml(canvasJson, data, avatarBase64) {
  const card = canvasJson.card || {};
  const elements = canvasJson.elements || [];

  const cardW = card.width || 800;
  const cardH = card.height || 450;
  const background = card.background || '#1565c0';
  const borderRadius = card.borderRadius || '0px';

  const elementsHtml = elements
    .map(el => renderElement(el, data, el.type === 'avatar' ? avatarBase64 : null))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${cardW}px;
      height: ${cardH}px;
      overflow: hidden;
      background: transparent;
    }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
  </style>
</head>
<body>
  <div style="
    position: relative;
    width: ${cardW}px;
    height: ${cardH}px;
    background: ${background};
    border-radius: ${borderRadius};
    overflow: hidden;
  ">
    ${elementsHtml}
  </div>
</body>
</html>`;
}

module.exports = { buildHtml, replacePlaceholders };
