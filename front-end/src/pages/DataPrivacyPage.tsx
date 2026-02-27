import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, Download, Trash2, RefreshCw,
  AlertTriangle, CheckCircle, X, FileJson, Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";

const API_BASE = import.meta.env.VITE_API_BASE;

const TEAL     = "#02b2f6";
const GREEN    = "#09cf8b";
const GRADIENT = "linear-gradient(135deg,#02b2f6,#09cf8b)";
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
        background: type === "success" ? "linear-gradient(135deg,#09cf8b,#02b2f6)" : "#f43f5e",
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
}: {
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const confirmed = typed === "DELETE";

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
        className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 to-red-500" />
        <div className="p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-gray-900">Delete Account</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={14} className="text-gray-500" />
            </button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-5">
            <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-rose-700 leading-relaxed font-medium">
              This permanently deletes your account, all matches, messages, and profile data.
              This action <span className="font-black">cannot be undone</span>.
            </p>
          </div>

          <div className="space-y-1 mb-4">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              autoFocus
              className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-[13px] font-mono text-gray-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 transition-all"
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
          style={{
            background: "linear-gradient(135deg,rgba(2,178,246,0.12),rgba(9,207,139,0.12))",
          }}
        >
          <Icon size={14} style={{ color: TEAL }} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-500">
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
}: {
  label: string;
  desc?: string;
  icon: React.ElementType;
  onClick: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors text-left group disabled:opacity-60"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon
          size={15}
          className={danger ? "text-rose-400 flex-shrink-0" : "text-gray-400 flex-shrink-0"}
        />
        <div className="min-w-0">
          <p className={`text-[14px] font-semibold leading-tight ${danger ? "text-rose-500" : "text-gray-800"}`}>
            {label}
          </p>
          {desc && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        {loading ? (
          <RefreshCw size={15} className="animate-spin text-gray-400" />
        ) : (
          <div
            className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={
              danger
                ? { background: "rgba(244,63,94,0.1)", color: "#f43f5e" }
                : { background: "rgba(2,178,246,0.1)", color: TEAL }
            }
          >
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
  const [exportLoading, setExportLoading]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

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

      // Trigger download
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">
      <TopBar userName="" />

      <div className="max-w-2xl mx-auto px-4 pt-24 md:pt-28 pb-12">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight">
              Data & Privacy
            </h1>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Manage your personal data
            </p>
          </div>
        </div>

        {/* What we store */}
        <Section title="What We Store" icon={FileJson} delay={0.05}>
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
                  style={{ background: "rgba(9,207,139,0.15)" }}
                >
                  <CheckCircle size={11} style={{ color: GREEN }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Data retention */}
        <Section title="Data Retention" icon={Clock} delay={0.1}>
          <div className="px-6 py-5">
            <p className="text-[13px] text-gray-600 leading-relaxed">
              Your data is retained as long as your account is active. Deleted accounts have all
              associated data permanently removed within <span className="font-bold text-gray-800">30 days</span>.
              Messages are stored for your convenience while you're a member.
            </p>
          </div>
        </Section>

        {/* Download */}
        <Section title="Your Data" icon={Download} delay={0.15}>
          <ActionRow
            label="Download My Data"
            desc="Get a JSON copy of everything we have stored about you"
            icon={Download}
            onClick={handleExport}
            loading={exportLoading}
          />
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" icon={AlertTriangle} delay={0.2}>
          <ActionRow
            label="Delete Account"
            desc="Permanently remove your account and all associated data"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
            danger
          />
        </Section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-gray-300 font-medium mt-2"
        >
          Your privacy is important to us · Made in Hyderabad
        </motion.p>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
            onDeleted={handleAccountDeleted}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}