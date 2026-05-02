import { create } from "zustand";

interface AuthState {
  user: any;
  token: string | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

// 🔥 load from localStorage
const storedUser = localStorage.getItem("user");

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem("token"),

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // ✅ IMPORTANT
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ✅ IMPORTANT
    set({ token: null, user: null });
  },
}));