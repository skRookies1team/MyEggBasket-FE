// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 한국투자증권 실제 서버로 전달 (CORS 우회)
      '/api': {
        target: 'https://openapivts.koreainvestment.com:29443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 요청 경로에서 '/api' 제거
        secure: false, // SSL 인증서 검증 무시 (필요한 경우)
        ws: true,
      },
    },
  },
});