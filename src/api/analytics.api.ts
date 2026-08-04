import apiClient from './client';

export interface TopicSnapshot {
  id: string | number;
  name: string;
  mastery_level: number;
}

export interface RecentActivity {
  id: string | number;
  type: string; // e.g., 'assessment', 'study'
  description: string;
  is_correct?: boolean;
  score?: number;
  timestamp: string;
}

export interface HeatmapItem {
  topic_id: number;
  topic_name: string;
  mastery_percentage: number;
}

export interface RecommendationTopic {
  id: number;
  name: string;
  slug: string;
  description: string;
  mastery_percentage: number;
}

export interface Recommendations {
  recommended_next: RecommendationTopic | null;
  needs_revision: RecommendationTopic | null;
  ready_to_advance: RecommendationTopic | null;
  coming_soon: RecommendationTopic | null;
}

export interface DashboardOverviewData {
  total_topics: number;
  topics_unlocked: number;
  topics_mastered: number;
  mastery_ratio: number;
  total_submissions: number;
  overall_accuracy_pct: number;
  average_attempts_to_master: number | null;
  total_topics_mastered: number;
  overall_accuracy: number;
  weekly_goal_progress: number;
  current_streak: number;
  strongest_topic: TopicSnapshot | null;
  weakest_topic: TopicSnapshot | null;
  recent_activity: RecentActivity[];
  heatmap_data: HeatmapItem[];
  recommendations: Recommendations;
}

/**
 * Fetches the dashboard overview analytics data for the authenticated user.
 */
export const getDashboardOverview = async (): Promise<DashboardOverviewData> => {
  const response = await apiClient.get('/api/analytics/overview/');
  const raw = response.data;

  // Map backend structure to frontend structure
  const strongest = raw.strongest_topic
    ? {
        id: raw.strongest_topic.topic_id,
        name: raw.strongest_topic.topic_name,
        mastery_level: raw.strongest_topic.mastery_pct,
      }
    : null;

  const weakest = raw.weakest_topic
    ? {
        id: raw.weakest_topic.topic_id,
        name: raw.weakest_topic.topic_name,
        mastery_level: raw.weakest_topic.mastery_pct,
      }
    : null;

  const recent_activity = Array.isArray(raw.recent_activity)
    ? raw.recent_activity.map((act: any, idx: number) => ({
        id: idx,
        type: 'assessment',
        description: `Solved diagnostic question in ${act.topic_name}`,
        is_correct: act.is_correct,
        timestamp: act.answered_at,
      }))
    : [];

  return {
    total_topics: raw.total_topics || 0,
    topics_unlocked: raw.topics_unlocked || 0,
    topics_mastered: raw.topics_mastered || 0,
    mastery_ratio: raw.mastery_ratio || 0,
    total_submissions: raw.total_submissions || 0,
    overall_accuracy_pct: raw.overall_accuracy_pct || 0,
    average_attempts_to_master: raw.average_attempts_to_master || null,
    total_topics_mastered: raw.topics_mastered || 0,
    overall_accuracy: raw.overall_accuracy_pct || 0,
    weekly_goal_progress: Math.min(100, Math.round(((raw.total_submissions || 0) / 10) * 100)),
    current_streak: raw.current_streak !== undefined && raw.current_streak !== null ? raw.current_streak : 0,
    strongest_topic: strongest,
    weakest_topic: weakest,
    recent_activity,
    heatmap_data: raw.heatmap_data || [],
    recommendations: raw.recommendations || {
      recommended_next: null,
      needs_revision: null,
      ready_to_advance: null,
      coming_soon: null,
    },
  };
};
