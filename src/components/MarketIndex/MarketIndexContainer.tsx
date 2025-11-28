import { useEffect, useState } from "react";
import { MarketIndexCard } from "../MarketIndex/MarketIndexCard";
import MarketIndexTicker from "../MarketIndex/MarketIndexTicker";

import { connectIndexWS, type IndexData } from "../../api/stockIndex";
import {
  fetchSP500,
  fetchNasdaq100,
  fetchDowJones,
  fetchWTI,
} from "../../api/stockApi";

interface Props {
  showTickerOnly?: boolean;
}

export default function MarketIndexContainer({ showTickerOnly = false }: Props) {
  // ---------------- 국내 지수(WebSocket) ----------------
  const [kospi, setKospi] = useState<IndexData | null>(null);
  const [kosdaq, setKosdaq] = useState<IndexData | null>(null);

  const [kospiChart, setKospiChart] = useState<number[]>([]);
  const [kosdaqChart, setKosdaqChart] = useState<number[]>([]);

  useEffect(() => {
    const wsK = connectIndexWS("KOSPI", {
      onMessage: (d) => {
        setKospi(d);
        setKospiChart((prev) => [...prev.slice(-19), d.current]);
      },
    });

    const wsQ = connectIndexWS("KOSDAQ", {
      onMessage: (d) => {
        setKosdaq(d);
        setKosdaqChart((prev) => [...prev.slice(-19), d.current]);
      },
    });

    return () => {
      wsK.close();
      wsQ.close();
    };
  }, []);

  // ---------------- 해외 지수(API) ----------------
  const [sp500, setSP500] = useState<IndexData | null>(null);
  const [nasdaq, setNasdaq] = useState<IndexData | null>(null);
  const [dow, setDow] = useState<IndexData | null>(null);
  const [wti, setWTI] = useState<IndexData | null>(null);

  useEffect(() => {
    const load = async () => {
      const s = await fetchSP500();
      const n = await fetchNasdaq100();
      const d = await fetchDowJones();
      const w = await fetchWTI();

      setSP500(s);
      setNasdaq(n);
      setDow(d);
      setWTI(w);
    };

    load();

    const interval = setInterval(load, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  // ---------------- Ticker 데이터 ----------------
  const tickerData = [];

  if (kospi)
    tickerData.push({
      name: "KOSPI",
      value: kospi.current.toFixed(2),
      percent: `${kospi.rate.toFixed(2)}%`,
      isUp: kospi.rate >= 0,
    });

  if (kosdaq)
    tickerData.push({
      name: "KOSDAQ",
      value: kosdaq.current.toFixed(2),
      percent: `${kosdaq.rate.toFixed(2)}%`,
      isUp: kosdaq.rate >= 0,
    });

  if (sp500)
    tickerData.push({
      name: "S&P500",
      value: sp500.current.toFixed(2),
      percent: `${sp500.rate.toFixed(2)}%`,
      isUp: sp500.rate >= 0,
    });

  if (nasdaq)
    tickerData.push({
      name: "NASDAQ100",
      value: nasdaq.current.toFixed(2),
      percent: `${nasdaq.rate.toFixed(2)}%`,
      isUp: nasdaq.rate >= 0,
    });

  if (dow)
    tickerData.push({
      name: "DOWJONES",
      value: dow.current.toFixed(2),
      percent: `${dow.rate.toFixed(2)}%`,
      isUp: dow.rate >= 0,
    });

  if (wti)
    tickerData.push({
      name: "WTI",
      value: wti.current.toFixed(2),
      percent: `${wti.rate.toFixed(2)}%`,
      isUp: wti.rate >= 0,
    });

  return (
    <div>
      {/* 상단 Ticker */}
      <MarketIndexTicker indices={tickerData} />

      {!showTickerOnly && (
        <>
          {/* 국내 지수 카드 */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            {kospi && (
              <MarketIndexCard
                name="KOSPI"
                value={kospi.current.toFixed(2)}
                change={kospi.change.toFixed(2)}
                percent={`${kospi.rate.toFixed(2)}%`}
                isUp={kospi.rate >= 0}
                miniChartData={kospiChart}
              />
            )}

            {kosdaq && (
              <MarketIndexCard
                name="KOSDAQ"
                value={kosdaq.current.toFixed(2)}
                change={kosdaq.change.toFixed(2)}
                percent={`${kosdaq.rate.toFixed(2)}%`}
                isUp={kosdaq.rate >= 0}
                miniChartData={kosdaqChart}
              />
            )}
          </div>

          {/* 해외 지수 카드 */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
            {sp500 && (
              <MarketIndexCard
                name="S&P500"
                value={sp500.current.toFixed(2)}
                change={sp500.change.toFixed(2)}
                percent={`${sp500.rate.toFixed(2)}%`}
                isUp={sp500.rate >= 0}
                miniChartData={[]} // 해외는 미니차트 없음
              />
            )}

            {nasdaq && (
              <MarketIndexCard
                name="NASDAQ100"
                value={nasdaq.current.toFixed(2)}
                change={nasdaq.change.toFixed(2)}
                percent={`${nasdaq.rate.toFixed(2)}%`}
                isUp={nasdaq.rate >= 0}
                miniChartData={[]}
              />
            )}

            {dow && (
              <MarketIndexCard
                name="DOWJONES"
                value={dow.current.toFixed(2)}
                change={dow.change.toFixed(2)}
                percent={`${dow.rate.toFixed(2)}%`}
                isUp={dow.rate >= 0}
                miniChartData={[]}
              />
            )}

            {wti && (
              <MarketIndexCard
                name="WTI"
                value={wti.current.toFixed(2)}
                change={wti.change.toFixed(2)}
                percent={`${wti.rate.toFixed(2)}%`}
                isUp={wti.rate >= 0}
                miniChartData={[]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
