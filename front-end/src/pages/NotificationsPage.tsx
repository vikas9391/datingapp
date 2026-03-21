import { useEffect, useState, useCallback, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import { Bell, Heart, Star, MessageCircle, UserPlus, RefreshCw, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

type NotificationType = "MATCH_CREATED" | "NEW_MESSAGE" | "LIKE_RECEIVED" | "match";

interface ApiNotification {
  id: number;
  type: NotificationType;
  match_id: number | null;
  chat_id: number | null;
  other_user: string | null;
  other_user_name: string | null;
  is_read: boolean;
  created_at: string;
  user?: string;
  text?: string;
}

interface DisplayNotification {
  id: number;
  type: NotificationType;
  user: string;
  text: string;
  time: string;
  is_read: boolean;
  chat_id: number | null;
  match_id: number | null;
  other_user_email: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function defaultText(type: NotificationType): string {
  switch (type) {
    case "MATCH_CREATED":
    case "match":         return "It's a match! Start chatting now.";
    case "LIKE_RECEIVED": return "liked your profile";
    case "NEW_MESSAGE":   return "sent you a message";
    default:              return "interacted with your profile";
  }
}

function mapApiToDisplay(n: ApiNotification): DisplayNotification {
  return {
    id: n.id,
    type: n.type,
    user: n.other_user_name ?? n.user ?? n.other_user ?? "Someone",
    text: n.text ?? defaultText(n.type),
    time: timeAgo(n.created_at),
    is_read: n.is_read ?? false,
    chat_id: n.chat_id ?? null,
    match_id: n.match_id ?? null,
    other_user_email: n.other_user ?? null,
  };
}

export default function NotificationsPage({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const cachedName = localStorage.getItem("user_name") || "User";
  const markingAllRef = useRef(false);

  const accentColor      = isDark ? "#f97316" : "#1d4ed8";
  const pageBg           = isDark ? "#0d0d0d" : "#f8faff";
  const txPrimary        = isDark ? "#f0e8de" : "#111827";
  const txBody           = isDark ? "#c4a882" : "#374151";
  const txMuted          = isDark ? "#8a6540" : "#6b7280";
  const cardBg           = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorderRead   = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.06)";
  const cardBorderUnread = isDark ? "rgba(249,115,22,0.35)" : "rgba(29,78,216,0.25)";
  const cardRingUnread   = isDark ? "rgba(249,115,22,0.12)" : "rgba(29,78,216,0.1)";
  const cardShadow       = isDark ? "0 2px 16px rgba(0,0,0,0.4)"  : "0 2px 12px rgba(0,0,0,0.04)";
  const cardShadowHover  = isDark ? "0 6px 28px rgba(0,0,0,0.5)"  : "0 6px 24px rgba(29,78,216,0.1)";
  const skeletonBase     = isDark ? "rgba(249,115,22,0.06)" : "#f3f4f6";
  const skeletonShimmer  = isDark ? "#2a1a08"               : "#e5e7eb";
  const errorBg          = isDark ? "rgba(239,68,68,0.08)"  : "#fef2f2";
  const errorBorder      = isDark ? "rgba(239,68,68,0.22)"  : "#fecaca";
  const errorTx          = isDark ? "#f87171"               : "#dc2626";
  const emptyIconBg      = isDark ? "rgba(249,115,22,0.08)" : "#f3f4f6";
  const emptyIconColor   = isDark ? "#8a6540"               : "#9ca3af";
  const headerBorder     = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.08)";
  const refreshHoverBg   = isDark ? "rgba(249,115,22,0.08)" : "rgba(29,78,216,0.05)";
  const primaryGrad      = isDark
    ? "linear-gradient(135deg, #f97316, #fb923c)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";

  function notifMeta(type: NotificationType) {
    switch (type) {
      case "MATCH_CREATED":
      case "match":
        return {
          Icon: Star,
          color: isDark ? "#fb923c" : "#1d4ed8",
          bg: isDark ? "rgba(249,115,22,0.12)" : "rgba(29,78,216,0.08)",
          defaultText: "It's a match! Start chatting now.",
          actionHint: "Open chat →",
        };
      case "LIKE_RECEIVED":
        return {
          Icon: Heart,
          color: isDark ? "#fbbf24" : "#3b82f6",
          bg: isDark ? "rgba(251,191,36,0.1)" : "rgba(59,130,246,0.08)",
          defaultText: "liked your profile",
          actionHint: "View in discover →",
        };
      case "NEW_MESSAGE":
        return {
          Icon: MessageCircle,
          color: isDark ? "#f97316" : "#60a5fa",
          bg: isDark ? "rgba(249,115,22,0.1)" : "rgba(96,165,250,0.08)",
          defaultText: "sent you a message",
          actionHint: "Open chat →",
        };
      default:
        return {
          Icon: UserPlus,
          color: isDark ? "#c4a882" : "#6366f1",
          bg: isDark ? "rgba(249,115,22,0.06)" : "rgba(99,102,241,0.08)",
          defaultText: "interacted with your profile",
          actionHint: null,
        };
    }
  }

  function SkeletonCard() {
    return (
      <div
        className="flex items-center gap-4 p-5 rounded-2xl border animate-pulse"
        style={{ background: skeletonBase, borderColor: isDark ? "rgba(249,115,22,0.08)" : "rgba(29,78,216,0.05)" }}
      >
        <div className="w-12 h-12 rounded-full shrink-0" style={{ background: skeletonShimmer }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded-full w-3/4" style={{ background: skeletonShimmer }} />
          <div className="h-2.5 rounded-full w-1/3" style={{ background: skeletonShimmer }} />
        </div>
      </div>
    );
  }

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/notifications/all/`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiNotification[] = await res.json();
      setNotifications(data.map(mapApiToDisplay));
    } catch {
      setError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchNotifications();
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/notifications/read-all/`, { method: "POST", headers: authHeaders() });
          if (res.ok) setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch { /* silent */ }
      }, 1500);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      const res = await fetch(`${API_BASE}/api/notifications/read/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ notification_id: id }),
      });
      if (!res.ok)
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    }
  }, []);

  const handleNotifClick = useCallback(
    async (notif: DisplayNotification) => {
      if (!notif.is_read) markRead(notif.id);
      switch (notif.type) {
        case "MATCH_CREATED":
        case "match":
        case "NEW_MESSAGE":
          if (notif.chat_id) {
            navigate(`/chats/${notif.chat_id}`);
          } else {
            navigate("/chats");
          }
          break;
        case "LIKE_RECEIVED":
          if (notif.other_user_email) {
            navigate(`/home?highlight=${encodeURIComponent(notif.other_user_email)}`);
          } else {
            navigate("/home");
          }
          break;
        default:
          break;
      }
    },
    [markRead, navigate]
  );

  const markAllRead = useCallback(async () => {
    if (markingAllRef.current) return;

    let capturedUnreadIds: number[] = [];
    setNotifications((prev) => {
      capturedUnreadIds = prev.filter((n) => !n.is_read).map((n) => n.id);
      if (capturedUnreadIds.length === 0) return prev;
      return prev.map((n) => ({ ...n, is_read: true }));
    });
    if (capturedUnreadIds.length === 0) return;

    markingAllRef.current = true;
    setMarkingAll(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/notifications/read-all/`, { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setNotifications((prev) =>
        prev.map((n) => capturedUnreadIds.includes(n.id) ? { ...n, is_read: false } : n)
      );
      setError("Failed to mark all as read. Please try again.");
    } finally {
      markingAllRef.current = false;
      setMarkingAll(false);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const isClickable = (notif: DisplayNotification): boolean => {
    switch (notif.type) {
      case "MATCH_CREATED":
      case "match":
      case "NEW_MESSAGE":
        return true;
      case "LIKE_RECEIVED":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 transition-colors duration-300" style={{ background: pageBg }}>
      <TopBar onLogout={onLogout} userName={cachedName} />

      <main className="container mx-auto max-w-3xl px-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 pt-6 pb-4" style={{ borderBottom: `1px solid ${headerBorder}` }}>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: txPrimary }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-white text-xs font-bold"
                style={{ background: primaryGrad }}
              >
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2 rounded-full transition-colors disabled:opacity-40"
              style={{ color: txMuted }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = refreshHoverBg)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              aria-label="Refresh notifications"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-sm font-semibold hover:underline disabled:opacity-50 transition-opacity bg-transparent border-none cursor-pointer"
                style={{ color: accentColor }}
              >
                <CheckCheck className="w-4 h-4" />
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div
            className="mb-4 p-4 rounded-xl text-sm font-medium flex items-center justify-between gap-4 border"
            style={{ background: errorBg, borderColor: errorBorder, color: errorTx }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="font-bold text-xs shrink-0 bg-transparent border-none cursor-pointer"
              style={{ color: accentColor }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: emptyIconBg }}>
              <Bell className="w-8 h-8" style={{ color: emptyIconColor }} />
            </div>
            <p className="font-medium" style={{ color: txBody }}>No notifications yet</p>
            <p className="text-sm mt-1" style={{ color: txMuted }}>
              When you get matches or messages, they'll show up here.
            </p>
          </div>
        )}

        {/* ── Notification list ── */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const { Icon, color, bg, actionHint } = notifMeta(notif.type);
              const clickable = isClickable(notif);

              return (
                <div
                  key={notif.id}
                  onClick={() => clickable && handleNotifClick(notif)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-200 group",
                    notif.is_read ? "opacity-70" : "",
                    clickable ? "cursor-pointer" : "cursor-default"
                  )}
                  style={{
                    background: cardBg,
                    borderColor: notif.is_read ? cardBorderRead : cardBorderUnread,
                    boxShadow: notif.is_read ? cardShadow : `${cardShadow}, 0 0 0 1px ${cardRingUnread}`,
                  }}
                  onMouseEnter={(e) => {
                    if (clickable)
                      (e.currentTarget as HTMLElement).style.boxShadow = cardShadowHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = notif.is_read
                      ? cardShadow
                      : `${cardShadow}, 0 0 0 1px ${cardRingUnread}`;
                  }}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200",
                      clickable && "group-hover:scale-110"
                    )}
                    style={{ background: bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: notif.is_read ? txMuted : txPrimary }}>
                      <span className="font-bold">{notif.user}</span>{" "}
                      {notif.text}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium" style={{ color: txMuted }}>
                        {notif.time}
                      </span>
                      {actionHint && !notif.is_read && clickable && (
                        <span
                          className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ color: accentColor }}
                        >
                          {actionHint}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ background: primaryGrad, boxShadow: `0 0 6px ${accentColor}60` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}