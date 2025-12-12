import { useEffect, useState } from "react";
import { MarketIndexCard } from "../MarketIndex/MarketIndexCard";
import MarketIndexTicker from "../MarketIndex/MarketIndexTicker";
import { fetchKoreaIndex, fetchForeignIndex } from "../../api/indexApi";

interface Props {
  showTickerOnly?: boolean;
  showCardsOnly?: boolean;
}

interface IndexData {
  current: number;
  change: number;
  rate: number;
}

export default function MarketIndexContainer({
  showTickerOnly = false,
  showCardsOnly = false,
}: Props) {
  // 국내 지수
  const [kospi, setKospi] = useState<IndexData | null>(null);
  const [kosdaq, setKosdaq] = useState<IndexData | null>(null);

  // 해외 지수
  const [sp500, setSP500] = useState<IndexData | null>(null);
  const [nasdaq, setNasdaq] = useState<IndexData | null>(null);
  const [dow, setDow] = useState<IndexData | null>(null);
  const [wti, setWTI] = useState<IndexData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setKospi(await fetchKoreaIndex("0001"));
        setKosdaq(await fetchKoreaIndex("1001"));

        setSP500(await fetchForeignIndex("SPX"));
        setNasdaq(await fetchForeignIndex("NDX"));
        setDow(await fetchForeignIndex("DOW"));
        setWTI(await fetchForeignIndex("CL"));
      } catch (err) {
        console.error("Index load failed:", err);
      }
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* ----------------------------------------------------
      🔹 Ticker 데이터
  ---------------------------------------------------- */
  const tickerData = [
    kospi && {
      name: "KOSPI",
      value: kospi.current.toFixed(2),
      percent: `${kospi.rate.toFixed(2)}%`,
      isUp: kospi.change >= 0,
    },
    kosdaq && {
      name: "KOSDAQ",
      value: kosdaq.current.toFixed(2),
      percent: `${kosdaq.rate.toFixed(2)}%`,
      isUp: kosdaq.change >= 0,
    },
    sp500 && {
      name: "S&P500",
      value: sp500.current.toFixed(2),
      percent: `${sp500.rate.toFixed(2)}%`,
      isUp: sp500.change >= 0,
    },
    nasdaq && {
      name: "NASDAQ100",
      value: nasdaq.current.toFixed(2),
      percent: `${nasdaq.rate.toFixed(2)}%`,
      isUp: nasdaq.change >= 0,
    },
    dow && {
      name: "DOWJONES",
      value: dow.current.toFixed(2),
      percent: `${dow.rate.toFixed(2)}%`,
      isUp: dow.change >= 0,
    },
    wti && {
      name: "WTI",
      value: wti.current.toFixed(2),
      percent: `${wti.rate.toFixed(2)}%`,
      isUp: wti.change >= 0,
    },
  ].filter(Boolean);

  /* ----------------------------------------------------
      🔹 Render
  ---------------------------------------------------- */
  return (
    <div>
      {!showCardsOnly && <MarketIndexTicker indices={tickerData} />}

      {!showTickerOnly && (
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          {kospi && (
            <MarketIndexCard
              name="KOSPI"
              value={kospi.current.toFixed(2)}
              change={kospi.change.toFixed(2)}
              percent={`${kospi.rate.toFixed(2)}%`}
              isUp={kospi.change >= 0}
            />
          )}

          {kosdaq && (
            <MarketIndexCard
              name="KOSDAQ"
              value={kosdaq.current.toFixed(2)}
              change={kosdaq.change.toFixed(2)}
              percent={`${kosdaq.rate.toFixed(2)}%`}
              isUp={kosdaq.change >= 0}
            />
          )}

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
