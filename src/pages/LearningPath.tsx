import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { getLeafEdges } from "@/api/instructor.api";
import type { TopicStatus } from "@/api/types";
import MasteryRatio from "@/components/common/MasteryRatio";
import MissingPrerequisites from "@/components/common/MissingPrerequisites";
import StatusBadge from "@/components/common/StatusBadge";
import StatusLegend from "@/components/common/StatusLegend";
import Header from "@/components/layout/Header";
import ContainerNode from "@/components/learning-path/ContainerNode";
import CustomTopicNode from "@/components/learning-path/CustomTopicNode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePathTo,
  usePrerequisiteGraphData,
} from "@/hooks/useLearningData";
import { minimapColor, useGraphLayout, type GraphLayout, type GraphView } from "@/hooks/useGraphLayout";
import { formatProbability } from "@/lib/format";

/**
 * The learning path (addendum 2.2) — the central screen of the thesis.
 *
 * Three views: two layers (the default; courses and sections as frames with
 * their topics inside, figures 2.2 and 2.3), the DAG by `lev` columns, and the
 * containment tree. Inherited G_L edges are dashed behind a toggle.
 *
 * Clicking a topic opens a side panel with its status and P(L), the missing
 * prerequisites with their own P(L), and buttons to practise or to show the
 * path to it. "Path to this topic" highlights Need(g) and dims the rest.
 *
 * `?topic=<id>` selects a node on arrival, which is how the header's search
 * hands one over (D40): a hit is read here, in the graph it belongs to.
 */

const nodeTypes = { customTopic: CustomTopicNode, container: ContainerNode };

const LearningPathPage = () => (
  <ReactFlowProvider>
    <LearningPath />
  </ReactFlowProvider>
);

const LearningPath = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<GraphView>("two-layer");
  const [layout, setLayout] = useState<GraphLayout>("lev");
  const [showInherited, setShowInherited] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<number | null>(null);
  const [params, setParams] = useSearchParams();

  // D40: a search hit arrives as ?topic=<id>. The parameter is consumed once —
  // dropping it keeps the back button and a later click on another node from
  // fighting over the selection.
  const requested = params.get("topic");
  useEffect(() => {
    if (requested === null) return;
    const id = Number(requested);
    if (Number.isFinite(id)) setSelectedId(id);
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("topic");
        return next;
      },
      { replace: true },
    );
  }, [requested, setParams]);

  const graph = usePrerequisiteGraphData();
  // G_L is served by the same endpoint family; instructors and students alike
  // need it to see which edges are inherited.
  const leafEdges = useQuery({
    queryKey: ["curriculum", "leaf-edges"],
    queryFn: getLeafEdges,
    retry: false,
  });
  const path = usePathTo(goalId);

  const pathTopics = useMemo(
    () => (path.data ? path.data.path.map((step) => step.topic_id) : []),
    [path.data],
  );

  const input = useMemo(
    () =>
      graph.data
        ? { nodes: graph.data.nodes, edges: graph.data.edges, leafEdges: leafEdges.data ?? [] }
        : undefined,
    [graph.data, leafEdges.data],
  );

  const { nodes, edges } = useGraphLayout(input, {
    view,
    layout,
    showInherited,
    courseId,
    pathTopics,
  });

  const courses = useMemo(
    () => (graph.data?.nodes ?? []).filter((node) => node.data.kind === "course"),
    [graph.data],
  );

  const selected = useMemo(
    () => (graph.data?.nodes ?? []).find((node) => Number(node.id) === selectedId),
    [graph.data, selectedId],
  );

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedId(Number(node.id));
  }, []);

  if (graph.isLoading) {
    return (
      <Shell>
        <Skeleton className="h-[70vh] w-full" />
      </Shell>
    );
  }

  if (graph.isError) {
    return (
      <Shell>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">{t("common.error")}</p>
            <Button variant="outline" size="sm" onClick={() => void graph.refetch()}>
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="group" aria-label={t("learning.title")}>
          {(["two-layer", "tree", "dag"] as GraphView[]).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={view === option ? "default" : "outline"}
              onClick={() => setView(option)}
              data-testid={`view-${option}`}
            >
              {t(option === "two-layer" ? "learning.mode_two_layer" : option === "tree" ? "learning.mode_tree" : "learning.mode_dag")}
            </Button>
          ))}
        </div>

        {view === "dag" && (
          <div className="flex gap-1">
            {(["lev", "dagre"] as GraphLayout[]).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={layout === option ? "secondary" : "ghost"}
                onClick={() => setLayout(option)}
              >
                {t(option === "lev" ? "learning.layout_lev" : "learning.layout_dagre")}
              </Button>
            ))}
          </div>
        )}

        <Button
          size="sm"
          variant={showInherited ? "secondary" : "ghost"}
          onClick={() => setShowInherited((value) => !value)}
          data-testid="toggle-inherited"
        >
          {t(showInherited ? "learning.hide_inherited" : "learning.show_inherited")}
        </Button>

        <div className="ml-auto flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={courseId === null ? "default" : "outline"}
            onClick={() => setCourseId(null)}
          >
            {t("learning.all_courses")}
          </Button>
          {courses.map((course) => (
            <Button
              key={course.id}
              size="sm"
              variant={courseId === Number(course.id) ? "default" : "outline"}
              onClick={() => setCourseId(Number(course.id))}
            >
              {course.data.label || course.label}
            </Button>
          ))}
        </div>
      </div>

      {goalId !== null && (
        <GoalBanner
          goalId={goalId}
          onClear={() => setGoalId(null)}
          steps={path.data?.path.length ?? 0}
          reachable={path.data?.need.length === 0}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div
          className="h-[70vh] overflow-hidden rounded-xl border border-border bg-background"
          data-testid="learning-path-canvas"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            maxZoom={1.6}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={18} />
            <Controls showInteractive={false} />
            <MiniMap nodeColor={minimapColor} pannable zoomable />
          </ReactFlow>
        </div>

        <aside className="space-y-4">
          {selected ? (
            <TopicPanel
              node={selected}
              onShowPath={() => setGoalId(Number(selected.id))}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {t("learning.panel_title")}
              </CardContent>
            </Card>
          )}
          <StatusLegend withEdges className="rounded-xl border border-border p-3" />
        </aside>
      </div>
    </Shell>
  );
};

const TopicPanel = ({
  node,
  onShowPath,
  onClose,
}: {
  node: { id: string; label: string; data: { label: string; kind?: string; status: TopicStatus; p_mastery: number; accuracy: number; mastered: boolean; missing_count: number; lev?: number | null } };
  onShowPath: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const topicId = Number(node.id);
  const isTopic = (node.data.kind ?? "topic") === "topic";

  return (
    <Card data-testid="topic-panel">
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t(`kind.${node.data.kind ?? "topic"}`)}
            </p>
            <h2 className="truncate text-lg font-semibold">{node.data.label || node.label}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t("common.close")}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        {/* D22: only a topic has a status; a section or course shows k / n. */}
        {isTopic ? (
          <>
            <div className="flex items-center gap-2">
              <StatusBadge status={node.data.status} />
              <span className="text-sm tabular-nums text-muted-foreground">
                {t("metric.p_mastery")} {formatProbability(node.data.p_mastery)}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t("metric.accuracy")}</dt>
                <dd className="font-medium tabular-nums">{formatProbability(node.data.accuracy)}</dd>
              </div>
              {node.data.lev !== null && node.data.lev !== undefined && (
                <div>
                  <dt className="text-xs text-muted-foreground">lev</dt>
                  <dd className="font-medium tabular-nums">{node.data.lev}</dd>
                </div>
              )}
            </dl>
            <PanelMissing topicId={topicId} status={node.data.status} onShowPath={onShowPath} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild disabled={node.data.status === "closed"}>
                <Link to={`/topic/${topicId}/assessment?mode=practice`}>{t("learning.practice")}</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/topic/${topicId}`}>{t("learning.open_topic")}</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("metric.mastered_of", { done: 0, total: 0 })}</p>
        )}
      </CardContent>
    </Card>
  );
};

/** The unmet prerequisites come from the topic history endpoint. */
const PanelMissing = ({
  topicId,
  status,
  onShowPath,
}: {
  topicId: number;
  status: TopicStatus;
  onShowPath: () => void;
}) => {
  const detail = useQuery({
    queryKey: ["learning", "topic-history", String(topicId)],
    queryFn: async () => (await import("@/api/learning.api")).getTopicHistory(topicId),
    enabled: status === "closed",
  });

  if (status !== "closed") return null;
  if (!detail.data) return null;

  return <MissingPrerequisites missing={detail.data.missing} onShowPath={onShowPath} />;
};

const GoalBanner = ({
  goalId,
  steps,
  reachable,
  onClear,
}: {
  goalId: number;
  steps: number;
  reachable: boolean;
  onClear: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm"
      data-testid="goal-banner"
    >
      <span>
        {t("goal.path_to")} ·{" "}
        {reachable ? t("goal.already_open") : t("goal.steps", { count: Math.max(0, steps - 1) })}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link to={`/topic/${goalId}`}>{t("learning.open_topic")}</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onClear}>
          {t("goal.clear")}
        </Button>
      </div>
    </div>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto space-y-4 px-4 py-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("learning.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("learning.subtitle")}</p>
        </header>
        {children}
      </main>
    </div>
  );
};

export default LearningPathPage;
