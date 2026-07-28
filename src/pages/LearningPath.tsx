import React, { useMemo, useState } from 'react';
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
import { usePrerequisiteGraph } from '@/hooks/usePrerequisiteGraph';
import CustomTopicNode from '@/components/learning-path/CustomTopicNode';
import Header from '@/components/layout/Header';
import { Loader2, AlertCircle, GitBranch, Network } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'tree' | 'dag';

const LearningPathCanvas: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  const tree = useLearningPath();
  const dag = usePrerequisiteGraph();

  // Pick the active dataset based on the current view mode
  const active = viewMode === 'tree' ? tree : dag;
  const { nodes, edges, onNodesChange, onEdgesChange, isLoading, error } = active;

  // Register custom node types (memoized to prevent re-renders)
  const nodeTypes = useMemo(() => ({ customTopic: CustomTopicNode }), []);

  // Handle user interacting with the curriculum tree / graph
  const onNodeClick: NodeMouseHandler = (_, node) => {
    const { is_unlocked, label } = node.data as { is_unlocked: boolean; label: string };
    
    if (!is_unlocked) {
      toast.error("Prerequisites not met", {
        description: `You must master prerequisite topics before unlocking ${label}.`
      });
      return;
    }

    navigate(`/topic/${node.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50" style={{ height: 'calc(100vh - 64px)' }}>
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
        <h2 className="text-xl font-semibold text-slate-800">
          {viewMode === 'tree' 
            ? 'Calculating Knowledge Graph Layout...' 
            : 'Loading Prerequisite Dependency Graph...'}
        </h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md text-center leading-relaxed">
          {viewMode === 'tree'
            ? 'The Dagre engine is rendering your personalized Bayesian curriculum tree based on your current mastery states.'
            : 'Mapping cross-branch prerequisite dependencies across your curriculum DAG.'}
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
        
        {/* Floating Info Panel + View Toggle */}
        <Panel position="top-left" className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-200 ml-4 mt-4 max-w-sm">
           {/* Toggle Buttons */}
           <div className="flex border-b border-slate-100 pb-px mb-4">
             <button
               type="button"
               onClick={() => setViewMode('tree')}
               className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                 viewMode === 'tree'
                   ? 'border-indigo-600 text-indigo-600'
                   : 'border-transparent text-slate-400 hover:text-slate-600'
               }`}
             >
               <GitBranch className="w-3.5 h-3.5" />
               Tree View
             </button>
             <button
               type="button"
               onClick={() => setViewMode('dag')}
               className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                 viewMode === 'dag'
                   ? 'border-indigo-600 text-indigo-600'
                   : 'border-transparent text-slate-400 hover:text-slate-600'
               }`}
             >
               <Network className="w-3.5 h-3.5" />
               Dependency Graph
             </button>
           </div>

           <h1 className="text-lg font-bold text-slate-900 mb-1">
             {viewMode === 'tree' ? 'Visual Learning Path' : 'Prerequisite Dependencies'}
           </h1>
           <p className="text-sm text-slate-500 leading-relaxed">
             {viewMode === 'tree'
               ? 'This dynamic curriculum adapts to you. Click an unlocked topic to begin a study session.'
               : 'This view shows cross-branch prerequisite dependencies — a topic may require mastery of multiple unrelated topics before unlocking.'}
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
