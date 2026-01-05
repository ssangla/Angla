// ============================================================================
// PromptInput Component - Main Prompt Editor with Syntax Highlighting
// ============================================================================

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Code,
  BookOpen,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { PromptCategory, TechnicalDomain } from '@/types';

// ----------------------------------------------------------------------------
// Auto-suggestion Data
// ----------------------------------------------------------------------------

const PROMPT_STARTERS = [
  { text: 'Write documentation for', category: PromptCategory.DOCUMENTATION },
  { text: 'Create a user manual for', category: PromptCategory.USER_MANUAL },
  { text: 'Develop an instructional guide on', category: PromptCategory.INSTRUCTIONAL_GUIDE },
  { text: 'Write a technical blog post about', category: PromptCategory.TECHNICAL_BLOG },
  { text: 'Generate a research paper on', category: PromptCategory.RESEARCH_PAPER },
  { text: 'Create API documentation for', category: PromptCategory.API_DOCUMENTATION },
  { text: 'Write a technical whitepaper about', category: PromptCategory.WHITEPAPER },
  { text: 'Create a step-by-step tutorial for', category: PromptCategory.TUTORIAL },
];

const CATEGORY_ICONS: Record<PromptCategory, React.ElementType> = {
  [PromptCategory.DOCUMENTATION]: FileText,
  [PromptCategory.USER_MANUAL]: BookOpen,
  [PromptCategory.INSTRUCTIONAL_GUIDE]: BookOpen,
  [PromptCategory.TECHNICAL_BLOG]: FileText,
  [PromptCategory.RESEARCH_PAPER]: FileText,
  [PromptCategory.API_DOCUMENTATION]: Code,
  [PromptCategory.WHITEPAPER]: FileText,
  [PromptCategory.TUTORIAL]: BookOpen,
  [PromptCategory.CASE_STUDY]: FileText,
  [PromptCategory.OTHER]: FileText,
};

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showLineNumbers?: boolean;
  detectedCategory?: PromptCategory | null;
  detectedDomain?: TechnicalDomain | null;
  isAnalyzing?: boolean;
  className?: string;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter your technical writing prompt...',
  disabled = false,
  autoFocus = true,
  showLineNumbers = true,
  detectedCategory,
  detectedDomain,
  isAnalyzing = false,
  className,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(PROMPT_STARTERS);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [lineCount, setLineCount] = useState(1);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(200, textareaRef.current.scrollHeight)}px`;
      setLineCount(value.split('\n').length);
    }
  }, [value]);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.length > 0 && value.length < 50) {
      const filtered = PROMPT_STARTERS.filter((s) =>
        s.text.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else if (value.length === 0) {
      setFilteredSuggestions(PROMPT_STARTERS);
      setShowSuggestions(false);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSuggestions) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const suggestion = filteredSuggestions[selectedSuggestionIndex];
          if (suggestion) {
            onChange(suggestion.text + ' ');
            setShowSuggestions(false);
          }
        } else if (e.key === 'Escape') {
          setShowSuggestions(false);
        }
      } else if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault();
        onSubmit?.();
      }
    },
    [showSuggestions, filteredSuggestions, selectedSuggestionIndex, onChange, onSubmit]
  );

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: typeof PROMPT_STARTERS[0]) => {
    onChange(suggestion.text + ' ');
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Get syntax highlighted content
  const getHighlightedContent = () => {
    return value
      .replace(
        /\*\*(.*?)\*\*/g,
        '<span class="text-primary-600 font-semibold">**$1**</span>'
      )
      .replace(
        /`([^`]+)`/g,
        '<span class="bg-secondary-100 text-secondary-800 px-1 rounded font-mono text-sm">`$1`</span>'
      )
      .replace(
        /^(#{1,3})\s+(.+)$/gm,
        '<span class="text-primary-700 font-bold">$1 $2</span>'
      )
      .replace(
        /^[-*]\s+(.+)$/gm,
        '<span class="text-secondary-600">• $1</span>'
      );
  };

  const CategoryIcon = detectedCategory ? CATEGORY_ICONS[detectedCategory] : Sparkles;

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-secondary-900">
            Your Prompt
          </h2>
        </div>
        {(detectedCategory || detectedDomain) && (
          <div className="flex items-center gap-2">
            {detectedCategory && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full"
              >
                <CategoryIcon className="w-3 h-3" />
                {detectedCategory.replace(/_/g, ' ')}
              </motion.span>
            )}
            {detectedDomain && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-full"
              >
                {detectedDomain.replace(/_/g, ' ')}
              </motion.span>
            )}
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div className="relative bg-white border border-secondary-200 rounded-xl shadow-soft overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
        <div className="flex">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="flex-shrink-0 w-12 bg-secondary-50 border-r border-secondary-200 py-4 select-none">
              {Array.from({ length: lineCount }, (_, i) => (
                <div
                  key={i}
                  className="text-right pr-3 text-xs text-secondary-400 font-mono leading-6"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => value.length === 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              className={cn(
                'w-full min-h-[200px] p-4 font-mono text-sm leading-6 resize-none',
                'bg-transparent text-secondary-900 placeholder-secondary-400',
                'focus:outline-none',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              spellCheck={false}
            />

            {/* Analyzing Indicator */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                  Analyzing...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between px-4 py-2 bg-secondary-50 border-t border-secondary-200">
          <div className="flex items-center gap-4 text-xs text-secondary-500">
            <span>{value.length} characters</span>
            <span>{value.split(/\s+/).filter(Boolean).length} words</span>
            <span>{lineCount} lines</span>
          </div>
          <div className="text-xs text-secondary-400">
            <kbd className="px-1.5 py-0.5 bg-secondary-200 rounded text-secondary-600">
              ⌘
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-secondary-200 rounded text-secondary-600">
              Enter
            </kbd>
            {' to analyze'}
          </div>
        </div>
      </div>

      {/* Auto-suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-secondary-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Prompt Starters
              </div>
              {filteredSuggestions.map((suggestion, index) => {
                const Icon = CATEGORY_ICONS[suggestion.category];
                return (
                  <button
                    key={suggestion.text}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      index === selectedSuggestionIndex
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-secondary-50 text-secondary-700'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{suggestion.text}</span>
                    <span className="ml-auto text-xs text-secondary-400 px-2 py-0.5 bg-secondary-100 rounded">
                      {suggestion.category.replace(/_/g, ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PromptInput;
