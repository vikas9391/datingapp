import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, UserX, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/layout/TopBar";

const TEAL  = "#02b2f6";
const GREEN = "#09cf8b";
const GRADIENT = "linear-gradient(135deg,#02b2f6,#09cf8b)";
const API = "http://127.0.0.1:8000/api";

interface BlockedUser {
  email: string;
  first_name: string;
  blocked_at: string;
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg,rgba(2,178,246,0.1),rgba(9,207,139,0.1))" }}
      >
        <Shield size={36} style={{ color: TEAL }} />
      </div>
      <p className="text-[17px] font-black text-gray-800 mb-2">No Blocked Users</p>
      <p className="text-[13px] text-gray-400 leading-relaxed max-w-xs">
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
}: {
  user: BlockedUser;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
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
        className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm z-10 overflow-hidden"
      >
        <div className="h-1.5 w-full" style={{ background: GRADIENT }} />
        <div className="p-7">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,rgba(2,178,246,0.12),rgba(9,207,139,0.12))" }}
            >
              <UserX size={22} style={{ color: TEAL }} />
            </div>
            <div>
              <p className="text-[17px] font-black text-gray-900">Unblock {user.first_name}?</p>
              <p className="text-[12px] text-gray-400 mt-1">
                They'll be able to appear in your recommendations again.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-[13px] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-11 rounded-xl font-bold text-[13px] text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: GRADIENT }}
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
  const [blocked, setBlocked]           = useState<BlockedUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [pendingUser, setPendingUser]   = useState<BlockedUser | null>(null);
  const [unblocking, setUnblocking]     = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans">
      <TopBar userName="" />

      <div className="max-w-2xl mx-auto px-4 pt-24 md:pt-28 pb-12">
        {/* Page heading */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight">
              Blocked Users
            </h1>
            {!loading && blocked.length > 0 && (
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {blocked.length} {blocked.length === 1 ? "person" : "people"} blocked
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[20px] border border-gray-100 p-4 animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded-full w-28" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-40" />
                </div>
                <div className="w-20 h-8 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : blocked.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden"
          >
            <AnimatePresence initial={false}>
              {blocked.map((user, idx) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    idx !== blocked.length - 1 ? "border-b border-gray-50" : ""
                  } hover:bg-gray-50/50 transition-colors`}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white flex-shrink-0 shadow-sm"
                    style={{ background: GRADIENT }}
                  >
                    {user.first_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-800 leading-tight truncate">
                      {user.first_name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      Blocked {formatDate(user.blocked_at)}
                    </p>
                  </div>

                  {/* Unblock button */}
                  <button
                    onClick={() => setPendingUser(user)}
                    className="flex-shrink-0 h-8 px-3 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:border-teal-400 hover:text-teal-500 transition-colors bg-white"
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
            className="flex items-start gap-3 mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100"
          >
            <Shield size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
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