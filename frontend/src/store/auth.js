// src/store/auth.js
import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

const STORAGE_KEY = "uml_access_token";

const useAuth = create((set, get) => ({
  token: localStorage.getItem(STORAGE_KEY) || "",
  user: (() => {
    const t = localStorage.getItem(STORAGE_KEY);
    if (!t) return null;
    try { return jwtDecode(t); } catch { return null; }
  })(),

  login: (token) => {
    localStorage.setItem(STORAGE_KEY, token);
    set({ token, user: jwtDecode(token) });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: "", user: null });
  },
}));

export default useAuth;
