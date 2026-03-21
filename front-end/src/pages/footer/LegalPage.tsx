// ─── LegalPage.tsx ────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { Shield, FileText, Lock, Globe, Newspaper, BookOpen, AlertTriangle } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface LegalPageProps {
  type: "privacy" | "terms" | "cookies" | "ip" | "safety" | "guidelines" | "press" | "blog";
}

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const { isDark } = useTheme() as any;

  /* ─── Theme tokens ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.04)";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";
  const iconPillBg   = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.08)";
  const iconPillBd   = isDark ? "rgba(249,115,22,0.2)"  : "rgba(29,78,216,0.15)";
  const dateCl       = isDark ? "#4a3520"                : "#d1d5db";

  // Inline content tokens passed to JSX
  const warnBg   = isDark ? "rgba(249,115,22,0.08)" : "#fff7ed";
  const warnBd   = isDark ? "rgba(249,115,22,0.2)"  : "#fed7aa";
  const warnCl   = isDark ? "#fb923c"               : "#92400e";
  const warnHead = isDark ? "#fb923c"               : "#7c2d12";
  const listCl   = isDark ? "#c4a882"               : "#4b5563";
  const h3Cl     = isDark ? "#f0e8de"               : "#111827";
  const strongCl = isDark ? "#f0e8de"               : "#111827";
  const leadCl   = isDark ? "#f0e8de"               : "#111827";
  const linkCl   = accentColor;

  const dangerCl  = isDark ? "#fca5a5" : "#be123c";
  const dangerBg  = isDark ? "rgba(244,63,94,0.08)" : "#fff1f2";
  const dangerBd  = isDark ? "rgba(244,63,94,0.2)"  : "#fecdd3";
  const greenCl   = isDark ? "#09cf8b"              : "#166534";

  const contentMap: Record<string, { title: string; icon: any; date: string; content: React.ReactNode }> = {
    privacy: {
      title: "Privacy Policy", icon: Lock, date: "January 20, 2026",
      content: (
        <>
          <p style={{ color: leadCl, fontWeight: 600, fontSize: "1.05rem" }}>Your privacy is at the core of the The Dating App experience. This policy describes how we collect, use, and share your personal information.</p>
          <h3 style={{ color: h3Cl, fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>1. Information We Collect</h3>
          <p style={{ color: txBody }}>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users.</p>
          <h3 style={{ color: h3Cl, fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>2. How We Use Information</h3>
          <p style={{ color: txBody }}>We use your information to provide, maintain, and improve our services, match you with other users, and ensure safety within the community.</p>
          <h3 style={{ color: h3Cl, fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>3. Data Storage</h3>
          <p style={{ color: txBody }}>Your data is securely stored on servers located in India, complying with local data protection regulations.</p>
        </>
      ),
    },
    terms: {
      title: "Terms of Service", icon: FileText, date: "January 15, 2026",
      content: (
        <>
          <p style={{ color: leadCl, fontWeight: 600, fontSize: "1.05rem" }}>Welcome to The Dating App. By accessing our platform, you agree to these Terms.</p>
          <h3 style={{ color: h3Cl, fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>1. Eligibility</h3>
          <p style={{ color: txBody }}>You must be at least 18 years of age to create an account on The Dating App.</p>
          <h3 style={{ color: h3Cl, fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>2. Code of Conduct</h3>
          <p style={{ color: txBody }}>You agree to treat other users with respect and not to engage in harassment, bullying, or hate speech.</p>
          <h3 style={{ color: h3Cl, fontWeight: 700, marginTop: "1.5rem", marginBottom: "0.5rem" }}>3. Jurisdiction</h3>
          <p style={{ color: txBody }}>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</p>
        </>
      ),
    },
    cookies: {
      title: "Cookie Policy", icon: Globe, date: "December 10, 2025",
      content: <p style={{ color: txBody }}>We use cookies to improve your experience, remember your preferences, and analyze site traffic to provide better matches.</p>,
    },
    ip: {
      title: "Intellectual Property", icon: Shield, date: "January 01, 2026",
      content: <p style={{ color: txBody }}>All content, trademarks, and data on this platform are the property of The Dating App or its licensors. Unauthorized use is strictly prohibited.</p>,
    },
    safety: {
      title: "Safety Center", icon: Shield, date: "Updated Regularly",
      content: (
        <>
          <p style={{ color: leadCl, fontWeight: 600, fontSize: "1.05rem" }}>Your safety is our priority. Here are tips to stay safe while dating online and offline.</p>
          <div className="my-6 p-6 rounded-2xl" style={{ background: warnBg, border: `1px solid ${warnBd}` }}>
            <h4 className="flex items-center gap-2 font-bold mb-2" style={{ color: warnHead }}>
              <AlertTriangle className="w-5 h-5" /> Important
            </h4>
            <p className="text-sm" style={{ color: warnCl }}>Never share financial information or OTPs with anyone on the app.</p>
          </div>
          <ul className="list-disc pl-5 mt-4 space-y-3" style={{ color: listCl }}>
            <li><strong style={{ color: strongCl }}>Keep it on the app:</strong> Keep conversations on the platform initially to utilize our safety features.</li>
            <li><strong style={{ color: strongCl }}>Public Meetings:</strong> Meet in public places for first dates (Cafes, Malls, etc.).</li>
            <li><strong style={{ color: strongCl }}>Tell a Friend:</strong> Tell a friend or family member where you are going and who you are meeting.</li>
          </ul>
        </>
      ),
    },
    guidelines: {
      title: "Community Guidelines", icon: BookOpen, date: "January 2026",
      content: (
        <>
          <p style={{ color: txBody }}>We are a community built on kindness. To remain on The Dating App, you must adhere to the following:</p>
          <ul className="space-y-4 mt-6">
            {[
              { mark: "✕", text: "No Harassment or Bullying", danger: true },
              { mark: "✕", text: "No Hate Speech", danger: true },
              { mark: "✕", text: "No Nudity or Sexual Content in public profiles", danger: true },
              { mark: "✓", text: "Be Kind and Respectful", danger: false },
            ].map(({ mark, text, danger }) => (
              <li key={text} className="flex gap-3 items-center">
                <span className="font-bold text-lg" style={{ color: danger ? dangerCl : greenCl }}>{mark}</span>
                <span style={{ color: txBody }}>{text}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    press: {
      title: "Press & News", icon: Newspaper, date: "Latest",
      content: (
        <p style={{ color: txBody }}>
          For press inquiries, please contact{" "}
          <strong style={{ color: linkCl }}>press@thedatingapp.com</strong>.
          We are making headlines across India for our unique approach to safe dating.
        </p>
      ),
    },
    blog: {
      title: "The Dating App Blog", icon: BookOpen, date: "Latest Stories",
      content: (
        <div className="text-center py-12">
          <p className="text-xl font-bold" style={{ color: txPrimary }}>Coming Soon!</p>
          <p className="mt-2" style={{ color: txMuted }}>We are writing stories about successful matches, dating advice, and features.</p>
        </div>
      ),
    },
  };

  const data = contentMap[type];
  const Icon = data.icon;

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

      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[32px] p-6 md:p-12"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>

          <div className="flex items-start md:items-center gap-4 mb-8 pb-8" style={{ borderBottom: `1px solid ${dividerColor}` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: iconPillBg, border: `1px solid ${iconPillBd}` }}>
              <Icon className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: txPrimary }}>{data.title}</h1>
              <p className="text-sm mt-1" style={{ color: dateCl }}>Last updated: {data.date}</p>
            </div>
          </div>

          <div className="space-y-6 leading-relaxed" style={{ color: txBody }}>
            {data.content}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export { LegalPage };
export default LegalPage;