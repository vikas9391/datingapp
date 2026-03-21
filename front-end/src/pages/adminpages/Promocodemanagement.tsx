import React, { useState, useEffect } from 'react';
import {
  Ticket, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Users, TrendingUp, Loader, AlertCircle, Check,
  Copy, BarChart3, Clock, Tag
} from 'lucide-react';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE_URL = `${API_BASE}/api/admin`;

const getAuthHeaders = () => ({
  Authorization: `Token ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json',
});

// ─── Types ────────────────────────────────────────────────────────────────

interface PromoCode {
  id: number;
  code: string;
  description: string;
  discount_percentage: number;
  plan: string;
  plan_name: string;
  plan_price: number;
  max_uses: number;
  current_uses: number;
  remaining_uses: number;
  usage_percentage: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  is_valid: boolean;
  created_by_username: string | null;
  created_at: string;
  updated_at: string;
  recent_usages: PromoUsage[];
}

interface PromoUsage {
  id: number;
  username: string;
  user_email: string;
  plan_name: string;
  used_at: string;
}

interface PremiumPlan {
  plan_id: string;
  name: string;
  price: number;
  active: boolean;
}

// ─── Theme Tokens ─────────────────────────────────────────────────────────

const useTokens = (isDark: boolean) => ({
  accentColor:    isDark ? '#f97316' : '#1d4ed8',
  accentEmber:    isDark ? '#fb923c' : '#3b82f6',
  pageBg:         isDark ? '#0d0d0d' : '#f8faff',
  cardBg:         isDark ? '#1c1c1c' : '#ffffff',
  cardBorder:     isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  cardShadow:     isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(15,23,42,0.08)',
  rowBg:          isDark ? '#161616' : '#f9fafb',
  rowBorder:      isDark ? 'rgba(249,115,22,0.1)' : '#e5e7eb',
  rowBorderActive:isDark ? 'rgba(20,184,166,0.35)' : '#99f6e4',
  txPrimary:      isDark ? '#f0e8de' : '#111827',
  txBody:         isDark ? '#c4a882' : '#4b5563',
  txMuted:        isDark ? '#8a6540' : '#9ca3af',
  labelColor:     isDark ? '#c4a882' : '#374151',
  inputBg:        isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  inputBorder:    isDark ? 'rgba(249,115,22,0.22)' : '#d1d5db',
  ctaGradient:    isDark ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
  ctaShadow:      isDark ? '0 6px 18px rgba(249,115,22,0.35)' : '0 6px 18px rgba(29,78,216,0.28)',
  tealGradient:   isDark ? 'linear-gradient(135deg,#0d9488,#10b981)' : 'linear-gradient(135deg,#0d9488,#10b981)',
  dangerBg:       isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
  dangerBorder:   isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  dangerText:     isDark ? '#fca5a5' : '#b91c1c',
  successBg:      isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
  successBorder:  isDark ? 'rgba(16,185,129,0.3)' : '#bbf7d0',
  successText:    isDark ? '#6ee7b7' : '#166534',
  infoBg:         isDark ? 'rgba(29,78,216,0.1)' : '#eff6ff',
  infoBorder:     isDark ? 'rgba(99,102,241,0.3)' : '#bfdbfe',
  infoText:       isDark ? '#93c5fd' : '#1e40af',
  warnBg:         isDark ? 'rgba(251,191,36,0.1)' : '#fffbeb',
  warnBorder:     isDark ? 'rgba(251,191,36,0.3)' : '#fde68a',
  warnText:       isDark ? '#fde68a' : '#92400e',
  orangeBg:       isDark ? 'rgba(249,115,22,0.1)' : '#fff7ed',
  orangeBorder:   isDark ? 'rgba(249,115,22,0.3)' : '#fed7aa',
  orangeText:     isDark ? '#fb923c' : '#c2410c',
  tealBg:         isDark ? 'rgba(20,184,166,0.12)' : '#f0fdfa',
  tealBorder:     isDark ? 'rgba(20,184,166,0.3)' : '#99f6e4',
  tealText:       isDark ? '#5eead4' : '#0f766e',
  tealBtnBg:      isDark ? 'linear-gradient(135deg,rgba(20,184,166,0.8),rgba(16,185,129,0.8))' : 'linear-gradient(135deg,#0d9488,#10b981)',
  modalOverlay:   'rgba(0,0,0,0.7)',
  divider:        isDark ? 'rgba(249,115,22,0.1)' : '#f1f5f9',
  progressBg:     isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
  badgeFree:      isDark ? 'rgba(251,191,36,0.15)' : '#fef9c3',
  badgeFreeTx:    isDark ? '#fde68a' : '#854d0e',
  filterBtnActive:isDark ? 'rgba(20,184,166,0.2)' : '#0d9488',
  filterBtnActiveTx: isDark ? '#5eead4' : '#ffffff',
  filterBtnBg:    isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  filterBtnTx:    isDark ? '#c4a882' : '#4b5563',
  copyBtnBg:      isDark ? 'linear-gradient(135deg,rgba(20,184,166,0.9),rgba(16,185,129,0.9))' : 'linear-gradient(135deg,#0d9488,#10b981)',
  calcPreviewBg:  isDark ? 'linear-gradient(135deg,rgba(20,184,166,0.1),rgba(29,78,216,0.1))' : 'linear-gradient(135deg,#f0fdfa,#eff6ff)',
  calcPreviewBorder:isDark? 'rgba(20,184,166,0.3)' : '#99f6e4',
  calcPreviewTx:  isDark ? '#5eead4' : '#0f766e',
  usageBtnBg:     isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
  usageBtnHover:  isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
});

// ─── Stat Card ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  colorKey: 'blue' | 'green' | 'gray' | 'orange' | 'purple';
  isDark: boolean;
  t: ReturnType<typeof useTokens>;
}> = ({ label, value, icon: Icon, colorKey, isDark, t }) => {
  const colorMap = {
    blue:   { bg: isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff',   text: isDark ? '#93c5fd' : '#1d4ed8' },
    green:  { bg: isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4',   text: isDark ? '#6ee7b7' : '#166534' },
    gray:   { bg: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb',  text: isDark ? '#9ca3af' : '#6b7280' },
    orange: { bg: isDark ? 'rgba(249,115,22,0.12)' : '#fff7ed',   text: isDark ? '#fb923c' : '#c2410c' },
    purple: { bg: isDark ? 'rgba(139,92,246,0.12)' : '#f5f3ff',   text: isDark ? '#c4b5fd' : '#6d28d9' },
  };
  const c = colorMap[colorKey];
  return (
    <div className="rounded-xl px-4 py-3 border transition-colors duration-300"
      style={{ background: c.bg, borderColor: isDark ? 'transparent' : '#f1f5f9' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color: c.text }} />
        <span className="text-xs font-semibold" style={{ color: c.text }}>{label}</span>
      </div>
      <span className="text-2xl font-black" style={{ color: c.text }}>{value}</span>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────

const PromoCodeModal: React.FC<{
  promo: Partial<PromoCode> | null;
  plans: PremiumPlan[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isCreating: boolean;
  isDark: boolean;
  t: ReturnType<typeof useTokens>;
}> = ({ promo, plans, onSave, onCancel, isCreating, isDark, t }) => {
  const [code, setCode] = useState(promo?.code || '');
  const [description, setDescription] = useState(promo?.description || '');
  const [planId, setPlanId] = useState(promo?.plan || '');
  const [discountPercentage, setDiscountPercentage] = useState(promo?.discount_percentage || 100);
  const [maxUses, setMaxUses] = useState(promo?.max_uses || 100);
  const [validFrom, setValidFrom] = useState(promo?.valid_from ? new Date(promo.valid_from).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [validUntil, setValidUntil] = useState(promo?.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!code.trim()) { setError('Code is required'); return; }
    if (!planId) { setError('Please select a plan'); return; }
    if (maxUses < 1) { setError('Max uses must be at least 1'); return; }
    if (discountPercentage < 0 || discountPercentage > 100) { setError('Discount must be between 0 and 100'); return; }
    setSaving(true); setError('');
    try {
      await onSave({ code: code.trim().toUpperCase(), description: description.trim(), plan: planId, discount_percentage: discountPercentage, max_uses: maxUses, valid_from: validFrom, valid_until: validUntil || null });
    } catch (err: any) {
      setError(err.message || 'Failed to save promo code');
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors duration-200 disabled:opacity-50";
  const inputStyle = { background: t.inputBg, borderColor: t.inputBorder, color: t.txPrimary, colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;
  const optStyle = { background: isDark ? '#1c1c1c' : '#ffffff', color: isDark ? '#f0e8de' : '#111827' };
  const selectStyle = { background: isDark ? '#1c1c1c' : '#ffffff', borderColor: t.inputBorder, color: isDark ? '#f0e8de' : '#111827', colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;

  const activePlan = plans.find(p => p.plan_id === planId);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: t.modalOverlay }}>
      <div className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
          style={{ background: t.cardBg, borderBottom: `1px solid ${t.divider}` }}
        >
          <h3 className="text-lg font-bold" style={{ color: t.txPrimary }}>
            {isCreating ? 'Create Promo Code' : 'Edit Promo Code'}
          </h3>
          <button onClick={onCancel} className="p-2 rounded-lg transition-colors"
            style={{ background: t.rowBg, color: t.txMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl p-3 border flex gap-2" style={{ background: t.dangerBg, borderColor: t.dangerBorder }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.dangerText }} />
              <p className="text-sm" style={{ color: t.dangerText }}>{error}</p>
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>
              Promo Code <span style={{ color: t.dangerText }}>*</span>
            </label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              disabled={!isCreating || saving} placeholder="e.g., SUMMER100, FREEMONTH"
              className={`${inputCls} font-mono`} style={inputStyle}
            />
            {isCreating && <p className="text-xs mt-1" style={{ color: t.txMuted }}>Use uppercase letters, numbers, hyphens, and underscores</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>Description (Internal)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={saving}
              placeholder="Internal note about this promo code..." rows={2}
              className={`${inputCls} resize-none`} style={inputStyle}
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>
              Plan <span style={{ color: t.dangerText }}>*</span>
            </label>
            <select value={planId} onChange={e => setPlanId(e.target.value)} disabled={saving}
              className={inputCls} style={selectStyle}
            >
              <option value="" style={optStyle}>Select a plan</option>
              {plans.filter(p => p.active).map(plan => (
                <option key={plan.plan_id} value={plan.plan_id} style={optStyle}>
                  {plan.name} — ₹{plan.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Discount & Max Uses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>
                Discount % <span style={{ color: t.dangerText }}>*</span>
              </label>
              <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(parseInt(e.target.value) || 0)}
                disabled={saving} min="0" max="100" className={inputCls} style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: t.txMuted }}>100% = FREE plan</p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>
                Max Uses <span style={{ color: t.dangerText }}>*</span>
              </label>
              <input type="number" value={maxUses} onChange={e => setMaxUses(parseInt(e.target.value) || 1)}
                disabled={saving} min="1" className={inputCls} style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: t.txMuted }}>Number of people who can use this</p>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>
                Valid From <span style={{ color: t.dangerText }}>*</span>
              </label>
              <input type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)}
                disabled={saving} className={inputCls} style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: t.labelColor }}>Valid Until (Optional)</label>
              <input type="datetime-local" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                disabled={saving} className={inputCls} style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: t.txMuted }}>Leave empty for no expiration</p>
            </div>
          </div>

          {/* Preview */}
          {planId && (
            <div className="rounded-xl p-4 border-2" style={{ background: t.calcPreviewBg, borderColor: t.calcPreviewBorder }}>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" style={{ color: t.calcPreviewTx }} />
                <span className="text-xs font-semibold" style={{ color: t.calcPreviewTx }}>Preview</span>
              </div>
              <p className="text-xl font-black mb-1 font-mono" style={{ color: t.accentColor }}>{code || 'CODE'}</p>
              <p className="text-sm" style={{ color: t.txBody }}>
                {discountPercentage}% off {activePlan?.name}
                {discountPercentage === 100 && <span className="ml-1 font-bold" style={{ color: t.calcPreviewTx }}>(FREE!)</span>}
              </p>
              <p className="text-xs mt-1.5" style={{ color: t.txMuted }}>Max {maxUses} {maxUses === 1 ? 'person' : 'people'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5" style={{ borderTop: `1px solid ${t.divider}` }}>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: t.tealBtnBg }}
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isCreating ? 'Create Code' : 'Save Changes'}
          </button>
          <button onClick={onCancel} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50"
            style={{ background: t.inputBg, borderColor: t.cardBorder, color: t.txBody }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Promo Code Card ──────────────────────────────────────────────────────

const PromoCodeCard: React.FC<{
  promo: PromoCode;
  isDark: boolean;
  t: ReturnType<typeof useTokens>;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onViewUsages: () => void;
}> = ({ promo, isDark, t, onEdit, onDelete, onToggleActive, onViewUsages }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatus = () => {
    if (!promo.active) return { label: 'Inactive', bg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: t.txMuted };
    if (!promo.is_valid && promo.remaining_uses === 0) return { label: 'Used Up', bg: isDark ? 'rgba(249,115,22,0.12)' : '#fff7ed', color: isDark ? '#fb923c' : '#c2410c' };
    if (!promo.is_valid) return { label: 'Expired', bg: t.dangerBg, color: t.dangerText };
    return { label: 'Active', bg: t.successBg, color: t.successText };
  };

  const status = getStatus();
  const isHealthy = promo.active && promo.is_valid;
  const progressColor = promo.usage_percentage >= 100 ? '#ef4444' : promo.usage_percentage >= 75 ? '#f97316' : isDark ? '#14b8a6' : '#0d9488';

  const actionBtn = (type: 'edit' | 'toggle' | 'delete') => ({
    edit:   { color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',  border: isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe' },
    toggle: promo.active
      ? { color: t.txMuted, bg: t.rowBg, border: t.cardBorder }
      : { color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', border: isDark ? 'rgba(22,163,74,0.3)' : '#bbf7d0' },
    delete: { color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2', border: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca' },
  }[type]);

  return (
    <div className="rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg"
      style={{
        background: t.cardBg,
        borderColor: isHealthy ? t.rowBorderActive : t.rowBorder,
        opacity: !isHealthy ? 0.82 : 1,
        boxShadow: isHealthy ? t.cardShadow : 'none',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Copy button */}
            <button onClick={copyCode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-mono font-bold text-sm transition-all active:scale-95 group"
              style={{ background: t.copyBtnBg }}
            >
              {promo.code}
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />}
            </button>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
            {promo.discount_percentage === 100 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ background: t.badgeFree, color: t.badgeFreeTx }}>FREE</span>
            )}
          </div>

          {promo.description && (
            <p className="text-xs mb-2" style={{ color: t.txBody }}>{promo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: t.txBody }}>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" style={{ color: isDark ? '#14b8a6' : '#0d9488' }} />
              {promo.plan_name}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }} />
              {promo.discount_percentage}% off
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 ml-3 flex-shrink-0">
          {(['edit', 'toggle', 'delete'] as const).map((type) => {
            const s = actionBtn(type);
            return (
              <button key={type}
                onClick={type === 'edit' ? onEdit : type === 'toggle' ? onToggleActive : onDelete}
                title={type === 'toggle' ? (promo.active ? 'Deactivate' : 'Activate') : type.charAt(0).toUpperCase() + type.slice(1)}
                className="p-2 rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{ color: s.color, background: s.bg, borderColor: s.border }}
              >
                {type === 'edit' ? <Edit2 className="w-4 h-4" /> :
                 type === 'toggle' ? (promo.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />) :
                 <Trash2 className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span style={{ color: t.txBody }}>Usage</span>
          <span className="font-bold" style={{ color: t.txPrimary }}>{promo.current_uses} / {promo.max_uses}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: t.progressBg }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(promo.usage_percentage, 100)}%`, background: progressColor }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: t.txMuted }}>
          {promo.remaining_uses} {promo.remaining_uses === 1 ? 'use' : 'uses'} remaining
        </p>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: `1px solid ${t.divider}`, color: t.txMuted }}>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          From {new Date(promo.valid_from).toLocaleDateString()}
        </span>
        <span>{promo.valid_until ? `Until ${new Date(promo.valid_until).toLocaleDateString()}` : 'No expiration'}</span>
      </div>

      {/* View usages */}
      {promo.current_uses > 0 && (
        <button onClick={onViewUsages}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: t.usageBtnBg, color: t.txBody }}
          onMouseEnter={e => (e.currentTarget.style.background = t.usageBtnHover)}
          onMouseLeave={e => (e.currentTarget.style.background = t.usageBtnBg)}
        >
          <Users className="w-4 h-4" />
          View {promo.current_uses} {promo.current_uses === 1 ? 'User' : 'Users'}
        </button>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────

const PromoCodeManagement: React.FC = () => {
  const { isDark } = useTheme() as any;
  const t = useTokens(isDark);
  const { showSuccess, showError, confirm } = useNotification();

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => { fetchData(); }, [filterActive]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== 'all') params.append('active', filterActive === 'active' ? 'true' : 'false');

      const [promoRes, plansRes] = await Promise.all([
        fetch(`${API_BASE_URL}/promo-codes/?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/premium/plans/`, { headers: getAuthHeaders() }),
      ]);

      if (promoRes.ok && plansRes.ok) {
        const promoData = await promoRes.json();
        const plansData = await plansRes.json();

        const processedPromos: PromoCode[] = Array.isArray(promoData) ? promoData : promoData?.results ?? promoData?.data ?? [];
        let processedPlans: PremiumPlan[] = Array.isArray(plansData) ? plansData : plansData?.results ?? plansData?.data ?? [];
        processedPlans = processedPlans.map(plan => ({
          ...plan,
          price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
          active: Boolean(plan.active),
        }));

        setPromoCodes(processedPromos);
        setPlans(processedPlans);
      } else {
        showError('Failed to load data.');
      }
    } catch (err) {
      showError('Failed to load promo codes');
    } finally { setLoading(false); }
  };

  const handleSavePromo = async (data: any) => {
    const url = editingPromo ? `${API_BASE_URL}/promo-codes/${editingPromo.id}/` : `${API_BASE_URL}/promo-codes/`;
    const method = editingPromo ? 'PATCH' : 'POST';
    const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(data) });
    if (response.ok) {
      await fetchData();
      setModalOpen(false); setEditingPromo(null); setIsCreating(false);
      showSuccess(editingPromo ? 'Promo code updated' : 'Promo code created');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to save promo code');
    }
  };

  const handleDeletePromo = (promo: PromoCode) => {
    confirm({ title: `Delete ${promo.code}?`, message: 'Are you sure you want to delete this promo code? This cannot be undone.', type: 'danger', confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/promo-codes/${promo.id}/`, { method: 'DELETE', headers: getAuthHeaders() });
          if (response.ok || response.status === 204) { await fetchData(); showSuccess('Promo code deleted'); }
        } catch { showError('Failed to delete promo code'); }
      },
    });
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/promo-codes/${promo.id}/toggle_active/`, { method: 'POST', headers: getAuthHeaders() });
      if (response.ok) { await fetchData(); showSuccess(`Promo code ${promo.active ? 'deactivated' : 'activated'}`); }
    } catch { showError('Failed to toggle promo code'); }
  };

  const handleViewUsages = (promo: PromoCode) => {
    alert(`${promo.code} has been used ${promo.current_uses} times.\n\nRecent users:\n${promo.recent_usages.map(u => `- ${u.username} (${u.user_email})`).join('\n')}`);
  };

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.active && p.is_valid).length,
    inactive: promoCodes.filter(p => !p.active).length,
    usedUp: promoCodes.filter(p => p.remaining_uses === 0).length,
    totalRedemptions: promoCodes.reduce((sum, p) => sum + p.current_uses, 0),
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader className="w-8 h-8 animate-spin" style={{ color: isDark ? '#14b8a6' : '#0d9488' }} />
    </div>
  );

  return (
    <div className="space-y-5 transition-colors duration-300">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Codes"    value={stats.total}             icon={Ticket}      colorKey="blue"   isDark={isDark} t={t} />
        <StatCard label="Active"         value={stats.active}            icon={Check}       colorKey="green"  isDark={isDark} t={t} />
        <StatCard label="Inactive"       value={stats.inactive}          icon={EyeOff}      colorKey="gray"   isDark={isDark} t={t} />
        <StatCard label="Used Up"        value={stats.usedUp}            icon={Users}       colorKey="orange" isDark={isDark} t={t} />
        <StatCard label="Total Uses"     value={stats.totalRedemptions}  icon={TrendingUp}  colorKey="purple" isDark={isDark} t={t} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button key={filter} onClick={() => setFilterActive(filter)}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: filterActive === filter ? (isDark ? 'rgba(20,184,166,0.18)' : '#0d9488') : t.filterBtnBg,
                color: filterActive === filter ? (isDark ? '#5eead4' : '#ffffff') : t.filterBtnTx,
                border: `1px solid ${filterActive === filter ? (isDark ? 'rgba(20,184,166,0.4)' : 'transparent') : t.cardBorder}`,
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditingPromo(null); setIsCreating(true); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95"
          style={{ background: t.tealBtnBg, boxShadow: isDark ? '0 4px 12px rgba(20,184,166,0.3)' : '0 4px 12px rgba(13,148,136,0.3)' }}
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Grid */}
      {promoCodes.length === 0 ? (
        <div className="rounded-2xl py-16 text-center border transition-colors duration-300"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}
        >
          <Ticket className="w-12 h-12 mx-auto mb-3" style={{ color: t.txMuted, opacity: 0.4 }} />
          <p className="text-sm mb-4" style={{ color: t.txBody }}>No promo codes yet</p>
          <button onClick={() => { setEditingPromo(null); setIsCreating(true); setModalOpen(true); }}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
            style={{ background: t.tealBtnBg }}
          >
            Create Your First Code
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promoCodes.map((promo) => (
            <PromoCodeCard
              key={promo.id}
              promo={promo}
              isDark={isDark}
              t={t}
              onEdit={() => { setEditingPromo(promo); setIsCreating(false); setModalOpen(true); }}
              onDelete={() => handleDeletePromo(promo)}
              onToggleActive={() => handleToggleActive(promo)}
              onViewUsages={() => handleViewUsages(promo)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PromoCodeModal
          promo={editingPromo}
          plans={plans}
          onSave={handleSavePromo}
          onCancel={() => { setModalOpen(false); setEditingPromo(null); setIsCreating(false); }}
          isCreating={isCreating}
          isDark={isDark}
          t={t}
        />
      )}
    </div>
  );
};

export default PromoCodeManagement;