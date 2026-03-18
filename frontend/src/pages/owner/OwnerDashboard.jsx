import { useState, useEffect } from "react";
import { Star, Menu, MessageSquare, TrendingUp, Eye, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";
import Sidebar, { useSidebar } from "../../components/common/Sidebar";
import { useNavigate } from "react-router-dom";

const STAR_COLORS = { 5: "#22c55e", 4: "#84cc16", 3: "#facc15", 2: "#f97316", 1: "#ef4444" };

const buildRatingTrend = (reviews) => {
  const map = {};
  reviews.forEach((r) => {
    const d     = new Date(r.createdAt);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!map[label]) map[label] = { month: label, sum: 0, count: 0, ts: d.getTime() };
    map[label].sum   += r.rating;
    map[label].count += 1;
  });
  return Object.values(map)
    .sort((a, b) => a.ts - b.ts)
    .map(({ month, sum, count }) => ({ month, rating: +(sum / count).toFixed(2) }));
};

const buildBreakdown = (reviews) =>
  [5, 4, 3, 2, 1].map((star) => ({
    name: star, value: reviews.filter((r) => r.rating === star).length,
  }));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-green-600">Rating: {Number(payload[0].value).toFixed(1)}</p>
    </div>
  );
};

const KPICard = ({ label, value, sub, icon: Icon, iconColor, iconBg }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {Icon && (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
    )}
  </div>
);

const StarRow = ({ count, total, stars, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-10 text-right">{stars}★</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-14 text-right">
        {count} <span className="text-gray-400">({pct}%)</span>
      </span>
    </div>
  );
};

const OwnerDashboard = () => {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const { collapsed, mobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [shop,    setShop]    = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Step 1: get shop — has avgRating, reviewCount, profileViews
        const shopRes  = await api.get("/shops/me");
        const shopData = shopRes?.data?.data ?? shopRes?.data ?? {};
        setShop(shopData);

        const shopId = shopData._id;
        if (!shopId) return;

        // Step 2: fetch all reviews via /shops/:id/reviews (mounted in app.js)
        const reviewRes = await api.get(`/shops/${shopId}/reviews`, {
          params: { limit: 1000, sort: "newest" },
        });
        const payload = reviewRes?.data ?? {};
        const fetched = Array.isArray(payload.reviews) ? payload.reviews : [];
        setReviews(fetched);
      } catch (e) {
        console.error("Dashboard error:", e?.response?.data ?? e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avgRating      = shop?.avgRating    ?? 0;
  const totalReviews   = shop?.reviewCount  ?? reviews.length;
  const profileViews   = shop?.profileViews ?? 0;
  const ratingTrend    = buildRatingTrend(reviews);
  const breakdown      = buildBreakdown(reviews);
  const recentReviews  = reviews.slice(0, 5);
  const pendingReplies = reviews.filter((r) => !r.replied && !r.ownerReply?.text).length;
  const responseRate   = totalReviews > 0
    ? Math.round(((totalReviews - pendingReplies) / totalReviews) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="shop_owner" collapsed={collapsed} onCollapse={toggleCollapse}
        mobileOpen={mobileOpen} onMobileClose={closeMobile}
        shopStats={{ rating: avgRating, reviewCount: totalReviews }} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={openMobile} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-400 mt-0.5">{shop?.name || "Your shop"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || "O"}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Pending alert */}
          {pendingReplies > 0 && (
            <div onClick={() => navigate("/owner/reviews")}
              className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 cursor-pointer hover:bg-amber-100 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-amber-500" />
                <p className="text-sm font-medium text-amber-800">
                  {pendingReplies} review{pendingReplies > 1 ? "s" : ""} waiting for your reply
                </p>
              </div>
              <ChevronRight size={16} className="text-amber-500" />
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard label="Avg Rating"    value={avgRating ? `${Number(avgRating).toFixed(1)} ★` : "—"} icon={Star}         iconColor="text-yellow-500" iconBg="bg-yellow-50" />
            <KPICard label="Total Reviews" value={totalReviews}                                           icon={MessageSquare} iconColor="text-blue-500"   iconBg="bg-blue-50"   />
            <KPICard label="Profile Views" value={profileViews}                                           icon={Eye}           iconColor="text-purple-500" iconBg="bg-purple-50" />
            <KPICard
              label="Response Rate"
              value={`${responseRate}%`}
              sub={pendingReplies > 0 ? `${pendingReplies} pending` : "All replied"}
              icon={Clock}
              iconColor={pendingReplies > 0 ? "text-amber-500" : "text-green-500"}
              iconBg={pendingReplies > 0 ? "bg-amber-50" : "bg-green-50"}
            />
          </div>

          {/* Chart + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Rating Trend</h2>
                <button onClick={() => navigate("/owner/analytics")}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  Full analytics <ChevronRight size={12} />
                </button>
              </div>
              {ratingTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={ratingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="rating" stroke="#22c55e" strokeWidth={2.5}
                      dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }} name="rating" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <TrendingUp size={28} className="mb-2 opacity-30" />
                  <p className="text-sm">No trend data yet.</p>
                  <p className="text-xs text-gray-300 mt-1">Appears once reviews come in</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Rating Breakdown</h2>
              {breakdown.some((r) => r.value > 0) ? (
                <div className="space-y-3">
                  {breakdown.map((r) => (
                    <StarRow key={r.name} count={r.value} total={totalReviews} stars={r.name} color={STAR_COLORS[r.name] ?? "#22c55e"} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Star size={28} className="mb-2 opacity-30" />
                  <p className="text-sm text-center">No reviews yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Recent Reviews</h2>
              <button onClick={() => navigate("/owner/reviews")}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            </div>
            {recentReviews.length > 0 ? (
              <div className="space-y-3">
                {recentReviews.map((review, i) => {
                  const needsReply = !review.replied && !review.ownerReply?.text;
                  const reviewText = review.text ?? review.body ?? review.comment ?? "";
                  return (
                    <div key={review._id ?? i}
                      className={`rounded-xl p-4 border ${needsReply ? "border-amber-100 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-xs font-semibold text-white">
                            {review.user?.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{review.user?.name ?? "Anonymous"}</span>
                          {needsReply && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                              Needs reply
                            </span>
                          )}
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={12}
                              className={s < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                          ))}
                        </div>
                      </div>
                      {reviewText
                        ? <p className="text-xs text-gray-500 line-clamp-2">{reviewText}</p>
                        : <p className="text-xs text-gray-400 italic">No comment provided.</p>}
                      {needsReply && (
                        <button onClick={() => navigate("/owner/reviews")}
                          className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                          <MessageSquare size={11} /> Reply now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                <MessageSquare size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No reviews yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;