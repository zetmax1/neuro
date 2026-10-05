import apiClient from './client';
import type { LearnerState, NodeKind, TopicStatus } from './types';

/** One node of the learning-path tree, with this learner's state (3.4). */
export interface TopicNode extends LearnerState {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id: number | null;
  kind: NodeKind;
  tree_depth: number;
  pos: number | null;
  lev: number | null;
  position: number;
  pass_mark_percentage: number;
  test_question_count: number;
  attempts: number;
  total_duration_minutes: number;
  children: TopicNode[];
}

export interface GraphNode {
  id: string;
  label: string;
  slug?: string;
  data: {
    label: string;
    slug?: string;
    /** Stage 2 knowledge-base fields (addendum A4-2). */
    kind?: 'course' | 'section' | 'topic';
    parent?: number | null;
    pos?: number;
    depth?: number;
    /** Algorithm 2.2 level; topics only. */
    lev?: number | null;
    /**
     * The learner's state (3.4). Sections and courses hold none (D22), so
     * they report the defaults: closed with P(L) = 0.
     */
    p_mastery: number;
    accuracy: number;
    status: TopicStatus;
    mastered: boolean;
    missing_count: number;
  };
}

/** A prerequisite relation (E_P) as the instructor entered it. */
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  prerequisite_id?: number;
  weight?: number;
}

/** An edge of the inherited topic graph G_L. */
export interface LeafGraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  /** Produced only by section- or course-level relations. */
  inherited: boolean;
  /** Ids of the producing E_P relations. */
  via: number[];
}

export interface PrerequisiteGraphResponse {
  kb_version?: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  leaf_edges?: LeafGraphEdge[];
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
  kind: NodeKind;
  description: string;
  position: number;
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
