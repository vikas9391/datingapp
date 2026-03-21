import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

/* ---------------- EXISTING PAGES ---------------- */
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import AdminPanel from './pages/AdminPanel';
import PremiumPage from './pages/Premiumpage';
import Settings from "@/pages/Settings";
import BlockedUsersPage from "@/pages/BlockedUsersPage";
import DataPrivacyPage from "@/pages/DataPrivacyPage";

/* ---------------- FOOTER PAGES ---------------- */
import LegalPage from './pages/footer/LegalPage';
import AboutPage from './pages/footer/AboutPage';
import ContactPage from './pages/footer/ContactPage';
import CareersPage from './pages/footer/CareersPage';
import HelpCenterPage from './pages/footer/HelpCenterPage';

/* ---------------- SERVICES & THEME ---------------- */
import { adminService, profileService } from './services/profileService';
import { ThemeProvider } from "@/components/ThemeContext";

/* ─── Admin-only route guard ─── */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = adminService.isAdmin();
  if (!isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/* ─── Loading spinner ─── */
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
  </div>
);

/* ═══════════════════════════════════════════════════════
   INNER APP
═══════════════════════════════════════════════════════ */
const AppInner: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn]           = useState<boolean | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /* Scroll-to-top on route change (except chats) */
  useEffect(() => {
    if (!location.pathname.startsWith('/chats')) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const checkProfile = async () => {
    try {
      const result = await profileService.getProfile();
      const isComplete = result.exists && result.data?.firstName;
      setNeedsOnboarding(!isComplete);
      return !!isComplete;
    } catch {
      handleLogout();
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isLoggedIn === true) return;
      if (location.pathname.startsWith('/admin')) {
        setIsLoggedIn(false);
        return;
      }

      const params           = new URLSearchParams(window.location.search);
      const accessFromQuery  = params.get("access_token");
      const refreshFromQuery = params.get("refresh_token");

      if (accessFromQuery) {
        localStorage.setItem("access_token", accessFromQuery);
        if (refreshFromQuery) localStorage.setItem("refresh_token", refreshFromQuery);
        window.history.replaceState({}, "", window.location.pathname);
        await checkProfile();
        setIsLoggedIn(true);
        return;
      }

      const storedAccess = localStorage.getItem("access_token");
      if (storedAccess) {
        await checkProfile();
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoginSuccess = async () => {
    await checkProfile();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    navigate("/", { replace: true });
  };

  if (isLoggedIn === null && !location.pathname.startsWith('/admin')) {
    return <Spinner />;
  }

  const requireAuth   = (el: React.ReactNode) =>
    !isLoggedIn
      ? <Navigate to="/" replace />
      : needsOnboarding
        ? <Navigate to="/onboarding" replace />
        : el;

  const requireNoAuth = (el: React.ReactNode) =>
    isLoggedIn
      ? (needsOnboarding ? <Navigate to="/onboarding" replace /> : <Navigate to="/home" replace />)
      : el;

  return (
    <Routes>
      {/* ── Admin ── */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />

      {/* ════════════════════════════════════════════════
          FOOTER / PUBLIC PAGES
          These must match every path in FooterManagement's
          APP_ROUTES so the admin route picker always resolves.
          ════════════════════════════════════════════════ */}

      {/* — Legal & Support group — */}
      <Route path="/about"      element={<AboutPage />} />
      <Route path="/contact"    element={<ContactPage />} />
      <Route path="/privacy"    element={<LegalPage type="privacy" />} />
      <Route path="/terms"      element={<LegalPage type="terms" />} />
      <Route path="/cookies"    element={<LegalPage type="cookies" />} />
      <Route path="/help"       element={<HelpCenterPage />} />
      <Route path="/safety"     element={<LegalPage type="safety" />} />
      <Route path="/guidelines" element={<LegalPage type="guidelines" />} />

      {/* — Company group — */}
      <Route path="/careers"    element={<CareersPage />} />
      <Route path="/press"      element={<LegalPage type="press" />} />
      <Route path="/blog"       element={<LegalPage type="blog" />} />
      <Route path="/ip"         element={<LegalPage type="ip" />} />

      {/* — Premium group — */}
      <Route path="/pricing"    element={requireAuth(<PremiumPage />)} />

      {/* — Account group — */}
      <Route path="/account/delete" element={requireAuth(<DataPrivacyPage onLogout={handleLogout} />)} />

      {/* ════════════════════════════════════════════════
          SETTINGS & PRIVACY  (auth handled internally)
          ════════════════════════════════════════════════ */}
      <Route path="/settings"      element={<Settings onLogout={handleLogout} />} />
      <Route path="/blocked-users" element={requireAuth(<BlockedUsersPage />)} />
      <Route path="/data-privacy"  element={requireAuth(<DataPrivacyPage onLogout={handleLogout} />)} />

      {/* ════════════════════════════════════════════════
          CORE AUTH ROUTES
          ════════════════════════════════════════════════ */}
      <Route path="/"           element={requireNoAuth(<Landing />)} />
      <Route path="/login"      element={requireNoAuth(<LoginPage onLoginSuccess={handleLoginSuccess} />)} />
      <Route path="/onboarding" element={isLoggedIn ? <OnboardingPage onComplete={() => setNeedsOnboarding(false)} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
      <Route path="/premium"    element={requireAuth(<PremiumPage />)} />

      {/* ════════════════════════════════════════════════
          PROTECTED APP PAGES
          ════════════════════════════════════════════════ */}
      <Route path="/home"          element={requireAuth(<HomePage onLogout={handleLogout} />)} />
      <Route path="/chats"         element={requireAuth(<ChatsPage onLogout={handleLogout} />)} />
      <Route path="/notifications" element={requireAuth(<NotificationsPage onLogout={handleLogout} />)} />
      <Route path="/profile"       element={requireAuth(<ProfilePage />)} />
      <Route path="/profile/edit"  element={requireAuth(<ProfilePage />)} />
      <Route path="/matches"       element={requireAuth(<HomePage onLogout={handleLogout} />)} />
      <Route path="/nearby"        element={requireAuth(<HomePage onLogout={handleLogout} />)} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/* ═══════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════ */
const App: React.FC = () => (
  <ThemeProvider>
    <AppInner />
  </ThemeProvider>
);

export default App;