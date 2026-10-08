import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import analysisRoutes from './routes/analysisRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / curl (no Origin header) and the configured client origins
      if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    }
  })
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.json({ limit: '10kb' }));

// Simple in-memory rate limiter (per IP) to protect the GitHub and Gemini quotas
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 15;
const hits = new Map();

const rateLimiter = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }

  entry.count += 1;
  if (entry.count > RATE_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a minute and try again.'
    });
  }
  return next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}, RATE_WINDOW_MS).unref();

// API Routes
app.use('/api/analysis', rateLimiter, analysisRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    githubToken: Boolean(config.githubToken),
    gemini: Boolean(config.geminiApiKey)
  });
});

app.use('/api', notFoundHandler);
app.use(errorHandler);

if (!config.githubToken) {
  console.warn('[Config] GITHUB_TOKEN missing: GitHub allows only 60 requests/hour without it.');
}
if (!config.geminiApiKey) {
  console.warn('[Config] GEMINI_API_KEY missing: AI analysis disabled, using deterministic fallback.');
}

const server = app.listen(config.port, () => {
  console.log(`Roast & Rescue Backend running on http://localhost:${config.port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Change PORT in .env (and the proxy in client/vite.config.js).`);
  } else {
    console.error('[Server Error]', err);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});
