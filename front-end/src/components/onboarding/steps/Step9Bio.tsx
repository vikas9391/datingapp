// src/components/onboarding/steps/Step8Bio.tsx
import React from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { PenLine } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface Step8Props {
  data: Pick<OnboardingData, "bio">;
  onChange: (data: Step8Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const MIN_WORDS = 10;
const MAX_CHARS = 150;

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const Step8Bio = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step8Props) => {
  const { isDark } = useTheme();

  const wordCount    = countWords(data.bio);
  const isNotEmpty   = data.bio.trim().length > 0;
  const hasEnoughWords = wordCount >= MIN_WORDS;

  /* ─── Theme tokens ─── */
  const headingColor = isDark ? "#f0e8de" : "#0f172a";

  const iconWrap: React.CSSProperties = isDark
    ? { background: "rgba(249,115,22,0.12)", color: "#f97316" }
    : { background: "rgba(29,78,216,0.08)", color: "#1d4ed8" };

  const textarea: React.CSSProperties = isDark
    ? {
        background: "#1c1c1c",
        border: "1px solid rgba(249,115,22,0.2)",
        color: "#f0e8de",
      }
    : {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
      };

  const textareaFocusBorder = isDark ? "rgba(249,115,22,0.55)" : "#1d4ed8";
  const textareaFocusShadow = isDark
    ? "0 0 0 3px rgba(249,115,22,0.1)"
    : "0 0 0 3px rgba(29,78,216,0.08)";

  const placeholderColor = isDark ? "#4a3520" : "#94a3b8";
  const charCountColor   = isDark ? "#4a3520" : "#94a3b8";

  const wordCountColor = () => {
    if (!isNotEmpty) return isDark ? "#4a3520" : "#94a3b8";
    if (wordCount < MIN_WORDS) return "#f59e0b";
    return isDark ? "#f97316" : "#1d4ed8";
  };

  const getWordCountMessage = () => {
    if (!isNotEmpty) return null;
    if (wordCount < MIN_WORDS) {
      const remaining = MIN_WORDS - wordCount;
      return `${remaining} more word${remaining !== 1 ? "s" : ""} needed`;
    }
    return "Looks good!";
  };

  const minWordHint = isDark ? "#4a3520" : "#94a3b8";
  const message = getWordCountMessage();

  return (
    <StepLayout
      currentStep={8}
      totalSteps={8}
      title="Express Yourself"
      subtitle="Let your personality shine through words"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={hasEnoughWords}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

        <div className="flex items-center gap-2 font-semibold transition-colors duration-300" style={{ color: headingColor }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={iconWrap}
          >
            <PenLine className="w-4 h-4" />
          </div>
          <h3>Your Bio</h3>
        </div>

        <style>{`
          .bio-textarea::placeholder { color: ${placeholderColor}; }
          .bio-textarea:focus {
            border-color: ${textareaFocusBorder} !important;
            box-shadow: ${textareaFocusShadow} !important;
          }
        `}</style>

        <div className="relative">
          <textarea
            value={data.bio}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                onChange({ ...data, bio: e.target.value });
              }
            }}
            placeholder="Tell us a bit about yourself... (e.g., 'Adventure seeker, coffee lover, always looking for the next best hiking spot.')"
            className="bio-textarea w-full min-h-[140px] p-4 rounded-2xl text-sm placeholder:text-opacity-50 focus:outline-none transition-all resize-none shadow-sm"
            style={textarea}
          />
          <div
            className="absolute bottom-3 right-3 text-xs font-medium transition-colors duration-300"
            style={{ color: charCountColor }}
          >
            {data.bio.length}/{MAX_CHARS}
          </div>
        </div>

        {/* Word count feedback */}
        <div className="flex items-center justify-between px-1">
          <span
            className="text-xs font-medium transition-colors duration-200"
            style={{ color: wordCountColor() }}
          >
            {isNotEmpty ? `${wordCount} word${wordCount !== 1 ? "s" : ""}` : ""}
            {message && <span className="ml-2 opacity-80">· {message}</span>}
          </span>
          <span
            className="text-xs transition-colors duration-300"
            style={{ color: minWordHint }}
          >
            Minimum {MIN_WORDS} words required
          </span>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step8Bio;