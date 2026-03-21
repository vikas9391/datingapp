import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Sparkles, Check, Zap, Eye, MapPin, MessageCircle,
  Star, Flame, TrendingUp, Shield, Loader, AlertCircle,
  Ticket, X, CalendarDays, ArrowUpRight, BadgeCheck,
  RefreshCw, ChevronRight, PartyPopper, XCircle,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/TopBar";
import { useTheme } from "@/components/ThemeContext";
import { profileService, SubscriptionInfo } from "@/services/profileService";

const API_BASE = import.meta.env.VITE_API_BASE;

const ICON_MAP: { [key: string]: any } = {
  zap: Zap, flame: Flame, "trending-up": TrendingUp, crown: Crown,
  star: Star, eye: Eye, "map-pin": MapPin, "message-circle": MessageCircle, shield: Shield,
};

interface PremiumPlan {
  plan_id: string; name: string; duration: string; price: number;
  original_price?: number; price_per_month: number; discount_text?: string;
  icon: string; gradient: string; popular: boolean; features: string[];
  active: boolean; daily_swipe_limit: number | null; monthly_connection_limit: number | null;
}

interface PromoDiscount {
  code: string; discountPercentage: number; originalPrice: number;
  discountAmount: number; finalPrice: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getAuthToken = (): { token: string; type: "Bearer" | "Token" } | null => {
  const jwtKeys   = ["access_token", "accessToken", "jwt", "access"];
  const tokenKeys = ["token", "authToken", "auth_token", "admin_token"];
  for (const key of jwtKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: "Bearer" };
  }
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: "Token" };
  }
  return null;
};

// ─── Result Modal ─────────────────────────────────────────────────────────────
interface ResultModalProps {
  open: boolean; type: "success" | "error"; title: string; lines: string[];
  onClose: () => void; onAction?: () => void; actionLabel?: string; isDark: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({
  open, type, title, lines, onClose, onAction, actionLabel, isDark,
}) => {
  const modalBg     = isDark ? "#1c1c1c"                 : "#ffffff";
  const modalBorder = isDark ? "rgba(249,115,22,0.14)"   : "#f1f1f5";
  const txHead      = isDark ? "#f0e8de"                 : "#0f172a";
  const txBody      = isDark ? "#c4a882"                 : "#64748b";
  const closeCl     = isDark ? "#8a6540"                 : "#94a3b8";
  const closeHover  = isDark ? "rgba(249,115,22,0.08)"   : "#f1f5f9";
  const accentColor = isDark ? "#f97316"                 : "#1d4ed8";
  const accentEmber = isDark ? "#fb923c"                 : "#3b82f6";

  const successBg   = isDark ? "rgba(9,207,139,0.1)"     : "#f0fdf4";
  const errorBg     = isDark ? "rgba(244,63,94,0.1)"     : "#fff1f2";
  const successIcon = isDark ? "#09cf8b"                 : "#10b981";
  const errorIcon   = isDark ? "#f43f5e"                 : "#ef4444";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="rb"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="rm"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto"
              style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
            >
              <div className={`h-2 w-full`}
                style={{
                  background: type === "success"
                    ? "linear-gradient(135deg,#09cf8b,#02b2f6)"
                    : "linear-gradient(135deg,#f43f5e,#ef4444)"
                }}
              />
              <div className="px-8 pt-8 pb-6 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: type === "success" ? successBg : errorBg }}
                >
                  {type === "success"
                    ? <PartyPopper className="w-8 h-8" style={{ color: successIcon }} />
                    : <XCircle   className="w-8 h-8" style={{ color: errorIcon   }} />
                  }
                </div>
                <h2 className="text-xl font-black mb-3" style={{ color: txHead }}>{title}</h2>
                <div className="space-y-1.5 mb-6">
                  {lines.map((line, i) => (
                    <p key={i} className="text-sm font-medium" style={{ color: txBody }}>{line}</p>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {onAction && actionLabel && (
                    <button
                      onClick={() => { onClose(); onAction(); }}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                      style={{
                        background: type === "success"
                          ? "linear-gradient(135deg,#09cf8b,#02b2f6)"
                          : isDark ? "#1c1c1c" : "#0f172a",
                        boxShadow: type === "success" ? "0 8px 20px rgba(9,207,139,0.2)" : "none",
                      }}
                    >
                      {actionLabel}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-2xl font-semibold text-sm transition-colors"
                    style={{ color: closeCl }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = closeHover)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    {onAction ? "Stay here" : "Close"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Limit Badge ──────────────────────────────────────────────────────────────
const LimitBadge: React.FC<{
  icon: React.ReactNode; label: string; value: number | null;
  color: "teal" | "purple"; isDark: boolean;
}> = ({ icon, label, value, color, isDark }) => {
  const isUnlimited = value === null;
  const styles = {
    teal:   isDark
      ? `rgba(9,207,139,0.1) border border-[rgba(9,207,139,0.2)] text-[#09cf8b]`
      : `rgba(20,184,166,0.08) border border-teal-100 text-teal-700`,
    purple: isDark
      ? `rgba(167,139,250,0.1) border border-[rgba(167,139,250,0.2)] text-[#a78bfa]`
      : `rgba(139,92,246,0.08) border border-purple-100 text-purple-700`,
  };

  const colorClass = {
    teal:   isDark ? "text-[#09cf8b]"  : "text-teal-700",
    purple: isDark ? "text-[#a78bfa]"  : "text-purple-700",
  };
  const bgStyle = {
    teal:   isDark ? { background: "rgba(9,207,139,0.1)",   border: "1px solid rgba(9,207,139,0.2)"   } : { background: "rgba(20,184,166,0.08)",  border: "1px solid #99f6e4" },
    purple: isDark ? { background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" } : { background: "rgba(139,92,246,0.08)",   border: "1px solid #e9d5ff" },
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${colorClass[color]}`}
      style={bgStyle[color]}
    >
      {icon}
      {isUnlimited ? (
        <span className="flex items-center gap-1">
          <InfinityIcon className="w-3 h-3" /> {label}
        </span>
      ) : (
        <span>{value} {label}</span>
      )}
    </div>
  );
};

// ─── Promo Code Input ─────────────────────────────────────────────────────────
interface PromoCodeInputProps {
  selectedPlan: string; onPromoApplied: (d: PromoDiscount) => void; onPromoRemoved: () => void; isDark: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ selectedPlan, onPromoApplied, onPromoRemoved, isDark }) => {
  const [promoCode, setPromoCode]   = useState("");
  const [validating, setValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoDiscount | null>(null);
  const [error, setError]           = useState("");

  const inputBg     = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const inputBorder = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const txPrimary   = isDark ? "#f0e8de"                : "#1e293b";
  const txMuted     = isDark ? "#8a6540"                : "#94a3b8";
  const iconCl      = isDark ? "#8a6540"                : "#9ca3af";
  const applyBg     = isDark ? "rgba(249,115,22,0.12)"  : "#0f172a";
  const applyHoverBg = isDark ? "rgba(249,115,22,0.2)" : "#1e293b";
  const applyCl     = isDark ? "#f97316"                : "#ffffff";
  const cardBorder  = isDark ? "rgba(249,115,22,0.14)"  : "#e5e7eb";
  const cardBg      = isDark ? "#1c1c1c"                : "#ffffff";

  const successBg     = isDark ? "rgba(9,207,139,0.1)"    : "#f0fdf4";
  const successBorder = isDark ? "rgba(9,207,139,0.25)"   : "#bbf7d0";
  const successHead   = isDark ? "#09cf8b"                : "#14532d";
  const successBody   = isDark ? "#c4a882"                : "#166534";

  const validatePromo = async () => {
    if (!promoCode.trim()) { setError("Please enter a promo code"); return; }
    if (!selectedPlan)     { setError("Please select a plan first"); return; }
    setValidating(true);
    setError("");
    try {
      const authData = getAuthToken();
      if (!authData) { setError("Please log in to use promo codes."); return; }
      const response = await fetch(`${API_BASE}/api/promo/validate/`, {
        method: "POST",
        headers: { Authorization: `${authData.type} ${authData.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.toUpperCase().trim(), plan_id: selectedPlan }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        const originalPrice = parseFloat(data.promo_code.plan.original_price);
        const finalPrice    = parseFloat(data.promo_code.plan.final_price);
        const discount: PromoDiscount = {
          code: data.promo_code.code, discountPercentage: data.promo_code.discount_percentage,
          originalPrice, discountAmount: originalPrice - finalPrice, finalPrice,
        };
        setAppliedPromo(discount);
        onPromoApplied(discount);
        setPromoCode("");
        toast.success(`Promo applied! You save ₹${(originalPrice - finalPrice).toFixed(0)}`);
      } else {
        setError(data.message || "Invalid promo code");
      }
    } catch { setError("Failed to validate promo code."); }
    finally { setValidating(false); }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setError("");
    onPromoRemoved();
    toast.info("Promo code removed");
  };

  return (
    <div className="w-full">
      {appliedPromo ? (
        <div className="rounded-xl p-4 flex justify-between items-center shadow-sm"
          style={{ background: successBg, border: `1px solid ${successBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: isDark ? "rgba(9,207,139,0.15)" : "#dcfce7" }}>
              <Check className="w-4 h-4" strokeWidth={3} style={{ color: successHead }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: successHead }}>
                Code <span className="font-mono">{appliedPromo.code}</span> Applied!
              </p>
              <p className="text-xs font-medium mt-0.5" style={{ color: successBody }}>
                You save ₹{appliedPromo.discountAmount.toFixed(0)} ({appliedPromo.discountPercentage}%)
              </p>
            </div>
          </div>
          <button onClick={removePromo} className="p-2 rounded-full transition-colors"
            style={{ color: successHead }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(9,207,139,0.12)" : "#bbf7d0")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-xl p-1.5 flex items-center gap-2 transition-all"
          style={{ background: cardBg, border: `1px solid ${inputBorder}` }}
          onFocus={() => {}} // focus-ring via JS below
        >
          <div className="pl-3" style={{ color: iconCl }}><Ticket className="w-4 h-4" /></div>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && validatePromo()}
            placeholder="Enter Promo Code"
            className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm font-medium uppercase"
            style={{ color: txPrimary }}
          />
          <button
            onClick={validatePromo}
            disabled={validating || !promoCode.trim()}
            className="px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
            style={{ background: applyBg, color: applyCl }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = applyHoverBg)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = applyBg)}
          >
            {validating ? <Loader className="w-4 h-4 animate-spin" /> : "Apply"}
          </button>
        </div>
      )}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium pl-1" style={{ color: "#f43f5e" }}>
          <AlertCircle className="w-3 h-3" />{error}
        </div>
      )}
    </div>
  );
};

// ─── Current Plan Banner ──────────────────────────────────────────────────────
const CurrentPlanBanner: React.FC<{
  subscription: SubscriptionInfo; onUpgradeClick: () => void; isDark: boolean;
}> = ({ subscription, onUpgradeClick, isDark }) => {
  const expiryDate = subscription.expiresAt
    ? subscription.expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "No expiry";
  const urgentExpiry = subscription.daysRemaining !== Infinity && subscription.daysRemaining <= 7;
  const daysLabel = subscription.daysRemaining === Infinity ? "Lifetime" : `${subscription.daysRemaining} days remaining`;

  const bannerBg     = isDark
    ? "linear-gradient(145deg,#1a1007,#110b04)"
    : "linear-gradient(145deg,#0f172a,#1e293b)";
  const bannerBorder = isDark ? "rgba(249,115,22,0.25)" : "rgba(29,78,216,0.3)";
  const bannerShadow = isDark ? "0 24px 60px rgba(0,0,0,0.55)" : "0 24px 60px rgba(15,23,42,0.2)";

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-10">
      <div className="relative overflow-hidden rounded-[28px] p-px shadow-2xl"
        style={{ background: bannerBg, border: `1px solid ${bannerBorder}`, boxShadow: bannerShadow }}>
        <div className="absolute inset-0 rounded-[28px] opacity-20"
          style={{ background: isDark ? "radial-gradient(ellipse at 20% 50%, #f97316 0%, transparent 60%)" : "radial-gradient(ellipse at 20% 50%, #1d4ed8 0%, transparent 60%)" }} />
        <div className="relative rounded-[27px] overflow-hidden" style={{ background: isDark ? "#1a1007" : "#0f172a" }}>
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 8px 20px rgba(245,158,11,0.3)" }}>
                <Crown className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <BadgeCheck className="w-4 h-4" style={{ color: isDark ? "#09cf8b" : "#34d399" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "#09cf8b" : "#34d399" }}>Active Plan</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1 text-white">
                {subscription.planName || "Premium"}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}>
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Expires {expiryDate}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold`}
                  style={{ color: urgentExpiry ? "#f87171" : "#34d399" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: urgentExpiry ? "#f87171" : "#34d399" }} />
                  {daysLabel}
                </div>
              </div>
            </div>
            <button onClick={onUpgradeClick}
              className="shrink-0 flex items-center gap-2 border text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all group"
              style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")}
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Upgrade Plan
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
          <div className="px-6 md:px-8 pb-6">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
              <span>Plan started</span>
              <span>{urgentExpiry ? "⚠ Expiring soon" : "Time remaining"}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              {(() => {
                if (!subscription.activatedAt || !subscription.expiresAt)
                  return <div className="h-full w-full rounded-full" style={{ background: "linear-gradient(90deg,#09cf8b,#02b2f6)" }} />;
                const start = subscription.activatedAt.getTime();
                const end   = subscription.expiresAt.getTime();
                const pct   = Math.max(0, Math.min(100, ((Date.now() - start) / (end - start)) * 100));
                return (
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, background: urgentExpiry ? "#f87171" : "linear-gradient(90deg,#09cf8b,#02b2f6)" }} />
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const PremiumPage = ({ onLogout }: { onLogout?: () => void }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme() as any;

  const [plans, setPlans]             = useState<PremiumPlan[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null);
  const [userName, setUserName]       = useState("User");
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);
  const [showUpgradeSection, setShowUpgradeSection] = useState(false);
  const [processing, setProcessing]   = useState(false);

  const [resultModal, setResultModal] = useState<{
    open: boolean; type: "success" | "error"; title: string; lines: string[];
    action?: () => void; actionLabel?: string;
  }>({ open: false, type: "success", title: "", lines: [] });

  const showSuccess = (title: string, lines: string[], action?: () => void, actionLabel?: string) =>
    setResultModal({ open: true, type: "success", title, lines, action, actionLabel });
  const showError = (title: string, lines: string[]) =>
    setResultModal({ open: true, type: "error", title, lines });

  /* ─── Theme tokens ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#475569";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.04)";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ctaShadow    = isDark ? "0 8px 20px rgba(249,115,22,0.3)"         : "0 8px 20px rgba(29,78,216,0.25)";

  const badgeStyle = isDark
    ? { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)" }
    : { background: "rgba(29,78,216,0.08)",  border: "1px solid rgba(29,78,216,0.2)"  };

  const textGrad = isDark
    ? "linear-gradient(135deg,#fb923c,#fbbf24)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  const payBg = isDark ? "rgba(249,115,22,0.12)" : "#0f172a";
  const payHoverBg = isDark ? "rgba(249,115,22,0.2)" : "#1e293b";
  const payCl = isDark ? "#f97316" : "#ffffff";
  const payDisabledBg = isDark ? "rgba(249,115,22,0.05)" : "#e2e8f0";
  const payDisabledCl = isDark ? "#4a3520" : "#94a3b8";

  const featureBg   = isDark ? "rgba(249,115,22,0.06)"  : "#f0fdf4";
  const featureBd   = isDark ? "rgba(249,115,22,0.12)"  : "#bbf7d0";
  const featureIcon = isDark ? "rgba(249,115,22,0.12)"  : "#dcfce7";
  const featureIconCl = isDark ? "#f97316"              : "#16a34a";
  const checkIconCl = isDark ? "#f97316"                : "#059669";

  useEffect(() => { fetchPremiumData(); }, []);

  const fetchPremiumData = async () => {
    try {
      setLoading(true); setError(null);
      const [plansRes, profileResult] = await Promise.all([
        fetch(`${API_BASE}/api/admin/premium/plans/`),
        profileService.getProfile().catch(() => null),
      ]);
      if (!plansRes.ok) throw new Error("Failed to fetch plans");
      const plansData = await plansRes.json();
      const raw: any[] = Array.isArray(plansData) ? plansData : (plansData.results || []);
      const cleanPlans: PremiumPlan[] = raw.map((p) => ({
        ...p,
        price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
        original_price: p.original_price ? parseFloat(p.original_price) : undefined,
        price_per_month: typeof p.price_per_month === "string" ? parseFloat(p.price_per_month) : p.price_per_month,
        daily_swipe_limit: p.daily_swipe_limit ?? null,
        monthly_connection_limit: p.monthly_connection_limit ?? null,
      }));
      setPlans(cleanPlans);
      if (profileResult?.exists) {
        setUserName(profileResult.data?.firstName || "User");
        const sub = profileResult.subscription;
        if (sub?.isPremium && sub.isActive) { setCurrentSubscription(sub); setShowUpgradeSection(false); }
      }
      const currentPlanName = profileResult?.subscription?.planName;
      const popular  = cleanPlans.find((p) => p.popular && p.name !== currentPlanName);
      const fallback = cleanPlans.find((p) => p.active && p.name !== currentPlanName);
      const target   = popular || fallback || cleanPlans[0];
      if (target) setSelectedPlan(target.plan_id);
    } catch (err: any) {
      setError("Unable to load plans.");
    } finally { setLoading(false); }
  };

  const handlePurchase = async (planId: string) => {
    const authData = getAuthToken();
    if (!authData) { toast.error("Please log in first."); return; }
    setProcessing(true);
    try {
      const orderRes = await fetch(`${API_BASE}/api/create-order/`, {
        method: "POST",
        headers: { Authorization: `${authData.type} ${authData.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, promo_code: promoDiscount?.code || null }),
      });
      if (!orderRes.ok) { const d = await orderRes.json(); throw new Error(d.error || "Order creation failed"); }
      const order = await orderRes.json();
      if (order.free_activation) {
        setProcessing(false);
        showSuccess("Plan Activated! 🎉", [
          `Plan: ${order.plan.name}`, `Duration: ${order.plan.duration}`,
          `Expires: ${new Date(order.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
        ], () => navigate("/home"), "Go to Home");
        return;
      }
      const rzp = new (window as any).Razorpay({
        key: order.razorpay_key, amount: order.amount, currency: order.currency,
        order_id: order.order_id, name: "The Dating App",
        description: `${order.plan_name} - ${order.plan_duration}`,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify-payment/`, {
              method: "POST",
              headers: { Authorization: `${authData.type} ${authData.token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature, plan_id: planId,
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed");
            const verifyData = await verifyRes.json();
            toast.success("Payment successful!");
            showSuccess("Welcome to Premium! 🎉", [
              `Plan: ${verifyData.plan.name}`,
              `Expires: ${new Date(verifyData.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
              "Your new swipe and connection limits are now active.",
            ], () => navigate("/home"), "Start Swiping →");
          } catch {
            showError("Payment Verification Failed", [
              "Your payment may have been charged.",
              "Please contact support with your payment ID.",
              `Payment ID: ${response.razorpay_payment_id}`,
            ]);
          }
        },
        modal: { ondismiss: () => { setProcessing(false); toast.info("Payment cancelled"); } },
        theme: { color: isDark ? "#f97316" : "#1d4ed8" },
      });
      rzp.open();
    } catch (err) {
      setProcessing(false);
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      showError("Purchase Failed", [msg]); toast.error(msg);
    }
  };

  const upgradePlans = currentSubscription
    ? plans.filter((p) => p.name !== currentSubscription.planName && p.active)
    : plans;

  const isPremiumUser = !!currentSubscription;

  /* ─── Loading state ─── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 transition-colors duration-300" style={{ background: pageBg }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: ctaGradient, boxShadow: ctaShadow }}>
        <Loader className="w-6 h-6 text-white animate-spin" />
      </div>
      <p className="text-sm font-medium" style={{ color: txMuted }}>Loading plans...</p>
    </div>
  );

  /* ─── Error state ─── */
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-300" style={{ background: pageBg }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: isDark ? "rgba(244,63,94,0.1)" : "#fff1f2" }}>
        <AlertCircle className="w-8 h-8" style={{ color: "#f43f5e" }} />
      </div>
      <h2 className="text-xl font-bold mb-2" style={{ color: txPrimary }}>Unable to load plans</h2>
      <p className="mb-6 max-w-xs mx-auto text-sm" style={{ color: txMuted }}>{error}</p>
      <button onClick={fetchPremiumData}
        className="px-6 py-3 rounded-xl font-bold text-sm text-white"
        style={{ background: ctaGradient }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen font-sans pb-20 transition-colors duration-300" style={{ background: pageBg }}>
      {/* ambient bg */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse 70% 50% at 62% 36%, rgba(249,115,22,0.08) 0%, transparent 58%)" : "radial-gradient(ellipse 70% 50% at 62% 36%, rgba(29,78,216,0.08) 0%, transparent 58%)" }} />
        <div className="absolute top-[38%] -right-28 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse 55% 45% at 28% 70%, rgba(251,146,60,0.06) 0%, transparent 55%)" : "radial-gradient(ellipse 55% 45% at 28% 70%, rgba(59,130,246,0.07) 0%, transparent 55%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.07) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar userName={userName} onLogout={onLogout} />

      <ResultModal
        open={resultModal.open} type={resultModal.type} title={resultModal.title}
        lines={resultModal.lines} onClose={() => setResultModal((s) => ({ ...s, open: false }))}
        onAction={resultModal.action} actionLabel={resultModal.actionLabel} isDark={isDark}
      />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">

        {/* Current Plan Banner */}
        {isPremiumUser && currentSubscription && (
          <CurrentPlanBanner
            subscription={currentSubscription}
            onUpgradeClick={() => setShowUpgradeSection((v) => !v)}
            isDark={isDark}
          />
        )}

        {/* Hero */}
        <AnimatePresence mode="wait">
          {(!isPremiumUser || showUpgradeSection) && (
            <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={badgeStyle}>
                <Crown className="w-4 h-4" style={{ color: accentColor }} strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                  {isPremiumUser ? "Upgrade Your Plan" : "Premium Access"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: txPrimary }}>
                {isPremiumUser ? (
                  <>Switch to a{" "}
                    <span className="bg-clip-text text-transparent italic" style={{ backgroundImage: textGrad }}>Better Plan</span>
                  </>
                ) : (
                  <>Upgrade your{" "}<br className="md:hidden" />
                    <span className="bg-clip-text text-transparent italic" style={{ backgroundImage: textGrad }}>Love Life</span>
                  </>
                )}
              </h1>
              <p className="text-base md:text-lg leading-relaxed max-w-lg mx-auto" style={{ color: txBody }}>
                {isPremiumUser
                  ? "You're already premium! Switching plans will extend your current benefits."
                  : "Unlock exclusive features, see who likes you, and get 10x more matches."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium features (when active, not upgrading) */}
        {isPremiumUser && !showUpgradeSection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="rounded-[28px] p-8" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className="font-bold text-lg" style={{ color: txPrimary }}>Your Premium Features</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Eye, label: "See who liked you" },
                  { icon: Zap, label: "More swipes per day" },
                  { icon: MapPin, label: "Expand search radius" },
                  { icon: MessageCircle, label: "Priority messaging" },
                  { icon: TrendingUp, label: "Boost profile visibility" },
                  { icon: Shield, label: "Advanced privacy controls" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: featureBg, border: `1px solid ${featureBd}` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: featureIcon }}>
                      <Icon className="w-4 h-4" style={{ color: featureIconCl }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: txPrimary }}>{label}</span>
                    <Check className="w-3.5 h-3.5 ml-auto shrink-0" strokeWidth={3} style={{ color: checkIconCl }} />
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/home")}
                className="mt-6 w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: ctaGradient, boxShadow: ctaShadow }}>
                Back to Home <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <AnimatePresence>
          {(!isPremiumUser || showUpgradeSection) && (
            <motion.div key="plans" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-12">
                {upgradePlans.map((plan) => {
                  const isSelected    = selectedPlan === plan.plan_id;
                  const displayPrice  = promoDiscount && isSelected ? promoDiscount.finalPrice : plan.price;
                  const Icon          = ICON_MAP[plan.icon] || Star;
                  const selectedStyle = isDark
                    ? { background: "rgba(249,115,22,0.06)", border: "2px solid rgba(249,115,22,0.55)", boxShadow: "0 20px 48px rgba(249,115,22,0.12)" }
                    : { background: "#ffffff",               border: "2px solid #1d4ed8",               boxShadow: "0 20px 48px rgba(29,78,216,0.1)"   };
                  const normalStyle   = isDark
                    ? { background: "#1c1c1c", border: "1px solid rgba(249,115,22,0.14)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }
                    : { background: "#ffffff", border: "1px solid #f1f1f5",               boxShadow: "0 4px 24px rgba(0,0,0,0.04)" };
                  const priceCl       = isDark ? "#f0e8de" : "#111827";
                  const strikeCl      = isDark ? "#8a6540" : "#9ca3af";
                  const perMoCl       = isDark ? "#8a6540" : "#94a3b8";
                  const dividerCl     = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";
                  const featureIconSel = isSelected ? (isDark ? "rgba(249,115,22,0.15)" : "rgba(29,78,216,0.1)") : (isDark ? "rgba(255,255,255,0.05)" : "#f8fafc");
                  const featureIconClSel = isSelected ? accentColor : txMuted;
                  const popularBg = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
                  const discountBg = isDark ? "rgba(9,207,139,0.1)"  : "#f0fdf4";
                  const discountBd = isDark ? "rgba(9,207,139,0.25)" : "#bbf7d0";
                  const discountCl = isDark ? "#09cf8b"              : "#166534";

                  return (
                    <motion.div key={plan.plan_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }} onClick={() => setSelectedPlan(plan.plan_id)}
                      className="relative rounded-[32px] p-8 cursor-pointer transition-all duration-300 flex flex-col"
                      style={isSelected ? { ...selectedStyle, transform: "scale(1.02)" } : normalStyle}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5 text-white"
                          style={{ background: popularBg }}>
                          <Sparkles className="w-3 h-3 fill-current opacity-80" /> Most Popular
                        </div>
                      )}
                      {isPremiumUser && (
                        <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1 text-white"
                          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                          <ArrowUpRight className="w-3 h-3" /> Upgrade
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${plan.gradient || "bg-slate-100"} flex items-center justify-center text-white shadow-lg`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold leading-tight mb-1" style={{ color: txPrimary }}>{plan.name}</h3>
                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: txMuted }}>{plan.duration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-5">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-4xl font-black" style={{ color: priceCl }}>₹{Math.floor(displayPrice)}</span>
                          {(plan.original_price || (promoDiscount && isSelected)) && (
                            <span className="text-lg line-through font-medium decoration-2" style={{ color: strikeCl }}>₹{Math.floor(plan.price)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium" style={{ color: perMoCl }}>₹{Math.floor(plan.price_per_month)}/month</p>
                          {plan.discount_text && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: discountBg, border: `1px solid ${discountBd}`, color: discountCl }}>
                              {plan.discount_text}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Limit badges */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <LimitBadge icon={<Zap className="w-3 h-3" />} label="swipes/day"      value={plan.daily_swipe_limit}        color="teal"   isDark={isDark} />
                        <LimitBadge icon={<TrendingUp className="w-3 h-3" />} label="connections/mo" value={plan.monthly_connection_limit} color="purple" isDark={isDark} />
                      </div>

                      <div className="h-px mb-5" style={{ background: dividerCl }} />

                      {/* Features */}
                      <ul className="space-y-3.5 mb-8 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium" style={{ color: txBody }}>
                            <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: featureIconSel, color: featureIconClSel }}>
                              <Check className="w-3 h-3" strokeWidth={3.5} />
                            </div>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className="w-full py-3.5 rounded-xl font-bold text-base transition-all"
                        style={isSelected
                          ? { background: ctaGradient, color: "#ffffff", boxShadow: ctaShadow }
                          : { background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc", color: txMuted }
                        }
                      >
                        {isSelected ? (isPremiumUser ? "Switch to this Plan" : "Selected Plan") : "Choose Plan"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Promo + Pay */}
              <div className="max-w-md mx-auto space-y-6">
                <PromoCodeInput
                  selectedPlan={selectedPlan}
                  onPromoApplied={setPromoDiscount}
                  onPromoRemoved={() => setPromoDiscount(null)}
                  isDark={isDark}
                />

                <motion.button
                  onClick={() => handlePurchase(selectedPlan)}
                  disabled={!selectedPlan || processing}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                  style={selectedPlan && !processing
                    ? { background: ctaGradient, color: "#ffffff", boxShadow: ctaShadow }
                    : { background: payDisabledBg, color: payDisabledCl, cursor: "not-allowed" }
                  }
                >
                  {processing ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      <Crown className="w-5 h-5" style={{ color: selectedPlan ? "#fbbf24" : undefined, fill: selectedPlan ? "#fbbf24" : undefined }} />
                      {promoDiscount?.finalPrice === 0 ? "Activate Free Plan"
                        : isPremiumUser ? "Switch Plan & Pay"
                        : "Continue to Payment"}
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs font-medium px-8 leading-relaxed" style={{ color: txMuted }}>
                  {isPremiumUser
                    ? "Switching plans will replace your current subscription. Prorated credit may apply."
                    : "By continuing, you agree to our Terms of Service. Recurring billing, cancel anytime."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PremiumPage;