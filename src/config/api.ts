// src/config/api.ts

// Vite 환경변수로부터 앱 키와 시크릿 키를 읽어옴
export const APP_KEY = import.meta.env.VITE_APP_KEY ?? '';
export const APP_SECRET = import.meta.env.VITE_APP_SECRET ?? '';

export const FINANCIAL_SERVICE_KEY = import.meta.env.VITE_FINANCIAL_SERVICE_KEY ?? '';

// 한국투자증권 API 엔드포인트
export const REST_BASE_URL = "https://openapi.koreainvestment.com:9443";
export const WS_URL = "ws://ops.koreainvestment.com:21000/tryitout/websocket"; // 모의투자 주소

// 구독할 종목 코드와 TR ID (삼성전자 실시간 체결가 예시)
export const STOCK_CODE = "005930";
export const TR_ID = "H0STCNT0"; // 국내주식 실시간 체결가