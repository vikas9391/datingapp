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
  { icon: Zap,   text: "Unlimited swipes every day" },
  { icon: Eye,   text: "See everyone who liked you" },
  { icon: Heart, text: "10× more profile visibility" },
  { icon: Crown, text: "Priority in match results" },
];

const SwipePaywallModal: React.FC<SwipePaywallModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  // Lock body scroll while open
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* ── Centered modal container ── */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="w-full max-w-md rounded-[36px] bg-white shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Gradient header */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 pt-10 pb-8 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="relative flex justify-center mb-5">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
                    <Crown className="w-10 h-10 text-white fill-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-amber-400/30" />
                  </motion.div>
                </div>

                <div className="relative text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full mb-3">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Free Swipes Used</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                    You've used your<br />3 free swipes
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    Upgrade to Premium for unlimited swipes and discover your perfect match.
                  </p>
                </div>
              </div>

              {/* Perks */}
              <div className="px-8 pt-6 pb-2">
                <div className="grid grid-cols-2 gap-3">
                  {PERKS.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 bg-slate-50 rounded-2xl p-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 leading-snug">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-8 py-6 space-y-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate("/premium"); }}
                  className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  Unlock Premium
                </motion.button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-400 text-sm font-semibold hover:text-slate-600 transition-colors"
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