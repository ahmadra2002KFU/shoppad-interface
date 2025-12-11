import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Shopping from "./pages/Shopping";
import PrintBarcodes from "./pages/PrintBarcodes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QRLogin from "./pages/QRLogin";
import QRScan from "./pages/QRScan";
import QRClaim from "./pages/QRClaim";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* QR Login Routes */}
                <Route path="/qr-display/:deviceId?" element={<QRLogin />} />
                <Route path="/qr-scan" element={<QRScan />} />
                <Route path="/qr-claim/:token" element={<QRClaim />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Shopping />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />

                {/* Utility Routes (public) */}
                <Route path="/print-barcodes" element={<PrintBarcodes />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
