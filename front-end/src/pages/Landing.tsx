import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
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
  Flame,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

/* ─── ANIMATION VARIANTS ────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};
const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};
const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
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

function WordCycle({ isDark }: { isDark: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const grad = isDark
    ? "linear-gradient(135deg, #fbbf24, #f97316)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";

  return (
    <span className="relative inline-block" style={{ perspective: 600 }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24, rotateX: -35 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -18, rotateX: 28 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-clip-text text-transparent italic"
          style={{ backgroundImage: grad, transformOrigin: "bottom center" }}
        >
          {WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── EMBER PARTICLE (from HomePage) ────────────────────────────────────── */
const EmberParticle = ({
  style,
  size = "sm",
  isDark,
}: {
  style: React.CSSProperties;
  size?: "sm" | "md" | "lg";
  isDark: boolean;
}) => {
  const dims = { sm: 6, md: 10, lg: 14 }[size];
  const grad = isDark
    ? "radial-gradient(circle, #fbbf24 0%, #f97316 60%, transparent 100%)"
    : "radial-gradient(circle, #1d4ed8 0%, #3b82f6 60%, transparent 100%)";
  const glow = isDark
    ? "0 0 6px 2px rgba(251,146,60,0.5)"
    : "0 0 6px 2px rgba(29,78,216,0.4)";
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: dims, height: dims,
        background: grad,
        boxShadow: glow,
        opacity: 0,
        ...style,
        animation: `emberFloat ${(style as any).animationDuration ?? "4s"} ease-out infinite`,
        animationDelay: (style as any).animationDelay ?? "0s",
      }}
    />
  );
};

/* ─── FLOATING TAGS ──────────────────────────────────────────────────────── */
const TAGS = [
  { text: "Jazz & rain",    x: "6%",  y: "18%", delay: 0   },
  { text: "Book collector", x: "74%", y: "14%", delay: 1.4 },
  { text: "Long walks",     x: "82%", y: "58%", delay: 0.7 },
  { text: "Early riser",    x: "4%",  y: "64%", delay: 2.0 },
  { text: "Deep talks",     x: "40%", y: "8%",  delay: 3.0 },
  { text: "Sunrise hikes",  x: "66%", y: "42%", delay: 1.8 },
  { text: "Terrible cook",  x: "54%", y: "80%", delay: 0.9 },
];

function AmbientTags({ isDark }: { isDark: boolean }) {
  const tagBg   = isDark ? "rgba(30,18,8,0.85)"       : "rgba(255,255,255,0.85)";
  const tagBorder = isDark ? "rgba(249,115,22,0.28)"  : "rgba(29,78,216,0.2)";
  const tagColor  = isDark ? "#fb923c"                 : "#1d4ed8";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {TAGS.map((tag, i) => (
        <motion.div
          key={i}
          className={`absolute ${i >= 4 ? "hidden sm:block" : ""}`}
          style={{ left: tag.x, top: tag.y }}
          initial={{ opacity: 0, y: 12, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8 + tag.delay * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: tag.delay * 0.3 }}
            className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap backdrop-blur-md"
            style={{ background: tagBg, border: `1px solid ${tagBorder}`, color: tagColor }}
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

function MatchDemo({ isDark }: { isDark: boolean }) {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState(false);

  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber = isDark ? "#fb923c" : "#3b82f6";

  const toggle = (id: string) => {
    const next = new Set(liked);
    next.has(id) ? next.delete(id) : next.add(id);
    setLiked(next);
    if (next.size === 2) setTimeout(() => setMatched(true), 450);
  };

  const reset = () => { setLiked(new Set()); setMatched(false); };

  const cardBase = isDark
    ? { background: "linear-gradient(145deg, #1a1007, #110b04)", border: "1px solid rgba(249,115,22,0.15)" }
    : { background: "#ffffff", border: "1px solid rgba(29,78,216,0.1)" };

  const cardActive = isDark
    ? { background: "rgba(249,115,22,0.06)", border: `1px solid rgba(249,115,22,0.4)`, boxShadow: "0 8px 24px rgba(249,115,22,0.1)" }
    : { background: "rgba(29,78,216,0.05)", border: `1px solid rgba(29,78,216,0.4)`,   boxShadow: "0 8px 24px rgba(29,78,216,0.1)"  };

  const tagBase   = isDark ? { background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.1)",  color: "#8a6540" } : { background: "rgba(29,78,216,0.05)", border: "1px solid rgba(29,78,216,0.1)",  color: "#6366f1" };
  const tagActive = isDark ? { background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.28)", color: "#fb923c" } : { background: "rgba(29,78,216,0.10)", border: "1px solid rgba(29,78,216,0.25)", color: "#1d4ed8" };

  const txPrimary = isDark ? "#f0e8de" : "#1e293b";
  const txMuted   = isDark ? "#8a6540" : "#9ca3af";

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {!matched ? (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
            {DEMO_PROFILES.map((p, idx) => {
              const on = liked.has(p.id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="mb-3 p-5 rounded-2xl transition-all duration-300"
                  style={on ? cardActive : cardBase}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300" style={on ? tagActive : tagBase}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      onClick={() => toggle(p.id)}
                      whileTap={{ scale: 0.65 }}
                      whileHover={{ scale: 1.12 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                      className="w-9 h-9 rounded-full flex-shrink-0 ml-2 flex items-center justify-center cursor-pointer transition-all duration-300"
                      style={on ? { background: `linear-gradient(135deg,${accentColor},${accentEmber})`, boxShadow: `0 4px 14px ${accentColor}50` } : { background: isDark ? "rgba(249,115,22,0.06)" : "#f8faff", border: `1px solid ${accentColor}25` }}
                    >
                      <Heart size={13} color={on ? "#fff" : accentColor} fill={on ? "#fff" : "none"} />
                    </motion.button>
                  </div>
                  <p className="text-[13px] leading-relaxed italic" style={{ color: txMuted }}>"{p.bio}"</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <Lock size={9} style={{ color: isDark ? "#4a3520" : "#d1d5db" }} />
                    <span className="text-[9px] uppercase font-semibold tracking-widest" style={{ color: isDark ? "#4a3520" : "#d1d5db" }}>Identity hidden</span>
                  </div>
                </motion.div>
              );
            })}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-[11px] mt-1" style={{ color: txMuted }}>
              ♡ like both to see the magic
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="match"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-8 text-center"
            style={isDark
              ? { background: "linear-gradient(135deg,rgba(249,115,22,0.06),#110b04 50%,rgba(251,191,36,0.06))", border: "1px solid rgba(249,115,22,0.22)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }
              : { background: "linear-gradient(135deg,rgba(29,78,216,0.06),#fff 50%,rgba(59,130,246,0.08))",     border: "1px solid rgba(29,78,216,0.2)",   boxShadow: "0 16px 48px rgba(29,78,216,0.1)" }
            }
          >
            <div className="relative w-14 h-14 mx-auto mb-5">
              {[0, 1].map((k) => (
                <motion.div key={k} className="absolute inset-0 rounded-full" style={{ border: `1px solid ${accentColor}50` }}
                  animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, delay: k * 0.7, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${accentColor},${accentEmber})` }}
              >
                <Heart size={20} color="#fff" fill="#fff" />
              </motion.div>
            </div>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="text-2xl font-black mb-1.5 tracking-tight" style={{ color: txPrimary }}>
              It's mutual. ✨
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
              className="text-sm mb-6 leading-relaxed" style={{ color: isDark ? "#8a6540" : "#6b7280" }}>
              Both liked each other. Identities revealed.
            </motion.p>
            <div className="flex flex-col gap-2 mb-5">
              {[
                { n: "Arjun, 27 · Mumbai", t: "Jazz & rain · Long walks" },
                { n: "Maya, 25 · Pune",   t: "Book collector · Cinema" },
              ].map((p, k) => (
                <motion.div key={p.n} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + k * 0.1 }}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left"
                  style={{ background: isDark ? "rgba(249,115,22,0.07)" : "rgba(29,78,216,0.06)", border: `1px solid ${accentColor}18` }}
                >
                  <Unlock size={11} style={{ color: accentColor }} className="flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: txPrimary }}>{p.n}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: accentEmber }}>{p.t}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <button onClick={reset} className="text-[11px] hover:opacity-80 transition-opacity underline underline-offset-2 bg-transparent border-none cursor-pointer" style={{ color: isDark ? "#8a6540" : "#9ca3af" }}>
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── ANIMATED STAT CARD (matches HomePage AnimatedStat) ─────────────────── */
function StatCard({ value, label, delay, isDark }: { value: string; label: string; delay: number; isDark: boolean }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const cardStyle = isDark ? {
    background: "linear-gradient(145deg, #1e1810 0%, #130e06 100%)",
    border: "1px solid rgba(249,115,22,0.22)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
  } : {
    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
    border: "1px solid rgba(29,78,216,0.15)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
  };

  const valueGrad = isDark
    ? "linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #f97316 100%)"
    : "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 50%, #3b82f6 100%)";

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center cursor-default transition-all duration-300"
      style={{
        ...cardStyle,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.94)",
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: isDark ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)" : "linear-gradient(90deg, transparent, rgba(29,78,216,0.3), transparent)" }} />
      <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 bg-clip-text text-transparent" style={{ backgroundImage: valueGrad, transform: visible ? "scale(1)" : "scale(0.7)", transition: `transform 0.5s cubic-bezier(.34,1.56,.64,1) ${delay + 0.15}s` }}>
        {value}
      </div>
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? "#c2763a" : "#64748b" }}>
        {label}
      </div>
    </div>
  );
}

/* ─── STEP CARD ──────────────────────────────────────────────────────────── */
function StepCard({ num, icon: Icon, color, rgb, title, body, delay, isDark }: {
  num: string; icon: React.ElementType; color: string; rgb: string; title: string; body: string; delay: number; isDark: boolean;
}) {
  const cardStyle = isDark
    ? { background: "linear-gradient(145deg, #1a1007, #110b04)", border: "1px solid rgba(249,115,22,0.14)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }
    : { background: "#ffffff", border: "1px solid rgba(29,78,216,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" };

  return (
    <Reveal variant={fadeUp} delay={delay}>
      <motion.div
        whileHover={{ y: -8, borderColor: `rgba(${rgb},0.35)`, boxShadow: `0 20px 48px rgba(${rgb},0.12)` }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 h-full"
        style={cardStyle}
      >
        <div className="flex justify-between items-start mb-5">
          <motion.div whileHover={{ scale: 1.1, rotate: -6 }} transition={{ type: "spring", stiffness: 340, damping: 20 }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.2)` }}>
            <Icon size={19} color={color} />
          </motion.div>
          <span className="text-[28px] font-black leading-none select-none" style={{ color: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}>{num}</span>
        </div>
        <h3 className="text-lg font-black mb-2" style={{ color: isDark ? "#f0e8de" : "#1f2937" }}>{title}</h3>
        <p className="text-[13px] leading-relaxed font-light" style={{ color: isDark ? "#8a6540" : "#9ca3af" }}>{body}</p>
      </motion.div>
    </Reveal>
  );
}

/* ─── TESTIMONIAL CARD ───────────────────────────────────────────────────── */
function TestiCard({ quote, name, city, accent, rgb, delay, isDark }: {
  quote: string; name: string; city: string; accent: string; rgb: string; delay: number; isDark: boolean;
}) {
  const cardStyle = isDark
    ? { background: "linear-gradient(145deg, #1a1007, #110b04)", border: "1px solid rgba(249,115,22,0.14)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }
    : { background: "#ffffff", border: "1px solid rgba(29,78,216,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" };

  return (
    <Reveal variant={fadeUp} delay={delay}>
      <motion.div
        whileHover={{ y: -6, borderColor: `rgba(${rgb},0.3)`, boxShadow: `0 16px 48px rgba(${rgb},0.1)` }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 h-full"
        style={cardStyle}
      >
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, k) => (
            <motion.div key={k} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: delay + k * 0.06, duration: 0.25 }}>
              <Star size={12} style={{ color: accent, fill: accent }} />
            </motion.div>
          ))}
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed mb-5 font-light" style={{ color: isDark ? "#c4a882" : "#6b7280" }}>"{quote}"</p>
        <div className="flex items-center gap-3 pt-4" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f3f4f6" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${accent},${accent}88)` }}>
            {name[0]}
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: isDark ? "#e8d5be" : "#374151" }}>{name}</p>
            <p className="text-[11px] mt-0.5" style={{ color: isDark ? "#8a6540" : "#d1d5db" }}>{city}</p>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────────────────────── */
function Navbar({ onAuth, isDark, onToggle }: { onAuth: () => void; isDark: boolean; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber = isDark ? "#fb923c" : "#3b82f6";
  const txPrimary   = isDark ? "#f0e8de" : "#111827";

  const navBg = scrolled
    ? isDark ? "rgba(13,13,13,0.92)" : "rgba(255,255,255,0.92)"
    : "transparent";
  const navBorder = scrolled
    ? isDark ? "rgba(249,115,22,0.14)" : "rgba(29,78,216,0.1)"
    : "transparent";

  const toggleBtnStyle = isDark ? {
    background: "rgba(249,115,22,0.1)",
    border: "1px solid rgba(249,115,22,0.28)",
    color: "#fb923c",
  } : {
    background: "rgba(29,78,216,0.08)",
    border: "1px solid rgba(29,78,216,0.22)",
    color: "#1d4ed8",
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 sm:px-10 lg:px-16 transition-all duration-400 backdrop-blur-xl"
        style={{ background: navBg, borderBottom: `1px solid ${navBorder}`, boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none" }}
      >
        <Link to="/" className="flex items-center gap-2.5 group no-underline">
          <motion.div whileHover={{ scale: 1.06, rotate: -4 }} transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${accentColor},${accentEmber})`, boxShadow: `0 4px 16px ${accentColor}40` }}>
            <Heart size={15} color="#fff" fill="#fff" />
          </motion.div>
          <span className="font-black text-[15px] tracking-tight" style={{ color: txPrimary }}>The Dating App</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {[["#how", "How it works"], ["#stories", "Stories"]].map(([href, label]) => (
            <motion.a key={href} href={href} className="text-[13px] font-medium no-underline transition-colors duration-150" style={{ color: isDark ? "#c4a882" : "#6b7280" }} whileHover={{ y: -1 }}>
              {label}
            </motion.a>
          ))}

          {/* Dark / Light toggle */}
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-300"
            style={toggleBtnStyle}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "moon" : "sun"}
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {isDark ? <Moon size={15} /> : <Sun size={15} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button onClick={onAuth}
            whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${accentColor}50` }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="text-[13px] font-bold text-white rounded-full px-6 py-2.5 border-none cursor-pointer overflow-hidden"
            style={{ background: `linear-gradient(135deg,${accentColor},${accentEmber})` }}>
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles size={12} className="fill-white" /> Get Started
            </span>
          </motion.button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <motion.button
            onClick={onToggle}
            whileTap={{ scale: 0.88 }}
            className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-300"
            style={toggleBtnStyle}
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "moon-m" : "sun-m"}
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.22 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {isDark ? <Moon size={13} /> : <Sun size={13} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <button onClick={() => setOpen((v) => !v)} className="flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2" aria-label="Toggle menu">
            {[0, 1, 2].map((k) => (
              <motion.span key={k}
                animate={open ? k === 0 ? { rotate: 45, y: 7 } : k === 1 ? { opacity: 0, scaleX: 0 } : { rotate: -45, y: -7 } : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.28 }}
                className="block w-5 h-[2px] rounded-full origin-center"
                style={{ background: isDark ? "#f0e8de" : "#374151" }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: "top", background: isDark ? "rgba(13,13,13,0.97)" : "rgba(255,255,255,0.97)", borderBottom: `1px solid ${navBorder}` }}
            className="fixed top-16 left-0 right-0 z-40 flex flex-col gap-3 px-6 pt-5 pb-6 md:hidden backdrop-blur-xl shadow-lg"
          >
            {[["#how", "How it works"], ["#stories", "Stories"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="text-base font-medium no-underline py-2.5" style={{ color: isDark ? "#c4a882" : "#6b7280", borderBottom: isDark ? "1px solid rgba(249,115,22,0.1)" : "1px solid #f3f4f6" }}>
                {label}
              </a>
            ))}
            <button onClick={() => { setOpen(false); onAuth(); }}
              className="mt-1 text-sm font-bold text-white rounded-full py-3.5 flex items-center justify-center gap-2 border-none cursor-pointer"
              style={{ background: `linear-gradient(135deg,${accentColor},${accentEmber})` }}>
              <Sparkles size={14} className="fill-white" /> Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────── */
function Footer({ isDark }: { isDark: boolean }) {
  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber = isDark ? "#fb923c" : "#3b82f6";
  return (
    <div className="px-4 sm:px-6 pb-6">
      <div
        className="rounded-3xl py-14 sm:py-16 px-6 text-center relative overflow-hidden"
        style={isDark
          ? { background: "linear-gradient(145deg, #181108, #100c04)", border: "1px solid rgba(249,115,22,0.16)" }
          : { background: "linear-gradient(145deg, #f8faff, #eef2ff)", border: "1px solid rgba(59,130,246,0.15)" }
        }
      >
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: isDark ? "rgba(249,115,22,0.12)" : "rgba(29,78,216,0.15)" }} />
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[90px] pointer-events-none" style={{ background: isDark ? "rgba(251,191,36,0.08)" : "rgba(59,130,246,0.12)" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg,${accentColor},${accentEmber})` }}>
              <Heart size={14} color="#fff" fill="#fff" />
            </div>
            <span className="font-black text-base tracking-tight" style={{ color: isDark ? "#f0e8de" : "#374151" }}>The Dating App</span>
          </div>
          <p className="text-sm mb-2" style={{ color: isDark ? "#8a6540" : "#9ca3af" }}>© 2026 The Dating App. All rights reserved.</p>
          <p className="text-sm flex items-center justify-center gap-1.5 flex-wrap" style={{ color: isDark ? "#4a3520" : "#d1d5db" }}>
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
  const { isDark, toggleTheme, setIsDark } = useTheme() as any;
  const handleToggle = toggleTheme ?? (() => setIsDark?.((v: boolean) => !v));
  const goToAuth = () => navigate("/login");
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  /* ─── Theme tokens ─── */
  const accentColor   = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber   = isDark ? "#fb923c" : "#3b82f6";
  const txPrimary     = isDark ? "#f0e8de" : "#111827";
  const txBody        = isDark ? "#c4a882" : "#475569";
  const txMuted       = isDark ? "#8a6540" : "#64748b";
  const pageBg        = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";

  const ambientBg1 = isDark
    ? "radial-gradient(ellipse 70% 50% at 62% 36%, rgba(234,88,12,0.1) 0%, transparent 58%)"
    : "radial-gradient(ellipse 70% 50% at 62% 36%, rgba(29,78,216,0.1) 0%, transparent 58%)";
  const ambientBg2 = isDark
    ? "radial-gradient(ellipse 55% 45% at 28% 70%, rgba(249,115,22,0.06) 0%, transparent 55%)"
    : "radial-gradient(ellipse 55% 45% at 28% 70%, rgba(59,130,246,0.08) 0%, transparent 55%)";
  const dotGridColor = isDark
    ? "radial-gradient(circle, rgba(249,115,22,0.12) 1px, transparent 1px)"
    : "radial-gradient(circle, rgba(29,78,216,0.1) 1px, transparent 1px)";

  const heroNameGrad = isDark
    ? "linear-gradient(270deg, #fbbf24 0%, #f97316 25%, #fb923c 50%, #fbbf24 75%, #f97316 100%)"
    : "linear-gradient(270deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)";

  const sectionBorder = isDark ? "1px solid rgba(249,115,22,0.08)" : "1px solid rgba(59,130,246,0.1)";

  const badgeStyle = isDark
    ? { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)" }
    : { background: "rgba(29,78,216,0.08)",  border: "1px solid rgba(29,78,216,0.2)"  };

  const badgeStyle2 = isDark
    ? { background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)"  }
    : { background: "rgba(59,130,246,0.08)",  border: "1px solid rgba(59,130,246,0.25)" };

  const ctaGradient = `linear-gradient(135deg,${accentColor},${accentEmber})`;

  /* Safety section rows */
  const safetyItems = [
    { Icon: Shield, label: "Verified profiles",    desc: "Selfie verification on sign-up. No bots, no fakes.",              color: accentColor, rgb: isDark ? "249,115,22" : "29,78,216"  },
    { Icon: Lock,   label: "Anonymous by default", desc: "Name and photo hidden until mutual match.",                        color: accentEmber, rgb: isDark ? "251,191,36" : "59,130,246"  },
    { Icon: Heart,  label: "Mutual consent only",  desc: "Contact is only possible when both people say yes.",               color: isDark ? "#fbbf24" : "#60a5fa", rgb: isDark ? "251,191,36" : "99,102,241" },
  ];

  return (
    <>
      <style>{`
        @keyframes emberFloat {
          0%   { transform: translateY(0) translateX(0) scale(1);     opacity: 0; }
          12%  { opacity: 0.9; }
          75%  { opacity: 0.4; }
          100% { transform: translateY(-150px) translateX(10px) scale(0.25); opacity: 0; }
        }
        @keyframes gradientPan {
          0%   { background-position: 0%   center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0%   center; }
        }
        @keyframes flamePulse {
          0%,100% { filter: drop-shadow(0 0 5px ${accentColor}) drop-shadow(0 0 14px ${accentColor}80); transform: scale(1) rotate(-3deg); }
          50%     { filter: drop-shadow(0 0 12px ${accentEmber}) drop-shadow(0 0 30px ${accentColor}80); transform: scale(1.1) rotate(3deg); }
        }
        @keyframes orbit {
          0%   { transform: rotate(0deg)   translateX(110px) rotate(0deg);    }
          100% { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
        }
        .animate-flame { animation: flamePulse 2.6s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen overflow-x-hidden transition-colors duration-300" style={{ background: pageBg, color: txPrimary }}>
        {/* ── AMBIENT BACKGROUND (fixed, mirrors HomePage) ── */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full" style={{ background: ambientBg1 }} />
          <div className="absolute top-[38%] -right-28 w-80 h-80 rounded-full"        style={{ background: ambientBg2 }} />
          <div className="absolute inset-0" style={{ backgroundImage: dotGridColor, backgroundSize: "48px 48px", opacity: 0.35 }} />
        </div>

        <Navbar onAuth={goToAuth} isDark={isDark} onToggle={handleToggle} />

        {/* ══════════════════════ HERO ══════════════════════════════════════════ */}
        <motion.section ref={heroRef} style={{ opacity: heroOpacity }}>
          <motion.div style={{ y: heroY }} className="relative min-h-screen flex items-center justify-center overflow-hidden">

            {/* Animated orbs */}
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[12%] right-[6%] w-64 h-64 rounded-full hidden sm:block pointer-events-none"
              style={{ background: isDark ? "rgba(249,115,22,0.25)" : "rgba(29,78,216,0.3)", filter: "blur(80px)" }}
            />
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[16%] left-[4%] w-56 h-56 rounded-full hidden sm:block pointer-events-none"
              style={{ background: isDark ? "rgba(251,191,36,0.2)" : "rgba(59,130,246,0.25)", filter: "blur(90px)" }}
            />

            {/* Particle dots */}
            {[...Array(12)].map((_, i) => (
              <motion.div key={i} className="absolute rounded-full hidden sm:block pointer-events-none"
                style={{ left: `${(i * 19 + 5) % 100}%`, top: `${(i * 14 + 9) % 100}%`, width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, background: i % 2 === 0 ? accentColor : accentEmber }}
                animate={{ opacity: [0, 0.45, 0], scale: [0.6, 1, 0.6] }}
                transition={{ duration: 3.5 + (i % 3), delay: i * 0.45, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {/* Ember particles */}
            {heroVisible && (
              <>
                <EmberParticle isDark={isDark} size="sm" style={{ left:"10%", bottom:"8%",  animationDelay:"0s",   animationDuration:"3.8s" } as any} />
                <EmberParticle isDark={isDark} size="md" style={{ left:"22%", bottom:"12%", animationDelay:"1.2s", animationDuration:"4.5s" } as any} />
                <EmberParticle isDark={isDark} size="sm" style={{ left:"38%", bottom:"5%",  animationDelay:"0.5s", animationDuration:"3.3s" } as any} />
                <EmberParticle isDark={isDark} size="lg" style={{ left:"60%", bottom:"14%", animationDelay:"1.8s", animationDuration:"5.0s" } as any} />
                <EmberParticle isDark={isDark} size="sm" style={{ left:"75%", bottom:"7%",  animationDelay:"0.3s", animationDuration:"4.1s" } as any} />
                <EmberParticle isDark={isDark} size="md" style={{ left:"88%", bottom:"4%",  animationDelay:"2.1s", animationDuration:"3.6s" } as any} />
              </>
            )}

            {/* Orbiting spark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
              <div className="w-2.5 h-2.5 rounded-full" style={{
                background: isDark ? "radial-gradient(circle, #fbbf24, #f97316)" : "radial-gradient(circle, #60a5fa, #1d4ed8)",
                boxShadow: isDark ? "0 0 10px 3px rgba(251,191,36,0.55)" : "0 0 10px 3px rgba(29,78,216,0.4)",
                animation: "orbit 14s linear infinite",
              }} />
            </div>

            <AmbientTags isDark={isDark} />

            {/* Hero content */}
            <div className="relative z-10 text-center px-5 pt-24 sm:pt-32 pb-20 max-w-4xl mx-auto w-full">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
                style={badgeStyle}
              >
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: accentColor }}>A new way to fall in love</span>
              </motion.div>

              {/* Headline */}
              <div
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(40px)",
                  transition: "opacity 0.9s cubic-bezier(.22,1,.36,1) 0.3s, transform 0.9s cubic-bezier(.22,1,.36,1) 0.3s",
                }}
              >
                <h1 className="text-[clamp(38px,8vw,92px)] leading-[1.03] font-black mb-6 tracking-tight" style={{ color: txPrimary }}>
                  Fall for someone's
                  <br />
                  <WordCycle isDark={isDark} />
                  <br />
                  <span className="font-light italic" style={{ color: txMuted, fontSize: "0.78em" }}>first.</span>
                </h1>
              </div>

              {/* Subtitle */}
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-[15px] sm:text-base leading-relaxed max-w-sm mx-auto mb-10 font-light" style={{ color: txBody }}>
                No photos. No names. Just the things that actually matter — until you both choose to reveal.
              </motion.p>

              {/* CTA buttons */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-3 justify-center flex-wrap">
                <motion.button onClick={goToAuth}
                  whileHover={{ scale: 1.04, boxShadow: `0 12px 36px ${accentColor}50` }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="text-sm sm:text-[15px] font-bold text-white rounded-full px-7 sm:px-10 py-3.5 sm:py-4 flex items-center gap-2.5 cursor-pointer border-none"
                  style={{ background: ctaGradient, boxShadow: `0 8px 24px ${accentColor}35` }}>
                  <Flame size={15} fill="currentColor" /> Find Your Vibe <ArrowRight size={15} />
                </motion.button>
                <motion.a href="#how"
                  whileHover={{ borderColor: `${accentColor}50`, color: txPrimary }}
                  transition={{ duration: 0.18 }}
                  className="text-sm flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-medium backdrop-blur-sm no-underline"
                  style={{ color: txBody, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)", border: `1px solid ${isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.14)"}` }}>
                  How it works <ChevronDown size={13} />
                </motion.a>
              </motion.div>

              {/* Social proof */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.8 }}
                className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                  {(isDark
                    ? ["#f97316","#fbbf24","#fb923c","#f59e0b","#fdba74"]
                    : ["#1d4ed8","#3b82f6","#60a5fa","#818cf8","#a5b4fc"]
                  ).map((c, k) => (
                    <motion.div key={k} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + k * 0.08 }}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white"
                      style={{ borderColor: isDark ? "#0d0d0d" : "#fff", background: `linear-gradient(135deg,${c},${c}88)` }}>
                      {String.fromCharCode(65 + k)}
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, k) => (
                    <motion.div key={k} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + k * 0.06 }}>
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                  <span className="text-[12px] ml-1.5 font-medium" style={{ color: txBody }}>10,000+ connected</span>
                </div>
              </motion.div>

              {/* Scroll arrow */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-14">
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  <ChevronDown size={18} className="mx-auto" style={{ color: isDark ? "#4a3520" : "#d1d5db" }} />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* ══════════════════════ STATS ══════════════════════════════════════════ */}
        <section className="py-12 sm:py-16 px-4 sm:px-6" style={{ borderTop: sectionBorder }}>
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 sm:gap-5">
            <StatCard value="10K+" label="Active Users"  delay={0}   isDark={isDark} />
            <StatCard value="50K+" label="Matches Made"  delay={0.1} isDark={isDark} />
            <StatCard value="92%"  label="Success Rate"  delay={0.2} isDark={isDark} />
          </div>
        </section>

        {/* ══════════════════════ FEATURE PILLS ════════════════════════════════ */}
        <section className="py-8 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="flex flex-wrap justify-center gap-2.5">
                {[
                  { icon: Eye,     text: "No photos until match"  },
                  { icon: Lock,    text: "Anonymous browsing"     },
                  { icon: Zap,     text: "Personality-first"      },
                  { icon: Shield,  text: "Verified profiles"      },
                  { icon: Heart,   text: "Mutual consent only"    },
                ].map(({ icon: Icon, text }, k) => (
                  <motion.div key={text}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: k * 0.07, duration: 0.4 }}
                    whileHover={{ y: -2, boxShadow: `0 6px 20px ${accentColor}20` }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold cursor-default"
                    style={{ background: isDark ? "rgba(249,115,22,0.06)" : "#ffffff", border: `1px solid ${isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.12)"}`, color: isDark ? "#c4a882" : "#4b5563", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <Icon size={13} style={{ color: accentColor }} />
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-[10px] font-bold uppercase tracking-wider" style={badgeStyle2}>
                <Sparkles size={10} style={{ color: accentEmber, fill: accentEmber }} />
                <span style={{ color: accentEmber }}>Try it yourself</span>
              </div>
              <h2 className="text-[clamp(26px,4.5vw,46px)] leading-[1.1] mb-4 font-black" style={{ color: txPrimary }}>
                Words connect.
                <br />
                <span className="bg-clip-text text-transparent italic font-black" style={{ backgroundImage: ctaGradient }}>Then you reveal.</span>
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-relaxed font-light max-w-sm" style={{ color: txBody }}>
                Like both anonymous profiles to experience the moment identities unlock. This is how every match begins.
              </p>
            </Reveal>
            <Reveal variant={slideRight} delay={0.12} className="flex justify-center">
              <MatchDemo isDark={isDark} />
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════ HOW IT WORKS ══════════════════════════════════ */}
        <section id="how" className="py-16 sm:py-24 px-4 sm:px-6" style={{ borderTop: sectionBorder }}>
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-12 sm:mb-16">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: accentColor }}>The process</p>
                <h2 className="text-[clamp(26px,4.5vw,52px)] leading-[1.08] font-black" style={{ color: txPrimary }}>
                  Three steps.
                  <br />
                  <span className="italic font-light" style={{ color: txMuted }}>One real connection.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <StepCard num="01" icon={MessageCircle} color={accentColor} rgb={isDark ? "249,115,22" : "29,78,216"} title="Write, don't pose." body="Words only — interests, bio, conversation starters. No photos. Just you, expressed honestly." delay={0}   isDark={isDark} />
              <StepCard num="02" icon={Heart}         color={isDark ? "#fbbf24" : "#60a5fa"} rgb={isDark ? "251,191,36" : "99,102,241"} title="Like the vibe."  body="Browse anonymously. If someone's words resonate — their humour, taste, outlook — like them."      delay={0.1} isDark={isDark} />
              <StepCard num="03" icon={MapPin}        color={accentEmber} rgb={isDark ? "251,146,60" : "59,130,246"} title="Meet for real." body="Identities unlock on mutual match. We suggest the best nearby cafés for your first date."           delay={0.2} isDark={isDark} />
            </div>
          </div>
        </section>

        {/* ══════════════════════ STORIES ════════════════════════════════════════ */}
        <section id="stories" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-10 sm:mb-14">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: accentColor }}>Real stories</p>
                <h2 className="text-[clamp(26px,4.5vw,52px)] leading-[1.08] font-black" style={{ color: txPrimary }}>
                  People who met
                  <br />
                  <span className="bg-clip-text text-transparent italic" style={{ backgroundImage: ctaGradient }}>through words.</span>
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <TestiCard quote="I fell for his writing before I ever saw his face. That order of events changed everything." name="Priya, 26" city="Bangalore" accent={accentColor} rgb={isDark ? "249,115,22" : "29,78,216"} delay={0}   isDark={isDark} />
              <TestiCard quote="I'd been on every app. This was the first time someone messaged me about my book list."    name="Rahul, 29" city="Delhi"     accent={isDark ? "#fbbf24" : "#60a5fa"} rgb={isDark ? "251,191,36" : "99,102,241"} delay={0.1} isDark={isDark} />
              <TestiCard quote="We matched on a Tuesday. Coffee on Saturday. Engaged eight months later."                 name="Nisha, 27" city="Mumbai"    accent={accentEmber} rgb={isDark ? "251,146,60" : "59,130,246"} delay={0.2} isDark={isDark} />
            </div>
          </div>
        </section>

        {/* ══════════════════════ SAFETY ═════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 px-4 sm:px-6" style={{ borderTop: sectionBorder }}>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <Reveal variant={slideLeft}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-5" style={{ color: accentColor }}>Safety first</p>
              <h2 className="text-[clamp(26px,4vw,46px)] leading-[1.15] font-black mb-5" style={{ color: txPrimary }}>
                Built for people
                <br />
                <span className="italic font-light" style={{ color: txMuted }}>who are careful.</span>
              </h2>
              <p className="text-[14px] sm:text-[15px] leading-relaxed font-light" style={{ color: txBody }}>
                Anonymity is the default, not a setting. Your identity only reveals when both of you say yes.
              </p>
            </Reveal>
            <Reveal variant={slideRight} delay={0.1}>
              <div className="flex flex-col gap-3.5">
                {safetyItems.map(({ Icon, label, desc, color, rgb }, k) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: k * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ x: 6, borderColor: `rgba(${rgb},0.3)`, boxShadow: `0 4px 20px rgba(${rgb},0.08)` }}
                    className="flex gap-4 items-start p-4 rounded-2xl cursor-default transition-all duration-200"
                    style={isDark
                      ? { background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.12)" }
                      : { background: "#ffffff",                border: "1px solid rgba(29,78,216,0.1)"  }
                    }
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.18)` }}>
                      <Icon size={17} color={color} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold mb-0.5" style={{ color: txPrimary }}>{label}</p>
                      <p className="text-[12px] leading-relaxed font-light" style={{ color: txBody }}>{desc}</p>
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
            <div className="w-[500px] h-[300px] rounded-full" style={{ background: isDark ? "rgba(249,115,22,0.1)" : "rgba(29,78,216,0.18)", filter: "blur(100px)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[200px] rounded-full translate-x-24 translate-y-8" style={{ background: isDark ? "rgba(251,191,36,0.07)" : "rgba(59,130,246,0.14)", filter: "blur(80px)" }} />
          </div>

          <Reveal>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7" style={badgeStyle2}>
              <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: accentEmber }} />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentEmber }}>Ready to begin?</span>
            </motion.div>

            <h2 className="text-[clamp(30px,6vw,68px)] leading-[1.06] font-black mb-5" style={{ color: txPrimary }}>
              The right person
              <br />
              <span className="italic font-light" style={{ color: txMuted, fontSize: "0.86em" }}>is writing right now.</span>
            </h2>

            <p className="text-[14px] mb-10 font-light" style={{ color: txBody }}>
              Join 10,000+ people who chose personality over photos.
            </p>

            <div className="flex flex-col items-center gap-3">
              <motion.button onClick={goToAuth}
                whileHover={{ scale: 1.04, boxShadow: `0 20px 50px ${accentColor}50` }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="text-sm sm:text-[15px] font-bold text-white rounded-full px-8 sm:px-14 py-4 sm:py-5 flex items-center gap-3 border-none cursor-pointer"
                style={{ background: ctaGradient, boxShadow: `0 8px 32px ${accentColor}35` }}>
                <Sparkles size={15} className="fill-white" />
                Create your profile — it's free
                <ArrowRight size={15} />
              </motion.button>
              <p className="text-[11px] font-light" style={{ color: txMuted }}>No credit card required · Takes 2 minutes</p>
            </div>
          </Reveal>
        </section>

        {/* ══════════════════════ FOOTER ══════════════════════════════════════════ */}
        <Footer isDark={isDark} />
      </div>
    </>
  );
}