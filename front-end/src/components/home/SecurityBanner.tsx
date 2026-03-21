import { Shield, Lock, UserCheck, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";

const SecurityBanner = () => {
  const { isDark } = useTheme();

  /* ─── Theme-aware styles ─── */
  const s = isDark ? {
    wrapper: {
      background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
      border: "1px solid rgba(249,115,22,0.22)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.45) 50%, transparent 92%)",
    glowBR: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
    glowTL: "radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)",
    headerIcon: {
      background: "rgba(249,115,22,0.14)",
      border: "1px solid rgba(249,115,22,0.35)",
      boxShadow: "0 0 18px rgba(249,115,22,0.2)",
    },
    headerIconColor: { color: "#fb923c" },
    heading: { color: "#f0e8de" },
    subtitle: { color: "#8a6540" },
    featureCardBase: { background: "rgba(255,255,255,0.025)" },
    featureTitle: { color: "#f0e8de" },
    featureDesc: { color: "#8a6540" },
    divider: { borderTop: "1px solid rgba(249,115,22,0.14)" },
    badgeText: { color: "#8a6540" },
    badgeIcon: { color: "#fb923c" },
    features: [
      {
        icon: Shield,
        title: "Profile Verification",
        description: "All profiles are verified for authenticity",
        accent: "rgba(249,115,22,0.18)",
        iconColor: "#fb923c",
        border: "rgba(249,115,22,0.28)",
        hoverBg: "rgba(249,115,22,0.18)",
      },
      {
        icon: Lock,
        title: "End-to-End Encryption",
        description: "Your conversations are always private",
        accent: "rgba(234,88,12,0.16)",
        iconColor: "#f97316",
        border: "rgba(234,88,12,0.26)",
        hoverBg: "rgba(234,88,12,0.16)",
      },
      {
        icon: UserCheck,
        title: "ID Verification",
        description: "Optional ID check for extra trust",
        accent: "rgba(251,146,60,0.15)",
        iconColor: "#fbbf24",
        border: "rgba(251,146,60,0.25)",
        hoverBg: "rgba(251,146,60,0.15)",
      },
      {
        icon: Eye,
        title: "Privacy Controls",
        description: "You decide who sees your profile",
        accent: "rgba(249,115,22,0.14)",
        iconColor: "#fb923c",
        border: "rgba(249,115,22,0.24)",
        hoverBg: "rgba(249,115,22,0.14)",
      },
    ],
  } : {
    wrapper: {
      background: "linear-gradient(145deg, #ffffff 0%, #f8f9fc 100%)",
      border: "1px solid rgba(29,78,216,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
    },
    topAccent: "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.35) 50%, transparent 92%)",
    glowBR: "radial-gradient(circle, rgba(29,78,216,0.06) 0%, transparent 70%)",
    glowTL: "radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 70%)",
    headerIcon: {
      background: "rgba(29,78,216,0.08)",
      border: "1px solid rgba(29,78,216,0.25)",
      boxShadow: "0 0 18px rgba(29,78,216,0.1)",
    },
    headerIconColor: { color: "#1d4ed8" },
    heading: { color: "#1e293b" },
    subtitle: { color: "#64748b" },
    featureCardBase: { background: "rgba(29,78,216,0.02)" },
    featureTitle: { color: "#1e293b" },
    featureDesc: { color: "#64748b" },
    divider: { borderTop: "1px solid rgba(29,78,216,0.1)" },
    badgeText: { color: "#64748b" },
    badgeIcon: { color: "#1d4ed8" },
    features: [
      {
        icon: Shield,
        title: "Profile Verification",
        description: "All profiles are verified for authenticity",
        accent: "rgba(29,78,216,0.1)",
        iconColor: "#1d4ed8",
        border: "rgba(29,78,216,0.2)",
        hoverBg: "rgba(29,78,216,0.1)",
      },
      {
        icon: Lock,
        title: "End-to-End Encryption",
        description: "Your conversations are always private",
        accent: "rgba(29,78,216,0.1)",
        iconColor: "#3b82f6",
        border: "rgba(29,78,216,0.2)",
        hoverBg: "rgba(29,78,216,0.1)",
      },
      {
        icon: UserCheck,
        title: "ID Verification",
        description: "Optional ID check for extra trust",
        accent: "rgba(59,130,246,0.1)",
        iconColor: "#1d4ed8",
        border: "rgba(59,130,246,0.2)",
        hoverBg: "rgba(59,130,246,0.1)",
      },
      {
        icon: Eye,
        title: "Privacy Controls",
        description: "You decide who sees your profile",
        accent: "rgba(29,78,216,0.08)",
        iconColor: "#1d4ed8",
        border: "rgba(29,78,216,0.18)",
        hoverBg: "rgba(29,78,216,0.08)",
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-[24px] p-6 lg:p-8 overflow-hidden h-full transition-all duration-300"
      style={s.wrapper}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: s.topAccent }}
      />

      {/* Ambient radial glow BR */}
      <div
        className="absolute -bottom-10 -right-10 w-64 h-64 pointer-events-none rounded-full"
        style={{ background: s.glowBR }}
      />
      {/* Ambient radial glow TL */}
      <div
        className="absolute -top-8 -left-8 w-48 h-48 pointer-events-none rounded-full"
        style={{ background: s.glowTL }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-7">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
          style={s.headerIcon}
        >
          <Shield className="w-6 h-6 transition-colors duration-300" style={s.headerIconColor} />
        </div>
        <div>
          <h3 className="font-black text-lg leading-tight transition-colors duration-300" style={s.heading}>
            Your Safety Matters
          </h3>
          <p className="text-sm transition-colors duration-300" style={s.subtitle}>
            Industry-leading security standards
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative grid sm:grid-cols-2 gap-3">
        {s.features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="group relative p-4 rounded-xl overflow-hidden cursor-default transition-all duration-300"
            style={{ ...s.featureCardBase, border: `1px solid ${feature.border}` }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background  = feature.hoverBg;
              el.style.boxShadow   = "0 4px 20px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background  = s.featureCardBase.background;
              el.style.boxShadow   = "none";
            }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all duration-300"
              style={{ background: feature.accent, border: `1px solid ${feature.border}` }}
            >
              <feature.icon className="w-4 h-4" style={{ color: feature.iconColor }} />
            </div>

            <p className="font-bold text-sm mb-1 transition-colors duration-300" style={s.featureTitle}>
              {feature.title}
            </p>
            <p className="text-xs leading-relaxed transition-colors duration-300" style={s.featureDesc}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer badges */}
      <div
        className="relative mt-6 flex flex-wrap gap-4 pt-5 transition-all duration-300"
        style={s.divider}
      >
        {["GDPR Compliant", "256-bit SSL", "24/7 Monitoring"].map((badge, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300"
            style={s.badgeText}
          >
            <CheckCircle className="w-3.5 h-3.5 transition-colors duration-300" style={s.badgeIcon} />
            <span>{badge}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SecurityBanner;