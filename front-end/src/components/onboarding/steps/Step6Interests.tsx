// src/components/onboarding/steps/Step5Interests.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { motion } from "framer-motion";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step5Props {
  data: Pick<OnboardingData, "interests">;
  onChange: (data: Step5Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const interestCategories = [
  {
    title: "Movies & TV",
    emoji: "🎬",
    options: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Documentaries", "Anime", "Reality TV", "Other"],
  },
  {
    title: "Music",
    emoji: "🎵",
    options: ["Pop", "Hip-Hop", "Rock", "Electronic", "R&B", "Country", "Jazz", "Classical", "Other"],
  },
  {
    title: "Sports",
    emoji: "⚽",
    options: ["Football", "Basketball", "Tennis", "Swimming", "Running", "Yoga", "Cycling", "Golf", "Other"],
  },
  {
    title: "Food & Drink",
    emoji: "🍕",
    options: ["Cooking", "Fine Dining", "Street Food", "Coffee", "Wine", "Cocktails", "Vegan", "BBQ", "Other"],
  },
  {
    title: "Hobbies",
    emoji: "🎨",
    options: ["Photography", "Reading", "Gaming", "Art", "Writing", "Gardening", "DIY", "Crafts", "Other"],
  },
  {
    title: "Travel & Adventure",
    emoji: "✈️",
    options: ["Beach", "Mountains", "City Trips", "Backpacking", "Road Trips", "Camping", "Cruises", "Staycations", "Other"],
  },
] as const;

export const Step5Interests = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step5Props) => {
  const { isDark } = useTheme();

  const toggleInterest = (interest: string) => {
    const current = data.interests;
    onChange({
      ...data,
      interests: current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest],
    });
  };

  const selectedCount = data.interests.length;

  /* ─── Theme tokens ─── */
  const stickyBg = isDark
    ? "rgba(20,16,8,0.95)"
    : "rgba(248,249,252,0.95)";
  const stickyBorder  = isDark ? "rgba(249,115,22,0.1)" : "#e2e8f0";
  const countLabelColor = isDark ? "#8a6540" : "#64748b";
  const countNumColor   = isDark ? "#f97316" : "#1d4ed8";
  const countWordColor  = isDark ? "#4a3520" : "#94a3b8";
  const catLabelColor   = isDark ? "#f0e8de" : "#0f172a";

  return (
    <StepLayout
      currentStep={5}
      totalSteps={7}
      title="What are you into?"
      subtitle="Pick your interests to help find better matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-6">

        {/* Sticky counter header */}
        <div
          className="sticky top-0 z-20 backdrop-blur-sm pb-4 pt-1 -mx-10 px-10 transition-all duration-300"
          style={{
            background: stickyBg,
            borderBottom: `1px solid ${stickyBorder}`,
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-sm font-medium transition-colors duration-300"
              style={{ color: countLabelColor }}
            >
              Select all that apply
            </span>
            <motion.div
              key={selectedCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5"
            >
              <span
                className="text-sm font-bold transition-colors duration-300"
                style={{ color: countNumColor }}
              >
                {selectedCount}
              </span>
              <span
                className="text-sm font-medium transition-colors duration-300"
                style={{ color: countWordColor }}
              >
                selected
              </span>
            </motion.div>
          </div>
        </div>

        {/* Category list */}
        <div className="space-y-8 pb-4">
          {interestCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.emoji}</span>
                <label
                  className="text-base font-semibold transition-colors duration-300"
                  style={{ color: catLabelColor }}
                >
                  {category.title}
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {category.options.map((interest) => (
                  <ChipSelector
                    key={interest}
                    label={interest}
                    selected={data.interests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
};

export default Step5Interests;