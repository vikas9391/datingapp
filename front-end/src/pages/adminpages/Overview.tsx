import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, Heart, AlertTriangle, RefreshCw, Loader, X,
  TrendingUp, MessageCircle, ShieldCheck, Crown, ChevronDown, ChevronUp,
  ExternalLink, Globe,
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

// ─── Frontend URL ─────────────────────────────────────────────────────────────
const FRONTEND_URL =
  (import.meta as any).env?.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin.replace(':5174', ':5173') : '#');

// ─── Shared token hook ────────────────────────────────────────────────────────
function useTokens() {
  const { isDark } = useTheme() as any;
  return {
    isDark,
    accentColor : isDark ? "#f97316" : "#1d4ed8",
    accentEmber : isDark ? "#fb923c" : "#3b82f6",
    txPrimary   : isDark ? "#f0e8de" : "#111827",
    txBody      : isDark ? "#c4a882" : "#4b5563",
    txMuted     : isDark ? "#8a6540" : "#9ca3af",
    cardBg      : isDark ? "#1c1c1c" : "#ffffff",
    cardBorder  : isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5",
    cardShadow  : isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)",
    divider     : isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9",
    inputBg     : isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
    inputBorder : isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb",
    ctaGradient : isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    ctaShadow   : isDark ? "0 6px 16px rgba(249,115,22,0.3)" : "0 6px 16px rgba(29,78,216,0.25)",
    errBg       : isDark ? "rgba(244,63,94,0.08)"  : "#fff1f2",
    errBd       : isDark ? "rgba(244,63,94,0.2)"   : "#fecdd3",
    errCl       : isDark ? "#fca5a5" : "#be123c",
    // stat-card backgrounds
    blueBg  : isDark ? "rgba(59,130,246,0.1)"  : "#eff6ff",
    blueCl  : isDark ? "#93c5fd"               : "#1e40af",
    greenBg : isDark ? "rgba(9,207,139,0.1)"   : "#f0fdf4",
    greenCl : isDark ? "#09cf8b"               : "#059669",
    pinkBg  : isDark ? "rgba(244,114,182,0.1)" : "#fdf2f8",
    pinkCl  : isDark ? "#f9a8d4"               : "#be185d",
    redBg   : isDark ? "rgba(244,63,94,0.1)"   : "#fff1f2",
    redCl   : isDark ? "#fca5a5"               : "#be123c",
    purpleBg: isDark ? "rgba(167,139,250,0.1)" : "#f5f3ff",
    purpleCl: isDark ? "#c4b5fd"               : "#5b21b6",
    amberBg : isDark ? "rgba(245,158,11,0.1)"  : "#fffbeb",
    amberCl : isDark ? "#fbbf24"               : "#92400e",
    tealBg  : isDark ? "rgba(9,207,139,0.1)"   : "#f0fdfa",
    tealCl  : isDark ? "#09cf8b"               : "#0d9488",
    regGrad : isDark
      ? "linear-gradient(135deg,#1a0f00,#2a1500)"
      : "linear-gradient(135deg,#0f172a,#1e293b)",
    regBd   : isDark ? "rgba(249,115,22,0.2)" : "transparent",
  };
}

// ─── View Website Button (exported for sidebar use) ───────────────────────────
export const ViewWebsiteButton: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => {
  const t = useTokens();
  return (
    <a href={FRONTEND_URL} target="_blank" rel="noopener noreferrer"
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 no-underline ${collapsed ? 'justify-center' : ''}`}
      style={{ background: t.isDark ? "rgba(249,115,22,0.06)" : "rgba(29,78,216,0.06)", border: `1px solid ${t.isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.15)"}`, color: t.accentColor }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = t.isDark ? "rgba(249,115,22,0.4)" : "rgba(29,78,216,0.35)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = t.isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.15)")}
      title="View Website">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
        style={{ background: t.ctaGradient }}>
        <Globe className="w-3.5 h-3.5 text-white" />
      </div>
      {!collapsed && (
        <>
          <span className="text-sm font-semibold flex-1">View Website</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </>
      )}
    </a>
  );
};

// ─── View Website Banner (shown at top of Overview) ───────────────────────────
const ViewWebsiteBanner: React.FC = () => {
  const t = useTokens();
  return (
    <a href={FRONTEND_URL} target="_blank" rel="noopener noreferrer"
      className="group mx-4 flex items-center gap-3 px-4 py-3 rounded-2xl no-underline transition-all duration-200"
      style={{ background: t.isDark ? "rgba(249,115,22,0.06)" : "rgba(29,78,216,0.04)", border: `1px solid ${t.isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.12)"}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = t.isDark ? "rgba(249,115,22,0.35)" : "rgba(29,78,216,0.3)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = t.isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.12)"; }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
        style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
        <Globe className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black leading-none mb-0.5" style={{ color: t.txPrimary }}>View Website</p>
        <p className="text-xs truncate" style={{ color: t.txMuted }}>{FRONTEND_URL}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: t.isDark ? "rgba(9,207,139,0.1)" : "#f0fdf4", color: t.isDark ? "#09cf8b" : "#059669", border: `1px solid ${t.isDark ? "rgba(9,207,139,0.2)" : "#bbf7d0"}` }}>
          Live
        </span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" style={{ color: t.accentColor }} />
      </div>
    </a>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalUsers: number; activeUsers: number; suspendedUsers: number; bannedUsers: number;
  newUsersToday: number; newUsersWeek: number; newUsersMonth: number;
  totalMatches: number; totalMessages: number; reportsCount: number;
  pendingReports: number; resolvedReports: number; verifiedUsers: number;
  premiumUsers: number; completeProfiles: number;
  accountStatusDistribution: { active: number; pending: number; suspended: number; banned: number };
  recentActions: Array<{ action_type: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode; iconBg: string; iconCl: string;
  value: number; label: string; subLabel?: string; highlight?: boolean;
}> = ({ icon, iconBg, iconCl, value, label, subLabel, highlight }) => {
  const t = useTokens();
  return (
    <motion.div whileHover={{ y: -3, boxShadow: t.isDark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 12px 32px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="rounded-2xl p-3.5 transition-all"
      style={{ background: t.cardBg, border: `1px solid ${highlight ? (t.isDark ? "rgba(244,63,94,0.3)" : "#fecdd3") : t.cardBorder}`, boxShadow: t.cardShadow }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
        style={{ background: iconBg }}>
        <div style={{ color: iconCl }}>{icon}</div>
      </div>
      <p className="text-xl font-black" style={{ color: highlight ? (t.isDark ? "#fca5a5" : "#be123c") : t.txPrimary }}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: t.txBody }}>{label}</p>
      {subLabel && <p className="text-xs mt-0.5" style={{ color: t.txMuted }}>{subLabel}</p>}
    </motion.div>
  );
};

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
const MiniStatCard: React.FC<{ icon: React.ReactNode; iconCl: string; value: string; label: string; subLabel: string }> = ({ icon, iconCl, value, label, subLabel }) => {
  const t = useTokens();
  return (
    <div className="rounded-2xl p-3.5 flex-shrink-0 w-36"
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
      <div className="flex items-center gap-1.5 mb-2">
        <div style={{ color: iconCl }}>{icon}</div>
        <span className="text-xs font-semibold" style={{ color: t.txMuted }}>{label}</span>
      </div>
      <p className="text-lg font-black" style={{ color: t.txPrimary }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: t.txMuted }}>{subLabel}</p>
    </div>
  );
};

// ─── Overview Component ───────────────────────────────────────────────────────
const Overview: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const t = useTokens();

  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [stats, setStats]                 = useState<DashboardStats | null>(null);
  const [lastRefresh, setLastRefresh]     = useState<Date | null>(null);
  const [growthExpanded, setGrowthExpanded] = useState(false);

  const loadStats = async (showNotif = false) => {
    setLoading(true); setError(null);
    try {
      const data = await adminService.adminApiCall<DashboardStats>('/dashboard/stats/');
      setStats(data); setLastRefresh(new Date());
      if (showNotif) showSuccess('Dashboard Refreshed', 'Statistics have been updated successfully');
    } catch {
      const msg = 'Failed to load dashboard statistics';
      setError(msg); showError('Load Failed', msg);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadStats(false); }, []);

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastRefresh.toLocaleTimeString();
  };

  const maxGrowth = stats?.userGrowth ? Math.max(...stats.userGrowth.map(d => d.count), 1) : 1;

  // ── Loading ──
  if (loading && !stats) return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
          <Loader className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium" style={{ color: t.txMuted }}>Loading statistics…</p>
      </div>
    </div>
  );

  // ── Error (no data yet) ──
  if (error && !stats) return (
    <div className="mx-4 mt-4 rounded-2xl p-5" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f43f5e" }} />
        <div>
          <h3 className="text-sm font-black mb-1" style={{ color: t.errCl }}>Error Loading Dashboard</h3>
          <p className="text-sm" style={{ color: t.errCl, opacity: 0.8 }}>{error}</p>
        </div>
      </div>
      <button onClick={() => loadStats(false)}
        className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
        style={{ background: "#f43f5e" }}>
        Try Again
      </button>
    </div>
  );

  if (!stats) return null;

  const statusColors: Record<string, { bar: string; dot: string }> = {
    active:    { bar: t.isDark ? "#09cf8b" : "#4ade80", dot: t.isDark ? "#09cf8b" : "#22c55e" },
    pending:   { bar: t.isDark ? "#93c5fd" : "#60a5fa", dot: t.isDark ? "#93c5fd" : "#3b82f6" },
    suspended: { bar: t.isDark ? "#fde047" : "#facc15", dot: t.isDark ? "#fde047" : "#eab308" },
    banned:    { bar: t.isDark ? "#fca5a5" : "#f87171", dot: t.isDark ? "#fca5a5" : "#ef4444" },
  };

  return (
    <div className="pb-8 space-y-4 transition-colors duration-300">

      {/* Error banner (stats already loaded) */}
      {error && stats && (
        <div className="mx-4 rounded-2xl p-3 flex items-center gap-3"
          style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#f43f5e" }} />
          <p className="text-xs flex-1" style={{ color: t.errCl }}>{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4" style={{ color: t.errCl }} /></button>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-2 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-black" style={{ color: t.txPrimary }}>Overview</h2>
          {lastRefresh && <p className="text-xs mt-0.5" style={{ color: t.txMuted }}>Updated {formatLastRefresh()}</p>}
        </div>
        <motion.button onClick={() => loadStats(true)} disabled={loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-50 shrink-0"
          style={{ background: t.ctaGradient }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading' : 'Refresh'}
        </motion.button>
      </div>

      {/* View Website Banner */}
      <ViewWebsiteBanner />

      {/* Primary stats — 2×2 */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5" />} iconBg={t.blueBg}  iconCl={t.blueCl}
          value={stats.totalUsers}    label="Total Users"     subLabel={`+${stats.newUsersToday} today`} />
        <StatCard
          icon={<Activity className="w-5 h-5" />} iconBg={t.greenBg} iconCl={t.greenCl}
          value={stats.activeUsers}   label="Active Now"
          subLabel={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% online`} />
        <StatCard
          icon={<Heart className="w-5 h-5" />} iconBg={t.pinkBg}  iconCl={t.pinkCl}
          value={stats.totalMatches}  label="Matches"
          subLabel={`avg ${stats.totalUsers > 0 ? (stats.totalMatches / stats.totalUsers).toFixed(1) : 0}/user`} />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />} iconBg={t.redBg} iconCl={t.redCl}
          value={stats.pendingReports} label="Pending Reports" subLabel={`${stats.reportsCount} total`}
          highlight={stats.pendingReports > 0} />
      </div>

      {/* New Registrations banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="mx-4 rounded-2xl p-4 relative overflow-hidden"
        style={{ background: t.regGrad, border: `1px solid ${t.regBd}` }}>
        {/* ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-32 rounded-full"
            style={{ background: t.isDark ? "rgba(249,115,22,0.12)" : "rgba(59,130,246,0.15)", filter: "blur(60px)" }} />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
            New Registrations
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { value: `+${stats.newUsersToday}`,  label: "Today"      },
              { value: `+${stats.newUsersWeek}`,   label: "This Week"  },
              { value: `+${stats.newUsersMonth}`,  label: "This Month" },
            ].map((s, i) => (
              <div key={i} className={i === 1 ? "border-l border-r border-white/20" : ""}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mini stat scroll row */}
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <MiniStatCard icon={<MessageCircle className="w-4 h-4" />} iconCl={t.purpleCl}
            value={stats.totalMessages.toLocaleString()} label="Messages"
            subLabel={`${stats.totalUsers > 0 ? Math.round(stats.totalMessages / stats.totalUsers) : 0} avg`} />
          <MiniStatCard icon={<ShieldCheck className="w-4 h-4" />} iconCl={t.blueCl}
            value={stats.verifiedUsers.toString()} label="Verified"
            subLabel={`${stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%`} />
          <MiniStatCard icon={<Crown className="w-4 h-4" />} iconCl={t.amberCl}
            value={stats.premiumUsers.toString()} label="Premium"
            subLabel={`${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%`} />
          <MiniStatCard icon={<TrendingUp className="w-4 h-4" />} iconCl={t.tealCl}
            value={stats.completeProfiles.toString()} label="Complete" subLabel="profiles" />
        </div>
      </div>

      {/* Account Status */}
      <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mx-4 rounded-2xl p-4"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <h3 className="text-sm font-black mb-3" style={{ color: t.txPrimary }}>Account Status</h3>
        <div className="space-y-2.5">
          {Object.entries(stats.accountStatusDistribution || {}).map(([key, count]) => {
            const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
            const c = statusColors[key] ?? { bar: t.txMuted, dot: t.txMuted };
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                    <span className="text-xs capitalize" style={{ color: t.txBody }}>{key}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black" style={{ color: t.txPrimary }}>{count}</span>
                    <span className="text-xs" style={{ color: t.txMuted }}>({pct}%)</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: c.bar }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* User Growth (collapsible) */}
      <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mx-4 rounded-2xl overflow-hidden"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
        <button onClick={() => setGrowthExpanded(v => !v)}
          className="w-full flex items-center justify-between p-4 transition-colors"
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = t.isDark ? "rgba(249,115,22,0.03)" : "#fafafa")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
          <h3 className="text-sm font-black" style={{ color: t.txPrimary }}>User Growth (7 Days)</h3>
          {growthExpanded
            ? <ChevronUp className="w-4 h-4" style={{ color: t.txMuted }} />
            : <ChevronDown className="w-4 h-4" style={{ color: t.txMuted }} />
          }
        </button>

        {growthExpanded && (
          <div className="px-4 pb-4" style={{ borderTop: `1px solid ${t.divider}` }}>
            {(stats.userGrowth || []).length > 0 ? (
              <div className="space-y-2 pt-3">
                {stats.userGrowth.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs w-20 shrink-0" style={{ color: t.txMuted }}>{item.date}</span>
                    <div className="flex-1 rounded-full h-2 overflow-hidden"
                      style={{ background: t.isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max((item.count / maxGrowth) * 100, 2)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        style={{ background: t.isDark ? "#f97316" : "#1d4ed8" }} />
                    </div>
                    <span className="text-xs font-black w-5 text-right shrink-0" style={{ color: t.txPrimary }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-center py-6" style={{ color: t.txMuted }}>No growth data available</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Overview;