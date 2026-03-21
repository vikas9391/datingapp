// src/components/onboarding/steps/Step10Review.tsx
import React from "react";
import { motion } from "framer-motion";
import { differenceInYears } from "date-fns";
import StepLayout from "../StepLayout";
import { MapPin, Sparkles, MessageCircle, Quote } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step10Props {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const getEmoji = (category: string, value: string) => {
  const map: Record<string, Record<string, string>> = {
    drinking: { Never: "🚫", Socially: "🍷", Regularly: "🍻" },
    smoking:  { Never: "🚭", Sometimes: "💨", Regularly: "🚬" },
    workout:  { Never: "🛋️", Sometimes: "🚶", Often: "💪", Daily: "✨" },
    pets:     { "Own pets": "🐾", "Love pets": "❤️", Allergic: "🤧", None: "🚫" },
  };
  return map[category]?.[value] || "✨";
};

const Step10Review: React.FC<Step10Props> = ({
  data,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}) => {
  const { isDark } = useTheme();

  const age          = data.dateOfBirth ? differenceInYears(new Date(), data.dateOfBirth) : null;
  const safeFirst    = data.firstName || "User";
  const firstInitial = (safeFirst.charAt(0) || "U").toUpperCase();
  const mainPhoto    = data.photos && data.photos.length > 0 ? data.photos[0] : null;

  const lifestyleTags = [
    { label: data.drinking, emoji: getEmoji("drinking", data.drinking), visible: !!data.drinking },
    { label: data.smoking,  emoji: getEmoji("smoking",  data.smoking),  visible: !!data.smoking  },
    { label: data.workout,  emoji: getEmoji("workout",  data.workout),  visible: !!data.workout  },
    { label: data.pets,     emoji: getEmoji("pets",     data.pets),     visible: !!data.pets     },
  ].filter((t) => t.visible);

  /* ─── Theme tokens ─── */
  const card: React.CSSProperties = isDark
    ? {
        background: "linear-gradient(145deg, #1a1a1a 0%, #141008 100%)",
        border: "1px solid rgba(249,115,22,0.18)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }
    : {
        background: "#ffffff",
        border: "1px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      };

  /* Avatar (no photo) */
  const avatarGrad = isDark
    ? "linear-gradient(135deg, #c2410c, #f97316)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";
  const avatarShadow = isDark
    ? "0 4px 16px rgba(194,65,12,0.4)"
    : "0 4px 16px rgba(29,78,216,0.25)";
  const avatarPhotoBorder = isDark ? "#f97316" : "#1d4ed8";

  const nameColor   = isDark ? "#f0e8de" : "#0f172a";
  const genderColor = isDark ? "#8a6540" : "#64748b";

  /* Bio box */
  const bioBox: React.CSSProperties = isDark
    ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(249,115,22,0.1)" }
    : { background: "#f8f9fc", border: "1px solid #f1f5f9" };
  const bioQuote  = isDark ? "rgba(249,115,22,0.2)" : "#cbd5e1";
  const bioText   = isDark ? "#c4a882" : "#374151";

  /* Conversation starter */
  const csBox: React.CSSProperties = isDark
    ? { background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }
    : { background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.1)" };
  const csLabel  = isDark ? "#f97316" : "#1d4ed8";
  const csText   = isDark ? "#fb923c" : "#1e3a8a";

  /* Detail rows */
  const detailIcon  = isDark ? "#f97316" : "#1d4ed8";
  const detailText  = isDark ? "#c4a882" : "#374151";
  const detailPipe  = isDark ? "rgba(249,115,22,0.2)" : "#cbd5e1";
  const detailBold  = isDark ? "#f0e8de" : "#0f172a";

  /* Section divider */
  const sectionDivider = isDark ? "rgba(249,115,22,0.1)" : "#f1f5f9";
  const sectionLabel   = isDark ? "#8a6540" : "#94a3b8";

  /* Lifestyle tags */
  const lifestyleTag: React.CSSProperties = isDark
    ? { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(249,115,22,0.1)", color: "#c4a882" }
    : { background: "#f8f9fc", border: "1px solid #e2e8f0", color: "#374151" };

  /* Interest tags */
  const interestTag: React.CSSProperties = isDark
    ? { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", color: "#fb923c" }
    : { background: "rgba(29,78,216,0.05)", border: "1px solid rgba(29,78,216,0.12)", color: "#1d4ed8" };

  const footerHint = isDark ? "#4a3520" : "#94a3b8";

  return (
    <StepLayout
      currentStep={10}
      totalSteps={10}
      title="Looking good! ✨"
      subtitle="Here's your profile preview"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      nextLabel="Finish & Start Matching"
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 overflow-hidden transition-all duration-300"
          style={card}
        >
          {/* Avatar + name */}
          <div className="flex items-start gap-5 mb-6">
            <div className="shrink-0">
              {mainPhoto ? (
                <div
                  className="w-20 h-20 rounded-full overflow-hidden"
                  style={{ border: `4px solid ${avatarPhotoBorder}`, boxShadow: avatarShadow }}
                >
                  <img src={mainPhoto} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ background: avatarGrad, boxShadow: avatarShadow }}
                >
                  {firstInitial}
                </div>
              )}
            </div>

            <div className="pt-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 transition-colors duration-300" style={{ color: nameColor }}>
                {safeFirst}, {age}
              </h2>
              {data.showGender && data.gender && (
                <p className="font-medium transition-colors duration-300" style={{ color: genderColor }}>
                  {data.gender}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {data.bio && (
            <div className="mb-6 p-4 rounded-2xl relative transition-all duration-300" style={bioBox}>
              <Quote
                className="absolute top-2 left-2 w-4 h-4 -scale-x-100"
                style={{ color: bioQuote }}
              />
              <p
                className="text-sm italic leading-relaxed text-center px-4 transition-colors duration-300"
                style={{ color: bioText }}
              >
                {data.bio}
              </p>
              <Quote className="absolute bottom-2 right-2 w-4 h-4" style={{ color: bioQuote }} />
            </div>
          )}

          {/* Conversation starter */}
          {(data as any).conversationStarter && (
            <div className="mb-8">
              <div className="rounded-xl p-4 transition-all duration-300" style={csBox}>
                <h3
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-1.5 transition-colors duration-300"
                  style={{ color: csLabel }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Conversation Starter
                </h3>
                <p
                  className="text-sm font-semibold leading-snug transition-colors duration-300"
                  style={{ color: csText }}
                >
                  "{(data as any).conversationStarter}"
                </p>
              </div>
            </div>
          )}

          {/* Detail rows */}
          <div className="space-y-3 mb-6 px-1">
            <div className="flex items-center gap-3 text-sm transition-colors duration-300" style={{ color: detailText }}>
              <MapPin className="w-4 h-4 shrink-0" style={{ color: detailIcon }} />
              <span>
                {data.useCurrentLocation ? "Using current location" : data.location || "Location not set"}
                <span className="mx-2" style={{ color: detailPipe }}>|</span>
                {data.distance} km away max
              </span>
            </div>

            {data.interestedIn.length > 0 && (
              <div className="flex items-center gap-3 text-sm transition-colors duration-300" style={{ color: detailText }}>
                <Sparkles className="w-4 h-4 shrink-0" style={{ color: detailIcon }} />
                <span>
                  Looking for:{" "}
                  <span className="font-medium transition-colors duration-300" style={{ color: detailBold }}>
                    {data.interestedIn.join(", ")}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Lifestyle */}
          {lifestyleTags.length > 0 && (
            <div className="mb-6 pt-4" style={{ borderTop: `1px solid ${sectionDivider}` }}>
              <h3
                className="text-[10px] font-bold uppercase tracking-wider mb-3 transition-colors duration-300"
                style={{ color: sectionLabel }}
              >
                Lifestyle
              </h3>
              <div className="flex flex-wrap gap-2">
                {lifestyleTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                    style={lifestyleTag}
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.interests.length > 0 && (
            <div>
              <h3
                className="text-[10px] font-bold uppercase tracking-wider mb-3 transition-colors duration-300"
                style={{ color: sectionLabel }}
              >
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300"
                    style={interestTag}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <p
          className="text-center text-xs transition-colors duration-300"
          style={{ color: footerHint }}
        >
          You can always update your profile later in settings
        </p>
      </div>
    </StepLayout>
  );
};

export default Step10Review;