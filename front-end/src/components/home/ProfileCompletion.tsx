import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2, Flame } from "lucide-react";
import { profileService } from "@/services/profileService";

interface OnboardingData {
  firstName?: string;
  dateOfBirth?: Date | null;
  gender?: string;
  interests?: string[];
  location?: string;
  bio?: string;
  drinking?: string;
  smoking?: string;
  workout?: string;
  pets?: string;
  communicationStyle?: string[];
  responsePace?: string;
  interestedIn?: string[];
  distance?: number;
  relationshipType?: string;
}

const STEP_MAP: Record<number, number> = {
  1: 1,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
};

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const [percentage, setPercentage]           = useState(0);
  const [nextStep, setNextStep]               = useState(1);
  const [isFullyComplete, setIsFullyComplete] = useState(false);
  const [loading, setLoading]                 = useState(true);
  const [missingFields, setMissingFields]     = useState<string[]>([]);

  useEffect(() => { fetchProfileCompletion(); }, []);

  const fetchProfileCompletion = async () => {
    try {
      setLoading(true);
      const result = await profileService.getProfile();

      if (!result.exists || !result.data) {
        setPercentage(0);
        setNextStep(1);
        setIsFullyComplete(false);
        setMissingFields(["All fields"]);
        return;
      }

      const data: OnboardingData = result.data;

      const steps = [
        {
          id: 1, onboardingStep: STEP_MAP[1],
          valid: !!data.firstName?.trim() && !!data.dateOfBirth && !!data.gender?.trim() && (data.interestedIn || []).length > 0,
          label: "Basic Info",
        },
        {
          id: 2, onboardingStep: STEP_MAP[2],
          valid: typeof data.distance === "number" && data.distance > 0,
          label: "Distance Preferences",
        },
        {
          id: 3, onboardingStep: STEP_MAP[3],
          valid: !!data.drinking?.trim() && !!data.smoking?.trim() && !!data.workout?.trim() && !!data.pets?.trim(),
          label: "Lifestyle",
        },
        {
          id: 4, onboardingStep: STEP_MAP[4],
          valid: (data.communicationStyle || []).length > 0 && !!data.responsePace?.trim(),
          label: "Communication Style",
        },
        {
          id: 5, onboardingStep: STEP_MAP[5],
          valid: (data.interests || []).length > 0,
          label: "Interests",
        },
        {
          id: 6, onboardingStep: STEP_MAP[6],
          valid: !!data.location?.trim(),
          label: "Location",
        },
        {
          id: 7, onboardingStep: STEP_MAP[7],
          valid: !!data.bio?.trim() && data.bio.trim().split(/\s+/).filter(Boolean).length >= 10,
          label: "Bio",
        },
        {
          id: 8, onboardingStep: STEP_MAP[8],
          valid: true,
          label: "Social Accounts (Optional)",
        },
      ];

      const totalDataSteps = steps.length;
      const completedSteps = steps.filter((s) => s.valid).length;
      const pct = Math.min(100, Math.round((completedSteps / totalDataSteps) * 100));
      setPercentage(pct);

      const missing = steps.filter((s) => !s.valid).map((s) => s.label);
      setMissingFields(missing);

      const firstIncomplete = steps.find((s) => !s.valid);
      if (firstIncomplete) {
        setNextStep(firstIncomplete.onboardingStep);
        setIsFullyComplete(false);
      } else {
        setNextStep(10);
        setIsFullyComplete(true);
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
      setPercentage(0);
      setNextStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    navigate("/onboarding", { state: { startStep: nextStep } });
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div
        className="mb-6 p-6 rounded-[24px] relative overflow-hidden border"
        style={{
          background: "linear-gradient(145deg, #1a1a1a, #130e06)",
          borderColor: "rgba(249,115,22,0.18)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#f97316" }} />
        </div>
      </div>
    );
  }

  /* ─── Fully complete ─── */
  if (isFullyComplete) {
    return (
      <>
        <style>{`
          @keyframes completePulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
            50%     { box-shadow: 0 0 0 8px rgba(249,115,22,0.08); }
          }
          @keyframes checkBounce {
            0%,100% { transform: scale(1) rotate(0deg); }
            50%     { transform: scale(1.12) rotate(-4deg); }
          }
        `}</style>
        <div
          className="mb-6 p-6 rounded-[24px] relative overflow-hidden border flex flex-col items-center text-center"
          style={{
            background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
            borderColor: "rgba(249,115,22,0.28)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            animation: "completePulse 3s ease-in-out infinite",
          }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.5) 50%, transparent 90%)" }}
          />
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.07) 0%, transparent 70%)" }}
          />

          <div
            className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3 border"
            style={{
              background: "rgba(249,115,22,0.12)",
              borderColor: "rgba(249,115,22,0.4)",
              boxShadow: "0 0 20px rgba(249,115,22,0.25)",
              animation: "checkBounce 3s ease-in-out infinite",
            }}
          >
            <CheckCircle2 className="w-6 h-6" style={{ color: "#fb923c" }} />
          </div>

          <h3 className="font-bold text-lg mb-1 relative z-10" style={{ color: "#f0e8de" }}>
            Profile Complete! 🔥
          </h3>
          <p className="text-xs mb-4 relative z-10" style={{ color: "#c4a882" }}>
            Your profile looks great. You're ready to match!
          </p>

          <button
            onClick={handleCompleteProfile}
            className="relative z-10 px-6 py-2.5 rounded-full text-xs font-bold text-white transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
              boxShadow: "0 4px 16px rgba(194,65,12,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(249,115,22,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(194,65,12,0.4)";
            }}
          >
            Review Profile
          </button>
        </div>
      </>
    );
  }

  /* ─── Incomplete ─── */
  return (
    <>
      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: ${percentage}%; }
        }
        @keyframes barGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
          50%     { box-shadow: 0 0 8px 2px rgba(249,115,22,0.3); }
        }
      `}</style>

      <div
        className="mb-6 p-6 rounded-[24px] relative overflow-hidden border"
        style={{
          background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
          borderColor: "rgba(249,115,22,0.18)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.025)",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.38) 50%, transparent 90%)" }}
        />

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="block text-sm font-bold" style={{ color: "#f0e8de" }}>
              Profile Completion
            </span>
            {/* CONTRAST FIX: was text-gray-400 on dark */}
            <span className="text-xs font-medium" style={{ color: "#8a6540" }}>
              {missingFields.length} section{missingFields.length !== 1 ? "s" : ""} remaining
            </span>
          </div>
          <span
            className="text-lg font-black bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #fb923c, #fbbf24)" }}
          >
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-3 rounded-full overflow-hidden mb-4"
          style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.12)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(90deg, #c2410c, #f97316, #fb923c)",
              transition: "width 1s cubic-bezier(.22,1,.36,1)",
              animation: "barGlow 2.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: 8 }).map((_, i) => {
            const stepPct = ((i + 1) / 8) * 100;
            const filled = percentage >= stepPct;
            const active = !filled && percentage >= (i / 8) * 100;
            return (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{
                  background: filled
                    ? "linear-gradient(90deg, #f97316, #fb923c)"
                    : active
                    ? "rgba(249,115,22,0.4)"
                    : "rgba(249,115,22,0.1)",
                }}
              />
            );
          })}
        </div>

        {/* Missing fields */}
        {missingFields.length > 0 && missingFields.length <= 3 && (
          <div
            className="mb-4 p-3 rounded-xl border"
            style={{
              background: "rgba(249,115,22,0.06)",
              borderColor: "rgba(249,115,22,0.2)",
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "#fb923c" }}>
              Next steps:
            </p>
            <ul className="text-xs space-y-0.5" style={{ color: "#c4a882" }}>
              {missingFields.map((field, idx) => (
                <li key={idx}>• {field}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCompleteProfile}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wide text-white transition-all duration-200 group active:scale-95"
          style={{
            background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
            boxShadow: "0 4px 18px rgba(194,65,12,0.4)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(249,115,22,0.55)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(194,65,12,0.4)";
          }}
        >
          <span>Continue Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </>
  );
};

export default ProfileCompletion;