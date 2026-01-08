// src/config/api.ts

// Vite 환경변수로부터 앱 키와 시크릿 키를 읽어옴
export const APP_KEY = import.meta.env.VITE_APP_KEY ?? '';
export const APP_SECRET = import.meta.env.VITE_APP_SECRET ?? '';
export const FINANCIAL_SERVICE_KEY = import.meta.env.VITE_FINANCIAL_SERVICE_KEY ?? '';

// [수정됨] CORS 해결을 위해 프록시 경로('/api') 사용
export const CANO = import.meta.env.VITE_CANO ?? '';
export const ACNT_PRDT_CD = import.meta.env.VITE_ACNT_PRDT_CD ?? '01';

export const REST_BASE_URL = "/api";
export const BACKEND_WS_URL = "http://localhost:8081";
// export const BACKEND_WS_URL = "https://api.myeggbasket.cloud";

// 구독할 종목 코드와 TR ID
export const TR_ID = "H0STCNT0";