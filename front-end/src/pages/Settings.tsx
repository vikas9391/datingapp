import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, Lock, Eye, EyeOff, Trash2, LogOut,
  ChevronRight, Check, Mail, MapPin, Heart, Zap,
  Crown, ArrowLeft, Globe,
  AlertTriangle, RefreshCw, Sparkles, MessageCircle, X, BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import TopBar from "@/components/layout/TopBar";

// ─── Design tokens ────────────────────────────────────────────────────────────
const TEAL = "#02b2f6";
const GREEN = "#09cf8b";
const GRADIENT = "linear-gradient(135deg,#02b2f6,#09cf8b)";
const API = "http://127.0.0.1:8000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsPageProps {
  onLogout?: () => void;
}

interface UserData {
  firstName: string;
  username: string;
  phone: string;
  gender: string;
  location: string;
  joinDate: string;
  isPremium: boolean;
  isVerified: boolean;
  completionPercentage: number;
  matches: number;
  swipesUsed: number;
  distance: number;
  planName: string | null;
  daysRemaining: number;
}

interface NotifPrefs {
  matches: boolean;
  likes: boolean;
  messages: boolean;
  email: boolean;
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: checked ? GRADIENT : "#e5e7eb" }}
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
function Section({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-4"
    >
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,rgba(2,178,246,0.12),rgba(9,207,139,0.12))" }}
        >
          <Icon size={14} style={{ color: TEAL }} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-500">{title}</span>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────
function ToggleRow({
  label, desc, value, onChange, icon: Icon, disabled, saving,
}: {
  label: string; desc?: string; value: boolean;
  onChange: (v: boolean) => void; icon?: React.ElementType;
  disabled?: boolean; saving?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon size={15} className="text-gray-400 flex-shrink-0" />}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 leading-tight">{label}</p>
          {desc && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>}
        </div>
      </div>
      <div className="ml-4 flex items-center gap-2">
        {saving && <RefreshCw size={12} className="animate-spin text-gray-400" />}
        <Toggle checked={value} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

function NavRow({
  label, desc, icon: Icon, onClick, badge, danger, value,
}: {
  label: string; desc?: string; icon?: React.ElementType;
  onClick: () => void; badge?: string; danger?: boolean; value?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <Icon size={15} className={danger ? "text-rose-400 flex-shrink-0" : "text-gray-400 flex-shrink-0"} />
        )}
        <div className="min-w-0">
          <p className={`text-[14px] font-semibold leading-tight ${danger ? "text-rose-500" : "text-gray-800"}`}>
            {label}
          </p>
          {desc && <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {value && <span className="text-[12px] text-gray-400 font-medium">{value}</span>}
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(2,178,246,0.1)", color: TEAL }}>
            {badge}
          </span>
        )}
        <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
      </div>
    </button>
  );
}

function StaticRow({
  label, value, icon: Icon,
}: {
  label: string; value?: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <Icon size={15} className="text-gray-400 flex-shrink-0" />}
        <p className="text-[14px] font-semibold text-gray-800 leading-tight">{label}</p>
      </div>
      {value && <span className="text-[12px] text-gray-400 font-medium ml-4">{value}</span>}
    </div>
  );
}

function SelectRow({
  label, options, value, onChange,
}: {
  label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
      <p className="text-[14px] font-semibold text-gray-800">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[12px] font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 outline-none focus:border-teal-400 transition-colors cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 mb-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-32" />
          <div className="h-3 bg-gray-100 rounded-full w-48" />
          <div className="h-3 bg-gray-100 rounded-full w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100">
        {[1, 2].map((i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-4 bg-gray-200 rounded-full w-8 mx-auto" />
            <div className="h-2.5 bg-gray-100 rounded-full w-14 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Password Modal ───────────────────────────────────────────────────────────
type PwStep = "send" | "verify" | "reset" | "done";

function PasswordModal({ onClose }: { onClose: () => void }) {
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

  const handleSendOtp = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/password/forgot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send code");
      setStep("verify");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/password/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid code");
      setResetToken(data.reset_token);
      setStep("reset");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(""); setOtp("");
    await fetch(`${API}/password/forgot/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
  };

  const handleReset = async () => {
    setError("");
    if (newPw !== confirmPw) { setError("Passwords don't match"); return; }
    if (newPw.length < 8)    { setError("Minimum 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          reset_token: resetToken,
          new_password: newPw,
          confirm_password: confirmPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");
      setStep("done");
      setTimeout(onClose, 1800);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-[13px] text-gray-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10 transition-all";
  const otpCls   = "w-full h-14 text-center text-[22px] font-black tracking-[0.35em] rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
      >
        <div className="h-1.5 w-full" style={{ background: GRADIENT }} />
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {(step === "verify" || step === "reset") && (
                <button
                  onClick={() => { setStep(step === "reset" ? "verify" : "send"); setError(""); }}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors mr-1"
                >
                  <ArrowLeft size={13} className="text-gray-600" />
                </button>
              )}
              <h3 className="text-lg font-black text-gray-900">
                {step === "send"   && "Change Password"}
                {step === "verify" && "Enter Code"}
                {step === "reset"  && "New Password"}
                {step === "done"   && "All Done!"}
              </h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={14} className="text-gray-500" />
            </button>
          </div>

          {step !== "done" && (
            <div className="flex items-center gap-1.5 mb-6">
              {(["send","verify","reset"] as PwStep[]).map((s, i) => (
                <div key={s} className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: step === s ? "20px" : "6px",
                    background: step === s ? TEAL : (["send","verify","reset"].indexOf(step) > i ? GREEN : "#e5e7eb"),
                  }}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "send" && (
              <motion.div key="send" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-[13px] text-gray-500 leading-relaxed">We'll send a 6-digit verification code to</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-gray-700 truncate">{userEmail || "your email"}</span>
                </div>
                {error && <p className="text-[12px] text-rose-500 font-medium text-center">{error}</p>}
                <button onClick={handleSendOtp} disabled={loading}
                  className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: GRADIENT }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Sending...</> : "Send Verification Code"}
                </button>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div key="verify" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{userEmail}</span>
                </p>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={otpCls} placeholder="······" autoFocus />
                {error && <p className="text-[12px] text-rose-500 font-medium text-center">{error}</p>}
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                  className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: GRADIENT }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Verifying...</> : "Verify Code"}
                </button>
                <button onClick={handleResend} className="w-full text-[12px] font-semibold text-center" style={{ color: TEAL }}>
                  Didn't get it? Resend code
                </button>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                      className={inputCls + " pr-10"} placeholder="Min. 8 characters" autoFocus />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <input type={showCfm ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                      className={inputCls + " pr-10"} placeholder="Repeat password" />
                    <button type="button" onClick={() => setShowCfm(!showCfm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-[12px] text-rose-500 font-medium text-center">{error}</p>}
                <button onClick={handleReset} disabled={loading || !newPw || !confirmPw}
                  className="w-full h-11 mt-1 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: GRADIENT }}>
                  {loading ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : "Set New Password"}
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(9,207,139,0.1)" }}>
                  <Check size={24} style={{ color: GREEN }} strokeWidth={3} />
                </div>
                <p className="font-black text-gray-900">Password Updated!</p>
                <p className="text-[12px] text-gray-400 text-center">Your password has been changed successfully.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ onClose }: { onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const confirmed = typed === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 to-red-500" />
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-gray-900">Delete Account</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
          <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-5">
            <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-rose-700 leading-relaxed font-medium">
              This permanently deletes your account, matches, and all conversations. This cannot be undone.
            </p>
          </div>
          <div className="space-y-1 mb-4">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type DELETE to confirm</label>
            <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-[13px] font-mono text-gray-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition-all" />
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

// ─── Notification preferences hook ───────────────────────────────────────────
/**
 * Loads preferences from the backend on mount.
 * Falls back to localStorage so the UI is never blank.
 * Debounces PATCH calls — waits 600 ms after the last toggle before saving.
 */
function useNotifPrefs() {
  const STORAGE_KEY = "settings_notif_prefs";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const localFallback = (): NotifPrefs => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) return JSON.parse(s);
    } catch { /* ignore */ }
    return { matches: true, likes: true, messages: true, email: false };
  };

  const [prefs, setPrefs]   = useState<NotifPrefs>(localFallback);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from backend once
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoaded(true); return; }

    fetch(`${API}/notifications/preferences/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: NotifPrefs) => {
        setPrefs(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      })
      .catch(() => { /* keep localStorage fallback */ })
      .finally(() => setLoaded(true));
  }, []);

  // Toggle a single key and debounce-save to backend
  const toggle = (key: keyof NotifPrefs) => (value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        setSaving(true);
        await fetch(`${API}/notifications/preferences/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [key]: value }),
        });
      } catch { /* silent — localStorage already updated */ }
      finally { setSaving(false); }
    }, 600);
  };

  return { prefs, toggle, saving, loaded };
}

// ─── Online Status hook — syncs with backend via PATCH ───────────────────────
/**
 * Syncs the "show online status" toggle with the backend.
 * Falls back to localStorage while the request is in-flight.
 */
function useOnlineStatus() {
  const STORAGE_KEY = "settings_show_online";
  const [showOnline, setShowOnline] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s !== null ? JSON.parse(s) : true;
    } catch { return true; }
  });
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from backend once on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch(`${API}/privacy/preferences/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const val = data?.show_online ?? true;
        setShowOnline(val);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      })
      .catch(() => { /* keep localStorage value */ });
  }, []);

  const toggle = (value: boolean) => {
    setShowOnline(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      try {
        setSaving(true);
        await fetch(`${API}/privacy/preferences/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ show_online: value }),
        });
      } catch { /* silent */ }
      finally { setSaving(false); }
    }, 600);
  };

  return { showOnline, toggle, saving };
}

// ─── Profile completion helper ────────────────────────────────────────────────
function calcCompletionPercentage(d: any): number {
  const steps = [
    !!(d.firstName?.trim() || d.first_name?.trim()) &&
      !!(d.dateOfBirth || d.date_of_birth) &&
      !!d.gender?.trim() &&
      (d.interestedIn || d.interested_in || []).length > 0,
    typeof d.distance === "number" && d.distance > 0,
    !!d.drinking?.trim() && !!d.smoking?.trim() && !!d.workout?.trim() && !!d.pets?.trim(),
    (d.communicationStyle || d.communication_style || []).length > 0 &&
      !!(d.responsePace || d.response_pace)?.trim(),
    (d.interests || []).length > 0,
    !!d.location?.trim(),
    !!d.bio?.trim() && d.bio.trim().split(/\s+/).filter(Boolean).length >= 10,
    true,
  ];
  return Math.min(100, Math.round((steps.filter(Boolean).length / steps.length) * 100));
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const navigate = useNavigate();
  const [modal, setModal] = useState<"password" | "delete" | null>(null);

  const [userData, setUserData]           = useState<UserData | null>(null);
  const [loading, setLoading]             = useState(true);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [distance, setDistance]           = useState("25");
  const [language, setLanguage]           = useState("en");

  const { prefs: notifs, toggle: ntToggle, saving: notifSaving } = useNotifPrefs();
  const { showOnline, toggle: toggleOnline, saving: onlineSaving } = useOnlineStatus();

  // Fetch unread count
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch(`${API}/notifications/unread-count/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setUnreadNotifCount(d.unread_count ?? 0))
      .catch(() => {});
  }, []);

  // Fetch user profile data
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
          const res = await fetch(`${API}/profile/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            raw = json.profile ?? json;
          }
        }

        const matchesCount =
          raw.matches_count ?? raw.match_count ?? raw.total_matches ?? raw.matches ?? d.matches ?? 0;

        const merged = { ...raw, ...d };

        setUserData({
          firstName:            d.firstName            || raw.first_name    || "User",
          username:             raw.username            || raw.email         || "",
          phone:                raw.phone               || "",
          gender:               d.gender               || raw.gender         || "",
          location:             d.location             || raw.location       || "",
          joinDate:             raw.join_date
                                  ? new Date(raw.join_date).toLocaleDateString("en-IN", {
                                      month: "long", year: "numeric",
                                    })
                                  : "",
          isPremium:            sub?.isPremium          ?? raw.premium === true,
          isVerified:           raw.verified            === true,
          completionPercentage: calcCompletionPercentage(merged),
          matches:              matchesCount,
          swipesUsed:           raw.swipes_used         ?? raw.swipe_count ?? 0,
          distance:             d.distance              ?? raw.distance     ?? 25,
          planName:             sub?.planName           ?? null,
          daysRemaining:        sub?.daysRemaining      ?? 0,
        });

        if (d.distance) setDistance(String(d.distance));

      } catch (err) {
        console.error("[Settings] load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initial = userData?.firstName?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <TopBar userName={userData?.firstName ?? "User"} onLogout={onLogout} />

      <div className="max-w-2xl mx-auto px-4 pt-24 md:pt-28 pb-12">

        {/* ── Page heading row ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Settings</h1>
        </div>

        {/* ── Profile card ─────────────────────────────────────────────── */}
        {loading ? <ProfileSkeleton /> : (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 mb-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 -translate-y-10 translate-x-10" style={{ background: GRADIENT }} />

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg" style={{ background: GRADIENT }}>
                  {initial}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-[17px] font-black text-gray-900 leading-tight">{userData?.firstName}</p>
                  {userData?.isVerified && <BadgeCheck size={16} style={{ color: TEAL }} />}
                  {userData?.isPremium && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                      <Crown size={10} className="text-amber-500 fill-amber-500" />
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Premium</span>
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gray-400 font-medium truncate">{userData?.username || "—"}</p>
                {userData?.joinDate && (
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">Joined {userData.joinDate}</p>
                )}
                {(userData?.completionPercentage ?? 0) < 100 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${userData?.completionPercentage}%`, background: GRADIENT }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{userData?.completionPercentage}% complete</span>
                  </div>
                )}
              </div>
              <button onClick={() => navigate("/profile")}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity flex-shrink-0"
                style={{ background: GRADIENT }}>
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-50">
              {[
                { label: "Matches",    value: userData?.matches    ?? 0, highlight: (userData?.matches ?? 0) > 0 },
                { label: "Swipes Used", value: userData?.swipesUsed ?? 0, highlight: false },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-[16px] font-black leading-tight"
                    style={s.highlight ? { background: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : { color: "#111827" }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Premium upgrade banner ────────────────────────────────────── */}
        {!loading && userData && !userData.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate("/premium")}
            className="relative rounded-[24px] p-5 mb-6 overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
            style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)" }}
          >
            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-10">
              <Crown size={80} className="text-amber-400" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Crown size={22} className="text-white fill-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-[15px] leading-tight mb-0.5">Upgrade to Premium</p>
                <p className="text-slate-400 text-[11px] font-medium">Unlimited swipes · See who likes you</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30">
                <Sparkles size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">Upgrade</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Premium active card ───────────────────────────────────────── */}
        {!loading && userData?.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => navigate("/premium")}
            className="relative rounded-[24px] p-5 mb-6 overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
            style={{ background: "linear-gradient(135deg,#92400e,#b45309)" }}
          >
            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-15">
              <Crown size={80} className="text-amber-300" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-lg">
                <Crown size={22} className="text-white fill-white" />
              </div>
              <div className="flex-1">
                <p className="text-amber-100 font-black text-[15px] leading-tight mb-0.5">
                  {userData.planName ?? "Premium Member"} ✦
                </p>
                <p className="text-amber-300/80 text-[11px] font-medium">
                  {userData.daysRemaining === Infinity
                    ? "Lifetime access"
                    : `${userData.daysRemaining} days remaining · Tap to manage`}
                </p>
              </div>
              <span className="text-[10px] font-black bg-amber-400/30 text-amber-200 px-3 py-1.5 rounded-full border border-amber-400/30">
                ACTIVE
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Account ──────────────────────────────────────────────────── */}
        <Section title="Account" icon={User} delay={0.08}>
          <NavRow label="Edit Profile"    desc="Update your bio, interests and photo" icon={User}  onClick={() => navigate("/profile")} />
          <NavRow label="Change Password" desc="Update your login credentials"        icon={Lock}  onClick={() => setModal("password")} />
          {userData?.gender && <StaticRow label="Gender" value={userData.gender} icon={User} />}
          <NavRow label="Location" value={userData?.location || undefined} icon={MapPin} onClick={() => navigate("/profile")} />
        </Section>

        {/* ── Notifications ────────────────────────────────────────────── */}
        <Section title="Notifications" icon={Bell} delay={0.12}>
          <NavRow
            label="View All Notifications"
            desc="See your matches, likes and messages"
            icon={Bell}
            badge={unreadNotifCount > 0 ? `${unreadNotifCount} new` : undefined}
            onClick={() => navigate("/notifications")}
          />
          <ToggleRow
            label="New Matches"
            desc="When you match with someone"
            icon={Heart}
            value={notifs.matches}
            onChange={ntToggle("matches")}
            saving={notifSaving}
          />
          <ToggleRow
            label="Profile Likes"
            desc="When someone likes your profile"
            icon={Zap}
            value={notifs.likes}
            onChange={ntToggle("likes")}
            saving={notifSaving}
          />
          <ToggleRow
            label="Messages"
            desc="New messages from matches"
            icon={MessageCircle}
            value={notifs.messages}
            onChange={ntToggle("messages")}
            saving={notifSaving}
          />
          <ToggleRow
            label="Email Notifications"
            desc="Receive occasional email digests"
            icon={Mail}
            value={notifs.email}
            onChange={ntToggle("email")}
            saving={notifSaving}
          />
        </Section>

        {/* ── Privacy & Safety ─────────────────────────────────────────── */}
        <Section title="Privacy & Safety" icon={Shield} delay={0.16}>
          <ToggleRow
            label="Show Online Status"
            desc="Let others see when you're active"
            icon={Eye}
            value={showOnline}
            onChange={toggleOnline}
            saving={onlineSaving}
          />
          <NavRow
            label="Blocked Users"
            desc="Manage people you've blocked"
            icon={Shield}
            onClick={() => navigate("/blocked-users")}
          />
          <NavRow
            label="Data & Privacy"
            desc="Download or delete your data"
            icon={Shield}
            onClick={() => navigate("/data-privacy")}
          />
        </Section>

        {/* ── Support ──────────────────────────────────────────────────── */}
        <Section title="Support" icon={MessageCircle} delay={0.24}>
          <NavRow label="Help Center"      desc="FAQs and guides"        icon={MessageCircle} onClick={() => navigate("/help")} />
          <NavRow label="Contact Support"  desc="Get help from our team" icon={Mail}          onClick={() => navigate("/contact")} />
          <NavRow label="Terms of Service"                               icon={Globe}         onClick={() => navigate("/terms")} />
          <NavRow label="Privacy Policy"                                 icon={Shield}        onClick={() => navigate("/privacy")} />
        </Section>

        {/* ── Account Actions ──────────────────────────────────────────── */}
        <Section title="Account Actions" icon={AlertTriangle} delay={0.28}>
          <NavRow label="Log Out"        desc="Sign out of your account"                  icon={LogOut} onClick={() => onLogout?.()} />
          <NavRow label="Delete Account" desc="Permanently remove your account and data"  icon={Trash2} danger onClick={() => setModal("delete")} />
        </Section>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-gray-300 font-medium mt-2 mb-6 flex items-center justify-center gap-1.5"
        >
          The Dating App v1.0.0 · Made in Hyderabad
          <Heart size={10} color="#f43f5e" fill="#f43f5e" />
        </motion.p>
      </div>

      <AnimatePresence>
        {modal === "password" && <PasswordModal onClose={() => setModal(null)} />}
        {modal === "delete"   && <DeleteModal   onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}