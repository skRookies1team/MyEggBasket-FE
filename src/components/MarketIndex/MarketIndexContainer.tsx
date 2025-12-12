import { useEffect, useState } from "react";
import { MarketIndexCard } from "../MarketIndex/MarketIndexCard";
import MarketIndexTicker from "../MarketIndex/MarketIndexTicker";

import {
  fetchKoreaIndex,
  fetchForeignIndex
} from "../../api/indexApi";

interface Props {
  showTickerOnly?: boolean;
}

export default function MarketIndexContainer({ showTickerOnly = false }: Props) {
  // -----------------------------
  // 국내 지수
  // -----------------------------
  const [kospi, setKospi] = useState<any>(null);
  const [kosdaq, setKosdaq] = useState<any>(null);

  // -----------------------------
  // 해외 지수
  // -----------------------------
  const [sp500, setSP500] = useState<any>(null);
  const [nasdaq, setNasdaq] = useState<any>(null);
  const [dow, setDow] = useState<any>(null);
  const [wti, setWTI] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // 국내
        const kospiData = await fetchKoreaIndex("0001");
        const kosdaqData = await fetchKoreaIndex("1001");

        // 해외
        const sp = await fetchForeignIndex("SPX");
        const nd = await fetchForeignIndex("NDX");
        const dw = await fetchForeignIndex("DOW");
        const wt = await fetchForeignIndex("CL");

        setKospi(kospiData);
        setKosdaq(kosdaqData);
        setSP500(sp);
        setNasdaq(nd);
        setDow(dw);
        setWTI(wt);
      } catch (err) {
        console.error("Index load failed:", err);
      }
    };

    load();
    const interval = setInterval(load, 60_000); // 1분 갱신
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // 🔹 KOSPI / KOSDAQ 미니차트 데이터
  // (나중에 실제 분봉 데이터로 교체 가능)
  // ----------------------------------------------------
  const kospiMiniChart: number[] | undefined = kospi
    ? kospi.miniChartData ?? [
        kospi.current - 6,
        kospi.current - 4,
        kospi.current - 5,
        kospi.current - 2,
        kospi.current
      ]
    : undefined;

  const kosdaqMiniChart: number[] | undefined = kosdaq
    ? kosdaq.miniChartData ?? [
        kosdaq.current - 3,
        kosdaq.current - 2,
        kosdaq.current - 1,
        kosdaq.current + 0.5,
        kosdaq.current
      ]
    : undefined;

  // ----------------------------------------------------
  // 🔹 상단 티커 데이터
  // ----------------------------------------------------
  const tickerData: any[] = [];

  if (kospi)
    tickerData.push({
      name: "KOSPI",
      value: kospi.current.toFixed(2),
      percent: `${kospi.rate.toFixed(2)}%`,
      isUp: kospi.change >= 0
    });

  if (kosdaq)
    tickerData.push({
      name: "KOSDAQ",
      value: kosdaq.current.toFixed(2),
      percent: `${kosdaq.rate.toFixed(2)}%`,
      isUp: kosdaq.change >= 0
    });

  if (sp500)
    tickerData.push({
      name: "S&P500",
      value: sp500.current.toFixed(2),
      percent: `${sp500.rate.toFixed(2)}%`,
      isUp: sp500.change >= 0
    });

  if (nasdaq)
    tickerData.push({
      name: "NASDAQ100",
      value: nasdaq.current.toFixed(2),
      percent: `${nasdaq.rate.toFixed(2)}%`,
      isUp: nasdaq.change >= 0
    });

  if (dow)
    tickerData.push({
      name: "DOWJONES",
      value: dow.current.toFixed(2),
      percent: `${dow.rate.toFixed(2)}%`,
      isUp: dow.change >= 0
    });

  if (wti)
    tickerData.push({
      name: "WTI",
      value: wti.current.toFixed(2),
      percent: `${wti.rate.toFixed(2)}%`,
      isUp: wti.change >= 0
    });

  // ----------------------------------------------------
  // 🔹 Render
  // ----------------------------------------------------
  return (
    <div>
      {/* 상단 지수 티커 */}
      <MarketIndexTicker indices={tickerData} />

      {!showTickerOnly && (
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          {/* 🇰🇷 KOSPI (미니차트 O) */}
          {kospi && (
            <MarketIndexCard
              name="KOSPI"
              value={kospi.current.toFixed(2)}
              change={kospi.change.toFixed(2)}
              percent={`${kospi.rate.toFixed(2)}%`}
              isUp={kospi.change >= 0}
              miniChartData={kospiMiniChart}
            />
          )}

          {/* 🇰🇷 KOSDAQ (미니차트 O) */}
          {kosdaq && (
            <MarketIndexCard
              name="KOSDAQ"
              value={kosdaq.current.toFixed(2)}
              change={kosdaq.change.toFixed(2)}
              percent={`${kosdaq.rate.toFixed(2)}%`}
              isUp={kosdaq.change >= 0}
              miniChartData={kosdaqMiniChart}
            />
          )}

          {/* 🌍 해외 지수 (미니차트 X) */}
          {sp500 && (
            <MarketIndexCard
              name="S&P500"
              value={sp500.current.toFixed(2)}
              change={sp500.change.toFixed(2)}
              percent={`${sp500.rate.toFixed(2)}%`}
              isUp={sp500.change >= 0}
            />
          )}

          {nasdaq && (
            <MarketIndexCard
              name="NASDAQ100"
              value={nasdaq.current.toFixed(2)}
              change={nasdaq.change.toFixed(2)}
              percent={`${nasdaq.rate.toFixed(2)}%`}
              isUp={nasdaq.change >= 0}
            />
          )}

          {dow && (
            <MarketIndexCard
              name="DOWJONES"
              value={dow.current.toFixed(2)}
              change={dow.change.toFixed(2)}
              percent={`${dow.rate.toFixed(2)}%`}
              isUp={dow.change >= 0}
            />
          )}

          {wti && (
            <MarketIndexCard
              name="WTI"
              value={wti.current.toFixed(2)}
              change={wti.change.toFixed(2)}
              percent={`${wti.rate.toFixed(2)}%`}
              isUp={wti.change >= 0}
            />
          )}
        </div>
      )}
    </div>
  );
}
