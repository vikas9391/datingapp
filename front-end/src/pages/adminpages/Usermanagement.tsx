import React, { useState, useEffect } from 'react';
import {
  Users, Search, Download, Eye, Ban, CheckCircle, XCircle, Loader,
  MapPin, UserCheck, Trash2, AlertTriangle, X, Crown, Calendar, DollarSign
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

interface UserProfile {
  user: User;
  username: string;
  email: string;
  phone: string | null;
  gender: string | null;
  age: number | null;
  location: string | null;
  status: 'online' | 'away' | 'offline';
  account_status: 'active' | 'suspended' | 'banned' | 'pending';
  join_date: string;
  last_active: string;
  active_time: number | null;
  matches: number | null;
  messages: number | null;
  photo_count: number | null;
  reports: number | null;
  profile_complete: boolean;
  verified: boolean;
  premium: boolean;
  premium_expiry: string | null;
  first_name: string | null;
  date_of_birth: string | null;
  bio: string | null;
  interests: string | null;
}

interface Report {
  id: number;
  reporter: number;
  reporter_username: string;
  reported_user: number;
  reported_username: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  reviewed_by_username: string | null;
  admin_notes: string;
}

interface AdminAction {
  id: number;
  admin: number;
  admin_username: string;
  target_user: number;
  target_username: string;
  action_type: 'suspend' | 'ban' | 'activate' | 'delete' | 'verify' | 'warn' | 'grant_premium' | 'revoke_premium';
  reason: string;
  created_at: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

interface UserDetailsResponse {
  profile: UserProfile;
  reports_made: Report[];
  reports_received: Report[];
  admin_actions: AdminAction[];
}

// ─── Theme tokens ─────────────────────────────────────────────────────────

const useTokens = (isDark: boolean) => ({
  accentColor:   isDark ? '#f97316' : '#1d4ed8',
  cardBg:        isDark ? '#1c1c1c' : '#ffffff',
  cardBorder:    isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  cardShadow:    isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(15,23,42,0.08)',
  rowBg:         isDark ? '#161616' : '#f9fafb',
  rowHover:      isDark ? 'rgba(249,115,22,0.04)' : '#f8faff',
  txPrimary:     isDark ? '#f0e8de' : '#111827',
  txBody:        isDark ? '#c4a882' : '#4b5563',
  txMuted:       isDark ? '#8a6540' : '#9ca3af',
  labelColor:    isDark ? '#c4a882' : '#374151',
  inputBg:       isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  inputBorder:   isDark ? 'rgba(249,115,22,0.22)' : '#e5e7eb',
  ctaGradient:   isDark ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
  divider:       isDark ? 'rgba(249,115,22,0.1)' : '#f1f5f9',
  theadBg:       isDark ? '#141414' : '#f9fafb',
  theadTx:       isDark ? '#8a6540' : '#6b7280',
  modalOverlay:  'rgba(0,0,0,0.72)',
  dangerBg:      isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
  dangerBorder:  isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  dangerText:    isDark ? '#fca5a5' : '#b91c1c',
  warnBg:        isDark ? 'rgba(251,191,36,0.1)' : '#fffbeb',
  warnBorder:    isDark ? 'rgba(251,191,36,0.3)' : '#fde68a',
  warnText:      isDark ? '#fde68a' : '#92400e',
  successBg:     isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4',
  successBorder: isDark ? 'rgba(16,185,129,0.3)' : '#bbf7d0',
  successText:   isDark ? '#6ee7b7' : '#166534',
  infoBg:        isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
  infoBorder:    isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe',
  infoText:      isDark ? '#93c5fd' : '#1e40af',
  metaBg:        isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
  metaBorder:    isDark ? 'rgba(249,115,22,0.08)' : '#f1f5f9',
  paginationBg:  isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  paginationBorder: isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  paginationTx:  isDark ? '#c4a882' : '#374151',
  checkboxAccent:isDark ? '#f97316' : '#0d9488',
  exportBg:      isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  exportTx:      isDark ? '#c4a882' : '#374151',
  exportBorder:  isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  clearBg:       isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
  clearTx:       isDark ? '#c4a882' : '#374151',
  viewBtnTx:     isDark ? '#fb923c' : '#0d9488',
  viewBtnHover:  isDark ? 'rgba(249,115,22,0.1)' : '#f0fdfa',
  // gender avatar
  maleBg:        isDark ? 'rgba(59,130,246,0.8)' : '#3b82f6',
  femaleBg:      isDark ? 'rgba(236,72,153,0.8)' : '#ec4899',
  maleBadgeBg:   isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe',
  maleBadgeTx:   isDark ? '#93c5fd' : '#1d4ed8',
  femaleBadgeBg: isDark ? 'rgba(236,72,153,0.15)' : '#fce7f3',
  femaleBadgeTx: isDark ? '#f9a8d4' : '#9d174d',
  premiumBg:     isDark ? 'rgba(251,191,36,0.12)' : '#fef9c3',
  premiumBorder: isDark ? 'rgba(251,191,36,0.35)' : '#fde68a',
  premiumTx:     isDark ? '#fde68a' : '#854d0e',
  premiumActiveBg: isDark ? 'rgba(251,191,36,0.08)' : '#fef9c3',
  premiumActiveBadge: isDark ? 'rgba(251,191,36,0.2)' : '#fef08a',
  premiumActiveBadgeTx: isDark ? '#fde68a' : '#713f12',
  statusOnline:  '#22c55e',
  statusAway:    '#eab308',
  statusOffline: isDark ? '#4b5563' : '#9ca3af',
  // account status
  accountActive:   { bg: isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4', tx: isDark ? '#6ee7b7' : '#166534' },
  accountSuspended:{ bg: isDark ? 'rgba(251,191,36,0.12)' : '#fffbeb', tx: isDark ? '#fde68a' : '#92400e' },
  accountBanned:   { bg: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2', tx: isDark ? '#fca5a5' : '#b91c1c' },
  accountPending:  { bg: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff', tx: isDark ? '#93c5fd' : '#1e40af' },
  // report mini cards
  reportCardBg:  isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
  reportCardBorder: isDark ? 'rgba(249,115,22,0.08)' : '#f1f5f9',
  // admin action cards
  adminActionBg: isDark ? 'rgba(59,130,246,0.06)' : '#ffffff',
  adminActionBorder: isDark ? 'rgba(59,130,246,0.14)' : '#f1f5f9',
  // stat grid
  statGridBg:    isDark ? 'rgba(255,255,255,0.025)' : '#f9fafb',
  statGridBorder:isDark ? 'rgba(249,115,22,0.08)' : '#f1f5f9',
  // pink note
  pinkNoteBg:    isDark ? 'rgba(236,72,153,0.08)' : '#fdf2f8',
  pinkNoteBorder:isDark ? 'rgba(236,72,153,0.25)' : '#fbcfe8',
  pinkNoteTx:    isDark ? '#f9a8d4' : '#9d174d',
  // premium modal preview
  premiumPreviewBg: isDark ? 'rgba(251,191,36,0.1)' : '#fffbeb',
  premiumPreviewBorder: isDark ? 'rgba(251,191,36,0.3)' : '#fde68a',
  premiumPreviewTx: isDark ? '#fde68a' : '#92400e',
  // loading overlay
  loadingBg:     isDark ? '#1c1c1c' : '#ffffff',
  loadingTx:     isDark ? '#c4a882' : '#4b5563',
});

// ─── Stat Card ─────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ElementType;
  value: number | string;
  label: string;
  colorKey: 'blue' | 'purple' | 'pink' | 'yellow';
  isDark: boolean;
}> = ({ icon: Icon, value, label, colorKey, isDark }) => {
  const map = {
    blue:   { bg: isDark ? 'rgba(59,130,246,0.12)' : '#dbeafe',   icon: isDark ? '#93c5fd' : '#1d4ed8' },
    purple: { bg: isDark ? 'rgba(139,92,246,0.12)' : '#ede9fe',   icon: isDark ? '#c4b5fd' : '#6d28d9' },
    pink:   { bg: isDark ? 'rgba(236,72,153,0.12)' : '#fce7f3',   icon: isDark ? '#f9a8d4' : '#9d174d' },
    yellow: { bg: isDark ? 'rgba(251,191,36,0.12)' : '#fef9c3',   icon: isDark ? '#fde68a' : '#854d0e' },
  };
  const c = map[colorKey];
  const cardBg    = isDark ? '#1c1c1c' : '#ffffff';
  const cardBorder= isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb';
  const txPrimary = isDark ? '#f0e8de' : '#111827';
  const txMuted   = isDark ? '#8a6540' : '#9ca3af';

  return (
    <div className="rounded-xl border p-4 transition-colors duration-300" style={{ background: cardBg, borderColor: cardBorder }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none" style={{ color: txPrimary }}>{value}</p>
          <p className="text-xs mt-0.5" style={{ color: txMuted }}>{label}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
  const { isDark } = useTheme() as any;
  const t = useTokens(isDark);
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersPagination, setUsersPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [usersPage, setUsersPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [orderingFilter, setOrderingFilter] = useState('-join_date');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailsResponse | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumExpiryDate, setPremiumExpiryDate] = useState('');
  const [premiumDuration, setPremiumDuration] = useState(30);

  const loadUsers = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), page_size: '20' });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (accountStatusFilter !== 'all') params.append('account_status', accountStatusFilter);
      if (verifiedFilter !== 'all') params.append('verified', verifiedFilter);
      if (premiumFilter !== 'all') params.append('premium', premiumFilter);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (orderingFilter) params.append('ordering', orderingFilter);
      const data = await adminService.adminApiCall<{ results: UserProfile[]; count: number; next: string | null; previous: string | null }>(`/users/?${params.toString()}`);
      setUsers(data.results || []);
      setUsersPagination({ count: data.count || 0, next: data.next, previous: data.previous });
      setUsersPage(page);
    } catch {
      const m = 'Failed to load users'; setError(m); showError('Load Failed', m);
    } finally { setLoading(false); }
  };

  const loadUserDetails = async (userId: number) => {
    setLoading(true);
    try {
      const data = await adminService.adminApiCall<UserDetailsResponse>(`/users/${userId}/detail_view/`);
      setUserDetails(data); setShowUserDetails(true);
    } catch { showError('Failed to Load', 'Could not load user details.'); }
    finally { setLoading(false); }
  };

  const performUserAction = async (userId: number, action: string, reason = '', extraData: any = {}) => {
    setLoading(true);
    try {
      const data = await adminService.adminApiCall<{ message: string; user?: UserProfile }>(`/users/${userId}/user_action/`, 'POST', { action, reason, ...extraData });
      showSuccess('Action Completed', data.message);
      setShowUserDetails(false); setShowPremiumModal(false); loadUsers(usersPage);
    } catch (err) { showError(`Failed to ${action} user`, (err as Error).message); }
    finally { setLoading(false); }
  };

  const handleUserActionWithReason = (userId: number, action: string) => {
    const labels: Record<string, string> = { suspend: 'suspension', ban: 'ban', activate: 'activation', delete: 'deletion', verify: 'verification' };
    confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Please provide a reason for this ${labels[action]}:`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel',
      type: action === 'delete' || action === 'ban' ? 'danger' : action === 'suspend' ? 'warning' : 'info',
      onConfirm: async () => {
        const reason = prompt(`Enter reason for ${labels[action]}:`);
        if (reason) { await performUserAction(userId, action, reason); }
        else showWarning('Action Cancelled', 'A reason is required to proceed.');
      }
    });
  };

  const handleGrantPremium = () => {
    setShowPremiumModal(true);
    const d = new Date(); d.setDate(d.getDate() + 30);
    setPremiumExpiryDate(d.toISOString().split('T')[0]);
    setPremiumDuration(30);
  };

  const handleRevokePremium = (userId: number) => {
    confirm({ title: 'Revoke Premium Access', message: 'Are you sure you want to revoke premium access?', confirmText: 'Revoke Premium', cancelText: 'Cancel', type: 'warning',
      onConfirm: async () => {
        const reason = prompt('Enter reason for revoking premium:');
        if (reason) await performUserAction(userId, 'revoke_premium', reason);
      }
    });
  };

  const handlePremiumDurationChange = (days: number) => {
    setPremiumDuration(days);
    const d = new Date(); d.setDate(d.getDate() + days);
    setPremiumExpiryDate(d.toISOString().split('T')[0]);
  };

  const handleSubmitPremium = async () => {
    if (!userDetails || !premiumExpiryDate) { showWarning('Invalid Data', 'Please select an expiry date'); return; }
    const reason = prompt('Enter reason for granting premium access:');
    if (!reason) { showWarning('Action Cancelled', 'A reason is required.'); return; }
    await performUserAction(userDetails.profile.user.id, 'grant_premium', reason, { expiry_date: premiumExpiryDate });
  };

  const performBulkAction = async (action: string, reason = '') => {
    if (!selectedUsers.length) { showWarning('No Selection', 'Please select at least one user.'); return; }
    confirm({
      title: `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${selectedUsers.length} user(s)?`,
      confirmText: `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedUsers.length} User(s)`,
      cancelText: 'Cancel',
      type: action === 'ban' ? 'danger' : action === 'suspend' ? 'warning' : 'info',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await adminService.adminApiCall<{ message: string; success_count: number; skipped_count: number }>('/users/bulk_action/', 'POST', { user_ids: selectedUsers, action, reason: reason || `Bulk ${action}` });
          showSuccess('Bulk Action Completed', `${data.message}\nSuccess: ${data.success_count}, Skipped: ${data.skipped_count}`);
          setSelectedUsers([]); loadUsers(usersPage);
        } catch (err) { showError('Bulk Action Failed', (err as Error).message); }
        finally { setLoading(false); }
      }
    });
  };

  const exportUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (accountStatusFilter !== 'all') params.append('account_status', accountStatusFilter);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      const data = await adminService.adminApiCall<{ data: UserProfile[]; count: number }>(`/users/export/?${params.toString()}`);
      const csv = [
        ['ID', 'Username', 'Email', 'Gender', 'Age', 'Location', 'Status', 'Account Status', 'Join Date', 'Matches', 'Messages', 'Premium', 'Premium Expiry'],
        ...data.data.map(u => [u.user.id, u.username, u.email, u.gender || '', u.age || '', u.location || '', u.status, u.account_status, u.join_date, u.matches || 0, u.messages || 0, u.premium ? 'Yes' : 'No', u.premium_expiry || 'N/A'])
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`; a.click();
      showSuccess('Export Successful', `Exported ${data.count} users to CSV file.`);
    } catch (err) { showError('Export Failed', (err as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(1); }, []);
  useEffect(() => { const tid = setTimeout(() => loadUsers(1), 500); return () => clearTimeout(tid); }, [searchTerm, statusFilter, accountStatusFilter, verifiedFilter, premiumFilter, genderFilter, orderingFilter]);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A';
  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString() : 'N/A';
  const formatActiveTime = (hours: number | null) => { if (!hours) return '0h'; if (hours < 24) return `${hours}h`; const days = Math.floor(hours / 24); return `${days}d ${hours % 24}h`; };
  const isPremiumExpired = (exp: string | null) => exp ? new Date(exp) < new Date() : false;
  const getDaysUntilExpiry = (exp: string | null) => exp ? Math.ceil((new Date(exp).getTime() - new Date().getTime()) / 86400000) : 0;

  const getStatusDot = (status: string) => ({ online: t.statusOnline, away: t.statusAway, offline: t.statusOffline }[status] ?? t.statusOffline);
  const getAccountBadge = (status: string) => ({ active: t.accountActive, suspended: t.accountSuspended, banned: t.accountBanned, pending: t.accountPending }[status] ?? { bg: t.metaBg, tx: t.txMuted });

  const isMaleUser = (gender: string | null) => gender?.toLowerCase() === 'male';

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none border transition-colors duration-200";
  const inputStyle = { background: t.inputBg, borderColor: t.inputBorder, color: t.txPrimary, colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;
  const optStyle = { background: isDark ? '#1c1c1c' : '#ffffff', color: isDark ? '#f0e8de' : '#111827' };
  const selectStyle = { background: isDark ? '#1c1c1c' : '#ffffff', borderColor: t.inputBorder, color: isDark ? '#f0e8de' : '#111827', colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;

  const maleUsers    = users.filter(u => isMaleUser(u.gender)).length;
  const femaleUsers  = users.filter(u => u.gender?.toLowerCase() === 'female').length;
  const premiumUsers = users.filter(u => u.premium).length;

  return (
    <div className="space-y-5 transition-colors duration-300">
      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 flex items-center gap-3 border" style={{ background: t.dangerBg, borderColor: t.dangerBorder }}>
          <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: t.dangerText }} />
          <p className="text-sm flex-1" style={{ color: t.dangerText }}>{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4" style={{ color: t.dangerText }} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}  value={usersPagination.count} label="Total Users"    colorKey="blue"   isDark={isDark} />
        <StatCard icon={Users}  value={maleUsers}             label="Male Users"     colorKey="purple" isDark={isDark} />
        <StatCard icon={Users}  value={femaleUsers}           label="Female Users"   colorKey="pink"   isDark={isDark} />
        <StatCard icon={Crown}  value={premiumUsers}          label="Premium Users"  colorKey="yellow" isDark={isDark} />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border p-5 transition-colors duration-300" style={{ background: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
          <div className="relative col-span-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.txMuted }} />
            <input type="text" placeholder="Search by username or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
          {[
            { val: genderFilter,        set: setGenderFilter,        opts: [['all','All Genders'],['male','Male'],['female','Female'],['other','Other']] },
            { val: statusFilter,        set: setStatusFilter,        opts: [['all','All Status'],['online','Online'],['away','Away'],['offline','Offline']] },
            { val: accountStatusFilter, set: setAccountStatusFilter, opts: [['all','All Accounts'],['active','Active'],['pending','Pending'],['suspended','Suspended'],['banned','Banned']] },
            { val: verifiedFilter,      set: setVerifiedFilter,      opts: [['all','All Verification'],['true','Verified'],['false','Not Verified']] },
            { val: premiumFilter,       set: setPremiumFilter,       opts: [['all','All Membership'],['true','Premium'],['false','Free']] },
            { val: orderingFilter,      set: setOrderingFilter,      opts: [['-join_date','Newest First'],['join_date','Oldest First'],['-last_active','Recently Active'],['last_active','Least Active'],['-matches','Most Matches'],['matches','Least Matches'],['user__username','Username A-Z'],['-user__username','Username Z-A']] },
          ].map(({ val, set, opts }, i) => (
            <select key={i} value={val} onChange={e => set(e.target.value)} className={inputCls} style={selectStyle}>
              {opts.map(([v, l]) => <option key={v} value={v} style={optStyle}>{l}</option>)}
            </select>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
          <button onClick={exportUsers} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 disabled:opacity-50"
            style={{ background: t.exportBg, color: t.exportTx, borderColor: t.exportBorder }}>
            <Download className="w-4 h-4" /> Export
          </button>

          {selectedUsers.length > 0 && (
            <>
              <button onClick={() => performBulkAction('suspend', 'Bulk suspension')} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#ca8a04,#eab308)' }}>
                <Ban className="w-4 h-4" /> Suspend ({selectedUsers.length})
              </button>
              <button onClick={() => performBulkAction('activate', 'Bulk activation')} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                <CheckCircle className="w-4 h-4" /> Activate ({selectedUsers.length})
              </button>
              <button onClick={() => performBulkAction('ban', 'Bulk ban')} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                <XCircle className="w-4 h-4" /> Ban ({selectedUsers.length})
              </button>
              <button onClick={() => setSelectedUsers([])}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
                style={{ background: t.clearBg, color: t.clearTx, borderColor: t.cardBorder }}>
                Clear Selection
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden transition-colors duration-300" style={{ background: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: t.theadBg, borderBottom: `1px solid ${t.divider}` }}>
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={e => setSelectedUsers(e.target.checked ? users.map(u => u.user.id) : [])}
                    className="w-4 h-4 rounded" style={{ accentColor: t.checkboxAccent }} />
                </th>
                {['User','Gender','Status','Location','Joined','Membership','Account','Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`} style={{ color: t.theadTx }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-14 text-center">
                  <Loader className="w-7 h-7 animate-spin mx-auto mb-2" style={{ color: t.txMuted }} />
                  <p className="text-sm" style={{ color: t.txMuted }}>Loading users...</p>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-14 text-center">
                  <Users className="w-10 h-10 mx-auto mb-2" style={{ color: t.txMuted, opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: t.txMuted }}>No users found</p>
                </td></tr>
              ) : users.map((user, idx) => {
                const isMale = isMaleUser(user.gender);
                const isPremium = user.premium;
                const isExpired = isPremiumExpired(user.premium_expiry);
                const daysLeft = getDaysUntilExpiry(user.premium_expiry);
                const acct = getAccountBadge(user.account_status);
                return (
                  <tr key={user.user.id} className="transition-colors"
                    style={{ borderBottom: `1px solid ${t.divider}`, background: idx % 2 === 0 ? t.cardBg : t.rowBg }}
                    onMouseEnter={e => (e.currentTarget.style.background = t.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? t.cardBg : t.rowBg)}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedUsers.includes(user.user.id)}
                        onChange={e => setSelectedUsers(e.target.checked ? [...selectedUsers, user.user.id] : selectedUsers.filter(id => id !== user.user.id))}
                        className="w-4 h-4 rounded" style={{ accentColor: t.checkboxAccent }} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ background: isMale ? t.maleBg : t.femaleBg }}>
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                            style={{ background: getStatusDot(user.status), borderColor: t.cardBg }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: t.txPrimary }}>
                            {user.username || 'Unknown'}
                            {user.verified && <CheckCircle className="w-3.5 h-3.5" style={{ color: isDark ? '#93c5fd' : '#3b82f6' }} />}
                            {isPremium && !isExpired && <Crown className="w-3.5 h-3.5" style={{ color: isDark ? '#fde68a' : '#ca8a04', fill: 'currentColor' }} />}
                          </p>
                          <p className="text-xs" style={{ color: t.txMuted }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: isMale ? t.maleBadgeBg : t.femaleBadgeBg, color: isMale ? t.maleBadgeTx : t.femaleBadgeTx }}>
                        {user.gender || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm" style={{ color: t.txBody }}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: t.txBody }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: t.txMuted }} />
                        {user.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: t.txBody }}>{formatDate(user.join_date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {isPremium ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" style={{
                            background: isExpired ? t.dangerBg : t.premiumBg,
                            color: isExpired ? t.dangerText : t.premiumTx,
                          }}>
                            {isExpired ? 'Expired' : 'Premium'}
                          </span>
                          {user.premium_expiry && (
                            <div className="flex items-center gap-1 text-xs" style={{ color: isExpired ? t.dangerText : t.txMuted }}>
                              <Calendar className="w-3 h-3" />
                              {isExpired ? `Expired ${formatDate(user.premium_expiry)}` : `${daysLeft}d left`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: t.metaBg, color: t.txMuted }}>Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: acct.bg, color: acct.tx }}>
                        {user.account_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => loadUserDetails(user.user.id)} disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                        style={{ color: t.viewBtnTx }}
                        onMouseEnter={e => (e.currentTarget.style.background = t.viewBtnHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersPagination.count > 0 && (
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${t.divider}` }}>
            <p className="text-xs" style={{ color: t.txMuted }}>
              Showing {((usersPage - 1) * 20) + 1}–{Math.min(usersPage * 20, usersPagination.count)} of {usersPagination.count} users
            </p>
            <div className="flex gap-2">
              {['Previous', 'Next'].map(label => {
                const disabled = label === 'Previous' ? (!usersPagination.previous || loading) : (!usersPagination.next || loading);
                return (
                  <button key={label}
                    onClick={() => loadUsers(usersPage + (label === 'Next' ? 1 : -1))}
                    disabled={disabled}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: t.paginationBg, borderColor: t.paginationBorder, color: t.paginationTx }}
                  >{label}</button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: t.modalOverlay }}>
          <div className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
              style={{ background: t.cardBg, borderBottom: `1px solid ${t.divider}` }}>
              <h2 className="text-lg font-bold" style={{ color: t.txPrimary }}>User Details</h2>
              <button onClick={() => { setShowUserDetails(false); setUserDetails(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: t.rowBg, color: t.txMuted }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* User header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
                  style={{ background: isMaleUser(userDetails.profile.gender) ? t.maleBg : t.femaleBg }}>
                  {userDetails.profile.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-1" style={{ color: t.txPrimary }}>
                    {userDetails.profile.username}
                    {userDetails.profile.verified && <CheckCircle className="w-5 h-5" style={{ color: isDark ? '#93c5fd' : '#3b82f6' }} />}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: t.txMuted }}>{userDetails.profile.email}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => { const a = getAccountBadge(userDetails.profile.account_status); return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: a.bg, color: a.tx }}>{userDetails.profile.account_status}</span>
                    ); })()}
                    {userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: t.premiumBg, color: t.premiumTx }}>
                        <Crown className="w-3 h-3 fill-current" /> Premium
                      </span>
                    )}
                    {userDetails.profile.gender && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{
                        background: isMaleUser(userDetails.profile.gender) ? t.maleBadgeBg : t.femaleBadgeBg,
                        color:      isMaleUser(userDetails.profile.gender) ? t.maleBadgeTx : t.femaleBadgeTx,
                      }}>{userDetails.profile.gender}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Premium status card — male only */}
              {isMaleUser(userDetails.profile.gender) && (
                <div className="rounded-xl border-2 p-4 transition-colors duration-300" style={{
                  background: userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? t.premiumActiveBg : t.metaBg,
                  borderColor: userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? t.premiumBorder : t.cardBorder,
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" style={{ color: userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? (isDark ? '#fde68a' : '#ca8a04') : t.txMuted, fill: userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? 'currentColor' : 'none' }} />
                      <span className="font-semibold text-sm" style={{ color: t.txPrimary }}>Premium Membership</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{
                      background: userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? t.premiumActiveBadge : t.metaBg,
                      color:      userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? t.premiumActiveBadgeTx : t.txMuted,
                    }}>
                      {userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {userDetails.profile.premium_expiry ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs" style={{ color: t.txBody }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: t.txMuted }} />
                        Expires: {formatDate(userDetails.profile.premium_expiry)}
                      </div>
                      {!isPremiumExpired(userDetails.profile.premium_expiry) && (
                        <p className="text-xs" style={{ color: t.txMuted }}>{getDaysUntilExpiry(userDetails.profile.premium_expiry)} days remaining</p>
                      )}
                      {isPremiumExpired(userDetails.profile.premium_expiry) && (
                        <p className="text-xs font-medium" style={{ color: t.dangerText }}>Expired {Math.abs(getDaysUntilExpiry(userDetails.profile.premium_expiry))} days ago</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: t.txMuted }}>This user is not a premium member</p>
                  )}
                </div>
              )}

              {/* Female premium note */}
              {userDetails.profile.gender?.toLowerCase() === 'female' && (
                <div className="rounded-xl p-4 border" style={{ background: t.pinkNoteBg, borderColor: t.pinkNoteBorder }}>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: t.pinkNoteTx }}>
                    <AlertTriangle className="w-4 h-4" />
                    Premium features are only available for male users
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Gender', userDetails.profile.gender || 'N/A'],
                  ['Age', userDetails.profile.age?.toString() || 'N/A'],
                  ['Location', userDetails.profile.location || 'N/A'],
                  ['Phone', userDetails.profile.phone || 'N/A'],
                  ['Join Date', formatDate(userDetails.profile.join_date)],
                  ['Last Active', formatDateTime(userDetails.profile.last_active)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>{label}</p>
                    <p className="text-sm" style={{ color: t.txBody }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 rounded-xl p-4" style={{ background: t.statGridBg, border: `1px solid ${t.statGridBorder}` }}>
                {[
                  ['Matches', userDetails.profile.matches || 0],
                  ['Messages', userDetails.profile.messages || 0],
                  ['Photos', userDetails.profile.photo_count || 0],
                  ['Active Time', formatActiveTime(userDetails.profile.active_time)],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-bold" style={{ color: t.txPrimary }}>{value}</p>
                    <p className="text-xs" style={{ color: t.txMuted }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Reports received */}
              {userDetails.reports_received?.length > 0 && (
                <div className="rounded-xl p-4 border" style={{ background: t.dangerBg, borderColor: t.dangerBorder }}>
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5" style={{ color: t.dangerText }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: t.dangerText }}>Reports Against This User</p>
                      <p className="text-xs" style={{ color: t.dangerText, opacity: 0.75 }}>{userDetails.reports_received.length} report(s) filed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {userDetails.reports_received.slice(0, 3).map((report: Report) => {
                      const rs = { pending: { bg: t.warnBg, tx: t.warnText }, resolved: { bg: t.successBg, tx: t.successText }, dismissed: { bg: t.metaBg, tx: t.txMuted }, reviewed: { bg: t.infoBg, tx: t.infoText } }[report.status] ?? { bg: t.metaBg, tx: t.txMuted };
                      return (
                        <div key={report.id} className="rounded-lg p-3 border" style={{ background: t.reportCardBg, borderColor: t.reportCardBorder }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold capitalize" style={{ color: t.txBody }}>{report.reason}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: rs.bg, color: rs.tx }}>{report.status}</span>
                          </div>
                          <p className="text-xs" style={{ color: t.txMuted }}>{report.description}</p>
                          <p className="text-xs mt-1" style={{ color: t.txMuted, opacity: 0.7 }}>By {report.reporter_username} on {formatDate(report.created_at)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin actions */}
              {userDetails.admin_actions?.length > 0 && (
                <div className="rounded-xl p-4 border" style={{ background: t.infoBg, borderColor: t.infoBorder }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: t.infoText }}>Recent Admin Actions</h4>
                  <div className="space-y-2">
                    {userDetails.admin_actions.slice(0, 5).map((action: AdminAction) => (
                      <div key={action.id} className="rounded-lg p-3 flex items-center justify-between border" style={{ background: t.adminActionBg, borderColor: t.adminActionBorder }}>
                        <div>
                          <span className="text-xs font-semibold capitalize" style={{ color: t.txPrimary }}>{action.action_type.replace('_', ' ')}</span>
                          <p className="text-xs mt-0.5" style={{ color: t.txMuted }}>{action.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: t.txMuted }}>by {action.admin_username}</p>
                          <p className="text-xs" style={{ color: t.txMuted, opacity: 0.7 }}>{formatDate(action.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                {userDetails.profile.account_status === 'active' && (
                  <>
                    <button onClick={() => handleUserActionWithReason(userDetails.profile.user.id, 'suspend')} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#ca8a04,#eab308)' }}>
                      <Ban className="w-4 h-4" /> Suspend
                    </button>
                    <button onClick={() => handleUserActionWithReason(userDetails.profile.user.id, 'ban')} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                      <XCircle className="w-4 h-4" /> Ban
                    </button>
                  </>
                )}
                {(userDetails.profile.account_status === 'suspended' || userDetails.profile.account_status === 'banned') && (
                  <button onClick={() => handleUserActionWithReason(userDetails.profile.user.id, 'activate')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                    <CheckCircle className="w-4 h-4" /> Activate
                  </button>
                )}
                {!userDetails.profile.verified && (
                  <button onClick={() => confirm({ title: 'Verify User', message: `Verify ${userDetails.profile.username}?`, confirmText: 'Verify', type: 'info', onConfirm: () => performUserAction(userDetails.profile.user.id, 'verify', 'User verified by admin') })} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
                    <UserCheck className="w-4 h-4" /> Verify
                  </button>
                )}
                {isMaleUser(userDetails.profile.gender) && (
                  !userDetails.profile.premium || isPremiumExpired(userDetails.profile.premium_expiry) ? (
                    <button onClick={handleGrantPremium} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#ca8a04,#f97316)' }}>
                      <Crown className="w-4 h-4" /> Grant Premium
                    </button>
                  ) : (
                    <button onClick={() => handleRevokePremium(userDetails.profile.user.id)} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 border"
                      style={{ background: t.metaBg, color: t.txBody, borderColor: t.cardBorder }}>
                      <XCircle className="w-4 h-4" /> Revoke Premium
                    </button>
                  )
                )}
                <button onClick={() => handleUserActionWithReason(userDetails.profile.user.id, 'delete')} disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 border"
                  style={{ background: t.dangerBg, color: t.dangerText, borderColor: t.dangerBorder }}>
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

              {/* Profile status summary */}
              <div className="rounded-xl p-4" style={{ background: t.metaBg, border: `1px solid ${t.metaBorder}` }}>
                <p className="text-sm font-semibold mb-2" style={{ color: t.txPrimary }}>Profile Status</p>
                <ul className="text-xs space-y-1" style={{ color: t.txBody }}>
                  {[
                    ['Profile Complete', userDetails.profile.profile_complete ? 'Yes' : 'No'],
                    ['Verification', userDetails.profile.verified ? 'Verified' : 'Not Verified'],
                    ['Membership', userDetails.profile.premium && !isPremiumExpired(userDetails.profile.premium_expiry) ? 'Premium' : 'Free'],
                    ['Current Status', userDetails.profile.status],
                    ['Reports Filed By User', String(userDetails.reports_made?.length || 0)],
                    ['Reports Against User', String(userDetails.reports_received?.length || 0)],
                    ...(userDetails.profile.premium_expiry ? [['Premium Expiry', `${formatDate(userDetails.profile.premium_expiry)}${isPremiumExpired(userDetails.profile.premium_expiry) ? ' (Expired)' : ''}`]] : []),
                  ].map(([k, v]) => (
                    <li key={k}>• {k}: <span style={{ color: t.txPrimary }}>{v}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Grant Modal */}
      {showPremiumModal && userDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: t.modalOverlay }}>
          <div className="rounded-2xl max-w-md w-full p-6 transition-colors duration-300"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ca8a04,#f97316)' }}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: t.txPrimary }}>Grant Premium Access</h3>
                <p className="text-xs" style={{ color: t.txMuted }}>Set premium expiry for {userDetails.profile.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: t.labelColor }}>Quick Select Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 90, 180, 365].map(days => (
                    <button key={days} onClick={() => handlePremiumDurationChange(days)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                      style={{
                        background: premiumDuration === days ? 'linear-gradient(135deg,#ca8a04,#f97316)' : t.metaBg,
                        color:      premiumDuration === days ? '#ffffff' : t.txBody,
                        border:     `1px solid ${premiumDuration === days ? 'transparent' : t.cardBorder}`,
                      }}
                    >{days}d</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: t.labelColor }}>Expiry Date</label>
                <input type="date" value={premiumExpiryDate} onChange={e => setPremiumExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                  style={{ background: t.inputBg, borderColor: t.inputBorder, color: t.txPrimary }} />
              </div>

              <div className="rounded-xl p-4 border" style={{ background: t.premiumPreviewBg, borderColor: t.premiumPreviewBorder }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" style={{ color: t.premiumPreviewTx }} />
                  <span className="text-xs font-semibold" style={{ color: t.premiumPreviewTx }}>Premium Preview</span>
                </div>
                <p className="text-sm" style={{ color: t.premiumPreviewTx }}>
                  Expires on: <strong>{formatDate(premiumExpiryDate)}</strong>
                </p>
                {premiumExpiryDate && (
                  <p className="text-xs mt-1" style={{ color: t.premiumPreviewTx, opacity: 0.8 }}>
                    Duration: {Math.ceil((new Date(premiumExpiryDate).getTime() - new Date().getTime()) / 86400000)} days
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={handleSubmitPremium} disabled={!premiumExpiryDate || loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#ca8a04,#f97316)' }}>
                  <Crown className="w-4 h-4" />
                  {loading ? 'Granting...' : 'Grant Premium'}
                </button>
                <button onClick={() => { setShowPremiumModal(false); setPremiumExpiryDate(''); setPremiumDuration(30); }} disabled={loading}
                  className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all disabled:opacity-50"
                  style={{ background: t.clearBg, borderColor: t.cardBorder, color: t.txBody }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-40" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="rounded-xl p-6 shadow-2xl flex flex-col items-center gap-3 transition-colors duration-300"
            style={{ background: t.loadingBg, border: `1px solid ${isDark ? 'rgba(249,115,22,0.2)' : '#e5e7eb'}` }}>
            <Loader className="w-8 h-8 animate-spin" style={{ color: isDark ? '#f97316' : '#0d9488' }} />
            <p className="text-sm font-medium" style={{ color: t.loadingTx }}>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;