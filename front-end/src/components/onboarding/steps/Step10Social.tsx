// src/components/onboarding/steps/Step9Social.tsx
import React, { useState } from "react";
import { Instagram } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import StepLayout from "../StepLayout";
import { useTheme } from "@/components/ThemeContext";

interface Step9Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const Step9Social: React.FC<Step9Props> = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}) => {
  const { isDark } = useTheme();
  const [instagram, setInstagram] = useState(data.socialAccounts?.instagram || "");

  const handleNext = () => {
    onChange({
      socialAccounts: {
        instagram: instagram.trim(),
        whatsapp: "",
        snapchat: "",
        twitter: "",
        linkedin: "",
      },
    });
    onNext();
  };

  /* ─── Theme tokens ─── */
  const card: React.CSSProperties = isDark
    ? {
        background: "linear-gradient(145deg, #1a1a1a 0%, #141008 100%)",
        border: "1px solid rgba(249,115,22,0.15)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
      }
    : {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      };

  const labelColor    = isDark ? "#c4a882" : "#374151";
  const atSignColor   = isDark ? "#8a6540" : "#6b7280";

  const inputStyle: React.CSSProperties = isDark
    ? {
        flex: 1,
        padding: "0.75rem 1rem",
        border: "1px solid rgba(249,115,22,0.2)",
        borderRadius: "0.75rem",
        background: "#242424",
        color: "#f0e8de",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        fontSize: "0.875rem",
      }
    : {
        flex: 1,
        padding: "0.75rem 1rem",
        border: "1px solid #d1d5db",
        borderRadius: "0.75rem",
        background: "#ffffff",
        color: "#0f172a",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        fontSize: "0.875rem",
      };

  const inputFocusBorder = isDark ? "#f97316"  : "#1d4ed8";
  const inputFocusShadow = isDark
    ? "0 0 0 3px rgba(249,115,22,0.1)"
    : "0 0 0 3px rgba(29,78,216,0.08)";
  const inputPlaceholder = isDark ? "#4a3520" : "#9ca3af";

  const privacyBox: React.CSSProperties = isDark
    ? {
        background: "rgba(29,78,216,0.06)",
        border: "1px solid rgba(29,78,216,0.15)",
      }
    : {
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
      };

  const privacyText  = isDark ? "#93c5fd" : "#1e40af";
  const privacyBold  = isDark ? "#60a5fa" : "#1d4ed8";
  const footerHint   = isDark ? "#4a3520" : "#9ca3af";

  return (
    <StepLayout
      currentStep={9}
      totalSteps={9}
      title="Connect Your Instagram"
      subtitle="Share your Instagram to make it easier to connect off the platform"
      onBack={onBack}
      onNext={handleNext}
      onSkip={onSkip}
      nextLabel="Continue"
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-6">

        {/* Form card */}
        <div className="rounded-2xl p-6 space-y-5 transition-all duration-300" style={card}>
          <div>
            <label
              className="flex items-center gap-2 text-sm font-semibold mb-2 transition-colors duration-300"
              style={{ color: labelColor }}
            >
              <Instagram className="w-5 h-5 text-pink-500" />
              Instagram
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium transition-colors duration-300" style={{ color: atSignColor }}>
                @
              </span>

              <style>{`
                .ig-input::placeholder { color: ${inputPlaceholder}; }
                .ig-input:focus {
                  border-color: ${inputFocusBorder} !important;
                  box-shadow: ${inputFocusShadow} !important;
                }
              `}</style>

              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="username"
                className="ig-input"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div className="rounded-xl p-4 transition-all duration-300" style={privacyBox}>
          <p className="text-sm transition-colors duration-300" style={{ color: privacyText }}>
            <span className="font-semibold" style={{ color: privacyBold }}>Privacy note:</span>{" "}
            Your Instagram handle will only be visible to people you match with.
          </p>
        </div>

        {/* Optional hint */}
        <p
          className="text-center text-xs transition-colors duration-300"
          style={{ color: footerHint }}
        >
          This field is optional. Skip if you prefer not to share.
        </p>
      </div>
    </StepLayout>
  );
};

export default Step9Social;