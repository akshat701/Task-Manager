import { create } from "zustand";

interface AuthState {
  user: any;
  token: string | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),

  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));