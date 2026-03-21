import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, X, LogOut, BarChart3, Users as UsersIcon, AlertTriangle, 
  FileText, Crown, Lightbulb, Quote, Settings, Layers, Ticket, Menu,
  Globe, ExternalLink,
} from 'lucide-react';
import { adminService } from '../services/profileService';
import { NotificationProvider, useNotification } from './adminpages/Notificationsystem';
import { useTheme } from '@/components/ThemeContext';

// Import page components
import Overview from './adminpages/Overview';
import UserManagement from './adminpages/Usermanagement';
import ReportsManagement from './adminpages/Reportsmanagement';
import AdminActionsLog from './adminpages/Adminactionslog';
import PremiumManagement from './adminpages/Premiummanagement';
import PromoCodeManagement from './adminpages/Promocodemanagement';
import ExpertTipsManagement from './adminpages/ExpertTipsManagement';
import ReviewsManagement from './adminpages/ReviewsManagement';
import AdminRoleManagement from './adminpages/Adminrolemanagement';
import FooterManagement from './adminpages/Footermanagement';

type TabId =
  | 'overview' | 'users' | 'reports' | 'analytics'
  | 'premium' | 'promo-codes' | 'expert-tips'
  | 'reviews' | 'admin-roles' | 'footer';

const tabs = [
  { id: 'overview'    as const, label: 'Overview',  icon: BarChart3,      color: 'text-blue-500'   },
  { id: 'users'       as const, label: 'Users',      icon: UsersIcon,      color: 'text-teal-500'   },
  { id: 'reports'     as const, label: 'Reports',    icon: AlertTriangle,  color: 'text-orange-500' },
  { id: 'analytics'   as const, label: 'Actions',    icon: FileText,       color: 'text-indigo-500' },
  { id: 'premium'     as const, label: 'Premium',    icon: Crown,          color: 'text-purple-500' },
  { id: 'promo-codes' as const, label: 'Promos',     icon: Ticket,         color: 'text-pink-500'   },
  { id: 'expert-tips' as const, label: 'Tips',       icon: Lightbulb,      color: 'text-amber-500'  },
  { id: 'reviews'     as const, label: 'Reviews',    icon: Quote,          color: 'text-rose-500'   },
  { id: 'admin-roles' as const, label: 'Roles',      icon: Settings,       color: 'text-gray-500'   },
  { id: 'footer'      as const, label: 'Footer',     icon: Layers,         color: 'text-slate-500'  },
];

const tabInfo: Record<TabId, { title: string; description: string }> = {
  overview:       { title: 'Dashboard Overview',    description: 'View system statistics and analytics'      },
  users:          { title: 'User Management',        description: 'Manage and moderate user accounts'         },
  reports:        { title: 'Reports Management',     description: 'Review and handle user reports'            },
  analytics:      { title: 'Admin Actions Log',      description: 'Track administrative actions'              },
  premium:        { title: 'Premium Management',     description: 'Manage premium plans and features'         },
  'promo-codes':  { title: 'Promo Codes',            description: 'Manage promotional discount codes'         },
  'expert-tips':  { title: 'Expert Tips Management', description: 'Manage expert tips and advice'             },
  reviews:        { title: 'Reviews Management',     description: 'Review and approve user testimonials'      },
  'admin-roles':  { title: 'Admin Role Management',  description: 'Manage admin permissions and access'       },
  footer:         { title: 'Footer Management',      description: 'Manage footer sections and links'          },
};

const FRONTEND_URL =
  (import.meta as any).env?.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin.replace(':5174', ':5173')
    : '#');

// ─── View Website Button ───────────────────────────────────────────────────────
const ViewWebsiteButton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <a
    href={FRONTEND_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-sm"
    style={{
      background: isDark
        ? 'linear-gradient(to right,rgba(13,148,136,0.08),rgba(16,185,129,0.06))'
        : 'linear-gradient(to right,#f0fdfa,#eff6ff)',
      border: isDark ? '1px solid rgba(13,148,136,0.2)' : '1px solid #99f6e4',
      color: isDark ? '#5eead4' : '#0d9488',
    }}
  >
    <div
      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: 'linear-gradient(135deg,#0d9488,#3b82f6)' }}
    >
      <Globe className="w-3 h-3 text-white" />
    </div>
    <span className="text-sm font-semibold flex-1 truncate">View Website</span>
    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
  </a>
);

// ─────────────────────────────────────────────────────────────────────────────

const AdminPanelContent: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useNotification();
  const { isDark } = useTheme();

  useEffect(() => {
    if (!adminService.isAdmin()) navigate('/admin/login');
  }, [navigate]);

  const adminUser = adminService.getAdminUser();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  /* ─── Theme tokens ─── */
  const pageBg          = isDark ? '#0d0d0d'  : '#f8faff';
  const sidebarBg       = isDark ? '#1c1c1c'  : '#ffffff';
  const sidebarBorder   = isDark ? 'rgba(249,115,22,0.1)' : '#e5e7eb';
  const headerBg        = isDark ? '#1c1c1c'  : '#ffffff';
  const headerBorder    = isDark ? 'rgba(249,115,22,0.1)' : '#e5e7eb';
  const headerShadow    = isDark ? '0 2px 12px rgba(0,0,0,0.45)' : '0 1px 4px rgba(0,0,0,0.06)';
  const txPrimary       = isDark ? '#f0e8de'  : '#111827';
  const txMuted         = isDark ? '#8a6540'  : '#6b7280';
  const dividerColor    = isDark ? 'rgba(249,115,22,0.08)' : '#e5e7eb';
  const closeBtnHoverBg = isDark ? 'rgba(249,115,22,0.08)' : '#f3f4f6';
  const closeBtnColor   = isDark ? '#8a6540'  : '#9ca3af';
  /* Admin brand teal kept intentionally – admin identity is always teal */
  const adminLogoGrad   = 'linear-gradient(135deg,#0d9488,#10b981)';
  const adminCardBg     = isDark ? 'rgba(13,148,136,0.06)' : 'linear-gradient(135deg,#f0fdfa,#ecfdf5)';
  const adminCardBorder = isDark ? 'rgba(13,148,136,0.18)' : '#99f6e4';
  const adminLabelColor = isDark ? '#5eead4'  : '#0d9488';
  const adminEmailColor = isDark ? '#8a6540'  : '#6b7280';
  const tabActiveBg     = isDark ? 'rgba(13,148,136,0.08)' : 'linear-gradient(to right,#f0fdfa,#ecfdf5)';
  const tabActiveBorder = isDark ? 'rgba(13,148,136,0.2)'  : '#99f6e4';
  const tabActiveColor  = isDark ? '#5eead4'  : '#0d9488';
  const tabIdleColor    = isDark ? '#8a6540'  : '#4b5563';
  const tabHoverBg      = isDark ? 'rgba(249,115,22,0.04)' : '#f9fafb';
  const tabHoverColor   = isDark ? '#c4a882'  : '#111827';
  const hamburgerBg     = isDark ? 'rgba(249,115,22,0.08)' : '#f3f4f6';
  const hamburgerHover  = isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb';
  const hamburgerColor  = isDark ? '#c4a882'  : '#374151';
  const bottomNavBg     = isDark ? '#1c1c1c'  : '#ffffff';
  const bottomNavBorder = isDark ? 'rgba(249,115,22,0.1)'  : '#e5e7eb';
  const bottomNavActive = isDark ? '#fb923c'  : '#0d9488';
  const bottomNavIdle   = isDark ? '#8a6540'  : '#9ca3af';
  const bottomNavHover  = isDark ? '#c4a882'  : '#374151';
  const overlayBg       = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.4)';

  const handleLogout = () => {
    confirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout from the admin panel?',
      type: 'warning',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      onConfirm: () => { adminService.adminLogout(); navigate('/'); },
    });
  };

  const handleTabSelect = (id: TabId) => {
    setActiveTab(id);
    setDrawerOpen(false);
  };

  const current = tabInfo[activeTab];

  return (
    <div className="min-h-screen flex relative transition-colors duration-300" style={{ background: pageBg }}>

      {/* Mobile overlay backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: overlayBg }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 lg:z-20 shadow-lg transition-transform duration-300 ease-in-out"
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          transform: (drawerOpen || sidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Sidebar Header */}
        <div className="p-5" style={{ borderBottom: `1px solid ${dividerColor}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: adminLogoGrad }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold" style={{ color: txPrimary }}>Admin Panel</h1>
            </div>
            <button
              onClick={() => { setSidebarOpen(false); setDrawerOpen(false); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: closeBtnColor }}
              onMouseEnter={(e) => (e.currentTarget.style.background = closeBtnHoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin info card */}
          <div
            className="rounded-lg p-3"
            style={{ background: adminCardBg, border: `1px solid ${adminCardBorder}` }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: adminLabelColor }}>Logged in as</p>
            <p className="text-sm font-bold truncate" style={{ color: txPrimary }}>{adminUser?.username || 'Admin'}</p>
            {adminUser?.email && (
              <p className="text-xs truncate mt-0.5" style={{ color: adminEmailColor }}>{adminUser.email}</p>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left"
                  style={{
                    background: isActive ? tabActiveBg : 'transparent',
                    border: `1px solid ${isActive ? tabActiveBorder : 'transparent'}`,
                    color: isActive ? tabActiveColor : tabIdleColor,
                    fontWeight: isActive ? 600 : 400,
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = tabHoverBg;
                      (e.currentTarget as HTMLElement).style.color = tabHoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = tabIdleColor;
                    }
                  }}
                >
                  <tab.icon className={`w-5 h-5 shrink-0 ${isActive ? tab.color : ''}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Bottom section: View Website + Logout ── */}
        <div className="p-4 space-y-2" style={{ borderTop: `1px solid ${dividerColor}` }}>
          <ViewWebsiteButton isDark={isDark} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ml-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>

        {/* Top Header */}
        <header
          className="sticky top-0 z-10"
          style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}`, boxShadow: headerShadow }}
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">

                {/* Mobile hamburger */}
                <button
                  onClick={() => { setSidebarOpen(true); setDrawerOpen(true); }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 lg:hidden"
                  style={{ background: hamburgerBg, color: hamburgerColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = hamburgerHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = hamburgerBg)}
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Desktop: show shield when sidebar is collapsed */}
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="hidden lg:flex w-10 h-10 rounded-xl items-center justify-center hover:opacity-90 transition-all duration-200 shadow-sm shrink-0"
                    style={{ background: adminLogoGrad }}
                    aria-label="Open sidebar"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </button>
                )}

                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold truncate" style={{ color: txPrimary }}>{current.title}</h2>
                  <p className="text-xs sm:text-sm truncate hidden sm:block" style={{ color: txMuted }}>{current.description}</p>
                </div>
              </div>

              {/* Header right: View Website shortcut (desktop only, visible when sidebar closed) */}
              {!sidebarOpen && (
                <a
                  href={FRONTEND_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all group shrink-0"
                  style={{
                    background: isDark ? 'rgba(13,148,136,0.06)' : '#f0fdfa',
                    border: isDark ? '1px solid rgba(13,148,136,0.2)' : '1px solid #99f6e4',
                    color: isDark ? '#5eead4' : '#0d9488',
                  }}
                >
                  <Globe className="w-4 h-4" />
                  View Website
                  <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-6">
          <div className="w-full px-4 sm:px-6 py-4 sm:py-6">
            {activeTab === 'overview'     && <Overview />}
            {activeTab === 'users'        && <UserManagement />}
            {activeTab === 'reports'      && <ReportsManagement />}
            {activeTab === 'analytics'    && <AdminActionsLog />}
            {activeTab === 'premium'      && <PremiumManagement />}
            {activeTab === 'promo-codes'  && <PromoCodeManagement />}
            {activeTab === 'expert-tips'  && <ExpertTipsManagement />}
            {activeTab === 'reviews'      && <ReviewsManagement />}
            {activeTab === 'admin-roles'  && <AdminRoleManagement />}
            {activeTab === 'footer'       && <FooterManagement />}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex lg:hidden z-20"
          style={{
            background: bottomNavBg,
            borderTop: `1px solid ${bottomNavBorder}`,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {tabs.slice(0, 4).map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
                style={{ color: isActive ? bottomNavActive : bottomNavIdle }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = bottomNavHover; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = bottomNavIdle; }}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? tab.color : ''}`} />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
          {/* More → opens full drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={{ color: bottomNavIdle }}
            onMouseEnter={(e) => (e.currentTarget.style.color = bottomNavHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = bottomNavIdle)}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => (
  <NotificationProvider>
    <AdminPanelContent />
  </NotificationProvider>
);

export default AdminPanel;