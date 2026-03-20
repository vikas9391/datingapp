import React, { useEffect, useState } from "react";
import { MapPin, Loader, Navigation } from "lucide-react";

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

interface NearbyUser  { distance_km: number; first_name: string; }
interface NearbyData  { count: number; users: NearbyUser[]; }

type State =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "done"; data: NearbyData };

/* Orange-spectrum avatar palette that still reads on dark surfaces */
const AVATAR_COLORS = [
  { bg: "rgba(249,115,22,0.18)",  text: "#fb923c" },
  { bg: "rgba(251,191,36,0.18)",  text: "#fbbf24" },
  { bg: "rgba(234,88,12,0.2)",    text: "#f97316" },
  { bg: "rgba(245,158,11,0.18)",  text: "#f59e0b" },
  { bg: "rgba(253,186,116,0.18)", text: "#fdba74" },
  { bg: "rgba(252,211,77,0.18)",  text: "#fcd34d" },
  { bg: "rgba(194,65,12,0.2)",    text: "#ea580c" },
  { bg: "rgba(180,83,9,0.2)",     text: "#d97706" },
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
  data.count < 3 ? { count: DEFAULT_COUNT, users: DEFAULT_USERS } : data;

/* ─── Letter avatar ─── */
const LetterAvatar: React.FC<{ name: string; index: number; title: string }> = ({ name, index, title }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 border-2"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: "rgba(249,115,22,0.25)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
      }}
      title={title}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

/* ─── Pulse rings ─── */
const PulseRing: React.FC<{ delay: string; scale: number }> = ({ delay, scale }) => (
  <div
    className="absolute rounded-full border"
    style={{
      width: "100%",
      height: "100%",
      borderColor: "rgba(249,115,22,0.5)",
      animation: `nearbyPing 2.4s cubic-bezier(0,0,0.2,1) infinite`,
      animationDelay: delay,
      transform: `scale(${scale})`,
    }}
  />
);

/* ─── Distance bar ─── */
const DistanceBar: React.FC<{ users: NearbyUser[] }> = ({ users }) => {
  const closest  = Math.min(...users.map((u) => u.distance_km));
  const farthest = Math.max(...users.map((u) => u.distance_km));
  return (
    <div className="flex items-center gap-2">
      <Navigation className="w-3 h-3 shrink-0" style={{ color: "#f97316" }} />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(249,115,22,0.12)" }}>
        <div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(to right, #fb923c, #f97316)", width: "100%" }}
        />
      </div>
      {/* CONTRAST FIX: was text-gray-400 on dark bg */}
      <span className="text-[10px] whitespace-nowrap font-medium" style={{ color: "#8a6540" }}>
        {closest}km – {farthest}km
      </span>
    </div>
  );
};

/* ─── Shared dark card shell ─── */
const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="relative p-5 rounded-2xl flex flex-col justify-between h-full min-h-[180px] overflow-hidden border"
    style={{
      background: "linear-gradient(145deg, #1a1a1a 0%, #130e06 100%)",
      borderColor: "rgba(249,115,22,0.18)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
    }}
  >
    {/* Top accent line */}
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent 10%, rgba(249,115,22,0.4) 50%, transparent 90%)" }}
    />
    {/* Corner glow */}
    <div
      className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
      style={{ background: "radial-gradient(circle at top right, rgba(249,115,22,0.07) 0%, transparent 65%)" }}
    />
    <div className="relative z-10 flex flex-col h-full gap-4">{children}</div>
  </div>
);

/* ─── Card header ─── */
const CardHeader: React.FC<{ icon?: React.ReactNode; badge?: React.ReactNode }> = ({ icon, badge }) => (
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: "rgba(249,115,22,0.12)",
          border: "1px solid rgba(249,115,22,0.28)",
          boxShadow: "0 0 12px rgba(249,115,22,0.12)",
        }}
      >
        {icon ?? <MapPin className="w-5 h-5" style={{ color: "#f97316" }} />}
      </div>
      <div>
        {/* CONTRAST FIX: was text-gray-900 on dark = invisible */}
        <h4 className="text-sm font-bold" style={{ color: "#f0e8de" }}>People Nearby</h4>
        <p className="text-xs" style={{ color: "#8a6540" }}>Find matches close to you</p>
      </div>
    </div>
    {badge}
  </div>
);

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
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

          const res = await fetch(`${API_BASE}/api/nearby/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${authData.type} ${authData.token}`,
            },
            body: JSON.stringify({
              latitude:  pos.coords.latitude,
              longitude: pos.coords.longitude,
              radius_km: 50,
            }),
          });

          if (!res.ok) throw new Error("Failed to fetch nearby users");
          const data: NearbyData = await res.json();
          setState({ status: "done", data: resolveDisplayData(data) });
        } catch (err: any) {
          setState({ status: "error", message: err.message });
        }
      },
      (err) => {
        setState(
          err.code === err.PERMISSION_DENIED
            ? { status: "denied" }
            : { status: "error", message: "Could not get location" }
        );
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  /* ── Loading ── */
  if (["idle", "requesting", "loading"].includes(state.status)) {
    return (
      <CardShell>
        <CardHeader />
        <div className="flex items-center gap-2 text-xs" style={{ color: "#8a6540" }}>
          <Loader className="w-4 h-4 animate-spin" style={{ color: "#f97316" }} />
          {state.status === "requesting" ? "Requesting location…" : "Finding people nearby…"}
        </div>
      </CardShell>
    );
  }

  /* ── Denied ── */
  if (state.status === "denied") {
    return (
      <CardShell>
        <CardHeader
          icon={<MapPin className="w-5 h-5" style={{ color: "#fbbf24" }} />}
        />
        <p
          className="text-xs rounded-xl px-3 py-2 leading-relaxed border"
          style={{
            color: "#fbbf24",
            background: "rgba(251,191,36,0.08)",
            borderColor: "rgba(251,191,36,0.25)",
          }}
        >
          Location access was denied. Enable it in your browser settings to see people nearby.
        </p>
      </CardShell>
    );
  }

  /* ── Error ── */
  if (state.status === "error") {
    return (
      <CardShell>
        <CardHeader />
        <p className="text-xs" style={{ color: "#8a6540" }}>Unable to load nearby users.</p>
      </CardShell>
    );
  }

  /* ── Success ── */
  const { data } = state;
  const shown = data.users.slice(0, 4);
  const extra = data.count - shown.length;

  return (
    <>
      <style>{`
        @keyframes nearbyPing {
          0%   { transform: scale(1);   opacity: 0.6; }
          75%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>

      <CardShell>
        {/* Header + count badge */}
        <CardHeader
          badge={
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.28)",
                color: "#fb923c",
              }}
            >
              {data.count} nearby
            </span>
          }
        />

        {/* Radar + chips */}
        <div className="flex items-center gap-4">
          {/* Animated radar dot */}
          <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
            <PulseRing delay="0s"   scale={1} />
            <PulseRing delay="0.8s" scale={1} />
            <PulseRing delay="1.6s" scale={1} />
            <div
              className="w-3 h-3 rounded-full z-10"
              style={{
                background: "radial-gradient(circle, #fbbf24, #f97316)",
                boxShadow: "0 0 8px 2px rgba(249,115,22,0.6)",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <DistanceBar users={data.users} />
            <div className="flex gap-2">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(249,115,22,0.1)", color: "#fb923c" }}
              >
                🟠 Active now
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)", color: "#8a6540" }}
              >
                within 50km
              </span>
            </div>
          </div>
        </div>

        {/* Stacked avatars */}
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
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
              style={{
                background: "rgba(249,115,22,0.1)",
                borderColor: "rgba(249,115,22,0.25)",
                color: "#f97316",
              }}
            >
              +{extra}
            </div>
          )}
        </div>
      </CardShell>
    </>
  );
};

export default NearbyBanner;