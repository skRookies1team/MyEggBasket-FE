// src/api/stockIndexWS.ts
import { WS_URL, APP_KEY, APP_SECRET } from "../config/api";

export interface IndexData {
  indexName: string;     // "KOSPI" | "KOSDAQ"
  time: string;          // HHMMSS
  current: number;       // 현재 지수
  change: number;        // 전일 대비
  rate: number;          // 등락률
  volume: number;        // 거래량(있을 경우)
}

interface WebSocketCallbacks {
  onMessage?: (data: IndexData) => void;
  onError?: (e: any) => void;
  onClose?: () => void;
}

/**
 * 국내지수 WebSocket 구독 (실전계좌)
 * 지수코드:
 *  - KOSPI → "0001"
 *  - KOSDAQ → "1001"
 * TR_ID:
 *  - KOSPI: H0SI2000
 *  - KOSDAQ: H0SI1000
 */
export function connectIndexWS(
  index: "KOSPI" | "KOSDAQ",
  callbacks: WebSocketCallbacks
) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log(`📡 지수 WebSocket 연결됨 → ${index}`);

    const tr_id = index === "KOSPI" ? "H0SI2000" : "H0SI1000";
    const symb = index === "KOSPI" ? "0001" : "1001";

    const body = {
      header: {
        appkey: APP_KEY,
        appsecret: APP_SECRET,
        tr_id,
        custtype: "P",
      },
      body: {
        input: { idx_cd: symb },
      },
    };

    ws.send(JSON.stringify(body));
  };

  ws.onmessage = (event) => {
    try {
      const text = event.data;

      // 핑 패킷 또는 ACK 패킷 제외
      if (typeof text !== "string" || text.includes("PING")) return;

      const json = JSON.parse(text);

      if (!json.body?.output) return;

      const o = json.body.output;

      const parsed: IndexData = {
        indexName: index,
        time: o.index_time,
        current: Number(o.bstp_nmix_prpr),
        change: Number(o.bstp_nmix_prdy_vrss),
        rate: Number(o.bstp_nmix_prdy_ctrt),
        volume: Number(o.acml_vol ?? 0),
      };

      callbacks.onMessage?.(parsed);
    } catch (e) {
      console.error("지수 WebSocket 메시지 파싱 실패:", e);
      callbacks.onError?.(e);
    }
  };

  ws.onerror = (err) => {
    console.error("지수 WebSocket 에러:", err);
    callbacks.onError?.(err);
  };

  ws.onclose = () => {
    console.warn("지수 WebSocket 연결 종료");
    callbacks.onClose?.();
  };

  return ws;
}
