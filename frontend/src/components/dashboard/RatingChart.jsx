import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import axios from "axios";

const PERIOD_LABELS = {
  "7d": "Last 7 days",
  "6w": "Last 6 weeks",
  "7m": "Last 7 months",
};

/* ── Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #F1F5F9",
      borderRadius: 12, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)", fontSize: 12,
    }}>
      <p style={{ fontWeight: 700, color: "#374151", marginBottom: 6 }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          <span style={{ color: "#9CA3AF" }}>{entry.name}:</span>
          <span style={{ fontWeight: 700, color: "#111" }}>
            {entry.name === "Rating" ? entry.value.toFixed(1) + " ★" : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Dot ── */
const CustomDot = ({ cx, cy, value }) => {
  if (!cx || !cy) return null;
  const color = value >= 4.5 ? "#22c55e" : value >= 4.0 ? "#3b82f6" : value >= 3.5 ? "#eab308" : "#ef4444";
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
};

/* ── Trend badge ── */
const RatingBadge = ({ value, prev }) => {
  const diff  = +(value - prev).toFixed(1);
  const isUp   = diff > 0;
  const isFlat = diff === 0;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100,
      background: isFlat ? "#F3F4F6" : isUp ? "#DCFCE7" : "#FEE2E2",
      color:      isFlat ? "#6B7280" : isUp ? "#15803D" : "#DC2626",
    }}>
      {isFlat ? <Minus size={11} /> : isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isFlat ? "No change" : `${isUp ? "+" : ""}${diff} pts`}
    </div>
  );
};

/* ── Stat pill ── */
const StatPill = ({ value, label, color }) => (
  <div style={{
    background: "#F8FAFC", borderRadius: 12, padding: "10px 12px",
    textAlign: "center", flex: "1 1 0", minWidth: 0,
  }}>
    <p style={{ fontSize: 15, fontWeight: 800, color, lineHeight: 1, marginBottom: 3 }}>{value}</p>
    <p style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500 }}>{label}</p>
  </div>
);

/* ── Main ── */
const RatingChart = ({ type = "line", showReviews = true }) => {
  const [period,    setPeriod]    = useState("7m");
  const [chartType, setChartType] = useState(type);
  const [analytics, setAnalytics] = useState({ daily: [], weekly: [], monthly: [] });

  useEffect(() => {
    axios.get("/api/owner/analytics")
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

  const labelKey = period === "7d" ? "day" : period === "6w" ? "week" : "month";

  const currentRating  = data[data.length - 1]?.rating ?? 0;
  const prevRating     = data[data.length - 2]?.rating ?? 0;
  const avgRating      = data.length ? (data.reduce((s, d) => s + d.rating, 0) / data.length).toFixed(2) : "0.00";
  const totalReviews   = data.reduce((s, d) => s + (d.reviews ?? 0), 0);
  const highestRating  = data.length ? Math.max(...data.map(d => d.rating)) : 0;

  const ratingColor = currentRating >= 4.5 ? "#22c55e"
                    : currentRating >= 4.0 ? "#3b82f6"
                    : "#eab308";

  /* shared chart props */
  const axisStyle  = { fontSize: 10, fill: "#9CA3AF" };
  const gridProps  = { strokeDasharray: "3 3", stroke: "#F3F4F6" };
  const xProps     = { dataKey: labelKey, tick: axisStyle, axisLine: false, tickLine: false };
  const yProps     = { domain: [3, 5], tick: axisStyle, axisLine: false, tickLine: false, width: 28 };

  return (
    <div style={{
      background: "#fff", borderRadius: 20,
      border: "1.5px solid #F1F5F9",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header ── */}
      <div style={{ padding: "18px 18px 0", borderBottom: "1px solid #F8FAFC" }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: 0 }}>Rating Trend</h2>
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{PERIOD_LABELS[period]}</p>
          </div>

          {/* Controls — stack on very small screens */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {/* Chart type toggle */}
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, gap: 2 }}>
              {["line", "area", "bar"].map(t => (
                <button key={t} onClick={() => setChartType(t)} style={{
                  padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                  background: chartType === t ? "#fff" : "transparent",
                  color:      chartType === t ? "#2563EB" : "#9CA3AF",
                  boxShadow:  chartType === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Period toggle */}
            <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 10, padding: 3, gap: 2 }}>
              {["7d", "6w", "7m"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                  background: period === p ? "#fff" : "transparent",
                  color:      period === p ? "#2563EB" : "#9CA3AF",
                  boxShadow:  period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat pills — 2×2 on mobile, 4×1 on sm+ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, paddingBottom: 16 }}>
          <StatPill value={`${currentRating.toFixed(1)} ★`} label="Current"       color="#22c55e" />
          <StatPill value={`${avgRating} ★`}                label="Average"       color="#374151" />
          <StatPill value={`${highestRating.toFixed(1)} ★`} label="Highest"       color="#ca8a04" />
          <StatPill value={totalReviews}                     label="Total Reviews" color="#7c3aed" />
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ padding: "16px 8px 8px" }}>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xProps} />
              <YAxis {...yProps} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={4} stroke="#E5E7EB" strokeDasharray="4 4" />
              <Bar dataKey="rating"  name="Rating"  fill={ratingColor} radius={[4, 4, 0, 0]} />
              {showReviews && (
                <Bar dataKey="reviews" name="Reviews" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xProps} />
              <YAxis {...yProps} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="rating" name="Rating"
                stroke={ratingColor} strokeWidth={2.5}
                fill={ratingColor} fillOpacity={0.08}
                dot={<CustomDot />} activeDot={{ r: 5 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis {...xProps} />
              <YAxis {...yProps} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={4} stroke="#E5E7EB" strokeDasharray="4 4" />
              <Line
                type="monotone" dataKey="rating" name="Rating"
                stroke={ratingColor} strokeWidth={2.5}
                dot={<CustomDot />} activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: "10px 18px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, color: "#CBD5E1" }}>Rating trend</span>
        <RatingBadge value={currentRating} prev={prevRating} />
      </div>
    </div>
  );
};

export default RatingChart;