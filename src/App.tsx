
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QuestionsProvider } from "./context/QuestionsContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
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
      // Add less aggressive refetching
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
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

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
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
};

const App = () => {
  // Set default theme to light on app load
  if (localStorage.getItem("theme") === null) {
    localStorage.setItem("theme", "light");
    // Remove dark class if it was added by system preference
    document.documentElement.classList.remove("dark");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <QuestionsProvider>
            <Toaster />
            <Sonner />
            {/* Add style tag to hide the Lovable button and set default light theme */}
            <style>{hideLovableStyle}</style>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </QuestionsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
