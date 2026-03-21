import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, Lock, Eye, EyeOff, Trash2, LogOut,
  ChevronRight, Check, Mail, MapPin, Heart, Zap,
  Crown, ArrowLeft, Globe, AlertTriangle, RefreshCw,
  Sparkles, MessageCircle, X, BadgeCheck, Sun, Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import TopBar from "@/components/layout/TopBar";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE;
const API = `${API_BASE}/api`;

interface SettingsPageProps { onLogout?: () => void; }
interface UserData {
  firstName: string; username: string; phone: string; gender: string;
  location: string; joinDate: string; isPremium: boolean; isVerified: boolean;
  completionPercentage: number; matches: number; swipesUsed: number;
  distance: number; planName: string | null; daysRemaining: number;
}
interface NotifPrefs { matches: boolean; likes: boolean; messages: boolean; email: boolean; }
type PwStep = "send" | "verify" | "reset" | "done";

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled, isDark }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; isDark: boolean;
}) {
  const accentGrad = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const offBg = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";

  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: checked ? accentGrad : offBg }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, delay = 0, isDark }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number; isDark: boolean;
}) {
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f9fafb";
  const iconBg       = isDark
    ? "linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,146,60,0.08))"
    : "linear-gradient(135deg,rgba(29,78,216,0.1),rgba(59,130,246,0.08))";
  const labelColor   = isDark ? "#8a6540" : "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] overflow-hidden mb-4"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${dividerColor}` }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={14} style={{ color: accentColor }} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: labelColor }}>{title}</span>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────
function ToggleRow({ label, desc, value, onChange, icon: Icon, disabled, saving, isDark }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
  icon?: React.ElementType; disabled?: boolean; saving?: boolean; isDark: boolean;
}) {
  const txPrimary    = isDark ? "#f0e8de" : "#1f2937";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const iconCl       = isDark ? "#4a3520" : "#d1d5db";
  const dividerColor = isDark ? "rgba(249,115,22,0.06)" : "#f9fafb";
  const rowHover     = isDark ? "rgba(249,115,22,0.03)" : "rgba(0,0,0,0.01)";

  return (
    <div
      className="flex items-center justify-between px-6 py-4 transition-colors"
      style={{ borderBottom: `1px solid ${dividerColor}` }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = rowHover)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon size={15} className="flex-shrink-0" style={{ color: iconCl }} />}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-tight" style={{ color: txPrimary }}>{label}</p>
          {desc && <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: txMuted }}>{desc}</p>}
        </div>
      </div>
      <div className="ml-4 flex items-center gap-2">
        {saving && <RefreshCw size={12} className="animate-spin" style={{ color: txMuted }} />}
        <Toggle checked={value} onChange={onChange} disabled={disabled} isDark={isDark} />
      </div>
    </div>
  );
}

function NavRow({ label, desc, icon: Icon, onClick, badge, danger, value, isDark }: {
  label: string; desc?: string; icon?: React.ElementType; onClick: () => void;
  badge?: string; danger?: boolean; value?: string; isDark: boolean;
}) {
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const txPrimary    = isDark ? "#f0e8de" : "#1f2937";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const iconCl       = isDark ? "#4a3520" : "#d1d5db";
  const dividerColor = isDark ? "rgba(249,115,22,0.06)" : "#f9fafb";
  const rowHover     = isDark ? "rgba(249,115,22,0.03)" : "rgba(0,0,0,0.01)";
  const chevronCl    = isDark ? "#4a3520" : "#d1d5db";
  const chevronHov   = isDark ? "#8a6540" : "#9ca3af";
  const pillBg       = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.08)";

  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-between px-6 py-4 text-left group transition-colors"
      style={{ borderBottom: `1px solid ${dividerColor}` }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = rowHover)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon size={15} className="flex-shrink-0" style={{ color: danger ? "#f43f5e" : iconCl }} />}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-tight" style={{ color: danger ? "#f43f5e" : txPrimary }}>{label}</p>
          {desc && <p className="text-[11px] mt-0.5" style={{ color: txMuted }}>{desc}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {value && <span className="text-[12px] font-medium" style={{ color: txMuted }}>{value}</span>}
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: pillBg, color: accentColor }}>{badge}</span>
        )}
        <ChevronRight size={14} className="transition-colors" style={{ color: chevronCl }} />
      </div>
    </button>
  );
}

function StaticRow({ label, value, icon: Icon, isDark }: {
  label: string; value?: string; icon?: React.ElementType; isDark: boolean;
}) {
  const txPrimary    = isDark ? "#f0e8de" : "#1f2937";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const iconCl       = isDark ? "#4a3520" : "#d1d5db";
  const dividerColor = isDark ? "rgba(249,115,22,0.06)" : "#f9fafb";

  return (
    <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${dividerColor}` }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon size={15} className="flex-shrink-0" style={{ color: iconCl }} />}
        <p className="text-[14px] font-semibold leading-tight" style={{ color: txPrimary }}>{label}</p>
      </div>
      {value && <span className="text-[12px] font-medium ml-4" style={{ color: txMuted }}>{value}</span>}
    </div>
  );
}

// ─── Profile Skeleton ─────────────────────────────────────────────────────────
function ProfileSkeleton({ isDark }: { isDark: boolean }) {
  const cardBg     = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const shimmer1   = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const shimmer2   = isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6";
  const dividerCl  = isDark ? "rgba(249,115,22,0.08)"  : "#f9fafb";

  return (
    <div className="rounded-[28px] p-6 mb-6 animate-pulse"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex-shrink-0" style={{ background: shimmer1 }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-full w-32" style={{ background: shimmer1 }} />
          <div className="h-3 rounded-full w-48" style={{ background: shimmer2 }} />
          <div className="h-3 rounded-full w-24" style={{ background: shimmer2 }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${dividerCl}` }}>
        {[1, 2].map((i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-4 rounded-full w-8 mx-auto" style={{ background: shimmer1 }} />
            <div className="h-2.5 rounded-full w-14 mx-auto" style={{ background: shimmer2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Password Modal ───────────────────────────────────────────────────────────
function PasswordModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const userEmail = localStorage.getItem("user_email") ?? "";
  const [step, setStep]             = useState<PwStep>("send");
  const [otp, setOtp]               = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showCfm, setShowCfm]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const greenColor   = isDark ? "#09cf8b" : "#059669";
  const greenBg      = isDark ? "rgba(9,207,139,0.1)" : "#f0fdf4";
  const modalBg      = isDark ? "#1c1c1c" : "#ffffff";
  const modalBorder  = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const txHead       = isDark ? "#f0e8de" : "#111827";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const inputBg      = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const inputBorder  = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const inputFocus   = isDark ? "#f97316" : "#1d4ed8";
  const emailCardBg  = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const emailCardBd  = isDark ? "rgba(249,115,22,0.14)"  : "#e5e7eb";
  const resendCl     = accentColor;
  const backBtnBg    = isDark ? "rgba(249,115,22,0.08)"  : "#f3f4f6";
  const closeBtnBg   = isDark ? "rgba(249,115,22,0.08)"  : "#f3f4f6";

  const inputCls = `w-full h-11 px-4 rounded-xl text-[13px] outline-none transition-all`;
  const otpCls   = `w-full h-14 text-center text-[22px] font-black tracking-[0.35em] rounded-xl outline-none transition-all`;

  const inputStyle = { background: inputBg, border: `1px solid ${inputBorder}`, color: txHead };
  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = inputFocus);
  const blurBorder  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = inputBorder);

  const handleSendOtp = async () => {
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/password/forgot/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send code");
      setStep("verify");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API}/password/verify-otp/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid code");
      setResetToken(data.reset_token); setStep("reset");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(""); setOtp("");
    await fetch(`${API}/password/forgot/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail }) });
  };

  const handleReset = async () => {
    setError("");
    if (newPw !== confirmPw) { setError("Passwords don't match"); return; }
    if (newPw.length < 8)    { setError("Minimum 8 characters"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/password/reset/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, reset_token: resetToken, new_password: newPw, confirm_password: confirmPw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");
      setStep("done"); setTimeout(onClose, 1800);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const stepDots: PwStep[] = ["send", "verify", "reset"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
        style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
      >
        <div className="h-1.5 w-full" style={{ background: ctaGradient }} />
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {(step === "verify" || step === "reset") && (
                <button
                  onClick={() => { setStep(step === "reset" ? "verify" : "send"); setError(""); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center mr-1 transition-colors"
                  style={{ background: backBtnBg }}
                >
                  <ArrowLeft size={13} style={{ color: txMuted }} />
                </button>
              )}
              <h3 className="text-lg font-black" style={{ color: txHead }}>
                {step === "send" && "Change Password"}{step === "verify" && "Enter Code"}
                {step === "reset" && "New Password"}{step === "done" && "All Done!"}
              </h3>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: closeBtnBg, color: txMuted }}>
              <X size={14} />
            </button>
          </div>

          {step !== "done" && (
            <div className="flex items-center gap-1.5 mb-6">
              {stepDots.map((s, i) => (
                <div key={s} className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: step === s ? "20px" : "6px",
                    background: step === s ? accentColor : (stepDots.indexOf(step) > i ? "#09cf8b" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb")),
                  }} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "send" && (
              <motion.div key="send" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-[13px] leading-relaxed" style={{ color: txMuted }}>We'll send a 6-digit verification code to</p>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: emailCardBg, border: `1px solid ${emailCardBd}` }}>
                  <Mail size={14} className="flex-shrink-0" style={{ color: txMuted }} />
                  <span className="text-[13px] font-semibold truncate" style={{ color: txHead }}>{userEmail || "your email"}</span>
                </div>
                {error && <p className="text-[12px] text-rose-500 font-medium text-center">{error}</p>}
                <button onClick={handleSendOtp} disabled={loading}
                  className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: ctaGradient }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : "Send Verification Code"}
                </button>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div key="verify" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-[13px] leading-relaxed" style={{ color: txMuted }}>
                  Enter the 6-digit code sent to <span className="font-semibold" style={{ color: txHead }}>{userEmail}</span>
                </p>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={otpCls} placeholder="······" autoFocus
                  style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                {error && <p className="text-[12px] text-rose-500 font-medium text-center">{error}</p>}
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                  className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: ctaGradient }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Verifying…</> : "Verify Code"}
                </button>
                <button onClick={handleResend} className="w-full text-[12px] font-semibold text-center" style={{ color: resendCl }}>
                  Didn't get it? Resend code
                </button>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                {[
                  { label: "New Password", val: newPw, set: setNewPw, show: showPw, toggle: () => setShowPw(!showPw), placeholder: "Min. 8 characters", auto: true },
                  { label: "Confirm Password", val: confirmPw, set: setConfirmPw, show: showCfm, toggle: () => setShowCfm(!showCfm), placeholder: "Repeat password", auto: false },
                ].map(({ label, val, set, show, toggle, placeholder, auto }) => (
                  <div key={label} className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: txMuted }}>{label}</label>
                    <div className="relative">
                      <input type={show ? "text" : "password"} value={val}
                        onChange={(e) => set(e.target.value)}
                        className={`${inputCls} pr-10`} placeholder={placeholder}
                        autoFocus={auto} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                      <button type="button" onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: txMuted }}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
                {error && <p className="text-[12px] text-rose-500 font-medium text-center">{error}</p>}
                <button onClick={handleReset} disabled={loading || !newPw || !confirmPw}
                  className="w-full h-11 mt-1 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: ctaGradient }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : "Set New Password"}
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: greenBg }}>
                  <Check size={24} style={{ color: greenColor }} strokeWidth={3} />
                </div>
                <p className="font-black" style={{ color: txHead }}>Password Updated!</p>
                <p className="text-[12px] text-center" style={{ color: txMuted }}>Your password has been changed successfully.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const [typed, setTyped] = useState("");
  const confirmed = typed === "DELETE";

  const modalBg     = isDark ? "#1c1c1c"                : "#ffffff";
  const modalBorder = isDark ? "rgba(249,115,22,0.14)"  : "#f1f1f5";
  const txHead      = isDark ? "#f0e8de"                : "#111827";
  const txMuted     = isDark ? "#8a6540"                : "#9ca3af";
  const inputBg     = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const inputBorder = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const warnBg      = isDark ? "rgba(244,63,94,0.08)"   : "#fff1f2";
  const warnBd      = isDark ? "rgba(244,63,94,0.2)"    : "#fecdd3";
  const warnText    = isDark ? "#fca5a5"                : "#be123c";
  const closeBtnBg  = isDark ? "rgba(249,115,22,0.08)"  : "#f3f4f6";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
        style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
      >
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(135deg,#f43f5e,#ef4444)" }} />
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black" style={{ color: txHead }}>Delete Account</h3>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: closeBtnBg, color: txMuted }}>
              <X size={14} />
            </button>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: warnBg, border: `1px solid ${warnBd}` }}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#f43f5e" }} />
            <p className="text-[12px] leading-relaxed font-medium" style={{ color: warnText }}>
              This permanently deletes your account, matches, and all conversations. This cannot be undone.
            </p>
          </div>
          <div className="space-y-1 mb-4">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: txMuted }}>
              Type DELETE to confirm
            </label>
            <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              className="w-full h-11 px-4 rounded-xl text-[13px] font-mono outline-none transition-all"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: txHead }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f43f5e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = inputBorder)}
            />
          </div>
          <button disabled={!confirmed}
            className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#f43f5e,#ef4444)" }}>
            Delete My Account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useNotifPrefs() {
  const STORAGE_KEY = "settings_notif_prefs";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localFallback = (): NotifPrefs => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
    return { matches: true, likes: true, messages: true, email: false };
  };
  const [prefs, setPrefs]   = useState<NotifPrefs>(localFallback);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoaded(true); return; }
    fetch(`${API}/notifications/preferences/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((data: NotifPrefs) => { setPrefs(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); })
      .catch(() => {}).finally(() => setLoaded(true));
  }, []);

  const toggle = (key: keyof NotifPrefs) => (value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token"); if (!token) return;
      try { setSaving(true); await fetch(`${API}/notifications/preferences/`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ [key]: value }) }); }
      catch {} finally { setSaving(false); }
    }, 600);
  };
  return { prefs, toggle, saving, loaded };
}

function useOnlineStatus() {
  const STORAGE_KEY = "settings_show_online";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showOnline, setShowOnline] = useState<boolean>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s !== null ? JSON.parse(s) : true; } catch { return true; }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token"); if (!token) return;
    fetch(`${API}/privacy/preferences/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((data) => { const val = data?.show_online ?? true; setShowOnline(val); localStorage.setItem(STORAGE_KEY, JSON.stringify(val)); })
      .catch(() => {});
  }, []);

  const toggle = (value: boolean) => {
    setShowOnline(value); localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token"); if (!token) return;
      try { setSaving(true); await fetch(`${API}/privacy/preferences/`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ show_online: value }) }); }
      catch {} finally { setSaving(false); }
    }, 600);
  };
  return { showOnline, toggle, saving };
}

function calcCompletionPercentage(d: any): number {
  const steps = [
    !!(d.firstName?.trim() || d.first_name?.trim()) && !!(d.dateOfBirth || d.date_of_birth) && !!d.gender?.trim() && (d.interestedIn || d.interested_in || []).length > 0,
    typeof d.distance === "number" && d.distance > 0,
    !!d.drinking?.trim() && !!d.smoking?.trim() && !!d.workout?.trim() && !!d.pets?.trim(),
    (d.communicationStyle || d.communication_style || []).length > 0 && !!(d.responsePace || d.response_pace)?.trim(),
    (d.interests || []).length > 0, !!d.location?.trim(),
    !!d.bio?.trim() && d.bio.trim().split(/\s+/).filter(Boolean).length >= 10, true,
  ];
  return Math.min(100, Math.round((steps.filter(Boolean).length / steps.length) * 100));
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme, setIsDark } = useTheme() as any;
  const handleToggle = toggleTheme ?? (() => setIsDark?.((v: boolean) => !v));

  const [modal, setModal] = useState<"password" | "delete" | null>(null);
  const [userData, setUserData]       = useState<UserData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const { prefs: notifs, toggle: ntToggle, saving: notifSaving } = useNotifPrefs();
  const { showOnline, toggle: toggleOnline, saving: onlineSaving } = useOnlineStatus();

  /* ─── Theme tokens ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.04)";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f9fafb";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ctaShadow    = isDark ? "0 8px 18px rgba(249,115,22,0.35)" : "0 8px 18px rgba(29,78,216,0.28)";
  const statGrad     = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  const backBtnBg    = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const backBtnBd    = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const backBtnCl    = isDark ? "#c4a882"                : "#6b7280";

  const toggleStyle  = isDark
    ? { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.28)", color: "#fb923c" }
    : { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.22)", color: "#1d4ed8" };

  const progressBg   = isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6";
  const completionCl = isDark ? "#8a6540" : "#9ca3af";

  /* ─── Fetch unread count ─── */
  useEffect(() => {
    const token = localStorage.getItem("access_token"); if (!token) return;
    fetch(`${API}/notifications/unread-count/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null).then((d) => d && setUnreadNotifCount(d.unread_count ?? 0)).catch(() => {});
  }, []);

  /* ─── Fetch user profile ─── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await profileService.getProfile();
        if (!result.exists || !result.data) return;
        const d = result.data as any;
        const sub = result.subscription;
        const token = localStorage.getItem("access_token");
        let raw: any = {};
        if (token) {
          const res = await fetch(`${API}/profile/`, { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) { const json = await res.json(); raw = json.profile ?? json; }
        }
        const matchesCount = raw.matches_count ?? raw.match_count ?? raw.total_matches ?? raw.matches ?? d.matches ?? 0;
        const merged = { ...raw, ...d };
        setUserData({
          firstName: d.firstName || raw.first_name || "User",
          username: raw.username || raw.email || "",
          phone: raw.phone || "", gender: d.gender || raw.gender || "",
          location: d.location || raw.location || "",
          joinDate: raw.join_date ? new Date(raw.join_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "",
          isPremium: sub?.isPremium ?? raw.premium === true,
          isVerified: raw.verified === true,
          completionPercentage: calcCompletionPercentage(merged),
          matches: matchesCount, swipesUsed: raw.swipes_used ?? raw.swipe_count ?? 0,
          distance: d.distance ?? raw.distance ?? 25,
          planName: sub?.planName ?? null, daysRemaining: sub?.daysRemaining ?? 0,
        });
      } catch (err) { console.error("[Settings] load error", err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const initial = userData?.firstName?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ background: pageBg }}>
      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar userName={userData?.firstName ?? "User"} onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 pt-24 md:pt-28 pb-12">

        {/* ── Heading row ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all"
              style={{ background: backBtnBg, border: `1px solid ${backBtnBd}`, color: backBtnCl }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "#f9fafb")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = backBtnBg)}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-[22px] font-black tracking-tight" style={{ color: txPrimary }}>Settings</h1>
          </div>

          {/* Theme toggle */}
          <motion.button onClick={handleToggle}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={toggleStyle} aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={isDark ? "moon" : "sun"}
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
        </div>

        {/* ── Profile card ── */}
        {loading ? <ProfileSkeleton isDark={isDark} /> : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[28px] p-6 mb-6 overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
          >
            {/* decorative orb */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 -translate-y-10 translate-x-10"
              style={{ background: ctaGradient }} />

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
                  style={{ background: ctaGradient, boxShadow: ctaShadow }}>{initial}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-[17px] font-black leading-tight" style={{ color: txPrimary }}>{userData?.firstName}</p>
                  {userData?.isVerified && <BadgeCheck size={16} style={{ color: accentColor }} />}
                  {userData?.isPremium && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: isDark ? "rgba(245,158,11,0.12)" : "#fef3c7", border: isDark ? "1px solid rgba(245,158,11,0.25)" : "1px solid #fde68a" }}>
                      <Crown size={10} className="text-amber-500 fill-amber-500" />
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">Premium</span>
                    </span>
                  )}
                </div>
                <p className="text-[12px] font-medium truncate" style={{ color: txMuted }}>{userData?.username || "—"}</p>
                {userData?.joinDate && (
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: isDark ? "#4a3520" : "#d1d5db" }}>Joined {userData.joinDate}</p>
                )}
                {(userData?.completionPercentage ?? 0) < 100 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: progressBg }}>
                      <div className="h-full rounded-full" style={{ width: `${userData?.completionPercentage}%`, background: ctaGradient }} />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: completionCl }}>{userData?.completionPercentage}% complete</span>
                  </div>
                )}
              </div>
              <button onClick={() => navigate("/profile")}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-white hover:opacity-90 transition-opacity flex-shrink-0"
                style={{ background: ctaGradient, boxShadow: ctaShadow }}>
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${dividerColor}` }}>
              {[
                { label: "Matches",    value: userData?.matches    ?? 0, highlight: (userData?.matches ?? 0) > 0 },
                { label: "Swipes Used", value: userData?.swipesUsed ?? 0, highlight: false },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[16px] font-black leading-tight"
                    style={s.highlight ? { background: statGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: txPrimary }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: txMuted }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Premium upgrade banner ── */}
        {!loading && userData && !userData.isPremium && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate("/premium")}
            className="relative rounded-[24px] p-5 mb-6 overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
            style={{ background: isDark ? "linear-gradient(135deg,#1a0f00,#2a1500)" : "linear-gradient(135deg,#0f172a,#1e293b)", border: isDark ? "1px solid rgba(249,115,22,0.2)" : "none" }}
          >
            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-10">
              <Crown size={80} className="text-amber-400" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                <Crown size={22} className="text-white fill-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-[15px] leading-tight mb-0.5">Upgrade to Premium</p>
                <p className="text-[11px] font-medium" style={{ color: "#94a3b8" }}>Unlimited swipes · See who likes you</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Sparkles size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">Upgrade</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Premium active card ── */}
        {!loading && userData?.isPremium && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate("/premium")}
            className="relative rounded-[24px] p-5 mb-6 overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
            style={{ background: "linear-gradient(135deg,#92400e,#b45309)" }}
          >
            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-15">
              <Crown size={80} className="text-amber-300" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                <Crown size={22} className="text-white fill-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-[15px] leading-tight mb-0.5" style={{ color: "#fef3c7" }}>
                  {userData.planName ?? "Premium Member"} ✦
                </p>
                <p className="text-[11px] font-medium" style={{ color: "rgba(251,191,36,0.8)" }}>
                  {userData.daysRemaining === Infinity ? "Lifetime access" : `${userData.daysRemaining} days remaining · Tap to manage`}
                </p>
              </div>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full"
                style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.3)", color: "#fde68a" }}>
                ACTIVE
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Sections ── */}
        <Section title="Account" icon={User} delay={0.08} isDark={isDark}>
          <NavRow label="Edit Profile"    desc="Update your bio, interests and photo" icon={User}  onClick={() => navigate("/profile")} isDark={isDark} />
          <NavRow label="Change Password" desc="Update your login credentials"        icon={Lock}  onClick={() => setModal("password")} isDark={isDark} />
          {userData?.gender && <StaticRow label="Gender" value={userData.gender} icon={User} isDark={isDark} />}
          <NavRow label="Location" value={userData?.location || undefined} icon={MapPin} onClick={() => navigate("/profile")} isDark={isDark} />
        </Section>

        <Section title="Notifications" icon={Bell} delay={0.12} isDark={isDark}>
          <NavRow label="View All Notifications" desc="See your matches, likes and messages" icon={Bell}
            badge={unreadNotifCount > 0 ? `${unreadNotifCount} new` : undefined}
            onClick={() => navigate("/notifications")} isDark={isDark} />
          <ToggleRow label="New Matches"        desc="When you match with someone"        icon={Heart}          value={notifs.matches}  onChange={ntToggle("matches")}  saving={notifSaving} isDark={isDark} />
          <ToggleRow label="Profile Likes"      desc="When someone likes your profile"    icon={Zap}            value={notifs.likes}    onChange={ntToggle("likes")}    saving={notifSaving} isDark={isDark} />
          <ToggleRow label="Messages"           desc="New messages from matches"          icon={MessageCircle}  value={notifs.messages} onChange={ntToggle("messages")} saving={notifSaving} isDark={isDark} />
          <ToggleRow label="Email Notifications" desc="Receive occasional email digests"  icon={Mail}           value={notifs.email}    onChange={ntToggle("email")}    saving={notifSaving} isDark={isDark} />
        </Section>

        <Section title="Privacy & Safety" icon={Shield} delay={0.16} isDark={isDark}>
          <ToggleRow label="Show Online Status" desc="Let others see when you're active" icon={Eye} value={showOnline} onChange={toggleOnline} saving={onlineSaving} isDark={isDark} />
          <NavRow label="Blocked Users"  desc="Manage people you've blocked"  icon={Shield} onClick={() => navigate("/blocked-users")} isDark={isDark} />
          <NavRow label="Data & Privacy" desc="Download or delete your data"  icon={Shield} onClick={() => navigate("/data-privacy")}  isDark={isDark} />
        </Section>

        <Section title="Support" icon={MessageCircle} delay={0.24} isDark={isDark}>
          <NavRow label="Help Center"      desc="FAQs and guides"        icon={MessageCircle} onClick={() => navigate("/help")}    isDark={isDark} />
          <NavRow label="Contact Support"  desc="Get help from our team" icon={Mail}          onClick={() => navigate("/contact")} isDark={isDark} />
          <NavRow label="Terms of Service"                               icon={Globe}         onClick={() => navigate("/terms")}   isDark={isDark} />
          <NavRow label="Privacy Policy"                                 icon={Shield}        onClick={() => navigate("/privacy")} isDark={isDark} />
        </Section>

        <Section title="Account Actions" icon={AlertTriangle} delay={0.28} isDark={isDark}>
          <NavRow label="Log Out"        desc="Sign out of your account"                 icon={LogOut} onClick={() => onLogout?.()}        isDark={isDark} />
          <NavRow label="Delete Account" desc="Permanently remove your account and data" icon={Trash2} danger onClick={() => setModal("delete")} isDark={isDark} />
        </Section>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-[11px] font-medium mt-2 mb-6 flex items-center justify-center gap-1.5"
          style={{ color: isDark ? "#4a3520" : "#d1d5db" }}>
          The Dating App v1.0.0 · Made in Hyderabad
          <Heart size={10} color="#f43f5e" fill="#f43f5e" />
        </motion.p>
      </div>

      <AnimatePresence>
        {modal === "password" && <PasswordModal onClose={() => setModal(null)} isDark={isDark} />}
        {modal === "delete"   && <DeleteModal   onClose={() => setModal(null)} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}