import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string; type: ToastType; title: string; message?: string; duration?: number;
}

interface ConfirmOptions {
  title: string; message: string; confirmText?: string; cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface NotificationContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showSuccess: (title: string, message?: string) => void;
  showError:   (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo:    (title: string, message?: string) => void;
  confirm: (options: ConfirmOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

// ─── Toast Item ───────────────────────────────────────────────────────────────
const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const { isDark } = useTheme() as any;

  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
  const Icon = icons[toast.type];

  // Dark mode uses translucent tints matching the app's token system;
  // Light mode uses soft pastels.
  const styles: Record<ToastType, { bg: string; border: string; iconCl: string; titleCl: string; msgCl: string }> = {
    success: {
      bg:      isDark ? "rgba(9,207,139,0.1)"   : "#f0fdf4",
      border:  isDark ? "rgba(9,207,139,0.25)"   : "#bbf7d0",
      iconCl:  isDark ? "#09cf8b"               : "#059669",
      titleCl: isDark ? "#f0e8de"               : "#14532d",
      msgCl:   isDark ? "#c4a882"               : "#166534",
    },
    error: {
      bg:      isDark ? "rgba(244,63,94,0.1)"   : "#fff1f2",
      border:  isDark ? "rgba(244,63,94,0.25)"  : "#fecdd3",
      iconCl:  isDark ? "#fca5a5"               : "#f43f5e",
      titleCl: isDark ? "#f0e8de"               : "#881337",
      msgCl:   isDark ? "#c4a882"               : "#be123c",
    },
    warning: {
      bg:      isDark ? "rgba(245,158,11,0.1)"  : "#fefce8",
      border:  isDark ? "rgba(245,158,11,0.25)" : "#fde68a",
      iconCl:  isDark ? "#fbbf24"               : "#d97706",
      titleCl: isDark ? "#f0e8de"               : "#713f12",
      msgCl:   isDark ? "#c4a882"               : "#92400e",
    },
    info: {
      bg:      isDark ? "rgba(59,130,246,0.1)"  : "#eff6ff",
      border:  isDark ? "rgba(59,130,246,0.25)" : "#bfdbfe",
      iconCl:  isDark ? "#93c5fd"               : "#2563eb",
      titleCl: isDark ? "#f0e8de"               : "#1e3a8a",
      msgCl:   isDark ? "#c4a882"               : "#1e40af",
    },
  };

  const s = styles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="rounded-2xl shadow-xl p-4 mb-3 min-w-[320px] max-w-md"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: s.iconCl }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black" style={{ color: s.titleCl }}>{toast.title}</p>
          {toast.message && (
            <p className="text-sm mt-1" style={{ color: s.msgCl }}>{toast.message}</p>
          )}
        </div>
        <button onClick={() => onClose(toast.id)}
          className="p-1 rounded-lg transition-colors flex-shrink-0"
          style={{ color: s.iconCl }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal: React.FC<{ options: ConfirmOptions; onClose: () => void }> = ({ options, onClose }) => {
  const { isDark } = useTheme() as any;
  const [loading, setLoading] = useState(false);

  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(15,23,42,0.15)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const divider      = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";
  const cancelBg     = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cancelBd     = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const cancelCl     = isDark ? "#c4a882"                : "#374151";

  const typeConfig = {
    danger: {
      iconBg:   isDark ? "rgba(244,63,94,0.12)"  : "#fff1f2",
      iconCl:   "#f43f5e",
      btnBg:    "linear-gradient(135deg,#f43f5e,#ef4444)",
      btnShadow:"0 6px 16px rgba(244,63,94,0.3)",
      Icon:     XCircle,
    },
    warning: {
      iconBg:   isDark ? "rgba(245,158,11,0.12)"  : "#fefce8",
      iconCl:   "#f59e0b",
      btnBg:    "linear-gradient(135deg,#f59e0b,#d97706)",
      btnShadow:"0 6px 16px rgba(245,158,11,0.3)",
      Icon:     AlertCircle,
    },
    info: {
      iconBg:   isDark ? "rgba(59,130,246,0.12)"  : "#eff6ff",
      iconCl:   isDark ? "#93c5fd" : "#2563eb",
      btnBg:    isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
      btnShadow: isDark ? "0 6px 16px rgba(249,115,22,0.3)" : "0 6px 16px rgba(29,78,216,0.25)",
      Icon:     Info,
    },
  };

  const type = options.type || 'info';
  const cfg  = typeConfig[type];
  const Icon = cfg.Icon;

  const handleConfirm = async () => {
    setLoading(true);
    try { await options.onConfirm(); onClose(); }
    catch (err) { console.error('Confirm action failed:', err); }
    finally { setLoading(false); }
  };

  const handleCancel = () => { options.onCancel?.(); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="max-w-md w-full rounded-[28px] overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
      >
        {/* Icon */}
        <div className="p-6 pb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: cfg.iconBg }}>
            <Icon className="w-7 h-7" style={{ color: cfg.iconCl }} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-lg font-black mb-2" style={{ color: txPrimary }}>{options.title}</h3>
          <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: txBody }}>{options.message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3" style={{ borderTop: `1px solid ${divider}`, paddingTop: "16px" }}>
          <button onClick={handleCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: cancelBg, border: `1px solid ${cancelBd}`, color: cancelCl }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.07)" : "#f9fafb")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = cancelBg)}>
            {options.cancelText || 'Cancel'}
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: cfg.btnBg, boxShadow: cfg.btnShadow }}>
            {loading ? 'Processing…' : (options.confirmText || 'Confirm')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const showSuccess = useCallback((t: string, m?: string) => showToast('success', t, m), [showToast]);
  const showError   = useCallback((t: string, m?: string) => showToast('error',   t, m, 7000), [showToast]);
  const showWarning = useCallback((t: string, m?: string) => showToast('warning', t, m), [showToast]);
  const showInfo    = useCallback((t: string, m?: string) => showToast('info',    t, m), [showToast]);
  const confirm     = useCallback((options: ConfirmOptions) => setConfirmOptions(options), []);
  const closeConfirm = useCallback(() => setConfirmOptions(null), []);

  return (
    <NotificationContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo, confirm }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {toasts.map(toast => (
              <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmOptions && (
          <ConfirmModal options={confirmOptions} onClose={closeConfirm} />
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};