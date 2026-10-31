import React, { useState, useEffect, useRef } from "react";
import {
  X, Film, Eye, EyeOff, AlertCircle, Loader2,
  User, Mail, Lock, AtSign, Sparkles, LogIn, Upload, Camera
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { CineMatchLogo } from "./CineMatchLogo";

const AVATAR_PRESETS = [
  { id: "a1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", label: "Critic" },
  { id: "a2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", label: "Sci-Fi Fan" },
  { id: "a3", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", label: "Drama Buff" },
  { id: "a4", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", label: "Cinephile" },
  { id: "a5", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80", label: "Thriller" },
  { id: "a6", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80", label: "Animation" },
  { id: "a7", url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80", label: "Action" },
  { id: "a8", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", label: "Romance" },
];

function InputField({ label, id, type = "text", value, onChange, placeholder, icon: Icon, right, autoFocus }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={type === "password" ? "current-password" : "off"}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} ${right ? "pr-12" : "pr-4"} py-2.5 rounded-xl bg-[#1B202B] border border-[#292E3A] text-[#F8FAFC] placeholder-[#A1A1AA]/50 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition-all`}
        />
        {right}
      </div>
    </div>
  );
}

function PasswordField({ label, id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete || "current-password"}
          className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#1B202B] border border-[#292E3A] text-[#F8FAFC] placeholder-[#A1A1AA]/50 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Login Tab ─────────────────────────────────────────────────────────────
function LoginTab({ onSwitch }) {
  const { login } = useUser();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginId.trim()) return setError("Please enter your username or email.");
    if (!password) return setError("Please enter your password.");

    setLoading(true);
    try {
      await login(loginId.trim(), password);
    } catch (err) {
      // Map backend status codes to friendly messages
      if (err.status === 404) {
        setError("Profile not found. Please check your username or email, or create a new profile.");
      } else if (err.status === 401) {
        setError("Incorrect password. Please check your credentials.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <InputField
        label="Username or Email"
        id="login-id"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        placeholder="your_username or email@example.com"
        icon={Mail}
        autoFocus
      />

      <PasswordField
        label="Password"
        id="login-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-purple-600/20 mt-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        <span>{loading ? "Signing in…" : "Sign In"}</span>
      </button>

      <p className="text-center text-xs text-[#A1A1AA] pt-1">
        Don't have a profile?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#8B5CF6] hover:text-[#DDD6FE] font-semibold transition-colors cursor-pointer"
        >
          Create one free →
        </button>
      </p>
    </form>
  );
}

// ─── Register Tab ──────────────────────────────────────────────────────────
function RegisterTab({ onSwitch }) {
  const { register } = useUser();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameManual, setUsernameManual] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[3].url);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image file size should be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!usernameManual) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (username.trim().length < 2) return setError("Username must be at least 2 characters.");
    if (!email.includes("@") || !email.includes(".")) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        avatar: selectedAvatar,
        initialGenres: [],
      });
    } catch (err) {
      if (err.status === 400) {
        if (err.message.toLowerCase().includes("username")) {
          setError("That username is already taken. Please choose another.");
        } else if (err.message.toLowerCase().includes("email")) {
          setError("An account with that email already exists. Try signing in.");
        } else {
          setError(err.message);
        }
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Avatar strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Profile Avatar</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#8B5CF6] hover:text-[#DDD6FE] transition-colors cursor-pointer"
          >
            <Upload size={12} />
            <span>Upload Photo</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFile}
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Custom Avatar preview if uploaded */}
          {selectedAvatar.startsWith("data:") && (
            <div className="shrink-0 relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#8B5CF6] shadow-md shadow-purple-600/40">
              <img src={selectedAvatar} alt="Custom" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </div>
            </div>
          )}
          {AVATAR_PRESETS.map((av) => (
            <button
              key={av.id}
              type="button"
              onClick={() => setSelectedAvatar(av.url)}
              className={`shrink-0 w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                selectedAvatar === av.url
                  ? "border-[#8B5CF6] shadow-md shadow-purple-600/40 scale-110"
                  : "border-[#292E3A] opacity-60 hover:opacity-100"
              }`}
              title={av.label}
            >
              <img
                src={av.url}
                alt={av.label}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${av.label}&background=1B202B&color=8B5CF6&size=80`; }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Full Name *"
          id="reg-name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Maya Patel"
          icon={User}
          autoFocus
        />
        <div>
          <label htmlFor="reg-username" className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
            Username *
          </label>
          <div className="relative">
            <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsernameManual(true);
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20));
              }}
              placeholder="mayap"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1B202B] border border-[#292E3A] text-[#F8FAFC] placeholder-[#A1A1AA]/50 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 transition-all"
            />
          </div>
        </div>
      </div>

      <InputField
        label="Email Address *"
        id="reg-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="maya@example.com"
        icon={Mail}
      />

      <PasswordField
        label="Password * (min 6 characters)"
        id="reg-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Create a strong password"
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-purple-600/20"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        <span>{loading ? "Creating profile…" : "Create Profile & Explore"}</span>
      </button>

      <p className="text-center text-xs text-[#A1A1AA]">
        Already have a profile?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#8B5CF6] hover:text-[#DDD6FE] font-semibold transition-colors cursor-pointer"
        >
          Sign in →
        </button>
      </p>
    </form>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────
export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, authModalMessage } = useUser();

  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#12151D] shadow-2xl border border-[#292E3A] overflow-hidden my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#292E3A]">
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#1B202B] hover:bg-[#232938] text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>

          <div className="mb-3">
            <CineMatchLogo size={32} />
          </div>

          {/* Context message */}
          {authModalMessage && (
            <p className="text-xs text-[#DDD6FE] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-lg px-3 py-2 mb-3">
              {authModalMessage}
            </p>
          )}

          {/* Tabs */}
          <div className="flex rounded-xl bg-[#1B202B] p-1 gap-1">
            <button
              type="button"
              onClick={() => setAuthModalTab("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                authModalTab === "login"
                  ? "bg-[#8B5CF6] text-white shadow-md"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalTab("register")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                authModalTab === "register"
                  ? "bg-[#8B5CF6] text-white shadow-md"
                  : "text-[#A1A1AA] hover:text-[#F8FAFC]"
              }`}
            >
              Create Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-5">
          {authModalTab === "login" ? (
            <LoginTab onSwitch={() => setAuthModalTab("register")} />
          ) : (
            <RegisterTab onSwitch={() => setAuthModalTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

