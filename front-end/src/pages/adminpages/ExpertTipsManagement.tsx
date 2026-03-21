import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Loader, AlertCircle, MessageCircle, Target, Sparkles,
  Heart, Star, Zap, Users, TrendingUp
} from 'lucide-react';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE;

interface ExpertTip {
  id: number; name: string; role: string; image: string; tip: string;
  icon: string; icon_color: string; bg_color: string; active: boolean; display_order: number;
}

const ICON_OPTIONS = [
  { value: 'message-circle', label: 'Message', icon: MessageCircle },
  { value: 'target',         label: 'Target',  icon: Target         },
  { value: 'sparkles',       label: 'Sparkles',icon: Sparkles        },
  { value: 'lightbulb',      label: 'Lightbulb',icon: Lightbulb     },
  { value: 'heart',          label: 'Heart',   icon: Heart           },
  { value: 'star',           label: 'Star',    icon: Star            },
  { value: 'zap',            label: 'Zap',     icon: Zap             },
  { value: 'users',          label: 'Users',   icon: Users           },
  { value: 'trending-up',    label: 'Trending',icon: TrendingUp      },
];

const COLOR_OPTIONS = [
  { value: 'text-blue-500',   label: 'Blue',   preview: 'bg-blue-500'   },
  { value: 'text-rose-500',   label: 'Rose',   preview: 'bg-rose-500'   },
  { value: 'text-amber-500',  label: 'Amber',  preview: 'bg-amber-500'  },
  { value: 'text-violet-500', label: 'Violet', preview: 'bg-violet-500' },
  { value: 'text-green-500',  label: 'Green',  preview: 'bg-green-500'  },
  { value: 'text-purple-500', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'text-pink-500',   label: 'Pink',   preview: 'bg-pink-500'   },
  { value: 'text-teal-500',   label: 'Teal',   preview: 'bg-teal-500'   },
];

const BG_OPTIONS = [
  { value: 'bg-blue-50',   label: 'Blue',   preview: 'bg-blue-200'   },
  { value: 'bg-rose-50',   label: 'Rose',   preview: 'bg-rose-200'   },
  { value: 'bg-amber-50',  label: 'Amber',  preview: 'bg-amber-200'  },
  { value: 'bg-violet-50', label: 'Violet', preview: 'bg-violet-200' },
  { value: 'bg-green-50',  label: 'Green',  preview: 'bg-green-200'  },
  { value: 'bg-purple-50', label: 'Purple', preview: 'bg-purple-200' },
  { value: 'bg-pink-50',   label: 'Pink',   preview: 'bg-pink-200'   },
  { value: 'bg-teal-50',   label: 'Teal',   preview: 'bg-teal-200'   },
];

// ─── Shared tokens ────────────────────────────────────────────────────────────
function useTokens() {
  const { isDark } = useTheme() as any;
  return {
    isDark,
    accentColor : isDark ? "#f97316" : "#1d4ed8",
    pageBg      : isDark ? "#0d0d0d" : "#f8faff",
    txPrimary   : isDark ? "#f0e8de" : "#111827",
    txBody      : isDark ? "#c4a882" : "#4b5563",
    txMuted     : isDark ? "#8a6540" : "#9ca3af",
    cardBg      : isDark ? "#1c1c1c" : "#ffffff",
    cardBorder  : isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5",
    cardShadow  : isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)",
    innerBg     : isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
    divider     : isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9",
    inputBg     : isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
    inputBorder : isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb",
    inputFocus  : isDark ? "#f97316" : "#1d4ed8",
    inputCl     : isDark ? "#f0e8de" : "#111827",
    ctaGradient : isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    ctaShadow   : isDark ? "0 6px 16px rgba(249,115,22,0.3)" : "0 6px 16px rgba(29,78,216,0.25)",
    headerIconBg: isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#7c3aed,#8b5cf6)",
    errBg       : isDark ? "rgba(244,63,94,0.08)" : "#fff1f2",
    errBd       : isDark ? "rgba(244,63,94,0.2)"  : "#fecdd3",
    errCl       : isDark ? "#fca5a5" : "#be123c",
    rowHoverBg  : isDark ? "rgba(249,115,22,0.03)" : "#fafafa",
    tagBg       : isDark ? "rgba(59,130,246,0.08)" : "#eff6ff",
    tagCl       : isDark ? "#93c5fd" : "#1e40af",
    inactiveBg  : isDark ? "rgba(255,255,255,0.04)" : "#f3f4f6",
    inactiveCl  : isDark ? "#4a3520" : "#6b7280",
  };
}

// ─── Tip Card ─────────────────────────────────────────────────────────────────
const TipCard: React.FC<{ tip: ExpertTip; onEdit: () => void; onDelete: () => void; onToggleActive: () => void }> = ({ tip, onEdit, onDelete, onToggleActive }) => {
  const t = useTokens();
  const IconComponent = ICON_OPTIONS.find(o => o.value === tip.icon)?.icon || Lightbulb;

  return (
    <motion.div layout
      whileHover={{ y: -2, boxShadow: t.isDark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 12px 32px rgba(0,0,0,0.08)" }}
      className="rounded-[20px] p-6 transition-all"
      style={{ background: t.isDark ? t.innerBg : "#f9fafb", border: `1px solid ${t.cardBorder}` }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <img src={tip.image} alt={tip.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            style={{ border: `2px solid ${t.cardBorder}` }}
            onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Expert'; }} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-base font-black" style={{ color: t.txPrimary }}>{tip.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: t.tagBg, color: t.tagCl }}>{tip.role}</span>
              {!tip.active && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: t.inactiveBg, color: t.inactiveCl }}>Inactive</span>
              )}
            </div>
            <p className="text-sm italic mb-3 line-clamp-2" style={{ color: t.txBody }}>"{tip.tip}"</p>
            <div className="flex items-center gap-3 text-xs" style={{ color: t.txMuted }}>
              <div className="flex items-center gap-1">
                <IconComponent className={`w-4 h-4 ${tip.icon_color}`} />
                <span>{tip.icon}</span>
              </div>
              <span>Order: {tip.display_order}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-2 flex-shrink-0">
          {[
            { icon: Edit2,  cl: t.accentColor, hov: t.inputBg, fn: onEdit,         title: "Edit"       },
            { icon: tip.active ? EyeOff : Eye, cl: "#f59e0b", hov: t.isDark ? "rgba(245,158,11,0.08)" : "#fef3c7", fn: onToggleActive, title: tip.active ? "Deactivate" : "Activate" },
            { icon: Trash2, cl: "#f43f5e",     hov: t.errBg,   fn: onDelete,       title: "Delete"     },
          ].map(({ icon: Icon, cl, hov, fn, title }) => (
            <button key={title} onClick={fn} title={title}
              className="p-2 rounded-xl transition-colors"
              style={{ color: cl, border: `1px solid ${t.inputBorder}` }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = hov)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const TipEditModal: React.FC<{
  tip: ExpertTip; isCreating: boolean; isSaving: boolean;
  onSave: (tip: ExpertTip) => void; onCancel: () => void;
  onChange: (tip: ExpertTip) => void; validationErrors: string[];
}> = ({ tip, isCreating, isSaving, onSave, onCancel, onChange, validationErrors }) => {
  const t = useTokens();

  const inputStyle: React.CSSProperties = { background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputCl, outline: "none" };
  const focusBd = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = t.inputFocus);
  const blurBd  = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = t.inputBorder);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-[28px] shadow-2xl"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>

        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 rounded-t-[28px]"
          style={{ background: t.cardBg, borderBottom: `1px solid ${t.divider}` }}>
          <h2 className="text-xl font-black" style={{ color: t.txPrimary }}>
            {isCreating ? 'Create New Expert Tip' : 'Edit Expert Tip'}
          </h2>
          <button onClick={onCancel} disabled={isSaving}
            className="p-2 rounded-xl transition-colors disabled:opacity-50"
            style={{ color: t.txMuted }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = t.inputBg)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-xl p-4 flex gap-3" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f43f5e" }} />
              <div>
                <p className="text-sm font-black mb-2" style={{ color: t.errCl }}>Please fix the following:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((err, i) => <li key={i} className="text-sm" style={{ color: t.errCl }}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Expert Name *</label>
            <input type="text" value={tip.name} onChange={e => onChange({ ...tip, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl transition-all" placeholder="e.g., Dr. Alex Rivera" disabled={isSaving}
              style={inputStyle} onFocus={focusBd} onBlur={blurBd} />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Expert Role *</label>
            <input type="text" value={tip.role} onChange={e => onChange({ ...tip, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl transition-all" placeholder="e.g., Relationship Psychologist" disabled={isSaving}
              style={inputStyle} onFocus={focusBd} onBlur={blurBd} />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Image URL *</label>
            <input type="url" value={tip.image} onChange={e => onChange({ ...tip, image: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl transition-all" placeholder="https://i.pravatar.cc/150?img=11" disabled={isSaving}
              style={inputStyle} onFocus={focusBd} onBlur={blurBd} />
            <p className="text-xs mt-1" style={{ color: t.txMuted }}>Suggested: https://i.pravatar.cc/150?img=XX</p>
            {tip.image && (
              <div className="mt-2">
                <p className="text-xs mb-1" style={{ color: t.txMuted }}>Preview:</p>
                <img src={tip.image} alt="Preview" className="w-16 h-16 rounded-full object-cover"
                  style={{ border: `2px solid ${t.cardBorder}` }}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid'; }} />
              </div>
            )}
          </div>

          {/* Tip text */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Expert Tip *</label>
            <textarea value={tip.tip} onChange={e => onChange({ ...tip, tip: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl transition-all resize-none" placeholder="Enter the expert tip…" rows={3} disabled={isSaving}
              style={inputStyle} onFocus={focusBd} onBlur={blurBd} />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Icon</label>
            <div className="grid grid-cols-3 gap-2">
              {ICON_OPTIONS.map(option => {
                const Icon = option.icon;
                const active = tip.icon === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => onChange({ ...tip, icon: option.value })}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                    style={{ background: active ? (t.isDark ? "rgba(249,115,22,0.12)" : "rgba(29,78,216,0.08)") : t.inputBg, border: `2px solid ${active ? t.accentColor : t.inputBorder}`, color: active ? t.accentColor : t.txMuted }}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon color */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Icon Color</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map(option => {
                const active = tip.icon_color === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => onChange({ ...tip, icon_color: option.value })}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                    style={{ background: active ? (t.isDark ? "rgba(249,115,22,0.08)" : "rgba(29,78,216,0.06)") : t.inputBg, border: `2px solid ${active ? t.accentColor : t.inputBorder}` }}>
                    <div className={`w-4 h-4 rounded-full ${option.preview}`} />
                    <span className="text-xs font-semibold" style={{ color: t.txBody }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background color */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Background Color</label>
            <div className="grid grid-cols-4 gap-2">
              {BG_OPTIONS.map(option => {
                const active = tip.bg_color === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => onChange({ ...tip, bg_color: option.value })}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                    style={{ background: active ? (t.isDark ? "rgba(249,115,22,0.08)" : "rgba(29,78,216,0.06)") : t.inputBg, border: `2px solid ${active ? t.accentColor : t.inputBorder}` }}>
                    <div className={`w-4 h-4 rounded ${option.preview}`} />
                    <span className="text-xs font-semibold" style={{ color: t.txBody }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Display Order</label>
            <input type="number" value={tip.display_order} onChange={e => onChange({ ...tip, display_order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl transition-all" min="0" disabled={isSaving}
              style={inputStyle} onFocus={focusBd} onBlur={blurBd} />
            <p className="text-xs mt-1" style={{ color: t.txMuted }}>Lower numbers appear first</p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6" style={{ borderTop: `1px solid ${t.divider}` }}>
          <button onClick={() => onSave(tip)} disabled={isSaving}
            className="flex-1 mt-4 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
            {isSaving
              ? <><Loader className="w-4 h-4 animate-spin" />{isCreating ? 'Creating…' : 'Saving…'}</>
              : <><Save className="w-4 h-4" />{isCreating ? 'Create Tip' : 'Save Changes'}</>}
          </button>
          <button onClick={onCancel} disabled={isSaving}
            className="px-6 mt-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${t.inputBorder}`, color: t.txBody }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const ExpertTipsManagement: React.FC = () => {
  const { showSuccess, showError, showWarning, confirm } = useNotification();
  const t = useTokens();

  const [tips, setTips]                   = useState<ExpertTip[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [editingTip, setEditingTip]       = useState<ExpertTip | null>(null);
  const [isCreating, setIsCreating]       = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving]           = useState(false);

  useEffect(() => { fetchTips(); }, []);

  const fetchTips = async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('admin_token');
      if (!token) { const m = 'No authentication token found'; setError(m); showError('Auth Error', m); return; }
      const res = await fetch(`${API_BASE}/api/admin/expert-tips/`, { headers: { Authorization: `Token ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch expert tips');
      const data = await res.json();
      setTips(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      const m = 'Failed to load expert tips. Please try again.';
      setError(m); showError('Load Failed', m);
    } finally { setLoading(false); }
  };

  const validateTip = (tip: ExpertTip): string[] => {
    const e: string[] = [];
    if (!tip.name?.trim()) e.push('Expert name is required');
    if (!tip.role?.trim()) e.push('Expert role is required');
    if (!tip.image?.trim()) e.push('Expert image URL is required');
    else if (!tip.image.match(/^https?:\/\/.+/)) e.push('Image URL must start with http:// or https://');
    if (!tip.tip?.trim()) e.push('Tip text is required');
    return e;
  };

  const handleSaveTip = async (tip: ExpertTip) => {
    const errors = validateTip(tip);
    if (errors.length) { setValidationErrors(errors); showWarning('Validation Failed', 'Please fix the errors'); return; }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = isCreating ? `${API_BASE}/api/admin/expert-tips/` : `/api/admin/expert-tips/${tip.id}/`;
      const res = await fetch(url, { method: isCreating ? 'POST' : 'PUT', headers: { Authorization:`Token ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(tip) });
      if (res.ok) {
        await fetchTips(); setEditingTip(null); setIsCreating(false); setValidationErrors([]);
        showSuccess(isCreating ? 'Tip Created' : 'Tip Updated', `Expert tip for ${tip.name} has been ${isCreating ? 'created' : 'updated'}`);
      } else { const d = await res.json(); throw new Error(JSON.stringify(d)); }
    } catch (err) { showError(isCreating ? 'Create Failed' : 'Update Failed', 'Failed to save the expert tip.'); }
    finally { setIsSaving(false); }
  };

  const handleDeleteTip = (tip: ExpertTip) => {
    confirm({ title:'Delete Expert Tip', message:`Are you sure you want to delete the tip from ${tip.name}?\n\nThis action cannot be undone.`, type:'danger', confirmText:'Delete Tip', cancelText:'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const res = await fetch(`${API_BASE}/api/admin/expert-tips/${tip.id}/`, { method:'DELETE', headers: { Authorization:`Token ${token}` } });
          if (res.ok) { await fetchTips(); showSuccess('Tip Deleted', `Tip from ${tip.name} has been removed`); }
          else throw new Error('Failed to delete tip');
        } catch { showError('Delete Failed', 'Failed to delete the expert tip'); }
      }
    });
  };

  const handleToggleTipActive = (tip: ExpertTip) => {
    const action = tip.active ? 'deactivate' : 'activate';
    confirm({ title:`${action === 'activate' ? 'Activate' : 'Deactivate'} Tip`, message:`${action.charAt(0).toUpperCase()+action.slice(1)} the tip from ${tip.name}?`, type:'info', confirmText:action==='activate'?'Activate':'Deactivate', cancelText:'Cancel',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const res = await fetch(`${API_BASE}/api/admin/expert-tips/${tip.id}/toggle_active/`, { method:'POST', headers: { Authorization:`Token ${token}` } });
          if (res.ok) { await fetchTips(); showSuccess('Status Updated', `Tip from ${tip.name} has been ${action}d`); }
          else throw new Error('Failed to toggle');
        } catch { showError('Toggle Failed', 'Failed to update tip status'); }
      }
    });
  };

  const handleCreateNewTip = () => {
    setIsCreating(true); setValidationErrors([]);
    setEditingTip({ id:0, name:'', role:'', image:'', tip:'', icon:'lightbulb', icon_color:'text-blue-500', bg_color:'bg-blue-50', active:true, display_order:tips.length });
  };

  const handleCancelEdit = () => {
    if (isCreating || validationErrors.length > 0) {
      confirm({ title:'Discard Changes', message:'Are you sure you want to discard your changes?', type:'warning', confirmText:'Discard', cancelText:'Continue Editing',
        onConfirm: () => { setEditingTip(null); setIsCreating(false); setValidationErrors([]); }
      });
    } else { setEditingTip(null); setIsCreating(false); setValidationErrors([]); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
          <Loader className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium" style={{ color: t.txMuted }}>Loading expert tips…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-xl p-6" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f43f5e" }} />
        <div>
          <h3 className="text-sm font-black mb-1" style={{ color: t.errCl }}>Error Loading Tips</h3>
          <p className="text-sm" style={{ color: t.errCl, opacity: 0.8 }}>{error}</p>
        </div>
      </div>
      <button onClick={fetchTips} className="px-4 py-2 rounded-xl font-semibold text-white" style={{ background: "#f43f5e" }}>Try Again</button>
    </div>
  );

  return (
    <div className="space-y-6 transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[24px] p-6"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.headerIconBg }}>
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black" style={{ color: t.txPrimary }}>Expert Tips</h3>
              <p className="text-sm" style={{ color: t.txMuted }}>
                {tips.length} tip{tips.length !== 1 ? 's' : ''} ·{' '}
                <span style={{ color: "#09cf8b" }}>{tips.filter(t => t.active).length} active</span>
              </p>
            </div>
          </div>
          <motion.button onClick={handleCreateNewTip}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white hover:opacity-90"
            style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
            <Plus className="w-4 h-4" /> Add Tip
          </motion.button>
        </div>

        {/* Empty state */}
        {tips.length === 0 ? (
          <div className="text-center py-16">
            <Lightbulb className="w-16 h-16 mx-auto mb-4" style={{ color: t.isDark ? "#4a3520" : "#e5e7eb" }} />
            <p className="mb-4" style={{ color: t.txMuted }}>No expert tips yet</p>
            <button onClick={handleCreateNewTip}
              className="px-6 py-2 rounded-xl font-semibold text-white hover:opacity-90"
              style={{ background: t.ctaGradient }}>
              Create Your First Tip
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tips.map(tip => (
              <TipCard key={tip.id} tip={tip}
                onEdit={() => { setEditingTip(tip); setValidationErrors([]); setIsCreating(false); }}
                onDelete={() => handleDeleteTip(tip)}
                onToggleActive={() => handleToggleTipActive(tip)} />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {editingTip && (
          <TipEditModal tip={editingTip} isCreating={isCreating} isSaving={isSaving}
            onSave={handleSaveTip} onCancel={handleCancelEdit}
            onChange={setEditingTip} validationErrors={validationErrors} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertTipsManagement;