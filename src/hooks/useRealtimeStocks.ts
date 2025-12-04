import { useEffect, useRef, useState } from "react";
import { WS_URL, TR_ID1 } from "../config/api";
import { parseStockMessage } from "../hooks/useRealtimeStock"; // 🔥 기존 파서 재사용

async function getApprovalKey(): Promise<string> {
  try {
    const proxyBase =
      import.meta.env.VITE_PROXY_URL ?? "http://localhost:3001";

    const url = `${proxyBase}/api/approval`;

    const res = await fetch(url, { method: "POST" });
    const json = await res.json();
    return json.approval_key || "";
  } catch {
    return "";
  }
}

export interface MultiRealtimeData {
  [code: string]: {
    code: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    volume: number;
    time: string;
  };
}

export function useRealtimeStocks(stockCodes: string[]) {
  const [data, setData] = useState<MultiRealtimeData>({});
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (stockCodes.length === 0) return;

    let closed = false;

    const connect = async () => {
      const approvalKey = await getApprovalKey();
      if (!approvalKey) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (closed) return;

        console.log("📡 웹소켓 연결됨 (50종목 모드)");
        setConnected(true);
        setLoading(false);
        
        stockCodes.forEach((code) => {
          ws.send(
            JSON.stringify({
              header: {
                approval_key: approvalKey,
                custtype: "P",
                tr_type: "1",
                "content-type": "utf-8",
              },
              body: { input: { tr_id: TR_ID1, tr_key: code } },
            })
          );
        });
      };

      ws.onmessage = (event) => {
        const parsed = parseStockMessage(event.data);
        if (!parsed || !parsed.stck_shrn_iscd) return;

        const code = parsed.stck_shrn_iscd;
        setData((prev) => ({
          ...prev,
          [code]: {
            code,
            currentPrice: parsed.stck_prpr ?? 0,
            changeAmount: parsed.changeAmount ?? 0,
            changeRate: parsed.changeRate ?? 0,
            volume: parsed.acml_vol ?? 0,
            time: parsed.stck_cntg_hour ?? "--:--:--",
          },
        }));
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closed) {
          console.log("🔄 재연결 시도");
          setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, [stockCodes]);

  return { data, connected, loading };
}
