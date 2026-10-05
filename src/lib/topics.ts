/** Helpers over the learning-path tree, shared by the pages that read it. */

import type { TopicNode } from "@/api/curriculum.api";
import type { TopicStatus } from "@/api/types";

/** The tree arrives nested; most views want it flat. */
export function flattenTopics(nodes: TopicNode[]): TopicNode[] {
  return nodes.flatMap((node) => [node, ...flattenTopics(node.children ?? [])]);
}

/** Only `kind = topic` nodes carry a status (D22). */
export function topicsOnly(nodes: TopicNode[]): TopicNode[] {
  return flattenTopics(nodes).filter((node) => node.kind === "topic");
}

export function countStatus(nodes: TopicNode[], status: TopicStatus): number {
  return topicsOnly(nodes).filter((node) => node.status === status).length;
}

/**
 * The part of an email before the @, used where a learner has no name
 * (addendum 2.7). The old page printed "Unnamed User".
 */
export function displayName(user: { first_name?: string; last_name?: string; email: string }): string {
  const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return full || user.email.split("@")[0];
}
