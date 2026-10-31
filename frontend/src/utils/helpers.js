/**
 * CineMatch Utility Helpers
 */

/**
 * Generates an SVG data URL fallback poster if an image fails to load.
 */
export function getFallbackPoster(title = "Movie") {
  const shortTitle = title.length > 22 ? title.substring(0, 22) + "…" : title;
  const encoded = encodeURIComponent(shortTitle);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2312151D"/><stop offset="100%" stop-color="%23090B10"/></linearGradient></defs><rect width="300" height="450" fill="url(%23bg)"/><circle cx="150" cy="175" r="50" fill="%238B5CF6" opacity="0.12"/><path d="M138 158 L168 175 L138 192 Z" fill="%238B5CF6" opacity="0.85"/><rect x="50" y="240" width="200" height="1" fill="%23292E3A"/><text x="150" y="275" fill="%23F8FAFC" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" text-anchor="middle">${encoded}</text><text x="150" y="300" fill="%23A1A1AA" font-family="Inter,system-ui,sans-serif" font-size="11" text-anchor="middle">CineMatch</text></svg>`;
}

/**
 * Formats vote average to 1 decimal place (e.g. 8.4)
 */
export function formatRating(val) {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return Number(val).toFixed(1);
}

/**
 * Color classes for rating scores
 */
export function getRatingBadgeColor(val) {
  if (!val || isNaN(val)) return "bg-[#1B202B] text-[#A1A1AA] border-[#292E3A]";
  const num = Number(val);
  if (num >= 8.0) return "bg-[#12151D] text-[#34D399] border-[#059669]/40";
  if (num >= 7.0) return "bg-[#12151D] text-[#38BDF8] border-[#0284C7]/40";
  if (num >= 6.0) return "bg-[#12151D] text-[#FBBF24] border-[#D97706]/40";
  return "bg-[#12151D] text-[#FB7185] border-[#E11D48]/40";
}

/**
 * Visual badge for recommendation algorithm types
 */
export function getAlgorithmBadge(algorithm) {
  switch (algorithm?.toLowerCase()) {
    case "hybrid":
      return {
        label: "Hybrid AI",
        className: "bg-[#8B5CF6]/15 text-[#DDD6FE] border-[#8B5CF6]/35",
        description: "Blends story similarity and community ratings tailored to your taste."
      };
    case "collaborative":
      return {
        label: "Peer Match",
        className: "bg-[#38BDF8]/15 text-[#BAE6FD] border-[#38BDF8]/35",
        description: "Recommended by viewers who share your exact taste in movies."
      };
    case "content":
      return {
        label: "Similar Story",
        className: "bg-[#6366F1]/15 text-[#C7D2FE] border-[#6366F1]/35",
        description: "Matched by genre overlap and plot themes to movies you loved."
      };
    default:
      return {
        label: "Top Pick",
        className: "bg-[#8B5CF6]/15 text-[#DDD6FE] border-[#8B5CF6]/35",
        description: "Selected based on high critical and audience acclaim."
      };
  }
}

/**
 * Truncate text to max chars
 */
export function truncate(text, maxChars = 120) {
  if (!text) return "";
  return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
}
