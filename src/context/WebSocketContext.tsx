import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BACKEND_WS_URL } from '../config/api';
import { useAuthStore } from '../store/authStore'; // [추가] 1. Auth 스토어 임포트

interface WebSocketContextType {
    client: Client | null;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    // [추가] 2. 로그인 상태와 토큰 가져오기
    const { accessToken, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // 로그인이 안 되어 있거나 토큰이 없으면 연결 시도 X
        if (!isAuthenticated || !accessToken) {
            // 기존 연결이 있다면 정리
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // 이미 연결된 클라이언트가 있다면 정리 후 재연결 (토큰 갱신 대응)
        if (clientRef.current) {
            clientRef.current.deactivate();
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(`${BACKEND_WS_URL}/ws`),

            // [추가] 3. 인증 헤더 추가 (이 부분이 핵심입니다!)
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },

            reconnectDelay: 5000,
            onConnect: () => {
                console.log('[Global-WS] Connected');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('[Global-WS] Disconnected');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                // 인증 실패 시 여기서 에러가 발생합니다.
                console.error('[Global-WS] Broker error: ' + frame.headers['message']);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
        };
    }, [accessToken, isAuthenticated]); // [추가] 4. 의존성 배열에 토큰 추가

    return (
        <WebSocketContext.Provider value={{ client: clientRef.current, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};