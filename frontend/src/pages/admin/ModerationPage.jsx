import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Eye, EyeOff, Star, Loader2, AlertCircle, CheckCircle, RefreshCw, MessageSquare } from "lucide-react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../services/api";

const spin = `@keyframes spin{to{transform:rotate(360deg)}}`;
const Spinner = ({ size=24 }) => (<><style>{spin}</style><Loader2 size={size} style={{ color:"#1D4ED8", animation:"spin 0.8s linear infinite" }}/></>);
const Toast = ({ msg, type }) => (
  <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background:type==="success"?"#065F46":"#991B1B", color:"#fff", borderRadius:12, padding:"12px 20px", fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8, boxShadow:"0 8px 24px rgba(0,0,0,0.15)" }}>
    {type==="success"?<CheckCircle size={16}/>:<AlertCircle size={16}/>} {msg}
  </div>
);

const Stars = ({ rating }) => (
  <span style={{ display:"flex", gap:2 }}>
    {[1,2,3,4,5].map((s) => <Star key={s} size={11} style={{ color:s<=rating?"#FBBF24":"#E5E7EB", fill:s<=rating?"#FBBF24":"none" }}/>)}
  </span>
);

const ModerationPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 10;

  const [actionLoading, setActionLoading] = useState({});
  const [toast,         setToast]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const params = new URLSearchParams({ page, limit:LIMIT, ...(search && { search }) });
      const res  = await api.get(`/admin/reviews?${params}`);
      const root = res?.data ?? res;
      setReviews(Array.isArray(root?.reviews) ? root.reviews : []);
      setTotal(root?.total ?? 0);
    } catch(e) { setError(e.response?.data?.message ?? "Failed to load reviews"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); }, [search]);

  const setAction = (id, val) => setActionLoading(p=>({...p,[id]:val}));

  const handleToggleVisibility = async (review) => {
    const id = review._id ?? review.id;
    setAction(id, "toggling");
    try {
      await api.patch(`/admin/reviews/${id}/visibility`);
      showToast(`Review ${review.isVisible ? "hidden" : "shown"}`);
      fetchReviews();
    } catch(e) { showToast(e.response?.data?.message ?? "Failed", "error"); }
    finally { setAction(id, null); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete._id ?? confirmDelete.id;
    setAction(id, "deleting");
    try {
      await api.delete(`/admin/reviews/${id}`);
      showToast("Review deleted");
      setConfirmDelete(null);
      fetchReviews();
    } catch(e) { showToast(e.response?.data?.message ?? "Failed", "error"); }
    finally { setAction(id, null); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;} ${spin}
        .mod-btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:10px;padding:7px 12px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.2s;}
        .mod-input{width:100%;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 14px;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;background:#fff;}
        .mod-input:focus{border-color:#1D4ED8;}
        .mod-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;}
        .mod-modal{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:440px;}
      `}</style>

      <Sidebar />

      <div style={{ flex:1, padding:"32px 28px", overflow:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.7rem", fontWeight:800, color:"#0F172A" }}>Review Moderation</h1>
            <p style={{ color:"#6B7280", fontSize:14, marginTop:4 }}>{total} reviews total</p>
          </div>
          <button className="mod-btn" style={{ background:"#F1F5F9", color:"#374151", padding:"9px 16px", fontSize:13 }} onClick={fetchReviews}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          <div style={{ position:"relative", flex:1, maxWidth:400 }}>
            <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }}/>
            <input className="mod-input" style={{ paddingLeft:36 }} placeholder="Search review text…" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
        </div>

        {error && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13, marginBottom:16 }}><AlertCircle size={16}/> {error}</div>}

        {/* Reviews */}
        {loading ? <div style={{ padding:48, display:"flex", justifyContent:"center" }}><Spinner size={32}/></div>
        : reviews.length === 0 ? (
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:48, textAlign:"center", color:"#9CA3AF" }}>
            <MessageSquare size={40} style={{ margin:"0 auto 12px", opacity:0.3 }}/> No reviews found.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {reviews.map((rev) => {
              const id       = rev._id ?? rev.id;
              const isLoading = actionLoading[id];
              const dateStr  = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-IN", { month:"short", day:"numeric", year:"numeric" }) : "";
              return (
                <div key={id} style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${rev.isVisible===false?"#FECACA":"#F1F5F9"}`, padding:20, opacity:rev.isVisible===false?0.7:1 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:10 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", background:"#1D4ED8", color:"#fff", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {(rev.user?.name?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{rev.user?.name ?? "Anonymous"}</div>
                        <div style={{ fontSize:11, color:"#9CA3AF" }}>{rev.user?.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <Stars rating={rev.rating}/>
                      <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{dateStr}</div>
                    </div>
                  </div>

                  {rev.shop && (
                    <div style={{ fontSize:12, color:"#6B7280", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
                      Shop: <strong style={{ color:"#374151" }}>{rev.shop.name}</strong>
                      <span style={{ background:"#EFF6FF", color:"#1D4ED8", borderRadius:4, padding:"0 6px", fontSize:11, fontWeight:600 }}>{rev.shop.category}</span>
                    </div>
                  )}

                  {rev.text && <p style={{ fontSize:14, color:"#374151", lineHeight:1.7, marginBottom:12 }}>{rev.text}</p>}

                  {rev.isVisible === false && (
                    <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#DC2626", fontWeight:600, marginBottom:10 }}>
                      ⚠ This review is hidden from public view
                    </div>
                  )}

                  <div style={{ display:"flex", gap:8 }}>
                    {isLoading ? <Spinner size={16}/> : (
                      <>
                        <button className="mod-btn" style={{ background: rev.isVisible===false?"#D1FAE5":"#FEF3C7", color: rev.isVisible===false?"#065F46":"#92400E" }}
                          onClick={() => handleToggleVisibility(rev)}>
                          {rev.isVisible===false ? <><Eye size={12}/> Show</> : <><EyeOff size={12}/> Hide</>}
                        </button>
                        <button className="mod-btn" style={{ background:"#FEE2E2", color:"#991B1B" }}
                          onClick={() => setConfirmDelete(rev)}>
                          <Trash2 size={12}/> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:8, marginTop:24 }}>
            <button className="mod-btn" style={{ background:"#F1F5F9", color:"#374151" }} disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
            {Array.from({ length:totalPages },(_,i)=>i+1).map((p) => (
              <button key={p} className="mod-btn" onClick={() => setPage(p)} style={{ padding:"7px 12px", background:p===page?"#1D4ED8":"#F1F5F9", color:p===page?"#fff":"#374151" }}>{p}</button>
            ))}
            <button className="mod-btn" style={{ background:"#F1F5F9", color:"#374151" }} disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="mod-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="mod-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ width:60, height:60, background:"#FEE2E2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Trash2 size={28} style={{ color:"#EF4444" }}/>
              </div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#0F172A", fontSize:"1.2rem", marginBottom:8 }}>Delete Review?</h2>
              <p style={{ color:"#6B7280", fontSize:14 }}>This review will be permanently deleted and cannot be recovered.</p>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button className="mod-btn" style={{ background:"#F1F5F9", color:"#374151", padding:"10px 20px" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="mod-btn" style={{ background:"#EF4444", color:"#fff", padding:"10px 20px" }} onClick={handleDelete}>
                {actionLoading[confirmDelete._id] ? <Spinner size={14}/> : <Trash2 size={14}/>} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
};

export default ModerationPage;