import { useState, useEffect, useCallback } from 'react';
import { 
  Node, 
  Edge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  NodeChange, 
  EdgeChange 
} from '@xyflow/react';
import dagre from 'dagre';
import { getPrerequisiteGraph, GraphNode, GraphEdge } from '@/api/curriculum.api';

// Dagre layout configuration — same dimensions as useLearningPath
const nodeWidth = 260;
const nodeHeight = 110;

/**
 * Dagre auto-layout for prerequisite DAG.
 * Uses 'TB' (Top-to-Bottom) layout to clearly show edge convergence
 * for nodes with multiple prerequisites from different branches.
 */
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source.toString(), edge.target.toString());
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    node.targetPosition = direction === 'TB' ? 'top' : 'left' as any;
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right' as any;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export const usePrerequisiteGraph = (selectedRootId?: number | null) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const fetchAndLayoutGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const graphData = await getPrerequisiteGraph();

      let rawNodes = graphData.nodes;
      let rawEdges = graphData.edges;

      // Filter nodes if selectedRootId is provided
      if (selectedRootId !== null && selectedRootId !== undefined) {
        // Find node matching selectedRootId or its connected children
        const rootIdStr = String(selectedRootId);
        const validNodeIds = new Set<string>();
        validNodeIds.add(rootIdStr);

        // Collect descendant nodes reachable from root
        let added = true;
        while (added) {
          added = false;
          rawEdges.forEach((e) => {
            if (validNodeIds.has(String(e.source)) && !validNodeIds.has(String(e.target))) {
              validNodeIds.add(String(e.target));
              added = true;
            }
          });
        }

        rawNodes = rawNodes.filter((gn) => validNodeIds.has(String(gn.id)));
        rawEdges = rawEdges.filter(
          (ge) => validNodeIds.has(String(ge.source)) && validNodeIds.has(String(ge.target))
        );
      }

      const flowNodes: Node[] = rawNodes.map((gn: GraphNode) => ({
        id: String(gn.id),
        type: 'customTopic',
        position: { x: 0, y: 0 },
        data: {
          label: gn.data.label || gn.label,
          mastery_percentage: gn.data.mastery_pct ?? 0,
          is_unlocked: gn.data.is_unlocked ?? true,
        },
      }));

      const flowEdges: Edge[] = rawEdges.map((ge: GraphEdge) => ({
        id: ge.id,
        source: String(ge.source),
        target: String(ge.target),
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        flowNodes,
        flowEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch prerequisite graph'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedRootId]);

  useEffect(() => {
    fetchAndLayoutGraph();
  }, [fetchAndLayoutGraph]);


  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    isLoading,
    error,
    refetch: fetchAndLayoutGraph,
  };
};
