import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import BuyerList from "./pages/BuyerList";
import CreateBuyer from "./pages/CreateBuyer";
import BuyerDetail from "./pages/BuyerDetail";
import EditBuyer from "./pages/EditBuyer";
import ImportBuyers from "./pages/ImportBuyers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <Layout>
                <ProtectedRoute>
                  <BuyerList />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/buyers" element={
              <Layout>
                <ProtectedRoute>
                  <BuyerList />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/buyers/new" element={
              <Layout>
                <ProtectedRoute>
                  <CreateBuyer />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/buyers/import" element={
              <Layout>
                <ProtectedRoute>
                  <ImportBuyers />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/buyers/:id" element={
              <Layout>
                <ProtectedRoute>
                  <BuyerDetail />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/buyers/:id/edit" element={
              <Layout>
                <ProtectedRoute>
                  <EditBuyer />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
