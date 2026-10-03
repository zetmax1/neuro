import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTopicDetail, getTopicResources, StudentTopicResource as TopicResource } from "@/api/curriculum.api";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  ExternalLink,
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DiagnosticsPanel from "@/components/DiagnosticsPanel";
import PdfViewer from "@/components/PdfViewer";

interface TopicDetails {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description: string;
  is_unlocked: boolean;
}

const Course: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<TopicDetails | null>(null);
  const [resources, setResources] = useState<TopicResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeResourceId, setActiveResourceId] = useState<number | null>(null);

  const getMediaUrl = (filePath: string) => {
    if (!filePath) return "";
    if (filePath.startsWith('http')) return filePath;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl.replace(/\/$/, '')}${filePath}`;
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  useEffect(() => {
    const fetchTopicData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // 1. Fetch topic details
        setTopic(await getTopicDetail(id));

        // 2. Fetch resources
        const resourceData = await getTopicResources(id);
        setResources(resourceData);
        
        // Auto-select first resource if available
        if (resourceData.length > 0) {
          setActiveResourceId(resourceData[0].id);
        }
      } catch (err: any) {
        // Archived topics (D11) answer 404 like missing ones.
        toast.error(
          err?.response?.status === 404
            ? "This topic is no longer available."
            : "Failed to load course materials"
        );
        navigate('/learning-path');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-indigo-550 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading syllabus...</p>
        </main>
      </div>
    );
  }

  if (!topic) return null;

  const activeResource = resources.find(r => r.id === activeResourceId);
  const activeYoutubeEmbed = activeResource?.external_url ? getYoutubeEmbedUrl(activeResource.external_url) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl space-y-6">
        
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-semibold text-slate-500 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <Link to="/learning-path" className="hover:text-indigo-650 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Pathways
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 truncate max-w-[200px] sm:max-w-xs">{topic.name}</span>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 self-start sm:self-auto px-3 py-1 rounded-full">
            Active Study Module
          </Badge>
        </div>

        {/* Cinematic Cinema/Split Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SECTION: Cinematic Viewer & Info (8 Columns in lg) */}
          <div className="lg:col-span-8 space-y-6 flex flex-col order-1">
            
            {/* 1. Cinematic Player Pane */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[460px] relative group">
              {activeResource ? (
                <div className="flex flex-col h-full flex-1">
                  
                  {/* Media Content */}
                  <div className="relative bg-slate-900 aspect-video w-full flex-1 min-h-[460px] max-h-[560px] overflow-hidden">
                    {activeYoutubeEmbed ? (
                      <iframe
                        src={`${activeYoutubeEmbed}?autoplay=0&rel=0&modestbranding=1`}
                        title={activeResource.title}
                        className="w-full h-full absolute inset-0 border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : activeResource.resource_type === "VIDEO" && activeResource.file ? (
                      <video
                        src={getMediaUrl(activeResource.file)}
                        controls
                        className="w-full h-full absolute inset-0 object-contain bg-black"
                      />
                    ) : activeResource.resource_type === "DOCUMENT" && activeResource.file ? (
                      <PdfViewer 
                        url={getMediaUrl(activeResource.file)} 
                        title={activeResource.title} 
                      />
                    ) : activeResource.content ? (
                      <div className="w-full h-full p-6 sm:p-8 overflow-y-auto bg-slate-50/50 leading-relaxed text-sm text-slate-700">
                        <div className="max-w-2xl mx-auto space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{activeResource.title}</h3>
                          <div className="whitespace-pre-wrap">{activeResource.content}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 italic">
                        No viewer support for this resource.
                      </div>
                    )}
                  </div>

                  {/* Media Info Footer */}
                  <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="uppercase font-bold tracking-wider text-indigo-600">
                          Now Studying
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {activeResource.duration_minutes || 10}m duration
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-905 text-base sm:text-lg leading-snug truncate">{activeResource.title}</h3>
                    </div>

                    {activeResource.external_url && (
                      <a 
                        href={activeResource.external_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="shrink-0 self-end sm:self-auto"
                      >
                        <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                          External Link
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                /* No Active Resource State */
                <div className="flex flex-col items-center justify-center p-12 text-center my-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-indigo-550 shadow-inner">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Select a Learning Resource</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Choose from the list of materials on the right to load video guides, documents, and slides.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Course Description & Info */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Syllabus Overview</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {topic.description || "Learn fundamental properties, theoretical models, and practical applications of this curriculum node."}
              </p>
            </div>

            {/* 3. BKT + IRT Algorithm Diagnostics & Proof (Collapsed by default) */}
            <DiagnosticsPanel topicId={topic.id} />
          </div>


          {/* RIGHT SECTION: Materials Playlist & Quiz Launch (4 Columns in lg) */}
          <div className="lg:col-span-4 space-y-6 order-2">
            
            {/* 1. Diagnostic Center */}
            <div className="relative rounded-3xl overflow-hidden border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-transparent p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Diagnostic Assessment</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ready to demonstrate your mastery? Take the adaptive quiz. Achieving 70% or higher unlocks downstream topics!
              </p>
              <Link to={`/topic/${topic.id}/assessment`} className="block">
                <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl gap-2 shadow-sm">
                  Launch Test Session
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* 2. Playlist Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-550" />
                  Playlist ({resources.length})
                </h3>
              </div>

              {resources.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No resources in playlist.</p>
              ) : (
                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {resources.map((res) => {
                    const isVideo = res.resource_type === "VIDEO";
                    const isDoc = res.resource_type === "DOCUMENT";
                    const isCurrent = activeResourceId === res.id;

                    return (
                      <button
                        key={res.id}
                        onClick={() => setActiveResourceId(res.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3",
                          isCurrent 
                            ? "bg-indigo-50/80 border-indigo-200 shadow-sm" 
                            : "border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          isCurrent
                            ? "bg-indigo-650 text-white"
                            : isVideo 
                              ? "bg-red-100 text-red-650" 
                              : "bg-blue-100 text-blue-650"
                        )}>
                          {isVideo ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-xs font-bold truncate",
                            isCurrent ? "text-indigo-950 font-extrabold" : "text-slate-700"
                          )}>
                            {res.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="capitalize">{res.resource_type.toLowerCase()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="w-3 h-3" />
                              {res.duration_minutes || 10}m
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Course;
