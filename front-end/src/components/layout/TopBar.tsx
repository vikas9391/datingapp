import { useEffect, useState, useCallback } from "react";
import { Home, MessageCircle, Bell, Heart, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";

interface TopBarProps {
  userName?: string;
  onLogout?: () => void;
}

const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const API_BASE = "http://127.0.0.1:8000";

const getAuthToken = (): { token: string; type: "Bearer" | "Token" } | null => {
  const jwtKeys = ["access_token", "accessToken", "jwt", "access"];
  const tokenKeys = ["token", "authToken", "auth_token", "admin_token"];
  for (const key of jwtKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: "Bearer" };
  }
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: "Token" };
  }
  return null;
};

export default function TopBar({ userName = "User", onLogout }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [resolvedUserName, setResolvedUserName] = useState<string>(userName);

  // ── Fetch premium status + resolve user name (once on mount)
  useEffect(() => {
    const checkPremium = async () => {
      try {
        const authData = getAuthToken();
        if (!authData) { setIsPremium(false); return; }

        const response = await fetch(`${API_BASE}/api/profile/`, {
          headers: { Authorization: `${authData.type} ${authData.token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.premium === true);

          // Resolve display name from profile — try multiple field names
          const name =
            data.first_name ||
            data.firstName ||
            data.name ||
            data.username ||
            localStorage.getItem("user_name") ||
            localStorage.getItem("name") ||
            data.email?.split("@")[0] ||
            userName;

          if (name && name !== "User") {
            setResolvedUserName(name);
            // Cache it so other pages get it immediately on next render
            localStorage.setItem("user_name", name);
          }
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
    };
    checkPremium();
  }, []);

  // ── If userName prop changes (e.g. home page passes it in), prefer it
  useEffect(() => {
    if (userName && userName !== "User") {
      setResolvedUserName(userName);
      localStorage.setItem("user_name", userName);
    }
  }, [userName]);

  // ── Fetch unread notification count
  const fetchUnreadNotifCount = useCallback(async () => {
    try {
      const authData = getAuthToken();
      if (!authData) return;
      const res = await fetch(`${API_BASE}/api/notifications/unread-count/`, {
        headers: { Authorization: `${authData.type} ${authData.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadNotifCount(data.unread_count ?? 0);
      }
    } catch {
      // silent fail
    }
  }, []);

  // ── Fetch unread chat count (single endpoint)
  const fetchUnreadChatCount = useCallback(async () => {
    // Don't show badge when user is already on the chats page
    if (location.pathname === "/chats") {
      setUnreadChatCount(0);
      return;
    }
    try {
      const authData = getAuthToken();
      if (!authData) return;
      const res = await fetch(`${API_BASE}/api/chats/unread-count/`, {
        headers: { Authorization: `${authData.type} ${authData.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadChatCount(data.unread_count ?? 0);
      }
    } catch {
      // silent fail
    }
  }, [location.pathname]);

  // ── Poll notifications every 15s + re-fetch on route change
  useEffect(() => {
    fetchUnreadNotifCount();
    const interval = setInterval(fetchUnreadNotifCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadNotifCount, location.pathname]);

  // ── Poll chats every 10s + re-fetch on route change
  useEffect(() => {
    fetchUnreadChatCount();
    const interval = setInterval(fetchUnreadChatCount, 10000);
    return () => clearInterval(interval);
  }, [fetchUnreadChatCount, location.pathname]);

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/home",
      badgeCount: 0,
      badgeColor: "",
    },
    {
      icon: MessageCircle,
      label: "Chats",
      path: "/chats",
      badgeCount: unreadChatCount,
      badgeColor: "bg-blue-500",
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      badgeCount: unreadNotifCount,
      badgeColor: "bg-red-500",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 z-50 shadow-sm transition-all">
      {/* 1. Logo */}
      <div className="flex items-center gap-3 w-[200px]">
        <Link to="/home" className="flex items-center gap-3 group">
          <div
            className={`w-10 h-10 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300`}
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-extrabold text-[18px] tracking-tight text-slate-800 hidden sm:block group-hover:text-teal-600 transition-colors">
            The Dating App
          </span>
        </Link>
      </div>

      {/* 2. Navigation */}
      <nav className="flex items-center gap-1 sm:gap-2 bg-slate-50/80 px-2 py-1.5 rounded-full border border-white shadow-inner">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className="relative group"
            >
              <div
                className={cn(
                  "p-3 rounded-full transition-all duration-300 flex items-center justify-center relative",
                  isActive
                    ? "bg-white text-[#0095E0] shadow-md scale-105"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "fill-current" : "group-hover:scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Count badge */}
                {item.badgeCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1",
                      "border-2 border-white rounded-full shadow-sm",
                      "text-white text-[9px] font-bold",
                      "flex items-center justify-center z-10 animate-pulse",
                      item.badgeColor
                    )}
                  >
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 3. Actions */}
      <div className="flex items-center justify-end gap-3 w-[200px]">
        {isPremium === false && (
          <button
            onClick={() => navigate("/premium")}
            className={`hidden md:flex items-center gap-1.5 px-5 py-2 rounded-full ${PRIMARY_GRADIENT} text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
            <span>Get Plus</span>
          </button>
        )}

        {isPremium === true && (
          <div className="hidden md:flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>Premium</span>
          </div>
        )}

        <div className="pl-2 border-l border-slate-100 ml-2">
          {/* ← resolvedUserName instead of userName */}
          <ProfileDropdown userName={resolvedUserName} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}