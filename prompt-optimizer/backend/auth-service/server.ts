// ============================================================================
// Auth Service - Authentication and Authorization Microservice
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'free' | 'pro' | 'team' | 'enterprise' | 'admin';
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory storage (replace with actual database in production)
const users: Map<string, User> = new Map();
const sessions: Map<string, Session> = new Map();
const refreshTokens: Map<string, RefreshToken> = new Map();
const emailIndex: Map<string, string> = new Map(); // email -> userId

// Configuration
const config = {
  port: process.env.PORT || 3003,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
  sessionDuration: 60 * 60 * 1000, // 1 hour
  refreshDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Auth] ${req.method} ${req.path} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// ============================================================================
// Helper Functions
// ============================================================================

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + config.jwtSecret).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(userId: string): { accessToken: string; refreshToken: string; expiresIn: number } {
  const accessToken = generateToken();
  const refreshToken = generateToken();

  const session: Session = {
    id: uuidv4(),
    userId,
    token: accessToken,
    expiresAt: new Date(Date.now() + config.sessionDuration),
    createdAt: new Date(),
  };

  const refresh: RefreshToken = {
    id: uuidv4(),
    userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + config.refreshDuration),
    createdAt: new Date(),
  };

  sessions.set(accessToken, session);
  refreshTokens.set(refreshToken, refresh);

  return {
    accessToken,
    refreshToken,
    expiresIn: config.sessionDuration / 1000,
  };
}

function validateSession(token: string): User | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (new Date() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return users.get(session.userId) || null;
}

// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.substring(7);
  const user = validateSession(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }

  (req as any).user = user;
  next();
}

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    stats: {
      totalUsers: users.size,
      activeSessions: sessions.size,
    },
  });
});

// Register
app.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email, password, and name are required',
        },
      });
    }

    if (emailIndex.has(email.toLowerCase())) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters',
        },
      });
    }

    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      name,
      passwordHash: hashPassword(password),
      role: 'free',
      preferences: {
        theme: 'light',
        autoSave: true,
        showSuggestions: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    };

    users.set(user.id, user);
    emailIndex.set(user.email, user.id);

    const tokens = createSession(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTER_ERROR',
        message: 'Failed to register user',
      },
    });
  }
});

// Login
app.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Email and password are required',
        },
      });
    }

    const userId = emailIndex.get(email.toLowerCase());
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const user = users.get(userId);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    users.set(user.id, user);

    const tokens = createSession(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to login',
      },
    });
  }
});

// Refresh token
app.post('/auth/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Refresh token is required',
        },
      });
    }

    const refresh = refreshTokens.get(token);
    if (!refresh || new Date() > refresh.expiresAt) {
      if (refresh) refreshTokens.delete(token);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
    }

    // Delete old refresh token
    refreshTokens.delete(token);

    // Create new session
    const tokens = createSession(refresh.userId);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ERROR',
        message: 'Failed to refresh token',
      },
    });
  }
});

// Logout
app.post('/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      sessions.delete(token);
    }

    res.json({
      success: true,
      data: { loggedOut: true },
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'Failed to logout',
      },
    });
  }
});

// Get current user
app.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

// Update user
app.put('/auth/me', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { name, preferences } = req.body;

    if (name) user.name = name;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    user.updatedAt = new Date();

    users.set(user.id, user);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update user',
      },
    });
  }
});

// Change password
app.post('/auth/change-password', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Current and new passwords are required',
        },
      });
    }

    if (user.passwordHash !== hashPassword(currentPassword)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect',
        },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters',
        },
      });
    }

    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date();
    users.set(user.id, user);

    // Invalidate all existing sessions
    for (const [token, session] of sessions.entries()) {
      if (session.userId === user.id) {
        sessions.delete(token);
      }
    }

    // Create new session
    const tokens = createSession(user.id);

    res.json({
      success: true,
      data: {
        message: 'Password changed successfully',
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_ERROR',
        message: 'Failed to change password',
      },
    });
  }
});

// Validate token (for other services)
app.post('/auth/validate', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Token is required',
        },
      });
    }

    const user = validateSession(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Validate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate token',
      },
    });
  }
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(config.port, () => {
  console.log(`[Auth Service] Running on port ${config.port}`);
});

export default app;
