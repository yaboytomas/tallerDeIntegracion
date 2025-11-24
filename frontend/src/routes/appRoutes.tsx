import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "../components/admin/ProtectedRoute";
import { HomePage } from "../pages/home/HomePage";
import { AboutPage } from "../pages/about/AboutPage";
import { PoliciesPage } from "../pages/policies/PoliciesPage";
import { ProductsPage } from "../pages/products/ProductsPage";
import { ProductDetailPage } from "../pages/product-detail/ProductDetailPage";
import { CartPage } from "../pages/cart/CartPage";
import { CheckoutPage } from "../pages/checkout/CheckoutPage";
import { AccountPage } from "../pages/account/AccountPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { ProductsListPage } from "../pages/admin/products/ProductsListPage";
import { ProductFormPage } from "../pages/admin/products/ProductFormPage";
import { CategoriesPage } from "../pages/admin/categories/CategoriesPage";
import { CategoryFormPage } from "../pages/admin/categories/CategoryFormPage";
import { BannersPage } from "../pages/admin/banners/BannersPage";
import { ContentPagesPage } from "../pages/admin/content/ContentPagesPage";
import { ContentPageEditPage } from "../pages/admin/content/ContentPageEditPage";
import { UsersPage } from "../pages/admin/users/UsersPage";
import { CreateAdminPage } from "../pages/admin/users/CreateAdminPage";
import { LoginPage } from "../pages/auth/login/LoginPage";
import { RegisterPage } from "../pages/auth/register/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/recover/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/recover/ResetPasswordPage";
import { VerifyEmailPage } from "../pages/auth/verify/VerifyEmailPage";
import { ContactPage } from "../pages/contact/ContactPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "quienes-somos", element: <AboutPage /> },
      { path: "politicas", element: <PoliciesPage /> },
      { path: "productos", element: <ProductsPage /> },
      { path: "productos/:slug", element: <ProductDetailPage /> },
      { path: "carro", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "cuenta", element: <AccountPage /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute requireAdmin>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products",
        element: (
          <ProtectedRoute requireAdmin>
            <ProductsListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products/new",
        element: (
          <ProtectedRoute requireAdmin>
            <ProductFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/products/:id/edit",
        element: (
          <ProtectedRoute requireAdmin>
            <ProductFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <ProtectedRoute requireAdmin>
            <CategoriesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/categories/new",
        element: (
          <ProtectedRoute requireAdmin>
            <CategoryFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/categories/:id/edit",
        element: (
          <ProtectedRoute requireAdmin>
            <CategoryFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/banners",
        element: (
          <ProtectedRoute requireAdmin>
            <BannersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/content",
        element: (
          <ProtectedRoute requireAdmin>
            <ContentPagesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/content/:slug/edit",
        element: (
          <ProtectedRoute requireAdmin>
            <ContentPageEditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users/create-admin",
        element: (
          <ProtectedRoute requireAdmin>
            <CreateAdminPage />
          </ProtectedRoute>
        ),
      },
      { path: "contacto", element: <ContactPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "registro", element: <RegisterPage /> },
      { path: "verificar-email", element: <VerifyEmailPage /> },
      { path: "recuperar-password", element: <ForgotPasswordPage /> },
      { path: "reestablecer-password/:token", element: <ResetPasswordPage /> },
      { path: "inicio", element: <Navigate to="/" replace /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

