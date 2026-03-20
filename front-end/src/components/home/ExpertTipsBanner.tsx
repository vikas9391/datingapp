import React, { useState, useEffect, useRef } from "react";
import {
  Lightbulb, Sparkles, Target, MessageCircle,
  Heart, Star, Zap, Users, TrendingUp, X, ChevronLeft, ChevronRight,
} from "lucide-react";

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
    if (selectedTip) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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

  if (loading) {
    return (
      <div className="text-center py-8" style={{ color: "#8a6540" }}>
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
        } ${onClick ? "cursor-pointer hover:-translate-y-1 hover:border-orange-500/40" : ""}`}
        style={{
          background: "linear-gradient(145deg, #1e1e1e 0%, #160f06 100%)",
          borderColor: "rgba(249,115,22,0.18)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "transform 0.25s cubic-bezier(.22,1,.36,1), border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(249,115,22,0.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
        }}
      >
        {/* Top accent shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 15%, rgba(249,115,22,0.35) 50%, transparent 85%)" }}
        />
        {/* Corner glow */}
        <div
          className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "radial-gradient(circle at top right, rgba(249,115,22,0.08) 0%, transparent 70%)" }}
        />

        {/* Icon */}
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4"
          style={{
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.25)",
          }}
        >
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#f97316" }} />
        </div>

        {/* Expert info */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <img
            src={expert.image}
            alt={expert.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border"
            style={{ borderColor: "rgba(249,115,22,0.25)" }}
            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Expert"; }}
          />
          <div className="min-w-0">
            {/* CONTRAST FIX: was gray-800 on dark = invisible */}
            <h3 className="font-semibold text-sm sm:text-base truncate" style={{ color: "#f0e8de" }}>
              {expert.name}
            </h3>
            <p className="text-xs sm:text-sm truncate" style={{ color: "#8a6540" }}>
              {expert.role}
            </p>
          </div>
        </div>

        {/* Tip text — CONTRAST FIX: was gray-700 */}
        <p className="text-sm sm:text-base italic line-clamp-3" style={{ color: "#c4a882" }}>
          "{expert.tip}"
        </p>
      </div>
    );
  };

  return (
    <>
      {/* ─── BANNER ─── */}
      <div
        className="rounded-2xl p-4 sm:p-6 md:p-8 mb-8 relative overflow-hidden border"
        style={{
          background: "linear-gradient(145deg, #1a1208 0%, #0f0b04 100%)",
          borderColor: "rgba(249,115,22,0.2)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-0 w-72 h-72 pointer-events-none"
          style={{ background: "radial-gradient(circle at top left, rgba(249,115,22,0.07) 0%, transparent 65%)" }}
        />
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.4) 50%, transparent 92%)" }}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 relative z-10">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold flex items-center gap-2"
              style={{ color: "#f0e8de" }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "#f97316" }} />
              Expert Tips
            </h2>
            {/* CONTRAST FIX: was gray-600 on dark */}
            <p className="text-sm sm:text-base mt-1" style={{ color: "#8a6540" }}>
              Maximize match potential
            </p>
          </div>
          <button
            onClick={handleViewAll}
            className="font-semibold flex items-center gap-1 transition-colors text-sm sm:text-base self-start sm:self-auto"
            style={{ color: "#f97316" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fb923c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f97316"; }}
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
                  style={{
                    background: "#1c1c1c",
                    border: "1px solid rgba(249,115,22,0.3)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: "#f97316" }} />
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
                  style={{
                    background: "#1c1c1c",
                    border: "1px solid rgba(249,115,22,0.3)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: "#f97316" }} />
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
          style={{ background: "rgba(0,0,0,0.8)", animation: "fadeIn 0.2s ease-out" }}
          onClick={() => setSelectedTip(null)}
        >
          <div
            className="w-full max-w-2xl relative overflow-hidden border"
            style={{
              background: "linear-gradient(145deg, #1e1810 0%, #130d05 100%)",
              borderColor: "rgba(249,115,22,0.3)",
              borderRadius: 20,
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.1)",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.45) 50%, transparent 90%)" }}
            />

            {/* Modal Header */}
            <div
              className="flex justify-between items-center p-6 border-b"
              style={{ borderColor: "rgba(249,115,22,0.15)", background: "rgba(249,115,22,0.04)" }}
            >
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: "#f0e8de" }}>
                <Sparkles className="w-6 h-6" style={{ color: "#f97316" }} />
                Expert Tip
              </h2>
              <button
                onClick={() => setSelectedTip(null)}
                className="p-1.5 rounded-full transition-all"
                style={{ color: "#8a6540" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.color = "#f0e8de";
                  el.style.background = "rgba(249,115,22,0.1)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.color = "#8a6540";
                  el.style.background = "transparent";
                }}
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
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border"
                      style={{
                        background: "rgba(249,115,22,0.12)",
                        borderColor: "rgba(249,115,22,0.3)",
                        boxShadow: "0 0 20px rgba(249,115,22,0.15)",
                      }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: "#f97316" }} />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={selectedTip.image}
                        alt={selectedTip.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0 border"
                        style={{ borderColor: "rgba(249,115,22,0.3)" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Expert"; }}
                      />
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: "#f0e8de" }}>
                          {selectedTip.name}
                        </h3>
                        <p className="text-base" style={{ color: "#8a6540" }}>
                          {selectedTip.role}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-6 border"
                      style={{
                        background: "rgba(249,115,22,0.06)",
                        borderColor: "rgba(249,115,22,0.18)",
                      }}
                    >
                      <p className="text-lg italic leading-relaxed" style={{ color: "#c4a882" }}>
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