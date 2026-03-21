import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { X, Heart, RotateCcw, Flame } from "lucide-react";
import AnonymousProfileCard from "./AnonymousProfileCard";
import { useTheme } from "@/components/ThemeContext";

/* ─── TYPES ─── */
export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface AnonymousSwipeDeckProps {
  profiles: SwipeProfile[];
  onLike: (profileId: string) => void | Promise<void>;
  onDislike: (profileId: string) => void;
}

/* ─── CONSTANTS ─── */
const SWIPE_THRESHOLD = 120;
const SWIPE_DURATION  = 0.35;

/* ─── HEART BURST PARTICLES ─── */
interface HeartParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

/* Orange/amber particle colors (dark) & blue/teal (light) */
const BURST_COLORS_DARK = [
  "#f97316", "#fb923c", "#fbbf24", "#f59e0b",
  "#fdba74", "#fcd34d", "#ea580c", "#d97706",
];

const BURST_COLORS_LIGHT = [
  "#1d4ed8", "#60a5fa", "#3b82f6", "#2563eb",
  "#22d3ee", "#1d4ed8", "#1e40af", "#3b82f6",
];

const generateParticles = (count = 20, colors: string[]): HeartParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 50 + (Math.random() - 0.5) * 20,
    angle: (360 / count) * i + Math.random() * 20 - 10,
    distance: 80 + Math.random() * 130,
    size: 10 + Math.random() * 18,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 0.55 + Math.random() * 0.5,
    delay: Math.random() * 0.14,
  }));

/* ─── HEART BURST OVERLAY ─── */
const HeartBurstOverlay = ({ visible }: { visible: boolean }) => {
  const { isDark } = useTheme();
  const burstColors = isDark ? BURST_COLORS_DARK : BURST_COLORS_LIGHT;
  const [particles] = useState(() => generateParticles(22, burstColors));

  const flameColor   = isDark ? "#f97316" : "#1d4ed8";
  const flashBg      = isDark ? "rgba(249,115,22,0.35)" : "rgba(29,78,216,0.25)";
  const badgeBg      = isDark
    ? "linear-gradient(135deg, #ea580c, #f97316, #fbbf24)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";
  const badgeShadow  = isDark
    ? "0 8px 28px rgba(234,88,12,0.5)"
    : "0 8px 28px rgba(29,78,216,0.4)";
  const badgeLabel   = isDark ? "🔥 Liked!" : "💙 Liked!";

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[2.5rem] md:rounded-[40px]">

          {/* Flash overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.28, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-[2.5rem] md:rounded-[40px]"
            style={{ background: flashBg }}
          />

          {/* Big center flame/heart */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 1.1], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Flame
              style={{
                width: 90,
                height: 90,
                color: flameColor,
                filter: `drop-shadow(0 0 20px ${flameColor}CC)`,
              }}
              fill="currentColor"
            />
          </motion.div>

          {/* Scattered heart particles */}
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;
            return (
              <motion.div
                key={p.id}
                initial={{
                  x: "-50%",
                  y: "-50%",
                  opacity: 1,
                  scale: 0,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  position: "absolute",
                }}
                animate={{
                  x: `calc(-50% + ${tx}px)`,
                  y: `calc(-50% + ${ty}px)`,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 0.8, 0],
                  rotate: [0, Math.random() > 0.5 ? 360 : -360],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
                style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%` }}
              >
                <Heart
                  style={{ width: p.size, height: p.size, color: p.color }}
                  className="fill-current drop-shadow-md"
                  strokeWidth={0}
                />
              </motion.div>
            );
          })}

          {/* "Liked!" text pop */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: [20, -10, 0], opacity: [0, 1, 1, 0], scale: [0.8, 1.1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute bottom-12 left-0 right-0 flex justify-center"
          >
            <span
              className="px-6 py-2 rounded-full text-white font-black text-xl tracking-wide shadow-2xl"
              style={{
                background: badgeBg,
                textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                boxShadow: badgeShadow,
              }}
            >
              {badgeLabel}
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── MAIN COMPONENT ─── */
const AnonymousSwipeDeck = ({ profiles, onLike, onDislike }: AnonymousSwipeDeckProps) => {
  const { isDark } = useTheme();
  const [index, setIndex]                   = useState(0);
  const [isDragging, setIsDragging]         = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const x = useMotionValue(0);

  const rotate            = useTransform(x, [-200, 200], [-8, 8]);
  const opacity           = useTransform(x, [-400, -200, 0, 200, 400], [0, 1, 1, 1, 0]);
  const likeOpacity       = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity       = useTransform(x, [-20, -100], [0, 1]);
  const bgScale           = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);
  const bgOpacity         = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);
  const bgOverlayOpacity  = useTransform(x, [-200, 0, 200], [0, 0.4, 0]);

  const activeProfile = profiles[index];
  const nextProfile   = profiles[index + 1];

  useEffect(() => {
    setIndex(0);
    x.set(0);
  }, [profiles]);

  const triggerHeartBurst = useCallback(() => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  }, []);

  const completeSwipe = (direction: "left" | "right") => {
    if (!activeProfile) return;
    if (direction === "right") {
      triggerHeartBurst();
      onLike(activeProfile.id);
    } else {
      onDislike(activeProfile.id);
    }
    setIndex((prev) => prev + 1);
    x.set(0);
  };

  const triggerSwipe = async (direction: "left" | "right") => {
    if (!activeProfile || isDragging) return;
    setIsDragging(true);
    if (direction === "right") triggerHeartBurst();
    const destinationX = direction === "right" ? 800 : -800;
    await animate(x, destinationX, { duration: SWIPE_DURATION, ease: "easeInOut" }).finished;
    completeSwipe(direction);
    setIsDragging(false);
  };

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    emptyCard: {
      background: "linear-gradient(145deg, #1a1a1a, #110c05)",
      borderColor: "rgba(249,115,22,0.18)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
    },
    emptyIconWrap: {
      background: "rgba(249,115,22,0.1)",
      border: "1px solid rgba(249,115,22,0.25)",
    },
    emptyIcon: { color: "#f97316" },
    emptyTitle: { color: "#f0e8de" },
    emptyText: { color: "#c4a882" },
    restartBtn: {
      background: "linear-gradient(135deg, #ea580c, #f97316)",
      boxShadow: "0 8px 24px rgba(234,88,12,0.4)",
    },
    heading: { color: "#f0e8de" },
    subheading: { color: "#8a6540" },
    onlinePill: {
      background: "#1c1c1c",
      borderColor: "rgba(249,115,22,0.3)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    },
    onlineDot: "#f97316",
    onlinePing: "#fb923c",
    onlineText: { color: "#e8a060" },
    likeStamp: { borderColor: "#f97316", background: "rgba(249,115,22,0.15)", color: "#f97316" },
    nopeStamp: { borderColor: "#ef4444", background: "rgba(239,68,68,0.12)", color: "#ef4444" },
    dislikeBtn: {
      background: "#1c1c1c",
      borderColor: "rgba(249,115,22,0.2)",
      color: "#8a6540",
    },
    dislikeBtnHover: {
      background: "rgba(239,68,68,0.12)",
      borderColor: "rgba(239,68,68,0.5)",
      color: "#f87171",
    },
    likeBtn: {
      background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
      boxShadow: "0 8px 28px rgba(194,65,12,0.5), 0 0 0 1px rgba(249,115,22,0.2)",
    },
    likeBtnHoverShadow: "0 12px 36px rgba(249,115,22,0.6), 0 0 0 1px rgba(249,115,22,0.3)",
    likeBtnBaseShadow: "0 8px 28px rgba(194,65,12,0.5), 0 0 0 1px rgba(249,115,22,0.2)",
    bgOverlay: "rgba(13,13,13,0.5)",
  } : {
    emptyCard: {
      background: "linear-gradient(145deg, #ffffff, #f8f9fc)",
      borderColor: "rgba(29,78,216,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
    },
    emptyIconWrap: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.2)",
    },
    emptyIcon: { color: "#1d4ed8" },
    emptyTitle: { color: "#1e293b" },
    emptyText: { color: "#475569" },
    restartBtn: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 8px 24px rgba(29,78,216,0.35)",
    },
    heading: { color: "#1e293b" },
    subheading: { color: "#64748b" },
    onlinePill: {
      background: "#ffffff",
      borderColor: "rgba(29,78,216,0.25)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    onlineDot: "#1d4ed8",
    onlinePing: "#60a5fa",
    onlineText: { color: "#1d4ed8" },
    likeStamp: { borderColor: "#1d4ed8", background: "rgba(29,78,216,0.1)", color: "#1d4ed8" },
    nopeStamp: { borderColor: "#ef4444", background: "rgba(239,68,68,0.08)", color: "#ef4444" },
    dislikeBtn: {
      background: "#f8fafc",
      borderColor: "rgba(29,78,216,0.15)",
      color: "#94a3b8",
    },
    dislikeBtnHover: {
      background: "rgba(239,68,68,0.06)",
      borderColor: "rgba(239,68,68,0.4)",
      color: "#f87171",
    },
    likeBtn: {
      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      boxShadow: "0 8px 28px rgba(29,78,216,0.4), 0 0 0 1px rgba(29,78,216,0.15)",
    },
    likeBtnHoverShadow: "0 12px 36px rgba(29,78,216,0.55), 0 0 0 1px rgba(29,78,216,0.25)",
    likeBtnBaseShadow: "0 8px 28px rgba(29,78,216,0.4), 0 0 0 1px rgba(29,78,216,0.15)",
    bgOverlay: "rgba(255,255,255,0.3)",
  };

  /* ─── EMPTY STATE ─── */
  if (!activeProfile) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[400px] text-center p-8 rounded-[40px] w-full border transition-all duration-300"
        style={s.emptyCard}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ ...s.emptyIconWrap, animation: "pulse 2s ease-in-out infinite" }}
        >
          <RotateCcw className="w-8 h-8" style={s.emptyIcon} />
        </div>
        <h3 className="text-xl font-black mb-2 transition-colors duration-300" style={s.emptyTitle}>
          You've caught up!
        </h3>
        <p className="max-w-xs mx-auto mb-6 text-base transition-colors duration-300" style={s.emptyText}>
          Check back later for more vibes.
        </p>
        <button
          onClick={() => { setIndex(0); x.set(0); }}
          className="px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={s.restartBtn}
        >
          Start Over
        </button>
      </div>
    );
  }

  /* ─── MAIN UI ─── */
  return (
    <div className="relative w-full mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2 md:px-4">
        <div>
          <h2
            className="text-xl md:text-2xl font-black tracking-tight transition-colors duration-300"
            style={s.heading}
          >
            Discover
          </h2>
          <p className="text-[10px] md:text-xs font-medium mt-0.5 transition-colors duration-300" style={s.subheading}>
            Connect based on vibes
          </p>
        </div>

        {/* Online badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300"
          style={s.onlinePill}
        >
          <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: s.onlinePing }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5"
              style={{ background: s.onlineDot }}
            />
          </span>
          <span className="text-[10px] md:text-xs font-bold transition-colors duration-300" style={s.onlineText}>
            6 online
          </span>
        </div>
      </div>

      {/* CARD STACK */}
      <div className="relative h-[500px] md:h-[400px] w-full" style={{ perspective: 1000 }}>

        {/* Background card */}
        {nextProfile && (
          <motion.div key={nextProfile.id} style={{ scale: bgScale, opacity: bgOpacity }} className="absolute inset-0 z-0">
            <AnonymousProfileCard profile={nextProfile} />
            <motion.div
              style={{ opacity: bgOverlayOpacity }}
              className="absolute inset-0 rounded-[2.5rem] md:rounded-[40px] pointer-events-none"
              // @ts-ignore — intentional inline style override for the overlay color
              style2={{ background: s.bgOverlay } as any}
            />
          </motion.div>
        )}

        {/* Active card */}
        <motion.div
          key={activeProfile.id}
          drag="x"
          style={{ x, rotate, opacity }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            if (info.offset.x > SWIPE_THRESHOLD)       triggerSwipe("right");
            else if (info.offset.x < -SWIPE_THRESHOLD) triggerSwipe("left");
            else animate(x, 0, { duration: 0.25 });
          }}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        >

          {/* LIKE stamp */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 left-6 z-20 pointer-events-none"
          >
            <div
              className="px-4 py-2 rounded-xl border-4 backdrop-blur-sm -rotate-[15deg]"
              style={{
                borderColor: s.likeStamp.borderColor,
                background: s.likeStamp.background,
              }}
            >
              <span className="font-black text-2xl tracking-widest uppercase" style={{ color: s.likeStamp.color }}>
                Like {isDark ? "🔥" : "💙"}
              </span>
            </div>
          </motion.div>

          {/* NOPE stamp */}
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-6 right-6 z-20 pointer-events-none"
          >
            <div
              className="px-4 py-2 rounded-xl border-4 backdrop-blur-sm rotate-[15deg]"
              style={{
                borderColor: s.nopeStamp.borderColor,
                background: s.nopeStamp.background,
              }}
            >
              <span className="font-black text-2xl tracking-widest uppercase" style={{ color: s.nopeStamp.color }}>
                Nope 👋
              </span>
            </div>
          </motion.div>

          <AnonymousProfileCard profile={activeProfile} />
          <HeartBurstOverlay visible={showHeartBurst} />
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-6 md:gap-8">

        {/* Dislike */}
        <button
          onClick={() => triggerSwipe("left")}
          disabled={isDragging}
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full border transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          style={s.dislikeBtn}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background  = s.dislikeBtnHover.background;
            el.style.borderColor = s.dislikeBtnHover.borderColor;
            el.style.color       = s.dislikeBtnHover.color;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background  = s.dislikeBtn.background;
            el.style.borderColor = s.dislikeBtn.borderColor;
            el.style.color       = s.dislikeBtn.color;
          }}
        >
          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
        </button>

        {/* Like */}
        <button
          onClick={() => triggerSwipe("right")}
          disabled={isDragging}
          className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          style={s.likeBtn}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = s.likeBtnHoverShadow;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = s.likeBtnBaseShadow;
          }}
        >
          <Heart className="w-6 h-6 md:w-7 md:h-7 fill-current" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default AnonymousSwipeDeck;