import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CafeProvider } from "./context/CafeContext";
import { CartProvider } from "./context/CartContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

// Public Pages
import HomePage from "./pages/public/HomePage";
import ProfilePage from "./pages/public/ProfilePage";
import MenuCatalogPage from "./pages/public/MenuCatalogPage";
import FacilitiesPage from "./pages/public/FacilitiesPage";
import GalleryPage from "./pages/public/GalleryPage";
import PromotionsPage from "./pages/public/PromotionsPage";
import LocationPage from "./pages/public/LocationPage";
import ContactPage from "./pages/public/ContactPage";

// Order Pages
import CustomerOrderPage from "./pages/order/CustomerOrderPage";
import OrderStatusPage from "./pages/order/OrderStatusPage";

// Cashier POS
import CashierPage from "./pages/cashier/CashierPage";

// Admin Panel
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminStock from "./pages/admin/AdminStock";
import AdminTables from "./pages/admin/AdminTables";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminProfileSettings from "./pages/admin/AdminProfileSettings";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";

// Auth
import LoginPage from "./pages/auth/LoginPage";

// Protected Route Helpers
function RequireAuth({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ textAlign: "center", padding: "4rem 0" }}>Memuat...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user?.role !== role && user?.role !== "admin") {
    return <Navigate to="/cashier" replace />;
  }
  return children;
}

// Public Layout Wrapper
function PublicLayout({ children, onOpenCart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onOpenCart={onOpenCart} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}

// 404 Page
function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", color: "var(--primary)" }}>404</h1>
      <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1.5rem 0" }}>Halaman yang Anda tuju tidak ditemukan.</p>
      <a href="/" className="btn btn-primary">Kembali ke Beranda</a>
    </div>
  );
}

export default function App() {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  return (
    <AuthProvider>
      <CafeProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><HomePage /></PublicLayout>} />
              <Route path="/profile" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><ProfilePage /></PublicLayout>} />
              <Route path="/menu" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><MenuCatalogPage onOpenCart={() => setCartDrawerOpen(true)} /></PublicLayout>} />
              <Route path="/facilities" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><FacilitiesPage /></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><GalleryPage /></PublicLayout>} />
              <Route path="/promotions" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><PromotionsPage /></PublicLayout>} />
              <Route path="/location" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><LocationPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout onOpenCart={() => setCartDrawerOpen(true)}><ContactPage /></PublicLayout>} />

              {/* Customer Ordering Routes */}
              <Route path="/order" element={<PublicLayout><CustomerOrderPage /></PublicLayout>} />
              <Route path="/order/status/:orderId" element={<PublicLayout><OrderStatusPage /></PublicLayout>} />

              {/* Cashier POS Route */}
              <Route
                path="/cashier"
                element={
                  <RequireAuth role="cashier">
                    <CashierPage />
                  </RequireAuth>
                }
              />

              {/* Admin Panel Nested Routes */}
              <Route
                path="/admin"
                element={
                  <RequireAuth role="admin">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="stock" element={<AdminStock />} />
                <Route path="tables" element={<AdminTables />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="settings/profile" element={<AdminProfileSettings />} />
                <Route path="settings/payment" element={<AdminPaymentSettings />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
              </Route>

              {/* Auth Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* 404 Fallback */}
              <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
            </Routes>

            {/* Global Cart Drawer for public pages */}
            <CartDrawer
              isOpen={cartDrawerOpen}
              onClose={() => setCartDrawerOpen(false)}
              onCheckout={() => {
                setCartDrawerOpen(false);
                window.location.href = "/order";
              }}
              loadingCheckout={false}
            />
          </Router>
        </CartProvider>
      </CafeProvider>
    </AuthProvider>
  );
}
