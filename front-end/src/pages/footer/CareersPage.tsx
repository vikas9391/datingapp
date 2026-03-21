import React from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Code, PenTool, TrendingUp, MapPin } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const jobs = [
  { title: "Senior React Developer",    team: "Engineering", location: "Hyderabad, India", icon: Code },
  { title: "Product Designer",          team: "Design",      location: "Hyderabad, India", icon: PenTool },
  { title: "Marketing Manager",         team: "Growth",      location: "Remote (India)",   icon: TrendingUp },
  { title: "Backend Engineer (Python)", team: "Engineering", location: "Hyderabad, India", icon: Code },
];

const CareersPage = () => {
  const { isDark } = useTheme() as any;

  /* ─── Theme tokens (match Landing / Login) ─── */
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

  const heroBg       = isDark
    ? "linear-gradient(145deg,#1a0f00,#110b04)"
    : "linear-gradient(145deg,#0f172a,#1e293b)";
  const heroBd       = isDark ? "rgba(249,115,22,0.2)" : "transparent";
  const heroSubCl    = isDark ? "#8a6540" : "#94a3b8";

  const iconPillBg   = isDark ? "rgba(249,115,22,0.08)"  : "rgba(29,78,216,0.08)";
  const iconPillCl   = accentColor;

  const teamPillBg   = isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6";
  const teamPillCl   = isDark ? "#c4a882"                : "#374151";
  const locationCl   = isDark ? "#4a3520"                : "#9ca3af";

  const cardHoverBd  = isDark ? "rgba(249,115,22,0.35)"  : "#bfdbfe";
  const cardHoverSh  = isDark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 12px 32px rgba(29,78,216,0.08)";
  const applyLinkCl  = accentColor;

  const ctaDashedBd  = isDark ? "rgba(249,115,22,0.2)" : "#e5e7eb";
  const ctaDashedBg  = isDark ? "rgba(255,255,255,0.02)" : "#ffffff";
  const emailCl      = accentColor;

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

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="py-20 md:py-32 px-4 text-center rounded-b-[40px] md:rounded-b-[60px] mb-12 relative overflow-hidden"
        style={{ background: heroBg, border: `1px solid ${heroBd}` }}
      >
        {/* internal glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[250px] rounded-full"
            style={{ background: isDark ? "rgba(249,115,22,0.08)" : "rgba(59,130,246,0.12)", filter: "blur(90px)" }} />
        </div>

        {/* floating dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full pointer-events-none hidden sm:block"
            style={{ left: `${(i * 13 + 6) % 100}%`, top: `${(i * 19 + 8) % 100}%`, width: i % 2 === 0 ? 3 : 2, height: i % 2 === 0 ? 3 : 2, background: "rgba(255,255,255,0.25)" }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 3 + (i % 3), delay: i * 0.4, repeat: Infinity }}
          />
        ))}

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: isDark ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.1)", border: `1px solid ${isDark ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.2)"}` }}
          >
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: accentColor }}>We're Hiring</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Build the Future of Dating
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: heroSubCl }}>
            Join us at our HQ in Hyderabad or work remotely. We're on a mission to create meaningful connections.
          </p>
        </div>
      </motion.div>

      {/* ── Jobs List ── */}
      <div className="flex-1 max-w-4xl mx-auto px-4 w-full pb-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-8" style={{ color: txPrimary }}>Open Positions</h2>

        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4 transition-all duration-300"
              style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = cardHoverBd;
                (e.currentTarget as HTMLElement).style.boxShadow = cardHoverSh;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = cardBorder;
                (e.currentTarget as HTMLElement).style.boxShadow = cardShadow;
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl hidden md:flex items-center justify-center flex-shrink-0"
                  style={{ background: iconPillBg }}>
                  <job.icon className="w-6 h-6" style={{ color: iconPillCl }} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold" style={{ color: txPrimary }}>{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span className="px-2 py-1 rounded-md font-medium text-xs"
                      style={{ background: teamPillBg, color: teamPillCl }}>
                      {job.team}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: locationCl }}>
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 font-bold text-sm md:text-base" style={{ color: applyLinkCl }}>
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Open application ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-center p-8 rounded-3xl"
          style={{ background: ctaDashedBg, border: `2px dashed ${ctaDashedBd}` }}
        >
          <p className="font-medium" style={{ color: txBody }}>Don't see your role?</p>
          <p className="text-sm mt-1" style={{ color: txMuted }}>
            Send your resume to{" "}
            <span className="font-bold" style={{ color: emailCl }}>careers@thedatingapp.com</span>
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default CareersPage;