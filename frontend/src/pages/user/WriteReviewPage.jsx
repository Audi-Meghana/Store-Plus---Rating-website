import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Send, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import Navbar from "../../components/common/Navbar";
import ReviewPhotoUpload from "../../components/reviews/ReviewPhotoUpload";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

const ASPECTS = [
  { key: "service",  label: "Service",          emoji: "🤝" },
  { key: "quality",  label: "Quality",           emoji: "⭐" },
  { key: "value",    label: "Value for Money",   emoji: "💰" },
  { key: "ambiance", label: "Ambiance",          emoji: "✨" },
];

const ADJECTIVES = {
  1: { text: "Poor",      color: "#EF4444", bg: "#FEF2F2" },
  2: { text: "Fair",      color: "#F97316", bg: "#FFF7ED" },
  3: { text: "Good",      color: "#EAB308", bg: "#FEFCE8" },
  4: { text: "Very Good", color: "#22C55E", bg: "#F0FDF4" },
  5: { text: "Excellent", color: "#1D4ED8", bg: "#EFF6FF" },
};

const WriteReviewPage = () => {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating,   setHoverRating]   = useState(0);
  const [aspectRatings, setAspectRatings] = useState({ service: 0, quality: 0, value: 0, ambiance: 0 });
  const [reviewText,    setReviewText]    = useState("");
  const [photos,        setPhotos]        = useState([]);
  const [submitted,     setSubmitted]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState("");

  useEffect(() => {
    if (!id || id === "undefined" || id === "null") navigate(-1);
  }, [id, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/write-review/${id}` }, replace: true });
    }
  }, [isAuthenticated, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!overallRating || reviewText.length < 10) return;
    if (!id || id === "undefined") {
      setSubmitError("Invalid store. Please go back and try again.");
      return;
    }
    try {
      setSubmitting(true); setSubmitError("");
      let response;
      if (photos.length > 0) {
        const form = new FormData();
        form.append("rating",  Number(overallRating));
        form.append("comment", reviewText);
        Object.entries(aspectRatings).forEach(([k, v]) => { if (v > 0) form.append(`aspects[${k}]`, v); });
        photos.forEach((p) => form.append("images", p.file));
        response = await api.post(`/shops/${id}/reviews`, form);
      } else {
        response = await api.post(`/shops/${id}/reviews`, {
          rating:  Number(overallRating),
          comment: reviewText,
          ...(Object.values(aspectRatings).some((v) => v > 0) && { aspects: aspectRatings }),
        });
      }
      if (response.status === 200 || response.status === 201) setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: `/write-review/${id}` }, replace: true });
        return;
      }
      const be = err.response?.data?.errors?.[0]?.message;
      setSubmitError(be ?? err.response?.data?.message ?? "Failed to submit review. Please try again.");
    } finally { setSubmitting(false); }
  };

  /* ── Success screen ── */
  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      <style>{FONTS}</style>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 pt-24 pb-16 text-center">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
            <CheckCircle size={44} className="text-white" />
          </div>
        </div>
        <h1 className="wrv-heading text-3xl font-extrabold text-slate-900 mb-3">Review Submitted!</h1>
        <p className="text-slate-500 leading-relaxed mb-10 text-sm">
          Thank you for sharing your experience. Your review helps the community make better choices.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate(`/store/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5">
            Back to Store
          </button>
          <button onClick={() => navigate("/explore")}
            className="bg-white hover:bg-slate-50 text-slate-600 font-semibold px-8 py-3 rounded-2xl text-sm border border-slate-200 transition-all duration-200 hover:-translate-y-0.5">
            Explore More
          </button>
        </div>
      </div>
    </div>
  );

  const displayRating = hoverRating || overallRating;
  const ratingMeta    = ADJECTIVES[displayRating];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 font-sans">
      <style>{FONTS + CUSTOM_CSS}</style>
      <Navbar />

      {/* ── Page header banner ── */}
      <div className="wrv-banner">
        <div className="wrv-banner-orb1" />
        <div className="wrv-banner-orb2" />
        <div className="max-w-2xl mx-auto px-6 py-10 relative z-10">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-5 transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Share your experience</span>
          </div>
          <h1 className="wrv-heading text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Write a Review
          </h1>
          <p className="text-white/50 text-sm mt-2">Your honest feedback helps others make better choices</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 pb-20 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Overall Rating ── */}
          <div className="wrv-card">
            <div className="wrv-card-label">
              <span className="wrv-step">01</span>
              Overall Rating
            </div>

            <div className="flex items-center gap-3 mt-5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s} type="button"
                  className="wrv-star-btn"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setOverallRating(s)}
                  style={{ '--delay': `${(s - 1) * 0.05}s` }}
                >
                  <Star
                    size={42}
                    className="transition-all duration-150"
                    style={{
                      color:     s <= displayRating ? "#FBBF24" : "#E2E8F0",
                      fill:      s <= displayRating ? "#FBBF24" : "none",
                      filter:    s <= displayRating ? "drop-shadow(0 2px 6px rgba(251,191,36,.45))" : "none",
                      transform: s <= displayRating ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                </button>
              ))}
            </div>

            {displayRating > 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
                style={{ background: ratingMeta.bg, color: ratingMeta.color }}>
                {ratingMeta.text}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Tap a star to rate</p>
            )}
          </div>

          {/* ── Aspect Ratings ── */}
          <div className="wrv-card">
            <div className="wrv-card-label">
              <span className="wrv-step">02</span>
              Rate Specific Aspects
              <span className="ml-2 text-xs text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {ASPECTS.map((asp) => (
                <div key={asp.key} className="wrv-aspect-row">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{asp.emoji}</span>
                    <span className="text-sm font-semibold text-slate-700">{asp.label}</span>
                    {aspectRatings[asp.key] > 0 && (
                      <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {aspectRatings[asp.key]}/5
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button"
                        onClick={() => setAspectRatings((r) => ({ ...r, [asp.key]: r[asp.key] === s ? 0 : s }))}
                        className="transition-transform duration-100 hover:scale-110 active:scale-95">
                        <Star size={22}
                          style={{
                            color: s <= (aspectRatings[asp.key] || 0) ? "#FBBF24" : "#E2E8F0",
                            fill:  s <= (aspectRatings[asp.key] || 0) ? "#FBBF24" : "none",
                            filter: s <= (aspectRatings[asp.key] || 0) ? "drop-shadow(0 1px 3px rgba(251,191,36,.4))" : "none",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Review Text ── */}
          <div className="wrv-card">
            <div className="wrv-card-label">
              <span className="wrv-step">03</span>
              Your Review
            </div>
            <div className="relative mt-5">
              <textarea
                className="wrv-textarea"
                placeholder="Tell others about your experience — what did you love? What could be better? Any tips for others?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
              />
              {/* character bar */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="h-1 flex-1 mr-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((reviewText.length / 300) * 100, 100)}%`,
                      background: reviewText.length < 10 ? "#EF4444" : reviewText.length < 50 ? "#F59E0B" : "#22C55E",
                    }}
                  />
                </div>
                <span className={`text-xs font-semibold ${reviewText.length < 10 ? "text-red-400" : "text-slate-400"}`}>
                  {reviewText.length} {reviewText.length < 10 && <span className="text-red-400">/ min 10</span>}
                </span>
              </div>
            </div>
          </div>

          {/* ── Photos ── */}
          <div className="wrv-card">
            <div className="wrv-card-label">
              <span className="wrv-step">04</span>
              Add Photos
              <span className="ml-2 text-xs text-slate-400 font-normal normal-case tracking-normal">(optional, up to 5)</span>
            </div>
            <div className="mt-5">
              <ReviewPhotoUpload
                photos={photos}
                onChange={setPhotos}
                maxPhotos={5}
              />
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-600 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="wrv-card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Ready to publish?</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {!overallRating
                    ? "Please select an overall rating"
                    : reviewText.length < 10
                    ? "Write at least 10 characters"
                    : "Your review looks great!"}
                </p>
              </div>
              <button
                type="submit"
                disabled={!overallRating || reviewText.length < 10 || submitting}
                className="wrv-submit-btn"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Review
                  </>
                )}
              </button>
            </div>
            {/* progress indicator strip */}
            <div className="h-1 w-full bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{
                  width: overallRating && reviewText.length >= 10 ? "100%"
                       : overallRating ? "60%"
                       : reviewText.length >= 10 ? "30%"
                       : "5%"
                }}
              />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

/* ── Fonts ── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');
`;

/* ── Custom CSS (things Tailwind can't do inline) ── */
const CUSTOM_CSS = `
.font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
.wrv-heading { font-family: 'Bricolage Grotesque', sans-serif; }

/* Banner */
.wrv-banner{
  position: relative;
  background: linear-gradient(135deg, #0A1628 0%, #0F2255 55%, #1E3A8A 100%);
  overflow: hidden;
}
.wrv-banner-orb1{
  position: absolute; top: -80px; right: -80px;
  width: 340px; height: 340px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,.22) 0%, transparent 65%);
  pointer-events: none;
  animation: wrv-drift1 8s ease-in-out infinite alternate;
}
.wrv-banner-orb2{
  position: absolute; bottom: -60px; left: -40px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(29,78,216,.15) 0%, transparent 65%);
  pointer-events: none;
  animation: wrv-drift2 10s ease-in-out infinite alternate;
}
@keyframes wrv-drift1{
  0%{ transform: translate(0,0) scale(1); }
  100%{ transform: translate(-20px, 15px) scale(1.12); }
}
@keyframes wrv-drift2{
  0%{ transform: translate(0,0); }
  100%{ transform: translate(15px, -20px) scale(1.1); }
}

/* Cards */
.wrv-card{
  background: #fff;
  border: 1.5px solid #E8EDF5;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(10,22,40,.06);
  transition: box-shadow .2s;
}
.wrv-card:focus-within{
  box-shadow: 0 4px 24px rgba(29,78,216,.1);
  border-color: rgba(29,78,216,.2);
}

/* Card label */
.wrv-card-label{
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: .9rem;
  font-weight: 800;
  color: #0A1628;
  letter-spacing: -.1px;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 1.4px;
}

/* Step number */
.wrv-step{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
  flex-shrink: 0;
}

/* Star button */
.wrv-star-btn{
  background: none; border: none; cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  transition: transform .15s;
  animation: wrv-star-in .4s cubic-bezier(.4,0,.2,1) var(--delay, 0s) both;
}
.wrv-star-btn:hover{ transform: scale(1.12) rotate(-5deg); }
.wrv-star-btn:active{ transform: scale(.95); }
@keyframes wrv-star-in{
  from{ opacity: 0; transform: translateY(8px) scale(.85); }
  to{   opacity: 1; transform: translateY(0)   scale(1);   }
}

/* Aspect row */
.wrv-aspect-row{
  background: #F8FAFD;
  border: 1.5px solid #E8EDF5;
  border-radius: 14px;
  padding: 14px 16px;
  transition: border-color .18s, background .18s;
}
.wrv-aspect-row:hover{
  background: #F1F5FD;
  border-color: #BFDBFE;
}

/* Textarea */
.wrv-textarea{
  width: 100%;
  background: #F8FAFD;
  border: 1.5px solid #E8EDF5;
  border-radius: 14px;
  padding: 16px;
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0A1628;
  resize: vertical;
  min-height: 140px;
  outline: none;
  line-height: 1.75;
  transition: border-color .2s, background .2s, box-shadow .2s;
}
.wrv-textarea:focus{
  border-color: #3B82F6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59,130,246,.08);
}
.wrv-textarea::placeholder{ color: #CBD5E1; }

/* Submit button */
.wrv-submit-btn{
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #1D4ED8, #2563EB);
  color: #fff;
  border: none; border-radius: 14px;
  padding: 13px 28px;
  font-size: 14px; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: all .2s;
  box-shadow: 0 4px 16px rgba(29,78,216,.3);
}
.wrv-submit-btn:hover:not(:disabled){
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(29,78,216,.38);
  background: linear-gradient(135deg, #1E40AF, #1D4ED8);
}
.wrv-submit-btn:disabled{
  opacity: .5; cursor: not-allowed; transform: none;
  box-shadow: none;
}

/* Mobile */
@media(max-width: 640px){
  .wrv-banner .max-w-2xl{ padding: 14px 16px; }
  .wrv-card{ padding: 18px 16px; border-radius: 16px; }
  .wrv-star-btn svg{ width: 36px !important; height: 36px !important; }
}
`;

export default WriteReviewPage;