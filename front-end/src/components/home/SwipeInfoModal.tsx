// src/components/home/SwipeInfoModal.tsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, Zap, Eye, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SwipeInfoModalProps {
  open: boolean;
  onClose: () => void;
  mode: "welcome" | "last-swipe";
}

const SwipeInfoModal: React.FC<SwipeInfoModalProps> = ({ open, onClose, mode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isWelcome = mode === "welcome";

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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-0 z-50 m-auto max-w-md h-fit rounded-[36px] bg-white shadow-2xl overflow-hidden mx-4 sm:mx-auto"
          >
            {/* Header */}
            <div className={`relative px-8 pt-10 pb-8 overflow-hidden ${
              isWelcome
                ? "bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600"
                : "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500"
            }`}>
              {/* Decorative blobs */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Floating hearts decoration */}
              {isWelcome && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${15 + i * 18}%`,
                        top: `${10 + (i % 3) * 20}%`,
                      }}
                      animate={{ y: [-4, 4, -4], opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    >
                      <Heart className="w-3 h-3 text-white/40 fill-white/40" />
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
                  className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/30"
                >
                  {isWelcome
                    ? <Heart className="w-10 h-10 text-white fill-white" />
                    : <Zap className="w-10 h-10 text-white fill-white" />
                  }
                </motion.div>
              </div>

              <div className="relative text-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full mb-3 border border-white/20">
                    {isWelcome
                      ? <Sparkles className="w-3 h-3 text-yellow-300" />
                      : <Crown className="w-3 h-3 text-yellow-300" />
                    }
                    <span className="text-white/90 text-[10px] font-bold uppercase tracking-widest">
                      {isWelcome ? "Welcome" : "Heads up!"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                    {isWelcome
                      ? "You have 3 free\n"
                      : "Last free swipe\nremaining ⚡"
                    }
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto">
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
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
                        className={`w-3 h-3 rounded-full ${
                          isWelcome
                            ? "bg-teal-500"
                            : i < 2 ? "bg-slate-300" : "bg-orange-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700 ml-1">
                    {isWelcome ? "3 free swipes" : "1 swipe left"}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {isWelcome ? "Free limit" : "then Premium"}
                </span>
              </div>

              {/* Perks row */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { icon: Zap, label: "Unlimited", sub: "with Premium" },
                  { icon: Eye, label: "See likes", sub: "who liked you" },
                  { icon: Crown, label: "Priority", sub: "in results" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">{label}</span>
                    <span className="text-[9px] text-slate-400 text-center leading-tight">{sub}</span>
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
                  className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                  Upgrade to Premium
                </motion.button>
              )}
              <button
                onClick={onClose}
                className={`w-full py-3.5 rounded-2xl font-black text-sm transition-colors flex items-center justify-center gap-2 ${
                  isWelcome
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 hover:opacity-95"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
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