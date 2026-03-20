import { Star, Quote, Shield, User, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

interface Review {
  id: number;
  username: string;
  rating: number;
  text: string;
  created_at: string;
}

export const AnonymousReviewsBanner = () => {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reviews/approved/?limit=2`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.results || data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now  = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0)  return "Today";
    if (diffInDays === 1)  return "1 day ago";
    if (diffInDays < 7)   return `${diffInDays} days ago`;
    if (diffInDays < 30)  return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 lg:p-8 h-full border"
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #130e06)",
          borderColor: "rgba(249,115,22,0.18)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(249,115,22,0.3)", borderTopColor: "#f97316" }}
            />
            {/* CONTRAST FIX: no more gray-500 on dark bg */}
            <p className="text-sm font-medium" style={{ color: "#8a6540" }}>
              Loading reviews…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl p-6 lg:p-8 h-full border relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
        borderColor: "rgba(249,115,22,0.18)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.4) 50%, transparent 90%)" }}
      />
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 65%)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.3)",
            boxShadow: "0 0 14px rgba(249,115,22,0.15)",
          }}
        >
          <Quote className="w-6 h-6" style={{ color: "#f97316" }} />
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: "#f0e8de" }}>
            Success Stories
          </h3>
          <p className="text-sm" style={{ color: "#8a6540" }}>
            Real connections, privacy protected
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4 relative z-10">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * index }}
            className="p-5 rounded-2xl border transition-all duration-300 hover:border-orange-500/30"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(249,115,22,0.14)",
            }}
          >
            {/* User row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.2)",
                  }}
                >
                  <User className="w-4 h-4" style={{ color: "#fb923c" }} />
                </div>
                <div className="flex items-center gap-1.5">
                  {/* CONTRAST FIX: was gray-900 (near invisible on dark) */}
                  <span className="font-semibold text-sm" style={{ color: "#f0e8de" }}>
                    Verified User
                  </span>
                  <Shield className="w-3 h-3" style={{ color: "#f97316", fill: "#f97316" }} />
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    style={
                      i < review.rating
                        ? { color: "#fbbf24", fill: "#fbbf24" }
                        : { color: "#3d2e1a" }
                    }
                  />
                ))}
              </div>
            </div>

            {/* Review text — CONTRAST FIX: was gray-600 on near-black bg */}
            <p className="text-sm leading-relaxed mb-2" style={{ color: "#c4a882" }}>
              "{review.text}"
            </p>
            {/* Timestamp — CONTRAST FIX: was gray-400 */}
            <span className="text-xs font-medium" style={{ color: "#8a6540" }}>
              {getTimeAgo(review.created_at)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnonymousReviewsBanner;