// src/config/api.ts

// Vite 환경변수로부터 앱 키와 시크릿 키를 읽어옴
export const APP_KEY = import.meta.env.VITE_APP_KEY ?? '';
export const APP_SECRET = import.meta.env.VITE_APP_SECRET ?? '';

export const FINANCIAL_SERVICE_KEY = import.meta.env.VITE_FINANCIAL_SERVICE_KEY ?? '';

// [수정됨] CORS 해결을 위해 프록시 경로('/api') 사용
export const REST_BASE_URL = "/api";

export const WS_URL = "ws://ops.koreainvestment.com:31000/tryitout/websocket";

// 구독할 종목 코드와 TR ID
export const STOCK_CODE = "005930";
export const TR_ID = "H0STCNT0";