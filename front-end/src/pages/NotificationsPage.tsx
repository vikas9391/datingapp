import { useEffect, useState, useCallback, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import { Bell, Heart, Star, MessageCircle, UserPlus, RefreshCw, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";


type NotificationType = "MATCH_CREATED" | "NEW_MESSAGE" | "LIKE_RECEIVED" | "match";

interface ApiNotification {
  id: number;
  type: NotificationType;
  match_id: number | null;
  chat_id: number | null;           // ← serializer returns this directly
  other_user: string | null;        // ← the email of who triggered it
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

function notifMeta(type: NotificationType) {
  switch (type) {
    case "MATCH_CREATED":
    case "match":
      return {
        Icon: Star,
        color: "text-[#00C98B]",
        bg: "bg-[#00C98B]/10",
        defaultText: "It's a match! Start chatting now.",
        actionHint: "Open chat →",
      };
    case "LIKE_RECEIVED":
      return {
        Icon: Heart,
        color: "text-[#0095E0]",
        bg: "bg-[#0095E0]/10",
        defaultText: "liked your profile",
        actionHint: "View in discover →",
      };
    case "NEW_MESSAGE":
      return {
        Icon: MessageCircle,
        color: "text-[#00B4D8]",
        bg: "bg-[#00B4D8]/10",
        defaultText: "sent you a message",
        actionHint: "Open chat →",
      };
    default:
      return {
        Icon: UserPlus,
        color: "text-purple-500",
        bg: "bg-purple-50",
        defaultText: "interacted with your profile",
        actionHint: null,
      };
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapApiToDisplay(n: ApiNotification): DisplayNotification {
  return {
    id: n.id,
    type: n.type,
    user: n.other_user_name ?? n.user ?? n.other_user ?? "Someone",
    text: n.text ?? notifMeta(n.type).defaultText,
    time: timeAgo(n.created_at),
    is_read: n.is_read ?? false,
    chat_id: n.chat_id ?? null,
    match_id: n.match_id ?? null,
    other_user_email: n.other_user ?? null,
  };
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

export default function NotificationsPage({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const cachedName = localStorage.getItem("user_name") || "User";
  const markingAllRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/notifications/all/`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiNotification[] = await res.json();
      setNotifications(data.map(mapApiToDisplay));
    } catch {
      setError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount, then silently mark all read after 1.5s
  useEffect(() => {
    const init = async () => {
      await fetchNotifications();
      setTimeout(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/notifications/read-all/`, {
            method: "POST",
            headers: authHeaders(),
          });
          if (res.ok) setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch { /* silent */ }
      }, 1500);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark single notification read (optimistic)
  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      const res = await fetch(`${API_BASE}/api/notifications/read/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ notification_id: id }),
      });
      if (!res.ok)
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
        );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
    }
  }, []);

  // ── Route logic based on notification type and available IDs ────────────────
  const handleNotifClick = useCallback(
    async (notif: DisplayNotification) => {
      // Mark read first (fire-and-forget)
      if (!notif.is_read) markRead(notif.id);

      switch (notif.type) {
        // ── Match or message: open the specific chat if we have chat_id ──────
        case "MATCH_CREATED":
        case "match":
        case "NEW_MESSAGE":
          if (notif.chat_id) {
            // Navigate directly into the chat conversation
            navigate(`/chats/${notif.chat_id}`);
          } else {
            // Fallback: go to chats list if chat_id missing
            navigate("/chats");
          }
          break;

        // ── Like received: go to home (discover/swipe deck) ─────────────────
        // We can't deep-link to a specific card without HomePage changes,
        // but we pass the email as a query param so HomePage CAN use it if ready.
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

  // ── Mark all read ──────────────────────────────────────────────────────────
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
      const res = await fetch(`${API_BASE}/api/notifications/read-all/`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // Roll back optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) =>
          capturedUnreadIds.includes(n.id) ? { ...n, is_read: false } : n
        )
      );
      setError("Failed to mark all as read. Please try again.");
    } finally {
      markingAllRef.current = false;
      setMarkingAll(false);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Determine if a notification card is clickable ─────────────────────────
  const isClickable = (notif: DisplayNotification): boolean => {
    switch (notif.type) {
      case "MATCH_CREATED":
      case "match":
      case "NEW_MESSAGE":
        return true; // always clickable — worst case goes to /chats list
      case "LIKE_RECEIVED":
        return true; // always clickable — goes to /home
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-10">
      <TopBar onLogout={onLogout} userName={cachedName} />

      <main className="container mx-auto max-w-3xl px-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8 pt-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-white text-xs font-bold",
                  PRIMARY_GRADIENT
                )}
              >
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40"
              aria-label="Refresh notifications"
            >
              <RefreshCw
                className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")}
              />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#0095E0] hover:underline disabled:opacity-50 transition-opacity"
              >
                <CheckCheck className="w-4 h-4" />
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 font-bold text-xs shrink-0"
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
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">
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
                    "flex items-center gap-4 p-5 rounded-2xl border shadow-sm",
                    "hover:shadow-md transition-all duration-300 group",
                    notif.is_read
                      ? "bg-white border-gray-100 opacity-70"
                      : "bg-white border-[#0095E0]/20 ring-1 ring-[#0095E0]/10",
                    clickable ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200",
                      bg,
                      clickable && "group-hover:scale-110"
                    )}
                  >
                    <Icon className={cn("w-6 h-6", color)} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate",
                        notif.is_read ? "text-gray-500" : "text-gray-900"
                      )}
                    >
                      <span className="font-bold">{notif.user}</span>{" "}
                      {notif.text}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 font-medium">
                        {notif.time}
                      </span>
                      {/* Action hint fades in on hover for unread */}
                      {actionHint && !notif.is_read && clickable && (
                        <span className="text-[10px] font-semibold text-[#0095E0] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {actionHint}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        PRIMARY_GRADIENT,
                        "shadow-sm group-hover:scale-125 transition-transform"
                      )}
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