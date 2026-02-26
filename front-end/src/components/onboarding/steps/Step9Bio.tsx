// src/components/onboarding/steps/Step8Bio.tsx
import React from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { PenLine } from "lucide-react";

interface Step8Props {
  data: Pick<OnboardingData, "bio">;
  onChange: (data: Step8Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const MIN_WORDS = 10;
const MAX_WORDS = 150; // character limit, not word limit

const countWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const Step8Bio = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step8Props) => {
  const bioCharacterLimit = 150;
  const wordCount = countWords(data.bio);
  const hasEnoughWords = wordCount >= MIN_WORDS;
  const isNotEmpty = data.bio.trim().length > 0;

  const getWordCountColor = () => {
    if (!isNotEmpty) return "text-gray-400";
    if (wordCount < MIN_WORDS) return "text-amber-500";
    return "text-teal-500";
  };

  const getWordCountMessage = () => {
    if (!isNotEmpty) return null;
    if (wordCount < MIN_WORDS) {
      const remaining = MIN_WORDS - wordCount;
      return `${remaining} more word${remaining !== 1 ? "s" : ""} needed`;
    }
    return "Looks good!";
  };

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
    >
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
            <PenLine className="w-4 h-4 text-teal-600" />
          </div>
          <h3>Your Bio</h3>
        </div>

        <div className="relative">
          <textarea
            value={data.bio}
            onChange={(e) => {
              if (e.target.value.length <= bioCharacterLimit) {
                onChange({ ...data, bio: e.target.value });
              }
            }}
            placeholder="Tell us a bit about yourself... (e.g., 'Adventure seeker, coffee lover, always looking for the next best hiking spot.')"
            className="w-full min-h-[140px] p-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none shadow-sm"
          />
          <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400">
            {data.bio.length}/{bioCharacterLimit}
          </div>
        </div>

        {/* Word count feedback */}
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-medium transition-colors ${getWordCountColor()}`}>
            {isNotEmpty ? `${wordCount} word${wordCount !== 1 ? "s" : ""}` : ""}
            {message && (
              <span className="ml-2 opacity-80">· {message}</span>
            )}
          </span>
          <span className="text-xs text-gray-400">
            Minimum {MIN_WORDS} words required
          </span>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step8Bio;