// ============================================================================
// NLP Service - Natural Language Processing for Prompt Analysis
// ============================================================================

import {
  PromptMetadata,
  ScoreLevel,
  TechnicalDomain,
  PromptCategory,
} from '@/types';

// ----------------------------------------------------------------------------
// Text Analysis Utilities
// ----------------------------------------------------------------------------

export interface TextAnalysisResult {
  metadata: PromptMetadata;
  entities: ExtractedEntity[];
  keyPhrases: string[];
  technicalTerms: string[];
  sentiment: SentimentResult;
  structure: StructureAnalysis;
}

export interface ExtractedEntity {
  text: string;
  type: EntityType;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export enum EntityType {
  TECHNOLOGY = 'technology',
  LANGUAGE = 'language',
  FRAMEWORK = 'framework',
  CONCEPT = 'concept',
  ACTION = 'action',
  CONSTRAINT = 'constraint',
  AUDIENCE = 'audience',
}

export interface SentimentResult {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  aspects: AspectSentiment[];
}

export interface AspectSentiment {
  aspect: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface StructureAnalysis {
  hasIntroduction: boolean;
  hasContext: boolean;
  hasObjective: boolean;
  hasConstraints: boolean;
  hasExamples: boolean;
  hasOutputFormat: boolean;
  sections: PromptSection[];
}

export interface PromptSection {
  type: SectionType;
  content: string;
  startLine: number;
  endLine: number;
}

export enum SectionType {
  CONTEXT = 'context',
  OBJECTIVE = 'objective',
  CONSTRAINTS = 'constraints',
  EXAMPLES = 'examples',
  OUTPUT_FORMAT = 'output_format',
  ADDITIONAL_INFO = 'additional_info',
}

// ----------------------------------------------------------------------------
// Technical Terms Dictionary
// ----------------------------------------------------------------------------

const TECHNICAL_TERMS: Record<TechnicalDomain, string[]> = {
  [TechnicalDomain.SOFTWARE_DEVELOPMENT]: [
    'api', 'sdk', 'framework', 'library', 'module', 'function', 'class',
    'interface', 'abstraction', 'encapsulation', 'polymorphism', 'inheritance',
    'design pattern', 'architecture', 'microservices', 'monolith', 'crud',
    'rest', 'graphql', 'websocket', 'database', 'sql', 'nosql', 'orm',
    'testing', 'unit test', 'integration test', 'ci/cd', 'deployment',
    'version control', 'git', 'repository', 'branch', 'merge', 'commit',
  ],
  [TechnicalDomain.DATA_SCIENCE]: [
    'dataset', 'feature', 'label', 'training', 'validation', 'testing',
    'preprocessing', 'normalization', 'standardization', 'encoding',
    'visualization', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly',
    'statistical analysis', 'correlation', 'regression', 'classification',
    'clustering', 'dimensionality reduction', 'pca', 'tsne', 'outlier',
  ],
  [TechnicalDomain.MACHINE_LEARNING]: [
    'neural network', 'deep learning', 'transformer', 'attention', 'bert',
    'gpt', 'llm', 'fine-tuning', 'transfer learning', 'embedding', 'vector',
    'loss function', 'optimizer', 'gradient descent', 'backpropagation',
    'epoch', 'batch', 'learning rate', 'regularization', 'dropout',
    'overfitting', 'underfitting', 'hyperparameter', 'cross-validation',
    'precision', 'recall', 'f1-score', 'accuracy', 'auc', 'roc',
  ],
  [TechnicalDomain.CLOUD_COMPUTING]: [
    'aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda', 'container',
    'docker', 'kubernetes', 'k8s', 'orchestration', 'scaling', 'auto-scaling',
    'load balancer', 'cdn', 'storage', 's3', 'blob', 'vpc', 'subnet',
    'security group', 'iam', 'role', 'policy', 'encryption', 'kms',
  ],
  [TechnicalDomain.CYBERSECURITY]: [
    'encryption', 'authentication', 'authorization', 'oauth', 'jwt', 'ssl',
    'tls', 'certificate', 'vulnerability', 'penetration testing', 'firewall',
    'ids', 'ips', 'siem', 'incident response', 'threat', 'malware', 'phishing',
    'social engineering', 'zero trust', 'compliance', 'gdpr', 'hipaa', 'soc2',
  ],
  [TechnicalDomain.DEVOPS]: [
    'ci/cd', 'pipeline', 'jenkins', 'github actions', 'gitlab ci', 'terraform',
    'ansible', 'puppet', 'chef', 'infrastructure as code', 'iac', 'monitoring',
    'logging', 'alerting', 'prometheus', 'grafana', 'elk', 'splunk',
    'deployment', 'rollback', 'blue-green', 'canary', 'feature flag',
  ],
  [TechnicalDomain.WEB_DEVELOPMENT]: [
    'html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular',
    'svelte', 'next.js', 'nuxt', 'webpack', 'vite', 'bundler', 'transpiler',
    'babel', 'responsive', 'accessibility', 'wcag', 'aria', 'seo', 'pwa',
    'service worker', 'web component', 'shadow dom', 'virtual dom',
  ],
  [TechnicalDomain.MOBILE_DEVELOPMENT]: [
    'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin',
    'cordova', 'capacitor', 'native', 'hybrid', 'cross-platform', 'app store',
    'play store', 'push notification', 'deep linking', 'offline', 'sqlite',
  ],
  [TechnicalDomain.BLOCKCHAIN]: [
    'blockchain', 'smart contract', 'solidity', 'ethereum', 'bitcoin', 'web3',
    'defi', 'nft', 'token', 'wallet', 'transaction', 'consensus', 'mining',
    'staking', 'gas', 'layer 2', 'rollup', 'bridge', 'dao', 'governance',
  ],
  [TechnicalDomain.IOT]: [
    'sensor', 'actuator', 'microcontroller', 'arduino', 'raspberry pi', 'mqtt',
    'coap', 'zigbee', 'bluetooth', 'wifi', 'lora', 'edge computing', 'gateway',
    'telemetry', 'firmware', 'ota', 'embedded', 'real-time', 'rtos',
  ],
  [TechnicalDomain.OTHER]: [],
};

// ----------------------------------------------------------------------------
// Action Verbs for Technical Writing
// ----------------------------------------------------------------------------

const ACTION_VERBS = [
  'write', 'create', 'develop', 'design', 'implement', 'build', 'generate',
  'explain', 'describe', 'document', 'outline', 'analyze', 'evaluate',
  'compare', 'contrast', 'summarize', 'review', 'optimize', 'improve',
  'refactor', 'debug', 'troubleshoot', 'configure', 'deploy', 'integrate',
  'migrate', 'upgrade', 'test', 'validate', 'verify', 'demonstrate',
];

// ----------------------------------------------------------------------------
// NLP Service Class
// ----------------------------------------------------------------------------

export class NLPService {
  private static instance: NLPService;

  private constructor() {}

  static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  // --------------------------------------------------------------------------
  // Main Analysis Method
  // --------------------------------------------------------------------------

  analyzePrompt(content: string, domain?: TechnicalDomain): TextAnalysisResult {
    const metadata = this.extractMetadata(content);
    const entities = this.extractEntities(content, domain);
    const keyPhrases = this.extractKeyPhrases(content);
    const technicalTerms = this.identifyTechnicalTerms(content, domain);
    const sentiment = this.analyzeSentiment(content);
    const structure = this.analyzeStructure(content);

    return {
      metadata,
      entities,
      keyPhrases,
      technicalTerms,
      sentiment,
      structure,
    };
  }

  // --------------------------------------------------------------------------
  // Metadata Extraction
  // --------------------------------------------------------------------------

  extractMetadata(content: string): PromptMetadata {
    const words = this.tokenize(content);
    const sentences = this.splitSentences(content);
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    const exampleIndicators = /\b(example|for instance|such as|e\.g\.|i\.e\.)\b/gi;
    const constraintIndicators = /\b(must|should|cannot|limit|restrict|require|constraint|maximum|minimum|only|avoid|don't|do not)\b/gi;
    const questionRegex = /\?/g;

    const codeBlocks = content.match(codeBlockRegex) || [];
    const hasExamples = exampleIndicators.test(content) || codeBlocks.length > 0;
    const hasConstraints = constraintIndicators.test(content);
    const questionsCount = (content.match(questionRegex) || []).length;

    const totalSentenceLength = sentences.reduce((sum, s) => sum + this.tokenize(s).length, 0);
    const averageSentenceLength = sentences.length > 0
      ? totalSentenceLength / sentences.length
      : 0;

    const readabilityScore = this.calculateReadabilityScore(content, words, sentences);
    const technicalTermsCount = this.countTechnicalTerms(content);

    return {
      wordCount: words.length,
      characterCount: content.length,
      sentenceCount: sentences.length,
      averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
      readabilityScore: Math.round(readabilityScore * 10) / 10,
      technicalTermsCount,
      questionsCount,
      hasCodeBlocks: codeBlocks.length > 0,
      hasExamples,
      hasConstraints,
    };
  }

  // --------------------------------------------------------------------------
  // Entity Extraction
  // --------------------------------------------------------------------------

  extractEntities(content: string, domain?: TechnicalDomain): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lowerContent = content.toLowerCase();

    // Extract technologies/frameworks
    const allTechTerms = domain
      ? TECHNICAL_TERMS[domain]
      : Object.values(TECHNICAL_TERMS).flat();

    for (const term of allTechTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        entities.push({
          text: match[0],
          type: this.categorizeEntityType(term),
          confidence: 0.85,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Extract action verbs
    for (const verb of ACTION_VERBS) {
      const regex = new RegExp(`\\b${verb}(s|ed|ing)?\\b`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        entities.push({
          text: match[0],
          type: EntityType.ACTION,
          confidence: 0.9,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Extract audience mentions
    const audiencePatterns = [
      /\b(developer|engineer|programmer|analyst|scientist|designer|architect|manager|team|user|beginner|expert|student|professional)s?\b/gi,
    ];

    for (const pattern of audiencePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        entities.push({
          text: match[0],
          type: EntityType.AUDIENCE,
          confidence: 0.8,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Deduplicate and sort by position
    return this.deduplicateEntities(entities).sort((a, b) => a.startIndex - b.startIndex);
  }

  // --------------------------------------------------------------------------
  // Key Phrase Extraction
  // --------------------------------------------------------------------------

  extractKeyPhrases(content: string): string[] {
    const words = this.tokenize(content);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
      'this', 'that', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she',
      'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their', 'what',
      'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    ]);

    // Extract bigrams and trigrams
    const phrases: Map<string, number> = new Map();

    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i].toLowerCase();
      const w2 = words[i + 1].toLowerCase();

      if (!stopWords.has(w1) && !stopWords.has(w2)) {
        const bigram = `${w1} ${w2}`;
        phrases.set(bigram, (phrases.get(bigram) || 0) + 1);
      }

      if (i < words.length - 2) {
        const w3 = words[i + 2].toLowerCase();
        if (!stopWords.has(w1) && !stopWords.has(w3)) {
          const trigram = `${w1} ${w2} ${w3}`;
          phrases.set(trigram, (phrases.get(trigram) || 0) + 1);
        }
      }
    }

    // Sort by frequency and return top phrases
    return Array.from(phrases.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  // --------------------------------------------------------------------------
  // Technical Terms Identification
  // --------------------------------------------------------------------------

  identifyTechnicalTerms(content: string, domain?: TechnicalDomain): string[] {
    const lowerContent = content.toLowerCase();
    const foundTerms: Set<string> = new Set();

    const domainsToCheck = domain
      ? [domain]
      : Object.keys(TECHNICAL_TERMS) as TechnicalDomain[];

    for (const d of domainsToCheck) {
      for (const term of TECHNICAL_TERMS[d]) {
        if (lowerContent.includes(term.toLowerCase())) {
          foundTerms.add(term);
        }
      }
    }

    return Array.from(foundTerms);
  }

  // --------------------------------------------------------------------------
  // Sentiment Analysis
  // --------------------------------------------------------------------------

  analyzeSentiment(content: string): SentimentResult {
    const positiveWords = [
      'good', 'great', 'excellent', 'best', 'effective', 'efficient', 'clear',
      'comprehensive', 'helpful', 'useful', 'important', 'essential', 'optimal',
      'improve', 'enhance', 'successful', 'reliable', 'robust', 'scalable',
    ];

    const negativeWords = [
      'bad', 'poor', 'difficult', 'complex', 'confusing', 'unclear', 'wrong',
      'error', 'fail', 'problem', 'issue', 'bug', 'crash', 'slow', 'deprecated',
      'avoid', 'never', 'don\'t', 'cannot', 'unable', 'limitation',
    ];

    const lowerContent = content.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) positiveCount += matches.length;
    }

    for (const word of negativeWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) negativeCount += matches.length;
    }

    const total = positiveCount + negativeCount;
    let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
    let confidence = 0.5;

    if (total > 0) {
      const ratio = positiveCount / total;
      if (ratio > 0.6) {
        overall = 'positive';
        confidence = ratio;
      } else if (ratio < 0.4) {
        overall = 'negative';
        confidence = 1 - ratio;
      } else {
        overall = 'neutral';
        confidence = 0.5 + Math.abs(0.5 - ratio);
      }
    }

    return {
      overall,
      confidence,
      aspects: [],
    };
  }

  // --------------------------------------------------------------------------
  // Structure Analysis
  // --------------------------------------------------------------------------

  analyzeStructure(content: string): StructureAnalysis {
    const lines = content.split('\n');
    const sections: PromptSection[] = [];

    // Check for common structural elements
    const contextIndicators = /\b(context|background|situation|scenario|given)\b/i;
    const objectiveIndicators = /\b(goal|objective|task|create|write|generate|develop|build|design)\b/i;
    const constraintIndicators = /\b(constraint|requirement|must|should|limit|avoid|don't)\b/i;
    const exampleIndicators = /\b(example|instance|sample|demo|illustration)\b|```/i;
    const outputIndicators = /\b(output|format|structure|result|response|return)\b/i;

    const hasContext = contextIndicators.test(content);
    const hasObjective = objectiveIndicators.test(content);
    const hasConstraints = constraintIndicators.test(content);
    const hasExamples = exampleIndicators.test(content);
    const hasOutputFormat = outputIndicators.test(content);

    // Detect sections by headers or patterns
    let currentSection: PromptSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^#{1,3}\s+(.+)$/) ||
                          line.match(/^([A-Z][A-Za-z\s]+):$/);

      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }

        const sectionType = this.determineSectionType(headerMatch[1]);
        currentSection = {
          type: sectionType,
          content: '',
          startLine: i,
          endLine: i,
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
        currentSection.endLine = i;
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      hasIntroduction: hasContext || lines.length > 3,
      hasContext,
      hasObjective,
      hasConstraints,
      hasExamples,
      hasOutputFormat,
      sections,
    };
  }

  // --------------------------------------------------------------------------
  // Domain Detection
  // --------------------------------------------------------------------------

  detectDomain(content: string): TechnicalDomain {
    const lowerContent = content.toLowerCase();
    const scores: Record<TechnicalDomain, number> = {} as Record<TechnicalDomain, number>;

    for (const domain of Object.keys(TECHNICAL_TERMS) as TechnicalDomain[]) {
      scores[domain] = 0;
      for (const term of TECHNICAL_TERMS[domain]) {
        if (lowerContent.includes(term.toLowerCase())) {
          scores[domain]++;
        }
      }
    }

    const maxDomain = Object.entries(scores).reduce(
      (max, [domain, score]) => score > max.score ? { domain: domain as TechnicalDomain, score } : max,
      { domain: TechnicalDomain.OTHER, score: 0 }
    );

    return maxDomain.score > 0 ? maxDomain.domain : TechnicalDomain.OTHER;
  }

  // --------------------------------------------------------------------------
  // Category Detection
  // --------------------------------------------------------------------------

  detectCategory(content: string): PromptCategory {
    const lowerContent = content.toLowerCase();

    const categoryPatterns: Record<PromptCategory, RegExp[]> = {
      [PromptCategory.DOCUMENTATION]: [
        /\bdocument(ation)?\b/i,
        /\brelease notes?\b/i,
        /\bchangelog\b/i,
      ],
      [PromptCategory.USER_MANUAL]: [
        /\buser manual\b/i,
        /\buser guide\b/i,
        /\bhow to use\b/i,
        /\bstep[- ]by[- ]step\b/i,
      ],
      [PromptCategory.INSTRUCTIONAL_GUIDE]: [
        /\btutorial\b/i,
        /\bguide\b/i,
        /\binstructions?\b/i,
        /\bhow to\b/i,
      ],
      [PromptCategory.TECHNICAL_BLOG]: [
        /\bblog\b/i,
        /\barticle\b/i,
        /\bpost\b/i,
        /\bopinion\b/i,
      ],
      [PromptCategory.RESEARCH_PAPER]: [
        /\bresearch\b/i,
        /\bpaper\b/i,
        /\bstudy\b/i,
        /\banalysis\b/i,
        /\bfindings\b/i,
      ],
      [PromptCategory.API_DOCUMENTATION]: [
        /\bapi\b/i,
        /\bendpoint\b/i,
        /\brequest\b/i,
        /\bresponse\b/i,
        /\brest\b/i,
        /\bgraphql\b/i,
      ],
      [PromptCategory.WHITEPAPER]: [
        /\bwhitepaper\b/i,
        /\bwhite paper\b/i,
        /\btechnical spec\b/i,
      ],
      [PromptCategory.TUTORIAL]: [
        /\btutorial\b/i,
        /\blearn(ing)?\b/i,
        /\bteach\b/i,
        /\bbeginners?\b/i,
      ],
      [PromptCategory.CASE_STUDY]: [
        /\bcase study\b/i,
        /\breal[- ]world\b/i,
        /\bimplementation\b/i,
      ],
      [PromptCategory.OTHER]: [],
    };

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerContent)) {
          return category as PromptCategory;
        }
      }
    }

    return PromptCategory.OTHER;
  }

  // --------------------------------------------------------------------------
  // Helper Methods
  // --------------------------------------------------------------------------

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private splitSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  private calculateReadabilityScore(
    content: string,
    words: string[],
    sentences: string[]
  ): number {
    if (sentences.length === 0 || words.length === 0) return 0;

    // Simplified Flesch Reading Ease formula
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;

    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);

    // Normalize to 0-100
    return Math.max(0, Math.min(100, fleschScore));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private countTechnicalTerms(content: string): number {
    const lowerContent = content.toLowerCase();
    let count = 0;

    for (const terms of Object.values(TECHNICAL_TERMS)) {
      for (const term of terms) {
        const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) count += matches.length;
      }
    }

    return count;
  }

  private categorizeEntityType(term: string): EntityType {
    const languages = ['python', 'java', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin', 'solidity'];
    const frameworks = ['react', 'vue', 'angular', 'next.js', 'django', 'flask', 'spring', 'tensorflow', 'pytorch'];

    if (languages.includes(term.toLowerCase())) return EntityType.LANGUAGE;
    if (frameworks.includes(term.toLowerCase())) return EntityType.FRAMEWORK;
    if (term.toLowerCase().includes('must') || term.toLowerCase().includes('should')) return EntityType.CONSTRAINT;

    return EntityType.TECHNOLOGY;
  }

  private determineSectionType(header: string): SectionType {
    const lowerHeader = header.toLowerCase();

    if (/context|background|overview/.test(lowerHeader)) return SectionType.CONTEXT;
    if (/objective|goal|task|requirement/.test(lowerHeader)) return SectionType.OBJECTIVE;
    if (/constraint|limitation|rule/.test(lowerHeader)) return SectionType.CONSTRAINTS;
    if (/example|sample|demo/.test(lowerHeader)) return SectionType.EXAMPLES;
    if (/output|format|result/.test(lowerHeader)) return SectionType.OUTPUT_FORMAT;

    return SectionType.ADDITIONAL_INFO;
  }

  private deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.text.toLowerCase()}-${entity.startIndex}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const nlpService = NLPService.getInstance();
