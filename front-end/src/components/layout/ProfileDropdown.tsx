import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Shield, FileText, Sparkles, User, Settings, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { profileService } from "@/services/profileService";
import { MenuFooterImage } from "@/components/layout/MenuFooterImage";

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 ml-2 rounded-full font-bold flex items-center justify-center text-sm overflow-hidden relative transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, #c2410c, #f97316)",
          boxShadow: isOpen
            ? "0 0 0 3px rgba(249,115,22,0.4)"
            : "0 0 0 2px rgba(249,115,22,0.25)",
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
            style={{
              background: "linear-gradient(135deg, #fbbf24, #f97316)",
              border: "1.5px solid #100c04",
            }}
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
            className="absolute right-0 mt-3 w-80 rounded-3xl py-2 z-[100] origin-top-right overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #1e1208 0%, #140e05 100%)",
              border: "1px solid rgba(249,115,22,0.25)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.06)",
            }}
          >
            {/* Top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.5) 50%, transparent 90%)",
              }}
            />

            {/* Header */}
            <div
              className="px-5 py-4 mx-2 mb-1 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(249,115,22,0.14)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full font-bold flex items-center justify-center text-lg overflow-hidden shrink-0 relative"
                  style={{
                    background: "linear-gradient(135deg, #c2410c, #f97316)",
                    border: "2px solid rgba(249,115,22,0.4)",
                  }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: "white" }}>{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold truncate" style={{ color: "#f0e8de" }}>
                      {userName}
                    </p>
                    {isPremium && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(251,191,36,0.15)",
                          border: "1px solid rgba(251,191,36,0.3)",
                        }}
                      >
                        <Crown className="w-2.5 h-2.5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "#fbbf24" }}>
                          Premium
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium" style={{ color: "#8a6540" }}>
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
                  style={{ color: "#c4a882" }}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(249,115,22,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "#f0e8de";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#c4a882";
                  }}
                >
                  <div
                    className="p-1.5 rounded-xl"
                    style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#fb923c" }} />
                  </div>
                  {label}
                </Link>
              ))}

              {/* Premium CTA — free users only */}
              {isPremium === null ? (
                <div
                  className="mx-2 h-12 rounded-2xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              ) : !isPremium ? (
                <Link
                  to="/premium"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left group"
                  style={{ color: "#c4a882" }}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(251,191,36,0.1)";
                    (e.currentTarget as HTMLElement).style.color = "#fbbf24";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#c4a882";
                  }}
                >
                  <div
                    className="p-1.5 rounded-xl"
                    style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.28)" }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: "#fbbf24" }} />
                  </div>
                  <span className="flex-1">Get Premium</span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(251,191,36,0.15)",
                      border: "1px solid rgba(251,191,36,0.25)",
                      color: "#fbbf24",
                    }}
                  >
                    NEW
                  </span>
                </Link>
              ) : null}

              <div
                className="my-1 mx-2"
                style={{ borderTop: "1px solid rgba(249,115,22,0.1)" }}
              />

              {[
                { to: "/privacy", Icon: Shield,   label: "Privacy Policy" },
                { to: "/terms",   Icon: FileText, label: "Terms of Service" },
              ].map(({ to, Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left"
                  style={{ color: "#8a6540" }}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#c4a882";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#8a6540";
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#4a3520" }} />
                  {label}
                </Link>
              ))}

              <div
                className="my-1 mx-2"
                style={{ borderTop: "1px solid rgba(249,115,22,0.1)" }}
              />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-150 w-full text-left mb-1"
                style={{ color: "#8a6540" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#8a6540";
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

              {/* Decorative footer image */}
              <div
                className="relative h-28 w-full rounded-2xl overflow-hidden mt-2"
                style={{ border: "1px solid rgba(249,115,22,0.18)" }}
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