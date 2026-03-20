import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, X, LogOut, BarChart3, Users as UsersIcon, AlertTriangle, 
  FileText, Crown, Lightbulb, Quote, Settings, Layers, Ticket, Menu,
  Globe, ExternalLink,
} from 'lucide-react';
import { adminService } from '../services/profileService';
import { NotificationProvider, useNotification } from './adminpages/Notificationsystem';

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

// Reads the frontend URL from env — falls back to same origin minus admin port
const FRONTEND_URL =
  (import.meta as any).env?.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined'
    ? window.location.origin.replace(':5174', ':5173')
    : '#');

// ─── View Website Button (used inside sidebar) ────────────────────────────────
const ViewWebsiteButton: React.FC = () => (
  <a
    href={FRONTEND_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="
      group w-full flex items-center gap-3 px-4 py-3 rounded-lg
      bg-gradient-to-r from-teal-50 to-blue-50
      border border-teal-100 hover:border-teal-300
      text-teal-700 hover:text-teal-800
      transition-all duration-200 hover:shadow-sm hover:shadow-teal-500/10
    "
  >
    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
      <Globe className="w-3 h-3 text-white" />
    </div>
    <span className="text-sm font-semibold flex-1 truncate">View Website</span>
    <ExternalLink className="
      w-3.5 h-3.5 shrink-0 text-teal-400
      group-hover:text-teal-600
      group-hover:translate-x-0.5 group-hover:-translate-y-0.5
      transition-transform duration-150
    " />
  </a>
);

// ─────────────────────────────────────────────────────────────────────────────

const AdminPanelContent: React.FC = () => {
  const navigate = useNavigate();
  const { confirm } = useNotification();

  useEffect(() => {
    if (!adminService.isAdmin()) navigate('/admin/login');
  }, [navigate]);

  const adminUser = adminService.getAdminUser();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-gray-50 flex relative">

      {/* Mobile overlay backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40 lg:z-20 shadow-lg transition-transform duration-300 ease-in-out"
        style={{
          transform: (drawerOpen || sidebarOpen) ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={() => { setSidebarOpen(false); setDrawerOpen(false); }}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Admin info card */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-3 border border-teal-100">
            <p className="text-xs text-teal-600 font-medium mb-0.5">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 truncate">{adminUser?.username || 'Admin'}</p>
            {adminUser?.email && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{adminUser.email}</p>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 font-semibold shadow-sm border border-teal-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? tab.color : ''}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ── Bottom section: View Website + Logout ── */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* View Website */}
          <ViewWebsiteButton />

          {/* Logout */}
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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">

                {/* Mobile hamburger */}
                <button
                  onClick={() => { setSidebarOpen(true); setDrawerOpen(true); }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 lg:hidden bg-gray-100 hover:bg-gray-200"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {/* Desktop: show shield when sidebar is collapsed */}
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="hidden lg:flex w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 items-center justify-center hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-sm shrink-0"
                    aria-label="Open sidebar"
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </button>
                )}

                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">{current.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">{current.description}</p>
                </div>
              </div>

              {/* Header right: View Website shortcut (desktop only, visible when sidebar closed) */}
              {!sidebarOpen && (
                <a
                  href={FRONTEND_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 hover:border-teal-300 text-teal-700 text-sm font-semibold transition-all group shrink-0"
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex lg:hidden z-20 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          {tabs.slice(0, 4).map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                activeTab === tab.id ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : ''}`} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          ))}
          {/* More → opens full drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-400 hover:text-gray-600 transition-colors"
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