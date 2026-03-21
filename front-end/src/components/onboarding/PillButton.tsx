// src/components/onboarding/PillButton.tsx
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface PillButtonProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export const PillButton = ({
  label,
  selected = false,
  onClick,
}: PillButtonProps) => {
  const { isDark } = useTheme();

  const selectedStyle: React.CSSProperties = isDark
    ? {
        background: "#f97316",
        borderColor: "#f97316",
        color: "#ffffff",
        boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
      }
    : {
        background: "#1d4ed8",
        borderColor: "#1d4ed8",
        color: "#ffffff",
        boxShadow: "0 2px 8px rgba(29,78,216,0.25)",
      };

  const unselectedStyle: React.CSSProperties = isDark
    ? {
        background: "#1c1c1c",
        borderColor: "rgba(249,115,22,0.25)",
        color: "#c4a882",
      }
    : {
        background: "#ffffff",
        borderColor: "#e2e8f0",
        color: "#0f172a",
      };

  const unselectedHoverBorder = isDark
    ? "rgba(249,115,22,0.6)"
    : "#93c5fd";

  const unselectedHoverColor = isDark ? "#fb923c" : "#1d4ed8";

  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border focus:outline-none"
      style={selected ? selectedStyle : unselectedStyle}
      onMouseEnter={(e) => {
        if (!selected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = unselectedHoverBorder;
          el.style.color = unselectedHoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = unselectedStyle.borderColor as string;
          el.style.color = unselectedStyle.color as string;
        }
      }}
    >
      {label}
    </button>
  );
};

export default PillButton;