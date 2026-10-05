import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, FlaskConical } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { usersApi, type AdminUser } from "@/api/auth.api";
import type { Role } from "@/api/types";
import Header from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage } from "@/lib/apiError";
import { displayName } from "@/lib/topics";
import { useAuthStore } from "@/store/authStore";

/**
 * The user page (addendum 2.7).
 *
 * "Unnamed User" is gone: a learner with no name is shown by the part of
 * their email before the @. Roles can be filtered and assigned, simulated
 * accounts (D13) are badged and can be hidden, and an account can be
 * deactivated — which is reversible, unlike the soft delete.
 */

const ROLES: readonly Role[] = ["student", "instructor", "admin"];

const UserManagement = () => {
  const { t } = useTranslation();
  const client = useQueryClient();
  const me = useAuthStore((state) => state.user);
  const [role, setRole] = useState<Role | "all">("all");
  const [hideSimulated, setHideSimulated] = useState(false);

  const users = useQuery({
    queryKey: ["accounts", "users", role, hideSimulated],
    queryFn: () =>
      usersApi.list({
        ...(role === "all" ? {} : { role }),
        ...(hideSimulated ? { simulated: false } : {}),
      }),
  });

  const update = useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: { role?: Role; is_active?: boolean } }) =>
      usersApi.update(id, changes),
    onSuccess: (_data, variables) => {
      toast.success(t(variables.changes.role ? "users.role_changed" : "users.active_changed"));
      void client.invalidateQueries({ queryKey: ["accounts", "users"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t("common.error"))),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("users.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("users.subtitle")}</p>
        </header>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("users.filter_role")}>
            <Button size="sm" variant={role === "all" ? "default" : "outline"} onClick={() => setRole("all")}>
              {t("common.all")}
            </Button>
            {ROLES.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={role === option ? "default" : "outline"}
                onClick={() => setRole(option)}
                data-testid={`role-filter-${option}`}
              >
                {t(`profile.role_${option}`)}
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={hideSimulated}
              onCheckedChange={setHideSimulated}
              data-testid="hide-simulated"
            />
            {t("users.hide_simulated")}
          </label>
        </div>

        {users.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : users.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{t("common.error")}</p>
              <Button variant="outline" size="sm" onClick={() => void users.refetch()}>
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("users.col_user")}</th>
                  <th className="px-4 py-3">{t("users.col_role")}</th>
                  <th className="px-4 py-3">{t("users.col_active")}</th>
                  <th className="px-4 py-3">{t("users.col_joined")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(users.data ?? []).map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isMe={user.id === me?.id}
                    busy={update.isPending}
                    onChange={(changes) => update.mutate({ id: user.id, changes })}
                  />
                ))}
              </tbody>
            </table>
            {(users.data ?? []).length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const UserRow = ({
  user,
  isMe,
  busy,
  onChange,
}: {
  user: AdminUser;
  isMe: boolean;
  busy: boolean;
  onChange: (changes: { role?: Role; is_active?: boolean }) => void;
}) => {
  const { t, i18n } = useTranslation();

  return (
    <tr className={user.is_deleted ? "opacity-60" : undefined} data-testid="user-row">
      <td className="px-4 py-3">
        <div className="space-y-0.5">
          <p className="flex items-center gap-2 font-medium">
            {displayName(user)}
            {isMe && <span className="text-xs text-muted-foreground">({t("users.you")})</span>}
            {user.is_simulated && (
              <Badge variant="secondary" className="gap-1 text-xs" title={t("users.simulated")}>
                <FlaskConical className="h-3 w-3" aria-hidden />
                {t("users.simulated")}
              </Badge>
            )}
            {user.is_deleted && <Badge variant="outline">{t("users.deleted")}</Badge>}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Select
          value={user.role}
          onValueChange={(value) => onChange({ role: value as Role })}
          disabled={isMe || busy}
        >
          <SelectTrigger className="h-8 w-[150px]" aria-label={t("users.col_role")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`profile.role_${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <Switch
          checked={user.is_active}
          onCheckedChange={(checked) => onChange({ is_active: checked })}
          disabled={isMe || busy}
          aria-label={t(user.is_active ? "users.deactivate" : "users.activate")}
          data-testid="toggle-active"
        />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(user.date_joined).toLocaleDateString(i18n.resolvedLanguage)}
      </td>
    </tr>
  );
};

export default UserManagement;
