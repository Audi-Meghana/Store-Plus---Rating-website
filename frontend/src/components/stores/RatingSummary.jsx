import { Star, MessageSquare, TrendingUp, Award } from "lucide-react";

/* ── RatingSummary ── */
const RatingSummary = ({ shop, reviews = [] }) => {
  const avgRating   = shop?.avgRating   ?? 0;
  const reviewCount = shop?.reviewCount ?? reviews.length ?? 0;

  // Breakdown from passed reviews array or calculate from shop data
  const breakdown = [5, 4, 3, 2, 1].reduce((acc, n) => {
    acc[n] = reviews.filter(r => r.rating === n).length;
    return acc;
  }, {});

  const total = reviews.length || reviewCount || 1;

  // Sentiment label
  const sentiment =
    avgRating >= 4.5 ? { label: "Excellent",   color: "#16A34A", bg: "#DCFCE7" } :
    avgRating >= 4.0 ? { label: "Very Good",   color: "#2563EB", bg: "#DBEAFE" } :
    avgRating >= 3.5 ? { label: "Good",        color: "#D97706", bg: "#FEF3C7" } :
    avgRating >= 3.0 ? { label: "Average",     color: "#EA580C", bg: "#FFEDD5" } :
                       { label: "Needs Work",  color: "#DC2626", bg: "#FEE2E2" };

  const ratingColor =
    avgRating >= 4.5 ? "#22C55E" :
    avgRating >= 4.0 ? "#3B82F6" :
    avgRating >= 3.5 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #F1F5F9", padding: "20px 18px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .rs-bar-fill { transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Star size={14} style={{ color: "#FBBF24", fill: "#FBBF24" }} /> Ratings & Reviews
      </h3>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>

        {/* Big rating number */}
        <div style={{ textAlign: "center", flexShrink: 0, minWidth: 80 }}>
          <div style={{ fontSize: "3rem", fontWeight: 800, color: ratingColor, lineHeight: 1 }}>
            {Number(avgRating).toFixed(1)}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 2, margin: "7px 0 5px" }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={14} style={{
                color: s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB",
                fill:  s <= Math.round(avgRating) ? "#FBBF24" : "#E5E7EB",
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 100, background: sentiment.bg, color: sentiment.color }}>
            {sentiment.label}
          </span>
        </div>

        {/* Rating bars */}
        <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 6 }}>
          {[5, 4, 3, 2, 1].map(n => {
            const count = breakdown[n] ?? 0;
            const pct   = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            const barColor = n >= 4 ? "#22C55E" : n === 3 ? "#F59E0B" : "#EF4444";
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 11, color: "#6B7280", width: 8, textAlign: "right", flexShrink: 0 }}>{n}</span>
                <Star size={9} style={{ color: "#FBBF24", fill: "#FBBF24", flexShrink: 0 }} />
                <div style={{ flex: 1, height: 7, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
                  <div
                    className="rs-bar-fill"
                    style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: barColor }}
                  />
                </div>
                <span style={{ fontSize: 10, color: "#9CA3AF", width: 26, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16 }}>
        {[
          { icon: MessageSquare, color: "#2563EB", bg: "#EFF6FF", value: reviewCount, label: "Reviews" },
          { icon: TrendingUp,    color: "#16A34A", bg: "#DCFCE7", value: `${Number(avgRating).toFixed(1)}★`, label: "Avg Rating" },
          { icon: Award,         color: "#D97706", bg: "#FEF3C7", value: sentiment.label, label: "Sentiment" },
        ].map(({ icon: Icon, color, bg, value, label }, i) => (
          <div key={i} style={{ background: bg, borderRadius: 11, padding: "10px 8px", textAlign: "center" }}>
            <Icon size={13} style={{ color, margin: "0 auto 4px", display: "block" }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingSummary;