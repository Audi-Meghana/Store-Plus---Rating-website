import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, Tag, MessageSquare, CheckCheck,
  Trash2, Reply, ThumbsUp, ShieldCheck, Zap,
  ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const TYPE_CFG = {
  review_reply:  { icon: Reply,         bg: "#EFF6FF", color: "#1D4ED8", label: "Reply"    },
  owner_reply:   { icon: Reply,         bg: "#F0FDF4", color: "#16A34A", label: "Owner"    },
  new_review:    { icon: MessageSquare, bg: "#EFF6FF", color: "#1D4ED8", label: "Review"   },
  deal:          { icon: Tag,           bg: "#FFFBEB", color: "#D97706", label: "Deal"     },
  helpful_vote:  { icon: ThumbsUp,      bg: "#F0FDF4", color: "#16A34A", label: "Helpful"  },
  new_deal:      { icon: Zap,           bg: "#FFFBEB", color: "#D97706", label: "New Deal" },
  store_verified:{ icon: ShieldCheck,   bg: "#F5F3FF", color: "#7C3AED", label: "Verified" },
  system:        { icon: Bell,          bg: "#F8FAFC", color: "#64748B", label: "System"   },
};
const getCfg = (type) => TYPE_CFG[type] ?? TYPE_CFG.system;

const timeAgo = (d) => {
  if (!d) return "";
  const diff  = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
};

const FILTERS = [
  { key:"all",          label:"All"      },
  { key:"unread",       label:"Unread"   },
  { key:"review_reply", label:"Replies"  },
  { key:"new_review",   label:"Reviews"  },
  { key:"deal",         label:"Deals"    },
  { key:"helpful_vote", label:"Helpful"  },
  { key:"system",       label:"System"   },
];

/* ── Skeleton ── */
const Skeleton = () => (
  <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px", display:"flex", gap:12, alignItems:"center" }}>
    <div style={{ width:42, height:42, borderRadius:12, background:"#F1F5F9", flexShrink:0 }} />
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ height:12, width:"55%", borderRadius:6, background:"#F1F5F9" }} />
      <div style={{ height:10, width:"35%", borderRadius:6, background:"#F8FAFC" }} />
    </div>
  </div>
);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("all");
  const [visible, setVisible] = useState(10);

  useEffect(() => {
    api.get("/notifications")
      .then(res => {
        const d = res?.data?.data ?? res?.data?.notifications ?? res?.data ?? [];
        setNotifs(Array.isArray(d) ? d : []);
      })
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    try { await api.patch("/notifications/all/read"); } catch {}
  };

  const markRead = async (id) => {
    setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    try { await api.patch(`/notifications/${id}/read`); } catch {}
  };

  const remove = async (e, id) => {
    e.stopPropagation();
    setNotifs(n => n.filter(x => x._id !== id));
    try { await api.delete(`/notifications/${id}`); } catch {}
  };

  const handleClick = (n) => {
    markRead(n._id);
    const shopId = n.shop?._id ?? n.shop ?? n.store?._id ?? n.store;
    if (shopId) navigate(`/store/${shopId}`);
  };

  const unread = notifs.filter(n => !n.read).length;

  const filtered =
    filter === "all"    ? notifs :
    filter === "unread" ? notifs.filter(n => !n.read) :
    notifs.filter(n => (n.type ?? "system").startsWith(filter) || n.type === filter);

  const shown   = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <Navbar />

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px 60px" }}>

        {/* ── Header ── */}
        <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:"18px 20px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <h1 style={{ fontSize:18, fontWeight:800, color:"#0F172A", margin:0 }}>Notifications</h1>
              {unread > 0 && (
                <span style={{ fontSize:11, fontWeight:700, background:"#EFF6FF", color:"#1D4ED8", borderRadius:100, padding:"2px 10px" }}>
                  {unread} new
                </span>
              )}
            </div>
            <p style={{ fontSize:12, color:"#9CA3AF", margin:0 }}>{notifs.length} total · {unread} unread</p>
          </div>
          {unread > 0 && (
            <button onClick={markAll} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, color:"#1D4ED8", background:"#EFF6FF", border:"1.5px solid #BFDBFE", borderRadius:10, padding:"8px 14px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* ── Filter pills ── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"12px 14px", marginBottom:14, display:"flex", gap:6, flexWrap:"wrap" }}>
          {FILTERS.map(f => {
            const cnt =
              f.key === "all"    ? notifs.length :
              f.key === "unread" ? notifs.filter(n => !n.read).length :
              notifs.filter(n => (n.type ?? "system").startsWith(f.key) || n.type === f.key).length;
            const isOn = filter === f.key;
            return (
              <button key={f.key} onClick={() => { setFilter(f.key); setVisible(10); }} style={{
                display:"inline-flex", alignItems:"center", gap:5,
                padding:"6px 12px", borderRadius:100,
                fontSize:12, fontWeight:600,
                border:`1.5px solid ${isOn ? "#1D4ED8" : "#E5E7EB"}`,
                background: isOn ? "#1D4ED8" : "#F8FAFC",
                color: isOn ? "#fff" : "#64748B",
                cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
                transition:"all 0.15s",
              }}>
                {f.label}
                {cnt > 0 && (
                  <span style={{ fontSize:10, fontWeight:700, background: isOn ? "rgba(255,255,255,0.25)" : "#F1F5F9", color: isOn ? "#fff" : "#9CA3AF", borderRadius:100, padding:"1px 6px" }}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13, marginBottom:14 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* ── List ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {loading ? (
            [1,2,3,4,5].map(n => <Skeleton key={n} />)
          ) : shown.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 24px", background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9" }}>
              <div style={{ width:52, height:52, borderRadius:16, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Bell size={22} style={{ color:"#93C5FD" }} />
              </div>
              <p style={{ fontSize:15, fontWeight:700, color:"#374151", margin:"0 0 4px" }}>All caught up</p>
              <p style={{ fontSize:13, color:"#9CA3AF" }}>
                {filter === "all" ? "No notifications yet." : `No ${filter.replace("_"," ")} notifications.`}
              </p>
            </div>
          ) : shown.map(n => {
            const cfg      = getCfg(n.type);
            const Icon     = cfg.icon;
            const isUnread = !n.read;
            return (
              <div key={n._id} onClick={() => handleClick(n)} style={{
                background: isUnread ? "#FAFCFF" : "#fff",
                borderRadius:16,
                border:`1.5px solid ${isUnread ? "#BFDBFE" : "#F1F5F9"}`,
                padding:"14px 16px",
                display:"flex", alignItems:"flex-start", gap:12,
                cursor:"pointer",
                position:"relative",
                transition:"box-shadow 0.15s, transform 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
              >
                {/* Unread bar */}
                {isUnread && (
                  <div style={{ position:"absolute", left:0, top:"20%", bottom:"20%", width:3, borderRadius:"0 3px 3px 0", background:"#1D4ED8" }} />
                )}

                {/* Icon */}
                <div style={{ width:42, height:42, borderRadius:12, background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1.5px solid ${cfg.color}22` }}>
                  <Icon size={17} style={{ color:cfg.color }} />
                </div>

                {/* Body */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:3 }}>
                    <p style={{ fontSize:13, fontWeight: isUnread ? 700 : 500, color: isUnread ? "#0F172A" : "#374151", lineHeight:1.45, margin:0, flex:1, minWidth:0 }}>
                      {n.title ?? n.message}
                    </p>
                    <span style={{ fontSize:11, color:"#9CA3AF", whiteSpace:"nowrap", flexShrink:0 }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  {(n.body ?? n.description) && (
                    <p style={{ fontSize:12, color:"#64748B", lineHeight:1.5, margin:"0 0 6px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {n.body ?? n.description}
                    </p>
                  )}

                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.4px", color:cfg.color, background:cfg.bg, borderRadius:6, padding:"2px 8px" }}>
                      {cfg.label}
                    </span>
                    {(n.shop?.name ?? n.store?.name) && (
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>· {n.shop?.name ?? n.store?.name}</span>
                    )}
                    {isUnread && (
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"#1D4ED8", display:"inline-block" }} />
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button onClick={e => remove(e, n._id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#CBD5E1", padding:"4px", borderRadius:8, flexShrink:0, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="#FEF2F2"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="#CBD5E1"; e.currentTarget.style.background="none"; }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Load more / show less ── */}
        {!loading && filtered.length > 10 && (
          <div style={{ display:"flex", justifyContent:"center", marginTop:16 }}>
            {hasMore ? (
              <button onClick={() => setVisible(v => v + 10)} style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 20px", fontSize:13, fontWeight:700, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>
                <ChevronDown size={14} /> Load more ({filtered.length - visible} remaining)
              </button>
            ) : (
              <button onClick={() => setVisible(10)} style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 20px", fontSize:13, fontWeight:700, color:"#64748B", cursor:"pointer", fontFamily:"inherit" }}>
                <ChevronUp size={14} /> Show less
              </button>
            )}
          </div>
        )}

        {/* Footer count */}
        {!loading && shown.length > 0 && (
          <p style={{ textAlign:"center", fontSize:12, color:"#CBD5E1", marginTop:16 }}>
            Showing {shown.length} of {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;