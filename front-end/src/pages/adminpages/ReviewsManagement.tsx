import React, { useState, useEffect } from 'react';
import {
  Star, Quote, Shield, User, CheckCircle, XCircle, Eye, Trash2,
  Search, Loader, AlertTriangle, X, Calendar, Clock, MessageSquare
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

interface Review {
  id: number;
  user: number;
  username: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
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
  accentColor:    isDark ? '#f97316' : '#1d4ed8',
  cardBg:         isDark ? '#1c1c1c' : '#ffffff',
  cardBorder:     isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  cardShadow:     isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(15,23,42,0.08)',
  rowBg:          isDark ? '#161616' : '#f9fafb',
  rowHover:       isDark ? 'rgba(249,115,22,0.04)' : '#f8faff',
  txPrimary:      isDark ? '#f0e8de' : '#111827',
  txBody:         isDark ? '#c4a882' : '#4b5563',
  txMuted:        isDark ? '#8a6540' : '#9ca3af',
  labelColor:     isDark ? '#c4a882' : '#374151',
  inputBg:        isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  inputBorder:    isDark ? 'rgba(249,115,22,0.22)' : '#e5e7eb',
  divider:        isDark ? 'rgba(249,115,22,0.1)' : '#f1f5f9',
  theadBg:        isDark ? '#141414' : '#f9fafb',
  theadBorder:    isDark ? 'rgba(249,115,22,0.1)' : '#e5e7eb',
  theadTx:        isDark ? '#8a6540' : '#6b7280',
  modalOverlay:   'rgba(0,0,0,0.7)',
  dangerBg:       isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
  dangerBorder:   isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  dangerText:     isDark ? '#fca5a5' : '#b91c1c',
  warnBg:         isDark ? 'rgba(251,191,36,0.1)' : '#fffbeb',
  warnText:       isDark ? '#fde68a' : '#92400e',
  successBg:      isDark ? 'rgba(16,185,129,0.1)' : '#f0fdf4',
  successBorder:  isDark ? 'rgba(16,185,129,0.3)' : '#bbf7d0',
  successText:    isDark ? '#6ee7b7' : '#166534',
  infoBg:         isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
  infoBorder:     isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe',
  infoText:       isDark ? '#93c5fd' : '#1e40af',
  metaBg:         isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
  quoteBg:        isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
  quoteBorder:    isDark ? 'rgba(249,115,22,0.12)' : '#f1f5f9',
  adminNotesBg:   isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
  adminNotesBorder:isDark? 'rgba(99,102,241,0.2)' : '#bfdbfe',
  adminNotesTx:   isDark ? '#93c5fd' : '#1e40af',
  avatarBg:       isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
  avatarTx:       isDark ? '#8a6540' : '#9ca3af',
  avatarLgBg:     isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
  avatarLgTx:     isDark ? '#6b7280' : '#9ca3af',
  starFilled:     isDark ? '#fbbf24' : '#f59e0b',
  starEmpty:      isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db',
  paginationBg:   isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  paginationBorder:isDark? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  paginationTx:   isDark ? '#c4a882' : '#374151',
  checkboxAccent: isDark ? '#f97316' : '#0d9488',
  viewBtnTx:      isDark ? '#fb923c' : '#0d9488',
  viewBtnHover:   isDark ? 'rgba(249,115,22,0.1)' : '#f0fdfa',
  tealShieldColor:isDark ? '#14b8a6' : '#0d9488',
  deleteBtnTx:    isDark ? '#fca5a5' : '#dc2626',
  deleteBtnBg:    isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
  deleteBtnBorder:isDark ? 'rgba(239,68,68,0.25)' : '#fecaca',
  clearBg:        isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
  clearTx:        isDark ? '#c4a882' : '#374151',
  notesBg:        isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
  notesBorder:    isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
});

const ReviewsManagement: React.FC = () => {
  const { isDark } = useTheme() as any;
  const t = useTokens(isDark);
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ count: 0, next: null, previous: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

  const apiCall = async <T,>(endpoint: string, method = 'GET', data: any = null): Promise<T> => {
    return adminService.adminApiCall<T>(endpoint, method, data);
  };

  const loadReviews = async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), page_size: '20' });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      const data = await apiCall<{ results: Review[]; count: number; next: string | null; previous: string | null }>(`/reviews/?${params.toString()}`);
      setReviews(data.results || []);
      setPagination({ count: data.count || 0, next: data.next, previous: data.previous });
      setCurrentPage(page);
    } catch {
      const m = 'Failed to load reviews'; setError(m); showError('Load Failed', m);
    } finally { setLoading(false); }
  };

  const handleApproveClick = (review: Review) => { setSelectedReview(review); setAdminNotes(''); setShowNotesInput(true); setPendingAction('approve'); };
  const handleRejectClick  = (review: Review) => { setSelectedReview(review); setAdminNotes(''); setShowNotesInput(true); setPendingAction('reject'); };

  const executeAction = async () => {
    if (!selectedReview || !pendingAction) return;
    setLoading(true); setShowNotesInput(false);
    try {
      const endpoint = pendingAction === 'approve' ? `/reviews/${selectedReview.id}/approve/` : `/reviews/${selectedReview.id}/reject/`;
      const data = await apiCall<{ message: string; review: Review }>(endpoint, 'POST', { admin_notes: adminNotes });
      showSuccess(pendingAction === 'approve' ? 'Review Approved' : 'Review Rejected', data.message);
      loadReviews(currentPage); setShowDetailModal(false); setSelectedReview(null);
    } catch (err) {
      showError(pendingAction === 'approve' ? 'Approval Failed' : 'Rejection Failed', (err as Error).message);
    } finally { setLoading(false); setPendingAction(null); setAdminNotes(''); }
  };

  const deleteReview = (reviewId: number) => {
    confirm({ title: 'Delete Review', message: 'Permanently delete this review? This cannot be undone.', confirmText: 'Delete', cancelText: 'Cancel', type: 'danger',
      onConfirm: async () => {
        setLoading(true);
        try {
          await apiCall(`/reviews/${reviewId}/`, 'DELETE');
          showSuccess('Review Deleted', 'The review has been permanently removed.');
          loadReviews(currentPage); setShowDetailModal(false); setSelectedReview(null);
        } catch (err) { showError('Delete Failed', (err as Error).message); }
        finally { setLoading(false); }
      }
    });
  };

  const bulkApprove = () => {
    if (!selectedReviews.length) { showWarning('No Selection', 'Please select at least one review.'); return; }
    confirm({ title: 'Bulk Approve Reviews', message: `Approve ${selectedReviews.length} review(s)?`, confirmText: 'Approve All', cancelText: 'Cancel', type: 'info',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await apiCall<{ message: string; approved_count: number }>('/reviews/bulk_approve/', 'POST', { review_ids: selectedReviews });
          showSuccess('Bulk Approval Complete', data.message); setSelectedReviews([]); loadReviews(currentPage);
        } catch (err) { showError('Bulk Approval Failed', (err as Error).message); }
        finally { setLoading(false); }
      }
    });
  };

  const bulkReject = () => {
    if (!selectedReviews.length) { showWarning('No Selection', 'Please select at least one review.'); return; }
    confirm({ title: 'Bulk Reject Reviews', message: `Reject ${selectedReviews.length} review(s)?`, confirmText: 'Reject All', cancelText: 'Cancel', type: 'danger',
      onConfirm: async () => {
        setLoading(true);
        try {
          const data = await apiCall<{ message: string; rejected_count: number }>('/reviews/bulk_reject/', 'POST', { review_ids: selectedReviews });
          showSuccess('Bulk Rejection Complete', data.message); setSelectedReviews([]); loadReviews(currentPage);
        } catch (err) { showError('Bulk Rejection Failed', (err as Error).message); }
        finally { setLoading(false); }
      }
    });
  };

  useEffect(() => { loadReviews(1); }, []);
  useEffect(() => { const tid = setTimeout(() => loadReviews(1), 500); return () => clearTimeout(tid); }, [searchTerm, statusFilter, ratingFilter]);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'N/A';
  const formatDateTime = (d: string | null) => d ? new Date(d).toLocaleString() : 'N/A';

  const renderStars = (rating: number, sm = false) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={sm ? 'w-3.5 h-3.5' : 'w-4 h-4'}
          style={{ color: i < rating ? t.starFilled : t.starEmpty, fill: i < rating ? t.starFilled : t.starEmpty }} />
      ))}
    </div>
  );

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      pending:  { bg: t.warnBg,    color: t.warnText },
      approved: { bg: t.successBg, color: t.successText },
      rejected: { bg: t.dangerBg,  color: t.dangerText },
    };
    return map[status] ?? { bg: t.metaBg, color: t.txMuted };
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
            <input type="text" placeholder="Search reviews..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className={`${inputCls} pl-9`} style={inputStyle} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls} style={selectStyle}>
            <option value="all" style={optStyle}>All Status</option>
            <option value="pending" style={optStyle}>Pending</option>
            <option value="approved" style={optStyle}>Approved</option>
            <option value="rejected" style={optStyle}>Rejected</option>
          </select>
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className={inputCls} style={selectStyle}>
            <option value="all" style={optStyle}>All Ratings</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n} style={optStyle}>{n} Star{n !== 1 ? 's' : ''}</option>)}
          </select>
        </div>

        {selectedReviews.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
            <button onClick={bulkApprove} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 border"
              style={{ background: t.successBg, color: t.successText, borderColor: t.successBorder }}>
              <CheckCircle className="w-4 h-4" /> Approve ({selectedReviews.length})
            </button>
            <button onClick={bulkReject} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 border"
              style={{ background: t.dangerBg, color: t.dangerText, borderColor: t.dangerBorder }}>
              <XCircle className="w-4 h-4" /> Reject ({selectedReviews.length})
            </button>
            <button onClick={() => setSelectedReviews([])}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border"
              style={{ background: t.clearBg, color: t.clearTx, borderColor: t.cardBorder }}>
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
                    checked={selectedReviews.length === reviews.length && reviews.length > 0}
                    onChange={e => setSelectedReviews(e.target.checked ? reviews.map(r => r.id) : [])}
                    className="w-4 h-4 rounded" style={{ accentColor: t.checkboxAccent }} />
                </th>
                {['User', 'Rating', 'Review', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`} style={{ color: t.theadTx }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && reviews.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-14 text-center">
                  <Loader className="w-7 h-7 animate-spin mx-auto mb-2" style={{ color: t.txMuted }} />
                  <p className="text-sm" style={{ color: t.txMuted }}>Loading reviews...</p>
                </td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-14 text-center">
                  <Quote className="w-10 h-10 mx-auto mb-2" style={{ color: t.txMuted, opacity: 0.4 }} />
                  <p className="text-sm" style={{ color: t.txMuted }}>No reviews found</p>
                </td></tr>
              ) : reviews.map((review, idx) => {
                const s = statusBadge(review.status);
                return (
                  <tr key={review.id} className="transition-colors"
                    style={{ borderBottom: `1px solid ${t.divider}`, background: idx % 2 === 0 ? t.cardBg : t.rowBg }}
                    onMouseEnter={e => (e.currentTarget.style.background = t.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? t.cardBg : t.rowBg)}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedReviews.includes(review.id)}
                        onChange={e => setSelectedReviews(e.target.checked ? [...selectedReviews, review.id] : selectedReviews.filter(id => id !== review.id))}
                        className="w-4 h-4 rounded" style={{ accentColor: t.checkboxAccent }} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: t.avatarBg }}>
                          <User className="w-4 h-4" style={{ color: t.avatarTx }} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: t.txPrimary }}>{review.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{renderStars(review.rating, true)}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm line-clamp-2" style={{ color: t.txBody }}>"{review.text}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: s.bg, color: s.color }}>{review.status}</span>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm" style={{ color: t.txMuted }}>{formatDate(review.created_at)}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelectedReview(review); setShowDetailModal(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
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
        {pagination.count > 0 && (
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: `1px solid ${t.divider}` }}>
            <p className="text-xs" style={{ color: t.txMuted }}>
              Showing {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, pagination.count)} of {pagination.count} reviews
            </p>
            <div className="flex gap-2">
              {['Previous', 'Next'].map(label => {
                const disabled = label === 'Previous' ? (!pagination.previous || loading) : (!pagination.next || loading);
                return (
                  <button key={label}
                    onClick={() => loadReviews(currentPage + (label === 'Next' ? 1 : -1))}
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
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: t.modalOverlay }}>
          <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
              style={{ background: t.cardBg, borderBottom: `1px solid ${t.divider}` }}>
              <h2 className="text-lg font-bold" style={{ color: t.txPrimary }}>Review Details</h2>
              <button onClick={() => { setShowDetailModal(false); setSelectedReview(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: t.rowBg, color: t.txMuted }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User header */}
              <div className="flex items-center gap-4 pb-5" style={{ borderBottom: `1px solid ${t.divider}` }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: t.avatarLgBg }}>
                  <User className="w-7 h-7" style={{ color: t.avatarLgTx }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold" style={{ color: t.txPrimary }}>{selectedReview.username}</h3>
                    <Shield className="w-4 h-4" style={{ color: t.tealShieldColor, fill: t.tealShieldColor }} />
                  </div>
                  <div className="flex items-center gap-3">
                    {renderStars(selectedReview.rating)}
                    {(() => { const s = statusBadge(selectedReview.status); return (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: s.bg, color: s.color }}>{selectedReview.status}</span>
                    ); })()}
                  </div>
                </div>
              </div>

              {/* Review text */}
              <div className="rounded-xl p-5 border" style={{ background: t.quoteBg, borderColor: t.quoteBorder }}>
                <Quote className="w-5 h-5 mb-3" style={{ color: t.txMuted }} />
                <p className="text-sm leading-relaxed italic" style={{ color: t.txBody }}>{selectedReview.text}</p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase mb-1 flex items-center gap-1.5" style={{ color: t.txMuted }}>
                    <Calendar className="w-3 h-3" /> Submitted
                  </p>
                  <p className="text-sm" style={{ color: t.txBody }}>{formatDateTime(selectedReview.created_at)}</p>
                </div>
                {selectedReview.reviewed_at && (
                  <div>
                    <p className="text-xs font-semibold uppercase mb-1 flex items-center gap-1.5" style={{ color: t.txMuted }}>
                      <Clock className="w-3 h-3" /> Reviewed
                    </p>
                    <p className="text-sm" style={{ color: t.txBody }}>{formatDateTime(selectedReview.reviewed_at)}</p>
                  </div>
                )}
                {selectedReview.reviewed_by_username && (
                  <div>
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>Reviewed By</p>
                    <p className="text-sm" style={{ color: t.txBody }}>{selectedReview.reviewed_by_username}</p>
                  </div>
                )}
                {selectedReview.admin_notes && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: t.txMuted }}>Admin Notes</p>
                    <p className="text-sm rounded-xl p-3" style={{ color: t.adminNotesTx, background: t.adminNotesBg, border: `1px solid ${t.adminNotesBorder}` }}>{selectedReview.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                {(selectedReview.status === 'pending' || selectedReview.status === 'rejected') && (
                  <button onClick={() => handleApproveClick(selectedReview)} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                    <CheckCircle className="w-4 h-4" /> Approve Review
                  </button>
                )}
                {(selectedReview.status === 'pending' || selectedReview.status === 'approved') && (
                  <button onClick={() => handleRejectClick(selectedReview)} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                    <XCircle className="w-4 h-4" /> Reject Review
                  </button>
                )}
                <button onClick={() => deleteReview(selectedReview.id)} disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 border"
                  style={{ background: t.deleteBtnBg, color: t.deleteBtnTx, borderColor: t.deleteBtnBorder }}>
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Modal */}
      {showNotesInput && selectedReview && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4" style={{ background: t.modalOverlay }}>
          <div className="rounded-2xl max-w-md w-full" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${t.divider}` }}>
              <h3 className="text-base font-bold" style={{ color: t.txPrimary }}>
                {pendingAction === 'approve' ? 'Approve Review' : 'Reject Review'}
              </h3>
              <p className="text-xs mt-1" style={{ color: t.txMuted }}>
                {pendingAction === 'approve' ? 'Add optional notes about this approval' : 'Please provide a reason for rejection'}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-xs font-semibold mb-2" style={{ color: t.labelColor }}>
                Admin Notes {pendingAction === 'reject' && <span style={{ color: t.dangerText }}>*</span>}
              </label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                placeholder={pendingAction === 'approve' ? 'Enter any notes (optional)...' : 'Enter reason for rejection...'}
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none transition-colors"
                style={{ background: t.notesBg, borderColor: t.notesBorder, color: t.txPrimary }}
              />
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${t.divider}` }}>
              <button onClick={() => { setShowNotesInput(false); setPendingAction(null); setAdminNotes(''); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{ background: t.clearBg, borderColor: t.cardBorder, color: t.txBody }}>
                Cancel
              </button>
              <button onClick={executeAction}
                disabled={pendingAction === 'reject' && !adminNotes.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: pendingAction === 'approve' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                {pendingAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;