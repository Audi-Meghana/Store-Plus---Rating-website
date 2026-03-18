import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Store, BarChart2, MessageSquare, TrendingUp,
  Tag, Settings, LogOut, Shield, Users, Flag,
  Activity, ChevronRight, ChevronLeft, Bell,
  Heart, User, Star, Award, HelpCircle, X, Menu
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";

/* ─── nav configs ─────────────────────────────────────────────────────────── */
const ADMIN_NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard",  icon: BarChart2,  path: "/admin/dashboard" },
      { label: "Analytics",  icon: TrendingUp, path: "/admin/analytics" },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "Manage Stores", icon: Store,    path: "/admin/stores" },
      { label: "Manage Users",  icon: Users,    path: "/admin/users" },
      { label: "Categories",    icon: Activity, path: "/admin/categories" },
    ],
  },
  {
    group: "Moderation",
    items: [
      { label: "Review Queue",   icon: Flag, path: "/admin/moderation", badge: 14 },
      { label: "Notifications",  icon: Bell, path: "/notifications" },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Settings", icon: Settings,   path: "/admin/settings" },
      { label: "Help",     icon: HelpCircle, path: "/help" },
    ],
  },
];

const OWNER_NAV = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: BarChart2,  path: "/owner/dashboard" },
      { label: "Analytics", icon: TrendingUp, path: "/owner/analytics" },
    ],
  },
  {
    group: "My Store",
    items: [
      { label: "Store Profile",  icon: Store,          path: "/owner/store" },
      { label: "Reviews",        icon: MessageSquare,  path: "/owner/reviews" },
      { label: "Deals & Offers", icon: Tag,            path: "/owner/deals" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Notifications", icon: Bell,      path: "/notifications" },
      { label: "Settings",      icon: Settings,  path: "/owner/profile" },
      { label: "Help",          icon: HelpCircle, path: "/help" },
    ],
  },
];

const USER_NAV = [
  {
    group: "Discover",
    items: [
      { label: "Explore Stores", icon: Store, path: "/explore" },
      { label: "Top Rated",      icon: Star,  path: "/explore?sort=top" },
    ],
  },
  {
    group: "My Activity",
    items: [
      { label: "My Profile",    icon: User,  path: "/profile" },
      { label: "My Wishlist",   icon: Heart, path: "/wishlist" },
      { label: "Notifications", icon: Bell,  path: "/notifications" },
    ],
  },
];

/* ─── theme helpers ───────────────────────────────────────────────────────── */
const getTheme = (role) => ({
  gradient:
    role === "admin"     ? "from-[#1e1240] via-[#2d1b6b] to-[#1a1040]" :
    role === "shop_owner"? "from-[#0d2b1f] via-[#14432e] to-[#0a2018]" :
                           "from-[#0d1f3c] via-[#122d5c] to-[#0a1830]",

  accent:
    role === "admin"     ? "#a78bfa" :
    role === "shop_owner"? "#34d399" :
                           "#60a5fa",

  accentSoft:
    role === "admin"     ? "rgba(167,139,250,0.12)" :
    role === "shop_owner"? "rgba(52,211,153,0.12)"  :
                           "rgba(96,165,250,0.12)",

  accentGlow:
    role === "admin"     ? "rgba(167,139,250,0.35)" :
    role === "shop_owner"? "rgba(52,211,153,0.35)"  :
                           "rgba(96,165,250,0.35)",

  logoGrad:
    role === "admin"     ? "linear-gradient(135deg,#7c3aed,#a78bfa)" :
    role === "shop_owner"? "linear-gradient(135deg,#059669,#34d399)" :
                           "linear-gradient(135deg,#1d4ed8,#60a5fa)",

  label:
    role === "admin"     ? "Admin Panel"   :
    role === "shop_owner"? "Owner Portal"  :
                           "User Panel",

  badge:
    role === "admin"     ? "Admin" :
    role === "shop_owner"? "Owner" :
                           "User",
});

/* ─── NavItem ─────────────────────────────────────────────────────────────── */
const NavItem = ({ item, collapsed, isActive, onClick, accent, accentSoft, accentGlow }) => (
  <button
    onClick={() => onClick(item.path)}
    title={collapsed ? item.label : ""}
    style={{
      background: isActive ? accentSoft : "transparent",
      boxShadow:  isActive ? `0 0 0 1px ${accentGlow}, inset 0 0 12px ${accentSoft}` : "none",
    }}
    className={`
      w-full flex items-center gap-3 rounded-xl text-sm font-medium
      transition-all duration-200 group relative select-none
      ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
      ${isActive ? "text-white" : "text-white/50 hover:text-white/90"}
      hover:bg-white/5
    `}
  >
    {/* icon */}
    <item.icon
      size={17}
      style={{ color: isActive ? accent : undefined }}
      className={`flex-shrink-0 transition-colors duration-200
        ${!isActive && "group-hover:text-white/80"}`}
    />

    {/* label + badge */}
    {!collapsed && (
      <>
        <span className="flex-1 text-left truncate tracking-[0.01em]">{item.label}</span>
        {item.badge != null && (
          <span
            style={{ background: accent }}
            className="text-[10px] font-bold text-white rounded-full min-w-[18px] h-[18px]
                       flex items-center justify-center px-1 leading-none"
          >
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
        {isActive && (
          <span
            style={{ background: accent, boxShadow: `0 0 6px ${accentGlow}` }}
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          />
        )}
      </>
    )}

    {/* collapsed badge dot */}
    {collapsed && item.badge != null && (
      <span
        style={{ background: accent }}
        className="absolute top-1 right-1 w-[14px] h-[14px] rounded-full text-[8px]
                   font-bold text-white flex items-center justify-center leading-none"
      >
        {item.badge > 9 ? "9+" : item.badge}
      </span>
    )}
  </button>
);

/* ─── SidebarInner ────────────────────────────────────────────────────────── */
const SidebarInner = ({ role, collapsed, onCollapse, onMobileClose }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();

  // live shop data for shop_owner (rating, reviewCount)
  const [shop, setShop] = useState(null);

  useEffect(() => {
    if (role !== "shop_owner") return;
    const fetchShop = async () => {
      try {
        const res  = await api.get("/shops/me");
        const data = res?.data?.data ?? res?.data;
        if (data) setShop(data);
      } catch {
        // silently ignore — badge just won't show
      }
    };
    fetchShop();
  }, [role]);

  // build nav with live reviewCount badge
  const navConfig = (() => {
    if (role === "admin")      return ADMIN_NAV;
    if (role === "shop_owner") {
      return OWNER_NAV.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.path === "/owner/reviews" && shop?.reviewCount > 0
            ? { ...item, badge: shop.reviewCount }
            : item
        ),
      }));
    }
    return USER_NAV;
  })();

  const theme = getTheme(role);

  const isActive = (path) =>
    path.includes("?")
      ? location.pathname + location.search === path
      : location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    onMobileClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={`flex flex-col h-full bg-gradient-to-b ${theme.gradient} relative overflow-hidden`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* subtle noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px",
        }}
      />

      {/* glow orb */}
      <div
        className="pointer-events-none absolute -top-24 -left-12 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{ background: theme.accentGlow }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center border-b border-white/[0.07] py-4
          ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: theme.logoGrad }}
            >
              <Store size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-[15px] leading-none tracking-[-0.02em]">
                StorePulse
              </p>
              <p className="text-[11px] text-white/40 leading-none mt-[5px] truncate">
                {theme.label}
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: theme.logoGrad }}
          >
            <Store size={16} className="text-white" />
          </div>
        )}

        {/* desktop collapse toggle */}
        {onCollapse && (
          <button
            onClick={onCollapse}
            className={`hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 text-white/40
                        hover:text-white transition-colors ${collapsed ? "mt-0 ml-0" : ""}`}
          >
            {collapsed
              ? <ChevronRight size={15} />
              : <ChevronLeft  size={15} />
            }
          </button>
        )}

        {/* mobile close */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/40
                       hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── User card ──────────────────────────────────────────────────────── */}
      {!collapsed ? (
        <div className="px-4 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center
                         text-white font-bold text-[13px] flex-shrink-0 ring-2"
              style={{
                background: theme.accentSoft,
                ringColor:  theme.accentGlow,
                boxShadow:  `0 0 0 2px ${theme.accentGlow}`,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-white/40 truncate mt-1">
                {user?.email || ""}
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 tracking-wide"
              style={{ background: theme.accentSoft, color: theme.accent }}
            >
              {theme.badge}
            </span>
          </div>

          {role === "shop_owner" && (
            <div
              className="mt-3 rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: theme.accentSoft }}
            >
              <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <span className="text-[11px] text-white/70 font-medium">
                {shop
                  ? `${shop.avgRating?.toFixed(1) ?? "—"} rating · ${shop.reviewCount ?? 0} reviews`
                  : "Loading…"}
              </span>
            </div>
          )}

          {role === "user" && user?.points > 0 && (
            <div
              className="mt-3 rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ background: theme.accentSoft }}
            >
              <Award size={12} style={{ color: theme.accent }} className="flex-shrink-0" />
              <span className="text-[11px] text-white/70 font-medium">
                {user.points} loyalty points
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center py-4 border-b border-white/[0.07]">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center
                       text-white font-bold text-[13px]"
            style={{
              background: theme.accentSoft,
              boxShadow:  `0 0 0 2px ${theme.accentGlow}`,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      )}

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4
                      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]
                      [scrollbar-width:none]">
        {navConfig.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.13em]
                            px-3 mb-2">
                {group.group}
              </p>
            )}
            {collapsed && <div className="border-t border-white/[0.06] mb-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive(item.path)}
                  onClick={handleNav}
                  accent={theme.accent}
                  accentSoft={theme.accentSoft}
                  accentGlow={theme.accentGlow}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-3 pb-5 border-t border-white/[0.07] pt-3 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2.5 mb-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center justify-between text-[10px] text-white/30 mb-1.5">
              <span>Profile completion</span>
              <span style={{ color: theme.accent }}>75%</span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: "75%",
                  background: `linear-gradient(90deg, ${theme.accent}88, ${theme.accent})`,
                  boxShadow: `0 0 8px ${theme.accentGlow}`,
                }}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                      font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400
                      transition-all duration-200 group
                      ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Sign out" : ""}
        >
          <LogOut size={16} className="flex-shrink-0 group-hover:text-red-400 transition-colors" />
          {!collapsed && <span className="tracking-[0.01em]">Sign out</span>}
        </button>
      </div>
    </div>
  );
};

/* ─── Sidebar (public export) ─────────────────────────────────────────────── */
const Sidebar = ({
  role,
  collapsed   = false,
  onCollapse,
  mobileOpen  = false,
  onMobileClose,
  className   = "",
}) => (
  <>
    {/* ── Desktop ── */}
    <aside
      className={`
        hidden lg:flex flex-col flex-shrink-0 relative
        transition-[width] duration-300 ease-in-out shadow-2xl
        ${collapsed ? "w-[68px]" : "w-64"}
        ${className}
      `}
    >
      <SidebarInner
        role={role}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </aside>

    {/* ── Mobile overlay ── */}
    {mobileOpen && (
      <div className="lg:hidden fixed inset-0 z-50 flex">
        {/* backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
          onClick={onMobileClose}
        />
        {/* drawer — slides in from left */}
        <aside
          className="relative w-72 max-w-[85vw] flex flex-col shadow-2xl z-10
                     animate-slide-in"
          style={{
            animation: "slideIn 0.25s cubic-bezier(0.32,0.72,0,1) both",
          }}
        >
          <SidebarInner
            role={role}
            collapsed={false}
            onMobileClose={onMobileClose}
          />
        </aside>
      </div>
    )}

    {/* keyframe for slide-in */}
    <style>{`
      @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    `}</style>
  </>
);

// useSidebar lives in ./useSidebar.js — re-exported below for convenience
export { default as useSidebar } from "./useSidebar";

/* ─── MobileMenuButton ── drop this in your topbar ───────────────────────── */
export const MobileMenuButton = ({ onClick, role }) => {
  const theme = getTheme(role);
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl
                 transition-all duration-200 hover:scale-95 active:scale-90"
      style={{ background: theme.accentSoft, color: theme.accent }}
      aria-label="Open menu"
    >
      <Menu size={18} />
    </button>
  );
};

export default Sidebar;