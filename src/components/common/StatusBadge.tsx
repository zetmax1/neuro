import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { TopicStatus } from "@/api/types";
import { statusStyle } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * A topic's status, drawn from the one palette (D21).
 *
 * Only `kind = topic` nodes have a status (D22); a section or a course shows
 * `k / n` instead, so this component is never rendered for them.
 */
export function StatusBadge({
  status,
  className,
  showLock = true,
}: {
  status: TopicStatus;
  className?: string;
  showLock?: boolean;
}) {
  const { t } = useTranslation();
  const style = statusStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        style.badge,
        className,
      )}
      data-testid={`status-badge-${status}`}
      title={t(`status_hint.${status}`)}
    >
      {showLock && style.locked && <Lock className="h-3 w-3" aria-hidden />}
      {t(style.labelKey)}
    </span>
  );
}

export default StatusBadge;
