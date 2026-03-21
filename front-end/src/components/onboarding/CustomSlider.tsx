import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const CustomSlider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
}: CustomSliderProps) => {
  const { isDark } = useTheme();
  const percentage = ((value - min) / (max - min)) * 100;

  /* ─── Theme tokens ─── */
  const accentColor    = isDark ? "#f97316" : "#1d4ed8";
  const trackBg        = isDark ? "rgba(249,115,22,0.12)" : "#e2e8f0";
  const fillBg         = isDark ? "#f97316" : "#1d4ed8";
  const thumbBorder    = isDark ? "#f97316" : "#1d4ed8";
  const thumbBg        = isDark ? "#1c1c1c" : "#ffffff";
  const thumbShadow    = isDark
    ? "0 2px 12px rgba(249,115,22,0.35)"
    : "0 2px 12px rgba(29,78,216,0.25)";
  const valuePrimary   = isDark ? "#f97316" : "#1d4ed8";
  const valueUnit      = isDark ? "#c4a882" : "#64748b";
  const labelColor     = isDark ? "#8a6540" : "#94a3b8";

  return (
    <div className="space-y-6">
      {/* Value display */}
      <div className="flex justify-center">
        <motion.span
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold transition-colors duration-300"
          style={{ color: valuePrimary }}
        >
          {value}
          <span
            className="text-2xl ml-1 font-semibold transition-colors duration-300"
            style={{ color: valueUnit }}
          >
            {unit}
          </span>
        </motion.span>
      </div>

      <div className="flex items-center gap-4">
        {/* Min label */}
        <span
          className="text-xs font-medium w-12 text-right transition-colors duration-300"
          style={{ color: labelColor }}
        >
          {min} {unit}
        </span>

        {/* Slider track */}
        <div className="relative flex-1 h-2">
          {/* Background track */}
          <div
            className="absolute inset-0 rounded-full transition-colors duration-300"
            style={{ background: trackBg }}
          />

          {/* Active fill */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${percentage}%`, background: fillBg }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Invisible range input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            style={{ accentColor }}
          />

          {/* Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full pointer-events-none z-20 transition-colors duration-300"
            style={{
              left: `calc(${percentage}% - 14px)`,
              background: thumbBg,
              border: `5px solid ${thumbBorder}`,
              boxShadow: thumbShadow,
            }}
            initial={false}
            animate={{ left: `calc(${percentage}% - 14px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Max label */}
        <span
          className="text-xs font-medium w-12 transition-colors duration-300"
          style={{ color: labelColor }}
        >
          {max} {unit}
        </span>
      </div>
    </div>
  );
};