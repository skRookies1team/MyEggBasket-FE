import { useEffect, useState } from "react";
import { MarketIndexCard } from "../MarketIndex/MarketIndexCard";
import MarketIndexTicker from "../MarketIndex/MarketIndexTicker";
import { useRealtimeIndex } from "../../hooks/useRealtimeStock";                
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
  const { data: kospi } = useRealtimeIndex("001");
  const { data: kosdaq } = useRealtimeIndex("201");

  const [kospiChart, setKospiChart] = useState<number[]>([]);
  const [kosdaqChart, setKosdaqChart] = useState<number[]>([]);

  useEffect(() => {
    if (!kospi || typeof kospi.current !== "number") return;

    setKospiChart((prev) => {
      if (prev[prev.length - 1] === kospi.current) return prev; // 동일 값이면 업데이트 X
      return [...prev.slice(-19), kospi.current];
    });
  }, [kospi?.current]);

  useEffect(() => {
    if (!kosdaq || typeof kosdaq.current !== "number") return;

    setKosdaqChart((prev) => {
      if (prev[prev.length - 1] === kosdaq.current) return prev;
      return [...prev.slice(-19), kosdaq.current];
    });
  }, [kosdaq?.current]);



  const [sp500, setSP500] = useState<any>(null);
  const [nasdaq, setNasdaq] = useState<any>(null);
  const [dow, setDow] = useState<any>(null);
  const [wti, setWTI] = useState<any>(null);

  // 해외 지수 차트 데이터
  const [sp500Chart, setSP500Chart] = useState<number[]>([]);
  const [nasdaqChart, setNasdaqChart] = useState<number[]>([]);
  const [dowChart, setDowChart] = useState<number[]>([]);
  const [wtiChart, setWTIChart] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      const s = await fetchSP500();
      const n = await fetchNasdaq100();
      const d = await fetchDowJones();
      const w = await fetchWTI();
      

      if (s) {
        setSP500(s);
        setSP500Chart((prev) => [...prev.slice(-19), s.current]);
      }

      if (n) {
        setNasdaq(n);
        setNasdaqChart((prev) => [...prev.slice(-19), n.current]);
      }

      if (d) {
        setDow(d);
        setDowChart((prev) => [...prev.slice(-19), d.current]);
      }

      if (w) {
        setWTI(w);
        setWTIChart((prev) => [...prev.slice(-19), w.current]);
      }
    };

    load();
    const interval = setInterval(load, 60000); // 1분마다
    return () => clearInterval(interval);
  }, []);

  // ---------------- Ticker -------------------
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
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {sp500 && (
              <MarketIndexCard
                name="S&P500"
                value={sp500.current.toFixed(2)}
                change={sp500.change.toFixed(2)}
                percent={`${sp500.rate.toFixed(2)}%`}
                isUp={sp500.rate >= 0}
                miniChartData={sp500Chart}
              />
            )}

            {nasdaq && (
              <MarketIndexCard
                name="NASDAQ100"
                value={nasdaq.current.toFixed(2)}
                change={nasdaq.change.toFixed(2)}
                percent={`${nasdaq.rate.toFixed(2)}%`}
                isUp={nasdaq.rate >= 0}
                miniChartData={nasdaqChart}
              />
            )}

            {dow && (
              <MarketIndexCard
                name="DOWJONES"
                value={dow.current.toFixed(2)}
                change={dow.change.toFixed(2)}
                percent={`${dow.rate.toFixed(2)}%`}
                isUp={dow.rate >= 0}
                miniChartData={dowChart}
              />
            )}

            {wti && (
              <MarketIndexCard
                name="WTI"
                value={wti.current.toFixed(2)}
                change={wti.change.toFixed(2)}
                percent={`${wti.rate.toFixed(2)}%`}
                isUp={wti.rate >= 0}
                miniChartData={wtiChart}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
