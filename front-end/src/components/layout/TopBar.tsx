// src/components/layout/TopBar.tsx
import { useEffect, useState, useCallback } from "react";
import { Home, MessageCircle, Bell, Heart, Sparkles, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";
import { useTheme } from "@/components/ThemeContext";

interface TopBarProps {
  userName?: string;
  onLogout?: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthToken = (): { token: string; type: "Bearer" | "Token" } | null => {
  const jwtKeys = ["access_token", "accessToken", "jwt", "access"];
  const tokenKeys = ["token", "authToken", "auth_token", "admin_token"];
  for (const key of jwtKeys) {
    const t = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (t) return { token: t, type: "Bearer" };
  }
  for (const key of tokenKeys) {
    const t = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (t) return { token: t, type: "Token" };
  }
  return null;
};

export default function TopBar({ userName = "User", onLogout }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [isPremium, setIsPremium]             = useState<boolean | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount]   = useState(0);
  const [resolvedUserName, setResolvedUserName] = useState<string>(userName);

  useEffect(() => {
    (async () => {
      try {
        const authData = getAuthToken();
        if (!authData) { setIsPremium(false); return; }
        const res = await fetch(`${API_BASE}/api/profile/`, {
          headers: { Authorization: `${authData.type} ${authData.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsPremium(data.premium === true);
          const name = data.first_name || data.firstName || data.name || data.username
            || localStorage.getItem("user_name") || localStorage.getItem("name")
            || data.email?.split("@")[0] || userName;
          if (name && name !== "User") { setResolvedUserName(name); localStorage.setItem("user_name", name); }
        } else { setIsPremium(false); }
      } catch { setIsPremium(false); }
    })();
  }, []);

  useEffect(() => {
    if (userName && userName !== "User") { setResolvedUserName(userName); localStorage.setItem("user_name", userName); }
  }, [userName]);

  const fetchUnreadNotif = useCallback(async () => {
    try {
      const a = getAuthToken(); if (!a) return;
      const res = await fetch(`${API_BASE}/api/notifications/unread-count/`, { headers: { Authorization: `${a.type} ${a.token}` } });
      if (res.ok) setUnreadNotifCount((await res.json()).unread_count ?? 0);
    } catch { /* silent */ }
  }, []);

  const fetchUnreadChat = useCallback(async () => {
    if (location.pathname === "/chats") { setUnreadChatCount(0); return; }
    try {
      const a = getAuthToken(); if (!a) return;
      const res = await fetch(`${API_BASE}/api/chats/unread-count/`, { headers: { Authorization: `${a.type} ${a.token}` } });
      if (res.ok) setUnreadChatCount((await res.json()).unread_count ?? 0);
    } catch { /* silent */ }
  }, [location.pathname]);

  useEffect(() => { fetchUnreadNotif(); const i = setInterval(fetchUnreadNotif, 15000); return () => clearInterval(i); }, [fetchUnreadNotif, location.pathname]);
  useEffect(() => { fetchUnreadChat();  const i = setInterval(fetchUnreadChat,  10000); return () => clearInterval(i); }, [fetchUnreadChat,  location.pathname]);

  const navItems = [
    { icon: Home,          label: "Home",          path: "/home",          badgeCount: 0,               },
    { icon: MessageCircle, label: "Chats",          path: "/chats",         badgeCount: unreadChatCount,  },
    { icon: Bell,          label: "Notifications",  path: "/notifications", badgeCount: unreadNotifCount, },
  ];

  /* ═══════════════════════════════════════
     THEME-AWARE STYLES
  ═══════════════════════════════════════ */
  const s = {
    header: isDark ? {
      background: "rgba(16,12,4,0.93)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(249,115,22,0.18)",
      boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
    } : {
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #e2e8f0",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    },

    logoIcon: isDark ? {
      background: "linear-gradient(135deg,#c2410c 0%,#ea580c 40%,#f97316 100%)",
      boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
    } : {
      background: "linear-gradient(135deg,#0095E0,#00C98B)",
      boxShadow: "0 4px 16px rgba(0,149,224,0.3)",
    },

    logoText: { color: isDark ? "#f0e8de" : "#1e293b" } as React.CSSProperties,

    navPill: isDark ? {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(249,115,22,0.16)",
    } : {
      background: "rgba(241,245,249,0.8)",
      border: "1px solid #e2e8f0",
    },

    navActive: isDark ? {
      background: "rgba(249,115,22,0.18)",
      color: "#fb923c",
      boxShadow: "0 0 14px rgba(249,115,22,0.2)",
      transform: "scale(1.05)",
      border: "1px solid rgba(249,115,22,0.3)",
    } : {
      background: "white",
      color: "#0095E0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transform: "scale(1.05)",
    },

    navInactive: { color: isDark ? "#4a3520" : "#94a3b8" } as React.CSSProperties,
    navHover:    { color: isDark ? "#c4a882" : "#475569", background: isDark ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.6)" },

    badgeBorder: isDark ? "#100c04" : "white",

    upgradeBtn: isDark ? {
      background: "linear-gradient(135deg,#c2410c 0%,#ea580c 40%,#f97316 100%)",
      boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
    } : {
      background: "linear-gradient(135deg,#0095E0,#00C98B)",
      boxShadow: "0 4px 14px rgba(0,149,224,0.3)",
    },

    premiumBadge: isDark ? {
      background: "linear-gradient(135deg,#92400e,#c2410c)",
      border: "1px solid rgba(251,191,36,0.3)",
      color: "#fbbf24",
    } : {
      background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
      color: "white",
      boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
    },

    toggleBtn: isDark ? {
      background: "rgba(249,115,22,0.12)",
      border: "1px solid rgba(249,115,22,0.25)",
      color: "#fb923c",
    } : {
      background: "rgba(241,245,249,0.8)",
      border: "1px solid #e2e8f0",
      color: "#64748b",
    },

    divider: { borderLeft: isDark ? "1px solid rgba(249,115,22,0.18)" : "1px solid #e2e8f0" } as React.CSSProperties,
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-4 lg:px-8 z-50 transition-all duration-300"
      style={s.header}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 w-[200px]">
        <Link to="/home" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={s.logoIcon}
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span
            className="font-extrabold text-[18px] tracking-tight hidden sm:block transition-colors duration-200"
            style={s.logoText}
          >
            The Dating App
          </span>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 rounded-full transition-all duration-300" style={s.navPill}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} title={item.label} className="relative group">
              <div
                className="p-3 rounded-full transition-all duration-300 flex items-center justify-center relative"
                style={isActive ? s.navActive : s.navInactive}
                onMouseEnter={(e) => { if (!isActive) Object.assign((e.currentTarget as HTMLElement).style, s.navHover); }}
                onMouseLeave={(e) => { if (!isActive) Object.assign((e.currentTarget as HTMLElement).style, s.navInactive); }}
              >
                <item.icon className={cn("w-5 h-5 transition-all duration-300", isActive ? "fill-current" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                {item.badgeCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 border-2 rounded-full shadow-sm text-white text-[9px] font-bold flex items-center justify-center z-10 animate-pulse bg-red-500"
                    style={{ borderColor: s.badgeBorder }}
                  >
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-2 w-[200px]">
        {isPremium === false && (
          <button
            onClick={() => navigate("/premium")}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            style={s.upgradeBtn}
          >
            <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
            <span className="hidden lg:inline">Get Plus</span>
          </button>
        )}

        {isPremium === true && (
          <div className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300" style={s.premiumBadge}>
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="hidden lg:inline">Premium</span>
          </div>
        )}

        {/* ── Theme Toggle ── */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={s.toggleBtn}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(249,115,22,0.25)" : "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = s.toggleBtn.background as string;
          }}
        >
          {isDark
            ? <Sun  className="w-4 h-4" style={{ color: "#fb923c" }} />
            : <Moon className="w-4 h-4" style={{ color: "#64748b" }} />
          }
        </button>

        <div className="pl-2 ml-1" style={s.divider}>
          <ProfileDropdown userName={resolvedUserName} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}