import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Shopping from "./pages/Shopping";
import QRCodes from "./pages/QRCodes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import TransactionHistory from "./pages/TransactionHistory";
import QRLogin from "./pages/QRLogin";
import AuthorizeCart from "./pages/AuthorizeCart";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Shopping />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/history" element={<TransactionHistory />} />
                <Route path="/qr-login" element={<QRLogin />} />
                <Route path="/authorize-cart" element={<AuthorizeCart />} />
                <Route path="/qr-codes" element={<QRCodes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
