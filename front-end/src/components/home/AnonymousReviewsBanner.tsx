import { Star, Quote, Shield, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE;

interface Review {
  id: number;
  username: string;
  rating: number;
  text: string;
  created_at: string;
}

export const AnonymousReviewsBanner = () => {
  const { isDark } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0)  return "Today";
    if (diffInDays === 1)  return "1 day ago";
    if (diffInDays < 7)   return `${diffInDays} days ago`;
    if (diffInDays < 30)  return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    wrapper: {
      background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
      borderColor: "rgba(249,115,22,0.18)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.4) 50%, transparent 90%)",
    cornerGlow: "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 65%)",
    iconWrap: {
      background: "rgba(249,115,22,0.12)",
      border: "1px solid rgba(249,115,22,0.3)",
      boxShadow: "0 0 14px rgba(249,115,22,0.15)",
    },
    icon: { color: "#f97316" },
    title: { color: "#f0e8de" },
    subtitle: { color: "#8a6540" },
    card: {
      background: "rgba(255,255,255,0.03)",
      borderColor: "rgba(249,115,22,0.14)",
    },
    cardHoverBorder: "rgba(249,115,22,0.3)",
    avatarWrap: {
      background: "rgba(249,115,22,0.12)",
      border: "1px solid rgba(249,115,22,0.2)",
    },
    avatarIcon: { color: "#fb923c" },
    verifiedName: { color: "#f0e8de" },
    shieldIcon: { color: "#f97316", fill: "#f97316" },
    starFilled: { color: "#fbbf24", fill: "#fbbf24" },
    starEmpty: { color: "#3d2e1a" },
    reviewText: { color: "#c4a882" },
    timestamp: { color: "#8a6540" },
    spinnerBorder: { borderColor: "rgba(249,115,22,0.3)", borderTopColor: "#f97316" },
    loadingText: { color: "#8a6540" },
  } : {
    wrapper: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.15)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.35) 50%, transparent 90%)",
    cornerGlow: "radial-gradient(circle at top right, rgba(29,78,216,0.06) 0%, transparent 65%)",
    iconWrap: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.25)",
      boxShadow: "0 0 14px rgba(29,78,216,0.1)",
    },
    icon: { color: "#1d4ed8" },
    title: { color: "#1e293b" },
    subtitle: { color: "#64748b" },
    card: {
      background: "rgba(29,78,216,0.03)",
      borderColor: "rgba(29,78,216,0.12)",
    },
    cardHoverBorder: "rgba(29,78,216,0.3)",
    avatarWrap: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.15)",
    },
    avatarIcon: { color: "#1d4ed8" },
    verifiedName: { color: "#1e293b" },
    shieldIcon: { color: "#1d4ed8", fill: "#1d4ed8" },
    starFilled: { color: "#f59e0b", fill: "#f59e0b" },
    starEmpty: { color: "#cbd5e1" },
    reviewText: { color: "#475569" },
    timestamp: { color: "#94a3b8" },
    spinnerBorder: { borderColor: "rgba(29,78,216,0.2)", borderTopColor: "#1d4ed8" },
    loadingText: { color: "#64748b" },
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 lg:p-8 h-full border transition-all duration-300"
        style={s.wrapper}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={s.spinnerBorder}
            />
            <p className="text-sm font-medium" style={s.loadingText}>
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
      className="rounded-2xl p-6 lg:p-8 h-full border relative overflow-hidden transition-all duration-300"
      style={s.wrapper}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: s.topAccent }}
      />
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: s.cornerGlow }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
          style={s.iconWrap}
        >
          <Quote className="w-6 h-6" style={s.icon} />
        </div>
        <div>
          <h3 className="font-bold text-lg transition-colors duration-300" style={s.title}>
            Success Stories
          </h3>
          <p className="text-sm transition-colors duration-300" style={s.subtitle}>
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
            className="p-5 rounded-2xl border transition-all duration-300"
            style={s.card}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = s.cardHoverBorder;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = s.card.borderColor;
            }}
          >
            {/* User row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                  style={s.avatarWrap}
                >
                  <User className="w-4 h-4" style={s.avatarIcon} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm transition-colors duration-300" style={s.verifiedName}>
                    Verified User
                  </span>
                  <Shield className="w-3 h-3" style={s.shieldIcon} />
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    style={i < review.rating ? s.starFilled : s.starEmpty}
                  />
                ))}
              </div>
            </div>

            {/* Review text */}
            <p className="text-sm leading-relaxed mb-2 transition-colors duration-300" style={s.reviewText}>
              "{review.text}"
            </p>
            {/* Timestamp */}
            <span className="text-xs font-medium transition-colors duration-300" style={s.timestamp}>
              {getTimeAgo(review.created_at)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnonymousReviewsBanner;