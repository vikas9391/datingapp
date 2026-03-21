import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import { ArrowLeft, ScrollText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/ThemeContext";

const SECTIONS = [
  { id: "intro",        title: "Introduction"              },
  { id: "rules",        title: "1. App Rules"              },
  { id: "content",      title: "2. Types of Content"       },
  { id: "restrictions", title: "3. Restrictions on the App"},
  { id: "safety",       title: "4. Safety Policy"          },
  { id: "privacy",      title: "5. Privacy"                },
  { id: "payment",      title: "6. Payment Terms"          },
  { id: "virtual",      title: "7. Virtual Items"          },
  { id: "disclaimer",   title: "8. Disclaimer"             },
  { id: "liability",    title: "9. Limitation of Liability"},
  { id: "termination",  title: "10. Termination"           },
  { id: "governing",    title: "11. Governing Law"         },
];

export default function TermsPage() {
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

  // Sidebar
  const sidebarBg     = isDark ? "#1c1c1c"                    : "#ffffff";
  const sidebarBorder = isDark ? "rgba(249,115,22,0.14)"      : "#f1f1f5";
  const sidebarHead   = isDark ? "#f0e8de"                    : "#1f2937";
  const navActive     = isDark ? "rgba(249,115,22,0.1)"       : "rgba(29,78,216,0.08)";
  const navActiveCl   = isDark ? "#f97316"                    : "#1d4ed8";
  const navDefault    = "transparent";
  const navDefaultCl  = isDark ? "#8a6540"                    : "#9ca3af";
  const navHover      = isDark ? "rgba(249,115,22,0.06)"      : "#f9fafb";
  const navHoverCl    = isDark ? "#c4a882"                    : "#374151";

  // Content
  const h2Color       = isDark ? "#f0e8de"                    : "#111827";
  const listCl        = isDark ? "#c4a882"                    : "#4b5563";
  const backCl        = isDark ? "#8a6540"                    : "#9ca3af";
  const backHoverCl   = isDark ? "#f97316"                    : "#1d4ed8";
  const dateCl        = isDark ? "#4a3520"                    : "#d1d5db";

  // Info banners
  const warnBg        = isDark ? "rgba(249,115,22,0.08)"      : "#fff7ed";
  const warnBd        = isDark ? "rgba(249,115,22,0.2)"       : "#fed7aa";
  const warnCl        = isDark ? "#fb923c"                    : "#92400e";

  const infoBg        = isDark ? "rgba(249,115,22,0.06)"      : "rgba(29,78,216,0.06)";
  const infoBd        = isDark ? "rgba(249,115,22,0.16)"      : "rgba(29,78,216,0.12)";
  const infoCl        = isDark ? "#c4a882"                    : "#1d4ed8";

  const successBg     = isDark ? "rgba(9,207,139,0.06)"       : "#f0fdf4";
  const successBd     = isDark ? "rgba(9,207,139,0.18)"       : "#bbf7d0";
  const successCl     = isDark ? "#09cf8b"                    : "#166534";

  const privacyLinkCl = isDark ? "#fb923c"                    : "#1d4ed8";

  // Uppercase disclaimer
  const uppercaseCl   = isDark ? "#4a3520"                    : "#9ca3af";

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
                <ScrollText className="w-5 h-5" style={{ color: accentColor }} />
                <h3 className="font-bold" style={{ color: sidebarHead }}>Table of Contents</h3>
              </div>
              <nav className="space-y-0.5">
                {SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button key={section.id} onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all duration-200 font-medium"
                      style={{ background: isActive ? navActive : navDefault, color: isActive ? navActiveCl : navDefaultCl, fontWeight: isActive ? 700 : 500 }}
                      onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = navHover; (e.currentTarget as HTMLElement).style.color = navHoverCl; } }}
                      onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = navDefault; (e.currentTarget as HTMLElement).style.color = navDefaultCl; } }}
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
                <Link to="/chats"
                  className="inline-flex items-center text-sm font-medium mb-4 transition-colors no-underline"
                  style={{ color: backCl }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = backHoverCl)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = backCl)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to App
                </Link>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: txPrimary }}>
                  Terms and Conditions of Use
                </h1>
                <p className="text-sm" style={{ color: dateCl }}>Last updated: January 23, 2026</p>
              </div>

              {/* Content */}
              <div className="space-y-10 leading-relaxed" style={{ color: txBody }}>

                {/* Intro */}
                <section id="intro" className="scroll-mt-32">
                  <p className="mb-4" style={{ color: txBody }}>
                    Welcome to The Dating App's Terms and Conditions of Use (these "Terms"). This is a contract
                    between you and The Dating App Group and we want you to know yours and our rights before you
                    use The Dating App website or application.
                  </p>
                  <p className="mb-4" style={{ color: txBody }}>
                    Please take a few moments to read these Terms before enjoying the App, because once you
                    access, view or use the App, you are going to be legally bound by these Terms.
                  </p>
                  <div className="rounded-xl p-4 text-sm font-medium"
                    style={{ background: warnBg, border: `1px solid ${warnBd}`, color: warnCl }}>
                    Please note that Section 14 contains provisions governing how claims that you and The Dating
                    App have against each other are resolved, including an arbitration agreement.
                  </div>
                </section>

                {/* 1. Rules */}
                <section id="rules" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>1. The Dating App Rules</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    Before you can use the App, you will need to register for an account ("Account"). In order
                    to create an Account you must:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: listCl }}>
                    <li>Be at least 18 years old or the age of majority to legally enter into a contract under the laws of your home country.</li>
                    <li>Be legally permitted to use the App by the laws of your home country.</li>
                  </ul>
                  <p style={{ color: txBody }}>
                    You cannot share your account with another person. You are responsible for maintaining the
                    confidentiality of your login credentials and for all activities that occur under your Account.
                  </p>
                </section>

                {/* 2. Content */}
                <section id="content" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>2. Types of Content</h2>
                  <p className="mb-4" style={{ color: txBody }}>There are three types of content that you will be able to access on the App:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: listCl }}>
                    <li><strong style={{ color: txPrimary }}>Your Content:</strong> Content that you upload and provide.</li>
                    <li><strong style={{ color: txPrimary }}>Member Content:</strong> Content that other members provide.</li>
                    <li><strong style={{ color: txPrimary }}>Our Content:</strong> Content that The Dating App provides (software, graphics, etc.).</li>
                  </ul>
                  <p style={{ color: txBody }}>
                    You agree that Your Content must comply with our Community Guidelines. You indemnify us from
                    any claims made in connection with Your Content.
                  </p>
                </section>

                {/* 3. Restrictions */}
                <section id="restrictions" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>3. Restrictions on the App</h2>
                  <p className="mb-4" style={{ color: txBody }}>You agree that you will not:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: listCl }}>
                    <li>Use the App for any unlawful purpose.</li>
                    <li>Stalk, harass, bully, or mistreat any other user.</li>
                    <li>Impersonate any person or entity.</li>
                    <li>Scrape or copy profiles and data from the services.</li>
                    <li>Post content that is hate speech, threatening, sexually explicit, or pornographic.</li>
                  </ul>
                  <div className="rounded-xl p-4 text-sm"
                    style={{ background: infoBg, border: `1px solid ${infoBd}`, color: infoCl }}>
                    We reserve the right to investigate and terminate your account if you misuse the Service or
                    behave in a way that we regard as inappropriate or unlawful.
                  </div>
                </section>

                {/* 4. Safety */}
                <section id="safety" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>4. Safety Policy</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    Safety is a top priority. We use a combination of automated systems and human moderators
                    to monitor accounts. We do not tolerate:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: listCl }}>
                    <li>Sexual harassment or non-consensual sexual content.</li>
                    <li>Violence or dangerous organizations.</li>
                    <li>Fraud, scams, or impersonation.</li>
                  </ul>
                  <p style={{ color: txBody }}>
                    If you encounter bad behavior, please use the{" "}
                    <strong style={{ color: txPrimary }}>Block & Report</strong> feature immediately.
                  </p>
                </section>

                {/* 5. Privacy */}
                <section id="privacy" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>5. Privacy</h2>
                  <p style={{ color: txBody }}>
                    For information about how The Dating App collects, uses, and shares your personal data,
                    please check out our{" "}
                    <Link to="/privacy"
                      className="font-bold hover:underline"
                      style={{ color: privacyLinkCl }}>
                      Privacy Policy
                    </Link>. By using the App, you acknowledge that we may use such data in accordance with
                    our Privacy Policy.
                  </p>
                </section>

                {/* 6. Payment */}
                <section id="payment" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>6. Payment Terms</h2>
                  <p className="mb-4" style={{ color: txBody }}>
                    <strong style={{ color: txPrimary }}>Subscriptions:</strong> If you purchase a recurring
                    subscription (e.g., Premium), it will automatically renew at the end of the applicable period
                    unless you cancel 24 hours before the end of the term.
                  </p>
                  <p className="mb-4" style={{ color: txBody }}>
                    <strong style={{ color: txPrimary }}>Refunds:</strong> Generally, all charges for purchases
                    are nonrefundable, and there are no refunds or credits for partially used periods, except
                    where required by law.
                  </p>
                </section>

                {/* 7. Virtual Items */}
                <section id="virtual" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>7. Virtual Items</h2>
                  <p style={{ color: txBody }}>
                    From time to time, you may be able to purchase a limited, personal, non-transferable license
                    to use "Virtual Items" (such as Super Likes or Spotlights). Any Virtual Item balance shown
                    in your account does not constitute a real-world balance or reflect any stored value.
                  </p>
                </section>

                {/* 8. Disclaimer */}
                <section id="disclaimer" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>8. Disclaimer</h2>
                  <p className="uppercase text-sm leading-relaxed" style={{ color: uppercaseCl }}>
                    THE APP, SITE, OUR CONTENT, AND MEMBER CONTENT ARE ALL PROVIDED TO YOU "AS IS" AND "AS
                    AVAILABLE" WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THE COMPATIBILITY OF ANY
                    MATCHES. YOUR USE OF THE APP IS AT YOUR OWN RISK.
                  </p>
                </section>

                {/* 9. Liability */}
                <section id="liability" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>9. Limitation of Liability</h2>
                  <p className="uppercase text-sm leading-relaxed" style={{ color: uppercaseCl }}>
                    NEITHER US NOR ANY OWNER WILL BE LIABLE FOR ANY DAMAGES, DIRECT, INDIRECT, INCIDENTAL,
                    CONSEQUENTIAL, SPECIAL, OR PUNITIVE, INCLUDING, WITHOUT LIMITATION, LOSS OF DATA, INCOME,
                    PROFIT OR GOODWILL, LOSS OF OR DAMAGE TO PROPERTY.
                  </p>
                </section>

                {/* 10. Termination */}
                <section id="termination" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>10. Termination</h2>
                  <p style={{ color: txBody }}>
                    You can delete your Account at any time by going to the "Settings" tab. We reserve the
                    right to suspend or terminate your account without notice if we believe you have violated
                    these Terms.
                  </p>
                </section>

                {/* 11. Governing Law */}
                <section id="governing" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: h2Color }}>11. Governing Law</h2>
                  <p style={{ color: txBody }}>
                    These Terms are governed by the laws of the State of Texas, USA, without regard to its
                    conflict of laws rules.
                  </p>
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