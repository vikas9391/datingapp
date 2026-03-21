import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, UserX, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE;
const API = `${API_BASE}/api`;

interface BlockedUser {
  email: string;
  first_name: string;
  blocked_at: string;
}

function EmptyState({ isDark }: { isDark: boolean }) {
  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const iconBg      = isDark
    ? "linear-gradient(135deg,rgba(249,115,22,0.1),rgba(251,191,36,0.08))"
    : "linear-gradient(135deg,rgba(29,78,216,0.08),rgba(59,130,246,0.06))";
  const txPrimary   = isDark ? "#f0e8de" : "#1f2937";
  const txMuted     = isDark ? "#8a6540" : "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: iconBg }}
      >
        <Shield size={36} style={{ color: accentColor }} />
      </div>
      <p className="text-[17px] font-black mb-2" style={{ color: txPrimary }}>No Blocked Users</p>
      <p className="text-[13px] leading-relaxed max-w-xs" style={{ color: txMuted }}>
        People you block won't be able to match with or message you.
      </p>
    </motion.div>
  );
}

// ─── Confirm Unblock Sheet ────────────────────────────────────────────────────
function UnblockConfirmSheet({
  user,
  onConfirm,
  onCancel,
  loading,
  isDark,
}: {
  user: BlockedUser;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  isDark: boolean;
}) {
  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const accentGrad  = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const iconBg      = isDark
    ? "linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,191,36,0.1))"
    : "linear-gradient(135deg,rgba(29,78,216,0.08),rgba(59,130,246,0.06))";
  const cardBg      = isDark ? "#1c1c1c"  : "#ffffff";
  const txPrimary   = isDark ? "#f0e8de"  : "#111827";
  const txMuted     = isDark ? "#8a6540"  : "#9ca3af";
  const cancelBg    = isDark ? "rgba(249,115,22,0.08)" : "#f3f4f6";
  const cancelText  = isDark ? "#c4a882"  : "#374151";
  const cancelHover = isDark ? "rgba(249,115,22,0.14)" : "#e5e7eb";
  const topBar      = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
        style={{ background: cardBg }}
      >
        <div className="h-1.5 w-full" style={{ background: topBar }} />
        <div className="p-7">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: iconBg }}
            >
              <UserX size={22} style={{ color: accentColor }} />
            </div>
            <div>
              <p className="text-[17px] font-black" style={{ color: txPrimary }}>Unblock {user.first_name}?</p>
              <p className="text-[12px] mt-1" style={{ color: txMuted }}>
                They'll be able to appear in your recommendations again.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-[13px] transition-colors disabled:opacity-50"
              style={{ background: cancelBg, color: cancelText }}
              onMouseEnter={(e) => (e.currentTarget.style.background = cancelHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = cancelBg)}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-[13px] text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: accentGrad }}
            >
              {loading ? (
                <><RefreshCw size={14} className="animate-spin" /> Unblocking...</>
              ) : (
                "Unblock"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, isDark }: { message: string; type: "success" | "error"; isDark: boolean }) {
  const successGrad = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
      style={{
        background: type === "success" ? successGrad : "#f43f5e",
        color: "white",
      }}
    >
      {type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
      <span className="text-[13px] font-bold">{message}</span>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BlockedUsersPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [blocked, setBlocked]           = useState<BlockedUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [pendingUser, setPendingUser]   = useState<BlockedUser | null>(null);
  const [unblocking, setUnblocking]     = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* ─── Theme tokens ─── */
  const pageBg          = isDark ? "#0d0d0d"  : "linear-gradient(to bottom,#f8faff,#f0f4ff)";
  const txPrimary       = isDark ? "#f0e8de"  : "#111827";
  const txMuted         = isDark ? "#8a6540"  : "#9ca3af";
  const accentColor     = isDark ? "#f97316"  : "#1d4ed8";
  const accentGrad      = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const cardBg          = isDark ? "#1c1c1c"  : "#ffffff";
  const cardBorder      = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.06)";
  const cardShadow      = isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)";
  const rowBorder       = isDark ? "rgba(249,115,22,0.06)" : "#f9fafb";
  const rowHoverBg      = isDark ? "rgba(249,115,22,0.03)" : "#f9fafb";
  const avatarName      = isDark ? "#f0e8de"  : "#1f2937";
  const avatarDate      = isDark ? "#8a6540"  : "#9ca3af";
  const unblockBtnBg    = isDark ? "#1c1c1c"  : "#ffffff";
  const unblockBtnBorder = isDark ? "rgba(249,115,22,0.2)" : "#e5e7eb";
  const unblockBtnText  = isDark ? "#c4a882"  : "#374151";
  const unblockHoverBorder = isDark ? "rgba(249,115,22,0.5)" : "rgba(29,78,216,0.4)";
  const unblockHoverText = isDark ? "#fb923c" : "#1d4ed8";
  const backBtnBg       = isDark ? "#1c1c1c"  : "#ffffff";
  const backBtnBorder   = isDark ? "rgba(249,115,22,0.18)" : "#e5e7eb";
  const backBtnColor    = isDark ? "#c4a882"  : "#374151";
  const backBtnHover    = isDark ? "rgba(249,115,22,0.08)" : "#f9fafb";
  const skeletonBg      = isDark ? "#1c1c1c"  : "#ffffff";
  const skeletonPulse   = isDark ? "rgba(249,115,22,0.06)" : "#f3f4f6";
  const skeletonPulse2  = isDark ? "rgba(249,115,22,0.04)" : "#f9fafb";
  const skeletonBtn     = isDark ? "rgba(249,115,22,0.06)" : "#f3f4f6";
  const infoBg          = isDark ? "rgba(29,78,216,0.06)"  : "#eff6ff";
  const infoBorder      = isDark ? "rgba(29,78,216,0.18)"  : "#bfdbfe";
  const infoIconColor   = isDark ? "#60a5fa"  : "#3b82f6";
  const infoText        = isDark ? "#60a5fa"  : "#1d4ed8";
  const countColor      = isDark ? "#8a6540"  : "#9ca3af";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBlocked = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/users/blocked/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBlocked(data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlocked(); }, []);

  const handleUnblock = async () => {
    if (!pendingUser) return;
    setUnblocking(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API}/users/unblock/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: pendingUser.email }),
      });
      if (res.ok) {
        setBlocked((prev) => prev.filter((u) => u.email !== pendingUser.email));
        showToast(`${pendingUser.first_name} has been unblocked`);
      } else {
        showToast("Failed to unblock. Please try again.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setUnblocking(false);
      setPendingUser(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return ""; }
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ background: pageBg }}>
      <TopBar userName="" />

      <div className="max-w-2xl mx-auto px-4 pt-24 md:pt-28 pb-12">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-sm"
            style={{ background: backBtnBg, border: `1px solid ${backBtnBorder}`, color: backBtnColor }}
            onMouseEnter={(e) => (e.currentTarget.style.background = backBtnHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = backBtnBg)}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[22px] font-black tracking-tight leading-tight" style={{ color: txPrimary }}>
              Blocked Users
            </h1>
            {!loading && blocked.length > 0 && (
              <p className="text-[11px] font-medium mt-0.5" style={{ color: countColor }}>
                {blocked.length} {blocked.length === 1 ? "person" : "people"} blocked
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[20px] p-4 animate-pulse flex items-center gap-4"
                style={{ background: skeletonBg, border: `1px solid ${rowBorder}` }}
              >
                <div className="w-12 h-12 rounded-2xl flex-shrink-0" style={{ background: skeletonPulse }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded-full w-28" style={{ background: skeletonPulse }} />
                  <div className="h-2.5 rounded-full w-40" style={{ background: skeletonPulse2 }} />
                </div>
                <div className="w-20 h-8 rounded-xl" style={{ background: skeletonBtn }} />
              </div>
            ))}
          </div>
        ) : blocked.length === 0 ? (
          <EmptyState isDark={isDark} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[24px] overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
          >
            <AnimatePresence initial={false}>
              {blocked.map((user, idx) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{
                    borderBottom: idx !== blocked.length - 1 ? `1px solid ${rowBorder}` : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = rowHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0 shadow-sm"
                    style={{ background: accentGrad }}
                  >
                    {user.first_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold leading-tight truncate" style={{ color: avatarName }}>
                      {user.first_name}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: avatarDate }}>
                      Blocked {formatDate(user.blocked_at)}
                    </p>
                  </div>

                  {/* Unblock button */}
                  <button
                    onClick={() => setPendingUser(user)}
                    className="flex-shrink-0 h-8 px-3 rounded-xl text-[12px] font-bold transition-colors"
                    style={{ background: unblockBtnBg, border: `1px solid ${unblockBtnBorder}`, color: unblockBtnText }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = unblockHoverBorder;
                      (e.currentTarget as HTMLElement).style.color = unblockHoverText;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = unblockBtnBorder;
                      (e.currentTarget as HTMLElement).style.color = unblockBtnText;
                    }}
                  >
                    Unblock
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Info blurb */}
        {!loading && blocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 mt-4 p-4 rounded-2xl"
            style={{ background: infoBg, border: `1px solid ${infoBorder}` }}
          >
            <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: infoIconColor }} />
            <p className="text-[11px] leading-relaxed font-medium" style={{ color: infoText }}>
              Blocked users won't be able to see your profile, match with you, or send you messages.
            </p>
          </motion.div>
        )}
      </div>

      {/* Confirm Sheet */}
      <AnimatePresence>
        {pendingUser && (
          <UnblockConfirmSheet
            user={pendingUser}
            onConfirm={handleUnblock}
            onCancel={() => setPendingUser(null)}
            loading={unblocking}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} isDark={isDark} />}
      </AnimatePresence>
    </div>
  );
}