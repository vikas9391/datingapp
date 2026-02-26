import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { X, Heart, RotateCcw } from "lucide-react";
import AnonymousProfileCard from "./AnonymousProfileCard";

/* ---------------- TYPES ---------------- */

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

/* ---------------- CONSTANTS ---------------- */

const SWIPE_THRESHOLD = 120;
const SWIPE_DURATION = 0.35;

/* ---------------- HEART BURST PARTICLE ---------------- */

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

const HEART_COLORS = [
  "#f43f5e", // rose-500
  "#fb7185", // rose-400
  "#14b8a6", // teal-500
  "#2dd4bf", // teal-400
  "#f9a8d4", // pink-300
  "#fda4af", // rose-300
  "#99f6e4", // teal-200
  "#ff6b9d", // hot pink
];

const generateHeartParticles = (count = 18): HeartParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 20, // % from left, centered
    y: 50 + (Math.random() - 0.5) * 20, // % from top, centered
    angle: (360 / count) * i + Math.random() * 20 - 10,
    distance: 80 + Math.random() * 120,
    size: 10 + Math.random() * 18,
    color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    duration: 0.6 + Math.random() * 0.5,
    delay: Math.random() * 0.15,
  }));

/* ---------------- HEART BURST OVERLAY ---------------- */

const HeartBurstOverlay = ({ visible }: { visible: boolean }) => {
  const [particles] = useState(() => generateHeartParticles(20));

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-[2.5rem] md:rounded-[40px]">
          {/* Green overlay flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 bg-teal-400 rounded-[2.5rem] md:rounded-[40px]"
          />

          {/* Big center heart */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.4, 1.1], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Heart
              className="fill-current drop-shadow-2xl"
              style={{ width: 90, height: 90, color: "#f43f5e" }}
              strokeWidth={0}
            />
          </motion.div>

          {/* Particle hearts */}
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
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
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

          {/* "It's a Like!" text pop */}
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
                background: "linear-gradient(135deg, #14b8a6, #f43f5e)",
                textShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}
            >
              💚 Liked!
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ================= COMPONENT ================= */

const AnonymousSwipeDeck = ({
  profiles,
  onLike,
  onDislike,
}: AnonymousSwipeDeckProps) => {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const x = useMotionValue(0);

  // --- ANIMATION LOGIC ---
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-400, -200, 0, 200, 400], [0, 1, 1, 1, 0]);

  // Right-swipe indicator
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  // Left-swipe indicator
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  // Background Card Animations
  const bgScale = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);
  const bgOpacity = useTransform(x, [-200, 0, 200], [1, 0.5, 1]);
  const bgOverlayOpacity = useTransform(x, [-200, 0, 200], [0, 0.4, 0]);

  const activeProfile = profiles[index];
  const nextProfile = profiles[index + 1];

  /* ---- RESET INDEX WHEN PROFILES CHANGE ---- */
  useEffect(() => {
    setIndex(0);
    x.set(0);
  }, [profiles]);

  /* ---- TRIGGER HEART BURST ---- */
  const triggerHeartBurst = useCallback(() => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  }, []);

  /* ---- SWIPE COMPLETE ---- */
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

  /* ---- TRIGGER SWIPE ---- */
  const triggerSwipe = async (direction: "left" | "right") => {
    if (!activeProfile || isDragging) return;

    setIsDragging(true);

    if (direction === "right") triggerHeartBurst();

    const destinationX = direction === "right" ? 800 : -800;

    await animate(x, destinationX, {
      duration: SWIPE_DURATION,
      ease: "easeInOut",
    }).finished;

    completeSwipe(direction);
    setIsDragging(false);
  };

  /* -------- EMPTY STATE -------- */
  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 w-full">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <RotateCcw className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">You've caught up!</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-6 text-base">
          Check back later for more vibes.
        </p>
        <button
          onClick={() => {
            setIndex(0);
            x.set(0);
          }}
          className="px-6 py-3 bg-teal-500 text-white rounded-full font-bold text-sm shadow-xl shadow-teal-200 hover:bg-teal-600 hover:scale-105 transition-all"
        >
          Start Over
        </button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="relative w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2 md:px-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Discover</h2>
          <p className="text-[10px] md:text-xs font-medium text-gray-400 mt-0.5">
            Connect based on vibes
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
          <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-teal-500" />
          </span>
          <span className="text-[10px] md:text-xs font-bold text-gray-700">6 online</span>
        </div>
      </div>

      {/* CARD CONTAINER */}
      <div className="relative h-[500px] md:h-[400px] w-full perspective-1000">

        {/* Background Card */}
        {nextProfile && (
          <motion.div
            key={nextProfile.id}
            style={{ scale: bgScale, opacity: bgOpacity }}
            className="absolute inset-0 z-0"
          >
            <AnonymousProfileCard profile={nextProfile} />
            <motion.div
              style={{ opacity: bgOverlayOpacity }}
              className="absolute inset-0 bg-white/50 rounded-[2.5rem] md:rounded-[40px] pointer-events-none"
            />
          </motion.div>
        )}

        {/* Active Card */}
        <motion.div
          key={activeProfile.id}
          drag="x"
          style={{ x, rotate, opacity }}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            if (info.offset.x > SWIPE_THRESHOLD) {
              triggerSwipe("right");
            } else if (info.offset.x < -SWIPE_THRESHOLD) {
              triggerSwipe("left");
            } else {
              animate(x, 0, { duration: 0.25 });
            }
          }}
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
        >
          {/* LIKE stamp overlay — appears when dragging right */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 left-6 z-20 pointer-events-none"
          >
            <div className="px-4 py-2 rounded-xl border-4 border-teal-500 rotate-[-15deg] backdrop-blur-sm bg-teal-500/10">
              <span className="text-teal-500 font-black text-2xl tracking-widest uppercase">
                Like ❤️
              </span>
            </div>
          </motion.div>

          {/* NOPE stamp overlay — appears when dragging left */}
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-6 right-6 z-20 pointer-events-none"
          >
            <div className="px-4 py-2 rounded-xl border-4 border-rose-500 rotate-[15deg] backdrop-blur-sm bg-rose-500/10">
              <span className="text-rose-500 font-black text-2xl tracking-widest uppercase">
                Nope 👋
              </span>
            </div>
          </motion.div>

          <AnonymousProfileCard profile={activeProfile} />

          {/* Heart Burst — rendered inside active card for correct positioning */}
          <HeartBurstOverlay visible={showHeartBurst} />
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-6 md:gap-8">
        <button
          onClick={() => triggerSwipe("left")}
          disabled={isDragging}
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 hover:scale-110 shadow-lg transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
        </button>

        <button
          onClick={() => triggerSwipe("right")}
          disabled={isDragging}
          className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-2xl shadow-teal-200 hover:scale-110 transition-all disabled:opacity-50"
        >
          <Heart className="w-6 h-6 md:w-7 md:h-7 fill-current" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default AnonymousSwipeDeck;