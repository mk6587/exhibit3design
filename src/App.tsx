
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
import { lazyRetry } from "./utils/lazyRetry";
import { PageSkeleton } from "@/components/ui/page-skeleton";

// CRITICAL: Homepage loads immediately (no lazy) for best UX and zero white screens
import Index from "./pages/Index";

// High-traffic pages with retry logic
const ProductsPage = lazy(() => lazyRetry(() => import("./pages/ProductsPage")));
const ProductDetailPage = lazy(() => lazyRetry(() => import("./pages/ProductDetailPage")));
const PricingPage = lazy(() => lazyRetry(() => import("./pages/PricingPage")));
const AISamplesPage = lazy(() => lazyRetry(() => import("./pages/AISamplesPage")));
const ProfilePage = lazy(() => lazyRetry(() => import("./pages/ProfilePage")));

// Secondary pages with retry logic
const AboutPage = lazy(() => lazyRetry(() => import("./pages/AboutPage")));
const ContactPage = lazy(() => lazyRetry(() => import("./pages/ContactPage")));
const FaqPage = lazy(() => lazyRetry(() => import("./pages/FaqPage")));
const PrivacyPolicyPage = lazy(() => lazyRetry(() => import("./pages/PrivacyPolicyPage")));
const SitemapPage = lazy(() => lazyRetry(() => import("./pages/SitemapPage")));
const NotFound = lazy(() => lazyRetry(() => import("./pages/NotFound")));
const ForbiddenPage = lazy(() => lazyRetry(() => import("./pages/ForbiddenPage")));

// Auth pages with retry logic
const OTPAuthPage = lazy(() => lazyRetry(() => import("./pages/OTPAuthPage")));
const ResetPasswordPage = lazy(() => lazyRetry(() => import("./pages/ResetPasswordPage")));
const EmailConfirmationPage = lazy(() => lazyRetry(() => import("./pages/EmailConfirmationPage")));

// Payment pages with retry logic
const PaymentSuccessPage = lazy(() => lazyRetry(() => import("./pages/PaymentSuccessPage")));
const PaymentFailedPage = lazy(() => lazyRetry(() => import("./pages/PaymentFailedPage")));
const PaymentCancelledPage = lazy(() => lazyRetry(() => import("./pages/PaymentCancelledPage")));
const PaymentErrorPage = lazy(() => lazyRetry(() => import("./pages/PaymentErrorPage")));
const SubscriptionCheckoutPage = lazy(() => lazyRetry(() => import("./pages/SubscriptionCheckoutPage")));

// Admin pages - lazy loaded with retry (low priority)
const AdminLoginPage = lazy(() => lazyRetry(() => import("./pages/AdminLoginPage")));
const AdminDashboardPage = lazy(() => lazyRetry(() => import("./pages/AdminDashboardPage")));
const AdminPage = lazy(() => lazyRetry(() => import("./pages/AdminPage")));
const AdminProductCreatePage = lazy(() => lazyRetry(() => import("./pages/AdminProductCreatePage")));
const AdminProductEditPage = lazy(() => lazyRetry(() => import("./pages/AdminProductEditPage")));
const AdminSubscriptionsPage = lazy(() => lazyRetry(() => import("./pages/AdminSubscriptionsPage")));
const AdminUsersPage = lazy(() => lazyRetry(() => import("./pages/AdminUsersPage")));
const AdminPlansPage = lazy(() => lazyRetry(() => import("./pages/AdminPlansPage")));
const AdminAISamplesPage = lazy(() => lazyRetry(() => import("./pages/AdminAISamplesPage")));
const AdminAIDemoConfigPage = lazy(() => lazyRetry(() => import("./pages/AdminAIDemoConfigPage")));
const AdminFileRequestsPage = lazy(() => lazyRetry(() => import("./pages/AdminFileRequestsPage")));
const AdminSecurityPage = lazy(() => lazyRetry(() => import("./pages/AdminSecurityPage")));
const AdminRolesPage = lazy(() => lazyRetry(() => import("./pages/AdminRolesPage")));
const AdminActivityLogPage = lazy(() => lazyRetry(() => import("./pages/AdminActivityLogPage")));
const BlogPage = lazy(() => lazyRetry(() => import("./pages/BlogPage")));
const BlogPostPage = lazy(() => lazyRetry(() => import("./pages/BlogPostPage")));
const AdminBlogSamplePage = lazy(() => lazyRetry(() => import("./pages/AdminBlogSamplePage")));
const AdminBlogGeneratorPage = lazy(() => lazyRetry(() => import("./pages/AdminBlogGeneratorPage")));
const AdminBlogSettingsPage = lazy(() => lazyRetry(() => import("./pages/AdminBlogSettingsPage")));
const AdminBlogCategoriesPage = lazy(() => lazyRetry(() => import("./pages/AdminBlogCategoriesPage")));
const AdminBulkEmailPage = lazy(() => lazyRetry(() => import("./pages/AdminBulkEmailPage")));
const AdminBlogPostsPage = lazy(() => lazyRetry(() => import("./pages/AdminBlogPostsPage")));
const DynamicSitemapPage = lazy(() => lazyRetry(() => import("./pages/DynamicSitemapPage")));
const AdminBlogPostEditPage = lazy(() => lazyRetry(() => import("./pages/AdminBlogPostEditPage")));
const AdminGenerateBlogImagesPage = lazy(() => lazyRetry(() => import("./pages/AdminGenerateBlogImagesPage")));
const AdminBlogCleanupPage = lazy(() => lazyRetry(() => import("./pages/AdminBlogCleanupPage")));
const ProtectedAdminRoute = lazy(() => lazyRetry(() => import("./components/admin/ProtectedAdminRoute")));

// Loading fallback component - Shows while lazy routes are loading
const PageLoader = () => {
  return <PageSkeleton />;
};

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
                        <Route path="/admin/roles" element={
                          <ProtectedAdminRoute>
                            <AdminRolesPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/activity-log" element={
                          <ProtectedAdminRoute>
                            <AdminActivityLogPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-sample" element={
                          <ProtectedAdminRoute>
                            <AdminBlogSamplePage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-generator" element={
                          <ProtectedAdminRoute>
                            <AdminBlogGeneratorPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-settings" element={
                          <ProtectedAdminRoute>
                            <AdminBlogSettingsPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-categories" element={
                          <ProtectedAdminRoute>
                            <AdminBlogCategoriesPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/generate-blog-images" element={
                          <ProtectedAdminRoute>
                            <AdminGenerateBlogImagesPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-cleanup" element={
                          <ProtectedAdminRoute>
                            <AdminBlogCleanupPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-posts" element={
                          <ProtectedAdminRoute>
                            <AdminBlogPostsPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/blog-posts/:id" element={
                          <ProtectedAdminRoute>
                            <AdminBlogPostEditPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/admin/bulk-email" element={
                          <ProtectedAdminRoute>
                            <AdminBulkEmailPage />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="/academy" element={<BlogPage />} />
                        <Route path="/academy/:slug" element={<BlogPostPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/blog/:slug" element={<BlogPostPage />} />
                        <Route path="/sitemap.xml" element={<DynamicSitemapPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/subscription-checkout" element={<SubscriptionCheckoutPage />} />
                        <Route path="/ai-samples" element={<AISamplesPage />} />
                        <Route path="/ai-sample" element={<AISamplesPage />} />
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
