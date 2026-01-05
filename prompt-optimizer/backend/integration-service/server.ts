// ============================================================================
// Integration Service - External Platform Integrations Microservice
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Types
interface Integration {
  id: string;
  userId: string;
  platform: 'github' | 'google_docs' | 'notion' | 'confluence' | 'medium';
  enabled: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface ExportJob {
  id: string;
  userId: string;
  promptId: string;
  platform: string;
  format: 'markdown' | 'html' | 'pdf' | 'docx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    url?: string;
    content?: string;
    error?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

// In-memory storage
const integrations: Map<string, Integration> = new Map();
const userIntegrations: Map<string, string[]> = new Map();
const exportJobs: Map<string, ExportJob> = new Map();

// Configuration
const config = {
  port: process.env.PORT || 3004,
  env: process.env.NODE_ENV || 'development',
  platforms: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
    },
    google_docs: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
    },
    notion: {
      clientId: process.env.NOTION_CLIENT_ID || '',
      clientSecret: process.env.NOTION_CLIENT_SECRET || '',
      authUrl: 'https://api.notion.com/v1/oauth/authorize',
      tokenUrl: 'https://api.notion.com/v1/oauth/token',
    },
  },
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[Integration] ${req.method} ${req.path} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// ============================================================================
// Helper Functions
// ============================================================================

function convertToMarkdown(content: string): string {
  // Basic conversion - in production, use a proper markdown converter
  return content;
}

function convertToHtml(content: string): string {
  // Basic markdown to HTML conversion
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gm, '<em>$1</em>')
    .replace(/`([^`]+)`/gm, '<code>$1</code>')
    .replace(/\n/gm, '<br>');
}

async function processExportJob(job: ExportJob, content: string): Promise<void> {
  job.status = 'processing';
  exportJobs.set(job.id, job);

  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let exportedContent: string;
    switch (job.format) {
      case 'html':
        exportedContent = convertToHtml(content);
        break;
      case 'markdown':
      default:
        exportedContent = convertToMarkdown(content);
        break;
    }

    job.status = 'completed';
    job.result = {
      content: exportedContent,
      url: `https://example.com/exports/${job.id}`,
    };
    job.completedAt = new Date();
  } catch (error) {
    job.status = 'failed';
    job.result = {
      error: 'Export failed',
    };
    job.completedAt = new Date();
  }

  exportJobs.set(job.id, job);
}

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'integration-service',
    timestamp: new Date().toISOString(),
    stats: {
      totalIntegrations: integrations.size,
      activeJobs: Array.from(exportJobs.values()).filter(j => j.status === 'processing').length,
    },
  });
});

// List available platforms
app.get('/integrations/platforms', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'github',
        name: 'GitHub',
        description: 'Export prompts and documentation to GitHub repositories',
        icon: 'github',
        features: ['gist', 'repository', 'wiki'],
      },
      {
        id: 'google_docs',
        name: 'Google Docs',
        description: 'Export prompts to Google Docs for collaboration',
        icon: 'file-text',
        features: ['document', 'folder'],
      },
      {
        id: 'notion',
        name: 'Notion',
        description: 'Export prompts to Notion pages and databases',
        icon: 'database',
        features: ['page', 'database'],
      },
      {
        id: 'confluence',
        name: 'Confluence',
        description: 'Export prompts to Atlassian Confluence',
        icon: 'book',
        features: ['page', 'space'],
      },
      {
        id: 'medium',
        name: 'Medium',
        description: 'Publish prompts as Medium articles',
        icon: 'edit',
        features: ['article', 'draft'],
      },
    ],
  });
});

// Get user integrations
app.get('/integrations', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'userId is required',
        },
      });
    }

    const userIntegrationIds = userIntegrations.get(userId) || [];
    const userIntegrationList = userIntegrationIds
      .map(id => integrations.get(id))
      .filter(Boolean)
      .map(i => ({
        id: i!.id,
        platform: i!.platform,
        enabled: i!.enabled,
        settings: i!.settings,
        createdAt: i!.createdAt,
      }));

    res.json({
      success: true,
      data: userIntegrationList,
    });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch integrations',
      },
    });
  }
});

// Initiate OAuth connection
app.post('/integrations/connect', (req: Request, res: Response) => {
  try {
    const { userId, platform } = req.body;

    if (!userId || !platform) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'userId and platform are required',
        },
      });
    }

    const platformConfig = config.platforms[platform as keyof typeof config.platforms];
    if (!platformConfig) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLATFORM',
          message: 'Unsupported platform',
        },
      });
    }

    // Generate state for OAuth
    const state = uuidv4();

    // In production, build actual OAuth URL
    const authUrl = `${platformConfig.authUrl}?client_id=${platformConfig.clientId}&state=${state}&redirect_uri=http://localhost:3000/auth/callback/${platform}`;

    res.json({
      success: true,
      data: {
        authUrl,
        state,
      },
    });
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONNECT_ERROR',
        message: 'Failed to initiate connection',
      },
    });
  }
});

// OAuth callback (simulated)
app.post('/integrations/callback', (req: Request, res: Response) => {
  try {
    const { userId, platform, code, state } = req.body;

    if (!userId || !platform || !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'userId, platform, and code are required',
        },
      });
    }

    // In production, exchange code for tokens
    const integration: Integration = {
      id: uuidv4(),
      userId,
      platform: platform as Integration['platform'],
      enabled: true,
      accessToken: 'simulated-access-token-' + uuidv4(),
      refreshToken: 'simulated-refresh-token-' + uuidv4(),
      expiresAt: new Date(Date.now() + 3600000),
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    integrations.set(integration.id, integration);

    const userIntegrationIds = userIntegrations.get(userId) || [];
    userIntegrationIds.push(integration.id);
    userIntegrations.set(userId, userIntegrationIds);

    res.json({
      success: true,
      data: {
        id: integration.id,
        platform: integration.platform,
        enabled: integration.enabled,
      },
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALLBACK_ERROR',
        message: 'Failed to complete connection',
      },
    });
  }
});

// Disconnect integration
app.delete('/integrations/:id', (req: Request, res: Response) => {
  try {
    const integration = integrations.get(req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Integration not found',
        },
      });
    }

    integrations.delete(req.params.id);

    const userIntegrationIds = userIntegrations.get(integration.userId);
    if (userIntegrationIds) {
      const index = userIntegrationIds.indexOf(req.params.id);
      if (index > -1) {
        userIntegrationIds.splice(index, 1);
        userIntegrations.set(integration.userId, userIntegrationIds);
      }
    }

    res.json({
      success: true,
      data: { disconnected: true },
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DISCONNECT_ERROR',
        message: 'Failed to disconnect integration',
      },
    });
  }
});

// Export prompt
app.post('/integrations/export', (req: Request, res: Response) => {
  try {
    const { userId, promptId, platform, format, content, settings } = req.body;

    if (!userId || !promptId || !platform || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'userId, promptId, platform, and content are required',
        },
      });
    }

    const job: ExportJob = {
      id: uuidv4(),
      userId,
      promptId,
      platform,
      format: format || 'markdown',
      status: 'pending',
      createdAt: new Date(),
    };

    exportJobs.set(job.id, job);

    // Process export asynchronously
    processExportJob(job, content);

    res.status(202).json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to start export',
      },
    });
  }
});

// Get export job status
app.get('/integrations/export/:jobId', (req: Request, res: Response) => {
  try {
    const job = exportJobs.get(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Export job not found',
        },
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Get export error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch export job',
      },
    });
  }
});

// List export jobs
app.get('/integrations/exports', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'userId is required',
        },
      });
    }

    const userJobs = Array.from(exportJobs.values())
      .filter(j => j.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      success: true,
      data: userJobs,
    });
  } catch (error) {
    console.error('List exports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch export jobs',
      },
    });
  }
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(config.port, () => {
  console.log(`[Integration Service] Running on port ${config.port}`);
});

export default app;
