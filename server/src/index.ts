import express from 'express';
import cors from 'cors';
import path from 'path';
import { createPool } from './db';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { 
  securityHeaders, 
  generalRateLimiter, 
  authRateLimiter,
  additionalSecurityHeaders 
} from './middleware/security';
import { logger } from './utils/logger';
import {
  initHealthRoutes,
  initAuthRoutes,
  initRestaurantRoutes,
  initMenuItemRoutes,
  initReviewRoutes,
  initDiscoveryRoutes,
} from './routes';

const app = express();
const pool = createPool();

// Security middleware (apply first)
app.use(securityHeaders());
app.use(additionalSecurityHeaders);

// General middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Apply general rate limiting to all API routes
app.use('/api', generalRateLimiter);

// Routes
app.use('/api', initHealthRoutes(pool));
// Apply stricter rate limiting to auth routes
app.use('/api/auth', authRateLimiter, initAuthRoutes(pool));
app.use('/api/restaurants', initRestaurantRoutes(pool));
app.use('/api/menu-items', initMenuItemRoutes(pool));
app.use('/api/reviews', initReviewRoutes(pool));
app.use('/api/discover', initDiscoveryRoutes(pool));

// Serve static frontend in production
if (config.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  
  // Serve static files
  app.use(express.static(clientDistPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    logger.info('Database connected');

    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info('Security middleware enabled: helmet, rate limiting');
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
