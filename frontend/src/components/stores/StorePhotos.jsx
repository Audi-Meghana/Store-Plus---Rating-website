import { useState, useEffect, useCallback } from "react";
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn, Image } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api$/, "").replace(/\/$/, "");

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
};

const FALLBACK = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80";

/* ── StorePhotos ── */
const StorePhotos = ({ shop }) => {
  const [lightbox, setLightbox] = useState(null); // index or null
  const [imgErrors, setImgErrors] = useState({});

  // Build image list from cover, logo, gallery
  const images = [];
  if (shop?.cover?.url)  images.push({ url: getImageUrl(shop.cover.url),  label: "Cover" });
  if (shop?.logo?.url)   images.push({ url: getImageUrl(shop.logo.url),   label: "Logo" });
  (shop?.gallery ?? []).forEach((g, i) => {
    if (g?.url) images.push({ url: getImageUrl(g.url), label: `Photo ${i + 1}` });
  });

  const validImages = images.filter(img => img.url);

  // Keyboard nav for lightbox
  const handleKey = useCallback((e) => {
    if (lightbox === null) return;
    if (e.key === "ArrowRight") setLightbox(i => (i + 1) % validImages.length);
    if (e.key === "ArrowLeft")  setLightbox(i => (i - 1 + validImages.length) % validImages.length);
    if (e.key === "Escape")     setLightbox(null);
  }, [lightbox, validImages.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (validImages.length === 0) {
    return (
      <div style={{ background: "#F8FAFC", borderRadius: 18, border: "1.5px dashed #E2E8F0", padding: "40px 24px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <Image size={32} style={{ color: "#CBD5E1", margin: "0 auto 10px" }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>No photos yet</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .sp-thumb { cursor:pointer; overflow:hidden; border-radius:12px; position:relative; background:#F1F5F9; }
        .sp-thumb img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s ease; }
        .sp-thumb:hover img { transform:scale(1.06); }
        .sp-thumb-overlay { position:absolute; inset:0; background:rgba(0,0,0,0); transition:background 0.2s; border-radius:12px; display:flex; align-items:center; justify-content:center; }
        .sp-thumb:hover .sp-thumb-overlay { background:rgba(0,0,0,0.18); }
        .sp-zoom { opacity:0; transition:opacity 0.2s; }
        .sp-thumb:hover .sp-zoom { opacity:1; }
        @keyframes sp-fade { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* ── Grid layout ── */}
      {validImages.length === 1 ? (
        /* Single image */
        <div className="sp-thumb" style={{ height: 240 }} onClick={() => setLightbox(0)}>
          <img src={imgErrors[0] ? FALLBACK : validImages[0].url} alt={validImages[0].label} onError={() => setImgErrors(e => ({ ...e, 0: true }))} />
          <div className="sp-thumb-overlay"><ZoomIn size={22} className="sp-zoom" style={{ color: "#fff" }} /></div>
        </div>
      ) : validImages.length === 2 ? (
        /* Two images side by side */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {validImages.slice(0, 2).map((img, i) => (
            <div key={i} className="sp-thumb" style={{ height: 200 }} onClick={() => setLightbox(i)}>
              <img src={imgErrors[i] ? FALLBACK : img.url} alt={img.label} onError={() => setImgErrors(e => ({ ...e, [i]: true }))} />
              <div className="sp-thumb-overlay"><ZoomIn size={18} className="sp-zoom" style={{ color: "#fff" }} /></div>
            </div>
          ))}
        </div>
      ) : (
        /* 3+ images: hero + grid */
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Hero */}
          <div className="sp-thumb" style={{ height: 220 }} onClick={() => setLightbox(0)}>
            <img src={imgErrors[0] ? FALLBACK : validImages[0].url} alt={validImages[0].label} onError={() => setImgErrors(e => ({ ...e, 0: true }))} />
            <div className="sp-thumb-overlay"><ZoomIn size={22} className="sp-zoom" style={{ color: "#fff" }} /></div>
          </div>

          {/* Thumbnail strip */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {validImages.slice(1, 5).map((img, i) => {
              const idx     = i + 1;
              const isLast  = i === 3 && validImages.length > 5;
              return (
                <div key={idx} className="sp-thumb" style={{ flex: "1 1 60px", height: 64, minWidth: 60, maxWidth: 90 }} onClick={() => setLightbox(idx)}>
                  <img src={imgErrors[idx] ? FALLBACK : img.url} alt={img.label} onError={() => setImgErrors(e => ({ ...e, [idx]: true }))} />
                  <div className="sp-thumb-overlay">
                    {isLast ? (
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>+{validImages.length - 5}</span>
                    ) : (
                      <ZoomIn size={14} className="sp-zoom" style={{ color: "#fff" }} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Count chip */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 12px", borderRadius: 12, background: "#F3F4F6", fontSize: 11, fontWeight: 700, color: "#6B7280", flexShrink: 0 }}>
              <Camera size={12} /> {validImages.length}
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "sp-fade 0.2s ease",
          }}
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 16, right: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>

          {/* Counter */}
          <span style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>
            {lightbox + 1} / {validImages.length}
          </span>

          {/* Prev */}
          {validImages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + validImages.length) % validImages.length); }}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Image */}
          <img
            src={imgErrors[lightbox] ? FALLBACK : validImages[lightbox]?.url}
            alt={validImages[lightbox]?.label}
            onClick={e => e.stopPropagation()}
            onError={() => setImgErrors(e => ({ ...e, [lightbox]: true }))}
            style={{ maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
          />

          {/* Next */}
          {validImages.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % validImages.length); }}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Label */}
          <span style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>
            {validImages[lightbox]?.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default StorePhotos;