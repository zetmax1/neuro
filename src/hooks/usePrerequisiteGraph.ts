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

export const usePrerequisiteGraph = () => {
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

      const flowNodes: Node[] = graphData.nodes.map((gn: GraphNode) => ({
        id: gn.id,
        type: 'customTopic',
        position: { x: 0, y: 0 },
        data: {
          label: gn.data.label || gn.label,
          mastery_percentage: gn.data.mastery_pct ?? 0,
          is_unlocked: gn.data.is_unlocked ?? true,
        },
      }));

      const flowEdges: Edge[] = graphData.edges.map((ge: GraphEdge) => ({
        id: ge.id,
        source: ge.source,
        target: ge.target,
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
  }, []);

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
