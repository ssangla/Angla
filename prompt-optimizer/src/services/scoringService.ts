// ============================================================================
// Scoring Service - Prompt Quality Analysis and Scoring
// ============================================================================

import {
  PromptScore,
  ScoreDimension,
  ScoreLevel,
  ScoreWeights,
  TechnicalDomain,
  PromptCategory,
  ContextualAnswers,
} from '@/types';
import { nlpService, TextAnalysisResult } from './nlpService';

// ----------------------------------------------------------------------------
// Scoring Configuration
// ----------------------------------------------------------------------------

const DEFAULT_WEIGHTS: ScoreWeights = {
  clarity: 0.2,
  specificity: 0.2,
  structure: 0.15,
  context: 0.15,
  actionability: 0.15,
  completeness: 0.15,
};

const SCORE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  moderate: 50,
  needs_work: 0,
};

// ----------------------------------------------------------------------------
// Scoring Criteria
// ----------------------------------------------------------------------------

interface ScoringCriteria {
  clarity: ClarityMetrics;
  specificity: SpecificityMetrics;
  structure: StructureMetrics;
  context: ContextMetrics;
  actionability: ActionabilityMetrics;
  completeness: CompletenessMetrics;
}

interface ClarityMetrics {
  readabilityScore: number;
  averageSentenceLength: number;
  jargonDensity: number;
  ambiguousTerms: string[];
}

interface SpecificityMetrics {
  technicalTermsCount: number;
  quantifiableElements: number;
  vagueTerms: string[];
  specificConstraints: number;
}

interface StructureMetrics {
  hasLogicalFlow: boolean;
  sectionCount: number;
  hasFormatting: boolean;
  hasListsOrBullets: boolean;
}

interface ContextMetrics {
  hasBackground: boolean;
  hasAudience: boolean;
  hasPurpose: boolean;
  hasDomain: boolean;
}

interface ActionabilityMetrics {
  hasActionVerbs: boolean;
  hasDeliverables: boolean;
  hasExpectedOutput: boolean;
  taskClarity: number;
}

interface CompletenessMetrics {
  hasAllComponents: boolean;
  missingElements: string[];
  wordCount: number;
  informationDensity: number;
}

// ----------------------------------------------------------------------------
// Scoring Service Class
// ----------------------------------------------------------------------------

export class ScoringService {
  private static instance: ScoringService;
  private weights: ScoreWeights;

  private constructor() {
    this.weights = DEFAULT_WEIGHTS;
  }

  static getInstance(): ScoringService {
    if (!ScoringService.instance) {
      ScoringService.instance = new ScoringService();
    }
    return ScoringService.instance;
  }

  // --------------------------------------------------------------------------
  // Main Scoring Method
  // --------------------------------------------------------------------------

  calculateScore(
    content: string,
    category?: PromptCategory,
    domain?: TechnicalDomain,
    context?: ContextualAnswers
  ): PromptScore {
    const analysis = nlpService.analyzePrompt(content, domain);
    const criteria = this.extractCriteria(content, analysis);

    const clarity = this.scoreClarityDimension(criteria.clarity);
    const specificity = this.scoreSpecificityDimension(criteria.specificity);
    const structure = this.scoreStructureDimension(criteria.structure);
    const contextScore = this.scoreContextDimension(criteria.context);
    const actionability = this.scoreActionabilityDimension(criteria.actionability);
    const completeness = this.scoreCompletenessDimension(criteria.completeness);

    const overall = this.calculateOverallScore({
      clarity,
      specificity,
      structure,
      context: contextScore,
      actionability,
      completeness,
    });

    return {
      overall: Math.round(overall),
      clarity,
      specificity,
      structure,
      context: contextScore,
      actionability,
      completeness,
      level: this.getScoreLevel(overall),
      timestamp: new Date(),
    };
  }

  // --------------------------------------------------------------------------
  // Criteria Extraction
  // --------------------------------------------------------------------------

  private extractCriteria(content: string, analysis: TextAnalysisResult): ScoringCriteria {
    return {
      clarity: this.extractClarityMetrics(content, analysis),
      specificity: this.extractSpecificityMetrics(content, analysis),
      structure: this.extractStructureMetrics(content, analysis),
      context: this.extractContextMetrics(content, analysis),
      actionability: this.extractActionabilityMetrics(content, analysis),
      completeness: this.extractCompletenessMetrics(content, analysis),
    };
  }

  private extractClarityMetrics(content: string, analysis: TextAnalysisResult): ClarityMetrics {
    const vagueTerms = [
      'thing', 'stuff', 'something', 'somehow', 'somewhat', 'kind of',
      'sort of', 'maybe', 'perhaps', 'might', 'could be', 'various',
      'certain', 'some', 'many', 'few', 'several', 'etc', 'and so on',
    ];

    const ambiguousTerms: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const term of vagueTerms) {
      if (lowerContent.includes(term)) {
        ambiguousTerms.push(term);
      }
    }

    const jargonDensity = analysis.technicalTerms.length / (analysis.metadata.wordCount || 1);

    return {
      readabilityScore: analysis.metadata.readabilityScore,
      averageSentenceLength: analysis.metadata.averageSentenceLength,
      jargonDensity,
      ambiguousTerms,
    };
  }

  private extractSpecificityMetrics(content: string, analysis: TextAnalysisResult): SpecificityMetrics {
    const vagueTerms = [
      'good', 'better', 'best', 'nice', 'great', 'awesome', 'cool',
      'interesting', 'important', 'significant', 'major', 'minor',
    ];

    const foundVagueTerms: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const term of vagueTerms) {
      if (lowerContent.includes(term)) {
        foundVagueTerms.push(term);
      }
    }

    // Count quantifiable elements (numbers, percentages, specific values)
    const quantifiablePattern = /\b\d+(\.\d+)?(%|ms|s|kb|mb|gb|px|em|rem)?\b|\b(maximum|minimum|exactly|at least|at most)\s+\d+\b/gi;
    const quantifiableMatches = content.match(quantifiablePattern) || [];

    // Count specific constraints
    const constraintPattern = /\b(must|should|shall|require|limit|restrict|only|never|always)\b/gi;
    const constraintMatches = content.match(constraintPattern) || [];

    return {
      technicalTermsCount: analysis.metadata.technicalTermsCount,
      quantifiableElements: quantifiableMatches.length,
      vagueTerms: foundVagueTerms,
      specificConstraints: constraintMatches.length,
    };
  }

  private extractStructureMetrics(content: string, analysis: TextAnalysisResult): StructureMetrics {
    const hasHeaders = /^#{1,6}\s+.+$/m.test(content) || /^[A-Z][A-Za-z\s]+:$/m.test(content);
    const hasLists = /^[\s]*[-*•]\s+.+$/m.test(content) || /^[\s]*\d+\.\s+.+$/m.test(content);
    const hasCodeBlocks = /```[\s\S]*?```/.test(content);

    return {
      hasLogicalFlow: analysis.structure.hasObjective && analysis.structure.sections.length > 0,
      sectionCount: analysis.structure.sections.length,
      hasFormatting: hasHeaders || hasCodeBlocks,
      hasListsOrBullets: hasLists,
    };
  }

  private extractContextMetrics(content: string, analysis: TextAnalysisResult): ContextMetrics {
    const lowerContent = content.toLowerCase();

    const audiencePatterns = [
      /\b(for|target|audience|reader|user|developer|engineer|designer|manager|team)\b/i,
      /\b(beginner|intermediate|advanced|expert|professional)\b/i,
    ];

    const purposePatterns = [
      /\b(goal|objective|purpose|aim|intent|to|in order to|so that)\b/i,
    ];

    const hasAudience = audiencePatterns.some(p => p.test(content));
    const hasPurpose = purposePatterns.some(p => p.test(content));

    return {
      hasBackground: analysis.structure.hasContext,
      hasAudience,
      hasPurpose,
      hasDomain: analysis.technicalTerms.length > 0,
    };
  }

  private extractActionabilityMetrics(content: string, analysis: TextAnalysisResult): ActionabilityMetrics {
    const actionVerbPattern = /\b(write|create|develop|design|implement|build|generate|explain|describe|document|outline|analyze|evaluate|compare|summarize|review|optimize|improve|refactor|test|deploy)\b/gi;
    const actionMatches = content.match(actionVerbPattern) || [];

    const deliverablePatterns = [
      /\b(produce|output|result|deliver|provide|generate|create)\b/i,
    ];

    const outputPatterns = [
      /\b(format|structure|output|response|return|include|contain)\b/i,
    ];

    const hasDeliverables = deliverablePatterns.some(p => p.test(content));
    const hasExpectedOutput = outputPatterns.some(p => p.test(content));

    // Calculate task clarity based on action verbs and structure
    let taskClarity = 0;
    if (actionMatches.length > 0) taskClarity += 30;
    if (actionMatches.length > 2) taskClarity += 20;
    if (analysis.structure.hasObjective) taskClarity += 30;
    if (hasExpectedOutput) taskClarity += 20;

    return {
      hasActionVerbs: actionMatches.length > 0,
      hasDeliverables,
      hasExpectedOutput,
      taskClarity: Math.min(100, taskClarity),
    };
  }

  private extractCompletenessMetrics(content: string, analysis: TextAnalysisResult): CompletenessMetrics {
    const missingElements: string[] = [];

    if (!analysis.structure.hasContext) missingElements.push('context or background');
    if (!analysis.structure.hasObjective) missingElements.push('clear objective');
    if (!analysis.structure.hasConstraints) missingElements.push('constraints or requirements');
    if (!analysis.metadata.hasExamples) missingElements.push('examples');
    if (!analysis.structure.hasOutputFormat) missingElements.push('expected output format');

    const idealWordCount = 50; // Minimum for a well-formed prompt
    const informationDensity = analysis.metadata.technicalTermsCount / (analysis.metadata.wordCount || 1);

    return {
      hasAllComponents: missingElements.length === 0,
      missingElements,
      wordCount: analysis.metadata.wordCount,
      informationDensity,
    };
  }

  // --------------------------------------------------------------------------
  // Dimension Scoring
  // --------------------------------------------------------------------------

  private scoreClarityDimension(metrics: ClarityMetrics): ScoreDimension {
    let score = 50; // Base score

    // Readability contribution (max 25 points)
    if (metrics.readabilityScore >= 60) score += 25;
    else if (metrics.readabilityScore >= 40) score += 15;
    else if (metrics.readabilityScore >= 20) score += 5;

    // Sentence length contribution (max 15 points)
    if (metrics.averageSentenceLength >= 10 && metrics.averageSentenceLength <= 20) score += 15;
    else if (metrics.averageSentenceLength >= 8 && metrics.averageSentenceLength <= 25) score += 10;
    else score += 5;

    // Ambiguous terms penalty (max -20 points)
    score -= Math.min(20, metrics.ambiguousTerms.length * 4);

    // Jargon density (should be moderate)
    if (metrics.jargonDensity >= 0.05 && metrics.jargonDensity <= 0.15) score += 10;
    else if (metrics.jargonDensity > 0.15) score -= 5;

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (metrics.ambiguousTerms.length > 0) {
      suggestions.push(`Replace vague terms: "${metrics.ambiguousTerms.slice(0, 3).join('", "')}"`);
    }
    if (metrics.averageSentenceLength > 25) {
      suggestions.push('Consider breaking long sentences into shorter ones');
    }
    if (metrics.readabilityScore < 40) {
      suggestions.push('Simplify language for better readability');
    }

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getClarityFeedback(score, metrics),
      suggestions,
      weight: this.weights.clarity,
    };
  }

  private scoreSpecificityDimension(metrics: SpecificityMetrics): ScoreDimension {
    let score = 30; // Base score

    // Technical terms contribution (max 25 points)
    if (metrics.technicalTermsCount >= 5) score += 25;
    else if (metrics.technicalTermsCount >= 3) score += 15;
    else if (metrics.technicalTermsCount >= 1) score += 10;

    // Quantifiable elements (max 20 points)
    if (metrics.quantifiableElements >= 3) score += 20;
    else if (metrics.quantifiableElements >= 1) score += 10;

    // Specific constraints (max 15 points)
    if (metrics.specificConstraints >= 3) score += 15;
    else if (metrics.specificConstraints >= 1) score += 8;

    // Vague terms penalty (max -20 points)
    score -= Math.min(20, metrics.vagueTerms.length * 5);

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (metrics.technicalTermsCount < 3) {
      suggestions.push('Add more specific technical terminology');
    }
    if (metrics.quantifiableElements < 1) {
      suggestions.push('Include specific numbers, metrics, or constraints');
    }
    if (metrics.vagueTerms.length > 0) {
      suggestions.push(`Replace vague terms like "${metrics.vagueTerms[0]}" with specific requirements`);
    }

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getSpecificityFeedback(score, metrics),
      suggestions,
      weight: this.weights.specificity,
    };
  }

  private scoreStructureDimension(metrics: StructureMetrics): ScoreDimension {
    let score = 20; // Base score

    // Logical flow (max 30 points)
    if (metrics.hasLogicalFlow) score += 30;
    else if (metrics.sectionCount > 0) score += 15;

    // Sections (max 20 points)
    if (metrics.sectionCount >= 3) score += 20;
    else if (metrics.sectionCount >= 2) score += 15;
    else if (metrics.sectionCount >= 1) score += 10;

    // Formatting (max 15 points)
    if (metrics.hasFormatting) score += 15;

    // Lists/bullets (max 15 points)
    if (metrics.hasListsOrBullets) score += 15;

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (!metrics.hasLogicalFlow) {
      suggestions.push('Add clear sections for context, objective, and constraints');
    }
    if (!metrics.hasFormatting) {
      suggestions.push('Use headers or markdown formatting to organize content');
    }
    if (!metrics.hasListsOrBullets) {
      suggestions.push('Consider using bullet points for multiple requirements');
    }

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getStructureFeedback(score, metrics),
      suggestions,
      weight: this.weights.structure,
    };
  }

  private scoreContextDimension(metrics: ContextMetrics): ScoreDimension {
    let score = 20; // Base score

    // Background (25 points)
    if (metrics.hasBackground) score += 25;

    // Audience (25 points)
    if (metrics.hasAudience) score += 25;

    // Purpose (20 points)
    if (metrics.hasPurpose) score += 20;

    // Domain (10 points)
    if (metrics.hasDomain) score += 10;

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (!metrics.hasBackground) {
      suggestions.push('Add background context to explain the situation');
    }
    if (!metrics.hasAudience) {
      suggestions.push('Specify the target audience (e.g., "for senior developers")');
    }
    if (!metrics.hasPurpose) {
      suggestions.push('Clearly state the purpose or goal of the output');
    }

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getContextFeedback(score, metrics),
      suggestions,
      weight: this.weights.context,
    };
  }

  private scoreActionabilityDimension(metrics: ActionabilityMetrics): ScoreDimension {
    let score = 20; // Base score

    // Action verbs (25 points)
    if (metrics.hasActionVerbs) score += 25;

    // Deliverables (20 points)
    if (metrics.hasDeliverables) score += 20;

    // Expected output (20 points)
    if (metrics.hasExpectedOutput) score += 20;

    // Task clarity (15 points based on clarity score)
    score += (metrics.taskClarity / 100) * 15;

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (!metrics.hasActionVerbs) {
      suggestions.push('Start with a clear action verb (e.g., "Write", "Create", "Develop")');
    }
    if (!metrics.hasDeliverables) {
      suggestions.push('Specify what the output should be (e.g., "a detailed guide", "10 bullet points")');
    }
    if (!metrics.hasExpectedOutput) {
      suggestions.push('Describe the expected format or structure of the output');
    }

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getActionabilityFeedback(score, metrics),
      suggestions,
      weight: this.weights.actionability,
    };
  }

  private scoreCompletenessDimension(metrics: CompletenessMetrics): ScoreDimension {
    let score = 20; // Base score

    // Word count (max 30 points)
    if (metrics.wordCount >= 100) score += 30;
    else if (metrics.wordCount >= 50) score += 20;
    else if (metrics.wordCount >= 25) score += 10;

    // Has all components (30 points)
    if (metrics.hasAllComponents) {
      score += 30;
    } else {
      // Partial credit for each present component
      const presentComponents = 5 - metrics.missingElements.length;
      score += presentComponents * 6;
    }

    // Information density (max 20 points)
    if (metrics.informationDensity >= 0.05 && metrics.informationDensity <= 0.2) {
      score += 20;
    } else if (metrics.informationDensity > 0) {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    const suggestions: string[] = [];
    if (metrics.missingElements.length > 0) {
      suggestions.push(`Consider adding: ${metrics.missingElements.slice(0, 2).join(', ')}`);
    }
    if (metrics.wordCount < 50) {
      suggestions.push('Expand the prompt with more details and context');
    }

    return {
      score,
      level: this.getScoreLevel(score),
      feedback: this.getCompletenessFeedback(score, metrics),
      suggestions,
      weight: this.weights.completeness,
    };
  }

  // --------------------------------------------------------------------------
  // Overall Score Calculation
  // --------------------------------------------------------------------------

  private calculateOverallScore(dimensions: {
    clarity: ScoreDimension;
    specificity: ScoreDimension;
    structure: ScoreDimension;
    context: ScoreDimension;
    actionability: ScoreDimension;
    completeness: ScoreDimension;
  }): number {
    const weightedSum =
      dimensions.clarity.score * dimensions.clarity.weight +
      dimensions.specificity.score * dimensions.specificity.weight +
      dimensions.structure.score * dimensions.structure.weight +
      dimensions.context.score * dimensions.context.weight +
      dimensions.actionability.score * dimensions.actionability.weight +
      dimensions.completeness.score * dimensions.completeness.weight;

    const totalWeight =
      dimensions.clarity.weight +
      dimensions.specificity.weight +
      dimensions.structure.weight +
      dimensions.context.weight +
      dimensions.actionability.weight +
      dimensions.completeness.weight;

    return weightedSum / totalWeight;
  }

  // --------------------------------------------------------------------------
  // Score Level Determination
  // --------------------------------------------------------------------------

  private getScoreLevel(score: number): ScoreLevel {
    if (score >= SCORE_THRESHOLDS.excellent) return ScoreLevel.EXCELLENT;
    if (score >= SCORE_THRESHOLDS.good) return ScoreLevel.GOOD;
    if (score >= SCORE_THRESHOLDS.moderate) return ScoreLevel.MODERATE;
    return ScoreLevel.NEEDS_WORK;
  }

  // --------------------------------------------------------------------------
  // Feedback Generation
  // --------------------------------------------------------------------------

  private getClarityFeedback(score: number, metrics: ClarityMetrics): string {
    if (score >= 85) return 'Excellent clarity with well-formed sentences and precise language.';
    if (score >= 70) return 'Good clarity, but could benefit from more precise terminology.';
    if (score >= 50) return 'Moderate clarity. Consider simplifying complex sentences.';
    return 'Needs improvement. Focus on removing ambiguous terms and simplifying language.';
  }

  private getSpecificityFeedback(score: number, metrics: SpecificityMetrics): string {
    if (score >= 85) return 'Highly specific with detailed requirements and constraints.';
    if (score >= 70) return 'Good specificity, but could include more measurable criteria.';
    if (score >= 50) return 'Moderate specificity. Add more concrete details and examples.';
    return 'Too vague. Include specific numbers, constraints, and technical details.';
  }

  private getStructureFeedback(score: number, metrics: StructureMetrics): string {
    if (score >= 85) return 'Well-structured with clear organization and formatting.';
    if (score >= 70) return 'Good structure, but could benefit from additional sections.';
    if (score >= 50) return 'Basic structure present. Consider adding headers and bullet points.';
    return 'Needs better organization. Use sections, headers, and lists.';
  }

  private getContextFeedback(score: number, metrics: ContextMetrics): string {
    if (score >= 85) return 'Comprehensive context with clear audience and purpose.';
    if (score >= 70) return 'Good context provided, but could specify audience more clearly.';
    if (score >= 50) return 'Some context present. Add more background information.';
    return 'Missing essential context. Define audience, purpose, and background.';
  }

  private getActionabilityFeedback(score: number, metrics: ActionabilityMetrics): string {
    if (score >= 85) return 'Highly actionable with clear tasks and expected deliverables.';
    if (score >= 70) return 'Good actionability. Consider specifying output format.';
    if (score >= 50) return 'Moderately actionable. Add clearer action items.';
    return 'Not actionable enough. Start with action verbs and define deliverables.';
  }

  private getCompletenessFeedback(score: number, metrics: CompletenessMetrics): string {
    if (score >= 85) return 'Comprehensive prompt covering all essential elements.';
    if (score >= 70) return 'Good coverage, but missing some elements.';
    if (score >= 50) return 'Partial coverage. Add missing components.';
    return `Incomplete. Missing: ${metrics.missingElements.slice(0, 2).join(', ')}.`;
  }

  // --------------------------------------------------------------------------
  // Weight Configuration
  // --------------------------------------------------------------------------

  setWeights(weights: Partial<ScoreWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  getWeights(): ScoreWeights {
    return { ...this.weights };
  }
}

export const scoringService = ScoringService.getInstance();
