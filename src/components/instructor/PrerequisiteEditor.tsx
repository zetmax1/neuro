import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getPrerequisiteGraph } from "@/api/curriculum.api";
import {
  createPrerequisite,
  deletePrerequisite,
  getKbWarnings,
  getLeafEdges,
  getPrerequisites,
  updatePrerequisiteWeight,
} from "@/api/instructor.api";
import StatusLegend from "@/components/common/StatusLegend";
import ContainerNode from "@/components/learning-path/ContainerNode";
import CustomTopicNode from "@/components/learning-path/CustomTopicNode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGraphLayout, minimapColor } from "@/hooks/useGraphLayout";
import { cycleTopics, kbErrorMessage } from "@/lib/kbError";

/**
 * The prerequisite editor (addendum 2.6) — the centre of the thesis, and
 * absent from the interface before stage 7.
 *
 * Dragging from one node to another adds (x, y) through Algorithm 2.1. A
 * rejection is a 400 the editor can explain: `reason` gives the message and,
 * for a cycle, `chain` is the path, which is drawn in red so the instructor
 * sees *where* the cycle closes rather than only that one exists.
 *
 * Inherited G_L edges are dashed and read-only: they are produced by a
 * relation on a section, so the way to remove one is to remove that relation.
 *
 * Redundant edges and κ are reported in their own panel and never fixed
 * automatically (GR3) — whether a redundant edge is a mistake or deliberate
 * emphasis is the instructor's call.
 */

const nodeTypes = { customTopic: CustomTopicNode, container: ContainerNode };

const PrerequisiteEditor = ({ courseId }: { courseId: number | null }) => (
  <ReactFlowProvider>
    <Editor courseId={courseId} />
  </ReactFlowProvider>
);

const Editor = ({ courseId }: { courseId: number | null }) => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [weightDraft, setWeightDraft] = useState("");
  const [cycle, setCycle] = useState<number[]>([]);

  const graph = useQuery({ queryKey: ["curriculum", "prerequisite-graph"], queryFn: getPrerequisiteGraph });
  const relations = useQuery({
    queryKey: ["instructor", "prerequisites", courseId],
    queryFn: () => getPrerequisites(courseId ?? undefined),
  });
  const leafEdges = useQuery({ queryKey: ["curriculum", "leaf-edges"], queryFn: getLeafEdges });
  const warnings = useQuery({ queryKey: ["instructor", "kb-warnings"], queryFn: getKbWarnings });

  const refresh = useCallback(() => {
    for (const key of [
      ["curriculum", "prerequisite-graph"],
      ["curriculum", "leaf-edges"],
      ["instructor", "prerequisites"],
      ["instructor", "kb-warnings"],
      ["learning-path", "tree"],
    ]) {
      void client.invalidateQueries({ queryKey: key });
    }
  }, [client]);

  const add = useMutation({
    mutationFn: createPrerequisite,
    onSuccess: () => {
      setCycle([]);
      toast.success(t("builder.edge_added"));
      refresh();
    },
    onError: (error) => {
      // A cycle comes back with its chain; show it on the canvas in red.
      setCycle(cycleTopics(error));
      toast.error(kbErrorMessage(error, t));
    },
  });

  const remove = useMutation({
    mutationFn: deletePrerequisite,
    onSuccess: () => {
      setSelectedEdge(null);
      toast.success(t("builder.edge_deleted"));
      refresh();
    },
    onError: (error) => toast.error(kbErrorMessage(error, t)),
  });

  const reweight = useMutation({
    mutationFn: ({ id, weight }: { id: number; weight: number }) => updatePrerequisiteWeight(id, weight),
    onSuccess: () => {
      toast.success(t("builder.edge_updated"));
      refresh();
    },
    onError: (error) => toast.error(kbErrorMessage(error, t)),
  });

  const input = useMemo(
    () =>
      graph.data
        ? { nodes: graph.data.nodes, edges: graph.data.edges, leafEdges: leafEdges.data ?? [] }
        : undefined,
    [graph.data, leafEdges.data],
  );

  const { nodes, edges } = useGraphLayout(input, {
    view: "two-layer",
    layout: "lev",
    showInherited: true,
    courseId,
    cycleTopics: cycle,
  });

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      add.mutate({
        prerequisite: Number(connection.source),
        topic: Number(connection.target),
        weight: 1,
      });
    },
    [add],
  );

  const onEdgeClick = useCallback((_: unknown, edge: Edge) => {
    // Inherited edges are read-only: they come from a relation on a section.
    if (edge.id.startsWith("gl-")) {
      setSelectedEdge(null);
      return;
    }
    setSelectedEdge(edge);
    setWeightDraft(String((edge.data as { weight?: number } | undefined)?.weight ?? 1));
  }, []);

  const selectedRelationId = (selectedEdge?.data as { prerequisiteId?: number } | undefined)
    ?.prerequisiteId;

  if (graph.isLoading) return <Skeleton className="h-[60vh] w-full" />;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
        {t("builder.prereq_hint")}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div
          className="h-[60vh] overflow-hidden rounded-xl border border-border bg-background"
          data-testid="prerequisite-editor"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
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
          {selectedEdge && selectedRelationId !== undefined ? (
            <Card data-testid="edge-editor">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("builder.weight")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{t("builder.weight_hint")}</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="1"
                    value={weightDraft}
                    onChange={(event) => setWeightDraft(event.target.value)}
                    aria-label={t("builder.weight")}
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      reweight.mutate({ id: selectedRelationId, weight: Number(weightDraft) })
                    }
                    disabled={reweight.isPending}
                  >
                    {t("common.save")}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => remove.mutate(selectedRelationId)}
                  disabled={remove.isPending}
                  data-testid="delete-edge"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  {t("builder.delete_edge")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                {t("builder.prereq_title")}
              </CardContent>
            </Card>
          )}

          <WarningsPanel data={warnings.data} isLoading={warnings.isLoading} />
          <StatusLegend withEdges className="rounded-xl border border-border p-3" />
        </aside>
      </div>

      {relations.data && (
        <p className="text-xs text-muted-foreground">
          {t("builder.prereq_title")}: {relations.data.length}
        </p>
      )}
    </div>
  );
};

/** Redundant edges and κ — reported, never auto-fixed (GR3). */
const WarningsPanel = ({
  data,
  isLoading,
}: {
  data: Awaited<ReturnType<typeof getKbWarnings>> | undefined;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();

  if (isLoading) return <Skeleton className="h-28 w-full" />;
  if (!data) return null;

  const clean = data.redundant_edges.length === 0 && data.kappa === 0;

  return (
    <Card data-testid="kb-warnings">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          {t("builder.warnings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {clean ? (
          <p className="text-muted-foreground">{t("builder.no_warnings")}</p>
        ) : (
          <>
            {data.redundant_edges.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium">
                  {t("builder.redundant")} ({data.redundant_edges.length})
                </p>
                <p className="text-xs text-muted-foreground">{t("builder.redundant_hint")}</p>
                <ul className="space-y-0.5 text-xs tabular-nums text-muted-foreground">
                  {data.redundant_edges.map((edge) => (
                    <li key={`${edge.source}-${edge.target}`}>
                      {edge.source} → {edge.target}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.kappa > 0 && (
              <div className="space-y-1">
                <p className="font-medium">{t("builder.kappa", { count: data.kappa })}</p>
                <p className="text-xs text-muted-foreground">{t("builder.kappa_hint")}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PrerequisiteEditor;
