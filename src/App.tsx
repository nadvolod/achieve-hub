
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, memo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QuestionsProvider } from "./context/QuestionsContext";

// Fix lazy imports - use direct imports instead of lazy for critical components
import Index from "./pages/Index";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchInterval: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Add this style to hide the Lovable button
const hideLovableStyle = `
  #lovable-fab {
    display: none !important;
  }

  /* Force light mode as default */
  html:not(.dark) {
    color-scheme: light;
  }
`;

// Loading component for Suspense
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
  </div>
));

const AppRoutes = memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/landing" element={<Landing />} />
      <Route 
        path="/" 
        element={
          user ? (
            <ProtectedRoute><Index /></ProtectedRoute>
          ) : (
            <Navigate to="/landing" replace />
          )
        } 
      />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
});

const App = memo(() => {
  // Set default theme to light on app load
  if (localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <style>{hideLovableStyle}</style>
        <BrowserRouter>
          <AuthProvider>
            <QuestionsProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <AppRoutes />
              </Suspense>
            </QuestionsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
});

export default App;
