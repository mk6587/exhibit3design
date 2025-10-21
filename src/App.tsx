
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from "@/contexts/AdminContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OTPAuthProvider } from "@/contexts/OTPAuthContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import HashConfirmationHandler from "./components/HashConfirmationHandler";
import { hideWelcomeModals } from "./utils/hideWelcomeModal";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentFailedPage = lazy(() => import("./pages/PaymentFailedPage"));
const PaymentCancelledPage = lazy(() => import("./pages/PaymentCancelledPage"));
const PaymentErrorPage = lazy(() => import("./pages/PaymentErrorPage"));
const OTPAuthPage = lazy(() => import("./pages/OTPAuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const EmailConfirmationPage = lazy(() => import("./pages/EmailConfirmationPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const AISamplesPage = lazy(() => import("./pages/AISamplesPage"));
const SubscriptionCheckoutPage = lazy(() => import("./pages/SubscriptionCheckoutPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForbiddenPage = lazy(() => import("./pages/ForbiddenPage"));

// Admin pages - lazy loaded
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminProductCreatePage = lazy(() => import("./pages/AdminProductCreatePage"));
const AdminProductEditPage = lazy(() => import("./pages/AdminProductEditPage"));
const AdminSubscriptionsPage = lazy(() => import("./pages/AdminSubscriptionsPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminPlansPage = lazy(() => import("./pages/AdminPlansPage"));
const AdminAISamplesPage = lazy(() => import("./pages/AdminAISamplesPage"));
const AdminAIDemoConfigPage = lazy(() => import("./pages/AdminAIDemoConfigPage"));
const AdminFileRequestsPage = lazy(() => import("./pages/AdminFileRequestsPage"));
const AdminSecurityPage = lazy(() => import("./pages/AdminSecurityPage"));
const ProtectedAdminRoute = lazy(() => import("./components/admin/ProtectedAdminRoute"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
                    <Suspense fallback={<PageLoader />}>
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
                        <Route path="/profile" element={<ProfilePage />} />
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
                            <AdminDashboardPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/products" element={
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
                        <Route path="/admin/subscriptions" element={
                          <ProtectedAdminRoute>
                            <AdminSubscriptionsPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/users" element={
                          <ProtectedAdminRoute>
                            <AdminUsersPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/file-requests" element={
                          <ProtectedAdminRoute>
                            <AdminFileRequestsPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/plans" element={
                          <ProtectedAdminRoute>
                            <AdminPlansPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/ai-samples" element={
                          <ProtectedAdminRoute>
                            <AdminAISamplesPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/ai-demo-config" element={
                          <ProtectedAdminRoute>
                            <AdminAIDemoConfigPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/security" element={
                          <ProtectedAdminRoute>
                            <AdminSecurityPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/sitemap.xml" element={<SitemapPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/subscription-checkout" element={<SubscriptionCheckoutPage />} />
                        <Route path="/ai-samples" element={<AISamplesPage />} />
                        <Route path="/403" element={<ForbiddenPage />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
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
