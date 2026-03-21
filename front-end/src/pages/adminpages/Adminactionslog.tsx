import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader, AlertTriangle, X, RefreshCw, Filter } from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

interface AdminAction {
  id: number;
  admin: number;
  admin_username: string;
  target_user: number;
  target_username: string;
  action_type: 'suspend' | 'ban' | 'activate' | 'delete' | 'verify' | 'warn';
  reason: string;
  created_at: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const AdminActionsLog: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { isDark } = useTheme() as any;

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [actionsPage, setActionsPage]   = useState(1);
  const [actionsPagination, setActionsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [adminFilter, setAdminFilter]           = useState('');
  const [lastRefresh, setLastRefresh]           = useState<Date | null>(null);

  /* ─── Theme tokens ─── */
  const pageBg       = isDark ? "#0d0d0d"                 : "#f8faff";
  const cardBg       = isDark ? "#1c1c1c"                 : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)"   : "#f1f1f5";
  const cardShadow   = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)";
  const txPrimary    = isDark ? "#f0e8de"                 : "#111827";
  const txBody       = isDark ? "#c4a882"                 : "#4b5563";
  const txMuted      = isDark ? "#8a6540"                 : "#9ca3af";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)"   : "#f1f5f9";
  const accentColor  = isDark ? "#f97316"                 : "#1d4ed8";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ctaShadow    = isDark ? "0 6px 16px rgba(249,115,22,0.3)" : "0 6px 16px rgba(29,78,216,0.25)";

  const inputBg     = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const inputBorder = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const inputFocus  = isDark ? "#f97316"                : "#1d4ed8";
  const inputCl     = isDark ? "#f0e8de"                : "#111827";

  const theadBg     = isDark ? "rgba(255,255,255,0.03)" : "#f9fafb";
  const theadCl     = isDark ? "#4a3520"                : "#9ca3af";
  const rowHoverBg  = isDark ? "rgba(249,115,22,0.03)"  : "#fafafa";

  const paginBtnBg  = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const paginBtnBd  = isDark ? "rgba(249,115,22,0.18)"  : "#e5e7eb";
  const paginBtnCl  = isDark ? "#c4a882"                : "#374151";
  const paginBtnDis = isDark ? "rgba(255,255,255,0.02)" : "#f9fafb";

  const filterHeadCl = isDark ? "#8a6540" : "#6b7280";
  const clearLinkCl  = accentColor;

  const errBg  = isDark ? "rgba(244,63,94,0.08)"   : "#fff1f2";
  const errBd  = isDark ? "rgba(244,63,94,0.2)"    : "#fecdd3";
  const errCl  = isDark ? "#fca5a5"                : "#be123c";

  /* ─── Action badge styles ─── */
  const actionBadge = (type: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      ban:      { bg: isDark ? "rgba(244,63,94,0.12)"   : "#fff1f2",  color: isDark ? "#fca5a5"  : "#be123c"  },
      suspend:  { bg: isDark ? "rgba(234,179,8,0.12)"   : "#fefce8",  color: isDark ? "#fde047"  : "#854d0e"  },
      activate: { bg: isDark ? "rgba(9,207,139,0.12)"   : "#f0fdf4",  color: isDark ? "#09cf8b"  : "#166534"  },
      verify:   { bg: isDark ? "rgba(59,130,246,0.12)"  : "#eff6ff",  color: isDark ? "#93c5fd"  : "#1e40af"  },
      delete:   { bg: isDark ? "rgba(244,63,94,0.12)"   : "#fff1f2",  color: isDark ? "#fca5a5"  : "#be123c"  },
      warn:     { bg: isDark ? "rgba(167,139,250,0.12)" : "#f5f3ff",  color: isDark ? "#c4b5fd"  : "#5b21b6"  },
    };
    return map[type] || { bg: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", color: isDark ? "#c4a882" : "#374151" };
  };

  /* ─── Stat card colors ─── */
  const statCards = [
    { label: "Total",        key: "total",    bg: isDark ? "rgba(249,115,22,0.08)"  : "#f9fafb",  bd: isDark ? "rgba(249,115,22,0.2)"  : "#f1f5f9",  cl: isDark ? "#f97316" : "#111827" },
    { label: "Bans",         key: "ban",      bg: isDark ? "rgba(244,63,94,0.08)"   : "#fff1f2",  bd: isDark ? "rgba(244,63,94,0.2)"   : "#fecdd3",  cl: isDark ? "#fca5a5" : "#be123c" },
    { label: "Suspensions",  key: "suspend",  bg: isDark ? "rgba(234,179,8,0.08)"   : "#fefce8",  bd: isDark ? "rgba(234,179,8,0.2)"   : "#fef08a",  cl: isDark ? "#fde047" : "#854d0e" },
    { label: "Activations",  key: "activate", bg: isDark ? "rgba(9,207,139,0.08)"   : "#f0fdf4",  bd: isDark ? "rgba(9,207,139,0.2)"   : "#bbf7d0",  cl: isDark ? "#09cf8b" : "#166534" },
    { label: "Verifications",key: "verify",   bg: isDark ? "rgba(59,130,246,0.08)"  : "#eff6ff",  bd: isDark ? "rgba(59,130,246,0.2)"  : "#bfdbfe",  cl: isDark ? "#93c5fd" : "#1e40af" },
    { label: "Warnings",     key: "warn",     bg: isDark ? "rgba(167,139,250,0.08)" : "#f5f3ff",  bd: isDark ? "rgba(167,139,250,0.2)" : "#e9d5ff",  cl: isDark ? "#c4b5fd" : "#5b21b6" },
    { label: "Deletions",    key: "delete",   bg: isDark ? "rgba(244,63,94,0.08)"   : "#fff1f2",  bd: isDark ? "rgba(244,63,94,0.2)"   : "#fecdd3",  cl: isDark ? "#fca5a5" : "#be123c" },
  ];

  const loadAdminActions = async (page = 1, showNotification = false) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), page_size: '20' });
      if (actionTypeFilter !== 'all') params.append('action_type', actionTypeFilter);
      if (adminFilter.trim()) params.append('admin_username', adminFilter.trim());

      const data = await adminService.adminApiCall<{ results: AdminAction[]; count: number; next: string | null; previous: string | null }>(
        `/actions/?${params.toString()}`
      );
      setAdminActions(data.results || []);
      setActionsPagination({ count: data.count || 0, next: data.next, previous: data.previous });
      setActionsPage(page);
      setLastRefresh(new Date());
      if (showNotification) showSuccess('Log Refreshed', 'Admin actions log has been updated');
    } catch (err) {
      const msg = 'Failed to load admin actions';
      setError(msg); showError('Load Failed', msg);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAdminActions(1, false); }, []);
  useEffect(() => {
    const t = setTimeout(() => loadAdminActions(1, false), 500);
    return () => clearTimeout(t);
  }, [actionTypeFilter, adminFilter]);

  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString() : 'N/A';

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return lastRefresh.toLocaleString();
  };

  const getStats = () => {
    const s: Record<string, number> = { total: actionsPagination.count, ban: 0, suspend: 0, activate: 0, verify: 0, delete: 0, warn: 0 };
    adminActions.forEach(a => { if (a.action_type in s) s[a.action_type]++; });
    return s;
  };
  const stats = getStats();

  if (loading && adminActions.length === 0) return (
    <div className="flex items-center justify-center py-12 transition-colors duration-300" style={{ background: pageBg }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: ctaGradient, boxShadow: ctaShadow }}>
          <Loader className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium" style={{ color: txMuted }}>Loading admin actions log…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 transition-colors duration-300">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: txPrimary }}>Admin Actions Log</h2>
          <p className="text-sm mt-1" style={{ color: txMuted }}>
            View all administrative actions
            {lastRefresh && (
              <span className="ml-2" style={{ color: isDark ? "#4a3520" : "#d1d5db" }}>
                · Last updated: {formatLastRefresh()}
              </span>
            )}
          </p>
        </div>
        <motion.button
          onClick={() => loadAdminActions(actionsPage, true)}
          disabled={loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ background: ctaGradient, boxShadow: ctaShadow }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </motion.button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((s, i) => (
          <motion.div key={s.key}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl p-4"
            style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: s.cl, opacity: 0.8 }}>{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.cl }}>{stats[s.key] ?? 0}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: errBg, border: `1px solid ${errBd}` }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#f43f5e" }} />
            <p className="text-sm flex-1" style={{ color: errCl }}>{error}</p>
            <button onClick={() => setError(null)}><X className="w-4 h-4" style={{ color: errCl }} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[20px] p-6"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" style={{ color: txMuted }} />
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: filterHeadCl }}>Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: txMuted }}>Action Type</label>
            <select value={actionTypeFilter} onChange={e => setActionTypeFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl outline-none transition-all"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputCl }}
              onFocus={e => (e.currentTarget.style.borderColor = inputFocus)}
              onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}>
              <option value="all">All Actions</option>
              {["ban","suspend","activate","verify","warn","delete"].map(v => (
                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: txMuted }}>Admin Username</label>
            <input type="text" value={adminFilter} onChange={e => setAdminFilter(e.target.value)}
              placeholder="Filter by admin…"
              className="w-full px-4 py-2 rounded-xl outline-none transition-all"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputCl }}
              onFocus={e => (e.currentTarget.style.borderColor = inputFocus)}
              onBlur={e => (e.currentTarget.style.borderColor = inputBorder)} />
          </div>
        </div>
        {(actionTypeFilter !== 'all' || adminFilter) && (
          <div className="mt-4">
            <button onClick={() => { setActionTypeFilter('all'); setAdminFilter(''); }}
              className="text-sm font-semibold hover:underline" style={{ color: clearLinkCl }}>
              Clear filters
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[20px] overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: theadBg, borderBottom: `1px solid ${dividerColor}` }}>
                {["Admin","Target User","Action","Reason","Date"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider"
                    style={{ color: theadCl }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && adminActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: txMuted }} />
                    <p className="text-sm" style={{ color: txMuted }}>Loading actions…</p>
                  </td>
                </tr>
              ) : adminActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: isDark ? "#4a3520" : "#e5e7eb" }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: txBody }}>No admin actions found</p>
                    <p className="text-xs" style={{ color: txMuted }}>
                      {actionTypeFilter !== 'all' || adminFilter
                        ? 'Try adjusting your filters'
                        : 'Actions will appear here once admins perform moderation tasks'}
                    </p>
                  </td>
                </tr>
              ) : (
                adminActions.map((action, i) => {
                  const badge = actionBadge(action.action_type);
                  return (
                    <tr key={action.id}
                      style={{ borderBottom: `1px solid ${dividerColor}` }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = rowHoverBg)}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold" style={{ color: txPrimary }}>{action.admin_username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: txBody }}>{action.target_username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ background: badge.bg, color: badge.color }}>
                          {action.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <span className="text-sm line-clamp-2" style={{ color: txBody }}>
                          {action.reason || <span className="italic" style={{ color: txMuted }}>No reason provided</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: txMuted }}>{formatDateTime(action.created_at)}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {actionsPagination.count > 0 && (
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${dividerColor}` }}>
            <p className="text-sm" style={{ color: txMuted }}>
              Showing {((actionsPage - 1) * 20) + 1} to {Math.min(actionsPage * 20, actionsPagination.count)} of{" "}
              <span className="font-semibold" style={{ color: txPrimary }}>{actionsPagination.count}</span>{" "}
              action{actionsPagination.count !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              {["Previous","Next"].map((label, i) => {
                const disabled = i === 0 ? !actionsPagination.previous || loading : !actionsPagination.next || loading;
                return (
                  <button key={label}
                    onClick={() => loadAdminActions(actionsPage + (i === 0 ? -1 : 1), false)}
                    disabled={disabled}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: disabled ? paginBtnDis : paginBtnBg, border: `1px solid ${paginBtnBd}`, color: paginBtnCl }}
                    onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.borderColor = accentColor; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = paginBtnBd; }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminActionsLog;