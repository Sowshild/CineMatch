import React, { useEffect, useState } from "react";
import { Bookmark, Compass, LogIn } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

export function FavoritesPage({ onNavigateDiscover }) {
  const { currentUser, userFavorites, openAuthModal } = useUser();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!currentUser) {
        setFavoriteMovies([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const favs = await api.getUserFavorites(currentUser.id);
        const moviesList = favs.map((f) => f.movie).filter(Boolean);
        setFavoriteMovies(moviesList);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [currentUser, userFavorites]);

  // ── Guest state: prompt to sign in ──
  if (!currentUser) {
    return (
      <div className="space-y-8 pb-16">
        <div className="p-14 text-center rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-4">
          <Bookmark size={44} className="mx-auto text-[#A1A1AA]/30" />
          <h3 className="text-lg font-bold text-[#F8FAFC]">Sign In to See Your Watchlist</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Create an account or sign in to bookmark your favorite movies and build a personal watchlist.
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

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bookmark size={22} className="text-[#8B5CF6] fill-[#8B5CF6]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">My Watchlist</h1>
        </div>
        <p className="text-sm text-[#A1A1AA]">
          {favoriteMovies.length} saved title{favoriteMovies.length !== 1 ? "s" : ""} for {currentUser?.name}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
          ))}
        </div>
      ) : favoriteMovies.length === 0 ? (
        <div className="p-14 text-center rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-4">
          <Bookmark size={44} className="mx-auto text-[#A1A1AA]/40" />
          <h3 className="text-lg font-bold text-[#F8FAFC]">Your Watchlist is Empty</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Click the bookmark icon on any movie card or detail view to save it to your personal watchlist.
          </p>
          <button
            type="button"
            onClick={onNavigateDiscover}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs cursor-pointer"
          >
            <Compass size={15} /> Discover Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
