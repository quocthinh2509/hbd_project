require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const apiRouter = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Security & logging middleware ───────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ─── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler (MUST be last) ───────────────────────
app.use(errorHandler);

// ─── Start server ───────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`╔════════════════════════════════════════════════╗`);
    console.log(`║  Birthday Card API Server                      ║`);
    console.log(`║  http://localhost:${PORT}/api/v1                 ║`);
    console.log(`║  Environment: ${process.env.NODE_ENV || 'development'}                   ║`);
    console.log(`╚════════════════════════════════════════════════╝`);
  });
}

module.exports = app;
