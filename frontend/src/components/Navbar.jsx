import React, { useState } from "react";
import {
  Film, Compass, Star, Bookmark, SlidersHorizontal, Menu, X,
  LogIn, UserPlus, LogOut, ChevronDown, Settings,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { CineMatchLogo } from "./CineMatchLogo";

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=1B202B&color=8B5CF6&size=80&bold=true`;

export function Navbar({ activeTab, setActiveTab }) {
  const {
    currentUser, logout, openAuthModal,
    setIsOnboardingOpen, userFavorites, userRatings,
  } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const favCount = Object.keys(userFavorites || {}).length;
  const ratingCount = Object.keys(userRatings || {}).length;

  const navItems = [
    { id: "home", label: "Home", icon: Film },
    { id: "discover", label: "Discover", icon: Compass },
    { id: "favorites", label: "Watchlist", icon: Bookmark, badge: favCount },
    { id: "ratings", label: "My Ratings", icon: Star, badge: ratingCount },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full cinema-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Brand Logo ── */}
        <div
          onClick={() => handleNavClick("home")}
          className="cursor-pointer shrink-0 select-none"
        >
          <CineMatchLogo size={36} />
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "text-[#F8FAFC] font-semibold"
                    : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1B202B]/60"
                }`}
              >
                <Icon size={15} className={isActive ? "text-[#8B5CF6]" : "text-[#A1A1AA]"} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 rounded-full text-[10px] bg-[#8B5CF6]/20 text-[#DDD6FE] font-bold border border-[#8B5CF6]/30">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-3.5 h-[2px] rounded-full bg-[#8B5CF6]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Right: Auth / Profile ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Preferences (only when logged in) */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#12151D] hover:bg-[#1B202B] text-[#A1A1AA] hover:text-[#F8FAFC] border border-[#292E3A] hover:border-[#3E4659] transition-all cursor-pointer"
              title="Genre Preferences"
            >
              <SlidersHorizontal size={13} />
              <span className="hidden lg:block">Preferences</span>
            </button>
          )}

          {currentUser ? (
            /* ── Profile Dropdown ── */
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#12151D] hover:bg-[#1B202B] border border-[#292E3A] hover:border-[#3E4659] transition-all cursor-pointer"
              >
                <img
                  src={currentUser.avatar || avatarFallback(currentUser.name)}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-[#8B5CF6]/50"
                  onError={(e) => { e.target.src = avatarFallback(currentUser.name); }}
                />
                <span className="hidden sm:block text-xs font-semibold text-[#F8FAFC] max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#A1A1AA] transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1B202B] shadow-2xl border border-[#292E3A] p-2 z-50 animate-scale-in">
                    {/* User info */}
                    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#292E3A] mb-1">
                      <img
                        src={currentUser.avatar || avatarFallback(currentUser.name)}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#8B5CF6]/40"
                        onError={(e) => { e.target.src = avatarFallback(currentUser.name); }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#F8FAFC] truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-[#A1A1AA] truncate">@{currentUser.username}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setIsOnboardingOpen(true); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#12151D] transition-colors cursor-pointer"
                    >
                      <Settings size={14} />
                      <span>Genre Preferences</span>
                    </button>

                    <div className="mt-1 pt-1 border-t border-[#292E3A]">
                      <button
                        type="button"
                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── Guest Buttons ── */
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] bg-[#12151D] hover:bg-[#1B202B] border border-[#292E3A] hover:border-[#3E4659] transition-all cursor-pointer"
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                <UserPlus size={13} />
                <span>Join Free</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1B202B] border border-transparent hover:border-[#292E3A] cursor-pointer transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#292E3A] bg-[#090B10]/98 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#1B202B] text-[#F8FAFC] border border-[#292E3A]"
                    : "text-[#A1A1AA] hover:bg-[#12151D] hover:text-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className={isActive ? "text-[#8B5CF6]" : "text-[#A1A1AA]"} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#8B5CF6]/20 text-[#DDD6FE] font-bold border border-[#8B5CF6]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Auth Section */}
          <div className="pt-2 border-t border-[#292E3A] space-y-1">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <img
                    src={currentUser.avatar || avatarFallback(currentUser.name)}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#8B5CF6]/40"
                    onError={(e) => { e.target.src = avatarFallback(currentUser.name); }}
                  />
                  <div>
                    <p className="text-sm font-bold text-[#F8FAFC]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#A1A1AA]">@{currentUser.username}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsOnboardingOpen(true); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:bg-[#1B202B] hover:text-[#F8FAFC] cursor-pointer"
                >
                  <SlidersHorizontal size={16} />
                  <span>Genre Preferences</span>
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { openAuthModal("login"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#F8FAFC] bg-[#1B202B] border border-[#292E3A] cursor-pointer"
                >
                  <LogIn size={16} className="text-[#8B5CF6]" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { openAuthModal("register"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>Create Free Profile</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
