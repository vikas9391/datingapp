import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, Loader, AlertCircle,
  Link as LinkIcon, ExternalLink, ChevronDown, ChevronUp,
  GripVertical, Eye, EyeOff, Settings, BarChart3, ChevronRight
} from 'lucide-react';
import { adminService } from '../../services/profileService';
import { useNotification } from './Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE_URL = `${API_BASE}/api/admin/footer`;
const getAuthHeaders = () => adminService.getAdminHeaders();

// ─── App Routes ───────────────────────────────────────────────────────────────
// Add / remove routes here to match your app's React Router config
const APP_ROUTES: { group: string; routes: { label: string; path: string }[] }[] = [
  {
    group: 'Main',
    routes: [
      { label: 'Home',           path: '/home' },
      { label: 'Login / Sign Up',path: '/login' },
    ],
  },
  {
    group: 'Profile',
    routes: [
      { label: 'My Profile',     path: '/profile' },
      { label: 'Edit Profile',   path: '/profile/edit' },
      { label: 'Settings',       path: '/settings' },
    ],
  },
  {
    group: 'Discover',
    routes: [
      { label: 'Matches',        path: '/matches' },
      { label: 'Chats',          path: '/chats' },
      { label: 'Nearby',         path: '/nearby' },
    ],
  },
  {
    group: 'Premium',
    routes: [
      { label: 'Upgrade to Premium', path: '/premium' },
      { label: 'Pricing',            path: '/pricing' },
    ],
  },
  {
    group: 'Legal & Support',
    routes: [
      { label: 'About Us',       path: '/about' },
      { label: 'Contact Us',     path: '/contact' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy',  path: '/cookies' },
      { label: 'Help / FAQ',     path: '/help' },
      { label: 'Safety Tips',    path: '/safety' },
      { label: 'Community Guidelines', path: '/guidelines' },
    ],
  },
  {
    group: 'Account',
    routes: [
      { label: 'Notifications',  path: '/notifications' },
      { label: 'Delete Account', path: '/account/delete' },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FooterLink {
  id: number; title: string; url: string;
  link_type: 'internal' | 'external'; open_new_tab: boolean;
  display_order: number; active: boolean;
}
interface FooterSection {
  id: number; title: string; display_order: number;
  active: boolean; links: FooterLink[]; link_count: number;
}
interface FooterSettings {
  id: number; copyright_text: string; tagline: string;
  show_copyright: boolean; show_tagline: boolean;
}

// ─── Shared token hook ────────────────────────────────────────────────────────
function useTokens() {
  const { isDark } = useTheme() as any;
  return {
    isDark,
    accentColor : isDark ? "#f97316" : "#1d4ed8",
    txPrimary   : isDark ? "#f0e8de" : "#111827",
    txBody      : isDark ? "#c4a882" : "#4b5563",
    txMuted     : isDark ? "#8a6540" : "#9ca3af",
    cardBg      : isDark ? "#1c1c1c" : "#ffffff",
    cardBorder  : isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5",
    cardShadow  : isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 12px rgba(0,0,0,0.04)",
    innerBg     : isDark ? "rgba(255,255,255,0.02)" : "#f9fafb",
    divider     : isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9",
    inputBg     : isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
    inputBorder : isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb",
    inputFocus  : isDark ? "#f97316" : "#1d4ed8",
    inputCl     : isDark ? "#f0e8de" : "#111827",
    selectBg    : isDark ? "#1c1c1c" : "#ffffff",   // solid for native <select>
    ctaGradient : isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    ctaShadow   : isDark ? "0 6px 16px rgba(249,115,22,0.3)" : "0 6px 16px rgba(29,78,216,0.25)",
    errBg       : isDark ? "rgba(244,63,94,0.08)"  : "#fff1f2",
    errBd       : isDark ? "rgba(244,63,94,0.2)"   : "#fecdd3",
    errCl       : isDark ? "#fca5a5" : "#be123c",
    rowHoverBg  : isDark ? "rgba(249,115,22,0.03)" : "#fafafa",
    inactiveBg  : isDark ? "rgba(244,63,94,0.08)"  : "#fff1f2",
    inactiveCl  : isDark ? "#fca5a5"               : "#be123c",
    pillBg      : isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
    pillCl      : isDark ? "#8a6540"               : "#6b7280",
    amberBg     : isDark ? "rgba(245,158,11,0.08)" : "#fffbeb",
    amberCl     : isDark ? "#fbbf24"               : "#92400e",
    greenBg     : isDark ? "rgba(9,207,139,0.08)"  : "#f0fdf4",
    greenCl     : isDark ? "#09cf8b"               : "#166534",
    blueBg      : isDark ? "rgba(59,130,246,0.08)" : "#eff6ff",
    blueCl      : isDark ? "#93c5fd"               : "#1e40af",
    routeGroupBg: isDark ? "rgba(249,115,22,0.06)" : "#f8faff",
    routeGroupBd: isDark ? "rgba(249,115,22,0.14)" : "#e0e7ff",
    routeGroupCl: isDark ? "#fb923c"               : "#1d4ed8",
    routeItemBg : isDark ? "rgba(255,255,255,0.03)": "#ffffff",
    routeItemBd : isDark ? "rgba(249,115,22,0.1)"  : "#e5e7eb",
    routeItemHov: isDark ? "rgba(249,115,22,0.08)" : "#eff6ff",
    routeActiveBg:isDark ? "rgba(249,115,22,0.15)" : "rgba(29,78,216,0.08)",
    routeActiveBd:isDark ? "#f97316"               : "#1d4ed8",
    routeActiveCl:isDark ? "#fb923c"               : "#1d4ed8",
  };
}

// ─── Reusable Modal Shell ─────────────────────────────────────────────────────
const ModalShell: React.FC<{
  title: string; onCancel: () => void; disabled?: boolean;
  children: React.ReactNode; footer: React.ReactNode; wide?: boolean;
}> = ({ title, onCancel, disabled, children, footer, wide }) => {
  const t = useTokens();
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={`${wide ? 'max-w-xl' : 'max-w-md'} w-full rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
      >
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${t.divider}` }}>
          <h3 className="text-base font-black" style={{ color: t.txPrimary }}>{title}</h3>
          <button onClick={onCancel} disabled={disabled}
            className="p-1.5 rounded-xl transition-colors disabled:opacity-50"
            style={{ color: t.txMuted }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = t.inputBg)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto flex-1">{children}</div>
        <div className="px-6 pb-6 flex gap-3 flex-shrink-0" style={{ borderTop: `1px solid ${t.divider}` }}>
          {footer}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Themed Input ─────────────────────────────────────────────────────────────
const ThemedInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }> = ({ label, required, ...props }) => {
  const t = useTokens();
  return (
    <div>
      {label && (
        <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input {...props}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputCl, ...props.style as any }}
        onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = t.inputFocus; props.onFocus?.(e); }}
        onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = t.inputBorder; props.onBlur?.(e); }} />
    </div>
  );
};

// ─── Themed Checkbox ──────────────────────────────────────────────────────────
const ThemedCheckbox: React.FC<{ id: string; checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }> = ({ id, checked, onChange, label, disabled }) => {
  const t = useTokens();
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <div className="relative flex-shrink-0">
        <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)}
          disabled={disabled} className="sr-only" />
        <div className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
          style={checked
            ? { background: t.accentColor, borderColor: t.accentColor }
            : { background: "transparent", borderColor: t.inputBorder }}>
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm" style={{ color: t.txBody }}>{label}</span>
    </label>
  );
};

// ─── Save / Cancel footer buttons ─────────────────────────────────────────────
const ModalFooter: React.FC<{ saving: boolean; onSave: () => void; onCancel: () => void; label: string }> = ({ saving, onSave, onCancel, label }) => {
  const t = useTokens();
  return (
    <>
      <button onClick={onSave} disabled={saving}
        className="flex-1 mt-4 flex items-center justify-center gap-2 h-10 rounded-xl font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
        style={{ background: t.ctaGradient }}>
        {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {label}</>}
      </button>
      <button onClick={onCancel} disabled={saving}
        className="px-5 mt-4 rounded-xl text-sm font-semibold transition disabled:opacity-50"
        style={{ border: `1px solid ${t.inputBorder}`, color: t.txBody }}>
        Cancel
      </button>
    </>
  );
};

// ─── Internal Route Picker ────────────────────────────────────────────────────
const RoutePicker: React.FC<{
  value: string;
  onChange: (path: string, label: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const t = useTokens();
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(APP_ROUTES[0].group);

  // find the label of the currently selected route
  const selectedLabel = APP_ROUTES
    .flatMap(g => g.routes)
    .find(r => r.path === value)?.label ?? '';

  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>
        Page <span className="text-red-500">*</span>
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left disabled:opacity-50"
        style={{
          background: t.inputBg,
          border: `1px solid ${open ? t.inputFocus : t.inputBorder}`,
          color: value ? t.inputCl : t.txMuted,
        }}
      >
        <span className="flex items-center gap-2 truncate">
          <LinkIcon className="w-4 h-4 flex-shrink-0" style={{ color: t.accentColor }} />
          {value ? (
            <span>
              <span className="font-semibold" style={{ color: t.txPrimary }}>{selectedLabel}</span>
              <span className="ml-2 text-xs" style={{ color: t.txMuted }}>{value}</span>
            </span>
          ) : (
            <span style={{ color: t.txMuted }}>Select a page…</span>
          )}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: t.txMuted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              boxShadow: t.isDark ? '0 12px 32px rgba(0,0,0,0.6)' : '0 12px 32px rgba(0,0,0,0.12)',
              transformOrigin: 'top',
            }}
            className="mt-1.5 rounded-2xl overflow-hidden z-10 relative"
          >
            <div className="max-h-64 overflow-y-auto py-2">
              {APP_ROUTES.map(group => (
                <div key={group.group}>
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(g => g === group.group ? null : group.group)}
                    className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors"
                    style={{ background: expandedGroup === group.group ? t.routeGroupBg : 'transparent' }}
                    onMouseEnter={e => { if (expandedGroup !== group.group) (e.currentTarget as HTMLElement).style.background = t.rowHoverBg; }}
                    onMouseLeave={e => { if (expandedGroup !== group.group) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: t.routeGroupCl }}>
                      {group.group}
                    </span>
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-transform"
                      style={{ color: t.txMuted, transform: expandedGroup === group.group ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {/* Routes in group */}
                  <AnimatePresence>
                    {expandedGroup === group.group && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 pb-1.5 space-y-0.5">
                          {group.routes.map(route => {
                            const isActive = value === route.path;
                            return (
                              <button
                                key={route.path}
                                type="button"
                                onClick={() => { onChange(route.path, route.label); setOpen(false); }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left transition-all"
                                style={{
                                  background: isActive ? t.routeActiveBg : 'transparent',
                                  border: `1px solid ${isActive ? t.routeActiveBd : 'transparent'}`,
                                  color: isActive ? t.routeActiveCl : t.txBody,
                                }}
                                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = t.routeItemHov; }}
                                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                              >
                                <span className="font-medium">{route.label}</span>
                                <span className="text-xs font-mono" style={{ color: isActive ? t.routeActiveCl : t.txMuted }}>
                                  {route.path}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Custom path option */}
              <div style={{ borderTop: `1px solid ${t.divider}` }} className="pt-1.5 px-2 pb-1.5">
                <p className="text-xs px-2 pb-1 font-semibold" style={{ color: t.txMuted }}>Custom path</p>
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="text"
                    placeholder="/custom-page"
                    defaultValue={value && !APP_ROUTES.flatMap(g => g.routes).find(r => r.path === value) ? value : ''}
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: t.inputBg,
                      border: `1px solid ${t.inputBorder}`,
                      color: t.inputCl,
                      colorScheme: t.isDark ? 'dark' : 'light',
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget as HTMLInputElement).value.trim();
                        if (val) { onChange(val, val); setOpen(false); }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
                    style={{ background: t.ctaGradient }}
                    onClick={e => {
                      const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
                      const val = input.value.trim();
                      if (val) { onChange(val, val); setOpen(false); }
                    }}
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Section Modal ────────────────────────────────────────────────────────────
const SectionModal: React.FC<{ section: FooterSection | null; onSave: (d: any) => Promise<void>; onCancel: () => void }> = ({ section, onSave, onCancel }) => {
  const t = useTokens();
  const { showWarning } = useNotification();
  const [title, setTitle]   = useState(section?.title || '');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    if (!title.trim()) { setError('Section title is required'); showWarning('Validation Failed', 'Section title is required'); return; }
    setSaving(true); setError('');
    try { await onSave({ title: title.trim() }); }
    catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title={section ? 'Edit Section' : 'New Section'} onCancel={onCancel} disabled={saving}
      footer={<ModalFooter saving={saving} onSave={handleSave} onCancel={onCancel} label="Save Section" />}>
      {error && (
        <div className="rounded-xl p-3 flex gap-2" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#f43f5e" }} />
          <p className="text-sm" style={{ color: t.errCl }}>{error}</p>
        </div>
      )}
      <ThemedInput label="Section Title" required value={title} onChange={e => setTitle(e.target.value)}
        disabled={saving} placeholder="e.g., Company, Support, Legal" />
    </ModalShell>
  );
};

// ─── Link Modal ───────────────────────────────────────────────────────────────
const LinkModal: React.FC<{
  link: FooterLink | null; sectionId: number;
  onSave: (d: any) => Promise<void>; onCancel: () => void;
}> = ({ link, sectionId, onSave, onCancel }) => {
  const t = useTokens();
  const { showWarning } = useNotification();
  const [title, setTitle]           = useState(link?.title || '');
  const [url, setUrl]               = useState(link?.url || '');
  const [linkType, setLinkType]     = useState<'internal' | 'external'>(link?.link_type || 'internal');
  const [openNewTab, setOpenNewTab] = useState(link?.open_new_tab || false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  // When switching to external, if url looks like an internal path clear it
  const handleLinkTypeChange = (type: 'internal' | 'external') => {
    setLinkType(type);
    if (type === 'external' && url.startsWith('/')) setUrl('');
    if (type === 'internal' && (url.startsWith('http://') || url.startsWith('https://'))) setUrl('');
  };

  // When a route is picked, also pre-fill the title if it's empty
  const handleRoutePick = (path: string, label: string) => {
    setUrl(path);
    if (!title.trim()) setTitle(label);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Link title is required'); showWarning('Validation Failed', 'Link title is required'); return; }
    if (!url.trim())   { setError('URL / page is required'); showWarning('Validation Failed', 'Please select a page or enter a URL'); return; }
    setSaving(true); setError('');
    try {
      await onSave({
        section: sectionId, title: title.trim(), url: url.trim(),
        link_type: linkType, open_new_tab: openNewTab,
      });
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell
      title={link ? 'Edit Link' : 'New Link'}
      onCancel={onCancel} disabled={saving} wide
      footer={<ModalFooter saving={saving} onSave={handleSave} onCancel={onCancel} label="Save Link" />}
    >
      {error && (
        <div className="rounded-xl p-3 flex gap-2" style={{ background: t.errBg, border: `1px solid ${t.errBd}` }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#f43f5e" }} />
          <p className="text-sm" style={{ color: t.errCl }}>{error}</p>
        </div>
      )}

      {/* Link type toggle */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: t.txMuted }}>Link Type</label>
        <div className="flex gap-3">
          {(['internal', 'external'] as const).map(type => {
            const active = linkType === type;
            const Icon   = type === 'internal' ? LinkIcon : ExternalLink;
            return (
              <button key={type} type="button" onClick={() => handleLinkTypeChange(type)} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 active:scale-95"
                style={{
                  background: active ? (t.isDark ? "rgba(249,115,22,0.12)" : "rgba(29,78,216,0.08)") : t.inputBg,
                  border: `2px solid ${active ? t.accentColor : t.inputBorder}`,
                  color: active ? t.accentColor : t.txMuted,
                }}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold capitalize">{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Link title */}
      <ThemedInput
        label="Link Title" required
        value={title} onChange={e => setTitle(e.target.value)}
        disabled={saving} placeholder="e.g., Privacy Policy, Contact Us"
      />

      {/* URL / page picker */}
      {linkType === 'internal' ? (
        <RoutePicker value={url} onChange={handleRoutePick} disabled={saving} />
      ) : (
        <ThemedInput
          label="URL" required
          value={url} onChange={e => setUrl(e.target.value)}
          disabled={saving} placeholder="https://example.com/page"
          type="url"
        />
      )}

      {/* Open in new tab — only for external */}
      {linkType === 'external' && (
        <ThemedCheckbox id="openNewTab" checked={openNewTab} onChange={setOpenNewTab}
          label="Open in new tab" disabled={saving} />
      )}

      {/* Live preview */}
      {url && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: t.routeGroupBg, border: `1px solid ${t.routeGroupBd}` }}>
          {linkType === 'internal'
            ? <LinkIcon className="w-4 h-4 flex-shrink-0" style={{ color: t.accentColor }} />
            : <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: t.accentColor }} />}
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: t.txPrimary }}>{title || 'Untitled link'}</p>
            <p className="text-xs font-mono truncate" style={{ color: t.txMuted }}>{url}</p>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

// ─── Settings Modal ───────────────────────────────────────────────────────────
const SettingsModal: React.FC<{ settings: FooterSettings; onSave: (d: any) => Promise<void>; onCancel: () => void }> = ({ settings, onSave, onCancel }) => {
  const [copyrightText, setCopyrightText] = useState(settings.copyright_text);
  const [tagline, setTagline]             = useState(settings.tagline);
  const [showCopyright, setShowCopyright] = useState(settings.show_copyright);
  const [showTagline, setShowTagline]     = useState(settings.show_tagline);
  const [saving, setSaving]               = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave({ copyright_text: copyrightText, tagline, show_copyright: showCopyright, show_tagline: showTagline }); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell title="Footer Settings" onCancel={onCancel} disabled={saving}
      footer={<ModalFooter saving={saving} onSave={handleSave} onCancel={onCancel} label="Save Settings" />}>
      <div className="space-y-2">
        <ThemedInput label="Copyright Text" value={copyrightText}
          onChange={e => setCopyrightText(e.target.value)} disabled={saving} />
        <ThemedCheckbox id="showCopyright" checked={showCopyright} onChange={setShowCopyright}
          label="Show copyright text" disabled={saving} />
      </div>
      <div className="space-y-2">
        <ThemedInput label="Tagline" value={tagline}
          onChange={e => setTagline(e.target.value)} disabled={saving} />
        <ThemedCheckbox id="showTagline" checked={showTagline} onChange={setShowTagline}
          label="Show tagline" disabled={saving} />
      </div>
    </ModalShell>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard: React.FC<{
  section: FooterSection;
  onEdit: () => void; onDelete: () => void; onToggleActive: () => void;
  onAddLink: () => void; onEditLink: (l: FooterLink) => void;
  onDeleteLink: (l: FooterLink) => void; onToggleLinkActive: (l: FooterLink) => void;
}> = ({ section, onEdit, onDelete, onToggleActive, onAddLink, onEditLink, onDeleteLink, onToggleLinkActive }) => {
  const t = useTokens();
  const [expanded, setExpanded] = useState(false);

  // Always-visible pill button — bg is permanent, brighter on hover
  const pillBtn = (
    color: string,
    bg: string,
    hoverBg: string,
    border: string,
  ) => ({
    style: { color, background: bg, border: `1px solid ${border}` },
    onMouseEnter: (e: React.MouseEvent) => {
      (e.currentTarget as HTMLElement).style.background = hoverBg;
      (e.currentTarget as HTMLElement).style.transform  = 'scale(1.08)';
    },
    onMouseLeave: (e: React.MouseEvent) => {
      (e.currentTarget as HTMLElement).style.background = bg;
      (e.currentTarget as HTMLElement).style.transform  = 'scale(1)';
    },
  });

  // Per-action token sets
  const editPill   = pillBtn(
    t.accentColor,
    t.isDark ? 'rgba(249,115,22,0.12)' : 'rgba(29,78,216,0.08)',
    t.isDark ? 'rgba(249,115,22,0.22)' : 'rgba(29,78,216,0.16)',
    t.isDark ? 'rgba(249,115,22,0.25)' : 'rgba(29,78,216,0.2)',
  );
  const togglePill = pillBtn(
    '#f59e0b',
    t.isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
    t.isDark ? 'rgba(245,158,11,0.22)' : 'rgba(245,158,11,0.16)',
    t.isDark ? 'rgba(245,158,11,0.3)'  : 'rgba(245,158,11,0.25)',
  );
  const deletePill = pillBtn(
    '#f43f5e',
    t.isDark ? 'rgba(244,63,94,0.12)'  : 'rgba(244,63,94,0.07)',
    t.isDark ? 'rgba(244,63,94,0.22)'  : 'rgba(244,63,94,0.14)',
    t.isDark ? 'rgba(244,63,94,0.3)'   : 'rgba(244,63,94,0.2)',
  );
  const expandPill = pillBtn(
    t.txBody,
    t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    t.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)',
    t.isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)',
  );

  return (
    <motion.div layout
      className="rounded-[20px] overflow-hidden transition-all"
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: t.cardShadow, opacity: section.active ? 1 : 0.6 }}
      whileHover={{ boxShadow: t.isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.07)" }}>

      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <GripVertical className="w-5 h-5 cursor-move flex-shrink-0" style={{ color: t.txMuted }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black" style={{ color: t.txPrimary }}>{section.title}</span>
            {!section.active && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: t.inactiveBg, color: t.inactiveCl }}>Inactive</span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: t.pillBg, color: t.pillCl }}>
              {section.link_count} link{section.link_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Expand / collapse */}
          <button onClick={() => setExpanded(s => !s)}
            className="p-1.5 rounded-xl transition-all" title={expanded ? 'Collapse' : 'Expand'}
            {...expandPill}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {/* Edit section */}
          <button onClick={onEdit} className="p-1.5 rounded-xl transition-all" title="Edit Section"
            {...editPill}>
            <Edit2 className="w-4 h-4" />
          </button>
          {/* Toggle active */}
          <button onClick={onToggleActive} className="p-1.5 rounded-xl transition-all"
            title={section.active ? 'Deactivate' : 'Activate'}
            {...togglePill}>
            {section.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {/* Delete section */}
          <button onClick={onDelete} className="p-1.5 rounded-xl transition-all" title="Delete Section"
            {...deletePill}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded links */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden" style={{ borderTop: `1px solid ${t.divider}` }}>
            <div className="px-5 py-4" style={{ background: t.innerBg }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black" style={{ color: t.txPrimary }}>Links</h4>
                <motion.button onClick={onAddLink} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white hover:opacity-90"
                  style={{ background: t.ctaGradient }}>
                  <Plus className="w-3.5 h-3.5" /> Add Link
                </motion.button>
              </div>

              {section.links.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: t.txMuted }}>No links yet</p>
              ) : (
                <div className="space-y-2">
                  {section.links.map(link => (
                    <div key={link.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, opacity: link.active ? 1 : 0.6 }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = t.isDark ? "rgba(249,115,22,0.3)" : "#bfdbfe")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = t.cardBorder)}>
                      <GripVertical className="w-4 h-4 cursor-move flex-shrink-0" style={{ color: t.txMuted }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate" style={{ color: t.txPrimary }}>{link.title}</span>
                          {link.link_type === 'external'
                            ? <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: t.txMuted }} />
                            : <LinkIcon className="w-3 h-3 flex-shrink-0" style={{ color: t.txMuted }} />}
                          {!link.active && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-semibold"
                              style={{ background: t.inactiveBg, color: t.inactiveCl }}>Hidden</span>
                          )}
                        </div>
                        <p className="text-xs font-mono truncate" style={{ color: t.txMuted }}>{link.url}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => onEditLink(link)} className="p-1 rounded-lg transition-all" title="Edit Link"
                          {...editPill}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onToggleLinkActive(link)} className="p-1 rounded-lg transition-all"
                          title={link.active ? 'Hide Link' : 'Show Link'}
                          {...togglePill}>
                          {link.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => onDeleteLink(link)} className="p-1 rounded-lg transition-all" title="Delete Link"
                          {...deletePill}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FooterManagement: React.FC = () => {
  const { showSuccess, showError, confirm } = useNotification();
  const t = useTokens();

  const [sections, setSections]   = useState<FooterSection[]>([]);
  const [settings, setSettings]   = useState<FooterSettings | null>(null);
  const [loading, setLoading]     = useState(true);

  const [sectionModalOpen, setSectionModalOpen]   = useState(false);
  const [linkModalOpen, setLinkModalOpen]         = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [editingSection, setEditingSection]         = useState<FooterSection | null>(null);
  const [editingLink, setEditingLink]               = useState<FooterLink | null>(null);
  const [selectedSectionId, setSelectedSectionId]  = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sections/`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/settings/`, { headers: getAuthHeaders() }),
      ]);
      if (sectionsRes.ok && settingsRes.ok) {
        setSections(await sectionsRes.json());
        setSettings(await settingsRes.json());
      } else throw new Error('Failed to load footer data');
    } catch { showError('Load Failed', 'Failed to load footer data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSection = async (data: any) => {
    try {
      const url = editingSection ? `${API_BASE_URL}/sections/${editingSection.id}/` : `${API_BASE_URL}/sections/`;
      const res = await fetch(url, { method: editingSection ? 'PATCH' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to save section');
      await fetchData();
      setSectionModalOpen(false); setEditingSection(null);
      showSuccess(editingSection ? 'Section Updated' : 'Section Created', `${data.title} has been ${editingSection ? 'updated' : 'created successfully'}`);
    } catch { throw new Error('Failed to save section'); }
  };

  const handleDeleteSection = (section: FooterSection) => {
    confirm({
      title: 'Delete Footer Section',
      message: `Are you sure you want to delete "${section.title}"?\n\nThis will also delete all ${section.link_count} link(s).`,
      type: 'danger', confirmText: 'Delete Section', cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/sections/${section.id}/`, { method: 'DELETE', headers: getAuthHeaders() });
          if (res.ok || res.status === 204) { await fetchData(); showSuccess('Section Deleted', `${section.title} and all its links have been removed`); }
          else throw new Error();
        } catch { showError('Delete Failed', 'Failed to delete the section'); }
      },
    });
  };

  const handleToggleSectionActive = async (section: FooterSection) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sections/${section.id}/toggle_active/`, { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      await fetchData();
      showSuccess('Status Updated', `${section.title} has been ${section.active ? 'deactivated' : 'activated'}`);
    } catch { showError('Toggle Failed', 'Failed to update section status'); }
  };

  const handleSaveLink = async (data: any) => {
    try {
      const url = editingLink ? `${API_BASE_URL}/links/${editingLink.id}/` : `${API_BASE_URL}/links/`;
      const res = await fetch(url, { method: editingLink ? 'PATCH' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to save link');
      await fetchData();
      setLinkModalOpen(false); setEditingLink(null); setSelectedSectionId(null);
      showSuccess(editingLink ? 'Link Updated' : 'Link Created', `${data.title} has been ${editingLink ? 'updated' : 'added successfully'}`);
    } catch { throw new Error('Failed to save link'); }
  };

  const handleDeleteLink = (link: FooterLink) => {
    confirm({
      title: 'Delete Footer Link',
      message: `Are you sure you want to delete "${link.title}"? This cannot be undone.`,
      type: 'danger', confirmText: 'Delete Link', cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/links/${link.id}/`, { method: 'DELETE', headers: getAuthHeaders() });
          if (res.ok || res.status === 204) { await fetchData(); showSuccess('Link Deleted', `${link.title} has been removed`); }
          else throw new Error();
        } catch { showError('Delete Failed', 'Failed to delete the link'); }
      },
    });
  };

  const handleToggleLinkActive = async (link: FooterLink) => {
    try {
      const res = await fetch(`${API_BASE_URL}/links/${link.id}/toggle_active/`, { method: 'POST', headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      await fetchData();
      showSuccess('Visibility Updated', `${link.title} is now ${link.active ? 'hidden' : 'visible'}`);
    } catch { showError('Toggle Failed', 'Failed to update link visibility'); }
  };

  const handleSaveSettings = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/1/`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      await fetchData(); setSettingsModalOpen(false);
      showSuccess('Settings Updated', 'Footer settings have been saved successfully');
    } catch { throw new Error('Failed to save settings'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
          <Loader className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium" style={{ color: t.txMuted }}>Loading footer management…</p>
      </div>
    </div>
  );

  const totalLinks = sections.reduce((acc, s) => acc + s.link_count, 0);

  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: `Section${sections.length !== 1 ? 's' : ''}`, value: sections.length, bg: t.inputBg, cl: t.accentColor },
            { label: "Total Links", value: totalLinks, bg: t.blueBg, cl: t.blueCl },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-2.5 flex items-center gap-2.5"
              style={{ background: s.bg, border: `1px solid ${t.inputBorder}` }}>
              <span className="text-xl font-black" style={{ color: s.cl }}>{s.value}</span>
              <span className="text-xs font-semibold" style={{ color: t.txMuted }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <motion.button onClick={() => setSettingsModalOpen(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.txBody }}>
            <Settings className="w-4 h-4" /> Settings
          </motion.button>
          <motion.button onClick={() => { setEditingSection(null); setSectionModalOpen(true); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90"
            style={{ background: t.ctaGradient, boxShadow: t.ctaShadow }}>
            <Plus className="w-4 h-4" /> Add Section
          </motion.button>
        </div>
      </div>

      {/* Sections list */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-[20px] py-16 text-center"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <BarChart3 className="w-12 h-12 mx-auto mb-3" style={{ color: t.isDark ? "#4a3520" : "#e5e7eb" }} />
            <p className="text-sm mb-5" style={{ color: t.txMuted }}>No footer sections yet</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setEditingSection(null); setSectionModalOpen(true); }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90"
              style={{ background: t.ctaGradient }}>
              Create Your First Section
            </motion.button>
          </motion.div>
        ) : (
          sections.map(section => (
            <SectionCard key={section.id} section={section}
              onEdit={() => { setEditingSection(section); setSectionModalOpen(true); }}
              onDelete={() => handleDeleteSection(section)}
              onToggleActive={() => handleToggleSectionActive(section)}
              onAddLink={() => { setSelectedSectionId(section.id); setEditingLink(null); setLinkModalOpen(true); }}
              onEditLink={link => { setSelectedSectionId(section.id); setEditingLink(link); setLinkModalOpen(true); }}
              onDeleteLink={handleDeleteLink}
              onToggleLinkActive={handleToggleLinkActive} />
          ))
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {sectionModalOpen && (
          <SectionModal section={editingSection} onSave={handleSaveSection}
            onCancel={() => { setSectionModalOpen(false); setEditingSection(null); }} />
        )}
        {linkModalOpen && selectedSectionId && (
          <LinkModal link={editingLink} sectionId={selectedSectionId} onSave={handleSaveLink}
            onCancel={() => { setLinkModalOpen(false); setEditingLink(null); setSelectedSectionId(null); }} />
        )}
        {settingsModalOpen && settings && (
          <SettingsModal settings={settings} onSave={handleSaveSettings}
            onCancel={() => setSettingsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FooterManagement;