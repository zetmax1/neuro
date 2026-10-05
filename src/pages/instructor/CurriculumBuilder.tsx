import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  getTopics, 
  createTopic, 
  getResourcesByTopic, 
  deleteResource, 
  getQuestionsByTopic,
  deleteQuestion,
  TopicResponse, 
  TopicResource,
  QuestionResponse 
} from '@/api/instructor.api';
import Header from '@/components/layout/Header';
import DropzoneUploader from '@/components/instructor/DropzoneUploader';
import QuestionForm from '@/components/instructor/QuestionForm';
import { getApiErrorMessage } from '@/lib/apiError';
import ImportTestModal from '@/components/instructor/ImportTestModal';
import EditTopicModal from '@/components/instructor/EditTopicModal';
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
  Clock,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Edit3,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PrerequisiteEditor from "@/components/instructor/PrerequisiteEditor";
import { useTranslation } from "react-i18next";

const topicSchema = z.object({
  name: z.string().min(2, "Topic title must be at least 2 characters"),
  description: z.string().default(""),
  parent: z.preprocess(
    (val) => (val === "" || val === "null" || val === null ? null : Number(val)),
    z.number().nullable()
  ).default(null),
  pass_mark_percentage: z.preprocess(
    (val) => (val === "" || val === undefined ? 60 : Number(val)),
    z.number().min(0).max(100)
  ).default(60),
  test_question_count: z.preprocess(
    (val) => (val === "" || val === undefined ? 10 : Number(val)),
    z.number().min(1).max(50)
  ).default(10),
  kind: z.enum(["topic", "section"]).default("topic"),
});

type TopicFormValues = z.infer<typeof topicSchema>;

export const CurriculumBuilder: React.FC = () => {
  const { user, isLoading: loadingAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [selectedRootTopicId, setSelectedRootTopicId] = useState<number | null>(null);
  const [selectedResourceTopicId, setSelectedResourceTopicId] = useState<number | null>(null);
  const [selectedQuizTopicId, setSelectedQuizTopicId] = useState<number | null>(null);
  
  const [resources, setResources] = useState<TopicResource[]>([]);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Edit states & Modals
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null);
  const [editingTopic, setEditingTopic] = useState<TopicResponse | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: "",
      description: "",
      parent: null,
      pass_mark_percentage: 60,
      test_question_count: 10,
    }
  });

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      toast.error("Failed to load resources for this topic");
    } finally {
      setLoadingResources(false);
    }
  };

  const loadQuestions = async (topicId: number) => {
    setLoadingQuestions(true);
    try {
      const qData = await getQuestionsByTopic(topicId);
      setQuestions(qData);
    } catch (err: unknown) {
      toast.error("Failed to load quiz questions");
    } finally {
      setLoadingQuestions(false);
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

  const handleDeleteQuestion = async (qId: number) => {
    if (!selectedQuizTopicId) return;
    try {
      const result = await deleteQuestion(qId);
      toast.success(
        result.archived
          ? "Learners have answered this question, so it was deactivated instead of deleted."
          : "Quiz question deleted"
      );
      if (editingQuestion?.id === qId) {
        setEditingQuestion(null);
      }
      loadQuestions(selectedQuizTopicId);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete question"));
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedResourceTopicId) {
      loadResources(selectedResourceTopicId);
    }
  }, [selectedResourceTopicId]);

  useEffect(() => {
    if (selectedQuizTopicId) {
      setEditingQuestion(null);
      loadQuestions(selectedQuizTopicId);
    }
  }, [selectedQuizTopicId]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const isStaff = user?.is_staff || user?.role === "admin";
  if (!user || !isStaff) {
    return <Navigate to="/" replace />;
  }

  const rootTopics = topics.filter(t => !t.parent);
  const activeSubtopics = selectedRootTopicId 
    ? topics.filter(t => t.parent === selectedRootTopicId) 
    : [];

  const activeCurriculumTopics = selectedRootTopicId 
    ? [topics.find(t => t.id === selectedRootTopicId)!, ...activeSubtopics].filter(Boolean)
    : [];

  // Y4: questions can only be attached to nodes of kind "topic".
  const activeQuizTopics = activeCurriculumTopics.filter(t => t.kind === 'topic');
  const firstQuizTopicId = (rootId: number | null) =>
    topics.find(t => t.parent === rootId && t.kind === 'topic')?.id ?? null;

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
        parent: null,
        position: topics.length,
        pass_mark_percentage: values.pass_mark_percentage,
        test_question_count: values.test_question_count,
      };

      const newTopic = await createTopic(payload);
      toast.success("Root curriculum defined!");
      reset();
      await loadTopics();
      setSelectedRootTopicId(newTopic.id);
      setSelectedResourceTopicId(newTopic.id);
      setSelectedQuizTopicId(null); // a course holds no questions (Y4)
      setCurrentStep(2);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to create root topic"));
    }
  };

  const handleAddSubmodule = async (values: TopicFormValues) => {
    if (!selectedRootTopicId) return;
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
        parent: values.parent || selectedRootTopicId,
        kind: values.kind,
        position: topics.length,
        pass_mark_percentage: values.pass_mark_percentage,
        test_question_count: values.test_question_count,
      };

      await createTopic(payload);
      toast.success("Child module added!");
      reset({ name: "", description: "", parent: selectedRootTopicId, pass_mark_percentage: 60, test_question_count: 10, kind: "topic" });
      await loadTopics();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to add module"));
    }
  };

  const selectedRootTopic = topics.find(t => t.id === selectedRootTopicId);
  const selectedQuizTopic = topics.find(t => t.id === selectedQuizTopicId);

  // Question Difficulty Stats for Step 4
  const easyQCount = questions.filter(q => q.difficulty === 1).length;
  const medQCount = questions.filter(q => q.difficulty === 2).length;
  const hardQCount = questions.filter(q => q.difficulty === 3).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Curriculum & Theme Quiz Builder</h1>
            <p className="text-slate-500 text-sm mt-1">
              Design curriculum paths, manage models (CRUD), upload resources, and bulk-import theme quiz questions.
            </p>
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => navigate('/learning-path')}>
            View Learning Path Tree
          </Button>
        </div>

        {/* Wizard Progress Stepper (4 Steps) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-wrap md:flex-nowrap justify-between overflow-visible">
              
              {/* Step 1 */}
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 group text-left shrink-0"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                  currentStep === 1 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : selectedRootTopicId 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-500"
                )}>
                  {selectedRootTopicId && currentStep !== 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
                </div>
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", currentStep === 1 ? "text-indigo-600" : "text-slate-400")}>
                    Step 1
                  </p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">Define Curriculum</p>
                </div>
              </button>

              <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block shrink-0" />

              {/* Step 2 */}
              <button 
                onClick={() => selectedRootTopicId && setCurrentStep(2)}
                disabled={!selectedRootTopicId}
                className="flex items-center gap-2 group text-left disabled:opacity-50 shrink-0"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                  currentStep === 2 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : activeSubtopics.length > 0
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-500"
                )}>
                  {activeSubtopics.length > 0 && currentStep !== 2 ? <CheckCircle className="w-4 h-4" /> : "2"}
                </div>
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", currentStep === 2 ? "text-indigo-600" : "text-slate-400")}>
                    Step 2
                  </p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">Add Submodules</p>
                </div>
              </button>

              <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block shrink-0" />

              {/* Step 3 */}
              <button 
                onClick={() => selectedRootTopicId && setCurrentStep(3)}
                disabled={!selectedRootTopicId}
                className="flex items-center gap-2 group text-left disabled:opacity-50 shrink-0"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                  currentStep === 3 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : resources.length > 0
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-500"
                )}>
                  {resources.length > 0 && currentStep !== 3 ? <CheckCircle className="w-4 h-4" /> : "3"}
                </div>
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", currentStep === 3 ? "text-indigo-600" : "text-slate-400")}>
                    Step 3
                  </p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">Upload Materials</p>
                </div>
              </button>

              <ChevronRight className="w-4 h-4 text-slate-300 hidden md:block shrink-0" />

              {/* Step 4: Create Theme Quiz Questions */}
              <button 
                onClick={() => selectedRootTopicId && setCurrentStep(4)}
                disabled={!selectedRootTopicId}
                className="flex items-center gap-2 group text-left disabled:opacity-50 shrink-0"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                  currentStep === 4 
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                    : questions.length > 0 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-100 text-slate-500"
                )}>
                  4
                </div>
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", currentStep === 4 ? "text-indigo-600" : "text-slate-400")}>
                    Step 4
                  </p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">Create Theme Quiz</p>
                </div>
              </button>

              {/* Step 5: Prerequisites — the centre of the thesis (addendum 2.6) */}
              <button
                onClick={() => selectedRootTopicId && setCurrentStep(5)}
                disabled={!selectedRootTopicId}
                className="flex items-center gap-2 group text-left disabled:opacity-50 shrink-0"
                data-testid="step-prerequisites"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                  currentStep === 5
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                    : "bg-slate-100 text-slate-500"
                )}>
                  5
                </div>
                <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", currentStep === 5 ? "text-indigo-600" : "text-slate-400")}>
                    Step 5
                  </p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{t("builder.tab_prerequisites")}</p>
                </div>
              </button>

            </div>

            {selectedRootTopic && (
              <div className="bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-2xl shrink-0 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900 truncate max-w-[180px]">
                  {selectedRootTopic.name}
                </span>
                <button
                  onClick={() => {
                    setEditingTopic(selectedRootTopic);
                    setIsEditTopicModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 p-0.5"
                  title="Edit Root Topic Model"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
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
                    Select an existing root curriculum path or create a new one.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create New Root Topic</h3>
                    <form onSubmit={handleSubmit(handleCreateRootTopic)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Curriculum Name</label>
                        <input
                          {...register("name")}
                          placeholder="e.g. Computer Science Fundamentals"
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
                          rows={3}
                          placeholder="Summary of the curriculum concepts and mastery goals."
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Pass Grade (%)</label>
                          <input
                            type="number"
                            {...register("pass_mark_percentage")}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Test Question Count</label>
                          <input
                            type="number"
                            {...register("test_question_count")}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                          />
                        </div>
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full h-11 shadow-sm gap-2 font-bold">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                        Create Root Topic
                      </Button>
                    </form>
                  </div>

                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Or Select Existing Curriculum Model</h3>
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
                            setSelectedQuizTopicId(firstQuizTopicId(val));
                          }}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white font-semibold text-slate-800"
                        >
                          <option value="">-- Choose Course --</option>
                          {rootTopics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>

                        {selectedRootTopic && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-sm">{selectedRootTopic.name}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTopic(selectedRootTopic);
                                  setIsEditTopicModalOpen(true);
                                }}
                                className="h-7 px-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-bold gap-1 text-xs"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit Model
                              </Button>
                            </div>
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
                    disabled={!selectedRootTopicId} 
                    onClick={() => setCurrentStep(2)}
                    className="gap-2 h-11 px-8 font-bold"
                  >
                    Continue to Submodules <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Add Submodules */}
            {currentStep === 2 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Step 2: Add Submodules & Nodes</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Add themes under <strong className="text-slate-800">{selectedRootTopic?.name}</strong>.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Add Submodule</h3>
                    <form onSubmit={handleSubmit(handleAddSubmodule)} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Module Name</label>
                        <input
                          {...register("name")}
                          placeholder="e.g. Arrays and Linked Lists"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
                        <textarea
                          {...register("description")}
                          rows={3}
                          placeholder="Brief topic overview."
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Kind</label>
                        <select
                          {...register("kind")}
                          data-testid="node-kind-select"
                          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                        >
                          <option value="topic">Topic (holds questions)</option>
                          <option value="section">Section (groups topics)</option>
                        </select>
                      </div>

                      <Button type="submit" disabled={isSubmitting} className="w-full h-11 shadow-sm gap-2 font-bold">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Child Submodule
                      </Button>
                    </form>
                  </div>

                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Existing Submodules ({activeSubtopics.length})
                    </h3>

                    {activeSubtopics.length === 0 ? (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No submodules added under this root path yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {activeSubtopics.map(sub => (
                          <div key={sub.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{sub.name}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{sub.description || "No description"}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTopic(sub);
                                setIsEditTopicModalOpen(true);
                              }}
                              className="h-8 px-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-semibold gap-1 text-xs shrink-0"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2 h-11">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="gap-2 h-11 px-8 font-bold">
                    Continue to Materials <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Upload Materials */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Step 3: Upload Materials & Video Guides</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Attach documents, videos, and reading materials to curriculum nodes.
                    </p>
                  </div>
                  <div className="shrink-0 min-w-[220px]">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Module</label>
                    <select
                      value={selectedResourceTopicId || ""}
                      onChange={(e) => setSelectedResourceTopicId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    >
                      {activeCurriculumTopics.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.id === selectedRootTopicId ? `${t.name} (Root)` : t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-7 space-y-4">
                    {selectedResourceTopicId ? (
                      <DropzoneUploader 
                        topicId={selectedResourceTopicId} 
                        onSuccess={() => loadResources(selectedResourceTopicId)} 
                      />
                    ) : (
                      <p className="text-sm text-slate-400 italic">Select a topic above to upload resources.</p>
                    )}
                  </div>

                  <div className="md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Uploaded Resources ({resources.length})
                    </h3>

                    {loadingResources ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : resources.length === 0 ? (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No materials uploaded to this module yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {resources.map(res => (
                          <div key={res.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                {res.resource_type === 'VIDEO' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">{res.title}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{res.resource_type}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteResource(res.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2 h-11">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="gap-2 h-11 px-8 font-bold">
                    Continue to Theme Quiz <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Create Theme Quiz Questions */}
            {currentStep === 5 && (
              <section className="space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t("builder.prereq_title")}</h2>
                </div>
                <PrerequisiteEditor courseId={selectedRootTopicId} />
              </section>
            )}

            {currentStep === 4 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Step 4: Create Theme Quiz Questions</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Add multiple-choice quiz questions directly inside each theme for stratified testing.
                    </p>
                  </div>
                  
                  {/* Theme Selector */}
                  <div className="shrink-0 min-w-[220px]">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Active Theme</label>
                    <select
                      value={selectedQuizTopicId || ""}
                      onChange={(e) => setSelectedQuizTopicId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">{activeQuizTopics.length ? "-- Choose topic --" : "No topics yet (only topics hold questions)"}</option>
                      {activeQuizTopics.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.id === selectedRootTopicId ? `${t.name} (Root)` : t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Difficulty Summary Box & Shablon Import Bar */}
                {selectedQuizTopicId && (
                  <div className="bg-slate-50 border border-slate-200 text-slate-900 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          Theme Quiz Question Bank Stats
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Target requirement: Create at least 15 questions per theme (40% Easy, 30% Medium, 30% Hard).
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                          <span className="text-[10px] text-emerald-700 font-bold block">Easy</span>
                          <span className="text-sm font-extrabold text-slate-900">{easyQCount}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                          <span className="text-[10px] text-amber-700 font-bold block">Medium</span>
                          <span className="text-sm font-extrabold text-slate-900">{medQCount}</span>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                          <span className="text-[10px] text-rose-700 font-bold block">Hard</span>
                          <span className="text-sm font-extrabold text-slate-900">{hardQCount}</span>
                        </div>
                        <div className="bg-indigo-600 px-3.5 py-1.5 rounded-xl text-center shadow-sm">
                          <span className="text-[10px] text-indigo-100 font-bold block">Total</span>
                          <span className="text-sm font-black text-white">{questions.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Import Shablon Quick Banner */}
                    <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-indigo-600 shrink-0" />
                        Bulk import test questions from Excel (.xlsx) or Word (.docx) using template!
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-xl gap-1.5 shrink-0 shadow-sm"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        Import Tests from Excel/Word
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-12 gap-8">
                  {/* Embedded QuestionForm (Supports Create & Update) */}
                  <div className="md:col-span-7 space-y-4">
                    {selectedQuizTopicId ? (
                      <QuestionForm 
                        topicId={selectedQuizTopicId} 
                        editingQuestion={editingQuestion}
                        onSuccess={() => {
                          setEditingQuestion(null);
                          loadQuestions(selectedQuizTopicId);
                        }} 
                        onCancelEdit={() => setEditingQuestion(null)}
                      />
                    ) : (
                      <p className="text-sm text-slate-400 italic">Select a theme above to create questions.</p>
                    )}
                  </div>

                  {/* Existing Questions List for Selected Theme */}
                  <div className="md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Questions List ({questions.length})
                    </h3>

                    {loadingQuestions ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No quiz questions added to this theme yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {questions.map((q, idx) => (
                          <div 
                            key={q.id} 
                            className={cn(
                              "p-4 rounded-2xl border transition-all space-y-2",
                              editingQuestion?.id === q.id 
                                ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20" 
                                : "border-slate-200 bg-slate-50/60"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 leading-snug">
                                #{idx + 1}. {q.text}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                  q.difficulty === 1 ? 'bg-emerald-100 text-emerald-800' :
                                  q.difficulty === 2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Med' : 'Hard'}
                                </span>

                                {/* Edit Button */}
                                <button 
                                  onClick={() => setEditingQuestion(q)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 transition-colors"
                                  title="Edit Question"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button 
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 pt-1 border-t border-slate-100">
                              {q.choices.map((c, cIdx) => (
                                <p key={cIdx} className={`text-[11px] ${c.is_correct ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                                  {String.fromCharCode(65 + cIdx)}. {c.text} {c.is_correct ? '✓' : ''}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2 h-11">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button 
                    onClick={() => {
                      toast.success("Theme curriculum and quiz session configured successfully!");
                      navigate('/learning-path');
                    }} 
                    className="gap-2 h-11 px-8 shadow-md shadow-indigo-100 font-bold"
                  >
                    Finish & View Learning Path <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Excel/Word Shablon Import Modal */}
        {selectedQuizTopicId && (
          <ImportTestModal
            topicId={selectedQuizTopicId}
            topicName={selectedQuizTopic?.name || "Selected Theme"}
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={() => {
              if (selectedQuizTopicId) {
                loadQuestions(selectedQuizTopicId);
              }
            }}
          />
        )}

        {/* Edit Topic Model Modal */}
        <EditTopicModal
          topic={editingTopic}
          allTopics={topics}
          isOpen={isEditTopicModalOpen}
          onClose={() => {
            setIsEditTopicModalOpen(false);
            setEditingTopic(null);
          }}
          onSuccess={() => loadTopics()}
        />

      </main>
    </div>
  );
};

export default CurriculumBuilder;
