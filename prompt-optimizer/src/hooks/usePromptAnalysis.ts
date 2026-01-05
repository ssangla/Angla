// ============================================================================
// usePromptAnalysis Hook - Real-time Prompt Analysis
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  PromptScore,
  Suggestion,
  AlternativeFormat,
  OptimizedPrompt,
  PromptCategory,
  TechnicalDomain,
  ContextualAnswers,
  RefinementOptions,
} from '@/types';
import { scoringService } from '@/services/scoringService';
import { suggestionService } from '@/services/suggestionService';
import { nlpService } from '@/services/nlpService';

interface UsePromptAnalysisOptions {
  debounceMs?: number;
  autoAnalyze?: boolean;
  minLengthForAnalysis?: number;
}

interface UsePromptAnalysisResult {
  content: string;
  setContent: (content: string) => void;
  score: PromptScore | null;
  suggestions: Suggestion[];
  alternativeFormats: AlternativeFormat[];
  optimizedPrompt: OptimizedPrompt | null;
  isAnalyzing: boolean;
  detectedCategory: PromptCategory | null;
  detectedDomain: TechnicalDomain | null;
  analyze: () => void;
  applyRefinement: (options: RefinementOptions) => void;
  applySuggestion: (suggestion: Suggestion) => void;
  reset: () => void;
}

export function usePromptAnalysis(
  options: UsePromptAnalysisOptions = {}
): UsePromptAnalysisResult {
  const {
    debounceMs = 500,
    autoAnalyze = true,
    minLengthForAnalysis = 10,
  } = options;

  const [content, setContent] = useState('');
  const [score, setScore] = useState<PromptScore | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [alternativeFormats, setAlternativeFormats] = useState<AlternativeFormat[]>([]);
  const [optimizedPrompt, setOptimizedPrompt] = useState<OptimizedPrompt | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<PromptCategory | null>(null);
  const [detectedDomain, setDetectedDomain] = useState<TechnicalDomain | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const refinementOptions = useRef<RefinementOptions>(
    suggestionService.getDefaultRefinementOptions()
  );

  // Perform analysis
  const analyze = useCallback(() => {
    if (content.length < minLengthForAnalysis) {
      setScore(null);
      setSuggestions([]);
      setOptimizedPrompt(null);
      return;
    }

    setIsAnalyzing(true);

    // Simulate async processing for smoother UX
    setTimeout(() => {
      try {
        // Detect category and domain
        const category = nlpService.detectCategory(content);
        const domain = nlpService.detectDomain(content);
        setDetectedCategory(category);
        setDetectedDomain(domain);

        // Calculate score
        const promptScore = scoringService.calculateScore(content, category, domain);
        setScore(promptScore);

        // Generate suggestions
        const promptSuggestions = suggestionService.generateSuggestions(content, promptScore);
        setSuggestions(promptSuggestions);

        // Get alternative formats
        const formats = suggestionService.getAlternativeFormats(category);
        setAlternativeFormats(formats);

        // Generate optimized prompt
        const optimized = suggestionService.optimizePrompt(
          content,
          promptScore,
          refinementOptions.current
        );

        setOptimizedPrompt({
          original: content,
          optimized,
          score: promptScore,
          suggestions: promptSuggestions,
          alternativeFormats: formats,
          refinementOptions: refinementOptions.current,
        });
      } catch (error) {
        console.error('Analysis error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 100);
  }, [content, minLengthForAnalysis]);

  // Auto-analyze with debounce
  useEffect(() => {
    if (!autoAnalyze) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      analyze();
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content, autoAnalyze, debounceMs, analyze]);

  // Apply refinement options
  const applyRefinement = useCallback(
    (options: RefinementOptions) => {
      refinementOptions.current = options;
      if (score) {
        const optimized = suggestionService.optimizePrompt(content, score, options);
        setOptimizedPrompt({
          original: content,
          optimized,
          score,
          suggestions,
          alternativeFormats,
          refinementOptions: options,
        });
      }
    },
    [content, score, suggestions, alternativeFormats]
  );

  // Apply a suggestion
  const applySuggestion = useCallback(
    (suggestion: Suggestion) => {
      // Mark suggestion as applied
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestion.id ? { ...s, appliedAt: new Date() } : s
        )
      );
      // Re-analyze after applying
      analyze();
    },
    [analyze]
  );

  // Reset state
  const reset = useCallback(() => {
    setContent('');
    setScore(null);
    setSuggestions([]);
    setAlternativeFormats([]);
    setOptimizedPrompt(null);
    setDetectedCategory(null);
    setDetectedDomain(null);
    refinementOptions.current = suggestionService.getDefaultRefinementOptions();
  }, []);

  return {
    content,
    setContent,
    score,
    suggestions,
    alternativeFormats,
    optimizedPrompt,
    isAnalyzing,
    detectedCategory,
    detectedDomain,
    analyze,
    applyRefinement,
    applySuggestion,
    reset,
  };
}
