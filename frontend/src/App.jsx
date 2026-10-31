import React, { useState } from "react";
import { UserProvider, useUser } from "./context/UserContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { MyRatingsPage } from "./pages/MyRatingsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MovieDetailModal } from "./components/MovieDetailModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { AuthModal } from "./components/AuthModal";
import { CineMatchLogo } from "./components/CineMatchLogo";
import { IntroScreen } from "./components/IntroScreen";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

function AppContent() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverGenre, setDiscoverGenre] = useState("All");
  const { notification, currentUser } = useUser();

  // When user signs out, redirect to home tab so they don't see stale personal pages
  const prevUserRef = React.useRef(currentUser);
  React.useEffect(() => {
    if (prevUserRef.current && !currentUser) {
      // User just signed out
      setActiveTab("home");
    }
    prevUserRef.current = currentUser;
  }, [currentUser]);

  const handleHeroSearch = (query) => {
    setDiscoverQuery(query);
    setDiscoverGenre("All");
    setActiveTab("discover");
  };

  const handleGenreSelect = (genre) => {
    setDiscoverGenre(genre);
    setDiscoverQuery("");
    setActiveTab("discover");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090B10] text-[#F8FAFC]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#12151D] border border-[#292E3A] shadow-2xl toast-enter text-xs font-semibold max-w-xs">
          {notification.type === "error" ? (
            <AlertCircle size={15} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          )}
          <span className="text-[#F8FAFC]">{notification.message}</span>
        </div>
      )}

      {/* Sticky Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "home" && (
          <HomePage onSearch={handleHeroSearch} onSelectGenre={handleGenreSelect} />
        )}
        {activeTab === "discover" && (
          <DiscoverPage initialQuery={discoverQuery} initialGenre={discoverGenre} />
        )}
        {activeTab === "ratings" && (
          <MyRatingsPage onNavigateDiscover={() => setActiveTab("discover")} />
        )}
        {activeTab === "favorites" && (
          <FavoritesPage onNavigateDiscover={() => setActiveTab("discover")} />
        )}
      </main>

      {/* Shared Modals */}
      <MovieDetailModal />
      <OnboardingModal />
      <AuthModal />

      {/* Fullscreen Intro Curtain Screen */}
      {showIntro && (
        <IntroScreen onExplore={() => setShowIntro(false)} />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-[#292E3A] py-8 text-xs text-[#A1A1AA] mt-16 bg-[#090B10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CineMatchLogo size={26} textClassName="text-base" />
            <span className="text-[#292E3A]">|</span>
            <span>Intelligent Movie Recommendation Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowIntro(true)}
              className="text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={12} />
              <span>Replay Intro</span>
            </button>
            <span>© 2026 CineMatch. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
