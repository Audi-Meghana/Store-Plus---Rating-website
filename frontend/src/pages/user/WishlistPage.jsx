import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, MapPin, Star, Trash2, ChevronRight,
  Loader2, AlertCircle, Store, Compass,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
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

// ── helpers ───────────────────────────────────────────────────────────────────
const safeArray = (res, ...keys) => {
  const root  = res?.data ?? res;
  const inner = root?.data ?? root;
  for (const k of keys) {
    if (Array.isArray(inner?.[k])) return inner[k];
    if (Array.isArray(root?.[k]))  return root[k];
  }
  if (Array.isArray(inner)) return inner;
  if (Array.isArray(root))  return root;
  return [];
};

// category → gradient for no-image placeholder
const CAT_GRADIENT = {
  Restaurant: "from-orange-400 to-red-400",
  Cafe:       "from-amber-400 to-orange-400",
  Clothing:   "from-pink-400 to-rose-500",
  Electronics:"from-blue-400 to-indigo-500",
  Grocery:    "from-green-400 to-emerald-500",
  Pharmacy:   "from-cyan-400 to-blue-400",
  Salon:      "from-purple-400 to-pink-400",
  Gym:        "from-slate-500 to-slate-700",
};
const CAT_ICON = {
  Restaurant:"🍽️", Cafe:"☕", Clothing:"👗", Electronics:"📱",
  Grocery:"🛒", Pharmacy:"💊", Salon:"✂️", Gym:"💪",
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError("");
        const res = await api.get("/users/me/wishlist");
        setItems(safeArray(res, "data", "wishlist", "shops", "stores"));
      } catch (err) {
        setError(err.response?.data?.message ?? "Failed to load your wishlist.");
      } finally { setLoading(false); }
    })();
  }, []);

  const handleRemove = async (e, shopId) => {
    e.stopPropagation();
    try {
      setRemoving(shopId);
      await api.post(`/users/me/wishlist/${shopId}`);
      setItems(prev => prev.filter(s => (s._id ?? s.id) !== shopId));
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to remove store.");
    } finally { setRemoving(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
         style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');
        @keyframes wl-spin { to { transform: rotate(360deg); } }
        @keyframes wl-in   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .wl-heading  { font-family: 'Bricolage Grotesque', sans-serif; }
        .wl-card     { animation: wl-in .35s cubic-bezier(.4,0,.2,1) both; }
        .wl-card:nth-child(1){ animation-delay:.04s }
        .wl-card:nth-child(2){ animation-delay:.08s }
        .wl-card:nth-child(3){ animation-delay:.12s }
        .wl-card:nth-child(4){ animation-delay:.16s }
        .wl-card:nth-child(5){ animation-delay:.20s }
        .wl-spin { animation: wl-spin .8s linear infinite; }
      `}</style>

      <Navbar />

      {/* ── HERO STRIP ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0A1628] via-[#0F2255] to-[#1E3A8A]">
        {/* orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 bg-blue-500 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10 bg-blue-400 blur-2xl pointer-events-none" />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage:"radial-gradient(rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize:"24px 24px" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-9">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Heart size={15} className="text-red-300 fill-red-300" />
            </div>
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Your Collection</span>
          </div>
          <h1 className="wl-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-1">
            Saved Stores
          </h1>
          {!loading && !error && (
            <p className="text-white/40 text-sm font-medium">
              {items.length} {items.length === 1 ? "store" : "stores"} saved
            </p>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 -mt-5 pb-20 relative z-10">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="wl-spin text-blue-600" />
            <p className="text-sm text-slate-400 font-medium">Loading your wishlist…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-600 text-sm mt-4">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && items.length === 0 && (
          <div className="mt-4 bg-white border border-slate-100 rounded-3xl shadow-sm px-8 py-16 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-50 rounded-full animate-ping opacity-30" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-full flex items-center justify-center">
                <Heart size={32} className="text-red-300" />
              </div>
            </div>
            <h3 className="wl-heading text-xl font-extrabold text-slate-900 mb-2">
              No saved stores yet
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Explore stores and tap the heart icon to save your favourites here.
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Compass size={15} /> Explore Stores
            </button>
          </div>
        )}

        {/* ── List ── */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            {items.map((store, idx) => {
              const id       = store._id ?? store.id;
              const name     = store.name ?? store.shopId?.name ?? "Unnamed Store";
              const category = store.category ?? store.shopId?.category ?? "";
              const location = store.city ?? store.location?.city ?? store.location?.address
                            ?? store.location ?? store.shopId?.city ?? "";
              const rating   = store.avgRating ?? store.averageRating ?? store.rating;
              const reviews  = store.reviewCount ?? store.totalReviews ?? store.reviews;
              const rawImg   = store.cover?.url ?? store.logo?.url ?? store.gallery?.[0]?.url
                            ?? store.image ?? store.coverImage ?? store.shopId?.image;
              const image    = getImageUrl(rawImg);
              const grad     = CAT_GRADIENT[category] || "from-blue-400 to-indigo-500";
              const catIcon  = CAT_ICON[category] || "🏪";
              const isOpen   = store.isOpen;

              return (
                <div
                  key={id}
                  className="wl-card group bg-white border border-slate-100 rounded-2xl overflow-hidden
                             flex items-stretch cursor-pointer
                             shadow-sm hover:shadow-xl hover:shadow-slate-200/60
                             hover:-translate-y-1 transition-all duration-250 border-transparent
                             hover:border-blue-100"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => navigate(`/store/${id}`)}
                >
                  {/* ── Image / Placeholder ── */}
                  <div className="relative w-28 sm:w-36 flex-shrink-0 overflow-hidden">
                    {image ? (
                      <>
                        <img
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                        />
                        {/* fallback hidden behind */}
                        <div className={`hidden w-full h-full bg-gradient-to-br ${grad} items-center justify-center text-3xl absolute inset-0`}>
                          {catIcon}
                        </div>
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center text-3xl`}>
                        {catIcon}
                      </div>
                    )}

                    {/* open/closed pill */}
                    {isOpen !== undefined && (
                      <div className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border
                        ${isOpen
                          ? "bg-green-500/80 border-green-400/40 text-white"
                          : "bg-slate-800/70 border-slate-600/40 text-slate-200"}`}>
                        {isOpen ? "● Open" : "Closed"}
                      </div>
                    )}
                  </div>

                  {/* ── Info ── */}
                  <div className="flex-1 min-w-0 px-4 py-4 flex flex-col justify-center gap-1.5">
                    {/* name + category */}
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base leading-tight truncate">
                        {name}
                      </span>
                      {category && (
                        <span className="flex-shrink-0 bg-blue-50 text-blue-600 text-[10.5px] font-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                          {catIcon} {category}
                        </span>
                      )}
                    </div>

                    {/* location + rating */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {location && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <MapPin size={11} /> {location}
                        </span>
                      )}
                      {rating != null && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {Number(rating).toFixed(1)}
                          {reviews != null && (
                            <span className="text-slate-400 font-normal">({reviews})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Actions ── */}
                  <div className="flex flex-col items-center justify-center gap-2 pr-4 pl-2 py-4 flex-shrink-0">
                    <button
                      disabled={removing === id}
                      onClick={e => handleRemove(e, id)}
                      title="Remove from wishlist"
                      className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center
                                 hover:bg-red-100 hover:border-red-200 transition-colors duration-150
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {removing === id
                        ? <Loader2 size={14} className="wl-spin text-red-500" />
                        : <Trash2  size={14} className="text-red-400" />}
                    </button>
                    <ChevronRight size={16}
                      className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* count footer */}
        {!loading && !error && items.length > 0 && (
          <p className="text-center text-xs text-slate-400 font-medium mt-8">
            {items.length} saved {items.length === 1 ? "store" : "stores"}
          </p>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;