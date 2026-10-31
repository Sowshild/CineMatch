import React, { useEffect, useState } from "react";
import { Star, Trash2, Compass, LogIn } from "lucide-react";
import { RatingStatsChart } from "../components/RatingStatsChart";
import { StarRating } from "../components/StarRating";
import { formatRating, getFallbackPoster } from "../utils/helpers";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

function SmartPoster({ src, alt }) {
  const [currentSrc, setCurrentSrc] = useState(src || getFallbackPoster(alt));
  return (
    <img
      src={currentSrc}
      alt={alt}
      className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-xl bg-[#090B10] shrink-0 border border-[#292E3A]"
      onError={() => setCurrentSrc(getFallbackPoster(alt))}
    />
  );
}

export function MyRatingsPage({ onNavigateDiscover }) {
  const { currentUser, userRatings, rateMovie, deleteRating, openMovieDetails, openAuthModal } = useUser();
  const [ratedMoviesList, setRatedMoviesList] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedStarFilter, setSelectedStarFilter] = useState("all");
  const [sortOption, setSortOption] = useState("recent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) {
        setRatedMoviesList([]);
        setStats(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [ratingsData, statsData] = await Promise.all([
          api.getUserRatings(currentUser.id),
          api.getUserStats(currentUser.id),
        ]);
        setRatedMoviesList(ratingsData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load ratings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser, userRatings]);

  // ── Guest state: prompt to sign in ──
  if (!currentUser) {
    return (
      <div className="space-y-8 pb-16">
        <div className="p-14 text-center rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-4">
          <Star size={44} className="mx-auto text-[#A1A1AA]/30" />
          <h3 className="text-lg font-bold text-[#F8FAFC]">Sign In to See Your Ratings</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Create an account or sign in to rate movies and train your personal AI recommendation engine.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={onNavigateDiscover}
              className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
            >
              <Compass size={15} /> Browse Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  let displayedList = [...ratedMoviesList];
  if (selectedStarFilter !== "all") {
    const starNum = parseFloat(selectedStarFilter);
    displayedList = displayedList.filter((r) => Math.round(r.rating) === starNum);
  }
  if (sortOption === "highest") displayedList.sort((a, b) => b.rating - a.rating);
  else if (sortOption === "lowest") displayedList.sort((a, b) => a.rating - b.rating);
  else displayedList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const avgRating = ratedMoviesList.length > 0
    ? (ratedMoviesList.reduce((acc, r) => acc + r.rating, 0) / ratedMoviesList.length).toFixed(1)
    : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star size={22} className="text-[#FBBF24] fill-[#FBBF24]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">My Ratings</h1>
          </div>
          <p className="text-sm text-[#A1A1AA]">
            {currentUser?.name}'s rating history • powers your personal recommendation engine
          </p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#12151D] border border-[#292E3A]">
            <Star size={18} className="text-[#FBBF24] fill-[#FBBF24]" />
            <div>
              <p className="text-[10px] font-bold uppercase text-[#A1A1AA] tracking-wider">Average Score</p>
              <p className="text-xl font-extrabold text-[#F8FAFC]">{avgRating}★</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Chart Section */}
      {stats && stats.total_ratings > 0 && (
        <section>
          <RatingStatsChart stats={stats} />
        </section>
      )}

      {/* Rating List Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292E3A]">
          <h2 className="text-base font-bold text-[#F8FAFC]">
            Rated Titles <span className="text-[#A1A1AA] font-normal">({displayedList.length} of {ratedMoviesList.length})</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Star Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#12151D] border border-[#292E3A]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] px-2">Filter</span>
              {["all", "5", "4", "3", "2", "1"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStarFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStarFilter === s
                      ? "bg-[#8B5CF6] text-white"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  {s === "all" ? "All" : `${s}★`}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#12151D] border border-[#292E3A] text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Rated</option>
              <option value="highest">Highest First</option>
              <option value="lowest">Lowest First</option>
            </select>
          </div>
        </div>

        {/* Rating Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl skeleton" />)}
          </div>
        ) : ratedMoviesList.length === 0 ? (
          <div className="p-14 text-center rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-4">
            <Star size={44} className="mx-auto text-[#A1A1AA]/30" />
            <h3 className="text-lg font-bold text-[#F8FAFC]">No Ratings Yet</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              Rate movies to train your personal AI recommendation model. Discover movies to begin!
            </p>
            <button
              type="button"
              onClick={onNavigateDiscover}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
            >
              <Compass size={15} /> Discover Movies
            </button>
          </div>
        ) : displayedList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#12151D] border border-[#292E3A]">
            <p className="text-sm text-[#A1A1AA]">No movies match the {selectedStarFilter}★ filter.</p>
            <button
              type="button"
              onClick={() => setSelectedStarFilter("all")}
              className="text-xs font-bold text-[#DDD6FE] hover:underline mt-2 cursor-pointer"
            >
              Show all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedList.map((item) => {
              const movie = item.movie;
              if (!movie) return null;
              return (
                <div
                  key={item.id}
                  onClick={() => openMovieDetails(movie)}
                  className="flex gap-4 p-3.5 rounded-xl bg-[#12151D] border border-[#292E3A] hover:border-[#8B5CF6]/50 transition-all cursor-pointer group"
                >
                  <SmartPoster src={movie.poster_url} alt={movie.title} />
                  <div className="flex flex-col justify-between flex-1 overflow-hidden py-0.5">
                    <div>
                      <h4 className="font-semibold text-sm text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors line-clamp-1">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        {movie.release_year || "N/A"} • ★ {formatRating(movie.vote_average)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(movie.genre_list || (movie.genres ? movie.genres.split("|") : [])).slice(0, 2).map((g, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-[#1B202B] text-[#A1A1AA] border border-[#292E3A]">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#292E3A]/60 flex items-center justify-between mt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-[#FBBF24] mb-0.5">
                          Your Rating: {item.rating}★
                        </span>
                        <StarRating rating={item.rating} onRate={(newScore) => rateMovie(movie.id, newScore)} size={14} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteRating(movie.id); }}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove rating"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
