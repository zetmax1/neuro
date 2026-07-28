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
