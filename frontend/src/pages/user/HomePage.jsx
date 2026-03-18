import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Star, MapPin, Shield, Store, Users,
  ArrowRight, Sparkles, ThumbsUp, Award,
  Coffee, ShoppingBag, Utensils, Pill, Scissors, Dumbbell,
  Smartphone, ShoppingCart, TrendingUp, MessageSquare,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};
const FALLBACK = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";
const getImage = (s) =>
  getImageUrl(s?.cover?.url) || getImageUrl(s?.logo?.url) ||
  getImageUrl(s?.gallery?.[0]?.url) || FALLBACK;
const getCity = (s) => {
  const l = s?.location;
  if (!l) return "";
  if (typeof l === "string") return l;
  return l.city || l.address || "";
};

const CATEGORIES = [
  { name:"Restaurant", icon:Utensils,     color:"#FF6B35", bg:"#FFF0EB" },
  { name:"Cafe",       icon:Coffee,       color:"#8B5E3C", bg:"#FDF4EE" },
  { name:"Grocery",    icon:ShoppingCart, color:"#16A34A", bg:"#F0FDF4" },
  { name:"Clothing",   icon:ShoppingBag,  color:"#DB2777", bg:"#FDF2F8" },
  { name:"Electronics",icon:Smartphone,   color:"#2563EB", bg:"#EFF6FF" },
  { name:"Pharmacy",   icon:Pill,         color:"#DC2626", bg:"#FEF2F2" },
  { name:"Salon",      icon:Scissors,     color:"#7C3AED", bg:"#F5F3FF" },
  { name:"Gym",        icon:Dumbbell,     color:"#0891B2", bg:"#ECFEFF" },
];

const MARQUEE = [
  { name:"Priya S.",   text:"Best biryani in Hyderabad!",        rating:5, store:"Spice Garden", a:"P" },
  { name:"Rahul M.",   text:"Fresh groceries, super fast!",      rating:5, store:"Daily Fresh",  a:"R" },
  { name:"Ananya K.",  text:"Perfect cafe for dates",            rating:5, store:"Cafe Bloom",   a:"A" },
  { name:"Kiran P.",   text:"Best haircut I have had in years!", rating:5, store:"Style Studio", a:"K" },
  { name:"Meera T.",   text:"Always in stock, very helpful.",    rating:4, store:"MedPlus",      a:"M" },
  { name:"Arjun B.",   text:"Great equipment and trainers!",     rating:5, store:"FitLife Gym",  a:"A" },
  { name:"Divya R.",   text:"Trending fashion at great prices!", rating:5, store:"Zara Outlet",  a:"D" },
  { name:"Suresh N.",  text:"Phone fixed in 30 mins. Amazing!",  rating:4, store:"TechFix",      a:"S" },
  { name:"Lakshmi V.", text:"Fresh veggies every day. Love it!", rating:5, store:"Green Basket", a:"L" },
  { name:"Vikram J.",  text:"Best coffee in the whole city!",    rating:5, store:"Brew House",   a:"V" },
];

const RATING_DATA = [
  { label:"Restaurants & Cafes", rating:4.8, count:5240, color:"#FF6B35" },
  { label:"Grocery & Pharmacy",  rating:4.6, count:3180, color:"#16A34A" },
  { label:"Fashion & Clothing",  rating:4.7, count:2890, color:"#DB2777" },
  { label:"Electronics & Tech",  rating:4.5, count:1970, color:"#2563EB" },
  { label:"Salons & Wellness",   rating:4.9, count:4120, color:"#7C3AED" },
  { label:"Fitness & Gyms",      rating:4.7, count:1560, color:"#0891B2" },
];

const AVATAR_COLORS = ["#6366F1","#EC4899","#F59E0B","#10B981","#3B82F6","#8B5CF6"];
const ac = (ch) => AVATAR_COLORS[ch.charCodeAt(0) % AVATAR_COLORS.length];

const useCounter = (target, duration = 1800, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(+((1 - Math.pow(1 - p, 3)) * target).toFixed(1));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
};

const RatingRow = ({ label, rating, count, color, delay, started }) => {
  const r = useCounter(rating, 1600, started);
  const c = useCounter(count, 1400, started);
  return (
    <div style={{ opacity:started?1:0, transform:started?"translateY(0)":"translateY(16px)", transition:`all 0.6s ${delay}s ease`, padding:"12px 0", borderBottom:"1px solid #F1F5F9" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontWeight:700, fontSize:13, color:"#111" }}>{label}</span>
          <span style={{ fontSize:10, color:"#9CA3AF", background:"#F8F9FB", borderRadius:6, padding:"2px 7px", fontWeight:600 }}>{Math.round(c).toLocaleString()}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
          <span style={{ fontFamily:"'Fraunces',serif", fontSize:"1.15rem", fontWeight:700, color:"#111" }}>{r.toFixed(1)}</span>
          <Star size={13} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>
        </div>
      </div>
      <div style={{ height:7, background:"#F1F5F9", borderRadius:100, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:100, background:`linear-gradient(90deg,${color},${color}99)`, width:started?`${(r/5)*100}%`:"0%", transition:`width 1.6s ${delay+0.2}s cubic-bezier(0.4,0,0.2,1)` }}/>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1.5px solid #F1F5F9" }}>
    <div style={{ height:170, background:"#F1F5F9", animation:"pulse 1.5s infinite" }}/>
    <div style={{ padding:"14px 16px 16px" }}>
      <div style={{ height:13, background:"#F1F5F9", borderRadius:8, marginBottom:8, width:"70%" }}/>
      <div style={{ height:11, background:"#F1F5F9", borderRadius:8, width:"45%" }}/>
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [sq, setSq] = useState("");
  const [sc, setSc] = useState("");
  const [tab, setTab] = useState("all");
  const [shops, setShops] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [ratingStarted, setRatingStarted] = useState(false);
  const ratingRef = useRef(null);

  useEffect(() => {
    api.get("/shops?sort=rating&limit=6")
      .then(r => setShops(r?.data?.data ?? r?.data ?? []))
      .catch(() => setShops([]))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRatingStarted(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ratingRef.current) obs.observe(ratingRef.current);
    return () => obs.disconnect();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (sq.trim()) navigate(`/explore?search=${encodeURIComponent(sq)}&city=${encodeURIComponent(sc)}`);
  };

const display = tab === "all"
  ? shops
  : shops.filter(s =>
      s.category?.toLowerCase().includes(tab)
    );

  return (
    <div style={{ minHeight:"100vh", background:"#FAFBFF", fontFamily:"'Plus Jakarta Sans',sans-serif", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes f1{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-16px) rotate(1.5deg)}}
        @keyframes f2{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-13px) rotate(-1.5deg)}}
        @keyframes f3{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
        @keyframes f4{0%,100%{transform:translateY(0) rotate(1.5deg)}50%{transform:translateY(-18px) rotate(-1deg)}}
        @keyframes f5{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes mqr{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        @keyframes ping{0%{transform:scale(1);opacity:1}80%,100%{transform:scale(2.2);opacity:0}}
        .fc1{animation:f1 5s ease-in-out infinite;}
        .fc2{animation:f2 6s ease-in-out infinite 0.6s;}
        .fc3{animation:f3 4.5s ease-in-out infinite 1s;}
        .fc4{animation:f4 7s ease-in-out infinite 0.3s;}
        .fc5{animation:f5 5.5s ease-in-out infinite 1.8s;}
        .fu1{opacity:0;animation:fadeUp 0.6s 0.1s ease forwards;}
        .fu2{opacity:0;animation:fadeUp 0.6s 0.25s ease forwards;}
        .fu3{opacity:0;animation:fadeUp 0.6s 0.4s ease forwards;}
        .fu4{opacity:0;animation:fadeUp 0.6s 0.55s ease forwards;}

        .sbox{display:flex;flex-wrap:wrap;background:#fff;border-radius:16px;box-shadow:0 6px 36px rgba(99,102,241,0.14);border:2px solid #E0E7FF;overflow:hidden;transition:all 0.3s;}
        .sbox:focus-within{box-shadow:0 8px 40px rgba(99,102,241,0.24);border-color:#818CF8;}
        .sbox input{border:none;outline:none;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;color:#111;background:transparent;padding:14px 12px;flex:1;min-width:100px;}
        .sbox input::placeholder{color:#A5B4FC;}
        .sdiv{width:1px;background:#E0E7FF;align-self:stretch;margin:8px 0;}
        .sbtn{background:linear-gradient(135deg,#5B5FF5,#8B5CF6);color:#fff;border:none;cursor:pointer;font-size:13px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;padding:12px 20px;display:flex;align-items:center;gap:6px;transition:opacity 0.2s;white-space:nowrap;}
        .sbtn:hover{opacity:0.88;}

        .fcard{position:absolute;background:#fff;border-radius:16px;padding:11px 15px;box-shadow:0 12px 40px rgba(0,0,0,0.1),0 3px 12px rgba(0,0,0,0.05);border:1.5px solid rgba(255,255,255,0.95);}

        .cat-btn{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 6px;background:#fff;border:2px solid #F1F5F9;border-radius:18px;cursor:pointer;transition:all 0.22s;-webkit-tap-highlight-color:transparent;}
        .cat-btn:hover,.cat-btn:active{box-shadow:0 8px 20px rgba(0,0,0,0.09);transform:translateY(-3px);border-color:currentColor;}

        .sc{background:#fff;border-radius:18px;overflow:hidden;border:1.5px solid #F1F5F9;cursor:pointer;transition:all 0.28s;-webkit-tap-highlight-color:transparent;}
        .sc:hover,.sc:active{box-shadow:0 16px 44px rgba(99,102,241,0.12);transform:translateY(-4px);border-color:#C7D2FE;}
        .sc:hover .si,.sc:active .si{transform:scale(1.05);}
        .sc:hover .sn,.sc:active .sn{color:#4F46E5;}
        .si{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .sn{font-size:14px;font-weight:700;color:#111;margin-bottom:3px;transition:color 0.2s;}

        .tb{padding:7px 16px;border-radius:100px;font-size:12px;font-weight:600;border:1.5px solid #E5E7EB;cursor:pointer;transition:all 0.2s;background:#fff;font-family:'Plus Jakarta Sans',sans-serif;color:#6B7280;white-space:nowrap;-webkit-tap-highlight-color:transparent;}
        .tb.on{background:#4F46E5;color:#fff;border-color:#4F46E5;}
        .tb:hover:not(.on){border-color:#818CF8;color:#4F46E5;}

        .stc{background:#fff;border-radius:18px;border:1.5px solid #F1F5F9;padding:20px 16px;text-align:center;transition:all 0.25s;}
        .stc:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(99,102,241,0.09);}

        .hwc{background:#fff;border-radius:22px;border:1.5px solid #F1F5F9;padding:28px 24px;position:relative;transition:all 0.25s;}
        .hwc:hover{box-shadow:0 14px 36px rgba(0,0,0,0.06);transform:translateY(-3px);}
        .stp{font-family:'Fraunces',serif;font-size:3.5rem;font-weight:800;line-height:1;opacity:0.05;position:absolute;top:14px;right:20px;color:#111;}

        .mw{overflow:hidden;}
        .mw:hover .mt,.mw:hover .mtr{animation-play-state:paused;}
        .mt{display:flex;gap:12px;width:max-content;animation:mq 36s linear infinite;}
        .mtr{display:flex;gap:12px;width:max-content;animation:mqr 44s linear infinite;}
        .rc{display:flex;flex-direction:column;gap:7px;background:#fff;border:1.5px solid #F1F5F9;border-radius:16px;padding:14px 16px;min-width:240px;max-width:260px;flex-shrink:0;transition:all 0.2s;}
        .rc:hover{border-color:#C7D2FE;box-shadow:0 6px 20px rgba(99,102,241,0.07);}

        .pl{position:absolute;border-radius:100px;font-size:10px;font-weight:700;padding:3px 10px;backdrop-filter:blur(6px);}
        .lb{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:#4F46E5;background:none;border:none;cursor:pointer;padding:0;transition:gap 0.2s;font-family:'Plus Jakarta Sans',sans-serif;}
        .lb:hover{gap:9px;}
        .fl{background:none;border:none;cursor:pointer;font-size:13px;color:rgba(255,255,255,0.45);font-family:'Plus Jakarta Sans',sans-serif;padding:0;transition:color 0.2s;display:block;margin-bottom:9px;text-align:left;}
        .fl:hover{color:rgba(255,255,255,0.85);}

        /* ── MOBILE FIRST BREAKPOINTS ── */
        /* Base = mobile */
        .ss{max-width:1200px;margin:0 auto;padding:0 16px;}
        .hero-inner{display:flex;flex-direction:column;gap:32px;}
        .hero-right{display:none;}
        .cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .store-grid{display:grid;grid-template-columns:1fr;gap:16px;}
        .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
        .how-grid{display:grid;grid-template-columns:1fr;gap:16px;}
        .rating-grid{display:grid;grid-template-columns:1fr;gap:32px;}
        .footer-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
        .cta-inner{display:flex;flex-direction:column;gap:24px;text-align:center;}
        .cta-btns{justify-content:center;}
        .sl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9CA3AF;margin-bottom:6px;}
        .st{font-family:'Fraunces',serif;font-size:clamp(1.5rem,5vw,2.2rem);font-weight:700;color:#0F172A;margin-bottom:5px;}
        .sb{font-size:13px;color:#6B7280;}

        /* Tablet ≥ 640px */
        @media(min-width:640px){
          .ss{padding:0 20px;}
          .cat-grid{grid-template-columns:repeat(8,1fr);gap:10px;}
          .store-grid{grid-template-columns:repeat(2,1fr);gap:18px;}
          .stats-grid{grid-template-columns:repeat(4,1fr);gap:16px;}
          .how-grid{grid-template-columns:repeat(3,1fr);gap:18px;}
          .rating-grid{grid-template-columns:1fr 1fr;gap:40px;}
          .footer-grid{grid-template-columns:2fr 1fr 1fr 1fr;gap:36px;}
          .cta-inner{flex-direction:row;text-align:left;}
          .cta-btns{justify-content:flex-start;}
          .sbox{max-width:100%;}
        }

        /* Desktop ≥ 900px */
        @media(min-width:900px){
          .ss{padding:0 24px;}
          .hero-inner{flex-direction:row;align-items:center;gap:48px;}
          .hero-right{display:block;}
          .store-grid{grid-template-columns:repeat(3,1fr);gap:20px;}
        }
      `}</style>

      <Navbar />

      {/* ══ 1. HERO ══ */}
      <section style={{ background:"linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 45%,#FDF4FF 75%,#FFF7ED 100%)", padding:"clamp(48px,8vw,80px) 0 clamp(56px,9vw,88px)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#C7D2FE 1.2px, transparent 1.2px)", backgroundSize:"28px 28px", opacity:0.4, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,#DDD6FE 0%,transparent 70%)", top:-120, right:-60, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,#FCE7F3 0%,transparent 70%)", bottom:-60, left:-40, pointerEvents:"none" }}/>

        <div className="ss">
          <div className="hero-inner">
            {/* LEFT */}
            <div style={{ flex:1, minWidth:0 }}>
              <div className="fu1" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:100, padding:"6px 14px", fontSize:11, fontWeight:700, color:"#4F46E5", marginBottom:18 }}>
                <Sparkles size={12}/> India's #1 Store Rating Platform
              </div>
              <h1 className="fu2" style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(2.1rem,5.5vw,4rem)", fontWeight:800, color:"#0F172A", lineHeight:1.08, marginBottom:16, letterSpacing:"-0.03em" }}>
                Discover &amp; Rate<br/>
                <span style={{ background:"linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#EC4899 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>the Best Shops</span><br/>
                Near You ✨
              </h1>
              <p className="fu3" style={{ fontSize:"clamp(0.9rem,1.8vw,1.05rem)", color:"#64748B", maxWidth:480, marginBottom:28, lineHeight:1.8 }}>
                Find top-rated local businesses, read honest reviews, and help your community make smarter choices.
              </p>
              <div className="fu4">
                <form onSubmit={handleSearch} style={{ marginBottom:14 }}>
                  <div className="sbox">
                    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, padding:"0 14px" }}>
                      <Search size={16} style={{ color:"#A5B4FC", flexShrink:0 }}/>
                      <input placeholder="Search stores, cafes, salons…" value={sq} onChange={e=>setSq(e.target.value)}/>
                    </div>
                    <div className="sdiv"/>
                    <div style={{ display:"flex", alignItems:"center", gap:7, padding:"0 12px", width:110 }}>
                      <MapPin size={14} style={{ color:"#A5B4FC", flexShrink:0 }}/>
                      <input placeholder="City" value={sc} onChange={e=>setSc(e.target.value)} style={{ width:"100%" }}/>
                    </div>
                    <button type="submit" className="sbtn"><Search size={14}/> Search</button>
                  </div>
                </form>
                <p style={{ color:"#94A3B8", fontSize:12, fontWeight:500 }}>
                  Try: {["Restaurant","Cafe","Salon","Pharmacy"].map((c,i)=>(
                    <span key={c}>
                      <span onClick={()=>navigate(`/explore?category=${c}`)} style={{ color:"#6366F1", cursor:"pointer", fontWeight:600 }}>{c}</span>
                      {i<3&&<span style={{ opacity:0.4 }}>, </span>}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* RIGHT — floating cards (hidden on mobile) */}
            <div className="hero-right" style={{ width:400, flexShrink:0, position:"relative", height:420 }}>
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:180, height:180, borderRadius:"50%", background:"linear-gradient(135deg,#EEF2FF,#DDD6FE)", border:"3px solid #C7D2FE", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 20px 56px rgba(99,102,241,0.18)" }}>
                <svg width="100" height="100" viewBox="0 0 110 110" fill="none">
                  <rect x="15" y="45" width="80" height="55" rx="4" fill="#E0E7FF"/>
                  <path d="M8 50 L55 18 L102 50 Z" fill="#4F46E5" opacity="0.85"/>
                  <rect x="42" y="72" width="26" height="28" rx="3" fill="#6366F1"/>
                  <circle cx="65" cy="87" r="2" fill="#A5B4FC"/>
                  <rect x="20" y="58" width="20" height="16" rx="3" fill="#fff" opacity="0.9"/>
                  <rect x="70" y="58" width="20" height="16" rx="3" fill="#fff" opacity="0.9"/>
                  <rect x="30" y="36" width="50" height="14" rx="4" fill="#fff" opacity="0.9"/>
                  <text x="55" y="47" textAnchor="middle" fill="#4F46E5" fontSize="7.5" fontWeight="700" fontFamily="Plus Jakarta Sans">StorePulse</text>
                </svg>
              </div>
              <div className="fcard fc1" style={{ top:18, left:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:4 }}>Spice Garden</div>
                <div style={{ display:"flex", gap:3, marginBottom:3 }}>{[1,2,3,4,5].map(s=><Star key={s} size={14} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>)}</div>
                <div style={{ fontSize:10, color:"#9CA3AF" }}>4.9 · 243 reviews</div>
              </div>
              <div className="fcard fc2" style={{ top:22, right:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#4F46E5" }}>P</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#111" }}>Priya just reviewed</div>
                    <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><Star key={s} size={10} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>)}</div>
                  </div>
                </div>
              </div>
              <div className="fcard fc3" style={{ bottom:88, left:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:"#FDF2F8", display:"flex", alignItems:"center", justifyContent:"center" }}><ThumbsUp size={14} style={{ color:"#EC4899" }}/></div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#111" }}>142 helpful votes</div>
                    <div style={{ fontSize:10, color:"#9CA3AF" }}>this week</div>
                  </div>
                </div>
              </div>
              <div className="fcard fc4" style={{ bottom:58, right:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:28, height:28, borderRadius:9, background:"#F0FDF4", display:"flex", alignItems:"center", justifyContent:"center" }}><Award size={13} style={{ color:"#16A34A" }}/></div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#111" }}>Verified Store</div>
                    <div style={{ fontSize:10, color:"#16A34A", fontWeight:600 }}>✓ Trusted</div>
                  </div>
                </div>
              </div>
              <div className="fcard fc5" style={{ top:"43%", right:-12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ position:"relative", width:10, height:10 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:"#4F46E5" }}/>
                    <div style={{ position:"absolute", top:0, left:0, width:10, height:10, borderRadius:"50%", background:"#4F46E5", animation:"ping 1.5s ease infinite" }}/>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:"#4F46E5" }}>New review!</span>
                </div>
              </div>
              {[0,90,180,270].map((deg,i)=>(
                <div key={i} style={{ position:"absolute", top:"50%", left:"50%", width:125, height:125, marginTop:-62, marginLeft:-62, transform:`rotate(${deg}deg)`, pointerEvents:"none" }}>
                  <div style={{ position:"absolute", top:-5, left:"50%", width:8, height:8, borderRadius:"50%", background:["#A5B4FC","#F9A8D4","#FCD34D","#6EE7B7"][i], marginLeft:-4, animation:`f${i+1} ${5+i}s ease-in-out infinite ${i*0.4}s` }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. STATS ══ */}
      {/* ══ 4. CATEGORIES ══ */}
      <section style={{ padding:"clamp(40px,6vw,64px) 0" }}>
        <div className="ss">
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:10 }}>
            <div>
              <p className="sl">Browse</p>
              <h2 className="st">Explore by Category</h2>
              <p className="sb">Find exactly what you're looking for</p>
            </div>
            <button className="lb" onClick={()=>navigate("/explore")}>View all <ArrowRight size={14}/></button>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((cat,i)=>(
              <button key={i} className="cat-btn" onClick={()=>navigate(`/explore?category=${cat.name}`)}>
                <div style={{ width:44, height:44, borderRadius:13, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <cat.icon size={20} style={{ color:cat.color }}/>
                </div>
                <span style={{ fontSize:10, fontWeight:600, color:"#374151", textAlign:"center", lineHeight:1.3 }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* ══ 5. TOP STORES ══ */}
      <section style={{ background:"#F8F9FB", padding:"0 0 clamp(48px,6vw,72px)" }}>
        <div className="ss">
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
            <div>
              <p className="sl">Discover</p>
              <h2 className="st">Top Rated Stores</h2>
              <p className="sb">Highest rated by our community</p>
            </div>
            <button className="lb" onClick={()=>navigate("/explore")}>See all <ArrowRight size={14}/></button>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24, overflowX:"auto", paddingBottom:4, WebkitOverflowScrolling:"touch" }}>
            {["all","restaurant","cafe","grocery","clothing","electronics"].map(t=>(
              <button key={t} className={`tb ${tab===t?"on":""}`} onClick={()=>setTab(t)}>
                {t==="all"?"All":t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <div className="store-grid">
            {fetching
              ? [1,2,3,4,5,6].map(n=><SkeletonCard key={n}/>)
              : (display.length > 0 ? display : shops).length===0
              ? (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"48px 24px", background:"#fff", borderRadius:18, border:"1.5px solid #F1F5F9" }}>
                  <Store size={36} style={{ color:"#E5E7EB", margin:"0 auto 10px" }}/>
                  <p style={{ color:"#9CA3AF", fontSize:14, marginBottom:14 }}>No stores listed yet.</p>
                  <button onClick={()=>navigate("/register?role=shop_owner")} style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)", color:"#fff", border:"none", borderRadius:12, padding:"10px 22px", fontSize:13, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer" }}>List Your Store</button>
                </div>
              )
              : (display.length?display:shops).map(shop=>(
                <div key={shop._id} className="sc" onClick={()=>navigate(`/store/${shop._id}`)}>
                  <div style={{ position:"relative", height:170, overflow:"hidden" }}>
                    <img src={getImage(shop)} alt={shop.name} className="si" onError={(e)=>{e.target.src=FALLBACK;}}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.28) 0%,transparent 55%)" }}/>
                    <span className="pl" style={{ top:10, left:10, background:"rgba(255,255,255,0.92)", color:"#374151" }}>{shop.category}</span>
                    <span className="pl" style={{ top:10, right:10, background:"rgba(255,255,255,0.92)", color:"#92400E", display:"flex", alignItems:"center", gap:3 }}>
                      <Star size={9} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>{shop.avgRating>0?Number(shop.avgRating).toFixed(1):"New"}
                    </span>
                    {shop.isVerified&&<span className="pl" style={{ bottom:10, left:10, background:"rgba(5,150,105,0.9)", color:"#fff" }}>✓ Verified</span>}
                  </div>
                  <div style={{ padding:"14px 16px 16px" }}>
                    <div className="sn">{shop.name}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#9CA3AF", marginBottom:10 }}>
                      <MapPin size={11}/>{getCity(shop)}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ display:"flex", gap:2 }}>
                        {[1,2,3,4,5].map(s=><Star key={s} size={12} style={{ color:s<=(shop.avgRating||0)?"#FBBF24":"#E5E7EB", fill:s<=(shop.avgRating||0)?"#FBBF24":"none" }}/>)}
                      </span>
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>{shop.reviewCount||0} reviews</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </section>
   
      
      {/* ══ 3. MARQUEE ══ */}
      <section style={{ padding:"36px 0", background:"#FAFBFF", overflow:"hidden", borderBottom:"1px solid #F1F5F9" }}>
        <div style={{ maxWidth:1200, margin:"0 auto 14px", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <MessageSquare size={12} style={{ color:"#4F46E5" }}/>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#9CA3AF" }}>What people are saying</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            {[1,2,3,4,5].map(s=><Star key={s} size={12} style={{ fill:"#FBBF24", color:"#FBBF24" }}/>)}
            <span style={{ fontSize:11, color:"#6B7280", marginLeft:5, fontWeight:500 }}>4.9 avg</span>
          </div>
        </div>
        <div className="mw" style={{ marginBottom:10 }}>
          <div className="mt">
            {[...MARQUEE,...MARQUEE].map((r,i)=>(
              <div key={i} className="rc">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><Star key={s} size={11} style={{ color:s<=r.rating?"#FBBF24":"#E5E7EB", fill:s<=r.rating?"#FBBF24":"none" }}/>)}</div>
                  <span style={{ fontSize:9, color:"#9CA3AF", fontWeight:600, background:"#F8F9FB", borderRadius:5, padding:"1px 6px" }}>{r.store}</span>
                </div>
                <p style={{ fontSize:12, color:"#374151", lineHeight:1.5, fontStyle:"italic" }}>"{r.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:ac(r.a), display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>{r.a}</div>
                  <span style={{ fontSize:10, fontWeight:600, color:"#6B7280" }}>{r.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mw">
          <div className="mtr">
            {[...MARQUEE.slice(5),...MARQUEE,...MARQUEE.slice(0,5)].map((r,i)=>(
              <div key={i} className="rc">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><Star key={s} size={11} style={{ color:s<=r.rating?"#FBBF24":"#E5E7EB", fill:s<=r.rating?"#FBBF24":"none" }}/>)}</div>
                  <span style={{ fontSize:9, color:"#9CA3AF", fontWeight:600, background:"#F8F9FB", borderRadius:5, padding:"1px 6px" }}>{r.store}</span>
                </div>
                <p style={{ fontSize:12, color:"#374151", lineHeight:1.5, fontStyle:"italic" }}>"{r.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:ac(r.a), display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>{r.a}</div>
                  <span style={{ fontSize:10, fontWeight:600, color:"#6B7280" }}>{r.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ══ 6. HOW IT WORKS ══ */}
      <section style={{ padding:"clamp(48px,6vw,72px) 0", background:"#fff" }}>
        <div className="ss">
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <p className="sl" style={{ textAlign:"center" }}>Process</p>
            <h2 className="st">How StorePulse Works</h2>
            <p className="sb">Three simple steps to discover and review</p>
          </div>
          <div className="how-grid">
            {[
              { step:"01", title:"Search & Discover", desc:"Search stores by name, category or location. Smart filters help you find exactly what you need.", color:"#4F46E5", bg:"#EEF2FF", icon:Search },
              { step:"02", title:"Visit & Experience", desc:"Visit the store, enjoy their service, and form your own honest opinion about the experience.",   color:"#7C3AED", bg:"#F5F3FF", icon:MapPin },
              { step:"03", title:"Rate & Review",      desc:"Share your experience with a star rating, review and photos. Help thousands make smart choices.", color:"#059669", bg:"#ECFDF5", icon:Star  },
            ].map((item,i)=>(
              <div key={i} className="hwc">
                <div className="stp">{item.step}</div>
                <div style={{ width:48, height:48, borderRadius:14, background:item.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18 }}>
                  <item.icon size={22} style={{ color:item.color }}/>
                </div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:"1rem", fontWeight:700, color:"#0F172A", marginBottom:8 }}>{item.title}</h3>
                <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. ANIMATED RATINGS ══ */}
      <section ref={ratingRef} style={{ padding:"clamp(48px,6vw,72px) 0", background:"linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 50%,#FDF4FF 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(#C7D2FE 1px, transparent 1px)", backgroundSize:"24px 24px", opacity:0.3, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,#DDD6FE 0%,transparent 70%)", top:-80, right:-50, pointerEvents:"none" }}/>
        <div className="ss" style={{ position:"relative" }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <p className="sl" style={{ textAlign:"center" }}>Community Trust</p>
            <h2 className="st">Ratings That Actually Matter</h2>
            <p className="sb">18,960+ verified reviews across India</p>
          </div>
          <div className="rating-grid">
            {/* Animated bars */}
            <div style={{ background:"#fff", borderRadius:22, padding:"24px 24px", boxShadow:"0 16px 48px rgba(99,102,241,0.1)", border:"1.5px solid #E0E7FF" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:"0.95rem", color:"#0F172A" }}>Ratings by Category</h3>
                <span style={{ fontSize:10, color:"#10B981", fontWeight:700, background:"#ECFDF5", borderRadius:100, padding:"3px 9px", display:"flex", alignItems:"center", gap:3 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:"#10B981" }}/> Live
                </span>
              </div>
              {RATING_DATA.map((r,i)=>(
                <RatingRow key={r.label} {...r} delay={i*0.12} started={ratingStarted}/>
              ))}
              <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:500 }}>18,960+ verified reviews</span>
                <button className="lb" onClick={()=>navigate("/explore")} style={{ fontSize:12 }}>Explore <ArrowRight size={11}/></button>
              </div>
            </div>

            {/* Trust stat cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { icon:Star,       value:"4.7★",  label:"Average platform rating",     color:"#F59E0B", bg:"#FFFBEB" },
                { icon:TrendingUp, value:"2.4K",  label:"New reviews every month",     color:"#4F46E5", bg:"#EEF2FF" },
                { icon:ThumbsUp,   value:"98%",   label:"Users find reviews helpful",  color:"#10B981", bg:"#ECFDF5" },
                { icon:Users,      value:"50K+",  label:"Active community members",    color:"#EC4899", bg:"#FDF2F8" },
                { icon:Shield,     value:"100%",  label:"Reviews from real customers", color:"#7C3AED", bg:"#F5F3FF" },
                { icon:Award,      value:"2,400+",label:"Verified stores listed",      color:"#0891B2", bg:"#ECFEFF" },
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", borderRadius:14, padding:"13px 16px", border:"1.5px solid #F1F5F9", opacity:ratingStarted?1:0, transform:ratingStarted?"translateX(0)":"translateX(24px)", transition:`all 0.5s ${i*0.08}s ease` }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <s.icon size={18} style={{ color:s.color }}/>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.1rem", fontWeight:700, color:"#0F172A", lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"#9CA3AF", marginTop:3, fontWeight:500 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 8. CTA ══ */}
      <section style={{ background:"#FAFBFF", padding:"clamp(48px,6vw,72px) 0" }}>
        <div className="ss">
          <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius:24, padding:"clamp(32px,5vw,48px) clamp(24px,5vw,44px)", border:"1.5px solid #C7D2FE", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,#C7D2FE 0%,transparent 70%)", top:-70, right:-40, opacity:0.5, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", backgroundImage:"radial-gradient(#C7D2FE 1px,transparent 1px)", backgroundSize:"20px 20px", inset:0, opacity:0.2, pointerEvents:"none" }}/>
            <div className="cta-inner" style={{ position:"relative" }}>
              <div style={{ maxWidth:480 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:100, padding:"5px 12px", marginBottom:14, fontSize:11, fontWeight:700, color:"#4F46E5" }}>
                  <Shield size={11}/> For Business Owners
                </div>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(1.4rem,3vw,2.1rem)", fontWeight:700, color:"#0F172A", marginBottom:12, lineHeight:1.2 }}>
                  Grow Your Business<br/>with StorePulse
                </h2>
                <p style={{ fontSize:14, color:"#64748B", lineHeight:1.75 }}>List your store, respond to reviews, post deals, and track growth with powerful analytics.</p>
              </div>
              <div className="cta-btns" style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <button onClick={()=>navigate("/register?role=shop_owner")} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", color:"#fff", border:"none", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"12px 22px", borderRadius:11 }}>
                  <Store size={14}/> List Your Store
                </button>
                <button onClick={()=>navigate("/explore")} style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#fff", color:"#4F46E5", border:"2px solid #C7D2FE", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"12px 22px", borderRadius:11 }}>
                  Learn More <ArrowRight size={13}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"32px 0" }}>
        <div className="ss stats-grid">
          {[
            { label:"Stores Listed",  value:"2,400+", icon:Store, color:"#4F46E5", bg:"#EEF2FF" },
            { label:"Reviews Posted", value:"18K+",   icon:Star,  color:"#F59E0B", bg:"#FFFBEB" },
            { label:"Cities Covered", value:"12+",    icon:MapPin,color:"#10B981", bg:"#ECFDF5" },
            { label:"Happy Users",    value:"50K+",   icon:Users, color:"#EC4899", bg:"#FDF2F8" },
          ].map((s,i)=>(
            <div key={i} className="stc">
              <div style={{ width:44, height:44, borderRadius:13, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                <s.icon size={20} style={{ color:s.color }}/>
              </div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:"1.5rem", fontWeight:700, color:"#0F172A" }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 9. FOOTER ══ */}
      <footer style={{ background:"#0F172A", padding:"clamp(40px,5vw,56px) 0 28px" }}>
        <div className="ss">
          <div className="footer-grid" style={{ marginBottom:40 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:12 }}>
                <div style={{ width:34, height:34, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Store size={17} style={{ color:"#fff" }}/>
                </div>
                <span style={{ fontSize:"1rem", fontWeight:800, color:"#fff", fontFamily:"'Fraunces',serif" }}>StorePulse</span>
              </div>
              <p style={{ fontSize:12, lineHeight:1.8, maxWidth:280, color:"rgba(255,255,255,0.4)" }}>Helping people discover great local businesses through honest community reviews.</p>
            </div>
            {[
              { title:"Explore",  links:[["All Stores","/explore"],["Top Rated","/explore?sort=rating"],["New Arrivals","/explore?sort=newest"]] },
              { title:"Account",  links:[["Login","/login"],["Register","/register"],["Profile","/profile"]] },
              { title:"Business", links:[["List Store","/register?role=shop_owner"],["Dashboard","/owner/dashboard"],["Analytics","/owner/analytics"]] },
            ].map(col=>(
              <div key={col.title}>
                <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:14 }}>{col.title}</p>
                {col.links.map(([label,path])=>(
                  <button key={label} className="fl" onClick={()=>navigate(path)}>{label}</button>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:20, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>© 2025 StorePulse. All rights reserved.</p>
            <div style={{ display:"flex", gap:16 }}>
              {["Privacy","Terms","Contact"].map(l=>(
                <button key={l} className="fl" style={{ display:"inline", fontSize:11 }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}