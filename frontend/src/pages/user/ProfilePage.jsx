import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, MapPin, Edit3, LogOut, Heart, MessageSquare,
  Settings, Camera, ChevronRight, AlertCircle,
  User, Bell, Shield, Check, X, ToggleLeft, ToggleRight,
  Award, Calendar,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

/* ── Extract user from any response shape ── */
const extractUser = (res) => {
  const d = res?.data;
  // { success, user: {...} }
  if (d?.user && typeof d.user === "object") return d.user;
  // { success, data: { user: {...} } }
  if (d?.data?.user) return d.data.user;
  // { success, data: {...} }
  if (d?.data && typeof d.data === "object" && !Array.isArray(d.data)) return d.data;
  // bare object
  if (d && typeof d === "object" && !Array.isArray(d)) return d;
  return null;
};

/* ── Extract reviews array from any response shape ── */
const extractReviews = (res) => {
  const d = res?.data;
  if (Array.isArray(d))                return d;
  if (Array.isArray(d?.reviews))       return d.reviews;
  if (Array.isArray(d?.data?.reviews)) return d.data.reviews;
  if (Array.isArray(d?.data))          return d.data;
  return [];
};

/* ── Extract wishlist array from any response shape ── */
const extractWishlist = (res) => {
  const d = res?.data;
  if (Array.isArray(d))              return d;
  if (Array.isArray(d?.wishlist))    return d.wishlist;
  if (Array.isArray(d?.data))        return d.data;
  if (Array.isArray(d?.data?.shops)) return d.data.shops;
  return [];
};

const TABS = [
  { id:0, label:"Reviews",  icon:MessageSquare },
  { id:1, label:"Saved",    icon:Heart         },
  { id:2, label:"Settings", icon:Settings      },
];

const NOTIF_PREFS = [
  { key:"newReview",     label:"New review replies",  desc:"When someone replies to your review"  },
  { key:"replyReceived", label:"Reply received",       desc:"When a store owner responds"          },
  { key:"dealExpiry",    label:"Deal expiry alerts",   desc:"24h before a deal you saved expires"  },
  { key:"weeklyReport",  label:"Weekly digest",        desc:"Your weekly activity summary"         },
];

const Card = ({ children, style }) => (
  <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9", padding:20, ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, label, color="#16A34A" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
    <div style={{ width:34, height:34, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Icon size={16} style={{ color }} />
    </div>
    <h3 style={{ fontSize:14, fontWeight:800, color:"#0F172A", margin:0 }}>{label}</h3>
  </div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div style={{ textAlign:"center", padding:"48px 24px", background:"#F8FAFC", borderRadius:16, border:"1.5px solid #F1F5F9" }}>
    <Icon size={32} style={{ color:"#CBD5E1", marginBottom:12 }} />
    <p style={{ fontSize:14, fontWeight:700, color:"#94A3B8", margin:"0 0 4px" }}>{title}</p>
    <p style={{ fontSize:12, color:"#CBD5E1" }}>{sub}</p>
  </div>
);

const Toast = ({ message }) => (
  <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:"#16A34A", color:"#fff", borderRadius:12, padding:"11px 20px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8, zIndex:9999, boxShadow:"0 8px 24px rgba(22,163,74,0.3)", whiteSpace:"nowrap" }}>
    <Check size={14} /> {message}
  </div>
);

const Spinner = ({ color = "#16A34A" }) => (
  <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
    <svg style={{ animation:"spin 0.8s linear infinite", width:24, height:24 }} fill="none" viewBox="0 0 24 24">
      <circle style={{opacity:.2}} cx="12" cy="12" r="10" stroke={color} strokeWidth="4"/>
      <path style={{opacity:.8}} fill={color} d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  </div>
);

const Stars = ({ rating }) => (
  <div style={{ display:"flex", gap:2, marginBottom:8 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={13} style={{ color: i<=rating ? "#F59E0B" : "#E5E7EB", fill: i<=rating ? "#F59E0B" : "none" }}/>
    ))}
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [tab,     setTab]     = useState(0);
  const [editing, setEditing] = useState(false);

  const [profile,        setProfile]        = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError,   setProfileError]   = useState("");
  const [name,           setName]           = useState("");
  const [city,           setCity]           = useState("");
  const [saveLoading,    setSaveLoading]    = useState(false);
  const [saveError,      setSaveError]      = useState("");
  const [savedMsg,       setSavedMsg]       = useState(false);

  const [reviews,        setReviews]        = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError,   setReviewsError]   = useState("");

  const [wishlist,        setWishlist]        = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError,   setWishlistError]   = useState("");

  const [notifPrefs, setNotifPrefs] = useState({});

  useEffect(() => {
    // ── profile ──
    (async () => {
      try {
        setProfileLoading(true);
        const res  = await api.get("/users/me");
        const data = extractUser(res);
        if (!data) throw new Error("Empty response");
        setProfile(data);
        setName(data.name ?? "");
        setCity(data.city ?? "");
        setNotifPrefs(data.notifPrefs ?? {});
      } catch (e) {
        setProfileError(e.response?.data?.message ?? "Failed to load profile.");
      } finally { setProfileLoading(false); }
    })();

    // ── reviews ──
    (async () => {
      try {
        setReviewsLoading(true); setReviewsError("");
        const res = await api.get("/users/me/reviews");
        const arr = extractReviews(res);
        setReviews(arr);
      } catch (e) {
        setReviewsError(e.response?.data?.message ?? "Failed to load reviews.");
      } finally { setReviewsLoading(false); }
    })();

    // ── wishlist ──
    (async () => {
      try {
        setWishlistLoading(true); setWishlistError("");
        const res = await api.get("/users/me/wishlist");
        setWishlist(extractWishlist(res));
      } catch (e) {
        setWishlistError(e.response?.data?.message ?? "Failed to load saved stores.");
      } finally { setWishlistLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaveLoading(true); setSaveError("");
      const res     = await api.patch("/users/me", { name, city });
      const updated = extractUser(res);
      if (updated) {
        setProfile(updated);
        setName(updated.name ?? name);
        setCity(updated.city ?? city);
      }
      setEditing(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e) {
      setSaveError(e.response?.data?.message ?? "Failed to save changes.");
    } finally { setSaveLoading(false); }
  };

  const handleToggleWishlist = useCallback(async (shopId) => {
    try {
      await api.post(`/users/me/wishlist/${shopId}`);
      const res = await api.get("/users/me/wishlist");
      setWishlist(extractWishlist(res));
    } catch {}
  }, []);

  const handleSignOut = () => { logout(); navigate("/login"); };

  // Use name from profile, fallback to name state
  const displayName = profile?.name || name || "";
  const initials    = displayName.trim().split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase() || "U";
  const joinedDate  = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month:"long", year:"numeric" })
    : "";

  const inp = { width:"100%", border:"1.5px solid #E5E7EB", borderRadius:10, padding:"9px 13px", fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", color:"#0F172A", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", background:"#F8F9FB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {savedMsg && <Toast message="Profile updated successfully" />}
      <Navbar />

      <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 16px 60px" }}>

        {/* ── Profile Header ── */}
        {profileLoading ? <Spinner /> : profileError ? (
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13, marginBottom:20 }}>
            <AlertCircle size={15}/> {profileError}
          </div>
        ) : (
          <Card style={{ marginBottom:16, padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
              {/* Avatar */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#22c55e,#0d9488)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:26, fontWeight:800 }}>
                  {initials}
                </div>
                <button style={{ position:"absolute", bottom:-4, right:-4, width:26, height:26, borderRadius:9, background:"#16A34A", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <Camera size={12} style={{ color:"#fff" }}/>
                </button>
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <h1 style={{ fontSize:20, fontWeight:800, color:"#0F172A", margin:"0 0 2px" }}>
                  {displayName || "—"}
                </h1>
                <p style={{ fontSize:12, color:"#9CA3AF", margin:"0 0 6px" }}>{profile?.email}</p>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  {profile?.city && (
                    <span style={{ fontSize:12, color:"#64748B", display:"flex", alignItems:"center", gap:4 }}>
                      <MapPin size={11}/> {profile.city}
                    </span>
                  )}
                  {joinedDate && (
                    <span style={{ fontSize:12, color:"#64748B", display:"flex", alignItems:"center", gap:4 }}>
                      <Calendar size={11}/> Joined {joinedDate}
                    </span>
                  )}
                  <span style={{ fontSize:11, fontWeight:700, background:"#F0FDF4", color:"#16A34A", padding:"2px 10px", borderRadius:100 }}>
                    Member
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:20 }}>
              {[
                { label:"Reviews",      value: reviews.length,             color:"#16A34A", icon:MessageSquare },
                { label:"Helpful Votes",value: profile?.helpfulVotes ?? 0, color:"#F59E0B", icon:Award         },
                { label:"Saved Stores", value: wishlist.length,            color:"#EF4444", icon:Heart         },
              ].map(s => (
                <div key={s.label} style={{ background:"#F8FAFC", borderRadius:14, padding:"14px 12px", textAlign:"center", border:"1.5px solid #F1F5F9" }}>
                  <s.icon size={16} style={{ color:s.color, marginBottom:6 }} />
                  <p style={{ fontSize:20, fontWeight:800, color:"#0F172A", margin:0 }}>{s.value}</p>
                  <p style={{ fontSize:11, color:"#9CA3AF", margin:"2px 0 0" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Tabs ── */}
        <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9", marginBottom:16, overflow:"hidden" }}>
          <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(t => {
              const count = t.id === 0 ? reviews.length : t.id === 1 ? wishlist.length : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  display:"flex", alignItems:"center", gap:6, padding:"13px 20px",
                  fontSize:13, fontWeight:700, border:"none", cursor:"pointer",
                  background:"transparent", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap",
                  borderBottom:`2px solid ${tab===t.id ? "#16A34A" : "transparent"}`,
                  color: tab===t.id ? "#16A34A" : "#9CA3AF",
                  transition:"all 0.2s",
                }}>
                  <t.icon size={13}/>{t.label}
                  {count > 0 && (
                    <span style={{ fontSize:10, fontWeight:700, background: tab===t.id ? "#F0FDF4" : "#F1F5F9", color: tab===t.id ? "#16A34A" : "#9CA3AF", borderRadius:100, padding:"1px 7px", marginLeft:2 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Reviews Tab ── */}
        {tab === 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {reviewsLoading ? <Spinner /> : reviewsError ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13 }}>
                <AlertCircle size={14}/> {reviewsError}
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No reviews yet" sub="Stores you've reviewed will appear here" />
            ) : reviews.map(rev => {
              const shopName   = rev.shop?.name ?? "Store";
              const shopId     = rev.shop?._id ?? rev.shop;
              const stars      = Math.round(rev.rating ?? 0);
              const reviewText = rev.text ?? rev.comment ?? "";
              return (
                <Card key={rev._id ?? rev.id}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <button onClick={() => navigate(`/store/${shopId}`)}
                      style={{ fontSize:13, fontWeight:700, color:"#16A34A", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4, padding:0 }}>
                      {shopName} <ChevronRight size={12}/>
                    </button>
                    <span style={{ fontSize:11, color:"#CBD5E1" }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : ""}
                    </span>
                  </div>

                  <Stars rating={stars} />

                  {reviewText ? (
                    <p style={{ fontSize:13, color:"#374151", lineHeight:1.6, margin:0 }}>{reviewText}</p>
                  ) : (
                    <p style={{ fontSize:13, color:"#CBD5E1", fontStyle:"italic", margin:0 }}>No written review</p>
                  )}

                  {/* Aspects */}
                  {rev.aspects && Object.keys(rev.aspects).length > 0 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                      {Object.entries(rev.aspects).map(([k, v]) => v > 0 && (
                        <span key={k} style={{ fontSize:11, fontWeight:600, background:"#F8FAFC", color:"#64748B", border:"1.5px solid #F1F5F9", borderRadius:8, padding:"2px 10px" }}>
                          {k}: {v}★
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Owner reply */}
                  {rev.ownerReply?.text && (
                    <div style={{ marginTop:12, background:"#F0FDF4", borderRadius:10, padding:"10px 12px", borderLeft:"3px solid #16A34A" }}>
                      <p style={{ fontSize:11, fontWeight:700, color:"#16A34A", margin:"0 0 3px" }}>Owner replied</p>
                      <p style={{ fontSize:12, color:"#374151", margin:0, lineHeight:1.5 }}>{rev.ownerReply.text}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Saved Tab ── */}
        {tab === 1 && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {wishlistLoading ? <Spinner /> : wishlistError ? (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:12, padding:"12px 16px", color:"#DC2626", fontSize:13 }}>
                <AlertCircle size={14}/> {wishlistError}
              </div>
            ) : wishlist.length === 0 ? (
              <EmptyState icon={Heart} title="Nothing saved yet" sub="Stores you save will appear here" />
            ) : wishlist.map(store => {
              const id       = store._id ?? store.id;
              const shopName = store.name ?? store.shopId?.name;
              const category = store.category ?? store.shopId?.category;
              const location = store.city ?? store.location?.city ?? store.shopId?.city;
              const rating   = store.avgRating ?? store.averageRating ?? store.rating;
              const imgUrl   = store.cover?.url ?? store.logo?.url;
              return (
                <Card key={id} style={{ padding:14, cursor:"pointer" }} onClick={() => navigate(`/store/${id}`)}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:48, height:48, borderRadius:13, overflow:"hidden", background:"#F0FDF4", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {imgUrl
                        ? <img src={imgUrl} alt={shopName} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none";}}/>
                        : <Heart size={18} style={{ color:"#16A34A" }}/>
                      }
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#0F172A", margin:0 }}>{shopName}</p>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4, flexWrap:"wrap" }}>
                        {category && <span style={{ fontSize:11, fontWeight:600, background:"#F0FDF4", color:"#16A34A", padding:"1px 8px", borderRadius:6 }}>{category}</span>}
                        {location && <span style={{ fontSize:11, color:"#9CA3AF", display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{location}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      {rating != null && (
                        <span style={{ fontSize:13, fontWeight:700, color:"#0F172A", display:"flex", alignItems:"center", gap:3 }}>
                          <Star size={12} style={{ fill:"#F59E0B", color:"#F59E0B" }}/>{Number(rating).toFixed(1)}
                        </span>
                      )}
                      <button style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}
                        onClick={e => { e.stopPropagation(); handleToggleWishlist(id); }}>
                        <Heart size={15} style={{ fill:"#EF4444", color:"#EF4444" }}/>
                      </button>
                      <ChevronRight size={14} style={{ color:"#CBD5E1" }}/>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Settings Tab ── */}
        {tab === 2 && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            <Card>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <SectionTitle icon={User} label="Personal Info" />
                <button onClick={() => { setEditing(e=>!e); setSaveError(""); }}
                  style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, color: editing ? "#EF4444" : "#16A34A", background:"none", border:`1.5px solid ${editing ? "#FECACA" : "#BBF7D0"}`, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                  {editing ? <><X size={12}/>Cancel</> : <><Edit3 size={12}/>Edit</>}
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { label:"Full Name",    value:name,           setter:setName, editable:true  },
                  { label:"Email",        value:profile?.email, setter:null,    editable:false },
                  { label:"City",         value:city,           setter:setCity, editable:true  },
                  { label:"Member Since", value:joinedDate,     setter:null,    editable:false },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{f.label}</label>
                    {editing && f.editable ? (
                      <input value={f.value ?? ""} onChange={e => f.setter(e.target.value)} style={inp} />
                    ) : (
                      <p style={{ fontSize:13, color: f.editable ? "#0F172A" : "#9CA3AF", fontWeight:500, margin:0 }}>{f.value || "—"}</p>
                    )}
                  </div>
                ))}
              </div>
              {saveError && (
                <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:10, padding:"10px 14px", color:"#DC2626", fontSize:12 }}>
                  <AlertCircle size={13}/> {saveError}
                </div>
              )}
              {editing && (
                <button onClick={handleSave} disabled={saveLoading}
                  style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"center", gap:7, background: saveLoading ? "#86EFAC" : "#16A34A", color:"#fff", border:"none", borderRadius:10, padding:"11px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", width:"100%" }}>
                  {saveLoading
                    ? <><svg style={{ animation:"spin 0.8s linear infinite", width:13, height:13 }} fill="none" viewBox="0 0 24 24"><circle style={{opacity:.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
                    : <><Check size={13}/>Save Changes</>}
                </button>
              )}
            </Card>

            <Card>
              <SectionTitle icon={Bell} label="Notifications" color="#8B5CF6" />
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {NOTIF_PREFS.map(pref => {
                  const isOn = notifPrefs[pref.key] !== false;
                  return (
                    <div key={pref.key} onClick={() => setNotifPrefs(p => ({ ...p, [pref.key]: !isOn }))}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 12px", background:"#F8FAFC", borderRadius:12, cursor:"pointer" }}>
                      <div>
                        <p style={{ fontSize:12, fontWeight:700, color:"#0F172A", margin:0 }}>{pref.label}</p>
                        <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>{pref.desc}</p>
                      </div>
                      <div style={{ color: isOn ? "#16A34A" : "#9CA3AF", flexShrink:0 }}>
                        {isOn ? <ToggleRight size={26}/> : <ToggleLeft size={26}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionTitle icon={Shield} label="Security" color="#F59E0B" />
              <button onClick={() => navigate("/forgot-password")}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#F8FAFC", border:"1.5px solid #F1F5F9", borderRadius:12, padding:"12px 14px", cursor:"pointer", fontFamily:"inherit" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Change Password</span>
                <ChevronRight size={14} style={{ color:"#9CA3AF" }}/>
              </button>
            </Card>

            <button onClick={handleSignOut}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:14, padding:"14px", fontSize:13, fontWeight:700, color:"#DC2626", cursor:"pointer", fontFamily:"inherit" }}>
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;