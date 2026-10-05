/**
 * Domain types shared by every page, matching the backend of stages 3–6.
 *
 * One vocabulary across the API (3.4): a topic's state is `p_mastery` (P(L), a
 * probability in [0, 1]), `accuracy` (correct / attempts, also [0, 1]) and
 * `status`. The mixed-scale `mastery_percentage`, the discrete
 * `mastery_level` and the global `is_unlocked` flag are gone.
 */

/** The five statuses of 3.4. Only `kind = topic` nodes carry one (D22). */
export type TopicStatus = "closed" | "open" | "in_progress" | "mastered" | "review";

export const TOPIC_STATUSES: readonly TopicStatus[] = [
  "closed",
  "open",
  "in_progress",
  "mastered",
  "review",
] as const;

export type NodeKind = "course" | "section" | "topic";

/** Algorithm 2.5 groups: A review, B in progress, C open, D closed. */
export type TrajectoryGroup = "A" | "B" | "C" | "D";

/** Structured reason codes (TR3). The wording lives in the locale files (D20). */
export type ReasonCode = "review_impact" | "in_progress" | "ready" | "blocked";

export interface Reason {
  code: ReasonCode;
  params: Record<string, number>;
}

/** An unmastered member of Pre(w), as the 403 body and the side panel report it. */
export interface MissingPrerequisite {
  topic_id: number;
  name: string;
  p_mastery: number;
}

/** The learner's state on one topic, as every endpoint reports it. */
export interface LearnerState {
  p_mastery: number;
  accuracy: number;
  status: TopicStatus;
  mastered: boolean;
  missing_count: number;
}

export type Role = "student" | "instructor" | "admin";

/** Ledger source of an answer. `review_repeat` answers do not change P(L) (D25). */
export type AttemptSource =
  | "adaptive"
  | "test_session"
  | "review_repeat"
  | "seed"
  | "simulated"
  | "legacy";
