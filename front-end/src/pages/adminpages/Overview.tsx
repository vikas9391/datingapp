import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Heart, AlertTriangle, RefreshCw, Loader, X,
  TrendingUp, MessageCircle, ShieldCheck, Crown, ChevronDown, ChevronUp,
  ExternalLink, Globe,
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';

// ─── IMPORTANT: paste this into your sidebar/left-panel component ─────────────
//
// import { ViewWebsiteButton } from './Overview';   // or wherever you export from
//
// Then inside your sidebar JSX (near the bottom, above logout):
//
//   <ViewWebsiteButton />
//
// It reads VITE_FRONTEND_URL from your .env (same origin as the dating app).
// Falls back to window.location.origin if not set.
// ─────────────────────────────────────────────────────────────────────────────

const FRONTEND_URL =
  (import.meta as any).env?.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin.replace(':5174', ':5173') : '#');

// ── Exported so the sidebar can import it directly ────────────────────────────
export const ViewWebsiteButton: React.FC<{ collapsed?: boolean }> = ({ collapsed = false }) => (
  <a
    href={FRONTEND_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      group flex items-center gap-3 px-3 py-2.5 rounded-xl
      bg-gradient-to-r from-teal-500/10 to-blue-500/10
      border border-teal-200/60 hover:border-teal-400/80
      text-teal-700 hover:text-teal-800
      transition-all duration-200 hover:shadow-sm hover:shadow-teal-500/10
      ${collapsed ? 'justify-center' : ''}
    `}
    title="View Website"
  >
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
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

// ── Small inline banner used at the top of Overview (always visible) ──────────
const ViewWebsiteBanner: React.FC = () => (
  <a
    href={FRONTEND_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="
      group mx-4 flex items-center gap-3 px-4 py-3 rounded-2xl
      bg-gradient-to-r from-teal-50 via-white to-blue-50
      border border-teal-100 hover:border-teal-300
      shadow-sm hover:shadow-md hover:shadow-teal-500/10
      transition-all duration-200
    "
  >
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
      <Globe className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">View Website</p>
      <p className="text-xs text-gray-400 truncate">{FRONTEND_URL}</p>
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
        Live
      </span>
      <ExternalLink className="w-4 h-4 text-teal-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </div>
  </a>
);

// ─────────────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalMatches: number;
  totalMessages: number;
  reportsCount: number;
  pendingReports: number;
  resolvedReports: number;
  verifiedUsers: number;
  premiumUsers: number;
  completeProfiles: number;
  accountStatusDistribution: {
    active: number;
    pending: number;
    suspended: number;
    banned: number;
  };
  recentActions: Array<{ action_type: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
}

const Overview: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [growthExpanded, setGrowthExpanded] = useState(false);

  const loadDashboardStats = async (showNotification: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.adminApiCall<DashboardStats>('/dashboard/stats/');
      setStats(data);
      setLastRefresh(new Date());
      if (showNotification) {
        showSuccess('Dashboard Refreshed', 'Statistics have been updated successfully');
      }
    } catch (err) {
      const errorMsg = 'Failed to load dashboard statistics';
      setError(errorMsg);
      showError('Load Failed', errorMsg);
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats(false);
  }, []);

  const formatLastRefresh = (): string => {
    if (!lastRefresh) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return lastRefresh.toLocaleTimeString();
  };

  const maxGrowth = stats?.userGrowth
    ? Math.max(...stats.userGrowth.map(d => d.count), 1)
    : 1;

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Dashboard</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={() => loadDashboardStats(false)}
          className="w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="pb-8 space-y-4">

      {/* Error Banner */}
      {error && stats && (
        <div className="mx-4 bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-xs text-red-800 flex-1">{error}</p>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-2 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Overview</h2>
          {lastRefresh && (
            <p className="text-xs text-gray-400 mt-0.5">Updated {formatLastRefresh()}</p>
          )}
        </div>
        <button
          onClick={() => loadDashboardStats(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-teal-500 text-white rounded-xl font-semibold text-sm hover:bg-teal-600 transition disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading' : 'Refresh'}
        </button>
      </div>

      {/* ── View Website Banner ── */}
      <ViewWebsiteBanner />

      {/* Primary Stats — 2×2 grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          bgColor="bg-blue-50"
          value={stats.totalUsers}
          label="Total Users"
          subLabel={`+${stats.newUsersToday} today`}
        />
        <StatCard
          icon={<Activity className="w-5 h-5 text-green-500" />}
          bgColor="bg-green-50"
          value={stats.activeUsers}
          label="Active Now"
          subLabel={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% online`}
        />
        <StatCard
          icon={<Heart className="w-5 h-5 text-pink-500" />}
          bgColor="bg-pink-50"
          value={stats.totalMatches}
          label="Matches"
          subLabel={`avg ${stats.totalUsers > 0 ? (stats.totalMatches / stats.totalUsers).toFixed(1) : 0}/user`}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          bgColor="bg-red-50"
          value={stats.pendingReports}
          label="Pending Reports"
          subLabel={`${stats.reportsCount} total`}
          highlight={stats.pendingReports > 0}
        />
      </div>

      {/* New Registrations */}
      <div className="mx-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-3">
          New Registrations
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">+{stats.newUsersToday}</p>
            <p className="text-xs opacity-75 mt-0.5">Today</p>
          </div>
          <div className="border-l border-r border-white/20">
            <p className="text-2xl font-bold">+{stats.newUsersWeek}</p>
            <p className="text-xs opacity-75 mt-0.5">This Week</p>
          </div>
          <div>
            <p className="text-2xl font-bold">+{stats.newUsersMonth}</p>
            <p className="text-xs opacity-75 mt-0.5">This Month</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <MiniStatCard
            icon={<MessageCircle className="w-4 h-4 text-purple-500" />}
            value={stats.totalMessages.toLocaleString()}
            label="Messages"
            subLabel={`${stats.totalUsers > 0 ? Math.round(stats.totalMessages / stats.totalUsers) : 0} avg`}
          />
          <MiniStatCard
            icon={<ShieldCheck className="w-4 h-4 text-blue-500" />}
            value={stats.verifiedUsers.toString()}
            label="Verified"
            subLabel={`${stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%`}
          />
          <MiniStatCard
            icon={<Crown className="w-4 h-4 text-amber-500" />}
            value={stats.premiumUsers.toString()}
            label="Premium"
            subLabel={`${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%`}
          />
          <MiniStatCard
            icon={<TrendingUp className="w-4 h-4 text-teal-500" />}
            value={stats.completeProfiles.toString()}
            label="Complete"
            subLabel="profiles"
          />
        </div>
      </div>

      {/* Account Status */}
      <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Account Status</h3>
        <div className="space-y-2.5">
          {Object.entries(stats.accountStatusDistribution || {}).map(([key, count]) => {
            const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
            const colors: Record<string, { bar: string; dot: string }> = {
              active:    { bar: 'bg-green-400',  dot: 'bg-green-500' },
              pending:   { bar: 'bg-blue-400',   dot: 'bg-blue-500' },
              suspended: { bar: 'bg-yellow-400', dot: 'bg-yellow-500' },
              banned:    { bar: 'bg-red-400',    dot: 'bg-red-500' },
            };
            const c = colors[key] ?? { bar: 'bg-gray-400', dot: 'bg-gray-500' };
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className="text-xs text-gray-600 capitalize">{key}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-400">({pct}%)</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Growth — collapsible */}
      <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setGrowthExpanded(v => !v)}
          className="w-full flex items-center justify-between p-4"
        >
          <h3 className="text-sm font-bold text-gray-900">User Growth (7 Days)</h3>
          {growthExpanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </button>

        {growthExpanded && (
          <div className="px-4 pb-4">
            {(stats.userGrowth || []).length > 0 ? (
              <div className="space-y-2">
                {stats.userGrowth.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-20 shrink-0">{item.date}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max((item.count / maxGrowth) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-5 text-right shrink-0">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No growth data available</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  bgColor: string;
  value: number;
  label: string;
  subLabel?: string;
  highlight?: boolean;
}> = ({ icon, bgColor, value, label, subLabel, highlight }) => (
  <div className={`bg-white rounded-2xl border ${highlight ? 'border-red-300' : 'border-gray-100'} shadow-sm p-3.5`}>
    <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center mb-2`}>
      {icon}
    </div>
    <p className={`text-xl font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
      {value.toLocaleString()}
    </p>
    <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
    {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
  </div>
);

// ─── Mini Stat Card ───────────────────────────────────────────────────────────
const MiniStatCard: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
  subLabel: string;
}> = ({ icon, value, label, subLabel }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex-shrink-0 w-36">
    <div className="flex items-center gap-1.5 mb-2">
      {icon}
      <span className="text-xs font-semibold text-gray-500">{label}</span>
    </div>
    <p className="text-lg font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
  </div>
);

export default Overview;