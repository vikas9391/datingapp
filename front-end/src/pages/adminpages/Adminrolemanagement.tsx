import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Shield, Edit2, Trash2, Save, X,
  Loader, AlertCircle, AlertTriangle, Check, ChevronDown, ChevronUp,
  Eye, EyeOff, Users, BarChart3, FileText,
  Crown, Lightbulb, Quote, Lock, Copy, CheckCircle, Key
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE_URL = `${API_BASE}/api/admin/admin-roles/`;
const getAuthHeaders = () => adminService.getAdminHeaders();

type PermissionLevel = 'none' | 'view' | 'edit';

const SECTIONS = [
  { id: 'overview',    label: 'Overview',        icon: BarChart3,     color: 'text-blue-500',   bg: 'bg-blue-50'   },
  { id: 'users',       label: 'User Management', icon: Users,         color: 'text-teal-500',   bg: 'bg-teal-50'   },
  { id: 'reports',     label: 'Reports',         icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'analytics',   label: 'Admin Actions',   icon: FileText,      color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'premium',     label: 'Premium',         icon: Crown,         color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'expert-tips', label: 'Expert Tips',     icon: Lightbulb,     color: 'text-amber-500',  bg: 'bg-amber-50'  },
  { id: 'reviews',     label: 'Reviews',         icon: Quote,         color: 'text-rose-500',   bg: 'bg-rose-50'   },
] as const;

type SectionId = typeof SECTIONS[number]['id'];
type SectionPermissions = { [K in SectionId]: PermissionLevel };

interface AdminRole {
  id: number; email: string; username: string; role_name: string;
  is_super_admin: boolean; is_active: boolean; permissions: SectionPermissions;
  created_at: string; last_login: string | null; invite_token: string | null;
  invite_accepted: boolean; initial_password?: string; password_changed?: boolean;
}

const emptyPermissions   = (): SectionPermissions => ({ overview:'none', users:'none', reports:'none', analytics:'none', premium:'none', 'expert-tips':'none', reviews:'none' });
const allViewPermissions = (): SectionPermissions => ({ overview:'view', users:'view', reports:'view', analytics:'view', premium:'view', 'expert-tips':'view', reviews:'view' });
const allEditPermissions = (): SectionPermissions => ({ overview:'edit', users:'edit', reports:'edit', analytics:'edit', premium:'edit', 'expert-tips':'edit', reviews:'edit' });
const countPermissions = (p: SectionPermissions) => {
  const v = Object.values(p);
  return { view: v.filter(x => x==='view').length, edit: v.filter(x => x==='edit').length, none: v.filter(x => x==='none').length };
};

// ─── Shared token hook ────────────────────────────────────────────────────────
function useAdminTokens() {
  const { isDark } = useTheme() as any;
  return {
    isDark,
    accentColor : isDark ? "#f97316" : "#1d4ed8",
    accentEmber : isDark ? "#fb923c" : "#3b82f6",
    pageBg      : isDark ? "#0d0d0d" : "#f8faff",
    txPrimary   : isDark ? "#f0e8de" : "#111827",
    txBody      : isDark ? "#c4a882" : "#4b5563",
    txMuted     : isDark ? "#8a6540" : "#9ca3af",
    cardBg      : isDark ? "#1c1c1c" : "#ffffff",
    cardBorder  : isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5",
    cardShadow  : isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)",
    divider     : isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9",
    inputBg     : isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
    inputBorder : isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb",
    inputFocus  : isDark ? "#f97316" : "#1d4ed8",
    inputCl     : isDark ? "#f0e8de" : "#111827",
    ctaGradient : isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    ctaShadow   : isDark ? "0 6px 16px rgba(249,115,22,0.3)" : "0 6px 16px rgba(29,78,216,0.25)",
    modalBg     : isDark ? "#1c1c1c" : "#ffffff",
    modalBorder : isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5",
    warnBg      : isDark ? "rgba(234,179,8,0.08)"  : "#fefce8",
    warnBd      : isDark ? "rgba(234,179,8,0.2)"   : "#fde68a",
    warnCl      : isDark ? "#fde047" : "#854d0e",
    errBg       : isDark ? "rgba(244,63,94,0.08)"  : "#fff1f2",
    errBd       : isDark ? "rgba(244,63,94,0.2)"   : "#fecdd3",
    errCl       : isDark ? "#fca5a5" : "#be123c",
    successBg   : isDark ? "rgba(9,207,139,0.08)"  : "#f0fdf4",
    successBd   : isDark ? "rgba(9,207,139,0.2)"   : "#bbf7d0",
    successCl   : isDark ? "#09cf8b" : "#166534",
    amberBg     : isDark ? "rgba(245,158,11,0.08)" : "#fff7ed",
    amberBd     : isDark ? "rgba(245,158,11,0.2)"  : "#fed7aa",
    amberCl     : isDark ? "#fbbf24" : "#92400e",
    infoBg      : isDark ? "rgba(59,130,246,0.08)" : "#eff6ff",
    infoBd      : isDark ? "rgba(59,130,246,0.2)"  : "#bfdbfe",
    infoCl      : isDark ? "#93c5fd" : "#1e40af",
    pillNone    : isDark ? { bg:"rgba(255,255,255,0.06)", cl:"#8a6540" } : { bg:"#f3f4f6", cl:"#6b7280" },
    pillView    : isDark ? { bg:"rgba(59,130,246,0.12)", cl:"#93c5fd" } : { bg:"#eff6ff",  cl:"#1e40af" },
    pillEdit    : isDark ? { bg:"rgba(9,207,139,0.12)",  cl:"#09cf8b" } : { bg:"#f0fdf4",  cl:"#166534" },
    rowHoverBg  : isDark ? "rgba(249,115,22,0.03)" : "#fafafa",
    superGrad   : "linear-gradient(135deg,#f59e0b,#f97316)",
    modGrad     : isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    disabledBg  : isDark ? "rgba(255,255,255,0.02)" : "#f9fafb",
  };
}

// ─── Permission Pill ──────────────────────────────────────────────────────────
const PermissionPill: React.FC<{ level: PermissionLevel; compact?: boolean }> = ({ level, compact }) => {
  const t = useAdminTokens();
  const map = { none: t.pillNone, view: t.pillView, edit: t.pillEdit };
  const { bg, cl } = map[level];
  const Icon = level === 'none' ? Lock : level === 'view' ? Eye : Edit2;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color: cl }}>
      <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {level === 'none' ? 'No Access' : level === 'view' ? 'View' : 'Edit'}
    </span>
  );
};

// ─── Permission Toggle ────────────────────────────────────────────────────────
const PermissionToggle: React.FC<{ level: PermissionLevel; onChange: (l: PermissionLevel) => void; disabled?: boolean }> = ({ level, onChange, disabled }) => {
  const t = useAdminTokens();
  const levels: PermissionLevel[] = ['none', 'view', 'edit'];
  const activeMap = { none: { bg: t.isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb", cl: t.txBody }, view: { bg: t.accentColor, cl: "#fff" }, edit: { bg: "#09cf8b", cl: "#fff" } };

  return (
    <div className="flex gap-1">
      {levels.map(l => {
        const active = level === l;
        const s = activeMap[l];
        return (
          <button key={l} type="button" onClick={() => !disabled && onChange(l)} disabled={disabled}
            className="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150"
            style={{
              background: active ? s.bg : t.inputBg,
              color: active ? s.cl : t.txMuted,
              border: `1px solid ${active ? "transparent" : t.inputBorder}`,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}>
            {l === 'none' ? '—' : l === 'view' ? 'View' : 'Edit'}
          </button>
        );
      })}
    </div>
  );
};

// ─── Password Modal ───────────────────────────────────────────────────────────
const PasswordModal: React.FC<{ email: string; username: string; password: string; onClose: () => void }> = ({ email, username, password, onClose }) => {
  const t = useAdminTokens();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="max-w-md w-full rounded-[28px] overflow-hidden shadow-2xl"
        style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}` }}>
        <div className="px-6 py-5 rounded-t-[28px]" style={{ background: t.ctaGradient }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Admin Account Created!</h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>Save these credentials now</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl p-4 flex gap-3" style={{ background: t.amberBg, border: `1px solid ${t.amberBd}` }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: t.amberCl }} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: t.amberCl }}>Important — Save This Password!</p>
              <p className="text-xs" style={{ color: t.amberCl, opacity: 0.8 }}>This password will be visible in the admin card until they change it on first login.</p>
            </div>
          </div>

          {[{ label: "Email", value: email }, { label: "Username", value: username }].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: t.txMuted }}>{label}</label>
              <div className="px-4 py-2.5 rounded-xl" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}>
                <p className="text-sm font-medium" style={{ color: t.txPrimary }}>{value}</p>
              </div>
            </div>
          ))}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: t.txMuted }}>Temporary Password</label>
            <div className="relative">
              <div className="px-4 py-2.5 pr-12 rounded-xl" style={{ background: t.inputBg, border: `2px solid ${t.accentColor}` }}>
                <p className="text-sm font-mono font-bold break-all" style={{ color: t.accentColor }}>{password}</p>
              </div>
              <button onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                style={{ background: t.cardBg, border: `1px solid ${t.inputBorder}` }}>
                {copied ? <CheckCircle className="w-4 h-4" style={{ color: "#09cf8b" }} /> : <Copy className="w-4 h-4" style={{ color: t.accentColor }} />}
              </button>
            </div>
            {copied && <p className="text-xs font-medium mt-1.5 flex items-center gap-1" style={{ color: "#09cf8b" }}><Check className="w-3 h-3" /> Copied!</p>}
          </div>

          <div className="rounded-xl p-3" style={{ background: t.infoBg, border: `1px solid ${t.infoBd}` }}>
            <p className="text-xs" style={{ color: t.infoCl }}>
              <strong>Next steps:</strong> The admin can log in with these credentials. You can view this password anytime by clicking on their admin card until they change it.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6" style={{ borderTop: `1px solid ${t.divider}` }}>
          <button onClick={onClose}
            className="w-full h-11 mt-4 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: t.ctaGradient }}>
            Got It!
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Admin Modal ──────────────────────────────────────────────────────────────
const AdminModal: React.FC<{ admin: AdminRole | null; isCreating: boolean; onSave: (d: any) => Promise<void>; onCancel: () => void }> = ({ admin, isCreating, onSave, onCancel }) => {
  const t = useAdminTokens();
  const [email, setEmail]         = useState(admin?.email || '');
  const [username, setUsername]   = useState(admin?.username || '');
  const [roleName, setRoleName]   = useState(admin?.role_name || '');
  const [permissions, setPermissions] = useState<SectionPermissions>(admin?.permissions || emptyPermissions());
  const [errors, setErrors]       = useState<string[]>([]);
  const [saving, setSaving]       = useState(false);

  const validate = () => {
    const e: string[] = [];
    if (!email.trim()) e.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.push('Invalid email format');
    if (isCreating && !username.trim()) e.push('Username is required');
    if (!roleName.trim()) e.push('Role name is required');
    const c = countPermissions(permissions);
    if (c.view === 0 && c.edit === 0) e.push('Grant at least one section permission');
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]); setSaving(true);
    try {
      const payload = isCreating
        ? { email: email.trim(), username: username.trim(), role_name: roleName.trim(), permissions }
        : { role_name: roleName.trim(), permissions };
      await onSave(payload);
    } catch (e: any) { setErrors([e.message || 'Failed to save']); }
    finally { setSaving(false); }
  };

  const inputStyle = { background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputCl };
  const focusBorder = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = t.inputFocus);
  const blurBorder  = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = t.inputBorder);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="max-w-2xl w-full max-h-[92vh] overflow-y-auto rounded-[28px] shadow-2xl"
        style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}` }}>

        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between rounded-t-[28px]"
          style={{ background: t.modalBg, borderBottom: `1px solid ${t.divider}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.ctaGradient }}>
              {isCreating ? <UserPlus className="w-5 h-5 text-white" /> : <Edit2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: t.txPrimary }}>
                {isCreating ? 'Create New Admin' : 'Edit Admin Role'}
              </h2>
              <p className="text-xs" style={{ color: t.txMuted }}>
                {isCreating ? 'A new admin account will be created with a temporary password' : 'Update permissions below'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg transition-colors"
            style={{ color: t.txMuted }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = t.inputBg)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errors.length > 0 && (
            <div className="rounded-xl p-4 flex gap-3" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f43f5e" }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: t.errCl }}>Please fix the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((e, i) => <li key={i} className="text-sm" style={{ color: t.errCl }}>{e}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[{ id:"email", label:"Email *", type:"email", val:email, set:setEmail, ph:"admin@example.com" },
              { id:"username", label:`Username${isCreating?" *":""}`, type:"text", val:username, set:setUsername, ph:"sarah_mod" }
            ].map(({ id, label, type, val, set, ph }) => (
              <div key={id}>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: t.txMuted }}>{label}</label>
                <input type={type} value={val} onChange={e => set(e.target.value)}
                  disabled={!isCreating} placeholder={ph}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                  style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: t.txMuted }}>Role Name *</label>
            <input type="text" value={roleName} onChange={e => setRoleName(e.target.value)}
              placeholder="e.g. Content Moderator"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          {/* Section Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider" style={{ color: t.txMuted }}>Section Permissions</label>
              <div className="flex gap-1.5">
                {(['none','view','edit'] as const).map(p => (
                  <button key={p} type="button" onClick={() => setPermissions(p==='none'?emptyPermissions():p==='view'?allViewPermissions():allEditPermissions())}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors"
                    style={{ background: t.inputBg, color: t.txMuted, border: `1px solid ${t.inputBorder}` }}>
                    {p === 'none' ? 'Clear All' : p === 'view' ? 'All View' : 'All Edit'}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${t.cardBorder}` }}>
              {SECTIONS.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={section.id}
                    className="flex items-center justify-between px-4 py-3 transition-colors"
                    style={{ borderBottom: idx !== SECTIONS.length - 1 ? `1px solid ${t.divider}` : "none" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = t.rowHoverBg)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${section.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${section.color}`} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: t.txPrimary }}>{section.label}</span>
                    </div>
                    <PermissionToggle level={permissions[section.id]}
                      onChange={level => setPermissions(prev => ({ ...prev, [section.id]: level }))} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {(() => {
            const c = countPermissions(permissions);
            return (
              <div className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}>
                <span className="text-xs font-semibold" style={{ color: t.txMuted }}>Permission Summary</span>
                <div className="flex gap-2 items-center">
                  {c.edit > 0 && <PermissionPill level="edit" compact />}
                  {c.view > 0 && <PermissionPill level="view" compact />}
                  <span className="text-xs" style={{ color: t.txMuted }}>
                    {c.edit} edit · {c.view} view · {c.none} locked
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="px-6 pb-6 flex gap-3" style={{ borderTop: `1px solid ${t.divider}` }}>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 mt-4 flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: t.ctaGradient }}>
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> :
              isCreating ? <><UserPlus className="w-4 h-4" /> Create Admin</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
          <button onClick={onCancel} disabled={saving}
            className="px-5 mt-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ border: `1px solid ${t.inputBorder}`, color: t.txBody }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Admin Card ───────────────────────────────────────────────────────────────
const AdminCard: React.FC<{ admin: AdminRole; onEdit: () => void; onDelete: () => void; onToggleActive: () => void }> = ({ admin, onEdit, onDelete, onToggleActive }) => {
  const t = useAdminTokens();
  const [expanded, setExpanded]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied]       = useState(false);
  const perms = countPermissions(admin.permissions);
  const hasPassword = admin.initial_password && !admin.password_changed && !admin.last_login;

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';

  const copyPassword = () => {
    if (admin.initial_password) {
      navigator.clipboard.writeText(admin.initial_password);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const iconBtnStyle = (color: string, hoverBg: string) => ({
    base: { color, border: "1px solid transparent" } as React.CSSProperties,
    hover: { background: hoverBg } as React.CSSProperties,
  });

  return (
    <motion.div layout
      className="rounded-[20px] overflow-hidden transition-all duration-200"
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, opacity: admin.is_active ? 1 : 0.6 }}
      whileHover={{ boxShadow: t.isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)" }}>

      <div className="flex items-center gap-4 px-5 py-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm"
            style={{ background: admin.is_super_admin ? t.superGrad : t.modGrad }}>
            {admin.username.charAt(0).toUpperCase()}
          </div>
          {!admin.is_active && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#f43f5e" }}>
              <X className="w-3 h-3 text-white" />
            </div>
          )}
          {hasPassword && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2" title="Password available"
              style={{ background: "#f59e0b", borderColor: t.cardBg }}>
              <Key className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black" style={{ color: t.txPrimary }}>{admin.username}</span>
            {admin.is_super_admin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black"
                style={{ background: t.amberBg, color: t.amberCl }}>
                <Shield className="w-3 h-3" /> Super Admin
              </span>
            )}
            {!admin.is_active && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: t.errBg, color: t.errCl }}>Deactivated</span>
            )}
            {hasPassword && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: t.amberBg, color: t.amberCl }}>
                <Key className="w-3 h-3" /> Password Available
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: t.txMuted }}>
            {admin.email} · <span className="italic">{admin.role_name}</span>
          </p>
        </div>

        {/* Permission counters */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {perms.edit > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: t.pillEdit.bg, color: t.pillEdit.cl }}>
              <Edit2 className="w-3 h-3" />{perms.edit}
            </span>
          )}
          {perms.view > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: t.pillView.bg, color: t.pillView.cl }}>
              <Eye className="w-3 h-3" />{perms.view}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExpanded(s => !s)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: t.txMuted }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = t.inputBg)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {!admin.is_super_admin && (
            <>
              {[
                { icon: Edit2, cl: t.accentColor, hov: t.inputBg, fn: onEdit, title: "Edit" },
                { icon: admin.is_active ? EyeOff : Eye, cl: "#f59e0b", hov: t.amberBg, fn: onToggleActive, title: admin.is_active ? "Deactivate" : "Activate" },
                { icon: Trash2, cl: "#f43f5e", hov: t.errBg, fn: onDelete, title: "Remove" },
              ].map(({ icon: Icon, cl, hov, fn, title }) => (
                <button key={title} onClick={fn} title={title}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: cl }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = hov)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden" style={{ borderTop: `1px solid ${t.divider}` }}>
            <div className="px-5 py-4" style={{ background: t.isDark ? "rgba(255,255,255,0.02)" : "#fafafa" }}>

              {/* Password block */}
              {hasPassword && (
                <div className="mb-4 rounded-xl p-4" style={{ background: t.amberBg, border: `2px solid ${t.amberBd}` }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }}>
                      <Key className="w-4 h-4" style={{ color: t.amberCl }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black mb-1" style={{ color: t.amberCl }}>Temporary Password</h4>
                      <p className="text-xs" style={{ color: t.amberCl, opacity: 0.8 }}>Hidden once the admin logs in and changes it.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-black uppercase tracking-wider" style={{ color: t.amberCl }}>Password</label>
                      <button onClick={() => setShowPassword(!showPassword)}
                        className="text-xs font-medium flex items-center gap-1" style={{ color: t.amberCl }}>
                        {showPassword ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="px-3 py-2 pr-10 rounded-xl" style={{ background: t.cardBg, border: `2px solid ${t.amberBd}` }}>
                        <p className="text-sm font-mono font-black" style={{ color: t.amberCl }}>
                          {showPassword ? admin.initial_password : '••••••••••••'}
                        </p>
                      </div>
                      <button onClick={copyPassword}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors"
                        style={{ background: t.isDark ? "rgba(245,158,11,0.15)" : "#fef3c7" }}>
                        {copied ? <CheckCircle className="w-4 h-4" style={{ color: "#09cf8b" }} /> : <Copy className="w-4 h-4" style={{ color: t.amberCl }} />}
                      </button>
                    </div>
                    {copied && <p className="text-xs font-medium flex items-center gap-1" style={{ color: "#09cf8b" }}><Check className="w-3 h-3" /> Copied!</p>}
                  </div>
                </div>
              )}

              {/* Permissions grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {SECTIONS.map(section => {
                  const Icon = section.icon;
                  const level = admin.permissions[section.id];
                  return (
                    <div key={section.id} className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
                      <div className={`w-7 h-7 rounded-md ${section.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${section.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: t.txPrimary }}>{section.label}</p>
                        <PermissionPill level={level} compact />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ borderTop: `1px solid ${t.divider}`, color: t.txMuted }}>
                <span>Created: {fmtDate(admin.created_at)}</span>
                <span>Last login: {fmtDate(admin.last_login)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminRoleManagement: React.FC = () => {
  const { showSuccess, showError, confirm } = useNotification();
  const t = useAdminTokens();

  const [admins, setAdmins]           = useState<AdminRole[]>([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRole | null>(null);
  const [isCreating, setIsCreating]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [error, setError]             = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newAdminCredentials, setNewAdminCredentials] = useState<{ email: string; username: string; password: string } | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(res.status === 401 ? 'Unauthorized. Please log in again.' : `Failed to fetch admins: ${res.statusText}`);
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin roles');
      showError('Failed to load admin roles', err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const filtered = admins.filter(a =>
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => { setIsCreating(true); setEditingAdmin(null); setModalOpen(true); };
  const openEdit   = (a: AdminRole) => { setIsCreating(false); setEditingAdmin(a); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingAdmin(null); setIsCreating(false); };

  const handleSave = async (data: any) => {
    if (isCreating) {
      const res = await fetch(API_BASE_URL, { method:'POST', headers: { ...getAuthHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) {
        const e = await res.json();
        const msgs: string[] = [];
        ['email','username','permissions','role_name'].forEach(k => { if (e[k]) msgs.push(`${k}: ${Array.isArray(e[k]) ? e[k][0] : e[k]}`); });
        throw new Error(msgs.length ? msgs.join('. ') : e.detail || JSON.stringify(e));
      }
      const newAdmin = await res.json();
      const password = newAdmin.initial_password || newAdmin.password || newAdmin.temp_password || null;
      setAdmins(prev => [...prev, newAdmin]);
      closeModal();
      if (password) { setNewAdminCredentials({ email: data.email, username: data.username, password }); setShowPasswordModal(true); }
      else showSuccess('Admin account created!', `Account created for ${data.email}.`);
    } else {
      const res = await fetch(`${API_BASE_URL}${editingAdmin!.id}/`, { method:'PATCH', headers: { ...getAuthHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Failed to update admin'); }
      const updated = await res.json();
      setAdmins(prev => prev.map(a => a.id === updated.id ? updated : a));
      showSuccess('Admin role updated successfully');
      closeModal();
    }
  };

  const handleDelete = (admin: AdminRole) => {
    confirm({ title:`Remove ${admin.username}?`, message:`This will permanently delete their admin account and revoke all access.`, type:'danger', confirmText:'Yes, Remove', cancelText:'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}${admin.id}/`, { method:'DELETE', headers: getAuthHeaders() });
          if (res.status !== 204 && !res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || e.detail || 'Failed to delete admin'); }
          setAdmins(prev => prev.filter(a => a.id !== admin.id));
          showSuccess(`${admin.username} removed successfully`);
        } catch (err: any) { showError('Failed to delete admin', err.message); }
      }
    });
  };

  const handleToggleActive = (admin: AdminRole) => {
    const action = admin.is_active ? 'deactivate' : 'activate';
    confirm({ title:`${action.charAt(0).toUpperCase()+action.slice(1)} ${admin.username}?`,
      message: admin.is_active ? `${admin.username} will immediately lose access.` : `${admin.username} will regain access.`,
      type: admin.is_active ? 'warning' : 'info', confirmText: action.charAt(0).toUpperCase()+action.slice(1), cancelText:'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}${admin.id}/toggle_active/`, { method:'POST', headers: getAuthHeaders() });
          if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error || e.detail || 'Failed to toggle'); }
          const data = await res.json();
          setAdmins(prev => prev.map(a => a.id === data.admin_role.id ? data.admin_role : a));
          showSuccess(`Admin ${action}d successfully`);
        } catch (err: any) { showError(`Failed to ${action} admin`, err.message); }
      }
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
        <Loader className="w-6 h-6 text-white animate-spin" />
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-xl p-6 flex gap-3" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
      <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#f43f5e" }} />
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: t.errCl }}>Error loading admin roles</p>
        <p className="text-sm mb-3" style={{ color: t.errCl, opacity: 0.8 }}>{error}</p>
        <button onClick={fetchAdmins} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "#f43f5e" }}>Retry</button>
      </div>
    </div>
  );

  const totalAdmins  = admins.length;
  const activeAdmins = admins.filter(a => a.is_active).length;
  const inactiveAdmins = admins.filter(a => !a.is_active).length;

  return (
    <div className="space-y-6 transition-colors duration-300">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3 flex-wrap">
          {[
            { label:"Total Admins", value:totalAdmins,    bg:t.inputBg,   cl:t.accentColor },
            { label:"Active",       value:activeAdmins,   bg:t.successBg, cl:t.successCl   },
            { label:"Inactive",     value:inactiveAdmins, bg:t.inputBg,   cl:t.txMuted      },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-2.5 flex items-center gap-2.5"
              style={{ background: s.bg, border: `1px solid ${t.inputBorder}` }}>
              <span className="text-xl font-black" style={{ color: s.cl }}>{s.value}</span>
              <span className="text-xs font-semibold" style={{ color: t.txMuted }}>{s.label}</span>
            </div>
          ))}
        </div>
        <motion.button onClick={openCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white hover:opacity-90"
          style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
          <UserPlus className="w-4 h-4" /> Create Admin
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: t.txMuted }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input type="text" placeholder="Search by username, email, or role…" value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputCl }}
          onFocus={e => (e.currentTarget.style.borderColor = t.inputFocus)}
          onBlur={e => (e.currentTarget.style.borderColor = t.inputBorder)} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: t.txMuted }}>
        <span className="font-black uppercase tracking-wider">Legend:</span>
        {(['none','view','edit'] as PermissionLevel[]).map(l => <PermissionPill key={l} level={l} compact />)}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[20px] py-14 text-center" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: t.isDark ? "#4a3520" : "#e5e7eb" }} />
            <p className="text-sm" style={{ color: t.txMuted }}>
              {searchTerm ? 'No admins match your search' : 'No admin roles found'}
            </p>
          </div>
        ) : (
          filtered.map(admin => (
            <AdminCard key={admin.id} admin={admin}
              onEdit={() => openEdit(admin)}
              onDelete={() => handleDelete(admin)}
              onToggleActive={() => handleToggleActive(admin)} />
          ))
        )}
      </div>

      <AnimatePresence>
        {modalOpen && <AdminModal admin={editingAdmin} isCreating={isCreating} onSave={handleSave} onCancel={closeModal} />}
        {showPasswordModal && newAdminCredentials && (
          <PasswordModal {...newAdminCredentials} onClose={() => { setShowPasswordModal(false); setNewAdminCredentials(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRoleManagement;