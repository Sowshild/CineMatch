import React, { useState, useEffect } from "react";
import { Search, RotateCcw, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

export function DiscoverPage({ initialQuery = "", initialGenre = "All" }) {
  const { currentUser, userRatings } = useUser();

  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [genresList, setGenresList] = useState([]);
  const [industriesList, setIndustriesList] = useState(["All", "Hollywood", "Bollywood", "Tollywood"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getGenres().then((list) => setGenresList(["All", ...list])).catch(console.error);
    api.getIndustries().then((list) => setIndustriesList(["All", ...list])).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
    if (initialGenre) setSelectedGenre(initialGenre);
    setCurrentPage(1);
  }, [initialQuery, initialGenre]);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      try {
        if (searchQuery.trim()) {
          let results = await api.searchMovies(searchQuery.trim(), currentUser?.id);
          if (selectedGenre && selectedGenre !== "All") {
            results = results.filter((m) => (m.genres || "").toLowerCase().includes(selectedGenre.toLowerCase()));
          }
          if (selectedIndustry && selectedIndustry !== "All") {
            results = results.filter((m) => (m.industry || "").toLowerCase() === selectedIndustry.toLowerCase());
          }
          if (minRating) results = results.filter((m) => (m.vote_average || 0) >= Number(minRating));
          setMovies(results);
          setTotal(results.length);
          setTotalPages(1);
        } else {
          const res = await api.getMovies({
            page: currentPage,
            pageSize: 20,
            genre: selectedGenre,
            industry: selectedIndustry,
            minRating: minRating ? Number(minRating) : null,
            sortBy,
            userId: currentUser?.id,
          });
          setMovies(res.items || []);
          setTotal(res.total || 0);
          setTotalPages(res.total_pages || 1);
        }
      } catch (err) {
        console.error("Failed to load discover movies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [searchQuery, selectedGenre, selectedIndustry, minRating, sortBy, currentPage, currentUser, userRatings]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    setSelectedIndustry("All");
    setMinRating("");
    setSortBy("popular");
    setCurrentPage(1);
  };

  const selectStyles =
    "w-full px-3 py-2.5 rounded-xl bg-[#1B202B] border border-[#292E3A] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] cursor-pointer appearance-none";

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC] mb-1">Discover Movies</h1>
        <p className="text-sm text-[#A1A1AA]">Search, filter, and explore our full curated film database</p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title (e.g. Inception, Interstellar, Dune)…"
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#1B202B] border border-[#292E3A] text-[#F8FAFC] placeholder-[#A1A1AA]/50 text-sm focus:outline-none focus:border-[#8B5CF6] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] bg-[#12151D] px-2 py-1 rounded-lg border border-[#292E3A]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}
              className={selectStyles}
            >
              {industriesList.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === "All" ? "All Industries" : ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); }}
              className={selectStyles}
            >
              {genresList.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => { setMinRating(e.target.value); setCurrentPage(1); }}
              className={selectStyles}
            >
              <option value="">Any Rating</option>
              <option value="7.0">7.0★ and above</option>
              <option value="7.5">7.5★ and above</option>
              <option value="8.0">8.0★ — Acclaimed</option>
              <option value="8.5">8.5★ — Masterpiece</option>
              <option value="9.0">9.0★ — All-Time Great</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className={selectStyles}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="year_desc">Newest First</option>
              <option value="year_asc">Classic / Oldest</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Result Stats & Reset */}
        <div className="flex items-center justify-between pt-1 text-xs text-[#A1A1AA]">
          <span>
            Showing <strong className="text-[#F8FAFC]">{movies.length}</strong> of <strong className="text-[#F8FAFC]">{total}</strong> titles
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-[#DDD6FE] hover:text-[#8B5CF6] font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw size={11} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl skeleton" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="p-14 text-center rounded-2xl bg-[#12151D] border border-[#292E3A] space-y-3">
          <Film size={40} className="mx-auto text-[#A1A1AA]/30" />
          <h3 className="text-lg font-bold text-[#F8FAFC]">No Movies Found</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            No movies match your current search and filter criteria. Try resetting your filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-primary mt-2 px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!searchQuery && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#12151D] hover:bg-[#1B202B] border border-[#292E3A] text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <span className="text-xs font-bold text-[#A1A1AA]">
            Page <span className="text-[#DDD6FE]">{currentPage}</span> / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#12151D] hover:bg-[#1B202B] border border-[#292E3A] text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
