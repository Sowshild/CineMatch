import React, { useState } from "react";
import { Star } from "lucide-react";

const STAR_LABELS = {
  1: "Poor (1★)",
  2: "Fair (2★)",
  3: "Good (3★)",
  4: "Great (4★)",
  5: "Masterpiece! (5★)",
};

export function StarRating({
  rating = 0,
  maxStars = 5,
  onRate = null,
  size = 18,
  readOnly = false,
  showLabel = false,
  showTooltip = true,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const currentDisplay = hoverRating || rating || 0;

  return (
    <div className="relative inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentDisplay;

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly || !onRate}
              className={`p-0.5 transition-all duration-150 ${
                readOnly || !onRate
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-130 active:scale-95 focus:outline-none"
              }`}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              onClick={() => {
                if (!readOnly && onRate) {
                  onRate(starValue);
                }
              }}
              aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              <Star
                size={size}
                className={`transition-all duration-200 ${
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Tooltip on hover */}
      {!readOnly && hoverRating > 0 && showTooltip && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#1B202B] border border-[#292E3A] text-[10px] font-bold text-amber-300 whitespace-nowrap shadow-xl pointer-events-none z-30 animate-fade-in">
          {STAR_LABELS[hoverRating]}
        </span>
      )}

      {showLabel && (
        <span className="text-xs font-semibold text-amber-400/90 ml-0.5">
          {rating > 0 ? `${rating.toFixed(1)}★` : "Unrated"}
        </span>
      )}
    </div>
  );
}
