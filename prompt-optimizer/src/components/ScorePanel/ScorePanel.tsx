// ============================================================================
// ScorePanel Component - Visual Score Display with Progress Indicators
// ============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Eye,
  Target,
  Layout,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { PromptScore, ScoreDimension, ScoreLevel } from '@/types';

// ----------------------------------------------------------------------------
// Score Level Configuration
// ----------------------------------------------------------------------------

const SCORE_COLORS: Record<ScoreLevel, { bg: string; text: string; border: string; ring: string }> = {
  [ScoreLevel.EXCELLENT]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    ring: 'ring-green-500',
  },
  [ScoreLevel.GOOD]: {
    bg: 'bg-lime-50',
    text: 'text-lime-700',
    border: 'border-lime-200',
    ring: 'ring-lime-500',
  },
  [ScoreLevel.MODERATE]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
  },
  [ScoreLevel.NEEDS_WORK]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    ring: 'ring-red-500',
  },
};

const SCORE_LABELS: Record<ScoreLevel, string> = {
  [ScoreLevel.EXCELLENT]: 'Excellent',
  [ScoreLevel.GOOD]: 'Good',
  [ScoreLevel.MODERATE]: 'Moderate',
  [ScoreLevel.NEEDS_WORK]: 'Needs Work',
};

const DIMENSION_ICONS: Record<string, React.ElementType> = {
  clarity: Eye,
  specificity: Target,
  structure: Layout,
  context: FileText,
  actionability: Zap,
  completeness: CheckCircle,
};

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface ScorePanelProps {
  score: PromptScore | null;
  isLoading?: boolean;
  showDetails?: boolean;
  onDimensionClick?: (dimension: keyof PromptScore) => void;
  className?: string;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  level: ScoreLevel;
}

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  level,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colors = SCORE_COLORS[level];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary-100"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors.text}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn('text-3xl font-bold', colors.text)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-secondary-500 font-medium">/ 100</span>
      </div>
    </div>
  );
}

interface DimensionBarProps {
  dimension: ScoreDimension;
  name: string;
  onExpand?: () => void;
  isExpanded?: boolean;
}

function DimensionBar({ dimension, name, onExpand, isExpanded }: DimensionBarProps) {
  const Icon = DIMENSION_ICONS[name] || Info;
  const colors = SCORE_COLORS[dimension.level];

  return (
    <motion.div
      layout
      className={cn(
        'p-3 rounded-lg border transition-all cursor-pointer',
        colors.bg,
        colors.border,
        'hover:shadow-md'
      )}
      onClick={onExpand}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', colors.text)} />
          <span className="text-sm font-medium text-secondary-800 capitalize">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-bold', colors.text)}>
            {dimension.score}%
          </span>
          <ChevronRight
            className={cn(
              'w-4 h-4 text-secondary-400 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colors.text.replace('text', 'bg'))}
          initial={{ width: 0 }}
          animate={{ width: `${dimension.score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-current/10"
          >
            <p className="text-xs text-secondary-600 mb-2">{dimension.feedback}</p>
            {dimension.suggestions.length > 0 && (
              <div className="space-y-1">
                {dimension.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-secondary-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-secondary-500">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function ScorePanel({
  score,
  isLoading = false,
  showDetails = true,
  onDimensionClick,
  className,
}: ScorePanelProps) {
  const [expandedDimension, setExpandedDimension] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={cn('p-6 bg-white rounded-2xl border border-secondary-200', className)}>
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
          />
          <p className="mt-4 text-sm text-secondary-500">Analyzing your prompt...</p>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className={cn('p-6 bg-white rounded-2xl border border-secondary-200', className)}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-700 mb-2">
            No Score Yet
          </h3>
          <p className="text-sm text-secondary-500 max-w-xs">
            Start typing your prompt to see real-time quality analysis and suggestions.
          </p>
        </div>
      </div>
    );
  }

  const colors = SCORE_COLORS[score.level];

  return (
    <div className={cn('p-6 bg-white rounded-2xl border border-secondary-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Quality Score</h3>
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            colors.bg,
            colors.text
          )}
        >
          {SCORE_LABELS[score.level]}
        </motion.span>
      </div>

      {/* Overall Score */}
      <div className="flex justify-center mb-8">
        <CircularProgress value={score.overall} level={score.level} />
      </div>

      {/* Score Dimensions */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-secondary-600 mb-3">
            Score Breakdown
          </h4>
          <DimensionBar
            dimension={score.clarity}
            name="clarity"
            isExpanded={expandedDimension === 'clarity'}
            onExpand={() =>
              setExpandedDimension(expandedDimension === 'clarity' ? null : 'clarity')
            }
          />
          <DimensionBar
            dimension={score.specificity}
            name="specificity"
            isExpanded={expandedDimension === 'specificity'}
            onExpand={() =>
              setExpandedDimension(
                expandedDimension === 'specificity' ? null : 'specificity'
              )
            }
          />
          <DimensionBar
            dimension={score.structure}
            name="structure"
            isExpanded={expandedDimension === 'structure'}
            onExpand={() =>
              setExpandedDimension(
                expandedDimension === 'structure' ? null : 'structure'
              )
            }
          />
          <DimensionBar
            dimension={score.context}
            name="context"
            isExpanded={expandedDimension === 'context'}
            onExpand={() =>
              setExpandedDimension(expandedDimension === 'context' ? null : 'context')
            }
          />
          <DimensionBar
            dimension={score.actionability}
            name="actionability"
            isExpanded={expandedDimension === 'actionability'}
            onExpand={() =>
              setExpandedDimension(
                expandedDimension === 'actionability' ? null : 'actionability'
              )
            }
          />
          <DimensionBar
            dimension={score.completeness}
            name="completeness"
            isExpanded={expandedDimension === 'completeness'}
            onExpand={() =>
              setExpandedDimension(
                expandedDimension === 'completeness' ? null : 'completeness'
              )
            }
          />
        </div>
      )}

      {/* Score Legend */}
      <div className="mt-6 pt-4 border-t border-secondary-100">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {Object.entries(SCORE_LABELS).map(([level, label]) => {
            const levelColors = SCORE_COLORS[level as ScoreLevel];
            return (
              <div key={level} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    levelColors.text.replace('text', 'bg')
                  )}
                />
                <span className="text-xs text-secondary-500">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ScorePanel;
