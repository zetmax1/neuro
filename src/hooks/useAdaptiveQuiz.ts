import { useCallback, useEffect, useRef, useState } from "react";

import {
  getNextQuestion,
  submitAnswer,
  type Question,
  type SubmissionResponse,
} from "@/api/assessment.api";
import type { MissingPrerequisite, TopicStatus } from "@/api/types";
import { useInvalidateLearnerState } from "@/hooks/useLearningData";
import { closedTopicMissing } from "@/lib/kbError";

/**
 * Adaptive practice (P0-1, addendum 2.9): one question at a time through
 * `next_question` / `submit_answer`.
 *
 * This is where the student model actually runs, so the hook is built around
 * the learner reading the result rather than the quiz rushing on:
 *
 * - after an answer the verdict and `Question.explanation` stay on screen
 *   until the learner asks for the next question. The previous version
 *   auto-advanced after 1.5 s, hiding the explanation it had just fetched;
 * - the new status and any topics the answer opened are reported, so the page
 *   can show the transition (Algorithm 2.3);
 * - a `review_repeat` answer is flagged: it was logged but changed no P(L) (D25);
 * - a closed topic answers 403 with its unmet prerequisites (TY1-TY4), which
 *   is a state the page renders, not an error.
 *
 * No difficulty badge is exposed: in practice the item is chosen by
 * |b_q - θ_s|, and showing a bucket would misdescribe it.
 */

export type Verdict = "correct" | "incorrect";

export interface AdaptiveQuizState {
  question: Question | null;
  selectedChoiceId: number | null;
  verdict: Verdict | null;
  /** The explanation of the question just answered. */
  explanation: string;
  /** The learner's state after the last answer. */
  status: TopicStatus | null;
  pMastery: number | null;
  pBefore: number | null;
  accuracy: number | null;
  attempts: number;
  openedTopics: number[];
  /** The answer repeated a question answered within the review window (D25). */
  isReviewRepeat: boolean;
  isComplete: boolean;
  hasNoQuestions: boolean;
  /** The topic is closed; these are the prerequisites in the way. */
  closedMissing: MissingPrerequisite[] | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
}

export const useAdaptiveQuiz = (topicId: number | string | undefined) => {
  const invalidate = useInvalidateLearnerState();
  const nextRef = useRef<Question | null>(null);

  const [state, setState] = useState<AdaptiveQuizState>({
    question: null,
    selectedChoiceId: null,
    verdict: null,
    explanation: "",
    status: null,
    pMastery: null,
    pBefore: null,
    accuracy: null,
    attempts: 0,
    openedTopics: [],
    isReviewRepeat: false,
    isComplete: false,
    hasNoQuestions: false,
    closedMissing: null,
    isLoading: true,
    isSubmitting: false,
    error: null,
  });

  const patch = useCallback((changes: Partial<AdaptiveQuizState>) => {
    setState((previous) => ({ ...previous, ...changes }));
  }, []);

  const load = useCallback(async () => {
    if (topicId === undefined) return;
    patch({ isLoading: true, error: null, closedMissing: null });
    try {
      const question = await getNextQuestion(topicId);
      patch({
        question,
        selectedChoiceId: null,
        verdict: null,
        explanation: "",
        isLoading: false,
      });
    } catch (error) {
      const response = (error as { response?: { status?: number; data?: { reason?: string } } }).response;
      if (response?.status === 403) {
        patch({ closedMissing: closedTopicMissing(error), isLoading: false });
        return;
      }
      if (response?.status === 404) {
        patch({
          isLoading: false,
          hasNoQuestions: response.data?.reason === "no_questions",
          isComplete: response.data?.reason !== "no_questions",
        });
        return;
      }
      patch({ isLoading: false, error: error instanceof Error ? error : new Error("request failed") });
    }
  }, [topicId, patch]);

  useEffect(() => {
    void load();
  }, [load]);

  const select = useCallback((choiceId: number) => {
    setState((previous) =>
      previous.verdict === null && !previous.isSubmitting
        ? { ...previous, selectedChoiceId: choiceId }
        : previous,
    );
  }, []);

  const submit = useCallback(async () => {
    const { question, selectedChoiceId, verdict, isSubmitting, pMastery } = state;
    if (!question || selectedChoiceId === null || verdict !== null || isSubmitting) return;

    patch({ isSubmitting: true, error: null });
    try {
      const result: SubmissionResponse = await submitAnswer(question.id, selectedChoiceId);
      nextRef.current = result.next_question;
      patch({
        verdict: result.is_correct ? "correct" : "incorrect",
        explanation: result.explanation,
        status: result.status,
        pBefore: pMastery,
        pMastery: result.p_mastery,
        accuracy: result.accuracy,
        attempts: result.attempts,
        openedTopics: result.opened_topics ?? [],
        isReviewRepeat: result.source === "review_repeat",
        isSubmitting: false,
      });
      // Other pages must not keep the previous status.
      invalidate();
    } catch (error) {
      if ((error as { response?: { status?: number } }).response?.status === 403) {
        patch({ closedMissing: closedTopicMissing(error), isSubmitting: false });
        return;
      }
      patch({
        isSubmitting: false,
        error: error instanceof Error ? error : new Error("request failed"),
      });
    }
  }, [state, patch, invalidate]);

  /** Moves on only when the learner asks; the explanation stays until then. */
  const advance = useCallback(() => {
    const next = nextRef.current;
    nextRef.current = null;
    if (next) {
      patch({
        question: next,
        selectedChoiceId: null,
        verdict: null,
        explanation: "",
        openedTopics: [],
        isReviewRepeat: false,
      });
    } else {
      patch({ isComplete: true, question: null, verdict: null });
    }
  }, [patch]);

  return { ...state, select, submit, advance, reload: load };
};

export default useAdaptiveQuiz;
