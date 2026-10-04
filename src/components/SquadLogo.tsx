import React from 'react';

interface SquadLogoProps {
  className?: string;
  size?: number;
}

export const SquadLogo: React.FC<SquadLogoProps> = ({ className = "w-8 h-8", size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300`}
      style={style}
    >
      <defs>
        {/* Vibrant Green Leaf Gradient */}
        <linearGradient id="squadGreenGrad" x1="20" y1="20" x2="140" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="50%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>

        {/* Vibrant Cyan Water Gradient */}
        <linearGradient id="squadBlueGrad" x1="80" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Bright Highlight Gradient */}
        <linearGradient id="squadHighlightGrad" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
        </linearGradient>

        {/* Ambient Glow Filter */}
        <filter id="squadGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#38BDF8" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#squadGlow)">
        {/* Outer Circular Flow Frame - Green Left Arch */}
        <path
          d="M 112 24 C 70 20, 24 50, 24 100 C 24 135, 42 165, 75 182 C 55 168, 42 145, 40 120 C 37 88, 58 52, 98 38 C 112 33, 132 30, 112 24 Z"
          fill="url(#squadGreenGrad)"
        />

        {/* Outer Circular Flow Frame - Blue Right Arch */}
        <path
          d="M 120 22 C 145 28, 172 48, 180 78 C 188 110, 175 148, 142 172 C 115 192, 75 194, 92 188 C 122 182, 160 162, 164 125 C 168 88, 148 50, 120 22 Z"
          fill="url(#squadBlueGrad)"
        />

        {/* Top Outer Crown Accent - Blue */}
        <path
          d="M 85 22 C 95 20, 115 20, 125 22 C 105 28, 92 28, 85 22 Z"
          fill="#0284C7"
        />

        {/* Right Outer Crown Tip - Green */}
        <path
          d="M 178 72 C 184 82, 186 102, 182 112 C 182 98, 180 82, 178 72 Z"
          fill="#84CC16"
        />

        {/* Left Green Leaf Petal 1 */}
        <path
          d="M 44 88 C 42 120, 62 148, 85 160 C 65 142, 58 118, 62 92 C 65 72, 75 58, 85 48 C 65 58, 46 70, 44 88 Z"
          fill="url(#squadGreenGrad)"
        />

        {/* Left Green Leaf Petal 2 (Center S-Swoosh Left) */}
        <path
          d="M 72 82 C 68 110, 80 135, 102 148 C 88 135, 82 115, 85 92 C 88 68, 102 52, 115 42 C 95 50, 75 62, 72 82 Z"
          fill="url(#squadGreenGrad)"
        />

        {/* Right Blue Water Ribbon 1 (Center S-Swoosh Right) */}
        <path
          d="M 125 42 C 142 58, 155 82, 152 108 C 148 132, 132 152, 112 162 C 128 148, 138 128, 135 102 C 132 78, 118 58, 102 48 C 112 42, 120 40, 125 42 Z"
          fill="url(#squadBlueGrad)"
        />

        {/* Right Blue Water Ribbon 2 */}
        <path
          d="M 148 78 C 158 98, 158 122, 145 140 C 138 150, 128 158, 118 165 C 132 158, 146 142, 148 122 C 150 102, 142 88, 148 78 Z"
          fill="url(#squadBlueGrad)"
        />

        {/* Small Bottom Left Water Drop Accent */}
        <circle cx="34" cy="132" r="3" fill="#38BDF8" />
        
        {/* Curved Highlight Shimmer */}
        <path
          d="M 115 48 C 125 60, 130 75, 128 92 C 125 78, 120 62, 110 52 C 112 50, 114 49, 115 48 Z"
          fill="url(#squadHighlightGrad)"
        />
      </g>
    </svg>
  );
};
