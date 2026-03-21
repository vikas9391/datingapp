import React from "react";
import { MapPin } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface Match {
  id: number;
  name: string;
  age: number;
  city: string;
  imageUrl: string;
  isOnline?: boolean;
}

interface MatchCarouselProps {
  matches: Match[];
  location: string;
}

const MatchCarousel: React.FC<MatchCarouselProps> = ({ matches, location }) => {
  const { isDark } = useTheme();

  const t = isDark ? {
    sectionBg:     "transparent",
    titleColor:    "#f0e8de",
    pillBg:        "rgba(249,115,22,0.12)",
    pillBorder:    "rgba(249,115,22,0.28)",
    pillText:      "#fb923c",
    pillIcon:      "#f97316",
    cardBg:        "linear-gradient(145deg, #1e1e1e 0%, #160f06 100%)",
    cardBorder:    "rgba(249,115,22,0.18)",
    cardShadow:    "0 4px 20px rgba(0,0,0,0.4)",
    cardHoverBorder:"rgba(249,115,22,0.4)",
    cardHoverShadow:"0 8px 28px rgba(249,115,22,0.12)",
    infoOverlay:   "linear-gradient(to top, rgba(13,10,4,0.95) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
    nameColor:     "#f0e8de",
    ageColor:      "#c4a882",
    cityColor:     "#8a6540",
    onlineDot:     "#f97316",
    onlinePing:    "#fb923c",
    onlineBorder:  "#1e1208",
    emptyBg:       "rgba(249,115,22,0.06)",
    emptyBorder:   "rgba(249,115,22,0.15)",
    emptyText:     "#8a6540",
  } : {
    sectionBg:     "transparent",
    titleColor:    "#0f172a",
    pillBg:        "rgba(29,78,216,0.08)",
    pillBorder:    "rgba(29,78,216,0.2)",
    pillText:      "#1d4ed8",
    pillIcon:      "#1d4ed8",
    cardBg:        "#ffffff",
    cardBorder:    "rgba(29,78,216,0.1)",
    cardShadow:    "0 2px 12px rgba(29,78,216,0.06)",
    cardHoverBorder:"rgba(29,78,216,0.3)",
    cardHoverShadow:"0 8px 28px rgba(29,78,216,0.1)",
    infoOverlay:   "linear-gradient(to top, rgba(10,20,40,0.92) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
    nameColor:     "#f0e8de",
    ageColor:      "#cbd5e1",
    cityColor:     "#93c5fd",
    onlineDot:     "#1d4ed8",
    onlinePing:    "#60a5fa",
    onlineBorder:  "#ffffff",
    emptyBg:       "rgba(29,78,216,0.04)",
    emptyBorder:   "rgba(29,78,216,0.1)",
    emptyText:     "#64748b",
  };

  return (
    <>
      <style>{`
        .mc-section {
          padding: 1rem 0;
        }
        .mc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }
        .mc-title {
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          color: ${t.titleColor};
          transition: color 0.3s;
        }
        .mc-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          color: ${t.pillText};
          background: ${t.pillBg};
          border: 1px solid ${t.pillBorder};
          white-space: nowrap;
          transition: all 0.3s;
        }
        .mc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        @media (min-width: 480px) { .mc-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 768px) { .mc-grid { grid-template-columns: repeat(4, 1fr); } }
        .mc-card {
          border-radius: 1rem;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          background: ${t.cardBg};
          border: 1px solid ${t.cardBorder};
          box-shadow: ${t.cardShadow};
          aspect-ratio: 3/4;
        }
        .mc-card:hover {
          transform: translateY(-3px);
          border-color: ${t.cardHoverBorder};
          box-shadow: ${t.cardHoverShadow};
        }
        .mc-photo {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.4s ease;
        }
        .mc-card:hover .mc-photo { transform: scale(1.04); }
        .mc-overlay {
          position: absolute;
          inset: 0;
          background: ${t.infoOverlay};
        }
        .mc-info {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 0.75rem;
          z-index: 2;
        }
        .mc-name-row {
          display: flex;
          align-items: baseline;
          gap: 0.375rem;
          margin-bottom: 0.125rem;
        }
        .mc-name {
          font-size: 0.9375rem;
          font-weight: 800;
          color: ${t.nameColor};
        }
        .mc-age {
          font-size: 0.875rem;
          font-weight: 500;
          color: ${t.ageColor};
        }
        .mc-city {
          font-size: 0.6875rem;
          font-weight: 600;
          color: ${t.cityColor};
        }
        .mc-online-dot {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
          z-index: 3;
          width: 10px;
          height: 10px;
        }
        .mc-online-dot .ping {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: ${t.onlinePing};
          animation: mc-ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
          opacity: 0.75;
        }
        .mc-online-dot .dot {
          position: relative;
          width: 100%; height: 100%;
          border-radius: 9999px;
          background: ${t.onlineDot};
          border: 1.5px solid ${t.onlineBorder};
        }
        @keyframes mc-ping {
          0%   { transform: scale(1); opacity: 0.75; }
          75%  { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
        .mc-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          border-radius: 1rem;
          background: ${t.emptyBg};
          border: 1px solid ${t.emptyBorder};
          font-size: 0.875rem;
          font-weight: 500;
          color: ${t.emptyText};
          transition: all 0.3s;
        }
      `}</style>

      <section className="mc-section">
        <div className="mc-header">
          <h2 className="mc-title">Suggested Matches</h2>
          <span className="mc-location-pill">
            <MapPin style={{ width: 11, height: 11, color: t.pillIcon }} />
            {location}
          </span>
        </div>

        <div className="mc-grid">
          {matches.length === 0 ? (
            <div className="mc-empty">No matches found nearby yet. Check back soon!</div>
          ) : (
            matches.map((user) => (
              <article key={user.id} className="mc-card">
                <div
                  className="mc-photo"
                  style={{ backgroundImage: `url(${user.imageUrl})` }}
                />
                <div className="mc-overlay" />
                <div className="mc-info">
                  <div className="mc-name-row">
                    <span className="mc-name">{user.name}</span>
                    <span className="mc-age">{user.age}</span>
                  </div>
                  <span className="mc-city">{user.city}</span>
                </div>
                {user.isOnline && (
                  <div className="mc-online-dot">
                    <span className="ping" />
                    <span className="dot" />
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default MatchCarousel;