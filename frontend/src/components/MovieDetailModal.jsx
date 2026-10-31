import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Bookmark,
  Calendar,
  Film,
  Sparkles,
  Trash2,
  Users,
  Play,
  ExternalLink,
  MessageSquare,
  Send,
  Clapperboard,
  Tv,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { StarRating } from "./StarRating";
import { api } from "../services/api";
import { formatRating, getFallbackPoster } from "../utils/helpers";

function SmartImage({ src, alt, className, fallbackTitle }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setCurrentSrc(src);
    setStage(0);
  }, [src]);

  const handleError = () => {
    if (stage === 0 && src && src.includes("image.tmdb.org/t/p/w342")) {
      setCurrentSrc(src.replace("/w342/", "/w780/"));
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
      onError={handleError}
    />
  );
}

export function MovieDetailModal() {
  const {
    selectedMovie,
    closeMovieDetails,
    userRatings,
    userFavorites,
    rateMovie,
    deleteRating,
    toggleFavorite,
    currentUser,
    requireAuth,
    openMovieDetails,
    showNotification,
  } = useUser();

  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "reviews" | "similar"

  useEffect(() => {
    if (!selectedMovie) {
      setSimilarMovies([]);
      setReviews([]);
      setShowPlayer(false);
      setReviewComment("");
      setActiveTab("overview");
      return;
    }

    async function fetchData() {
      setLoadingSimilar(true);
      setLoadingReviews(true);
      try {
        const [simRes, revRes] = await Promise.all([
          api.getSimilarMovies(currentUser?.id || 1, selectedMovie.id, 6).catch(() => ({ similar_movies: [] })),
          api.getReviews(selectedMovie.id).catch(() => []),
        ]);
        setSimilarMovies(simRes.similar_movies || []);
        setReviews(revRes || []);
      } catch (err) {
        console.error("Failed to load details data:", err);
      } finally {
        setLoadingSimilar(false);
        setLoadingReviews(false);
      }
    }
    fetchData();
  }, [selectedMovie, currentUser]);

  if (!selectedMovie) return null;

  const personalRating = userRatings[selectedMovie.id] || 0;
  const isFav = !!userFavorites[selectedMovie.id];
  const genres = selectedMovie.genre_list || (selectedMovie.genres ? selectedMovie.genres.split("|") : []);
  const industry = selectedMovie.industry || "Hollywood";

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    requireAuth(async () => {
      setSubmittingReview(true);
      try {
        const newRev = await api.createReview(selectedMovie.id, {
          user_id: currentUser?.id,
          comment: reviewComment.trim(),
          rating: reviewRating,
        });

        setReviews((prev) => [newRev, ...prev]);
        setReviewComment("");
        // Sync rating with UserContext state
        rateMovie(selectedMovie.id, reviewRating);
        showNotification("Review and rating posted successfully!");
      } catch (err) {
        console.error("Failed to post review:", err);
        showNotification(err.message || "Failed to post review", "error");
      } finally {
        setSubmittingReview(false);
      }
    }, "Please sign in to post a review and rate this movie.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in"
      onClick={closeMovieDetails}
    >
      <div
        className="relative w-full sm:max-w-4xl max-h-screen sm:max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#12151D] shadow-2xl border border-[#292E3A] text-[#F8FAFC] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Header */}
        <div className="relative h-64 sm:h-84 w-full overflow-hidden bg-[#090B10] shrink-0">
          <SmartImage
            src={selectedMovie.backdrop_url || selectedMovie.poster_url}
            alt={selectedMovie.title}
            fallbackTitle={selectedMovie.title}
            className="w-full h-full object-cover object-top opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12151D] via-[#12151D]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12151D]/90 via-[#12151D]/40 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeMovieDetails}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-[#1B202B]/80 hover:bg-[#1B202B] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#292E3A] transition-colors z-20 cursor-pointer backdrop-blur-md"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Bottom Header Overlay Info */}
          <div className="absolute bottom-5 inset-x-5 flex items-end gap-5 z-10">
            {/* Poster thumbnail */}
            <div className="hidden sm:block w-32 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-[#292E3A] bg-[#090B10]">
              <SmartImage
                src={selectedMovie.poster_url}
                alt={selectedMovie.title}
                fallbackTitle={selectedMovie.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Industry badge */}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border ${
                    industry === "Bollywood"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : industry === "Tollywood"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]/30"
                  }`}
                >
                  {industry}
                </span>

                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1B202B] text-[#FBBF24] border border-[#292E3A] flex items-center gap-1">
                  <Star size={11} className="fill-[#FBBF24]" />
                  {formatRating(selectedMovie.vote_average)} / 10
                </span>

                {selectedMovie.release_year && (
                  <span className="flex items-center gap-1 text-xs text-[#A1A1AA] font-medium bg-[#1B202B] px-2 py-0.5 rounded border border-[#292E3A]">
                    <Calendar size={11} /> {selectedMovie.release_year}
                  </span>
                )}
                {selectedMovie.vote_count && (
                  <span className="text-xs text-[#A1A1AA]">
                    {selectedMovie.vote_count.toLocaleString()} votes
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F8FAFC] mb-2 leading-tight">
                {selectedMovie.title}
              </h1>

              <div className="flex flex-wrap gap-1.5">
                {genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1B202B] text-[#DDD6FE] border border-[#292E3A]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Streaming & Action Controls */}
        <div className="px-5 sm:px-7 pt-4 bg-[#12151D] border-b border-[#292E3A]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Play Official Trailer toggle */}
              {selectedMovie.video_url && (
                <button
                  type="button"
                  onClick={() => setShowPlayer(!showPlayer)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg ${
                    showPlayer
                      ? "bg-[#6D28D9] text-white shadow-purple-600/40"
                      : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-purple-600/25"
                  }`}
                  title="Watch official trailer directly in CineMatch"
                >
                  <Play size={15} className="fill-white" />
                  <span>{showPlayer ? "Close Trailer" : "Watch Trailer"}</span>
                </button>
              )}

              {/* Where to Watch Guide Link */}
              {selectedMovie.stream_url && (
                <a
                  href={selectedMovie.stream_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-[#1B202B] hover:bg-[#232938] text-[#F8FAFC] border border-[#292E3A] hover:border-[#38BDF8]/60 hover:text-[#38BDF8] transition-all cursor-pointer shadow-sm"
                  title="Check streaming availability, subscriptions, or rentals on Plex guide"
                >
                  <Tv size={15} className="text-[#38BDF8]" />
                  <span>Where to Watch</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              )}

              {/* Watchlist Toggle */}
              <button
                type="button"
                onClick={() => toggleFavorite(selectedMovie)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border cursor-pointer ${
                  isFav
                    ? "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]"
                    : "bg-[#1B202B] hover:bg-[#232938] text-[#F8FAFC] border-[#292E3A]"
                }`}
              >
                <Bookmark size={15} className={isFav ? "fill-[#DDD6FE]" : ""} />
                <span>{isFav ? "In Watchlist" : "Watchlist"}</span>
              </button>
            </div>

            {/* Quick Star Rating */}
            <div className="flex items-center gap-2 bg-[#1B202B] px-3 py-1.5 rounded-xl border border-[#292E3A]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                {personalRating > 0 ? "Rated" : "Rate"}
              </span>
              <StarRating
                rating={personalRating}
                onRate={(val) => rateMovie(selectedMovie.id, val)}
                size={18}
                showLabel
              />
              {personalRating > 0 && (
                <button
                  type="button"
                  onClick={() => deleteRating(selectedMovie.id)}
                  className="p-1 rounded text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Remove rating"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Embedded Streaming Video Player (Responsive 16:9) */}
          {showPlayer && selectedMovie.video_url && (
            <div className="pb-5 animate-scale-in">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#292E3A] shadow-2xl">
                <iframe
                  src={selectedMovie.video_url}
                  title={`${selectedMovie.title} - Stream`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
              <div className="text-[11px] text-[#A1A1AA] mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span>Official trailer & preview for {selectedMovie.title}.</span>
                {selectedMovie.stream_url && (
                  <a
                    href={selectedMovie.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38BDF8] hover:underline flex items-center gap-1 font-medium"
                  >
                    Check streaming platforms & rentals <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "border-[#8B5CF6] text-[#8B5CF6]"
                  : "border-transparent text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Overview & Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "border-[#8B5CF6] text-[#8B5CF6]"
                  : "border-transparent text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <MessageSquare size={13} />
              <span>Reviews ({reviews.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("similar")}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "similar"
                  ? "border-[#8B5CF6] text-[#8B5CF6]"
                  : "border-transparent text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              <Sparkles size={13} />
              <span>More Like This</span>
            </button>
          </div>
        </div>

        {/* Modal Tab Content */}
        <div className="p-5 sm:p-7 space-y-6 bg-[#12151D]">
          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Synopsis */}
              <div>
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-2">
                  Synopsis
                </h2>
                <p className="text-[#F8FAFC]/90 leading-relaxed text-sm sm:text-base">
                  {selectedMovie.overview || "No overview available for this title."}
                </p>
              </div>

              {/* Cast & Crew Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#1B202B] border border-[#292E3A] text-sm">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                    Industry / Origin
                  </p>
                  <p className="font-semibold text-[#F8FAFC]">{selectedMovie.industry || "Hollywood"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                    Director
                  </p>
                  <p className="font-semibold text-[#F8FAFC]">{selectedMovie.director || "Not Specified"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">
                    Featured Cast
                  </p>
                  <p className="text-[#F8FAFC]/80 line-clamp-2">
                    {selectedMovie.cast || "Cast details not available"}
                  </p>
                </div>
              </div>

              {/* Streaming Availability & Watch Guide Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B202B] to-[#12151D] border border-[#292E3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Tv size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#F8FAFC]">Where to Stream This Title</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1B202B] text-[#A1A1AA] border border-[#292E3A]">
                        Streaming Guide
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      Check which platforms have streaming rights (Netflix, Prime Video, Apple TV+, etc.), rental options, or ad-supported streaming.
                    </p>
                  </div>
                </div>
                {selectedMovie.stream_url && (
                  <a
                    href={selectedMovie.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1B202B] hover:bg-[#232938] text-[#F8FAFC] border border-[#292E3A] hover:border-[#38BDF8]/60 hover:text-[#38BDF8] transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>View Platforms</span>
                    <ExternalLink size={12} className="opacity-70" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITY REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-fade-in">
              {/* Review Composer */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#1B202B] border border-[#292E3A]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC] mb-3 flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#8B5CF6]" />
                  <span>Write a Review</span>
                </h3>

                <form onSubmit={handlePostReview} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-[#A1A1AA]">
                      Posting as <strong className="text-[#F8FAFC]">{currentUser?.name || "Guest"}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A1A1AA]">Your Score:</span>
                      <StarRating
                        rating={reviewRating}
                        onRate={(val) => setReviewRating(val)}
                        size={18}
                        showLabel
                      />
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts on the cinematography, acting, directing, or plot twists..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#12151D] border border-[#292E3A] text-[#F8FAFC] placeholder-[#A1A1AA]/50 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || !reviewComment.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                    >
                      <Send size={13} />
                      <span>{submittingReview ? "Posting..." : "Post Review"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Community Reviews ({reviews.length})
                </h4>

                {loadingReviews ? (
                  <div className="space-y-3">
                    <div className="h-20 rounded-xl skeleton" />
                    <div className="h-20 rounded-xl skeleton" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 rounded-xl bg-[#1B202B]/50 border border-[#292E3A]/50">
                    <MessageSquare size={24} className="mx-auto text-[#A1A1AA]/50 mb-2" />
                    <p className="text-sm font-semibold text-[#F8FAFC]">No reviews yet</p>
                    <p className="text-xs text-[#A1A1AA]">Be the first to share your thoughts on this title!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-[#1B202B] border border-[#292E3A] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.user_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                            alt={rev.user_name}
                            className="w-7 h-7 rounded-full object-cover border border-[#292E3A]"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#F8FAFC]">{rev.user_name || "Cinephile"}</p>
                            <p className="text-[10px] text-[#A1A1AA]">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Recent"}
                            </p>
                          </div>
                        </div>

                        {rev.rating && (
                          <span className="flex items-center gap-1 text-xs font-bold text-[#FBBF24] bg-[#12151D] px-2 py-0.5 rounded border border-[#292E3A]">
                            <Star size={11} className="fill-[#FBBF24]" />
                            {rev.rating}★
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#F8FAFC]/90 leading-relaxed pl-9">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MORE LIKE THIS */}
          {activeTab === "similar" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#8B5CF6]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
                  Recommended Based On This Movie
                </h3>
              </div>

              {loadingSimilar ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
                  ))}
                </div>
              ) : similarMovies.length === 0 ? (
                <p className="text-xs text-[#A1A1AA]">No similar titles found for this movie.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {similarMovies.map((item) => {
                    const m = item.movie || item;
                    return (
                      <div
                        key={m.id}
                        onClick={() => openMovieDetails(m)}
                        className="group cursor-pointer rounded-xl overflow-hidden bg-[#1B202B] border border-[#292E3A] hover:border-[#8B5CF6]/50 transition-all flex flex-col"
                      >
                        <div className="aspect-[2/3] w-full overflow-hidden bg-[#090B10]">
                          <SmartImage
                            src={m.poster_url}
                            alt={m.title}
                            fallbackTitle={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2 flex-1 flex flex-col justify-between">
                          <p className="font-medium text-xs text-[#F8FAFC] line-clamp-1 group-hover:text-[#8B5CF6] transition-colors">
                            {m.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] mt-1">
                            <span className="text-[9px] uppercase px-1 rounded bg-[#12151D] border border-[#292E3A]">
                              {m.industry || "Hollywood"}
                            </span>
                            <span className="flex items-center gap-0.5 text-[#FBBF24]">
                              <Star size={9} className="fill-[#FBBF24]" />
                              {formatRating(m.vote_average)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
