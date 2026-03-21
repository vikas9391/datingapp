import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Shield, FileText, Sparkles, User, Settings, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { MenuFooterImage } from "@/components/layout/MenuFooterImage";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE;

interface ProfileDropdownProps {
  userName?: string;
  onLogout?: () => void;
}

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

export default function ProfileDropdown({ userName = "User", onLogout }: ProfileDropdownProps) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfilePhoto();
    checkPremiumStatus();
  }, []);

  const fetchProfilePhoto = async () => {
    try {
      const result = await profileService.getProfile();
      if (result.exists && result.data?.photos && result.data.photos.length > 0) {
        setProfilePhoto(result.data.photos[0]);
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const authData = getAuthToken();
      if (!authData) { setIsPremium(false); return; }
      const response = await fetch(`${API_BASE}/api/profile/`, {
        headers: { Authorization: `${authData.type} ${authData.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.premium === true);
      } else {
        setIsPremium(false);
      }
    } catch {
      setIsPremium(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout?.();
    setIsOpen(false);
    navigate("/");
  };

  const initial = userName.charAt(0).toUpperCase();

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    triggerBg: "linear-gradient(135deg, #c2410c, #f97316)",
    triggerRingOpen: "0 0 0 3px rgba(249,115,22,0.4)",
    triggerRingClosed: "0 0 0 2px rgba(249,115,22,0.25)",
    premiumBadge: { background: "linear-gradient(135deg, #fbbf24, #f97316)", border: "1.5px solid #100c04" },
    dropdown: {
      background: "linear-gradient(145deg, #1e1208 0%, #140e05 100%)",
      border: "1px solid rgba(249,115,22,0.25)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.06)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.5) 50%, transparent 90%)",
    headerCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(249,115,22,0.14)" },
    avatarWrap: { background: "linear-gradient(135deg, #c2410c, #f97316)", border: "2px solid rgba(249,115,22,0.4)" },
    userName: { color: "#f0e8de" },
    premiumBadgePill: { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" },
    premiumBadgeIcon: { color: "#fbbf24", fill: "#fbbf24" },
    premiumBadgeText: { color: "#fbbf24" },
    viewProfile: { color: "#8a6540" },
    menuItemColor: "#c4a882",
    menuItemHoverBg: "rgba(249,115,22,0.1)",
    menuItemHoverColor: "#f0e8de",
    menuItemIconWrap: { background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" },
    menuItemIcon: { color: "#fb923c" },
    premiumCtaColor: "#c4a882",
    premiumCtaHoverBg: "rgba(251,191,36,0.1)",
    premiumCtaHoverColor: "#fbbf24",
    premiumCtaIconWrap: { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.28)" },
    premiumCtaIcon: { color: "#fbbf24" },
    premiumCtaBadge: { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" },
    divider: { borderTop: "1px solid rgba(249,115,22,0.1)" },
    secondaryLinkColor: "#8a6540",
    secondaryLinkHoverBg: "rgba(255,255,255,0.04)",
    secondaryLinkHoverColor: "#c4a882",
    secondaryLinkIcon: { color: "#4a3520" },
    logoutColor: "#8a6540",
    logoutHoverBg: "rgba(239,68,68,0.1)",
    logoutHoverColor: "#f87171",
    footerBorder: { border: "1px solid rgba(249,115,22,0.18)" },
    skeletonBg: "rgba(255,255,255,0.04)",
  } : {
    triggerBg: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    triggerRingOpen: "0 0 0 3px rgba(29,78,216,0.35)",
    triggerRingClosed: "0 0 0 2px rgba(29,78,216,0.2)",
    premiumBadge: { background: "linear-gradient(135deg, #fbbf24, #f59e0b)", border: "1.5px solid #ffffff" },
    dropdown: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
      border: "1px solid rgba(29,78,216,0.15)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(29,78,216,0.06)",
    },
    topAccent: "linear-gradient(90deg, transparent 10%, rgba(29,78,216,0.35) 50%, transparent 90%)",
    headerCard: { background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.1)" },
    avatarWrap: { background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", border: "2px solid rgba(29,78,216,0.3)" },
    userName: { color: "#1e293b" },
    premiumBadgePill: { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" },
    premiumBadgeIcon: { color: "#d97706", fill: "#d97706" },
    premiumBadgeText: { color: "#d97706" },
    viewProfile: { color: "#64748b" },
    menuItemColor: "#475569",
    menuItemHoverBg: "rgba(29,78,216,0.08)",
    menuItemHoverColor: "#1e293b",
    menuItemIconWrap: { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.15)" },
    menuItemIcon: { color: "#1d4ed8" },
    premiumCtaColor: "#475569",
    premiumCtaHoverBg: "rgba(245,158,11,0.08)",
    premiumCtaHoverColor: "#d97706",
    premiumCtaIconWrap: { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.22)" },
    premiumCtaIcon: { color: "#d97706" },
    premiumCtaBadge: { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#d97706" },
    divider: { borderTop: "1px solid rgba(29,78,216,0.08)" },
    secondaryLinkColor: "#94a3b8",
    secondaryLinkHoverBg: "rgba(29,78,216,0.05)",
    secondaryLinkHoverColor: "#475569",
    secondaryLinkIcon: { color: "#cbd5e1" },
    logoutColor: "#94a3b8",
    logoutHoverBg: "rgba(239,68,68,0.06)",
    logoutHoverColor: "#ef4444",
    footerBorder: { border: "1px solid rgba(29,78,216,0.12)" },
    skeletonBg: "rgba(29,78,216,0.04)",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 ml-2 rounded-full font-bold flex items-center justify-center text-sm overflow-hidden relative transition-all duration-200"
        style={{
          background: s.triggerBg,
          boxShadow: isOpen ? s.triggerRingOpen : s.triggerRingClosed,
          color: "white",
        }}
      >
        {profilePhoto ? (
          <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
        {isPremium && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={s.premiumBadge}
          >
            <Crown className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 rounded-3xl py-2 z-[100] origin-top-right overflow-hidden transition-all duration-300"
            style={s.dropdown}
          >
            {/* Top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: s.topAccent }}
            />

            {/* Header */}
            <div
              className="px-5 py-4 mx-2 mb-1 rounded-2xl transition-all duration-300"
              style={s.headerCard}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full font-bold flex items-center justify-center text-lg overflow-hidden shrink-0 relative transition-all duration-300"
                  style={s.avatarWrap}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: "white" }}>{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold truncate transition-colors duration-300" style={s.userName}>
                      {userName}
                    </p>
                    {isPremium && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-300"
                        style={s.premiumBadgePill}
                      >
                        <Crown className="w-2.5 h-2.5" style={s.premiumBadgeIcon} />
                        <span className="text-[9px] font-black uppercase tracking-wider" style={s.premiumBadgeText}>
                          Premium
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium transition-colors duration-300" style={s.viewProfile}>
                    View your profile
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-0.5">
              {[
                { to: "/profile",  Icon: User,     label: "Profile" },
                { to: "/settings", Icon: Settings, label: "Settings" },
              ].map(({ to, Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left"
                  style={{ color: s.menuItemColor }}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = s.menuItemHoverBg;
                    (e.currentTarget as HTMLElement).style.color = s.menuItemHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = s.menuItemColor;
                  }}
                >
                  <div
                    className="p-1.5 rounded-xl transition-all duration-300"
                    style={s.menuItemIconWrap}
                  >
                    <Icon className="w-4 h-4" style={s.menuItemIcon} />
                  </div>
                  {label}
                </Link>
              ))}

              {/* Premium CTA — free users only */}
              {isPremium === null ? (
                <div
                  className="mx-2 h-12 rounded-2xl animate-pulse"
                  style={{ background: s.skeletonBg }}
                />
              ) : !isPremium ? (
                <Link
                  to="/premium"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left group"
                  style={{ color: s.premiumCtaColor }}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = s.premiumCtaHoverBg;
                    (e.currentTarget as HTMLElement).style.color = s.premiumCtaHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = s.premiumCtaColor;
                  }}
                >
                  <div
                    className="p-1.5 rounded-xl transition-all duration-300"
                    style={s.premiumCtaIconWrap}
                  >
                    <Sparkles className="w-4 h-4" style={s.premiumCtaIcon} />
                  </div>
                  <span className="flex-1">Get Premium</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300"
                    style={s.premiumCtaBadge}
                  >
                    NEW
                  </span>
                </Link>
              ) : null}

              <div className="my-1 mx-2" style={s.divider} />

              {[
                { to: "/privacy", Icon: Shield,   label: "Privacy Policy" },
                { to: "/terms",   Icon: FileText, label: "Terms of Service" },
              ].map(({ to, Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left"
                  style={{ color: s.secondaryLinkColor }}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = s.secondaryLinkHoverBg;
                    (e.currentTarget as HTMLElement).style.color = s.secondaryLinkHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = s.secondaryLinkColor;
                  }}
                >
                  <Icon className="w-4 h-4 transition-colors duration-300" style={s.secondaryLinkIcon} />
                  {label}
                </Link>
              ))}

              <div className="my-1 mx-2" style={s.divider} />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left mb-1"
                style={{ color: s.logoutColor }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = s.logoutHoverBg;
                  (e.currentTarget as HTMLElement).style.color = s.logoutHoverColor;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = s.logoutColor;
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              {/* Decorative footer image */}
              <div
                className="relative h-28 w-full rounded-2xl overflow-hidden mt-2 transition-all duration-300"
                style={s.footerBorder}
              >
                <MenuFooterImage />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}