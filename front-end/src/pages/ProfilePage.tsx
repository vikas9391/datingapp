// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Quote, Edit, Settings, LogOut, AlertCircle,
  Instagram, Send, Twitter, Linkedin, MessageCircleMore,
  Heart, RefreshCw, Sun, Moon,
} from 'lucide-react';
import { profileService } from '../services/profileService';
import TopBar from '@/components/layout/TopBar';
import { useTheme } from '@/components/ThemeContext';

interface UserProfile {
  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  relationshipType: string;
  interestedIn: string[];
  distance: number;
  strictDistance: boolean;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  communicationStyle: string[];
  responsePace: string;
  interests: string[];
  location: string;
  useCurrentLocation: boolean;
  photos: string[];
  bio: string;
  socialAccounts?: {
    instagram: string;
    whatsapp: string;
    snapchat: string;
    twitter: string;
    linkedin: string;
  };
}

const calculateAge = (dateOfBirth: Date | null): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const RELATIONSHIP_STATUS_EMOJI: Record<string, string> = {
  "Single": "💚", "Committed": "💑", "Broken up recently": "💔",
  "Divorced": "📋", "Widowed": "🕊️",
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme, setIsDark } = useTheme() as any;
  const handleToggle = toggleTheme ?? (() => setIsDark?.((v: boolean) => !v));

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'photos' | 'preferences' | 'social'>('about');

  /* ─── Theme tokens (match Landing / Login) ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 24px 60px rgba(0,0,0,0.55)" : "0 4px 24px rgba(0,0,0,0.06)";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ctaShadow    = isDark ? "0 8px 18px rgba(249,115,22,0.35)" : "0 8px 18px rgba(29,78,216,0.28)";

  // Pill / tag variants
  const pillBase     = isDark ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(249,115,22,0.12)", color: "#c4a882"  } : { background: "#f9fafb", border: "1px solid #f1f5f9", color: "#374151" };
  const pillAccent   = isDark ? { background: "rgba(249,115,22,0.1)",  border: "1px solid rgba(249,115,22,0.22)", color: "#fb923c"  } : { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.18)", color: "#1d4ed8" };
  const pillGreen    = isDark ? { background: "rgba(9,207,139,0.08)",  border: "1px solid rgba(9,207,139,0.18)", color: "#09cf8b"   } : { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" };
  const pillBlue     = isDark ? { background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.18)", color: "#93c5fd"  } : { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" };

  // Stat card
  const statBg       = isDark ? "rgba(255,255,255,0.03)" : "#f9fafb";
  const statBorder   = isDark ? "rgba(249,115,22,0.1)"   : "#f1f5f9";
  const statLabelCl  = isDark ? "#4a3520"                : "#9ca3af";

  // Cover gradient
  const coverGrad    = isDark
    ? "linear-gradient(135deg,#1a0f00,#2a1500,rgba(249,115,22,0.3))"
    : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  // Action buttons
  const actionBtnBg  = isDark ? "#1c1c1c"                 : "#ffffff";
  const actionBtnBd  = isDark ? "rgba(249,115,22,0.18)"   : "#e5e7eb";
  const actionBtnCl  = isDark ? "#c4a882"                 : "#374151";
  const actionBtnHov = isDark ? "rgba(249,115,22,0.06)"   : "#f9fafb";

  // Tabs
  const tabActiveCl  = accentColor;
  const tabDefaultCl = isDark ? "#8a6540" : "#9ca3af";
  const tabHoverCl   = isDark ? "#c4a882" : "#374151";

  // Section headings inside tabs
  const sectionHeadCl = isDark ? "#4a3520" : "#9ca3af";

  // Bio card
  const bioBg        = isDark ? "rgba(255,255,255,0.03)" : "#f9fafb";
  const bioBorder    = isDark ? "rgba(249,115,22,0.1)"   : "#f1f5f9";
  const quoteIconCl  = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";

  // Social cards
  const socialInfoBg  = isDark ? "rgba(59,130,246,0.08)"  : "#eff6ff";
  const socialInfoBd  = isDark ? "rgba(59,130,246,0.18)"  : "#bfdbfe";
  const socialInfoCl  = isDark ? "#93c5fd"                : "#1e40af";

  // Pref cards
  const prefBg       = isDark ? "rgba(255,255,255,0.03)" : "#f9fafb";
  const prefBd       = isDark ? "rgba(249,115,22,0.1)"   : "#f1f5f9";
  const prefRelBg    = isDark ? "rgba(244,63,94,0.08)"   : "#fff1f2";
  const prefRelBd    = isDark ? "rgba(244,63,94,0.18)"   : "#fecdd3";
  const prefRelCl    = isDark ? "#fca5a5"                : "#be123c";

  // Toggle btn
  const toggleStyle  = isDark
    ? { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.28)", color: "#fb923c" }
    : { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.22)", color: "#1d4ed8" };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true); setError(null);
      await new Promise(resolve => setTimeout(resolve, 400));
      const result = await profileService.getProfile();
      if (!result.exists) { navigate('/onboarding'); return; }
      if (!result.data)   { setError("Profile data is missing"); return; }
      setProfile(result.data);
    } catch (err: any) { setError(err.message || 'Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  /* ─── Loading ─── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ background: pageBg }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: ctaGradient, boxShadow: ctaShadow }}>
          <RefreshCw className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="font-medium" style={{ color: txMuted }}>Loading profile…</p>
      </div>
    </div>
  );

  /* ─── Error ─── */
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: pageBg }}>
      <div className="rounded-2xl p-8 max-w-md w-full"
        style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
        <div className="flex items-center gap-3 mb-4" style={{ color: "#f43f5e" }}>
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-xl font-bold">Error Loading Profile</h2>
        </div>
        <p className="mb-4" style={{ color: txBody }}>{error}</p>
        <div className="space-y-3">
          <button onClick={fetchProfile}
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: ctaGradient, boxShadow: ctaShadow }}>
            Try Again
          </button>
          <button onClick={() => navigate('/onboarding')}
            className="w-full py-3 rounded-xl font-semibold transition-colors"
            style={{ background: statBg, color: txBody, border: `1px solid ${cardBorder}` }}>
            Complete Onboarding
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── No profile ─── */
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ background: pageBg }}>
      <div className="text-center">
        <p className="mb-4" style={{ color: txMuted }}>Profile not found</p>
        <button onClick={() => navigate('/onboarding')}
          className="px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90"
          style={{ background: ctaGradient }}>
          Complete Profile Setup
        </button>
      </div>
    </div>
  );

  const age          = calculateAge(profile.dateOfBirth);
  const firstInitial = profile.firstName.charAt(0).toUpperCase();

  const getLifestyleEmoji = (category: string, value: string) => {
    const map: Record<string, Record<string, string>> = {
      drinking: { "Never": "🚫", "Socially": "🍷", "Regularly": "🍻" },
      smoking:  { "Never": "🚭", "Sometimes": "💨", "Regularly": "🚬" },
      workout:  { "Never": "🛋️", "Sometimes": "🚶", "Often": "💪", "Daily": "✨" },
      pets:     { "Own pets": "🐾", "Love pets": "❤️", "Allergic": "🤧", "None": "🚫" },
    };
    return map[category]?.[value] || "✨";
  };

  const lifestyleTags = [
    { label: profile.drinking, emoji: getLifestyleEmoji('drinking', profile.drinking), visible: !!profile.drinking },
    { label: profile.smoking,  emoji: getLifestyleEmoji('smoking',  profile.smoking),  visible: !!profile.smoking  },
    { label: profile.workout,  emoji: getLifestyleEmoji('workout',  profile.workout),  visible: !!profile.workout  },
    { label: profile.pets,     emoji: getLifestyleEmoji('pets',     profile.pets),     visible: !!profile.pets     },
  ].filter(item => item.visible);

  const hasSocialAccounts = profile.socialAccounts && (
    profile.socialAccounts.instagram ||
    profile.socialAccounts.whatsapp  ||
    profile.socialAccounts.snapchat  ||
    profile.socialAccounts.twitter   ||
    profile.socialAccounts.linkedin
  );

  const tabs = (['about', hasSocialAccounts ? 'social' : null, 'preferences'] as const).filter(Boolean) as ('about' | 'social' | 'preferences')[];

  return (
    <div className="min-h-screen pt-20 transition-colors duration-300" style={{ background: pageBg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar userName={profile.firstName} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl overflow-hidden mb-6"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
        >
          {/* Cover */}
          <div className="h-32 relative" style={{ background: coverGrad }}>
            {/* floating dots on cover */}
            {[...Array(6)].map((_, i) => (
              <motion.div key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${(i * 17 + 8) % 100}%`, top: `${(i * 23 + 12) % 100}%`,
                  width: i % 2 === 0 ? 3 : 2, height: i % 2 === 0 ? 3 : 2,
                  background: "rgba(255,255,255,0.3)",
                }}
                animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1, 0.6] }}
                transition={{ duration: 3 + (i % 3), delay: i * 0.5, repeat: Infinity }}
              />
            ))}

            {/* theme toggle — top right of cover */}
            <motion.button
              onClick={handleToggle}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={toggleStyle}
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={isDark ? "moon" : "sun"}
                  initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isDark ? <Moon size={13} /> : <Sun size={13} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div
                className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl font-black text-white shadow-xl"
                style={{ background: ctaGradient, borderColor: cardBg, boxShadow: ctaShadow }}
              >
                {firstInitial}
              </div>
            </div>

            {/* Name & Edit */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight" style={{ color: txPrimary }}>
                  {profile.firstName}{age && `, ${age}`}
                </h2>
                {profile.showGender && profile.gender && (
                  <p className="font-medium mt-1" style={{ color: txMuted }}>{profile.gender}</p>
                )}
              </div>
              <motion.button
                onClick={() => navigate('/onboarding')}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity"
                style={{ background: ctaGradient, boxShadow: ctaShadow }}
              >
                <Edit className="w-4 h-4" /> Edit
              </motion.button>
            </div>

            {/* Relationship Status Badge */}
            {profile.relationshipType && (
              <div className="mb-5">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={prefRelBg ? { background: prefRelBg, border: `1px solid ${prefRelBd}` } : {}}
                >
                  <Heart className="w-4 h-4" style={{ color: prefRelCl, fill: prefRelCl }} />
                  <span className="text-sm font-semibold" style={{ color: prefRelCl }}>
                    {RELATIONSHIP_STATUS_EMOJI[profile.relationshipType] ?? "💫"}{" "}{profile.relationshipType}
                  </span>
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div
                className="mb-6 p-5 rounded-2xl relative"
                style={{ background: bioBg, border: `1px solid ${bioBorder}` }}
              >
                <Quote className="absolute top-3 left-3 w-4 h-4 transform scale-x-[-1]" style={{ color: quoteIconCl }} />
                <p className="leading-relaxed text-center px-4" style={{ color: txBody }}>{profile.bio}</p>
                <Quote className="absolute bottom-3 right-3 w-4 h-4" style={{ color: quoteIconCl }} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Location", value: profile.location || 'Not set' },
                { label: "Max Distance", value: `${profile.distance} km` },
              ].map((stat) => (
                <div key={stat.label}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: statBg, border: `1px solid ${statBorder}` }}>
                  <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: statLabelCl }}>{stat.label}</p>
                    <p className="text-sm font-bold" style={{ color: txPrimary }}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto" style={{ borderBottom: `1px solid ${dividerColor}` }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-2 font-semibold text-sm capitalize transition-colors relative whitespace-nowrap"
                    style={{ color: isActive ? tabActiveCl : tabDefaultCl }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = tabHoverCl; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = tabDefaultCl; }}
                  >
                    {tab}
                    {isActive && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: ctaGradient }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab: About ── */}
            <AnimatePresence mode="wait">
              {activeTab === 'about' && (
                <motion.div key="about"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }} className="space-y-6">

                  {lifestyleTags.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: sectionHeadCl }}>Lifestyle</h3>
                      <div className="flex flex-wrap gap-2">
                        {lifestyleTags.map((tag, idx) => (
                          <span key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                            style={pillBase}>
                            <span>{tag.emoji}</span><span>{tag.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.interests.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: sectionHeadCl }}>Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span key={interest}
                            className="px-3 py-1.5 rounded-full text-sm font-bold"
                            style={pillAccent}>
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.communicationStyle.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: sectionHeadCl }}>Communication</h3>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {profile.communicationStyle.map((style) => (
                            <span key={style}
                              className="px-3 py-1.5 rounded-full text-sm font-semibold"
                              style={pillBlue}>
                              {style}
                            </span>
                          ))}
                        </div>
                        {profile.responsePace && (
                          <p className="text-sm" style={{ color: txMuted }}>
                            Response pace:{" "}
                            <span className="font-semibold" style={{ color: txBody }}>{profile.responsePace}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Tab: Social ── */}
              {activeTab === 'social' && hasSocialAccounts && (
                <motion.div key="social"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }} className="space-y-4">

                  <div className="rounded-xl p-4"
                    style={{ background: socialInfoBg, border: `1px solid ${socialInfoBd}` }}>
                    <p className="text-sm font-medium" style={{ color: socialInfoCl }}>
                      <span className="font-bold">Note:</span>{" "}
                      These social accounts will only be visible to people you match with.
                    </p>
                  </div>

                  {[
                    {
                      show: !!profile.socialAccounts?.instagram,
                      href: `https://instagram.com/${profile.socialAccounts?.instagram}`,
                      icon: Instagram, label: "Instagram",
                      value: `@${profile.socialAccounts?.instagram}`,
                      bg: isDark ? "rgba(236,72,153,0.08)"  : "rgba(236,72,153,0.05)",
                      bd: isDark ? "rgba(236,72,153,0.2)"   : "#fce7f3",
                      iconCl: "#ec4899",
                    },
                    {
                      show: !!profile.socialAccounts?.whatsapp,
                      href: `https://wa.me/${profile.socialAccounts?.whatsapp?.replace(/\D/g, '')}`,
                      icon: MessageCircleMore, label: "WhatsApp",
                      value: profile.socialAccounts?.whatsapp,
                      bg: isDark ? "rgba(34,197,94,0.08)"   : "rgba(34,197,94,0.05)",
                      bd: isDark ? "rgba(34,197,94,0.2)"    : "#bbf7d0",
                      iconCl: "#22c55e",
                    },
                    {
                      show: !!profile.socialAccounts?.snapchat,
                      href: `https://snapchat.com/add/${profile.socialAccounts?.snapchat}`,
                      icon: Send, label: "Snapchat",
                      value: profile.socialAccounts?.snapchat,
                      bg: isDark ? "rgba(234,179,8,0.08)"   : "rgba(234,179,8,0.05)",
                      bd: isDark ? "rgba(234,179,8,0.2)"    : "#fef08a",
                      iconCl: "#eab308",
                    },
                    {
                      show: !!profile.socialAccounts?.twitter,
                      href: `https://twitter.com/${profile.socialAccounts?.twitter}`,
                      icon: Twitter, label: "Twitter / X",
                      value: `@${profile.socialAccounts?.twitter}`,
                      bg: isDark ? "rgba(59,130,246,0.08)"  : "rgba(59,130,246,0.05)",
                      bd: isDark ? "rgba(59,130,246,0.2)"   : "#bfdbfe",
                      iconCl: "#3b82f6",
                    },
                    {
                      show: !!profile.socialAccounts?.linkedin,
                      href: profile.socialAccounts?.linkedin?.startsWith('http')
                        ? profile.socialAccounts.linkedin
                        : `https://linkedin.com/in/${profile.socialAccounts?.linkedin}`,
                      icon: Linkedin, label: "LinkedIn",
                      value: profile.socialAccounts?.linkedin,
                      bg: isDark ? "rgba(29,78,216,0.08)"   : "rgba(29,78,216,0.05)",
                      bd: isDark ? "rgba(29,78,216,0.2)"    : "#bfdbfe",
                      iconCl: "#1d4ed8",
                    },
                  ].filter(s => s.show).map((s) => (
                    <motion.a key={s.label}
                      href={s.href} target="_blank" rel="noopener noreferrer"
                      whileHover={{ y: -2, boxShadow: `0 8px 24px ${s.iconCl}18` }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center gap-4 p-4 rounded-xl transition-shadow no-underline"
                      style={{ background: s.bg, border: `1px solid ${s.bd}` }}
                    >
                      <s.icon className="w-6 h-6 flex-shrink-0" style={{ color: s.iconCl }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: txMuted }}>{s.label}</p>
                        <p className="font-semibold text-sm truncate" style={{ color: txPrimary }}>{s.value}</p>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              )}

              {/* ── Tab: Preferences ── */}
              {activeTab === 'preferences' && (
                <motion.div key="preferences"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }} className="space-y-4">

                  {profile.relationshipType && (
                    <div className="p-4 rounded-xl" style={{ background: prefRelBg, border: `1px solid ${prefRelBd}` }}>
                      <h4 className="font-semibold mb-1" style={{ color: txPrimary }}>Relationship Status</h4>
                      <p className="text-sm" style={{ color: prefRelCl }}>
                        {RELATIONSHIP_STATUS_EMOJI[profile.relationshipType] ?? "💫"} {profile.relationshipType}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl" style={{ background: prefBg, border: `1px solid ${prefBd}` }}>
                    <h4 className="font-semibold mb-2" style={{ color: txPrimary }}>Distance</h4>
                    <p className="text-sm" style={{ color: txBody }}>
                      Max:{" "}
                      <span className="font-bold" style={{ color: txPrimary }}>{profile.distance} km</span>
                      {profile.strictDistance && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={pillAccent}
                        >
                          Strict
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: prefBg, border: `1px solid ${prefBd}` }}>
                    <h4 className="font-semibold mb-2" style={{ color: txPrimary }}>Interested In</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.interestedIn.map((item) => (
                        <span key={item}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={pillBase}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-3"
        >
          {[
            { label: "Settings", icon: Settings, onClick: () => navigate('/settings'), danger: false },
            { label: "Log Out",  icon: LogOut,   onClick: handleLogout,                danger: true  },
          ].map(({ label, icon: Icon, onClick, danger }) => (
            <button key={label} onClick={onClick}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors"
              style={{
                background: actionBtnBg,
                border: `1px solid ${danger ? "rgba(244,63,94,0.25)" : actionBtnBd}`,
                color: danger ? "#f43f5e" : actionBtnCl,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = danger ? (isDark ? "rgba(244,63,94,0.08)" : "#fff1f2") : actionBtnHov)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = actionBtnBg)}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default ProfilePage;