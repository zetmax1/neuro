import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LearningPath from "./pages/LearningPath";
import Course from "./pages/Course";
import Courses from "./pages/Courses";
import Assessment from "./pages/Assessment";
import Auth from "./pages/Auth";
import KnowledgeSearch from "./pages/KnowledgeSearch";
import Profile from "./pages/Profile";
import QuizSession from "./pages/QuizSession";
import Mistakes from "./pages/Mistakes";
import NotFound from "./pages/NotFound";
import AdminRoute from "@/components/AdminRoute";
import CurriculumManager from "./pages/instructor/CurriculumManager";
import CurriculumBuilder from "./pages/instructor/CurriculumBuilder";
import UserManagement from "./pages/admin/UserManagement";
import { TUTOR_ENABLED } from "@/lib/features";

// D24: the tutor is only bundled into a separate chunk and routed when enabled.
const Tutor = lazy(() => import("./pages/Tutor"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes — require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/course" element={<Course />} />
              <Route path="/topic/:id" element={<Course />} />
              <Route path="/courses" element={<Courses />} />
              {TUTOR_ENABLED && (
                <Route
                  path="/tutor"
                  element={
                    <Suspense fallback={null}>
                      <Tutor />
                    </Suspense>
                  }
                />
              )}
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/topic/:id/assessment" element={<QuizSession />} />
              <Route path="/mistakes" element={<Mistakes />} />
              <Route path="/search" element={<KnowledgeSearch />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Instructor routes — require staff privileges */}
            <Route element={<AdminRoute />}>
              <Route path="/instructor/curriculum" element={<CurriculumManager />} />
              <Route path="/instructor/curriculum-builder" element={<CurriculumBuilder />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
