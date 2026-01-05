// ============================================================================
// Data Service - Prompt Storage and Retrieval Microservice
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Prompt {
  id: string;
  userId: string;
  content: string;
  category: string;
  domain: string;
  score: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface PromptHistory {
  id: string;
  promptId: string;
  content: string;
  score: number;
  timestamp: Date;
}

// In-memory storage (replace with actual database in production)
const prompts: Map<string, Prompt> = new Map();
const promptHistory: Map<string, PromptHistory[]> = new Map();
const userPrompts: Map<string, string[]> = new Map();

// Configuration
const config = {
  port: process.env.PORT || 3002,
  env: process.env.NODE_ENV || 'development',
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Data] ${req.method} ${req.path} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'data-service',
    timestamp: new Date().toISOString(),
    stats: {
      totalPrompts: prompts.size,
      totalUsers: userPrompts.size,
    },
  });
});

// Create a new prompt
app.post('/prompts', (req: Request, res: Response) => {
  try {
    const { userId, content, category, domain, score, metadata } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'userId and content are required',
        },
      });
    }

    const prompt: Prompt = {
      id: uuidv4(),
      userId,
      content,
      category: category || 'other',
      domain: domain || 'other',
      score: score || 0,
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prompts.set(prompt.id, prompt);

    // Update user prompts index
    const userPromptList = userPrompts.get(userId) || [];
    userPromptList.push(prompt.id);
    userPrompts.set(userId, userPromptList);

    // Initialize history
    promptHistory.set(prompt.id, [{
      id: uuidv4(),
      promptId: prompt.id,
      content: prompt.content,
      score: prompt.score,
      timestamp: new Date(),
    }]);

    res.status(201).json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create prompt',
      },
    });
  }
});

// Get all prompts (with pagination)
app.get('/prompts', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId as string;

    let promptIds: string[];
    if (userId) {
      promptIds = userPrompts.get(userId) || [];
    } else {
      promptIds = Array.from(prompts.keys());
    }

    const total = promptIds.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedIds = promptIds.slice(start, end);
    const items = paginatedIds.map(id => prompts.get(id)).filter(Boolean);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        hasMore: end < total,
      },
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch prompts',
      },
    });
  }
});

// Get a specific prompt
app.get('/prompts/:id', (req: Request, res: Response) => {
  try {
    const prompt = prompts.get(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prompt not found',
        },
      });
    }

    res.json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch prompt',
      },
    });
  }
});

// Update a prompt
app.put('/prompts/:id', (req: Request, res: Response) => {
  try {
    const prompt = prompts.get(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prompt not found',
        },
      });
    }

    const { content, category, domain, score, metadata } = req.body;

    // Store in history before updating
    const history = promptHistory.get(prompt.id) || [];
    history.push({
      id: uuidv4(),
      promptId: prompt.id,
      content: prompt.content,
      score: prompt.score,
      timestamp: new Date(),
    });
    promptHistory.set(prompt.id, history);

    // Update prompt
    const updatedPrompt: Prompt = {
      ...prompt,
      content: content ?? prompt.content,
      category: category ?? prompt.category,
      domain: domain ?? prompt.domain,
      score: score ?? prompt.score,
      metadata: { ...prompt.metadata, ...(metadata || {}) },
      updatedAt: new Date(),
    };

    prompts.set(prompt.id, updatedPrompt);

    res.json({
      success: true,
      data: updatedPrompt,
    });
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update prompt',
      },
    });
  }
});

// Delete a prompt
app.delete('/prompts/:id', (req: Request, res: Response) => {
  try {
    const prompt = prompts.get(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prompt not found',
        },
      });
    }

    prompts.delete(req.params.id);
    promptHistory.delete(req.params.id);

    // Remove from user index
    const userPromptList = userPrompts.get(prompt.userId);
    if (userPromptList) {
      const index = userPromptList.indexOf(req.params.id);
      if (index > -1) {
        userPromptList.splice(index, 1);
        userPrompts.set(prompt.userId, userPromptList);
      }
    }

    res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete prompt',
      },
    });
  }
});

// Get prompt history
app.get('/prompts/:id/history', (req: Request, res: Response) => {
  try {
    const history = promptHistory.get(req.params.id);

    if (!history) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Prompt history not found',
        },
      });
    }

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch history',
      },
    });
  }
});

// Search prompts
app.get('/prompts/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string)?.toLowerCase();
    const category = req.query.category as string;
    const domain = req.query.domain as string;

    if (!query && !category && !domain) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'At least one search parameter is required',
        },
      });
    }

    const results = Array.from(prompts.values()).filter(prompt => {
      let matches = true;
      if (query) {
        matches = matches && prompt.content.toLowerCase().includes(query);
      }
      if (category) {
        matches = matches && prompt.category === category;
      }
      if (domain) {
        matches = matches && prompt.domain === domain;
      }
      return matches;
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Failed to search prompts',
      },
    });
  }
});

// Get statistics
app.get('/stats', (req: Request, res: Response) => {
  try {
    const allPrompts = Array.from(prompts.values());
    const avgScore = allPrompts.reduce((sum, p) => sum + p.score, 0) / (allPrompts.length || 1);

    const categoryCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};

    allPrompts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalPrompts: prompts.size,
        totalUsers: userPrompts.size,
        averageScore: Math.round(avgScore * 100) / 100,
        categoryCounts,
        domainCounts,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch statistics',
      },
    });
  }
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(config.port, () => {
  console.log(`[Data Service] Running on port ${config.port}`);
});

export default app;
