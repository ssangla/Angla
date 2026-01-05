// ============================================================================
// RefinementPanel Component - Prompt Refinement Options
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  MessageSquare,
  Ruler,
  Users,
  ListChecks,
  FileCode,
  BookOpen,
  RefreshCw,
  Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  RefinementOptions,
  PromptTone,
  PromptLength,
  AudienceLevel,
  StructureFormat,
} from '@/types';

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const TONE_OPTIONS: { value: PromptTone; label: string; description: string }[] = [
  { value: PromptTone.FORMAL, label: 'Formal', description: 'Official documentation style' },
  { value: PromptTone.PROFESSIONAL, label: 'Professional', description: 'Business communication' },
  { value: PromptTone.CONVERSATIONAL, label: 'Conversational', description: 'Friendly and approachable' },
  { value: PromptTone.TECHNICAL, label: 'Technical', description: 'Expert-level precision' },
  { value: PromptTone.EDUCATIONAL, label: 'Educational', description: 'Teaching and explaining' },
  { value: PromptTone.PERSUASIVE, label: 'Persuasive', description: 'Compelling and action-oriented' },
];

const LENGTH_OPTIONS: { value: PromptLength; label: string; wordRange: string }[] = [
  { value: PromptLength.CONCISE, label: 'Concise', wordRange: '< 300 words' },
  { value: PromptLength.MODERATE, label: 'Moderate', wordRange: '300-800 words' },
  { value: PromptLength.DETAILED, label: 'Detailed', wordRange: '800-1500 words' },
  { value: PromptLength.COMPREHENSIVE, label: 'Comprehensive', wordRange: '1500+ words' },
];

const AUDIENCE_OPTIONS: { value: AudienceLevel; label: string; icon: React.ElementType }[] = [
  { value: AudienceLevel.BEGINNER, label: 'Beginner', icon: BookOpen },
  { value: AudienceLevel.INTERMEDIATE, label: 'Intermediate', icon: Users },
  { value: AudienceLevel.ADVANCED, label: 'Advanced', icon: FileCode },
  { value: AudienceLevel.EXPERT, label: 'Expert', icon: Sliders },
  { value: AudienceLevel.MIXED, label: 'Mixed', icon: Users },
];

const STRUCTURE_OPTIONS: { value: StructureFormat; label: string }[] = [
  { value: StructureFormat.FREEFORM, label: 'Freeform' },
  { value: StructureFormat.NUMBERED_LIST, label: 'Numbered List' },
  { value: StructureFormat.BULLET_POINTS, label: 'Bullet Points' },
  { value: StructureFormat.SECTIONS, label: 'Sections' },
  { value: StructureFormat.TEMPLATE_BASED, label: 'Template Based' },
];

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface RefinementPanelProps {
  options: RefinementOptions;
  onChange: (options: RefinementOptions) => void;
  onApply: () => void;
  disabled?: boolean;
  className?: string;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

interface OptionGroupProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function OptionGroup({ title, icon: Icon, children }: OptionGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary-500" />
        <h4 className="text-sm font-medium text-secondary-700">{title}</h4>
      </div>
      {children}
    </div>
  );
}

interface SelectButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function SelectButton({ selected, onClick, children, className }: SelectButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-2 rounded-lg text-xs font-medium transition-all',
        selected
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200',
        className
      )}
    >
      {children}
    </button>
  );
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors"
    >
      <div className="text-left">
        <span className="text-sm font-medium text-secondary-700">{label}</span>
        {description && (
          <p className="text-xs text-secondary-500 mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={cn(
          'w-10 h-6 rounded-full transition-colors flex items-center px-1',
          enabled ? 'bg-primary-500' : 'bg-secondary-300'
        )}
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full shadow-sm"
          animate={{ x: enabled ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function RefinementPanel({
  options,
  onChange,
  onApply,
  disabled = false,
  className,
}: RefinementPanelProps) {
  const updateOption = <K extends keyof RefinementOptions>(
    key: K,
    value: RefinementOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className={cn('bg-white rounded-2xl border border-secondary-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-secondary-900">Refinement</h3>
          </div>
          <button
            onClick={onApply}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              disabled
                ? 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Apply Changes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
        {/* Tone Selection */}
        <OptionGroup title="Tone" icon={MessageSquare}>
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((tone) => (
              <button
                key={tone.value}
                onClick={() => updateOption('tone', tone.value)}
                className={cn(
                  'p-3 rounded-lg text-left transition-all border',
                  options.tone === tone.value
                    ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500'
                    : 'bg-white border-secondary-200 hover:border-secondary-300'
                )}
              >
                <span className="text-sm font-medium text-secondary-800">
                  {tone.label}
                </span>
                <p className="text-xs text-secondary-500 mt-0.5">
                  {tone.description}
                </p>
                {options.tone === tone.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <Check className="w-4 h-4 text-primary-500" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </OptionGroup>

        {/* Length Selection */}
        <OptionGroup title="Length" icon={Ruler}>
          <div className="flex flex-wrap gap-2">
            {LENGTH_OPTIONS.map((length) => (
              <SelectButton
                key={length.value}
                selected={options.length === length.value}
                onClick={() => updateOption('length', length.value)}
              >
                <span>{length.label}</span>
                <span className="ml-1 opacity-70">({length.wordRange})</span>
              </SelectButton>
            ))}
          </div>
        </OptionGroup>

        {/* Audience Level */}
        <OptionGroup title="Target Audience" icon={Users}>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((audience) => {
              const Icon = audience.icon;
              return (
                <SelectButton
                  key={audience.value}
                  selected={options.audienceLevel === audience.value}
                  onClick={() => updateOption('audienceLevel', audience.value)}
                  className="flex items-center gap-1.5"
                >
                  <Icon className="w-3 h-3" />
                  {audience.label}
                </SelectButton>
              );
            })}
          </div>
        </OptionGroup>

        {/* Structure Format */}
        <OptionGroup title="Structure Format" icon={ListChecks}>
          <div className="flex flex-wrap gap-2">
            {STRUCTURE_OPTIONS.map((structure) => (
              <SelectButton
                key={structure.value}
                selected={options.structureFormat === structure.value}
                onClick={() => updateOption('structureFormat', structure.value)}
              >
                {structure.label}
              </SelectButton>
            ))}
          </div>
        </OptionGroup>

        {/* Toggle Options */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-700 mb-3">
            Additional Options
          </h4>
          <Toggle
            enabled={options.includeExamples}
            onChange={(val) => updateOption('includeExamples', val)}
            label="Include Examples"
            description="Add example outputs or code snippets"
          />
          <Toggle
            enabled={options.includeConstraints}
            onChange={(val) => updateOption('includeConstraints', val)}
            label="Include Constraints"
            description="Specify limitations and requirements"
          />
          <Toggle
            enabled={options.includeContext}
            onChange={(val) => updateOption('includeContext', val)}
            label="Include Context"
            description="Add background and audience info"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <p className="text-xs text-secondary-500 text-center">
          Adjustments will be applied to optimize your prompt for better results.
        </p>
      </div>
    </div>
  );
}

export default RefinementPanel;
