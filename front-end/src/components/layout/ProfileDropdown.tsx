import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Shield,
  FileText,
  Sparkles,
  User,
  Settings,
  Crown,
} from "lucide-react";
// Crown is used for the avatar badge when isPremium === true
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
        className="w-10 h-10 ml-2 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md hover:bg-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 overflow-hidden ring-2 ring-white relative"
      >
        {profilePhoto ? (
          <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
        {/* Premium crown badge on avatar */}
        {isPremium && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center border border-white">
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
            className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 py-2 z-[100] origin-top-right overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-sm overflow-hidden shrink-0 border-2 border-white relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-gray-900 truncate">{userName}</p>
                    {/* Premium badge next to name */}
                    {isPremium && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                        <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Premium</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">View your profile</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">

              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-gray-50 hover:text-teal-600 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-1.5 bg-gray-100 rounded-xl text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                Profile
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-gray-50 hover:text-teal-600 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-1.5 bg-gray-100 rounded-xl text-gray-500">
                  <Settings className="w-4 h-4" />
                </div>
                Settings
              </Link>

              {/* Premium section — only shown for free users */}
              {isPremium === null ? (
                // Loading skeleton
                <div className="mx-2 h-12 rounded-2xl bg-gray-100 animate-pulse" />
              ) : !isPremium ? (
                // Upgrade CTA — hidden for premium users
                <Link
                  to="/premium"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-pink-50 hover:text-pink-600 transition-colors w-full text-left group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="p-1.5 bg-pink-100 rounded-xl text-pink-500 group-hover:text-pink-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="flex-1">Get Premium</span>
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">NEW</span>
                </Link>
              ) : null}

              <div className="my-1 border-t border-gray-50" />

              <Link
                to="/privacy"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="w-4 h-4 text-gray-400" />
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                Terms of Service
              </Link>

              <div className="my-1 border-t border-gray-50" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors w-full text-left mb-1"
              >
                <LogOut className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                Sign Out
              </button>

              {/* Decorative footer */}
              <div className="relative h-28 w-full rounded-2xl overflow-hidden mt-2 border border-teal-100/50">
                <MenuFooterImage />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}