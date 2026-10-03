import apiClient from './client';

export interface TopicNode {
  id: string | number;
  name: string;
  slug?: string;
  parent_id: string | number | null;
  mastery_percentage: number;
  is_unlocked: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  slug?: string;
  data: {
    label: string;
    slug?: string;
    is_unlocked: boolean;
    mastery_pct: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface PrerequisiteGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Fetches the hierarchical curriculum tree, mapping to the user's Bayesian Knowledge Tracing (BKT) state.
 */
export const getLearningPathTree = async (): Promise<TopicNode[]> => {
  const response = await apiClient.get('/api/learning_path/tree/');
  return response.data;
};

/**
 * Fetches the prerequisite dependency graph (DAG) for React Flow rendering.
 */
export const getPrerequisiteGraph = async (): Promise<PrerequisiteGraphResponse> => {
  const response = await apiClient.get('/api/curriculum/prerequisite-graph/');
  return response.data;
};

export interface StudentTopicDetail {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description: string;
  position: number;
  is_unlocked: boolean;
  pass_mark_percentage: number;
  test_question_count: number;
  total_duration_minutes: number;
}

export interface StudentTopicResource {
  id: number;
  topic: number;
  title: string;
  resource_type: 'VIDEO' | 'DOCUMENT' | 'TEXT_CONTENT';
  file: string | null;
  external_url: string;
  content: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

/**
 * Read-only topic details for students.
 */
export const getTopicDetail = async (topicId: number | string): Promise<StudentTopicDetail> => {
  const response = await apiClient.get(`/api/curriculum/topics/${topicId}/`);
  return response.data;
};

/**
 * Read-only learning resources of a topic for students.
 */
export const getTopicResources = async (topicId: number | string): Promise<StudentTopicResource[]> => {
  const response = await apiClient.get(`/api/curriculum/topics/${topicId}/resources/`);
  return response.data;
};
