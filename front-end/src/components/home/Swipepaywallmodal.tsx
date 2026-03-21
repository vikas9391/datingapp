// src/components/home/SwipePaywallModal.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Heart, Zap, Eye, X, Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

interface SwipePaywallModalProps {
  open: boolean;
  onClose: () => void;
  swipesUsed: number;
}

const SwipePaywallModal: React.FC<SwipePaywallModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ─── Theme-aware perks & styles ─── */
  const PERKS_DARK = [
    { icon: Zap,   text: "Unlimited swipes every day",  accent: "rgba(251,191,36,0.16)", border: "rgba(251,191,36,0.28)", iconColor: "#fbbf24" },
    { icon: Eye,   text: "See everyone who liked you",  accent: "rgba(249,115,22,0.16)", border: "rgba(249,115,22,0.28)", iconColor: "#fb923c" },
    { icon: Heart, text: "10× more profile visibility", accent: "rgba(234,88,12,0.16)",  border: "rgba(234,88,12,0.26)",  iconColor: "#f97316" },
    { icon: Crown, text: "Priority in match results",   accent: "rgba(251,146,60,0.15)", border: "rgba(251,146,60,0.25)", iconColor: "#fb923c" },
  ];

  const PERKS_LIGHT = [
    { icon: Zap,   text: "Unlimited swipes every day",  accent: "rgba(29,78,216,0.1)",  border: "rgba(29,78,216,0.2)",  iconColor: "#1d4ed8" },
    { icon: Eye,   text: "See everyone who liked you",  accent: "rgba(29,78,216,0.1)",  border: "rgba(29,78,216,0.2)",  iconColor: "#3b82f6" },
    { icon: Heart, text: "10× more profile visibility", accent: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", iconColor: "#1d4ed8" },
    { icon: Crown, text: "Priority in match results",   accent: "rgba(29,78,216,0.08)", border: "rgba(29,78,216,0.18)", iconColor: "#1d4ed8" },
  ];

  const PERKS = isDark ? PERKS_DARK : PERKS_LIGHT;

  const s = isDark ? {
    backdrop: "bg-black/75",
    modal: {
      background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
      border: "1px solid rgba(249,115,22,0.28)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(249,115,22,0.06)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.6) 50%, transparent 92%)",
    header: { background: "linear-gradient(145deg, #1e1208 0%, #150d04 50%, #1a0f04 100%)" },
    glowTR: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
    glowBL: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
    closeBtn: { background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)", color: "#8a6540" },
    closeBtnHover: "rgba(249,115,22,0.25)",
    closeBtnLeave: "rgba(249,115,22,0.12)",
    iconWrap: {
      background: "linear-gradient(135deg, #c2410c, #f97316)",
      boxShadow: "0 8px 32px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
    },
    spinnerBorder: "rgba(251,191,36,0.35)",
    badge: { background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" },
    badgeIcon: { color: "#fbbf24" },
    badgeText: { color: "#fb923c" },
    heading: { color: "#f0e8de" },
    subtext: { color: "#c4a882" },
    perkCardBase: "rgba(255,255,255,0.025)",
    perkText: { color: "#f0e8de" },
    primaryBtn: {
      background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
      boxShadow: "0 4px 24px rgba(194,65,12,0.5)",
    },
    sparkleColor: { color: "#fbbf24", fill: "#fbbf24" },
    dismissColor: { color: "#8a6540" },
    dismissHover: "#c4a882",
    dismissLeave: "#8a6540",
  } : {
    backdrop: "bg-black/40",
    modal: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      border: "1px solid rgba(29,78,216,0.18)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(29,78,216,0.06)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.35) 50%, transparent 92%)",
    header: { background: "linear-gradient(145deg, #eff6ff 0%, #f8f9fc 50%, #f1f5ff 100%)" },
    glowTR: "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)",
    glowBL: "radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)",
    closeBtn: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.18)", color: "#64748b" },
    closeBtnHover: "rgba(29,78,216,0.15)",
    closeBtnLeave: "rgba(29,78,216,0.08)",
    iconWrap: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 8px 32px rgba(29,78,216,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
    },
    spinnerBorder: "rgba(29,78,216,0.3)",
    badge: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.22)" },
    badgeIcon: { color: "#1d4ed8" },
    badgeText: { color: "#1d4ed8" },
    heading: { color: "#1e293b" },
    subtext: { color: "#475569" },
    perkCardBase: "rgba(29,78,216,0.03)",
    perkText: { color: "#1e293b" },
    primaryBtn: {
      background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
      boxShadow: "0 4px 24px rgba(29,78,216,0.35)",
    },
    sparkleColor: { color: "#ffffff", fill: "#ffffff" },
    dismissColor: { color: "#64748b" },
    dismissHover: "#1e293b",
    dismissLeave: "#64748b",
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

          {/* Centered modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="w-full max-w-md rounded-[36px] overflow-hidden pointer-events-auto relative transition-all duration-300"
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
                  className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: s.glowTR }}
                />
                <div
                  className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full pointer-events-none"
                  style={{ background: s.glowBL }}
                />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                  style={s.closeBtn}
                  onMouseEnter={(e) => (e.currentTarget.style.background = s.closeBtnHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = s.closeBtnLeave)}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="relative flex justify-center mb-5">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300"
                    style={s.iconWrap}
                  >
                    <Crown className="w-10 h-10 text-white fill-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="w-20 h-20 rounded-3xl border-2 border-dashed"
                      style={{ borderColor: s.spinnerBorder }}
                    />
                  </motion.div>
                </div>

                <div className="relative text-center">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 transition-all duration-300"
                    style={s.badge}
                  >
                    <Lock className="w-3 h-3" style={s.badgeIcon} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={s.badgeText}>
                      Free Swipes Used
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mb-2 leading-tight transition-colors duration-300" style={s.heading}>
                    You've used your<br />3 free swipes
                  </h2>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto transition-colors duration-300" style={s.subtext}>
                    Upgrade to Premium for unlimited swipes and discover your perfect match.
                  </p>
                </div>
              </div>

              {/* Perks */}
              <div className="px-8 pt-6 pb-2">
                <div className="grid grid-cols-2 gap-3">
                  {PERKS.map(({ icon: Icon, text, accent, border, iconColor }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2.5 rounded-2xl p-3 transition-all duration-200"
                      style={{ background: s.perkCardBase, border: `1px solid ${border}` }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = accent)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = s.perkCardBase)}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{ background: accent, border: `1px solid ${border}` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                      </div>
                      <span className="text-xs font-semibold leading-snug transition-colors duration-300" style={s.perkText}>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-8 py-6 space-y-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate("/premium"); }}
                  className="w-full py-4 rounded-2xl font-black text-base text-white transition-opacity hover:opacity-95 flex items-center justify-center gap-2"
                  style={s.primaryBtn}
                >
                  <Sparkles className="w-5 h-5" style={s.sparkleColor} />
                  Unlock Premium
                </motion.button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-semibold transition-colors"
                  style={s.dismissColor}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = s.dismissHover)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = s.dismissLeave)}
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SwipePaywallModal;