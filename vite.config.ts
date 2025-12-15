// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // 1. 한국투자증권 API용 (uapi 또는 oauth2로 시작하는 요청)
      // 예: /api/uapi/..., /api/oauth2/... -> 한국투자증권 서버로
      '/api/uapi': {
        target: 'https://openapi.koreainvestment.com:9443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // /api 제거하고 전송
        secure: false,
        ws: true,
      },
      '/api/oauth2': {
        target: 'https://openapi.koreainvestment.com:9443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },

      // 2. 내 로컬 백엔드용 (그 외 나머지 /api 요청)
      // 예: /api/app/stocks/search, /api/auth/login -> localhost:8081로
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },

      //3. naver api 보유종목
      '/naver-api': { // '/naver-api' 경로로 들어오는 요청을
        target: 'https://openapi.naver.com', // 네이버 API로 포워딩
        changeOrigin: true, // 헤더 변경
        rewrite: (path) => path.replace(/^\/naver-api/, ''), // 경로 재작성
        secure: false, 
      },
    },
  },
});