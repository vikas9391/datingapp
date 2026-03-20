import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Send, PenLine, Flame } from "lucide-react";

/* ---------------- COMPONENTS ---------------- */
import TopBar from "@/components/layout/TopBar";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import ReviewCarousel from "@/components/home/ReviewCarousel";
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";
import ExpertTipsBanner from "@/components/home/ExpertTipsBanner";
import MatchModal from "@/components/match/MatchModal";
import Footer from "@/components/layout/Footer";
import SwipePaywallModal from "@/components/home/Swipepaywallmodal";
import LockedDeckOverlay from "@/components/home/Lockeddeckoverlay";
import SwipeInfoModal from "@/components/home/SwipeInfoModal";

/* ---------------- SERVICES & TYPES ---------------- */
import { profileService } from "@/services/profileService";

const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE  = API_BASE.replace(/^http/, "ws");

interface MatchApiResponse {
  similarity: number;
  profile: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    bio?: string;
    conversation_starter?: string;
    interests: string[];
  };
}

export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface HomePageProps {
  onLogout?: () => void;
}

interface SwipeCountResponse {
  swipes_used: number;
  swipes_remaining: number | null;
  limit_reached: boolean;
  is_premium: boolean;
  daily_limit: number | null;
}

/* ---------------- CONSTANTS ---------------- */
const FREE_SWIPE_LIMIT      = 3;
const WELCOME_SHOWN_KEY     = "swipe_welcome_shown";
const LAST_SWIPE_WARNED_KEY = "last_swipe_warned";
const PAYWALL_SHOWN_KEY     = "swipe_paywall_shown";

/* ---------------- UTILS ---------------- */
const getRandomInterests = (interests: string[], count = 4) => {
  const shuffled = [...interests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, interests.length));
};

/* ---------------- SERVER-SIDE SWIPE HELPERS ---------------- */
const fetchSwipeStatus = async (): Promise<SwipeCountResponse> => {
  const defaultFree: SwipeCountResponse = {
    swipes_used: 0,
    swipes_remaining: FREE_SWIPE_LIMIT,
    limit_reached: false,
    is_premium: false,
    daily_limit: FREE_SWIPE_LIMIT,
  };
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return defaultFree;
    const res = await fetch(`${API_BASE}/api/profile/swipes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return defaultFree;
    const data = await res.json();
    return {
      swipes_used:      data.swipes_used      ?? 0,
      swipes_remaining: data.swipes_remaining  ?? FREE_SWIPE_LIMIT,
      limit_reached:    data.limit_reached     ?? false,
      is_premium:       data.is_premium        ?? false,
      daily_limit:      data.daily_limit       ?? FREE_SWIPE_LIMIT,
    };
  } catch {
    return defaultFree;
  }
};

const incrementSwipeCount = async (): Promise<{ swipes_used: number; limit_reached: boolean }> => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return { swipes_used: FREE_SWIPE_LIMIT, limit_reached: true };
    const res = await fetch(`${API_BASE}/api/profile/swipes/increment/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 403) return { swipes_used: FREE_SWIPE_LIMIT, limit_reached: true };
    if (!res.ok)            return { swipes_used: FREE_SWIPE_LIMIT, limit_reached: false };
    const data = await res.json();
    return {
      swipes_used:   data.swipes_used   ?? FREE_SWIPE_LIMIT,
      limit_reached: data.limit_reached ?? false,
    };
  } catch {
    return { swipes_used: FREE_SWIPE_LIMIT, limit_reached: false };
  }
};

/* ─────────────────────────────────────────────
   FLOATING EMBER PARTICLE
───────────────────────────────────────────── */
const EmberParticle = ({
  style,
  size = "sm",
}: {
  style: React.CSSProperties;
  size?: "sm" | "md" | "lg";
}) => {
  const dims = { sm: 6, md: 10, lg: 14 }[size];
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: dims,
        height: dims,
        background: "radial-gradient(circle, #fbbf24 0%, #f97316 60%, transparent 100%)",
        boxShadow: "0 0 6px 2px rgba(251,146,60,0.5)",
        opacity: 0,
        ...style,
        animation: `emberFloat ${(style as any).animationDuration ?? "4s"} ease-out infinite`,
        animationDelay: (style as any).animationDelay ?? "0s",
      }}
    />
  );
};

/* ─────────────────────────────────────────────
   ANIMATED STAT CARD
───────────────────────────────────────────── */
const AnimatedStat = ({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-4 md:p-8 text-center cursor-default"
      style={{
        background: "linear-gradient(145deg, #1e1810 0%, #130e06 100%)",
        border: "1px solid rgba(249,115,22,0.22)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.94)",
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {/* Hover radial glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl md:rounded-3xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.1) 0%, transparent 70%)" }}
      />
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)" }}
      />
      <div
        className="text-lg sm:text-2xl md:text-4xl font-black mb-1 md:mb-2 bg-clip-text text-transparent"
        style={{
          backgroundImage: "linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #f97316 100%)",
          transform: visible ? "scale(1)" : "scale(0.7)",
          transition: `transform 0.5s cubic-bezier(.34,1.56,.64,1) ${delay + 0.15}s`,
        }}
      >
        {value}
      </div>
      {/* HIGH-CONTRAST label — was orange-200/60 which was nearly invisible */}
      <div className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide" style={{ color: "#c2763a" }}>
        {label}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TYPEWRITER HOOK
───────────────────────────────────────────── */
const useTypewriter = (text: string, speed = 38, startDelay = 900) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text]);
  return { displayed, done };
};

/* ================= HOME PAGE ================= */
const HomePage = ({ onLogout }: HomePageProps) => {
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* -------- STATE -------- */
  const [profiles, setProfiles]               = useState<SwipeProfile[]>([]);
  const [loadingMatches, setLoadingMatches]   = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [userName, setUserName]               = useState("User");
  const [isPremium, setIsPremium]             = useState(false);
  const [swipesUsed, setSwipesUsed]           = useState<number>(0);
  const [dailyLimit, setDailyLimit]           = useState<number | null>(FREE_SWIPE_LIMIT);
  const [deckLocked, setDeckLocked]           = useState(false);
  const [showPaywall, setShowPaywall]         = useState(false);
  const [authLoading, setAuthLoading]         = useState(true);
  const [showInfoModal, setShowInfoModal]     = useState(false);
  const [infoModalMode, setInfoModalMode]     = useState<"welcome" | "last-swipe">("welcome");
  const [storyText, setStoryText]             = useState("");
  const [submittingStory, setSubmittingStory] = useState(false);
  const [justSubmitted, setJustSubmitted]     = useState(false);
  const [showMatchModal, setShowMatchModal]   = useState(false);
  const [matchProfile, setMatchProfile]       = useState<SwipeProfile | null>(null);
  const [matchChatId, setMatchChatId]         = useState<string | null>(null);
  const [highlightedEmail, setHighlightedEmail] = useState<string | null>(null);
  const [heroVisible, setHeroVisible]         = useState(false);
  const [likeAnimating, setLikeAnimating]     = useState(false);

  const paywallShownRef = useRef<boolean>(
    sessionStorage.getItem(PAYWALL_SHOWN_KEY) === "true"
  );
  const deckRef = useRef<HTMLDivElement>(null);
  const MAX_STORY_LENGTH = 500;

  const { displayed: subtitleText, done: subtitleDone } = useTypewriter(
    "Connect based on personality first. Authentic connections start here.",
    36,
    950
  );

  const triggerPaywall = () => {
    if (paywallShownRef.current) return;
    paywallShownRef.current = true;
    sessionStorage.setItem(PAYWALL_SHOWN_KEY, "true");
    setShowPaywall(true);
  };

  const swipesLeft = dailyLimit === null ? null : Math.max(0, dailyLimit - swipesUsed);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (highlight) {
      setHighlightedEmail(decodeURIComponent(highlight));
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (!highlightedEmail || loadingMatches || profiles.length === 0) return;
    const profileExists = profiles.some(
      (p) => p.id.toLowerCase() === highlightedEmail.toLowerCase()
    );
    setTimeout(() => {
      deckRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    if (profileExists) {
      const name = highlightedEmail.split("@")[0];
      toast(`🔥 ${name} liked you! Their card is up first — swipe to connect.`, { duration: 6000, icon: "❤️" });
      setProfiles((prev) => {
        const idx = prev.findIndex((p) => p.id.toLowerCase() === highlightedEmail.toLowerCase());
        if (idx <= 0) return prev;
        const copy = [...prev];
        const [item] = copy.splice(idx, 1);
        return [item, ...copy];
      });
    } else {
      toast("This person's profile isn't in your current deck. Check back soon!", { duration: 5000 });
    }
    setHighlightedEmail(null);
  }, [highlightedEmail, loadingMatches, profiles.length]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const result = await profileService.getProfile();
        if (result.exists && result.data) setUserName(result.data.firstName);
        const swipeStatus = await fetchSwipeStatus();
        setIsPremium(swipeStatus.is_premium);
        setSwipesUsed(swipeStatus.swipes_used);
        setDailyLimit(swipeStatus.daily_limit);
        const isUnlimitedPremium = swipeStatus.is_premium && swipeStatus.daily_limit === null;
        if (swipeStatus.limit_reached && !isUnlimitedPremium) setDeckLocked(true);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (isPremium) return;
    const alreadyShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!alreadyShown && swipesUsed < FREE_SWIPE_LIMIT) {
      const timer = setTimeout(() => {
        setInfoModalMode("welcome");
        setShowInfoModal(true);
        localStorage.setItem(WELCOME_SHOWN_KEY, "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPremium, swipesUsed]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token");
        const res = await fetch(`${API_BASE}/api/matches/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data: MatchApiResponse[] = await res.json();
        setProfiles(
          data.map((item) => ({
            id: item.profile.email || item.profile.username,
            firstName: item.profile.first_name,
            selfDescription: item.profile.bio || item.profile.first_name || "No description available",
            conversationHook: item.profile.conversation_starter || "Tell me about yourself!",
            vibeTags: getRandomInterests(item.profile.interests),
          }))
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "MATCH_CREATED") {
        try {
          const res = await fetch(`${API_BASE}/api/profile/${data.from_email}/`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          let profileData = { firstName: data.from_email.split("@")[0], tagline: "New Match!", interests: [] };
          if (res.ok) profileData = await res.json();
          setMatchProfile({
            id: data.from_email,
            firstName: profileData.firstName,
            selfDescription: profileData.tagline || "New Match!",
            conversationHook: "Say hello!",
            vibeTags: profileData.interests || [],
          });
          setMatchChatId(data.chat_id);
          setShowMatchModal(true);
          toast.success("It's a match! 🔥");
        } catch (e) { console.error(e); }
      }
      if (data.type === "LIKE_RECEIVED") {
        const name = data.from_email?.split("@")[0] ?? "Someone";
        toast(`🔥 ${name} liked your profile!`, {
          duration: 5000,
          action: {
            label: "View",
            onClick: () => navigate(`/home?highlight=${encodeURIComponent(data.from_email)}`),
          },
        });
      }
    };
    return () => ws.close();
  }, []);

  const handleSwipeAttempt = (): boolean => {
    if (isPremium && dailyLimit === null) return true;
    const limit = dailyLimit ?? FREE_SWIPE_LIMIT;
    if (swipesUsed >= limit) {
      setDeckLocked(true);
      if (!isPremium) triggerPaywall();
      else toast.error("Daily swipe limit reached. Resets tomorrow.");
      return false;
    }
    return true;
  };

  const maybeShowLastSwipeWarning = (newCount: number) => {
    if (isPremium) return;
    const limit = dailyLimit ?? FREE_SWIPE_LIMIT;
    const swipesLeftNow = limit - newCount;
    const alreadyWarned = localStorage.getItem(LAST_SWIPE_WARNED_KEY);
    if (swipesLeftNow === 1 && !alreadyWarned) {
      setTimeout(() => {
        setInfoModalMode("last-swipe");
        setShowInfoModal(true);
        localStorage.setItem(LAST_SWIPE_WARNED_KEY, "true");
      }, 500);
    }
  };

  const handleLike = async (profileId: string) => {
    if (!handleSwipeAttempt()) return;
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 700);
    const likedProfile = profiles.find((p) => p.id === profileId);
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    const { swipes_used: newCount, limit_reached } = await incrementSwipeCount();
    setSwipesUsed(newCount);
    maybeShowLastSwipeWarning(newCount);
    if (limit_reached) {
      setDeckLocked(true);
      if (!isPremium) setTimeout(() => triggerPaywall(), 400);
    }
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/like/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to_email: profileId }),
      });
      const data = await res.json();
      if (res.status === 403) {
        toast.error(data.error || "Connection limit reached for your plan this month.");
        return;
      }
      if (data.status === "matched") {
        setMatchProfile(likedProfile || null);
        setMatchChatId(data.chat_id);
        setShowMatchModal(true);
        toast.success("It's a match! 🔥");
      } else {
        toast.success("Like sent! 🔥");
      }
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleDislike = async (profileId: string) => {
    if (!handleSwipeAttempt()) return;
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    const { swipes_used: newCount, limit_reached } = await incrementSwipeCount();
    setSwipesUsed(newCount);
    maybeShowLastSwipeWarning(newCount);
    if (limit_reached) {
      setDeckLocked(true);
      if (!isPremium) setTimeout(() => triggerPaywall(), 400);
    }
  };

  const handleMatchComplete = () => {
    setShowMatchModal(false);
    setMatchProfile(null);
    setMatchChatId(null);
    navigate("/chats");
  };

  const handleSubmitStory = async () => {
    if (!storyText.trim()) return toast.error("Please write your story first!");
    if (storyText.trim().length < 50) return toast.error("Please write at least 50 characters");
    setSubmittingStory(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return toast.error("Please sign in");
      const res = await fetch(`${API_BASE}/api/reviews/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: storyText.trim(), rating: 5 }),
      });
      if (!res.ok) throw new Error("Submission failed");
      toast.success("Story submitted for approval! Thank you ❤️", { duration: 4000 });
      setStoryText("");
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 5000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit story.");
    } finally {
      setSubmittingStory(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ─────────────────────────────────────────
          GLOBAL ANIMATION KEYFRAMES + CSS TOKENS
      ───────────────────────────────────────── */}
      <style>{`
        /* ── Design tokens ──────────────────────────────────── */
        :root {
          --flame:          #f97316;
          --ember:          #fb923c;
          --amber:          #fbbf24;
          --coal:           #0d0d0d;
          --surface-1:      #141414;
          --surface-2:      #1c1c1c;
          --surface-3:      #242424;

          /* TEXT — all contrast-checked ≥4.5:1 on dark surfaces */
          --tx-primary:     #f0e8de;   /* headings, key text        */
          --tx-secondary:   #d4935a;   /* subheadings, accented     */
          --tx-body:        #c4a882;   /* body copy, descriptions   */
          --tx-muted:       #8a6540;   /* captions, hints           */
          --tx-disabled:    #4a3520;   /* placeholders              */
        }

        /* ── Ember particles ── */
        @keyframes emberFloat {
          0%   { transform: translateY(0)    translateX(0)   scale(1);   opacity: 0; }
          12%  { opacity: 0.9; }
          75%  { opacity: 0.4; }
          100% { transform: translateY(-150px) translateX(10px) scale(0.25); opacity: 0; }
        }

        /* ── Hero entrance ── */
        @keyframes heroLine {
          from { opacity: 0; transform: translateY(36px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }

        /* ── Animated gradient on username ── */
        @keyframes gradientPan {
          0%   { background-position: 0%   center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0%   center; }
        }

        /* ── Flame icon heartbeat ── */
        @keyframes flamePulse {
          0%,100% {
            filter: drop-shadow(0 0 5px #f97316) drop-shadow(0 0 14px rgba(234,88,12,.5));
            transform: scale(1) rotate(-3deg);
          }
          50% {
            filter: drop-shadow(0 0 12px #fb923c) drop-shadow(0 0 30px rgba(249,115,22,.5));
            transform: scale(1.1) rotate(3deg);
          }
        }

        /* ── Deck entrance ── */
        @keyframes deckIn {
          0%   { opacity: 0; transform: translateY(44px) scale(0.9) rotateX(6deg); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: translateY(0)    scale(1)   rotateX(0deg); }
        }

        /* ── Counter badge drop ── */
        @keyframes badgeDrop {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); }
          65%  { transform: translateX(-50%) translateY(3px)  scale(1.03); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
        }

        /* ── Active swipe dot ── */
        @keyframes dotGlow {
          0%,100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(251,146,60,.9); }
          50%     { transform: scale(1.3);  box-shadow: 0 0 0 5px rgba(251,146,60,0);  }
        }

        /* ── Card border glow ── */
        @keyframes borderBreath {
          0%,100% { box-shadow: 0 0 0px 0 rgba(249,115,22,0),   0 24px 56px rgba(0,0,0,.5); }
          50%     { box-shadow: 0 0 18px 2px rgba(249,115,22,.18), 0 24px 56px rgba(0,0,0,.5); }
        }

        /* ── Shimmer loading ── */
        @keyframes shimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }

        /* ── Like burst particles ── */
        @keyframes burstOut {
          0%   { transform: rotate(var(--angle)) translateX(0)   scale(1.2); opacity: 1; }
          100% { transform: rotate(var(--angle)) translateX(70px) scale(0);   opacity: 0; }
        }

        /* ── Orbiting spark ── */
        @keyframes orbit {
          0%   { transform: rotate(0deg)   translateX(110px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
        }

        /* ── Section scroll-in ── */
        @keyframes scrollReveal {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Cursor blink for typewriter ── */
        @keyframes blink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }

        /* ─────────── Utility classes ─────────── */
        .animate-flame     { animation: flamePulse 2.6s ease-in-out infinite; }
        .animate-deck      { animation: deckIn 0.85s cubic-bezier(.22,1,.36,1) 0.4s both; }
        .animate-badge     { animation: badgeDrop 0.55s cubic-bezier(.34,1.56,.64,1) both; }
        .dot-glow          { animation: dotGlow 1.6s ease-in-out infinite; }
        .border-breath     { animation: borderBreath 3.5s ease-in-out infinite; }
        .blink             { animation: blink 0.9s step-start infinite; }

        .shimmer-warm {
          background: linear-gradient(90deg, #1a1208 25%, #321a08 50%, #1a1208 75%);
          background-size: 700px 100%;
          animation: shimmer 1.7s infinite linear;
        }

        .burst-particle {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          animation: burstOut 0.65s cubic-bezier(.22,1,.36,1) forwards;
        }
      `}</style>

      <div className="min-h-screen pt-16 md:pt-20 overflow-x-hidden relative" style={{ background: "var(--coal)" }}>

        {/* ── LAYERED AMBIENT BACKGROUND ── */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(234,88,12,0.13) 0%, transparent 70%)" }} />
          <div className="absolute top-[38%] -right-28 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(251,146,60,0.09) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[720px] h-56"
            style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)" }} />
          {/* Subtle dot-grid texture */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(249,115,22,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.35,
          }} />
        </div>

        <TopBar userName={userName} onLogout={onLogout} />
        <SwipeInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} mode={infoModalMode} />
        <SwipePaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} swipesUsed={swipesUsed} />

        {showMatchModal && matchProfile && matchChatId && (
          <MatchModal profile={matchProfile} chatId={matchChatId} onComplete={handleMatchComplete} />
        )}

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">

          {/* ══════════════════════════════════════════════
              1. HERO
          ══════════════════════════════════════════════ */}
          <div className="relative text-center mb-10 md:mb-16 px-2">

            {/* Ember particles */}
            {heroVisible && (
              <>
                <EmberParticle size="sm" style={{ left:"10%", bottom:"0%",  animationDelay:"0s",   animationDuration:"3.8s" } as any} />
                <EmberParticle size="md" style={{ left:"22%", bottom:"4%",  animationDelay:"1.2s", animationDuration:"4.5s" } as any} />
                <EmberParticle size="sm" style={{ left:"38%", bottom:"1%",  animationDelay:"0.5s", animationDuration:"3.3s" } as any} />
                <EmberParticle size="lg" style={{ left:"54%", bottom:"7%",  animationDelay:"1.8s", animationDuration:"5.0s" } as any} />
                <EmberParticle size="sm" style={{ left:"68%", bottom:"2%",  animationDelay:"0.3s", animationDuration:"4.1s" } as any} />
                <EmberParticle size="md" style={{ left:"82%", bottom:"0%",  animationDelay:"2.1s", animationDuration:"3.6s" } as any} />
                <EmberParticle size="sm" style={{ left:"30%", bottom:"11%", animationDelay:"2.5s", animationDuration:"4.8s" } as any} />
                <EmberParticle size="sm" style={{ left:"62%", bottom:"9%",  animationDelay:"0.9s", animationDuration:"3.5s" } as any} />
              </>
            )}

            {/* Orbiting spark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
              <div className="w-2.5 h-2.5 rounded-full" style={{
                background: "radial-gradient(circle, #fbbf24, #f97316)",
                boxShadow: "0 0 10px 3px rgba(251,191,36,0.55)",
                animation: "orbit 14s linear infinite",
              }} />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
              {/* Line 1 */}
              <span
                className="block"
                style={{
                  color: "var(--tx-primary)",
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(36px)",
                  transition: "opacity 0.75s cubic-bezier(.22,1,.36,1) 0.1s, transform 0.75s cubic-bezier(.22,1,.36,1) 0.1s",
                }}
              >
                Find Your Vibe,
              </span>

              {/* Line 2 — username + flame */}
              <span
                className="inline-flex items-center gap-3 flex-wrap justify-center"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(36px)",
                  transition: "opacity 0.75s cubic-bezier(.22,1,.36,1) 0.32s, transform 0.75s cubic-bezier(.22,1,.36,1) 0.32s",
                }}
              >
                <span
                  className="font-black bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(270deg, #fbbf24 0%, #f97316 25%, #fb923c 50%, #fbbf24 75%, #f97316 100%)",
                    backgroundSize: "300% 100%",
                    animation: heroVisible ? "gradientPan 5s ease infinite" : "none",
                  }}
                >
                  {userName}
                </span>
                <Flame
                  className="w-8 h-8 md:w-12 md:h-12 animate-flame"
                  fill="currentColor"
                  style={{ color: "#f97316" }}
                />
              </span>
            </h1>

            {/* Typewriter subtitle */}
            <p
              className="text-sm sm:text-base md:text-xl max-w-2xl mx-auto leading-relaxed min-h-[1.8em]"
              style={{
                color: "var(--tx-body)",   /* was orange-100/60 — now #c4a882, clearly readable */
                opacity: heroVisible ? 1 : 0,
                transition: "opacity 0.7s cubic-bezier(.22,1,.36,1) 0.55s",
              }}
            >
              {subtitleText}
              {!subtitleDone && (
                <span
                  className="blink inline-block w-0.5 h-4 ml-0.5 align-middle rounded-sm"
                  style={{ background: "var(--flame)" }}
                />
              )}
            </p>
          </div>

          {/* ══════════════════════════════════════════════
              2. SWIPE DECK
          ══════════════════════════════════════════════ */}
          <div ref={deckRef} className="mb-12 md:mb-20 max-w-md md:max-w-4xl mx-auto w-full">
            <div className="relative animate-deck">

              {/* Deck ambient halo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[118%] h-[118%] -z-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(234,88,12,0.14) 0%, transparent 62%)", filter: "blur(28px)" }}
              />

              {/* Like burst */}
              {likeAnimating && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20" aria-hidden="true">
                  {[0,45,90,135,180,225,270,315].map((deg, i) => (
                    <div
                      key={deg}
                      className="burst-particle"
                      style={{
                        "--angle": `${deg}deg`,
                        background: i % 2 === 0 ? "#fbbf24" : "#f97316",
                        animationDelay: `${i * 0.025}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              )}

              {/* Swipe counter badge */}
              {!authLoading && !deckLocked && dailyLimit !== null && (
                <div className="absolute -top-5 left-1/2 z-10 animate-badge">
                  <div
                    className="flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg, #1e1208, #291606)",
                      border: "1px solid rgba(249,115,22,0.42)",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px rgba(249,115,22,0.08)",
                    }}
                  >
                    <span className="flex gap-1.5 items-center">
                      {Array.from({ length: Math.min(dailyLimit, 10) }).map((_, i) => (
                        <span
                          key={i}
                          className={i === swipesUsed ? "dot-glow" : ""}
                          style={{
                            display: "inline-block",
                            width: 8, height: 8,
                            borderRadius: "50%",
                            background: i < swipesUsed
                              ? "rgba(100,50,15,0.6)"
                              : i === swipesUsed
                              ? "#fb923c"
                              : "#f97316",
                            boxShadow: i >= swipesUsed ? "0 0 5px rgba(249,115,22,0.6)" : "none",
                            transition: "background 0.4s",
                          }}
                        />
                      ))}
                    </span>
                    {/* HIGH-CONTRAST badge text — was nearly invisible */}
                    <span style={{ color: "#e8a060" }}>
                      {swipesLeft === 1 ? "1 swipe left today" : `${swipesLeft} swipes left today`}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Loading state ── */}
              {loadingMatches ? (
                <div
                  className="flex flex-col items-center justify-center h-[420px] w-full rounded-[32px] md:rounded-[40px] p-4 overflow-hidden border-breath"
                  style={{
                    background: "linear-gradient(145deg, var(--surface-1), #110c05)",
                    border: "1px solid rgba(249,115,22,0.16)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                  }}
                >
                  <div className="w-28 h-28 rounded-full shimmer-warm mb-5" />
                  <div className="w-52 h-4  rounded-full shimmer-warm mb-3" />
                  <div className="w-36 h-3  rounded-full shimmer-warm mb-2 opacity-70" style={{ animationDelay: "0.2s" }} />
                  <div className="w-44 h-3  rounded-full shimmer-warm mb-8 opacity-45" style={{ animationDelay: "0.4s" }} />
                  {/* FIXED: was orange-300/50 ≈ invisible — now #c2763a */}
                  <p className="text-sm font-semibold" style={{ color: "#c2763a" }}>Kindling connections…</p>
                </div>

              ) : error ? (
                <div
                  className="text-center py-20 px-4 rounded-[32px] md:rounded-[40px] text-sm md:text-base"
                  style={{
                    background: "var(--surface-1)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.28)",
                  }}
                >
                  {error}
                </div>

              ) : profiles.length === 0 && !deckLocked ? (
                <div
                  className="flex flex-col items-center justify-center h-[420px] w-full text-center p-8 rounded-[32px] md:rounded-[40px] border-breath"
                  style={{
                    background: "linear-gradient(145deg, var(--surface-1), #110c05)",
                    border: "1px solid rgba(249,115,22,0.16)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                  }}
                >
                  <Flame
                    className="w-14 h-14 md:w-16 md:h-16 mb-4 animate-flame"
                    fill="currentColor"
                    style={{ color: "#7c3d12", opacity: 0.65 }}
                  />
                  {/* FIXED: crisp white heading */}
                  <h3 className="text-lg md:text-xl font-bold" style={{ color: "var(--tx-primary)" }}>
                    No more profiles
                  </h3>
                  {/* FIXED: was orange-200/40 ≈ invisible */}
                  <p className="text-xs md:text-sm mt-2 max-w-[200px] md:max-w-none" style={{ color: "var(--tx-body)" }}>
                    Check back later for more people nearby!
                  </p>
                </div>

              ) : (
                <div
                  className="relative transition-transform duration-300 hover:-translate-y-1.5"
                  style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.55))" }}
                >
                  <div className={deckLocked ? "pointer-events-none select-none" : ""}>
                    <AnonymousSwipeDeck profiles={profiles} onLike={handleLike} onDislike={handleDislike} />
                  </div>
                  {deckLocked && (
                    <LockedDeckOverlay
                      isPremium={isPremium}
                      onUnlockClick={() => {
                        if (isPremium) toast.error("Daily swipe limit reached. Come back tomorrow!");
                        else setShowPaywall(true);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              3. STATS
          ══════════════════════════════════════════════ */}
          <div className="grid grid-cols-3 gap-3 md:gap-8 mb-12 md:mb-16 max-w-4xl mx-auto px-2 md:px-0">
            {[
              { label: "Active Users", value: "10K+" },
              { label: "Matches Made", value: "50K+" },
              { label: "Success Rate", value: "92%"  },
            ].map((stat, i) => (
              <AnimatedStat key={i} value={stat.value} label={stat.label} delay={i * 0.14} />
            ))}
          </div>

          {/* ══════════════════════════════════════════════
              4. PROFILE COMPLETION
          ══════════════════════════════════════════════ */}
          <div className="max-w-3xl mx-auto mb-16 md:mb-20 px-2 md:px-0">
            <ProfileCompletion />
          </div>

          {/* ══════════════════════════════════════════════
              5. BANNERS
          ══════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto mb-16 px-2 md:px-0">
            <div className="h-full min-h-[180px]"><NearbyBanner /></div>
            <PremiumBanner />
          </div>

          {/* ══════════════════════════════════════════════
              6. EXPERT TIPS
          ══════════════════════════════════════════════ */}
          <div className="max-w-5xl mx-auto mb-16 sm:mb-20 px-2 md:px-0">
            <ExpertTipsBanner />
          </div>

          {/* ══════════════════════════════════════════════
              7. STORIES
          ══════════════════════════════════════════════ */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <ReviewCarousel />
          </div>

          {/* ══════════════════════════════════════════════
              8. WRITE YOUR STORY
          ══════════════════════════════════════════════ */}
          <div className="max-w-3xl mx-auto mb-16 sm:mb-24 px-4 md:px-0">
            <div
              className="relative rounded-[24px] md:rounded-[32px] p-6 md:p-10 overflow-hidden border-breath"
              style={{
                background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
                border: "1px solid rgba(249,115,22,0.22)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)",
              }}
            >
              {/* Decorative corner flame */}
              <Flame
                className="absolute top-4 right-4 md:top-6 md:right-6 w-20 h-20 md:w-28 md:h-28 -rotate-12 pointer-events-none animate-flame"
                fill="currentColor"
                style={{ color: "#f97316", opacity: 0.1 }}
              />
              {/* Bottom-right radial */}
              <div className="absolute bottom-0 right-0 w-60 h-60 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)" }} />
              {/* Top shimmer bar */}
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.45) 50%, transparent 92%)" }} />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(249,115,22,0.14)",
                      border: "1px solid rgba(249,115,22,0.35)",
                      boxShadow: "0 0 14px rgba(249,115,22,0.2)",
                    }}
                  >
                    <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" style={{ color: "#fb923c" }} />
                  </div>
                  {/* Bright heading — always readable */}
                  <h2 className="text-lg md:text-3xl font-black leading-tight" style={{ color: "var(--tx-primary)" }}>
                    Found your person?
                  </h2>
                </div>

                {/* FIXED: was orange-100/50 ≈ dim — now tx-body #c4a882 */}
                <p className="mb-6 text-xs md:text-base max-w-lg leading-relaxed" style={{ color: "var(--tx-body)" }}>
                  Share your success story! Once approved by our team, your story will be featured here to inspire others.
                </p>

                {justSubmitted && (
                  <div
                    className="mb-4 p-4 rounded-xl flex items-start gap-3"
                    style={{
                      background: "rgba(194,119,58,0.1)",
                      border: "1px solid rgba(249,115,22,0.32)",
                      animation: "scrollReveal 0.4s cubic-bezier(.22,1,.36,1) both",
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(249,115,22,0.18)" }}>
                      <Heart className="w-4 h-4 fill-current" style={{ color: "#fb923c" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-0.5" style={{ color: "#f5c07a" }}>
                        Story submitted! 🔥
                      </p>
                      {/* FIXED: was orange-300/60 ≈ dim */}
                      <p className="text-xs" style={{ color: "var(--tx-body)" }}>
                        Our team will review and feature it soon. Thank you for sharing!
                      </p>
                    </div>
                  </div>
                )}

                {/* Textarea wrapper */}
                <div
                  className="rounded-xl md:rounded-2xl p-2 transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(249,115,22,0.18)",
                  }}
                  onFocusCapture={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(249,115,22,0.55)";
                    el.style.boxShadow   = "0 0 28px rgba(249,115,22,0.12)";
                  }}
                  onBlurCapture={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(249,115,22,0.18)";
                    el.style.boxShadow   = "none";
                  }}
                >
                  <textarea
                    className="w-full p-3 md:p-4 rounded-lg md:rounded-xl outline-none min-h-[100px] md:min-h-[120px] bg-transparent resize-none text-sm md:text-base"
                    placeholder="Tell us how you met…"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    maxLength={MAX_STORY_LENGTH}
                    disabled={submittingStory}
                    style={{
                      color: "var(--tx-primary)",         /* FIXED: bright, fully legible */
                      caretColor: "var(--flame)",
                      /* placeholder color via style injection */
                    } as React.CSSProperties}
                  />
                  <div
                    className="flex items-center justify-between px-3 py-2"
                    style={{ borderTop: "1px solid rgba(249,115,22,0.1)" }}
                  >
                    {/* FIXED: was orange-900/60 which is near-black on dark = invisible */}
                    <span className="text-xs font-medium" style={{
                      color: storyText.length > MAX_STORY_LENGTH * 0.9 ? "#fb923c" : "var(--tx-muted)",
                    }}>
                      {storyText.length}/{MAX_STORY_LENGTH}
                      {storyText.length < 50 && storyText.length > 0 && (
                        <span className="ml-2" style={{ color: "#f87171" }}>(min. 50)</span>
                      )}
                    </span>
                    <button
                      onClick={handleSubmitStory}
                      disabled={submittingStory || !storyText.trim() || storyText.trim().length < 50}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
                        boxShadow: "0 4px 18px rgba(194,65,12,0.45)",
                        transition: "box-shadow 0.2s, transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 26px rgba(249,115,22,0.55)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(194,65,12,0.45)";
                      }}
                    >
                      {submittingStory ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>Submit Story <Send className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* FIXED: was orange-900/60 = nearly invisible dark brownish text */}
                <p className="text-[10px] md:text-xs mt-3 text-center" style={{ color: "var(--tx-muted)" }}>
                  By submitting, you agree to let us share your story on our platform. Stories are reviewed before being published.
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              9. SECURITY BANNER
          ══════════════════════════════════════════════ */}
          <div className="max-w-5xl mx-auto mb-12 sm:mb-16 px-2 md:px-0">
            <SecurityBanner />
          </div>

          {/* ══════════════════════════════════════════════
              10. FOOTER
          ══════════════════════════════════════════════ */}
          <Footer />
        </main>
      </div>
    </>
  );
};

export default HomePage;