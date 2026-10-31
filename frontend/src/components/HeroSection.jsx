import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Bookmark, Info, Star, X, ChevronRight, Play } from "lucide-react";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";
import { formatRating, getFallbackPoster } from "../utils/helpers";

// Smart hero image component
function HeroBackdrop({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    if (!errored) {
      setCurrentSrc(getFallbackPoster(alt));
      setErrored(true);
    }
  };

  return (
    <img
      src={currentSrc || getFallbackPoster(alt)}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={handleError}
      className={`${className} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
    />
  );
}

export function HeroSection({ onSearch, onSelectGenre, featuredMovie }) {
  const [query, setQuery] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { openMovieDetails, toggleFavorite, userFavorites, currentUser } = useUser();

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowDropdown(false);
    if (onSearch && query.trim()) onSearch(query.trim());
  };

  // Live autocomplete
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchMovies(query.trim(), currentUser?.id);
        setLiveResults(results.slice(0, 6));
        setShowDropdown(true);
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query, currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const quickGenres = ["Sci-Fi", "Action", "Drama", "Animation", "Thriller", "Comedy", "Crime"];
  const isFav = featuredMovie ? !!userFavorites[featuredMovie.id] : false;
  const genres = featuredMovie?.genre_list || (featuredMovie?.genres ? featuredMovie.genres.split("|") : []);

  // AI Taglines for Typing Animation
  const AI_TAGLINES = [
    "Neural AI: Hybrid Collaborative + TF-IDF Content Filtering",
    "Tailored recommendations that evolve with every movie you rate",
    "Discover 125 curated titles across Hollywood, Bollywood & Tollywood",
    "Transparent recommendation explanations powered by machine learning",
  ];

  const [typedText, setTypedText] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = AI_TAGLINES[taglineIndex % AI_TAGLINES.length];
    // Slightly slower typing for premium feel, fast backspace
    const speed = isDeleting ? 20 : 65;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(current.slice(0, typedText.length + 1));
        // Stay on screen for 6 full seconds once typed so user can read it comfortably
        if (typedText.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 6000);
        }
      } else {
        setTypedText(current.slice(0, typedText.length - 1));
        if (typedText.length === 0) {
          setIsDeleting(false);
          setTaglineIndex((prev) => prev + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, taglineIndex]);

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-[#292E3A] bg-[#12151D] shadow-2xl" style={{ minHeight: "520px" }}>
      {/* Full-bleed Backdrop with Ken Burns subtle cinematic zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {featuredMovie ? (
          <HeroBackdrop
            src={featuredMovie.backdrop_url || featuredMovie.poster_url}
            alt={featuredMovie.title}
            className="w-full h-full object-cover object-center sm:object-right animate-ken-burns scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1B202B] to-[#090B10]" />
        )}
        
        {/* Cinematic Multi-Stop Gradients for Maximum Text Contrast (Netflix / Apple TV+ style) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090B10] via-[#090B10]/95 to-transparent sm:w-4/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/50 to-transparent" />
        
        {/* Purple/Cyan Ambient Lighting Accent */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none animate-ambient-glow" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-10 sm:py-14 max-w-2xl flex flex-col justify-center min-h-[520px]">
        {/* Spotlighted Movie Title or Headline */}
        {featuredMovie ? (
          <div className="space-y-4 mb-5">
            {/* Netflix-style Eyebrow Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="netflix-badge text-[11px] text-[#A78BFA] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                CINEMATCH SPOTLIGHT
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                98% AI Match
              </span>
              <span className="text-[10px] uppercase font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/30 px-2.5 py-0.5 rounded-full">
                {featuredMovie.industry || "Hollywood"}
              </span>
            </div>

            {/* Netflix-style Display Title */}
            <h1 className="netflix-title text-4xl sm:text-6xl lg:text-7xl">
              {featuredMovie.title}
            </h1>

            {/* Netflix-style Cinematic Metadata Bar */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#A1A1AA]">
              <span className="px-2 py-0.5 rounded font-bold bg-[#1B202B] text-[#FBBF24] border border-[#292E3A] flex items-center gap-1 shadow-sm">
                <Star size={11} className="fill-[#FBBF24]" />
                {formatRating(featuredMovie.vote_average)} IMDb
              </span>
              {featuredMovie.release_year && (
                <span className="font-semibold text-[#F8FAFC]">{featuredMovie.release_year}</span>
              )}
              {genres.length > 0 && (
                <span className="text-[#A1A1AA]">• {genres.slice(0, 3).join(", ")}</span>
              )}
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border border-[#292E3A] text-[#A1A1AA] bg-[#12151D]">
                4K UHD
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border border-[#292E3A] text-[#A1A1AA] bg-[#12151D]">
                5.1
              </span>
            </div>

            {/* Overview */}
            <p className="text-[#F8FAFC]/90 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-xl font-normal drop-shadow-md">
              {featuredMovie.overview || "Discover personalized recommendations powered by state-of-the-art hybrid machine learning algorithms."}
            </p>

            {/* Live Typing Tagline with Pulsing Cursor */}
            <div className="flex items-center gap-2 text-xs text-[#DDD6FE] bg-[#1B202B]/85 border border-[#8B5CF6]/30 px-3.5 py-2 rounded-xl backdrop-blur-md w-fit shadow-md">
              <Sparkles size={13} className="text-[#8B5CF6] shrink-0" />
              <span className="font-medium">{typedText}</span>
              <span className="typing-cursor" />
            </div>

            {/* Consistent Primary and Secondary Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openMovieDetails(featuredMovie)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Info size={16} />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(featuredMovie)}
                className={`btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer ${
                  isFav ? "!bg-[#8B5CF6]/20 !border-[#8B5CF6]/50 text-[#DDD6FE]" : ""
                }`}
              >
                <Bookmark size={16} className={isFav ? "fill-[#DDD6FE] text-[#DDD6FE]" : "text-[#A1A1AA]"} />
                <span>{isFav ? "In Watchlist" : "Watchlist"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-5">
            <div className="netflix-badge text-[11px] text-[#A78BFA] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 px-3 py-1 rounded-full backdrop-blur-md w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
              CINEMATCH INTELLIGENT DISCOVERY
            </div>
            <h1 className="netflix-title text-4xl sm:text-6xl lg:text-7xl">
              DISCOVER MOVIES <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#DDD6FE] to-[#38BDF8]">
                TAILORED TO YOU
              </span>
            </h1>
            <p className="text-[#F8FAFC]/90 text-sm sm:text-base leading-relaxed max-w-lg">
              Explore cinema with transparent recommendations built on your personal taste and collaborative machine learning.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#DDD6FE] bg-[#1B202B]/85 border border-[#8B5CF6]/30 px-3.5 py-2 rounded-xl backdrop-blur-md w-fit shadow-md">
              <Sparkles size={13} className="text-[#8B5CF6] shrink-0" />
              <span className="font-medium">{typedText}</span>
              <span className="typing-cursor" />
            </div>
          </div>
        )}

        {/* Integrated Search Bar with Autocomplete */}
        <div ref={dropdownRef} className="relative w-full max-w-lg mt-3 mb-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-[#A1A1AA] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => liveResults.length > 0 && setShowDropdown(true)}
              placeholder="Search by title, director or keyword..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#12151D]/90 border border-[#292E3A] text-[#F8FAFC] placeholder-[#A1A1AA] text-sm focus:outline-none focus:border-[#8B5CF6] focus:bg-[#12151D] transition-all backdrop-blur-md shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setShowDropdown(false); }}
                className="absolute right-20 text-[#A1A1AA] hover:text-[#F8FAFC] p-1"
                aria-label="Clear query"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 px-3.5 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && liveResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-[#1B202B] border border-[#292E3A] shadow-2xl p-1.5 z-50 max-h-80 overflow-y-auto animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] border-b border-[#292E3A]/60 mb-1">
                Top Matches ({liveResults.length})
              </div>
              <div className="space-y-0.5">
                {liveResults.map((movie) => {
                  const mGenres = movie.genre_list || (movie.genres ? movie.genres.split("|") : []);
                  return (
                    <div
                      key={movie.id}
                      onClick={() => { openMovieDetails(movie); setShowDropdown(false); }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#12151D] transition-colors cursor-pointer group"
                    >
                      <div className="w-9 aspect-[2/3] rounded overflow-hidden bg-[#090B10] shrink-0 border border-[#292E3A]">
                        <img
                          src={movie.poster_url || getFallbackPoster(movie.title)}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = getFallbackPoster(movie.title); }}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors truncate">
                          {movie.title}
                        </p>
                        <p className="text-xs text-[#A1A1AA] truncate">
                          {movie.release_year || "N/A"} • ★ {formatRating(movie.vote_average)} • {mGenres.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-[#A1A1AA] group-hover:text-[#8B5CF6] shrink-0 transition-colors" />
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full mt-1 py-1.5 rounded-lg text-center text-xs font-semibold text-[#DDD6FE] hover:bg-[#8B5CF6]/15 transition-colors border-t border-[#292E3A]/60 cursor-pointer"
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </div>

        {/* Quick Genre Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#A1A1AA] font-semibold uppercase tracking-wider mr-1">Genres:</span>
          {quickGenres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onSelectGenre && onSelectGenre(g)}
              className="genre-pill px-2.5 py-1 rounded-full text-xs cursor-pointer"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
