import dagre from "dagre";
import { useMemo } from "react";
import type { Edge, Node } from "@xyflow/react";

import type { GraphEdge, GraphNode } from "@/api/curriculum.api";
import type { LeafEdge } from "@/api/instructor.api";
import type { ContainerNodeData } from "@/components/learning-path/ContainerNode";
import {
  TOPIC_NODE_HEIGHT,
  TOPIC_NODE_WIDTH,
  type TopicNodeData,
} from "@/components/learning-path/CustomTopicNode";
import { statusStyle } from "@/lib/status";

/**
 * Layouts for the learning path (addendum 2.2).
 *
 * Three views:
 *
 * - **two-layer** (the default): courses and sections are frames, topics sit
 *   inside them — figures 2.2 and 2.3. Topics are placed by `lev` across and
 *   `pos` down, so the picture is deterministic;
 * - **DAG**: topics only, in `lev` columns left to right, ordered by `pos`
 *   within a column. This is the "stage" idea of chapter II made visible;
 * - **tree**: the containment hierarchy by `depth` and `pos`.
 *
 * Dagre stays available as an optional layout, but it is not the default: its
 * output shifts when an unrelated node is added, which makes two screenshots
 * of the same graph disagree.
 */

export type GraphView = "two-layer" | "dag" | "tree";
export type GraphLayout = "lev" | "dagre";

const COLUMN_WIDTH = TOPIC_NODE_WIDTH + 90;
const ROW_HEIGHT = TOPIC_NODE_HEIGHT + 34;
const CONTAINER_PADDING_X = 18;
const CONTAINER_HEADER = 56;
const CONTAINER_GAP = 44;

export interface GraphInput {
  nodes: GraphNode[];
  /** E_P as the instructor entered it. */
  edges: GraphEdge[];
  /** G_L, the inherited topic graph. */
  leafEdges: LeafEdge[];
}

export interface LayoutOptions {
  view: GraphView;
  layout: GraphLayout;
  showInherited: boolean;
  /** Only this course's subtree; null means every course. */
  courseId: number | null;
  /** Topics of Need(g) plus the goal: highlighted, everything else dimmed. */
  pathTopics?: number[];
  /** A rejected cycle to draw in red (builder only). */
  cycleTopics?: number[];
}

interface Parsed {
  id: number;
  label: string;
  kind: "course" | "section" | "topic";
  parent: number | null;
  pos: number;
  depth: number;
  lev: number | null;
  data: GraphNode["data"];
}

const parse = (nodes: GraphNode[]): Parsed[] =>
  nodes.map((node) => ({
    id: Number(node.id),
    label: node.data.label || node.label,
    kind: node.data.kind ?? "topic",
    parent: node.data.parent ?? null,
    pos: node.data.pos ?? 0,
    depth: node.data.depth ?? 0,
    lev: node.data.lev ?? null,
    data: node.data,
  }));

const rootOf = (node: Parsed, byId: Map<number, Parsed>): number => {
  let current = node;
  while (current.parent !== null) {
    const parent = byId.get(current.parent);
    if (!parent) break;
    current = parent;
  }
  return current.id;
};

/** Builds React Flow nodes and edges for the chosen view. */
export function useGraphLayout(input: GraphInput | undefined, options: LayoutOptions) {
  return useMemo(() => {
    if (!input) return { nodes: [] as Node[], edges: [] as Edge[] };

    const all = parse(input.nodes);
    const byId = new Map(all.map((node) => [node.id, node]));
    const inScope = options.courseId
      ? all.filter((node) => rootOf(node, byId) === options.courseId)
      : all;
    const scopeIds = new Set(inScope.map((node) => node.id));

    const onPath = new Set(options.pathTopics ?? []);
    const dimming = onPath.size > 0;
    const inCycle = new Set(options.cycleTopics ?? []);

    const topicNode = (node: Parsed, position: { x: number; y: number }, parentId?: string): Node => ({
      id: String(node.id),
      type: "customTopic",
      position,
      ...(parentId ? { parentId, extent: "parent" as const } : {}),
      data: {
        label: node.label,
        status: node.data.status,
        p_mastery: node.data.p_mastery,
        missing_count: node.data.missing_count,
        onPath: onPath.has(node.id) || inCycle.has(node.id),
        dimmed: dimming && !onPath.has(node.id),
      } satisfies TopicNodeData,
    });

    let nodes: Node[] = [];

    if (options.view === "two-layer") {
      nodes = twoLayer(inScope, byId, topicNode, { dimming, onPath });
    } else if (options.view === "tree") {
      nodes = inScope.map((node) =>
        node.kind === "topic"
          ? topicNode(node, { x: node.depth * COLUMN_WIDTH, y: node.pos * ROW_HEIGHT })
          : container(node, inScope, byId, { x: node.depth * COLUMN_WIDTH, y: node.pos * ROW_HEIGHT }, { dimming, onPath }),
      );
    } else {
      const topics = inScope.filter((node) => node.kind === "topic");
      const columns = new Map<number, Parsed[]>();
      for (const topic of topics) {
        const level = topic.lev ?? 0;
        columns.set(level, [...(columns.get(level) ?? []), topic]);
      }
      nodes = [...columns.entries()].flatMap(([level, column]) =>
        [...column]
          .sort((a, b) => a.pos - b.pos || a.id - b.id)
          .map((topic, row) =>
            topicNode(topic, { x: level * COLUMN_WIDTH, y: row * ROW_HEIGHT }),
          ),
      );
    }

    const edges = buildEdges(input, options, scopeIds, byId, { onPath, dimming, inCycle });

    if (options.layout === "dagre" && options.view === "dag") {
      return { nodes: dagreLayout(nodes, edges), edges };
    }
    return { nodes, edges };
  }, [input, options]);
}

function container(
  node: Parsed,
  scope: Parsed[],
  byId: Map<number, Parsed>,
  position: { x: number; y: number },
  flags: { dimming: boolean; onPath: Set<number> },
  size?: { width: number; height: number },
): Node {
  const topics = descendantTopics(node.id, scope);
  return {
    id: String(node.id),
    type: "container",
    position,
    ...(size ? { style: size } : {}),
    data: {
      label: node.label,
      kind: node.kind,
      mastered: topics.filter((topic) => topic.data.mastered).length,
      total: topics.length,
      dimmed: flags.dimming && !topics.some((topic) => flags.onPath.has(topic.id)),
    } satisfies ContainerNodeData,
  };
}

function descendantTopics(rootId: number, scope: Parsed[]): Parsed[] {
  const children = new Map<number, Parsed[]>();
  for (const node of scope) {
    if (node.parent !== null) children.set(node.parent, [...(children.get(node.parent) ?? []), node]);
  }
  const out: Parsed[] = [];
  const stack = [rootId];
  while (stack.length) {
    for (const child of children.get(stack.pop() as number) ?? []) {
      if (child.kind === "topic") out.push(child);
      else stack.push(child.id);
    }
  }
  return out;
}

/**
 * Courses and sections as frames with their topics inside. Sections stack
 * vertically within a course; a course's topics are laid out by `lev` across
 * and `pos` down, which keeps the picture stable.
 */
function twoLayer(
  scope: Parsed[],
  byId: Map<number, Parsed>,
  topicNode: (node: Parsed, position: { x: number; y: number }, parentId?: string) => Node,
  flags: { dimming: boolean; onPath: Set<number> },
): Node[] {
  const nodes: Node[] = [];
  const courses = scope.filter((node) => node.kind === "course").sort((a, b) => a.pos - b.pos);
  let courseY = 0;

  for (const course of courses) {
    const sections = scope
      .filter((node) => node.parent === course.id && node.kind !== "topic")
      .sort((a, b) => a.pos - b.pos);
    const directTopics = scope
      .filter((node) => node.parent === course.id && node.kind === "topic")
      .sort((a, b) => a.pos - b.pos);

    const blocks: { owner: Parsed; topics: Parsed[] }[] = [
      ...(directTopics.length ? [{ owner: course, topics: directTopics }] : []),
      ...sections.map((section) => ({
        owner: section,
        topics: scope
          .filter((node) => node.parent === section.id && node.kind === "topic")
          .sort((a, b) => a.pos - b.pos),
      })),
    ];

    let innerY = CONTAINER_HEADER;
    const placed: Node[] = [];

    for (const block of blocks) {
      const columns = new Map<number, Parsed[]>();
      for (const topic of block.topics) {
        const level = topic.lev ?? 0;
        columns.set(level, [...(columns.get(level) ?? []), topic]);
      }
      const levels = [...columns.keys()].sort((a, b) => a - b);
      const rows = Math.max(1, ...[...columns.values()].map((column) => column.length));
      const blockHeight = rows * ROW_HEIGHT + CONTAINER_HEADER;

      if (block.owner.id !== course.id) {
        placed.push(
          container(
            block.owner,
            scope,
            byId,
            { x: CONTAINER_PADDING_X, y: innerY },
            flags,
            {
              width: Math.max(1, levels.length) * COLUMN_WIDTH + CONTAINER_PADDING_X * 2,
              height: blockHeight,
            },
          ),
        );
      }

      levels.forEach((level, columnIndex) => {
        [...(columns.get(level) ?? [])]
          .sort((a, b) => a.pos - b.pos || a.id - b.id)
          .forEach((topic, row) => {
            const parentId = block.owner.id === course.id ? String(course.id) : String(block.owner.id);
            const baseY = block.owner.id === course.id ? innerY : CONTAINER_HEADER;
            placed.push(
              topicNode(
                topic,
                {
                  x: CONTAINER_PADDING_X + columnIndex * COLUMN_WIDTH,
                  y: baseY + row * ROW_HEIGHT,
                },
                parentId,
              ),
            );
          });
      });

      innerY += blockHeight + CONTAINER_GAP / 2;
    }

    const width =
      Math.max(
        1,
        ...blocks.map((block) => {
          const levels = new Set(block.topics.map((topic) => topic.lev ?? 0));
          return Math.max(1, levels.size);
        }),
      ) * COLUMN_WIDTH + CONTAINER_PADDING_X * 4;

    nodes.push(
      container(course, scope, byId, { x: 0, y: courseY }, flags, {
        width,
        height: innerY + CONTAINER_GAP,
      }),
      ...placed,
    );
    courseY += innerY + CONTAINER_GAP * 2;
  }

  return nodes;
}

function buildEdges(
  input: GraphInput,
  options: LayoutOptions,
  scopeIds: Set<number>,
  byId: Map<number, Parsed>,
  flags: { onPath: Set<number>; dimming: boolean; inCycle: Set<number> },
): Edge[] {
  const onCyclePath = (source: number, target: number) =>
    flags.inCycle.has(source) && flags.inCycle.has(target);
  const onGoalPath = (source: number, target: number) =>
    flags.onPath.has(source) && flags.onPath.has(target);

  // E_P as entered: a relation on a section is one thick edge into its frame.
  const direct: Edge[] = input.edges
    .filter((edge) => scopeIds.has(Number(edge.source)) && scopeIds.has(Number(edge.target)))
    .map((edge) => {
      const source = Number(edge.source);
      const target = Number(edge.target);
      const isContainer =
        byId.get(source)?.kind !== "topic" || byId.get(target)?.kind !== "topic";
      const highlighted = onGoalPath(source, target);
      const cycle = onCyclePath(source, target);
      return {
        id: `ep-${edge.id}`,
        source: String(source),
        target: String(target),
        type: "smoothstep",
        animated: highlighted || cycle,
        label: edge.weight !== undefined && edge.weight !== 1 ? `ω ${edge.weight}` : undefined,
        labelStyle: { fontSize: 11 },
        style: {
          stroke: cycle ? "#dc2626" : highlighted ? "#4f46e5" : "#64748b",
          strokeWidth: cycle || highlighted ? 3 : isContainer ? 3 : 2,
          opacity: flags.dimming && !highlighted ? 0.15 : 1,
        },
        data: { prerequisiteId: edge.prerequisite_id, weight: edge.weight },
      } satisfies Edge;
    });

  if (!options.showInherited) return direct;

  // G_L edges produced only by a section- or course-level relation: dashed,
  // read-only, and hidden behind a toggle so the canvas stays legible.
  const inherited: Edge[] = input.leafEdges
    .filter(
      (edge) =>
        edge.inherited && scopeIds.has(edge.source) && scopeIds.has(edge.target),
    )
    .map((edge) => {
      const highlighted = onGoalPath(edge.source, edge.target);
      return {
        id: `gl-${edge.source}-${edge.target}`,
        source: String(edge.source),
        target: String(edge.target),
        type: "smoothstep",
        animated: highlighted,
        style: {
          stroke: highlighted ? "#4f46e5" : "#94a3b8",
          strokeWidth: highlighted ? 3 : 1.5,
          strokeDasharray: "5 4",
          opacity: flags.dimming && !highlighted ? 0.12 : 0.9,
        },
      } satisfies Edge;
    });

  return [...direct, ...inherited];
}

/** The optional automatic layout. */
function dagreLayout(nodes: Node[], edges: Edge[]): Node[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", ranksep: 90, nodesep: 40 });

  for (const node of nodes) {
    graph.setNode(node.id, { width: TOPIC_NODE_WIDTH, height: TOPIC_NODE_HEIGHT });
  }
  for (const edge of edges) {
    graph.setEdge(String(edge.source) as never, String(edge.target) as never);
  }
  dagre.layout(graph);

  return nodes.map((node) => {
    const placed = graph.node(node.id as never);
    return placed
      ? {
          ...node,
          position: { x: placed.x - TOPIC_NODE_WIDTH / 2, y: placed.y - TOPIC_NODE_HEIGHT / 2 },
        }
      : node;
  });
}

/** The status colour of an edge endpoint, for the minimap. */
export const minimapColor = (node: Node): string => {
  const data = node.data as { status?: string };
  return data.status ? statusStyle(data.status as never).stroke : "#cbd5e1";
};
