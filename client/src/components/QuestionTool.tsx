import React, { useEffect, useMemo, useState } from 'react';
import { 
  HelpCircle, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export type QuestionOption = {
  id: string;
  label: string;
  icon?: string;
  description?: string;
};

export type QuestionConfig = {
  kind: 'single' | 'multi' | 'text';
  title: string;
  description?: string;
  options?: QuestionOption[];
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  minSelections?: number;
  maxSelections?: number;
  placeholder?: string;
};

export type QuestionAnswer = {
  kind: 'single' | 'multi' | 'text' | 'skip';
  selectedIds?: string[];
  text?: string;
};

const QUESTION_CUSTOM_ID = '__custom__';

function optionBadge(idx: number) {
  return String.fromCharCode(65 + idx);
}

function formatAnswer(answer: QuestionAnswer, question?: QuestionConfig) {
  if (answer.kind === 'skip') return 'Skipped';
  if (answer.kind === 'text') return answer.text || 'Answered';
  
  if (answer.selectedIds?.length && question?.options) {
    const labels = answer.selectedIds.map(id => {
      const opt = question.options?.find(o => o.id === id);
      return opt ? opt.label : id;
    });
    const labelStr = labels.join(', ');
    if (answer.text) return `${labelStr} (${answer.text})`;
    return labelStr;
  }

  const ids = answer.selectedIds?.length ? answer.selectedIds.join(', ') : '';
  if (answer.text) return ids ? `${ids} (${answer.text})` : answer.text;
  return ids || 'Answered';
}

export interface QuestionPromptProps {
  questions: QuestionConfig[];
  questionIndex?: number;
  totalQuestions?: number;
  onPreviousQuestion?: () => void;
  onNextQuestion?: () => void;
  initialAnswer?: QuestionAnswer;
  submitLabel?: string;
  nextLabel?: string;
  skipLabel?: string;
  allowSkip?: boolean;
  onSubmit: (answer: QuestionAnswer) => void;
  onSkip?: () => void;
  className?: string;
}

export function QuestionPrompt({
  questions,
  questionIndex = 1,
  totalQuestions,
  onPreviousQuestion,
  onNextQuestion,
  submitLabel = 'Confirm & View Results',
  nextLabel = 'Next Question',
  skipLabel = 'Skip',
  allowSkip = false,
  initialAnswer,
  onSubmit,
  onSkip,
  className = '',
}: QuestionPromptProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const [textValue, setTextValue] = useState('');
  
  const resolvedTotal = totalQuestions ?? questions.length;
  const clampedIndex = Math.max(1, Math.min(questionIndex, resolvedTotal));
  const activeQuestion = questions[clampedIndex - 1];
  const customEnabled = activeQuestion?.allowCustom ?? false;
  const isLastQuestion = clampedIndex >= resolvedTotal;
  const primaryLabel = isLastQuestion ? submitLabel : nextLabel;

  useEffect(() => {
    if (!initialAnswer || initialAnswer.kind === 'skip') {
      setSelectedIds([]);
      setCustomText('');
      setTextValue('');
      return;
    }

    if (activeQuestion?.kind === 'text') {
      setSelectedIds([]);
      setCustomText('');
      setTextValue(initialAnswer.text ?? '');
      return;
    }

    const nextSelected = new Set(initialAnswer.selectedIds ?? []);
    const nextCustomText = initialAnswer.text ?? '';
    if (customEnabled && nextCustomText.trim().length > 0) {
      nextSelected.add(QUESTION_CUSTOM_ID);
    }
    setSelectedIds(Array.from(nextSelected));
    setCustomText(nextCustomText);
    setTextValue('');
  }, [
    activeQuestion?.kind,
    clampedIndex,
    customEnabled,
    initialAnswer?.kind,
    initialAnswer?.text,
    initialAnswer?.selectedIds?.join('|'),
  ]);

  const canSubmit = useMemo(() => {
    if (activeQuestion?.kind === 'text') return textValue.trim().length > 0;

    const selectedNonCustom = selectedIds.filter(id => id !== QUESTION_CUSTOM_ID).length;
    const hasCustomText = customText.trim().length > 0;
    const total = selectedNonCustom + (hasCustomText ? 1 : 0);

    if (activeQuestion?.kind === 'single') {
      return total === 1;
    }

    const min = activeQuestion?.minSelections ?? 1;
    const max = activeQuestion?.maxSelections;
    if (total < min) return false;
    if (typeof max === 'number' && total > max) return false;
    return total > 0;
  }, [
    activeQuestion?.kind,
    activeQuestion?.minSelections,
    activeQuestion?.maxSelections,
    selectedIds,
    customText,
    textValue,
  ]);

  const toggleMulti = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSingleSelect = (id: string) => {
    setSelectedIds([id]);
    if (customEnabled) setCustomText('');
  };

  const handleCustomTextChange = (nextValue: string) => {
    setCustomText(nextValue);
    if (!activeQuestion) return;
    if (activeQuestion.kind === 'single') {
      setSelectedIds(nextValue.trim().length > 0 ? [QUESTION_CUSTOM_ID] : []);
      return;
    }
    setSelectedIds(prev => {
      const hasCustom = prev.includes(QUESTION_CUSTOM_ID);
      if (nextValue.trim().length > 0 && !hasCustom) {
        return [...prev, QUESTION_CUSTOM_ID];
      }
      if (nextValue.trim().length === 0 && hasCustom) {
        return prev.filter(id => id !== QUESTION_CUSTOM_ID);
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (!canSubmit || !activeQuestion) return;
    if (activeQuestion.kind === 'text') {
      onSubmit({ kind: 'text', text: textValue.trim() });
      return;
    }

    const selectedNonCustom = selectedIds.filter(id => id !== QUESTION_CUSTOM_ID);
    const answerText = customText.trim() || undefined;
    onSubmit({
      kind: activeQuestion.kind,
      selectedIds: selectedNonCustom,
      text: answerText || undefined,
    });
  };

  const handleSkip = () => {
    onSkip?.();
    onSubmit({ kind: 'skip' });
  };

  if (!activeQuestion) return null;

  return (
    <div className={`p-4 space-y-3.5 bg-white ${className}`}>
      {/* Question Title & Step Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 text-xs font-bold inline-flex items-center justify-center">
              {clampedIndex}
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">
              {activeQuestion.title}
            </h4>
          </div>
          {activeQuestion.description && (
            <p className="text-xs text-slate-500 pl-7 leading-relaxed">
              {activeQuestion.description}
            </p>
          )}
        </div>
      </div>

      {/* Choice Options List with 21st.dev Letter Badges (A, B, C, D) */}
      {activeQuestion.kind !== 'text' && (activeQuestion.options?.length ?? 0) > 0 && (
        <div className="space-y-2 pt-1">
          {activeQuestion.options!.map((option, idx) => {
            const checked = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (activeQuestion.kind === 'single') {
                    handleSingleSelect(option.id);
                  } else {
                    toggleMulti(option.id);
                  }
                }}
                className={`w-full text-left rounded-2xl p-3 flex items-start gap-3 border transition-all cursor-pointer ${
                  checked
                    ? 'bg-sky-50/90 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-200'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700'
                }`}
              >
                {/* 21st.dev Letter Badge */}
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold inline-flex items-center justify-center shrink-0 border transition-colors mt-0.5 ${
                    checked
                      ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {checked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : optionBadge(idx)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    {option.icon && <span className="text-base">{option.icon}</span>}
                    <span>{option.label}</span>
                  </div>
                  {option.description && (
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Optional Custom Free-Text Input */}
          {customEnabled && (
            <div className="pt-1 flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-lg text-xs font-bold inline-flex items-center justify-center shrink-0 border ${
                  selectedIds.includes(QUESTION_CUSTOM_ID)
                    ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {optionBadge(activeQuestion.options!.length)}
              </span>
              <input
                value={customText}
                onChange={e => handleCustomTextChange(e.target.value)}
                placeholder={activeQuestion.customPlaceholder ?? 'Other (type your answer)'}
                className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-400 px-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          )}
        </div>
      )}

      {/* Textarea for kind === 'text' */}
      {activeQuestion.kind === 'text' && (
        <textarea
          value={textValue}
          onChange={e => setTextValue(e.target.value)}
          placeholder={activeQuestion.placeholder ?? 'Describe in detail...'}
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-400 p-3 text-xs text-slate-900 outline-none resize-none transition-all"
        />
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
        {allowSkip ? (
          <button
            type="button"
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {skipLabel}
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-sky-500/20 flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>{primaryLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export type QuestionToolPart = {
  type: string;
  toolCallId?: string;
  state?: string;
  input?: {
    questions: QuestionConfig[];
    questionIndex?: number;
    totalQuestions?: number;
    onPreviousQuestion?: () => void;
    onNextQuestion?: () => void;
    submitLabel?: string;
    nextLabel?: string;
    skipLabel?: string;
    allowSkip?: boolean;
    onSubmitAnswer?: (answer: QuestionAnswer) => void;
    onAllCompleted?: (answers: Record<number, QuestionAnswer>) => void;
  };
  output?: {
    answer?: QuestionAnswer;
  };
};

export type QuestionToolProps = {
  part: QuestionToolPart;
  onReset?: () => void;
};

export function QuestionTool({ part, onReset }: QuestionToolProps) {
  const [localIndex, setLocalIndex] = useState(part.input?.questionIndex ?? 1);
  const questions: QuestionConfig[] = part.input?.questions ?? [];
  const totalQuestions = part.input?.totalQuestions ?? questions.length;
  const isControlled = typeof part.input?.questionIndex === 'number';
  const questionIndex = isControlled
    ? (part.input?.questionIndex ?? 1)
    : questions.length > 0
    ? localIndex
    : (part.input?.questionIndex ?? 1);
  const clampedIndex = Math.max(1, Math.min(questionIndex, totalQuestions));
  const question = questions[clampedIndex - 1];
  const [localAnswers, setLocalAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof part.input?.questionIndex === 'number') {
      setLocalIndex(part.input.questionIndex);
    }
  }, [part.input?.questionIndex]);

  useEffect(() => {
    setLocalAnswers({});
    setLocalIndex(part.input?.questionIndex ?? 1);
  }, [part.toolCallId]);

  if (!question && totalQuestions === 0) return null;

  const answeredCount = Object.keys(localAnswers).length;
  const isComplete = totalQuestions > 0 && answeredCount >= totalQuestions;
  const showNavigation = totalQuestions > 1 && !isComplete;
  const canGoPrev = clampedIndex > 1;
  const canGoNext = clampedIndex < totalQuestions;

  const summaryText = useMemo(() => {
    if (answeredCount === 0) return '';
    return Array.from({ length: totalQuestions }, (_, idx) => {
      const qNum = idx + 1;
      const ans = localAnswers[qNum];
      const q = questions[idx];
      return ans ? `${formatAnswer(ans, q)}` : 'Pending';
    }).join(' • ');
  }, [localAnswers, totalQuestions, questions, answeredCount]);

  const goPrev = () => {
    if (!canGoPrev) return;
    part.input?.onPreviousQuestion?.();
    if (!isControlled) {
      setLocalIndex(prev => Math.max(1, prev - 1));
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    part.input?.onNextQuestion?.();
    if (!isControlled) {
      setLocalIndex(prev => Math.min(totalQuestions, prev + 1));
    }
  };

  return (
    <div className="rounded-2xl border border-sky-200/80 bg-white/95 backdrop-blur-md overflow-hidden shadow-sm transition-all">
      {/* 21st.dev Tool Header Bar */}
      <div className="h-8 border-b border-sky-100 bg-sky-50/60 px-3.5 flex items-center justify-between text-xs text-slate-600">
        <div className="inline-flex items-center gap-1.5 font-bold text-sky-900">
          <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
          <span>Interactive Clinical Clarification</span>
        </div>

        {showNavigation && (
          <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-sky-100 disabled:opacity-30 cursor-pointer"
              aria-label="Previous question"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span>
              {clampedIndex} of {totalQuestions}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-sky-100 disabled:opacity-30 cursor-pointer"
              aria-label="Next question"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isComplete && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[11px] text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isCollapsed ? 'Review Questions' : 'Hide Details'}</span>
            {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Completed State vs Active QuestionPrompt */}
      {isComplete && isCollapsed ? (
        <div className="p-3.5 text-xs text-slate-700 bg-emerald-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span className="font-semibold text-slate-900">{summaryText}</span>
          </div>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Redo
            </button>
          )}
        </div>
      ) : (
        question && (
          <QuestionPrompt
            key={`${clampedIndex}-${question.title}`}
            questions={questions}
            questionIndex={clampedIndex}
            totalQuestions={totalQuestions}
            initialAnswer={localAnswers[clampedIndex]}
            submitLabel={part.input?.submitLabel}
            nextLabel={part.input?.nextLabel}
            skipLabel={part.input?.skipLabel}
            allowSkip={part.input?.allowSkip}
            onSubmit={(nextAnswer) => {
              const updatedAnswers = {
                ...localAnswers,
                [clampedIndex]: nextAnswer,
              };
              setLocalAnswers(updatedAnswers);
              part.input?.onSubmitAnswer?.(nextAnswer);

              if (clampedIndex < totalQuestions) {
                goNext();
              } else {
                part.input?.onAllCompleted?.(updatedAnswers);
              }
            }}
          />
        )
      )}
    </div>
  );
}

export default QuestionTool;
