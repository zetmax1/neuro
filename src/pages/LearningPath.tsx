import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  ReactFlowProvider, 
  Panel,
  NodeMouseHandler,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useLearningPath, RootTopicInfo } from '@/hooks/useLearningPath';
import { usePrerequisiteGraph } from '@/hooks/usePrerequisiteGraph';
import CustomTopicNode from '@/components/learning-path/CustomTopicNode';
import Header from '@/components/layout/Header';
import { 
  Loader2, 
  AlertCircle, 
  GitBranch, 
  Network, 
  BookOpen, 
  ChevronRight, 
  Layers, 
  Search, 
  PanelLeftClose, 
  PanelLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'tree' | 'dag';

const LearningPathCanvas: React.FC = () => {
  const navigate = useNavigate();
  const reactFlowInstance = useReactFlow();

  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedRootId, setSelectedRootId] = useState<number | null>(null); // null = All Curriculums
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const tree = useLearningPath(selectedRootId);
  const dag = usePrerequisiteGraph(selectedRootId);

  // Active dataset based on view mode
  const active = viewMode === 'tree' ? tree : dag;
  const { nodes, edges, onNodesChange, onEdgesChange, isLoading, error } = active;
  const rootTopics: RootTopicInfo[] = tree.rootTopics || [];

  // Register custom node types
  const nodeTypes = useMemo(() => ({ customTopic: CustomTopicNode }), []);

  // Auto fit view whenever nodes change or curriculum selection changes
  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.35, duration: 400 });
      }, 100);
    }
  }, [selectedRootId, viewMode, nodes.length, reactFlowInstance]);

  // Handle node clicks
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

  // Filter root topics by search query
  const filteredRootTopics = useMemo(() => {
    if (!searchQuery.trim()) return rootTopics;
    return rootTopics.filter(rt => rt.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rootTopics, searchQuery]);

  const selectedRootTopic = useMemo(() => {
    if (selectedRootId === null) return null;
    return rootTopics.find(rt => rt.id === selectedRootId) || null;
  }, [rootTopics, selectedRootId]);

  return (
    <div className="flex-1 w-full h-full flex relative overflow-hidden bg-slate-50">
      
      {/* ============================================================ */}
      {/* LEFT CURRICULUM SIDEBAR                                       */}
      {/* ============================================================ */}
      <aside 
        className={`bg-white border-r border-slate-200 shadow-md flex flex-col transition-all duration-300 z-20 shrink-0 ${
          isSidebarOpen ? 'w-80' : 'w-0 border-r-0'
        }`}
      >
        {isSidebarOpen && (
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 leading-none">Curriculums</h2>
                  <span className="text-[11px] text-slate-500 font-medium">Select to view graph</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter curriculum paths..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Curriculum List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              
              {/* ALL CURRICULUMS ITEM */}
              <button
                onClick={() => setSelectedRootId(null)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedRootId === null
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    selectedRootId === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-snug">All Curriculums</h3>
                    <p className={`text-[10px] font-medium ${selectedRootId === null ? 'text-indigo-100' : 'text-slate-400'}`}>
                      Combined Global View ({rootTopics.length} Paths)
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedRootId === null ? 'text-white' : 'text-slate-400'}`} />
              </button>

              <div className="pt-2 pb-1 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Individual Paths ({filteredRootTopics.length})
                </span>
              </div>

              {/* INDIVIDUAL ROOT CURRICULUM ITEMS */}
              {filteredRootTopics.map((rt) => {
                const isSelected = selectedRootId === rt.id;
                return (
                  <button
                    key={rt.id}
                    onClick={() => setSelectedRootId(rt.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all group ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-sm ring-1 ring-indigo-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        <h3 className="text-xs font-bold truncate leading-tight group-hover:text-indigo-600 transition-colors">
                          {rt.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {rt.total_submodules} Topics
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">Mastery</span>
                        <span className="font-bold text-slate-700">{rt.mastery_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, rt.mastery_percentage)}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* ============================================================ */}
      {/* MAIN CANVAS CONTAINER                                         */}
      {/* ============================================================ */}
      <div className="flex-1 h-full relative">
        
        {/* Toggle Sidebar Button when collapsed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold"
          >
            <PanelLeft className="w-4 h-4 text-indigo-600" />
            <span>Show Curriculums Sidebar</span>
          </button>
        )}

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-700 font-bold text-base">Rendering Isolated Curriculum Graph...</p>
            <p className="text-slate-400 text-xs mt-1">Dagre engine layout optimization</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-rose-200 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-900 mb-1">Failed to Load Graph</h2>
              <p className="text-slate-500 text-xs">{error.message}</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange as any}
            onEdgesChange={onEdgesChange as any}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            minZoom={0.2}
            maxZoom={1.5}
            className="bg-slate-50/80"
          >
            <Background color="#94a3b8" gap={24} size={1.5} />
            <Controls className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden" />
            
            {/* Top Left Floating Header & View Mode Switcher */}
            <Panel 
              position="top-left" 
              className={`bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-md border border-slate-200/80 transition-all duration-300 max-w-md ${
                !isSidebarOpen ? 'ml-52' : 'ml-4'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                  <h1 className="text-sm font-extrabold text-slate-900">
                    {selectedRootTopic ? selectedRootTopic.name : 'All Curriculum Paths'}
                  </h1>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      viewMode === 'tree'
                        ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    Tree
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('dag')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      viewMode === 'dag'
                        ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    DAG Graph
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {selectedRootTopic ? (
                  <>Viewing isolated graph layout for <strong className="text-slate-800">{selectedRootTopic.name}</strong>. Click any unlocked module card to launch a test or start learning.</>
                ) : (
                  <>Viewing all active curriculum pathways. Click any curriculum name in the left sidebar to isolate and zoom into its individual graph tree.</>
                )}
              </p>
            </Panel>
          </ReactFlow>
        )}
      </div>
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
