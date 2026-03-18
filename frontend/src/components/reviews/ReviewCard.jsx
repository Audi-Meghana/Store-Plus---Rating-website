import { useState } from "react";
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp, Reply, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

// ── URL fixer (fallback if not passed as prop) ────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

const defaultGetImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

// ── helpers ───────────────────────────────────────────────────────────────────
const StarDisplay = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size}
        className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
    ))}
  </div>
);

const RatingBadge = ({ rating }) => {
  const cls = rating >= 4
    ? "bg-green-50 text-green-600 border-green-100"
    : rating === 3
    ? "bg-yellow-50 text-yellow-600 border-yellow-100"
    : "bg-red-50 text-red-500 border-red-100";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {rating}.0 ★
    </span>
  );
};

const AVATAR_COLORS = [
  "from-blue-400 to-indigo-500",
  "from-green-400 to-teal-500",
  "from-pink-400 to-rose-500",
  "from-yellow-400 to-orange-500",
  "from-purple-400 to-violet-500",
  "from-cyan-400 to-blue-500",
];
const getColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  // close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      onClick={onBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,.88)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 18,
        background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
        borderRadius: "50%", width: 38, height: 38,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "#fff",
      }}>
        <X size={18} />
      </button>

      {/* prev */}
      {images.length > 1 && (
        <button onClick={prev} style={{
          position: "absolute", left: 16,
          background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
          borderRadius: "50%", width: 42, height: 42,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff",
        }}>
          <ChevronLeft size={20} />
        </button>
      )}

      {/* image */}
      <img
        src={images[idx]}
        alt={`Review photo ${idx + 1}`}
        style={{
          maxWidth: "90vw", maxHeight: "85vh",
          objectFit: "contain", borderRadius: 12,
          boxShadow: "0 24px 80px rgba(0,0,0,.5)",
        }}
        onError={(e) => { e.target.style.display = "none"; }}
      />

      {/* next */}
      {images.length > 1 && (
        <button onClick={next} style={{
          position: "absolute", right: 16,
          background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
          borderRadius: "50%", width: 42, height: 42,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#fff",
        }}>
          <ChevronRight size={20} />
        </button>
      )}

      {/* counter */}
      {images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 20,
          background: "rgba(0,0,0,.5)", borderRadius: 100,
          padding: "4px 14px", fontSize: 12, fontWeight: 600, color: "#fff",
        }}>
          {idx + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// ── ReviewCard ────────────────────────────────────────────────────────────────
/**
 * Props:
 *   review       — review object from API
 *   shopId       — used for helpful/report API calls
 *   getImageUrl  — URL fixer passed from ReviewList (falls back to local helper)
 *   showShop     — show shop name (for user profile page)
 *   onDelete     — optional callback after delete
 */
const ReviewCard = ({ review, shopId, getImageUrl, showShop = false, onDelete }) => {
  // use passed helper or local fallback
  const fixUrl = getImageUrl ?? defaultGetImageUrl;

  const id         = review._id ?? review.id;
  const authorName = review.user?.name ?? review.author ?? "Anonymous";
  const initials   = authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const dateStr    = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const reviewText = review.text ?? review.comment ?? review.body ?? "";
  const ownerReply = review.ownerReply?.text ?? "";

  // ── resolve photos — handle all backend shapes ────────────────────────────
  // could be: string[], {url:string}[], {url:string, _id:string}[]
  const rawPhotos = review.photos ?? review.images ?? review.media ?? [];
  const photoUrls = rawPhotos
    .map((p) => fixUrl(typeof p === "string" ? p : p?.url ?? p?.path ?? null))
    .filter(Boolean);

  const [helpful,        setHelpful]        = useState(review.helpfulVotes?.length ?? review.helpful ?? 0);
  const [helpfulClicked, setHelpfulClicked] = useState(false);
  const [expanded,       setExpanded]       = useState(false);
  const [reported,       setReported]       = useState(false);
  const [lightbox,       setLightbox]       = useState(null); // index | null

  const handleHelpful = async () => {
    if (helpfulClicked) return;
    try {
      await api.post(`/shops/${shopId}/reviews/${id}/helpful`);
    } catch { /* optimistic — ignore error */ }
    setHelpful((h) => h + 1);
    setHelpfulClicked(true);
  };

  const handleReport = () => setReported(true);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getColor(authorName)} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{authorName}</div>
              {review.user?.city && (
                <div className="text-xs text-gray-400">{review.user.city}</div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <RatingBadge rating={review.rating} />
            <span className="text-xs text-gray-400">{dateStr}</span>
          </div>
        </div>

        {/* Stars */}
        <StarDisplay rating={review.rating} size={13} />

        {/* Shop name (user profile) */}
        {showShop && review.shop?.name && (
          <div className="text-xs text-blue-600 font-medium mt-2">
            @ {review.shop.name}
          </div>
        )}

        {/* Review text */}
        {reviewText && (
          <div className="mt-3">
            <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && reviewText.length > 200 ? "line-clamp-3" : ""}`}>
              {reviewText}
            </p>
            {reviewText.length > 200 && (
              <button onClick={() => setExpanded((e) => !e)}
                className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1 hover:text-blue-700">
                {expanded ? <><ChevronUp size={11} /> Show less</> : <><ChevronDown size={11} /> Read more</>}
              </button>
            )}
          </div>
        )}

        {/* Aspect ratings */}
        {review.aspects && Object.keys(review.aspects).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(review.aspects).map(([key, val]) => val > 0 && (
              <span key={key} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 rounded-full px-2.5 py-1 font-medium">
                {key.charAt(0).toUpperCase() + key.slice(1)}: {val}/5
              </span>
            ))}
          </div>
        )}

        {/* ── Photos — fixed URLs + lightbox ── */}
        {photoUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {photoUrls.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                style={{
                  width: 72, height: 72, flexShrink: 0,
                  borderRadius: 10, overflow: "hidden",
                  border: "1.5px solid #E5E7EB",
                  cursor: "pointer", padding: 0, background: "#F3F4F6",
                  transition: "transform .18s, box-shadow .18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "none"; }}
              >
                <img
                  src={src}
                  alt={`Review photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Owner reply */}
        {ownerReply && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
              <Reply size={11} /> Owner replied
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">{ownerReply}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          <button onClick={handleHelpful}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              helpfulClicked ? "bg-blue-50 text-blue-500" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
            }`}>
            <ThumbsUp size={12} /> Helpful ({helpful})
          </button>
          {!reported ? (
            <button onClick={handleReport}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              <Flag size={12} /> Report
            </button>
          ) : (
            <span className="text-xs text-gray-400 px-3 py-1.5">Reported</span>
          )}
        </div>
      </div>

      {/* Lightbox — rendered outside card so it's not clipped */}
      {lightbox !== null && (
        <Lightbox
          images={photoUrls}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
};

export default ReviewCard;