import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { TopicStatus } from "./TopicNode";

interface Node {
  id: string;
  title: string;
  status: TopicStatus;
  x: number;
  y: number;
}

interface Edge {
  source: string;
  target: string;
}

interface KnowledgeGraphProps {
  modules: any[];
}

const statusColors: Record<TopicStatus, string> = {
  completed: "fill-success stroke-success",
  "in-progress": "fill-primary stroke-primary",
  recommended: "fill-accent stroke-accent",
  locked: "fill-muted stroke-muted",
};

const KnowledgeGraph = ({ modules }: KnowledgeGraphProps) => {
  // Simple layout logic: group by modules horizontally, spread topics vertically
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const moduleIdToX: Record<string, number> = {};
    
    modules.forEach((module, mIdx) => {
      const x = 150 + mIdx * 250;
      moduleIdToX[module.id] = x;
      
      module.topics.forEach((topic: any, tIdx: number) => {
        const y = 100 + tIdx * 100 + (mIdx % 2) * 50; // Staggered y
        nodes.push({
          id: topic.id,
          title: topic.title,
          status: topic.status,
          x,
          y
        });
        
        if (topic.prerequisites) {
          topic.prerequisites.forEach((prereq: string) => {
            // Find parent topic ID by title (since data has titles in prerequisites)
            const parent = modules.flatMap(m => m.topics).find(t => t.title === prereq);
            if (parent) {
              edges.push({ source: parent.id, target: topic.id });
            }
          });
        }
      });
    });
    
    return { nodes, edges };
  }, [modules]);

  return (
    <div className="w-full aspect-[2/1] bg-card rounded-2xl border border-border overflow-hidden relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" />
      
      <svg className="w-full h-full" viewBox="0 0 1000 600">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="15"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" opacity="0.5" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;
          
          return (
            <line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className="stroke-muted-foreground/20 stroke-[2]"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id} className="cursor-pointer group/node">
            <circle
              cx={node.x}
              cy={node.y}
              r="24"
              className={cn(
                "transition-all duration-300 stroke-[4]",
                statusColors[node.status],
                "fill-background group-hover/node:r-[28]"
              )}
            />
            {node.status === 'in-progress' && (
              <circle
                cx={node.x}
                cy={node.y}
                r="30"
                className="fill-none stroke-primary/30 stroke-[2] animate-ping"
              />
            )}
            <text
              x={node.x}
              y={node.y + 45}
              textAnchor="middle"
              className="text-[10px] font-bold fill-foreground opacity-0 group-hover/node:opacity-100 transition-opacity uppercase tracking-tighter"
            >
              {node.title}
            </text>
            <circle
              cx={node.x}
              cy={node.y}
              r="8"
              className={cn(
                "transition-colors duration-300",
                node.status === 'completed' ? 'fill-success' : 
                node.status === 'in-progress' ? 'fill-primary' : 
                node.status === 'recommended' ? 'fill-accent' : 'fill-muted'
              )}
            />
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border text-[10px] space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span>Recommended</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
