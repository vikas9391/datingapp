// src/components/home/LockedDeckOverlay.tsx
import React from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LockedDeckOverlayProps {
  onUnlockClick: () => void;
}

const LockedDeckOverlay: React.FC<LockedDeckOverlayProps> = ({ onUnlockClick }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-20 rounded-[32px] md:rounded-[40px] overflow-hidden">
      {/* Blurred background peek */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-[32px] md:rounded-[40px]" />

      {/* Frosted content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-8 text-center"
      >
        {/* Lock icon with pulse ring */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-slate-900/8"
          />
          <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/30 relative">
            <Lock className="w-9 h-9 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Text */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 rounded-full mb-3">
            <Crown className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span className="text-amber-700 text-[10px] font-black uppercase tracking-widest">Premium Required</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">
            3 free swipes used
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-[240px] mx-auto">
            You've reached the free limit. Upgrade for unlimited swipes and discover everyone nearby.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/premium")}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-slate-900 text-white flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            Upgrade to Premium
          </motion.button>
          <button
            onClick={onUnlockClick}
            className="w-full py-3 rounded-2xl font-semibold text-xs text-slate-500 bg-white/80 border border-slate-200 hover:bg-white transition-colors"
          >
            See what's included →
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LockedDeckOverlay;