import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, Download, Trash2, RefreshCw,
  AlertTriangle, CheckCircle, X, FileJson, Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE;
const API      = `${API_BASE}/api`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
      style={{
        background: type === "success"
          ? "linear-gradient(135deg,#09cf8b,#02b2f6)"
          : "linear-gradient(135deg,#f43f5e,#ef4444)",
        color: "white",
        minWidth: "220px",
        justifyContent: "center",
      }}
    >
      {type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
      <span className="text-[13px] font-bold">{message}</span>
    </motion.div>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteAccountModal({
  onClose,
  onDeleted,
  isDark,
}: {
  onClose: () => void;
  onDeleted: () => void;
  isDark: boolean;
}) {
  const [typed, setTyped]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const confirmed = typed === "DELETE";

  const modalBg     = isDark ? "#1c1c1c"                     : "#ffffff";
  const modalBorder = isDark ? "rgba(249,115,22,0.14)"       : "#f1f1f5";
  const txHead      = isDark ? "#f0e8de"                     : "#111827";
  const txMuted     = isDark ? "#8a6540"                     : "#6b7280";
  const inputBg     = isDark ? "rgba(255,255,255,0.04)"      : "#f9fafb";
  const inputBorder = isDark ? "rgba(249,115,22,0.2)"        : "#e5e7eb";
  const warnBg      = isDark ? "rgba(244,63,94,0.08)"        : "#fff1f2";
  const warnBorder  = isDark ? "rgba(244,63,94,0.2)"         : "#fecdd3";
  const warnText    = isDark ? "#fca5a5"                     : "#be123c";
  const closeBtnBg  = isDark ? "rgba(249,115,22,0.1)"        : "#f3f4f6";
  const closeBtnCl  = isDark ? "#8a6540"                     : "#6b7280";

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API}/privacy/delete-account/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      if (res.ok) {
        localStorage.clear();
        onDeleted();
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to delete account. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
        style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
      >
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(135deg,#f43f5e,#ef4444)" }} />
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black" style={{ color: txHead }}>Delete Account</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: closeBtnBg, color: closeBtnCl }}
            >
              <X size={14} />
            </button>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: warnBg, border: `1px solid ${warnBorder}` }}
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#f43f5e" }} />
            <p className="text-[12px] leading-relaxed font-medium" style={{ color: warnText }}>
              This permanently deletes your account, all matches, messages, and profile data.
              This action <span className="font-black">cannot be undone</span>.
            </p>
          </div>

          <div className="space-y-1 mb-4">
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: txMuted }}>
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              autoFocus
              className="w-full h-11 px-4 rounded-xl text-[13px] font-mono outline-none transition-all"
              style={{
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: txHead,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f43f5e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = inputBorder)}
            />
          </div>

          {error && (
            <p className="text-[12px] text-rose-500 font-medium text-center mb-4">{error}</p>
          )}

          <button
            onClick={handleDelete}
            disabled={!confirmed || loading}
            className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#f43f5e,#ef4444)" }}
          >
            {loading ? (
              <><RefreshCw size={14} className="animate-spin" /> Deleting...</>
            ) : (
              "Permanently Delete My Account"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  delay = 0,
  isDark,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
  isDark: boolean;
}) {
  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const cardBg      = isDark ? "#1c1c1c"                   : "#ffffff";
  const cardBorder  = isDark ? "rgba(249,115,22,0.14)"     : "#f1f1f5";
  const cardShadow  = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)";
  const iconBg      = isDark
    ? "linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,146,60,0.08))"
    : "linear-gradient(135deg,rgba(29,78,216,0.1),rgba(59,130,246,0.08))";
  const labelColor  = isDark ? "#8a6540" : "#9ca3af";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f9fafb";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] overflow-hidden mb-4"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${dividerColor}` }}
      >
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={14} style={{ color: accentColor }} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: labelColor }}>
          {title}
        </span>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}

function ActionRow({
  label,
  desc,
  icon: Icon,
  onClick,
  loading,
  danger,
  isDark,
}: {
  label: string;
  desc?: string;
  icon: React.ElementType;
  onClick: () => void;
  loading?: boolean;
  danger?: boolean;
  isDark: boolean;
}) {
  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const txPrimary   = isDark ? "#f0e8de" : "#1f2937";
  const txMuted     = isDark ? "#8a6540" : "#9ca3af";
  const rowHoverBg  = isDark ? "rgba(249,115,22,0.04)" : "rgba(0,0,0,0.02)";
  const pillDl      = isDark ? { background: "rgba(249,115,22,0.1)",  color: "#f97316"  }
                              : { background: "rgba(29,78,216,0.1)",   color: "#1d4ed8"  };
  const pillDanger  = { background: "rgba(244,63,94,0.1)", color: "#f43f5e" };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors disabled:opacity-60"
      style={{ borderBottom: isDark ? "1px solid rgba(249,115,22,0.06)" : "1px solid #f9fafb" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = rowHoverBg)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon
          size={15}
          className="flex-shrink-0"
          style={{ color: danger ? "#f43f5e" : (isDark ? "#8a6540" : "#9ca3af") }}
        />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-tight"
            style={{ color: danger ? "#f43f5e" : txPrimary }}>
            {label}
          </p>
          {desc && (
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: txMuted }}>{desc}</p>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        {loading ? (
          <RefreshCw size={15} className="animate-spin" style={{ color: txMuted }} />
        ) : (
          <div className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={danger ? pillDanger : pillDl}>
            {danger ? "Delete" : "Download"}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DataPrivacyPage({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const { isDark } = useTheme() as any;

  const [exportLoading, setExportLoading]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* ─── Theme tokens (match Landing/Login) ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";

  const backBtnBg     = isDark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const backBtnBorder = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const backBtnCl     = isDark ? "#c4a882"                : "#6b7280";

  const greenColor = isDark ? "#09cf8b" : "#059669";
  const greenBg    = isDark ? "rgba(9,207,139,0.12)" : "rgba(16,185,129,0.12)";
  const retentionHighlight = isDark ? "#f0e8de" : "#111827";

  const ctaGradient = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = async () => {
    setExportLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API}/privacy/export/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `my-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Your data has been downloaded!");
    } catch {
      showToast("Failed to export data. Please try again.", "error");
    } finally {
      setExportLoading(false);
    }
  };

  const handleAccountDeleted = () => {
    setShowDeleteModal(false);
    onLogout?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ background: pageBg }}>
      {/* ambient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
      </div>

      <TopBar userName="" />

      <div className="max-w-2xl mx-auto px-4 pt-24 md:pt-28 pb-12">

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all"
            style={{ background: backBtnBg, border: `1px solid ${backBtnBorder}`, color: backBtnCl }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "#f9fafb")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = backBtnBg)}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-[22px] font-black tracking-tight leading-tight" style={{ color: txPrimary }}>
              Data & Privacy
            </h1>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: txMuted }}>
              Manage your personal data
            </p>
          </div>
        </motion.div>

        {/* ── What we store ── */}
        <Section title="What We Store" icon={FileJson} delay={0.05} isDark={isDark}>
          <div className="px-6 py-5 space-y-3">
            {[
              { label: "Profile information", desc: "Name, bio, interests, and preferences" },
              { label: "Match & like history",  desc: "People you've liked or matched with" },
              { label: "Messages",              desc: "Conversations with your matches" },
              { label: "Location data",         desc: "City-level only, never precise GPS" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: greenBg }}
                >
                  <CheckCircle size={11} style={{ color: greenColor }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-tight" style={{ color: txPrimary }}>
                    {item.label}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: txMuted }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Data Retention ── */}
        <Section title="Data Retention" icon={Clock} delay={0.1} isDark={isDark}>
          <div className="px-6 py-5">
            <p className="text-[13px] leading-relaxed" style={{ color: txBody }}>
              Your data is retained as long as your account is active. Deleted accounts have all
              associated data permanently removed within{" "}
              <span className="font-bold" style={{ color: retentionHighlight }}>30 days</span>.
              Messages are stored for your convenience while you're a member.
            </p>
          </div>
        </Section>

        {/* ── Download ── */}
        <Section title="Your Data" icon={Download} delay={0.15} isDark={isDark}>
          <ActionRow
            label="Download My Data"
            desc="Get a JSON copy of everything we have stored about you"
            icon={Download}
            onClick={handleExport}
            loading={exportLoading}
            isDark={isDark}
          />
          {/* remove the bottom border on last row */}
          <style>{`button:last-child { border-bottom: none !important; }`}</style>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone" icon={AlertTriangle} delay={0.2} isDark={isDark}>
          <ActionRow
            label="Delete Account"
            desc="Permanently remove your account and all associated data"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
            danger
            isDark={isDark}
          />
        </Section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[11px] font-medium mt-2"
          style={{ color: isDark ? "#4a3520" : "#d1d5db" }}
        >
          Your privacy is important to us · Made in Hyderabad
        </motion.p>
      </div>

      {/* ── Delete modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
            onDeleted={handleAccountDeleted}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}