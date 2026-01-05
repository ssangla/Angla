// ============================================================================
// Prompt Optimizer App - Core Type Definitions
// ============================================================================

// ----------------------------------------------------------------------------
// Enums
// ----------------------------------------------------------------------------

export enum PromptCategory {
  DOCUMENTATION = 'documentation',
  USER_MANUAL = 'user_manual',
  INSTRUCTIONAL_GUIDE = 'instructional_guide',
  TECHNICAL_BLOG = 'technical_blog',
  RESEARCH_PAPER = 'research_paper',
  API_DOCUMENTATION = 'api_documentation',
  WHITEPAPER = 'whitepaper',
  TUTORIAL = 'tutorial',
  CASE_STUDY = 'case_study',
  OTHER = 'other',
}

export enum TechnicalDomain {
  SOFTWARE_DEVELOPMENT = 'software_development',
  DATA_SCIENCE = 'data_science',
  MACHINE_LEARNING = 'machine_learning',
  CLOUD_COMPUTING = 'cloud_computing',
  CYBERSECURITY = 'cybersecurity',
  DEVOPS = 'devops',
  WEB_DEVELOPMENT = 'web_development',
  MOBILE_DEVELOPMENT = 'mobile_development',
  BLOCKCHAIN = 'blockchain',
  IOT = 'iot',
  OTHER = 'other',
}

export enum PromptTone {
  FORMAL = 'formal',
  PROFESSIONAL = 'professional',
  CONVERSATIONAL = 'conversational',
  TECHNICAL = 'technical',
  EDUCATIONAL = 'educational',
  PERSUASIVE = 'persuasive',
}

export enum PromptLength {
  CONCISE = 'concise',
  MODERATE = 'moderate',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive',
}

export enum AudienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MIXED = 'mixed',
}

export enum ScoreLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  NEEDS_WORK = 'needs_work',
}

export enum IntegrationPlatform {
  GITHUB = 'github',
  GOOGLE_DOCS = 'google_docs',
  MEDIUM = 'medium',
  NOTION = 'notion',
  CONFLUENCE = 'confluence',
  MARKDOWN = 'markdown',
}

// ----------------------------------------------------------------------------
// Prompt Types
// ----------------------------------------------------------------------------

export interface Prompt {
  id: string;
  content: string;
  category: PromptCategory;
  domain: TechnicalDomain;
  tone: PromptTone;
  length: PromptLength;
  audienceLevel: AudienceLevel;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags: string[];
  metadata: PromptMetadata;
}

export interface PromptMetadata {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  readabilityScore: number;
  technicalTermsCount: number;
  questionsCount: number;
  hasCodeBlocks: boolean;
  hasExamples: boolean;
  hasConstraints: boolean;
}

export interface PromptInput {
  content: string;
  category?: PromptCategory;
  domain?: TechnicalDomain;
  context?: ContextualAnswers;
}

// ----------------------------------------------------------------------------
// Scoring Types
// ----------------------------------------------------------------------------

export interface PromptScore {
  overall: number;
  clarity: ScoreDimension;
  specificity: ScoreDimension;
  structure: ScoreDimension;
  context: ScoreDimension;
  actionability: ScoreDimension;
  completeness: ScoreDimension;
  level: ScoreLevel;
  timestamp: Date;
}

export interface ScoreDimension {
  score: number;
  level: ScoreLevel;
  feedback: string;
  suggestions: string[];
  weight: number;
}

export interface ScoreWeights {
  clarity: number;
  specificity: number;
  structure: number;
  context: number;
  actionability: number;
  completeness: number;
}

export interface ScoreHistory {
  promptId: string;
  scores: PromptScore[];
  improvement: number;
}

// ----------------------------------------------------------------------------
// Suggestion Types
// ----------------------------------------------------------------------------

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  example?: string;
  priority: SuggestionPriority;
  category: SuggestionCategory;
  appliedAt?: Date;
}

export enum SuggestionType {
  ENHANCEMENT = 'enhancement',
  RESTRUCTURE = 'restructure',
  CLARIFICATION = 'clarification',
  ADDITION = 'addition',
  REMOVAL = 'removal',
  ALTERNATIVE_FORMAT = 'alternative_format',
}

export enum SuggestionPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum SuggestionCategory {
  CLARITY = 'clarity',
  SPECIFICITY = 'specificity',
  STRUCTURE = 'structure',
  CONTEXT = 'context',
  TONE = 'tone',
  FORMAT = 'format',
}

export interface AlternativeFormat {
  id: string;
  name: string;
  description: string;
  template: string;
  category: PromptCategory;
  example: string;
  icon: string;
}

export interface OptimizedPrompt {
  original: string;
  optimized: string;
  score: PromptScore;
  suggestions: Suggestion[];
  alternativeFormats: AlternativeFormat[];
  refinementOptions: RefinementOptions;
}

// ----------------------------------------------------------------------------
// Refinement Types
// ----------------------------------------------------------------------------

export interface RefinementOptions {
  tone: PromptTone;
  length: PromptLength;
  audienceLevel: AudienceLevel;
  includeExamples: boolean;
  includeConstraints: boolean;
  includeContext: boolean;
  structureFormat: StructureFormat;
}

export enum StructureFormat {
  FREEFORM = 'freeform',
  NUMBERED_LIST = 'numbered_list',
  BULLET_POINTS = 'bullet_points',
  SECTIONS = 'sections',
  TEMPLATE_BASED = 'template_based',
}

export interface RefinementAction {
  type: RefinementActionType;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export enum RefinementActionType {
  CHANGE_TONE = 'change_tone',
  CHANGE_LENGTH = 'change_length',
  CHANGE_AUDIENCE = 'change_audience',
  ADD_EXAMPLES = 'add_examples',
  ADD_CONSTRAINTS = 'add_constraints',
  RESTRUCTURE = 'restructure',
  APPLY_SUGGESTION = 'apply_suggestion',
  UNDO = 'undo',
  REDO = 'redo',
}

// ----------------------------------------------------------------------------
// Contextual Questions Types
// ----------------------------------------------------------------------------

export interface ContextualQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuestionOption[];
  condition?: QuestionCondition;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  category: QuestionCategory;
  order: number;
}

export enum QuestionType {
  SINGLE_SELECT = 'single_select',
  MULTI_SELECT = 'multi_select',
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SCALE = 'scale',
  BOOLEAN = 'boolean',
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
  value: string | string[];
}

export enum QuestionCategory {
  AUDIENCE = 'audience',
  PURPOSE = 'purpose',
  SCOPE = 'scope',
  FORMAT = 'format',
  CONSTRAINTS = 'constraints',
}

export interface ContextualAnswers {
  [questionId: string]: string | string[] | boolean | number;
}

// ----------------------------------------------------------------------------
// User Types
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  integrations: UserIntegration[];
  createdAt: Date;
  lastLoginAt: Date;
}

export enum UserRole {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultCategory: PromptCategory;
  defaultTone: PromptTone;
  defaultAudienceLevel: AudienceLevel;
  autoSave: boolean;
  showSuggestions: boolean;
  enableCollaboration: boolean;
}

export interface UserIntegration {
  platform: IntegrationPlatform;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  settings: Record<string, unknown>;
}

// ----------------------------------------------------------------------------
// Collaboration Types
// ----------------------------------------------------------------------------

export interface CollaborationSession {
  id: string;
  promptId: string;
  ownerId: string;
  participants: Collaborator[];
  status: CollaborationStatus;
  createdAt: Date;
  expiresAt: Date;
}

export interface Collaborator {
  userId: string;
  name: string;
  avatar?: string;
  role: CollaboratorRole;
  cursor?: CursorPosition;
  isActive: boolean;
  joinedAt: Date;
}

export enum CollaboratorRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum CollaborationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: TextSelection;
}

export interface TextSelection {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface CollaborationEvent {
  type: CollaborationEventType;
  userId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export enum CollaborationEventType {
  JOIN = 'join',
  LEAVE = 'leave',
  CURSOR_MOVE = 'cursor_move',
  TEXT_CHANGE = 'text_change',
  SELECTION_CHANGE = 'selection_change',
  SUGGESTION_APPLY = 'suggestion_apply',
}

// ----------------------------------------------------------------------------
// API Types
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PromptAnalysisRequest {
  content: string;
  category?: PromptCategory;
  domain?: TechnicalDomain;
  context?: ContextualAnswers;
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  includeAlternatives: boolean;
  maxSuggestions: number;
  targetScore: number;
}

export interface PromptAnalysisResponse {
  prompt: Prompt;
  score: PromptScore;
  optimizedPrompt: OptimizedPrompt;
  processingTime: number;
}

// ----------------------------------------------------------------------------
// Component Props Types
// ----------------------------------------------------------------------------

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showLineNumbers?: boolean;
  enableSyntaxHighlight?: boolean;
}

export interface ScorePanelProps {
  score: PromptScore | null;
  isLoading?: boolean;
  showDetails?: boolean;
  onDimensionClick?: (dimension: keyof PromptScore) => void;
}

export interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  alternativeFormats: AlternativeFormat[];
  onApplySuggestion: (suggestion: Suggestion) => void;
  onSelectFormat: (format: AlternativeFormat) => void;
  isLoading?: boolean;
}

export interface RefinementPanelProps {
  options: RefinementOptions;
  onChange: (options: RefinementOptions) => void;
  onApply: () => void;
  disabled?: boolean;
}

export interface ContextualQuestionsProps {
  questions: ContextualQuestion[];
  answers: ContextualAnswers;
  onAnswer: (questionId: string, answer: ContextualAnswers[string]) => void;
  onComplete: () => void;
  currentStep: number;
}

// ----------------------------------------------------------------------------
// Store Types
// ----------------------------------------------------------------------------

export interface AppState {
  prompt: PromptState;
  score: ScoreState;
  suggestions: SuggestionsState;
  refinement: RefinementState;
  user: UserState;
  collaboration: CollaborationState;
  ui: UIState;
}

export interface PromptState {
  current: Prompt | null;
  history: Prompt[];
  isLoading: boolean;
  error: string | null;
}

export interface ScoreState {
  current: PromptScore | null;
  history: ScoreHistory[];
  isAnalyzing: boolean;
}

export interface SuggestionsState {
  items: Suggestion[];
  alternativeFormats: AlternativeFormat[];
  isLoading: boolean;
}

export interface RefinementState {
  options: RefinementOptions;
  history: RefinementAction[];
  canUndo: boolean;
  canRedo: boolean;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface CollaborationState {
  session: CollaborationSession | null;
  events: CollaborationEvent[];
  isConnected: boolean;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activePanel: 'suggestions' | 'refinement' | 'history' | 'collaboration';
  modals: {
    settings: boolean;
    export: boolean;
    share: boolean;
    templates: boolean;
  };
}

// ----------------------------------------------------------------------------
// Utility Types
// ----------------------------------------------------------------------------

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};
