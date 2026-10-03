import apiClient from './client';

export interface Choice {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  difficulty: number;
  difficulty_display: string;
  topic_id: number;
  topic_name: string;
  topic_slug: string;
  image?: string | null;
  time_limit_seconds?: number | null;
  choices: Choice[];
}

/** Ledger source of an answer. `review_repeat` answers do not change P(L) (D25). */
export type AttemptSource =
  | 'adaptive'
  | 'test_session'
  | 'review_repeat'
  | 'seed'
  | 'simulated'
  | 'legacy';

export interface SubmissionResponse {
  is_correct: boolean;
  explanation: string;
  mastery_level: number;
  mastery_display: string;
  mastery_percentage: number;
  streak: number;
  next_question: Question | null;
  source: AttemptSource;
  attempt_no: number;
}

export interface AssessmentTest {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent_name: string | null;
  question_count: number;
  is_unlocked: boolean;
  mastery_percentage: number;
  difficulty_level: 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
  estimated_minutes: number;
}

/**
 * Fetches all available assessment tests with meta details, difficulty, and mastery.
 */
export const getAssessmentTests = async (): Promise<AssessmentTest[]> => {
  const response = await apiClient.get('/api/assessments/tests/');
  return response.data;
};

/**
 * Fetches the next adaptive question for a given topic.
 */
export const getNextQuestion = async (topicId: number | string): Promise<Question> => {
  const response = await apiClient.get(`/api/assessments/next_question/`, {
    params: { topic_id: topicId }
  });
  return response.data;
};

/**
 * Submits the user's answer and evaluates Bayesian mastery state.
 */
export const submitAnswer = async (questionId: number, choiceId: number): Promise<SubmissionResponse> => {
  const response = await apiClient.post(`/api/assessments/submit_answer/`, {
    question_id: questionId,
    choice_id: choiceId
  });
  return response.data;
};

export interface TestSessionResponse {
  topic_id: number;
  topic_name: string;
  pass_mark_percentage: number;
  test_question_count: number;
  configured_target_count: number;
  questions: Question[];
}

export interface SubmitTestSessionPayload {
  topic_id: number;
  answers: { question_id: number; choice_id: number | null }[];
}

export interface SubmitTestSessionResponse {
  /** Stored TestSessionResult; the grade is not a mastery probability (D7). */
  session_id: number;
  topic_id: number;
  topic_name: string;
  total_questions: number;
  total_points: number;
  earned_points: number;
  grade_percentage: number;
  pass_mark_percentage: number;
  is_passed: boolean;
  breakdown: {
    easy: { correct: number; total: number; points: number };
    medium: { correct: number; total: number; points: number };
    hard: { correct: number; total: number; points: number };
  };
  answers_summary: {
    question_id: number;
    difficulty: number;
    difficulty_display: string;
    is_correct: boolean;
    weight: number;
    points_earned: number;
    explanation: string;
  }[];
}

/**
 * Fetches the full test session paper (stratified questions, pass mark config) for a topic.
 */
export const getTestSession = async (topicId: number | string): Promise<TestSessionResponse> => {
  const response = await apiClient.get('/api/assessments/test_session/', {
    params: { topic_id: topicId }
  });
  return response.data;
};

/**
 * Submits the completed test session paper for difficulty-weighted evaluation.
 */
export const submitTestSession = async (payload: SubmitTestSessionPayload): Promise<SubmitTestSessionResponse> => {
  const response = await apiClient.post('/api/assessments/submit_test_session/', payload);
  return response.data;
};


