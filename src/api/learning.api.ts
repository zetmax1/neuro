import apiClient from "./client";
import type {
  AttemptSource,
  MissingPrerequisite,
  Reason,
  Role,
  TopicStatus,
  TrajectoryGroup,
} from "./types";

/** The learner-facing API of stage 6. */

export interface TrajectoryItem {
  topic_id: number;
  name: string;
  slug: string;
  group: TrajectoryGroup;
  status: TopicStatus;
  p_mastery: number;
  accuracy: number;
  reason: Reason;
  missing: MissingPrerequisite[];
}

export interface TrajectoryResponse {
  course_id: number | null;
  kb_version: number;
  groups: Record<TrajectoryGroup, TrajectoryItem[]>;
  items: TrajectoryItem[];
  next: TrajectoryItem | null;
}

export interface PathStep {
  topic_id: number;
  name: string;
  slug: string;
  status: TopicStatus;
  p_mastery: number;
}

export interface PathToResponse {
  goal_id: number;
  /** Need_s(g): what must still be mastered, in topological order. */
  need: PathStep[];
  /** The route, Need_s(g) with the goal last. */
  path: PathStep[];
  reachable: boolean;
}

export interface Mistake {
  attempt_id: number;
  question_id: number;
  question: string;
  selected_choice: { id: number; text: string };
  correct_choice: { id: number; text: string } | null;
  explanation: string;
  answered_at: string;
  source: AttemptSource;
  corrected_later: boolean;
  reviewed: boolean;
}

export interface MistakeTopic {
  topic_id: number;
  name: string;
  slug: string;
  mistakes: Mistake[];
}

export interface MistakesResponse {
  total: number;
  reviewed: number;
  review_window_hours: number;
  topics: MistakeTopic[];
}

export interface TopicAttempt {
  attempt_no: number;
  question_id: number;
  question: string;
  is_correct: boolean;
  answered_at: string;
  source: AttemptSource;
  p_hat: number | null;
  guess: number | null;
  slip: number | null;
  p_before: number | null;
  p_after: number | null;
  theta_before: number | null;
  theta_after: number | null;
  b_before: number | null;
  b_after: number | null;
  readiness_score: number | null;
  was_ready: boolean | null;
  engine_version: string;
  kb_version: number | null;
}

export interface TopicHistoryResponse {
  topic_id: number;
  name: string;
  status: TopicStatus;
  p_mastery: number;
  mastered: boolean;
  accuracy: number;
  attempts_count: number;
  theta: number;
  missing: MissingPrerequisite[];
  attempts: TopicAttempt[];
}

export interface CourseSummary {
  course_id: number;
  name: string;
  mastered: number;
  total: number;
  theta: number;
}

export interface MeSummaryResponse {
  email: string;
  name: string | null;
  role: Role;
  courses: CourseSummary[];
  topics_mastered: number;
  topics_in_review: number;
  attempts: number;
  correct: number;
  accuracy: number;
  weekly_activity: { date: string; answers: number }[];
  activity_days: number;
}

/** The chapter II constants (D29): the UI hard-codes none of them. */
export interface ModelConfigResponse {
  engine: string;
  flags: { use_irt: boolean; use_prereq_init: boolean };
  tau: number;
  delta: number;
  g_max: number;
  s_max: number;
  a_q: number;
  elo_alpha: number;
  elo_beta: number;
  lambda: number;
  c_offset: number;
  theta_clamp: number;
  defaults: { p0: number; pt: number; g0: number; s0: number };
  review_repeat_hours: number;
  statuses: TopicStatus[];
  trajectory_groups: TrajectoryGroup[];
}

export const getTrajectory = async (courseId?: number | null): Promise<TrajectoryResponse> => {
  const response = await apiClient.get("/api/learning/trajectory/", {
    params: courseId ? { course: courseId } : {},
  });
  return response.data;
};

export const getPathTo = async (topicId: number): Promise<PathToResponse> => {
  const response = await apiClient.get(`/api/learning/path-to/${topicId}/`);
  return response.data;
};

export const getMistakes = async (): Promise<MistakesResponse> => {
  const response = await apiClient.get("/api/learning/mistakes/");
  return response.data;
};

export const markMistakeReviewed = async (attemptId: number): Promise<void> => {
  await apiClient.post(`/api/learning/mistakes/${attemptId}/reviewed/`, {});
};

export const getTopicHistory = async (topicId: number | string): Promise<TopicHistoryResponse> => {
  const response = await apiClient.get(`/api/learning/topics/${topicId}/history/`);
  return response.data;
};

export const getMeSummary = async (): Promise<MeSummaryResponse> => {
  const response = await apiClient.get("/api/me/summary/");
  return response.data;
};

export const getModelConfig = async (): Promise<ModelConfigResponse> => {
  const response = await apiClient.get("/api/config/model/");
  return response.data;
};
