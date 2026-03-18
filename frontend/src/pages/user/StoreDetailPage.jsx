import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Phone, Globe, Clock, Heart, Share2,
  ChevronLeft, Camera, Tag, CheckCircle, MessageSquare,
  ArrowRight, Loader2, AlertCircle, Navigation, Sparkles,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import ReviewList from "../../components/reviews/ReviewList";
import api from "../../services/api";

// ── URL helper ────────────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const FALLBACK = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";

const safeArray = (res, ...keys) => {
  const root = res?.data ?? res;
  const inner = root?.data ?? root;
  for (const k of keys) {
    if (Array.isArray(inner?.[k])) return inner[k];
    if (Array.isArray(root?.[k])) return root[k];
  }
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(root)) return root;
  return [];
};

const safeObj = (res) => {
  const root = res?.data ?? res;
  const inner = root?.data ?? root;
  if (inner && !Array.isArray(inner) && typeof inner === "object") return inner;
  if (root && !Array.isArray(root) && typeof root === "object") return root;
  return null;
};

const getShopImage = (shop) =>
  getImageUrl(shop?.cover?.url) ||
  getImageUrl(shop?.logo?.url) ||
  getImageUrl(shop?.gallery?.[0]?.url) ||
  FALLBACK;

// ── Sub-components ────────────────────────────────────────────────────────────
const Stars = ({ rating, size = 15 }) => (
  <span style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} style={{
        color: s <= Math.round(rating) ? "#FBBF24" : "#E2E8F0",
        fill: s <= Math.round(rating) ? "#FBBF24" : "none",
        flexShrink: 0,
      }} />
    ))}
  </span>
);

const Spinner = ({ fullPage = false }) => (
  <div style={{ minHeight: fullPage ? "100vh" : 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
    <style>{`@keyframes sdp-spin{to{transform:rotate(360deg)}}`}</style>
    <Loader2 size={30} style={{ color: "#1D4ED8", animation: "sdp-spin 0.8s linear infinite" }} />
    <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>Loading…</p>
  </div>
);

const ErrorMsg = ({ msg }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 14, padding: "14px 18px", color: "#DC2626", fontSize: 13, fontWeight: 500 }}>
    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {msg}
  </div>
);

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --navy:  #0A1628;
  --navy2: #0F1E3D;
  --blue:  #1D4ED8;
  --b2:    #2563EB;
  --b3:    #3B82F6;
  --pale:  #EFF6FF;
  --bg:    #EEF2F9;
  --card:  #FFFFFF;
  --bd:    #E2E8F2;
  --t1:    #0A1628;
  --t2:    #374151;
  --t3:    #6B7280;
  --t4:    #9CA3AF;
  --green: #059669;
  --red:   #DC2626;
  --gold:  #F59E0B;
  --ease:  cubic-bezier(.4,0,.2,1);
  --r:     16px;
  --r2:    22px;
  --sh:    0 2px 12px rgba(10,22,40,.07);
  --sh2:   0 8px 32px rgba(10,22,40,.11);
  --sh3:   0 20px 60px rgba(10,22,40,.14);
}

.sdp-root{
  min-height:100vh;
  background:var(--bg);
  font-family:'Plus Jakarta Sans',sans-serif;
  color:var(--t1);
  -webkit-font-smoothing:antialiased;
}

/* ── HERO BANNER — clean animated dark navy, no bg image ── */
.sdp-hero{
  position:relative;
  height:260px;
  overflow:hidden;
  background: #0A1628;
}

/* base deep gradient */
.sdp-hero-bg{
  position:absolute; inset:0; z-index:0;
  background:linear-gradient(135deg,#060D1E 0%,#0B1A3A 45%,#0F2255 100%);
}

/* animated glow orbs */
.sdp-hero-orb1{
  position:absolute; z-index:1; pointer-events:none;
  width:480px; height:480px; border-radius:50%;
  background:radial-gradient(circle,rgba(37,99,235,.28) 0%,transparent 65%);
  top:-160px; right:-100px;
  animation:sdp-o1 9s ease-in-out infinite alternate;
}
.sdp-hero-orb2{
  position:absolute; z-index:1; pointer-events:none;
  width:320px; height:320px; border-radius:50%;
  background:radial-gradient(circle,rgba(29,78,216,.18) 0%,transparent 65%);
  bottom:-100px; left:-60px;
  animation:sdp-o2 11s ease-in-out infinite alternate;
}
.sdp-hero-orb3{
  position:absolute; z-index:1; pointer-events:none;
  width:180px; height:180px; border-radius:50%;
  background:radial-gradient(circle,rgba(96,165,250,.14) 0%,transparent 65%);
  top:30%; left:35%;
  animation:sdp-o3 7s ease-in-out infinite alternate;
}

/* moving dot grid */
.sdp-hero-grid{
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px);
  background-size:28px 28px;
  animation:sdp-grid 25s linear infinite;
}
/* shimmering horizontal scan line */
.sdp-hero-scan{
  position:absolute; left:0; right:0; z-index:3;
  height:1px;
  background:linear-gradient(to right,transparent,rgba(59,130,246,.5),transparent);
  animation:sdp-scan 4s ease-in-out infinite;
}

@keyframes sdp-o1{
  0%{ transform:translate(0,0) scale(1); }
  100%{ transform:translate(-35px,25px) scale(1.18); }
}
@keyframes sdp-o2{
  0%{ transform:translate(0,0) scale(1); }
  100%{ transform:translate(28px,-38px) scale(1.22); }
}
@keyframes sdp-o3{
  0%{ transform:translate(0,0); }
  100%{ transform:translate(18px,-18px); }
}
@keyframes sdp-grid{
  0%{ background-position:0 0; }
  100%{ background-position:28px 28px; }
}
@keyframes sdp-scan{
  0%{ top:-2px; opacity:0; }
  10%{ opacity:1; }
  90%{ opacity:.6; }
  100%{ top:102%; opacity:0; }
}

/* content layer */
.sdp-hero-content{
  position:absolute; inset:0; z-index:5;
  display:flex; flex-direction:column;
  justify-content:space-between;
  padding:18px 24px 22px;
}

/* top row: back + actions */
.sdp-hero-toprow{
  display:flex; align-items:center; justify-content:space-between;
}

/* back btn */
.sdp-back{
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(255,255,255,.08);
  backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.14);
  border-radius:100px; padding:7px 16px;
  font-size:13px; font-weight:600; color:rgba(255,255,255,.85);
  cursor:pointer; transition:background .18s;
  font-family:'Plus Jakarta Sans',sans-serif;
}
.sdp-back:hover{ background:rgba(255,255,255,.14); }

/* action btns */
.sdp-hero-actions{ display:flex; gap:8px; }
.sdp-ico-btn{
  width:38px; height:38px;
  background:rgba(255,255,255,.08);
  backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.13);
  border-radius:11px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .18s; color:rgba(255,255,255,.8);
}
.sdp-ico-btn:hover{ background:rgba(255,255,255,.15); }
.sdp-ico-btn.active{ background:rgba(239,68,68,.25); border-color:rgba(239,68,68,.45); }

/* bottom: store name + pills */
.sdp-hero-bottom{}
.sdp-hero-store-name{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:clamp(1.5rem,3.5vw,2.2rem);
  font-weight:800; color:#fff;
  line-height:1.1; letter-spacing:-.5px;
  margin-bottom:10px;
  /* text shimmer animation */
  background: linear-gradient(90deg,#fff 0%,#93C5FD 50%,#fff 100%);
  background-size:200% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:sdp-name-shine 4s linear infinite;
}
@keyframes sdp-name-shine{
  0%{ background-position:0% center; }
  100%{ background-position:200% center; }
}
.sdp-hero-pills{
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
}
.sdp-hero-pill{
  display:inline-flex; align-items:center; gap:5px;
  border-radius:100px; padding:5px 13px;
  font-size:11.5px; font-weight:700;
  backdrop-filter:blur(8px);
  border:1px solid;
}
.sdp-hp-rating{
  background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.15); color:#fff;
}
.sdp-hp-cat{
  background:rgba(29,78,216,.35); border-color:rgba(59,130,246,.4); color:#93C5FD;
}
.sdp-hp-open{
  background:rgba(5,150,105,.3); border-color:rgba(16,185,129,.4); color:#6EE7B7;
}
.sdp-hp-closed{
  background:rgba(220,38,38,.25); border-color:rgba(239,68,68,.35); color:#FCA5A5;
}
.sdp-hp-verified{
  background:rgba(5,150,105,.25); border-color:rgba(16,185,129,.35); color:#6EE7B7;
}
.sdp-hp-addr{
  background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.1); color:rgba(255,255,255,.6);
}

/* ── IDENTITY BAR (overlaps hero) ── */
.sdp-identity{
  position:relative; z-index:5;
  max-width:1160px; margin:-60px auto 0;
  padding:0 24px;
}
.sdp-identity-card{
  background:var(--card);
  border:1.5px solid var(--bd);
  border-radius:var(--r2);
  padding:24px 28px;
  box-shadow:var(--sh3);
  display:flex; align-items:flex-start;
  justify-content:space-between;
  gap:20px; flex-wrap:wrap;
}
.sdp-logo-wrap{
  width:68px; height:68px; border-radius:16px;
  overflow:hidden; border:2.5px solid var(--bd);
  background:var(--pale); flex-shrink:0;
}
.sdp-logo-wrap img{ width:100%; height:100%; object-fit:cover; display:block; }
.sdp-logo-fallback{
  width:100%; height:100%;
  display:flex; align-items:center; justify-content:center;
  font-size:1.6rem;
}

.sdp-name-block{ flex:1; min-width:0; }
.sdp-badges{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-bottom:8px; }
.sdp-badge{
  display:inline-flex; align-items:center; gap:4px;
  border-radius:7px; padding:3px 10px;
  font-size:11px; font-weight:700;
}
.sdp-badge-cat{ background:var(--pale); color:var(--blue); }
.sdp-badge-open{ background:#D1FAE5; color:#059669; }
.sdp-badge-closed{ background:#FEE2E2; color:#DC2626; }

.sdp-store-name{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:clamp(1.4rem,3vw,2rem);
  font-weight:800; color:var(--navy);
  line-height:1.15; letter-spacing:-.4px;
  margin-bottom:10px;
}
.sdp-rating-row{
  display:flex; align-items:center; gap:8px; flex-wrap:wrap;
}
.sdp-rating-num{ font-weight:800; color:var(--t1); font-size:15px; }
.sdp-review-count{ color:var(--t4); font-size:13px; font-weight:500; }

/* write review CTA */
.sdp-review-btn{
  background:var(--blue); color:#fff;
  border:none; border-radius:13px;
  padding:12px 22px;
  font-size:13.5px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer;
  display:inline-flex; align-items:center; gap:7px;
  transition:background .18s, transform .18s, box-shadow .18s;
  box-shadow:0 4px 14px rgba(29,78,216,.28);
  flex-shrink:0; white-space:nowrap;
}
.sdp-review-btn:hover{ background:#1E40AF; transform:translateY(-1px); box-shadow:0 6px 20px rgba(29,78,216,.36); }

/* ── LAYOUT ── */
.sdp-layout{
  max-width:1160px; margin:0 auto;
  padding:22px 24px 72px;
  display:grid;
  grid-template-columns:1fr 320px;
  gap:22px;
  align-items:start;
}

/* ── CARDS ── */
.sdp-card{
  background:var(--card);
  border:1.5px solid var(--bd);
  border-radius:var(--r2);
  box-shadow:var(--sh);
  overflow:hidden;
}
.sdp-card-pad{ padding:24px 26px; }
.sdp-card-pad-sm{ padding:20px 22px; }

.sdp-section-title{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:1.05rem; font-weight:800;
  color:var(--navy); margin-bottom:16px;
  display:flex; align-items:center; gap:8px;
}

/* ── THUMBNAIL STRIP ── */
.sdp-thumbs{
  display:flex; gap:8px; padding:14px 20px;
  border-top:1px solid var(--bd);
  flex-wrap:wrap;
}
.sdp-thumb{
  width:76px; height:56px; border-radius:10px;
  overflow:hidden; cursor:pointer; flex-shrink:0;
  border:2.5px solid transparent;
  transition:border-color .18s, transform .18s;
}
.sdp-thumb:hover{ transform:scale(1.04); }
.sdp-thumb.on{ border-color:var(--blue); }
.sdp-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
.sdp-photo-count{
  width:76px; height:56px; border-radius:10px;
  background:var(--pale); border:1.5px solid var(--bd);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:3px; color:var(--blue); font-size:10.5px; font-weight:700;
  flex-shrink:0;
}

/* ── DESCRIPTION ── */
.sdp-desc{
  font-size:13.5px; color:var(--t2);
  line-height:1.8; margin-bottom:18px;
}

/* ── TAGS ── */
.sdp-tags{ display:flex; flex-wrap:wrap; gap:7px; }
.sdp-tag{
  display:inline-flex; align-items:center; gap:5px;
  background:var(--pale); color:var(--blue);
  border-radius:100px; padding:5px 13px;
  font-size:12px; font-weight:600;
  border:1px solid #BFDBFE;
}

/* ── DEALS ── */
.sdp-deal{
  background:linear-gradient(135deg,#FFFBEB,#FEF3C7);
  border:1.5px solid #FDE68A;
  border-radius:14px; padding:14px 18px;
  display:flex; align-items:flex-start;
  justify-content:space-between; gap:12px;
  transition:transform .18s, box-shadow .18s;
}
.sdp-deal:hover{ transform:translateY(-2px); box-shadow:0 6px 20px rgba(245,158,11,.15); }
.sdp-deal-title{ font-size:13.5px; font-weight:700; color:#92400E; margin-bottom:3px; }
.sdp-deal-desc{ font-size:12px; color:#B45309; line-height:1.6; }
.sdp-deal-badge{
  font-size:10.5px; font-weight:700;
  background:#FEF3C7; color:#92400E;
  border:1px solid #FDE68A;
  border-radius:100px; padding:4px 11px;
  flex-shrink:0; white-space:nowrap;
}

/* ── SIDEBAR ── */
.sdp-info-row{
  display:flex; align-items:center; gap:10px;
  font-size:13.5px; color:var(--t2);
  padding:11px 0; border-bottom:1px solid var(--bg);
}
.sdp-info-row:last-child{ border-bottom:none; }
.sdp-info-ico{
  width:32px; height:32px; border-radius:9px;
  background:var(--pale);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.sdp-info-link{
  color:var(--blue); text-decoration:none;
  font-weight:600; font-size:13.5px;
  transition:color .15s;
}
.sdp-info-link:hover{ color:#1E40AF; }

/* action buttons */
.sdp-action-btn{
  width:100%; border:none; border-radius:13px;
  padding:13px 20px; font-size:13.5px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; display:flex;
  align-items:center; justify-content:center; gap:8px;
  transition:all .2s var(--ease);
}
.sdp-action-primary{
  background:var(--blue); color:#fff;
  box-shadow:0 4px 14px rgba(29,78,216,.25);
}
.sdp-action-primary:hover{ background:#1E40AF; transform:translateY(-1px); }

.sdp-action-wish{
  background:#F8FAFD; color:var(--t2);
  border:1.5px solid var(--bd) !important;
}
.sdp-action-wish:hover{ border-color:#FCA5A5 !important; background:#FEF2F2; color:var(--red); }
.sdp-action-wish.wished{ background:#FEF2F2; color:var(--red); border-color:#FCA5A5 !important; }

/* map card */
.sdp-map-card{
  background:linear-gradient(135deg,var(--pale),#EEF2FF);
  border:1.5px solid #BFDBFE;
  border-radius:var(--r2);
  padding:22px; text-align:center;
}
.sdp-map-ico{
  width:52px; height:52px; border-radius:14px;
  background:var(--blue);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 12px;
  box-shadow:0 6px 18px rgba(29,78,216,.3);
}
.sdp-map-title{ font-size:14px; font-weight:700; color:#1E40AF; margin-bottom:4px; }
.sdp-map-addr{ font-size:12px; color:var(--b3); line-height:1.5; }
.sdp-map-btn{
  display:inline-flex; align-items:center; gap:6px;
  margin-top:14px; background:var(--blue); color:#fff;
  border-radius:11px; padding:10px 20px;
  font-size:13px; font-weight:700; text-decoration:none;
  transition:background .18s;
}
.sdp-map-btn:hover{ background:#1E40AF; }

/* similar stores */
.sdp-similar-row{
  display:flex; align-items:center; gap:12px;
  padding:11px 0; border-bottom:1px solid var(--bg);
  cursor:pointer; transition:background .15s;
  border-radius:10px; margin:0 -4px; padding-left:4px; padding-right:4px;
}
.sdp-similar-row:last-child{ border-bottom:none; }
.sdp-similar-row:hover{ background:var(--pale); }
.sdp-similar-thumb{
  width:46px; height:46px; border-radius:11px;
  overflow:hidden; flex-shrink:0; background:var(--bg);
  border:1.5px solid var(--bd);
}
.sdp-similar-thumb img{ width:100%; height:100%; object-fit:cover; display:block; }
.sdp-similar-name{ font-size:13.5px; font-weight:700; color:var(--t1); margin-bottom:2px; }
.sdp-similar-cat{ font-size:11.5px; color:var(--t4); font-weight:500; }
.sdp-similar-rating{
  display:flex; align-items:center; gap:3px;
  font-size:12.5px; font-weight:700; color:var(--t1);
  margin-left:auto; flex-shrink:0;
}

.sdp-explore-btn{
  margin-top:12px; width:100%;
  background:none; border:1.5px solid var(--bd);
  border-radius:11px; padding:10px;
  font-size:13px; font-weight:600; color:var(--t3);
  cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition:all .18s;
}
.sdp-explore-btn:hover{ border-color:var(--blue); color:var(--blue); background:var(--pale); }

/* reviews header */
.sdp-reviews-header{
  display:flex; align-items:center;
  justify-content:space-between;
  margin-bottom:20px; flex-wrap:wrap; gap:10px;
}
.sdp-add-review-btn{
  display:flex; align-items:center; gap:6px;
  background:none; border:1.5px solid var(--blue);
  border-radius:10px; padding:8px 16px;
  font-size:13px; font-weight:700; color:var(--blue);
  cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
  transition:all .18s;
}
.sdp-add-review-btn:hover{ background:var(--pale); }

/* ── SIMILAR STORES BOTTOM SECTION ── */
.sdp-explore-section{
  max-width:1160px; margin:0 auto 60px;
  padding:0 24px;
}
.sdp-explore-header{
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:18px; flex-wrap:wrap; gap:10px;
}
.sdp-explore-title{
  font-family:'Bricolage Grotesque',sans-serif;
  font-size:1.2rem; font-weight:800; color:var(--navy);
  display:flex; align-items:center; gap:8px;
}
.sdp-explore-subtitle{
  font-size:13px; color:var(--t4); font-weight:500; margin-top:2px;
}
.sdp-explore-all{
  display:inline-flex; align-items:center; gap:6px;
  background:var(--blue); color:#fff;
  border:none; border-radius:10px; padding:9px 18px;
  font-size:13px; font-weight:700;
  font-family:'Plus Jakarta Sans',sans-serif;
  cursor:pointer; transition:background .18s;
  text-decoration:none; white-space:nowrap;
}
.sdp-explore-all:hover{ background:#1E40AF; }

/* ── 3 horizontal similar cards ── */
.sdp-hcards{
  display:flex; flex-direction:column; gap:10px;
}
.sdp-hcard{
  background:var(--card);
  border:1.5px solid var(--bd);
  border-radius:16px;
  overflow:hidden; cursor:pointer;
  display:flex; align-items:center; gap:0;
  box-shadow:0 2px 8px rgba(10,22,40,.05);
  transition:transform .22s var(--ease), box-shadow .22s var(--ease), border-color .22s var(--ease);
  padding-right:16px;
}
.sdp-hcard:hover{
  transform:translateX(4px);
  box-shadow:0 8px 28px rgba(10,22,40,.1);
  border-color:rgba(29,78,216,.2);
}
.sdp-hcard-img{
  width:88px; min-width:88px; height:80px;
  overflow:hidden; background:#EEF2FA; flex-shrink:0;
}
.sdp-hcard-img img{
  width:100%; height:100%; object-fit:cover; display:block;
  transition:transform .5s var(--ease);
}
.sdp-hcard:hover .sdp-hcard-img img{ transform:scale(1.08); }
.sdp-hcard-body{
  flex:1; min-width:0; padding:12px 14px;
}
.sdp-hcard-name{
  font-size:14px; font-weight:700; color:var(--t1);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  margin-bottom:3px;
}
.sdp-hcard-cat{
  font-size:11.5px; color:var(--t4); font-weight:500;
  margin-bottom:6px;
}
.sdp-hcard-foot{
  display:flex; align-items:center; gap:10px;
}
.sdp-hcard-rating{
  display:flex; align-items:center; gap:3px;
  font-size:12px; font-weight:700; color:var(--t1);
}
.sdp-hcard-city{
  display:flex; align-items:center; gap:3px;
  font-size:11.5px; color:var(--t4); font-weight:500;
}

/* ── ANIMATIONS ── */
@keyframes sdp-spin{ to{ transform:rotate(360deg); } }
@keyframes sdp-up{
  from{ opacity:0; transform:translateY(14px); }
  to{ opacity:1; transform:translateY(0); }
}
.sdp-identity-card{ animation:sdp-up .4s var(--ease) both; }
.sdp-layout > *:first-child > *:nth-child(1){ animation:sdp-up .38s var(--ease) .06s both; }
.sdp-layout > *:first-child > *:nth-child(2){ animation:sdp-up .38s var(--ease) .10s both; }
.sdp-layout > *:first-child > *:nth-child(3){ animation:sdp-up .38s var(--ease) .14s both; }
.sdp-layout > *:first-child > *:nth-child(4){ animation:sdp-up .38s var(--ease) .18s both; }
.sdp-layout > *:last-child > *{ animation:sdp-up .38s var(--ease) .22s both; }

/* ── RESPONSIVE ── */
@media(max-width:960px){
  .sdp-layout{ grid-template-columns:1fr; }
  .sdp-sidebar{ order:-1; }
}

@media(max-width:640px){
  .sdp-hero{ height:220px; }
  .sdp-hero-store-name{ font-size:1.3rem; }
  .sdp-identity{ margin-top:-36px; padding:0 14px; }
  .sdp-identity-card{ padding:14px 16px; gap:10px; }
  .sdp-store-name{ font-size:1.2rem; }
  .sdp-review-btn{ width:100%; justify-content:center; }
  .sdp-layout{ padding:14px 14px 44px; gap:14px; }
  .sdp-card-pad{ padding:16px 18px; }
  .sdp-card-pad-sm{ padding:14px 16px; }
  .sdp-thumbs{ padding:10px 14px; gap:6px; }
  .sdp-thumb{ width:62px; height:46px; }
  .sdp-photo-count{ width:62px; height:46px; }
  .sdp-explore-section{ padding:0 14px; margin-bottom:40px; }
  .sdp-hcard-img{ width:72px; min-width:72px; height:68px; }
}

@media(max-width:420px){
  .sdp-hero{ height:200px; }
  .sdp-identity-card{ flex-direction:column; }
  .sdp-review-btn{ font-size:13px; padding:11px 16px; }
}
`;

// ── Main ──────────────────────────────────────────────────────────────────────
const StoreDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore]               = useState(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError]     = useState("");
  const [similar, setSimilar]           = useState([]);
  const [activeImg, setActiveImg]       = useState(0);
  const [wishlisted, setWishlisted]     = useState(false);
  const [wishLoading, setWishLoading]   = useState(false);

  const goReview = useCallback(() => id && navigate(`/write-review/${id}`), [id, navigate]);

  // Fetch store
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setStoreLoading(true); setStoreError(""); setActiveImg(0);
        const res = await api.get(`/shops/${id}`);
        const data = safeObj(res);
        setStore(data);
        if (data?.isWishlisted !== undefined) setWishlisted(data.isWishlisted);
      } catch (err) {
        setStoreError(err.response?.data?.message ?? "Failed to load store.");
      } finally { setStoreLoading(false); }
    })();
  }, [id]);

  // Fetch similar
  useEffect(() => {
    if (!store?.category) return;
    (async () => {
      try {
        const res = await api.get(`/shops?category=${encodeURIComponent(store.category)}&limit=4`);
        const all = safeArray(res, "data");
        setSimilar(all.filter(s => String(s._id ?? s.id) !== String(id)).slice(0, 3));
      } catch { /* silent */ }
    })();
  }, [store?.category, id]);

  const handleWishlist = useCallback(async () => {
    if (wishLoading) return;
    try {
      setWishLoading(true);
      await api.post(`/users/me/wishlist/${id}`);
      setWishlisted(w => !w);
    } catch (e) { console.error(e); }
    finally { setWishLoading(false); }
  }, [id, wishLoading]);

  const buildImages = (s) => {
    if (!s) return [];
    const imgs = [];
    if (s.cover?.url)  imgs.push({ url: getImageUrl(s.cover.url),  label: "Cover" });
    if (s.logo?.url)   imgs.push({ url: getImageUrl(s.logo.url),   label: "Logo" });
    (s.gallery ?? []).forEach((g, i) => {
      if (g?.url) imgs.push({ url: getImageUrl(g.url), label: `Photo ${i + 1}` });
    });
    return imgs;
  };

  if (storeLoading) return <Spinner fullPage />;
  if (storeError) return (
    <div className="sdp-root">
      <style>{CSS}</style>
      <Navbar />
      <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 24px" }}>
        <ErrorMsg msg={storeError} />
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", color: "#1D4ED8", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
  if (!store) return null;

  const allImages   = buildImages(store);
  const tags        = store?.tags ?? store?.amenities ?? [];
  const deals       = (store?.deals ?? store?.offers ?? []).filter(d => d.active !== false);
  const avgRating   = store.avgRating ?? store.averageRating ?? store.rating ?? 0;
  const reviewCount = store.reviewCount ?? store.totalReviews ?? 0;
  // heroSrc removed — hero no longer uses a bg image
  const catIcon     = { Restaurant:"🍽️", Cafe:"☕", Clothing:"👗", Electronics:"📱", Grocery:"🛒", Pharmacy:"💊", Salon:"✂️", Gym:"💪" }[store.category] || "🏪";

  return (
    <div className="sdp-root">
      <style>{CSS}</style>
      <Navbar />

      {/* ── HERO — animated dark navy, no bg image ── */}
      <div className="sdp-hero">
        <div className="sdp-hero-bg" />
        <div className="sdp-hero-orb1" />
        <div className="sdp-hero-orb2" />
        <div className="sdp-hero-orb3" />
        <div className="sdp-hero-grid" />
        <div className="sdp-hero-scan" />

        <div className="sdp-hero-content">
          {/* Top row */}
          <div className="sdp-hero-toprow">
            <button className="sdp-back" onClick={() => navigate(-1)}>
              <ChevronLeft size={15} /> Back
            </button>
            <div className="sdp-hero-actions">
              <button
                className={`sdp-ico-btn${wishlisted ? " active" : ""}`}
                onClick={handleWishlist}
                disabled={wishLoading}
              >
                {wishLoading
                  ? <Loader2 size={16} style={{ animation:"sdp-spin .8s linear infinite" }} />
                  : <Heart size={16} style={{ fill:wishlisted ? "#EF4444":"none", color:wishlisted ? "#EF4444":"rgba(255,255,255,.8)" }} />}
              </button>
              <button className="sdp-ico-btn">
                <Share2 size={16} style={{ color:"rgba(255,255,255,.8)" }} />
              </button>
            </div>
          </div>

          {/* Bottom: store name + pills */}
          <div className="sdp-hero-bottom">
            <h1 className="sdp-hero-store-name">{store.name}</h1>
            <div className="sdp-hero-pills">
              {avgRating > 0 && (
                <span className="sdp-hero-pill sdp-hp-rating">
                  <Star size={11} style={{ fill:"#FBBF24", color:"#FBBF24" }} />
                  {Number(avgRating).toFixed(1)}
                  <span style={{ opacity:.6 }}>({reviewCount})</span>
                </span>
              )}
              {store.category && (
                <span className="sdp-hero-pill sdp-hp-cat">{catIcon} {store.category}</span>
              )}
              <span className={`sdp-hero-pill ${store.isOpen ? "sdp-hp-open" : "sdp-hp-closed"}`}>
                ● {store.isOpen ? "Open Now" : "Closed"}
              </span>
              {store.isVerified && (
                <span className="sdp-hero-pill sdp-hp-verified">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
              {store.location?.city && (
                <span className="sdp-hero-pill sdp-hp-addr">
                  <MapPin size={11} /> {store.location.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── IDENTITY BAR ── */}
      <div className="sdp-identity">
        <div className="sdp-identity-card">
          {/* Logo */}
          <div className="sdp-logo-wrap">
            {getImageUrl(store.logo?.url)
              ? <img src={getImageUrl(store.logo?.url)} alt={store.name} onError={e => e.target.style.display = "none"} />
              : <div className="sdp-logo-fallback">{catIcon}</div>}
          </div>

          {/* Name + rating */}
          <div className="sdp-name-block">
            <div className="sdp-badges">
              {store.category && <span className="sdp-badge sdp-badge-cat">{store.category}</span>}
              <span className={`sdp-badge ${store.isOpen ? "sdp-badge-open" : "sdp-badge-closed"}`}>
                ● {store.isOpen ? "Open Now" : "Closed"}
              </span>
            </div>
            <h1 className="sdp-store-name">{store.name}</h1>
            <div className="sdp-rating-row">
              <Stars rating={avgRating} />
              <span className="sdp-rating-num">{Number(avgRating).toFixed(1)}</span>
              <span className="sdp-review-count">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
            </div>
          </div>

          {/* CTA */}
          <button className="sdp-review-btn" onClick={goReview}>
            <MessageSquare size={15} /> Write a Review
          </button>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="sdp-layout">

        {/* ═══ LEFT ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Gallery card */}
          {allImages.length > 1 && (
            <div className="sdp-card">
              {/* Main image */}
              <div style={{ height: 300, overflow: "hidden", position: "relative" }}>
                <img
                  src={allImages[activeImg]?.url ?? FALLBACK}
                  alt={store.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity .3s" }}
                  onError={e => { e.target.src = FALLBACK; }}
                />
              </div>
              {/* Thumbs */}
              <div className="sdp-thumbs">
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    className={`sdp-thumb${activeImg === i ? " on" : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img.url} alt="" onError={e => { e.target.src = FALLBACK; }} />
                  </div>
                ))}
                <div className="sdp-photo-count">
                  <Camera size={14} />
                  <span>{allImages.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* About */}
          <div className="sdp-card sdp-card-pad">
            <h2 className="sdp-section-title">
              <Sparkles size={16} style={{ color: "#1D4ED8" }} /> About
            </h2>
            {store.description && <p className="sdp-desc">{store.description}</p>}
            {tags.length > 0 && (
              <div className="sdp-tags">
                {tags.map(t => (
                  <span key={t} className="sdp-tag">
                    <CheckCircle size={11} /> {t}
                  </span>
                ))}
              </div>
            )}
            {!store.description && tags.length === 0 && (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No description available.</p>
            )}
          </div>

          {/* Deals */}
          {deals.length > 0 && (
            <div className="sdp-card sdp-card-pad">
              <h2 className="sdp-section-title">
                <Tag size={16} style={{ color: "#D97706" }} /> Active Deals
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {deals.map((deal, i) => (
                  <div key={deal._id ?? i} className="sdp-deal">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="sdp-deal-title">{deal.title}</p>
                      {deal.description && <p className="sdp-deal-desc">{deal.description}</p>}
                      {deal.expiry && (
                        <p style={{ fontSize: 11.5, color: "#B45309", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} /> Expires: {new Date(deal.expiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <span className="sdp-deal-badge">{deal.type ?? "DEAL"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="sdp-card sdp-card-pad">
            <div className="sdp-reviews-header">
              <h2 className="sdp-section-title" style={{ marginBottom: 0 }}>
                <MessageSquare size={16} style={{ color: "#1D4ED8" }} /> Customer Reviews
              </h2>
              <button className="sdp-add-review-btn" onClick={goReview}>
                + Add Review
              </button>
            </div>
            <ReviewList shopId={id} avgRating={avgRating} reviewCount={reviewCount} />
          </div>
        </div>

        {/* ═══ SIDEBAR ═══ */}
        <div className="sdp-sidebar" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Store Info */}
          <div className="sdp-card sdp-card-pad-sm">
            <h3 className="sdp-section-title">Store Info</h3>
            <div>
              {[
                { Icon: MapPin,  label: store.location?.address || store.location?.city, href: null },
                { Icon: Phone,   label: store.phone, href: store.phone ? `tel:${store.phone}` : null },
                { Icon: Globe,   label: store.website?.replace(/^https?:\/\//, ""), href: store.website },
                { Icon: Clock,   label: store.hours ? 'View opening hours' : null, href: null },
              ].filter(r => r.label).map(({ Icon, label, href }, i) => (
                <div key={i} className="sdp-info-row">
                  <div className="sdp-info-ico">
                    <Icon size={14} style={{ color: "#1D4ED8" }} />
                  </div>
                  {href
                    ? <a href={href} target="_blank" rel="noreferrer" className="sdp-info-link">{label}</a>
                    : <span style={{ fontSize: 13.5, color: "#374151" }}>{label}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Hours */}
          {store.hours && typeof store.hours === 'object' && (
            <div className="sdp-card sdp-card-pad-sm">
              <h3 className="sdp-section-title">
                <Clock size={15} style={{ color: '#1D4ED8' }} /> Opening Hours
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {Object.entries(store.hours).map(([day, hrs]) => {
                  // hrs can be: string | { open, from, to } | null
                  let label = 'Closed';
                  let isOpen = false;
                  if (typeof hrs === 'string') {
                    label = hrs || 'Closed';
                    isOpen = label.toLowerCase() !== 'closed';
                  } else if (hrs && typeof hrs === 'object') {
                    if (hrs.open === false || hrs.open === 'false') {
                      label = 'Closed';
                    } else if (hrs.from && hrs.to) {
                      label = `${hrs.from} – ${hrs.to}`;
                      isOpen = true;
                    } else if (hrs.open) {
                      label = 'Open';
                      isOpen = true;
                    }
                  }
                  return (
                    <div key={day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F8FAFC', fontSize:13 }}>
                      <span style={{ fontWeight:600, color:'#374151' }}>{day}</span>
                      <span style={{ color: isOpen ? '#059669' : '#DC2626', fontWeight:600, fontSize:12.5 }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="sdp-card sdp-card-pad-sm">
            <h3 className="sdp-section-title">Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <button className="sdp-action-btn sdp-action-primary" onClick={goReview}>
                <Star size={15} /> Rate This Store
              </button>
              <button
                className={`sdp-action-btn sdp-action-wish${wishlisted ? " wished" : ""}`}
                onClick={handleWishlist}
                disabled={wishLoading}
                style={{ border: "1.5px solid #E2E8F2" }}
              >
                {wishLoading
                  ? <Loader2 size={15} style={{ animation: "sdp-spin .8s linear infinite" }} />
                  : <Heart size={15} style={{ fill: wishlisted ? "#DC2626" : "none" }} />}
                {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>
          </div>

          {/* Map */}
          {(store.location?.lat || store.location?.lng) && (
            <div className="sdp-map-card">
              <div className="sdp-map-ico">
                <Navigation size={22} color="#fff" />
              </div>
              <p className="sdp-map-title">View on Map</p>
              {store.location?.address && (
                <p className="sdp-map-addr">{store.location.address}</p>
              )}
              <a
                href={`https://www.google.com/maps?q=${store.location.lat},${store.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="sdp-map-btn"
              >
                <Navigation size={13} /> Get Directions
              </a>
            </div>
          )}

          {/* Explore more link in sidebar */}
          <button className="sdp-explore-btn" onClick={() => navigate(`/explore?category=${encodeURIComponent(store.category || '')}`)}>
            <ArrowRight size={13} /> Explore more {store.category || "stores"}
          </button>
        </div>
      </div>

      {/* ── SIMILAR STORES — 3 horizontal cards ── */}
      {similar.length > 0 && (
        <div className="sdp-explore-section">
          <div className="sdp-explore-header">
            <h2 className="sdp-explore-title">
              More {store.category || "Stores"} near you
            </h2>
            <button
              className="sdp-explore-all"
              onClick={() => navigate(`/explore?category=${encodeURIComponent(store.category || '')}`)}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div className="sdp-hcards">
            {similar.slice(0,3).map(s => (
              <div
                key={s._id ?? s.id}
                className="sdp-hcard"
                onClick={() => navigate(`/store/${s._id ?? s.id}`)}
              >
                <div className="sdp-hcard-img">
                  <img
                    src={getShopImage(s)}
                    alt={s.name}
                    onError={e => { e.target.src = FALLBACK; }}
                  />
                </div>
                <div className="sdp-hcard-body">
                  <p className="sdp-hcard-name">{s.name}</p>
                  <p className="sdp-hcard-cat">{s.category}</p>
                  <div className="sdp-hcard-foot">
                    <span className="sdp-hcard-rating">
                      <Star size={11} style={{ fill:"#FBBF24", color:"#FBBF24" }} />
                      {Number(s.avgRating ?? 0).toFixed(1)}
                    </span>
                    {s.location?.city && (
                      <span className="sdp-hcard-city">
                        <MapPin size={10} /> {s.location.city}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight size={15} style={{ color:"#94A3B8", flexShrink:0 }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailPage;