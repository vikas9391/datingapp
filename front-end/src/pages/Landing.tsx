import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import {
  Heart,
  ArrowRight,
  Shield,
  Lock,
  Unlock,
  ChevronDown,
  Sparkles,
  MessageCircle,
  MapPin,
  Star,
  Eye,
  Zap,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

/* ─── ANIMATION VARIANTS (no custom CSS keyframes) ──────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── SCROLL-TRIGGERED REVEAL ────────────────────────────────────────────── */
function Reveal({
  children,
  className = "",
  variant = fadeUp,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: typeof fadeUp;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      variants={variant}
    >
      {children}
    </motion.div>
  );
}

/* ─── CYCLING WORD ───────────────────────────────────────────────────────── */
const WORDS = ["personality", "humour", "values", "depth", "soul"];

function WordCycle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block" style={{ perspective: 600 }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24, rotateX: -35 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -18, rotateX: 28 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-gradient-to-r from-[#02b2f6] to-[#09cf8b] bg-clip-text text-transparent italic"
          style={{ transformOrigin: "bottom center" }}
        >
          {WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── FLOATING TAGS ──────────────────────────────────────────────────────── */
const TAGS = [
  { text: "Jazz & rain", x: "6%", y: "18%", delay: 0 },
  { text: "Book collector", x: "74%", y: "14%", delay: 1.4 },
  { text: "Long walks", x: "82%", y: "58%", delay: 0.7 },
  { text: "Early riser", x: "4%", y: "64%", delay: 2.0 },
  { text: "Deep talks", x: "40%", y: "8%", delay: 3.0 },
  { text: "Sunrise hikes", x: "66%", y: "42%", delay: 1.8 },
  { text: "Terrible cook", x: "54%", y: "80%", delay: 0.9 },
];

function AmbientTags() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {TAGS.map((tag, i) => (
        <motion.div
          key={i}
          className={`absolute ${i >= 4 ? "hidden sm:block" : ""}`}
          style={{ left: tag.x, top: tag.y }}
          initial={{ opacity: 0, y: 12, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.8 + tag.delay * 0.15,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4 + i * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: tag.delay * 0.3,
            }}
            className="bg-white/80 backdrop-blur-md border border-[#02b2f6]/20 text-[#02b2f6] text-[11px] font-semibold px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap"
          >
            {tag.text}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── MATCH DEMO ─────────────────────────────────────────────────────────── */
const DEMO_PROFILES = [
  {
    id: "A",
    tags: ["Jazz & rain", "Early riser", "Long walks"],
    bio: "The best conversations happen over bad coffee and good intentions.",
  },
  {
    id: "B",
    tags: ["Book collector", "Cinema lover", "Deep talks"],
    bio: "Looking for someone who finds silence comfortable and eye contact easy.",
  },
];

function MatchDemo() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(liked);
    next.has(id) ? next.delete(id) : next.add(id);
    setLiked(next);
    if (next.size === 2) setTimeout(() => setMatched(true), 450);
  };

  const reset = () => {
    setLiked(new Set());
    setMatched(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {!matched ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {DEMO_PROFILES.map((p, idx) => {
              const on = liked.has(p.id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`mb-3 p-5 rounded-2xl border transition-all duration-300 ${
                    on
                      ? "bg-[#02b2f6]/5 border-[#02b2f6]/40 shadow-lg shadow-[#02b2f6]/10"
                      : "bg-white border-[#02b2f6]/10 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
                            on
                              ? "bg-[#02b2f6]/10 text-[#02b2f6] border border-[#02b2f6]/25"
                              : "bg-[#02b2f6]/5 text-[#64b6c8] border border-[#02b2f6]/10"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      onClick={() => toggle(p.id)}
                      whileTap={{ scale: 0.65 }}
                      whileHover={{ scale: 1.12 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                      className={`w-9 h-9 rounded-full flex-shrink-0 ml-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        on
                          ? "shadow-lg shadow-[#02b2f6]/30"
                          : "bg-[#f3fbff] border border-[#02b2f6]/15"
                      }`}
                      style={
                        on
                          ? { background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }
                          : {}
                      }
                    >
                      <Heart
                        size={13}
                        color={on ? "#fff" : "#02b2f6"}
                        fill={on ? "#fff" : "none"}
                      />
                    </motion.button>
                  </div>
                  <p className="text-[13px] leading-relaxed text-gray-400 italic">
                    "{p.bio}"
                  </p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <Lock size={9} className="text-gray-300" />
                    <span className="text-[9px] text-gray-300 uppercase font-semibold tracking-widest">
                      Identity hidden
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-[11px] text-gray-400 mt-1"
            >
              ♡ like both to see the magic
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="match"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-8 text-center border border-[#02b2f6]/20 shadow-xl shadow-[#02b2f6]/10"
            style={{
              background:
                "linear-gradient(135deg,rgba(2,178,246,0.06),#fff 50%,rgba(9,207,139,0.08))",
            }}
          >
            {/* Pulse icon */}
            <div className="relative w-14 h-14 mx-auto mb-5">
              {[0, 1].map((k) => (
                <motion.div
                  key={k}
                  className="absolute inset-0 rounded-full border border-[#02b2f6]/40"
                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                  transition={{
                    duration: 1.8,
                    delay: k * 0.7,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
              >
                <Heart size={20} color="#fff" fill="#fff" />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-black text-gray-900 mb-1.5 tracking-tight"
            >
              It's mutual. ✨
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}
              className="text-sm text-gray-500 mb-6 leading-relaxed"
            >
              Both liked each other. Identities revealed.
            </motion.p>

            <div className="flex flex-col gap-2 mb-5">
              {[
                { n: "Arjun, 27 · Mumbai", t: "Jazz & rain · Long walks" },
                { n: "Maya, 25 · Pune", t: "Book collector · Cinema" },
              ].map((p, k) => (
                <motion.div
                  key={p.n}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + k * 0.1 }}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left bg-[#02b2f6]/6 border border-[#02b2f6]/15"
                >
                  <Unlock size={11} color="#02b2f6" className="flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{p.n}</p>
                    <p className="text-[11px] text-teal-500 mt-0.5">{p.t}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={reset}
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2 bg-transparent border-none cursor-pointer"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────────────────── */
function Navbar({ onAuth }: { onAuth: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 sm:px-10 lg:px-16 transition-all duration-400 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-[#02b2f6]/10 shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.06, rotate: -4 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-[#02b2f6]/25"
            style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
          >
            <Heart size={15} color="#fff" fill="#fff" />
          </motion.div>
          <span className="font-black text-[15px] text-gray-900 tracking-tight">
            The Dating App
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            ["#how", "How it works"],
            ["#stories", "Stories"],
          ].map(([href, label]) => (
            <motion.a
              key={href}
              href={href}
              className="text-[13px] text-gray-500 no-underline font-medium hover:text-gray-900 transition-colors duration-150"
              whileHover={{ y: -1 }}
            >
              {label}
            </motion.a>
          ))}
          <motion.button
            onClick={onAuth}
            whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(2,178,246,0.4)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="relative text-[13px] font-bold text-white rounded-full px-6 py-2.5 border-none cursor-pointer overflow-hidden"
            style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles size={12} className="fill-white" />
              Get Started
            </span>
          </motion.button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((k) => (
            <motion.span
              key={k}
              animate={
                open
                  ? k === 0
                    ? { rotate: 45, y: 7 }
                    : k === 1
                    ? { opacity: 0, scaleX: 0 }
                    : { rotate: -45, y: -7 }
                  : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.28 }}
              className="block w-5 h-[2px] rounded-full bg-gray-700 origin-center"
            />
          ))}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: "top" }}
            className="fixed top-16 left-0 right-0 z-40 flex flex-col gap-3 px-6 pt-5 pb-6 md:hidden bg-white/96 backdrop-blur-xl border-b border-[#02b2f6]/10 shadow-lg"
          >
            {[
              ["#how", "How it works"],
              ["#stories", "Stories"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-base text-gray-600 no-underline font-medium py-2.5 border-b border-gray-100"
              >
                {label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onAuth();
              }}
              className="mt-1 text-sm font-bold text-white rounded-full py-3.5 flex items-center justify-center gap-2 border-none cursor-pointer"
              style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
            >
              <Sparkles size={14} className="fill-white" />
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────────────────── */
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <Reveal variant={scaleIn} delay={delay}>
      <motion.div
        whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(2,178,246,0.12)" }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center border border-[#02b2f6]/10 shadow-sm cursor-default"
      >
        <div className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-[#02b2f6] to-[#09cf8b] bg-clip-text text-transparent mb-1">
          {value}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wider">
          {label}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── STEP CARD ──────────────────────────────────────────────────────────── */
function StepCard({
  num,
  icon: Icon,
  color,
  rgb,
  title,
  body,
  delay,
}: {
  num: string;
  icon: React.ElementType;
  color: string;
  rgb: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <Reveal variant={fadeUp} delay={delay}>
      <motion.div
        whileHover={{
          y: -8,
          borderColor: `rgba(${rgb},0.35)`,
          boxShadow: `0 20px 48px rgba(${rgb},0.12)`,
        }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 h-full border border-[#02b2f6]/10 shadow-sm"
      >
        <div className="flex justify-between items-start mb-5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -6 }}
            transition={{ type: "spring", stiffness: 340, damping: 20 }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: `rgba(${rgb},0.08)`,
              border: `1px solid rgba(${rgb},0.2)`,
            }}
          >
            <Icon size={19} color={color} />
          </motion.div>
          <span className="text-[28px] font-black text-gray-100 leading-none select-none">
            {num}
          </span>
        </div>
        <h3 className="text-lg font-black text-gray-800 mb-2">{title}</h3>
        <p className="text-[13px] leading-relaxed text-gray-400 font-light">{body}</p>
      </motion.div>
    </Reveal>
  );
}

/* ─── TESTIMONIAL CARD ───────────────────────────────────────────────────── */
function TestiCard({
  quote,
  name,
  city,
  accent,
  rgb,
  delay,
}: {
  quote: string;
  name: string;
  city: string;
  accent: string;
  rgb: string;
  delay: number;
}) {
  return (
    <Reveal variant={fadeUp} delay={delay}>
      <motion.div
        whileHover={{
          y: -6,
          borderColor: `rgba(${rgb},0.3)`,
          boxShadow: `0 16px 48px rgba(${rgb},0.1)`,
        }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 h-full border border-[#02b2f6]/10 shadow-sm"
      >
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, k) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: delay + k * 0.06, duration: 0.25 }}
            >
              <Star size={12} style={{ color: accent, fill: accent }} />
            </motion.div>
          ))}
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed text-gray-500 mb-5 font-light">
          "{quote}"
        </p>
        <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
            style={{
              background: `linear-gradient(135deg,${accent},${accent}88)`,
            }}
          >
            {name[0]}
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-700">{name}</p>
            <p className="text-[11px] text-gray-300 mt-0.5">{city}</p>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <div className="px-4 sm:px-6 pb-6">
      <div className="rounded-3xl py-14 sm:py-16 px-6 text-center border border-teal-100 relative overflow-hidden bg-gradient-to-br from-[#f3fbff] to-[#f0faf8]">
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#02b2f6]/15 blur-[80px] pointer-events-none" />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#09cf8b]/12 blur-[90px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
            >
              <Heart size={14} color="#fff" fill="#fff" />
            </div>
            <span className="font-black text-gray-700 text-base tracking-tight">
              The Dating App
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-2">
            © 2026 The Dating App. All rights reserved.
          </p>
          <p className="text-sm text-gray-300 flex items-center justify-center gap-1.5 flex-wrap">
            Made in Hyderabad, India
            <Heart size={12} color="#f43f5e" fill="#f43f5e" className="flex-shrink-0" />
            for genuine connections.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN LANDING ───────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/login");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <div className="bg-gradient-to-b from-[#f3fbff] to-[#f9fdfc] min-h-screen text-gray-900 overflow-x-hidden">
      <Navbar onAuth={goToAuth} />

      {/* ══════════════════════ HERO ══════════════════════════════════════════ */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity }}>
        <motion.div
          style={{ y: heroY }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background blobs */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 62% 36%, rgba(2,178,246,0.1) 0%, transparent 58%), radial-gradient(ellipse 55% 45% at 28% 70%, rgba(9,207,139,0.08) 0%, transparent 55%), linear-gradient(175deg,#f3fbff 0%,#f0faf8 100%)",
            }}
          />

          {/* Animated orbs */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[12%] right-[6%] w-64 h-64 rounded-full bg-[#02b2f6]/30 blur-[80px] hidden sm:block pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.38, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[16%] left-[4%] w-56 h-56 rounded-full bg-[#09cf8b]/25 blur-[90px] hidden sm:block pointer-events-none"
          />

          {/* Particle dots */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full hidden sm:block pointer-events-none"
              style={{
                left: `${(i * 19 + 5) % 100}%`,
                top: `${(i * 14 + 9) % 100}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
                background: i % 2 === 0 ? "#02b2f6" : "#09cf8b",
              }}
              animate={{ opacity: [0, 0.45, 0], scale: [0.6, 1, 0.6] }}
              transition={{
                duration: 3.5 + (i % 3),
                delay: i * 0.45,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <AmbientTags />

          {/* Hero content */}
          <div className="relative z-10 text-center px-5 pt-24 sm:pt-32 pb-20 max-w-4xl mx-auto w-full">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 bg-[#02b2f6]/8 border border-[#02b2f6]/20"
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#02b2f6]"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#02b2f6]">
                A new way to fall in love
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(38px,8vw,92px)] leading-[1.03] font-black text-gray-900 mb-6 tracking-tight"
            >
              Fall for someone's
              <br />
              <WordCycle />
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.7 }}
                className="font-light italic text-gray-400"
                style={{ fontSize: "0.78em" }}
              >
                first.
              </motion.span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-[15px] sm:text-base leading-relaxed text-gray-500 max-w-sm mx-auto mb-10 font-light"
            >
              No photos. No names. Just the things that actually matter —
              until you both choose to reveal.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3 justify-center flex-wrap"
            >
              <motion.button
                onClick={goToAuth}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 12px 36px rgba(2,178,246,0.4)",
                }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="text-sm sm:text-[15px] font-bold text-white rounded-full px-7 sm:px-10 py-3.5 sm:py-4 flex items-center gap-2.5 cursor-pointer border-none shadow-lg shadow-[#02b2f6]/30"
                style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
              >
                Find Your Vibe
                <ArrowRight size={15} />
              </motion.button>

              <motion.a
                href="#how"
                whileHover={{
                  borderColor: "rgba(2,178,246,0.35)",
                  color: "#111827",
                }}
                transition={{ duration: 0.18 }}
                className="text-sm text-gray-500 no-underline flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-medium bg-white/80 border border-[#02b2f6]/14 backdrop-blur-sm"
              >
                How it works
                <ChevronDown size={13} />
              </motion.a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            >
              <div className="flex -space-x-2">
                {["#02b2f6", "#09cf8b", "#38bdf8", "#34d399", "#7dd3fc"].map(
                  (c, k) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + k * 0.08 }}
                      className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background: `linear-gradient(135deg,${c},${c}88)` }}
                    >
                      {String.fromCharCode(65 + k)}
                    </motion.div>
                  )
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, k) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + k * 0.06 }}
                  >
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
                <span className="text-[12px] text-gray-500 ml-1.5 font-medium">
                  10,000+ connected
                </span>
              </div>
            </motion.div>

            {/* Scroll arrow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-14"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown size={18} className="text-gray-300 mx-auto" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* ══════════════════════ STATS ══════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-teal-50/80">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 sm:gap-5">
          <StatCard value="10K+" label="Active Users" delay={0} />
          <StatCard value="50K+" label="Matches Made" delay={0.1} />
          <StatCard value="92%" label="Success Rate" delay={0.2} />
        </div>
      </section>

      {/* ══════════════════════ FEATURE PILLS ════════════════════════════════ */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { icon: Eye, text: "No photos until match" },
                { icon: Lock, text: "Anonymous browsing" },
                { icon: Zap, text: "Personality-first" },
                { icon: Shield, text: "Verified profiles" },
                { icon: Heart, text: "Mutual consent only" },
              ].map(({ icon: Icon, text }, k) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: k * 0.07, duration: 0.4 }}
                  whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(2,178,246,0.12)" }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#02b2f6]/12 shadow-sm text-[12px] font-semibold text-gray-600 cursor-default"
                >
                  <Icon size={13} className="text-[#02b2f6]" />
                  {text}
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════ DEMO ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center max-w-4xl mx-auto">
          <Reveal variant={slideLeft}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#09cf8b]/25 bg-[#09cf8b]/8 text-[#09cf8b] text-[10px] font-bold uppercase tracking-wider mb-5">
              <Sparkles size={10} className="fill-[#09cf8b]" />
              Try it yourself
            </div>
            <h2 className="text-[clamp(26px,4.5vw,46px)] leading-[1.1] mb-4 text-gray-900 font-black">
              Words connect.
              <br />
              <span className="bg-gradient-to-r from-[#02b2f6] to-[#09cf8b] bg-clip-text text-transparent italic font-black">
                Then you reveal.
              </span>
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-500 font-light max-w-sm">
              Like both anonymous profiles to experience the moment identities
              unlock. This is how every match begins.
            </p>
          </Reveal>
          <Reveal variant={slideRight} delay={0.12} className="flex justify-center">
            <MatchDemo />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════════════════ */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-teal-50/80">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12 sm:mb-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#02b2f6] mb-4">
                The process
              </p>
              <h2 className="text-[clamp(26px,4.5vw,52px)] leading-[1.08] font-black text-gray-900">
                Three steps.
                <br />
                <span className="italic font-light text-gray-400">
                  One real connection.
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <StepCard
              num="01"
              icon={MessageCircle}
              color="#02b2f6"
              rgb="2,178,246"
              title="Write, don't pose."
              body="Words only — interests, bio, conversation starters. No photos. Just you, expressed honestly."
              delay={0}
            />
            <StepCard
              num="02"
              icon={Heart}
              color="#38bdf8"
              rgb="56,189,248"
              title="Like the vibe."
              body="Browse anonymously. If someone's words resonate — their humour, taste, outlook — like them."
              delay={0.1}
            />
            <StepCard
              num="03"
              icon={MapPin}
              color="#09cf8b"
              rgb="9,207,139"
              title="Meet for real."
              body="Identities unlock on mutual match. We suggest the best nearby cafés for your first date."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════ STORIES ════════════════════════════════════════ */}
      <section id="stories" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#02b2f6] mb-4">
                Real stories
              </p>
              <h2 className="text-[clamp(26px,4.5vw,52px)] leading-[1.08] font-black text-gray-900">
                People who met
                <br />
                <span className="bg-gradient-to-r from-[#02b2f6] to-[#09cf8b] bg-clip-text text-transparent italic">
                  through words.
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <TestiCard
              quote="I fell for his writing before I ever saw his face. That order of events changed everything."
              name="Priya, 26"
              city="Bangalore"
              accent="#02b2f6"
              rgb="2,178,246"
              delay={0}
            />
            <TestiCard
              quote="I'd been on every app. This was the first time someone messaged me about my book list."
              name="Rahul, 29"
              city="Delhi"
              accent="#38bdf8"
              rgb="56,189,248"
              delay={0.1}
            />
            <TestiCard
              quote="We matched on a Tuesday. Coffee on Saturday. Engaged eight months later."
              name="Nisha, 27"
              city="Mumbai"
              accent="#09cf8b"
              rgb="9,207,139"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════ SAFETY ═════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-teal-50/80">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal variant={slideLeft}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#02b2f6] mb-5">
              Safety first
            </p>
            <h2 className="text-[clamp(26px,4vw,46px)] leading-[1.15] font-black text-gray-900 mb-5">
              Built for people
              <br />
              <span className="italic font-light text-gray-400">
                who are careful.
              </span>
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-500 font-light">
              Anonymity is the default, not a setting. Your identity only
              reveals when both of you say yes.
            </p>
          </Reveal>

          <Reveal variant={slideRight} delay={0.1}>
            <div className="flex flex-col gap-3.5">
              {[
                {
                  Icon: Shield,
                  label: "Verified profiles",
                  desc: "Selfie verification on sign-up. No bots, no fakes.",
                  color: "#02b2f6",
                  rgb: "2,178,246",
                },
                {
                  Icon: Lock,
                  label: "Anonymous by default",
                  desc: "Name and photo hidden until mutual match.",
                  color: "#09cf8b",
                  rgb: "9,207,139",
                },
                {
                  Icon: Heart,
                  label: "Mutual consent only",
                  desc: "Contact is only possible when both people say yes.",
                  color: "#38bdf8",
                  rgb: "56,189,248",
                },
              ].map(({ Icon, label, desc, color, rgb }, k) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: k * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    x: 6,
                    borderColor: `rgba(${rgb},0.3)`,
                    boxShadow: `0 4px 20px rgba(${rgb},0.08)`,
                  }}
                  className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-[#02b2f6]/10 cursor-default transition-all duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `rgba(${rgb},0.08)`,
                      border: `1px solid rgba(${rgb},0.18)`,
                    }}
                  >
                    <Icon size={17} color={color} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-700 mb-0.5">
                      {label}
                    </p>
                    <p className="text-[12px] text-gray-400 leading-relaxed font-light">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════ FINAL CTA ══════════════════════════════════════ */}
      <section className="relative py-20 sm:py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] rounded-full bg-[#02b2f6]/18 blur-[100px]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[200px] rounded-full bg-[#09cf8b]/14 blur-[80px] translate-x-24 translate-y-8" />
        </div>

        <Reveal>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 bg-[#09cf8b]/8 border border-[#09cf8b]/2"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#09cf8b]"
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#09cf8b]">
              Ready to begin?
            </span>
          </motion.div>

          <h2 className="text-[clamp(30px,6vw,68px)] leading-[1.06] font-black text-gray-900 mb-5">
            The right person
            <br />
            <span
              className="italic font-light text-gray-400"
              style={{ fontSize: "0.86em" }}
            >
              is writing right now.
            </span>
          </h2>

          <p className="text-[14px] text-gray-400 mb-10 font-light">
            Join 10,000+ people who chose personality over photos.
          </p>

          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={goToAuth}
              whileHover={{
                scale: 1.04,
                boxShadow: "0 20px 50px rgba(2,178,246,0.4)",
              }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="text-sm sm:text-[15px] font-bold text-white rounded-full px-8 sm:px-14 py-4 sm:py-5 flex items-center gap-3 border-none cursor-pointer shadow-xl shadow-[#02b2f6]/25"
              style={{ background: "linear-gradient(135deg,#02b2f6,#09cf8b)" }}
            >
              <Sparkles size={15} className="fill-white" />
              Create your profile — it's free
              <ArrowRight size={15} />
            </motion.button>
            <p className="text-[11px] text-gray-300 font-light">
              No credit card required · Takes 2 minutes
            </p>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}