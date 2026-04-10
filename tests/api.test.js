/**
 * Integration tests for the REST API.
 * Requires a running database OR full mock.
 * Run with: npm test
 *
 * For CI without a DB, we mock the DB layer.
 */
const request = require('supertest');

// Mock DB before requiring app
jest.mock('../src/models/db', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    }),
  },
}));

// Mock render engine (skip Puppeteer in unit tests)
jest.mock('../src/puppeteer/renderEngine', () => ({
  initRenderEngine: jest.fn().mockResolvedValue(undefined),
  renderHtmlToPng: jest.fn().mockResolvedValue(Buffer.from('fake-png')),
  closeRenderEngine: jest.fn().mockResolvedValue(undefined),
}));

// Mock template service's findActiveTemplateByTag
jest.mock('../src/services/templateService', () => ({
  ...jest.requireActual('../src/services/templateService'),
  findActiveTemplateByTag: jest.fn(),
  listTemplates: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 }),
  getTemplateById: jest.fn(),
  createTemplate: jest.fn(),
  deleteTemplate: jest.fn(),
  duplicateTemplate: jest.fn(),
}));

// Mock tag service
jest.mock('../src/services/tagService', () => ({
  listTags: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  createTag: jest.fn(),
  getTagById: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
}));

// Mock render log service
jest.mock('../src/services/renderLogService', () => ({
  writeRenderLog: jest.fn(),
  listRenderLogs: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 50 }),
}));

process.env.API_KEY_SECRET = 'test-api-key';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const { findActiveTemplateByTag, createTemplate, listTemplates } = require('../src/services/templateService');
const { createTag, listTags } = require('../src/services/tagService');

const AUTH = { 'X-API-Key': 'test-api-key' };

// ── Health check ──────────────────────────────────────────────────
describe('GET /api/v1/health', () => {
  test('responds 200 without auth', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ── Auth middleware ───────────────────────────────────────────────
describe('Auth middleware', () => {
  test('returns 401 when no API key', async () => {
    const res = await request(app).get('/api/v1/templates');
    expect(res.status).toBe(401);
  });

  test('returns 401 for wrong API key', async () => {
    const res = await request(app).get('/api/v1/templates').set('X-API-Key', 'wrong-key');
    expect(res.status).toBe(401);
  });

  test('accepts correct API key', async () => {
    listTemplates.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 20 });
    const res = await request(app).get('/api/v1/templates').set(AUTH);
    expect(res.status).toBe(200);
  });
});

// ── POST /api/v1/render ───────────────────────────────────────────
describe('POST /api/v1/render', () => {
  const SAMPLE_CANVAS = {
    card: { width: 800, height: 450, background: '#0a3d7a' },
    elements: [
      { id: 'el_1', type: 'name', x: 40, y: 100, text: '{{name}}', font: 'Georgia', size: 36, color: '#fff', weight: 'bold', style: 'normal', align: 'left', width: 300, opacity: 100 },
    ],
  };

  test('returns 400 when tag is missing', async () => {
    const res = await request(app).post('/api/v1/render').set(AUTH)
      .send({ data: { name: 'An' } });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tag/i);
  });

  test('returns 400 when data.name is missing', async () => {
    const res = await request(app).post('/api/v1/render').set(AUTH)
      .send({ tag: 'test-tag', data: {} });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  test('returns 404 when tag not found', async () => {
    findActiveTemplateByTag.mockResolvedValueOnce(null);
    const res = await request(app).post('/api/v1/render').set(AUTH)
      .send({ tag: 'nonexistent-tag', data: { name: 'An' } });
    expect(res.status).toBe(404);
  });

  test('returns 200 PNG binary on success', async () => {
    findActiveTemplateByTag.mockResolvedValueOnce({
      id: 'template-uuid-1', canvas_json: SAMPLE_CANVAS,
    });
    const res = await request(app).post('/api/v1/render').set(AUTH)
      .send({ tag: 'fpt-birthday', data: { name: 'Nguyễn An' } });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/png/);
  });
});

// ── POST /api/v1/preview ──────────────────────────────────────────
describe('POST /api/v1/preview', () => {
  const CANVAS = {
    card: { width: 400, height: 200, background: '#000' },
    elements: [],
  };

  test('returns 400 when canvas_json is missing', async () => {
    const res = await request(app).post('/api/v1/preview').set(AUTH).send({ data: {} });
    expect(res.status).toBe(400);
  });

  test('returns base64 image on success', async () => {
    const res = await request(app).post('/api/v1/preview').set(AUTH)
      .send({ canvas_json: CANVAS, data: { name: 'Test' } });
    expect(res.status).toBe(200);
    expect(res.body.image_base64).toMatch(/^data:image\/png;base64,/);
  });
});

// ── Template CRUD ─────────────────────────────────────────────────
describe('GET /api/v1/templates', () => {
  test('returns paginated list', async () => {
    listTemplates.mockResolvedValueOnce({ data: [{ id: '1', name: 'Test', tags: [] }], total: 1, page: 1, limit: 20 });
    const res = await request(app).get('/api/v1/templates').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });
});

describe('POST /api/v1/templates', () => {
  test('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/v1/templates').set(AUTH)
      .send({ canvas_json: {} });
    expect(res.status).toBe(400);
  });

  test('returns 400 when canvas_json is missing', async () => {
    const res = await request(app).post('/api/v1/templates').set(AUTH)
      .send({ name: 'My Template' });
    expect(res.status).toBe(400);
  });

  test('creates template successfully', async () => {
    createTemplate.mockResolvedValueOnce({ id: 'new-uuid', name: 'My Template', tags: [] });
    const res = await request(app).post('/api/v1/templates').set(AUTH)
      .send({ name: 'My Template', canvas_json: { card: {}, elements: [] } });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('new-uuid');
  });
});

// ── Tag CRUD ──────────────────────────────────────────────────────
describe('POST /api/v1/tags', () => {
  test('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/v1/tags').set(AUTH).send({});
    expect(res.status).toBe(400);
  });

  test('returns 400 for invalid slug format', async () => {
    const res = await request(app).post('/api/v1/tags').set(AUTH)
      .send({ name: 'Invalid Name With Spaces' });
    expect(res.status).toBe(400);
  });

  test('creates tag successfully', async () => {
    createTag.mockResolvedValueOnce({ id: 'tag-uuid', name: 'fpt-birthday', color: '#185FA5' });
    const res = await request(app).post('/api/v1/tags').set(AUTH)
      .send({ name: 'fpt-birthday', color: '#185FA5' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('fpt-birthday');
  });
});
