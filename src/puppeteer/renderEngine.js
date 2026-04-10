const { Cluster } = require('puppeteer-cluster');

let cluster = null;

/**
 * Initialize the Puppeteer cluster pool.
 * Call this once at application startup.
 */
async function initRenderEngine() {
  if (cluster) return;

  const concurrency = parseInt(process.env.PUPPETEER_CONCURRENCY) || 3;
  const timeout = parseInt(process.env.PUPPETEER_TIMEOUT_MS) || 30000;

  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: concurrency,
    timeout,
    puppeteerOptions: {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    },
    monitor: false,
    retryLimit: 0,
  });

  // Define the task: receive { html, cardWidth, cardHeight } → return PNG buffer
  await cluster.task(async ({ page, data: { html, cardWidth, cardHeight } }) => {
    await page.setViewport({
      width: cardWidth,
      height: cardHeight,
      deviceScaleFactor: 2, // Retina quality
    });

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

    const buffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: cardWidth, height: cardHeight },
      omitBackground: false,
    });

    return buffer;
  });

  console.log(`[renderEngine] Puppeteer cluster started with ${concurrency} workers`);
}

/**
 * Render HTML to PNG buffer using the cluster pool.
 * @param {string} html - Complete HTML string
 * @param {number} cardWidth - Width in px
 * @param {number} cardHeight - Height in px
 * @returns {Promise<Buffer>} PNG buffer
 */
async function renderHtmlToPng(html, cardWidth, cardHeight) {
  if (!cluster) {
    await initRenderEngine();
  }

  const buffer = await cluster.execute({ html, cardWidth, cardHeight });
  return buffer;
}

/**
 * Gracefully close the cluster. Call on app shutdown.
 */
async function closeRenderEngine() {
  if (cluster) {
    await cluster.idle();
    await cluster.close();
    cluster = null;
    console.log('[renderEngine] Cluster closed');
  }
}

module.exports = { initRenderEngine, renderHtmlToPng, closeRenderEngine };
