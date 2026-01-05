// ============================================================================
// ContextualQuestions Component - Dynamic Question Flow with Conditional Logic
// ============================================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  ContextualQuestion,
  ContextualAnswers,
  QuestionType,
  QuestionCategory,
} from '@/types';

// ----------------------------------------------------------------------------
// Default Questions Configuration
// ----------------------------------------------------------------------------

export const DEFAULT_QUESTIONS: ContextualQuestion[] = [
  {
    id: 'purpose',
    question: 'What is the primary purpose of this content?',
    type: QuestionType.SINGLE_SELECT,
    category: QuestionCategory.PURPOSE,
    required: true,
    order: 1,
    options: [
      { id: 'educate', label: 'Educate', value: 'educate', description: 'Teach concepts or skills' },
      { id: 'document', label: 'Document', value: 'document', description: 'Record technical details' },
      { id: 'guide', label: 'Guide', value: 'guide', description: 'Step-by-step instructions' },
      { id: 'inform', label: 'Inform', value: 'inform', description: 'Share information or updates' },
      { id: 'persuade', label: 'Persuade', value: 'persuade', description: 'Convince or recommend' },
    ],
    helpText: 'This helps determine the appropriate tone and structure.',
  },
  {
    id: 'audience_type',
    question: 'Who is the target audience?',
    type: QuestionType.SINGLE_SELECT,
    category: QuestionCategory.AUDIENCE,
    required: true,
    order: 2,
    options: [
      { id: 'developers', label: 'Developers', value: 'developers' },
      { id: 'architects', label: 'Technical Architects', value: 'architects' },
      { id: 'managers', label: 'Technical Managers', value: 'managers' },
      { id: 'mixed', label: 'Mixed Technical/Non-Technical', value: 'mixed' },
      { id: 'beginners', label: 'Beginners/Students', value: 'beginners' },
    ],
  },
  {
    id: 'experience_level',
    question: 'What is their experience level?',
    type: QuestionType.SCALE,
    category: QuestionCategory.AUDIENCE,
    required: true,
    order: 3,
    helpText: '1 = Beginner, 5 = Expert',
  },
  {
    id: 'key_topics',
    question: 'What key topics should be covered?',
    type: QuestionType.MULTI_SELECT,
    category: QuestionCategory.SCOPE,
    required: false,
    order: 4,
    options: [
      { id: 'concepts', label: 'Core Concepts', value: 'concepts' },
      { id: 'implementation', label: 'Implementation Details', value: 'implementation' },
      { id: 'best_practices', label: 'Best Practices', value: 'best_practices' },
      { id: 'troubleshooting', label: 'Troubleshooting', value: 'troubleshooting' },
      { id: 'examples', label: 'Code Examples', value: 'examples' },
      { id: 'comparisons', label: 'Comparisons/Alternatives', value: 'comparisons' },
    ],
    helpText: 'Select all that apply',
  },
  {
    id: 'include_code',
    question: 'Should the output include code examples?',
    type: QuestionType.BOOLEAN,
    category: QuestionCategory.FORMAT,
    required: false,
    order: 5,
  },
  {
    id: 'code_language',
    question: 'Which programming language(s)?',
    type: QuestionType.MULTI_SELECT,
    category: QuestionCategory.FORMAT,
    required: false,
    order: 6,
    condition: {
      questionId: 'include_code',
      operator: 'equals',
      value: 'true',
    },
    options: [
      { id: 'python', label: 'Python', value: 'python' },
      { id: 'javascript', label: 'JavaScript', value: 'javascript' },
      { id: 'typescript', label: 'TypeScript', value: 'typescript' },
      { id: 'java', label: 'Java', value: 'java' },
      { id: 'go', label: 'Go', value: 'go' },
      { id: 'rust', label: 'Rust', value: 'rust' },
      { id: 'other', label: 'Other', value: 'other' },
    ],
  },
  {
    id: 'constraints',
    question: 'Are there any specific constraints or requirements?',
    type: QuestionType.TEXTAREA,
    category: QuestionCategory.CONSTRAINTS,
    required: false,
    order: 7,
    placeholder: 'e.g., word limit, specific format, accessibility requirements...',
  },
  {
    id: 'additional_context',
    question: 'Any additional context to consider?',
    type: QuestionType.TEXTAREA,
    category: QuestionCategory.SCOPE,
    required: false,
    order: 8,
    placeholder: 'e.g., project background, related documentation, specific use cases...',
  },
];

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface ContextualQuestionsProps {
  questions?: ContextualQuestion[];
  answers: ContextualAnswers;
  onAnswer: (questionId: string, answer: ContextualAnswers[string]) => void;
  onComplete: () => void;
  currentStep?: number;
  className?: string;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

interface QuestionRendererProps {
  question: ContextualQuestion;
  value: ContextualAnswers[string] | undefined;
  onChange: (value: ContextualAnswers[string]) => void;
}

function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.type) {
    case QuestionType.SINGLE_SELECT:
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <button
              key={option.id}
              onClick={() => onChange(option.value)}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                value === option.value
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-500'
                  : 'bg-white border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-secondary-800">
                    {option.label}
                  </span>
                  {option.description && (
                    <p className="text-xs text-secondary-500 mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
                {value === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
            </button>
          ))}
        </div>
      );

    case QuestionType.MULTI_SELECT:
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {question.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.id}
                onClick={() => {
                  const newValue = isSelected
                    ? selectedValues.filter((v) => v !== option.value)
                    : [...selectedValues, option.value];
                  onChange(newValue);
                }}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3',
                  isSelected
                    ? 'bg-primary-50 border-primary-300'
                    : 'bg-white border-secondary-200 hover:border-secondary-300'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-secondary-300'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-secondary-700">{option.label}</span>
              </button>
            );
          })}
        </div>
      );

    case QuestionType.SCALE:
      const scaleValue = typeof value === 'number' ? value : 3;
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-secondary-500">Beginner</span>
            <span className="text-xs text-secondary-500">Expert</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => onChange(level)}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all',
                  scaleValue === level
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      );

    case QuestionType.BOOLEAN:
      const boolValue = value === true || value === 'true';
      return (
        <div className="flex gap-3">
          <button
            onClick={() => onChange(true)}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-all',
              boolValue
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            )}
          >
            Yes
          </button>
          <button
            onClick={() => onChange(false)}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-all',
              value === false
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            )}
          >
            No
          </button>
        </div>
      );

    case QuestionType.TEXT:
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
        />
      );

    case QuestionType.TEXTAREA:
      return (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm resize-none"
        />
      );

    default:
      return null;
  }
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export function ContextualQuestions({
  questions = DEFAULT_QUESTIONS,
  answers,
  onAnswer,
  onComplete,
  currentStep: initialStep = 0,
  className,
}: ContextualQuestionsProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Filter questions based on conditions
  const visibleQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        if (!q.condition) return true;
        const conditionValue = answers[q.condition.questionId];
        switch (q.condition.operator) {
          case 'equals':
            return String(conditionValue) === String(q.condition.value);
          case 'not_equals':
            return String(conditionValue) !== String(q.condition.value);
          case 'contains':
            return Array.isArray(conditionValue) &&
              conditionValue.some((v) =>
                Array.isArray(q.condition!.value)
                  ? q.condition!.value.includes(v)
                  : v === q.condition!.value
              );
          case 'not_contains':
            return !Array.isArray(conditionValue) ||
              !conditionValue.some((v) =>
                Array.isArray(q.condition!.value)
                  ? q.condition!.value.includes(v)
                  : v === q.condition!.value
              );
          default:
            return true;
        }
      })
      .sort((a, b) => a.order - b.order);
  }, [questions, answers]);

  const currentQuestion = visibleQuestions[currentStep];
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === visibleQuestions.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, visibleQuestions.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const canProceed = () => {
    if (!currentQuestion?.required) return true;
    const answer = answers[currentQuestion.id];
    if (answer === undefined || answer === null || answer === '') return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    return true;
  };

  if (!currentQuestion) {
    return (
      <div className={cn('p-6 bg-white rounded-2xl border border-secondary-200', className)}>
        <div className="text-center py-8">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-secondary-900">All Done!</h3>
          <p className="text-sm text-secondary-500 mt-1">
            Your answers will help optimize the prompt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl border border-secondary-200 overflow-hidden', className)}>
      {/* Progress Bar */}
      <div className="h-1 bg-secondary-100">
        <motion.div
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="p-4 border-b border-secondary-200 bg-secondary-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-secondary-600">
              Question {currentStep + 1} of {visibleQuestions.length}
            </span>
          </div>
          <span className="text-xs text-secondary-400 capitalize">
            {currentQuestion.category.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {currentQuestion.question}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>

            {currentQuestion.helpText && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 rounded-lg">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">{currentQuestion.helpText}</p>
              </div>
            )}

            <div className="mt-4">
              <QuestionRenderer
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(value) => onAnswer(currentQuestion.id, value)}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={cn(
              'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isFirstStep
                ? 'text-secondary-300 cursor-not-allowed'
                : 'text-secondary-600 hover:bg-secondary-200'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-1">
            {visibleQuestions.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  idx === currentStep
                    ? 'bg-primary-500'
                    : idx < currentStep
                    ? 'bg-primary-200'
                    : 'bg-secondary-200'
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              canProceed()
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
            )}
          >
            {isLastStep ? (
              <>
                Complete
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContextualQuestions;
