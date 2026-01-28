import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import CreatePage from "./pages/CreatePage";
import CreateFromScratchPage from "./pages/CreateFromScratchPage";
import ScratchEditorPage from "./pages/ScratchEditorPage";
import SettingsPage from "./pages/SettingsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Eliminamos AuthProvider para que no dependa de Supabase */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Si alguien va a /auth, lo mandamos al inicio directamente */}
          <Route path="/auth" element={<Navigate to="/" replace />} />
          
          <Route
            path="/*"
            element={
              /* Eliminamos ProtectedRoute para entrar sin login */
              <AppLayout>
                <Routes>
                  <Route path="/" element={<CreatePage />} />
                  <Route path="/create-scratch" element={<CreateFromScratchPage />} />
                  <Route path="/create-scratch/:id" element={<ScratchEditorPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
