import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import QuestionDisplay from '@/components/quiz/QuestionDisplay';
import ChoiceOption from '@/components/quiz/ChoiceOption';
import { Button } from '@/components/ui/button';
import { 
  getTestSession, 
  submitTestSession, 
  TestSessionResponse, 
  SubmitTestSessionResponse, 
  Question 
} from '@/api/assessment.api';
import { 
  Loader2, 
  ArrowLeft, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const QuizSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<TestSessionResponse | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultScorecard, setResultScorecard] = useState<SubmitTestSessionResponse | null>(null);

  // Fetch Test Session Paper
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    getTestSession(id)
      .then((data) => {
        setSessionData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load test session:', err);
        setError(err?.response?.data?.detail || 'Failed to load assessment test session.');
        setIsLoading(false);
      });
  }, [id]);

  const questions: Question[] = sessionData?.questions || [];
  const currentQuestion: Question | undefined = questions[activeQuestionIndex];
  const totalQuestions = questions.length;

  const answeredCount = Object.keys(userAnswers).length;

  const handleSelectChoice = (choiceId: number) => {
    if (!currentQuestion || resultScorecard) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceId,
    }));
  };

  const handleFinalSubmit = async () => {
    if (!sessionData || !id || isSubmitting) return;

    setIsSubmitting(true);
    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      choice_id: userAnswers[q.id] || null,
    }));

    try {
      const res = await submitTestSession({
        topic_id: Number(id),
        answers: answersPayload,
      });
      setResultScorecard(res);
    } catch (err: any) {
      console.error('Error submitting test session:', err);
      alert('Error submitting test session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hotkey keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting || resultScorecard || !currentQuestion) return;

      const key = e.key.toLowerCase();

      // Choice selection (1-4 or A-D)
      if (['1', 'a'].includes(key) && currentQuestion.choices[0]) {
        handleSelectChoice(currentQuestion.choices[0].id);
      } else if (['2', 'b'].includes(key) && currentQuestion.choices[1]) {
        handleSelectChoice(currentQuestion.choices[1].id);
      } else if (['3', 'c'].includes(key) && currentQuestion.choices[2]) {
        handleSelectChoice(currentQuestion.choices[2].id);
      } else if (['4', 'd'].includes(key) && currentQuestion.choices[3]) {
        handleSelectChoice(currentQuestion.choices[3].id);
      } else if (e.key === 'ArrowLeft' && activeQuestionIndex > 0) {
        setActiveQuestionIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && activeQuestionIndex < totalQuestions - 1) {
        setActiveQuestionIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isSubmitting, resultScorecard, activeQuestionIndex, totalQuestions]);

  const getDifficultyBadge = (diff: number) => {
    if (diff === 1) return { label: 'Easy', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (diff === 2) return { label: 'Med', style: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Hard', style: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-650 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assessment Directory
          </button>

          {sessionData && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{sessionData.topic_name} — Pass Mark: {sessionData.pass_mark_percentage}%</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-semibold text-base">Preparing stratified test paper...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl shadow-sm border border-rose-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-rose-700 mb-2">Failed to Load Test</h2>
            <p className="text-slate-600 mb-6 text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
          </div>
        ) : totalQuestions === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
            <BookOpen className="w-14 h-14 text-indigo-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">No Test Questions Available</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              There are currently no active assessment questions added for this topic or its child modules.
            </p>
            <Button onClick={() => navigate('/assessment')}>Return to Assessments</Button>
          </div>
        ) : resultScorecard ? (
          /* ============================================================ */
          /* FINAL SCORECARD / EVALUATION RESULT VIEW                    */
          /* ============================================================ */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                resultScorecard.is_passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {resultScorecard.is_passed ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>

              <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${
                resultScorecard.is_passed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {resultScorecard.is_passed ? 'Passed Topic' : 'Needs Retake'}
              </span>

              <h1 className="text-3xl font-extrabold text-slate-900 mt-2 mb-1">
                {resultScorecard.is_passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h1>
              <p className="text-slate-500 text-sm">
                Topic: <strong className="text-slate-800">{resultScorecard.topic_name}</strong> (Required Grade: {resultScorecard.pass_mark_percentage}%)
              </p>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Final Weighted Score</span>
                <span className="text-3xl font-black text-indigo-600">{resultScorecard.grade_percentage}%</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Earned Points</span>
                <span className="text-3xl font-black text-slate-800">{resultScorecard.earned_points} / {resultScorecard.total_points}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Questions Evaluated</span>
                <span className="text-3xl font-black text-slate-800">{resultScorecard.total_questions}</span>
              </div>
            </div>

            {/* Difficulty Weighted Breakdown */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 shadow-inner">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Difficulty Tier Performance Breakdown (Harder = Higher Points)
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="text-xs text-emerald-400 font-bold block mb-0.5">Easy Tier (1 pt ea)</span>
                  <span className="text-lg font-extrabold">{resultScorecard.breakdown.easy.correct} / {resultScorecard.breakdown.easy.total}</span>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="text-xs text-amber-400 font-bold block mb-0.5">Medium Tier (2 pt ea)</span>
                  <span className="text-lg font-extrabold">{resultScorecard.breakdown.medium.correct} / {resultScorecard.breakdown.medium.total}</span>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <span className="text-xs text-rose-400 font-bold block mb-0.5">Hard Tier (3 pt ea)</span>
                  <span className="text-lg font-extrabold">{resultScorecard.breakdown.hard.correct} / {resultScorecard.breakdown.hard.total}</span>
                </div>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div className="mb-8">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4">Detailed Question Review</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {resultScorecard.answers_summary.map((ans, idx) => (
                  <div key={ans.question_id} className={`p-4 rounded-2xl border ${
                    ans.is_correct ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        {ans.is_correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        Question #{idx + 1} ({ans.difficulty_display} • Weight: {ans.weight} pt)
                      </span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        ans.is_correct ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {ans.is_correct ? `+${ans.points_earned} pts` : '0 pts'}
                      </span>
                    </div>
                    {ans.explanation && (
                      <p className="text-xs text-slate-600 italic bg-white/80 p-2.5 rounded-xl border border-slate-200 mt-2">
                        💡 <strong>Explanation:</strong> {ans.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full sm:w-auto px-8 rounded-xl font-bold">
                Retake Assessment
              </Button>
              <Button onClick={() => navigate('/assessment')} className="w-full sm:w-auto px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                Return to Assessments Directory
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* ACTIVE TEST SESSION PAPER VIEW                               */
          /* ============================================================ */
          <div className="space-y-6">
            
            {/* QUESTION NAVIGATOR PALETTE BAR */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  Question Navigation Palette
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                  {answeredCount} of {totalQuestions} Answered
                </span>
              </div>

              {/* Grid Pills of Questions with Difficulty Badges */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === activeQuestionIndex;
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const diffBadge = getDifficultyBadge(q.difficulty);

                  let pillClasses = "relative flex flex-col items-center justify-center p-2 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ";

                  if (isCurrent) {
                    pillClasses += "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30 scale-[1.03]";
                  } else if (isAnswered) {
                    pillClasses += "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100";
                  } else {
                    pillClasses += "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={pillClasses}
                      title={`Jump to Q${idx + 1} (${diffBadge.label})`}
                    >
                      <span className="text-sm leading-none font-black">{idx + 1}</span>
                      <span className={`text-[9px] uppercase tracking-tighter mt-1 font-bold px-1 rounded ${
                        isCurrent ? 'bg-white/20 text-white' : diffBadge.style
                      }`}>
                        {diffBadge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE QUESTION CARD */}
            {currentQuestion && (
              <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm relative">
                
                {/* Question Text & Media */}
                <QuestionDisplay question={currentQuestion} questionNumber={activeQuestionIndex + 1} />

                {/* Multiple Choice Options */}
                <div className="space-y-3.5 mb-8">
                  {currentQuestion.choices.map((choice, idx) => (
                    <ChoiceOption
                      key={choice.id}
                      choice={choice}
                      index={idx}
                      isSelected={userAnswers[currentQuestion.id] === choice.id}
                      isSubmitting={false}
                      feedback={null}
                      onSelect={handleSelectChoice}
                    />
                  ))}
                </div>

                {/* Bottom Pagination & Submit Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeQuestionIndex === 0}
                      className="rounded-xl gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      disabled={activeQuestionIndex === totalQuestions - 1}
                      className="rounded-xl gap-1.5"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || answeredCount === 0}
                    size="lg"
                    className="w-full sm:w-auto px-8 h-12 text-sm font-bold shadow-md shadow-indigo-100 rounded-xl bg-indigo-600 hover:bg-indigo-700 gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating Grade...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Final Test ({answeredCount}/{totalQuestions})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizSession;
