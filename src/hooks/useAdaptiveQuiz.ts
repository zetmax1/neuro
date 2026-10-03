import { useState, useCallback, useEffect } from 'react';
import { getNextQuestion, submitAnswer, Question, SubmissionResponse } from '@/api/assessment.api';
import { toast } from 'sonner';

export const useAdaptiveQuiz = (topicId: number | string | undefined) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [sessionComplete, setSessionComplete] = useState<boolean>(false);
  const [noQuestions, setNoQuestions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // D25: the last answer repeated a question answered within 24 h, so P(L) did not change.
  const [isReviewRepeat, setIsReviewRepeat] = useState<boolean>(false);

  const fetchNext = useCallback(async () => {
    if (!topicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const q = await getNextQuestion(topicId);
      setCurrentQuestion(q);
      setSelectedChoiceId(null);
      setFeedback(null);
      if (q.time_limit_seconds) {
        setTimeLeft(q.time_limit_seconds);
      } else {
        setTimeLeft(null);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        if (err.response?.data?.reason === 'no_questions') {
          setNoQuestions(true);
        } else {
          setSessionComplete(true);
        }
      } else {
        setError(err instanceof Error ? err : new Error(err?.response?.data?.detail || err?.message || 'Failed to fetch question'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);


  // Initial fetch
  useEffect(() => {
    if (topicId) {
      fetchNext();
    }
  }, [fetchNext, topicId]);

  const handleSelection = useCallback((id: number) => {
    if (!isSubmitting && feedback === null) {
      setSelectedChoiceId(id);
    }
  }, [isSubmitting, feedback]);

  const handleSubmit = useCallback(async (forcedChoiceId?: number) => {
    const activeChoiceId = forcedChoiceId !== undefined ? forcedChoiceId : selectedChoiceId;
    if (activeChoiceId === null || !currentQuestion || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const response: SubmissionResponse = await submitAnswer(currentQuestion.id, activeChoiceId);
      
      // Update UI state immediately to show correct/incorrect color feedback
      setFeedback(response.is_correct ? 'correct' : 'incorrect');
      setIsReviewRepeat(response.source === 'review_repeat');

      // The crucial UX 1.5 second delay
      setTimeout(() => {
        if (response.next_question) {
           setCurrentQuestion(response.next_question);
           setSelectedChoiceId(null);
           setFeedback(null);
           if (response.next_question.time_limit_seconds) {
             setTimeLeft(response.next_question.time_limit_seconds);
           } else {
             setTimeLeft(null);
           }
        } else {
           setSessionComplete(true);
        }
        setIsSubmitting(false);
      }, 1500);
      
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to submit answer'));
      setIsSubmitting(false);
    }
  }, [currentQuestion, selectedChoiceId, isSubmitting]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft === null || sessionComplete || feedback !== null || isLoading) return;

    if (timeLeft <= 0) {
      toast.error("Time's up! Submitting answer...");
      const fallbackChoice = selectedChoiceId !== null 
        ? selectedChoiceId 
        : (currentQuestion?.choices[0]?.id || null);
      
      if (fallbackChoice !== null) {
        handleSubmit(fallbackChoice);
      }
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, sessionComplete, feedback, isLoading, selectedChoiceId, currentQuestion, handleSubmit]);

  return {
    currentQuestion,
    selectedChoiceId,
    isSubmitting,
    feedback,
    sessionComplete,
    noQuestions,
    isLoading,
    error,
    timeLeft,
    isReviewRepeat,
    handleSelection,
    handleSubmit,
  };
};

