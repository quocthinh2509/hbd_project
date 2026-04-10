const { fetchAvatarAsBase64 } = require('../src/puppeteer/avatarFetcher');

// Set allowed domains for testing
beforeAll(() => {
  process.env.AVATAR_ALLOWED_DOMAINS = 'cdn.example.com,assets.test.com';
});

afterAll(() => {
  delete process.env.AVATAR_ALLOWED_DOMAINS;
});

describe('avatarFetcher – fetchAvatarAsBase64()', () => {
  test('returns placeholder for null/undefined URL', async () => {
    const result = await fetchAvatarAsBase64(null);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder for empty string', async () => {
    const result = await fetchAvatarAsBase64('');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder for blocked domain (not in whitelist)', async () => {
    const result = await fetchAvatarAsBase64('https://evil.com/avatar.jpg');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder for localhost (SSRF protection)', async () => {
    const result = await fetchAvatarAsBase64('http://localhost/admin');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder for private IP (SSRF protection)', async () => {
    const result = await fetchAvatarAsBase64('http://192.168.1.1/secret');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder for 10.x.x.x IP range', async () => {
    const result = await fetchAvatarAsBase64('http://10.0.0.1/secret');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder for malformed URL', async () => {
    const result = await fetchAvatarAsBase64('not-a-url');
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  test('returns placeholder if fetch fails (network error)', async () => {
    // cdn.example.com is in whitelist but unreachable in test env
    const result = await fetchAvatarAsBase64('https://cdn.example.com/avatar.jpg');
    // Should fall back gracefully
    expect(result).toMatch(/^data:image/);
  }, 10000);
});
