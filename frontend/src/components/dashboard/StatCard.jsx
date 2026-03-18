import { useEffect, useState } from "react";
import {
  Star, MessageSquare, Eye, Target,
  ArrowUp, ArrowDown,
} from "lucide-react";
import axios from "axios";

/* ── Single Card ─────────────────────────────────────────────────────────────*/
export const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, borderColor, change, up }) => (
  <div style={{
    background: "#fff",
    borderRadius: 18,
    border: `1.5px solid ${borderColor}`,
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    transition: "box-shadow 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
  >
    {/* Icon + badge row */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>

      {change !== undefined && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 11, fontWeight: 700,
          padding: "3px 9px", borderRadius: 100,
          background: up ? "#DCFCE7" : "#FEE2E2",
          color:      up ? "#15803D" : "#DC2626",
        }}>
          {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {change}
        </span>
      )}
    </div>

    {/* Value */}
    <p style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1, margin: 0 }}>
      {value}
    </p>

    {/* Label */}
    <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 5, marginBottom: 2 }}>
      {label}
    </p>

    {/* Sub */}
    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
      {sub}
    </p>
  </div>
);

/* ── Grid ────────────────────────────────────────────────────────────────────*/
const CARD_THEMES = [
  { iconBg: "#FEFCE8", iconColor: "#CA8A04", borderColor: "#FEF08A" },
  { iconBg: "#EFF6FF", iconColor: "#2563EB", borderColor: "#BFDBFE" },
  { iconBg: "#F5F3FF", iconColor: "#7C3AED", borderColor: "#DDD6FE" },
  { iconBg: "#F0FDF4", iconColor: "#16A34A", borderColor: "#BBF7D0" },
];

const StatCardGrid = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get("/api/owner/dashboard/stats")
      .then(({ data }) => {
        setStats([
          {
            label: "Overall Rating",
            value: data.overallRating?.toFixed(1) ?? "0.0",
            sub:   "out of 5.0",
            icon:  Star,
            change: `+${data.ratingChange  ?? 0}`,
            up:     (data.ratingChange  ?? 0) >= 0,
          },
          {
            label: "Total Reviews",
            value: data.totalReviews ?? 0,
            sub:   "all time",
            icon:  MessageSquare,
            change: `+${data.reviewChange  ?? 0}`,
            up:     (data.reviewChange  ?? 0) >= 0,
          },
          {
            label: "Profile Views",
            value: data.profileViews ?? 0,
            sub:   "this month",
            icon:  Eye,
            change: `+${data.viewsChange  ?? 0}%`,
            up:     (data.viewsChange   ?? 0) >= 0,
          },
          {
            label: "Growth Score",
            value: data.growthScore ?? 0,
            sub:   "out of 100",
            icon:  Target,
            change: `+${data.growthChange ?? 0}pts`,
            up:     (data.growthChange  ?? 0) >= 0,
          },
        ]);
      })
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }}
        className="stat-card-grid"
      >
        <style>{`
          @media (min-width: 640px)  { .stat-card-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
          @media (min-width: 1024px) { .stat-card-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }
          @media (max-width: 360px)  { .stat-card-grid { grid-template-columns: 1fr; } }
        `}</style>

        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} {...CARD_THEMES[i]} />
        ))}
      </div>
    </>
  );
};

export default StatCardGrid;