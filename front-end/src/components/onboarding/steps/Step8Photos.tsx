// src/components/onboarding/steps/Step7Photos.tsx
import React, { useState, useEffect } from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { Camera, Trash2, User } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";

interface Step7Props {
  data: Pick<OnboardingData, "photos">;
  onChange: (data: Step7Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const Step7Photos: React.FC<Step7Props> = ({
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
  const [photo, setPhoto] = useState<string | null>(
    data.photos && data.photos.length > 0 ? data.photos[0] : null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (data.photos && data.photos.length > 0) setPhoto(data.photos[0]);
  }, [data.photos]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 5MB.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/profile/upload-photo/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(errorData.detail || "Upload failed");
      }
      const json = await res.json();
      const url = json.url as string;
      setPhoto(url);
      onChange({ photos: [url] });
    } catch (e: any) {
      setUploadError(e.message || "Failed to upload photo");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    onChange({ photos: [] });
  };

  /* ─── Theme tokens ─── */
  const spinnerBorder = isDark ? "#f97316" : "#1d4ed8";

  const circleWithPhoto: React.CSSProperties = isDark
    ? { border: "4px solid #f97316" }
    : { border: "4px solid #1d4ed8" };

  const circleEmpty: React.CSSProperties = isDark
    ? { border: "4px solid rgba(249,115,22,0.2)", background: "#1c1c1c" }
    : { border: "4px solid #e2e8f0", background: "#f8f9fc" };

  const emptyLabelHoverBg = isDark ? "rgba(249,115,22,0.05)" : "#f1f5ff";

  const uploadIconWrap: React.CSSProperties = isDark
    ? { background: "rgba(249,115,22,0.12)", color: "#f97316" }
    : { background: "rgba(29,78,216,0.08)", color: "#1d4ed8" };

  const uploadText = isDark ? "#8a6540" : "#64748b";

  const editBadge: React.CSSProperties = isDark
    ? { background: "#f97316", border: "4px solid #1a1a1a" }
    : { background: "#1d4ed8", border: "4px solid #ffffff" };

  /* Skip button */
  const skipBtn: React.CSSProperties = isDark
    ? { border: "1px solid rgba(249,115,22,0.2)", color: "#8a6540", background: "transparent" }
    : { border: "1px solid #e2e8f0", color: "#64748b", background: "transparent" };

  const skipBtnHover = isDark
    ? { background: "rgba(249,115,22,0.06)", color: "#c4a882", borderColor: "rgba(249,115,22,0.35)" }
    : { background: "#f8faff", color: "#0f172a", borderColor: "#93c5fd" };

  const skipText = isDark ? "#8a6540" : "#64748b";

  /* Error box */
  const errorBox: React.CSSProperties = isDark
    ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }
    : { background: "#fef2f2", border: "1px solid #fecaca" };

  const errorText = isDark ? "#f87171" : "#dc2626";

  return (
    <StepLayout
      currentStep={7}
      totalSteps={10}
      title="Add a Profile Photo"
      subtitle="Put a face to the name! This will be your main profile picture."
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={true}
      nextLabel={photo ? "Looks good, Continue" : "Continue"}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="flex flex-col items-center space-y-8 py-4">

        {/* Upload error */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl p-3 text-center transition-all duration-300"
            style={errorBox}
          >
            <p className="text-sm font-medium" style={{ color: errorText }}>{uploadError}</p>
          </motion.div>
        )}

        {/* Circular uploader */}
        <div className="relative group">
          {uploading && (
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin z-10"
              style={{ borderColor: `${spinnerBorder} transparent transparent transparent` }}
            />
          )}

          <div
            className="w-48 h-48 rounded-full overflow-hidden relative shadow-lg transition-all duration-300"
            style={photo ? circleWithPhoto : circleEmpty}
          >
            {photo ? (
              <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <label
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-200"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = emptyLabelHoverBg)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div className="p-4 rounded-full mb-3 transition-all duration-300" style={uploadIconWrap}>
                  <User className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold transition-colors duration-300" style={{ color: uploadText }}>
                  Upload Photo
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
                  disabled={uploading}
                />
              </label>
            )}

            {/* Overlay actions */}
            {photo && !uploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <label className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white cursor-pointer hover:bg-white/40 transition-colors" title="Change Photo">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
                  />
                </label>
                <button
                  onClick={removePhoto}
                  className="p-3 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Edit badge */}
          {photo && !uploading && (
            <div
              className="absolute bottom-2 right-2 text-white p-2 rounded-full shadow-sm group-hover:opacity-0 transition-opacity duration-200"
              style={editBadge}
            >
              <Camera className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Proceed without photo */}
        {!photo && (
          <div className="text-center space-y-4 w-full">
            <p className="text-sm max-w-xs mx-auto transition-colors duration-300" style={{ color: skipText }}>
              A profile photo helps you make better connections, but it's not required right now.
            </p>

            <button
              onClick={onNext}
              className="w-full py-3 rounded-xl font-medium transition-all duration-200 active:scale-[0.99]"
              style={skipBtn}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                Object.assign(el.style, skipBtnHover);
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background   = skipBtn.background as string;
                el.style.color        = skipBtn.color as string;
                el.style.borderColor  = skipBtn.border?.toString().split(" ")[2] ?? "";
              }}
            >
              Proceed without profile pic
            </button>
          </div>
        )}
      </div>
    </StepLayout>
  );
};

export default Step7Photos;