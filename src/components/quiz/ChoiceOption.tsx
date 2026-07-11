import React from 'react';
import { Choice } from '@/api/assessment.api';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ChoiceOptionProps {
  choice: Choice;
  isSelected: boolean;
  isSubmitting: boolean;
  feedback: 'correct' | 'incorrect' | null;
  onSelect: (id: number) => void;
}

const ChoiceOption: React.FC<ChoiceOptionProps> = ({ 
  choice, 
  isSelected, 
  isSubmitting, 
  feedback, 
  onSelect 
}) => {
  let containerClasses = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ";
  
  if (feedback && isSelected) {
    if (feedback === 'correct') {
      containerClasses += "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-100";
    } else {
      containerClasses += "border-red-500 bg-red-50 text-red-900 shadow-sm shadow-red-100";
    }
  } else if (feedback && !isSelected) {
    containerClasses += "border-slate-100 bg-slate-50 opacity-60 text-slate-500 cursor-not-allowed";
  } else {
    if (isSelected) {
      containerClasses += "border-indigo-500 bg-indigo-50 text-indigo-900";
    } else {
      containerClasses += "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 text-slate-700 cursor-pointer";
    }
  }

  return (
    <button
      onClick={() => onSelect(choice.id)}
      disabled={isSubmitting || feedback !== null}
      className={containerClasses}
    >
      <span className="font-medium text-lg">{choice.text}</span>
      {feedback && isSelected && (
         feedback === 'correct' 
           ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
           : <XCircle className="w-6 h-6 text-red-500" />
      )}
    </button>
  );
};

export default ChoiceOption;
