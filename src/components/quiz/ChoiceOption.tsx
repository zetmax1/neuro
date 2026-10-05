import React from 'react';
import { Choice } from '@/api/assessment.api';
import { CheckCircle2, XCircle, Check } from 'lucide-react';

interface ChoiceOptionProps {
  choice: Choice;
  index: number;
  isSelected: boolean;
  isSubmitting: boolean;
  feedback: 'correct' | 'incorrect' | null;
  onSelect: (id: number) => void;
}

const ChoiceOption: React.FC<ChoiceOptionProps> = ({ 
  choice, 
  index,
  isSelected, 
  isSubmitting, 
  feedback, 
  onSelect 
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const choiceLetter = letters[index % letters.length];

  let containerClasses = "group relative w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between shadow-sm ";
  let badgeClasses = "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors mr-4 shrink-0 ";

  if (feedback && isSelected) {
    if (feedback === 'correct') {
      containerClasses += "border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20";
      badgeClasses += "bg-emerald-500 text-white shadow-sm";
    } else {
      containerClasses += "border-rose-500 bg-rose-50/90 text-rose-950 shadow-md shadow-rose-100 ring-2 ring-rose-500/20";
      badgeClasses += "bg-rose-500 text-white shadow-sm";
    }
  } else if (feedback && !isSelected) {
    containerClasses += "border-slate-100 bg-slate-50/50 opacity-50 text-slate-400 cursor-not-allowed";
    badgeClasses += "bg-slate-200 text-slate-500";
  } else {
    if (isSelected) {
      containerClasses += "border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20 scale-[1.01]";
      badgeClasses += "bg-indigo-600 text-white shadow-sm";
    } else {
      containerClasses += "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/80 text-slate-800 cursor-pointer hover:shadow-md hover:scale-[1.005]";
      badgeClasses += "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700";
    }
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(choice.id)}
      disabled={isSubmitting || feedback !== null}
      className={containerClasses}
      data-testid={`quiz-choice-${choiceLetter}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center flex-1 pr-3">
        {/* Letter Badge */}
        <div className={badgeClasses}>
          {feedback && isSelected ? (
            feedback === 'correct' ? <Check className="w-5 h-5 stroke-[3]" /> : choiceLetter
          ) : (
            choiceLetter
          )}
        </div>

        {/* Choice Text */}
        <span className="font-semibold text-base sm:text-lg leading-snug">
          {choice.text}
        </span>
      </div>

      {/* Choice Status Icon */}
      {feedback && isSelected && (
        feedback === 'correct' ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 animate-in zoom-in duration-300" />
        ) : (
          <XCircle className="w-6 h-6 text-rose-600 shrink-0 animate-in zoom-in duration-300" />
        )
      )}
    </button>
  );
};

export default ChoiceOption;
