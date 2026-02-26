import React, { useEffect, useState } from "react";
import { MapPin, Loader, Navigation } from "lucide-react";

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

interface NearbyUser {
  distance_km: number;
  first_name: string;
}

interface NearbyData {
  count: number;
  users: NearbyUser[];
}

type State =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "done"; data: NearbyData };

const AVATAR_COLORS = [
  { bg: "#e0f2fe", text: "#0369a1" },
  { bg: "#fce7f3", text: "#9d174d" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#fef3c7", text: "#92400e" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#fee2e2", text: "#b91c1c" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#f0fdf4", text: "#166534" },
];

const DEFAULT_USERS: NearbyUser[] = [
  { first_name: "Alex",   distance_km: 3  },
  { first_name: "Jordan", distance_km: 7  },
  { first_name: "Morgan", distance_km: 12 },
  { first_name: "Riley",  distance_km: 18 },
  { first_name: "Casey",  distance_km: 22 },
  { first_name: "Taylor", distance_km: 28 },
  { first_name: "Quinn",  distance_km: 33 },
  { first_name: "Avery",  distance_km: 41 },
];
const DEFAULT_COUNT = 16;

const resolveDisplayData = (data: NearbyData): NearbyData =>
  data.count < 3
    ? { count: DEFAULT_COUNT, users: DEFAULT_USERS }
    : data;

const LetterAvatar: React.FC<{ name: string; index: number; title: string }> = ({ name, index, title }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="w-9 h-9 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[12px] font-bold shrink-0"
      style={{ backgroundColor: color.bg, color: color.text }}
      title={title}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

// Animated pulse rings to suggest live activity
const PulseRing: React.FC<{ size: string; delay: string; opacity: string }> = ({ size, delay, opacity }) => (
  <div
    className={`absolute rounded-full border border-teal-400 ${size} ${opacity}`}
    style={{
      animation: `ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite`,
      animationDelay: delay,
    }}
  />
);

// Mini distance bar showing closest / farthest spread
const DistanceBar: React.FC<{ users: NearbyUser[] }> = ({ users }) => {
  const closest = Math.min(...users.map((u) => u.distance_km));
  const farthest = Math.max(...users.map((u) => u.distance_km));

  return (
    <div className="flex items-center gap-2">
      <Navigation className="w-3 h-3 text-teal-500 shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(to right, #2dd4bf, #0d9488)",
            width: "100%",
          }}
        />
      </div>
      <span className="text-[10px] text-gray-400 whitespace-nowrap">
        {closest}km – {farthest}km
      </span>
    </div>
  );
};

const NearbyBanner: React.FC = () => {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation not supported" });
      return;
    }
    setState({ status: "requesting" });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setState({ status: "loading" });
        try {
          const authData = getAuthToken();
          if (!authData) { setState({ status: "error", message: "Not logged in" }); return; }

          const res = await fetch("http://127.0.0.1:8000/api/nearby/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${authData.type} ${authData.token}`,
            },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, radius_km: 50 }),
          });

          if (!res.ok) throw new Error("Failed to fetch nearby users");
          const data: NearbyData = await res.json();
          setState({ status: "done", data: resolveDisplayData(data) });
        } catch (err: any) {
          setState({ status: "error", message: err.message });
        }
      },
      (err) => {
        setState(err.code === err.PERMISSION_DENIED
          ? { status: "denied" }
          : { status: "error", message: "Could not get location" });
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // ── Shared card shell ─────────────────────────────────────────────────────
  if (state.status === "idle" || state.status === "requesting" || state.status === "loading") {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[180px]">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">People Nearby</h4>
            <p className="text-xs text-gray-500">Find matches close to you</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader className="w-4 h-4 animate-spin text-teal-500" />
          {state.status === "requesting" ? "Requesting location..." : "Finding people nearby..."}
        </div>
      </div>
    );
  }

  if (state.status === "denied") {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[180px]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">People Nearby</h4>
            <p className="text-xs text-gray-500">Find matches close to you</p>
          </div>
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 leading-relaxed">
          Location access was denied. Enable it in your browser settings to see people nearby.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full min-h-[180px]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">People Nearby</h4>
            <p className="text-xs text-gray-500">Find matches close to you</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Unable to load nearby users.</p>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const { data } = state;
  const shown = data.users.slice(0, 4);
  const extra = data.count - shown.length;

  return (
    <>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 h-full min-h-[180px]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">People Nearby</h4>
              <p className="text-xs text-gray-500">Find matches close to you</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full whitespace-nowrap">
            {data.count} nearby
          </span>
        </div>

        {/* ── Middle: radar pulse + stat chips ── */}
        <div className="flex items-center gap-4">
          {/* Radar dot */}
          <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
            <PulseRing size="w-4 h-4" delay="0s"    opacity="opacity-40" />
            <PulseRing size="w-4 h-4" delay="0.8s"  opacity="opacity-25" />
            <PulseRing size="w-4 h-4" delay="1.6s"  opacity="opacity-15" />
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 z-10" />
          </div>

          {/* Stat chips */}
          <div className="flex flex-col gap-1.5 flex-1">
            <DistanceBar users={data.users} />
            <div className="flex gap-2">
              <span className="text-[10px] bg-teal-50 text-teal-700 font-medium px-2 py-0.5 rounded-full">
                🟢 Active now
              </span>
              <span className="text-[10px] bg-gray-50 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                within 50km
              </span>
            </div>
          </div>
        </div>

        {/* ── Avatars ── */}
        <div className="flex items-center -space-x-2 pl-1">
          {shown.map((u, i) => (
            <LetterAvatar
              key={i}
              name={u.first_name}
              index={i}
              title={`${u.first_name} • ${u.distance_km}km away`}
            />
          ))}
          {extra > 0 && (
            <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{extra}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default NearbyBanner;