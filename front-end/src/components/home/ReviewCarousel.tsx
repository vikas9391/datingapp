import React, { useState, useEffect } from "react";
import { Star, Quote, Loader, X, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";

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
const ReviewCard = ({ review, onClick }: { review: Review; onClick: () => void }) => {
  const { isDark } = useTheme();

  const base = isDark ? {
    background: "linear-gradient(145deg, #1e1e1e 0%, #160f06 100%)",
    borderColor: "rgba(249,115,22,0.18)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    topAccent: "linear-gradient(90deg, transparent 15%, rgba(249,115,22,0.32) 50%, transparent 85%)",
    cornerGlow: "radial-gradient(circle at top right, rgba(249,115,22,0.08) 0%, transparent 70%)",
    hoverBorder: "rgba(249,115,22,0.42)",
    hoverShadow: "0 8px 32px rgba(249,115,22,0.15)",
    avatarBg: "rgba(249,115,22,0.15)",
    avatarBorder: "rgba(249,115,22,0.35)",
    avatarShadow: "0 0 10px rgba(249,115,22,0.12)",
    badge: { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#f97316" },
    name: { color: "#f0e8de" },
    text: { color: "#c4a882" },
    timestamp: { color: "#8a6540" },
    cta: { color: "#d4935a" },
    starEmpty: { color: "rgba(249,115,22,0.15)" },
  } : {
    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
    borderColor: "rgba(29,78,216,0.15)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    topAccent: "linear-gradient(90deg, transparent 15%, rgba(29,78,216,0.25) 50%, transparent 85%)",
    cornerGlow: "radial-gradient(circle at top right, rgba(29,78,216,0.06) 0%, transparent 70%)",
    hoverBorder: "rgba(29,78,216,0.35)",
    hoverShadow: "0 8px 32px rgba(29,78,216,0.12)",
    avatarBg: "rgba(29,78,216,0.1)",
    avatarBorder: "rgba(29,78,216,0.3)",
    avatarShadow: "0 0 10px rgba(29,78,216,0.08)",
    badge: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.2)", color: "#1d4ed8" },
    name: { color: "#1e293b" },
    text: { color: "#475569" },
    timestamp: { color: "#64748b" },
    cta: { color: "#1d4ed8" },
    starEmpty: { color: "rgba(29,78,216,0.15)" },
  };

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[280px] md:w-80 p-5 md:p-6 mx-3 rounded-2xl cursor-pointer active:scale-95 relative overflow-hidden border transition-all duration-200 group"
      style={{ background: base.background, borderColor: base.borderColor, boxShadow: base.boxShadow }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = base.hoverBorder;
        el.style.boxShadow   = base.hoverShadow;
        el.style.transform   = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = base.borderColor;
        el.style.boxShadow   = base.boxShadow;
        el.style.transform   = "translateY(0)";
      }}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: base.topAccent }} />
      {/* Corner glow on hover */}
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: base.cornerGlow }}
      />

      {/* Avatar row */}
      <div className="flex items-center mb-3 relative z-10">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm border"
          style={{ background: base.avatarBg, borderColor: base.avatarBorder, boxShadow: base.avatarShadow }}
        >
          {isDark ? "🔥" : "💙"}
        </div>
        <div className="ml-3">
          <h4 className="font-bold text-xs md:text-sm transition-colors duration-300" style={base.name}>
            Verified User
          </h4>
          <span
            className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
            style={base.badge}
          >
            Success Story
          </span>
        </div>
      </div>

      {/* Review text */}
      <p className="text-xs md:text-sm leading-relaxed italic line-clamp-3 relative z-10 transition-colors duration-300" style={base.text}>
        "{review.text}"
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between relative z-10">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              style={i < review.rating ? { color: "#fbbf24", fill: "#fbbf24" } : base.starEmpty}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium transition-colors duration-300" style={base.timestamp}>
          {getTimeAgo(review.created_at)}
        </span>
      </div>
      <p className="text-[10px] font-medium mt-2 text-center relative z-10 transition-colors duration-300" style={base.cta}>
        Click to read full story
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   REVIEW MODAL
───────────────────────────────────────────── */
const ReviewModal = ({ review, onClose }: { review: Review; onClose: () => void }) => {
  const { isDark } = useTheme();

  const s = isDark ? {
    overlay: "rgba(0,0,0,0.82)",
    modal: {
      background: "linear-gradient(145deg, #1e1810 0%, #130d05 100%)",
      borderColor: "rgba(249,115,22,0.28)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.5) 50%, transparent 92%)",
    header: { background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.15)" },
    avatarBg: "rgba(249,115,22,0.15)",
    avatarBorder: "rgba(249,115,22,0.3)",
    title: { color: "#f0e8de" },
    subtitle: { color: "#8a6540" },
    closeBtn: { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.22)", color: "#f97316" },
    closeBtnHover: "rgba(249,115,22,0.2)",
    closeBtnLeave: "rgba(249,115,22,0.1)",
    starEmpty: { color: "rgba(249,115,22,0.15)" },
    storyBox: { background: "rgba(249,115,22,0.05)", borderColor: "rgba(249,115,22,0.15)" },
    quoteIcon: { color: "rgba(249,115,22,0.12)" },
    storyText: { color: "#c4a882" },
    dateColor: { color: "#8a6540" },
    calendarIcon: { color: "#f97316" },
    footer: { background: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.18)" },
    footerText: { color: "#d4935a" },
    footerEmoji: "🔥",
  } : {
    overlay: "rgba(0,0,0,0.5)",
    modal: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.2)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(29,78,216,0.08)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.35) 50%, transparent 92%)",
    header: { background: "rgba(29,78,216,0.04)", borderColor: "rgba(29,78,216,0.12)" },
    avatarBg: "rgba(29,78,216,0.1)",
    avatarBorder: "rgba(29,78,216,0.25)",
    title: { color: "#1e293b" },
    subtitle: { color: "#64748b" },
    closeBtn: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.2)", color: "#1d4ed8" },
    closeBtnHover: "rgba(29,78,216,0.15)",
    closeBtnLeave: "rgba(29,78,216,0.08)",
    starEmpty: { color: "rgba(29,78,216,0.15)" },
    storyBox: { background: "rgba(29,78,216,0.03)", borderColor: "rgba(29,78,216,0.12)" },
    quoteIcon: { color: "rgba(29,78,216,0.1)" },
    storyText: { color: "#475569" },
    dateColor: { color: "#64748b" },
    calendarIcon: { color: "#1d4ed8" },
    footer: { background: "rgba(29,78,216,0.04)", borderColor: "rgba(29,78,216,0.12)" },
    footerText: { color: "#1d4ed8" },
    footerEmoji: "💙",
  };

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
      style={{ background: s.overlay, animation: "fadeIn 0.2s ease-out" }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border transition-all duration-300"
        style={{ ...s.modal, borderRadius: 24, animation: "slideUp 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10" style={{ background: s.topAccent }} />

        {/* Modal header */}
        <div
          className="sticky top-0 px-6 py-5 flex items-center justify-between rounded-t-[24px] border-b transition-all duration-300"
          style={{ ...s.header, backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border transition-all duration-300"
              style={{ background: s.avatarBg, borderColor: s.avatarBorder }}
            >
              {isDark ? "🔥" : "💙"}
            </div>
            <div>
              <h2 className="text-xl font-bold transition-colors duration-300" style={s.title}>Success Story</h2>
              <p className="text-sm transition-colors duration-300" style={s.subtitle}>Verified User</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={s.closeBtn}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = s.closeBtnHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = s.closeBtnLeave; }}
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
                style={i < review.rating ? { color: "#fbbf24", fill: "#fbbf24" } : s.starEmpty}
              />
            ))}
          </div>

          {/* Story text */}
          <div className="rounded-2xl p-6 md:p-8 relative border transition-all duration-300" style={s.storyBox}>
            <Quote className="absolute top-4 right-4 w-12 h-12 pointer-events-none" style={s.quoteIcon} />
            <p className="text-base md:text-lg leading-relaxed italic relative z-10 transition-colors duration-300" style={s.storyText}>
              "{review.text}"
            </p>
          </div>

          {/* Date */}
          <div className="flex items-center justify-center gap-2 text-sm transition-colors duration-300" style={s.dateColor}>
            <Calendar className="w-4 h-4" style={s.calendarIcon} />
            <span>Shared on {formatDate(review.created_at)}</span>
          </div>

          {/* Footer message */}
          <div className="rounded-2xl p-4 text-center border transition-all duration-300" style={s.footer}>
            <p className="text-sm font-medium transition-colors duration-300" style={s.footerText}>
              {s.footerEmoji} Thank you for sharing your story with our community!
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
  const { isDark } = useTheme();
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

  const s = isDark ? {
    wrapper: {
      background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
      borderColor: "rgba(249,115,22,0.18)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.4) 50%, transparent 92%)",
    ambientGlow: "radial-gradient(ellipse at top, rgba(249,115,22,0.07) 0%, transparent 70%)",
    fadeLeft: "linear-gradient(to right, #141008, transparent)",
    fadeRight: "linear-gradient(to left, #141008, transparent)",
    quoteIcon: { color: "#f97316" },
    heading: { color: "#f0e8de" },
    subheading: { color: "#8a6540" },
    loadingWrapper: {
      background: "linear-gradient(145deg, #1a1a1a, #130e06)",
      borderColor: "rgba(249,115,22,0.15)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    },
    loadingIcon: { color: "#f97316" },
    loadingText: { color: "#8a6540" },
  } : {
    wrapper: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.15)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.3) 50%, transparent 92%)",
    ambientGlow: "radial-gradient(ellipse at top, rgba(29,78,216,0.05) 0%, transparent 70%)",
    fadeLeft: "linear-gradient(to right, #f8f9fc, transparent)",
    fadeRight: "linear-gradient(to left, #f8f9fc, transparent)",
    quoteIcon: { color: "#1d4ed8" },
    heading: { color: "#1e293b" },
    subheading: { color: "#64748b" },
    loadingWrapper: {
      background: "linear-gradient(145deg, #ffffff, #f8f9fc)",
      borderColor: "rgba(29,78,216,0.12)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
    },
    loadingIcon: { color: "#1d4ed8" },
    loadingText: { color: "#64748b" },
  };

  /* Loading */
  if (loading) {
    return (
      <div
        className="w-full rounded-[2rem] p-6 md:p-8 border relative overflow-hidden transition-all duration-300"
        style={s.loadingWrapper}
      >
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" style={s.loadingIcon} />
          <p className="text-sm transition-colors duration-300" style={s.loadingText}>Loading success stories…</p>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) return null;

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <>
      <div
        className="w-full rounded-[2rem] p-6 md:p-8 border overflow-hidden relative group transition-all duration-300"
        style={s.wrapper}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: s.topAccent }} />
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
          style={{ background: s.ambientGlow }}
        />

        {/* Section header */}
        <div className="text-center mb-6 md:mb-8 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Quote className="w-6 h-6 transition-colors duration-300" style={s.quoteIcon} />
            <h2 className="text-xl md:text-2xl font-black transition-colors duration-300" style={s.heading}>
              Success Stories
            </h2>
          </div>
          <p className="text-xs md:text-sm mt-1 transition-colors duration-300" style={s.subheading}>
            Real stories from our community • Click to read more
          </p>
        </div>

        {/* Scrolling marquee */}
        <div className="relative w-full overflow-hidden">
          {/* Left fade */}
          <div className="absolute top-0 bottom-0 left-0 w-8 md:w-20 z-10 pointer-events-none" style={{ background: s.fadeLeft }} />
          {/* Right fade */}
          <div className="absolute top-0 bottom-0 right-0 w-8 md:w-20 z-10 pointer-events-none" style={{ background: s.fadeRight }} />

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
   REVIEWS BANNER (static variant)
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

export const ReviewsBanner = () => {
  const { isDark } = useTheme();

  const s = isDark ? {
    wrapper: {
      background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
      borderColor: "rgba(249,115,22,0.2)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.42) 50%, transparent 90%)",
    cornerGlow: "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 65%)",
    iconWrap: {
      background: "rgba(249,115,22,0.12)",
      borderColor: "rgba(249,115,22,0.3)",
      boxShadow: "0 0 14px rgba(249,115,22,0.15)",
    },
    icon: { color: "#f97316" },
    heading: { color: "#f0e8de" },
    subtitle: { color: "#8a6540" },
    avatarBg: "rgba(249,115,22,0.1)",
    avatarBorder: "rgba(249,115,22,0.25)",
    avatarDot: "rgba(249,115,22,0.5)",
    name: { color: "#f0e8de" },
    reviewText: { color: "#c4a882" },
    timestamp: { color: "#8a6540" },
    divider: { borderColor: "rgba(249,115,22,0.12)" },
    stackAvatarBg: "rgba(249,115,22,0.12)",
    stackAvatarBorder: "#141008",
    joinText: { color: "#c4a882" },
    ratingBadge: {
      background: "rgba(251,191,36,0.1)",
      borderColor: "rgba(251,191,36,0.3)",
    },
    ratingText: { color: "#fbbf24" },
    bannerGlow: `
      @keyframes bannerGlow {
        0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        50%     { box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(249,115,22,0.1); }
      }
    `,
  } : {
    wrapper: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.15)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.3) 50%, transparent 90%)",
    cornerGlow: "radial-gradient(circle at top right, rgba(29,78,216,0.06) 0%, transparent 65%)",
    iconWrap: {
      background: "rgba(29,78,216,0.08)",
      borderColor: "rgba(29,78,216,0.25)",
      boxShadow: "0 0 14px rgba(29,78,216,0.08)",
    },
    icon: { color: "#1d4ed8" },
    heading: { color: "#1e293b" },
    subtitle: { color: "#64748b" },
    avatarBg: "rgba(29,78,216,0.08)",
    avatarBorder: "rgba(29,78,216,0.2)",
    avatarDot: "rgba(29,78,216,0.4)",
    name: { color: "#1e293b" },
    reviewText: { color: "#475569" },
    timestamp: { color: "#94a3b8" },
    divider: { borderColor: "rgba(29,78,216,0.1)" },
    stackAvatarBg: "rgba(29,78,216,0.08)",
    stackAvatarBorder: "#f8f9fc",
    joinText: { color: "#475569" },
    ratingBadge: {
      background: "rgba(251,191,36,0.08)",
      borderColor: "rgba(251,191,36,0.25)",
    },
    ratingText: { color: "#d97706" },
    bannerGlow: `
      @keyframes bannerGlow {
        0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.06); }
        50%     { box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 0 24px rgba(29,78,216,0.08); }
      }
    `,
  };

  return (
    <>
      <style>{s.bannerGlow}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-6 lg:p-8 relative overflow-hidden border transition-all duration-300"
        style={{ ...s.wrapper, animation: "bannerGlow 4s ease-in-out infinite" }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: s.topAccent }} />
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: s.cornerGlow }} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div
            className="p-2.5 rounded-xl border transition-all duration-300"
            style={s.iconWrap}
          >
            <Quote className="w-5 h-5 transition-colors duration-300" style={s.icon} />
          </div>
          <div>
            <h3 className="font-bold text-lg transition-colors duration-300" style={s.heading}>
              Anonymous Success Stories
            </h3>
            <p className="text-sm transition-colors duration-300" style={s.subtitle}>
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
                className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300"
                style={{ background: s.avatarBg, borderColor: s.avatarBorder }}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: s.avatarDot }} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm transition-colors duration-300" style={s.name}>
                    {review.name}
                  </span>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm mb-1 transition-colors duration-300" style={s.reviewText}>
                  {review.text}
                </p>
                <span className="text-xs transition-colors duration-300" style={s.timestamp}>
                  {review.time}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-6 pt-5 flex items-center justify-between relative z-10 border-t transition-all duration-300"
          style={s.divider}
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 transition-all duration-300"
                  style={{ background: s.stackAvatarBg, borderColor: s.stackAvatarBorder }}
                />
              ))}
            </div>
            <span className="text-sm transition-colors duration-300" style={s.joinText}>
              Join 10K+ happy users
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300"
            style={s.ratingBadge}
          >
            <Star className="w-4 h-4" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
            <span className="font-bold transition-colors duration-300" style={s.ratingText}>4.9</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};