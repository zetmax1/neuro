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
import { getLearningPathTree, TopicNode } from '@/api/curriculum.api';

// Dagre layout configuration
const nodeWidth = 260;
const nodeHeight = 110;

/**
 * Automagically calculates {x, y} coordinates for nodes based on their directed edges.
 */
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Set standard anchor points based on layout direction
    node.targetPosition = direction === 'TB' ? 'top' : 'left' as any;
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right' as any;

    // Shift the dagre node position (anchor=center) to match React Flow (anchor=top-left)
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const flattenTree = (nestedNodes: any[]): TopicNode[] => {
  const flat: TopicNode[] = [];
  const recurse = (node: any) => {
    flat.push({
      id: node.id,
      name: node.name,
      slug: node.slug,
      parent_id: node.parent_id,
      mastery_percentage: node.mastery_percentage,
      is_unlocked: node.is_unlocked,
    });
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(recurse);
    }
  };
  nestedNodes.forEach(recurse);
  return flat;
};

export const useLearningPath = () => {
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
      const nestedTopics = await getLearningPathTree();
      const topics: TopicNode[] = flattenTree(nestedTopics);
      
      const initialNodes: Node[] = [];
      const initialEdges: Edge[] = [];

      topics.forEach((topic) => {
        // Construct React Flow Node
        initialNodes.push({
          id: String(topic.id),
          type: 'customTopic',
          position: { x: 0, y: 0 }, // Dagre will overwrite this
          data: {
            label: topic.name,
            mastery_percentage: topic.mastery_percentage,
            is_unlocked: topic.is_unlocked,
          },
        });

        // Construct edges based on parent_id to build the DAG
        if (topic.parent_id !== null && topic.parent_id !== undefined) {
          initialEdges.push({
            id: `e-${topic.parent_id}-${topic.id}`,
            source: String(topic.parent_id),
            target: String(topic.id),
            type: 'smoothstep',
            animated: topic.is_unlocked, // Animate edges to unlocked topics!
            style: { 
              stroke: topic.is_unlocked ? '#6366f1' : '#cbd5e1', 
              strokeWidth: 2 
            },
          });
        }
      });

      // Pass off to Dagre engine
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch learning path'));
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
    refetch: fetchAndLayoutGraph 
  };
};
