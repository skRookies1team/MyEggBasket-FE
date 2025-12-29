import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BACKEND_WS_URL } from '../config/api';

interface WebSocketContextType {
    client: Client | null;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // 앱 시작 시 한 번만 연결
        const client = new Client({
            webSocketFactory: () => new SockJS(`${BACKEND_WS_URL}/ws`),
            reconnectDelay: 5000,
            // debug: (str) => console.log(`[Global-WS] ${str}`), // 디버그 필요 시 주석 해제
            onConnect: () => {
                console.log('[Global-WS] Connected');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('[Global-WS] Disconnected');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('[Global-WS] Broker error: ' + frame.headers['message']);
            },
        });

        client.activate();
        clientRef.current = client;

        // 앱 종료 시에만 연결 해제
        return () => {
            client.deactivate();
        };
    }, []);

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