import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import { ArrowLeft, ShieldCheck, Lock, Eye, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

const SECTIONS = [
  { id: "intro",   title: "Introduction"      },
  { id: "collect", title: "1. What We Collect" },
  { id: "use",     title: "2. How We Use Info" },
  { id: "sharing", title: "3. Sharing Info"    },
  { id: "rights",  title: "4. Your Rights"     },
  { id: "storage", title: "5. Storage & Deletion" },
  { id: "security",title: "6. Security"        },
  { id: "contact", title: "7. Contact Us"      },
];

export default function PrivacyPage() {
  const { isDark } = useTheme() as any;
  const [activeSection, setActiveSection] = useState("intro");

  /* ─── Theme tokens (match Landing/Login) ─── */
  const accentColor   = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber   = isDark ? "#fb923c" : "#3b82f6";
  const pageBg        = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary     = isDark ? "#f0e8de" : "#111827";
  const txBody        = isDark ? "#c4a882" : "#4b5563";
  const txMuted       = isDark ? "#8a6540" : "#9ca3af";
  const cardBg        = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder    = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow    = isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 16px rgba(0,0,0,0.04)";
  const dividerColor  = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";
  const ctaGradient   = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";

  // Sidebar
  const sidebarBg     = isDark ? "#1c1c1c"                   : "#ffffff";
  const sidebarBorder = isDark ? "rgba(249,115,22,0.14)"     : "#f1f1f5";
  const sidebarHead   = isDark ? "#f0e8de"                   : "#1f2937";
  const navActive     = isDark ? "rgba(249,115,22,0.1)"      : "rgba(29,78,216,0.08)";
  const navActiveCl   = isDark ? "#f97316"                   : "#1d4ed8";
  const navDefault    = "transparent";
  const navDefaultCl  = isDark ? "#8a6540"                   : "#9ca3af";
  const navHover      = isDark ? "rgba(249,115,22,0.06)"     : "#f9fafb";
  const navHoverCl    = isDark ? "#c4a882"                   : "#374151";

  // Content blocks
  const h2Color       = isDark ? "#f0e8de"                   : "#111827";
  const h3Color       = isDark ? "#c4a882"                   : "#374151";
  const gridCardBg    = isDark ? "rgba(255,255,255,0.03)"    : "#f9fafb";
  const gridCardBd    = isDark ? "rgba(249,115,22,0.1)"      : "#f1f5f9";
  const listItemCl    = isDark ? "#c4a882"                   : "#4b5563";
  const borderLeftCl  = isDark ? "#f97316"                   : "#1d4ed8";
  const borderCardBg  = isDark ? "rgba(255,255,255,0.03)"    : "#f9fafb";
  const checkCl       = isDark ? "#f97316"                   : "#1d4ed8";

  // Info banner (intro)
  const infoBannerBg  = isDark ? "rgba(249,115,22,0.08)"     : "rgba(29,78,216,0.06)";
  const infoBannerBd  = isDark ? "rgba(249,115,22,0.2)"      : "rgba(29,78,216,0.15)";
  const infoBannerCl  = isDark ? "#c4a882"                   : "#1d4ed8";

  // Warning banner (rights)
  const warnBg        = isDark ? "rgba(249,115,22,0.08)"     : "#fff7ed";
  const warnBd        = isDark ? "rgba(249,115,22,0.2)"      : "#fed7aa";
  const warnCl        = isDark ? "#fb923c"                   : "#92400e";

  // Contact card
  const contactBg     = isDark ? "#1a1007"                   : "#111827";
  const contactBd     = isDark ? "rgba(249,115,22,0.2)"      : "transparent";
  const contactHead   = "#ffffff";
  const contactBody   = isDark ? "#c4a882"                   : "#94a3b8";
  const contactLink   = isDark ? "#fb923c"                   : "#34d399";

  // Back link
  const backCl        = isDark ? "#8a6540"                   : "#9ca3af";
  const backHoverCl   = isDark ? "#f97316"                   : "#1d4ed8";

  // Date text
  const dateCl        = isDark ? "#4a3520"                   : "#d1d5db";

  /* ─── Scroll spy ─── */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) setActiveSection(section.id);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) { window.scrollTo({ top: element.offsetTop - 120, behavior: "smooth" }); setActiveSection(id); }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: pageBg }}>
      {/* ambient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar />

      <main className="flex-1 container mx-auto max-w-7xl pt-24 pb-12 px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Sidebar ── */}
          <div className="hidden lg:block lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-28 rounded-2xl overflow-hidden p-4"
              style={{ background: sidebarBg, border: `1px solid ${sidebarBorder}`, boxShadow: cardShadow }}
            >
              <div className="flex items-center gap-2 mb-4 px-2">
                <ShieldCheck className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className="font-bold" style={{ color: sidebarHead }}>Privacy Policy</h3>
              </div>
              <nav className="space-y-0.5">
                {SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium"
                      style={{
                        background: isActive ? navActive : navDefault,
                        color: isActive ? navActiveCl : navDefaultCl,
                        fontWeight: isActive ? 700 : 500,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = navHover;
                          (e.currentTarget as HTMLElement).style.color = navHoverCl;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = navDefault;
                          (e.currentTarget as HTMLElement).style.color = navDefaultCl;
                        }
                      }}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[32px] p-6 md:p-10"
              style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
            >
              {/* Header */}
              <div className="mb-8 pb-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
                <Link
                  to="/chats"
                  className="inline-flex items-center text-sm font-medium mb-4 transition-colors no-underline"
                  style={{ color: backCl }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = backHoverCl)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = backCl)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to App
                </Link>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: txPrimary }}>
                  Privacy Policy
                </h1>
                <p className="text-sm" style={{ color: dateCl }}>
                  Last updated: December 18, 2025
                </p>
              </div>

              {/* Content */}
              <div className="space-y-12 leading-relaxed" style={{ color: txBody }}>

                {/* Intro */}
                <section id="intro" className="scroll-mt-32">
                  <p className="mb-4 text-lg font-medium" style={{ color: txPrimary }}>
                    Welcome to The Dating App Group Privacy Policy. Whether you're ready to put yourself
                    out there and start dating or just looking for a new friend, we believe every
                    relationship and opportunity should start with respect and equality… especially when
                    it comes to your personal information.
                  </p>
                  <p className="mb-4" style={{ color: txBody }}>
                    This Policy explains how we process your personal information. It applies any time
                    you're using The Dating App mobile application or desktop version ("App"), and to your
                    use of our "Sites".
                  </p>
                  <div
                    className="rounded-xl p-4 text-sm font-medium flex gap-3"
                    style={{ background: infoBannerBg, border: `1px solid ${infoBannerBd}`, color: infoBannerCl }}
                  >
                    <UserCheck className="w-5 h-5 shrink-0" />
                    We are responsible for taking care of all the personal information we collect and you
                    share with us. We are the data "controller" for all personal information collected.
                  </div>
                </section>

                {/* 1. What We Collect */}
                <section id="collect" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>1. What We Collect</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    When you download the App and create an account, we collect certain information about
                    you to help enhance the App and verify the people using it.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {[
                      {
                        title: "Registration Info",
                        items: ["Name & Username", "Gender Identity & Sexual Preference", "Date of Birth", "Email & Mobile Number", "Photographs"],
                      },
                      {
                        title: "Device & Location",
                        items: ["WiFi access points", "Longitude / Latitude coordinates", "Device ID & Model", "Operating System"],
                      },
                    ].map((card) => (
                      <div key={card.title} className="p-4 rounded-xl"
                        style={{ background: gridCardBg, border: `1px solid ${gridCardBd}` }}>
                        <h3 className="font-bold mb-2" style={{ color: h3Color }}>{card.title}</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: listItemCl }}>
                          {card.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm italic" style={{ color: txMuted }}>
                    Note: If you link social media accounts (like Instagram or Spotify), we may collect
                    data you choose to share from those platforms.
                  </p>
                </section>

                {/* 2. How We Use Info */}
                <section id="use" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>2. How We Use Your Information</h2>
                  <p className="mb-4" style={{ color: txBody }}>Our main goal: give you an enjoyable experience as you connect. We use your data to:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: listItemCl }}>
                    {[
                      ["Offer Services:", "Provide features, updates, and customer support."],
                      ["Matching Algorithms:", "We use your profile data, activity, and location to predict compatibility and recommend connections."],
                      ["Safety & Moderation:", "Automated systems and human moderators review content to prevent fraud, harassment, and illegal activities."],
                      ["Marketing:", "If you consent, we send offers and promotions relevant to you."],
                    ].map(([bold, rest]) => (
                      <li key={bold as string}>
                        <strong style={{ color: txPrimary }}>{bold}</strong> {rest}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* 3. Sharing Info */}
                <section id="sharing" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>3. Sharing Your Information</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    We do not sell your personal data. However, we share data with trusted third parties to operate our services:
                  </p>
                  <div className="space-y-3">
                    {[
                      ["Service Providers:", "For billing, authentication (SMS), and customer support hosting."],
                      ["Legal Enforcement:", "We cooperate with law enforcement if required by law or to protect the safety of any person."],
                      ["Business Transfers:", "In the event of a merger, acquisition, or sale of assets."],
                    ].map(([bold, rest]) => (
                      <div key={bold as string} className="p-3 pl-4 rounded-r-xl"
                        style={{ borderLeft: `4px solid ${borderLeftCl}`, background: borderCardBg }}>
                        <strong style={{ color: txPrimary }}>{bold}</strong>{" "}
                        <span style={{ color: txBody }}>{rest}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4. Your Rights */}
                <section id="rights" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: h2Color }}>
                    <Eye className="w-6 h-6" style={{ color: accentColor }} />
                    4. Your Rights
                  </h2>
                  <p className="mb-4" style={{ color: txBody }}>You generally have the following rights regarding your personal information:</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {[
                      [
                        ["Right to Access:", "Request a copy of your data."],
                        ["Right to Rectify:", "Correct inaccurate info."],
                        ["Right to Erase:", "Delete your personal info."],
                      ],
                      [
                        ["Right to Restrict:", "Limit how we use your data."],
                        ["Right to Portability:", "Get your data in a portable format."],
                        ["Right to Complain:", "Contact data privacy authorities."],
                      ],
                    ].map((col, ci) => (
                      <ul key={ci} className="space-y-2" style={{ color: listItemCl }}>
                        {col.map(([bold, rest]) => (
                          <li key={bold} className="flex items-start gap-2">
                            <span style={{ color: checkCl }}>✅</span>
                            <span><strong style={{ color: txPrimary }}>{bold}</strong> {rest}</span>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-xl text-sm"
                    style={{ background: warnBg, border: `1px solid ${warnBd}`, color: warnCl }}>
                    <strong>California Residents:</strong> You have specific rights under the CCPA
                    (Right to Know, Right to Delete). Contact support to exercise these rights.
                  </div>
                </section>

                {/* 5. Storage & Deletion */}
                <section id="storage" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>5. Storage & Deletion</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    We keep your info only as long as necessary. If you delete your account, we ensure
                    it is no longer viewable on the App.
                  </p>
                  <p className="mb-4" style={{ color: txBody }}>
                    We retain data for{" "}
                    <strong style={{ color: txPrimary }}>28 days</strong>{" "}
                    after deletion request in case you change your mind, after which the deletion process
                    begins. We may keep certain data longer for legal, tax, or safety reasons (e.g.,
                    banned accounts).
                  </p>
                </section>

                {/* 6. Security */}
                <section id="security" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: h2Color }}>
                    <Lock className="w-6 h-6" style={{ color: accentColor }} />
                    6. Security
                  </h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    We pride ourselves on taking appropriate security measures to help protect your
                    information against loss, misuse, and unauthorized access.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: listItemCl }}>
                    <li>We use secured servers with firewalls.</li>
                    <li>Data is encrypted in transit.</li>
                    <li>We regularly review our security practices.</li>
                  </ul>
                  <p className="text-sm" style={{ color: txMuted }}>
                    However, no website is 100% secure. Always keep your password confidential and log
                    out after use.
                  </p>
                </section>

                {/* 7. Contact */}
                <section id="contact" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>7. Contact Us</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    If you have questions about this Policy or want to exercise your rights, please
                    contact our Data Protection Officer.
                  </p>
                  <div className="p-6 rounded-2xl" style={{ background: contactBg, border: `1px solid ${contactBd}` }}>
                    <p className="font-bold text-lg mb-2" style={{ color: contactHead }}>The Dating App Group</p>
                    <p className="mb-1" style={{ color: contactBody }}>
                      Email:{" "}
                      <a href="mailto:privacy@thedatingapp.com"
                        className="hover:underline transition-colors"
                        style={{ color: contactLink }}>
                        privacy@thedatingapp.com
                      </a>
                    </p>
                    <p style={{ color: contactBody }}>Address: 1 Tech Plaza, Silicon Valley, CA, USA</p>
                  </div>
                </section>

                {/* Footer */}
                <div className="pt-8 mt-12 text-center" style={{ borderTop: `1px solid ${dividerColor}` }}>
                  <p className="text-sm" style={{ color: dateCl }}>
                    © 2026 The Dating App Group. All Rights Reserved.
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}