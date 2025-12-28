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
  username: string;
  appkey: string | null;
  appsecret: string | null;
  account?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;

  // KIS 인증 상태
  kisToken: string | null;
  kisTokenExpire: string | null;
  approvalKey: string | null;

  setToken: (access: string) => void;
  setUser: (user: User) => void;
  logout: () => void;

  login: (loginData: LoginRequest) => Promise<void>;
  signup: (signupData: SignupRequest) => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchUser: () => Promise<void>;

  issueKisToken: () => Promise<void>;
  issueApprovalKey: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem("accessToken"),
  accessToken: localStorage.getItem("accessToken"),
  user: null,

  kisToken: null,
  kisTokenExpire: null,
  approvalKey: null,

  setToken: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    set({ accessToken, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("recent_stocks");
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      kisToken: null,
      kisTokenExpire: null,
      approvalKey: null,
    });
  },

  login: async (loginData: LoginRequest) => {
    const tokenRes = await api.post("/auth/login", loginData);
    const { accessToken } = tokenRes.data;

    get().setToken(accessToken);

    // 사용자 정보 조회
    const userRes = await api.get("/users/me");
    const user = userRes.data;
    get().setUser(user);

    console.log("/users/me 응답 : ", userRes.data);
    
    // 자동 KIS 토큰/승인키 발급 조건: appkey + appsecret 등록된 사용자만
    if (user.appkey && user.appsecret) {
      console.log(" KIS API 키 발견 → 자동으로 KIS 토큰 발급 진행");
      await get().issueKisToken();
      await get().issueApprovalKey();
    } else {
      console.log(" KIS API 키 없음 → KIS 토큰 자동 발급 생략");
    }
  },

  signup: async (signupData: SignupRequest) => {
    await api.post("/auth/signup", signupData);
  },

  deleteAccount: async () => {
    const user = get().user;
    if (!user) return;

    await api.delete(`/users/${user.id}`);
    get().logout();
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

  // -------------------------------
  // KIS 토큰 요청
  // -------------------------------
  issueKisToken: async () => {
    const res = await api.post("/kis/auth/token");
    const { accessToken, accessTokenExpired } = res.data;

    set({
      kisToken: accessToken,
      kisTokenExpire: accessTokenExpired,
    });

    console.log(" KIS Access Token 저장됨:", accessToken);
  },

  // -------------------------------
  // KIS Approval Key 요청 (WebSocket 용)
  // -------------------------------
  issueApprovalKey: async () => {
    const res = await api.post("/kis/auth/approval-key");
    const { approvalKey } = res.data;

    set({ approvalKey });

    console.log(" KIS Approval Key 저장됨:", approvalKey);
  },
}));
