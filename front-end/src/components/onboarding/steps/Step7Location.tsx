// src/components/onboarding/steps/Step6Location.tsx
import { useState } from "react";
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { MapPin, Navigation, Lock, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step6Props {
  data: Pick<OnboardingData, "location" | "useCurrentLocation">;
  onChange: (data: Step6Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

export const Step6Location = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step6Props) => {
  const { isDark } = useTheme();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        { headers: { "User-Agent": "DatingApp/1.0" } }
      );
      if (!response.ok) throw new Error("Failed to fetch location details");
      const result = await response.json();
      const address = result.address;
      const city =
        address.city || address.town || address.village ||
        address.municipality || address.county || "Unknown location";
      const country = address.country || "";
      return country ? `${city}, ${country}` : city;
    } catch {
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  };

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const cityName = await getCityFromCoordinates(latitude, longitude);
          onChange({ location: cityName, useCurrentLocation: true, latitude, longitude } as any);
          setIsLoadingLocation(false);
        } catch {
          setLocationError("Failed to get your location details");
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        if (error.code === 3) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const cityName = await getCityFromCoordinates(latitude, longitude);
                onChange({ location: cityName, useCurrentLocation: true } as any);
                setIsLoadingLocation(false);
              } catch {
                setLocationError("Failed to get your location details");
                setIsLoadingLocation(false);
              }
            },
            (error2) => {
              setIsLoadingLocation(false);
              const msgs: Record<number, string> = {
                1: "Location permission denied. Please enable location access in your browser settings.",
                2: "Location information is unavailable. Please enter your city manually.",
                3: "Location request timed out. Please try again or enter your city manually.",
              };
              setLocationError(msgs[error2.code] ?? "Could not get your location. Please enter your city manually.");
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
          );
        } else {
          setIsLoadingLocation(false);
          const msgs: Record<number, string> = {
            1: "Location permission denied. Please enable location access in your browser settings.",
            2: "Location information is unavailable. Please enter your city manually.",
          };
          setLocationError(msgs[error.code] ?? "Could not get your location. Please enter your city manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  /* ─── Theme tokens ─── */
  const iconCircleBg = isDark
    ? "linear-gradient(135deg, #c2410c, #f97316)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";
  const iconCircleShadow = isDark
    ? "0 8px 28px rgba(194,65,12,0.4)"
    : "0 8px 28px rgba(29,78,216,0.25)";

  const dividerColor = isDark ? "rgba(249,115,22,0.15)" : "#e2e8f0";
  const dividerText  = isDark ? "#4a3520" : "#94a3b8";

  /* Location button */
  const locBtnActive: React.CSSProperties = isDark
    ? { border: "2px solid #f97316", background: "rgba(249,115,22,0.08)", color: "#fb923c" }
    : { border: "2px solid #1d4ed8", background: "rgba(29,78,216,0.05)", color: "#1d4ed8" };

  const locBtnIdle: React.CSSProperties = isDark
    ? { border: "2px solid rgba(249,115,22,0.2)", background: "#1c1c1c", color: "#c4a882" }
    : { border: "2px solid #e2e8f0", background: "#ffffff", color: "#1d4ed8" };

  const locBtnHoverBorder = isDark ? "rgba(249,115,22,0.5)" : "#93c5fd";
  const locBtnHoverBg     = isDark ? "rgba(249,115,22,0.06)" : "#f8faff";

  /* Privacy box */
  const privacyBox: React.CSSProperties = isDark
    ? { background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.18)" }
    : { background: "rgba(29,78,216,0.04)", border: "1px solid rgba(29,78,216,0.12)" };

  const lockCircle: React.CSSProperties = isDark
    ? { background: "#242424", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }
    : { background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };

  const lockIconColor  = isDark ? "#f97316" : "#1d4ed8";
  const privacyTitle   = isDark ? "#f0e8de" : "#0f172a";
  const privacyBody    = isDark ? "#8a6540" : "#64748b";

  /* Tips box */
  const tipsBox: React.CSSProperties = isDark
    ? { background: "#1c1c1c", border: "1px solid rgba(249,115,22,0.12)" }
    : { background: "#f8f9fc", border: "1px solid #e2e8f0" };

  const tipsTitle = isDark ? "#c4a882" : "#374151";
  const tipsBody  = isDark ? "#8a6540" : "#4b5563";

  return (
    <StepLayout
      currentStep={6}
      totalSteps={10}
      title="Where are you?"
      subtitle="Help us show you people nearby"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={data.location.trim() !== "" || data.useCurrentLocation}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-8">

        {/* Bouncing icon */}
        <div className="flex justify-center py-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ background: iconCircleBg, boxShadow: iconCircleShadow }}
          >
            <MapPin className="w-10 h-10 text-white fill-white" />
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Text input */}
          <div className={isLoadingLocation ? "opacity-50 pointer-events-none" : ""}>
            <TextInput
              value={data.location}
              onChange={(location) =>
                onChange({ ...data, location, useCurrentLocation: false })
              }
              placeholder="Enter your city"
              icon={<MapPin className="w-5 h-5" style={{ color: isDark ? "#8a6540" : "#94a3b8" }} />}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px" style={{ background: dividerColor }} />
            <span className="text-sm font-medium" style={{ color: dividerText }}>or</span>
            <div className="flex-1 h-px" style={{ background: dividerColor }} />
          </div>

          {/* Use current location button */}
          <motion.button
            whileHover={{ scale: isLoadingLocation ? 1 : 1.01 }}
            whileTap={{ scale: isLoadingLocation ? 1 : 0.98 }}
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl transition-all duration-200 font-semibold outline-none"
            style={
              isLoadingLocation
                ? { ...locBtnIdle, opacity: 0.7, cursor: "not-allowed" }
                : data.useCurrentLocation
                ? locBtnActive
                : locBtnIdle
            }
            onMouseEnter={(e) => {
              if (!isLoadingLocation && !data.useCurrentLocation) {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = locBtnHoverBorder;
                el.style.background  = locBtnHoverBg;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoadingLocation && !data.useCurrentLocation) {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = locBtnIdle.border?.toString().split(" ")[2] ?? "";
                el.style.background  = locBtnIdle.background as string;
              }
            }}
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Getting your location...</span>
              </>
            ) : (
              <>
                <Navigation
                  className="w-5 h-5"
                  style={data.useCurrentLocation ? { fill: "currentColor" } : {}}
                />
                <span>Use my current location</span>
              </>
            )}
          </motion.button>

          {/* Error message */}
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4"
              style={isDark
                ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }
                : { background: "#fffbeb", border: "1px solid #fde68a" }
              }
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: isDark ? "#fbbf24" : "#92400e" }}>
                    Location unavailable
                  </p>
                  <p className="text-sm" style={{ color: isDark ? "#c4a882" : "#78350f" }}>
                    {locationError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Privacy note */}
        <div className="mt-8 rounded-xl p-4 transition-all duration-300" style={privacyBox}>
          <div className="flex gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
              style={lockCircle}
            >
              <Lock className="w-5 h-5" style={{ color: lockIconColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5 transition-colors duration-300" style={{ color: privacyTitle }}>
                Your privacy is protected
              </p>
              <p className="text-xs leading-relaxed transition-colors duration-300" style={{ color: privacyBody }}>
                We use your location to show you people nearby. Your exact location is never shared with other users.
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl p-4 transition-all duration-300" style={tipsBox}>
          <p className="text-xs font-semibold mb-2 transition-colors duration-300" style={{ color: tipsTitle }}>
            💡 Tip: Having trouble with location?
          </p>
          <ul className="text-xs space-y-1.5 transition-colors duration-300" style={{ color: tipsBody }}>
            <li>• Make sure location services are enabled in your browser</li>
            <li>• Check if your device's location is turned on</li>
            <li>• You can always enter your city manually instead</li>
          </ul>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step6Location;