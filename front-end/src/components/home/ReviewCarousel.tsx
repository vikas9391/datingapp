import React, { useState, useEffect } from "react";
import { Star, Quote, Loader, X, Calendar, Flame } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE;

interface Review {
  id: number;
  rating: number;
  text: string;
  created_at: string;
}

/* ─────────────────────────────────────────────
   TIME AGO HELPER
───────────────────────────────────────────── */
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now  = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7)  return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
};

/* ─────────────────────────────────────────────
   REVIEW CARD
───────────────────────────────────────────── */
const ReviewCard = ({ review, onClick }: { review: Review; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex-shrink-0 w-[280px] md:w-80 p-5 md:p-6 mx-3 rounded-2xl cursor-pointer active:scale-95 relative overflow-hidden border transition-all duration-200 group"
    style={{
      background: "linear-gradient(145deg, #1e1e1e 0%, #160f06 100%)",
      borderColor: "rgba(249,115,22,0.18)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = "rgba(249,115,22,0.42)";
      el.style.boxShadow = "0 8px 32px rgba(249,115,22,0.15)";
      el.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.borderColor = "rgba(249,115,22,0.18)";
      el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
      el.style.transform = "translateY(0)";
    }}
  >
    {/* Top shimmer */}
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent 15%, rgba(249,115,22,0.32) 50%, transparent 85%)" }}
    />
    {/* Corner glow on hover */}
    <div
      className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
      style={{ background: "radial-gradient(circle at top right, rgba(249,115,22,0.08) 0%, transparent 70%)" }}
    />

    {/* Avatar row */}
    <div className="flex items-center mb-3 relative z-10">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm border"
        style={{
          background: "rgba(249,115,22,0.15)",
          borderColor: "rgba(249,115,22,0.35)",
          boxShadow: "0 0 10px rgba(249,115,22,0.12)",
        }}
      >
        🔥
      </div>
      <div className="ml-3">
        {/* CONTRAST FIX: was text-gray-900 on dark */}
        <h4 className="font-bold text-xs md:text-sm" style={{ color: "#f0e8de" }}>
          Verified User
        </h4>
        <span
          className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
            color: "#f97316",
          }}
        >
          Success Story
        </span>
      </div>
    </div>

    {/* Review text — CONTRAST FIX: was text-gray-600 */}
    <p className="text-xs md:text-sm leading-relaxed italic line-clamp-3 relative z-10" style={{ color: "#c4a882" }}>
      "{review.text}"
    </p>

    {/* Footer */}
    <div className="mt-3 flex items-center justify-between relative z-10">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            style={
              i < review.rating
                ? { color: "#fbbf24", fill: "#fbbf24" }
                : { color: "rgba(249,115,22,0.15)" }
            }
          />
        ))}
      </div>
      {/* CONTRAST FIX: was text-gray-400 */}
      <span className="text-[10px] font-medium" style={{ color: "#8a6540" }}>
        {getTimeAgo(review.created_at)}
      </span>
    </div>
    <p className="text-[10px] font-medium mt-2 text-center relative z-10" style={{ color: "#d4935a" }}>
      Click to read full story
    </p>
  </div>
);

/* ─────────────────────────────────────────────
   REVIEW MODAL
───────────────────────────────────────────── */
const ReviewModal = ({ review, onClose }: { review: Review; onClose: () => void }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.82)", animation: "fadeIn 0.2s ease-out" }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border"
        style={{
          background: "linear-gradient(145deg, #1e1810 0%, #130d05 100%)",
          borderColor: "rgba(249,115,22,0.28)",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.5) 50%, transparent 92%)" }}
        />

        {/* Modal header */}
        <div
          className="sticky top-0 px-6 py-5 flex items-center justify-between rounded-t-[24px] border-b"
          style={{
            background: "rgba(249,115,22,0.08)",
            borderColor: "rgba(249,115,22,0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border"
              style={{
                background: "rgba(249,115,22,0.15)",
                borderColor: "rgba(249,115,22,0.3)",
              }}
            >
              🔥
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#f0e8de" }}>Success Story</h2>
              <p className="text-sm" style={{ color: "#8a6540" }}>Verified User</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#f97316" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.1)"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Stars */}
          <div className="flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-6 h-6"
                style={
                  i < review.rating
                    ? { color: "#fbbf24", fill: "#fbbf24" }
                    : { color: "rgba(249,115,22,0.15)" }
                }
              />
            ))}
          </div>

          {/* Story text */}
          <div
            className="rounded-2xl p-6 md:p-8 relative border"
            style={{
              background: "rgba(249,115,22,0.05)",
              borderColor: "rgba(249,115,22,0.15)",
            }}
          >
            <Quote
              className="absolute top-4 right-4 w-12 h-12 pointer-events-none"
              style={{ color: "rgba(249,115,22,0.12)" }}
            />
            {/* CONTRAST FIX: was text-gray-700 */}
            <p className="text-base md:text-lg leading-relaxed italic relative z-10" style={{ color: "#c4a882" }}>
              "{review.text}"
            </p>
          </div>

          {/* Date */}
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#8a6540" }}>
            <Calendar className="w-4 h-4" style={{ color: "#f97316" }} />
            <span>Shared on {formatDate(review.created_at)}</span>
          </div>

          {/* Footer message */}
          <div
            className="rounded-2xl p-4 text-center border"
            style={{
              background: "rgba(249,115,22,0.06)",
              borderColor: "rgba(249,115,22,0.18)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "#d4935a" }}>
              🔥 Thank you for sharing your story with our community!
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   REVIEW CAROUSEL (main export)
───────────────────────────────────────────── */
export default function ReviewCarousel() {
  const [reviews, setReviews]               = useState<Review[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => { fetchApprovedReviews(); }, []);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/reviews/approved/`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data.results || data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div
        className="w-full rounded-[2rem] p-6 md:p-8 border relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #130e06)",
          borderColor: "rgba(249,115,22,0.15)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: "#f97316" }} />
          {/* CONTRAST FIX: was text-gray-500 */}
          <p className="text-sm" style={{ color: "#8a6540" }}>Loading success stories…</p>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) return null;

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <>
      <div
        className="w-full rounded-[2rem] p-6 md:p-8 border overflow-hidden relative group"
        style={{
          background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
          borderColor: "rgba(249,115,22,0.18)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.4) 50%, transparent 92%)" }}
        />
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, rgba(249,115,22,0.07) 0%, transparent 70%)" }}
        />

        {/* Section header */}
        <div className="text-center mb-6 md:mb-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Quote className="w-6 h-6" style={{ color: "#f97316" }} />
            <h2 className="text-xl md:text-2xl font-black" style={{ color: "#f0e8de" }}>
              Success Stories
            </h2>
          </div>
          {/* CONTRAST FIX: was text-gray-500 */}
          <p className="text-xs md:text-sm mt-1" style={{ color: "#8a6540" }}>
            Real stories from our community • Click to read more
          </p>
        </div>

        {/* Scrolling marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Left fade */}
          <div
            className="absolute top-0 bottom-0 left-0 w-8 md:w-20 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #141008, transparent)" }}
          />
          {/* Right fade */}
          <div
            className="absolute top-0 bottom-0 right-0 w-8 md:w-20 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #141008, transparent)" }}
          />

          <div className="flex animate-scroll w-max">
            {duplicatedReviews.map((review, index) => (
              <ReviewCard
                key={`${review.id}-${index}`}
                review={review}
                onClick={() => setSelectedReview(review)}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 40s linear infinite;
          }
          .group:hover .animate-scroll {
            animation-play-state: paused;
          }
        `}</style>
      </div>

      {selectedReview && (
        <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   REVIEWS BANNER (static / shadcn variant)
   — same orange-black palette as the carousel
───────────────────────────────────────────── */
const staticReviews = [
  {
    name: "Verified User",
    rating: 5,
    text: "The anonymous approach removed all the pressure. When we finally revealed ourselves, we already knew we clicked!",
    time: "2 days ago",
  },
  {
    name: "Verified User",
    rating: 5,
    text: "No more superficial swiping. Here, I connected with someone based on who they really are.",
    time: "5 days ago",
  },
  {
    name: "Verified User",
    rating: 5,
    text: "Finally, a dating app where personality matters first. Found my person in 3 weeks!",
    time: "1 week ago",
  },
];

export const ReviewsBanner = () => (
  <>
    <style>{`
      @keyframes bannerGlow {
        0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        50%     { box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(249,115,22,0.1); }
      }
    `}</style>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl p-6 lg:p-8 relative overflow-hidden border"
      style={{
        background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
        borderColor: "rgba(249,115,22,0.2)",
        animation: "bannerGlow 4s ease-in-out infinite",
      }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.42) 50%, transparent 90%)" }}
      />
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 65%)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div
          className="p-2.5 rounded-xl border"
          style={{
            background: "rgba(249,115,22,0.12)",
            borderColor: "rgba(249,115,22,0.3)",
            boxShadow: "0 0 14px rgba(249,115,22,0.15)",
          }}
        >
          <Quote className="w-5 h-5" style={{ color: "#f97316" }} />
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: "#f0e8de" }}>
            Anonymous Success Stories
          </h3>
          <p className="text-sm" style={{ color: "#8a6540" }}>
            Real connections, privacy protected
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6 relative z-10">
        {staticReviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex gap-4"
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border"
              style={{
                background: "rgba(249,115,22,0.1)",
                borderColor: "rgba(249,115,22,0.25)",
              }}
            >
              <div className="w-4 h-4 rounded-full" style={{ background: "rgba(249,115,22,0.5)" }} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm" style={{ color: "#f0e8de" }}>
                  {review.name}
                </span>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                  ))}
                </div>
              </div>

              {/* CONTRAST FIX: was text-muted-foreground which could be too dim */}
              <p className="text-sm mb-1" style={{ color: "#c4a882" }}>
                {review.text}
              </p>
              <span className="text-xs" style={{ color: "#8a6540" }}>
                {review.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-6 pt-5 flex items-center justify-between relative z-10"
        style={{ borderTop: "1px solid rgba(249,115,22,0.12)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2"
                style={{
                  background: "rgba(249,115,22,0.12)",
                  borderColor: "#141008",
                }}
              />
            ))}
          </div>
          {/* CONTRAST FIX: was text-muted-foreground */}
          <span className="text-sm" style={{ color: "#c4a882" }}>
            Join 10K+ happy users
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
          style={{
            background: "rgba(251,191,36,0.1)",
            borderColor: "rgba(251,191,36,0.3)",
          }}
        >
          <Star className="w-4 h-4" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
          <span className="font-bold" style={{ color: "#fbbf24" }}>4.9</span>
        </div>
      </div>
    </motion.div>
  </>
);