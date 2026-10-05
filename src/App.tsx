import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRoute from "@/components/RoleRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { TUTOR_ENABLED } from "@/lib/features";
import "@/lib/i18n";

/**
 * Routes are code-split with React.lazy (stage 7): the landing page and the
 * login form are all an anonymous visitor downloads, and the instructor and
 * admin bundles never reach a student's browser.
 */
const Landing = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const Topic = lazy(() => import("./pages/Course"));
const Assessment = lazy(() => import("./pages/Assessment"));
const QuizSession = lazy(() => import("./pages/QuizSession"));
const Mistakes = lazy(() => import("./pages/Mistakes"));
const Profile = lazy(() => import("./pages/Profile"));
const CurriculumBuilder = lazy(() => import("./pages/instructor/CurriculumBuilder"));
const CurriculumManager = lazy(() => import("./pages/instructor/CurriculumManager"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
// D24: the tutor is bundled and routed only when the flag is on.
const Tutor = lazy(() => import("./pages/Tutor"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // A 401 is handled by the client's silent refresh, not by retrying.
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div
      className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
      role="status"
      aria-label="loading"
    />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/learning-path" element={<LearningPath />} />
                <Route path="/topic/:id" element={<Topic />} />
                <Route path="/topic/:id/assessment" element={<QuizSession />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/mistakes" element={<Mistakes />} />
                <Route path="/profile" element={<Profile />} />
                {TUTOR_ENABLED && <Route path="/tutor" element={<Tutor />} />}
              </Route>

              {/* Instructors and admins: the role the API reports, not is_staff. */}
              <Route element={<RoleRoute allow={["instructor", "admin"]} />}>
                <Route path="/instructor/curriculum" element={<CurriculumManager />} />
                <Route path="/instructor/curriculum-builder" element={<CurriculumBuilder />} />
              </Route>

              <Route element={<RoleRoute allow={["admin"]} />}>
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
