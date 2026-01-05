// ============================================================================
// API Gateway - Main Entry Point for Microservices
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const config = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  services: {
    nlp: process.env.NLP_SERVICE_URL || 'http://localhost:3001',
    data: process.env.DATA_SERVICE_URL || 'http://localhost:3002',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3003',
    integration: process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3004',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};

// Initialize Express App
const app = express();

// ============================================================================
// Middleware
// ============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS
app.use(cors(config.cors));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
});
app.use('/api', limiter);

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  res.setHeader('x-request-id', req.headers['x-request-id'] as string);
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// ============================================================================
// Health Check
// ============================================================================

app.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: [
      { name: 'gateway', status: 'healthy', latency: 0 },
    ],
  };
  res.json(health);
});

app.get('/ready', (req: Request, res: Response) => {
  res.json({ ready: true });
});

// ============================================================================
// Service Proxies
// ============================================================================

// NLP Service - Prompt Analysis
app.use(
  '/api/v1/analyze',
  createProxyMiddleware({
    target: config.services.nlp,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/analyze': '/analyze' },
    onError: (err, req, res) => {
      console.error('NLP Service Error:', err);
      (res as Response).status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'NLP service is temporarily unavailable',
        },
      });
    },
  })
);

// Data Service - Prompts & History
app.use(
  '/api/v1/prompts',
  createProxyMiddleware({
    target: config.services.data,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/prompts': '/prompts' },
    onError: (err, req, res) => {
      console.error('Data Service Error:', err);
      (res as Response).status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Data service is temporarily unavailable',
        },
      });
    },
  })
);

// Auth Service - Authentication & Authorization
app.use(
  '/api/v1/auth',
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/auth': '/auth' },
    onError: (err, req, res) => {
      console.error('Auth Service Error:', err);
      (res as Response).status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Authentication service is temporarily unavailable',
        },
      });
    },
  })
);

// Integration Service - External Platforms
app.use(
  '/api/v1/integrations',
  createProxyMiddleware({
    target: config.services.integration,
    changeOrigin: true,
    pathRewrite: { '^/api/v1/integrations': '/integrations' },
    onError: (err, req, res) => {
      console.error('Integration Service Error:', err);
      (res as Response).status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Integration service is temporarily unavailable',
        },
      });
    },
  })
);

// ============================================================================
// Direct Routes (Gateway-level)
// ============================================================================

// API Documentation
app.get('/api/v1/docs', (req: Request, res: Response) => {
  res.json({
    name: 'Prompt Optimizer API',
    version: '1.0.0',
    description: 'API for optimizing technical writing prompts',
    endpoints: {
      analyze: {
        method: 'POST',
        path: '/api/v1/analyze',
        description: 'Analyze and score a prompt',
      },
      prompts: {
        method: 'GET/POST',
        path: '/api/v1/prompts',
        description: 'Manage saved prompts',
      },
      auth: {
        method: 'POST',
        path: '/api/v1/auth/*',
        description: 'Authentication endpoints',
      },
      integrations: {
        method: 'GET/POST',
        path: '/api/v1/integrations',
        description: 'External platform integrations',
      },
    },
  });
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      ...(config.env === 'development' && { stack: err.stack }),
    },
  });
});

// ============================================================================
// Server Startup
// ============================================================================

const server = app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                  PROMPT OPTIMIZER API                    ║
╠══════════════════════════════════════════════════════════╣
║  Gateway running on port ${config.port}                           ║
║  Environment: ${config.env.padEnd(41)}║
╠══════════════════════════════════════════════════════════╣
║  Services:                                               ║
║  - NLP:         ${config.services.nlp.padEnd(39)}║
║  - Data:        ${config.services.data.padEnd(39)}║
║  - Auth:        ${config.services.auth.padEnd(39)}║
║  - Integration: ${config.services.integration.padEnd(39)}║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
