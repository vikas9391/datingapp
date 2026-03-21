import { MessageCircle, Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface AnonymousProfile {
  id: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
  firstName?: string;
}

interface AnonymousProfileCardProps {
  profile?: AnonymousProfile;
}

/* ─── AVATAR GRADIENTS — orange/amber/ember palette (dark) & blue/teal (light) ─── */
const avatarVariantsDark = [
  "from-orange-500 to-amber-400",
  "from-orange-600 to-red-500",
  "from-amber-500 to-orange-400",
  "from-orange-400 to-yellow-400",
];

const avatarVariantsLight = [
  "from-blue-500 to-cyan-400",
  "from-sky-500 to-blue-400",
  "from-cyan-500 to-teal-400",
  "from-blue-400 to-sky-300",
];

const AnimatedAvatar = ({ index }: { index: number }) => {
  const { isDark } = useTheme();
  const safeIndex = typeof index === "number" && !isNaN(index) ? index : 0;
  const variants = isDark ? avatarVariantsDark : avatarVariantsLight;
  const gradient = variants[safeIndex % variants.length] || variants[0];

  return (
    <div className="relative group">
      {/* Glow halo */}
      <div
        className={cn(
          "absolute inset-0 rounded-[2.5rem] bg-gradient-to-br blur-2xl opacity-50 animate-pulse",
          gradient
        )}
      />

      <div
        className={cn(
          "relative h-28 w-28 md:h-36 md:w-36 rounded-[2.5rem] bg-gradient-to-br shadow-2xl flex items-center justify-center transform transition-transform duration-700 group-hover:scale-105",
          gradient
        )}
      >
        {/* Inner gloss */}
        <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] backdrop-blur-[1px]" />

        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white/90 drop-shadow-md" />

        {/* Online pill */}
        <div
          className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg border"
          style={isDark ? {
            background: "#1c1c1c",
            borderColor: "rgba(249,115,22,0.35)",
          } : {
            background: "#ffffff",
            borderColor: "rgba(29,78,216,0.35)",
          }}
        >
          <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: isDark ? "#fb923c" : "#1d4ed8" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5"
              style={{ background: isDark ? "#f97316" : "#1d4ed8" }}
            />
          </span>
          <span
            className="text-[10px] md:text-xs font-bold"
            style={{ color: isDark ? "#e8a060" : "#1d4ed8" }}
          >
            Online
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN CARD ─── */
const AnonymousProfileCard = ({ profile }: AnonymousProfileCardProps) => {
  const { isDark } = useTheme();

  if (!profile) return null;

  const {
    id = "0",
    selfDescription = "No description available.",
    vibeTags = [],
    conversationHook = "...",
    firstName = "Anonymous",
  } = profile;

  const colorIndex = id.length;

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    card: {
      background: "linear-gradient(145deg, #1a1a1a 0%, #141008 100%)",
      borderColor: "rgba(249,115,22,0.2)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.4) 50%, transparent 90%)",
    ambientGlow: "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 65%)",
    divider: { borderColor: "rgba(249,115,22,0.12)" },
    name: { color: "#f0e8de" },
    subLabel: { color: "#8a6540" },
    quoteIcon: { color: "rgba(249,115,22,0.25)" },
    bio: { color: "#c4a882" },
    tag: {
      background: "rgba(249,115,22,0.1)",
      border: "1px solid rgba(249,115,22,0.25)",
      color: "#d4935a",
    },
    hookBox: {
      background: "rgba(249,115,22,0.07)",
      borderColor: "rgba(249,115,22,0.2)",
    },
    hookIconWrap: {
      background: "rgba(249,115,22,0.15)",
      border: "1px solid rgba(249,115,22,0.3)",
    },
    hookIcon: { color: "#fb923c" },
    hookLabel: { color: "#f97316" },
    hookText: { color: "#e8c49a" },
  } : {
    card: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      borderColor: "rgba(29,78,216,0.2)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.4) 50%, transparent 90%)",
    ambientGlow: "radial-gradient(circle at top right, rgba(29,78,216,0.07) 0%, transparent 65%)",
    divider: { borderColor: "rgba(29,78,216,0.12)" },
    name: { color: "#1e293b" },
    subLabel: { color: "#64748b" },
    quoteIcon: { color: "rgba(29,78,216,0.25)" },
    bio: { color: "#475569" },
    tag: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.2)",
      color: "#1d4ed8",
    },
    hookBox: {
      background: "rgba(29,78,216,0.05)",
      borderColor: "rgba(29,78,216,0.15)",
    },
    hookIconWrap: {
      background: "rgba(29,78,216,0.1)",
      border: "1px solid rgba(29,78,216,0.25)",
    },
    hookIcon: { color: "#1d4ed8" },
    hookLabel: { color: "#1d4ed8" },
    hookText: { color: "#334155" },
  };

  return (
    <div
      className="relative w-full h-full rounded-[2.5rem] md:rounded-[40px] shadow-2xl border overflow-hidden p-6 md:p-8 select-none flex flex-col md:block transition-all duration-300"
      style={s.card}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: s.topAccent }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
        style={{ background: s.ambientGlow }}
      />

      <div className="h-full flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 relative z-10">

        {/* ── LEFT: Identity ── */}
        <div
          className="flex flex-col items-center justify-center pb-4 md:pb-0 md:pr-4 md:col-span-4 shrink-0 border-b md:border-b-0 md:border-r"
          style={s.divider}
        >
          <div className="mb-4 md:mb-6">
            <AnimatedAvatar index={colorIndex} />
          </div>
          <div className="text-center">
            <h3
              className="text-2xl md:text-3xl font-black tracking-tight"
              style={s.name}
            >
              {firstName}
            </h3>
            <p
              className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 md:mt-2"
              style={s.subLabel}
            >
              Based on vibes
            </p>
          </div>
        </div>

        {/* ── RIGHT: Content ── */}
        <div className="flex flex-col h-full md:col-span-8 min-h-0 justify-between">

          <div className="flex-1 flex flex-col justify-center overflow-y-auto space-y-4">

            {/* Bio */}
            <div className="relative pl-4 md:pl-6">
              <Quote
                className="absolute -top-1 md:-top-2 left-0 w-4 h-4 md:w-6 md:h-6 -scale-x-100"
                style={s.quoteIcon}
              />
              <p
                className="text-sm md:text-lg font-medium leading-relaxed italic pr-2"
                style={s.bio}
              >
                {selfDescription}
              </p>
            </div>

            {/* Vibe tags */}
            <div className="flex flex-wrap gap-2 pl-1">
              {vibeTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200"
                  style={s.tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Conversation starter */}
          <div
            className="mt-4 md:mt-auto rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 shrink-0 border transition-all duration-200"
            style={s.hookBox}
          >
            <div
              className="p-1.5 md:p-2 rounded-full shadow-sm shrink-0"
              style={s.hookIconWrap}
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" style={s.hookIcon} />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="block text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider mb-0.5 md:mb-1"
                style={s.hookLabel}
              >
                Conversation Starter
              </span>
              <p
                className="text-xs md:text-sm font-bold leading-snug truncate"
                style={s.hookText}
              >
                "{conversationHook}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousProfileCard;