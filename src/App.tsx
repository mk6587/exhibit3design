
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from "@/contexts/AdminContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OTPAuthProvider } from "@/contexts/OTPAuthContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderLookupPage from "./pages/OrderLookupPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";

import ProfilePage from "./pages/ProfilePage";
import DownloadsPage from "./pages/DownloadsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import PaymentErrorPage from "./pages/PaymentErrorPage";

import OTPAuthPage from "./pages/OTPAuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import AdminProductCreatePage from "./pages/AdminProductCreatePage";
import AdminProductEditPage from "./pages/AdminProductEditPage";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import HashConfirmationHandler from "./components/HashConfirmationHandler";
import PricingPage from "./pages/PricingPage";
import AISamplesPage from "./pages/AISamplesPage";

import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import SitemapPage from "./pages/SitemapPage";
import { hideWelcomeModals } from "./utils/hideWelcomeModal";

const queryClient = new QueryClient();

const App = () => {
  // Hide any external welcome modals on app load
  useEffect(() => {
    hideWelcomeModals();
  }, []);

  return (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <OTPAuthProvider>
              <ProductsProvider>
                <AdminProvider>
                  <TooltipProvider>
                    <ScrollToTop />
                    <Toaster />
                    <Sonner />
                    <Routes>
                      <Route path="/" element={
                        <>
                          <HashConfirmationHandler />
                          <Index />
                        </>
                      } />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-lookup" element={<OrderLookupPage />} />
                      <Route path="/order/:orderId" element={<OrderDetailsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/downloads" element={<DownloadsPage />} />
                      <Route path="/payment-success" element={<PaymentSuccessPage />} />
                      <Route path="/payment-failed" element={<PaymentFailedPage />} />
                      <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
                      <Route path="/payment-error" element={<PaymentErrorPage />} />
                      <Route path="/auth" element={<OTPAuthPage />} />
                      <Route path="/login" element={<OTPAuthPage />} />
                      <Route path="/register" element={<OTPAuthPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/confirm-email" element={<EmailConfirmationPage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route path="/admin" element={
                        <ProtectedAdminRoute>
                          <AdminPage />
                        </ProtectedAdminRoute>
                      } />
                      <Route path="/admin/dashboard" element={
                        <ProtectedAdminRoute>
                          <AdminPage />
                        </ProtectedAdminRoute>
                      } />
                      <Route path="/admin/product/new" element={
                        <ProtectedAdminRoute>
                          <AdminProductCreatePage />
                        </ProtectedAdminRoute>
                      } />
                      <Route path="/admin/product/:id/edit" element={
                        <ProtectedAdminRoute>
                          <AdminProductEditPage />
                        </ProtectedAdminRoute>
                      } />
                      <Route path="/sitemap.xml" element={<SitemapPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/ai-samples" element={<AISamplesPage />} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </AdminProvider>
              </ProductsProvider>
            </OTPAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
  );
};

export default App;
