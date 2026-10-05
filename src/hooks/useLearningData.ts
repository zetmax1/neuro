import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDashboardOverview } from "@/api/analytics.api";
import { getLearningPathTree, getPrerequisiteGraph } from "@/api/curriculum.api";
import {
  getMeSummary,
  getMistakes,
  getModelConfig,
  getPathTo,
  getTopicHistory,
  getTrajectory,
  markMistakeReviewed,
} from "@/api/learning.api";

/**
 * Data hooks, all on react-query (D19).
 *
 * One query key per resource, so two pages showing the same topic read the
 * same cached response and cannot disagree about its status — which is the
 * acceptance condition of stage 7.
 */

export const queryKeys = {
  tree: ["learning-path", "tree"] as const,
  graph: ["curriculum", "prerequisite-graph"] as const,
  dashboard: ["analytics", "overview"] as const,
  trajectory: (courseId?: number | null) => ["learning", "trajectory", courseId ?? "all"] as const,
  pathTo: (topicId: number | null) => ["learning", "path-to", topicId] as const,
  mistakes: ["learning", "mistakes"] as const,
  topicHistory: (topicId: number | string) => ["learning", "topic-history", String(topicId)] as const,
  summary: ["me", "summary"] as const,
  modelConfig: ["config", "model"] as const,
};

/** The model constants change only on a deploy, so they are cached hard (D29). */
export const useModelConfig = () =>
  useQuery({
    queryKey: queryKeys.modelConfig,
    queryFn: getModelConfig,
    staleTime: Infinity,
    gcTime: Infinity,
  });

export const useLearningPathTree = () =>
  useQuery({ queryKey: queryKeys.tree, queryFn: getLearningPathTree });

export const usePrerequisiteGraphData = () =>
  useQuery({ queryKey: queryKeys.graph, queryFn: getPrerequisiteGraph });

export const useDashboardOverview = () =>
  useQuery({ queryKey: queryKeys.dashboard, queryFn: getDashboardOverview });

export const useTrajectory = (courseId?: number | null) =>
  useQuery({
    queryKey: queryKeys.trajectory(courseId),
    queryFn: () => getTrajectory(courseId),
  });

export const usePathTo = (topicId: number | null) =>
  useQuery({
    queryKey: queryKeys.pathTo(topicId),
    queryFn: () => getPathTo(topicId as number),
    enabled: topicId !== null,
  });

export const useMistakes = () =>
  useQuery({ queryKey: queryKeys.mistakes, queryFn: getMistakes });

export const useTopicHistory = (topicId: number | string | undefined) =>
  useQuery({
    queryKey: queryKeys.topicHistory(topicId ?? ""),
    queryFn: () => getTopicHistory(topicId as number | string),
    enabled: topicId !== undefined && topicId !== "",
  });

export const useMeSummary = () =>
  useQuery({ queryKey: queryKeys.summary, queryFn: getMeSummary });

export const useMarkMistakeReviewed = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: markMistakeReviewed,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.mistakes }),
  });
};

/**
 * Everything an answer can change: the learner's state, the trajectory, the
 * tree, the graph and the dashboard. Called after a submission so no page
 * keeps a stale status.
 */
export const useInvalidateLearnerState = () => {
  const client = useQueryClient();
  return () => {
    for (const key of [
      queryKeys.tree,
      queryKeys.graph,
      queryKeys.dashboard,
      queryKeys.mistakes,
      queryKeys.summary,
    ]) {
      void client.invalidateQueries({ queryKey: key });
    }
    void client.invalidateQueries({ queryKey: ["learning", "trajectory"] });
    void client.invalidateQueries({ queryKey: ["learning", "topic-history"] });
  };
};
