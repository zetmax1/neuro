import apiClient from "./client";
import type { TopicStatus } from "./types";
import type { TrajectoryItem } from "./learning.api";
import type { TrajectoryGroup } from "./types";

/**
 * Dashboard analytics.
 *
 * The four heuristics the dashboard used to compute are gone (stage 6): what
 * to do next comes from the trajectory service, in the four groups of
 * Algorithm 2.5. Every figure here is read from the API — nothing is derived
 * in the browser (D23).
 */

export interface TopicSnapshot {
  topic_id: number;
  topic_name: string;
  topic_slug: string;
  p_mastery: number;
}

export interface RecentActivity {
  topic_name: string;
  is_correct: boolean;
  answered_at: string;
}

export interface HeatmapItem {
  topic_id: number;
  topic_name: string;
  p_mastery: number;
  status: TopicStatus;
}

export interface DashboardOverviewData {
  total_topics: number;
  topics_unlocked: number;
  topics_mastered: number;
  mastery_ratio: number;
  total_submissions: number;
  overall_accuracy_pct: number;
  average_attempts_to_master: number | null;
  current_streak: number;
  strongest_topic: TopicSnapshot | null;
  weakest_topic: TopicSnapshot | null;
  recent_activity: RecentActivity[];
  heatmap_data: HeatmapItem[];
  trajectory: {
    groups: Record<TrajectoryGroup, TrajectoryItem[]>;
    next: TrajectoryItem | null;
  };
}

export const getDashboardOverview = async (): Promise<DashboardOverviewData> => {
  const response = await apiClient.get<DashboardOverviewData>("/api/analytics/overview/");
  return response.data;
};

export interface TopicDiagnostics {
  topic_id: number;
  topic_name: string;
  current_theta: number;
  mastery_trend: {
    attempt_number: number;
    timestamp: string;
    mastery_probability: number;
    mastery_pct: number;
    algorithm_used: string;
  }[];
  recent_items: {
    question_id: number;
    irt_difficulty: number;
    was_correct: boolean;
    theta_at_time: number;
    answered_at: string;
  }[];
  avg_recent_difficulty: number | null;
}

export const getTopicDiagnostics = async (topicId: number | string): Promise<TopicDiagnostics> => {
  const response = await apiClient.get(`/api/analytics/topic/${topicId}/diagnostics/`);
  return response.data;
};
