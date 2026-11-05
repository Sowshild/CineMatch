/**
 * CineMatch API Service
 * Centralized client for communication with the FastAPI backend.
 * Supports JWT bearer token auth for protected endpoints.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "") + "/api";

const TOKEN_KEY = "cinematch_auth_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = tokenStorage.get();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorDetail = "API Error";
      try {
        const errorData = await response.json();
        errorDetail =
          errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        errorDetail = response.statusText;
      }
      const err = new Error(errorDetail);
      err.status = response.status;
      throw err;
    }
    return await response.json();
  } catch (err) {
    console.error(`Fetch error at ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // ─── Auth ────────────────────────────────────────────────────────────────
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (loginId, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login_id: loginId, password }),
    }),

  getMe: () => request("/auth/me"),

  updateProfile: (data) =>
    request("/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),

  // ─── Movies ──────────────────────────────────────────────────────────────
  getMovies: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page);
    if (params.pageSize) searchParams.set("page_size", params.pageSize);
    if (params.genre && params.genre !== "All")
      searchParams.set("genre", params.genre);
    if (params.industry && params.industry !== "All")
      searchParams.set("industry", params.industry);
    if (params.releaseYear)
      searchParams.set("release_year", params.releaseYear);
    if (params.minRating) searchParams.set("min_rating", params.minRating);
    if (params.sortBy) searchParams.set("sort_by", params.sortBy);
    if (params.userId) searchParams.set("user_id", params.userId);
    return request(`/movies?${searchParams.toString()}`);
  },

  searchMovies: (query, userId = null) => {
    const searchParams = new URLSearchParams({ q: query });
    if (userId) searchParams.set("user_id", userId);
    return request(`/movies/search?${searchParams.toString()}`);
  },

  getMovieDetails: (movieId, userId = null) => {
    const searchParams = new URLSearchParams();
    if (userId) searchParams.set("user_id", userId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return request(`/movies/${movieId}${query}`);
  },

  getGenres: () => request("/genres"),
  getIndustries: () => request("/industries"),

  // ─── Reviews ─────────────────────────────────────────────────────────────
  getReviews: (movieId) => request(`/movies/${movieId}/reviews`),
  createReview: (movieId, data) =>
    request(`/movies/${movieId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ─── Users (legacy / profile list) ───────────────────────────────────────
  getUsers: () => request("/users"),
  createUser: (data) =>
    request("/users", { method: "POST", body: JSON.stringify(data) }),

  // ─── Preferences ─────────────────────────────────────────────────────────
  getPreferences: (userId) => request(`/preferences/${userId}`),
  savePreferences: (userId, favoriteGenres) =>
    request("/preferences", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, favorite_genres: favoriteGenres }),
    }),

  // ─── Ratings ─────────────────────────────────────────────────────────────
  getUserRatings: (userId) => request(`/ratings/${userId}`),
  saveRating: (userId, movieId, rating) =>
    request("/ratings", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, movie_id: movieId, rating }),
    }),
  deleteRating: (userId, movieId) =>
    request(`/ratings/${userId}/${movieId}`, { method: "DELETE" }),

  // ─── Favorites ────────────────────────────────────────────────────────────
  getUserFavorites: (userId) => request(`/favorites/${userId}`),
  addFavorite: (userId, movieId) =>
    request("/favorites", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, movie_id: movieId }),
    }),
  removeFavorite: (userId, movieId) =>
    request(`/favorites/${userId}/${movieId}`, { method: "DELETE" }),

  // ─── Recommendations ──────────────────────────────────────────────────────
  getRecommendations: (userId, method = "hybrid", limit = 10, contentWeight = null) => {
    let url = `/recommendations/${userId}?method=${method}&limit=${limit}`;
    if (contentWeight !== null && contentWeight !== undefined) {
      url += `&content_weight=${contentWeight}`;
    }
    return request(url);
  },

  getSimilarMovies: (userId, movieId, limit = 6) =>
    request(`/recommendations/${userId}/similar/${movieId}?limit=${limit}`),

  // ─── Statistics ───────────────────────────────────────────────────────────
  getUserStats: (userId) => request(`/stats/${userId}`),

  // ─── Reset data ───────────────────────────────────────────────────────────
  // resetData: () => request("/reset-data", { method: "POST" }),
};
