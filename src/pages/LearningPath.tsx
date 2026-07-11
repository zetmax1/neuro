import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  ReactFlowProvider, 
  Panel,
  NodeMouseHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLearningPath } from '@/hooks/useLearningPath';
import CustomTopicNode from '@/components/learning-path/CustomTopicNode';
import Header from '@/components/layout/Header';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const LearningPathCanvas: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, edges, onNodesChange, onEdgesChange, isLoading, error } = useLearningPath();

  // Register our custom node types (memoized to prevent re-renders)
  const nodeTypes = useMemo(() => ({ customTopic: CustomTopicNode }), []);

  // Handle user interacting with the curriculum tree
  const onNodeClick: NodeMouseHandler = (_, node) => {
    const { is_unlocked, label } = node.data as { is_unlocked: boolean, label: string };
    
    if (!is_unlocked) {
      toast.error("Prerequisites not met", {
        description: `You must master prerequisite topics before unlocking ${label}.`
      });
      return;
    }

    // Navigate to the study session for this specific topic
    navigate(`/topic/${node.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50" style={{ height: 'calc(100vh - 64px)' }}>
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
        <h2 className="text-xl font-semibold text-slate-800">Calculating Knowledge Graph Layout...</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md text-center leading-relaxed">
          The Dagre engine is rendering your personalized Bayesian curriculum tree based on your current mastery states.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-4" style={{ height: 'calc(100vh - 64px)' }}>
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load path</h2>
            <p className="text-gray-500 text-sm">{error.message}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        className="bg-slate-50/80"
      >
        <Background color="#94a3b8" gap={24} size={1.5} />
        <Controls className="bg-white border-slate-200 shadow-sm rounded-lg overflow-hidden" />
        
        {/* Floating Info Panel */}
        <Panel position="top-left" className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200 ml-4 mt-4 max-w-sm">
           <h1 className="text-lg font-bold text-slate-900 mb-1">Visual Learning Path</h1>
           <p className="text-sm text-slate-500 leading-relaxed">
             This dynamic curriculum adapts to you. Click an unlocked topic to begin a study session.
           </p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const LearningPath: React.FC = () => {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 w-full relative min-h-0">
        <ReactFlowProvider>
          <LearningPathCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default LearningPath;
