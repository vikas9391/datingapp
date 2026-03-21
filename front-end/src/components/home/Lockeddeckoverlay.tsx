import React from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

interface LockedDeckOverlayProps {
  onUnlockClick: () => void;
  isPremium?: boolean;
}

const LockedDeckOverlay: React.FC<LockedDeckOverlayProps> = ({
  onUnlockClick,
  isPremium = false,
}) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    overlay: { background: "rgba(13,13,13,0.82)", backdropFilter: "blur(12px)" },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.5) 50%, transparent 90%)",
    ambientGlow: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
    // Premium (daily cap)
    premiumIconPulse: { background: "rgba(249,115,22,0.15)" },
    premiumIconWrap: {
      background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
      boxShadow: "0 12px 36px rgba(194,65,12,0.5)",
    },
    badge: {
      background: "rgba(249,115,22,0.1)",
      borderColor: "rgba(249,115,22,0.3)",
    },
    badgeIcon: { color: "#f97316", fill: "#f97316" },
    badgeText: { color: "#f97316" },
    heading: { color: "#f0e8de" },
    subtext: { color: "#c4a882" },
    primaryBtn: {
      background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
      boxShadow: "0 8px 28px rgba(194,65,12,0.45)",
    },
    primaryBtnIcon: { color: "#ffffff", fill: "#ffffff" },
    helperText: { color: "#8a6540" },
    // Free user lock
    lockIconWrap: {
      background: "linear-gradient(145deg, #1e1e1e, #111008)",
      borderColor: "rgba(249,115,22,0.4)",
      boxShadow: "0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)",
    },
    lockIcon: { color: "#f97316" },
    lockIconPulse: { background: "rgba(249,115,22,0.12)" },
    freeHeading: { color: "#f0e8de" },
    freeSubtext: { color: "#c4a882" },
    freePrimaryBtn: {
      background: "linear-gradient(135deg, #c2410c, #f97316, #fbbf24)",
      boxShadow: "0 8px 28px rgba(194,65,12,0.45)",
    },
    freeSecondaryBtn: {
      color: "#c4a882",
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(249,115,22,0.2)",
    },
    freeSecondaryHover: {
      background: "rgba(249,115,22,0.08)",
      borderColor: "rgba(249,115,22,0.4)",
      color: "#f0e8de",
    },
    freeSecondaryLeave: {
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(249,115,22,0.2)",
      color: "#c4a882",
    },
  } : {
    overlay: { background: "rgba(240,247,255,0.88)", backdropFilter: "blur(12px)" },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.45) 50%, transparent 90%)",
    ambientGlow: "radial-gradient(ellipse, rgba(29,78,216,0.08) 0%, transparent 70%)",
    // Premium (daily cap)
    premiumIconPulse: { background: "rgba(29,78,216,0.12)" },
    premiumIconWrap: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 12px 36px rgba(29,78,216,0.35)",
    },
    badge: {
      background: "rgba(29,78,216,0.08)",
      borderColor: "rgba(29,78,216,0.25)",
    },
    badgeIcon: { color: "#1d4ed8", fill: "#1d4ed8" },
    badgeText: { color: "#1d4ed8" },
    heading: { color: "#1e293b" },
    subtext: { color: "#475569" },
    primaryBtn: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 8px 28px rgba(29,78,216,0.35)",
    },
    primaryBtnIcon: { color: "#ffffff", fill: "#ffffff" },
    helperText: { color: "#64748b" },
    // Free user lock
    lockIconWrap: {
      background: "linear-gradient(145deg, #ffffff, #f1f5ff)",
      borderColor: "rgba(29,78,216,0.35)",
      boxShadow: "0 12px 36px rgba(0,0,0,0.08), 0 0 0 1px rgba(29,78,216,0.1)",
    },
    lockIcon: { color: "#1d4ed8" },
    lockIconPulse: { background: "rgba(29,78,216,0.08)" },
    freeHeading: { color: "#1e293b" },
    freeSubtext: { color: "#475569" },
    freePrimaryBtn: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 8px 28px rgba(29,78,216,0.35)",
    },
    freeSecondaryBtn: {
      color: "#475569",
      background: "rgba(29,78,216,0.04)",
      borderColor: "rgba(29,78,216,0.15)",
    },
    freeSecondaryHover: {
      background: "rgba(29,78,216,0.1)",
      borderColor: "rgba(29,78,216,0.35)",
      color: "#1e293b",
    },
    freeSecondaryLeave: {
      background: "rgba(29,78,216,0.04)",
      borderColor: "rgba(29,78,216,0.15)",
      color: "#475569",
    },
  };

  /* ─────────────────────────────────────────────────────────────
     PREMIUM USER — hit daily cap
  ───────────────────────────────────────────────────────────── */
  if (isPremium) {
    return (
      <div className="absolute inset-0 z-20 rounded-[32px] md:rounded-[40px] overflow-hidden">
        <div
          className="absolute inset-0 rounded-[32px] md:rounded-[40px] transition-all duration-300"
          style={s.overlay}
        />

        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: s.topAccent }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-8 text-center"
        >
          {/* Icon */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl"
              style={s.premiumIconPulse}
            />
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative transition-all duration-300"
              style={s.premiumIconWrap}
            >
              <RefreshCw className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Text */}
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 border transition-all duration-300"
              style={s.badge}
            >
              <Crown className="w-3 h-3" style={s.badgeIcon} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={s.badgeText}>
                Daily Limit Reached
              </span>
            </div>
            <h3 className="text-2xl font-black leading-tight mb-2 transition-colors duration-300" style={s.heading}>
              Come back tomorrow
            </h3>
            <p className="text-sm leading-relaxed max-w-[240px] mx-auto transition-colors duration-300" style={s.subtext}>
              You've used all your swipes for today. Your limit resets at midnight.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/premium")}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={s.primaryBtn}
            >
              <Crown className="w-4 h-4" style={s.primaryBtnIcon} />
              Upgrade for More Swipes
            </motion.button>
            <p className="text-xs text-center transition-colors duration-300" style={s.helperText}>
              Upgrade your plan to get more daily swipes
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     FREE USER — hit 3-swipe limit
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="absolute inset-0 z-20 rounded-[32px] md:rounded-[40px] overflow-hidden">
      <div
        className="absolute inset-0 rounded-[32px] md:rounded-[40px] transition-all duration-300"
        style={s.overlay}
      />

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
        style={{ background: s.ambientGlow }}
      />

      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: s.topAccent }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-8 text-center"
      >
        {/* Lock icon with pulsing ring */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-3 rounded-3xl"
            style={s.lockIconPulse}
          />
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative border transition-all duration-300"
            style={s.lockIconWrap}
          >
            <Lock className="w-9 h-9" style={s.lockIcon} strokeWidth={2.5} />
          </div>
        </div>

        {/* Text */}
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 border transition-all duration-300"
            style={s.badge}
          >
            <Crown className="w-3 h-3" style={s.badgeIcon} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={s.badgeText}>
              Premium Required
            </span>
          </div>
          <h3 className="text-2xl font-black leading-tight mb-2 transition-colors duration-300" style={s.freeHeading}>
            3 free swipes used
          </h3>
          <p className="text-sm leading-relaxed max-w-[240px] mx-auto transition-colors duration-300" style={s.freeSubtext}>
            You've reached the free limit. Upgrade for unlimited swipes and discover everyone nearby.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/premium")}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
            style={s.freePrimaryBtn}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#fef3c7", fill: "#fef3c7" }} />
            Upgrade to Premium
          </motion.button>

          <button
            onClick={() => navigate("/premium")}
            className="w-full py-3 rounded-2xl font-semibold text-xs transition-all border"
            style={s.freeSecondaryBtn}
            onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, s.freeSecondaryHover); }}
            onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, s.freeSecondaryLeave); }}
          >
            See what's included →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LockedDeckOverlay;