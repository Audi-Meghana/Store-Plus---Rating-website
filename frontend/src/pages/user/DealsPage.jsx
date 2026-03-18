import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Star, Clock, ArrowUpRight, Zap, Search, X,
  Flame, Tag, Percent, IndianRupee, Gift, ShoppingBag,
  Layers, TrendingUp, Timer, Store
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const CATS = ["All","Restaurant","Cafe","Clothing","Electronics","Grocery","Pharmacy","Salon","Gym"];
const CAT_ICONS = {
  All:"✦", Restaurant:"🍽️", Cafe:"☕", Clothing:"👗",
  Electronics:"📱", Grocery:"🛒", Pharmacy:"💊", Salon:"✂️", Gym:"💪"
};

// ── same URL helper as StoreDetailPage ──────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const getImage = (deal) => {
  const s = deal?.shop;
  return (
    getImageUrl(s?.cover?.url) ||
    getImageUrl(s?.logo?.url)  ||
    getImageUrl(s?.gallery?.[0]?.url) ||
    null
  );
};

const getCity = (shop) => {
  const l = shop?.location;
  if (!l) return "";
  if (typeof l === "string") return l;
  return l.city || l.address || "";
};

const daysLeft = (expiry) => {
  if (!expiry) return null;
  const d = Math.ceil((new Date(expiry) - Date.now()) / 86400000);
  return d > 0 ? d : 0;
};

const hoursLeft = (expiry) => {
  if (!expiry) return null;
  const h = Math.ceil((new Date(expiry) - Date.now()) / 3600000);
  return h > 0 ? h : 0;
};

const DEAL_CFG = {
  "Discount %":  { icon: Percent,      bg:"#1D4ED8", soft:"#EFF6FF", textC:"#1D4ED8" },
  "Flat Off ₹":  { icon: IndianRupee,  bg:"#0E7490", soft:"#ECFEFF", textC:"#0E7490" },
  "Buy 1 Get 1": { icon: ShoppingBag,  bg:"#7C3AED", soft:"#F5F3FF", textC:"#6D28D9" },
  "Free Item":   { icon: Gift,         bg:"#BE185D", soft:"#FDF2F8", textC:"#BE185D" },
  "Combo Offer": { icon: Layers,       bg:"#B45309", soft:"#FFFBEB", textC:"#92400E" },
};

/* ── Image with fade-in + icon fallback ── */
const DealImage = ({ deal, className }) => {
  const src = getImage(deal);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded]  = useState(false);
  const cfg = DEAL_CFG[deal?.type] || DEAL_CFG["Discount %"];
  const Icon = cfg.icon;

  useEffect(() => { setFailed(false); setLoaded(false); }, [src]);

  if (!src || failed) {
    return (
      <div className={`dp-img-fb ${className || ""}`} style={{ background: `${cfg.bg}18` }}>
        <div className="dp-img-fb-icon" style={{ background: cfg.bg }}>
          <Icon size={22} color="#fff" />
        </div>
      </div>
    );
  }
  return (
    /* dp-img-wrap is position:absolute inset:0 — fills dp-imgcol completely */
    <div className={`dp-img-wrap ${className || ""}`}>
      {!loaded && <div className="dp-shimmer" />}
      <img
        src={src}
        alt={deal?.shop?.name || "Deal image"}
        className={loaded ? "loaded" : ""}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Clash+Display:wght@500;600;700&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --ink:#0A1628; --navy:#0F1E3D; --blue:#1D4ED8; --b2:#2563EB; --b3:#3B82F6;
  --pale:#EFF6FF; --bg:#ECF1F9; --card:#fff; --bd:#DDE5F2; --bd2:#C8D5E8;
  --t1:#0A1628; --t2:#374151; --t3:#6B7280; --t4:#9CA3AF;
  --red:#DC2626; --orange:#EA580C; --green:#16A34A;
  --ease:cubic-bezier(.4,0,.2,1);
  --r:14px; --r2:20px;
}

.dp{ min-height:100vh; background:var(--bg); font-family:'Inter',sans-serif; color:var(--t1); -webkit-font-smoothing:antialiased; }

/* ══ HERO ══ */
.dp-hero{
  background:linear-gradient(150deg,#060E22 0%,#0C1B3E 50%,#142F6A 100%);
  padding:0 24px; position:relative; overflow:hidden;
}
.dp-hero::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:
    radial-gradient(ellipse 65% 75% at 95% 0%,  rgba(29,78,216,.25) 0%,transparent 55%),
    radial-gradient(ellipse 40% 50% at 0%  100%, rgba(14,30,62,.9)   0%,transparent 55%);
}
.dp-hero::after{
  content:''; position:absolute; inset:0; pointer-events:none;
  background-image: radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px);
  background-size:32px 32px;
}
.dp-hero-inner{
  max-width:1100px; margin:0 auto;
  display:grid; grid-template-columns:1fr 340px;
  align-items:center; gap:40px;
  padding:52px 0 84px; position:relative; z-index:1;
}
.dp-eyebrow{
  display:inline-flex; align-items:center; gap:6px;
  border:1px solid rgba(59,130,246,.38); background:rgba(59,130,246,.1);
  border-radius:100px; padding:5px 14px;
  font-size:10.5px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase;
  color:#93C5FD; margin-bottom:18px;
}
.dp-hero h1{
  font-size:clamp(1.9rem,4vw,2.9rem); font-weight:800;
  color:#fff; line-height:1.12; letter-spacing:-1px; margin-bottom:12px;
}
.dp-hero h1 em{ font-style:italic; color:#93C5FD; font-weight:700; }
.dp-hero-sub{ font-size:14px; color:rgba(255,255,255,.4); line-height:1.75; max-width:420px; }
.dp-search{
  display:flex; align-items:center; gap:9px;
  background:rgba(255,255,255,.07); border:1.5px solid rgba(255,255,255,.1);
  border-radius:13px; padding:12px 16px; backdrop-filter:blur(14px);
  transition:border-color .2s; margin-bottom:12px;
}
.dp-search:focus-within{ border-color:rgba(96,165,250,.5); background:rgba(255,255,255,.1); }
.dp-search input{
  flex:1; border:none; outline:none; background:transparent;
  font-size:13.5px; font-family:'Inter',sans-serif; font-weight:500; color:#fff;
}
.dp-search input::placeholder{ color:rgba(255,255,255,.25); }
.dp-sx{
  display:flex; align-items:center; justify-content:center;
  width:20px; height:20px; border-radius:50%;
  background:rgba(255,255,255,.1); border:none; cursor:pointer;
  color:rgba(255,255,255,.4); padding:0; flex-shrink:0; transition:background .18s;
}
.dp-sx:hover{ background:rgba(255,255,255,.18); }
.dp-hpills{ display:flex; gap:7px; flex-wrap:wrap; }
.dp-hpill{
  display:flex; align-items:center; gap:5px;
  background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
  border-radius:100px; padding:5px 12px;
  font-size:11.5px; font-weight:600; color:rgba(255,255,255,.65); white-space:nowrap;
}
.dp-hpill strong{ color:#fff; }

/* ══ BODY ══ */
.dp-body{ max-width:1100px; margin:0 auto; padding:0 24px 80px; }

/* filter */
.dp-filter{
  background:var(--card); border:1.5px solid var(--bd);
  border-radius:var(--r2); padding:18px 22px;
  margin-top:-42px; position:relative; z-index:5;
  box-shadow:0 18px 56px rgba(10,22,40,.13);
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
}
.dp-flbl{ font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--t4); white-space:nowrap; flex-shrink:0; }
.dp-cats{ display:flex; gap:6px; flex-wrap:wrap; flex:1; }
.dp-pill{
  display:inline-flex; align-items:center; gap:5px;
  padding:7px 14px; border-radius:100px; font-size:12.5px; font-weight:600;
  border:1.5px solid var(--bd); cursor:pointer;
  transition:all .18s var(--ease); background:#F5F8FD;
  font-family:'Inter',sans-serif; white-space:nowrap; color:var(--t2);
}
.dp-pill.on{ background:var(--blue); color:#fff; border-color:var(--blue); box-shadow:0 4px 14px rgba(29,78,216,.25); }
.dp-pill:not(.on):hover{ border-color:var(--b3); color:var(--blue); background:var(--pale); }

/* results */
.dp-rbar{ display:flex; align-items:center; padding:22px 0 14px; }
.dp-rtxt{ font-size:13px; color:var(--t4); font-weight:500; }
.dp-rtxt strong{ color:var(--t2); font-weight:700; }

/* ══ LIST STYLE CARDS ══ */
.dp-list{ display:flex; flex-direction:column; gap:14px; }

/* ── BASE CARD ── */
.dp-card{
  background:var(--card);
  border:1.5px solid var(--bd);
  border-radius:var(--r2);
  overflow:hidden; cursor:pointer;
  display:grid;
  grid-template-columns:200px 1fr auto;
  min-height:148px;
  box-shadow:0 2px 8px rgba(10,22,40,.05);
  transition:transform .24s var(--ease), box-shadow .24s var(--ease), border-color .24s var(--ease);
  animation:dp-in .36s var(--ease) both;
  position:relative;
}
.dp-card:nth-child(1){animation-delay:.04s}
.dp-card:nth-child(2){animation-delay:.08s}
.dp-card:nth-child(3){animation-delay:.12s}
.dp-card:nth-child(4){animation-delay:.16s}
.dp-card:nth-child(5){animation-delay:.20s}
.dp-card:nth-child(6){animation-delay:.24s}

.dp-card:hover{
  transform:translateY(-3px);
  box-shadow:0 16px 48px rgba(10,22,40,.12);
  border-color:rgba(29,78,216,.2);
}

/* ── EXPIRY HIGHLIGHT — glowing border + warm bg when ≤2 days ── */
.dp-card.expiring{
  border-color:#FCA5A5;
  background:linear-gradient(135deg,#fff 60%,#FFF5F5 100%);
  box-shadow:0 0 0 3px rgba(220,38,38,.08), 0 4px 20px rgba(220,38,38,.1);
  animation:dp-in .36s var(--ease) both, dp-expiry-pulse 2.5s infinite 1s;
}
@keyframes dp-expiry-pulse{
  0%,100%{ box-shadow:0 0 0 3px rgba(220,38,38,.08), 0 4px 20px rgba(220,38,38,.1); }
  50%{ box-shadow:0 0 0 5px rgba(220,38,38,.16), 0 4px 28px rgba(220,38,38,.18); }
}
.dp-card.expiring:hover{
  box-shadow:0 0 0 3px rgba(220,38,38,.14), 0 18px 52px rgba(220,38,38,.18);
  border-color:#F87171;
}
/* red left accent strip for expiring */
.dp-card.expiring::before{
  content:''; position:absolute; left:0; top:0; bottom:0;
  width:4px; background:linear-gradient(180deg,#EF4444,#DC2626);
  border-radius:var(--r2) 0 0 var(--r2);
}

/* ── IMAGE COL ── */
.dp-imgcol{
  position:relative; overflow:hidden; flex-shrink:0;
  width:200px; min-width:200px; min-height:148px; background:#EEF2FA;
}
/* fill entire column */
.dp-img-wrap{ position:absolute; inset:0; background:#EEF2FA; }
.dp-img-wrap img{
  width:100%; height:100%; object-fit:cover; display:block;
  transition:transform .5s var(--ease), opacity .35s;
  filter:brightness(.9); opacity:0;
}
.dp-img-wrap img.loaded{ opacity:1; }
.dp-card:hover .dp-img-wrap img{ transform:scale(1.05); filter:brightness(1); }
.dp-img-fb{
  position:absolute; inset:0;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:8px;
}
.dp-img-fb-icon{
  width:44px; height:44px; border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 14px rgba(0,0,0,.18);
}
.dp-shimmer{
  position:absolute; inset:0; z-index:1; pointer-events:none;
  background:linear-gradient(90deg,#EEF2FA 25%,#E2EAF4 50%,#EEF2FA 75%);
  background-size:600px 100%;
  animation:dp-shim 1.5s infinite linear;
}
.dp-imgcol::after{
  content:''; position:absolute; inset:0; pointer-events:none; z-index:2;
  background:linear-gradient(to right, transparent 70%, rgba(255,255,255,.12) 100%);
}

/* value sticker on image */
.dp-sticker{
  position:absolute; top:12px; left:12px; z-index:2;
  border-radius:10px; padding:6px 10px;
  display:flex; flex-direction:column; align-items:center;
  box-shadow:0 4px 14px rgba(0,0,0,.25);
  min-width:50px;
}
.dp-sticker-big{ font-size:1.05rem; font-weight:800; color:#fff; line-height:1; letter-spacing:-.3px; }
.dp-sticker-sub{ font-size:8px; font-weight:700; color:rgba(255,255,255,.8); letter-spacing:.5px; text-transform:uppercase; margin-top:1px; }

/* ── MIDDLE COL ── */
.dp-mid{
  padding:16px 18px;
  display:flex; flex-direction:column; gap:8px;
  min-width:0;
}

/* animated tags row */
.dp-tags-row{ display:flex; align-items:center; gap:6px; flex-wrap:wrap; }

.dp-tag{
  display:inline-flex; align-items:center; gap:4px;
  border-radius:100px; padding:3px 10px;
  font-size:10.5px; font-weight:700; white-space:nowrap;
  letter-spacing:.1px;
}

/* 🔥 fire — ≤24h */
.dp-tag-fire{
  background:linear-gradient(90deg,#DC2626,#EF4444);
  color:#fff; box-shadow:0 2px 8px rgba(220,38,38,.4);
  animation:dp-fire 1.8s infinite;
}
@keyframes dp-fire{
  0%,100%{ box-shadow:0 2px 8px rgba(220,38,38,.35); }
  50%{ box-shadow:0 2px 14px rgba(220,38,38,.65); }
}

/* ⏱ urgent — ≤2 days — HIGHLIGHTED */
.dp-tag-hot{
  background:#FEF2F2; border:1.5px solid #FECACA;
  color:#DC2626; font-weight:800;
  animation:dp-shake 3s infinite 1.5s;
}
@keyframes dp-shake{
  0%,90%,100%{ transform:translateX(0); }
  92%{ transform:translateX(-2px); }
  94%{ transform:translateX(2px); }
  96%{ transform:translateX(-1px); }
}

/* 🕐 soon — ≤7 days */
.dp-tag-soon{
  background:#FFF7ED; border:1.5px solid #FED7AA; color:#92400E;
}

/* 💚 go buy */
.dp-tag-gobuy{
  background:linear-gradient(90deg,#15803D,#16A34A);
  color:#fff; box-shadow:0 2px 8px rgba(22,163,74,.28);
  animation:dp-bob 2.2s infinite;
}
@keyframes dp-bob{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-2px);} }

/* 🔵 live */
.dp-tag-live{
  background:var(--pale); border:1.5px solid #BFDBFE; color:var(--blue);
}

/* dot pulse */
.dp-dot{
  width:5px; height:5px; border-radius:50%; flex-shrink:0;
  animation:dp-dot 1.4s infinite;
}
.dp-dot-r{ background:#EF4444; }
.dp-dot-g{ background:#22C55E; }
.dp-dot-b{ background:#3B82F6; }
@keyframes dp-dot{ 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.4;transform:scale(.65);} }

/* type + category */
.dp-meta-row{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.dp-type-badge{
  display:inline-flex; align-items:center; gap:5px;
  border-radius:7px; padding:3px 9px;
  font-size:11px; font-weight:700;
}
.dp-cat-badge{
  background:#F1F5F9; color:var(--t3);
  font-size:10.5px; font-weight:600;
  border-radius:6px; padding:3px 8px;
}

/* title */
.dp-title{
  font-size:1rem; font-weight:700; color:var(--t1);
  line-height:1.35; letter-spacing:-.1px;
}
.dp-card.expiring .dp-title{ color:#991B1B; }

/* desc */
.dp-desc{
  font-size:12px; color:var(--t3); line-height:1.6;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}

/* foot meta */
.dp-fmeta{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:auto; }
.dp-fm{ display:flex; align-items:center; gap:3px; font-size:11px; color:var(--t4); font-weight:500; }
.dp-fm.red{ color:var(--red); font-weight:700; }

/* ── RIGHT COL ── */
.dp-right{
  padding:16px 20px 16px 12px;
  display:flex; flex-direction:column;
  align-items:flex-end; justify-content:space-between;
  flex-shrink:0; min-width:120px;
}

/* store avatar */
.dp-avatar{
  width:44px; height:44px; border-radius:12px;
  overflow:hidden; border:2px solid var(--bd);
  background:#EEF2FA; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.dp-avatar img{ width:100%; height:100%; object-fit:cover; }
.dp-avatar-fb{ display:flex; align-items:center; justify-content:center; }

.dp-store-name{ font-size:11px; font-weight:600; color:var(--t3); margin-top:4px; text-align:right; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.dp-rating{ display:flex; align-items:center; gap:3px; font-size:12px; font-weight:700; color:var(--t2); }

.dp-cta{
  display:flex; align-items:center; gap:5px;
  background:var(--blue); color:#fff;
  border-radius:10px; padding:8px 14px;
  font-size:12px; font-weight:700;
  transition:background .18s, transform .18s, gap .18s;
  white-space:nowrap;
}
.dp-card:hover .dp-cta{ background:#1E40AF; gap:7px; }
.dp-card.expiring .dp-cta{ background:var(--red); }
.dp-card.expiring:hover .dp-cta{ background:#B91C1C; }

/* expiry countdown for highlighted cards */
.dp-countdown{
  display:flex; align-items:center; gap:4px;
  background:#FEF2F2; border:1px solid #FECACA;
  border-radius:8px; padding:4px 10px;
  font-size:11px; font-weight:800; color:#DC2626;
  animation:dp-fire 1.8s infinite;
}

/* ── SKELETON ── */
.dp-skel{
  background:var(--card); border:1.5px solid var(--bd);
  border-radius:var(--r2); overflow:hidden;
  display:grid; grid-template-columns:200px 1fr; min-height:148px;
}
@keyframes dp-shim{ 0%{background-position:-700px 0;} 100%{background-position:700px 0;} }
.dp-skel-img{
  background:linear-gradient(90deg,#EEF2FA 25%,#E2EAF4 50%,#EEF2FA 75%);
  background-size:700px 100%; animation:dp-shim 1.6s infinite linear;
}
.dp-skel-body{ padding:16px 18px; display:flex; flex-direction:column; gap:10px; }
.dp-skel-ln{
  border-radius:6px;
  background:linear-gradient(90deg,#EEF2FA 25%,#E2EAF4 50%,#EEF2FA 75%);
  background-size:700px 100%; animation:dp-shim 1.6s infinite linear;
}

/* ── EMPTY ── */
.dp-empty{
  text-align:center; padding:80px 24px;
  background:var(--card); border-radius:var(--r2);
  border:1.5px solid var(--bd);
}
.dp-empty-ico{
  width:60px; height:60px; border-radius:16px;
  background:var(--pale); border:1.5px solid #DBEAFE;
  display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
}
.dp-empty h3{ font-size:1.15rem; font-weight:800; color:var(--t1); margin-bottom:8px; }
.dp-empty p{ font-size:13.5px; color:var(--t3); max-width:300px; margin:0 auto; line-height:1.65; }

/* ── ANIMATIONS ── */
@keyframes dp-in{ from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }

/* ── RESPONSIVE ── */
@media(max-width:680px){
  .dp-hero-inner{ grid-template-columns:1fr; gap:20px; padding:44px 0 72px; }
  .dp-hero h1{ font-size:1.75rem; }
  .dp-body{ padding:0 14px 60px; }
  .dp-filter{ padding:14px 16px; margin-top:-34px; border-radius:18px; }
  .dp-cats{ flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding-bottom:2px; }
  .dp-cats::-webkit-scrollbar{ display:none; }
  .dp-pill{ flex-shrink:0; }
  .dp-card{ grid-template-columns:130px 1fr; }
  .dp-imgcol{ width:130px; min-width:130px; }
  .dp-right{ display:none; }
}
@media(max-width:420px){
  .dp-card{ grid-template-columns:110px 1fr; min-height:130px; }
  .dp-imgcol{ width:110px; min-width:110px; }
  .dp-sticker{ padding:4px 8px; }
  .dp-sticker-big{ font-size:.9rem; }
}
@media(hover:none){ .dp-card:active{ transform:scale(.99); } }
`;

const SkeletonCard = () => (
  <div className="dp-skel">
    <div className="dp-skel-img" />
    <div className="dp-skel-body">
      <div className="dp-skel-ln" style={{height:10,width:"32%"}} />
      <div className="dp-skel-ln" style={{height:18,width:"75%"}} />
      <div className="dp-skel-ln" style={{height:11,width:"55%"}} />
      <div className="dp-skel-ln" style={{height:11,width:"40%"}} />
    </div>
  </div>
);

/* ── Store logo (right col) ── */
const StoreLogo = ({ shop }) => {
  const src = getImageUrl(shop?.logo?.url);
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div className="dp-avatar">
      <div className="dp-avatar-fb"><Store size={18} color="#9CA3AF" /></div>
    </div>
  );
  return (
    <div className="dp-avatar">
      <img src={src} alt={shop?.name} onError={() => setErr(true)} />
    </div>
  );
};

export default function DealsPage() {
  const navigate = useNavigate();
  const [cat,     setCat]     = useState("All");
  const [query,   setQuery]   = useState("");
  const [deals,   setDeals]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (cat !== "All") p.set("category", cat);
      const res = await api.get(`/deals/public?${p}`);
      setDeals(res?.data?.deals ?? res?.data?.data ?? []);
    } catch { setDeals([]); }
    finally  { setLoading(false); }
  }, [cat]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const filtered = deals.filter(d =>
    !query ||
    d.shop?.name?.toLowerCase().includes(query.toLowerCase()) ||
    d.title?.toLowerCase().includes(query.toLowerCase())
  );

  const storeCount  = [...new Set(deals.map(d => d.shop?._id).filter(Boolean))].length;
  const urgentCount = deals.filter(d => { const dl = daysLeft(d.expiry); return dl !== null && dl <= 2; }).length;

  return (
    <div className="dp">
      <style>{CSS}</style>
      <Navbar />

      {/* ── HERO ── */}
      <section className="dp-hero">
        <div className="dp-hero-inner">
          <div>
            <div className="dp-eyebrow"><Zap size={10} /> Live deals · store owners</div>
            <h1>Discover <em>Exclusive</em><br />Deals Near You</h1>
            <p className="dp-hero-sub">Real discounts from local stores. No spam. Updated daily.</p>
          </div>
          <div>
            <div className="dp-search">
              <Search size={14} color="rgba(255,255,255,.28)" style={{flexShrink:0}} />
              <input
                placeholder="Search deals or stores…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && <button className="dp-sx" onClick={() => setQuery("")}><X size={11} /></button>}
            </div>
            {!loading && deals.length > 0 && (
              <div className="dp-hpills">
                <div className="dp-hpill"><TrendingUp size={11} color="#60A5FA" /><strong>{deals.length}+</strong> deals</div>
                <div className="dp-hpill"><Star size={11} color="#FBBF24" /><strong>{storeCount}</strong> stores</div>
                {urgentCount > 0 && (
                  <div className="dp-hpill"><Flame size={11} color="#F87171" /><strong>{urgentCount}</strong> ending in 2d</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="dp-body">

        {/* Filter */}
        <div className="dp-filter">
          <span className="dp-flbl">Category</span>
          <div className="dp-cats">
            {CATS.map(c => (
              <button key={c} className={`dp-pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
                {CAT_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results bar */}
        {!loading && (
          <div className="dp-rbar">
            <p className="dp-rtxt">
              {filtered.length > 0
                ? <><strong>{filtered.length}</strong> deal{filtered.length !== 1 ? "s" : ""}{cat !== "All" ? ` in ${cat}` : ""}{query ? ` for "${query}"` : ""}</>
                : "No results"}
            </p>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="dp-list">{[1,2,3,4,5].map(n => <SkeletonCard key={n} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="dp-empty">
            <div className="dp-empty-ico"><Tag size={24} color="#93C5FD" /></div>
            <h3>No deals found</h3>
            <p>{deals.length === 0 ? "Store owners haven't posted any deals yet." : "Try a different search or category."}</p>
          </div>
        ) : (
          <div className="dp-list">
            {filtered.map(deal => {
              const cfg      = DEAL_CFG[deal.type] || DEAL_CFG["Discount %"];
              const DIcon    = cfg.icon;
              const dl       = daysLeft(deal.expiry);
              const hl       = hoursLeft(deal.expiry);
              const isExpiring = dl !== null && dl <= 2;   // ← highlight trigger
              const isUrgent   = dl !== null && dl <= 7;
              const v          = deal.value;

              let bigNum = "", sub = "";
              if      (deal.type === "Discount %" && v)  { bigNum = `${v}%`; sub = "OFF"; }
              else if (deal.type === "Flat Off ₹"  && v) { bigNum = `₹${v}`; sub = "OFF"; }
              else if (deal.type === "Buy 1 Get 1")       { bigNum = "B1G1"; }
              else if (deal.type === "Free Item")         { bigNum = "FREE"; }
              else if (deal.type === "Combo Offer")       { bigNum = "COMBO"; }

              /* pick the right animated tag */
              const urgencyTag = (() => {
                if (!deal.expiry) return <span className="dp-tag dp-tag-gobuy"><span className="dp-dot dp-dot-g"/>Go Buy Now</span>;
                if (hl <= 24)   return <span className="dp-tag dp-tag-fire"><span className="dp-dot dp-dot-r"/>🔥 Ends in {hl}h</span>;
                if (dl <= 2)    return <span className="dp-tag dp-tag-hot"><Flame size={10}/>Expires in {dl}d — Grab it!</span>;
                if (dl <= 7)    return <span className="dp-tag dp-tag-soon"><Clock size={10}/>{dl} days left</span>;
                return <span className="dp-tag dp-tag-gobuy"><span className="dp-dot dp-dot-g"/>Go Buy Now</span>;
              })();

              const liveTag = (
                <span className="dp-tag dp-tag-live"><span className="dp-dot dp-dot-b"/>Live</span>
              );

              return (
                <div
                  key={deal._id}
                  className={`dp-card${isExpiring ? " expiring" : ""}`}
                  onClick={() => navigate(`/store/${deal.shop?._id}`)}
                >
                  {/* ── IMAGE COL ── */}
                  <div className="dp-imgcol">
                    <DealImage deal={deal} />
                    {bigNum && (
                      <div className="dp-sticker" style={{background: cfg.bg}}>
                        <span className="dp-sticker-big">{bigNum}</span>
                        {sub && <span className="dp-sticker-sub">{sub}</span>}
                      </div>
                    )}
                  </div>

                  {/* ── MIDDLE COL ── */}
                  <div className="dp-mid">
                    {/* animated tags */}
                    <div className="dp-tags-row">
                      {urgencyTag}
                      {liveTag}
                    </div>

                    {/* type + category */}
                    <div className="dp-meta-row">
                      <span className="dp-type-badge" style={{background: cfg.soft, color: cfg.textC}}>
                        <DIcon size={11} /> {deal.type}
                      </span>
                      {deal.shop?.category && <span className="dp-cat-badge">{deal.shop.category}</span>}
                    </div>

                    <h3 className="dp-title">{deal.title}</h3>
                    {deal.description && <p className="dp-desc">{deal.description}</p>}

                    <div className="dp-fmeta">
                      {getCity(deal.shop) && (
                        <span className="dp-fm"><MapPin size={10}/>{getCity(deal.shop)}</span>
                      )}
                      <span className={`dp-fm${isExpiring ? " red" : ""}`}>
                        <Clock size={10}/>
                        {!deal.expiry ? "Ongoing"
                          : `Expires ${new Date(deal.expiry).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`}
                      </span>
                    </div>
                  </div>

                  {/* ── RIGHT COL ── */}
                  <div className="dp-right">
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <StoreLogo shop={deal.shop} />
                      <span className="dp-store-name">{deal.shop?.name}</span>
                      {deal.shop?.avgRating > 0 && (
                        <div className="dp-rating">
                          <Star size={12} style={{fill:"#FBBF24",color:"#FBBF24"}}/>
                          {Number(deal.shop.avgRating).toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                      {isExpiring && dl !== null && (
                        <div className="dp-countdown">
                          <Flame size={11}/> {dl === 0 ? "Last day!" : `${dl}d left`}
                        </div>
                      )}
                      <div className="dp-cta">
                        View <ArrowUpRight size={13}/>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}