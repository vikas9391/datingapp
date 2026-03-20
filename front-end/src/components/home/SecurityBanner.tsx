import { Shield, Lock, UserCheck, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const securityFeatures = [
  {
    icon: Shield,
    title: "Profile Verification",
    description: "All profiles are verified for authenticity",
    accent: "rgba(249,115,22,0.18)",
    iconColor: "#fb923c",
    border: "rgba(249,115,22,0.28)",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your conversations are always private",
    accent: "rgba(234,88,12,0.16)",
    iconColor: "#f97316",
    border: "rgba(234,88,12,0.26)",
  },
  {
    icon: UserCheck,
    title: "ID Verification",
    description: "Optional ID check for extra trust",
    accent: "rgba(251,146,60,0.15)",
    iconColor: "#fbbf24",
    border: "rgba(251,146,60,0.25)",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    description: "You decide who sees your profile",
    accent: "rgba(249,115,22,0.14)",
    iconColor: "#fb923c",
    border: "rgba(249,115,22,0.24)",
  },
];

const SecurityBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-[24px] p-6 lg:p-8 overflow-hidden h-full"
      style={{
        background: "linear-gradient(145deg, #181108 0%, #100c04 100%)",
        border: "1px solid rgba(249,115,22,0.22)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.45) 50%, transparent 92%)",
        }}
      />

      {/* Ambient radial glow */}
      <div
        className="absolute -bottom-10 -right-10 w-64 h-64 pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-8 -left-8 w-48 h-48 pointer-events-none rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-7">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(249,115,22,0.14)",
            border: "1px solid rgba(249,115,22,0.35)",
            boxShadow: "0 0 18px rgba(249,115,22,0.2)",
          }}
        >
          <Shield className="w-6 h-6" style={{ color: "#fb923c" }} />
        </div>
        <div>
          <h3
            className="font-black text-lg leading-tight"
            style={{ color: "#f0e8de" }}
          >
            Your Safety Matters
          </h3>
          <p className="text-sm" style={{ color: "#8a6540" }}>
            Industry-leading security standards
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative grid sm:grid-cols-2 gap-3">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="group relative p-4 rounded-xl overflow-hidden cursor-default transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${feature.border}`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                feature.accent;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px rgba(0,0,0,0.3)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.025)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{
                background: feature.accent,
                border: `1px solid ${feature.border}`,
              }}
            >
              <feature.icon
                className="w-4 h-4"
                style={{ color: feature.iconColor }}
              />
            </div>

            <p
              className="font-bold text-sm mb-1"
              style={{ color: "#f0e8de" }}
            >
              {feature.title}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#8a6540" }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer badges */}
      <div
        className="relative mt-6 flex flex-wrap gap-4 pt-5"
        style={{ borderTop: "1px solid rgba(249,115,22,0.14)" }}
      >
        {["GDPR Compliant", "256-bit SSL", "24/7 Monitoring"].map(
          (badge, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "#8a6540" }}
            >
              <CheckCircle
                className="w-3.5 h-3.5"
                style={{ color: "#fb923c" }}
              />
              <span>{badge}</span>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};

export default SecurityBanner;