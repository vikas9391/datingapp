import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Send,
  Flag,
  UserX,
  ChevronLeft,
  X,
  ShieldAlert,
  CheckCircle,
  Instagram,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeContext";

/* ---------------- TYPES ---------------- */

const API_BASE = import.meta.env.VITE_API_BASE;
const WS_BASE = API_BASE.replace(/^http/, "ws");

interface ChatUser {
  chat_id: number;
  match_id?: string;
  status?: string;
  created_at?: string;
  email: string;
  first_name: string | null;
  profile_photo: string | null;
  last_message?: string;
  unread_count?: number;
  is_blocked?: boolean;
  user_email?: string;
  age?: number;
  instagram_id?: string;
  bio?: string;
  location?: string;
  job?: string;
  interests?: string[];
}

interface Message {
  id: number | string;
  sender: string;
  receiver: string;
  content: string;
  created_at?: string;
  is_read?: boolean;
  read_at?: string | null;
  status?: "sending" | "sent" | "error";
}

interface ChatsPageProps {
  onLogout?: () => void;
}

const REPORT_REASONS = [
  { id: "inappropriate", label: "Nudity or sexual activity" },
  { id: "harassment",    label: "Hate speech or symbols" },
  { id: "spam",          label: "Scam or fraud" },
  { id: "harassment",    label: "Bullying or harassment" },
  { id: "fake",          label: "Pretending to be someone else" },
  { id: "spam",          label: "Sale of illegal or regulated goods" },
  { id: "inappropriate", label: "Violence or dangerous organizations" },
  { id: "other",         label: "The problem isn't listed here" },
];

/* ---------------- HELPERS ---------------- */

const formatTime = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

/* ---------------- SORT HELPER ---------------- */
const sortChats = (list: ChatUser[]): ChatUser[] =>
  [...list].sort((a, b) => {
    const aUnread = a.unread_count || 0;
    const bUnread = b.unread_count || 0;
    if (bUnread !== aUnread) return bUnread - aUnread;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

/* ---------------- FLOAT CHAT TO TOP ---------------- */
const floatToTop = (list: ChatUser[], chatId: number): ChatUser[] => {
  const idx = list.findIndex((c) => c.chat_id === chatId);
  if (idx <= 0) return list;
  const copy = [...list];
  const [item] = copy.splice(idx, 1);
  return [item, ...copy];
};

/* ---------------- BACKGROUND DOODLE ---------------- */
const DenseDoodleBackground = ({ stroke }: { stroke: string }) => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: "transparent" }}>
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ultra-dense-doodles" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={stroke} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12">
            <path d="M10 10 L 15 20 L 5 20 Z" />
            <circle cx="25" cy="10" r="3" />
            <path d="M5 30 Q 10 25, 15 30 T 25 30" />
            <path d="M35 15 l 5 5 l -5 5 l -5 -5 Z" />
            <path d="M50 10 c -2 -2 -6 -2 -8 0 c -2 2 -2 6 0 8 l 8 8 l 8 -8 c 2 -2 2 -6 0 -8 c -2 -2 -6 -2 -8 0" transform="scale(0.5) translate(100, 20)" />
            <path d="M60 25 h 10 a 3 3 0 0 1 0 6 h -10 a 3 3 0 0 1 0 -6" />
            <path d="M75 10 v 10 m -5 -5 h 10" />
            <path d="M10 50 h 10 v 8 h -10 Z M 12 50 v -2 h 2 v 2" />
            <path d="M30 55 l 5 5 m 0 -5 l -5 5" />
            <path d="M5 65 c 3 0 3 -6 0 -6 c -3 0 -3 6 0 6 m 6 0 c 3 0 3 -6 0 -6 c -3 0 -3 6 0 6" />
            <path d="M50 50 v 8 h 4 v 4 h 2 v -4 h 4 v -2 h -4 v -6 Z" />
            <path d="M70 50 l 5 -8 l 5 8" />
            <path d="M60 70 h 8 v 6 h -8 Z" />
            <path d="M45 70 q 3 -6 6 0" />
            <circle cx="40" cy="40" r="1" fill={stroke} stroke="none" opacity="0.4" />
            <circle cx="10" cy="40" r="0.5" fill={stroke} stroke="none" opacity="0.4" />
            <circle cx="70" cy="35" r="1" fill={stroke} stroke="none" opacity="0.4" />
            <path d="M20 5 L 22 8" strokeWidth="0.5" />
            <path d="M65 65 L 68 62" strokeWidth="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ultra-dense-doodles)" />
    </svg>
  </div>
);

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function ChatsPage({ onLogout }: ChatsPageProps) {
  const { isDark } = useTheme();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [chats, setChats] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isOnlineMap, setIsOnlineMap] = useState<Record<string, boolean>>({});

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [reportStep, setReportStep] = useState<"reason" | "details" | "success">("reason");
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; messageId: number | string; isSender: boolean;
  } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserEmail = localStorage.getItem("user_email")?.toLowerCase() ?? "";
  const cachedName = localStorage.getItem("user_name") || "User";
  const activeChat = chats.find((c) => c.chat_id === selectedChat);

  /* ─── Theme tokens ─── */
  const pageBg          = isDark ? "#0d0d0d"  : "#f8faff";
  const panelBg         = isDark ? "#1c1c1c"  : "#ffffff";
  const panelBorder     = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.08)";
  const panelShadow     = isDark ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.06)";
  const headerBg        = isDark ? "rgba(28,28,28,0.96)"   : "rgba(255,255,255,0.96)";
  const headerBorder    = isDark ? "rgba(249,115,22,0.08)" : "#f3f4f6";
  const txPrimary       = isDark ? "#f0e8de"  : "#1e293b";
  const txBody          = isDark ? "#c4a882"  : "#374151";
  const txMuted         = isDark ? "#8a6540"  : "#9ca3af";
  const accentColor     = isDark ? "#f97316"  : "#1d4ed8";
  const accentEmber     = isDark ? "#fb923c"  : "#3b82f6";
  const accentGrad      = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const avatarGrad      = accentGrad;
  const unreadDot       = isDark ? "#fbbf24"  : "#f59e0b";
  const unreadBadgeBg   = isDark ? "#fbbf24"  : "#f59e0b";
  const selectedChatBg  = isDark ? "rgba(249,115,22,0.06)" : "rgba(29,78,216,0.04)";
  const selectedChatRing = isDark ? "rgba(249,115,22,0.2)" : "rgba(29,78,216,0.15)";
  const selectedChatBar  = isDark ? "#f97316" : "#1d4ed8";
  const selectedAvatarBorder = isDark ? "#fb923c" : "#3b82f6";
  const selectedMsgColor = isDark ? "#fb923c" : "#1d4ed8";
  const searchBg        = isDark ? "rgba(249,115,22,0.04)" : "#f9fafb";
  const searchBorder    = isDark ? "rgba(249,115,22,0.12)" : "transparent";
  const searchFocusBg   = isDark ? "rgba(249,115,22,0.06)" : "#ffffff";
  const searchFocusBorder = isDark ? "rgba(249,115,22,0.3)" : "rgba(29,78,216,0.3)";
  const searchFocusRing = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.08)";
  const sectionLabel    = isDark ? "#8a6540"  : "#9ca3af";
  const doodleStroke    = isDark ? "#f97316"  : "#1d4ed8";
  const doodleBg        = isDark ? "#111111"  : "#f8fbfb";
  const msgBubbleMe     = isDark
    ? "linear-gradient(135deg,#f97316,#fb923c)"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const msgBubbleThem   = isDark ? "#2a2a2a"  : "#ffffff";
  const msgThemBorder   = isDark ? "rgba(249,115,22,0.1)"  : "#f3f4f6";
  const msgThemText     = isDark ? "#f0e8de"  : "#1e293b";
  const msgTimeColor    = isDark ? "#4a3520"  : "rgba(100,116,139,0.8)";
  const dateLabelBg     = isDark ? "rgba(28,28,28,0.9)"   : "rgba(255,255,255,0.9)";
  const dateLabelBorder = isDark ? "rgba(249,115,22,0.1)" : "#f3f4f6";
  const dateLabelText   = isDark ? "#8a6540"  : "#9ca3af";
  const inputWrapBg     = isDark ? "#2a2a2a"  : "#f9fafb";
  const inputWrapBorder = isDark ? "rgba(249,115,22,0.14)" : "#e2e8f0";
  const inputWrapFocusBorder = isDark ? "rgba(249,115,22,0.4)" : "rgba(29,78,216,0.35)";
  const inputWrapFocusRing   = isDark ? "rgba(249,115,22,0.08)" : "rgba(29,78,216,0.08)";
  const inputColor      = isDark ? "#f0e8de"  : "#1e293b";
  const inputPlaceholder = isDark ? "#4a3520" : "#94a3b8";
  const sendBtnActive   = accentGrad;
  const sendBtnInactive = isDark ? "#2a2a2a"  : "#e2e8f0";
  const sendBtnInactiveTx = isDark ? "#4a3520" : "#94a3b8";
  const blockedBg       = isDark ? "#2a2a2a"  : "#f9fafb";
  const blockedBorder   = isDark ? "rgba(249,115,22,0.14)" : "#e2e8f0";
  const blockedIconBg   = isDark ? "rgba(249,115,22,0.1)"  : "#e5e7eb";
  const blockedIconColor = isDark ? "#8a6540" : "#6b7280";
  const blockedText     = isDark ? "#c4a882"  : "#374151";
  const menuBg          = isDark ? "#1c1c1c"  : "#ffffff";
  const menuBorder      = isDark ? "rgba(249,115,22,0.12)" : "#f3f4f6";
  const menuDivider     = isDark ? "rgba(249,115,22,0.08)" : "#f3f4f6";
  const menuItemText    = isDark ? "#c4a882"  : "#374151";
  const contextBg       = isDark ? "#1c1c1c"  : "#ffffff";
  const contextBorder   = isDark ? "rgba(249,115,22,0.1)" : "#f3f4f6";
  const emptyIconBg     = isDark ? "rgba(249,115,22,0.06)" : "#f0f9ff";
  const emptyIconColor  = isDark ? "#4a3520"  : "#93c5fd";
  const typingActiveColor = isDark ? "#fb923c" : "#1d4ed8";
  const onlineColor     = isDark ? "#fb923c"  : "#1d4ed8";
  const profileHeaderGrad = accentGrad;
  const interestTagBg   = isDark ? "rgba(249,115,22,0.08)" : "#f3f4f6";
  const interestTagText = isDark ? "#c4a882"  : "#374151";
  const instaBg         = isDark ? "rgba(249,115,22,0.04)" : "linear-gradient(to right,#fdf2f8,#fff7ed)";
  const instaBorder     = isDark ? "rgba(249,115,22,0.12)" : "#fbcfe8";
  const reportTextareaFocus = isDark ? "rgba(249,115,22,0.2)" : "rgba(29,78,216,0.2)";
  const reportSubmitBtn = isDark ? "#f97316" : "#1d4ed8";
  const reportSubmitHover = isDark ? "#ea580c" : "#1e40af";
  const reportItemHover = isDark ? "rgba(249,115,22,0.04)" : "#f8faff";
  const reportItemHoverText = isDark ? "#fb923c" : "#1d4ed8";
  const reportChevronHover = isDark ? "#fb923c" : "#3b82f6";

  /* auto-scroll */
  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages, selectedChat]);

  /* close context menu on outside click */
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleMessageContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg.id, isSender: msg.sender === currentUserEmail });
  };

  /* ---------------------------------------------------------------
     MARK READ HELPER
  --------------------------------------------------------------- */
  const markChatAsRead = async (chatId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/chats/${chatId}/read/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("MARK READ ERROR:", err);
    }
    setChats((prev) => prev.map((c) => (c.chat_id === chatId ? { ...c, unread_count: 0 } : c)));
  };

  /* ---------------- 1. FETCH CHATS ---------------- */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/chats/matched/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        const chatsArray = Array.isArray(data) ? data : data.chats || [];

        const normalizedChats: ChatUser[] = chatsArray.map((c: any) => ({
          ...c,
          email: c.email.toLowerCase(),
          is_blocked: c.blocked_by_me || false,
        }));

        setChats(sortChats(normalizedChats));

        if (normalizedChats.length > 0 && normalizedChats[0].user_email) {
          localStorage.setItem("user_email", normalizedChats[0].user_email);
        }
      } catch (err) {
        console.error("FETCH CHATS ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  /* ---------------- 2. PRESENCE SOCKET ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "presence" && data.user_email) {
        setIsOnlineMap((prev) => ({ ...prev, [data.user_email.toLowerCase()]: data.is_online }));
      }
    };
    return () => ws.close();
  }, []);

  /* ---------------- 3. LOAD MESSAGE HISTORY ---------------- */
  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/chats/${selectedChat}/messages/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load messages");

        const data: Record<string, Message[]> = await res.json();

        const flatMessages: Message[] = Object.entries(data).flatMap(
          ([date, msgs]: [string, any[]]) =>
            msgs
              .filter((m) => (m.content || "").trim() !== "")
              .map((m) => ({ ...m, created_at: m.created_at || `${date}T00:00:00Z` }))
        );

        setMessages(flatMessages);

        const lastMsg = flatMessages.length > 0 ? flatMessages[flatMessages.length - 1].content : undefined;

        await markChatAsRead(selectedChat);

        setChats((prev) =>
          sortChats(
            prev.map((c) =>
              c.chat_id === selectedChat
                ? { ...c, last_message: lastMsg ?? c.last_message, unread_count: 0 }
                : c
            )
          )
        );
      } catch (err) {
        console.error("LOAD MESSAGES ERROR:", err);
      }
    };

    loadMessages();
    setTypingUser("");
    setIsMenuOpen(false);
  }, [selectedChat]);

  /* ---------------- 4. CHAT WEBSOCKET ---------------- */
  useEffect(() => {
    if (!selectedChat) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/ws/chat/${selectedChat}/?token=${token}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "typing") {
        setTypingUser(data.is_typing ? data.user_email : null);
        return;
      }

      if (data.type === "error" && data.code === "blocked") {
        setChats((prev) => prev.map((c) => c.chat_id === selectedChat ? { ...c, is_blocked: true } : c));
        setMessages((prev) => prev.filter((m) => !m.id.toString().startsWith("temp-")));
        return;
      }

      if (data.type !== "message" || !(data.content || "").trim()) return;

      const incomingMessage: Message = {
        id: data.id ?? crypto.randomUUID(),
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        created_at: data.created_at ?? new Date().toISOString(),
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMessage.id)) return prev;

        if (incomingMessage.sender === currentUserEmail) {
          const temp = prev.find(
            (m) => m.content === incomingMessage.content && m.id.toString().startsWith("temp-")
          );
          if (temp) return prev.map((m) => (m.id === temp.id ? incomingMessage : m));
        }

        return [...prev, incomingMessage];
      });

      markChatAsRead(selectedChat);

      setChats((prev) =>
        floatToTop(
          prev.map((c) =>
            c.chat_id === selectedChat
              ? { ...c, last_message: incomingMessage.content, unread_count: 0 }
              : c
          ),
          selectedChat
        )
      );
    };

    return () => { ws.close(); socketRef.current = null; };
  }, [selectedChat]);

  /* ---------------- 5. SEND MESSAGE ---------------- */
  const sendTypingEvent = (isTyping: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChat || activeChat.is_blocked) return;

    const content = messageInput.trim();
    setMessageInput("");
    sendTypingEvent(false);

    const clientId = `temp-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        sender: currentUserEmail,
        receiver: activeChat.email,
        content,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    setChats((prev) =>
      floatToTop(
        prev.map((c) =>
          c.chat_id === activeChat.chat_id ? { ...c, last_message: content, unread_count: 0 } : c
        ),
        activeChat.chat_id
      )
    );

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "message", content, client_id: clientId }));
    }
  };

  /* ---------------- BLOCK / REPORT ---------------- */
  const handleBlockClick = () => { setIsMenuOpen(false); setShowBlockModal(true); };

  const confirmBlock = async () => {
    if (!activeChat) return;
    setChats((prev) => prev.map((c) => c.chat_id === activeChat.chat_id ? { ...c, is_blocked: true } : c));
    setShowBlockModal(false);
    try {
      await fetch(`${API_BASE}/api/users/block/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({ email: activeChat.email }),
      });
    } catch (err) { console.error(err); }
  };

  const confirmUnblock = async () => {
    if (!activeChat) return;
    setChats((prev) => prev.map((c) => c.chat_id === activeChat.chat_id ? { ...c, is_blocked: false } : c));
    try {
      await fetch(`${API_BASE}/api/users/unblock/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({ email: activeChat.email }),
      });
    } catch (err) { console.error(err); }
  };

  const handleReportClick = () => {
    setIsMenuOpen(false);
    setReportStep("reason");
    setReportDescription("");
    setSelectedReason("");
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!activeChat) return;
    const reasonLabel = REPORT_REASONS.find((r) => r.id === selectedReason)?.label ?? selectedReason;
    try {
      const res = await fetch(`${API_BASE}/api/reports/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: JSON.stringify({
          chat_id: activeChat.chat_id,
          reason: selectedReason,
          description: reportDescription.trim() || reasonLabel,
        }),
      });
      if (!res.ok) { const errorData = await res.json(); console.error("Report failed:", JSON.stringify(errorData)); return; }
    } catch (err) { console.error("Report error:", err); return; }
    setReportStep("success");
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    if (!msg.created_at || !(msg.content || "").trim()) return acc;
    const key = msg.created_at.split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div className="h-screen flex flex-col overflow-hidden transition-colors duration-300" style={{ background: pageBg }}>
      <div className="flex-none z-[100] relative" style={{ background: panelBg, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <TopBar onLogout={onLogout} userName={cachedName} />
      </div>

      <main className="flex-1 container mx-auto max-w-7xl pt-20 pb-0 md:pb-6 px-0 md:px-4 lg:px-8 overflow-hidden h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 h-full">

          {/* ── LEFT: CHAT LIST ── */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col h-full md:rounded-[32px] md:shadow-lg overflow-hidden",
              selectedChat ? "hidden lg:flex" : "flex w-full"
            )}
            style={{ background: panelBg, border: `1px solid ${panelBorder}`, boxShadow: panelShadow }}
          >
            <div
              className="flex flex-col gap-4 px-4 md:px-6 pt-4 md:pt-6 pb-2 flex-none z-10"
              style={{ background: panelBg }}
            >
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: txPrimary }}>Messages</h1>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: txMuted }} />
                <input
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-2xl outline-none text-sm transition-all"
                  style={{
                    background: searchBg,
                    border: `1px solid ${searchBorder}`,
                    color: txPrimary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = searchFocusBg;
                    e.currentTarget.style.borderColor = searchFocusBorder;
                    e.currentTarget.style.boxShadow = `0 0 0 4px ${searchFocusRing}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = searchBg;
                    e.currentTarget.style.borderColor = searchBorder;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="pb-1">
                <p className="text-xs font-bold uppercase tracking-widest pl-2" style={{ color: sectionLabel }}>Recent Chats</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1 md:space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
              {chats.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-48 text-sm" style={{ color: txMuted }}>
                  <p>No connections yet.</p>
                </div>
              )}

              {chats.map((chat) => {
                const unread = chat.unread_count || 0;
                const isUnread = unread > 0 && chat.chat_id !== selectedChat;
                const isSelected = selectedChat === chat.chat_id;

                return (
                  <button
                    key={chat.chat_id}
                    onClick={() => setSelectedChat(Number(chat.chat_id))}
                    className="w-full flex items-center gap-3 md:gap-4 p-3 rounded-xl md:rounded-2xl transition-all duration-200 group relative overflow-hidden text-left"
                    style={{
                      background: isSelected ? selectedChatBg : 'transparent',
                      boxShadow: isSelected ? `0 0 0 1px ${selectedChatRing}` : 'none',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(249,115,22,0.03)' : '#f9fafb'; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {isSelected && (
                      <div
                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full hidden md:block"
                        style={{ background: selectedChatBar }}
                      />
                    )}

                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all relative"
                      style={{ borderColor: isSelected ? selectedAvatarBorder : 'transparent' }}
                    >
                      {chat.profile_photo ? (
                        <img src={chat.profile_photo} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full text-white flex items-center justify-center font-bold text-base md:text-lg"
                          style={{ background: avatarGrad }}
                        >
                          {(chat.first_name || chat.email)[0].toUpperCase()}
                        </div>
                      )}
                      {isUnread && (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full shadow-sm animate-pulse"
                          style={{ background: unreadDot, borderColor: panelBg }}
                        />
                      )}
                    </div>

                    <div className="flex flex-col items-start overflow-hidden flex-1 pl-1">
                      <div className="flex justify-between w-full items-center">
                        <span
                          className="truncate text-sm md:text-[15px]"
                          style={{
                            color: txPrimary,
                            fontWeight: isUnread ? 800 : 700,
                          }}
                        >
                          {chat.first_name || chat.email}
                        </span>
                        {isUnread && (
                          <span
                            className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                            style={{ background: unreadBadgeBg }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs truncate w-full text-left font-medium mt-0.5"
                        style={{ color: isSelected ? selectedMsgColor : isDark ? "#8a6540" : "#64748b" }}
                      >
                        {chat.last_message || (isUnread ? "New message" : "Tap to chat")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: CHAT WINDOW ── */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col h-full md:rounded-[32px] md:shadow-lg overflow-hidden relative transition-all duration-300 w-full fixed inset-0 z-50 lg:static lg:w-auto lg:h-auto",
              selectedChat ? "flex" : "hidden lg:flex"
            )}
            style={{ background: panelBg, border: `1px solid ${panelBorder}`, boxShadow: panelShadow }}
          >
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div
                  className="h-16 md:h-20 px-4 md:px-6 border-b flex items-center z-20 sticky top-0 justify-between lg:shadow-none"
                  style={{ background: headerBg, borderColor: headerBorder, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="lg:hidden p-2 -ml-2 rounded-full transition-colors"
                      style={{ color: txMuted }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="flex items-center gap-3 hover:bg-opacity-80 p-2 -ml-2 rounded-xl transition-colors group"
                      onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.04)' : '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border shadow-sm transition-colors"
                        style={{ borderColor: isDark ? 'rgba(249,115,22,0.15)' : '#f3f4f6' }}
                      >
                        {activeChat.profile_photo ? (
                          <img src={activeChat.profile_photo} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full text-white flex items-center justify-center font-bold text-sm md:text-base"
                            style={{ background: avatarGrad }}
                          >
                            {(activeChat.first_name || activeChat.email)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <h3 className="font-bold text-base md:text-lg leading-tight" style={{ color: txPrimary }}>
                          {activeChat.first_name || activeChat.email}
                        </h3>
                        <span
                          className="text-[10px] md:text-[11px] font-bold tracking-wide uppercase"
                          style={{
                            color: typingUser
                              ? typingActiveColor
                              : isOnlineMap[activeChat.email?.toLowerCase()]
                              ? onlineColor
                              : txMuted,
                            animation: typingUser ? 'pulse 1s infinite' : 'none',
                          }}
                        >
                          {typingUser === activeChat.email
                            ? "Typing..."
                            : isOnlineMap[activeChat.email?.toLowerCase()]
                            ? "Active Now"
                            : "Offline"}
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 rounded-full transition-colors"
                      style={{ color: txMuted }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.06)' : '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                        <div
                          className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-200"
                          style={{ background: menuBg, border: `1px solid ${menuBorder}` }}
                        >
                          {activeChat.is_blocked ? (
                            <button
                              onClick={confirmUnblock}
                              className="w-full text-left px-5 py-3 text-sm font-medium flex items-center gap-3 transition-colors"
                              style={{ color: menuItemText }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(34,197,94,0.06)' : '#f0fdf4'; (e.currentTarget as HTMLElement).style.color = '#16a34a'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = menuItemText; }}
                            >
                              <ShieldAlert className="w-4 h-4" /> Unblock
                            </button>
                          ) : (
                            <button
                              onClick={handleBlockClick}
                              className="w-full text-left px-5 py-3 text-sm font-medium flex items-center gap-3 transition-colors"
                              style={{ color: menuItemText }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = menuItemText; }}
                            >
                              <UserX className="w-4 h-4" /> Block
                            </button>
                          )}
                          <div className="h-px my-1 mx-4" style={{ background: menuDivider }} />
                          <button
                            onClick={handleReportClick}
                            className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors"
                            style={{ color: menuItemText }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(249,115,22,0.06)' : '#fff7ed'; (e.currentTarget as HTMLElement).style.color = '#ea580c'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = menuItemText; }}
                          >
                            <Flag className="w-4 h-4" /> Report
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 relative overflow-hidden" style={{ background: doodleBg }}>
                  <DenseDoodleBackground stroke={doodleStroke} />
                  <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 z-10">
                    <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-h-full">
                      {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date} className="space-y-4 md:space-y-6">
                          <div className="flex justify-center sticky top-0 z-20">
                            <span
                              className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm backdrop-blur-sm"
                              style={{ color: dateLabelText, background: dateLabelBg, border: `1px solid ${dateLabelBorder}` }}
                            >
                              {formatDateLabel(date)}
                            </span>
                          </div>
                          {msgs.map((m) => {
                            const isMe = m.sender === currentUserEmail;
                            if (!(m.content || "").trim()) return null;
                            return (
                              <div
                                key={m.id}
                                className={cn(
                                  "max-w-[85%] lg:max-w-[70%] flex flex-col gap-1",
                                  isMe ? "ml-auto items-end" : "items-start"
                                )}
                              >
                                <div
                                  onContextMenu={(e) => handleMessageContextMenu(e, m)}
                                  className={cn(
                                    "px-4 py-2.5 md:px-5 md:py-3.5 text-sm md:text-[15px] leading-relaxed shadow-sm break-words cursor-pointer",
                                    isMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
                                  )}
                                  style={isMe
                                    ? { background: msgBubbleMe, color: '#ffffff' }
                                    : { background: msgBubbleThem, color: msgThemText, border: `1px solid ${msgThemBorder}` }
                                  }
                                >
                                  {m.content}
                                </div>
                                <span
                                  className="text-[9px] md:text-[10px] font-bold px-1 uppercase tracking-wide"
                                  style={{ color: msgTimeColor }}
                                >
                                  {formatTime(m.created_at)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 md:p-6 z-20 relative" style={{ background: panelBg, borderTop: `1px solid ${headerBorder}` }}>
                  {activeChat.is_blocked ? (
                    <div
                      className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl text-center"
                      style={{ background: blockedBg, border: `1px solid ${blockedBorder}` }}
                    >
                      <div
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-2"
                        style={{ background: blockedIconBg }}
                      >
                        <UserX className="w-4 h-4 md:w-5 md:h-5" style={{ color: blockedIconColor }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: blockedText }}>
                        You blocked {activeChat.first_name || activeChat.email}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-all shadow-inner"
                      style={{ background: inputWrapBg, border: `1px solid ${inputWrapBorder}` }}
                      onFocusCapture={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = inputWrapFocusBorder;
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 4px ${inputWrapFocusRing}`;
                      }}
                      onBlurCapture={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = inputWrapBorder;
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      <input
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          sendTypingEvent(true);
                          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                          typingTimeoutRef.current = setTimeout(() => sendTypingEvent(false), 1500);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                        }}
                        className="flex-1 bg-transparent px-4 py-2.5 md:px-5 md:py-3 focus:outline-none text-sm font-medium"
                        style={{ color: inputColor }}
                        placeholder="Type a message..."
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className="p-2.5 md:p-3 rounded-full transition-all duration-200 m-1 flex-shrink-0"
                        style={{
                          background: messageInput.trim() ? sendBtnActive : sendBtnInactive,
                          color: messageInput.trim() ? '#ffffff' : sendBtnInactiveTx,
                          cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <Send className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8" style={{ background: panelBg }}>
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse"
                  style={{ background: emptyIconBg }}
                >
                  <MessageCircle className="w-10 h-10 md:w-14 md:h-14" style={{ color: emptyIconColor }} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: txPrimary }}>No chat selected</h3>
                <p className="max-w-xs text-sm leading-relaxed font-medium px-4" style={{ color: txMuted }}>
                  Choose a connection from the left to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="fixed z-[9999] rounded-xl shadow-xl py-1.5 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: Math.min(contextMenu.y, window.innerHeight - 100),
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            background: contextBg,
            border: `1px solid ${contextBorder}`,
          }}
        >
          <button
            onClick={() => setContextMenu(null)}
            className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors"
            style={{ color: txBody }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.04)' : '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 className="w-4 h-4" style={{ color: txMuted }} /> Delete for me
          </button>
          {contextMenu.isSender && (
            <button
              onClick={() => setContextMenu(null)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 flex items-center gap-2 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.06)' : '#fef2f2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Delete for everyone
            </button>
          )}
        </div>
      )}

      {/* ── Profile Modal ── */}
      {showProfileModal && activeChat && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
          >
            <div className="h-32 relative" style={{ background: profileHeaderGrad }}>
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-8 -mt-12 text-center relative z-10">
              <div
                className="w-24 h-24 rounded-full border-4 shadow-md overflow-hidden mx-auto"
                style={{ borderColor: panelBg, background: panelBg }}
              >
                {activeChat.profile_photo ? (
                  <img src={activeChat.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-3xl"
                    style={{ background: isDark ? 'rgba(249,115,22,0.1)' : '#f0f9ff', color: accentColor }}
                  >
                    {(activeChat.first_name || "U")[0]}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold mt-3" style={{ color: txPrimary }}>
                {activeChat.first_name || activeChat.email}
                {activeChat.age && (
                  <span className="font-normal" style={{ color: txMuted }}>, {activeChat.age}</span>
                )}
              </h2>
              <p className="text-sm font-medium mb-4" style={{ color: accentColor }}>Based on Vibes</p>

              <div
                className="rounded-xl p-3 mb-6 flex items-center justify-between"
                style={{ background: instaBg, border: `1px solid ${instaBorder}` }}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg shadow-sm" style={{ background: panelBg }}>
                    <Instagram className="w-5 h-5 text-pink-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: txMuted }}>Instagram</p>
                    <p className="text-sm font-bold" style={{ color: txPrimary }}>
                      {activeChat.instagram_id || "@not_shared"}
                    </p>
                  </div>
                </div>
                {!activeChat.instagram_id && (
                  <span className="text-xs italic" style={{ color: txMuted }}>Hidden</span>
                )}
              </div>

              <div className="text-left space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: txMuted }}>About</h4>
                <p className="text-sm leading-relaxed italic" style={{ color: txBody }}>
                  "{activeChat.bio || "The world doesn't make any sense to me, Why should I say things that do?"}"
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(activeChat.interests || ["Comedy", "Mountains", "Action"]).map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-bold rounded-lg uppercase"
                      style={{ background: interestTagBg, color: interestTagText }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Block Modal ── */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-[24px] md:rounded-[32px] shadow-2xl max-w-sm w-full p-6 md:p-8 text-center"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-sm">
              <UserX className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold mb-2" style={{ color: txPrimary }}>
              Block this contact?
            </h3>
            <p className="text-xs md:text-sm mb-6 px-2" style={{ color: txMuted }}>
              They won't be able to message you or see your profile.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmBlock}
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 active:scale-[0.98]"
              >
                Block Contact
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="w-full py-3.5 rounded-2xl font-bold transition-colors"
                style={{ background: isDark ? 'rgba(249,115,22,0.08)' : '#f3f4f6', color: txBody }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.14)' : '#e5e7eb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.08)' : '#f3f4f6')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="rounded-[24px] md:rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh]"
            style={{ background: panelBg, border: `1px solid ${panelBorder}` }}
          >
            <div
              className="p-4 md:p-5 flex items-center justify-between sticky top-0 z-10"
              style={{ background: panelBg, borderBottom: `1px solid ${headerBorder}` }}
            >
              <div className="flex items-center gap-2">
                {reportStep === "details" && (
                  <button
                    onClick={() => setReportStep("reason")}
                    className="p-1 -ml-2 rounded-full transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.08)' : '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ChevronLeft className="w-6 h-6" style={{ color: txPrimary }} />
                  </button>
                )}
                <h3 className="text-lg font-bold" style={{ color: txPrimary }}>Report</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 rounded-full transition-colors"
                style={{ background: isDark ? 'rgba(249,115,22,0.06)' : '#f9fafb', color: txMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.12)' : '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.06)' : '#f9fafb')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ background: panelBg }}>
              {reportStep === "reason" && (
                <div className="p-2">
                  <div className="p-4 pb-2">
                    <h4 className="font-bold text-base md:text-lg" style={{ color: txPrimary }}>Select a problem</h4>
                    <p className="text-xs md:text-sm mt-1" style={{ color: txMuted }}>Help us understand what's happening.</p>
                  </div>
                  <div className="space-y-1 mt-2">
                    {REPORT_REASONS.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedReason(r.id); setReportStep("details"); }}
                        className="w-full text-left px-4 py-3.5 md:px-5 md:py-4 flex items-center justify-between group transition-colors"
                        style={{ borderBottom: `1px solid ${headerBorder}`, color: txBody }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = reportItemHover;
                          (e.currentTarget as HTMLElement).style.color = reportItemHoverText;
                          const chevron = (e.currentTarget as HTMLElement).querySelector('svg');
                          if (chevron) (chevron as SVGElement).style.color = reportChevronHover;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = txBody;
                        }}
                      >
                        <span className="font-medium text-sm md:text-base">{r.label}</span>
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" style={{ color: txMuted }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {reportStep === "details" && (
                <div className="p-4 md:p-6">
                  <h4 className="font-bold mb-2 text-sm md:text-base" style={{ color: txPrimary }}>Add details (Optional)</h4>
                  <textarea
                    className="w-full p-3 md:p-4 rounded-2xl outline-none min-h-[120px] text-sm mb-4 md:mb-6 resize-none transition-all"
                    style={{
                      background: isDark ? 'rgba(249,115,22,0.04)' : '#f9fafb',
                      border: `1px solid ${isDark ? 'rgba(249,115,22,0.14)' : '#e2e8f0'}`,
                      color: txPrimary,
                    }}
                    placeholder="Describe what happened..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = reportTextareaFocus;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(249,115,22,0.08)' : 'rgba(29,78,216,0.06)'}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(249,115,22,0.14)' : '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={submitReport}
                    className="w-full py-3.5 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
                    style={{ background: reportSubmitBtn, boxShadow: `0 4px 14px ${accentColor}30` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = reportSubmitHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = reportSubmitBtn)}
                  >
                    Submit Report
                  </button>
                </div>
              )}

              {reportStep === "success" && (
                <div className="flex flex-col items-center justify-center p-8 md:p-10 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 md:mb-6 animate-in zoom-in duration-300">
                    <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-extrabold mb-2" style={{ color: txPrimary }}>
                    Thanks for letting us know
                  </h4>
                  <p className="text-xs md:text-sm mb-6 md:mb-8 max-w-[260px] leading-relaxed" style={{ color: txMuted }}>
                    Your report has been securely submitted.
                  </p>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="w-full py-3.5 font-bold rounded-2xl transition-colors"
                    style={{ background: isDark ? 'rgba(249,115,22,0.08)' : '#f1f5f9', color: txBody }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.14)' : '#e2e8f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? 'rgba(249,115,22,0.08)' : '#f1f5f9')}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}