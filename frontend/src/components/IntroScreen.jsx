import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Sparkles, Brain, Film } from "lucide-react";
import { CineMatchLogo } from "./CineMatchLogo";

export function IntroScreen({ onExplore }) {
  const [isSlidingUp, setIsSlidingUp] = useState(false);
  const containerRef = useRef(null);

  // Trigger page-up exit animation
  const handleEnter = () => {
    if (isSlidingUp) return;
    setIsSlidingUp(true);
    setTimeout(() => {
      onExplore();
    }, 750);
  };

  // Scroll, Touch Swipe, and Keyboard interactions
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e) => {
      if (isSlidingUp) return;
      const el = containerRef.current;
      if (!el) return;

      const hasOverflow = el.scrollHeight > el.clientHeight + 25;

      if (e.deltaY > 0) {
        // User scrolling down
        if (!hasOverflow) {
          // Entire intro fits in viewport -> scroll down directly enters main app
          handleEnter();
        } else {
          // Content is scrollable -> if user reached near bottom and continues scrolling down, enter app
          const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 25;
          if (isAtBottom && e.deltaY > 15) {
            handleEnter();
          }
        }
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (isSlidingUp) return;
      const el = containerRef.current;
      if (!el || !e.touches || !e.touches[0]) return;

      const diff = touchStartY - e.touches[0].clientY; // positive = swipe up (scrolling down)
      const hasOverflow = el.scrollHeight > el.clientHeight + 25;

      if (diff > 30) {
        if (!hasOverflow) {
          handleEnter();
        } else {
          const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 25;
          if (isAtBottom && diff > 40) {
            handleEnter();
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEnter();
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        const el = containerRef.current;
        if (!el) return;
        const hasOverflow = el.scrollHeight > el.clientHeight + 25;
        if (!hasOverflow) {
          e.preventDefault();
          handleEnter();
        } else {
          const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 25;
          if (isAtBottom) {
            e.preventDefault();
            handleEnter();
          }
        }
      }
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: true });
      el.addEventListener("touchstart", handleTouchStart, { passive: true });
      el.addEventListener("touchmove", handleTouchMove, { passive: true });
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (el) {
        el.removeEventListener("wheel", handleWheel);
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchmove", handleTouchMove);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSlidingUp]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] bg-[#090B10] flex flex-col justify-between overflow-y-auto overscroll-contain select-none animate-intro-curtain transition-transform duration-750 ease-[cubic-bezier(0.77,0,0.175,1)] scrollbar-thin scrollbar-thumb-purple-900/40 scrollbar-track-transparent ${
        isSlidingUp ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Background Cinematic Atmosphere & Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Projector Cone Light Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-4xl h-[70vh] bg-gradient-to-b from-[#8B5CF6]/25 via-[#38BDF8]/10 to-transparent blur-3xl transform -scale-y-100 animate-intro-beam origin-top pointer-events-none" />

        {/* Anamorphic Horizontal Flare Sweep */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8]/60 to-transparent blur-sm animate-intro-flare pointer-events-none" />

        {/* Layered radial glow spots */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-[#8B5CF6]/15 rounded-full blur-[140px] animate-ambient-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[350px] bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Cinematic Film Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#090B10]/40 to-[#090B10]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between animate-intro-eyebrow shrink-0">
        <CineMatchLogo size={36} textClassName="text-xl" />
        <button
          type="button"
          onClick={handleEnter}
          className="text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] px-3.5 py-1.5 rounded-lg border border-[#292E3A] hover:border-[#8B5CF6]/50 bg-[#12151D]/80 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:bg-[#1B202B]"
        >
          Skip Intro →
        </button>
      </header>

      {/* Center Cinematic Showcase */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-6 my-auto py-8">
        {/* Large Centered Brand Icon Emblem Reveal */}
        <div className="flex justify-center mb-2 animate-intro-logo">
          <div className="relative p-1 rounded-2xl bg-gradient-to-b from-[#8B5CF6]/30 to-[#38BDF8]/20 shadow-[0_0_50px_rgba(139,92,246,0.35)]">
            <CineMatchLogo size={58} showText={false} />
          </div>
        </div>

        {/* Netflix-Style Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151D]/90 border border-[#8B5CF6]/40 text-[#DDD6FE] text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-purple-600/20 animate-intro-eyebrow">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
          <span>Cinematic AI Discovery</span>
        </div>

        {/* Cinematic Netflix-Scale Headline Reveal */}
        <h1 className="netflix-title text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] animate-intro-title">
          WHERE YOUR TASTE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#DDD6FE] to-[#38BDF8]">
            MEETS CINEMA
          </span>
        </h1>

        {/* Subtitle Reveal */}
        <p className="text-sm sm:text-base text-[#F8FAFC]/80 max-w-xl mx-auto leading-relaxed drop-shadow-md animate-intro-subtitle">
          Personalized recommendations powered by hybrid machine learning.
          Discover 125 curated titles across Hollywood, Bollywood & Tollywood with transparent algorithm insights.
        </p>

        {/* Feature Highlights Reveal */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 animate-intro-features">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#12151D]/80 border border-[#292E3A] text-xs font-medium text-[#F8FAFC] backdrop-blur-md">
            <Brain size={14} className="text-[#8B5CF6]" />
            <span>Hybrid ML Algorithms</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#12151D]/80 border border-[#292E3A] text-xs font-medium text-[#F8FAFC] backdrop-blur-md">
            <Film size={14} className="text-[#38BDF8]" />
            <span>125 Curated Masterpieces</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#12151D]/80 border border-[#292E3A] text-xs font-medium text-[#F8FAFC] backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Real-time Taste Evolution</span>
          </div>
        </div>
      </main>

      {/* Bottom Interactive Explore Arrow (Page-Up Action) */}
      <footer className="relative z-10 pb-8 pt-4 flex flex-col items-center justify-center animate-intro-cta shrink-0">
        <button
          type="button"
          onClick={handleEnter}
          className="flex flex-col items-center gap-2.5 group cursor-pointer focus:outline-none"
          aria-label="Scroll down or click to explore CineMatch"
        >
          {/* Animated Mouse Scroll Indicator */}
          <div className="w-5 h-8 rounded-full border-2 border-[#8B5CF6]/60 group-hover:border-[#8B5CF6] flex items-start justify-center p-1 transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <div className="w-1 h-2 rounded-full bg-[#8B5CF6] group-hover:bg-[#DDD6FE] animate-bounce" />
          </div>

          <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] font-bold text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
            Scroll down or click to explore
          </span>

          <div className="relative mt-1">
            <div className="absolute -inset-1 rounded-full bg-[#8B5CF6]/30 blur-sm group-hover:bg-[#8B5CF6]/70 transition-all" />
            <div className="relative w-11 h-11 rounded-full border-2 border-[#8B5CF6]/60 bg-[#12151D] flex items-center justify-center text-[#DDD6FE] group-hover:bg-[#8B5CF6] group-hover:text-white group-hover:border-[#8B5CF6] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] transition-all animate-bounce shadow-xl">
              <ChevronDown size={22} className="stroke-[2.5]" />
            </div>
          </div>
        </button>
      </footer>
    </div>
  );
}


