import React from "react";

/**
 * CineMatch bespoke brand logo
 * Combines an anamorphic cinema lens / film frame with converging AI neural rays,
 * symbolizing the core purpose: Intelligent Cine + AI Match.
 */
export function CineMatchLogo({ size = 32, showText = true, className = "", textClassName = "" }) {
  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Bespoke Logo Icon */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(139,92,246,0.45)]"
        style={{ width: size, height: size }}
      >
        {/* Ambient Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#12151D] to-[#1B202B] border border-[#8B5CF6]/40 rounded-xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 via-transparent to-[#38BDF8]/20 opacity-80" />

        {/* Vector Mark: Dual Converging Aperture / Neural Beams */}
        <svg
          viewBox="0 0 40 40"
          className="relative z-10 w-[78%] h-[78%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cmPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="cmCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <filter id="cmGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Wing / Cinema Film Frame */}
          <path
            d="M8 12C8 9.79 9.79 8 12 8H16L24 20L16 32H12C9.79 32 8 30.21 8 28V12Z"
            fill="url(#cmPurpleGrad)"
            opacity="0.95"
          />

          {/* Right Wing / Matching Neural Beam */}
          <path
            d="M32 28C32 30.21 30.21 32 28 32H24L16 20L24 8H28C30.21 8 32 9.79 32 12V28Z"
            fill="url(#cmCyanGrad)"
            opacity="0.9"
          />

          {/* Center Matching Core Spark / Prism */}
          <circle cx="20" cy="20" r="3.2" fill="#FFFFFF" filter="url(#cmGlow)" />
          
          {/* Subtle Projector Beam lines */}
          <circle cx="20" cy="20" r="6" stroke="#DDD6FE" strokeWidth="1" strokeDasharray="1.5 2" opacity="0.6" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className={`flex items-baseline ${textClassName}`}>
          <span className="font-extrabold tracking-tight text-[#F8FAFC] text-xl">
            Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#38BDF8]">Match</span>
          </span>
        </div>
      )}
    </div>
  );
}

