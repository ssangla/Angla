// ============================================================================
// Shared Backend Types
// ============================================================================

// Common API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  processingTime: number;
  version: string;
}

// Health Check
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin',
}

// Prompt Types
export interface Prompt {
  id: string;
  userId: string;
  content: string;
  category: string;
  domain: string;
  metadata: PromptMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptMetadata {
  wordCount: number;
  characterCount: number;
  technicalTermsCount: number;
  hasCodeBlocks: boolean;
  hasExamples: boolean;
}

// Analysis Types
export interface AnalysisRequest {
  content: string;
  category?: string;
  domain?: string;
  userId?: string;
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  includeAlternatives: boolean;
  maxSuggestions: number;
  targetScore: number;
}

export interface AnalysisResult {
  promptId: string;
  score: PromptScore;
  suggestions: Suggestion[];
  optimizedPrompt: string;
  processingTime: number;
}

export interface PromptScore {
  overall: number;
  clarity: number;
  specificity: number;
  structure: number;
  context: number;
  actionability: number;
  completeness: number;
  level: ScoreLevel;
}

export enum ScoreLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  NEEDS_WORK = 'needs_work',
}

export interface Suggestion {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  example?: string;
}

// Event Types (for message queue)
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: string;
  correlationId?: string;
}

export interface PromptAnalyzedEvent extends BaseEvent {
  eventType: 'prompt.analyzed';
  payload: {
    promptId: string;
    userId: string;
    score: PromptScore;
  };
}

export interface UserCreatedEvent extends BaseEvent {
  eventType: 'user.created';
  payload: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export type DomainEvent = PromptAnalyzedEvent | UserCreatedEvent;

// Integration Types
export interface IntegrationConfig {
  platform: string;
  enabled: boolean;
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface ExportRequest {
  promptId: string;
  format: ExportFormat;
  destination: IntegrationPlatform;
}

export enum ExportFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  PDF = 'pdf',
  DOCX = 'docx',
}

export enum IntegrationPlatform {
  GITHUB = 'github',
  GOOGLE_DOCS = 'google_docs',
  NOTION = 'notion',
  CONFLUENCE = 'confluence',
  MEDIUM = 'medium',
}
