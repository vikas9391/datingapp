import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface MatchModalProps {
  profile: SwipeProfile;
  chatId: string;
  onComplete: () => void;
  pendingMatchId?: string | null;
}

const MatchModal = ({ profile, onComplete }: MatchModalProps) => {
  const { isDark } = useTheme();

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    overlay: "bg-black/70",
    modal: {
      background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
      border: "1px solid rgba(249,115,22,0.25)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.5) 50%, transparent 92%)",
    heartBg: { color: "#f97316", fill: "#f97316" },
    avatarWrap: {
      background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
      boxShadow: "0 8px 24px rgba(194,65,12,0.45)",
    },
    avatarInitial: { color: "white" },
    heading: { color: "#f0e8de" },
    matchEmoji: "🔥",
    matchText: { color: "#c4a882" },
    matchName: { color: "#f0e8de", fontWeight: "600" },
    descriptionBox: { background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", color: "#c4a882" },
    vibesSection: {
      background: "rgba(249,115,22,0.06)",
      border: "1px solid rgba(249,115,22,0.14)",
    },
    vibesLabel: { color: "#8a6540" },
    vibeTag: {
      background: "rgba(249,115,22,0.1)",
      border: "1px solid rgba(249,115,22,0.22)",
      color: "#fb923c",
    },
    chatBtn: {
      background: "linear-gradient(135deg, #c2410c 0%, #f97316 50%, #fb923c 100%)",
      boxShadow: "0 8px 28px rgba(194,65,12,0.5)",
      color: "white",
    },
    closeBtn: { color: "#8a6540", hoverBg: "rgba(249,115,22,0.1)", hoverColor: "#fb923c" },
  } : {
    overlay: "bg-black/50",
    modal: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      border: "1px solid rgba(29,78,216,0.15)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.35) 50%, transparent 92%)",
    heartBg: { color: "#1d4ed8", fill: "#1d4ed8" },
    avatarWrap: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 8px 24px rgba(29,78,216,0.35)",
    },
    avatarInitial: { color: "white" },
    heading: { color: "#1e293b" },
    matchEmoji: "💙",
    matchText: { color: "#475569" },
    matchName: { color: "#1e293b", fontWeight: "600" },
    descriptionBox: { background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.12)", color: "#475569" },
    vibesSection: {
      background: "rgba(29,78,216,0.04)",
      border: "1px solid rgba(29,78,216,0.1)",
    },
    vibesLabel: { color: "#64748b" },
    vibeTag: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.18)",
      color: "#1d4ed8",
    },
    chatBtn: {
      background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
      boxShadow: "0 8px 28px rgba(29,78,216,0.35)",
      color: "white",
    },
    closeBtn: { color: "#94a3b8", hoverBg: "rgba(29,78,216,0.08)", hoverColor: "#1d4ed8" },
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[100] flex items-center justify-center ${s.overlay} backdrop-blur-sm`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="rounded-3xl p-8 w-[360px] text-center shadow-2xl relative overflow-hidden max-h-[90vh] mx-4 transition-all duration-300"
          style={s.modal}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
            style={{ background: s.topAccent }}
          />

          {/* Animated Heart Background */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1.4, rotate: 10 }}
          >
            <Heart
              className="w-48 h-48 opacity-[0.07]"
              style={s.heartBg}
            />
          </motion.div>

          {/* Profile Preview */}
          <div className="relative z-10 mb-6">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300"
              style={s.avatarWrap}
            >
              <div className="font-bold text-xl" style={s.avatarInitial}>
                {profile.firstName.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2
              className="text-2xl md:text-3xl font-black mb-2 transition-colors duration-300"
              style={s.heading}
            >
              It's a Match! {s.matchEmoji}
            </h2>
            <p className="text-sm md:text-base mb-2 transition-colors duration-300" style={s.matchText}>
              You and{" "}
              <span style={s.matchName}>{profile.firstName}</span>{" "}
              have liked each other
            </p>
            {profile.selfDescription && (
              <p
                className="text-xs italic px-3 py-1.5 rounded-full mx-auto max-w-[280px] transition-all duration-300"
                style={s.descriptionBox}
              >
                "{profile.selfDescription}"
              </p>
            )}
          </div>

          {/* Vibe Tags */}
          {profile.vibeTags.length > 0 && (
            <div
              className="relative z-10 mb-8 p-4 rounded-2xl transition-all duration-300"
              style={s.vibesSection}
            >
              <p
                className="text-xs uppercase font-semibold tracking-wide mb-2 transition-colors duration-300"
                style={s.vibesLabel}
              >
                Vibes
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {profile.vibeTags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full transition-all duration-300"
                    style={s.vibeTag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Chat Button */}
          <button
            onClick={onComplete}
            className="relative z-10 w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={s.chatBtn}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.92";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            Start Chat
          </button>

          {/* Close Button */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 p-1.5 rounded-full transition-all duration-150"
            style={{ color: s.closeBtn.color }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = s.closeBtn.hoverBg;
              el.style.color      = s.closeBtn.hoverColor;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "transparent";
              el.style.color      = s.closeBtn.color;
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchModal;