import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { api, tokenStorage } from "../services/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRatings, setUserRatings] = useState({});   // { [movieId]: ratingValue }
  const [userFavorites, setUserFavorites] = useState({}); // { [movieId]: true }
  const [userPreferences, setUserPreferences] = useState([]); // ["Sci-Fi", "Action"]
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // "login" | "register"
  const [authModalMessage, setAuthModalMessage] = useState(""); // pre-filled prompt
  // Misc
  const [hybridWeight, setHybridWeight] = useState(0.5);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Pending action to invoke after auth succeeds
  const pendingAction = useRef(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ─── requireAuth ────────────────────────────────────────────────────────
  // Call this before any action that needs a logged-in user.
  // If user is already logged in, runs `action` immediately.
  // Otherwise opens the AuthModal and queues the action to run after login.
  const requireAuth = useCallback(
    (action, message = "Please sign in to continue.") => {
      if (currentUser) {
        action();
      } else {
        pendingAction.current = action;
        setAuthModalMessage(message);
        setAuthModalTab("login");
        setAuthModalOpen(true);
      }
    },
    [currentUser]
  );

  // ─── Bootstrap: restore session from localStorage token ─────────────────
  useEffect(() => {
    async function restoreSession() {
      const token = tokenStorage.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const user = await api.getMe();
        setCurrentUser(user);
      } catch {
        // Token expired or invalid – clear it
        tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  // ─── Load user-specific data whenever currentUser changes ────────────────
  const loadUserData = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const [ratings, favorites, prefs] = await Promise.all([
        api.getUserRatings(userId),
        api.getUserFavorites(userId),
        api.getPreferences(userId),
      ]);

      const ratingsMap = {};
      ratings.forEach((r) => { ratingsMap[r.movie_id] = r.rating; });
      setUserRatings(ratingsMap);

      const favMap = {};
      favorites.forEach((f) => { favMap[f.movie_id] = true; });
      setUserFavorites(favMap);

      setUserPreferences(prefs.favorite_genres || []);
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    } else {
      // Logged out – clear personal state
      setUserRatings({});
      setUserFavorites({});
      setUserPreferences([]);
    }
  }, [currentUser, loadUserData]);

  // ─── Auth actions ────────────────────────────────────────────────────────
  const login = async (loginId, password) => {
    const result = await api.login(loginId, password); // throws on 401/404
    tokenStorage.set(result.access_token);
    setCurrentUser(result.user);
    setAuthModalOpen(false);
    showNotification(`Welcome back, ${result.user.name}! 🎬`);
    // Run any queued action
    if (pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setTimeout(action, 100); // let state settle first
    }
    return result.user;
  };

  const register = async ({ username, name, email, password, avatar, initialGenres = [] }) => {
    const result = await api.register({ username, name, email, password, avatar });
    tokenStorage.set(result.access_token);
    setCurrentUser(result.user);

    if (initialGenres.length > 0) {
      try {
        await api.savePreferences(result.user.id, initialGenres);
        setUserPreferences(initialGenres);
      } catch { /* non-fatal */ }
    }

    setAuthModalOpen(false);
    showNotification(`Welcome to CineMatch, ${result.user.name}! 🎉`);
    if (!initialGenres.length) setIsOnboardingOpen(true);

    if (pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setTimeout(action, 100);
    }
    return result.user;
  };

  const logout = () => {
    tokenStorage.clear();
    setCurrentUser(null);
    // Explicitly clear all user-specific data so nothing lingers in the UI
    setUserRatings({});
    setUserFavorites({});
    setUserPreferences([]);
    setRefreshTrigger((p) => p + 1);
    showNotification("You've been signed out.");
  };

  // ─── Movie actions (all guarded by requireAuth) ──────────────────────────
  const rateMovie = (movieId, score) => {
    requireAuth(async () => {
      try {
        await api.saveRating(currentUser.id, movieId, score);
        setUserRatings((prev) => ({ ...prev, [movieId]: score }));
        setRefreshTrigger((p) => p + 1);
        showNotification(`Rated ${score}★ — Recommendations updated!`);
      } catch (err) {
        showNotification("Could not save rating. Please try again.", "error");
      }
    }, "Sign in to rate movies and get personalised recommendations.");
  };

  const deleteRating = async (movieId) => {
    if (!currentUser) return;
    try {
      await api.deleteRating(currentUser.id, movieId);
      setUserRatings((prev) => {
        const copy = { ...prev };
        delete copy[movieId];
        return copy;
      });
      setRefreshTrigger((p) => p + 1);
      showNotification("Rating removed.");
    } catch {
      showNotification("Could not remove rating.", "error");
    }
  };

  const toggleFavorite = (movie) => {
    requireAuth(async () => {
      const isFav = !!userFavorites[movie.id];
      try {
        if (isFav) {
          await api.removeFavorite(currentUser.id, movie.id);
          setUserFavorites((prev) => {
            const copy = { ...prev };
            delete copy[movie.id];
            return copy;
          });
          showNotification(`Removed "${movie.title}" from Watchlist`);
        } else {
          await api.addFavorite(currentUser.id, movie.id);
          setUserFavorites((prev) => ({ ...prev, [movie.id]: true }));
          showNotification(`Added "${movie.title}" to Watchlist ❤️`);
        }
      } catch {
        showNotification("Could not update Watchlist.", "error");
      }
    }, "Sign in to add movies to your Watchlist.");
  };

  const savePreferences = async (genres) => {
    if (!currentUser) return;
    try {
      const res = await api.savePreferences(currentUser.id, genres);
      setUserPreferences(res.favorite_genres);
      setIsOnboardingOpen(false);
      setRefreshTrigger((p) => p + 1);
      showNotification("Genre preferences updated! Recommendations refreshed. ✨");
    } catch {
      showNotification("Could not save preferences.", "error");
    }
  };

  // Modal helpers
  const openMovieDetails = (movie) => setSelectedMovie(movie);
  const closeMovieDetails = () => setSelectedMovie(null);

  const openAuthModal = (tab = "login", message = "") => {
    setAuthModalTab(tab);
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    requireAuth,
    userRatings,
    userFavorites,
    userPreferences,
    rateMovie,
    deleteRating,
    toggleFavorite,
    savePreferences,
    selectedMovie,
    openMovieDetails,
    closeMovieDetails,
    isOnboardingOpen,
    setIsOnboardingOpen,
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    authModalMessage,
    openAuthModal,
    hybridWeight,
    setHybridWeight,
    refreshTrigger,
    triggerRefresh: () => setRefreshTrigger((p) => p + 1),
    refreshUserData: () => currentUser && loadUserData(currentUser.id),
    loading,
    notification,
    showNotification,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
