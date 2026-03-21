import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search, CheckCircle, XCircle, Loader, X, Eye, User, MessageSquare
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

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

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

const useTokens = (isDark: boolean) => ({
  accentColor:   isDark ? '#f97316' : '#1d4ed8',
  pageBg:        isDark ? '#0d0d0d' : '#f8faff',
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
  inputFocus:    isDark ? '#f97316' : '#0d9488',
  ctaGradient:   isDark ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
  divider:       isDark ? 'rgba(249,115,22,0.1)' : '#f1f5f9',
  theadBg:       isDark ? '#141414' : '#f9fafb',
  theadBorder:   isDark ? 'rgba(249,115,22,0.1)' : '#e5e7eb',
  theadTx:       isDark ? '#8a6540' : '#6b7280',
  modalOverlay:  'rgba(0,0,0,0.7)',
  dangerBg:      isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
  dangerBorder:  isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  dangerText:    isDark ? '#fca5a5' : '#b91c1c',
  warnBg:        isDark ? 'rgba(251,191,36,0.1)' : '#fffbeb',
  warnBorder:    isDark ? 'rgba(251,191,36,0.25)' : '#fde68a',
  warnText:      isDark ? '#fde68a' : '#92400e',
  successBg:     isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4',
  successBorder: isDark ? 'rgba(16,185,129,0.3)' : '#bbf7d0',
  successText:   isDark ? '#6ee7b7' : '#166534',
  infoBg:        isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
  infoBorder:    isDark ? 'rgba(99,102,241,0.3)' : '#bfdbfe',
  infoText:      isDark ? '#93c5fd' : '#1e40af',
  orangeBg:      isDark ? 'rgba(249,115,22,0.1)' : '#fff7ed',
  orangeBorder:  isDark ? 'rgba(249,115,22,0.3)' : '#fed7aa',
  orangeText:    isDark ? '#fb923c' : '#c2410c',
  reportSummaryBg: isDark
    ? 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(249,115,22,0.08))'
    : 'linear-gradient(135deg,#fef2f2,#fff7ed)',
  reportSummaryBorder: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca',
  metaBg:        isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
  adminNotesBg:  isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
  adminNotesBorder: isDark ? 'rgba(99,102,241,0.25)' : '#bfdbfe',
  adminNotesTx:  isDark ? '#93c5fd' : '#1e40af',
  avatarBg:      isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
  avatarTx:      isDark ? '#8a6540' : '#9ca3af',
  avatarRedBg:   isDark ? 'rgba(239,68,68,0.12)' : '#fee2e2',
  avatarRedTx:   isDark ? '#fca5a5' : '#dc2626',
  paginationBorder: isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  paginationBg:  isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  paginationTx:  isDark ? '#c4a882' : '#374151',
  checkboxAccent:isDark ? '#f97316' : '#0d9488',
  bulkResolveBg: isDark ? 'rgba(16,185,129,0.15)' : '#16a34a',
  bulkResolveTx: isDark ? '#6ee7b7' : '#ffffff',
  bulkDismissBg: isDark ? 'rgba(255,255,255,0.06)' : '#6b7280',
  bulkDismissTx: isDark ? '#c4a882' : '#ffffff',
  clearBg:       isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
  clearTx:       isDark ? '#c4a882' : '#374151',
  viewBtnTx:     isDark ? '#fb923c' : '#0d9488',
  viewBtnHover:  isDark ? 'rgba(249,115,22,0.1)' : '#f0fdfa',
  resolveBtnTx:  isDark ? '#6ee7b7' : '#16a34a',
  resolveBtnHover: isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4',
  dismissBtnTx:  isDark ? '#9ca3af' : '#6b7280',
  dismissBtnHover: isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb',
});

const ReportsManagement: React.FC = () => {
  const { isDark } = useTheme() as any;
  const t = useTokens(isDark);
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsPagination, setReportsPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [reportsPage, setReportsPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [reportReasonFilter, setReportReasonFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadReports = async (page: number = 1) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), page_size: '20' });
      if (searchTerm) params.append('search', searchTerm);
      if (reportStatusFilter !== 'all') params.append('status', reportStatusFilter);
      if (reportReasonFilter !== 'all') params.append('reason', reportReasonFilter);
      const data = await adminService.adminApiCall<{ results: Report[]; count: number; next: string | null; previous: string | null }>(`/reports/?${params.toString()}`);
      setReports(data.results || []);
      setReportsPagination({ count: data.count || 0, next: data.next, previous: data.previous });
      setReportsPage(page);
    } catch {
      const m = 'Failed to load reports'; setError(m); showError('Load Failed', m);
    } finally { setLoading(false); }
  };

  const reviewReport = async (report: Report, action: string, adminNotes: string = '') => {
    setLoading(true);
    try {
      await adminService.adminApiCall<{ message: string; report: Report }>(`/reports/${report.id}/review/`, 'POST', { action, admin_notes: adminNotes });
      const actionText = action === 'resolve' ? 'resolved' : 'dismissed';
      showSuccess(`Report ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`, `Report against ${report.reported_username} has been ${actionText}`);
      loadReports(reportsPage); setShowDetailModal(false); setSelectedReport(null);
    } catch (err) {
      showError('Review Failed', `Failed to review report: ${(err as Error).message}`);
    } finally { setLoading(false); }
  };

  const handleReviewClick = (report: Report, action: 'resolve' | 'dismiss') => {
    const actionText = action === 'resolve' ? 'Resolve' : 'Dismiss';
    const actionPastTense = action === 'resolve' ? 'resolved' : 'dismissed';
    confirm({
      title: `${actionText} Report`,
      message: `Are you sure you want to ${action} this report against ${report.reported_username}?\n\nReason: ${report.reason}\nReporter: ${report.reporter_username}`,
      type: action === 'resolve' ? 'info' : 'warning',
      confirmText: actionText, cancelText: 'Cancel',
      onConfirm: async () => { await reviewReport(report, action, `Report ${actionPastTense} by admin`); }
    });
  };

  const bulkReviewReports = async (action: string) => {
    if (selectedReports.length === 0) { showWarning('No Selection', 'Please select at least one report'); return; }
    const actionText = action === 'resolve' ? 'resolve' : 'dismiss';
    const actionPastTense = action === 'resolve' ? 'resolved' : 'dismissed';
    confirm({
      title: `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Reports`,
      message: `Are you sure you want to ${actionText} ${selectedReports.length} report(s)?`,
      type: action === 'resolve' ? 'info' : 'warning',
      confirmText: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} All`, cancelText: 'Cancel',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await adminService.adminApiCall<{ message: string; updated_count: number }>('/reports/bulk_review/', 'POST', { report_ids: selectedReports, action, admin_notes: `Bulk ${actionPastTense}` });
          showSuccess('Bulk Review Complete', `${data.updated_count} report(s) have been ${actionPastTense}`);
          setSelectedReports([]); loadReports(reportsPage);
        } catch (err) { showError('Bulk Review Failed', (err as Error).message); }
        finally { setLoading(false); }
      }
    });
  };

  useEffect(() => { loadReports(1); }, []);
  useEffect(() => { const t = setTimeout(() => loadReports(1), 500); return () => clearTimeout(t); }, [searchTerm, reportStatusFilter, reportReasonFilter]);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A';
  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString() : 'N/A';
  const getReasonLabel = (reason: string) => ({ spam: 'Spam', harassment: 'Harassment', inappropriate: 'Inappropriate Content', fake: 'Fake Profile', other: 'Other' }[reason] || reason);

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      pending:   { bg: t.warnBg,    color: t.warnText },
      resolved:  { bg: t.successBg, color: t.successText },
      dismissed: { bg: t.metaBg,    color: t.txMuted },
      reviewed:  { bg: t.infoBg,    color: t.infoText },
    };
    return map[status] ?? map.reviewed;
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none border transition-colors duration-200";
  const inputStyle = { background: t.inputBg, borderColor: t.inputBorder, color: t.txPrimary, colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;
  const optStyle = { background: isDark ? '#1c1c1c' : '#ffffff', color: isDark ? '#f0e8de' : '#111827' };
  const selectStyle = { background: isDark ? '#1c1c1c' : '#ffffff', borderColor: t.inputBorder, color: isDark ? '#f0e8de' : '#111827', colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;

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

      {/* Filters */}
      <div className="rounded-2xl border p-5 transition-colors duration-300" style={{ background: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <div className="relative col-span-full lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: t.txMuted }} />
            <input type="text" placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
          <select value={reportStatusFilter} onChange={e => setReportStatusFilter(e.target.value)} className={inputCls} style={selectStyle}>
            <option value="all" style={optStyle}>All Status</option>
            <option value="pending" style={optStyle}>Pending</option>
            <option value="reviewed" style={optStyle}>Reviewed</option>
            <option value="resolved" style={optStyle}>Resolved</option>
            <option value="dismissed" style={optStyle}>Dismissed</option>
          </select>
          <select value={reportReasonFilter} onChange={e => setReportReasonFilter(e.target.value)} className={inputCls} style={selectStyle}>
            <option value="all" style={optStyle}>All Reasons</option>
            <option value="spam" style={optStyle}>Spam</option>
            <option value="harassment" style={optStyle}>Harassment</option>
            <option value="inappropriate" style={optStyle}>Inappropriate Content</option>
            <option value="fake" style={optStyle}>Fake Profile</option>
            <option value="other" style={optStyle}>Other</option>
          </select>
        </div>

        {selectedReports.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
            <button onClick={() => bulkReviewReports('resolve')} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              style={{ background: t.successBg, color: t.successText, border: `1px solid ${t.successBorder}` }}>
              <CheckCircle className="w-4 h-4" /> Resolve ({selectedReports.length})
            </button>
            <button onClick={() => bulkReviewReports('dismiss')} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              style={{ background: t.metaBg, color: t.txBody, border: `1px solid ${t.cardBorder}` }}>
              <XCircle className="w-4 h-4" /> Dismiss ({selectedReports.length})
            </button>
            <button onClick={() => setSelectedReports([])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: t.clearBg, color: t.clearTx, border: `1px solid ${t.cardBorder}` }}>
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden transition-colors duration-300" style={{ background: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: t.theadBg, borderBottom: `1px solid ${t.theadBorder}` }}>
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox"
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onChange={e => setSelectedReports(e.target.checked ? reports.map(r => r.id) : [])}
                    className="w-4 h-4 rounded" style={{ accentColor: t.checkboxAccent }}
                  />
                </th>
                {['Reporter', 'Reported User', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`} style={{ color: t.theadTx }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && reports.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-14 text-center">
                  <Loader className="w-7 h-7 animate-spin mx-auto mb-2" style={{ color: t.txMuted }} />
                  <p className="text-sm" style={{ color: t.txMuted }}>Loading reports...</p>
                </td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-14 text-center">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2" style={{ color: t.txMuted, opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: t.txMuted }}>No reports found</p>
                </td></tr>
              ) : reports.map((report, idx) => {
                const s = statusBadge(report.status);
                return (
                  <tr key={report.id} className="transition-colors"
                    style={{ borderBottom: `1px solid ${t.divider}`, background: idx % 2 === 0 ? t.cardBg : t.rowBg }}
                    onMouseEnter={e => (e.currentTarget.style.background = t.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? t.cardBg : t.rowBg)}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedReports.includes(report.id)}
                        onChange={e => setSelectedReports(e.target.checked ? [...selectedReports, report.id] : selectedReports.filter(id => id !== report.id))}
                        className="w-4 h-4 rounded" style={{ accentColor: t.checkboxAccent }} />
                    </td>
                    <td className="px-6 py-4"><span className="text-sm" style={{ color: t.txBody }}>{report.reporter_username}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold" style={{ color: t.txPrimary }}>{report.reported_username}</span></td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: t.orangeBg, color: t.orangeText }}>{report.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: s.bg, color: s.color }}>{report.status}</span>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm" style={{ color: t.txMuted }}>{formatDate(report.created_at)}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedReport(report); setShowDetailModal(true); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                          style={{ color: t.viewBtnTx }}
                          onMouseEnter={e => (e.currentTarget.style.background = t.viewBtnHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button onClick={() => handleReviewClick(report, 'resolve')} disabled={loading}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                              style={{ color: t.resolveBtnTx }}
                              onMouseEnter={e => (e.currentTarget.style.background = t.resolveBtnHover)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >Resolve</button>
                            <button onClick={() => handleReviewClick(report, 'dismiss')} disabled={loading}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                              style={{ color: t.dismissBtnTx }}
                              onMouseEnter={e => (e.currentTarget.style.background = t.dismissBtnHover)}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >Dismiss</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reportsPagination.count > 0 && (
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${t.divider}` }}>
            <p className="text-xs" style={{ color: t.txMuted }}>
              Showing {((reportsPage - 1) * 20) + 1}–{Math.min(reportsPage * 20, reportsPagination.count)} of {reportsPagination.count} reports
            </p>
            <div className="flex gap-2">
              {['Previous', 'Next'].map((label) => {
                const disabled = label === 'Previous' ? (!reportsPagination.previous || loading) : (!reportsPagination.next || loading);
                return (
                  <button key={label}
                    onClick={() => loadReports(reportsPage + (label === 'Next' ? 1 : -1))}
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

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: t.modalOverlay }}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5" style={{ background: t.cardBg, borderBottom: `1px solid ${t.divider}` }}>
              <h2 className="text-lg font-bold" style={{ color: t.txPrimary }}>Report Details</h2>
              <button onClick={() => { setShowDetailModal(false); setSelectedReport(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: t.rowBg, color: t.txMuted }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary banner */}
              <div className="rounded-xl p-4 border" style={{ background: t.reportSummaryBg, borderColor: t.reportSummaryBorder }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: t.dangerText }} />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-1" style={{ color: t.txPrimary }}>{getReasonLabel(selectedReport.reason)}</h3>
                    <p className="text-sm" style={{ color: t.txBody }}>
                      Reported by <strong style={{ color: t.txPrimary }}>{selectedReport.reporter_username}</strong> against{' '}
                      <strong style={{ color: t.txPrimary }}>{selectedReport.reported_username}</strong>
                    </p>
                  </div>
                  {(() => { const s = statusBadge(selectedReport.status); return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize" style={{ background: s.bg, color: s.color }}>{selectedReport.status}</span>
                  ); })()}
                </div>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div>
                  <p className="text-xs font-semibold uppercase mb-2 flex items-center gap-1.5" style={{ color: t.txMuted }}>
                    <MessageSquare className="w-3.5 h-3.5" /> Description
                  </p>
                  <div className="rounded-xl p-4" style={{ background: t.metaBg }}>
                    <p className="text-sm leading-relaxed" style={{ color: t.txBody }}>{selectedReport.description}</p>
                  </div>
                </div>
              )}

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Reporter', value: selectedReport.reporter_username, isUser: true, isDanger: false },
                  { label: 'Reported User', value: selectedReport.reported_username, isUser: true, isDanger: true },
                ].map(({ label, value, isDanger }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase mb-1.5" style={{ color: t.txMuted }}>{label}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isDanger ? t.avatarRedBg : t.avatarBg }}>
                        <User className="w-4 h-4" style={{ color: isDanger ? t.avatarRedTx : t.avatarTx }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: t.txPrimary }}>{value}</span>
                    </div>
                  </div>
                ))}

                <div>
                  <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>Submitted</p>
                  <p className="text-sm" style={{ color: t.txBody }}>{formatDateTime(selectedReport.created_at)}</p>
                </div>

                {selectedReport.reviewed_at && (
                  <div>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>Reviewed</p>
                    <p className="text-sm" style={{ color: t.txBody }}>{formatDateTime(selectedReport.reviewed_at)}</p>
                  </div>
                )}

                {selectedReport.reviewed_by_username && (
                  <div>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>Reviewed By</p>
                    <p className="text-sm" style={{ color: t.txBody }}>{selectedReport.reviewed_by_username}</p>
                  </div>
                )}

                {selectedReport.admin_notes && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>Admin Notes</p>
                    <p className="text-sm rounded-xl p-3" style={{ color: t.adminNotesTx, background: t.adminNotesBg, border: `1px solid ${t.adminNotesBorder}` }}>{selectedReport.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                  <button onClick={() => handleReviewClick(selectedReport, 'resolve')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                    <CheckCircle className="w-4 h-4" /> Resolve Report
                  </button>
                  <button onClick={() => handleReviewClick(selectedReport, 'dismiss')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 border"
                    style={{ background: t.metaBg, color: t.txBody, borderColor: t.cardBorder }}>
                    <XCircle className="w-4 h-4" /> Dismiss Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;