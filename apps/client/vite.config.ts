// apps/client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 실행 브라우저를 크롬으로 강제 설정 (macOS 기준 "google chrome")
process.env.BROWSER = "google chrome";

export default defineConfig({
    plugins: [react()],

    // 1. 개발 서버 설정 (CORS 에러 방지 핵심)
    server: {
        port: 5173, // 프론트엔드 로컬 포트
        open: true, // 서버 시작 시 브라우저 자동 오픈
        // 프론트엔드에서 /api 로 시작하는 요청을 보내면,
        // 실제로는 http://localhost:3000/api (NestJS 백엔드)로 투명하게 전달합니다.
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },

    // 2. 경로 별칭 (Alias) 설정 (import가 헷갈리지 않게 만듦)
    resolve: {
        alias: {
            // '@'를 치면 src 폴더를 가리킴 (예: import Button from '@/components/Button')
            '@': path.resolve(__dirname, './src'),

            // '@open-sign/shared'를 치면 루트의 packages/shared 폴더를 가리킴 (Monorepo 핵심)
            '@open-sign/shared': path.resolve(__dirname, '../../packages/shared/src'),
        },
    },

    // 3. 빌드 최적화 설정 (서버에 배포할 때 용량 줄이기)
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // React 관련 라이브러리는 한 덩어리로 묶어서 캐싱 효율 높이기
                    vendor: ['react', 'react-dom'],
                },
            },
        },
    },
});