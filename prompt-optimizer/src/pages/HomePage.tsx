// ============================================================================
// HomePage - Main Prompt Optimizer Interface
// ============================================================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Settings,
  History,
  Users,
  Moon,
  Sun,
  Menu,
  X,
  Copy,
  Check,
  Download,
  Share2,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePromptAnalysis } from '@/hooks/usePromptAnalysis';
import { PromptInput } from '@/components/PromptInput';
import { ScorePanel } from '@/components/ScorePanel';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { RefinementPanel } from '@/components/RefinementPanel';
import { ContextualQuestions, DEFAULT_QUESTIONS } from '@/components/ContextualQuestions';
import {
  ContextualAnswers,
  RefinementOptions,
  PromptTone,
  PromptLength,
  AudienceLevel,
  StructureFormat,
} from '@/types';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'suggestions' | 'refinement' | 'questions'>('suggestions');
  const [copied, setCopied] = useState(false);
  const [contextAnswers, setContextAnswers] = useState<ContextualAnswers>({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [refinementOptions, setRefinementOptions] = useState<RefinementOptions>({
    tone: PromptTone.PROFESSIONAL,
    length: PromptLength.MODERATE,
    audienceLevel: AudienceLevel.INTERMEDIATE,
    includeExamples: true,
    includeConstraints: true,
    includeContext: true,
    structureFormat: StructureFormat.SECTIONS,
  });

  const {
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
  } = usePromptAnalysis();

  // Handle copy to clipboard
  const handleCopy = useCallback(() => {
    const textToCopy = optimizedPrompt?.optimized || content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content, optimizedPrompt]);

  // Handle refinement apply
  const handleApplyRefinement = useCallback(() => {
    applyRefinement(refinementOptions);
  }, [applyRefinement, refinementOptions]);

  // Handle context answer
  const handleContextAnswer = useCallback((questionId: string, answer: ContextualAnswers[string]) => {
    setContextAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  // Handle questions complete
  const handleQuestionsComplete = useCallback(() => {
    setShowQuestions(false);
    analyze();
  }, [analyze]);

  return (
    <div className={cn('min-h-screen transition-colors', darkMode ? 'dark bg-secondary-900' : 'bg-secondary-50')}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-secondary-900 dark:text-white">
                  Prompt Optimizer
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestions(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Context</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-secondary-400" />
                ) : (
                  <Moon className="w-5 h-5 text-secondary-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Prompt Input and Score */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PromptInput
                value={content}
                onChange={setContent}
                onSubmit={analyze}
                detectedCategory={detectedCategory}
                detectedDomain={detectedDomain}
                isAnalyzing={isAnalyzing}
                className="shadow-soft"
              />
            </motion.div>

            {/* Score Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ScorePanel
                score={score}
                isLoading={isAnalyzing}
                showDetails={true}
                className="shadow-soft"
              />
            </motion.div>

            {/* Optimized Prompt Preview */}
            {optimizedPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    Optimized Prompt
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-secondary-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                      <Download className="w-4 h-4 text-secondary-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                      <Share2 className="w-4 h-4 text-secondary-500" />
                    </button>
                  </div>
                </div>
                <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap font-mono">
                    {optimizedPrompt.optimized}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className={cn(
            'space-y-6',
            'lg:block',
            sidebarOpen ? 'block' : 'hidden'
          )}>
            {/* Panel Tabs */}
            <div className="flex bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-1">
              <button
                onClick={() => setActivePanel('suggestions')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  activePanel === 'suggestions'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white'
                )}
              >
                Suggestions
              </button>
              <button
                onClick={() => setActivePanel('refinement')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                  activePanel === 'refinement'
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white'
                )}
              >
                Refine
              </button>
            </div>

            {/* Active Panel */}
            <AnimatePresence mode="wait">
              {activePanel === 'suggestions' ? (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SuggestionsPanel
                    suggestions={suggestions}
                    alternativeFormats={alternativeFormats}
                    onApplySuggestion={applySuggestion}
                    onSelectFormat={(format) => {
                      setContent(format.template);
                      analyze();
                    }}
                    isLoading={isAnalyzing}
                    className="shadow-soft"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="refinement"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <RefinementPanel
                    options={refinementOptions}
                    onChange={setRefinementOptions}
                    onApply={handleApplyRefinement}
                    disabled={!score}
                    className="shadow-soft"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Contextual Questions Modal */}
      <AnimatePresence>
        {showQuestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowQuestions(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <ContextualQuestions
                questions={DEFAULT_QUESTIONS}
                answers={contextAnswers}
                onAnswer={handleContextAnswer}
                onComplete={handleQuestionsComplete}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 border-t border-secondary-200 dark:border-secondary-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-secondary-500">
              <Sparkles className="w-4 h-4" />
              <span>Prompt Optimizer - AI-Powered Technical Writing Assistant</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-secondary-500">
              <a href="#" className="hover:text-secondary-700 dark:hover:text-secondary-300">
                Documentation
              </a>
              <a href="#" className="hover:text-secondary-700 dark:hover:text-secondary-300">
                API
              </a>
              <a href="#" className="hover:text-secondary-700 dark:hover:text-secondary-300">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
