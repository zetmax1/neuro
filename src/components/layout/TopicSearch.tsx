import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { searchTopics, type TopicSearchHit } from "@/api/learning.api";
import StatusBadge from "@/components/common/StatusBadge";
import { Input } from "@/components/ui/input";
import { formatProbability } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The topic search of the top bar (D40).
 *
 * The removed `KnowledgeSearch` page searched twelve concepts written into the
 * frontend. Searching is useful; inventing the data was the problem. So this
 * is a panel rather than a page, and every line of it comes from
 * `/api/learning/search/`: the name from the knowledge base, the course from
 * the tree, the status and P(L) from this learner's own state.
 *
 * Picking a result selects that node on the learning path, which is where a
 * topic is read in context — its prerequisites, what it unlocks, the route to
 * it — instead of a separate screen that would say less.
 */

/** Long enough that typing does not fire a request per keystroke. */
const DEBOUNCE_MS = 250;

const TopicSearch = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(term.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [term]);

  // A click anywhere else closes the list; so does Escape, below.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const search = useQuery({
    queryKey: ["learning", "search", query],
    queryFn: () => searchTopics(query),
    enabled: query.length > 0,
    staleTime: 30_000,
  });

  const select = (hit: TopicSearchHit) => {
    setOpen(false);
    setTerm("");
    navigate(`/learning-path?topic=${hit.topic_id}`);
  };

  const results = query.length > 0 ? (search.data?.results ?? []) : [];
  const showList = open && query.length > 0;

  return (
    <div ref={container} className={cn("relative", className)} data-testid="topic-search">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && results.length > 0) {
            event.preventDefault();
            select(results[0]);
          }
        }}
        placeholder={t("search.placeholder")}
        aria-label={t("search.label")}
        className="h-9 pl-8 pr-8"
        data-testid="topic-search-input"
      />
      {search.isFetching && (
        <Loader2
          className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}

      {showList && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-lg"
          data-testid="topic-search-results"
        >
          {search.isLoading ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : search.isError ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t("common.error")}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t("search.empty")}</p>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {results.map((hit) => (
                  <li key={hit.topic_id}>
                    <button
                      type="button"
                      onClick={() => select(hit)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/60"
                      data-testid={`topic-search-hit-${hit.topic_id}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{hit.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {t(`kind.${hit.kind}`)}
                          {hit.course_name ? ` · ${hit.course_name}` : ""}
                        </span>
                      </span>
                      {/* Only a topic has a status and a P(L) (D22). */}
                      {hit.status !== null && (
                        <span className="flex shrink-0 items-center gap-1.5">
                          <StatusBadge status={hit.status} showLock={false} />
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {formatProbability(hit.p_mastery)}
                          </span>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
                {t("search.hint")}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicSearch;
