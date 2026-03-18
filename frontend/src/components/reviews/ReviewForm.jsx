import { useState } from "react";
import { Star, Send, X, Loader2 } from "lucide-react";
import api from "../../services/api";

const ASPECTS = [
  { key: "service",  label: "Service"        },
  { key: "quality",  label: "Quality"        },
  { key: "value",    label: "Value for Money"},
  { key: "ambiance", label: "Ambiance"       },
];

const ADJECTIVES = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

/**
 * ReviewForm
 * Props:
 *   shopId     — required, the shop to review
 *   onSuccess  — callback(review) after successful submit
 *   onCancel   — callback to close/hide the form
 *   compact    — smaller inline version (default false)
 */
const ReviewForm = ({ shopId, onSuccess, onCancel, compact = false }) => {
  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [aspects,      setAspects]      = useState({ service: 0, quality: 0, value: 0, ambiance: 0 });
  const [text,         setText]         = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");

  const displayRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating)         { setError("Please select a rating"); return; }
    if (text.length < 10){ setError("Review must be at least 10 characters"); return; }

    try {
      setSubmitting(true);
      setError("");
      const res = await api.post(`/shops/${shopId}/reviews`, {
        rating:  Number(rating),
        comment: text,
        ...(Object.values(aspects).some((v) => v > 0) && { aspects }),
      });
      const review = res?.data?.review ?? res?.data ?? res;
      if (onSuccess) onSuccess(review);
    } catch (err) {
      const backendErr = err.response?.data?.errors?.[0]?.message;
      setError(backendErr ?? err.response?.data?.message ?? "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${compact ? "p-4" : "p-6"}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 text-base">Write a Review</h3>
        {onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Overall rating */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Overall Rating *</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110 focus:outline-none">
                <Star size={compact ? 28 : 36}
                  className={s <= displayRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
              </button>
            ))}
            {displayRating > 0 && (
              <span className="text-sm font-bold text-yellow-500 ml-1">
                {ADJECTIVES[displayRating]}
              </span>
            )}
          </div>
        </div>

        {/* Aspect ratings */}
        {!compact && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-3">Rate Specific Aspects</label>
            <div className="grid grid-cols-2 gap-4">
              {ASPECTS.map((asp) => (
                <div key={asp.key}>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">{asp.label}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button"
                        onClick={() => setAspects((a) => ({ ...a, [asp.key]: s }))}
                        className="transition-transform hover:scale-110">
                        <Star size={18}
                          className={s <= (aspects[asp.key] || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review text */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Your Review *</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={compact ? 3 : 4}
            placeholder="Share your experience — what did you love? What could be better?"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none transition-all"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${text.length < 10 ? "text-red-400" : "text-gray-400"}`}>
              {text.length} chars {text.length < 10 && "(min 10)"}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 justify-end">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          )}
          <button type="submit" disabled={!rating || text.length < 10 || submitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            {submitting
              ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
              : <><Send size={14} /> Submit Review</>
            }
          </button>
        </div>

      </form>
    </div>
  );
};

export default ReviewForm;