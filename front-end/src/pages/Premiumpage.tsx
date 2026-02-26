import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  Eye,
  MapPin,
  MessageCircle,
  Star,
  Flame,
  TrendingUp,
  Shield,
  Loader,
  AlertCircle,
  Ticket,
  X,
  CalendarDays,
  ArrowUpRight,
  BadgeCheck,
  RefreshCw,
  ChevronRight,
  PartyPopper,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/layout/TopBar";
import { profileService, SubscriptionInfo } from "@/services/profileService";

// --- THEME CONSTANTS ---
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const TEXT_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B] bg-clip-text text-transparent";

const ICON_MAP: { [key: string]: any } = {
  zap: Zap, flame: Flame, "trending-up": TrendingUp, crown: Crown,
  star: Star, eye: Eye, "map-pin": MapPin, "message-circle": MessageCircle, shield: Shield,
};

interface PremiumPlan {
  plan_id: string;
  name: string;
  duration: string;
  price: number;
  original_price?: number;
  price_per_month: number;
  discount_text?: string;
  icon: string;
  gradient: string;
  popular: boolean;
  features: string[];
  active: boolean;
}

interface PromoDiscount {
  code: string;
  discountPercentage: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

// ─── Result Modal (success / error) ──────────────────────────────────────────
interface ResultModalProps {
  open: boolean;
  type: "success" | "error";
  title: string;
  lines: string[];
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const ResultModal: React.FC<ResultModalProps> = ({
  open, type, title, lines, onClose, onAction, actionLabel,
}) => (
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
            className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Coloured top strip */}
            <div className={`h-2 w-full ${type === "success"
              ? "bg-gradient-to-r from-teal-400 to-emerald-500"
              : "bg-gradient-to-r from-red-400 to-rose-500"}`}
            />

            <div className="px-8 pt-8 pb-6 text-center">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center
                ${type === "success" ? "bg-teal-50" : "bg-red-50"}`}>
                {type === "success"
                  ? <PartyPopper className="w-8 h-8 text-teal-500" />
                  : <XCircle className="w-8 h-8 text-red-500" />
                }
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-3">{title}</h2>

              <div className="space-y-1.5 mb-6">
                {lines.map((line, i) => (
                  <p key={i} className="text-sm text-slate-500 font-medium">{line}</p>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {onAction && actionLabel && (
                  <button
                    onClick={() => { onClose(); onAction(); }}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white
                      ${type === "success"
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20"
                        : "bg-slate-900"
                      }`}
                  >
                    {actionLabel}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
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

// --- HELPER: Get Token ---
const getAuthToken = (): { token: string; type: "Bearer" | "Token" } | null => {
  const jwtKeys = ["access_token", "accessToken", "jwt", "access"];
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

// --- PROMO CODE INPUT ---
interface PromoCodeInputProps {
  selectedPlan: string;
  onPromoApplied: (discount: PromoDiscount) => void;
  onPromoRemoved: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  selectedPlan, onPromoApplied, onPromoRemoved,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoDiscount | null>(null);
  const [error, setError] = useState("");

  const validatePromo = async () => {
    if (!promoCode.trim()) { setError("Please enter a promo code"); return; }
    if (!selectedPlan) { setError("Please select a plan first"); return; }
    setValidating(true);
    setError("");
    try {
      const authData = getAuthToken();
      if (!authData) { setError("Please log in to use promo codes."); return; }
      const response = await fetch("http://127.0.0.1:8000/api/promo/validate/", {
        method: "POST",
        headers: {
          Authorization: `${authData.type} ${authData.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: promoCode.toUpperCase().trim(), plan_id: selectedPlan }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        const originalPrice = parseFloat(data.promo_code.plan.original_price);
        const finalPrice = parseFloat(data.promo_code.plan.final_price);
        const discount: PromoDiscount = {
          code: data.promo_code.code,
          discountPercentage: data.promo_code.discount_percentage,
          originalPrice,
          discountAmount: originalPrice - finalPrice,
          finalPrice,
        };
        setAppliedPromo(discount);
        onPromoApplied(discount);
        setPromoCode("");
        toast.success(`Promo code applied! You save ₹${(originalPrice - finalPrice).toFixed(0)}`);
      } else {
        setError(data.message || "Invalid promo code");
      }
    } catch {
      setError("Failed to validate promo code.");
    } finally {
      setValidating(false);
    }
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
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
            </div>
            <div>
              <p className="text-emerald-900 font-bold text-sm">
                Code <span className="font-mono">{appliedPromo.code}</span> Applied!
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                You save ₹{appliedPromo.discountAmount.toFixed(0)} ({appliedPromo.discountPercentage}%)
              </p>
            </div>
          </div>
          <button onClick={removePromo} className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 p-2 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm flex items-center gap-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
          <div className="pl-3 text-gray-400"><Ticket className="w-4 h-4" /></div>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && validatePromo()}
            placeholder="Enter Promo Code"
            className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 uppercase"
          />
          <button
            onClick={validatePromo}
            disabled={validating || !promoCode.trim()}
            className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            {validating ? <Loader className="w-4 h-4 animate-spin" /> : "Apply"}
          </button>
        </div>
      )}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-medium pl-1">
          <AlertCircle className="w-3 h-3" />{error}
        </div>
      )}
    </div>
  );
};

// --- CURRENT PLAN BANNER ---
const CurrentPlanBanner: React.FC<{
  subscription: SubscriptionInfo;
  onUpgradeClick: () => void;
}> = ({ subscription, onUpgradeClick }) => {
  const expiryDate = subscription.expiresAt
    ? subscription.expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "No expiry";
  const urgentExpiry = subscription.daysRemaining !== Infinity && subscription.daysRemaining <= 7;
  const daysLabel = subscription.daysRemaining === Infinity ? "Lifetime" : `${subscription.daysRemaining} days remaining`;

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-10">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-px shadow-2xl">
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-teal-500/30 via-blue-500/20 to-emerald-500/30 blur-sm" />
        <div className="relative rounded-[27px] bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`, backgroundSize: "40px 40px" }}
          />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Crown className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <BadgeCheck className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Active Plan</span>
              </div>
              <h2 className="text-white text-xl md:text-2xl font-black tracking-tight mb-1">
                {subscription.planName || "Premium"}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Expires {expiryDate}</span>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${urgentExpiry ? "text-red-400" : "text-emerald-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${urgentExpiry ? "bg-red-400" : "bg-emerald-400"} animate-pulse`} />
                  {daysLabel}
                </div>
              </div>
            </div>
            <button
              onClick={onUpgradeClick}
              className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all group"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Upgrade Plan
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>
          <div className="px-6 md:px-8 pb-6">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>Plan started</span>
              <span>{urgentExpiry ? "⚠ Expiring soon" : "Time remaining"}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              {(() => {
                if (!subscription.activatedAt || !subscription.expiresAt) return (
                  <div className="h-full w-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full" />
                );
                const start = subscription.activatedAt.getTime();
                const end = subscription.expiresAt.getTime();
                const pct = Math.max(0, Math.min(100, ((Date.now() - start) / (end - start)) * 100));
                return (
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${urgentExpiry ? "bg-red-500" : "bg-gradient-to-r from-teal-500 to-emerald-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE ---
interface PremiumPageProps {
  onLogout?: () => void;
}

const PremiumPage = ({ onLogout }: PremiumPageProps) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null);
  const [userName, setUserName] = useState("User");
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);
  const [showUpgradeSection, setShowUpgradeSection] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ── Result modal state
  const [resultModal, setResultModal] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    lines: string[];
    action?: () => void;
    actionLabel?: string;
  }>({ open: false, type: "success", title: "", lines: [] });

  const showSuccess = (title: string, lines: string[], action?: () => void, actionLabel?: string) => {
    setResultModal({ open: true, type: "success", title, lines, action, actionLabel });
  };

  const showError = (title: string, lines: string[]) => {
    setResultModal({ open: true, type: "error", title, lines });
  };

  useEffect(() => { fetchPremiumData(); }, []);

  const fetchPremiumData = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = "http://127.0.0.1:8000/api";

      const [plansRes, profileResult] = await Promise.all([
        fetch(`${baseUrl}/admin/premium/plans/`),
        profileService.getProfile().catch(() => null),
      ]);

      if (!plansRes.ok) throw new Error("Failed to fetch plans");

      const plansData = await plansRes.json();
      const cleanPlans: PremiumPlan[] = Array.isArray(plansData) ? plansData : (plansData.results || []);
      setPlans(cleanPlans);

      if (profileResult?.exists) {
        setUserName(profileResult.data?.firstName || "User");
        const sub = profileResult.subscription;
        if (sub && sub.isPremium && sub.isActive) {
          setCurrentSubscription(sub);
          setShowUpgradeSection(false);
        }
      }

      const currentPlanName = profileResult?.subscription?.planName;
      const popular = cleanPlans.find((p) => p.popular && p.name !== currentPlanName);
      const fallback = cleanPlans.find((p) => p.active && p.name !== currentPlanName);
      const target = popular || fallback || cleanPlans[0];
      if (target) setSelectedPlan(target.plan_id);

    } catch (err: any) {
      console.error("Error:", err);
      setError("Unable to load plans.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    const authData = getAuthToken();
    if (!authData) {
      toast.error("Please log in first.");
      return;
    }

    setProcessing(true);

    try {
      const orderRes = await fetch("http://127.0.0.1:8000/api/create-order/", {
        method: "POST",
        headers: {
          Authorization: `${authData.type} ${authData.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan_id: planId, promo_code: promoDiscount?.code || null }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Order creation failed");
      }

      const order = await orderRes.json();

      // ── Free plan activation (100% promo discount)
      if (order.free_activation) {
        setProcessing(false);
        showSuccess(
          "Plan Activated! 🎉",
          [
            `Plan: ${order.plan.name}`,
            `Duration: ${order.plan.duration}`,
            `Expires: ${new Date(order.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
          ],
          () => navigate("/home"),
          "Go to Home"
        );
        return;
      }

      // ── Razorpay payment flow
      const rzp = new (window as any).Razorpay({
        key: order.razorpay_key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "The Dating App",
        description: `${order.plan_name} - ${order.plan_duration}`,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("http://127.0.0.1:8000/api/verify/", {
              method: "POST",
              headers: {
                Authorization: `${authData.type} ${authData.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");
            const verifyData = await verifyRes.json();

            toast.success("Payment successful!");
            showSuccess(
              "Welcome to Premium! 🎉",
              [
                `Plan: ${verifyData.plan.name}`,
                `Expires: ${new Date(verifyData.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
                "You now have unlimited swipes and all premium features.",
              ],
              () => navigate("/home"),
              "Start Swiping →"
            );
          } catch {
            showError(
              "Payment Verification Failed",
              ["Your payment may have been charged.", "Please contact support with your payment ID.", `Payment ID: ${response.razorpay_payment_id}`]
            );
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info("Payment cancelled");
          },
        },
        theme: { color: "#00B4D8" },
      });

      rzp.open();

    } catch (err) {
      setProcessing(false);
      const msg = err instanceof Error ? err.message : "Something went wrong. Try again.";
      showError("Purchase Failed", [msg]);
      toast.error(msg);
    }
  };

  const upgradePlans = currentSubscription
    ? plans.filter((p) => p.name !== currentSubscription.planName && p.active)
    : plans;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader className="w-8 h-8 text-teal-500 animate-spin" />
      <p className="text-sm font-medium text-gray-400">Loading plans...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load plans</h2>
      <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">{error}</p>
      <button onClick={fetchPremiumData} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Try Again</button>
    </div>
  );

  const isPremiumUser = !!currentSubscription;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      <TopBar userName={userName} onLogout={onLogout} />

      {/* ── Result Modal ── */}
      <ResultModal
        open={resultModal.open}
        type={resultModal.type}
        title={resultModal.title}
        lines={resultModal.lines}
        onClose={() => setResultModal((s) => ({ ...s, open: false }))}
        onAction={resultModal.action}
        actionLabel={resultModal.actionLabel}
      />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">

        {/* ── CURRENT PLAN BANNER ── */}
        {isPremiumUser && currentSubscription && (
          <CurrentPlanBanner
            subscription={currentSubscription}
            onUpgradeClick={() => setShowUpgradeSection((v) => !v)}
          />
        )}

        {/* ── HERO ── */}
        <AnimatePresence mode="wait">
          {(!isPremiumUser || showUpgradeSection) && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-full mb-6">
                <Crown className="w-4 h-4 text-teal-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  {isPremiumUser ? "Upgrade Your Plan" : "Premium Access"}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                {isPremiumUser ? (
                  <>Switch to a <span className={TEXT_GRADIENT}>Better Plan</span></>
                ) : (
                  <>Upgrade your <br className="md:hidden" /><span className={TEXT_GRADIENT}>Love Life</span></>
                )}
              </h1>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                {isPremiumUser
                  ? "You're already premium! Switching plans will extend your current benefits."
                  : "Unlock exclusive features, see who likes you, and get 10x more matches."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PREMIUM USER: features already unlocked ── */}
        {isPremiumUser && !showUpgradeSection && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <h3 className="text-slate-900 font-bold text-lg">Your Premium Features</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Eye, label: "See who liked you" },
                  { icon: Zap, label: "Unlimited swipes" },
                  { icon: MapPin, label: "Expand search radius" },
                  { icon: MessageCircle, label: "Priority messaging" },
                  { icon: TrendingUp, label: "Boost profile visibility" },
                  { icon: Shield, label: "Advanced privacy controls" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-teal-50/60 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <Check className="w-3.5 h-3.5 text-teal-500 ml-auto shrink-0" strokeWidth={3} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/home")}
                className="mt-6 w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                Back to Home <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PLANS GRID ── */}
        <AnimatePresence>
          {(!isPremiumUser || showUpgradeSection) && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-12">
                {upgradePlans.map((plan) => {
                  const isSelected = selectedPlan === plan.plan_id;
                  const displayPrice = promoDiscount && isSelected ? promoDiscount.finalPrice : plan.price;
                  const Icon = ICON_MAP[plan.icon] || Star;

                  return (
                    <motion.div
                      key={plan.plan_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPlan(plan.plan_id)}
                      className={`
                        relative bg-white rounded-[32px] p-8 cursor-pointer transition-all duration-300 flex flex-col
                        ${isSelected
                          ? "shadow-[0_20px_40px_-12px_rgba(13,148,136,0.15)] ring-2 ring-teal-500 z-10 scale-[1.02]"
                          : "shadow-sm border border-gray-100 hover:border-teal-100 hover:shadow-md"
                        }
                      `}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-yellow-200 fill-current" />
                          Most Popular
                        </div>
                      )}

                      {isPremiumUser && (
                        <div className="absolute -top-3 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          Upgrade
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${plan.gradient || "bg-slate-100"} flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{plan.name}</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{plan.duration}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-4xl font-black text-slate-900">₹{Math.floor(displayPrice)}</span>
                          {(plan.original_price || (promoDiscount && isSelected)) && (
                            <span className="text-lg text-slate-400 line-through font-medium decoration-2">₹{Math.floor(plan.price)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-slate-500 font-medium">₹{Math.floor(plan.price_per_month)}/month</p>
                          {plan.discount_text && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              {plan.discount_text}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 mb-6" />

                      <ul className="space-y-4 mb-8 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-300"}`}>
                              <Check className="w-3 h-3" strokeWidth={3.5} />
                            </div>
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`
                          w-full py-6 rounded-xl font-bold text-base transition-all shadow-none
                          ${isSelected
                            ? `${PRIMARY_GRADIENT} text-white shadow-lg shadow-teal-500/20 hover:opacity-90`
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          }
                        `}
                      >
                        {isSelected ? (isPremiumUser ? "Switch to this Plan" : "Selected Plan") : "Choose Plan"}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer: promo + pay button */}
              <div className="max-w-md mx-auto space-y-6">
                <PromoCodeInput
                  selectedPlan={selectedPlan}
                  onPromoApplied={setPromoDiscount}
                  onPromoRemoved={() => setPromoDiscount(null)}
                />

                <motion.button
                  onClick={() => handlePurchase(selectedPlan)}
                  disabled={!selectedPlan || processing}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all
                    ${selectedPlan && !processing
                      ? "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  {processing ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      <Crown className={`w-5 h-5 ${selectedPlan ? "text-yellow-400 fill-yellow-400" : ""}`} />
                      {promoDiscount && promoDiscount.finalPrice === 0
                        ? "Activate Free Plan"
                        : isPremiumUser
                        ? "Switch Plan & Pay"
                        : "Continue to Payment"
                      }
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-slate-400 font-medium px-8 leading-relaxed">
                  {isPremiumUser
                    ? "Switching plans will replace your current subscription. Prorated credit may apply."
                    : "By continuing, you agree to our Terms of Service. Recurring billing, cancel anytime."
                  }
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