import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

import type { Role } from "@/api/types";
import { useAuthStore } from "@/store/authStore";

/**
 * Route guard on the role the API reports (P2-5, D15).
 *
 * The old guard checked `is_staff`, which is not the same set: an instructor
 * who belongs to the Instructor group but is not staff was locked out of the
 * builder, and `is_staff` alone opened the admin pages. `role` comes from
 * `get_role` on the backend, so the frontend and the API apply one rule.
 */
const RoleRoute = ({ allow }: { allow: Role[] }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const permitted = user?.role !== undefined && allow.includes(user.role);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !permitted) {
      toast.error(t("auth.forbidden"));
    }
  }, [isLoading, isAuthenticated, user, permitted, t]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
          aria-label="loading"
        />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  // The profile arrives just after the token; wait rather than bounce.
  if (!user) return null;
  if (!permitted) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default RoleRoute;
