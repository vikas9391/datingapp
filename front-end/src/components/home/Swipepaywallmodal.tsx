// src/components/home/SwipePaywallModal.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Heart, Zap, Eye, X, Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SwipePaywallModalProps {
  open: boolean;
  onClose: () => void;
  swipesUsed: number;
}

const PERKS = [
  { icon: Zap,   text: "Unlimited swipes every day",   accent: "rgba(251,191,36,0.16)",  border: "rgba(251,191,36,0.28)",  iconColor: "#fbbf24" },
  { icon: Eye,   text: "See everyone who liked you",   accent: "rgba(249,115,22,0.16)",  border: "rgba(249,115,22,0.28)",  iconColor: "#fb923c" },
  { icon: Heart, text: "10× more profile visibility",  accent: "rgba(234,88,12,0.16)",   border: "rgba(234,88,12,0.26)",   iconColor: "#f97316" },
  { icon: Crown, text: "Priority in match results",    accent: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.25)",  iconColor: "#fb923c" },
];

const SwipePaywallModal: React.FC<SwipePaywallModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />

          {/* Centered modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="w-full max-w-md rounded-[36px] overflow-hidden pointer-events-auto relative"
              style={{
                background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
                border: "1px solid rgba(249,115,22,0.28)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(249,115,22,0.06)",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.6) 50%, transparent 92%)",
                }}
              />

              {/* Header */}
              <div
                className="relative px-8 pt-10 pb-8 overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #1e1208 0%, #150d04 50%, #1a0f04 100%)",
                }}
              >
                {/* Ambient glows */}
                <div
                  className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
                  }}
                />
                <div
                  className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
                  }}
                />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.22)",
                    color: "#8a6540",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(249,115,22,0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(249,115,22,0.12)")}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="relative flex justify-center mb-5">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #c2410c, #f97316)",
                      boxShadow: "0 8px 32px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
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
                      style={{ borderColor: "rgba(251,191,36,0.35)" }}
                    />
                  </motion.div>
                </div>

                <div className="relative text-center">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                    style={{
                      background: "rgba(249,115,22,0.15)",
                      border: "1px solid rgba(249,115,22,0.3)",
                    }}
                  >
                    <Lock className="w-3 h-3" style={{ color: "#fbbf24" }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: "#fb923c" }}
                    >
                      Free Swipes Used
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mb-2 leading-tight" style={{ color: "#f0e8de" }}>
                    You've used your<br />3 free swipes
                  </h2>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#c4a882" }}>
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
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: `1px solid ${border}`,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = accent)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)")}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: accent, border: `1px solid ${border}` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                      </div>
                      <span className="text-xs font-semibold leading-snug" style={{ color: "#f0e8de" }}>
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
                  style={{
                    background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
                    boxShadow: "0 4px 24px rgba(194,65,12,0.5)",
                  }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                  Unlock Premium
                </motion.button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-semibold transition-colors"
                  style={{ color: "#8a6540" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#c4a882")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#8a6540")}
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