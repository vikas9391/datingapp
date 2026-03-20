import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { X, Heart, RotateCcw, Flame } from "lucide-react";
import AnonymousProfileCard from "./AnonymousProfileCard";

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

/* Orange/amber particle colors to match the theme */
const BURST_COLORS = [
  "#f97316", // orange-500
  "#fb923c", // orange-400
  "#fbbf24", // amber-400
  "#f59e0b", // amber-500
  "#fdba74", // orange-300
  "#fcd34d", // amber-300
  "#ea580c", // orange-600
  "#d97706", // amber-600
];

const generateParticles = (count = 20): HeartParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20,
    y: 50 + (Math.random() - 0.5) * 20,
    angle: (360 / count) * i + Math.random() * 20 - 10,
    distance: 80 + Math.random() * 130,
    size: 10 + Math.random() * 18,
    color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
    duration: 0.55 + Math.random() * 0.5,
    delay: Math.random() * 0.14,
  }));

/* ─── HEART BURST OVERLAY ─── */
const HeartBurstOverlay = ({ visible }: { visible: boolean }) => {
  const [particles] = useState(() => generateParticles(22));

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[2.5rem] md:rounded-[40px]">

          {/* Orange flash overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.28, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-[2.5rem] md:rounded-[40px]"
            style={{ background: "rgba(249,115,22,0.35)" }}
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
              style={{ width: 90, height: 90, color: "#f97316", filter: "drop-shadow(0 0 20px rgba(249,115,22,0.8))" }}
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
                background: "linear-gradient(135deg, #ea580c, #f97316, #fbbf24)",
                textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                boxShadow: "0 8px 28px rgba(234,88,12,0.5)",
              }}
            >
              🔥 Liked!
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── MAIN COMPONENT ─── */
const AnonymousSwipeDeck = ({ profiles, onLike, onDislike }: AnonymousSwipeDeckProps) => {
  const [index, setIndex]               = useState(0);
  const [isDragging, setIsDragging]     = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const x = useMotionValue(0);

  const rotate         = useTransform(x, [-200, 200], [-8, 8]);
  const opacity        = useTransform(x, [-400, -200, 0, 200, 400], [0, 1, 1, 1, 0]);
  const likeOpacity    = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity    = useTransform(x, [-20, -100], [0, 1]);
  const bgScale        = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);
  const bgOpacity      = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);
  const bgOverlayOpacity = useTransform(x, [-200, 0, 200], [0, 0.4, 0]);

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

  /* ─── EMPTY STATE ─── */
  if (!activeProfile) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[400px] text-center p-8 rounded-[40px] w-full border"
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #110c05)",
          borderColor: "rgba(249,115,22,0.18)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <RotateCcw className="w-8 h-8" style={{ color: "#f97316" }} />
        </div>
        <h3 className="text-xl font-black mb-2" style={{ color: "#f0e8de" }}>
          You've caught up!
        </h3>
        <p className="max-w-xs mx-auto mb-6 text-base" style={{ color: "#c4a882" }}>
          Check back later for more vibes.
        </p>
        <button
          onClick={() => { setIndex(0); x.set(0); }}
          className="px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #ea580c, #f97316)",
            boxShadow: "0 8px 24px rgba(234,88,12,0.4)",
          }}
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
            className="text-xl md:text-2xl font-black tracking-tight"
            style={{ color: "#f0e8de" }}
          >
            Discover
          </h2>
          <p className="text-[10px] md:text-xs font-medium mt-0.5" style={{ color: "#8a6540" }}>
            Connect based on vibes
          </p>
        </div>

        {/* Online badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
          style={{
            background: "#1c1c1c",
            borderColor: "rgba(249,115,22,0.3)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-orange-500" />
          </span>
          <span className="text-[10px] md:text-xs font-bold" style={{ color: "#e8a060" }}>
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
              style2={{ background: "rgba(13,13,13,0.5)" } as any}
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
                borderColor: "#f97316",
                background: "rgba(249,115,22,0.15)",
              }}
            >
              <span className="font-black text-2xl tracking-widest uppercase" style={{ color: "#f97316" }}>
                Like 🔥
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
                borderColor: "#ef4444",
                background: "rgba(239,68,68,0.12)",
              }}
            >
              <span className="font-black text-2xl tracking-widest uppercase" style={{ color: "#ef4444" }}>
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
          style={{
            background: "#1c1c1c",
            borderColor: "rgba(249,115,22,0.2)",
            color: "#8a6540",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(239,68,68,0.12)";
            el.style.borderColor = "rgba(239,68,68,0.5)";
            el.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "#1c1c1c";
            el.style.borderColor = "rgba(249,115,22,0.2)";
            el.style.color = "#8a6540";
          }}
        >
          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
        </button>

        {/* Like */}
        <button
          onClick={() => triggerSwipe("right")}
          disabled={isDragging}
          className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
            boxShadow: "0 8px 28px rgba(194,65,12,0.5), 0 0 0 1px rgba(249,115,22,0.2)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 12px 36px rgba(249,115,22,0.6), 0 0 0 1px rgba(249,115,22,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 8px 28px rgba(194,65,12,0.5), 0 0 0 1px rgba(249,115,22,0.2)";
          }}
        >
          <Heart className="w-6 h-6 md:w-7 md:h-7 fill-current" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default AnonymousSwipeDeck;