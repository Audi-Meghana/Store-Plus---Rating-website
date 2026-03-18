import { useState } from "react";
import {
  Star, Reply, ThumbsUp, CheckCircle2,
  Clock, ChevronDown, ChevronUp, Filter,
  MessageSquare, Search,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const REVIEWS = [
  {
    id: 1,
    user: "Ananya S.",
    avatar: "A",
    avatarColor: "from-blue-400 to-indigo-500",
    rating: 5,
    text: "Absolutely amazing experience! The food was delicious and staff were super friendly. Will definitely come back again soon.",
    time: "2 hours ago",
    replied: false,
    helpful: 4,
  },
  {
    id: 2,
    user: "Rohan M.",
    avatar: "R",
    avatarColor: "from-green-400 to-teal-500",
    rating: 4,
    text: "Great place overall. Loved the ambiance. Service could be a bit faster but the quality makes up for it.",
    time: "5 hours ago",
    replied: true,
    replyText: "Thank you Rohan! We're working on improving our service speed. Hope to see you again soon!",
    helpful: 2,
  },
  {
    id: 3,
    user: "Divya K.",
    avatar: "D",
    avatarColor: "from-pink-400 to-rose-500",
    rating: 3,
    text: "Average experience. The food was okay but the waiting time was too long for a weekday afternoon.",
    time: "1 day ago",
    replied: false,
    helpful: 1,
  },
  {
    id: 4,
    user: "Kiran P.",
    avatar: "K",
    avatarColor: "from-yellow-400 to-orange-500",
    rating: 5,
    text: "One of the best restaurants in Hyderabad! Every dish was perfectly seasoned. Highly recommend the biryani.",
    time: "1 day ago",
    replied: false,
    helpful: 7,
  },
  {
    id: 5,
    user: "Meera T.",
    avatar: "M",
    avatarColor: "from-purple-400 to-violet-500",
    rating: 2,
    text: "Disappointed with my visit. The order was wrong and it took forever to get it corrected. Not what I expected.",
    time: "2 days ago",
    replied: false,
    helpful: 0,
  },
  {
    id: 6,
    user: "Arjun B.",
    avatar: "A",
    avatarColor: "from-cyan-400 to-blue-500",
    rating: 4,
    text: "Really enjoyed the place. Friendly staff and great food. Will bring my family next time!",
    time: "3 days ago",
    replied: true,
    replyText: "Thank you so much Arjun! We'd love to host your family. See you soon!",
    helpful: 3,
  },
];

const FILTER_OPTIONS = ["All", "Pending", "Replied", "5★", "4★", "3★", "2★", "1★"];

const QUICK_REPLIES = [
  "Thank you for your kind words! We're thrilled you enjoyed your experience. Hope to see you again soon! 😊",
  "We're sorry to hear about your experience. We take all feedback seriously and will work to improve. Please reach out directly so we can make it right.",
  "Thank you for visiting us! Your feedback helps us grow. We hope to serve you better next time! 🙏",
  "We appreciate you taking the time to review us. We're constantly working to improve our service and food quality.",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={11}
        className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
      />
    ))}
  </div>
);

const RatingBadge = ({ rating }) => {
  const colors =
    rating >= 4 ? "bg-green-50 text-green-600 border-green-100"
    : rating === 3 ? "bg-yellow-50 text-yellow-600 border-yellow-100"
    : "bg-red-50 text-red-500 border-red-100";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors}`}>
      {rating}.0 ★
    </span>
  );
};

// ─── Review Row ───────────────────────────────────────────────────────────────

const ReviewRow = ({ review, onReplySubmit }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [submitted, setSubmitted] = useState(review.replied);
  const [savedReply, setSavedReply] = useState(review.replyText || "");
  const [helpful, setHelpful] = useState(review.helpful);
  const [helpfulClicked, setHelpfulClicked] = useState(false);

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    setSavedReply(replyText);
    setSubmitted(true);
    setExpanded(false);
    setReplyText("");
    if (onReplySubmit) onReplySubmit(review.id, replyText);
  };

  const handleHelpful = () => {
    if (helpfulClicked) return;
    setHelpful((h) => h + 1);
    setHelpfulClicked(true);
  };

  return (
    <div className="px-6 py-5 hover:bg-gray-50/60 transition-colors">
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className={`w-10 h-10 bg-gradient-to-br ${review.avatarColor} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
          {review.avatar}
        </div>

        <div className="flex-1 min-w-0">

          {/* Top row */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{review.user}</span>
              <StarDisplay rating={review.rating} />
              <RatingBadge rating={review.rating} />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {review.time}
              </span>
              {submitted ? (
                <span className="text-xs bg-green-100 text-green-600 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> Replied
                </span>
              ) : (
                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Review text */}
          <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.text}</p>

          {/* Existing reply */}
          {submitted && savedReply && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                <Reply size={11} /> Your reply
              </p>
              <p className="text-xs text-green-800 leading-relaxed">{savedReply}</p>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {!submitted && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Reply size={12} />
                Reply
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            )}
            {submitted && (
              <button
                onClick={() => { setExpanded((e) => !e); setReplyText(savedReply); }}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Reply size={12} /> Edit reply
              </button>
            )}
            <button
              onClick={handleHelpful}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                helpfulClicked
                  ? "bg-blue-50 text-blue-500"
                  : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
              }`}
            >
              <ThumbsUp size={12} /> Helpful · {helpful}
            </button>
          </div>

          {/* Reply box */}
          {expanded && (
            <div className="mt-4 space-y-3">

              {/* Quick replies */}
              <div>
                <button
                  onClick={() => setShowQuickReplies((v) => !v)}
                  className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 mb-2"
                >
                  ⚡ Quick replies {showQuickReplies ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
                {showQuickReplies && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {QUICK_REPLIES.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setReplyText(q); setShowQuickReplies(false); }}
                        className="text-left text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-100 hover:border-blue-200 rounded-xl px-3 py-2.5 transition-all line-clamp-2"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a thoughtful reply to this review…"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none transition-all"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{replyText.length}/500 characters</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setExpanded(false); setReplyText(""); }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!replyText.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const OwnerReplyPanel = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState(REVIEWS);

  const pending = reviews.filter((r) => !r.replied).length;

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ? true
      : filter === "Pending" ? !r.replied
      : filter === "Replied" ? r.replied
      : filter === `${r.rating}★`;

    return matchesSearch && matchesFilter;
  });

  const handleReplySubmit = (id, text) => {
    setReviews((prev) =>
      prev.map((r) => r.id === id ? { ...r, replied: true, replyText: text } : r)
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-green-600" />
            <h2 className="font-bold text-gray-900">Customer Reviews</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {pending > 0
              ? <span className="text-orange-500 font-semibold">{pending} awaiting your reply</span>
              : <span className="text-green-600 font-semibold">All reviews replied ✓</span>
            }
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 transition-all"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        <Filter size={12} className="text-gray-400 flex-shrink-0 mr-1" />
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div className="divide-y divide-gray-50">
        {filtered.length > 0 ? (
          filtered.map((review) => (
            <ReviewRow
              key={review.id}
              review={review}
              onReplySubmit={handleReplySubmit}
            />
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No reviews found</p>
            <p className="text-xs mt-1">Try changing the filter or search term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Showing <strong className="text-gray-600">{filtered.length}</strong> of {reviews.length} reviews
        </span>
        <span className="text-xs text-gray-400">Updated just now</span>
      </div>

    </div>
  );
};

export default OwnerReplyPanel;