import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthToken = (): { token: string; type: "Bearer" | "Token" } | null => {
  const jwtKeys = ["access_token", "accessToken", "jwt", "access"];
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

  // Loading skeleton
  if (isPremium === null) {
    return (
      <div className="h-full min-h-[180px] w-full rounded-[24px] bg-gray-100 animate-pulse">
        <div className="h-full min-h-[180px] rounded-[24px] bg-gradient-to-br from-gray-200 to-gray-100" />
      </div>
    );
  }

  // Premium active — show a classy confirmation card
  if (isPremium === true) {
    return (
      <div className="h-full min-h-[180px] flex items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-[24px] p-1 shadow-xl w-full">
        <div className="w-full h-full bg-black/10 backdrop-blur-sm rounded-[20px] p-1 text-white flex flex-col justify-center">
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Crown icon */}
              <div className="bg-white/20 rounded-full p-2.5 shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2 19h20v2H2v-2zM2 6l5 7 5-8 5 8 5-7v11H2V6z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
                  Active Plan
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-tight mt-0.5">
                  Premium Member ✦
                </h3>
                <p className="text-xs md:text-sm opacity-80 mt-0.5">
                  Unlimited views • See all your likes
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/premium")}
              className="w-full md:w-auto bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Manage Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not premium — show upgrade banner
  return (
    <div className="h-full min-h-[180px] flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-500 rounded-[24px] p-1 shadow-xl w-full">
      <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[20px] p-1 text-white flex flex-col justify-center">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] md:text-xs font-semibold uppercase opacity-90 tracking-widest">
              Premium
            </div>
            <h3 className="text-lg md:text-xl font-bold mt-1 leading-tight">
              Get your best matches
            </h3>
            <p className="text-xs md:text-sm mt-1 opacity-90">
              See who likes you • Unlimited views
            </p>
          </div>
          <button
            onClick={() => navigate("/premium")}
            className="w-full md:w-auto bg-white text-orange-600 px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-sm hover:bg-orange-50 transition-colors"
          >
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;