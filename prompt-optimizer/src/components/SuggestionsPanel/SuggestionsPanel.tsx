// ============================================================================
// SuggestionsPanel Component - Suggestions and Alternative Formats
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  FileText,
  Code,
  BookOpen,
  Layers,
  GitBranch,
  Edit3,
  ChevronRight,
  Check,
  ArrowRight,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Suggestion,
  SuggestionType,
  SuggestionPriority,
  SuggestionCategory,
  AlternativeFormat,
} from '@/types';

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const PRIORITY_STYLES: Record<SuggestionPriority, { bg: string; text: string; badge: string }> = {
  [SuggestionPriority.HIGH]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
  [SuggestionPriority.MEDIUM]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
  },
  [SuggestionPriority.LOW]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
};

const TYPE_ICONS: Record<SuggestionType, React.ElementType> = {
  [SuggestionType.ENHANCEMENT]: Sparkles,
  [SuggestionType.RESTRUCTURE]: Layers,
  [SuggestionType.CLARIFICATION]: Edit3,
  [SuggestionType.ADDITION]: FileText,
  [SuggestionType.REMOVAL]: Code,
  [SuggestionType.ALTERNATIVE_FORMAT]: BookOpen,
};

const FORMAT_ICONS: Record<string, React.ElementType> = {
  'code': Code,
  'file-text': FileText,
  'book-open': BookOpen,
  'layers': Layers,
  'git-branch': GitBranch,
  'edit-3': Edit3,
};

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  alternativeFormats: AlternativeFormat[];
  onApplySuggestion: (suggestion: Suggestion) => void;
  onSelectFormat: (format: AlternativeFormat) => void;
  isLoading?: boolean;
  className?: string;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

interface SuggestionCardProps {
  suggestion: Suggestion;
  onApply: () => void;
}

function SuggestionCard({ suggestion, onApply }: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const priorityStyles = PRIORITY_STYLES[suggestion.priority];
  const Icon = TYPE_ICONS[suggestion.type] || Lightbulb;

  const handleCopyExample = () => {
    if (suggestion.example) {
      navigator.clipboard.writeText(suggestion.example);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'p-4 rounded-xl border transition-all',
        priorityStyles.bg,
        'border-secondary-200',
        'hover:shadow-md'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              priorityStyles.badge
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-secondary-900">
              {suggestion.title}
            </h4>
            <p className="text-xs text-secondary-600 mt-1">
              {suggestion.description}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
            priorityStyles.badge
          )}
        >
          {suggestion.priority}
        </span>
      </div>

      {/* Example (Expandable) */}
      {suggestion.example && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            <ChevronRight
              className={cn(
                'w-3 h-3 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
            View example
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="relative bg-white/80 rounded-lg p-3 border border-secondary-200">
                  <pre className="text-xs text-secondary-700 whitespace-pre-wrap font-mono">
                    {suggestion.example}
                  </pre>
                  <button
                    onClick={handleCopyExample}
                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-secondary-100 transition-colors"
                    title="Copy example"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-secondary-400" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-2">
        {suggestion.appliedAt ? (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check className="w-3 h-3" />
            Applied
          </span>
        ) : (
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Apply
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface FormatCardProps {
  format: AlternativeFormat;
  onSelect: () => void;
}

function FormatCard({ format, onSelect }: FormatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = FORMAT_ICONS[format.icon] || FileText;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border border-secondary-200 bg-white hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-secondary-900">
            {format.name}
          </h4>
          <p className="text-xs text-secondary-500 mt-1 line-clamp-2">
            {format.description}
          </p>
        </div>
      </div>

      {/* Template Preview */}
      <div className="mt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ChevronRight
            className={cn(
              'w-3 h-3 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
          View template
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="bg-secondary-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                <pre className="text-xs text-secondary-700 whitespace-pre-wrap font-mono">
                  {format.template}
                </pre>
              </div>
              {format.example && (
                <div className="mt-2 p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs font-medium text-primary-700 mb-1">
                    Example:
                  </p>
                  <p className="text-xs text-primary-600">{format.example}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onSelect}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-xs font-medium rounded-lg transition-colors"
        >
          Use Template
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function SuggestionsPanel({
  suggestions,
  alternativeFormats,
  onApplySuggestion,
  onSelectFormat,
  isLoading = false,
  className,
}: SuggestionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'formats'>('suggestions');

  // Group suggestions by priority
  const highPriority = suggestions.filter(s => s.priority === SuggestionPriority.HIGH);
  const mediumPriority = suggestions.filter(s => s.priority === SuggestionPriority.MEDIUM);
  const lowPriority = suggestions.filter(s => s.priority === SuggestionPriority.LOW);

  if (isLoading) {
    return (
      <div className={cn('p-6 bg-white rounded-2xl border border-secondary-200', className)}>
        <div className="flex flex-col items-center justify-center h-48">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full"
          />
          <p className="mt-3 text-sm text-secondary-500">Loading suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-secondary-200 overflow-hidden', className)}>
      {/* Tabs */}
      <div className="flex border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'suggestions'
              ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
              : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50'
          )}
        >
          <Lightbulb className="w-4 h-4" />
          Suggestions
          {suggestions.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
              {suggestions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('formats')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'formats'
              ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50'
              : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50'
          )}
        >
          <Layers className="w-4 h-4" />
          Formats
          {alternativeFormats.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-secondary-100 text-secondary-700 rounded-full">
              {alternativeFormats.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' ? (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-secondary-700">
                    Looking Good!
                  </h4>
                  <p className="text-xs text-secondary-500 mt-1 max-w-xs">
                    Your prompt is well-crafted. Keep refining to achieve an even higher score.
                  </p>
                </div>
              ) : (
                <>
                  {/* High Priority */}
                  {highPriority.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">
                        High Priority
                      </h4>
                      <div className="space-y-3">
                        {highPriority.map((suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApply={() => onApplySuggestion(suggestion)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medium Priority */}
                  {mediumPriority.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                        Medium Priority
                      </h4>
                      <div className="space-y-3">
                        {mediumPriority.map((suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApply={() => onApplySuggestion(suggestion)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Low Priority */}
                  {lowPriority.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                        Nice to Have
                      </h4>
                      <div className="space-y-3">
                        {lowPriority.map((suggestion) => (
                          <SuggestionCard
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApply={() => onApplySuggestion(suggestion)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="formats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {alternativeFormats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mb-3">
                    <Layers className="w-6 h-6 text-secondary-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-secondary-700">
                    No Alternative Formats
                  </h4>
                  <p className="text-xs text-secondary-500 mt-1 max-w-xs">
                    Add more content to your prompt to see suggested formats.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {alternativeFormats.map((format) => (
                    <FormatCard
                      key={format.id}
                      format={format}
                      onSelect={() => onSelectFormat(format)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SuggestionsPanel;
