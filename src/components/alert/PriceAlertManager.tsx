// src/components/alert/PriceAlertManager.tsx

import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuthStore } from '../../store/authStore';

export interface PriceAlertMessage {
    alertId: string;
    userId: number;
    stockCode: string;
    stockName: string;
    alertType: 'UPPER' | 'LOWER';
    targetPrice: number;
    currentPrice: number;
    triggeredAt: string;
}

export function PriceAlertManager() {
    const { client, isConnected } = useWebSocket();
    const { user } = useAuthStore();
    const [alerts, setAlerts] = useState<PriceAlertMessage[]>([]);

    useEffect(() => {
        // [디버그 1] 연결 상태 및 유저 정보 확인
        console.log(`[PriceAlert] 상태 점검: Connected=${isConnected}, UserID=${user?.id}`);

        if (!isConnected || !client || !user?.id) {
            return;
        }

        const topic = `/topic/price-alert/${user.id}`;
        console.log(`[PriceAlert] 구독 시작 시도: ${topic}`);

        const subscription = client.subscribe(topic, (message) => {
            // [디버그 2] 메시지 수신 로그
            console.log("[PriceAlert] 🔔 원본 메시지 수신:", message.body);

            if (message.body) {
                try {
                    const body = JSON.parse(message.body) as PriceAlertMessage;
                    console.log("[PriceAlert] ✅ 파싱 성공:", body);
                    addAlert(body);
                } catch (e) {
                    console.error("[PriceAlert] ❌ JSON 파싱 에러:", e);
                }
            }
        });

        return () => {
            console.log(`[PriceAlert] 구독 해제: ${topic}`);
            subscription.unsubscribe();
        };
    }, [isConnected, client, user?.id]);

    const addAlert = (newAlert: PriceAlertMessage) => {
        setAlerts((prev) => [newAlert, ...prev]);
        setTimeout(() => {
            removeAlert(newAlert.alertId);
        }, 5000);
    };

    const removeAlert = (alertId: string) => {
        setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {alerts.map((alert) => (
                <div
                    key={alert.alertId}
                    className="pointer-events-auto flex w-80 animate-slide-in items-start gap-3 rounded-xl border border-[#2a2a35] bg-[#1a1a24]/95 p-4 shadow-xl backdrop-blur-md transition-all hover:bg-[#1f1f2e]"
                >
                    <div className={`mt-1 rounded-full p-2 ${
                        alert.alertType === 'UPPER' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                        {alert.alertType === 'UPPER' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-100">{alert.stockName}</h4>
                            <span className="text-[10px] text-gray-500">
                                {new Date(alert.triggeredAt).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                            목표가 <span className="font-bold text-white">{alert.targetPrice.toLocaleString()}원</span>에 도달했습니다!
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            현재가: {alert.currentPrice.toLocaleString()}원
                        </p>
                    </div>
                    <button onClick={() => removeAlert(alert.alertId)} className="text-gray-500 hover:text-gray-300">
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}