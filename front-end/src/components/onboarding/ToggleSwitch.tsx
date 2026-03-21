import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const ToggleSwitch = ({
  label,
  checked,
  onChange,
  className,
}: ToggleSwitchProps) => {
  const { isDark } = useTheme();

  const wrapperStyle: React.CSSProperties = isDark
    ? checked
      ? {
          background: "rgba(249,115,22,0.08)",
          border: "2px solid rgba(249,115,22,0.3)",
        }
      : {
          background: "#1c1c1c",
          border: "2px solid rgba(249,115,22,0.12)",
        }
    : checked
    ? {
        background: "rgba(29,78,216,0.05)",
        border: "2px solid rgba(29,78,216,0.25)",
      }
    : {
        background: "#ffffff",
        border: "2px solid #e2e8f0",
      };

  const labelColor = isDark
    ? checked ? "#fb923c" : "#8a6540"
    : checked ? "#1e3a8a" : "#64748b";

  const trackBg = isDark
    ? checked ? "#f97316" : "#2a2a2a"
    : checked ? "#1d4ed8" : "#e2e8f0";

  const trackHoverBg = isDark ? "#3a3a3a" : "#cbd5e1";

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between w-full py-4 px-5 rounded-2xl transition-all duration-200 group",
        className
      )}
      style={wrapperStyle}
      onMouseEnter={(e) => {
        if (!checked) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = isDark
            ? "rgba(249,115,22,0.25)"
            : "rgba(29,78,216,0.2)";
        }
      }}
      onMouseLeave={(e) => {
        if (!checked) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = isDark
            ? "rgba(249,115,22,0.12)"
            : "#e2e8f0";
        }
      }}
    >
      <span
        className="text-sm font-medium transition-colors duration-200"
        style={{ color: labelColor }}
      >
        {label}
      </span>

      {/* Switch track */}
      <div
        className="w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out shrink-0"
        style={{ background: trackBg }}
        onMouseEnter={(e) => {
          if (!checked) (e.currentTarget as HTMLElement).style.background = trackHoverBg;
        }}
        onMouseLeave={(e) => {
          if (!checked) (e.currentTarget as HTMLElement).style.background = trackBg;
        }}
      >
        {/* Switch thumb */}
        <motion.div
          className="w-5 h-5 rounded-full shadow-sm"
          style={{ background: isDark && !checked ? "#3a3a3a" : "#ffffff" }}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
};