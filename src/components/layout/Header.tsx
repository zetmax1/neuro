import { Brain, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import type { Role } from "@/api/types";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { TUTOR_ENABLED } from "@/lib/features";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

/**
 * The menu follows the role the API reports (D28):
 *
 * - student: home, learning path, practice and tests, review mistakes;
 * - instructor: and the curriculum builder;
 * - admin: and users.
 *
 * "Courses" is gone — it duplicated the learning path's course list and the
 * dashboard's knowledge map (addendum 2.4). So is the search page, which
 * showed a hard-coded concept list (D23).
 */

interface NavItem {
  path: string;
  label: string;
  roles?: Role[];
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuthContext();
  const { user } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const navLinks: NavItem[] = [
    { path: "/dashboard", label: t("nav.dashboard") },
    { path: "/learning-path", label: t("nav.learning_path") },
    { path: "/assessment", label: t("nav.assessments") },
    { path: "/mistakes", label: t("nav.mistakes") },
    { path: "/instructor/curriculum-builder", label: t("nav.curriculum_builder"), roles: ["instructor", "admin"] },
    { path: "/admin/users", label: t("nav.users"), roles: ["admin"] },
  ];

  if (TUTOR_ENABLED) {
    navLinks.push({ path: "/tutor", label: t("nav.tutor") });
  }

  const visible = navLinks.filter(
    (link) => !link.roles || (user?.role !== undefined && link.roles.includes(user.role)),
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="group flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" aria-hidden />
            <span className="hidden text-lg font-bold tracking-tight text-foreground sm:block">
              {t("app.name")}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label={t("nav.menu")}>
            {visible.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.path.replace(/\//g, "-")}`}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(link.path) ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitch />
            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild title={t("nav.profile")}>
                  <Link to="/profile" aria-label={t("nav.profile")}>
                    <User className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title={t("nav.logout")}
                  aria-label={t("nav.logout")}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="rounded-full px-4">
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="space-y-1 border-t border-border py-4 md:hidden" aria-label={t("nav.menu")}>
            {visible.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
