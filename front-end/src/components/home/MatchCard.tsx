import { motion } from "framer-motion";
import { Heart, X, MapPin } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface Match {
  id: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  photos: string[];
  interests: string[];
}

interface MatchCardProps {
  match: Match;
  onLike: () => void;
  onPass: () => void;
  exitDirection: "left" | "right" | null;
}

export default function MatchCard({ match, onLike, onPass, exitDirection }: MatchCardProps) {
  const { isDark } = useTheme();

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    card: {
      background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
      borderColor: "rgba(249,115,22,0.22)",
      boxShadow: "0 20px 56px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.45) 50%, transparent 90%)",
    photoOverlay: "linear-gradient(to top, rgba(13,10,4,0.95) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)",
    photoEmberGlow: "linear-gradient(to top, rgba(249,115,22,0.08) 0%, transparent 100%)",
    name: { color: "#f0e8de" },
    age: { color: "#c4a882" },
    distanceIcon: { color: "#f97316" },
    distanceText: { color: "#d4935a" },
    bio: { color: "#c4a882" },
    tag: {
      background: "rgba(249,115,22,0.18)",
      border: "1px solid rgba(249,115,22,0.3)",
      color: "#fb923c",
    },
    actionBar: { borderTop: "1px solid rgba(249,115,22,0.1)" },
    passBtn: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(249,115,22,0.18)",
      color: "#8a6540",
    },
    passBtnHover: {
      background: "rgba(239,68,68,0.1)",
      borderColor: "rgba(239,68,68,0.4)",
      color: "#f87171",
    },
    passBtnLeave: {
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(249,115,22,0.18)",
      color: "#8a6540",
    },
    likeBtn: {
      background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
      animation: "likeGlow 2.8s ease-in-out infinite",
    },
    likeGlowKeyframes: `
      @keyframes likeGlow {
        0%,100% { box-shadow: 0 8px 28px rgba(194,65,12,0.45); }
        50%     { box-shadow: 0 8px 36px rgba(249,115,22,0.65); }
      }
    `,
  } : {
    card: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.18)",
      boxShadow: "0 20px 56px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.4) 50%, transparent 90%)",
    photoOverlay: "linear-gradient(to top, rgba(10,20,40,0.9) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.02) 100%)",
    photoEmberGlow: "linear-gradient(to top, rgba(29,78,216,0.06) 0%, transparent 100%)",
    name: { color: "#f0e8de" },    // keep white-ish for readability on photo
    age: { color: "#cbd5e1" },
    distanceIcon: { color: "#60a5fa" },
    distanceText: { color: "#93c5fd" },
    bio: { color: "#cbd5e1" },
    tag: {
      background: "rgba(29,78,216,0.2)",
      border: "1px solid rgba(29,78,216,0.35)",
      color: "#93c5fd",
    },
    actionBar: { borderTop: "1px solid rgba(29,78,216,0.1)" },
    passBtn: {
      background: "rgba(29,78,216,0.04)",
      border: "1px solid rgba(29,78,216,0.15)",
      color: "#94a3b8",
    },
    passBtnHover: {
      background: "rgba(239,68,68,0.08)",
      borderColor: "rgba(239,68,68,0.35)",
      color: "#f87171",
    },
    passBtnLeave: {
      background: "rgba(29,78,216,0.04)",
      borderColor: "rgba(29,78,216,0.15)",
      color: "#94a3b8",
    },
    likeBtn: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      animation: "likeGlowLight 2.8s ease-in-out infinite",
    },
    likeGlowKeyframes: `
      @keyframes likeGlowLight {
        0%,100% { box-shadow: 0 8px 28px rgba(29,78,216,0.4); }
        50%     { box-shadow: 0 8px 36px rgba(29,78,216,0.5); }
      }
    `,
  };

  return (
    <>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        ${s.likeGlowKeyframes}
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{
          opacity:  exitDirection ? 0 : 1,
          scale:    exitDirection ? 0.88 : 1,
          x:        exitDirection === "left" ? -320 : exitDirection === "right" ? 320 : 0,
          rotate:   exitDirection === "left" ? -16   : exitDirection === "right" ? 16   : 0,
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="relative overflow-hidden border transition-all duration-300"
        style={{ width: 288, borderRadius: 24, ...s.card }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px z-10 pointer-events-none"
          style={{ background: s.topAccent }}
        />

        {/* ── Photo area ── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
          <img
            src={match.photos[0]}
            alt={match.name}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.92) saturate(1.05)" }}
          />

          {/* Photo gradient overlay */}
          <div className="absolute inset-0" style={{ background: s.photoOverlay }} />

          {/* Ambient glow at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: s.photoEmberGlow }}
          />

          {/* Profile info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Name + age */}
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-xl font-black" style={s.name}>
                {match.name}
              </h3>
              <span className="text-lg font-semibold" style={s.age}>
                {match.age}
              </span>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" style={s.distanceIcon} />
              <span className="text-xs font-medium" style={s.distanceText}>
                {match.distance}
              </span>
            </div>

            {/* Bio */}
            <p className="text-xs leading-relaxed line-clamp-2 mb-2.5" style={s.bio}>
              {match.bio}
            </p>

            {/* Interest tags */}
            <div className="flex flex-wrap gap-1.5">
              {match.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm transition-all duration-300"
                  style={s.tag}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div
          className="flex items-center justify-center gap-5 px-4 py-3.5 transition-all duration-300"
          style={s.actionBar}
        >
          {/* Pass button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={onPass}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
            style={s.passBtn}
            onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, s.passBtnHover); }}
            onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, s.passBtnLeave); }}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          {/* Like button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={onLike}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300"
            style={s.likeBtn}
          >
            <Heart className="w-6 h-6 fill-current" strokeWidth={0} />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}