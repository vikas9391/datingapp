import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthToken = (): { token: string; type: "Bearer" | "Token" } | null => {
  const jwtKeys   = ["access_token", "accessToken", "jwt", "access"];
  const tokenKeys = ["token", "authToken", "auth_token", "admin_token"];
  for (const key of jwtKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: "Bearer" };
  }
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: "Token" };
  }
  return null;
};

const PremiumBanner: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const authData = getAuthToken();
        if (!authData) { setIsPremium(false); return; }
        const response = await fetch(`${API_BASE}/api/profile/`, {
          headers: { Authorization: `${authData.type} ${authData.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.premium === true);
        } else {
          setIsPremium(false);
        }
      } catch {
        setIsPremium(false);
      }
    };
    checkPremium();
  }, []);

  /* ── Loading skeleton ── */
  if (isPremium === null) {
    return (
      <div
        className="h-full min-h-[180px] w-full rounded-[24px] border transition-all duration-300"
        style={isDark ? {
          background: "linear-gradient(145deg, #1a1a1a, #110c05)",
          borderColor: "rgba(249,115,22,0.18)",
          animation: "shimmerLoad 1.6s infinite linear",
        } : {
          background: "linear-gradient(145deg, #f8faff, #f1f5ff)",
          borderColor: "rgba(29,78,216,0.12)",
          animation: "shimmerLoad 1.6s infinite linear",
        }}
      >
        <style>{`
          @keyframes shimmerLoad {
            0%   { opacity: 0.5; }
            50%  { opacity: 0.8; }
            100% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  /* ════════════════════════════════════════
     PREMIUM ACTIVE — classy gold/blue confirmation
  ════════════════════════════════════════ */
  if (isPremium === true) {
    /* Gold stays for premium in both modes — it's the "premium" signal color */
    return (
      <>
        <style>{`
          @keyframes premiumShimmer {
            0%   { background-position: -400px 0; }
            100% { background-position:  400px 0; }
          }
          @keyframes crownFloat {
            0%,100% { transform: translateY(0) rotate(-3deg); }
            50%     { transform: translateY(-5px) rotate(3deg); }
          }
        `}</style>

        <div
          className="h-full min-h-[180px] w-full rounded-[24px] relative overflow-hidden border transition-all duration-300"
          style={isDark ? {
            background: "linear-gradient(135deg, #1c1408 0%, #2a1a06 40%, #1a1208 100%)",
            borderColor: "rgba(251,191,36,0.35)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.1), inset 0 1px 0 rgba(251,191,36,0.12)",
          } : {
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fffdf0 100%)",
            borderColor: "rgba(245,158,11,0.4)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {/* Animated gold shimmer overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(90deg, transparent 25%, rgba(251,191,36,0.07) 50%, transparent 75%)"
                : "linear-gradient(90deg, transparent 25%, rgba(251,191,36,0.12) 50%, transparent 75%)",
              backgroundSize: "400px 100%",
              animation: "premiumShimmer 3s infinite linear",
            }}
          />
          {/* Radial glow */}
          <div
            className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
            style={{
              background: isDark
                ? "radial-gradient(circle at top left, rgba(251,191,36,0.12) 0%, transparent 65%)"
                : "radial-gradient(circle at top left, rgba(245,158,11,0.1) 0%, transparent 65%)",
            }}
          />
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(90deg, transparent 8%, rgba(251,191,36,0.6) 50%, transparent 92%)"
                : "linear-gradient(90deg, transparent 8%, rgba(245,158,11,0.5) 50%, transparent 92%)",
            }}
          />

          <div className="relative z-10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 h-full">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-2.5 shrink-0 transition-all duration-300"
                style={isDark ? {
                  background: "rgba(251,191,36,0.15)",
                  border: "1px solid rgba(251,191,36,0.35)",
                  boxShadow: "0 0 16px rgba(251,191,36,0.2)",
                } : {
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  boxShadow: "0 0 16px rgba(245,158,11,0.15)",
                }}
              >
                <Crown
                  className="w-6 h-6"
                  style={{
                    color: isDark ? "#fbbf24" : "#d97706",
                    fill: isDark ? "#fbbf24" : "#d97706",
                    animation: "crownFloat 3.5s ease-in-out infinite",
                  }}
                />
              </div>
              <div>
                <div
                  className="text-[10px] font-semibold uppercase tracking-widest mb-0.5 transition-colors duration-300"
                  style={{ color: isDark ? "#d97706" : "#92400e" }}
                >
                  Active Plan
                </div>
                <h3
                  className="text-lg md:text-xl font-black leading-tight transition-colors duration-300"
                  style={{ color: isDark ? "#f0e8de" : "#1c1400" }}
                >
                  Premium Member ✦
                </h3>
                <p
                  className="text-xs md:text-sm mt-0.5 transition-colors duration-300"
                  style={{ color: isDark ? "#c4a882" : "#78350f" }}
                >
                  Unlimited views • See all your likes
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/premium")}
              className="w-full md:w-auto px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all active:scale-95"
              style={isDark ? {
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.4)",
                color: "#fbbf24",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              } : {
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.4)",
                color: "#92400e",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background   = isDark ? "rgba(251,191,36,0.25)" : "rgba(245,158,11,0.22)";
                el.style.borderColor  = isDark ? "rgba(251,191,36,0.6)"  : "rgba(245,158,11,0.6)";
                el.style.boxShadow    = isDark ? "0 4px 16px rgba(251,191,36,0.2)" : "0 4px 16px rgba(245,158,11,0.15)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background   = isDark ? "rgba(251,191,36,0.15)" : "rgba(245,158,11,0.12)";
                el.style.borderColor  = isDark ? "rgba(251,191,36,0.4)"  : "rgba(245,158,11,0.4)";
                el.style.boxShadow    = isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.06)";
              }}
            >
              Manage Plan
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════
     FREE USER — upgrade banner
  ════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes upgradeGlowDark {
          0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.1); }
          50%     { box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 24px 2px rgba(249,115,22,0.18); }
        }
        @keyframes upgradeGlowLight {
          0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(29,78,216,0.08); }
          50%     { box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 0 24px 2px rgba(29,78,216,0.12); }
        }
        @keyframes zapBounce {
          0%,100% { transform: scale(1) rotate(-8deg); }
          50%     { transform: scale(1.15) rotate(8deg); }
        }
        @keyframes upgradeShimmerDark {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes upgradeShimmerLight {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
      `}</style>

      <div
        className="h-full min-h-[180px] w-full rounded-[24px] relative overflow-hidden border transition-all duration-300"
        style={isDark ? {
          background: "linear-gradient(135deg, #1c1208 0%, #2a1406 40%, #181008 100%)",
          borderColor: "rgba(249,115,22,0.3)",
          animation: "upgradeGlowDark 3.5s ease-in-out infinite",
        } : {
          background: "linear-gradient(135deg, #f8f9fc 0%, #eff6ff 40%, #f8f9fc 100%)",
          borderColor: "rgba(29,78,216,0.2)",
          animation: "upgradeGlowLight 3.5s ease-in-out infinite",
        }}
      >
        {/* Moving shimmer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(90deg, transparent 25%, rgba(249,115,22,0.06) 50%, transparent 75%)"
              : "linear-gradient(90deg, transparent 25%, rgba(29,78,216,0.05) 50%, transparent 75%)",
            backgroundSize: "400px 100%",
            animation: isDark ? "upgradeShimmerDark 2.8s infinite linear" : "upgradeShimmerLight 2.8s infinite linear",
          }}
        />
        {/* Top glow */}
        <div
          className="absolute top-0 left-0 w-64 h-32 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(circle at top left, rgba(249,115,22,0.12) 0%, transparent 65%)"
              : "radial-gradient(circle at top left, rgba(29,78,216,0.08) 0%, transparent 65%)",
          }}
        />
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(90deg, transparent 8%, rgba(249,115,22,0.55) 50%, transparent 92%)"
              : "linear-gradient(90deg, transparent 8%, rgba(29,78,216,0.4) 50%, transparent 92%)",
          }}
        />
        {/* Bottom corner glow */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(circle at bottom right, rgba(251,191,36,0.06) 0%, transparent 65%)"
              : "radial-gradient(circle at bottom right, rgba(29,78,216,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 h-full">
          <div>
            {/* Label chip */}
            <div
              className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 border transition-all duration-300"
              style={isDark ? {
                background: "rgba(249,115,22,0.12)",
                borderColor: "rgba(249,115,22,0.35)",
                color: "#f97316",
              } : {
                background: "rgba(29,78,216,0.08)",
                borderColor: "rgba(29,78,216,0.25)",
                color: "#1d4ed8",
              }}
            >
              <Zap
                className="w-3 h-3"
                style={{
                  color: isDark ? "#fbbf24" : "#1d4ed8",
                  fill: isDark ? "#fbbf24" : "#1d4ed8",
                  animation: "zapBounce 2s ease-in-out infinite",
                }}
              />
              Premium
            </div>

            <h3
              className="text-lg md:text-xl font-black mt-1 leading-tight transition-colors duration-300"
              style={{ color: isDark ? "#f0e8de" : "#1e293b" }}
            >
              Get your best matches
            </h3>
            <p
              className="text-xs md:text-sm mt-1 transition-colors duration-300"
              style={{ color: isDark ? "#c4a882" : "#475569" }}
            >
              See who likes you • Unlimited views
            </p>
          </div>

          <button
            onClick={() => navigate("/premium")}
            className="w-full md:w-auto px-5 py-2.5 rounded-full text-xs md:text-sm font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            style={isDark ? {
              background: "linear-gradient(135deg, #c2410c, #f97316, #fb923c)",
              boxShadow: "0 6px 24px rgba(194,65,12,0.5)",
            } : {
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              boxShadow: "0 6px 24px rgba(29,78,216,0.35)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = isDark
                ? "0 8px 32px rgba(249,115,22,0.6)"
                : "0 8px 32px rgba(29,78,216,0.45)";
              el.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.boxShadow = isDark
                ? "0 6px 24px rgba(194,65,12,0.5)"
                : "0 6px 24px rgba(29,78,216,0.35)";
              el.style.transform = "scale(1)";
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade Now →
          </button>
        </div>
      </div>
    </>
  );
};

export default PremiumBanner;