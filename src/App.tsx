import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import POS from "./pages/POS";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import { ProductProvider } from "@/context/ProductContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProductProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute requiredRole="admin">
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute requiredRole="admin">
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/pos" element={
                <ProtectedRoute requiredRole="any">
                  <POS />
                </ProtectedRoute>
              } />
              <Route path="/sales" element={
                <ProtectedRoute requiredRole="any">
                  <Sales />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute requiredRole="admin">
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="/suppliers" element={
                <ProtectedRoute requiredRole="admin">
                  <Suppliers />
                </ProtectedRoute>
              } />
              <Route path="/purchases" element={
                <ProtectedRoute requiredRole="admin">
                  <Purchases />
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute requiredRole="admin">
                  <Expenses />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute requiredRole="admin">
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
