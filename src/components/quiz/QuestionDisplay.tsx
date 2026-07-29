import React from 'react';
import { Question } from '@/api/assessment.api';
import { HelpCircle, BookOpen } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
  questionNumber?: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, questionNumber }) => {
  const getDifficultyBadge = (diff: number) => {
    if (diff <= 3) return { label: 'Easy', style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' };
    if (diff <= 7) return { label: 'Medium', style: 'bg-amber-50 text-amber-700 border-amber-200/80' };
    return { label: 'Hard', style: 'bg-rose-50 text-rose-700 border-rose-200/80' };
  };

  const difficultyInfo = getDifficultyBadge(question.difficulty);

  const getMediaUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl.replace(/\/$/, '')}${filePath}`;
  };

  return (
    <div className="mb-6 font-sans">
      {/* Top Meta Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            {question.topic_name}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${difficultyInfo.style}`}>
            {difficultyInfo.label}
          </span>
        </div>

        {questionNumber && (
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Question #{questionNumber}
          </span>
        )}
      </div>

      {/* Main Question Text */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug mb-5 tracking-tight">
        {question.text}
      </h2>

      {/* Question Image Preview */}
      {question.image && (
        <div className="my-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[360px] flex justify-center bg-slate-900/5 p-3">
          <img 
            src={getMediaUrl(question.image)} 
            alt="Question Diagram" 
            className="object-contain max-h-[330px] rounded-xl shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
