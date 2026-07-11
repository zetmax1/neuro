import apiClient from './client';

export interface TopicNode {
  id: string | number;
  name: string;
  parent_id: string | number | null;
  mastery_percentage: number;
  is_unlocked: boolean;
}

/**
 * Fetches the hierarchical curriculum tree, mapping to the user's Bayesian Knowledge Tracing (BKT) state.
 */
export const getLearningPathTree = async (): Promise<TopicNode[]> => {
  const response = await apiClient.get('/api/learning_path/tree/');
  return response.data;
};
