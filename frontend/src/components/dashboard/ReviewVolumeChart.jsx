import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const PERIOD_LABELS = {
  "7d": "Daily · last 7 days",
  "6w": "Weekly · last 6 weeks",
  "7m": "Monthly · last 7 months",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #F1F5F9",
      borderRadius: 12, padding: "9px 13px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.09)", fontSize: 12,
    }}>
      <p style={{ fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
        <span style={{ color: "#9CA3AF" }}>{payload[0].name}:</span>
        <span style={{ fontWeight: 700, color: "#111" }}>{payload[0].value}</span>
      </div>
    </div>
  );
};

const ReviewVolumeChart = ({ onNavigate }) => {
  const [period,    setPeriod]    = useState("6w");
  const [analytics, setAnalytics] = useState({ daily: [], weekly: [], monthly: [] });

  useEffect(() => {
    axios.get("/api/owner/analytics/review-volume")
      .then(res => setAnalytics({
        daily:   res.data.daily   || [],
        weekly:  res.data.weekly  || [],
        monthly: res.data.monthly || [],
      }))
      .catch(console.error);
  }, []);

  const data = period === "7d" ? analytics.daily
             : period === "6w" ? analytics.weekly
             : analytics.monthly;

  const labelKey      = period === "7d" ? "day" : period === "6w" ? "week" : "month";
  const total         = data.reduce((s, d) => s + (d.reviews ?? 0), 0);
  const latest        = data[data.length - 1]?.reviews ?? 0;
  const prev          = data[data.length - 2]?.reviews ?? 0;
  const isTrendingUp  = latest >= prev;
  const diff          = latest - prev;

  return (
    <div style={{
      background: "#fff", borderRadius: 20,
      border: "1.5px solid #F1F5F9", overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header ── */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>

          {/* Title */}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0, lineHeight: 1.2 }}>
              Review Volume
            </h2>
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
              {PERIOD_LABELS[period]}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
            {/* Period toggle */}
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, gap: 2 }}>
              {["7d", "6w", "7m"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: "5px 10px", borderRadius: 8, border: "none",
                  cursor: "pointer", fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit",
                  background: period === p ? "#fff"      : "transparent",
                  color:      period === p ? "#2563EB"   : "#9CA3AF",
                  boxShadow:  period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Full analytics link */}
            {onNavigate && (
              <button onClick={onNavigate} style={{
                display: "flex", alignItems: "center", gap: 3,
                fontSize: 11, fontWeight: 600, color: "#2563EB",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", padding: "5px 2px",
                whiteSpace: "nowrap",
              }}>
                Full analytics <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Trend + total row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100,
            background: isTrendingUp ? "#DCFCE7" : "#FEE2E2",
            color:      isTrendingUp ? "#15803D" : "#DC2626",
          }}>
            {isTrendingUp
              ? <TrendingUp  size={11} />
              : <TrendingDown size={11} />}
            {isTrendingUp ? "Trending up" : "Trending down"}
            {diff !== 0 && (
              <span style={{ opacity: 0.75 }}>
                ({isTrendingUp ? "+" : ""}{diff})
              </span>
            )}
          </span>

          <span style={{ fontSize: 11, color: "#CBD5E1", fontWeight: 500 }}>
            {total} total in period
          </span>
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ padding: "0 4px 16px" }}>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} margin={{ top: 2, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey={labelKey}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false} tickLine={false} width={24}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
            <Bar
              dataKey="reviews" name="Reviews"
              fill="#3b82f6" radius={[4, 4, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewVolumeChart;