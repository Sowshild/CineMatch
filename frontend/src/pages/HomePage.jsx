import React, { useEffect, useState, useRef } from "react";
import {
  Sparkles, TrendingUp, Award, Layers, RefreshCw, Sliders,
  ChevronRight, ChevronLeft, Info, Zap, Users, Brain, Star, Clock, Film
} from "lucide-react";
import { HeroSection } from "../components/HeroSection";
import { MovieCard } from "../components/MovieCard";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

/**
 * Reusable MovieCarousel component with smooth horizontal scrolling and directional arrows
 */
function MovieCarousel({
  title,
  subtitle,
  icon: Icon,
  movies = [],
  loading = false,
  emptyText,
  viewAllAction,
  cardCompact = false,
}) {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -25px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 15);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [movies]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.75;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  const skeletonCount = cardCompact ? 8 : 6;
  const cardWidthClass = cardCompact ? "w-[145px] sm:w-[160px]" : "w-[170px] sm:w-[200px]";

  return (
    <section
      ref={containerRef}
      className={`space-y-3 group/carousel reveal-on-scroll ${isVisible ? "is-visible" : ""}`}
    >
      {/* Carousel Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-[#8B5CF6]" />}
            <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="text-xs text-[#A1A1AA] mt-0.5">{subtitle}</p>}
        </div>

        {viewAllAction && (
          <button
            type="button"
            onClick={viewAllAction}
            className="text-xs font-semibold text-[#A1A1AA] hover:text-[#8B5CF6] flex items-center gap-1 transition-colors cursor-pointer"
          >
            See all <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll Left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-3 w-9 h-9 rounded-full bg-[#1B202B]/95 border border-[#292E3A] flex items-center justify-center text-[#F8FAFC] hover:bg-[#8B5CF6] hover:border-[#8B5CF6] transition-all shadow-xl cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll Right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-3 w-9 h-9 rounded-full bg-[#1B202B]/95 border border-[#292E3A] flex items-center justify-center text-[#F8FAFC] hover:bg-[#8B5CF6] hover:border-[#8B5CF6] transition-all shadow-xl cursor-pointer backdrop-blur-md"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Horizontal Row */}
        <div ref={scrollRef} className="row-scroll">
          {loading ? (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className={`shrink-0 ${cardWidthClass} aspect-[2/3] rounded-xl skeleton`}
              />
            ))
          ) : movies.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#A1A1AA] bg-[#12151D] border border-[#292E3A] rounded-xl w-full">
              {emptyText || "No movies found."}
            </div>
          ) : (
            movies.map((item) => {
              const movie = item.movie || item;
              return (
                <div key={movie.id} className={`shrink-0 ${cardWidthClass}`}>
                  <MovieCard
                    movie={movie}
                    explanation={item.explanation || null}
                    algorithm={item.algorithm || null}
                    score={item.score ?? null}
                    compact={cardCompact}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Algorithm Explainer Component
 */
function AlgoExplainer({ method, onSelect }) {
  const algorithms = [
    {
      id: "hybrid",
      name: "Hybrid AI",
      icon: Brain,
      color: "#8B5CF6",
      tagline: "Smart Balanced Recommendation",
      description: "Blends your plot/genre preferences with community ratings. The most accurate model for discovering tailored picks.",
    },
    {
      id: "content",
      name: "Similar Story",
      icon: Layers,
      color: "#6366F1",
      tagline: "Plot & Theme Matching",
      description: "Matches movies by shared genres, director style, and plot synopsis to movies you rated 5 stars.",
    },
    {
      id: "collaborative",
      name: "Peer Match",
      icon: Users,
      color: "#38BDF8",
      tagline: "Community Taste Twins",
      description: "Finds viewers with rating habits identical to yours and surfaces the movies they loved.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
      {algorithms.map((algo) => {
        const Icon = algo.icon;
        const isActive = method === algo.id;
        return (
          <button
            key={algo.id}
            type="button"
            onClick={() => onSelect(algo.id)}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              isActive
                ? "bg-[#1B202B] border-[#8B5CF6] shadow-md shadow-purple-600/10"
                : "bg-[#12151D] border-[#292E3A] hover:border-[#3E4659]"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${algo.color}20` }}
              >
                <Icon size={16} style={{ color: algo.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F8FAFC]">{algo.name}</p>
                <p className="text-[10px] text-[#A1A1AA]">{algo.tagline}</p>
              </div>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">{algo.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export function HomePage({ onSearch, onSelectGenre }) {
  const {
    currentUser,
    userRatings,
    userPreferences,
    hybridWeight,
    setHybridWeight,
    refreshTrigger,
    triggerRefresh,
    setIsOnboardingOpen,
  } = useUser();

  // State for all 6 homepage sections
  const [recommendations, setRecommendations] = useState([]);
  const [recommendedMethod, setRecommendedMethod] = useState("hybrid");
  const [algoUsed, setAlgoUsed] = useState("hybrid");
  const [showWeightTuner, setShowWeightTuner] = useState(false);
  const [showAlgoExplainer, setShowAlgoExplainer] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [basedOnRatingsMovies, setBasedOnRatingsMovies] = useState([]);
  const [recentlyAddedMovies, setRecentlyAddedMovies] = useState([]);
  const [bollywoodMovies, setBollywoodMovies] = useState([]);
  const [tollywoodMovies, setTollywoodMovies] = useState([]);
  const [genreExploreMovies, setGenreExploreMovies] = useState([]);
  const [selectedExploreGenre, setSelectedExploreGenre] = useState("Sci-Fi");

  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [loadingRatingsBased, setLoadingRatingsBased] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch Personalized Recommendations
  useEffect(() => {
    async function fetchRecs() {
      if (!currentUser) {
        // Signed out – clear stale recommendations
        setRecommendations([]);
        setLoadingRecs(false);
        return;
      }
      setLoadingRecs(true);
      try {
        const res = await api.getRecommendations(
          currentUser.id,
          recommendedMethod,
          12,
          recommendedMethod === "hybrid" ? hybridWeight : null
        );
        setRecommendations(res.recommendations || []);
        setAlgoUsed(res.algorithm_used || recommendedMethod);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setRecommendations([]);
      } finally {
        setLoadingRecs(false);
        setIsRefreshing(false);
      }
    }
    fetchRecs();
  }, [currentUser, recommendedMethod, hybridWeight, refreshTrigger]);

  // 2. Fetch General Movie Sections (Trending, Popular, Bollywood, Tollywood, Top Rated)
  useEffect(() => {
    async function fetchCatalogs() {
      setLoadingGeneral(true);
      try {
        const [trendRes, popRes, recentRes, bollyRes, tollyRes] = await Promise.all([
          api.getMovies({ page: 1, pageSize: 12, sortBy: "popular", userId: currentUser?.id }),
          api.getMovies({ page: 2, pageSize: 12, sortBy: "popular", userId: currentUser?.id }),
          api.getMovies({ page: 1, pageSize: 12, sortBy: "rating", userId: currentUser?.id }),
          api.getMovies({ page: 1, pageSize: 12, industry: "Bollywood", sortBy: "popular", userId: currentUser?.id }),
          api.getMovies({ page: 1, pageSize: 12, industry: "Tollywood", sortBy: "popular", userId: currentUser?.id }),
        ]);
        setTrendingMovies(trendRes.items || []);
        setPopularMovies(popRes.items || []);
        setRecentlyAddedMovies(recentRes.items || []);
        setBollywoodMovies(bollyRes.items || []);
        setTollywoodMovies(tollyRes.items || []);
      } catch (err) {
        console.error("Failed to load movie catalogs:", err);
      } finally {
        setLoadingGeneral(false);
      }
    }
    fetchCatalogs();
  }, [currentUser]);

  // 3. Fetch "Based on Your Ratings"
  useEffect(() => {
    async function fetchBasedOnRatings() {
      if (!currentUser) {
        setBasedOnRatingsMovies([]);
        setLoadingRatingsBased(false);
        return;
      }
      setLoadingRatingsBased(true);
      try {
        const ratingEntries = Object.entries(userRatings);
        if (ratingEntries.length > 0) {
          // Find the movie with highest rating
          const highestRated = ratingEntries.sort((a, b) => b[1] - a[1])[0];
          const similarRes = await api.getSimilarMovies(currentUser.id, highestRated[0], 12);
          setBasedOnRatingsMovies(similarRes.similar_movies || []);
        } else if (userPreferences && userPreferences.length > 0) {
          // Fallback to user's favorite genre
          const genreRes = await api.getMovies({
            page: 1,
            pageSize: 12,
            genre: userPreferences[0],
            sortBy: "popular",
            userId: currentUser.id,
          });
          setBasedOnRatingsMovies(genreRes.items || []);
        } else {
          setBasedOnRatingsMovies([]);
        }
      } catch (err) {
        console.error("Failed to load based-on-ratings movies:", err);
        setBasedOnRatingsMovies([]);
      } finally {
        setLoadingRatingsBased(false);
      }
    }
    fetchBasedOnRatings();
  }, [currentUser, userRatings, userPreferences]);

  // 4. Fetch Explore by Genre
  useEffect(() => {
    async function fetchGenreMovies() {
      try {
        const res = await api.getMovies({
          page: 1,
          pageSize: 12,
          genre: selectedExploreGenre,
          sortBy: "popular",
          userId: currentUser?.id,
        });
        setGenreExploreMovies(res.items || []);
      } catch (err) {
        console.error("Failed to load genre movies:", err);
      }
    }
    fetchGenreMovies();
  }, [selectedExploreGenre, currentUser]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    triggerRefresh();
  };

  const spotlightMovie = trendingMovies[0] || null;
  const userRatingCount = Object.keys(userRatings || {}).length;
  const exploreGenres = ["Sci-Fi", "Action", "Drama", "Animation", "Thriller", "Comedy", "Crime", "Adventure"];

  return (
    <div className="space-y-12 pb-20">
      {/* ── Hero Section ── */}
      <HeroSection onSearch={onSearch} onSelectGenre={onSelectGenre} featuredMovie={spotlightMovie} />

      {/* ── Section 1: Recommended For You (AI-Powered with Algorithm Controls) ── */}
      {currentUser && (
      <section className="space-y-4">
        {/* Recommendation Engine Control Panel */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles size={18} className="text-[#8B5CF6]" />
                <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">
                  Recommended For You
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8B5CF6]/15 text-[#DDD6FE] border border-[#8B5CF6]/30">
                  {algoUsed.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Personalized for <strong className="text-[#F8FAFC]">{currentUser?.name}</strong>
                {userRatingCount > 0 && <> • {userRatingCount} movies rated</>}
                {userPreferences?.length > 0 && <> • {userPreferences.length} favorite genres</>}
              </p>
            </div>

            {/* Controls (Algorithm switcher, explainer toggle, tuner, refresh) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* How it works toggle */}
              <button
                type="button"
                onClick={() => setShowAlgoExplainer(!showAlgoExplainer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  showAlgoExplainer
                    ? "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]/50"
                    : "bg-[#1B202B] text-[#A1A1AA] border-[#292E3A] hover:text-[#F8FAFC] hover:border-[#3E4659]"
                }`}
              >
                <Info size={13} />
                <span>How it works</span>
              </button>

              {/* Hybrid Weight Tuner Toggle */}
              {recommendedMethod === "hybrid" && (
                <button
                  type="button"
                  onClick={() => setShowWeightTuner(!showWeightTuner)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    showWeightTuner
                      ? "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]/50"
                      : "bg-[#1B202B] text-[#A1A1AA] border-[#292E3A] hover:text-[#F8FAFC] hover:border-[#3E4659]"
                  }`}
                >
                  <Sliders size={13} />
                  <span>Tune</span>
                </button>
              )}

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-2 rounded-lg bg-[#1B202B] hover:bg-[#232938] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#292E3A] transition-colors cursor-pointer"
                title="Refresh Recommendations"
                aria-label="Refresh"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#8B5CF6]" : ""} />
              </button>
            </div>
          </div>

          {/* Collapsible Algorithm Explainer Panel */}
          {showAlgoExplainer && (
            <div className="pt-3 border-t border-[#292E3A]/70 animate-fade-in">
              <p className="text-xs text-[#A1A1AA] mb-1 font-medium">
                Choose the machine learning algorithm powering your feed:
              </p>
              <AlgoExplainer method={recommendedMethod} onSelect={setRecommendedMethod} />
            </div>
          )}

          {/* Compact Algorithm Switcher (Visible when explainer is closed) */}
          {!showAlgoExplainer && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] uppercase text-[#A1A1AA] font-bold tracking-wider mr-1">Algorithm:</span>
              {[
                { id: "hybrid", label: "Hybrid AI", color: "#8B5CF6" },
                { id: "content", label: "Similar Story", color: "#6366F1" },
                { id: "collaborative", label: "Peer Match", color: "#38BDF8" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRecommendedMethod(m.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    recommendedMethod === m.id
                      ? "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]/50"
                      : "bg-[#1B202B] text-[#A1A1AA] hover:text-[#F8FAFC] border-[#292E3A] hover:border-[#3E4659]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Hybrid Weight Fine-Tuner */}
          {showWeightTuner && recommendedMethod === "hybrid" && (
            <div className="pt-3 border-t border-[#292E3A]/70 animate-fade-in space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#8B5CF6]" /> Fine-tune Hybrid Balance
                </span>
                <span className="text-[#DDD6FE] font-mono text-xs">
                  Story: {Math.round(hybridWeight * 100)}% • Peers: {Math.round((1 - hybridWeight) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-[#38BDF8] shrink-0">100% Peer Taste</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={hybridWeight}
                  onChange={(e) => setHybridWeight(parseFloat(e.target.value))}
                  className="w-full accent-[#8B5CF6] cursor-pointer h-1.5 rounded-lg bg-[#1B202B]"
                />
                <span className="text-[11px] font-medium text-[#8B5CF6] shrink-0">100% Story/Genre</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Slide left for community-driven crowd favorites • Slide right for plot & genre similarity
              </p>
            </div>
          )}
        </div>

        {/* Cold-Start Prompt for New Profiles */}
        {userRatingCount === 0 && !loadingRecs && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#8B5CF6]/15 to-[#12151D] border border-[#8B5CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#8B5CF6]/20 shrink-0">
                <Zap size={18} className="text-[#8B5CF6]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F8FAFC]">Personalize your feed, {currentUser?.name}!</h4>
                <p className="text-xs text-[#A1A1AA]">Rate movies below or choose your favorite genres to train the ML model.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="btn-primary px-4 py-2 text-xs shrink-0 cursor-pointer"
            >
              Set Preferences →
            </button>
          </div>
        )}

        {/* Recommendations Carousel */}
        <MovieCarousel
          title=""
          movies={recommendations}
          loading={loadingRecs}
          emptyText="Rate a few movies below to generate personalized recommendations!"
        />
      </section>
      )}

      {/* ── Section 2: Trending Movies ── */}
      <MovieCarousel
        title="Trending Movies"
        subtitle="Most watched titles across the platform this week"
        icon={TrendingUp}
        movies={trendingMovies}
        loading={loadingGeneral}
        viewAllAction={() => onSelectGenre && onSelectGenre("All")}
      />

      {/* ── Section 3: Based on Your Ratings ── */}
      {currentUser && basedOnRatingsMovies.length > 0 && (
        <MovieCarousel
          title="Based on Your Ratings"
          subtitle={
            userRatingCount > 0
              ? "Recommended because of your top-rated titles"
              : "Curated from your selected favorite genres"
          }
          icon={Star}
          movies={basedOnRatingsMovies}
          loading={loadingRatingsBased}
        />
      )}

      {/* ── Section 4: Popular Movies ── */}
      <MovieCarousel
        title="Popular Movies"
        subtitle="Critically acclaimed movies loved by global audiences"
        icon={Film}
        movies={popularMovies}
        loading={loadingGeneral}
      />

      {/* ── Section 4b: Blockbuster Bollywood ── */}
      {bollywoodMovies.length > 0 && (
        <MovieCarousel
          title="Blockbuster Bollywood"
          subtitle="Celebrated Hindi cinema classics, iconic dramas, and global sensations"
          icon={Film}
          movies={bollywoodMovies}
          loading={loadingGeneral}
        />
      )}

      {/* ── Section 4c: Tollywood & South Indian Epics ── */}
      {tollywoodMovies.length > 0 && (
        <MovieCarousel
          title="Tollywood & South Indian Epics"
          subtitle="Record-breaking action spectacles, grand mythologies, and cinematic wonders"
          icon={Award}
          movies={tollywoodMovies}
          loading={loadingGeneral}
        />
      )}

      {/* ── Section 5: Explore by Genre ── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#8B5CF6]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">Explore by Genre</h2>
              <p className="text-xs text-[#A1A1AA]">Browse cinema collections by genre category</p>
            </div>
          </div>

          {/* Interactive Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {exploreGenres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedExploreGenre(g)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedExploreGenre === g
                    ? "genre-pill-active"
                    : "genre-pill"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <MovieCarousel
          title=""
          movies={genreExploreMovies}
          loading={!genreExploreMovies.length && loadingGeneral}
          emptyText={`No ${selectedExploreGenre} movies found.`}
        />
      </section>

      {/* ── Section 6: Recently Added & Top Rated ── */}
      <MovieCarousel
        title="Recently Added & Top Rated"
        subtitle="Highest rated gems with outstanding critic consensus"
        icon={Award}
        movies={recentlyAddedMovies}
        loading={loadingGeneral}
      />
    </div>
  );
}
