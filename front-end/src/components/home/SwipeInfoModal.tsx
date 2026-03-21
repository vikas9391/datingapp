// src/components/home/SwipeInfoModal.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, Zap, Eye, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

interface SwipeInfoModalProps {
  open: boolean;
  onClose: () => void;
  mode: "welcome" | "last-swipe";
}

const SwipeInfoModal: React.FC<SwipeInfoModalProps> = ({ open, onClose, mode }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const isWelcome = mode === "welcome";

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    backdrop: "bg-black/70",
    modal: {
      background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
      border: "1px solid rgba(249,115,22,0.28)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.6) 50%, transparent 92%)",
    header: {
      background: isWelcome
        ? "linear-gradient(135deg, #1a0f04 0%, #2d1605 50%, #1a0c04 100%)"
        : "linear-gradient(135deg, #1e0f02 0%, #331504 50%, #1e0e02 100%)",
    },
    glowTR: isWelcome
      ? "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%)",
    glowBL: "radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)",
    closeBtn: {
      background: "rgba(249,115,22,0.15)",
      border: "1px solid rgba(249,115,22,0.25)",
      color: "#fb923c",
    },
    closeBtnHover: "rgba(249,115,22,0.28)",
    closeBtnLeave: "rgba(249,115,22,0.15)",
    iconWrap: {
      background: isWelcome
        ? "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(249,115,22,0.25))"
        : "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(234,88,12,0.3))",
      border: "1px solid rgba(249,115,22,0.4)",
      boxShadow: "0 0 28px rgba(249,115,22,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    heartColor: { color: "#fbbf24", fill: "#fbbf24" },
    zapColor:   { color: "#fb923c", fill: "#fb923c" },
    badge: { background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" },
    badgeSpark: { color: "#fbbf24" },
    badgeText: { color: "#fb923c" },
    heading: { color: "#f0e8de" },
    subtext: { color: "#c4a882" },
    swipeDotRow: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(249,115,22,0.16)",
    },
    swipeDotFilled: "#f97316",
    swipeDotEmpty: "rgba(100,50,15,0.6)",
    swipeDotLast: "#fb923c",
    swipeLabel: { color: "#f0e8de" },
    swipeLimit: { color: "#8a6540" },
    perkCard: {
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(249,115,22,0.14)",
    },
    perkIconWrap: { background: "rgba(249,115,22,0.18)", border: "1px solid rgba(249,115,22,0.28)" },
    perkIconColor: { color: "#fb923c" },
    perkLabel: { color: "#f0e8de" },
    perkSub: { color: "#8a6540" },
    primaryBtn: {
      background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
      boxShadow: "0 4px 20px rgba(194,65,12,0.5)",
      color: "#fff",
    },
    secondaryBtnWelcome: {
      background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
      color: "#fff",
      boxShadow: "0 4px 20px rgba(194,65,12,0.45)",
    },
    secondaryBtnLastSwipe: {
      background: "rgba(255,255,255,0.05)",
      color: "#c4a882",
      border: "1px solid rgba(249,115,22,0.18)",
    },
    particleGradient: "radial-gradient(circle, #fbbf24, #f97316)",
    particleShadow: "0 0 6px 2px rgba(251,146,60,0.5)",
  } : {
    backdrop: "bg-black/40",
    modal: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      border: "1px solid rgba(29,78,216,0.2)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(29,78,216,0.06)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.4) 50%, transparent 92%)",
    header: {
      background: isWelcome
        ? "linear-gradient(135deg, #eff6ff 0%, #f8f9fc 50%, #eff6ff 100%)"
        : "linear-gradient(135deg, #f1f5ff 0%, #f8f9fc 50%, #f1f5ff 100%)",
    },
    glowTR: isWelcome
      ? "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)",
    glowBL: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
    closeBtn: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.2)",
      color: "#1d4ed8",
    },
    closeBtnHover: "rgba(29,78,216,0.15)",
    closeBtnLeave: "rgba(29,78,216,0.08)",
    iconWrap: {
      background: isWelcome
        ? "linear-gradient(135deg, rgba(29,78,216,0.15), rgba(59,130,246,0.15))"
        : "linear-gradient(135deg, rgba(29,78,216,0.15), rgba(29,78,216,0.15))",
      border: "1px solid rgba(29,78,216,0.3)",
      boxShadow: "0 0 28px rgba(29,78,216,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
    },
    heartColor: { color: "#1d4ed8", fill: "#1d4ed8" },
    zapColor:   { color: "#3b82f6", fill: "#3b82f6" },
    badge: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.25)" },
    badgeSpark: { color: "#1d4ed8" },
    badgeText: { color: "#1d4ed8" },
    heading: { color: "#1e293b" },
    subtext: { color: "#475569" },
    swipeDotRow: {
      background: "rgba(29,78,216,0.04)",
      border: "1px solid rgba(29,78,216,0.12)",
    },
    swipeDotFilled: "#1d4ed8",
    swipeDotEmpty: "rgba(203,213,225,0.8)",
    swipeDotLast: "#3b82f6",
    swipeLabel: { color: "#1e293b" },
    swipeLimit: { color: "#64748b" },
    perkCard: {
      background: "rgba(29,78,216,0.03)",
      border: "1px solid rgba(29,78,216,0.12)",
    },
    perkIconWrap: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.18)" },
    perkIconColor: { color: "#1d4ed8" },
    perkLabel: { color: "#1e293b" },
    perkSub: { color: "#64748b" },
    primaryBtn: {
      background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
      boxShadow: "0 4px 20px rgba(29,78,216,0.35)",
      color: "#fff",
    },
    secondaryBtnWelcome: {
      background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
      color: "#fff",
      boxShadow: "0 4px 20px rgba(29,78,216,0.3)",
    },
    secondaryBtnLastSwipe: {
      background: "rgba(29,78,216,0.05)",
      color: "#475569",
      border: "1px solid rgba(29,78,216,0.15)",
    },
    particleGradient: "radial-gradient(circle, #60a5fa, #1d4ed8)",
    particleShadow: "0 0 6px 2px rgba(29,78,216,0.4)",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 z-50 ${s.backdrop} backdrop-blur-sm`}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-0 z-50 m-auto max-w-md h-fit rounded-[36px] overflow-hidden mx-4 sm:mx-auto transition-all duration-300"
            style={s.modal}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
              style={{ background: s.topAccent }}
            />

            {/* Header */}
            <div
              className="relative px-8 pt-10 pb-8 overflow-hidden transition-all duration-300"
              style={s.header}
            >
              {/* Ambient glows */}
              <div
                className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: s.glowTR }}
              />
              <div
                className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: s.glowBL }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={s.closeBtn}
                onMouseEnter={(e) => (e.currentTarget.style.background = s.closeBtnHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = s.closeBtnLeave)}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Floating particles (welcome only) */}
              {isWelcome && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 20}%` }}
                      animate={{ y: [-4, 4, -4], opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.particleGradient, boxShadow: s.particleShadow }}
                      />
                    </motion.div>
                  ))}
                </>
              )}

              {/* Icon */}
              <div className="relative flex justify-center mb-5">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300"
                  style={s.iconWrap}
                >
                  {isWelcome
                    ? <Heart className="w-10 h-10" style={s.heartColor} />
                    : <Zap className="w-10 h-10" style={s.zapColor} />
                  }
                </motion.div>
              </div>

              <div className="relative text-center">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 transition-all duration-300"
                    style={s.badge}
                  >
                    {isWelcome
                      ? <Sparkles className="w-3 h-3" style={s.badgeSpark} />
                      : <Crown className="w-3 h-3" style={s.badgeSpark} />
                    }
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={s.badgeText}>
                      {isWelcome ? "Welcome" : "Heads up!"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mb-2 leading-tight transition-colors duration-300" style={s.heading}>
                    {isWelcome ? "You have 3 free swipes" : "Last free swipe\nremaining ⚡"}
                  </h2>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto transition-colors duration-300" style={s.subtext}>
                    {isWelcome
                      ? "You get 3 free swipes total. Make them count to find your perfect match!"
                      : "This is your last free swipe. Upgrade to Premium for unlimited swipes."
                    }
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Swipe dots indicator */}
            <div className="px-8 pt-6 pb-2">
              <div
                className="flex items-center justify-between rounded-2xl p-4 transition-all duration-300"
                style={s.swipeDotRow}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: isWelcome
                            ? s.swipeDotFilled
                            : i < 2
                            ? s.swipeDotEmpty
                            : s.swipeDotLast,
                          boxShadow: (isWelcome || i === 2)
                            ? `0 0 6px ${isDark ? "rgba(249,115,22,0.7)" : "rgba(29,78,216,0.5)"}`
                            : "none",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold ml-1 transition-colors duration-300" style={s.swipeLabel}>
                    {isWelcome ? "3 free swipes" : "1 swipe left"}
                  </span>
                </div>
                <span className="text-xs font-medium transition-colors duration-300" style={s.swipeLimit}>
                  {isWelcome ? "Free limit" : "then Premium"}
                </span>
              </div>

              {/* Perks row */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { icon: Zap,   label: "Unlimited", sub: "with Premium" },
                  { icon: Eye,   label: "See likes",  sub: "who liked you" },
                  { icon: Crown, label: "Priority",   sub: "in results" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all duration-300"
                    style={s.perkCard}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300"
                      style={s.perkIconWrap}
                    >
                      <Icon className="w-3.5 h-3.5" style={s.perkIconColor} />
                    </div>
                    <span className="text-[11px] font-bold transition-colors duration-300" style={s.perkLabel}>{label}</span>
                    <span className="text-[9px] text-center leading-tight transition-colors duration-300" style={s.perkSub}>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="px-8 py-6 space-y-2.5">
              {!isWelcome && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate("/premium"); }}
                  className="w-full py-4 rounded-2xl font-black text-base text-white transition-opacity flex items-center justify-center gap-2 hover:opacity-95"
                  style={s.primaryBtn}
                >
                  <Sparkles className="w-5 h-5" style={{ color: isDark ? "#fbbf24" : "#ffffff", fill: isDark ? "#fbbf24" : "#ffffff" }} />
                  Upgrade to Premium
                </motion.button>
              )}
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                style={isWelcome ? s.secondaryBtnWelcome : s.secondaryBtnLastSwipe}
              >
                {isWelcome ? (
                  <><Heart className="w-4 h-4 fill-current" /> Start Swiping</>
                ) : (
                  "Use my last swipe"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SwipeInfoModal;