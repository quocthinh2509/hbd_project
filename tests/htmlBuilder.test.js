const { buildHtml, replacePlaceholders } = require('../src/puppeteer/htmlBuilder');

describe('htmlBuilder – replacePlaceholders()', () => {
  const data = {
    name: 'Nguyễn Văn A',
    wish: 'Chúc mừng sinh nhật!',
    department: 'IT Department',
    position: 'Senior Dev',
    birthday: '15/04/1990',
  };

  test('replaces all placeholders correctly', () => {
    const text = 'Xin chào {{name}} từ {{department}}, chức vụ {{position}}!';
    const result = replacePlaceholders(text, data);
    expect(result).toBe('Xin chào Nguyễn Văn A từ IT Department, chức vụ Senior Dev!');
  });

  test('handles missing fields gracefully (empty string)', () => {
    const text = 'Hello {{name}} – {{wish}}';
    const result = replacePlaceholders(text, { name: 'Bình' });
    expect(result).toBe('Hello Bình – ');
  });

  test('handles null/undefined text gracefully', () => {
    expect(replacePlaceholders(null, data)).toBe('');
    expect(replacePlaceholders(undefined, data)).toBe('');
  });

  test('replaces multiple occurrences of same placeholder', () => {
    const text = '{{name}} – {{name}}';
    expect(replacePlaceholders(text, { name: 'An' })).toBe('An – An');
  });
});

describe('htmlBuilder – buildHtml()', () => {
  const sampleCanvas = {
    card: { width: 800, height: 450, background: 'linear-gradient(135deg, #0a3d7a, #1565c0)', borderRadius: '8px' },
    elements: [
      { id: 'el_1', type: 'name', x: 40, y: 100, text: '{{name}}', font: 'Georgia', size: 36, color: '#fff', weight: 'bold', style: 'normal', align: 'left', width: 300, opacity: 100 },
      { id: 'el_2', type: 'wish', x: 40, y: 180, text: '{{wish}}', font: 'Georgia', size: 16, color: '#e3f2fd', weight: 'normal', style: 'italic', align: 'left', width: 480, opacity: 100 },
      { id: 'el_3', type: 'avatar', x: 600, y: 120, size: 150, shape: 'circle', borderW: 3, borderColor: '#fff', borderStyle: 'solid', bg: '#1565c0', opacity: 100 },
    ],
  };

  const data = { name: 'Trần Thị B', wish: 'Chúc vui vẻ!', department: 'Marketing', position: 'Manager', birthday: '01/01/1995' };
  const avatarB64 = 'data:image/png;base64,iVBORw0KGgo=';

  test('returns valid HTML string', () => {
    const html = buildHtml(sampleCanvas, data, avatarB64);
    expect(typeof html).toBe('string');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  test('replaces name placeholder in rendered output', () => {
    const html = buildHtml(sampleCanvas, data, avatarB64);
    expect(html).toContain('Trần Thị B');
    expect(html).not.toContain('{{name}}');
  });

  test('replaces wish placeholder', () => {
    const html = buildHtml(sampleCanvas, data, avatarB64);
    expect(html).toContain('Chúc vui vẻ!');
  });

  test('applies correct card dimensions', () => {
    const html = buildHtml(sampleCanvas, data, avatarB64);
    expect(html).toContain('width: 800px');
    expect(html).toContain('height: 450px');
  });

  test('embeds avatar base64 src', () => {
    const html = buildHtml(sampleCanvas, data, avatarB64);
    expect(html).toContain(avatarB64);
  });

  test('handles empty elements array', () => {
    const emptyCanvas = { card: { width: 400, height: 200, background: '#000' }, elements: [] };
    const html = buildHtml(emptyCanvas, data, null);
    expect(html).toContain('width: 400px');
  });

  test('escapes HTML special characters to prevent XSS', () => {
    const xssData = { ...data, name: '<script>alert("xss")</script>' };
    const html = buildHtml(sampleCanvas, xssData, avatarB64);
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });

  test('all 6 avatar shapes render without error', () => {
    const shapes = ['circle', 'square', 'rounded', 'hexagon', 'diamond', 'star'];
    for (const shape of shapes) {
      const canvas = {
        card: { width: 400, height: 300, background: '#000' },
        elements: [{ id: 'av', type: 'avatar', x: 10, y: 10, size: 100, shape, borderW: 0, bg: '#333', opacity: 100 }],
      };
      expect(() => buildHtml(canvas, data, avatarB64)).not.toThrow();
    }
  });
});
