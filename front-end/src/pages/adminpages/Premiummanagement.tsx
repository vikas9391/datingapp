import React, { useState, useEffect } from 'react';
import { useNotification } from './Notificationsystem';
import {
  Crown, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Star, Check, Zap, Flame, TrendingUp, Loader, AlertCircle,
  Infinity, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE;

interface PremiumPlan {
  plan_id: string;
  name: string;
  duration: string;
  plan_type: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  price: number;
  original_price?: number;
  price_per_month: number;
  discount_text?: string;
  icon: string;
  color: string;
  gradient: string;
  popular: boolean;
  features: string[];
  active: boolean;
  display_order: number;
  calculation_months?: number;
  daily_swipe_limit: number | null;
  monthly_connection_limit: number | null;
}

const ICON_OPTIONS = [
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'flame', label: 'Flame', icon: Flame },
  { value: 'trending-up', label: 'Trending Up', icon: TrendingUp },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'star', label: 'Star', icon: Star },
];

const GRADIENT_OPTIONS = [
  { value: 'bg-gradient-to-br from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
  { value: 'bg-gradient-to-br from-teal-500 to-emerald-500', label: 'Teal to Emerald' },
  { value: 'bg-gradient-to-br from-emerald-500 to-green-500', label: 'Emerald to Green' },
  { value: 'bg-gradient-to-br from-purple-500 to-pink-500', label: 'Purple to Pink' },
  { value: 'bg-gradient-to-br from-orange-500 to-red-500', label: 'Orange to Red' },
];

const PLAN_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Monthly', months: 1 },
  { value: 'quarterly', label: 'Quarterly', months: 3 },
  { value: 'biannual', label: 'Biannual', months: 6 },
  { value: 'annual', label: 'Annual', months: 12 },
];

const MONTH_OPTIONS = [1, 3, 6, 12];

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOKENS HOOK
// ─────────────────────────────────────────────────────────────────────────────

const useTokens = (isDark: boolean) => ({
  accentColor:   isDark ? '#f97316' : '#1d4ed8',
  accentEmber:   isDark ? '#fb923c' : '#3b82f6',
  pageBg:        isDark ? '#0d0d0d' : '#f8faff',
  cardBg:        isDark ? '#1c1c1c' : '#ffffff',
  cardBorder:    isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb',
  cardShadow:    isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(15,23,42,0.08)',
  rowBg:         isDark ? '#161616' : '#f9fafb',
  rowBorder:     isDark ? 'rgba(249,115,22,0.1)' : '#f1f5f9',
  txPrimary:     isDark ? '#f0e8de' : '#111827',
  txBody:        isDark ? '#c4a882' : '#4b5563',
  txMuted:       isDark ? '#8a6540' : '#9ca3af',
  labelColor:    isDark ? '#c4a882' : '#374151',
  inputBg:       isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
  inputBorder:   isDark ? 'rgba(249,115,22,0.22)' : '#d1d5db',
  inputFocus:    isDark ? '#f97316' : '#1d4ed8',
  ctaGradient:   isDark ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
  ctaShadow:     isDark ? '0 6px 18px rgba(249,115,22,0.35)' : '0 6px 18px rgba(29,78,216,0.28)',
  dangerBg:      isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
  dangerBorder:  isDark ? 'rgba(239,68,68,0.3)' : '#fecaca',
  dangerText:    isDark ? '#fca5a5' : '#b91c1c',
  warnBg:        isDark ? 'rgba(251,191,36,0.08)' : '#fffbeb',
  warnBorder:    isDark ? 'rgba(251,191,36,0.3)' : '#fde68a',
  warnText:      isDark ? '#fde68a' : '#92400e',
  successBg:     isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
  successBorder: isDark ? 'rgba(16,185,129,0.3)' : '#bbf7d0',
  successText:   isDark ? '#6ee7b7' : '#166534',
  infoBg:        isDark ? 'rgba(29,78,216,0.1)' : '#eff6ff',
  infoBorder:    isDark ? 'rgba(99,102,241,0.3)' : '#bfdbfe',
  infoText:      isDark ? '#93c5fd' : '#1e40af',
  modalOverlay:  'rgba(0,0,0,0.7)',
  divider:       isDark ? 'rgba(249,115,22,0.1)' : '#f1f5f9',
  badgePopular:  isDark ? 'rgba(251,191,36,0.15)' : '#fef9c3',
  badgePopularTx:isDark ? '#fde68a' : '#854d0e',
  badgeInactive: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
  badgeInactiveTx:isDark? '#6b7280' : '#6b7280',
  badgeType:     isDark ? 'rgba(99,102,241,0.15)' : '#eff6ff',
  badgeTypeTx:   isDark ? '#a5b4fc' : '#1d4ed8',
  tealBg:        isDark ? 'rgba(20,184,166,0.12)' : '#f0fdfa',
  tealBorder:    isDark ? 'rgba(20,184,166,0.3)' : '#99f6e4',
  tealText:      isDark ? '#5eead4' : '#0f766e',
  purpleBg:      isDark ? 'rgba(139,92,246,0.12)' : '#f5f3ff',
  purpleBorder:  isDark ? 'rgba(139,92,246,0.3)' : '#ddd6fe',
  purpleText:    isDark ? '#c4b5fd' : '#6d28d9',
  orangeBg:      isDark ? 'rgba(249,115,22,0.12)' : '#fff7ed',
  orangeBorder:  isDark ? 'rgba(249,115,22,0.3)' : '#fed7aa',
  orangeText:    isDark ? '#fb923c' : '#c2410c',
  calcBg:        isDark ? 'linear-gradient(135deg,rgba(29,78,216,0.12),rgba(20,184,166,0.1))' : 'linear-gradient(135deg,#eff6ff,#f0fdfa)',
  calcBorder:    isDark ? 'rgba(99,102,241,0.3)' : '#bfdbfe',
  toggleBtnBg:   isDark ? 'rgba(249,115,22,0.08)' : 'rgba(29,78,216,0.06)',
  toggleBtnBorder:isDark? 'rgba(249,115,22,0.25)' : 'rgba(29,78,216,0.2)',
  toggleBtnTx:   isDark ? '#fb923c' : '#1d4ed8',
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const PremiumManagement: React.FC = () => {
  const { isDark } = useTheme() as any;
  const t = useTokens(isDark);
  const { showSuccess, showError, showWarning, confirm } = useNotification();

  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PremiumPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      if (!token) { const m = 'No authentication token found'; setError(m); showError('Authentication Error', m); setLoading(false); return; }

      const plansRes = await fetch(`${API_BASE}/api/admin/premium/plans/`, { headers: { Authorization: `Token ${token}` } });
      if (!plansRes.ok) throw new Error('Failed to fetch premium data');
      const plansData = await plansRes.json();

      let processedPlans: PremiumPlan[] = Array.isArray(plansData) ? plansData : plansData?.results ?? plansData?.data ?? (plansData?.plan_id ? [plansData] : []);

      processedPlans = processedPlans.map(plan => {
        const planTypeMonths = PLAN_TYPE_OPTIONS.find(opt => opt.value === plan.plan_type)?.months || 1;
        return {
          ...plan,
          price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
          original_price: plan.original_price ? (typeof plan.original_price === 'string' ? parseFloat(plan.original_price) : plan.original_price) : undefined,
          price_per_month: typeof plan.price_per_month === 'string' ? parseFloat(plan.price_per_month) : plan.price_per_month,
          display_order: typeof plan.display_order === 'string' ? parseInt(plan.display_order) : plan.display_order,
          features: Array.isArray(plan.features) ? plan.features : [],
          calculation_months: plan.calculation_months || planTypeMonths,
          daily_swipe_limit: plan.daily_swipe_limit ?? null,
          monthly_connection_limit: plan.monthly_connection_limit ?? null,
        };
      });
      processedPlans.sort((a, b) => a.display_order - b.display_order);
      setPlans(processedPlans);
    } catch (err) {
      const m = 'Failed to load premium data. Please try again.';
      setError(m); showError('Load Failed', m);
    } finally { setLoading(false); }
  };

  const validatePlan = (plan: PremiumPlan): string[] => {
    const errors: string[] = [];
    if (!plan.plan_id?.trim()) errors.push('Plan ID is required');
    if (!plan.name?.trim()) errors.push('Plan name is required');
    if (!plan.duration?.trim()) errors.push('Duration is required');
    if (plan.price <= 0) errors.push('Price must be greater than 0');
    if (plan.original_price && plan.original_price <= plan.price) errors.push('Original price must be greater than current price');
    if (!plan.plan_type) errors.push('Plan type is required');
    if (!plan.calculation_months || plan.calculation_months <= 0) errors.push('Number of months for calculation is required');
    if (plan.daily_swipe_limit !== null && plan.daily_swipe_limit < 1) errors.push('Daily swipe limit must be at least 1');
    if (plan.monthly_connection_limit !== null && plan.monthly_connection_limit < 1) errors.push('Monthly connection limit must be at least 1');
    return errors;
  };

  const handleSavePlan = async (plan: PremiumPlan) => {
    const errors = validatePlan(plan);
    if (errors.length > 0) { setValidationErrors(errors); showWarning('Validation Failed', 'Please fix the errors before saving'); return; }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = isCreatingPlan ? `${API_BASE}/api/admin/premium/plans/` : `${API_BASE}/api/admin/premium/plans/${plan.plan_id}/`;
      const method = isCreatingPlan ? 'POST' : 'PUT';
      const months = plan.calculation_months || 1;
      const finalPricePerMonth = Math.round((plan.price / months) * 100) / 100;
      const { calculation_months, ...planDataForBackend } = plan;
      const planToSave = { ...planDataForBackend, price_per_month: finalPricePerMonth, daily_swipe_limit: plan.daily_swipe_limit, monthly_connection_limit: plan.monthly_connection_limit };
      const response = await fetch(url, { method, headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(planToSave) });
      if (response.ok) {
        await fetchData();
        setEditingPlan(null); setIsCreatingPlan(false); setValidationErrors([]);
        showSuccess(isCreatingPlan ? 'Plan Created' : 'Plan Updated', isCreatingPlan ? `${plan.name} has been created successfully` : `${plan.name} has been updated`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || (typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : 'Failed to save plan'));
      }
    } catch (err) {
      showError(isCreatingPlan ? 'Create Failed' : 'Update Failed', 'Failed to save the plan. Please try again.');
    } finally { setIsSaving(false); }
  };

  const handleDeletePlan = (plan: PremiumPlan) => {
    confirm({ title: 'Delete Premium Plan', message: `Are you sure you want to delete the "${plan.name}" plan?\n\nThis action cannot be undone.`, type: 'danger', confirmText: 'Delete Plan', cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(`${API_BASE}/api/admin/premium/plans/${plan.plan_id}/`, { method: 'DELETE', headers: { Authorization: `Token ${token}` } });
          if (response.ok) { await fetchData(); showSuccess('Plan Deleted', `${plan.name} has been removed`); }
          else throw new Error('Failed to delete plan');
        } catch { showError('Delete Failed', 'Failed to delete the plan'); }
      }
    });
  };

  const handleTogglePlanActive = (plan: PremiumPlan) => {
    const action = plan.active ? 'deactivate' : 'activate';
    confirm({ title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Plan`, message: `Are you sure you want to ${action} "${plan.name}"?`, type: 'info', confirmText: action === 'activate' ? 'Activate' : 'Deactivate', cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(`${API_BASE}/api/admin/premium/plans/${plan.plan_id}/toggle_active/`, { method: 'POST', headers: { Authorization: `Token ${token}` } });
          if (response.ok) { await fetchData(); showSuccess('Status Updated', `${plan.name} has been ${action}d`); }
          else throw new Error('Failed to toggle');
        } catch { showError('Toggle Failed', 'Failed to update plan status'); }
      }
    });
  };

  const handleTogglePlanPopular = (plan: PremiumPlan) => {
    confirm({ title: plan.popular ? 'Remove Popular Badge' : 'Mark as Popular', message: `Are you sure you want to ${plan.popular ? 'remove the popular badge from' : 'mark as popular'} "${plan.name}"?`, type: 'info', confirmText: plan.popular ? 'Remove Badge' : 'Mark Popular', cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(`${API_BASE}/api/admin/premium/plans/${plan.plan_id}/toggle_popular/`, { method: 'POST', headers: { Authorization: `Token ${token}` } });
          if (response.ok) { await fetchData(); showSuccess('Badge Updated', plan.popular ? `Popular badge removed from ${plan.name}` : `${plan.name} is now marked as popular`); }
          else throw new Error('Failed');
        } catch { showError('Toggle Failed', 'Failed to update popular status'); }
      }
    });
  };

  const handleCreateNewPlan = () => {
    setIsCreatingPlan(true); setValidationErrors([]);
    setEditingPlan({ plan_id: '', name: '', duration: '', plan_type: 'monthly', price: 0, price_per_month: 0, icon: 'zap', color: 'from-blue-500 to-cyan-500', gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500', popular: false, features: [], active: true, display_order: plans.length, calculation_months: 1, daily_swipe_limit: null, monthly_connection_limit: null });
  };

  const handleCancelEdit = () => {
    if (isCreatingPlan || validationErrors.length > 0) {
      confirm({ title: 'Discard Changes', message: 'Are you sure you want to discard your changes?', type: 'warning', confirmText: 'Discard', cancelText: 'Continue Editing',
        onConfirm: () => { setEditingPlan(null); setIsCreatingPlan(false); setValidationErrors([]); }
      });
    } else { setEditingPlan(null); setIsCreatingPlan(false); setValidationErrors([]); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Loader className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: t.accentColor }} />
        <p className="text-sm font-medium" style={{ color: t.txBody }}>Loading premium management...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-xl p-6 border" style={{ background: t.dangerBg, borderColor: t.dangerBorder }}>
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: t.dangerText }} />
        <div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: t.dangerText }}>Error Loading Plans</h3>
          <p className="text-sm" style={{ color: t.dangerText, opacity: 0.85 }}>{error}</p>
        </div>
      </div>
      <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition" style={{ background: '#dc2626' }}>Try Again</button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border p-6 transition-colors duration-300" style={{ background: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)' }}>
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: t.txPrimary }}>Pricing Plans</h3>
              <p className="text-xs" style={{ color: t.txMuted }}>
                {plans.length} plan{plans.length !== 1 ? 's' : ''} · {plans.filter(p => p.active).length} active
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateNewPlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
            style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}
          >
            <Plus className="w-4 h-4" /> Add Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-14">
            <Crown className="w-14 h-14 mx-auto mb-4" style={{ color: t.txMuted, opacity: 0.4 }} />
            <p className="mb-4 text-sm" style={{ color: t.txBody }}>No premium plans yet</p>
            <button onClick={handleCreateNewPlan} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition" style={{ background: t.ctaGradient }}>
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.plan_id}
                plan={plan}
                isDark={isDark}
                t={t}
                onEdit={() => { setEditingPlan(plan); setValidationErrors([]); setIsCreatingPlan(false); }}
                onDelete={() => handleDeletePlan(plan)}
                onToggleActive={() => handleTogglePlanActive(plan)}
                onTogglePopular={() => handleTogglePlanPopular(plan)}
              />
            ))}
          </div>
        )}
      </div>

      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          isCreating={isCreatingPlan}
          isSaving={isSaving}
          isDark={isDark}
          t={t}
          onSave={handleSavePlan}
          onCancel={handleCancelEdit}
          onChange={setEditingPlan}
          validationErrors={validationErrors}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAN CARD
// ─────────────────────────────────────────────────────────────────────────────

const PlanCard: React.FC<{
  plan: PremiumPlan;
  isDark: boolean;
  t: ReturnType<typeof useTokens>;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onTogglePopular: () => void;
}> = ({ plan, isDark, t, onEdit, onDelete, onToggleActive, onTogglePopular }) => {
  const IconComponent = ICON_OPTIONS.find(opt => opt.value === plan.icon)?.icon || Crown;
  const features = Array.isArray(plan.features) ? plan.features : [];
  const price = typeof plan.price === 'number' ? plan.price : parseFloat(String(plan.price) || '0');
  const originalPrice = plan.original_price ? (typeof plan.original_price === 'number' ? plan.original_price : parseFloat(String(plan.original_price))) : undefined;
  const pricePerMonth = typeof plan.price_per_month === 'number' ? plan.price_per_month : parseFloat(String(plan.price_per_month) || '0');

  const actionBtn = (color: 'blue' | 'gray' | 'yellow' | 'green' | 'red') => {
    const map = {
      blue:   { color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', border: isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe' },
      gray:   { color: t.txMuted, bg: t.rowBg, border: t.cardBorder },
      yellow: { color: isDark ? '#fde68a' : '#854d0e', bg: isDark ? 'rgba(251,191,36,0.12)' : '#fef9c3', border: isDark ? 'rgba(251,191,36,0.3)' : '#fde68a' },
      green:  { color: '#16a34a', bg: isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4', border: isDark ? 'rgba(22,163,74,0.3)' : '#bbf7d0' },
      red:    { color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2', border: isDark ? 'rgba(239,68,68,0.3)' : '#fecaca' },
    };
    return map[color];
  };

  return (
    <div
      className="rounded-xl border p-5 transition-all duration-200 hover:shadow-lg"
      style={{ background: t.rowBg, borderColor: t.rowBorder }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-xl ${plan.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-base font-bold" style={{ color: t.txPrimary }}>{plan.name}</h3>
              {plan.popular && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1" style={{ background: t.badgePopular, color: t.badgePopularTx }}>
                  <Star className="w-3 h-3" /> Popular
                </span>
              )}
              {!plan.active && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ background: t.badgeInactive, color: t.badgeInactiveTx }}>Inactive</span>
              )}
              <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: t.badgeType, color: t.badgeTypeTx }}>{plan.plan_type}</span>
            </div>

            <p className="text-xs mb-2" style={{ color: t.txMuted }}>{plan.duration}</p>

            {/* Pricing */}
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-2xl font-black" style={{ color: t.txPrimary }}>₹{price.toFixed(2)}</span>
              {originalPrice && (
                <>
                  <span className="text-base line-through" style={{ color: t.txMuted }}>₹{originalPrice.toFixed(2)}</span>
                  {plan.discount_text && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded" style={{ background: t.successBg, color: t.successText }}>{plan.discount_text}</span>
                  )}
                </>
              )}
            </div>

            <p className="text-xs mb-3" style={{ color: t.txMuted }}>
              ₹{pricePerMonth.toFixed(2)}/month
              {plan.calculation_months && (
                <span className="ml-1" style={{ color: t.txMuted, opacity: 0.6 }}>
                  (over {plan.calculation_months} mo)
                </span>
              )}
            </p>

            {/* Limits */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1" style={{
                background: plan.daily_swipe_limit === null ? t.tealBg : t.orangeBg,
                color: plan.daily_swipe_limit === null ? t.tealText : t.orangeText,
              }}>
                <Zap className="w-3 h-3" />
                {plan.daily_swipe_limit === null ? 'Unlimited swipes/day' : `${plan.daily_swipe_limit} swipes/day`}
              </span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1" style={{
                background: plan.monthly_connection_limit === null ? t.purpleBg : t.infoBg,
                color: plan.monthly_connection_limit === null ? t.purpleText : t.infoText,
              }}>
                <TrendingUp className="w-3 h-3" />
                {plan.monthly_connection_limit === null ? 'Unlimited connections/mo' : `${plan.monthly_connection_limit} connections/mo`}
              </span>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {features.map((feature, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1" style={{ background: t.tealBg, color: t.tealText }}>
                    <Check className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {[
            { color: 'blue' as const, icon: <Edit2 className="w-4 h-4" />, onClick: onEdit, title: 'Edit' },
            { color: (plan.active ? 'gray' : 'green') as 'gray' | 'green', icon: plan.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />, onClick: onToggleActive, title: plan.active ? 'Deactivate' : 'Activate' },
            { color: (plan.popular ? 'yellow' : 'gray') as 'yellow' | 'gray', icon: <Star className={`w-4 h-4 ${plan.popular ? 'fill-current' : ''}`} />, onClick: onTogglePopular, title: plan.popular ? 'Remove Popular' : 'Mark as Popular' },
            { color: 'red' as const, icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, title: 'Delete' },
          ].map((btn, i) => {
            const s = actionBtn(btn.color);
            return (
              <button key={i} onClick={btn.onClick} title={btn.title}
                className="p-2 rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{ color: s.color, background: s.bg, borderColor: s.border }}
              >
                {btn.icon}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LIMIT INPUT
// ─────────────────────────────────────────────────────────────────────────────

const LimitInput: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: number | null;
  onChange: (val: number | null) => void;
  disabled?: boolean;
  defaultValue?: number;
  variant?: 'teal' | 'purple';
  isDark: boolean;
  t: ReturnType<typeof useTokens>;
}> = ({ label, icon, value, onChange, disabled, defaultValue = 10, variant = 'teal', isDark, t }) => {
  const isUnlimited = value === null;
  const activeBg     = variant === 'teal' ? t.tealBg     : t.purpleBg;
  const activeBorder = variant === 'teal' ? t.tealBorder : t.purpleBorder;
  const activeText   = variant === 'teal' ? t.tealText   : t.purpleText;
  const activeFocus  = variant === 'teal' ? t.tealText   : t.purpleText;

  return (
    <div className="rounded-xl border-2 p-4 transition-all duration-200" style={{
      background: isUnlimited ? t.rowBg : activeBg,
      borderColor: isUnlimited ? t.cardBorder : activeBorder,
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: isUnlimited ? t.txMuted : activeText }}>{icon}</span>
          <span className="text-sm font-semibold" style={{ color: t.txBody }}>{label}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(isUnlimited ? defaultValue : null)}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50 hover:scale-105"
          style={{ color: isUnlimited ? t.txMuted : activeText }}
        >
          {isUnlimited ? (
            <><Infinity className="w-4 h-4" /><span>Unlimited</span><ToggleLeft className="w-5 h-5" /></>
          ) : (
            <><span>Limited</span><ToggleRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
      {isUnlimited ? (
        <p className="text-xs text-center py-1" style={{ color: t.txMuted }}>
          No limit — users on this plan can {label.toLowerCase()} without restriction
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="number" min="1"
            value={value ?? ''}
            onChange={(e) => { const v = parseInt(e.target.value); onChange(isNaN(v) || v < 1 ? 1 : v); }}
            disabled={disabled}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-center border-2 outline-none transition-colors disabled:opacity-50"
            style={{ background: t.inputBg, borderColor: activeBorder, color: t.txPrimary }}
          />
          <span className="text-xs whitespace-nowrap" style={{ color: t.txMuted }}>
            {label.includes('wipe') ? 'swipes / day' : 'connections / month'}
          </span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAN EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const PlanEditModal: React.FC<{
  plan: PremiumPlan;
  isCreating: boolean;
  isSaving: boolean;
  isDark: boolean;
  t: ReturnType<typeof useTokens>;
  onSave: (plan: PremiumPlan) => void;
  onCancel: () => void;
  onChange: (plan: PremiumPlan) => void;
  validationErrors: string[];
}> = ({ plan, isCreating, isSaving, isDark, t, onSave, onCancel, onChange, validationErrors }) => {
  const [newFeature, setNewFeature] = useState('');
  const features = Array.isArray(plan.features) ? plan.features : [];
  const months = plan.calculation_months || 1;
  const calculatedPricePerMonth = Math.round((plan.price / months) * 100) / 100;

  const handleAddFeature = () => {
    if (newFeature.trim()) { onChange({ ...plan, features: [...features, newFeature.trim()] }); setNewFeature(''); }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors duration-200 disabled:opacity-50";
  const inputStyle = { background: t.inputBg, borderColor: t.inputBorder, color: t.txPrimary, colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;
  const optStyle = { background: isDark ? '#1c1c1c' : '#ffffff', color: isDark ? '#f0e8de' : '#111827' };
  const selectStyle = { background: isDark ? '#1c1c1c' : '#ffffff', borderColor: t.inputBorder, color: isDark ? '#f0e8de' : '#111827', colorScheme: isDark ? 'dark' : 'light' } as React.CSSProperties;
  const labelStyle = { color: t.labelColor };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: t.modalOverlay }}>
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10" style={{ background: t.cardBg, borderBottom: `1px solid ${t.divider}` }}>
          <h2 className="text-lg font-bold" style={{ color: t.txPrimary }}>
            {isCreating ? 'Create New Plan' : 'Edit Plan'}
          </h2>
          <button onClick={onCancel} disabled={isSaving}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: t.rowBg, color: t.txMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-xl p-4 border" style={{ background: t.dangerBg, borderColor: t.dangerBorder }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.dangerText }} />
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: t.dangerText }}>Please fix the following errors:</p>
                  <ul className="space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx} className="text-xs list-disc ml-4" style={{ color: t.dangerText }}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Plan ID */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Plan ID <span style={{ color: t.dangerText }}>*</span></label>
            <input type="text" value={plan.plan_id} onChange={(e) => onChange({ ...plan, plan_id: e.target.value })} disabled={!isCreating || isSaving} className={inputCls} style={inputStyle} placeholder="e.g., monthly, quarterly" />
            <p className="text-xs mt-1" style={{ color: t.txMuted }}>{isCreating ? 'Unique identifier (cannot be changed later)' : 'Plan ID cannot be changed'}</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Plan Name <span style={{ color: t.dangerText }}>*</span></label>
            <input type="text" value={plan.name} onChange={(e) => onChange({ ...plan, name: e.target.value })} disabled={isSaving} className={inputCls} style={inputStyle} placeholder="e.g., Monthly Premium" />
          </div>

          {/* Duration & Plan Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Duration <span style={{ color: t.dangerText }}>*</span></label>
              <input type="text" value={plan.duration} onChange={(e) => onChange({ ...plan, duration: e.target.value })} disabled={isSaving} className={inputCls} style={inputStyle} placeholder="e.g., 1 Month" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Plan Type <span style={{ color: t.dangerText }}>*</span></label>
              <select value={plan.plan_type} onChange={(e) => onChange({ ...plan, plan_type: e.target.value as PremiumPlan['plan_type'] })} disabled={isSaving} className={inputCls} style={selectStyle}>
                {PLAN_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} style={optStyle}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Price (₹) <span style={{ color: t.dangerText }}>*</span></label>
              <input type="number" step="0.01" value={plan.price} onChange={(e) => onChange({ ...plan, price: parseFloat(e.target.value) || 0 })} disabled={isSaving} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Original Price (₹)</label>
              <input type="number" step="0.01" value={plan.original_price || ''} onChange={(e) => onChange({ ...plan, original_price: parseFloat(e.target.value) || undefined })} disabled={isSaving} className={inputCls} style={inputStyle} placeholder="Optional" />
            </div>
          </div>

          {/* Months for calculation */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={labelStyle}>
              Calculate Price Over How Many Months? <span style={{ color: t.dangerText }}>*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MONTH_OPTIONS.map((mo) => (
                <button key={mo} type="button" onClick={() => onChange({ ...plan, calculation_months: mo })} disabled={isSaving}
                  className="px-3 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                  style={{
                    borderColor: months === mo ? t.accentColor : t.inputBorder,
                    background: months === mo ? (isDark ? 'rgba(249,115,22,0.12)' : 'rgba(29,78,216,0.08)') : t.inputBg,
                    color: months === mo ? t.accentColor : t.txBody,
                    fontWeight: months === mo ? 700 : 500,
                  }}
                >
                  {mo} {mo === 1 ? 'Mo' : 'Mos'}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated monthly cost */}
          <div className="rounded-xl p-4 border-2" style={{ background: t.calcBg, borderColor: t.calcBorder }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" style={{ color: t.infoText }} />
              <span className="text-xs font-semibold" style={{ color: t.infoText }}>Calculated Monthly Cost</span>
            </div>
            <p className="text-2xl font-black mb-0.5" style={{ color: t.accentColor }}>
              ₹{calculatedPricePerMonth.toFixed(2)}<span className="text-sm font-normal" style={{ color: t.txMuted }}>/month</span>
            </p>
            <p className="text-xs" style={{ color: t.txBody }}>₹{plan.price.toFixed(2)} ÷ {months} month{months > 1 ? 's' : ''} = ₹{calculatedPricePerMonth.toFixed(2)}/month</p>
          </div>

          {/* Discount Text */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Discount Text</label>
            <input type="text" value={plan.discount_text || ''} onChange={(e) => onChange({ ...plan, discount_text: e.target.value || undefined })} disabled={isSaving} className={inputCls} style={inputStyle} placeholder="e.g., Save 20%" />
          </div>

          {/* Usage Limits */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={labelStyle}>Usage Limits</label>
            <p className="text-xs mb-3" style={{ color: t.txMuted }}>Toggle to set a cap, or leave as unlimited. Free users always have a hard cap of 3 swipes/day.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LimitInput label="Daily Swipes" icon={<Zap className="w-4 h-4" />} value={plan.daily_swipe_limit} onChange={(val) => onChange({ ...plan, daily_swipe_limit: val })} disabled={isSaving} defaultValue={50} variant="teal" isDark={isDark} t={t} />
              <LimitInput label="Monthly Connections" icon={<TrendingUp className="w-4 h-4" />} value={plan.monthly_connection_limit} onChange={(val) => onChange({ ...plan, monthly_connection_limit: val })} disabled={isSaving} defaultValue={100} variant="purple" isDark={isDark} t={t} />
            </div>
          </div>

          {/* Icon & Gradient */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Icon</label>
              <select value={plan.icon} onChange={(e) => onChange({ ...plan, icon: e.target.value })} disabled={isSaving} className={inputCls} style={selectStyle}>
                {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} style={optStyle}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Gradient</label>
              <select value={plan.gradient} onChange={(e) => onChange({ ...plan, gradient: e.target.value })} disabled={isSaving} className={inputCls} style={selectStyle}>
                {GRADIENT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value} style={optStyle}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Display Order</label>
            <input type="number" value={plan.display_order} onChange={(e) => onChange({ ...plan, display_order: parseInt(e.target.value) || 0 })} disabled={isSaving} min="0" className={inputCls} style={inputStyle} />
            <p className="text-xs mt-1" style={{ color: t.txMuted }}>Lower numbers appear first</p>
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={labelStyle}>Features</label>
            <div className="space-y-2 mb-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text" value={feature}
                    onChange={(e) => { const nf = [...features]; nf[index] = e.target.value; onChange({ ...plan, features: nf }); }}
                    disabled={isSaving}
                    className={`flex-1 ${inputCls}`} style={inputStyle}
                  />
                  <button onClick={() => onChange({ ...plan, features: features.filter((_, i) => i !== index) })} disabled={isSaving}
                    className="p-2 rounded-lg border transition-colors disabled:opacity-50"
                    style={{ color: '#ef4444', background: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2', borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                disabled={isSaving} className={`flex-1 ${inputCls}`} style={inputStyle} placeholder="Add a feature..."
              />
              <button onClick={handleAddFeature} disabled={isSaving}
                className="px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 active:scale-95"
                style={{ background: t.ctaGradient }}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5" style={{ borderTop: `1px solid ${t.divider}` }}>
          <button
            onClick={() => onSave(plan)} disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}
          >
            {isSaving ? (<><Loader className="w-4 h-4 animate-spin" />{isCreating ? 'Creating...' : 'Saving...'}</>) : (<><Save className="w-4 h-4" />{isCreating ? 'Create Plan' : 'Save Changes'}</>)}
          </button>
          <button onClick={onCancel} disabled={isSaving}
            className="px-6 py-2 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50"
            style={{ background: t.inputBg, borderColor: t.cardBorder, color: t.txBody }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumManagement;