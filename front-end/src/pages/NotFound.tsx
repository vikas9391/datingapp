import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";
import { Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  /* ─── Theme tokens ─── */
  const pageBg      = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const cardBg      = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder  = isDark ? "rgba(249,115,22,0.18)" : "rgba(29,78,216,0.12)";
  const cardShadow  = isDark ? "0 24px 64px rgba(0,0,0,0.55)" : "0 24px 64px rgba(29,78,216,0.08)";
  const txPrimary   = isDark ? "#f0e8de" : "#0f172a";
  const txBody      = isDark ? "#c4a882" : "#475569";
  const txMuted     = isDark ? "#8a6540" : "#94a3b8";
  const accentColor = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber = isDark ? "#fb923c" : "#3b82f6";
  const ctaGrad     = isDark
    ? "linear-gradient(135deg, #f97316, #fb923c)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";
  const ctaShadow   = isDark
    ? "0 8px 24px rgba(249,115,22,0.35)"
    : "0 8px 24px rgba(29,78,216,0.28)";
  const glowColor   = isDark ? "rgba(249,115,22,0.12)" : "rgba(29,78,216,0.08)";
  const glowColor2  = isDark ? "rgba(251,191,36,0.08)" : "rgba(59,130,246,0.06)";
  const dotGrid     = isDark
    ? "radial-gradient(circle, rgba(249,115,22,0.12) 1px, transparent 1px)"
    : "radial-gradient(circle, rgba(29,78,216,0.1) 1px, transparent 1px)";
  const numGrad     = isDark
    ? "linear-gradient(135deg, #fbbf24, #f97316)"
    : "linear-gradient(135deg, #1d4ed8, #60a5fa)";

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden transition-colors duration-300"
      style={{ background: pageBg }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: glowColor }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ background: glowColor2 }} />
        <div className="absolute inset-0" style={{ backgroundImage: dotGrid, backgroundSize: "48px 48px", opacity: 0.35 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div
          className="rounded-[32px] px-10 py-14 relative overflow-hidden"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: isDark ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)" : "linear-gradient(90deg, transparent, rgba(29,78,216,0.3), transparent)" }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-6"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: ctaGrad, boxShadow: ctaShadow }}
            >
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
          </motion.div>

          {/* 404 number */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-7xl font-black mb-3 bg-clip-text text-transparent"
            style={{ backgroundImage: numGrad }}
          >
            404
          </motion.h1>

          {/* Heading */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="text-xl font-bold mb-2"
            style={{ color: txPrimary }}
          >
            Page not found
          </motion.p>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-sm mb-8 leading-relaxed"
            style={{ color: txBody }}
          >
            Looks like this page doesn't exist yet.<br />
            Head back and find your match instead.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
              style={{ background: ctaGrad, boxShadow: ctaShadow }}
            >
              <ArrowLeft size={15} />
              Return to Home
            </Link>
          </motion.div>

          {/* Bottom path hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-[10px] mt-6 font-mono truncate"
            style={{ color: txMuted }}
          >
            {location.pathname}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;