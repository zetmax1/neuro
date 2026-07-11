import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTopics, createTopic, getResourcesByTopic, deleteResource, TopicResponse, TopicResource } from '@/api/instructor.api';
import Header from '@/components/layout/Header';
import DropzoneUploader from '@/components/instructor/DropzoneUploader';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FolderPlus, 
  BookOpen, 
  Plus, 
  Loader2, 
  ChevronRight, 
  FileText, 
  Video, 
  Globe, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const topicSchema = z.object({
  name: z.string().min(2, "Topic title must be at least 2 characters"),
  description: z.string().default(""),
  parent: z.preprocess(
    (val) => (val === "" || val === "null" || val === null ? null : Number(val)),
    z.number().nullable()
  ).default(null),
});

type TopicFormValues = z.infer<typeof topicSchema>;

export const CurriculumBuilder: React.FC = () => {
  const { user, isLoading: loadingAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [selectedRootTopicId, setSelectedRootTopicId] = useState<number | null>(null);
  const [selectedResourceTopicId, setSelectedResourceTopicId] = useState<number | null>(null);
  const [resources, setResources] = useState<TopicResource[]>([]);
  
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<number>(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: "",
      description: "",
      parent: null,
    }
  });

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (err: any) {
      toast.error("Failed to load topics");
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadResources = async (topicId: number) => {
    setLoadingResources(true);
    try {
      const data = await getResourcesByTopic(topicId);
      setResources(data);
    } catch (err: any) {
      toast.error("Failed to load resources for this topic");
    } finally {
      setLoadingResources(false);
    }
  };

  const handleDeleteResource = async (resId: number) => {
    if (!selectedResourceTopicId) return;
    try {
      await deleteResource(resId);
      toast.success("Resource deleted successfully");
      loadResources(selectedResourceTopicId);
    } catch (err) {
      toast.error("Failed to delete resource");
    }
  };

  useEffect(() => {
    if (user && (user.role === 'instructor' || user.role === 'admin')) {
      loadTopics();
    }
  }, [user]);

  useEffect(() => {
    if (selectedResourceTopicId !== null) {
      loadResources(selectedResourceTopicId);
    } else {
      setResources([]);
    }
  }, [selectedResourceTopicId]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter root topics (parent is null)
  const rootTopics = topics.filter(t => t.parent === null);

  // Helper to build list of all subtopics under a selected root topic recursively
  const getSubtopicsForRoot = (rootId: number): TopicResponse[] => {
    const list: TopicResponse[] = [];
    const recurse = (parentId: number) => {
      const children = topics.filter(t => t.parent === parentId);
      children.forEach(child => {
        list.push(child);
        recurse(child.id);
      });
    };
    recurse(rootId);
    return list;
  };

  // Subtopics for the active root topic
  const activeSubtopics = selectedRootTopicId ? getSubtopicsForRoot(selectedRootTopicId) : [];
  
  // All topics in the active curriculum tree (root + subtopics)
  const activeCurriculumTopics = selectedRootTopicId 
    ? [topics.find(t => t.id === selectedRootTopicId), ...activeSubtopics].filter((t): t is TopicResponse => !!t)
    : [];

  const handleCreateRootTopic = async (values: TopicFormValues) => {
    try {
      const generatedSlug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const payload = {
        name: values.name,
        slug: generatedSlug,
        description: values.description,
        parent: null, // Force null for root topic
        position: topics.length,
        is_unlocked: true
      };

      const created = await createTopic(payload);
      toast.success("Root curriculum topic created!");
      
      // Select the newly created topic
      setSelectedRootTopicId(created.id);
      setSelectedResourceTopicId(created.id);
      reset({ name: "", description: "", parent: null });
      
      await loadTopics();
      // Auto advance to Step 2
      setCurrentStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create topic");
    }
  };

  const handleCreateChildModule = async (values: TopicFormValues) => {
    if (!selectedRootTopicId) {
      toast.error("Please select or define a root topic first");
      return;
    }
    try {
      const generatedSlug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const payload = {
        name: values.name,
        slug: generatedSlug,
        description: values.description,
        parent: values.parent || selectedRootTopicId, // Default to root topic if none selected
        position: topics.length,
        is_unlocked: true
      };

      await createTopic(payload);
      toast.success("Child module added!");
      reset({ name: "", description: "", parent: selectedRootTopicId });
      await loadTopics();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add module");
    }
  };

  const selectedRootTopic = topics.find(t => t.id === selectedRootTopicId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Curriculum Builder Wizard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Design curriculum paths, add submodules, and attach duration-tracked media resources in a structured workflow.
            </p>
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => navigate('/learning-path')}>
            View Learning Path Tree
          </Button>
        </div>

        {/* Wizard Progress Indicator */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Step 1 */}
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 group text-left"
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                  currentStep === 1 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : selectedRootTopicId 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-500"
                )}>
                  {selectedRootTopicId && currentStep !== 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
                </div>
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider", currentStep === 1 ? "text-indigo-600" : "text-slate-500")}>
                    Step 1
                  </p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">Define Curriculum</p>
                </div>
              </button>

              <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />

              {/* Step 2 */}
              <button 
                onClick={() => selectedRootTopicId && setCurrentStep(2)}
                disabled={!selectedRootTopicId}
                className="flex items-center gap-2 group text-left disabled:opacity-50"
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                  currentStep === 2 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : activeSubtopics.length > 0
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-500"
                )}>
                  {activeSubtopics.length > 0 && currentStep !== 2 ? <CheckCircle className="w-5 h-5" /> : "2"}
                </div>
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider", currentStep === 2 ? "text-indigo-600" : "text-slate-500")}>
                    Step 2
                  </p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">Add Child Modules</p>
                </div>
              </button>

              <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />

              {/* Step 3 */}
              <button 
                onClick={() => selectedRootTopicId && setCurrentStep(3)}
                disabled={!selectedRootTopicId}
                className="flex items-center gap-2 group text-left disabled:opacity-50"
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                  currentStep === 3 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : "bg-slate-100 text-slate-500"
                )}>
                  3
                </div>
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider", currentStep === 3 ? "text-indigo-600" : "text-slate-500")}>
                    Step 3
                  </p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">Upload Resources</p>
                </div>
              </button>
            </div>

            {selectedRootTopic && (
              <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl shrink-0 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 truncate max-w-[200px]">
                  Active: {selectedRootTopic.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {loadingTopics ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* STEP 1: Define Root Curriculum */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Step 1: Define Root Curriculum</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Select an existing root curriculum path or create a brand new one below.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Create Root */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create New Root</h3>
                    <form onSubmit={handleSubmit(handleCreateRootTopic)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Curriculum Name</label>
                        <input
                          {...register("name")}
                          placeholder="e.g. Advanced Machine Learning"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
                        <textarea
                          {...register("description")}
                          rows={4}
                          placeholder="Summary of the curriculum concepts and mastery goals."
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full h-11 shadow-sm gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                        Create Root Topic
                      </Button>
                    </form>
                  </div>

                  {/* Right Column: Select Existing */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Or Select Existing</h3>
                    {rootTopics.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No root curriculum courses exist yet.</p>
                    ) : (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-600">Select Path</label>
                        <select
                          value={selectedRootTopicId || ""}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            setSelectedRootTopicId(val);
                            setSelectedResourceTopicId(val);
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                        >
                          <option value="">-- Choose Course --</option>
                          {rootTopics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>

                        {selectedRootTopic && (
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl mt-4">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{selectedRootTopic.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {selectedRootTopic.description || "No description provided."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedRootTopicId}
                    className="gap-2 h-11 px-6 shadow-sm disabled:opacity-50"
                  >
                    Next: Add Modules
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Add Child Modules */}
            {currentStep === 2 && selectedRootTopic && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Step 2: Add Child Modules under "{selectedRootTopic.name}"</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Build submodules and structure your learning pathway hierarchy.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Create Module */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Add Submodule</h3>
                    <form onSubmit={handleSubmit(handleCreateChildModule)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Module Name</label>
                        <input
                          {...register("name")}
                          placeholder="e.g. Binary Search Trees"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Parent Module</label>
                        <select
                          {...register("parent")}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                        >
                          <option value={selectedRootTopicId}>{selectedRootTopic.name} (Root)</option>
                          {activeSubtopics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        {errors.parent && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">{errors.parent.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
                        <textarea
                          {...register("description")}
                          rows={3}
                          placeholder="What will students learn in this module?"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full h-11 shadow-sm gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Submodule
                      </Button>
                    </form>
                  </div>

                  {/* Right Column: Path Hierarchy List */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Syllabus Structure</h3>
                    {activeSubtopics.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No submodules added yet. The root topic stands alone.</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          <span className="font-bold text-indigo-950 text-xs truncate">{selectedRootTopic.name} (Root)</span>
                        </div>
                        {activeSubtopics.map((t, idx) => (
                          <div 
                            key={t.id} 
                            style={{ marginLeft: `${(t.parent !== selectedRootTopicId ? 1.5 : 0.75) * 16}px` }}
                            className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2 justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                                Lvl {t.parent !== selectedRootTopicId ? 2 : 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-700 truncate">{t.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="gap-2 h-11"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      setCurrentStep(3);
                      // Auto-select first active topic for resource uploader
                      if (selectedRootTopicId) {
                        setSelectedResourceTopicId(selectedRootTopicId);
                      }
                    }}
                    className="gap-2 h-11 px-6 shadow-sm"
                  >
                    Next: Upload Resources
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Upload Resources */}
            {currentStep === 3 && selectedRootTopic && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Step 3: Attach Media Resources</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload PDFs or embed YouTube videos/external links. Input durations to aggregate total course reading times.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Dropzone Uploader */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Target Module</label>
                      <select
                        value={selectedResourceTopicId || ""}
                        onChange={(e) => setSelectedResourceTopicId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                      >
                        {activeCurriculumTopics.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.id === selectedRootTopicId ? `${t.name} (Root)` : t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedResourceTopicId ? (
                      <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <DropzoneUploader 
                          topicId={selectedResourceTopicId}
                          onSuccess={() => loadResources(selectedResourceTopicId)}
                          existingResources={resources}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Select a target module to begin uploading files.</p>
                    )}
                  </div>

                  {/* Right Column: Uploaded Resources List */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Attached Resources ({resources.length})
                    </h3>

                    {loadingResources ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : resources.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No resources attached to this topic yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {resources.map(res => (
                          <div 
                            key={res.id} 
                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-white shadow-sm text-xs gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                res.resource_type === 'VIDEO' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                              )}>
                                {res.resource_type === 'VIDEO' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{res.title}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-slate-400">
                                  <span className="capitalize">{res.resource_type.toLowerCase()}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {res.duration_minutes || 0}m
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                              onClick={() => handleDeleteResource(res.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="gap-2 h-11"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      toast.success("Curriculum configured successfully!");
                      navigate('/learning-path');
                    }}
                    className="gap-2 h-11 px-8 shadow-md shadow-indigo-100"
                  >
                    Finish & View Learning Path
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default CurriculumBuilder;
