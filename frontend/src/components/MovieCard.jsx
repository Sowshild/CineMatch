import React, { useState, useEffect } from "react";
import { Star, Bookmark, Info, Sparkles } from "lucide-react";
import { StarRating } from "./StarRating";
import { useUser } from "../context/UserContext";
import { formatRating, getAlgorithmBadge, getFallbackPoster } from "../utils/helpers";

/**
 * SmartImage: Multi-tier fallback strategy for posters
 */
function SmartImage({ src, alt, className, onLoad, fallbackTitle }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [stage, setStage] = useState(0); // 0: initial, 1: fallback url, 2: svg

  useEffect(() => {
    setCurrentSrc(src);
    setStage(0);
  }, [src]);

  const handleError = () => {
    if (stage === 0 && src && src.includes("image.tmdb.org/t/p/w342")) {
      setCurrentSrc(src.replace("/w342/", "/w500/"));
      setStage(1);
    } else if (stage <= 1) {
      setCurrentSrc(getFallbackPoster(fallbackTitle || alt));
      setStage(2);
    }
  };

  return (
    <img
      src={currentSrc || getFallbackPoster(fallbackTitle || alt)}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
      loading="lazy"
    />
  );
}

export function MovieCard({ movie, explanation, algorithm, score, compact = false }) {
  const { userRatings, userFavorites, rateMovie, toggleFavorite, openMovieDetails } = useUser();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const personalRating = userRatings[movie.id] || 0;
  const isFavorite = !!userFavorites[movie.id];
  const algoBadge = getAlgorithmBadge(algorithm);
  const matchPercentage = score !== null && score !== undefined ? Math.round(score * 100) : null;

  const genres = movie.genre_list || (movie.genres ? movie.genres.split("|") : []);

  return (
    <div
      onClick={() => openMovieDetails(movie)}
      className="movie-card group relative flex flex-col rounded-xl overflow-hidden cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#090B10]">
        <SmartImage
          src={movie.poster_url}
          alt={movie.title}
          fallbackTitle={movie.title}
          className={`h-full w-full object-cover transition-all duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } ${hovered ? "scale-105" : "scale-100"}`}
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        {/* Cinematic subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12151D] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Top Header: Rating Badge + Watchlist Button */}
        <div className="absolute top-2 inset-x-2 flex items-start justify-between z-10">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#090B10]/85 text-[#F8FAFC] border border-[#292E3A] backdrop-blur-md shadow-sm flex items-center gap-1">
            <Star size={10} className="fill-[#FBBF24] text-[#FBBF24]" />
            {formatRating(movie.vote_average)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie);
            }}
            aria-label={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer ${
              isFavorite
                ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-600/30 scale-105"
                : "bg-[#090B10]/75 text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1B202B] border border-[#292E3A] opacity-0 group-hover:opacity-100"
            }`}
          >
            <Bookmark size={13} className={isFavorite ? "fill-white" : ""} />
          </button>
        </div>

        {/* Bottom Badges: Algorithm & Match Percentage */}
        <div className="absolute bottom-2 inset-x-2 z-10 flex items-end justify-between pointer-events-none gap-1">
          {algoBadge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border backdrop-blur-md flex items-center gap-1 ${algoBadge.className}`}
              title={algoBadge.description}
            >
              <Sparkles size={9} />
              {algoBadge.label}
            </span>
          )}
          {matchPercentage !== null && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8B5CF6]/25 text-[#DDD6FE] border border-[#8B5CF6]/40 backdrop-blur-md ml-auto">
              {matchPercentage}% Match
            </span>
          )}
        </div>

        {/* Center Hover Details Cue */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1B202B]/85 backdrop-blur-md flex items-center justify-center border border-[#3E4659] shadow-xl text-[#F8FAFC]">
            <Info size={18} />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-3 gap-1.5 bg-[#12151D]">
        <div>
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="font-semibold text-sm text-[#F8FAFC] line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">
              {movie.title}
            </h3>
            {movie.release_year && (
              <span className="text-[11px] text-[#A1A1AA] shrink-0 font-medium">{movie.release_year}</span>
            )}
          </div>

          {/* Genre chips */}
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.slice(0, 2).map((g, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#1B202B] text-[#A1A1AA] border border-[#292E3A]"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Explainable AI Reasoning */}
        {explanation && (
          <div className="p-1.5 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#DDD6FE] text-[10px] leading-tight flex items-start gap-1">
            <Sparkles size={10} className="shrink-0 mt-0.5 text-[#8B5CF6]" />
            <span className="line-clamp-2">{explanation}</span>
          </div>
        )}

        {/* User Interactive Rating Row */}
        <div className="mt-auto pt-2 border-t border-[#292E3A]/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-[#A1A1AA] mb-0.5">
              {personalRating > 0 ? `Your Rating: ${personalRating}★` : "Rate"}
            </span>
            <StarRating
              rating={personalRating}
              onRate={(val) => rateMovie(movie.id, val)}
              size={12}
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMovieDetails(movie);
            }}
            className="p-1.5 rounded-lg bg-[#1B202B] hover:bg-[#232938] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#292E3A] cursor-pointer transition-colors"
            title="View Details"
          >
            <Info size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
