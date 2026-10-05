import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Clock, ExternalLink, FileText, PlayCircle, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getTopicDetail,
  getTopicResources,
  type StudentTopicResource,
} from "@/api/curriculum.api";
import MissingPrerequisites from "@/components/common/MissingPrerequisites";
import StatusBadge from "@/components/common/StatusBadge";
import Header from "@/components/layout/Header";
import PdfViewer from "@/components/PdfViewer";
import DiagnosticsPanel from "@/components/topic/DiagnosticsPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopicHistory } from "@/hooks/useLearningData";
import { API_BASE_URL } from "@/api/client";
import { formatProbability } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The topic page (addendum 2.5).
 *
 * Content is the same width as the other pages rather than a narrow column,
 * and the panel that mattered most — "How this was calculated" — is a first
 * class section rather than a card labelled "PROOF". The status, P(L) and the
 * missing prerequisites come from the same endpoint the diagnostics table
 * reads, so the page cannot contradict itself.
 */

const mediaUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
};

const youtubeEmbed = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const Topic = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeResourceId, setActiveResourceId] = useState<number | null>(null);

  const detail = useQuery({
    queryKey: ["curriculum", "topic", id],
    queryFn: () => getTopicDetail(id as string),
    enabled: Boolean(id),
    retry: false,
  });
  const resources = useQuery({
    queryKey: ["curriculum", "topic-resources", id],
    queryFn: () => getTopicResources(id as string),
    enabled: Boolean(id),
  });
  const history = useTopicHistory(id);

  // Archived topics answer 404 like missing ones (D11).
  useEffect(() => {
    if (detail.isError) navigate("/learning-path", { replace: true });
  }, [detail.isError, navigate]);

  useEffect(() => {
    if (resources.data && resources.data.length > 0 && activeResourceId === null) {
      setActiveResourceId(resources.data[0].id);
    }
  }, [resources.data, activeResourceId]);

  if (detail.isLoading) {
    return (
      <Shell>
        <Skeleton className="h-96 w-full" />
      </Shell>
    );
  }
  if (!detail.data) return null;

  const topic = detail.data;
  const isTopicKind = topic.kind === "topic";
  const active = (resources.data ?? []).find((resource) => resource.id === activeResourceId);
  const closed = history.data?.status === "closed";

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            to="/learning-path"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t("learning.title")}
          </Link>
          <h1 className="truncate text-2xl font-bold tracking-tight">{topic.name}</h1>
          {topic.description && (
            <p className="max-w-3xl text-sm text-muted-foreground">{topic.description}</p>
          )}
        </div>

        {isTopicKind && history.data && (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={history.data.status} />
            <span className="text-sm tabular-nums text-muted-foreground">
              {t("metric.p_mastery")} {formatProbability(history.data.p_mastery)}
            </span>
            <Button size="sm" asChild disabled={closed}>
              <Link to={`/topic/${topic.id}/assessment?mode=practice`}>{t("learning.practice")}</Link>
            </Button>
            <Button size="sm" variant="outline" asChild disabled={closed}>
              <Link to={`/topic/${topic.id}/assessment?mode=test`}>{t("topic.test")}</Link>
            </Button>
          </div>
        )}
      </div>

      {closed && history.data && (
        <Card className="border-dashed">
          <CardContent className="py-5">
            <MissingPrerequisites missing={history.data.missing} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("topic.resources")}</CardTitle>
            </CardHeader>
            <CardContent>
              {resources.isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : !active ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t("topic.no_resources")}
                </p>
              ) : (
                <ResourceViewer resource={active} />
              )}
            </CardContent>
          </Card>

          {isTopicKind && <DiagnosticsPanel history={history.data} isLoading={history.isLoading} />}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("topic.diagnostic_title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("topic.diagnostic_text")}</p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-2">
          {(resources.data ?? []).map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => setActiveResourceId(resource.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                resource.id === activeResourceId
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
              data-testid="resource-item"
            >
              <ResourceIcon type={resource.resource_type} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{resource.title}</span>
                {resource.duration_minutes > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {t("assessment.minutes", { count: resource.duration_minutes })}
                  </span>
                )}
              </span>
            </button>
          ))}
        </aside>
      </div>
    </Shell>
  );
};

const ResourceIcon = ({ type }: { type: StudentTopicResource["resource_type"] }) => {
  const Icon = type === "VIDEO" ? Video : type === "DOCUMENT" ? FileText : PlayCircle;
  return <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
};

const ResourceViewer = ({ resource }: { resource: StudentTopicResource }) => {
  const { t } = useTranslation();
  const embed = resource.external_url ? youtubeEmbed(resource.external_url) : null;

  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={embed}
          title={resource.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
        />
      </div>
    );
  }

  if (resource.resource_type === "DOCUMENT" && resource.file) {
    return <PdfViewer url={mediaUrl(resource.file)} title={resource.title} />;
  }

  if (resource.content) {
    return <div className="prose prose-sm max-w-none dark:prose-invert">{resource.content}</div>;
  }

  if (resource.external_url) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href={resource.external_url} target="_blank" rel="noreferrer noopener">
          {resource.title}
          <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden />
        </a>
      </Button>
    );
  }

  return <p className="py-8 text-center text-sm text-muted-foreground">{t("topic.no_resources")}</p>;
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto space-y-6 px-4 py-6">{children}</main>
  </div>
);

export default Topic;
