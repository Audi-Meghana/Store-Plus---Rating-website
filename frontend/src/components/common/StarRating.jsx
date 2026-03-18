import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Store, BarChart2, MessageSquare, TrendingUp,
  Tag, Settings, LogOut, Shield, Users, Flag,
  Activity, ChevronRight, ChevronLeft, Bell,
  Heart, User, Star, Award, HelpCircle, X
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const ADMIN_NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: BarChart2, path: "/admin/dashboard" },
      { label: "Analytics", icon: TrendingUp, path: "/admin/analytics" },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Manage Stores", icon: Store, path: "/admin/stores", badge: null },
      { label: "Manage Users", icon: Users, path: "/admin/users" },
      { label: "Categories", icon: Activity, path: "/admin/categories" },
    ],
  },
  {
    group: "Moderation",
    items: [
      { label: "Review Queue", icon: Flag, path: "/admin/moderation", badge: 14 },
      { label: "Notifications", icon: Bell, path: "/notifications" },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", icon: Settings, path: "/admin/settings" },
      { label: "Help", icon: HelpCircle, path: "/help" },
    ],
  },
];

const OWNER_NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: BarChart2, path: "/owner/dashboard" },
      { label: "Analytics", icon: TrendingUp, path: "/owner/analytics" },
    ],
  },
  {
    group: "My Store",
    items: [
      { label: "Store Profile", icon: Store, path: "/owner/store" },
      { label: "Reviews", icon: MessageSquare, path: "/owner/reviews", badge: 3 },
      { label: "Deals & Offers", icon: Tag, path: "/owner/deals" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Notifications", icon: Bell, path: "/notifications" },
      { label: "Settings", icon: Settings, path: "/owner/profile" },
      { label: "Help", icon: HelpCircle, path: "/help" },
    ],
  },
];

const USER_NAV = [
  {
    group: "Discover",
    items: [
      { label: "Explore Stores", icon: Store, path: "/explore" },
      { label: "Top Rated", icon: Star, path: "/explore?sort=top" },
    ],
  },
  {
    group: "My Activity",
    items: [
      { label: "My Profile", icon: User, path: "/profile" },
      { label: "My Wishlist", icon: Heart, path: "/wishlist" },
      { label: "Notifications", icon: Bell, path: "/notifications" },
    ],
  },
];

const NavItem = ({ item, collapsed, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(item.path)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-sm font-medium transition-all duration-200 group relative
        ${isActive
          ? "bg-white/15 text-white shadow-sm"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
      title={collapsed ? item.label : ""}
    >
      <item.icon
        size={18}
        className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}
      />

      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{item.label}</span>
          {item.badge && (
            <span className="flex-shrink-0 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
              {item.badge}
            </span>
          )}
          {isActive && (
            <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
          )}
        </>
      )}

      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
    </button>
  );
};

const Sidebar = ({
  role,
  collapsed = false,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
  className = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navConfig = role === "admin"
    ? ADMIN_NAV
    : role === "shop_owner"
    ? OWNER_NAV
    : USER_NAV;

  const accentColor = role === "admin"
    ? "from-purple-700 to-indigo-800"
    : role === "shop_owner"
    ? "from-green-700 to-teal-800"
    : "from-blue-700 to-indigo-800";

  const logoColor = role === "admin"
    ? "bg-purple-500"
    : role === "shop_owner"
    ? "bg-green-500"
    : "bg-blue-500";

  const roleLabel = role === "admin"
    ? "Admin Panel"
    : role === "shop_owner"
    ? "Owner Portal"
    : "User Panel";

  const roleBadgeColor = role === "admin"
    ? "bg-purple-500/30 text-purple-200"
    : role === "shop_owner"
    ? "bg-green-500/30 text-green-200"
    : "bg-blue-500/30 text-blue-200";

  const handleNav = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path.includes("?")) return location.pathname + location.search === path;
    return location.pathname === path;
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-gradient-to-b ${accentColor} text-white`}>

      {/* Header */}
      <div className={`flex items-center ${collapsed ? "justify-center px-3" : "justify-between px-5"} py-5 border-b border-white/10`}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 ${logoColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
              <Store size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-base leading-none truncate">StorePulse</p>
              <p className="text-xs text-white/50 leading-none mt-1 truncate">{roleLabel}</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className={`w-9 h-9 ${logoColor} rounded-xl flex items-center justify-center shadow-md`}>
            <Store size={18} className="text-white" />
          </div>
        )}

        {onCollapse && !collapsed && (
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {onCollapse && collapsed && (
          <button
            onClick={onCollapse}
            className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-gray-900 transition-colors z-10"
          >
            <ChevronRight size={12} />
          </button>
        )}

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 backdrop-blur-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email || ""}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${roleBadgeColor}`}>
              {role === "admin" ? "Admin" : role === "shop_owner" ? "Owner" : "User"}
            </span>
          </div>

          {role === "shop_owner" && (
            <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <Star size={13} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <span className="text-xs text-white/80 font-medium">4.6 rating · 291 reviews</span>
            </div>
          )}

          {role === "user" && user?.points > 0 && (
            <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <Award size={13} className="text-yellow-400 flex-shrink-0" />
              <span className="text-xs text-white/80 font-medium">{user.points} loyalty points</span>
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-4 border-b border-white/10">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-hide">
        {navConfig.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-2">
                {group.group}
              </p>
            )}
            {collapsed && (
              <div className="border-t border-white/10 mb-2" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.path)}
                  onClick={handleNav}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center justify-between text-xs text-white/40 mb-1">
              <span>Profile completion</span>
              <span>75%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/50 rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium text-white/60 hover:bg-red-500/20
            hover:text-red-300 transition-all duration-200 group
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Sign out" : ""}
        >
          <LogOut size={18} className="flex-shrink-0 group-hover:text-red-300" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`
          hidden lg:flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          shadow-2xl relative
          ${collapsed ? "w-16" : "w-64"}
          ${className}
        `}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative w-72 flex flex-col shadow-2xl z-10">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export const useSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return {
    collapsed,
    mobileOpen,
    toggleCollapse: () => setCollapsed((p) => !p),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
  };
};

export default Sidebar;