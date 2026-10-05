import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import type { MissingPrerequisite } from "@/api/types";
import { Button } from "@/components/ui/button";
import { formatProbability } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Why a topic is closed: the members of Pre(w) that are not mastered yet,
 * each with its own P(L) and a link (addendum 2.2, A4-8).
 *
 * The list comes from the backend — the 403 body of a closed topic, the
 * trajectory item or the topic history — and is never derived in the browser.
 */
export function MissingPrerequisites({
  missing,
  onShowPath,
  className,
}: {
  missing: MissingPrerequisite[];
  onShowPath?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  if (missing.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)} data-testid="missing-prerequisites">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
        {t("learning.missing_title")}
      </p>
      <ul className="space-y-1">
        {missing.map((item) => (
          <li key={item.topic_id} className="flex items-center justify-between gap-3 text-sm">
            <Link
              to={`/topic/${item.topic_id}`}
              className="truncate underline-offset-2 hover:underline"
            >
              {item.name}
            </Link>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {t("metric.p_mastery")} {formatProbability(item.p_mastery)}
            </span>
          </li>
        ))}
      </ul>
      {onShowPath && (
        <Button variant="outline" size="sm" onClick={onShowPath} data-testid="show-path">
          {t("goal.show_path")}
        </Button>
      )}
    </div>
  );
}

export default MissingPrerequisites;
