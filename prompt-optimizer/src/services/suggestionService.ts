// ============================================================================
// Suggestion Service - Generate Optimization Suggestions
// ============================================================================

import {
  Suggestion,
  SuggestionType,
  SuggestionPriority,
  SuggestionCategory,
  AlternativeFormat,
  PromptCategory,
  PromptScore,
  ScoreLevel,
  RefinementOptions,
  PromptTone,
  PromptLength,
  AudienceLevel,
  StructureFormat,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { nlpService } from './nlpService';

// ----------------------------------------------------------------------------
// Alternative Formats Configuration
// ----------------------------------------------------------------------------

const ALTERNATIVE_FORMATS: AlternativeFormat[] = [
  {
    id: 'api-docs',
    name: 'API Documentation',
    description: 'Structured format for REST/GraphQL API documentation with endpoints, parameters, and examples',
    category: PromptCategory.API_DOCUMENTATION,
    icon: 'code',
    template: `## API Documentation Request

### Endpoint Overview
Describe the API endpoint(s) you need documented:
- HTTP Method: [GET/POST/PUT/DELETE]
- Endpoint Path: [/api/v1/resource]
- Purpose: [Brief description]

### Request Parameters
- Headers: [Required headers]
- Query Parameters: [If applicable]
- Request Body: [JSON schema or description]

### Response Format
- Success Response: [Expected response structure]
- Error Responses: [Error codes and messages]

### Examples
Provide sample request/response pairs.

### Additional Context
[Authentication requirements, rate limits, versioning]`,
    example: 'Write API documentation for a user authentication endpoint that accepts email and password, returns JWT token, handles 401 unauthorized errors, and includes rate limiting information.',
  },
  {
    id: 'whitepaper',
    name: 'Technical Whitepaper',
    description: 'In-depth technical document with research, analysis, and recommendations',
    category: PromptCategory.WHITEPAPER,
    icon: 'file-text',
    template: `## Technical Whitepaper Request

### Topic and Scope
Define the main subject and boundaries of the whitepaper:
- Primary Topic: [Main focus area]
- Sub-topics: [Related areas to cover]
- Out of Scope: [What to exclude]

### Target Audience
- Technical Level: [Beginner/Intermediate/Expert]
- Role: [Developer/Architect/Manager]
- Industry: [Specific sector if applicable]

### Key Sections Required
1. Executive Summary
2. Problem Statement
3. Technical Analysis
4. Proposed Solution
5. Implementation Considerations
6. Conclusion and Recommendations

### Research Requirements
- Cite sources: [Yes/No]
- Include data/statistics: [Yes/No]
- Comparison with alternatives: [Yes/No]

### Constraints
[Word count, tone, specific requirements]`,
    example: 'Create a technical whitepaper on implementing microservices architecture for legacy system modernization, targeting senior architects, comparing orchestration approaches, with ROI analysis.',
  },
  {
    id: 'tutorial',
    name: 'Step-by-Step Tutorial',
    description: 'Educational guide with progressive steps, code examples, and explanations',
    category: PromptCategory.TUTORIAL,
    icon: 'book-open',
    template: `## Tutorial Request

### Learning Objective
What should the reader be able to do after completing this tutorial?
- Main Goal: [Specific skill or outcome]
- Prerequisites: [Required knowledge/tools]

### Tutorial Structure
- Format: [Step-by-step/Project-based/Concept-driven]
- Estimated Duration: [Time to complete]
- Difficulty Level: [Beginner/Intermediate/Advanced]

### Content Requirements
- Include code examples: [Yes/No]
- Include screenshots/diagrams: [Yes/No]
- Include troubleshooting tips: [Yes/No]

### Technology Stack
- Languages: [Programming languages]
- Frameworks: [Libraries/tools]
- Environment: [Local/Cloud/Docker]

### Output Format
[Markdown/HTML/Interactive notebook]`,
    example: 'Write a beginner-friendly tutorial on building a REST API with Node.js and Express, including authentication, database integration, and deployment to AWS, with code examples and common error solutions.',
  },
  {
    id: 'release-notes',
    name: 'Release Notes',
    description: 'Structured changelog with features, fixes, and breaking changes',
    category: PromptCategory.DOCUMENTATION,
    icon: 'git-branch',
    template: `## Release Notes Request

### Version Information
- Version Number: [X.Y.Z]
- Release Date: [Date]
- Release Type: [Major/Minor/Patch]

### Changes to Document
- New Features: [List of features]
- Bug Fixes: [List of fixes]
- Improvements: [Performance/UX enhancements]
- Breaking Changes: [API changes requiring migration]
- Deprecations: [Features being phased out]

### Audience
- Primary: [Developers/End-users/Both]
- Technical Detail Level: [High/Medium/Low]

### Format Requirements
- Include migration guides: [Yes/No]
- Include code snippets: [Yes/No]
- Link to documentation: [Yes/No]`,
    example: 'Write release notes for v3.0.0 of our React component library, including 5 new components, 12 bug fixes, 3 breaking changes with migration guides, and deprecation notices.',
  },
  {
    id: 'architecture-doc',
    name: 'Architecture Document',
    description: 'System design documentation with diagrams, decisions, and trade-offs',
    category: PromptCategory.DOCUMENTATION,
    icon: 'layers',
    template: `## Architecture Document Request

### System Overview
- System Name: [Name]
- Purpose: [What problem it solves]
- Scope: [Boundaries of the system]

### Key Requirements
- Functional: [What it must do]
- Non-functional: [Performance/Scale/Security]
- Constraints: [Technical/Business limitations]

### Documentation Sections
1. System Context
2. Container Diagram
3. Component Breakdown
4. Data Flow
5. Technology Decisions
6. Security Considerations
7. Deployment Architecture

### Decision Records
Include ADRs for: [Key decisions to document]

### Diagrams Required
[C4/UML/Sequence/Data flow]`,
    example: 'Create an architecture document for an e-commerce platform handling 10K concurrent users, with microservices, event-driven communication, multi-region deployment, and PCI-DSS compliance.',
  },
  {
    id: 'blog-post',
    name: 'Technical Blog Post',
    description: 'Engaging article with insights, examples, and actionable takeaways',
    category: PromptCategory.TECHNICAL_BLOG,
    icon: 'edit-3',
    template: `## Technical Blog Post Request

### Topic and Angle
- Main Topic: [Subject matter]
- Unique Angle: [Your perspective/insight]
- Key Takeaway: [What readers should learn]

### Target Audience
- Expertise Level: [Beginner/Intermediate/Expert]
- Role: [Developer/Manager/Enthusiast]
- Interests: [Specific areas]

### Structure
- Hook/Introduction: [Attention grabber]
- Problem Statement: [Why this matters]
- Solution/Insight: [Main content]
- Practical Application: [Code/Examples]
- Conclusion: [Summary and CTA]

### Requirements
- Word Count: [Target length]
- Tone: [Conversational/Professional/Educational]
- SEO Keywords: [If applicable]
- Code Examples: [Yes/No]`,
    example: 'Write a blog post about implementing real-time features with WebSockets vs Server-Sent Events, comparing performance, use cases, and providing implementation examples in Node.js.',
  },
];

// ----------------------------------------------------------------------------
// Suggestion Templates
// ----------------------------------------------------------------------------

interface SuggestionTemplate {
  id: string;
  type: SuggestionType;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  condition: (score: PromptScore, content: string) => boolean;
  generate: (content: string) => Suggestion;
}

const SUGGESTION_TEMPLATES: SuggestionTemplate[] = [
  // Clarity suggestions
  {
    id: 'add-action-verb',
    type: SuggestionType.ENHANCEMENT,
    category: SuggestionCategory.CLARITY,
    priority: SuggestionPriority.HIGH,
    condition: (score) => score.actionability.score < 50,
    generate: (content) => ({
      id: uuidv4(),
      type: SuggestionType.ENHANCEMENT,
      category: SuggestionCategory.CLARITY,
      priority: SuggestionPriority.HIGH,
      title: 'Start with a clear action verb',
      description: 'Begin your prompt with a specific action verb to make the task immediately clear.',
      example: 'Instead of "I need documentation...", try "Write comprehensive documentation for..."',
    }),
  },
  {
    id: 'remove-ambiguity',
    type: SuggestionType.CLARIFICATION,
    category: SuggestionCategory.CLARITY,
    priority: SuggestionPriority.HIGH,
    condition: (score) => score.clarity.score < 60,
    generate: (content) => {
      const vagueTerms = ['something', 'stuff', 'things', 'kind of', 'sort of', 'maybe', 'perhaps'];
      const foundTerms = vagueTerms.filter(t => content.toLowerCase().includes(t));
      return {
        id: uuidv4(),
        type: SuggestionType.CLARIFICATION,
        category: SuggestionCategory.CLARITY,
        priority: SuggestionPriority.HIGH,
        title: 'Replace vague language',
        description: foundTerms.length > 0
          ? `Replace ambiguous terms like "${foundTerms[0]}" with specific details.`
          : 'Use precise terminology instead of vague language.',
        example: 'Instead of "something like a login system", try "a JWT-based authentication system with OAuth2 support"',
      };
    },
  },
  // Specificity suggestions
  {
    id: 'add-constraints',
    type: SuggestionType.ADDITION,
    category: SuggestionCategory.SPECIFICITY,
    priority: SuggestionPriority.MEDIUM,
    condition: (score) => score.specificity.score < 60,
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.ADDITION,
      category: SuggestionCategory.SPECIFICITY,
      priority: SuggestionPriority.MEDIUM,
      title: 'Add specific constraints',
      description: 'Include measurable constraints like word count, number of items, or performance requirements.',
      example: 'Add constraints like "maximum 500 words", "include 5 code examples", or "optimize for <100ms response time"',
    }),
  },
  {
    id: 'add-tech-stack',
    type: SuggestionType.ADDITION,
    category: SuggestionCategory.SPECIFICITY,
    priority: SuggestionPriority.MEDIUM,
    condition: (score, content) => {
      const analysis = nlpService.analyzePrompt(content);
      return analysis.technicalTerms.length < 2;
    },
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.ADDITION,
      category: SuggestionCategory.SPECIFICITY,
      priority: SuggestionPriority.MEDIUM,
      title: 'Specify technology stack',
      description: 'Mention specific technologies, frameworks, or tools relevant to your request.',
      example: 'Specify "using React 18 with TypeScript", "PostgreSQL with Prisma ORM", or "AWS Lambda with API Gateway"',
    }),
  },
  // Structure suggestions
  {
    id: 'add-sections',
    type: SuggestionType.RESTRUCTURE,
    category: SuggestionCategory.STRUCTURE,
    priority: SuggestionPriority.MEDIUM,
    condition: (score) => score.structure.score < 50,
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.RESTRUCTURE,
      category: SuggestionCategory.STRUCTURE,
      priority: SuggestionPriority.MEDIUM,
      title: 'Organize with clear sections',
      description: 'Structure your prompt with distinct sections for context, requirements, and expected output.',
      example: 'Use headers like "## Context", "## Requirements", "## Expected Output", "## Constraints"',
    }),
  },
  {
    id: 'add-bullet-points',
    type: SuggestionType.RESTRUCTURE,
    category: SuggestionCategory.STRUCTURE,
    priority: SuggestionPriority.LOW,
    condition: (score, content) => {
      return content.length > 200 && !content.includes('-') && !content.includes('•');
    },
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.RESTRUCTURE,
      category: SuggestionCategory.STRUCTURE,
      priority: SuggestionPriority.LOW,
      title: 'Use bullet points for requirements',
      description: 'Break down multiple requirements into bullet points for better readability.',
      example: 'List requirements as:\n- Feature A: description\n- Feature B: description\n- Constraint: limit',
    }),
  },
  // Context suggestions
  {
    id: 'add-audience',
    type: SuggestionType.ADDITION,
    category: SuggestionCategory.CONTEXT,
    priority: SuggestionPriority.HIGH,
    condition: (score) => score.context.score < 60,
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.ADDITION,
      category: SuggestionCategory.CONTEXT,
      priority: SuggestionPriority.HIGH,
      title: 'Define your target audience',
      description: 'Specify who will be reading the output to ensure appropriate tone and detail level.',
      example: 'Add "Target audience: senior backend developers familiar with distributed systems" or "For beginners with basic Python knowledge"',
    }),
  },
  {
    id: 'add-background',
    type: SuggestionType.ADDITION,
    category: SuggestionCategory.CONTEXT,
    priority: SuggestionPriority.MEDIUM,
    condition: (score, content) => {
      const analysis = nlpService.analyzePrompt(content);
      return !analysis.structure.hasContext;
    },
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.ADDITION,
      category: SuggestionCategory.CONTEXT,
      priority: SuggestionPriority.MEDIUM,
      title: 'Provide background context',
      description: 'Include relevant background information about the project or situation.',
      example: 'Add context like "We are migrating a monolithic application to microservices" or "This is for a fintech startup handling sensitive data"',
    }),
  },
  // Format suggestions
  {
    id: 'add-output-format',
    type: SuggestionType.ADDITION,
    category: SuggestionCategory.FORMAT,
    priority: SuggestionPriority.HIGH,
    condition: (score) => !score.completeness.suggestions.some(s => s.includes('format')),
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.ADDITION,
      category: SuggestionCategory.FORMAT,
      priority: SuggestionPriority.HIGH,
      title: 'Specify output format',
      description: 'Describe the expected format, structure, or length of the output.',
      example: 'Specify "Output as Markdown with code blocks", "Provide as a numbered list", or "Format as JSON schema"',
    }),
  },
  {
    id: 'add-examples',
    type: SuggestionType.ADDITION,
    category: SuggestionCategory.FORMAT,
    priority: SuggestionPriority.LOW,
    condition: (score, content) => {
      const analysis = nlpService.analyzePrompt(content);
      return !analysis.metadata.hasExamples;
    },
    generate: () => ({
      id: uuidv4(),
      type: SuggestionType.ADDITION,
      category: SuggestionCategory.FORMAT,
      priority: SuggestionPriority.LOW,
      title: 'Include examples',
      description: 'Add examples of the expected output or similar successful results.',
      example: 'Add "Here\'s an example of the format I\'m looking for:" followed by a sample',
    }),
  },
];

// ----------------------------------------------------------------------------
// Suggestion Service Class
// ----------------------------------------------------------------------------

export class SuggestionService {
  private static instance: SuggestionService;

  private constructor() {}

  static getInstance(): SuggestionService {
    if (!SuggestionService.instance) {
      SuggestionService.instance = new SuggestionService();
    }
    return SuggestionService.instance;
  }

  // --------------------------------------------------------------------------
  // Main Suggestion Generation
  // --------------------------------------------------------------------------

  generateSuggestions(content: string, score: PromptScore): Suggestion[] {
    const suggestions: Suggestion[] = [];

    for (const template of SUGGESTION_TEMPLATES) {
      if (template.condition(score, content)) {
        suggestions.push(template.generate(content));
      }
    }

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // --------------------------------------------------------------------------
  // Alternative Formats
  // --------------------------------------------------------------------------

  getAlternativeFormats(category?: PromptCategory): AlternativeFormat[] {
    if (category) {
      return ALTERNATIVE_FORMATS.filter(f => f.category === category);
    }
    return ALTERNATIVE_FORMATS;
  }

  getFormatById(id: string): AlternativeFormat | undefined {
    return ALTERNATIVE_FORMATS.find(f => f.id === id);
  }

  // --------------------------------------------------------------------------
  // Prompt Optimization
  // --------------------------------------------------------------------------

  optimizePrompt(
    content: string,
    score: PromptScore,
    options: RefinementOptions
  ): string {
    let optimized = content;

    // Apply tone adjustments
    optimized = this.adjustTone(optimized, options.tone);

    // Apply length adjustments
    optimized = this.adjustLength(optimized, options.length);

    // Add structure if needed
    if (score.structure.score < 60) {
      optimized = this.addStructure(optimized, options.structureFormat);
    }

    // Add context elements if missing
    if (score.context.score < 60 && options.includeContext) {
      optimized = this.addContextPlaceholders(optimized, options.audienceLevel);
    }

    // Add examples placeholder if requested
    if (options.includeExamples && !content.toLowerCase().includes('example')) {
      optimized = this.addExamplesSection(optimized);
    }

    // Add constraints if requested
    if (options.includeConstraints && score.specificity.score < 60) {
      optimized = this.addConstraintsSection(optimized);
    }

    return optimized;
  }

  // --------------------------------------------------------------------------
  // Tone Adjustment
  // --------------------------------------------------------------------------

  private adjustTone(content: string, tone: PromptTone): string {
    const toneInstructions: Record<PromptTone, string> = {
      [PromptTone.FORMAL]: '\n\n**Tone:** Use formal, professional language suitable for official documentation.',
      [PromptTone.PROFESSIONAL]: '\n\n**Tone:** Use clear, professional language appropriate for business communication.',
      [PromptTone.CONVERSATIONAL]: '\n\n**Tone:** Use a friendly, conversational tone while maintaining technical accuracy.',
      [PromptTone.TECHNICAL]: '\n\n**Tone:** Use precise technical terminology and assume expert-level audience.',
      [PromptTone.EDUCATIONAL]: '\n\n**Tone:** Use explanatory language suitable for teaching, with clear explanations of concepts.',
      [PromptTone.PERSUASIVE]: '\n\n**Tone:** Use compelling language that highlights benefits and drives action.',
    };

    if (!content.toLowerCase().includes('tone:')) {
      return content + toneInstructions[tone];
    }
    return content;
  }

  // --------------------------------------------------------------------------
  // Length Adjustment
  // --------------------------------------------------------------------------

  private adjustLength(content: string, length: PromptLength): string {
    const lengthInstructions: Record<PromptLength, string> = {
      [PromptLength.CONCISE]: '\n\n**Length:** Keep the output concise, focusing only on essential information (under 300 words).',
      [PromptLength.MODERATE]: '\n\n**Length:** Provide moderate detail with key explanations (300-800 words).',
      [PromptLength.DETAILED]: '\n\n**Length:** Include comprehensive explanations and examples (800-1500 words).',
      [PromptLength.COMPREHENSIVE]: '\n\n**Length:** Provide exhaustive coverage with extensive examples and edge cases (1500+ words).',
    };

    if (!content.toLowerCase().includes('length:') && !content.toLowerCase().includes('words')) {
      return content + lengthInstructions[length];
    }
    return content;
  }

  // --------------------------------------------------------------------------
  // Structure Enhancement
  // --------------------------------------------------------------------------

  private addStructure(content: string, format: StructureFormat): string {
    if (format === StructureFormat.FREEFORM) return content;

    const hasHeaders = /^#{1,3}\s+/m.test(content);
    if (hasHeaders) return content;

    const structuredPrefix = `## Task Overview
${content}

## Requirements
[Specify key requirements here]

## Expected Output
[Describe the expected output format]

## Additional Context
[Add any relevant context or constraints]`;

    return structuredPrefix;
  }

  // --------------------------------------------------------------------------
  // Context Enhancement
  // --------------------------------------------------------------------------

  private addContextPlaceholders(content: string, audienceLevel: AudienceLevel): string {
    const audienceDescriptions: Record<AudienceLevel, string> = {
      [AudienceLevel.BEGINNER]: 'beginners with limited technical background',
      [AudienceLevel.INTERMEDIATE]: 'developers with 1-3 years of experience',
      [AudienceLevel.ADVANCED]: 'experienced developers familiar with the domain',
      [AudienceLevel.EXPERT]: 'expert-level architects and senior engineers',
      [AudienceLevel.MIXED]: 'a mixed audience with varying experience levels',
    };

    const contextAddition = `\n\n**Target Audience:** ${audienceDescriptions[audienceLevel]}`;

    if (!content.toLowerCase().includes('audience') && !content.toLowerCase().includes('reader')) {
      return content + contextAddition;
    }
    return content;
  }

  // --------------------------------------------------------------------------
  // Examples Section
  // --------------------------------------------------------------------------

  private addExamplesSection(content: string): string {
    return content + '\n\n**Examples:** Include relevant examples to illustrate key points.';
  }

  // --------------------------------------------------------------------------
  // Constraints Section
  // --------------------------------------------------------------------------

  private addConstraintsSection(content: string): string {
    return content + `\n\n**Constraints:**
- [Add specific constraint 1]
- [Add specific constraint 2]
- [Add word/format limits]`;
  }

  // --------------------------------------------------------------------------
  // Get Default Refinement Options
  // --------------------------------------------------------------------------

  getDefaultRefinementOptions(): RefinementOptions {
    return {
      tone: PromptTone.PROFESSIONAL,
      length: PromptLength.MODERATE,
      audienceLevel: AudienceLevel.INTERMEDIATE,
      includeExamples: true,
      includeConstraints: true,
      includeContext: true,
      structureFormat: StructureFormat.SECTIONS,
    };
  }
}

export const suggestionService = SuggestionService.getInstance();
