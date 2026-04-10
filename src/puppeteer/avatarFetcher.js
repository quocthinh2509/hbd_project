const axios = require('axios');

// In-memory avatar cache: url -> { base64, expiry }
const avatarCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get allowed domains from env
 */
function getAllowedDomains() {
  const raw = process.env.AVATAR_ALLOWED_DOMAINS || '';
  return raw.split(',').map(d => d.trim()).filter(Boolean);
}

/**
 * Validate that the avatar URL is from an allowed domain.
 * Also blocks private IP ranges (SSRF protection).
 */
function isUrlAllowed(url) {
  try {
    const parsed = new URL(url);
    const allowedDomains = getAllowedDomains();

    // Block obvious private IP ranges
    const privatePatterns = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
    ];
    if (privatePatterns.some(p => p.test(parsed.hostname))) return false;

    // If no whitelist configured, allow all external URLs
    if (!allowedDomains.length) return true;

    return allowedDomains.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Placeholder PNG as base64 (1x1 transparent pixel)
 */
const PLACEHOLDER_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Fetch an avatar URL and return a base64 data URI.
 * Returns placeholder if URL is blocked, invalid, or fetch fails.
 */
async function fetchAvatarAsBase64(avatarUrl) {
  if (!avatarUrl) return PLACEHOLDER_BASE64;

  // Check cache
  const cached = avatarCache.get(avatarUrl);
  if (cached && Date.now() < cached.expiry) {
    return cached.base64;
  }

  if (!isUrlAllowed(avatarUrl)) {
    console.warn(`[avatarFetcher] Blocked URL (not in whitelist): ${avatarUrl}`);
    return PLACEHOLDER_BASE64;
  }

  try {
    const response = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
      maxContentLength: 5 * 1024 * 1024, // 5MB max
      headers: { 'User-Agent': 'BirthdayCardBot/1.0' },
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    const base64 = `data:${contentType};base64,${Buffer.from(response.data).toString('base64')}`;

    // Store in cache
    avatarCache.set(avatarUrl, { base64, expiry: Date.now() + CACHE_TTL_MS });

    return base64;
  } catch (err) {
    console.warn(`[avatarFetcher] Failed to fetch avatar (${avatarUrl}): ${err.message}. Using placeholder.`);
    return PLACEHOLDER_BASE64;
  }
}

module.exports = { fetchAvatarAsBase64 };
