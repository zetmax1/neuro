import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  getTopics, 
  createTopic, 
  updateTopic, 
  deleteTopic, 
  ARCHIVED_TOPIC_MESSAGE,
  getQuestionsByTopic,
  getResourcesByTopic,
  createResource,
  deleteResource,
  TopicResponse, 
  QuestionResponse,
  TopicResource
} from '@/api/instructor.api';
import QuestionForm from '@/components/instructor/QuestionForm';
import { getApiErrorMessage } from '@/lib/apiError';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Folder, 
  FolderPlus, 
  Plus, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  FileText,
  Video,
  BookOpen,
  Link as LinkIcon,
  Upload
} from 'lucide-react';

const topicSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-_]+$/, "Slug must be lowercase alphanumeric, dashes or underscores"),
  description: z.string().default(""),
  position: z.coerce.number().min(0, "Position must be positive"),
  parent: z.number().nullable(),
  // Stage 2: course = root; only topics hold questions (Y4).
  kind: z.enum(["course", "section", "topic"]).optional(),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicTreeItem extends TopicResponse {
  children: TopicTreeItem[];
}

const CurriculumManager: React.FC = () => {
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [resources, setResources] = useState<TopicResource[]>([]);
  
  const [isCreatingChild, setIsCreatingChild] = useState<boolean>(false);
  const [isCreatingRoot, setIsCreatingRoot] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState<boolean>(false);
  const [isResourcesLoading, setIsResourcesLoading] = useState<boolean>(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<number, boolean>>({});

  // Resource Upload form state
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState<'VIDEO' | 'DOCUMENT' | 'TEXT_CONTENT'>('DOCUMENT');
  const [resourceExternalUrl, setResourceExternalUrl] = useState("");
  const [resourceContent, setResourceContent] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      position: 0,
      parent: null
    }
  });

  const watchName = watch("name");

  // Automatically generate slug from name
  useEffect(() => {
    if (watchName && (isCreatingChild || isCreatingRoot || !selectedTopic)) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [watchName, isCreatingChild, isCreatingRoot, selectedTopic, setValue]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (err: unknown) {
      toast.error("Failed to load curriculum topics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadQuestions = async (topicId: number) => {
    setIsQuestionsLoading(true);
    try {
      const qData = await getQuestionsByTopic(topicId);
      setQuestions(qData);
    } catch (err: unknown) {
      toast.error("Failed to load questions for this topic");
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const loadResources = async (topicId: number) => {
    setIsResourcesLoading(true);
    try {
      const rData = await getResourcesByTopic(topicId);
      setResources(rData);
    } catch (err: unknown) {
      toast.error("Failed to load resources for this topic");
    } finally {
      setIsResourcesLoading(false);
    }
  };

  const handleSelectTopic = (topic: TopicResponse) => {
    setIsCreatingChild(false);
    setIsCreatingRoot(false);
    setSelectedTopic(topic);
    loadQuestions(topic.id);
    loadResources(topic.id);
    reset({
      name: topic.name,
      slug: topic.slug,
      description: topic.description || "",
      position: topic.position || 0,
      parent: topic.parent ? Number(topic.parent) : null,
      kind: topic.kind,
    });
  };

  const handleNewRoot = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setResources([]);
    setIsCreatingRoot(true);
    setIsCreatingChild(false);
    reset({
      name: "",
      slug: "",
      description: "",
      position: topics.length,
      parent: null,
      kind: "course",
    });
  };

  const handleNewChild = (parentTopic: TopicResponse) => {
    setSelectedTopic(null);
    setQuestions([]);
    setResources([]);
    setIsCreatingChild(true);
    setIsCreatingRoot(false);
    reset({
      name: "",
      slug: "",
      description: "",
      position: 0,
      parent: parentTopic.id,
      kind: "topic",
    });
  };

  const onSubmit = async (values: TopicFormValues) => {
    // Built explicitly: zod defaults leave the inferred form type partial,
    // and the API contract is required fields.
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description ?? "",
      position: values.position ?? 0,
      parent: values.parent ?? null,
      ...(values.kind ? { kind: values.kind } : {}),
    };

    try {
      if (selectedTopic) {
        // Update
        const updated = await updateTopic(selectedTopic.id, payload);
        toast.success("Topic updated successfully");
        setSelectedTopic(updated);
      } else {
        // Create
        const created = await createTopic(payload);
        toast.success("Topic created successfully");
        setSelectedTopic(created);
        setIsCreatingChild(false);
        setIsCreatingRoot(false);
      }
      await loadData();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save topic"));
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm("Delete this topic with all its descendants and questions? If learners have answered questions there, the branch is archived instead so their answers are kept.")) return;
    try {
      const result = await deleteTopic(topicId);
      if (result.archived) {
        toast.success(`${ARCHIVED_TOPIC_MESSAGE} (${result.archivedTopics ?? 1} topic(s)).`);
      } else {
        toast.success("Topic deleted successfully");
      }
      setSelectedTopic(null);
      setQuestions([]);
      setResources([]);
      await loadData();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete topic"));
    }
  };

  const toggleCollapse = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Resource Operations
  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    if (!resourceTitle) {
      toast.error("Resource title is required");
      return;
    }

    setIsUploadingResource(true);
    try {
      const formData = new FormData();
      formData.append("topic", selectedTopic.id.toString());
      formData.append("title", resourceTitle);
      formData.append("resource_type", resourceType);
      
      if (resourceFile) {
        formData.append("file", resourceFile);
      }
      formData.append("external_url", resourceExternalUrl);
      formData.append("content", resourceContent);

      await createResource(formData);
      toast.success("Resource uploaded successfully");
      
      // Reset form
      setResourceTitle("");
      setResourceType("DOCUMENT");
      setResourceExternalUrl("");
      setResourceContent("");
      setResourceFile(null);
      const fileInput = document.getElementById("resource-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Reload
      await loadResources(selectedTopic.id);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to upload resource"));
    } finally {
      setIsUploadingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteResource(resourceId);
      toast.success("Resource deleted successfully");
      if (selectedTopic) {
        await loadResources(selectedTopic.id);
      }
    } catch (err: unknown) {
      toast.error("Failed to delete resource");
    }
  };

  // Build hierarchical tree
  const treeData = useMemo(() => {
    const map = new Map<number, TopicTreeItem>();
    const roots: TopicTreeItem[] = [];

    topics.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    topics.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parent !== null && item.parent !== undefined) {
        const parentNode = map.get(Number(item.parent));
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [topics]);

  // Recursive tree node component
  const RenderTreeNode = ({ node }: { node: TopicTreeItem }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.id];
    const isSelected = selectedTopic?.id === node.id;

    return (
      <div className="pl-4">
        <div 
          onClick={() => handleSelectTopic(node)}
          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium' : 'hover:bg-slate-100/70 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button onClick={(e) => toggleCollapse(node.id, e)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-4 h-4" />
            )}
            <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="truncate text-sm">{node.name}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); handleNewChild(node); }}
              title="Add sub-topic"
              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50 rounded"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteTopic(node.id); }}
              title="Delete topic"
              className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-200/50 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="mt-1 border-l border-slate-200/70 ml-2">
            {node.children.map(child => (
              <RenderTreeNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Curriculum & Question Bank</h1>
            <p className="text-slate-500 text-sm">Create courses, manage prerequisite gating, and construct adaptive diagnostics.</p>
          </div>
          <Button onClick={handleNewRoot} className="gap-2 shadow-sm">
            <FolderPlus className="w-4 h-4" />
            New Root Topic
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT PANE: Hierarchical Tree */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h2 className="text-md font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-500" />
                Topic Hierarchy
              </h2>
              {treeData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm italic">No topics created yet.</p>
                </div>
              ) : (
                <div className="space-y-1 -ml-4">
                  {treeData.map(rootNode => (
                    <RenderTreeNode key={rootNode.id} node={rootNode} />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT PANE: Forms Editor */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* TOPIC EDITOR */}
              {(selectedTopic || isCreatingChild || isCreatingRoot) ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-indigo-500" />
                      {selectedTopic ? `Edit: ${selectedTopic.name}` : isCreatingChild ? 'Create Sub-Topic' : 'Create Root Topic'}
                    </h2>
                    {selectedTopic && (
                      <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteTopic(selectedTopic.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Topic
                      </Button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Topic Name</label>
                      <input 
                        {...register("name")}
                        placeholder="e.g. Tree Traversal"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Slug</label>
                      <input 
                        {...register("slug")}
                        placeholder="e.g. tree-traversal"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      />
                      {errors.slug && <p className="text-xs text-red-500 mt-1 font-medium">{errors.slug.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                      <textarea 
                        {...register("description")}
                        rows={3}
                        placeholder="Define learning objectives or course syllabus summary."
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      />
                      {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Order Position</label>
                      <input 
                        type="number"
                        {...register("position")}
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                      />
                      {errors.position && <p className="text-xs text-red-500 mt-1 font-medium">{errors.position.message}</p>}
                    </div>

                    {watch("parent") !== null && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Kind</label>
                        <select
                          {...register("kind")}
                          data-testid="node-kind-select"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                        >
                          <option value="topic">Topic (holds questions)</option>
                          <option value="section">Section (groups topics)</option>
                        </select>
                      </div>
                    )}

                    <div className="sm:col-span-2 flex justify-end pt-4 border-t border-slate-100 mt-2">
                      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 h-12 shadow-sm">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Topic
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No Topic Selected</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">Select a topic from the left side panel tree, or add a root node to get started.</p>
                  <Button variant="outline" onClick={handleNewRoot}>Create Root Topic</Button>
                </div>
              )}

              {/* CURRICULUM RESOURCES (MEDIA & UPLOAD) */}
              {selectedTopic && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Learning Resources ({resources.length})
                  </h3>

                  {/* Resource List */}
                  {isResourcesLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                  ) : resources.length === 0 ? (
                    <p className="text-slate-400 text-sm italic text-center py-4">No materials uploaded for this topic.</p>
                  ) : (
                    <div className="space-y-3">
                      {resources.map(res => (
                        <div key={res.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            {res.resource_type === 'VIDEO' ? <Video className="w-5 h-5 text-red-500" /> :
                             res.resource_type === 'DOCUMENT' ? <FileText className="w-5 h-5 text-blue-500" /> :
                             <BookOpen className="w-5 h-5 text-emerald-500" />}
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{res.title}</p>
                              <p className="text-xs text-slate-500 capitalize">
                                {res.resource_type.toLowerCase().replace('_', ' ')}
                                {res.file && " • PDF document"}
                                {res.external_url && " • External link"}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteResource(res.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resource Upload Form */}
                  <form onSubmit={handleUploadResource} className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Upload Learning Resource</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resource Title</label>
                        <input 
                          type="text" 
                          value={resourceTitle} 
                          onChange={e => setResourceTitle(e.target.value)}
                          placeholder="e.g. Binary Tree Traversal Guide"
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resource Type</label>
                        <select 
                          value={resourceType} 
                          onChange={e => setResourceType(e.target.value as never)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm bg-white"
                        >
                          <option value="DOCUMENT">Document (PDF/Doc)</option>
                          <option value="VIDEO">Video Link (YouTube/Vimeo)</option>
                          <option value="TEXT_CONTENT">Text/Markdown Notes</option>
                        </select>
                      </div>
                    </div>

                    {resourceType === 'DOCUMENT' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Document File</label>
                        <input 
                          id="resource-file"
                          type="file" 
                          onChange={e => setResourceFile(e.target.files?.[0] || null)}
                          className="w-full p-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
                        />
                      </div>
                    )}

                    {resourceType === 'VIDEO' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Video Embed URL</label>
                        <input 
                          type="url" 
                          value={resourceExternalUrl} 
                          onChange={e => setResourceExternalUrl(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm"
                        />
                      </div>
                    )}

                    {resourceType === 'TEXT_CONTENT' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Markdown Notes</label>
                        <textarea 
                          rows={4}
                          value={resourceContent} 
                          onChange={e => setResourceContent(e.target.value)}
                          placeholder="Write markdown course notes or lecture scripts here..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm"
                        />
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isUploadingResource} className="gap-2">
                        {isUploadingResource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload Resource
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* QUESTIONS LIST & CREATOR */}
              {selectedTopic && (
                <div className="space-y-6">
                  {/* Current Questions List */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Question Bank ({questions.length})
                    </h3>
                    
                    {isQuestionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : questions.length === 0 ? (
                      <p className="text-slate-400 text-sm italic text-center py-6">No questions inside this topic yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-2">
                        {questions.map(q => (
                          <div key={q.id} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                q.difficulty === 1 ? 'bg-emerald-100 text-emerald-800' :
                                q.difficulty === 2 ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-4">
                              {q.choices.map((c, i) => (
                                <p key={i} className={`text-xs ${c.is_correct ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                                  {i + 1}. {c.text} {c.is_correct ? '✓' : ''}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Question Component — only topics hold questions (Y4) */}
                  {selectedTopic.kind === 'topic' ? (
                    <QuestionForm 
                      topicId={selectedTopic.id} 
                      onSuccess={() => loadQuestions(selectedTopic.id)} 
                    />
                  ) : (
                    <p className="text-sm text-slate-500 italic" data-testid="questions-topic-only">
                      Questions can only be added to topics. This node is a {selectedTopic.kind}.
                    </p>
                  )}
                </div>
              )}

            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default CurriculumManager;
