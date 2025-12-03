// src/hooks/useRealtimeStock.ts
import { useState, useEffect, useRef } from "react";
import { WS_URL, TR_ID1, TR_ID2 } from "../config/api";

/* -------------------------------------------------------
   공통 Approval Key 발급
------------------------------------------------------- */
async function getApprovalKey(): Promise<string> {
  try {
    const proxyBase = import.meta.env.VITE_PROXY_URL ?? "http://localhost:3001";
    const url = `${proxyBase}/api/approval`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) return "";

    const data = await response.json();
    return data.approval_key || "";
  } catch (e) {
    console.error("ApprovalKey 발급 실패:", e);
    return "";
  }
}

/* -------------------------------------------------------
   공통 반환 타입
------------------------------------------------------- */
export interface UseRealtimeResult<T> {
  data: T | null;
  connected: boolean;
  loading: boolean;
}

/* =======================================================
   🔵 1) 종목 실시간 체결 훅 (H0STCNT0)
======================================================= */
interface RealtimePriceData {
  currentPrice: number;
  changeAmount: number;
  changeRate: number;

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

function parseStockMessage(message: string): Partial<RealtimePriceData> | null {
  if (!message.startsWith("0") && !message.startsWith("1")) return null;

  const parts = message.split("|");
  const fields = parts[3].split("^");

  const g = (i: number) => (i < fields.length ? fields[i] : "");
  const n = (v: string) => Number(v.replace(/,/g, "")) || 0;

  const sign = g(2);
  const isNeg = sign === "5" || sign === "4";

  const data: Partial<RealtimePriceData> = {
    stck_shrn_iscd: g(H0STCNT0_FIELD_MAP.stck_shrn_iscd),
    stck_cntg_hour: g(H0STCNT0_FIELD_MAP.stck_cntg_hour),
    stck_prpr: n(g(H0STCNT0_FIELD_MAP.stck_prpr)),
    prdy_vrss: n(g(H0STCNT0_FIELD_MAP.prdy_vrss)),
    prdy_ctrt: n(g(H0STCNT0_FIELD_MAP.prdy_ctrt)),
    acml_tr_pbmn: n(g(H0STCNT0_FIELD_MAP.acml_tr_pbmn)),
    acml_vol: n(g(H0STCNT0_FIELD_MAP.acml_vol)),
    seln_cntg_csnu: n(g(H0STCNT0_FIELD_MAP.seln_cntg_csnu)),
    shnu_cntg_csnu: n(g(H0STCNT0_FIELD_MAP.shnu_cntg_csnu)),
    wght_avrg_prc: n(g(H0STCNT0_FIELD_MAP.wght_avrg_prc)),
    askp1: n(g(H0STCNT0_FIELD_MAP.askp1)),
    bidp1: n(g(H0STCNT0_FIELD_MAP.bidp1)),
    total_askp_rsqn: n(g(H0STCNT0_FIELD_MAP.total_askp_rsqn)),
    total_bidp_rsqn: n(g(H0STCNT0_FIELD_MAP.total_bidp_rsqn)),
  };

  const price = data.stck_prpr ?? 0;
  let diff = data.prdy_vrss ?? 0;

  if (isNeg) diff = -Math.abs(diff);

  data.currentPrice = price;
  data.changeAmount = diff;
  data.changeRate = data.prdy_ctrt ?? 0;

  return data;
}

/* -------------------------------------------------------
   STOCK 훅
------------------------------------------------------- */
export function useRealtimeStock(
  stockCode: string
): UseRealtimeResult<RealtimePriceData> {
  const [data, setData] = useState<RealtimePriceData | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!stockCode) return;
    let closed = false;

    const connect = async () => {
      const approval = await getApprovalKey();
      if (!approval) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (closed) return;

        setConnected(true);
        setLoading(false);

        ws.send(
          JSON.stringify({
            header: {
              approval_key: approval,
              custtype: "P",
              tr_type: "1",
              "content-type": "utf-8",
            },
            body: { input: { tr_id: TR_ID1, tr_key: stockCode } },
          })
        );
      };

      ws.onmessage = (event) => {
        const parsed = parseStockMessage(event.data);
        if (parsed) setData(parsed as RealtimePriceData);
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closed) setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, [stockCode]);

  return { data, connected, loading };
}

/* =======================================================
   🔵 2) 국내 지수 실시간 체결 훅 (H0UPCNT0)
======================================================= */
export interface IndexRealtimeData {
  indexName: "KOSPI" | "KOSDAQ";
  time: string;
  current: number;
  change: number;
  rate: number;
  volume: number;
}

function parseIndexMessage(raw: string): IndexRealtimeData | null {
  if (!raw.startsWith("0|H0UPCNT0")) return null;

  const parts = raw.split("|");
  const f = parts[3].split("^");
  const g = (i: number) => (i < f.length ? f[i] : "0");

  const trKey = parts[2]; // "001" or "201"
  const indexName = trKey === "001" ? "KOSPI" : "KOSDAQ";

  return {
    indexName,
    time: g(1),
    current: Number(g(2)),
    change: Number(g(4)),
    rate: Number(g(5)),
    volume: Number(g(6)),
  };
}

/* -------------------------------------------------------
   INDEX 훅
------------------------------------------------------- */
export function useRealtimeIndex(
  indexCode: "001" | "201"
): UseRealtimeResult<IndexRealtimeData> {
  const [data, setData] = useState<IndexRealtimeData | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let closed = false;

    const connect = async () => {
      const approval = await getApprovalKey();
      if (!approval) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (closed) return;

        setConnected(true);
        setLoading(false);

        ws.send(
          JSON.stringify({
            header: {
              approval_key: approval,
              custtype: "P",
              tr_type: "1",
              "content-type": "utf-8",
            },
            body: { input: { tr_id: TR_ID2, tr_key: indexCode } },
          })
        );
      };

      ws.onmessage = (event) => {
        const parsed = parseIndexMessage(event.data);
        if (parsed) setData(parsed);
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closed) setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, [indexCode]);

  return { data, connected, loading };
}
