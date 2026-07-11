import React from 'react';
import { Question } from '@/api/assessment.api';

interface QuestionDisplayProps {
  question: Question;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  const getDifficultyStyles = (diff: number) => {
    if (diff <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (diff <= 7) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 3) return 'Easy';
    if (diff <= 7) return 'Medium';
    return 'Hard';
  };

  const getMediaUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl.replace(/\/$/, '')}${filePath}`;
  };

  return (
    <div className="mb-6 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {question.topic_name}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getDifficultyStyles(question.difficulty)}`}>
          {getDifficultyLabel(question.difficulty)}
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight mb-4">
        {question.text}
      </h2>

      {/* Render optional question image illustration */}
      {question.image && (
        <div className="my-5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[320px] flex justify-center bg-slate-50 p-2">
          <img 
            src={getMediaUrl(question.image)} 
            alt="Question illustration" 
            className="object-contain max-h-[300px] rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
