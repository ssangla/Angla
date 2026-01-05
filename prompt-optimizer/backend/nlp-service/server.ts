// ============================================================================
// NLP Service - Natural Language Processing Microservice
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Types
interface AnalysisRequest {
  content: string;
  category?: string;
  domain?: string;
  options?: {
    includeAlternatives?: boolean;
    maxSuggestions?: number;
  };
}

interface ScoreDimension {
  score: number;
  level: string;
  feedback: string;
  suggestions: string[];
}

interface AnalysisResponse {
  promptId: string;
  score: {
    overall: number;
    clarity: ScoreDimension;
    specificity: ScoreDimension;
    structure: ScoreDimension;
    context: ScoreDimension;
    actionability: ScoreDimension;
    completeness: ScoreDimension;
    level: string;
  };
  suggestions: Array<{
    id: string;
    type: string;
    priority: string;
    title: string;
    description: string;
    example?: string;
  }>;
  metadata: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    technicalTermsCount: number;
    hasCodeBlocks: boolean;
    hasExamples: boolean;
  };
  processingTime: number;
}

// Configuration
const config = {
  port: process.env.PORT || 3001,
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
    console.log(`[NLP] ${req.method} ${req.path} - ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
});

// ============================================================================
// NLP Analysis Engine
// ============================================================================

class NLPAnalyzer {
  private technicalTerms: string[] = [
    'api', 'sdk', 'framework', 'library', 'module', 'function', 'class',
    'interface', 'database', 'rest', 'graphql', 'testing', 'deployment',
    'docker', 'kubernetes', 'cloud', 'aws', 'azure', 'gcp', 'microservices',
    'machine learning', 'ai', 'neural network', 'deep learning', 'tensorflow',
    'pytorch', 'react', 'vue', 'angular', 'node.js', 'python', 'typescript',
  ];

  private actionVerbs: string[] = [
    'write', 'create', 'develop', 'design', 'implement', 'build', 'generate',
    'explain', 'describe', 'document', 'analyze', 'optimize', 'improve',
  ];

  analyze(content: string, domain?: string): AnalysisResponse {
    const startTime = Date.now();
    const promptId = uuidv4();

    const metadata = this.extractMetadata(content);
    const clarity = this.scoreClarity(content, metadata);
    const specificity = this.scoreSpecificity(content, metadata);
    const structure = this.scoreStructure(content);
    const context = this.scoreContext(content);
    const actionability = this.scoreActionability(content);
    const completeness = this.scoreCompleteness(content, metadata);

    const overall = Math.round(
      clarity.score * 0.2 +
      specificity.score * 0.2 +
      structure.score * 0.15 +
      context.score * 0.15 +
      actionability.score * 0.15 +
      completeness.score * 0.15
    );

    const suggestions = this.generateSuggestions(
      { clarity, specificity, structure, context, actionability, completeness },
      content
    );

    return {
      promptId,
      score: {
        overall,
        clarity,
        specificity,
        structure,
        context,
        actionability,
        completeness,
        level: this.getScoreLevel(overall),
      },
      suggestions,
      metadata,
      processingTime: Date.now() - startTime,
    };
  }

  private extractMetadata(content: string) {
    const words = content.split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
    const codeBlocks = content.match(codeBlockRegex) || [];
    const exampleIndicators = /\b(example|for instance|such as|e\.g\.|i\.e\.)\b/gi;

    let technicalTermsCount = 0;
    const lowerContent = content.toLowerCase();
    for (const term of this.technicalTerms) {
      if (lowerContent.includes(term)) {
        technicalTermsCount++;
      }
    }

    return {
      wordCount: words.length,
      characterCount: content.length,
      sentenceCount: sentences.length,
      technicalTermsCount,
      hasCodeBlocks: codeBlocks.length > 0,
      hasExamples: exampleIndicators.test(content) || codeBlocks.length > 0,
    };
  }

  private scoreClarity(content: string, metadata: { sentenceCount: number; wordCount: number }): ScoreDimension {
    let score = 50;
    const suggestions: string[] = [];

    const avgSentenceLength = metadata.wordCount / Math.max(metadata.sentenceCount, 1);

    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
      score += 25;
    } else if (avgSentenceLength > 25) {
      score -= 10;
      suggestions.push('Consider breaking long sentences into shorter ones');
    }

    const vagueTerms = ['something', 'stuff', 'things', 'kind of', 'sort of'];
    const lowerContent = content.toLowerCase();
    const vagueCount = vagueTerms.filter(t => lowerContent.includes(t)).length;
    score -= vagueCount * 5;
    if (vagueCount > 0) {
      suggestions.push('Replace vague terms with specific language');
    }

    score = Math.max(0, Math.min(100, score + 25));

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getClarityFeedback(score),
      suggestions,
    };
  }

  private scoreSpecificity(content: string, metadata: { technicalTermsCount: number }): ScoreDimension {
    let score = 30;
    const suggestions: string[] = [];

    if (metadata.technicalTermsCount >= 5) score += 25;
    else if (metadata.technicalTermsCount >= 3) score += 15;
    else if (metadata.technicalTermsCount >= 1) score += 10;
    else suggestions.push('Add more specific technical terminology');

    const quantifiablePattern = /\b\d+(\.\d+)?(%|ms|s|kb|mb|gb|px)?\b/gi;
    const quantifiables = content.match(quantifiablePattern) || [];
    if (quantifiables.length >= 3) score += 20;
    else if (quantifiables.length >= 1) score += 10;
    else suggestions.push('Include specific numbers, metrics, or constraints');

    const constraintPattern = /\b(must|should|require|limit|maximum|minimum)\b/gi;
    const constraints = content.match(constraintPattern) || [];
    if (constraints.length >= 2) score += 15;
    else if (constraints.length >= 1) score += 8;

    score = Math.max(0, Math.min(100, score + 10));

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getSpecificityFeedback(score),
      suggestions,
    };
  }

  private scoreStructure(content: string): ScoreDimension {
    let score = 20;
    const suggestions: string[] = [];

    const hasHeaders = /^#{1,3}\s+.+$/m.test(content) || /^[A-Z][A-Za-z\s]+:$/m.test(content);
    const hasLists = /^[\s]*[-*•]\s+.+$/m.test(content) || /^[\s]*\d+\.\s+.+$/m.test(content);
    const hasCodeBlocks = /```[\s\S]*?```/.test(content);

    if (hasHeaders) score += 30;
    else suggestions.push('Add headers to organize content');

    if (hasLists) score += 20;
    else suggestions.push('Use bullet points for multiple requirements');

    if (hasCodeBlocks) score += 15;

    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length >= 3) score += 15;

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getStructureFeedback(score),
      suggestions,
    };
  }

  private scoreContext(content: string): ScoreDimension {
    let score = 20;
    const suggestions: string[] = [];
    const lowerContent = content.toLowerCase();

    const hasBackground = /\b(context|background|situation|scenario|given)\b/i.test(content);
    const hasAudience = /\b(for|target|audience|reader|developer|engineer)\b/i.test(content);
    const hasPurpose = /\b(goal|objective|purpose|to|in order to)\b/i.test(content);

    if (hasBackground) score += 25;
    else suggestions.push('Add background context');

    if (hasAudience) score += 25;
    else suggestions.push('Specify the target audience');

    if (hasPurpose) score += 20;
    else suggestions.push('Clearly state the purpose');

    score = Math.max(0, Math.min(100, score + 10));

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getContextFeedback(score),
      suggestions,
    };
  }

  private scoreActionability(content: string): ScoreDimension {
    let score = 20;
    const suggestions: string[] = [];
    const lowerContent = content.toLowerCase();

    const hasActionVerbs = this.actionVerbs.some(v =>
      new RegExp(`\\b${v}(s|ed|ing)?\\b`, 'i').test(content)
    );

    if (hasActionVerbs) score += 25;
    else suggestions.push('Start with a clear action verb');

    const hasDeliverables = /\b(produce|output|result|deliver|generate|create)\b/i.test(content);
    if (hasDeliverables) score += 20;
    else suggestions.push('Specify what the output should be');

    const hasOutputFormat = /\b(format|structure|output|response|return)\b/i.test(content);
    if (hasOutputFormat) score += 20;
    else suggestions.push('Describe the expected format');

    score = Math.max(0, Math.min(100, score + 15));

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getActionabilityFeedback(score),
      suggestions,
    };
  }

  private scoreCompleteness(content: string, metadata: { wordCount: number; hasExamples: boolean }): ScoreDimension {
    let score = 20;
    const suggestions: string[] = [];

    if (metadata.wordCount >= 100) score += 30;
    else if (metadata.wordCount >= 50) score += 20;
    else if (metadata.wordCount >= 25) score += 10;
    else suggestions.push('Expand the prompt with more details');

    if (metadata.hasExamples) score += 25;
    else suggestions.push('Include examples');

    const hasConstraints = /\b(must|should|limit|constraint|require)\b/i.test(content);
    if (hasConstraints) score += 15;

    score = Math.max(0, Math.min(100, score + 10));

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getCompletenessFeedback(score),
      suggestions,
    };
  }

  private generateSuggestions(dimensions: Record<string, ScoreDimension>, content: string) {
    const suggestions: AnalysisResponse['suggestions'] = [];

    for (const [name, dimension] of Object.entries(dimensions)) {
      if (dimension.score < 60) {
        for (const suggestion of dimension.suggestions) {
          suggestions.push({
            id: uuidv4(),
            type: 'enhancement',
            priority: dimension.score < 40 ? 'high' : 'medium',
            title: this.formatSuggestionTitle(name),
            description: suggestion,
          });
        }
      }
    }

    return suggestions.slice(0, 8);
  }

  private formatSuggestionTitle(dimension: string): string {
    const titles: Record<string, string> = {
      clarity: 'Improve Clarity',
      specificity: 'Add Specificity',
      structure: 'Enhance Structure',
      context: 'Provide Context',
      actionability: 'Increase Actionability',
      completeness: 'Add Completeness',
    };
    return titles[dimension] || 'Improve Prompt';
  }

  private getScoreLevel(score: number): string {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'moderate';
    return 'needs_work';
  }

  private getClarityFeedback(score: number): string {
    if (score >= 85) return 'Excellent clarity with well-formed sentences.';
    if (score >= 70) return 'Good clarity, could use minor refinements.';
    if (score >= 50) return 'Moderate clarity. Simplify complex sentences.';
    return 'Needs improvement. Remove ambiguous terms.';
  }

  private getSpecificityFeedback(score: number): string {
    if (score >= 85) return 'Highly specific with detailed requirements.';
    if (score >= 70) return 'Good specificity, could include more metrics.';
    if (score >= 50) return 'Moderate specificity. Add concrete details.';
    return 'Too vague. Include specific numbers and constraints.';
  }

  private getStructureFeedback(score: number): string {
    if (score >= 85) return 'Well-structured with clear organization.';
    if (score >= 70) return 'Good structure, could benefit from sections.';
    if (score >= 50) return 'Basic structure. Add headers and lists.';
    return 'Needs better organization.';
  }

  private getContextFeedback(score: number): string {
    if (score >= 85) return 'Comprehensive context provided.';
    if (score >= 70) return 'Good context, specify audience more.';
    if (score >= 50) return 'Some context. Add more background.';
    return 'Missing essential context.';
  }

  private getActionabilityFeedback(score: number): string {
    if (score >= 85) return 'Highly actionable with clear tasks.';
    if (score >= 70) return 'Good actionability. Specify output format.';
    if (score >= 50) return 'Moderately actionable. Add clearer tasks.';
    return 'Not actionable enough.';
  }

  private getCompletenessFeedback(score: number): string {
    if (score >= 85) return 'Comprehensive prompt covering all elements.';
    if (score >= 70) return 'Good coverage, missing some elements.';
    if (score >= 50) return 'Partial coverage. Add missing components.';
    return 'Incomplete prompt.';
  }
}

const analyzer = new NLPAnalyzer();

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'nlp-service',
    timestamp: new Date().toISOString(),
  });
});

// Main analysis endpoint
app.post('/analyze', (req: Request, res: Response) => {
  try {
    const { content, category, domain, options } = req.body as AnalysisRequest;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Content is required and must be a string',
        },
      });
    }

    if (content.length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONTENT_TOO_SHORT',
          message: 'Content must be at least 10 characters',
        },
      });
    }

    const result = analyzer.analyze(content, domain);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze prompt',
      },
    });
  }
});

// Batch analysis endpoint
app.post('/analyze/batch', (req: Request, res: Response) => {
  try {
    const { prompts } = req.body as { prompts: AnalysisRequest[] };

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Prompts array is required',
        },
      });
    }

    if (prompts.length > 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BATCH_LIMIT_EXCEEDED',
          message: 'Maximum 10 prompts per batch',
        },
      });
    }

    const results = prompts.map(p => analyzer.analyze(p.content, p.domain));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BATCH_ANALYSIS_ERROR',
        message: 'Failed to analyze prompts',
      },
    });
  }
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(config.port, () => {
  console.log(`[NLP Service] Running on port ${config.port}`);
});

export default app;
