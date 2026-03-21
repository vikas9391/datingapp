import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import {
  ChevronRight, ChevronDown, Search, Shield,
  User, Heart, Settings, AlertCircle, X,
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const FAQ_DATA = [
  {
    category: "Account Settings", icon: Settings,
    items: [
      { q: "How do I change my location?", a: "Go to your Profile → Edit Profile → Location. You can update your city or allow the app to detect your current location automatically." },
      { q: "How do I change my email address?", a: "Navigate to Settings → Account → Email. You'll receive a verification OTP on your new email before the change takes effect." },
      { q: "How do I delete my account?", a: "Go to Settings → Privacy → Delete Account. Type DELETE to confirm. This action is permanent and removes all your data, matches, and messages." },
      { q: "Can I recover a deleted account?", a: "No — account deletion is permanent and irreversible. All data is removed immediately. We recommend deactivating your account instead if you want a break." },
      { q: "How do I reset my password?", a: "On the login screen, tap 'Forgot Password'. Enter your email and we'll send a 6-digit OTP. Use that to set a new password." },
    ],
  },
  {
    category: "Matching & Chatting", icon: Heart,
    items: [
      { q: "Is The Dating App free to use?", a: "Yes! The core experience — browsing, liking, and chatting with matches — is completely free. Premium plans unlock extra features like seeing who liked you, unlimited likes, and profile boosts." },
      { q: "How does matching work?", a: "When you like someone and they like you back, it's a match! You'll both receive a notification and a chat is opened automatically." },
      { q: "Why am I not getting any matches?", a: "Try completing your profile with photos and a bio, expanding your distance or age range preferences, and being active daily. The algorithm surfaces active users more often." },
      { q: "Can I unsend a like?", a: "Likes cannot be unsent once sent. However, you can block a user if you want to prevent a potential match from occurring." },
      { q: "How do I unmatch someone?", a: "Open the chat with that person, tap the ⋯ menu in the top-right corner, and select 'Unmatch'. This removes the match and the chat history." },
    ],
  },
  {
    category: "Safety & Privacy", icon: Shield,
    items: [
      { q: "How do I report a fake profile?", a: "Open the chat with the user, tap the ⋯ menu, and select 'Report'. Choose a reason and submit. Our trust & safety team reviews all reports within 24 hours." },
      { q: "How do I block someone?", a: "Open their profile or your chat, tap the ⋯ menu, and select 'Block'. Blocked users cannot see your profile or contact you." },
      { q: "Can I hide my online status?", a: "Yes. Go to Settings → Privacy → Show Online Status and toggle it off. Others will not see when you were last active." },
      { q: "How is my data used?", a: "Your data is used only to power the matching experience. We never sell personal data to third parties. See our full Privacy Policy for details." },
      { q: "How do I download my data?", a: "Go to Settings → Privacy → Export My Data. A JSON file containing your profile, matches, and message history will be available to download immediately." },
    ],
  },
  {
    category: "Premium Features", icon: User,
    items: [
      { q: "What do I get with Premium?", a: "Premium includes: unlimited likes, see who liked you, profile boosts to appear at the top of discovery, read receipts, and priority support." },
      { q: "How do I upgrade to Premium?", a: "Go to Settings → Premium → View Plans. Choose a monthly or annual plan and complete payment via Razorpay." },
      { q: "Can I cancel my subscription?", a: "Yes. Cancel anytime from Settings → Premium → Manage Subscription. You'll retain Premium access until the end of your billing period." },
      { q: "Is my payment information secure?", a: "All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card details on our servers." },
    ],
  },
  {
    category: "Troubleshooting", icon: AlertCircle,
    items: [
      { q: "I'm not receiving OTP emails.", a: "Check your spam / junk folder first. If it's not there, ensure the email address is correct and try resending. OTPs expire in 5 minutes." },
      { q: "The app is crashing or freezing.", a: "Try force-closing and reopening the app. If the issue persists, clear the app cache or reinstall. You can also contact support with your device model and OS version." },
      { q: "Messages are not delivering.", a: "Check your internet connection. If the issue continues, the recipient may have blocked you or deleted their account." },
      { q: "My profile photos are not uploading.", a: "Photos must be under 10 MB and in JPG, PNG, or WebP format. Make sure you've granted camera/photos permission to the app in your device settings." },
    ],
  },
];

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: string; isDark: boolean }> = ({ q, a, isDark }) => {
  const [open, setOpen] = useState(false);

  const cardBg      = isDark ? "#1c1c1c"               : "#ffffff";
  const cardBorder  = isDark ? "rgba(249,115,22,0.14)" : "#f1f5f9";
  const cardHoverBd = isDark ? "rgba(249,115,22,0.3)"  : "#bfdbfe";
  const txPrimary   = isDark ? "#f0e8de"               : "#111827";
  const txBody      = isDark ? "#c4a882"               : "#4b5563";
  const dividerCl   = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";
  const accentColor = isDark ? "#f97316"               : "#1d4ed8";
  const chevronCl   = isDark ? "#8a6540"               : "#d1d5db";

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: cardBg, border: `1px solid ${open ? cardHoverBd : cardBorder}`, boxShadow: open ? (isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(29,78,216,0.08)") : "none" }}
    >
      <button onClick={() => setOpen((p) => !p)}
        className="w-full p-5 flex justify-between items-center text-left gap-4">
        <span className="font-semibold text-sm md:text-base" style={{ color: txPrimary }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: open ? accentColor : chevronCl }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden">
            <div className="px-5 pb-5">
              <div className="h-px mb-4" style={{ background: dividerCl }} />
              <p className="text-sm md:text-base leading-relaxed" style={{ color: txBody }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const HelpCenterPage: React.FC = () => {
  const { isDark } = useTheme() as any;
  const [query, setQuery]             = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  /* ─── Theme tokens ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.04)";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ctaShadow    = isDark ? "0 8px 18px rgba(249,115,22,0.35)" : "0 8px 18px rgba(29,78,216,0.28)";

  // Search header
  const heroHeaderBg = isDark
    ? "linear-gradient(145deg,#1a0f00,#110b04)"
    : "linear-gradient(145deg,#0f172a,#1e293b)";
  const heroHeaderBd = isDark ? "rgba(249,115,22,0.2)" : "transparent";
  const heroSubCl    = isDark ? "#8a6540" : "#94a3b8";

  // Search input
  const searchBg     = isDark ? "#1c1c1c"              : "#ffffff";
  const searchBd     = isDark ? "rgba(249,115,22,0.2)" : "transparent";
  const searchCl     = isDark ? "#f0e8de"              : "#111827";
  const searchPH     = isDark ? "#4a3520"              : "#9ca3af";
  const searchIcon   = isDark ? "#4a3520"              : "#9ca3af";
  const searchFocusBd = accentColor;
  const clearBtnCl   = isDark ? "#4a3520" : "#9ca3af";

  // Category chips
  const chipAllActive = { background: isDark ? "rgba(249,115,22,0.15)" : "#0f172a", color: isDark ? "#f97316" : "#ffffff", border: `1px solid ${isDark ? "rgba(249,115,22,0.3)" : "transparent"}` };
  const chipAllDefault = { background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff", color: txMuted, border: `1px solid ${isDark ? "rgba(249,115,22,0.1)" : "#e5e7eb"}` };
  const chipActive = { background: accentColor, color: "#ffffff", border: `1px solid ${accentColor}` };
  const chipDefault = { background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff", color: txMuted, border: `1px solid ${isDark ? "rgba(249,115,22,0.1)" : "#e5e7eb"}` };

  // Category icon pill
  const catIconBg  = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const catIconBd  = isDark ? "rgba(249,115,22,0.12)"  : "#f1f5f9";
  const catIconCl  = accentColor;

  // Search result category label
  const searchCatCl = accentColor;

  // Still need help card
  const helpCardBg   = isDark ? "rgba(255,255,255,0.03)" : "#f9fafb";
  const helpCardBd   = isDark ? "rgba(249,115,22,0.12)"  : "#f1f5f9";
  const helpContactBg = isDark ? "rgba(249,115,22,0.08)" : "#eff6ff";
  const helpContactBd = isDark ? "rgba(249,115,22,0.2)"  : "#bfdbfe";
  const helpContactCl = accentColor;

  const allItems = useMemo(() => FAQ_DATA.flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.category }))), []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
  }, [query, allItems]);

  const visibleCategories = useMemo(() => {
    if (activeCategory) return FAQ_DATA.filter((c) => c.category === activeCategory);
    return FAQ_DATA;
  }, [activeCategory]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen pt-20 flex flex-col transition-colors duration-300" style={{ background: pageBg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar />

      {/* ── Search Header ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-16 md:py-24 px-4 text-center rounded-b-[40px] mb-12 relative overflow-hidden"
        style={{ background: heroHeaderBg, border: `1px solid ${heroHeaderBd}` }}
      >
        {/* subtle orb inside header */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[200px] rounded-full"
            style={{ background: isDark ? "rgba(249,115,22,0.08)" : "rgba(59,130,246,0.12)", filter: "blur(80px)" }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">How can we help you?</h1>
          <p className="mb-8 text-sm md:text-base" style={{ color: heroSubCl }}>
            Search our knowledge base or browse by category below.
          </p>
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: searchIcon }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-12 py-4 rounded-2xl outline-none transition-all placeholder:text-sm"
              placeholder="Search for articles, topics..."
              style={{ background: searchBg, border: `1px solid ${searchBd}`, color: searchCl, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = searchFocusBd)}
              onBlur={(e) => (e.currentTarget.style.borderColor = searchBd)}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: clearBtnCl }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 max-w-5xl mx-auto px-4 w-full pb-20">

        {/* ── Search Results ── */}
        {isSearching ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm mb-5" style={{ color: txMuted }}>
              {searchResults.length === 0
                ? "No results found."
                : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${query}"`}
            </p>
            <div className="space-y-3">
              {searchResults.map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1 px-1" style={{ color: searchCatCl }}>
                    {item.category}
                  </p>
                  <FAQItem q={item.q} a={item.a} isDark={isDark} />
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="text-center py-16">
                  <p className="mb-4" style={{ color: txMuted }}>We couldn't find anything for that.</p>
                  <a href="/contact"
                    className="inline-block px-6 py-3 font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
                    style={{ background: ctaGradient, boxShadow: ctaShadow }}>
                    Contact Support
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* ── Category Chips ── */}
            <h2 className="text-xl md:text-2xl font-bold mb-6" style={{ color: txPrimary }}>Browse by Category</h2>
            <div className="flex flex-wrap gap-3 mb-10">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(null)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={activeCategory === null ? chipAllActive : chipAllDefault}>
                All Topics
              </motion.button>
              {FAQ_DATA.map((cat) => {
                const isActive = activeCategory === cat.category;
                return (
                  <motion.button key={cat.category} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveCategory(isActive ? null : cat.category)}
                    className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
                    style={isActive ? chipActive : chipDefault}>
                    <cat.icon className="w-4 h-4" /> {cat.category}
                  </motion.button>
                );
              })}
            </div>

            {/* ── Category Sections ── */}
            <div className="space-y-12">
              {visibleCategories.map((cat, ci) => (
                <motion.section key={cat.category}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl" style={{ background: catIconBg, border: `1px solid ${catIconBd}` }}>
                      <cat.icon className="w-5 h-5" style={{ color: catIconCl }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: txPrimary }}>{cat.category}</h3>
                  </div>
                  <div className="space-y-3">
                    {cat.items.map((item, i) => (
                      <FAQItem key={i} q={item.q} a={item.a} isDark={isDark} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* ── Still need help ── */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mt-16 rounded-3xl p-8 md:p-10 text-center"
              style={{ background: helpCardBg, border: `1px solid ${helpCardBd}` }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: txPrimary }}>Still need help?</h3>
              <p className="mb-6" style={{ color: txMuted }}>
                Our support team is here for you. We typically respond within 24 hours.
              </p>
              <motion.a href="/contact" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-white hover:opacity-90 transition-opacity"
                style={{ background: ctaGradient, boxShadow: ctaShadow }}>
                Contact Support <ChevronRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;