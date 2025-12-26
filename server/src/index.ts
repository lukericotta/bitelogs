import express from 'express';
import cors from 'cors';
import { createPool } from './db';
import { config } from './config';
import { errorHandler, securityHeaders, apiLimiter } from './middleware';
import { logger } from './utils';
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

// Security middleware
app.use(securityHeaders());

// CORS configuration - allow all origins for API
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'BiteLogs API', 
    version: '1.0.0',
    health: '/api/health',
    docs: 'See /api/health for status'
  });
});

app.use('/api', initHealthRoutes(pool));
app.use('/api/auth', initAuthRoutes(pool));
app.use('/api/restaurants', initRestaurantRoutes(pool));
app.use('/api/menu-items', initMenuItemRoutes(pool));
app.use('/api/reviews', initReviewRoutes(pool));
app.use('/api/discover', initDiscoveryRoutes(pool));

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
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
