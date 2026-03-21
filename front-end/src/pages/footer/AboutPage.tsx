import React from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { Heart, Users, MapPin } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const AboutPage = () => {
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
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";

  const heroBg       = isDark
    ? "linear-gradient(to bottom, rgba(249,115,22,0.06), transparent)"
    : "linear-gradient(to bottom, rgba(29,78,216,0.06), transparent)";

  const statIconBg   = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.08)";
  const statIconCl   = accentColor;

  const storyStrong  = isDark ? "#f0e8de" : "#111827";

  const badgeStyle   = isDark
    ? { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)" }
    : { background: "rgba(29,78,216,0.08)",  border: "1px solid rgba(29,78,216,0.2)"  };

  const statsData = [
    { icon: Heart,  title: "10M+",      desc: "Matches Made"  },
    { icon: Users,  title: "5M+",       desc: "Active Users"  },
    { icon: MapPin, title: "Hyderabad", desc: "Our Home Base" },
  ];

  return (
    <div className="min-h-screen pt-20 flex flex-col transition-colors duration-300" style={{ background: pageBg }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute top-[38%] -right-28 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar />

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="py-16 md:py-24 px-4 text-center"
        style={{ background: heroBg }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={badgeStyle}
        >
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: accentColor }}>
            Our Story
          </span>
        </motion.div>

        <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight" style={{ color: txPrimary }}>
          Making Dating{" "}
          <span className="bg-clip-text text-transparent italic" style={{ backgroundImage: ctaGradient }}>
            Human
          </span>{" "}
          Again
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: txBody }}>
          Born in the heart of Hyderabad, we are building the future of authentic connections for India and the world.
        </p>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {statsData.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, boxShadow: isDark ? "0 20px 48px rgba(0,0,0,0.55)" : "0 20px 48px rgba(29,78,216,0.1)" }}
              className="text-center p-8 rounded-3xl transition-all cursor-default"
              style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
                style={{ background: isDark ? "linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)" : "linear-gradient(90deg, transparent, rgba(29,78,216,0.25), transparent)" }} />

              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: statIconBg }}>
                <item.icon className="w-7 h-7" style={{ color: statIconCl }} />
              </div>

              <h3 className="text-2xl font-black mb-1 bg-clip-text text-transparent"
                style={{ backgroundImage: ctaGradient }}>
                {item.title}
              </h3>
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: txMuted }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Story ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 max-w-3xl mx-auto px-4 pb-20"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: dividerColor }} />
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: txPrimary }}>Our Story</h2>
          <div className="h-px flex-1" style={{ background: dividerColor }} />
        </div>

        <div className="space-y-6 text-lg leading-relaxed" style={{ color: txBody }}>
          <p>
            Founded in{" "}
            <strong style={{ color: storyStrong }}>Hitech City, Hyderabad</strong>, The Dating App was
            born from a simple frustration: dating apps felt like video games, not pathways to connection.
            We were tired of the endless swiping that led nowhere.
          </p>
          <p>
            We wanted to build a space where personality shines brighter than a profile picture. A place
            where "Hi" turns into a conversation, not a ghosting session.
          </p>
          <p>
            Today, we are a diverse team of engineers, designers, and die-hard romantics working out of
            our office in Telangana, helping millions of people find their person.
          </p>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-8 rounded-3xl text-center"
          style={{ background: isDark ? "rgba(249,115,22,0.05)" : "rgba(29,78,216,0.04)", border: `1px solid ${isDark ? "rgba(249,115,22,0.14)" : "rgba(29,78,216,0.1)"}` }}
        >
          <p className="font-bold text-lg mb-1" style={{ color: txPrimary }}>Want to work with us?</p>
          <p className="text-sm mb-5" style={{ color: txMuted }}>We're always looking for passionate people.</p>
          <motion.a href="/careers"
            whileHover={{ scale: 1.04, boxShadow: isDark ? "0 12px 32px rgba(249,115,22,0.3)" : "0 12px 32px rgba(29,78,216,0.25)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white hover:opacity-90 transition-opacity no-underline"
            style={{ background: ctaGradient, boxShadow: ctaShadow }}
          >
            View Open Positions
          </motion.a>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default AboutPage;