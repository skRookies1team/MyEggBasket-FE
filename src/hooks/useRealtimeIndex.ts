import { useState, useEffect, useRef } from "react";
import { WS_URL, TR_ID2 } from "../config/api";

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
