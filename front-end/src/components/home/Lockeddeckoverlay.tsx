import React from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, RefreshCw, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LockedDeckOverlayProps {
  onUnlockClick: () => void;
  isPremium?: boolean;
}

const LockedDeckOverlay: React.FC<LockedDeckOverlayProps> = ({
  onUnlockClick,
  isPremium = false,
}) => {
  const navigate = useNavigate();

  /* ─────────────────────────────────────────────────────────────
     PREMIUM USER — hit daily cap
  ───────────────────────────────────────────────────────────── */
  if (isPremium) {
    return (
      <div className="absolute inset-0 z-20 rounded-[32px] md:rounded-[40px] overflow-hidden">
        {/* Blurred dark overlay */}
        <div
          className="absolute inset-0 rounded-[32px] md:rounded-[40px]"
          style={{ background: "rgba(13,13,13,0.82)", backdropFilter: "blur(12px)" }}
        />

        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.5) 50%, transparent 90%)" }}
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
              style={{ background: "rgba(249,115,22,0.15)" }}
            />
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative"
              style={{
                background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
                boxShadow: "0 12px 36px rgba(194,65,12,0.5)",
              }}
            >
              <RefreshCw className="w-9 h-9 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Text */}
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 border"
              style={{
                background: "rgba(249,115,22,0.1)",
                borderColor: "rgba(249,115,22,0.3)",
              }}
            >
              <Crown className="w-3 h-3" style={{ color: "#f97316", fill: "#f97316" }} />
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "#f97316" }}
              >
                Daily Limit Reached
              </span>
            </div>
            {/* CONTRAST FIX: was slate-900 on dark bg */}
            <h3 className="text-2xl font-black leading-tight mb-2" style={{ color: "#f0e8de" }}>
              Come back tomorrow
            </h3>
            <p className="text-sm leading-relaxed max-w-[240px] mx-auto" style={{ color: "#c4a882" }}>
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
              style={{
                background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
                boxShadow: "0 8px 28px rgba(194,65,12,0.45)",
              }}
            >
              <Crown className="w-4 h-4 text-white fill-white" />
              Upgrade for More Swipes
            </motion.button>
            {/* CONTRAST FIX: was slate-400 */}
            <p className="text-xs text-center" style={{ color: "#8a6540" }}>
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
      {/* Blurred dark overlay */}
      <div
        className="absolute inset-0 rounded-[32px] md:rounded-[40px]"
        style={{ background: "rgba(13,13,13,0.85)", backdropFilter: "blur(12px)" }}
      />

      {/* Ambient orange glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)" }}
      />

      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
        style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.5) 50%, transparent 90%)" }}
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
            style={{ background: "rgba(249,115,22,0.12)" }}
          />
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative border"
            style={{
              background: "linear-gradient(145deg, #1e1e1e, #111008)",
              borderColor: "rgba(249,115,22,0.4)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)",
            }}
          >
            <Lock className="w-9 h-9" style={{ color: "#f97316" }} strokeWidth={2.5} />
          </div>
        </div>

        {/* Text */}
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 border"
            style={{
              background: "rgba(249,115,22,0.08)",
              borderColor: "rgba(249,115,22,0.3)",
            }}
          >
            <Crown className="w-3 h-3" style={{ color: "#f97316", fill: "#f97316" }} />
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "#f97316" }}
            >
              Premium Required
            </span>
          </div>
          {/* CONTRAST FIX: was slate-900 on dark */}
          <h3 className="text-2xl font-black leading-tight mb-2" style={{ color: "#f0e8de" }}>
            3 free swipes used
          </h3>
          {/* CONTRAST FIX: was slate-500 */}
          <p className="text-sm leading-relaxed max-w-[240px] mx-auto" style={{ color: "#c4a882" }}>
            You've reached the free limit. Upgrade for unlimited swipes and discover everyone nearby.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
          {/* Primary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate("/premium")}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #c2410c, #f97316, #fbbf24)",
              boxShadow: "0 8px 28px rgba(194,65,12,0.45)",
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#fef3c7", fill: "#fef3c7" }} />
            Upgrade to Premium
          </motion.button>

          {/* Secondary */}
          <button
            onClick={() => navigate("/premium")}
            className="w-full py-3 rounded-2xl font-semibold text-xs transition-all border"
            style={{
              color: "#c4a882",
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(249,115,22,0.2)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(249,115,22,0.08)";
              el.style.borderColor = "rgba(249,115,22,0.4)";
              el.style.color = "#f0e8de";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,255,255,0.04)";
              el.style.borderColor = "rgba(249,115,22,0.2)";
              el.style.color = "#c4a882";
            }}
          >
            See what's included →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LockedDeckOverlay;