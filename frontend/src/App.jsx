import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";

import ProtectedRoute, {
  GuestRoute,
  AdminRoute,
  OwnerRoute,
  AnyAuthRoute,
} from "./components/common/ProtectedRoute";

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage          from "./pages/auth/LoginPage.jsx";
import RegisterPage       from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage.jsx";

// ── User ──────────────────────────────────────────────────────────────────────
import HomePage          from "./pages/user/HomePage.jsx";
import ExplorePage       from "./pages/user/ExplorePage.jsx";
import StoreDetailPage   from "./pages/user/StoreDetailPage.jsx";
import WriteReviewPage   from "./pages/user/WriteReviewPage.jsx";
import ProfilePage       from "./pages/user/ProfilePage.jsx";
import WishlistPage      from "./pages/user/WishlistPage.jsx";
import NotificationsPage from "./pages/user/NotificationsPage.jsx";
import DealsPage         from "./pages/user/DealsPage.jsx";

// ── Owner ─────────────────────────────────────────────────────────────────────
import OwnerDashboard   from "./pages/owner/OwnerDashboard.jsx";
import ManageStorePage  from "./pages/owner/ManageStorePage.jsx";
import OwnerReviewsPage from "./pages/owner/ReviewsPage.jsx";
import AnalyticsPage    from "./pages/owner/AnalyticsPage.jsx";
import DealsManagerPage from "./pages/owner/DealsManagerPage.jsx";
import OwnerProfilePage from "./pages/owner/OwnerProfilePage.jsx";

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminDashboard   from "./pages/admin/AdminDashboard.jsx";
import ManageStoresPage from "./pages/admin/ManageStoresPage.jsx";
import ManageUsersPage  from "./pages/admin/ManageUsersPage.jsx";
import ModerationPage   from "./pages/admin/ModerationPage.jsx";
import CategoriesPage   from "./pages/admin/CategoriesPage.jsx";

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>

          {/* ── Public ───────────────────────────────────────────────────── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/store/:id" element={<StoreDetailPage />} />
          <Route path="/deals" element={<DealsPage />} />

          {/* ── Write Review (Public) */}
          <Route path="/write-review/:id" element={<WriteReviewPage />} />

          {/* ── Guest only */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

          {/* ── User */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<AnyAuthRoute><NotificationsPage /></AnyAuthRoute>} />

          {/* ── Owner */}
          <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
          <Route path="/owner/store" element={<OwnerRoute><ManageStorePage /></OwnerRoute>} />
          <Route path="/owner/reviews" element={<OwnerRoute><OwnerReviewsPage /></OwnerRoute>} />
          <Route path="/owner/analytics" element={<OwnerRoute><AnalyticsPage /></OwnerRoute>} />
          <Route path="/owner/deals" element={<OwnerRoute><DealsManagerPage /></OwnerRoute>} />
          <Route path="/owner/profile" element={<OwnerRoute><OwnerProfilePage /></OwnerRoute>} />

          {/* ── Admin */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/stores" element={<AdminRoute><ManageStoresPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsersPage /></AdminRoute>} />
          <Route path="/admin/moderation" element={<AdminRoute><ModerationPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />

          {/* ── 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;