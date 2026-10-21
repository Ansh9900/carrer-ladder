import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import compression from 'compression';
import { apiRouter } from './server/routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Gzip / Brotli compression for all JSON and static responses
  app.use(compression({
    level: 6,
    threshold: 1024 // Only compress responses larger than 1KB
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // High-performance health check for Render keep-alive and pingers
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API router
  app.use('/api', apiRouter);

  if (!isProduction) {
    // Development mode with Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving with aggressive browser caching for bundled assets
    const distPath = path.resolve(__dirname, 'dist');
    
    // Immutable cache for fingerprinted Vite assets (JS/CSS/images)
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '7d',
      immutable: true
    }));

    // Standard static serving for other files (favicon, manifest, etc.)
    app.use(express.static(distPath, {
      maxAge: '1h'
    }));

    // SPA fallback: index.html should not be cached indefinitely
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Ladder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
