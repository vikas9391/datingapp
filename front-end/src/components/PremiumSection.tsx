import React from "react";
import { Sparkles, Crown, Zap } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface PremiumSectionProps {
  onGoPremium: () => void;
}

const plans = [
  {
    key: "starter",
    label: "Starter",
    icon: "⚡",
    matches: 4,
    duration: "60 days",
    price: "₹299",
    highlight: false,
  },
  {
    key: "premier",
    label: "Premier",
    icon: "👑",
    matches: 8,
    duration: "6 Months",
    price: "₹499",
    highlight: true,
  },
  {
    key: "special",
    label: "Special",
    icon: "✨",
    matches: 20,
    duration: "12 Months",
    price: "₹999",
    highlight: false,
  },
] as const;

const PremiumSection: React.FC<PremiumSectionProps> = ({ onGoPremium }) => {
  const { isDark } = useTheme();

  /* ─── Token sets ─── */
  const t = isDark ? {
    sectionBg:    "linear-gradient(145deg, #181108 0%, #100c04 100%)",
    sectionBorder:"rgba(249,115,22,0.2)",
    sectionShadow:"0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)",
    topAccent:    "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.45) 50%, transparent 92%)",
    cornerGlow:   "radial-gradient(circle at top right, rgba(249,115,22,0.09) 0%, transparent 65%)",
    titleColor:   "#f0e8de",
    titleGrad:    "linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #f97316 100%)",
    iconColor:    "#f97316",
    // card idle
    cardBg:       "linear-gradient(145deg, #1e1e1e 0%, #160f06 100%)",
    cardBorder:   "rgba(249,115,22,0.18)",
    cardShadow:   "0 4px 20px rgba(0,0,0,0.35)",
    cardLabel:    "#f0e8de",
    cardBody:     "#c4a882",
    cardStrong:   "#fb923c",
    // card highlight (premier)
    hCardBg:      "linear-gradient(145deg, #2a1406 0%, #1e0f04 100%)",
    hCardBorder:  "#f97316",
    hCardShadow:  "0 8px 32px rgba(249,115,22,0.25)",
    hBadgeBg:     "rgba(249,115,22,0.15)",
    hBadgeBorder: "rgba(249,115,22,0.35)",
    hBadgeText:   "#fbbf24",
    // price
    priceBg:      "linear-gradient(135deg, #c2410c, #f97316)",
    priceText:    "#ffffff",
    priceShadow:  "0 4px 12px rgba(194,65,12,0.45)",
    // button
    btnBg:        "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)",
    btnShadow:    "0 6px 24px rgba(194,65,12,0.5)",
    btnText:      "#ffffff",
    btnHoverShadow:"0 8px 32px rgba(249,115,22,0.6)",
  } : {
    sectionBg:    "#ffffff",
    sectionBorder:"rgba(29,78,216,0.12)",
    sectionShadow:"0 8px 40px rgba(29,78,216,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    topAccent:    "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.3) 50%, transparent 92%)",
    cornerGlow:   "radial-gradient(circle at top right, rgba(59,130,246,0.06) 0%, transparent 65%)",
    titleColor:   "#0f172a",
    titleGrad:    "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #1d4ed8 100%)",
    iconColor:    "#1d4ed8",
    // card idle
    cardBg:       "#f8f9fc",
    cardBorder:   "rgba(29,78,216,0.1)",
    cardShadow:   "0 2px 12px rgba(29,78,216,0.06)",
    cardLabel:    "#0f172a",
    cardBody:     "#64748b",
    cardStrong:   "#1d4ed8",
    // card highlight
    hCardBg:      "linear-gradient(145deg, #eff6ff 0%, #f8faff 100%)",
    hCardBorder:  "#1d4ed8",
    hCardShadow:  "0 8px 32px rgba(29,78,216,0.15)",
    hBadgeBg:     "rgba(29,78,216,0.08)",
    hBadgeBorder: "rgba(29,78,216,0.25)",
    hBadgeText:   "#1d4ed8",
    // price
    priceBg:      "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    priceText:    "#ffffff",
    priceShadow:  "0 4px 12px rgba(29,78,216,0.3)",
    // button
    btnBg:        "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
    btnShadow:    "0 6px 24px rgba(29,78,216,0.35)",
    btnText:      "#ffffff",
    btnHoverShadow:"0 8px 32px rgba(29,78,216,0.5)",
  };

  return (
    <>
      <style>{`
        .ps-section {
          padding: 1.5rem 1rem;
        }
        .ps-card {
          position: relative;
          border-radius: 1.5rem;
          padding: 2rem;
          overflow: hidden;
          background: ${t.sectionBg};
          border: 1px solid ${t.sectionBorder};
          box-shadow: ${t.sectionShadow};
          transition: all 0.3s;
        }
        .ps-top-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: ${t.topAccent};
          pointer-events: none;
        }
        .ps-corner-glow {
          position: absolute;
          top: 0; right: 0;
          width: 200px; height: 200px;
          background: ${t.cornerGlow};
          pointer-events: none;
        }
        .ps-title {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: ${t.titleColor};
          position: relative;
          z-index: 1;
        }
        .ps-title-grad {
          background: ${t.titleGrad};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ps-plans {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.875rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 640px) {
          .ps-plans { grid-template-columns: repeat(3, 1fr); }
        }
        .ps-plan {
          border-radius: 1rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .ps-plan-idle {
          background: ${t.cardBg};
          border: 1px solid ${t.cardBorder};
          box-shadow: ${t.cardShadow};
        }
        .ps-plan-idle:hover {
          border-color: ${isDark ? "rgba(249,115,22,0.4)" : "rgba(29,78,216,0.3)"};
          transform: translateY(-2px);
        }
        .ps-plan-highlight {
          background: ${t.hCardBg};
          border: 2px solid ${t.hCardBorder};
          box-shadow: ${t.hCardShadow};
        }
        .ps-plan-highlight:hover { transform: translateY(-2px); }
        .ps-plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ps-plan-label {
          font-weight: 800;
          font-size: 1rem;
          color: ${t.cardLabel};
          transition: color 0.3s;
        }
        .ps-plan-emoji { font-size: 1.25rem; }
        .ps-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.625rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          background: ${t.hBadgeBg};
          border: 1px solid ${t.hBadgeBorder};
          color: ${t.hBadgeText};
        }
        .ps-plan-body {
          font-size: 0.8125rem;
          color: ${t.cardBody};
          line-height: 1.5;
          transition: color 0.3s;
        }
        .ps-plan-body strong { color: ${t.cardStrong}; font-weight: 700; }
        .ps-plan-duration {
          font-size: 0.75rem;
          color: ${isDark ? "#4a3520" : "#94a3b8"};
          margin-top: 0.1rem;
          transition: color 0.3s;
        }
        .ps-price {
          align-self: flex-start;
          padding: 0.4rem 0.875rem;
          border-radius: 9999px;
          font-weight: 900;
          font-size: 1rem;
          color: ${t.priceText};
          background: ${t.priceBg};
          box-shadow: ${t.priceShadow};
          letter-spacing: 0.01em;
        }
        .ps-btn {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          border-radius: 9999px;
          font-weight: 900;
          font-size: 1rem;
          color: ${t.btnText};
          background: ${t.btnBg};
          box-shadow: ${t.btnShadow};
          border: none;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .ps-btn:hover {
          box-shadow: ${t.btnHoverShadow};
          transform: translateY(-1px) scale(1.01);
        }
        .ps-btn:active { transform: scale(0.98); }
      `}</style>

      <section className="ps-section">
        <div className="ps-card">
          <div className="ps-top-accent" />
          <div className="ps-corner-glow" />

          <h3 className="ps-title">
            <Crown className="w-6 h-6" style={{ color: t.iconColor }} />
            <span className="ps-title-grad">Unlock Premium</span>
          </h3>

          <div className="ps-plans">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`ps-plan ${plan.highlight ? "ps-plan-highlight" : "ps-plan-idle"}`}
              >
                <div className="ps-plan-header">
                  <span className="ps-plan-label">{plan.label}</span>
                  {plan.highlight ? (
                    <span className="ps-badge">
                      <Sparkles style={{ width: 10, height: 10 }} />
                      Popular
                    </span>
                  ) : (
                    <span className="ps-plan-emoji">{plan.icon}</span>
                  )}
                </div>

                <div>
                  <p className="ps-plan-body">
                    Unlimited requests until you get{" "}
                    <strong>{plan.matches} New Matches</strong>
                  </p>
                  <p className="ps-plan-duration">
                    Receive unlimited requests ({plan.duration})
                  </p>
                </div>

                <div className="ps-price">{plan.price}</div>
              </div>
            ))}
          </div>

          <button className="ps-btn" onClick={onGoPremium}>
            <Zap className="w-4 h-4 fill-current" />
            Go Premium
          </button>
        </div>
      </section>
    </>
  );
};

export default PremiumSection;