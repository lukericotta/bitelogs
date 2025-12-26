import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
// FIX: Only import from shared, don't redefine locally
import { HealthStatus } from '@bitelogs/shared';

const router = Router();

// Store pool reference
let pool: Pool;

export const initHealthRoutes = (dbPool: Pool): Router => {
  pool = dbPool;
  return router;
};

// GET /api/health - Full health check with database status
router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const health: HealthStatus = {
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: process.env.npm_package_version || '1.0.0',
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// GET /api/live - Kubernetes liveness probe
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// GET /api/ready - Kubernetes readiness probe
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
  }
});

export default router;
