
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import Account from "./pages/Account/Account";
import Checkout from "./pages/Checkout/Checkout";
import AIAssistant from "./pages/AIAssistant/AIAssistant";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import Offers from "./pages/Offers/Offers";
import VoiceSearch from "./pages/VoiceSearch/VoiceSearch";
import OrderTracking from "./pages/OrderTracking/OrderTracking";
import RateOrder from "./pages/RateOrder/RateOrder";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLogin from "./pages/Admin/AdminLogin";

import { CartProvider } from "./context/CartTemp";

// ==========================================
// CHECK ADMIN SESSION
// ==========================================

function getAdminSession() {
  const adminToken =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken");

  const adminUser =
    localStorage.getItem("adminUser") ||
    sessionStorage.getItem("adminUser");

  if (!adminToken || !adminUser) {
    return false;
  }

  try {
    const admin = JSON.parse(adminUser);

    return (
      admin &&
      String(admin.role).toLowerCase() === "admin"
    );
  } catch (error) {
    console.error("Invalid admin session:", error);
    return false;
  }
}

// ==========================================
// CUSTOMER ROUTES
// DO NOT REDIRECT CUSTOMER PAGES
// ==========================================

function CustomerOnlyRoute({ children }) {
  return children;
}

// ==========================================
// ADMIN LOGIN ROUTE
// ==========================================

function AdminEntry() {
  if (getAdminSession()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin />;
}

// ==========================================
// PROTECTED ADMIN DASHBOARD
// ==========================================

function ProtectedAdminDashboard() {
  if (!getAdminSession()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminDashboard />;
}

// ==========================================
// ADMIN ROUTE FALLBACK
// ==========================================

function AdminNotFound() {
  if (!getAdminSession()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
}

// ==========================================
// MAIN APP CONTENT
// ==========================================

function AppContent() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <>
      {/* Hide customer Navbar on admin pages */}
      {!isAdminPage && <Navbar />}

      <Routes>

        {/* CUSTOMER HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* CUSTOMER PAGES */}

        <Route
          path="/menu"
          element={
            <CustomerOnlyRoute>
              <Menu />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <CustomerOnlyRoute>
              <Cart />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/signin"
          element={
            <CustomerOnlyRoute>
              <SignIn />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <CustomerOnlyRoute>
              <SignUp />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/account"
          element={
            <CustomerOnlyRoute>
              <Account />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <CustomerOnlyRoute>
              <Checkout />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <CustomerOnlyRoute>
              <AIAssistant />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <CustomerOnlyRoute>
              <OrderHistory />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/offers"
          element={
            <CustomerOnlyRoute>
              <Offers />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/voice-search"
          element={
            <CustomerOnlyRoute>
              <VoiceSearch />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/track-order/:orderId"
          element={
            <CustomerOnlyRoute>
              <OrderTracking />
            </CustomerOnlyRoute>
          }
        />

        <Route
          path="/rate-order/:orderId"
          element={
            <CustomerOnlyRoute>
              <RateOrder />
            </CustomerOnlyRoute>
          }
        />

        {/* ADMIN PAGES */}

        <Route
          path="/admin"
          element={
            <Navigate to="/admin/login" replace />
          }
        />

        <Route
          path="/admin/login"
          element={<AdminEntry />}
        />

        <Route
          path="/admin/dashboard"
          element={<ProtectedAdminDashboard />}
        />

        <Route
          path="/admin/*"
          element={<AdminNotFound />}
        />

        {/* UNKNOWN ROUTES */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </>
  );
}

// ==========================================
// MAIN APP
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
