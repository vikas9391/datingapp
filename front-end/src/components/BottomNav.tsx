import { NavLink } from "react-router-dom";
import { Home, MessageCircle, Bell, Coffee } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const navItems = [
  { to: "/",             Icon: Home,          label: "Home"          },
  { to: "/chats",        Icon: MessageCircle, label: "Chats"         },
  { to: "/notifications",Icon: Bell,          label: "Notifications" },
  { to: "/cafes",        Icon: Coffee,        label: "Cafés"         },
] as const;

const BottomNav: React.FC = () => {
  const { isDark } = useTheme();

  const t = isDark ? {
    navBg:         "linear-gradient(145deg, #1a1208 0%, #100c04 100%)",
    navBorder:     "rgba(249,115,22,0.2)",
    navShadow:     "0 -4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(249,115,22,0.08)",
    topAccent:     "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.35) 50%, transparent 92%)",
    idleColor:     "#4a3520",
    activeColor:   "#f97316",
    activeBg:      "rgba(249,115,22,0.12)",
    activeBorder:  "rgba(249,115,22,0.25)",
    activeLabel:   "#fb923c",
    hoverColor:    "#8a6540",
    hoverBg:       "rgba(249,115,22,0.06)",
    indicatorBg:   "linear-gradient(135deg, #c2410c, #f97316)",
  } : {
    navBg:         "#ffffff",
    navBorder:     "rgba(29,78,216,0.1)",
    navShadow:     "0 -4px 24px rgba(29,78,216,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
    topAccent:     "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.2) 50%, transparent 92%)",
    idleColor:     "#94a3b8",
    activeColor:   "#1d4ed8",
    activeBg:      "rgba(29,78,216,0.08)",
    activeBorder:  "rgba(29,78,216,0.18)",
    activeLabel:   "#1d4ed8",
    hoverColor:    "#64748b",
    hoverBg:       "rgba(29,78,216,0.04)",
    indicatorBg:   "linear-gradient(135deg, #1d4ed8, #3b82f6)",
  };

  return (
    <>
      <style>{`
        .bn-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 50;
          display: flex;
          align-items: stretch;
          background: ${t.navBg};
          border-top: 1px solid ${t.navBorder};
          box-shadow: ${t.navShadow};
          padding: 0.25rem 0.5rem;
          padding-bottom: calc(0.25rem + env(safe-area-inset-bottom, 0px));
          transition: all 0.3s;
        }
        .bn-nav::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: ${t.topAccent};
          pointer-events: none;
        }
        .bn-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.5rem 0.25rem;
          border-radius: 0.75rem;
          text-decoration: none;
          color: ${t.idleColor};
          font-size: 0.6875rem;
          font-weight: 600;
          transition: all 0.2s;
          position: relative;
          min-height: 3.25rem;
        }
        .bn-item:hover:not(.active) {
          color: ${t.hoverColor};
          background: ${t.hoverBg};
        }
        .bn-item.active {
          color: ${t.activeColor};
          background: ${t.activeBg};
          border: 1px solid ${t.activeBorder};
        }
        .bn-item.active .bn-label {
          color: ${t.activeLabel};
          font-weight: 700;
        }
        .bn-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
        }
        .bn-item.active .bn-icon-wrap::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%; transform: translateX(-50%);
          width: 16px; height: 2px;
          border-radius: 9999px;
          background: ${t.indicatorBg};
        }
        .bn-label {
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: inherit;
          transition: color 0.2s;
        }
      `}</style>

      <nav className="bn-nav">
        {navItems.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `bn-item${isActive ? " active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <div className="bn-icon-wrap">
                  <Icon
                    style={{
                      width: 20,
                      height: 20,
                      strokeWidth: isActive ? 2.5 : 1.75,
                      fill: isActive ? "currentColor" : "none",
                    }}
                  />
                </div>
                <span className="bn-label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer so page content isn't hidden behind the nav */}
      <div style={{ height: "calc(3.75rem + env(safe-area-inset-bottom, 0px))" }} />
    </>
  );
};

export default BottomNav;