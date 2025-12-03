import { useEffect, useState } from "react";
import { MarketIndexCard } from "../MarketIndex/MarketIndexCard";
import MarketIndexTicker from "../MarketIndex/MarketIndexTicker";

import {
  fetchSP500,
  fetchNasdaq100,
  fetchDowJones,
  fetchWTI,
  fetchIndexTickPrice,
} from "../../api/stockApi";

interface Props {
  showTickerOnly?: boolean;
}

export default function MarketIndexContainer({ showTickerOnly = false }: Props) {
  /* ----------------------------------------------------
      🔹 국내 지수 분봉 데이터 (REST)
  ---------------------------------------------------- */
  const [kospi, setKospi] = useState<any>(null);
  const [kosdaq, setKosdaq] = useState<any>(null);

  const [kospiChart, setKospiChart] = useState<number[]>([]);
  const [kosdaqChart, setKosdaqChart] = useState<number[]>([]);

  // 최근 n개 유지
  const updateChart = (setter: any, list: number[]) => {
    setter(list.slice(-20));
  };

  useEffect(() => {
    const load = async () => {
      const kospiData = await fetchIndexTickPrice("0001"); // KOSPI 1분봉
      const kosdaqData = await fetchIndexTickPrice("1001"); // KOSDAQ 1분봉

      if (kospiData.length > 0) {
        const last = kospiData[kospiData.length - 1];
        setKospi({
          current: last.price,
          change: last.change,
          rate: last.rate,
        });
        updateChart(
          setKospiChart,
          kospiData.map((d) => d.price)
        );
      }

      if (kosdaqData.length > 0) {
        const last = kosdaqData[kosdaqData.length - 1];
        setKosdaq({
          current: last.price,
          change: last.change,
          rate: last.rate,
        });
        updateChart(
          setKosdaqChart,
          kosdaqData.map((d) => d.price)
        );
      }
    };

    load();
    const interval = setInterval(load, 60000); // 1분마다 새 분봉 로드
    return () => clearInterval(interval);
  }, []);

  /* ----------------------------------------------------
      🔹 해외 지수 (REST)
  ---------------------------------------------------- */
  const [sp500, setSP500] = useState<any>(null);
  const [nasdaq, setNasdaq] = useState<any>(null);
  const [dow, setDow] = useState<any>(null);
  const [wti, setWTI] = useState<any>(null);


  useEffect(() => {
    const load = async () => {
      const s = await fetchSP500();
      const n = await fetchNasdaq100();
      const d = await fetchDowJones();
      const w = await fetchWTI();

      if (s) {
        setSP500(s);
      }

      if (n) {
        setNasdaq(n);
      }

      if (d) {
        setDow(d);
      }

      if (w) {
        setWTI(w);
      }
    };

    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ----------------------------------------------------
      🔹 Ticker 구성
  ---------------------------------------------------- */
  const tickerData: any[] = [];

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
      <MarketIndexTicker indices={tickerData} />

      {!showTickerOnly && (
        <>
          {/* 국내 지수 */}
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
            {sp500 && (
              <MarketIndexCard
                name="S&P500"
                value={sp500.current.toFixed(2)}
                change={sp500.change.toFixed(2)}
                percent={`${sp500.rate.toFixed(2)}%`}
                isUp={sp500.rate >= 0}
              />
            )}

            {nasdaq && (
              <MarketIndexCard
                name="NASDAQ100"
                value={nasdaq.current.toFixed(2)}
                change={nasdaq.change.toFixed(2)}
                percent={`${nasdaq.rate.toFixed(2)}%`}
                isUp={nasdaq.rate >= 0}
              />
            )}

            {dow && (
              <MarketIndexCard
                name="DOWJONES"
                value={dow.current.toFixed(2)}
                change={dow.change.toFixed(2)}
                percent={`${dow.rate.toFixed(2)}%`}
                isUp={dow.rate >= 0}
              />
            )}

            {wti && (
              <MarketIndexCard
                name="WTI"
                value={wti.current.toFixed(2)}
                change={wti.change.toFixed(2)}
                percent={`${wti.rate.toFixed(2)}%`}
                isUp={wti.rate >= 0}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
