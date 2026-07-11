import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAdaptiveQuiz } from '@/hooks/useAdaptiveQuiz';
import QuestionDisplay from '@/components/quiz/QuestionDisplay';
import ChoiceOption from '@/components/quiz/ChoiceOption';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Trophy, Clock } from 'lucide-react';

const QuizSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    currentQuestion,
    selectedChoiceId,
    isSubmitting,
    feedback,
    sessionComplete,
    isLoading,
    error,
    timeLeft,
    handleSelection,
    handleSubmit,
  } = useAdaptiveQuiz(id);

  // Auto-redirect back to learning path 2 seconds after completing the session
  useEffect(() => {
    if (sessionComplete) {
      const timer = setTimeout(() => {
        navigate('/learning-path');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionComplete, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <button 
          onClick={() => navigate('/learning-path')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-650 mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Curriculum
        </button>

        {sessionComplete ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Session Complete!</h1>
            <p className="text-slate-500 text-lg mb-8">
              Great job! Redirecting you back to your updated learning path...
            </p>
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          </div>
        ) : isLoading || !currentQuestion ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium text-lg">Loading adaptive question...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-8 text-center">
             <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
             <p className="text-slate-600 mb-6">{error.message}</p>
             <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Countdown Timer */}
            {timeLeft !== null && (
              <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                  <span className="text-xs font-bold text-amber-850 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Time Limit
                  </span>
                </div>
                <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
                  {timeLeft}s remaining
                </span>
              </div>
            )}

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <QuestionDisplay question={currentQuestion} />
              
              <div className="space-y-4 mb-8">
                {currentQuestion.choices.map((choice) => (
                  <ChoiceOption 
                    key={choice.id}
                    choice={choice}
                    isSelected={selectedChoiceId === choice.id}
                    isSubmitting={isSubmitting}
                    feedback={feedback}
                    onSelect={handleSelection}
                  />
                ))}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSubmit()}
                  disabled={selectedChoiceId === null || isSubmitting || feedback !== null}
                  size="lg"
                  className="w-full sm:w-auto px-12 h-13 text-md shadow-md shadow-indigo-100"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Submit Answer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizSession;
