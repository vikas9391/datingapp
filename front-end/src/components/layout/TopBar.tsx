import { useEffect, useState, useCallback } from "react";
import { Home, MessageCircle, Bell, Heart, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";

interface TopBarProps {
  userName?: string;
  onLogout?: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE;

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
          const name =
            data.first_name || data.firstName || data.name || data.username ||
            localStorage.getItem("user_name") || localStorage.getItem("name") ||
            data.email?.split("@")[0] || userName;
          if (name && name !== "User") {
            setResolvedUserName(name);
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

  useEffect(() => {
    if (userName && userName !== "User") {
      setResolvedUserName(userName);
      localStorage.setItem("user_name", userName);
    }
  }, [userName]);

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
    } catch { /* silent */ }
  }, []);

  const fetchUnreadChatCount = useCallback(async () => {
    if (location.pathname === "/chats") { setUnreadChatCount(0); return; }
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
    } catch { /* silent */ }
  }, [location.pathname]);

  useEffect(() => {
    fetchUnreadNotifCount();
    const interval = setInterval(fetchUnreadNotifCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadNotifCount, location.pathname]);

  useEffect(() => {
    fetchUnreadChatCount();
    const interval = setInterval(fetchUnreadChatCount, 10000);
    return () => clearInterval(interval);
  }, [fetchUnreadChatCount, location.pathname]);

  const navItems = [
    { icon: Home,          label: "Home",          path: "/home",          badgeCount: 0,               badgeColor: "" },
    { icon: MessageCircle, label: "Chats",          path: "/chats",         badgeCount: unreadChatCount,  badgeColor: "bg-orange-500" },
    { icon: Bell,          label: "Notifications",  path: "/notifications", badgeCount: unreadNotifCount, badgeColor: "bg-rose-500" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-4 lg:px-8 z-50 transition-all"
      style={{
        background: "rgba(16, 12, 4, 0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(249,115,22,0.18)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(249,115,22,0.08)",
      }}
    >
      {/* 1. Logo */}
      <div className="flex items-center gap-3 w-[200px]">
        <Link to="/home" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
              boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
            }}
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span
            className="font-extrabold text-[18px] tracking-tight hidden sm:block transition-colors duration-200"
            style={{ color: "#f0e8de" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fb923c")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#f0e8de")}
          >
            The Dating App
          </span>
        </Link>
      </div>

      {/* 2. Navigation */}
      <nav
        className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(249,115,22,0.16)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} title={item.label} className="relative group">
              <div
                className={cn(
                  "p-3 rounded-full transition-all duration-300 flex items-center justify-center relative"
                )}
                style={
                  isActive
                    ? {
                        background: "rgba(249,115,22,0.18)",
                        color: "#fb923c",
                        boxShadow: "0 0 14px rgba(249,115,22,0.2)",
                        transform: "scale(1.05)",
                        border: "1px solid rgba(249,115,22,0.3)",
                      }
                    : { color: "#4a3520" }
                }
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "#c4a882";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "#4a3520";
                }}
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
                      "border-2 rounded-full shadow-sm",
                      "text-white text-[9px] font-bold",
                      "flex items-center justify-center z-10 animate-pulse",
                      item.badgeColor
                    )}
                    style={{ borderColor: "#100c04" }}
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
            className="hidden md:flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 22px rgba(249,115,22,0.5)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 14px rgba(249,115,22,0.35)")
            }
          >
            <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
            <span>Get Plus</span>
          </button>
        )}

        {isPremium === true && (
          <div
            className="hidden md:flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #92400e, #c2410c)",
              border: "1px solid rgba(251,191,36,0.3)",
              boxShadow: "0 0 14px rgba(251,191,36,0.2)",
              color: "#fbbf24",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Premium</span>
          </div>
        )}

        <div
          className="pl-2 ml-2"
          style={{ borderLeft: "1px solid rgba(249,115,22,0.18)" }}
        >
          <ProfileDropdown userName={resolvedUserName} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}