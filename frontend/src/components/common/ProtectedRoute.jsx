import { Navigate, useLocation } from "react-router-dom";
import useAuthStore, { useHydrated } from "../../store/authStore";

const ROLE_REDIRECTS = {
  admin:      "/admin/dashboard",
  shop_owner: "/owner/dashboard",
  user:       "/",
};

// Shared loading spinner
const Checking = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Checking access...</p>
    </div>
  </div>
);

// ── Base protected route ──────────────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireAuth  = true,
  redirectTo   = null,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const hydrated = useHydrated(); // ✅ replaces the missing _hydrated field
  const location = useLocation();

  // Wait for Zustand persist to finish reading localStorage
  if (!hydrated) return <Checking />;

  // Not logged in → send to login, remembering where they wanted to go
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in but wrong role → send to their own dashboard
  if (isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const fallback = redirectTo || ROLE_REDIRECTS[user?.role] || "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

// ── Guest only (already logged in → go to your dashboard) ────────────────────
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const hydrated = useHydrated(); // ✅ replaces the missing _hydrated field

  if (!hydrated) return <Checking />;

  if (isAuthenticated) {
    const redirect = ROLE_REDIRECTS[user?.role] || "/";
    return <Navigate to={redirect} replace />;
  }

  return children;
};

// ── Role-specific wrappers ────────────────────────────────────────────────────
export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export const OwnerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["shop_owner"]}>{children}</ProtectedRoute>
);

export const UserRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["user", "shop_owner", "admin"]}>{children}</ProtectedRoute>
);

export const AnyAuthRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["user", "shop_owner", "admin"]}>{children}</ProtectedRoute>
);

export default ProtectedRoute;