import React, { useState, useEffect } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

export function OnboardingModal() {
  const { isOnboardingOpen, setIsOnboardingOpen, userPreferences, savePreferences, currentUser } = useUser();
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  useEffect(() => {
    if (userPreferences) setSelectedGenres([...userPreferences]);
  }, [userPreferences, isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await savePreferences(selectedGenres);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => setIsOnboardingOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#12151D] shadow-2xl border border-[#292E3A] overflow-hidden animate-scale-in text-[#F8FAFC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#292E3A]">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#1B202B] hover:bg-[#232938] text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#8B5CF6]/20">
              <Sparkles size={16} className="text-[#8B5CF6]" />
            </div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#8B5CF6]">Personalize Feed</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#F8FAFC]">Genre Preferences</h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {currentUser ? `Select favorite genres for ${currentUser.name}` : "Select your favorite genres"}
          </p>
        </div>

        {/* Genre Grid */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#A1A1AA]">Select your preferred movie genres:</p>
            <span className="text-xs font-bold text-[#DDD6FE]">
              {selectedGenres.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1 pb-1">
            {availableGenres.map((g) => {
              const isSelected = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#8B5CF6]/20 text-[#DDD6FE] border-[#8B5CF6]/60 shadow-sm"
                      : "bg-[#1B202B] hover:bg-[#232938] text-[#A1A1AA] border-[#292E3A] hover:border-[#3E4659] hover:text-[#F8FAFC]"
                  }`}
                >
                  {isSelected && <Check size={11} className="stroke-[3] shrink-0" />}
                  <span>{g}</span>
                </button>
              );
            })}
          </div>

          {selectedGenres.length === 0 && (
            <p className="text-[11px] text-[#A1A1AA] mt-2">Pick genres to train your recommendation engine.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-[#292E3A] flex items-center justify-between gap-3 bg-[#12151D]">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 cursor-pointer"
          >
            <Sparkles size={15} />
            <span>{saving ? "Saving…" : "Save Preferences"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
