import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Store, Search, Bell, Menu, X, LogOut,
  LayoutDashboard, Heart, User, ChevronDown,
  Star, Shield, TrendingUp, Tag, MapPin,
  Settings, HelpCircle, Loader2, MessageSquare
} from "lucide-react";
import useAuthStore, { useHydrated } from "../../store/authStore";
import { logoutService } from "../../services/authService";
import api from "../../services/api";

const CATEGORIES = [
  { name: "Restaurants", icon: "🍽️", path: "/explore?category=Restaurant" },
  { name: "Cafes",       icon: "☕",  path: "/explore?category=Cafe"        },
  { name: "Grocery",     icon: "🛒",  path: "/explore?category=Grocery"     },
  { name: "Clothing",    icon: "👗",  path: "/explore?category=Clothing"    },
  { name: "Electronics", icon: "📱",  path: "/explore?category=Electronics" },
  { name: "Pharmacy",    icon: "💊",  path: "/explore?category=Pharmacy"    },
  { name: "Salon",       icon: "✂️",  path: "/explore?category=Salon"       },
  { name: "Gym",         icon: "💪",  path: "/explore?category=Gym"         },
];

const QUICK_ACCESS = [
  { label: "Top Rated Stores", icon: Star,       path: "/explore?sort=top",    color: "#F59E0B" },
  { label: "Nearby Stores",    icon: MapPin,     path: "/explore?nearby=true", color: "#3B82F6" },
  { label: "Latest Deals",     icon: Tag,        path: "/deals",               color: "#16A34A" },
  { label: "New Arrivals",     icon: TrendingUp, path: "/explore?sort=newest", color: "#8B5CF6" },
];

const TYPE_ICON = {
  review_reply: MessageSquare, owner_reply: MessageSquare,
  new_review: Star, deal: Tag, new_deal: Tag,
  helpful_vote: Star, store_verified: Shield, system: Bell,
};
const getNotifIcon = (type) => TYPE_ICON[type] ?? Bell;

const timeAgo = (d) => {
  if (!d) return "";
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return mins  + "m ago";
  if (hours < 24) return hours + "h ago";
  return days + "d ago";
};

const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
};

const Avatar = ({ name, size = 34 }) => {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#3B82F6,#6366F1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.38, flexShrink: 0,
      userSelect: "none",
    }}>
      {initial}
    </div>
  );
};

const RolePill = ({ label, bg, color }) => (
  <span style={{
    display: "inline-block", fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 100, background: bg, color, marginTop: 3,
  }}>
    {label}
  </span>
);

const NavLink = ({ to, active, accent = "blue", children }) => {
  const navigate = useNavigate();
  const map = {
    blue:   { bg: "#EFF6FF", color: "#1D4ED8" },
    green:  { bg: "#F0FDF4", color: "#16A34A" },
    purple: { bg: "#F5F3FF", color: "#7C3AED" },
  };
  const c = map[accent] || map.blue;
  return (
    <button onClick={() => navigate(to)} style={{
      padding: "7px 13px", borderRadius: 10, fontSize: 14, fontWeight: 600,
      border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
      background: active ? c.bg : "transparent",
      color: active ? c.color : "#4B5563",
      transition: "background 0.18s,color 0.18s",
      whiteSpace: "nowrap",
    }}>
      {children}
    </button>
  );
};

const IconBtn = ({ children, onClick, active, badge, ...rest }) => (
  <button onClick={onClick} {...rest} style={{
    position: "relative", width: 38, height: 38,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 10, border: "none", cursor: "pointer",
    background: active ? "#EFF6FF" : "transparent",
    color: active ? "#1D4ED8" : "#64748B",
    transition: "background 0.18s,color 0.18s",
    flexShrink: 0,
  }}>
    {children}
    {badge > 0 && (
      <span style={{
        position: "absolute", top: 4, right: 4,
        width: 16, height: 16, background: "#EF4444", color: "#fff",
        fontSize: 9, fontWeight: 700, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "2px solid #fff",
      }}>{badge > 9 ? "9+" : badge}</span>
    )}
  </button>
);

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const hydrated  = useHydrated();

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [exploreOpen,  setExploreOpen]  = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [realNotifs,   setRealNotifs]   = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const exploreRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const searchRef  = useRef(null);

  useClickOutside(exploreRef, () => setExploreOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));
  useClickOutside(notifRef,   () => setNotifOpen(false));
  useClickOutside(searchRef,  () => setSearchOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false); setSearchOpen(false);
    setExploreOpen(false); setProfileOpen(false); setNotifOpen(false);
  }, [location.pathname, location.search]);

  const fetchNotifs = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get("/notifications?limit=5");
      const d   = res?.data?.data ?? res?.data?.notifications ?? res?.data ?? [];
      setRealNotifs(Array.isArray(d) ? d : []);
    } catch { /* silent */ }
    finally { setNotifLoading(false); }
  };

  useEffect(() => {
    if (hydrated && isAuthenticated) fetchNotifs();
  }, [hydrated, isAuthenticated]);

  const markAllRead = async () => {
    setRealNotifs(n => n.map(x => ({ ...x, read: true })));
    try { await api.patch("/notifications/all/read"); } catch {}
  };

  const unreadCount = realNotifs.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/explore?search=" + encodeURIComponent(searchQuery.trim()));
      setSearchOpen(false); setSearchQuery("");
    }
  };

  // ✅ Instant logout:
  // 1. Close dropdowns
  // 2. Clear store + localStorage (sync, instant)
  // 3. Navigate home (instant)
  // 4. Tell server in background (fire-and-forget, never blocks)
  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/", { replace: true });
    logoutService(); // fire-and-forget
  };

  const authed  = hydrated && isAuthenticated;
  const isOwner = authed && user?.role === "shop_owner";
  const isAdmin = authed && user?.role === "admin";
  const isUser  = authed && user?.role === "user";

  const getDashboardLink  = () => isAdmin ? "/admin/dashboard" : isOwner ? "/owner/dashboard" : "/profile";
  const getDashboardLabel = () => isAdmin ? "Admin Panel"      : isOwner ? "Owner Dashboard"  : "My Account";

  const getRoleBadge = () =>
    isAdmin ? { label: "Admin", bg: "#F5F3FF", color: "#7C3AED" } :
    isOwner ? { label: "Owner", bg: "#F0FDF4", color: "#16A34A" } :
              { label: "User",  bg: "#EFF6FF", color: "#1D4ED8" };

  const badge = getRoleBadge();

  const profileMenuItems = [
    { label: getDashboardLabel(), icon: LayoutDashboard, path: getDashboardLink(),                                              color: "#1D4ED8" },
    ...(isUser  ? [
      { label: "My Profile",    icon: User,  path: "/profile",     color: "#4B5563" },
      { label: "My Wishlist",   icon: Heart, path: "/wishlist",    color: "#EF4444" },
    ] : []),
    ...(isOwner ? [
      { label: "Store Profile", icon: Store, path: "/owner/store", color: "#4B5563" },
    ] : []),
    { label: "Notifications",  icon: Bell,       path: "/notifications",                                                       color: "#4B5563" },
    { label: "Settings",       icon: Settings,   path: isOwner ? "/owner/profile" : isAdmin ? "/admin/settings" : "/profile", color: "#4B5563" },
    { label: "Help & Support", icon: HelpCircle, path: "/help",                                                                color: "#4B5563" },
  ];

  const isActive      = (path) => location.pathname === path;
  const isDealsActive = location.pathname === "/deals";

  const ProfileDropdown = () => (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      width: 248, background: "#fff", borderRadius: 18,
      boxShadow: "0 8px 40px rgba(11,22,40,0.13),0 2px 8px rgba(11,22,40,0.06)",
      border: "1.5px solid #F1F5F9", zIndex: 999,
      animation: "nb-fade .18s ease", overflow: "hidden",
    }}>
      <div style={{ padding: 14, background: "linear-gradient(135deg,#EFF6FF,#EEF2FF)", borderBottom: "1.5px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={user?.name} size={40} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#0B1628", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
              {user?.name || "User"}
            </p>
            <p style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0 0" }}>
              {user?.email || ""}
            </p>
            <RolePill label={badge.label} bg={badge.bg} color={badge.color} />
          </div>
        </div>
      </div>
      <div style={{ padding: "8px 8px 4px" }}>
        {profileMenuItems.map(item => (
          <button key={item.label}
            onClick={() => { navigate(item.path); setProfileOpen(false); setMobileOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", width:"100%", transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <item.icon size={15} style={{ color: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "4px 8px 8px", borderTop: "1.5px solid #F8FAFC" }}>
        <button onClick={handleLogout}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", width:"100%", transition:"background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background="#FEF2F2"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
          <LogOut size={15} style={{ color: "#EF4444" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes nb-fade  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nb-spin  { to{transform:rotate(360deg)} }
        @keyframes nb-slide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .nb-desktop { display:none !important; }
        @media(min-width:1024px){ .nb-desktop{display:flex !important;} .nb-hamburger{display:none !important;} }
        .nb-logo-text { display:none; }
        @media(min-width:480px){ .nb-logo-text{display:block !important;} }
        .nb-profile-desktop { display:none !important; }
        @media(min-width:768px){ .nb-profile-desktop{display:flex !important;} .nb-avatar-mobile{display:none !important;} }
        .nb-auth-desktop { display:none !important; }
        @media(min-width:768px){ .nb-auth-desktop{display:flex !important;} .nb-signin-mobile{display:none !important;} }
        .nb-mobile-panel { animation: nb-slide .22s ease; }
      `}</style>

      <nav style={{
        background: "#fff", position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1.5px solid #F1F5F9",
        boxShadow: scrolled ? "0 4px 24px rgba(11,22,40,0.08)" : "none",
        transition: "box-shadow 0.3s ease", fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height: 60 }}>

            <Link to="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", flexShrink:0 }}>
              <div style={{ width:36, height:36, background:"linear-gradient(135deg,#3B82F6,#1D4ED8)", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(29,78,216,0.28)" }}>
                <Store size={17} color="#fff" />
              </div>
              <div className="nb-logo-text">
                <p style={{ fontWeight:800, fontSize:16, color:"#0B1628", lineHeight:1, margin:0 }}>StorePulse</p>
                <p style={{ fontSize:10, color:"#94A3B8", margin:"2px 0 0" }}>Discover & Rate</p>
              </div>
            </Link>

            <div className="nb-desktop" style={{ alignItems:"center", gap:2 }}>
              <NavLink to="/" active={isActive("/")}>Home</NavLink>

              <div ref={exploreRef} style={{ position:"relative" }}>
                <button onClick={() => setExploreOpen(p => !p)} style={{
                  display:"flex", alignItems:"center", gap:4, padding:"7px 13px", borderRadius:10,
                  fontSize:14, fontWeight:600, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  background: exploreOpen || location.pathname==="/explore" ? "#EFF6FF" : "transparent",
                  color:      exploreOpen || location.pathname==="/explore" ? "#1D4ED8" : "#4B5563",
                  transition:"background 0.18s,color 0.18s",
                }}>
                  Explore
                  <ChevronDown size={13} style={{ transition:"transform 0.2s", transform: exploreOpen ? "rotate(180deg)" : "none" }} />
                </button>
                {exploreOpen && (
                  <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, width:280, background:"#fff", borderRadius:18, boxShadow:"0 8px 40px rgba(11,22,40,0.13)", border:"1.5px solid #F1F5F9", zIndex:999, animation:"nb-fade .18s ease" }}>
                    <div style={{ padding:"14px 14px 10px", borderBottom:"1.5px solid #F8FAFC" }}>
                      <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.7px", padding:"0 6px", marginBottom:8 }}>Browse Categories</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                        {CATEGORIES.map(cat => (
                          <button key={cat.name} onClick={() => { navigate(cat.path); setExploreOpen(false); }}
                            style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", width:"100%", transition:"background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                            <span style={{ fontSize:15 }}>{cat.icon}</span>
                            <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding:"10px 14px 14px" }}>
                      <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.7px", padding:"0 6px", marginBottom:6 }}>Quick Access</p>
                      {QUICK_ACCESS.map(item => (
                        <button key={item.path} onClick={() => { navigate(item.path); setExploreOpen(false); }}
                          style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:10, border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", width:"100%", textAlign:"left", transition:"background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <item.icon size={15} style={{ color: item.color, flexShrink:0 }} />
                          <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/explore?sort=top" active={location.search==="?sort=top"}>Top Rated</NavLink>
              <NavLink to="/deals" active={isDealsActive}>Deals</NavLink>
              {isOwner && <NavLink to="/owner/dashboard" active={location.pathname.startsWith("/owner")} accent="green">My Store</NavLink>}
              {isAdmin  && <NavLink to="/admin/dashboard" active={location.pathname.startsWith("/admin")} accent="purple">Admin</NavLink>}
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
              <div ref={searchRef} style={{ position:"relative" }}>
                <IconBtn onClick={() => setSearchOpen(p => !p)} active={searchOpen}>
                  <Search size={18} />
                </IconBtn>
                {searchOpen && (
                  <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:300, background:"#fff", borderRadius:18, boxShadow:"0 8px 40px rgba(11,22,40,0.13)", border:"1.5px solid #F1F5F9", zIndex:999, padding:14, animation:"nb-fade .18s ease" }}>
                    <form onSubmit={handleSearch}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#F8FAFC", borderRadius:10, padding:"9px 13px", border:"1.5px solid #E2E8F0" }}>
                        <Search size={14} color="#9CA3AF" style={{ flexShrink:0 }} />
                        <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search stores, cafes…"
                          style={{ flex:1, border:"none", outline:"none", fontSize:13, background:"transparent", fontFamily:"'DM Sans',sans-serif", color:"#0B1628" }} />
                        {searchQuery && (
                          <button type="button" onClick={() => setSearchQuery("")} style={{ border:"none", background:"none", cursor:"pointer", color:"#9CA3AF", display:"flex" }}>
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </form>
                    <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.7px", margin:"12px 0 8px 2px" }}>Popular</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {["Biryani","Coffee","Pizza","Gym","Salon"].map(s => (
                        <button key={s} onClick={() => { navigate("/explore?search="+s); setSearchOpen(false); setSearchQuery(""); }}
                          style={{ fontSize:12, fontWeight:600, background:"#F1F5F9", color:"#64748B", border:"none", borderRadius:100, padding:"5px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!hydrated ? (
                <div style={{ width: 80, height: 32, borderRadius: 10, background: "#F1F5F9" }} />
              ) : authed ? (
                <>
                  {isUser && (
                    <IconBtn onClick={() => navigate("/wishlist")} active={isActive("/wishlist")}>
                      <Heart size={18} />
                    </IconBtn>
                  )}
                  <div ref={notifRef} style={{ position:"relative" }}>
                    <IconBtn onClick={() => setNotifOpen(p => !p)} active={notifOpen} badge={unreadCount}>
                      <Bell size={18} />
                    </IconBtn>
                    {notifOpen && (
                      <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:310, background:"#fff", borderRadius:18, boxShadow:"0 8px 40px rgba(11,22,40,0.13)", border:"1.5px solid #F1F5F9", zIndex:999, overflow:"hidden", animation:"nb-fade .18s ease" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1.5px solid #F8FAFC" }}>
                          <div>
                            <p style={{ fontWeight:700, fontSize:14, color:"#0B1628", margin:0 }}>Notifications</p>
                            <p style={{ fontSize:11, color:"#94A3B8", margin:"2px 0 0" }}>{unreadCount} unread</p>
                          </div>
                          <button onClick={markAllRead} style={{ fontSize:12, fontWeight:600, color:"#1D4ED8", border:"none", background:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Mark all read</button>
                        </div>
                        <div style={{ maxHeight:280, overflowY:"auto" }}>
                          {notifLoading ? (
                            <div style={{ padding:20, display:"flex", justifyContent:"center" }}>
                              <Loader2 size={18} style={{ color:"#1D4ED8", animation:"nb-spin .8s linear infinite" }} />
                            </div>
                          ) : realNotifs.length === 0 ? (
                            <div style={{ padding:"24px 16px", textAlign:"center", color:"#94A3B8", fontSize:13 }}>No notifications yet</div>
                          ) : realNotifs.slice(0,5).map(n => {
                            const NIcon = getNotifIcon(n.type);
                            return (
                              <div key={n._id} onClick={() => { navigate("/notifications"); setNotifOpen(false); }}
                                style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", background: !n.read ? "rgba(59,130,246,0.04)" : "#fff", borderBottom:"1.5px solid #F8FAFC", cursor:"pointer" }}>
                                <div style={{ width:34, height:34, borderRadius:10, background: !n.read ? "#EFF6FF" : "#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                  <NIcon size={14} color={!n.read ? "#1D4ED8" : "#94A3B8"} />
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ fontSize:13, fontWeight: !n.read ? 700 : 500, color: !n.read ? "#0B1628" : "#64748B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{n.title ?? n.message}</p>
                                  {(n.body ?? n.description) && <p style={{ fontSize:11, color:"#94A3B8", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{n.body ?? n.description}</p>}
                                  <p style={{ fontSize:11, color:"#CBD5E1", margin:"3px 0 0" }}>{timeAgo(n.createdAt)}</p>
                                </div>
                                {!n.read && <div style={{ width:7, height:7, background:"#3B82F6", borderRadius:"50%", flexShrink:0, marginTop:5 }} />}
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ padding:"10px 16px", borderTop:"1.5px solid #F8FAFC", textAlign:"center" }}>
                          <button onClick={() => { navigate("/notifications"); setNotifOpen(false); }}
                            style={{ fontSize:13, fontWeight:600, color:"#1D4ED8", border:"none", background:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                            View all notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div ref={profileRef} style={{ position:"relative" }}>
                    <button className="nb-profile-desktop" onClick={() => setProfileOpen(p => !p)} style={{
                      alignItems:"center", gap:8, padding:"5px 10px 5px 5px", borderRadius:12,
                      border:"1.5px solid", borderColor: profileOpen ? "#BFDBFE" : "#F1F5F9",
                      background: profileOpen ? "#EFF6FF" : "#fff",
                      cursor:"pointer", transition:"all 0.18s",
                    }}>
                      <Avatar name={user?.name} size={28} />
                      <div style={{ textAlign:"left" }}>
                        <p style={{ fontSize:13, fontWeight:700, color:"#0B1628", lineHeight:1, margin:0 }}>{user?.name?.split(" ")[0] || "User"}</p>
                        <p style={{ fontSize:10, color:"#94A3B8", lineHeight:1, marginTop:2 }}>{badge.label}</p>
                      </div>
                      <ChevronDown size={13} color="#94A3B8" style={{ transition:"transform 0.2s", transform: profileOpen ? "rotate(180deg)" : "none" }} />
                    </button>
                    <button className="nb-avatar-mobile" onClick={() => setProfileOpen(p => !p)} style={{
                      display:"flex", alignItems:"center", justifyContent:"center",
                      width:36, height:36, borderRadius:"50%",
                      border:`2px solid ${profileOpen ? "#BFDBFE" : "#E5E7EB"}`,
                      background:"transparent", cursor:"pointer", padding:0,
                    }}>
                      <Avatar name={user?.name} size={32} />
                    </button>
                    {profileOpen && <ProfileDropdown />}
                  </div>
                </>
              ) : (
                <>
                  <div className="nb-auth-desktop" style={{ alignItems:"center", gap:6 }}>
                    <button onClick={() => navigate("/login")}
                      style={{ padding:"8px 16px", fontSize:13, fontWeight:700, color:"#374151", background:"transparent", border:"1.5px solid #E5E7EB", borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                      Sign in
                    </button>
                    <button onClick={() => navigate("/register")}
                      style={{ padding:"8px 16px", fontSize:13, fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#3B82F6,#1D4ED8)", border:"none", borderRadius:10, cursor:"pointer", boxShadow:"0 4px 12px rgba(29,78,216,0.28)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                      Get Started
                    </button>
                  </div>
                  <button className="nb-signin-mobile" onClick={() => navigate("/login")}
                    style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:10, border:"1.5px solid #E5E7EB", background:"transparent", cursor:"pointer" }}>
                    <User size={17} color="#64748B" />
                  </button>
                </>
              )}

              <button className="nb-hamburger" onClick={() => setMobileOpen(p => !p)}
                style={{ display:"flex", padding:8, background: mobileOpen ? "#F1F5F9" : "transparent", border:"none", borderRadius:10, cursor:"pointer", color:"#4B5563", marginLeft:2 }}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="nb-mobile-panel" style={{ borderTop:"1.5px solid #F1F5F9", background:"#fff", maxHeight:"85vh", overflowY:"auto" }}>
            <div style={{ padding:"14px 16px 28px" }}>
              {authed && (
                <div style={{ display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,#EFF6FF,#EEF2FF)", borderRadius:16, padding:"13px 14px", marginBottom:14 }}>
                  <Avatar name={user?.name} size={44} />
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ fontWeight:800, fontSize:14, color:"#0B1628", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{user?.name || "User"}</p>
                    <p style={{ fontSize:11, color:"#64748B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:"2px 0 0" }}>{user?.email || ""}</p>
                  </div>
                  <RolePill label={badge.label} bg={badge.bg} color={badge.color} />
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:8 }}>
                {[
                  { label:"Home",           path:"/"                 },
                  { label:"Explore Stores", path:"/explore"          },
                  { label:"Top Rated",      path:"/explore?sort=top" },
                  { label:"Latest Deals",   path:"/deals"            },
                ].map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    style={{
                      width:"100%", textAlign:"left", padding:"11px 14px", borderRadius:12,
                      border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
                      background: (location.pathname + location.search) === item.path || (item.path==="/deals" && isDealsActive) ? "#EFF6FF" : "transparent",
                      color:      (location.pathname + location.search) === item.path || (item.path==="/deals" && isDealsActive) ? "#1D4ED8" : "#374151",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background="#F1F5F9"}
                    onMouseLeave={e => e.currentTarget.style.background = (location.pathname + location.search) === item.path ? "#EFF6FF" : "transparent"}>
                    {item.label}
                  </button>
                ))}
                {isOwner && (
                  <button onClick={() => { navigate("/owner/dashboard"); setMobileOpen(false); }}
                    style={{ width:"100%", textAlign:"left", padding:"11px 14px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background: location.pathname.startsWith("/owner") ? "#F0FDF4" : "transparent", color: location.pathname.startsWith("/owner") ? "#16A34A" : "#374151" }}>
                    My Store
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => { navigate("/admin/dashboard"); setMobileOpen(false); }}
                    style={{ width:"100%", textAlign:"left", padding:"11px 14px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, background: location.pathname.startsWith("/admin") ? "#F5F3FF" : "transparent", color: location.pathname.startsWith("/admin") ? "#7C3AED" : "#374151" }}>
                    Admin Panel
                  </button>
                )}
              </div>

              <div style={{ borderTop:"1.5px solid #F1F5F9", paddingTop:14, marginBottom:8 }}>
                <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.7px", margin:"0 0 10px" }}>Categories</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {CATEGORIES.slice(0,6).map(cat => (
                    <button key={cat.name} onClick={() => { navigate(cat.path); setMobileOpen(false); }}
                      style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:12, border:"none", background:"#F8FAFC", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#374151" }}
                      onMouseEnter={e => e.currentTarget.style.background="#F1F5F9"}
                      onMouseLeave={e => e.currentTarget.style.background="#F8FAFC"}>
                      <span style={{ fontSize:16 }}>{cat.icon}</span>{cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {authed ? (
                <div style={{ borderTop:"1.5px solid #F1F5F9", paddingTop:14 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.7px", margin:"0 0 8px" }}>Account</p>
                  {profileMenuItems.map(item => (
                    <button key={item.label} onClick={() => { navigate(item.path); setMobileOpen(false); }}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#374151", width:"100%", marginBottom:2 }}
                      onMouseEnter={e => e.currentTarget.style.background="#F1F5F9"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <item.icon size={17} style={{ color: item.color, flexShrink:0 }} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button onClick={handleLogout}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, border:"none", background:"transparent", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#EF4444", width:"100%" }}
                    onMouseEnter={e => e.currentTarget.style.background="#FEF2F2"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <LogOut size={17} style={{ color:"#EF4444", flexShrink:0 }} /><span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div style={{ borderTop:"1.5px solid #F1F5F9", paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
                  <button onClick={() => navigate("/login")}
                    style={{ padding:"13px", fontSize:14, fontWeight:700, color:"#374151", background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Sign in
                  </button>
                  <button onClick={() => navigate("/register")}
                    style={{ padding:"13px", fontSize:14, fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#3B82F6,#1D4ED8)", border:"none", borderRadius:12, cursor:"pointer", boxShadow:"0 4px 14px rgba(29,78,216,0.28)", fontFamily:"'DM Sans',sans-serif" }}>
                    Get Started — It's Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;