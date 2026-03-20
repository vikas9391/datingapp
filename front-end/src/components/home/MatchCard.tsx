import { motion } from "framer-motion";
import { Heart, X, MapPin, Flame } from "lucide-react";

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
  return (
    <>
      <style>{`
        @keyframes cardEntrance {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes likeGlow {
          0%,100% { box-shadow: 0 8px 28px rgba(194,65,12,0.45); }
          50%     { box-shadow: 0 8px 36px rgba(249,115,22,0.65); }
        }
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
        className="relative overflow-hidden border"
        style={{
          width: 288,
          borderRadius: 24,
          background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
          borderColor: "rgba(249,115,22,0.22)",
          boxShadow: "0 20px 56px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.45) 50%, transparent 90%)" }}
        />

        {/* ── Photo area ── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
          <img
            src={match.photos[0]}
            alt={match.name}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.92) saturate(1.05)" }}
          />

          {/* Photo gradient overlay — dark at bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(13,10,4,0.95) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.05) 100%)",
            }}
          />

          {/* Ambient ember glow at the bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(249,115,22,0.08) 0%, transparent 100%)" }}
          />

          {/* Profile info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Name + age */}
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-xl font-black" style={{ color: "#f0e8de" }}>
                {match.name}
              </h3>
              <span className="text-lg font-semibold" style={{ color: "#c4a882" }}>
                {match.age}
              </span>
            </div>

            {/* Distance */}
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" style={{ color: "#f97316" }} />
              <span className="text-xs font-medium" style={{ color: "#d4935a" }}>
                {match.distance}
              </span>
            </div>

            {/* Bio */}
            <p className="text-xs leading-relaxed line-clamp-2 mb-2.5" style={{ color: "#c4a882" }}>
              {match.bio}
            </p>

            {/* Interest tags */}
            <div className="flex flex-wrap gap-1.5">
              {match.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm"
                  style={{
                    background: "rgba(249,115,22,0.18)",
                    border: "1px solid rgba(249,115,22,0.3)",
                    color: "#fb923c",
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div
          className="flex items-center justify-center gap-5 px-4 py-3.5"
          style={{ borderTop: "1px solid rgba(249,115,22,0.1)" }}
        >
          {/* Pass button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={onPass}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(249,115,22,0.18)",
              color: "#8a6540",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(239,68,68,0.1)";
              el.style.borderColor = "rgba(239,68,68,0.4)";
              el.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "rgba(255,255,255,0.04)";
              el.style.borderColor = "rgba(249,115,22,0.18)";
              el.style.color = "#8a6540";
            }}
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          {/* Like button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={onLike}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
              animation: "likeGlow 2.8s ease-in-out infinite",
            }}
          >
            <Heart className="w-6 h-6 fill-current" strokeWidth={0} />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}