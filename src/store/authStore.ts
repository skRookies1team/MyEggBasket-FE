import { create } from "zustand";
import api from "../store/axiosStore"; 

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  appkey: string;
  appsecret: string;
  account: string;
}

interface User {
  id: number;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  appkey: string;
  appsecret: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  

  setToken: (access: string) => void;
  setUser: (user: User) => void;
  logout: () => void;

  login: (loginData: LoginRequest) => Promise<void>;
  signup: (signupData: SignupRequest) => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem("accessToken"),
  accessToken: localStorage.getItem("accessToken"),
  user: null,

  setToken: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    set({ isAuthenticated: false, accessToken: null, user: null });
  },

  login: async (loginData: LoginRequest) => {
    const tokenRes = await api.post("/auth/login", loginData);
    const { accessToken } = tokenRes.data;

    get().setToken(accessToken);

    const userRes = await api.get("/users/me");
    get().setUser(userRes.data);
  },

  signup: async (signupData: SignupRequest) => {
    await api.post("/auth/signup", signupData);
  },

  deleteAccount: async () => {
  const user = get().user;
  if (!user) return;

  try {
    await api.delete(`/users/${user.id}`);

    get().logout();
  } catch (err) {
    console.error("회원 탈퇴 실패:", err);
    throw err;
  }
},

  fetchUser: async () => {
    if (!get().accessToken) return;

    try {
      const res = await api.get("/users/me");
      get().setUser(res.data);
    } catch {
      get().logout();
    }
  },
}));
