import { useState, useEffect } from "react";
import {
  Star, MessageSquare, Reply, CheckCircle2,
  Search, Filter, Clock, ChevronDown, ChevronUp,
  Zap, Image as ImageIcon, X,
} from "lucide-react";
import api from "../../services/api";
import Sidebar, { useSidebar, MobileMenuButton } from "../../components/common/Sidebar";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "").replace(/\/$/, "");
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "";

const QUICK_REPLIES = [
  "Thank you for your kind words! We're glad you had a great experience. 🙏",
  "We appreciate your feedback and will work to improve. Sorry for the inconvenience.",
  "Thanks for visiting! We hope to see you again soon. 😊",
  "We value your review and take all feedback seriously. Thank you!",
  "Your satisfaction is our priority. Thank you for sharing your experience!",
  "We're sorry to hear that. Please contact us so we can make it right.",
];

const FILTERS = ["All","Pending","Replied","5★","4★","3★","2★","1★"];

const STAR_COLORS = {
  5:{ bg:"#F0FDF4", color:"#16A34A", border:"#BBF7D0" },
  4:{ bg:"#F7FEE7", color:"#65A30D", border:"#D9F99D" },
  3:{ bg:"#FEFCE8", color:"#CA8A04", border:"#FEF08A" },
  2:{ bg:"#FFF7ED", color:"#EA580C", border:"#FED7AA" },
  1:{ bg:"#FEF2F2", color:"#DC2626", border:"#FECACA" },
};

const Stars = ({ rating, size=12 }) => (
  <div style={{ display:"flex", gap:1 }}>
    {[1,2,3,4,5].map(s => <Star key={s} size={size} style={{ color: s<=rating?"#FBBF24":"#E5E7EB", fill: s<=rating?"#FBBF24":"#E5E7EB" }} />)}
  </div>
);

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count/total)*100) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <span style={{ fontSize:11, color:"#6B7280", width:12, textAlign:"right", flexShrink:0 }}>{star}</span>
      <Star size={9} style={{ color:"#FBBF24", fill:"#FBBF24", flexShrink:0 }} />
      <div style={{ flex:1, height:6, background:"#F3F4F6", borderRadius:100, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:100, width:`${pct}%`, background: star>=4?"#22C55E":star===3?"#EAB308":"#EF4444", transition:"width 0.6s" }} />
      </div>
      <span style={{ fontSize:10, color:"#9CA3AF", width:16, textAlign:"right", flexShrink:0 }}>{count}</span>
    </div>
  );
};

const Lightbox = ({ url, onClose }) => (
  <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
    <button style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", cursor:"pointer" }}><X size={18}/></button>
    <img src={url} alt="Review" style={{ maxWidth:"100%", maxHeight:"85vh", borderRadius:14, objectFit:"contain" }} onClick={e => e.stopPropagation()} />
  </div>
);

/* ── Review Card ── */
const ReviewCard = ({ review, onReplySubmit, submitting }) => {
  const [expanded,  setExpanded]  = useState(false);
  const [replyText, setReplyText] = useState("");
  const [lightbox,  setLightbox]  = useState(null);

  const existingReply = review.ownerReply?.text || "";
  const hasReply      = review.replied || !!existingReply;
  const initials      = review.user?.name ? review.user.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "?";
  const sc            = STAR_COLORS[review.rating] ?? STAR_COLORS[3];
  const text          = review.text ?? review.body ?? review.comment ?? "";

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    await onReplySubmit(review._id, replyText);
    setExpanded(false); setReplyText("");
  };

  return (
    <>
      {lightbox && <Lightbox url={lightbox} onClose={() => setLightbox(null)} />}
      <div style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${hasReply ? "#F1F5F9" : "#FDE68A"}`, fontFamily:"'DM Sans',sans-serif", overflow:"hidden" }}>
        <div style={{ padding:"14px 14px" }}>
          {/* Top */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:11, background:"linear-gradient(135deg,#22c55e,#0d9488)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>{initials}</div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{review.user?.name ?? "Anonymous"}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{review.rating}★</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                  <Stars rating={review.rating} size={10} />
                  <Clock size={9} style={{ color:"#9CA3AF", marginLeft:5 }} />
                  <span style={{ fontSize:10, color:"#9CA3AF" }}>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:100, border:"1.5px solid", flexShrink:0, background: hasReply?"#F0FDF4":"#FFFBEB", color: hasReply?"#16A34A":"#D97706", borderColor: hasReply?"#BBF7D0":"#FDE68A", display:"flex", alignItems:"center", gap:4 }}>
              {hasReply ? <><CheckCircle2 size={10}/>Replied</> : <><MessageSquare size={10}/>Pending</>}
            </span>
          </div>

          {/* Text */}
          <p style={{ fontSize:12, color:"#374151", lineHeight:1.6, margin:0 }}>{text || <span style={{ fontStyle:"italic", color:"#9CA3AF" }}>No comment provided.</span>}</p>

          {/* Photos */}
          {review.photos?.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
              {review.photos.map((p, i) => {
                const url = getImageUrl(p);
                return url ? (
                  <button key={i} onClick={() => setLightbox(url)} style={{ width:56, height:56, borderRadius:10, overflow:"hidden", border:"1.5px solid #E5E7EB", cursor:"pointer", background:"#F3F4F6", flexShrink:0 }}>
                    <img src={url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => e.target.parentElement.style.display="none"} />
                  </button>
                ) : null;
              })}
            </div>
          )}

          {/* Existing reply */}
          {existingReply && (
            <div style={{ marginTop:10, background:"#F0FDF4", border:"1.5px solid #BBF7D0", borderRadius:12, padding:"10px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                <Reply size={11} style={{ color:"#16A34A" }} />
                <span style={{ fontSize:11, fontWeight:700, color:"#15803D" }}>Your Reply</span>
                {review.ownerReply?.repliedAt && <span style={{ fontSize:10, color:"#4ADE80", marginLeft:"auto" }}>{formatDate(review.ownerReply.repliedAt)}</span>}
              </div>
              <p style={{ fontSize:11, color:"#166534", lineHeight:1.5, margin:0 }}>{existingReply}</p>
            </div>
          )}

          {/* Reply button */}
          <div style={{ marginTop:12 }}>
            <button onClick={() => setExpanded(e => !e)} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"8px 14px", borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit",
              background: hasReply ? "#F8FAFC" : "#16A34A",
              color:      hasReply ? "#374151"  : "#fff",
              border:     hasReply ? "1.5px solid #E5E7EB" : "none",
              transition:"all 0.15s",
            }}>
              <Reply size={13}/>{hasReply ? "Edit reply" : "Reply to Review"}
              {expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
            </button>
          </div>

          {/* Reply form */}
          {expanded && (
            <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
                  <Zap size={11} style={{ color:"#EAB308" }} /> Quick Replies
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {QUICK_REPLIES.map((q, i) => (
                    <button key={i} onClick={() => setReplyText(q)} style={{
                      textAlign:"left", padding:"9px 12px", borderRadius:10, cursor:"pointer", fontSize:11, fontFamily:"inherit",
                      border:`1.5px solid ${replyText===q ? "#BBF7D0" : "#E5E7EB"}`,
                      background: replyText===q ? "#F0FDF4" : "#F8FAFC",
                      color:      replyText===q ? "#166534" : "#374151",
                      lineHeight:1.4,
                    }}>{q}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:"#6B7280", marginBottom:6 }}>Custom reply</p>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your response…" rows={3} maxLength={500}
                  style={{ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 12px", fontSize:12, fontFamily:"inherit", outline:"none", resize:"none", boxSizing:"border-box" }} />
                <p style={{ fontSize:10, color:"#9CA3AF", textAlign:"right", marginTop:2 }}>{replyText.length}/500</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={handleSubmit} disabled={!replyText.trim()||submitting} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", borderRadius:11, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit", background: (!replyText.trim()||submitting) ? "#86EFAC" : "#16A34A", color:"#fff" }}>
                  {submitting ? <svg style={{animation:"spin 0.8s linear infinite",width:13,height:13}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : <Reply size={13}/>}
                  {submitting ? "Sending…" : "Send Reply"}
                </button>
                <button onClick={() => { setExpanded(false); setReplyText(""); }} style={{ padding:"11px 16px", borderRadius:11, border:"1.5px solid #E5E7EB", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"#6B7280" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ── Main Page ── */
const ReviewsPage = () => {
  const { collapsed, mobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();
  const [shop,       setShop]       = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("All");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const shopRes  = await api.get("/shops/me");
        const shopData = shopRes?.data?.data ?? shopRes?.data ?? {};
        setShop(shopData);
        const shopId = shopData._id;
        if (!shopId) throw new Error("Could not get shop ID");
        const reviewRes = await api.get(`/shops/${shopId}/reviews`, { params:{ limit:1000, sort:"newest" } });
        setReviews(Array.isArray(reviewRes?.data?.reviews) ? reviewRes.data.reviews : []);
      } catch(e){ setError(e?.response?.data?.message ?? e?.message ?? "Failed to load reviews"); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleReplySubmit = async (reviewId, text) => {
    setSubmitting(true);
    try {
      await api.post(`/shops/${shop._id}/reviews/${reviewId}/reply`, { text });
      setReviews(prev => prev.map(r => r._id===reviewId ? { ...r, replied:true, ownerReply:{ text, repliedAt:new Date().toISOString() } } : r));
    } catch(e){ console.error("Reply error:", e); }
    finally { setSubmitting(false); }
  };

  const filtered = reviews.filter(r => {
    const name    = r.user?.name ?? "";
    const comment = r.text ?? r.body ?? r.comment ?? "";
    const ok      = !search || name.toLowerCase().includes(search.toLowerCase()) || comment.toLowerCase().includes(search.toLowerCase());
    const hasReply = r.replied || !!r.ownerReply?.text;
    const fok = filter==="All" ? true : filter==="Pending" ? !hasReply : filter==="Replied" ? hasReply : r.rating===parseInt(filter);
    return ok && fok;
  });

  const pending    = reviews.filter(r => !r.replied && !r.ownerReply?.text).length;
  const replied    = reviews.filter(r =>  r.replied || !!r.ownerReply?.text).length;
  const totalCount = shop?.reviewCount ?? reviews.length;
  const avgRating  = shop?.avgRating ? Number(shop.avgRating).toFixed(1) : reviews.length > 0 ? (reviews.reduce((s,r) => s+r.rating, 0)/reviews.length).toFixed(1) : "—";
  const distribution = [5,4,3,2,1].map(star => ({ star, count:reviews.filter(r => r.rating===star).length }));

  return (
    <div style={{ display:"flex", height:"100vh", background:"#F8F9FB", overflow:"hidden", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}} .rp-search:focus{outline:none;border-color:#86EFAC!important;}`}</style>

      <Sidebar role="shop_owner" collapsed={collapsed} onCollapse={toggleCollapse} mobileOpen={mobileOpen} onMobileClose={closeMobile} shopStats={{ rating:shop?.avgRating, reviewCount:shop?.reviewCount }} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        {/* Header */}
        <header style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <MobileMenuButton onClick={openMobile} role="shop_owner" />
            <div>
              <h1 style={{ fontSize:17, fontWeight:800, color:"#0F172A", margin:0 }}>Reviews</h1>
              <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>{totalCount} total · {pending} pending · {replied} replied</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#FFFBEB", border:"1.5px solid #FDE68A", padding:"6px 12px", borderRadius:12, flexShrink:0 }}>
            <Star size={13} style={{ color:"#EAB308", fill:"#EAB308" }} />
            <span style={{ fontSize:13, fontWeight:800, color:"#CA8A04" }}>{avgRating}</span>
          </div>
        </header>

        {/* Stats bar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"10px 16px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          {[{label:"Total",value:totalCount,color:"#0F172A"},{label:"Pending",value:pending,color:"#D97706"},{label:"Replied",value:replied,color:"#16A34A"}].map(s => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</span>
              <span style={{ fontSize:11, color:"#9CA3AF" }}>{s.label}</span>
            </div>
          ))}
          {pending > 0 && (
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, color:"#D97706", background:"#FFFBEB", border:"1.5px solid #FDE68A", padding:"5px 10px", borderRadius:100 }}>
              <MessageSquare size={11}/>{pending} waiting
            </div>
          )}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 40px", display:"flex", flexDirection:"column", gap:14 }}>

          {error && (
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 14px", color:"#DC2626", fontSize:12 }}>
              <X size={14}/>{error}
            </div>
          )}

          {/* Rating overview */}
          {!loading && reviews.length > 0 && (
            <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px 14px", display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <span style={{ fontSize:"2.5rem", fontWeight:800, color:"#0F172A", lineHeight:1 }}>{avgRating}</span>
                <div style={{ display:"flex", justifyContent:"center", gap:2, margin:"6px 0 3px" }}>
                  <Stars rating={Math.round(Number(avgRating))} size={14} />
                </div>
                <span style={{ fontSize:11, color:"#9CA3AF" }}>{totalCount} review{totalCount!==1?"s":""}</span>
              </div>
              <div style={{ flex:1, minWidth:140, display:"flex", flexDirection:"column", gap:5 }}>
                {distribution.map(({ star, count }) => <RatingBar key={star} star={star} count={count} total={reviews.length} />)}
              </div>
            </div>
          )}

          {/* Search */}
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }} />
            <input className="rp-search" type="text" placeholder="Search by name or review…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", border:"1.5px solid #E5E7EB", borderRadius:12, padding:"10px 14px 10px 34px", fontSize:13, fontFamily:"inherit", background:"#F8FAFC", boxSizing:"border-box", color:"#374151", outline:"none" }} />
          </div>

          {/* Filter chips — horizontal scroll */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none" }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"6px 13px", borderRadius:9, fontSize:11, fontWeight:700, border:"none", cursor:"pointer", flexShrink:0, fontFamily:"inherit",
                background: filter===f ? "#16A34A" : "#F3F4F6",
                color:      filter===f ? "#fff"    : "#6B7280",
                transition:"all 0.15s",
              }}>{f}</button>
            ))}
          </div>

          {/* Review list */}
          {loading ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:160, gap:10 }}>
              <svg style={{animation:"spin 0.8s linear infinite",width:24,height:24,color:"#16A34A"}} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              <p style={{fontSize:12,color:"#9CA3AF"}}>Loading reviews…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:160, textAlign:"center" }}>
              <MessageSquare size={28} style={{ color:"#E5E7EB", marginBottom:8 }} />
              <p style={{ fontSize:13, fontWeight:600, color:"#6B7280", margin:0 }}>{reviews.length===0 ? "No reviews yet" : "No reviews match"}</p>
              <p style={{ fontSize:11, color:"#9CA3AF", marginTop:3 }}>{reviews.length===0 ? "Customer reviews appear here" : "Try a different filter"}</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {filtered.map(review => <ReviewCard key={review._id} review={review} onReplySubmit={handleReplySubmit} submitting={submitting} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;