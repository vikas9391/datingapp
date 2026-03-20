import React from "react";

export const MenuFooterImage = () => {
  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(145deg, #1a1006 0%, #120d04 100%)" }}
    >
      <svg
        viewBox="0 0 400 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ambient ember glow background */}
        <radialGradient id="emberGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <rect width="400" height="160" fill="url(#emberGlow)" />

        {/* Background doodles — ember/flame style */}
        <g opacity="0.18" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round">
          {/* Flame silhouette left */}
          <path d="M50 30 C50 30 55 20 65 20 C75 20 80 30 50 50 C20 30 25 20 35 20 C45 20 50 30 50 30 Z" />
          {/* Flame silhouette right */}
          <path d="M350 40 C350 40 355 30 365 30 C375 30 380 40 350 60 C320 40 325 30 335 30 C345 30 350 40 350 40 Z" />
          {/* Small flame bottom-right */}
          <path d="M320 120 C320 120 322 115 328 115 C334 115 336 120 320 130 C304 120 306 115 312 115 C318 115 320 120 320 120 Z" />
          {/* Ember squiggle */}
          <path d="M30 100 Q 40 90, 50 100 T 70 100" fill="none" />
          <path d="M360 90 L 370 80 M 360 80 L 370 90" />
        </g>

        {/* Ember dots */}
        <circle cx="200" cy="20" r="2.5" fill="#fb923c" opacity="0.5" />
        <circle cx="100" cy="140" r="2" fill="#fbbf24" opacity="0.4" />
        <circle cx="300" cy="145" r="1.5" fill="#f97316" opacity="0.35" />
        <circle cx="60" cy="70" r="1.5" fill="#fb923c" opacity="0.3" />
        <circle cx="340" cy="75" r="1.5" fill="#fbbf24" opacity="0.3" />

        {/* Gradient def for text */}
        <defs>
          <linearGradient id="flameText" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Main hashtag text */}
        <text
          x="200"
          y="75"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="38"
          fill="url(#flameText)"
          letterSpacing="-1"
        >
          #TheDatingApp
        </text>

        {/* Subtext group */}
        <g transform="translate(0, 30)">
          {/* Made in India */}
          <g transform="translate(145, 75)">
            <rect x="0" y="0" width="18" height="12" rx="1.5" fill="white" opacity="0.9" />
            <rect x="0" y="0" width="18" height="4" rx="1.5" fill="#FF9933" />
            <rect x="0" y="8" width="18" height="4" rx="1.5" fill="#138808" />
            <circle cx="9" cy="6" r="2" fill="#000080" opacity="0.85" />
            <text x="24" y="10" fontFamily="Arial, sans-serif" fontSize="12" fill="#c4a882" fontWeight="600">
              Made in India
            </text>
          </g>

          {/* Crafted in Hyderabad */}
          <g transform="translate(130, 95)">
            <path
              d="M6 3.5 C6 3.5 7 1 9.5 1 C12 1 13 3.5 6 8.5 C-1 3.5 0 1 2.5 1 C5 1 6 3.5 6 3.5 Z"
              fill="#f97316"
              transform="translate(4, 2)"
            />
            <text x="24" y="10" fontFamily="Arial, sans-serif" fontSize="12" fill="#c4a882" fontWeight="600">
              Crafted in Hyderabad
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};