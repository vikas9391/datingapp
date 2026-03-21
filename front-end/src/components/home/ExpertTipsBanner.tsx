import React, { useState, useEffect, useRef } from "react";
import {
  Lightbulb, Sparkles, Target, MessageCircle,
  Heart, Star, Zap, Users, TrendingUp, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const ICON_MAP: { [key: string]: any } = {
  "message-circle": MessageCircle,
  "target":         Target,
  "sparkles":       Sparkles,
  "lightbulb":      Lightbulb,
  "heart":          Heart,
  "star":           Star,
  "zap":            Zap,
  "users":          Users,
  "trending-up":    TrendingUp,
};

const API_BASE = import.meta.env.VITE_API_BASE;

interface ExpertTip {
  id: number;
  name: string;
  role: string;
  image: string;
  tip: string;
  icon: string;
  icon_color: string;
  bg_color: string;
}

export default function ExpertTipsBanner() {
  const { isDark } = useTheme();
  const [experts, setExperts]         = useState<ExpertTip[]>([]);
  const [allExperts, setAllExperts]   = useState<ExpertTip[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAllTips, setShowAllTips] = useState(false);
  const [selectedTip, setSelectedTip] = useState<ExpertTip | null>(null);
  const [showLeftArrow, setShowLeftArrow]   = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchExpertTips(); }, []);
  useEffect(() => { checkScrollButtons(); }, [experts]);

  useEffect(() => {
    document.body.style.overflow = selectedTip ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedTip]);

  const fetchExpertTips = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/expert-tips/?limit=3`);
      if (response.ok) setExperts(await response.json());
    } catch (error) {
      console.error("Error fetching expert tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllExpertTips = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/expert-tips/`);
      if (response.ok) {
        setAllExperts(await response.json());
        setShowAllTips(true);
      }
    } catch (error) {
      console.error("Error fetching all expert tips:", error);
    }
  };

  const handleViewAll = () => {
    if (showAllTips) setShowAllTips(false);
    else fetchAllExpertTips();
  };

  const checkScrollButtons = () => {
    const c = scrollContainerRef.current;
    if (c) {
      setShowLeftArrow(c.scrollLeft > 0);
      setShowRightArrow(c.scrollLeft < c.scrollWidth - c.clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    const c = scrollContainerRef.current;
    if (c) {
      c.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
      setTimeout(checkScrollButtons, 300);
    }
  };

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    loadingText: { color: "#8a6540" },
    banner: {
      background: "linear-gradient(145deg, #1a1208 0%, #0f0b04 100%)",
      borderColor: "rgba(249,115,22,0.2)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)",
    },
    ambientGlow: "radial-gradient(circle at top left, rgba(249,115,22,0.07) 0%, transparent 65%)",
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.4) 50%, transparent 92%)",
    heading: { color: "#f0e8de" },
    headingIcon: { color: "#f97316" },
    subtitle: { color: "#8a6540" },
    viewAllBtn: { color: "#f97316" },
    viewAllHover: "#fb923c",
    // Card
    card: {
      background: "linear-gradient(145deg, #1e1e1e 0%, #160f06 100%)",
      borderColor: "rgba(249,115,22,0.18)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    },
    cardHoverShadow: "0 8px 32px rgba(249,115,22,0.15)",
    cardBaseShadow: "0 4px 20px rgba(0,0,0,0.4)",
    cardTopAccent: "linear-gradient(90deg, transparent 15%, rgba(249,115,22,0.35) 50%, transparent 85%)",
    cardCornerGlow: "radial-gradient(circle at top right, rgba(249,115,22,0.08) 0%, transparent 70%)",
    cardIconWrap: {
      background: "rgba(249,115,22,0.12)",
      border: "1px solid rgba(249,115,22,0.25)",
    },
    cardIcon: { color: "#f97316" },
    expertImgBorder: { borderColor: "rgba(249,115,22,0.25)" },
    expertName: { color: "#f0e8de" },
    expertRole: { color: "#8a6540" },
    expertTip: { color: "#c4a882" },
    // Scroll arrows
    arrowBtn: {
      background: "#1c1c1c",
      border: "1px solid rgba(249,115,22,0.3)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    },
    arrowIcon: { color: "#f97316" },
    // Modal
    modalOverlay: "rgba(0,0,0,0.8)",
    modal: {
      background: "linear-gradient(145deg, #1e1810 0%, #130d05 100%)",
      borderColor: "rgba(249,115,22,0.3)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.1)",
    },
    modalTopAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.45) 50%, transparent 90%)",
    modalHeader: {
      borderColor: "rgba(249,115,22,0.15)",
      background: "rgba(249,115,22,0.04)",
    },
    modalTitle: { color: "#f0e8de" },
    modalTitleIcon: { color: "#f97316" },
    closeBtn: { color: "#8a6540" },
    closeBtnHover: { color: "#f0e8de", background: "rgba(249,115,22,0.1)" },
    closeBtnLeave: { color: "#8a6540", background: "transparent" },
    modalIconWrap: {
      background: "rgba(249,115,22,0.12)",
      borderColor: "rgba(249,115,22,0.3)",
      boxShadow: "0 0 20px rgba(249,115,22,0.15)",
    },
    modalIcon: { color: "#f97316" },
    modalImgBorder: { borderColor: "rgba(249,115,22,0.3)" },
    modalName: { color: "#f0e8de" },
    modalRole: { color: "#8a6540" },
    modalTipBox: {
      background: "rgba(249,115,22,0.06)",
      borderColor: "rgba(249,115,22,0.18)",
    },
    modalTipText: { color: "#c4a882" },
  } : {
    loadingText: { color: "#64748b" },
    banner: {
      background: "linear-gradient(145deg, #f8f9fc 0%, #f1f5ff 100%)",
      borderColor: "rgba(29,78,216,0.15)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
    },
    ambientGlow: "radial-gradient(circle at top left, rgba(29,78,216,0.07) 0%, transparent 65%)",
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.35) 50%, transparent 92%)",
    heading: { color: "#1e293b" },
    headingIcon: { color: "#1d4ed8" },
    subtitle: { color: "#64748b" },
    viewAllBtn: { color: "#1d4ed8" },
    viewAllHover: "#1d4ed8",
    // Card
    card: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.15)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    },
    cardHoverShadow: "0 8px 32px rgba(29,78,216,0.12)",
    cardBaseShadow: "0 4px 20px rgba(0,0,0,0.06)",
    cardTopAccent: "linear-gradient(90deg, transparent 15%, rgba(29,78,216,0.3) 50%, transparent 85%)",
    cardCornerGlow: "radial-gradient(circle at top right, rgba(29,78,216,0.06) 0%, transparent 70%)",
    cardIconWrap: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.2)",
    },
    cardIcon: { color: "#1d4ed8" },
    expertImgBorder: { borderColor: "rgba(29,78,216,0.2)" },
    expertName: { color: "#1e293b" },
    expertRole: { color: "#64748b" },
    expertTip: { color: "#475569" },
    // Scroll arrows
    arrowBtn: {
      background: "#ffffff",
      border: "1px solid rgba(29,78,216,0.2)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    },
    arrowIcon: { color: "#1d4ed8" },
    // Modal
    modalOverlay: "rgba(0,0,0,0.5)",
    modal: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.2)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(29,78,216,0.08)",
    },
    modalTopAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.35) 50%, transparent 90%)",
    modalHeader: {
      borderColor: "rgba(29,78,216,0.12)",
      background: "rgba(29,78,216,0.03)",
    },
    modalTitle: { color: "#1e293b" },
    modalTitleIcon: { color: "#1d4ed8" },
    closeBtn: { color: "#94a3b8" },
    closeBtnHover: { color: "#1e293b", background: "rgba(29,78,216,0.08)" },
    closeBtnLeave: { color: "#94a3b8", background: "transparent" },
    modalIconWrap: {
      background: "rgba(29,78,216,0.08)",
      borderColor: "rgba(29,78,216,0.25)",
      boxShadow: "0 0 20px rgba(29,78,216,0.1)",
    },
    modalIcon: { color: "#1d4ed8" },
    modalImgBorder: { borderColor: "rgba(29,78,216,0.2)" },
    modalName: { color: "#1e293b" },
    modalRole: { color: "#64748b" },
    modalTipBox: {
      background: "rgba(29,78,216,0.04)",
      borderColor: "rgba(29,78,216,0.12)",
    },
    modalTipText: { color: "#475569" },
  };

  if (loading) {
    return (
      <div className="text-center py-8 transition-colors duration-300" style={s.loadingText}>
        Loading expert tips…
      </div>
    );
  }

  if (experts.length === 0) return null;

  const displayedExperts = showAllTips ? allExperts : experts;

  /* ─── TIP CARD ─── */
  const TipCard = ({ expert, onClick }: { expert: ExpertTip; onClick?: () => void }) => {
    const IconComponent = ICON_MAP[expert.icon] || Lightbulb;

    return (
      <div
        onClick={onClick}
        className={`rounded-xl p-4 sm:p-6 transition-all border flex-shrink-0 relative overflow-hidden group ${
          !showAllTips ? "w-[280px] sm:w-[320px]" : ""
        } ${onClick ? "cursor-pointer hover:-translate-y-1" : ""}`}
        style={{
          ...s.card,
          transition: "transform 0.25s cubic-bezier(.22,1,.36,1), border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = s.cardHoverShadow;
          (e.currentTarget as HTMLDivElement).style.borderColor = isDark
            ? "rgba(249,115,22,0.35)"
            : "rgba(29,78,216,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = s.cardBaseShadow;
          (e.currentTarget as HTMLDivElement).style.borderColor = s.card.borderColor;
        }}
      >
        {/* Top accent shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: s.cardTopAccent }}
        />
        {/* Corner glow */}
        <div
          className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: s.cardCornerGlow }}
        />

        {/* Icon */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300"
          style={s.cardIconWrap}
        >
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" style={s.cardIcon} />
        </div>

        {/* Expert info */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <img
            src={expert.image}
            alt={expert.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border"
            style={s.expertImgBorder}
            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Expert"; }}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate transition-colors duration-300" style={s.expertName}>
              {expert.name}
            </h3>
            <p className="text-xs sm:text-sm truncate transition-colors duration-300" style={s.expertRole}>
              {expert.role}
            </p>
          </div>
        </div>

        {/* Tip text */}
        <p className="text-sm sm:text-base italic line-clamp-3 transition-colors duration-300" style={s.expertTip}>
          "{expert.tip}"
        </p>
      </div>
    );
  };

  return (
    <>
      {/* ─── BANNER ─── */}
      <div
        className="rounded-2xl p-4 sm:p-6 md:p-8 mb-8 relative overflow-hidden border transition-all duration-300"
        style={s.banner}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-0 w-72 h-72 pointer-events-none"
          style={{ background: s.ambientGlow }}
        />
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: s.topAccent }}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 relative z-10">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold flex items-center gap-2 transition-colors duration-300"
              style={s.heading}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={s.headingIcon} />
              Expert Tips
            </h2>
            <p className="text-sm sm:text-base mt-1 transition-colors duration-300" style={s.subtitle}>
              Maximize match potential
            </p>
          </div>
          <button
            onClick={handleViewAll}
            className="font-semibold flex items-center gap-1 transition-colors text-sm sm:text-base self-start sm:self-auto"
            style={s.viewAllBtn}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = s.viewAllHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = s.viewAllBtn.color; }}
          >
            {showAllTips ? "View less ←" : "View all →"}
          </button>
        </div>

        {/* Grid or scroll */}
        <div className="relative z-10">
          {showAllTips ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {displayedExperts.map((expert) => (
                <TipCard key={expert.id} expert={expert} onClick={() => setSelectedTip(expert)} />
              ))}
            </div>
          ) : (
            <div className="relative">
              {showLeftArrow && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-all hidden md:block"
                  style={s.arrowBtn}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" style={s.arrowIcon} />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
                className="flex gap-4 sm:gap-6 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {displayedExperts.map((expert) => (
                  <TipCard key={expert.id} expert={expert} onClick={() => setSelectedTip(expert)} />
                ))}
              </div>

              {showRightArrow && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition-all hidden md:block"
                  style={s.arrowBtn}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" style={s.arrowIcon} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL ─── */}
      {selectedTip && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          style={{ background: s.modalOverlay, animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setSelectedTip(null)}
        >
          <div
            className="w-full max-w-2xl relative overflow-hidden border transition-all duration-300"
            style={{ ...s.modal, borderRadius: 20, animation: "slideUp 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: s.modalTopAccent }}
            />

            {/* Modal Header */}
            <div
              className="flex justify-between items-center p-6 border-b transition-all duration-300"
              style={s.modalHeader}
            >
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={s.modalTitle}>
                <Sparkles className="w-6 h-6" style={s.modalTitleIcon} />
                Expert Tip
              </h2>
              <button
                onClick={() => setSelectedTip(null)}
                className="p-1.5 rounded-full transition-all"
                style={s.closeBtn}
                onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, s.closeBtnHover); }}
                onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, s.closeBtnLeave); }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {(() => {
                const IconComponent = ICON_MAP[selectedTip.icon] || Lightbulb;
                return (
                  <>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border transition-all duration-300"
                      style={s.modalIconWrap}
                    >
                      <IconComponent className="w-8 h-8" style={s.modalIcon} />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={selectedTip.image}
                        alt={selectedTip.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border"
                        style={s.modalImgBorder}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Expert"; }}
                      />
                      <div>
                        <h3 className="text-xl font-bold transition-colors duration-300" style={s.modalName}>
                          {selectedTip.name}
                        </h3>
                        <p className="text-base transition-colors duration-300" style={s.modalRole}>
                          {selectedTip.role}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-6 border transition-all duration-300"
                      style={s.modalTipBox}
                    >
                      <p className="text-lg italic leading-relaxed transition-colors duration-300" style={s.modalTipText}>
                        "{selectedTip.tip}"
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}