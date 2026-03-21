import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

type OnboardingPageProps = {
  onComplete?: () => void;
  onLogout?: () => void;
};

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete, onLogout }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme() as any;

  /* ─── Theme tokens (match Landing / Login) ─── */
  const pageBg = isDark
    ? "#0d0d0d"
    : "linear-gradient(to bottom, #f8faff, #f0f4ff)";

  const handleFinish = () => {
    onComplete?.();
    navigate("/home", { replace: true });
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: pageBg }}
    >
      {/* Ambient orbs — match Landing */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: isDark
              ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)"
              : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.3,
          }}
        />
      </div>

      <OnboardingFlow onComplete={handleFinish} onLogout={onLogout} />
    </div>
  );
};

export default OnboardingPage;