/**
 * CreateProfileModal — legacy component, now delegated to AuthModal.
 * This file is kept for compatibility; it opens the AuthModal register tab.
 */
import { useEffect } from "react";
import { useUser } from "../context/UserContext";

export function CreateProfileModal() {
  // This component is no longer rendered by App.jsx (AuthModal replaced it).
  // Kept as a safe no-op in case any stale import remains.
  return null;
}
