import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { useAuthStore } from "../store/authStore";
import { fetchPriceTargets } from "../api/targetPriceApi";
import { requestStockSubscription, type RealtimePricePayload } from "../hooks/useRealtimeStock";
import { type StompSubscription } from "@stomp/stompjs";

export function GlobalStockSubscriptionManager() {
    const { client, isConnected } = useWebSocket();
    const { isAuthenticated } = useAuthStore();

    // 구독 중인 종목 코드 집합 (중복 구독 방지)
    const subscribedCodes = useRef<Set<string>>(new Set());
    // 실제 STOMP 구독 객체들 저장 (언마운트/갱신 시 해제용)
    const subscriptions = useRef<Map<string, StompSubscription>>(new Map());

    // 목표가 설정된 종목 + 최근 본 종목 가져오기
    const [targetCodes, setTargetCodes] = useState<string[]>([]);
    const [recentCodes, setRecentCodes] = useState<string[]>([]);

    // 1. 목표가 설정된 종목 조회
    const loadTargetCodes = async () => {
        if (!isAuthenticated) return;
        try {
            const data = await fetchPriceTargets();
            if (data && Array.isArray(data)) {
                // data structure assumed based on API: list of objects with stockCode
                const codes = data.map((item: any) => item.stockCode);
                setTargetCodes(codes);
            }
        } catch (e) {
            console.error("[GlobalSub] Failed to fetch target prices", e);
        }
    };

    // 2. 최근 본 종목 조회 (LocalStorage)
    const loadRecentCodes = () => {
        try {
            const stored = localStorage.getItem("recent_stocks");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setRecentCodes(parsed);
                }
            }
        } catch (e) {
            console.error("[GlobalSub] Failed to load recent stocks", e);
        }
    };

    // 주기적으로 목록 갱신 (예: 10초마다 or 포커스 시)
    useEffect(() => {
        if (!isAuthenticated) return;

        loadTargetCodes();
        loadRecentCodes();

        const interval = setInterval(() => {
            loadTargetCodes();
            loadRecentCodes();
        }, 10000); // 10초 주기

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // 3. 구독 관리 로직
    useEffect(() => {
        if (!isConnected || !client) return;

        // 구독해야 할 전체 목록 (중복 제거)
        const allCodesToSubscribe = new Set([...targetCodes, ...recentCodes]);

        // A. 더 이상 필요 없는 구독 해제
        for (const [code, sub] of subscriptions.current.entries()) {
            if (!allCodesToSubscribe.has(code)) {
                console.log(`[GlobalSub] Unsubscribing: ${code}`);
                sub.unsubscribe();
                subscriptions.current.delete(code);
                subscribedCodes.current.delete(code);
            }
        }

        // B. 새로운 구독 추가
        allCodesToSubscribe.forEach((code) => {
            if (!subscribedCodes.current.has(code)) {
                console.log(`[GlobalSub] Subscribing: ${code}`);

                const sub = requestStockSubscription(client, code, (_payload: RealtimePricePayload) => {
                    // 여기서는 데이터 수신만으로 충분함 (백엔드가 트리거되거나, 캐시가 갱신됨)
                    // 필요하다면 전역 상태(Store)에 업데이트할 수도 있음
                    // console.log(`[GlobalSub] Tick: ${code} ${payload.price}`);
                });

                if (sub) {
                    subscriptions.current.set(code, sub);
                    subscribedCodes.current.add(code);
                }
            }
        });

    }, [isConnected, client, targetCodes, recentCodes]);

    // 언마운트 시 전체 구독 해제
    useEffect(() => {
        return () => {
            console.log("[GlobalSub] Cleaning up all subscriptions");
            subscriptions.current.forEach((sub) => sub.unsubscribe());
            subscriptions.current.clear();
            subscribedCodes.current.clear();
        };
    }, []);

    return null; // UI 없음
}
