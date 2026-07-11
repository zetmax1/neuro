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

export interface SubmissionResponse {
  is_correct: boolean;
  explanation: string;
  mastery_level: number;
  mastery_display: string;
  mastery_percentage: number;
  streak: number;
  next_question: Question | null;
}

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
