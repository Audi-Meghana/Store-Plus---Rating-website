import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Store, Star, TrendingUp, Clock, CheckCircle,
  XCircle, AlertCircle, Loader2, RefreshCw, ArrowRight,
} from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";

const spin = `@keyframes spin{to{transform:rotate(360deg)}}`;

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
    <style>{spin}</style>
    <Loader2 size={32} style={{ color:"#1D4ED8", animation:"spin 0.8s linear infinite" }} />
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
    <div style={{ width:48, height:48, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize:"1.6rem", fontWeight:800, fontFamily:"'Syne',sans-serif", color:"#0F172A", lineHeight:1 }}>{value ?? "—"}</div>
      <div style={{ fontSize:13, fontWeight:600, color:"#6B7280", marginTop:3 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetch = async () => {
    try {
      setLoading(true); setError("");
      const res  = await api.get("/admin/dashboard");
      const root = res?.data ?? res;
      setData(root);
    } catch(e) {
      setError(e.response?.data?.message ?? "Failed to load dashboard");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const s = data?.stats ?? {};

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ${spin}
        .adm-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #F8F9FB;}
        .adm-row:last-child{border-bottom:none;}
        .adm-link{background:none;border:none;cursor:pointer;color:#1D4ED8;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;display:flex;align-items:center;gap:4px;}
      `}</style>

      <Sidebar />

      <div style={{ flex:1, padding:"32px 28px", overflow:"auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.7rem", fontWeight:800, color:"#0F172A" }}>Admin Dashboard</h1>
            <p style={{ color:"#6B7280", fontSize:14, marginTop:4 }}>Overview of your platform</p>
          </div>
          <button onClick={fetch} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F1F5F9", border:"none", borderRadius:10, padding:"9px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:"#374151" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13, marginBottom:20 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? <Spinner /> : (
          <>
            {/* Stats Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
              <StatCard icon={Users}     label="Total Users"     value={s.totalUsers}        sub={`+${s.newUsersThisMonth ?? 0} this month`} color="#1D4ED8" bg="#EFF6FF" />
              <StatCard icon={Store}     label="Total Shops"     value={s.totalShops}        sub={`+${s.newShopsThisMonth ?? 0} this month`} color="#059669" bg="#D1FAE5" />
              <StatCard icon={Star}      label="Total Reviews"   value={s.totalReviews}      color="#D97706" bg="#FEF3C7" />
              <StatCard icon={Clock}     label="Pending Shops"   value={s.pendingShops}      color="#7C3AED" bg="#EDE9FE" />
              <StatCard icon={CheckCircle} label="Active Shops"  value={s.activeShops}       color="#059669" bg="#D1FAE5" />
              <StatCard icon={XCircle}   label="Inactive Shops"  value={s.rejectedShops}     color="#DC2626" bg="#FEE2E2" />
            </div>

            {/* Two-col layout */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

              {/* Recent Shops */}
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"#0F172A" }}>Recent Shops</h3>
                  <button className="adm-link" onClick={() => navigate("/admin/stores")}> View all <ArrowRight size={13} /></button>
                </div>
                {(data?.recentShops ?? []).map((shop) => (
                  <div key={shop._id} className="adm-row">
                    <div style={{ width:36, height:36, borderRadius:10, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Store size={16} style={{ color:"#6B7280" }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{shop.name}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>{shop.owner?.name ?? "—"} · {shop.category}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, background: shop.isVerified ? "#D1FAE5" : "#FEF3C7", color: shop.isVerified ? "#065F46" : "#92400E", borderRadius:100, padding:"2px 8px" }}>
                      {shop.isVerified ? "Active" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Users */}
              <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:24 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"#0F172A" }}>Recent Users</h3>
                  <button className="adm-link" onClick={() => navigate("/admin/users")}> View all <ArrowRight size={13} /></button>
                </div>
                {(data?.recentUsers ?? []).map((user) => (
                  <div key={user._id} className="adm-row">
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"#1D4ED8", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
                      {user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{user.name}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>{user.email}</div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, background:"#EFF6FF", color:"#1D4ED8", borderRadius:100, padding:"2px 8px" }}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Shops */}
            <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"#0F172A" }}>Top Rated Shops</h3>
                <button className="adm-link" onClick={() => navigate("/admin/stores")}> View all <ArrowRight size={13} /></button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
                {(data?.topShops ?? []).map((shop, i) => (
                  <div key={shop._id} style={{ background:"#F8F9FB", borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, marginBottom:4 }}>#{i + 1}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0F172A", marginBottom:3 }}>{shop.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginBottom:6 }}>{shop.category}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <Star size={12} style={{ fill:"#FBBF24", color:"#FBBF24" }} />
                      <span style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{Number(shop.avgRating).toFixed(1)}</span>
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>({shop.reviewCount})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;