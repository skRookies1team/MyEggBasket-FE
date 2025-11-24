// src/hooks/useRealtimeStock.ts
import { useState, useEffect, useRef } from 'react';
import {WS_URL, STOCK_CODE, TR_ID } from '../config/api';

// 실시간 데이터 구조 (매핑된 필드 포함)
interface RealtimePriceData {
    // 기존 요약 필드 (하위 호환)
    currentPrice: number;
    changeAmount: number;
    changeRate: number;

    // H0STCNT0 매핑된 상세 필드
    stck_shrn_iscd?: string;
    stck_cntg_hour?: string;
    stck_prpr?: number;
    prdy_vrss?: number;
    prdy_ctrt?: number;
    acml_tr_pbmn?: number;
    acml_vol?: number;
    seln_cntg_csnu?: number;
    shnu_cntg_csnu?: number;
    wght_avrg_prc?: number;
    askp1?: number;
    bidp1?: number;
    total_askp_rsqn?: number;
    total_bidp_rsqn?: number;
}

const initialData: RealtimePriceData = {
    currentPrice: 0,
    changeAmount: 0,
    changeRate: 0,
};

// H0STCNT0 필드 인덱스 매핑
const H0STCNT0_FIELD_MAP: Record<string, number> = {
    stck_shrn_iscd: 0,
    stck_cntg_hour: 1,
    stck_prpr: 2,
    prdy_vrss: 4,
    prdy_ctrt: 5,
    acml_tr_pbmn: 14,
    acml_vol: 6,
    seln_cntg_csnu: 15,
    shnu_cntg_csnu: 16,
    wght_avrg_prc: 10,
    askp1: 7,
    bidp1: 8,
    total_askp_rsqn: 38,
    total_bidp_rsqn: 39,
};

// Approval Key 발급 (REST API)
async function getApprovalKey(): Promise<string> {
    try {
        const proxyBase = import.meta.env.VITE_PROXY_URL ?? 'http://localhost:3001';
        const url = `${proxyBase}/api/approval`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Approval Key 발급 실패 (${response.status}): ${errorText}`);
            return '';
        }

        const data = await response.json();
        return data.approval_key || '';
    } catch (error) {
        console.error('Approval Key 발급 중 네트워크 오류:', error);
        return '';
    }
}

// 실시간 데이터 파싱 함수 (WebSocket 메시지 파싱)
function parseRealtimeData(message: string): Partial<RealtimePriceData> | null {
    if (typeof message !== 'string') return null;

    // 메시지 구조: 접두(0/1)|TR_ID|TR_KEY|데이터
    if (message.startsWith('0') || message.startsWith('1')) {
        const parts = message.split('|');
        if (parts.length < 4) return null;

        const dataFields = parts[3].split('^');
        if (!dataFields || dataFields.length === 0) return null;

        const safeGet = (idx: number) => (idx >= 0 && idx < dataFields.length ? dataFields[idx] : '');

        // 기본 숫자 파싱 헬퍼
        const toNumber = (v: string) => {
            if (!v) return 0;
            const n = Number(v.replace(/,/g, ''));
            return Number.isFinite(n) ? n : 0;
        };

        // 시그널(상승/하락) 처리: dataFields[2]에 코드가 들어오는 경우가 많음
        const signField = safeGet(2);
        const isNegative = signField === '5' || signField === '4';

        // 매핑된 필드 추출
        const mapped: Partial<RealtimePriceData> = {
            stck_shrn_iscd: String(safeGet(H0STCNT0_FIELD_MAP.stck_shrn_iscd) || ''),
            stck_cntg_hour: String(safeGet(H0STCNT0_FIELD_MAP.stck_cntg_hour) || ''),
            stck_prpr: toNumber(safeGet(H0STCNT0_FIELD_MAP.stck_prpr)),
            prdy_vrss: toNumber(safeGet(H0STCNT0_FIELD_MAP.prdy_vrss)),
            prdy_ctrt: toNumber(safeGet(H0STCNT0_FIELD_MAP.prdy_ctrt)),
            acml_tr_pbmn: toNumber(safeGet(H0STCNT0_FIELD_MAP.acml_tr_pbmn)),
            acml_vol: toNumber(safeGet(H0STCNT0_FIELD_MAP.acml_vol)),
            seln_cntg_csnu: toNumber(safeGet(H0STCNT0_FIELD_MAP.seln_cntg_csnu)),
            shnu_cntg_csnu: toNumber(safeGet(H0STCNT0_FIELD_MAP.shnu_cntg_csnu)),
            wght_avrg_prc: toNumber(safeGet(H0STCNT0_FIELD_MAP.wght_avrg_prc)),
            askp1: toNumber(safeGet(H0STCNT0_FIELD_MAP.askp1)),
            bidp1: toNumber(safeGet(H0STCNT0_FIELD_MAP.bidp1)),
            total_askp_rsqn: toNumber(safeGet(H0STCNT0_FIELD_MAP.total_askp_rsqn)),
            total_bidp_rsqn: toNumber(safeGet(H0STCNT0_FIELD_MAP.total_bidp_rsqn)),
        };

        // 하위 호환 필드 설정
        const price = mapped.stck_prpr ?? 0;
        let changeAmount = mapped.prdy_vrss ?? 0;
        if (isNegative) changeAmount = -Math.abs(changeAmount);
        const changeRate = mapped.prdy_ctrt ?? 0;

        mapped.currentPrice = price;
        mapped.changeAmount = changeAmount;
        mapped.changeRate = changeRate;

        return mapped;
    }
    return null;
}

// Throttle WS updates to reduce render frequency
export function useRealtimeStock(): RealtimePriceData {
    const [realtimeData, setRealtimeData] = useState<RealtimePriceData>(initialData);
    const wsRef = useRef<WebSocket | null>(null);
    // Throttle/flush control
    const lastFlushRef = useRef<number>(0);
    const pendingRef = useRef<Partial<RealtimePriceData> | null>(null);
    const flushTimerRef = useRef<number | null>(null);
    const FLUSH_INTERVAL = 500; // ms

    useEffect(() => {
        let isCancelled = false;

        const flushPending = () => {
            const pending = pendingRef.current;
            if (pending) {
                setRealtimeData(prev => ({ ...prev, ...pending } as RealtimePriceData));
                pendingRef.current = null;
                lastFlushRef.current = Date.now();
            }
            if (flushTimerRef.current) {
                window.clearTimeout(flushTimerRef.current);
                flushTimerRef.current = null;
            }
        };

        const connectWebSocket = async () => {
            if (isCancelled) return;

            const approvalKey = await getApprovalKey();

            if (isCancelled || !approvalKey) {
                console.warn('WebSocket 연결 실패: Approval Key가 유효하지 않습니다. APP_KEY/APP_SECRET 확인 필요');
                return;
            }

            const socket = new WebSocket(WS_URL);
            wsRef.current = socket;

            socket.onopen = () => {
                if (isCancelled) {
                    socket.close();
                    return;
                }
                console.log("WebSocket 연결 성공. 구독 요청 전송...");

                // 실시간 체결가 구독 요청
                const subscribeData = {
                    header: { approval_key: approvalKey, custtype: 'P', tr_type: '1', 'content-type': 'utf-8' },
                    body: { input: { tr_id: TR_ID, tr_key: STOCK_CODE } },
                };
                // socket은 분명히 할당되어 있으므로 안전하게 사용
                socket.send(JSON.stringify(subscribeData));
            };

            socket.onmessage = (event) => {
                const parsedData = parseRealtimeData(event.data);
                if (!parsedData || isCancelled) return;

                // Throttle updates: if last flush older than interval -> flush immediately
                const now = Date.now();
                const timeSince = now - lastFlushRef.current;
                if (timeSince >= FLUSH_INTERVAL) {
                    setRealtimeData(prev => ({ ...prev, ...parsedData } as RealtimePriceData));
                    lastFlushRef.current = now;
                } else {
                    // store pending and schedule flush
                    pendingRef.current = { ...pendingRef.current, ...parsedData };
                    if (flushTimerRef.current) {
                        window.clearTimeout(flushTimerRef.current);
                    }
                    flushTimerRef.current = window.setTimeout(() => flushPending(), FLUSH_INTERVAL - timeSince);
                }
            };

            socket.onerror = (error) => { console.error('WebSocket 오류:', error); };

            socket.onclose = () => {
                if (!isCancelled) {
                    console.log('WebSocket 종료. 재접속 로직 필요 시 구현.');
                }
            };
        };

        connectWebSocket();

        // 클린업: 컴포넌트 언마운트 시 연결 해제
        return () => {
            isCancelled = true;
            if (wsRef.current) {
                wsRef.current.close(1000, "Component unmounted");
            }
            if (flushTimerRef.current) {
                window.clearTimeout(flushTimerRef.current);
                flushTimerRef.current = null;
            }
        };
    }, []);

    return realtimeData;
}