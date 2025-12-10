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
  showCardsOnly?: boolean;
}

export default function MarketIndexContainer({
  showTickerOnly = false,
  showCardsOnly = false,
}: Props) {
  /* -------------------------------------------------------
      국내 지수
  ------------------------------------------------------- */
  const [kospi, setKospi] = useState<any>(null);
  const [kosdaq, setKosdaq] = useState<any>(null);
  const [kospiChart, setKospiChart] = useState<number[]>([]);
  const [kosdaqChart, setKosdaqChart] = useState<number[]>([]);

  const updateChart = (setter: any, list: number[]) =>
    setter(list.slice(-20));

  useEffect(() => {
    const load = async () => {
      const k1 = await fetchIndexTickPrice("0001");
      const k2 = await fetchIndexTickPrice("1001");

      if (k1.length > 0) {
        const last = k1.at(-1);
        setKospi({
          current: last.price,
          change: last.change,
          rate: last.rate,
        });
        updateChart(setKospiChart, k1.map((v) => v.price));
      }

      if (k2.length > 0) {
        const last = k2.at(-1);
        setKosdaq({
          current: last.price,
          change: last.change,
          rate: last.rate,
        });
        updateChart(setKosdaqChart, k2.map((v) => v.price));
      }
    };

    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  /* -------------------------------------------------------
      해외 지수
  ------------------------------------------------------- */
  const [sp500, setSP500] = useState<any>(null);
  const [nasdaq, setNasdaq] = useState<any>(null);
  const [dow, setDow] = useState<any>(null);
  const [wti, setWTI] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setSP500(await fetchSP500());
      setNasdaq(await fetchNasdaq100());
      setDow(await fetchDowJones());
      setWTI(await fetchWTI());
    };

    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  /* -------------------------------------------------------
      Ticker 데이터 구성
  ------------------------------------------------------- */
  const tickerData: any[] = [];

  const pushTicker = (label: string, d: any) => {
    tickerData.push({
      name: label,
      value: d.current.toFixed(2),
      percent: `${d.rate.toFixed(2)}%`,
      isUp: d.rate >= 0,
    });
  };

  if (kospi) pushTicker("KOSPI", kospi);
  if (kosdaq) pushTicker("KOSDAQ", kosdaq);
  if (sp500) pushTicker("S&P500", sp500);
  if (nasdaq) pushTicker("NASDAQ100", nasdaq);
  if (dow) pushTicker("DOWJONES", dow);
  if (wti) pushTicker("WTI", wti);

  /* -------------------------------------------------------
      카드 렌더링 함수
  ------------------------------------------------------- */
  const renderCards = () => (
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
  );

  /* -------------------------------------------------------
      최종 렌더링 조건
  ------------------------------------------------------- */
  return (
    <div>
      {/* 1) 티커만 모드 */}
      {showTickerOnly && <MarketIndexTicker indices={tickerData} />}

      {/* 2) 카드만 모드 */}
      {showCardsOnly && renderCards()}

      {/* 3) 기본 모드: Ticker + Cards */}
      {!showTickerOnly && !showCardsOnly && (
        <>
          <MarketIndexTicker indices={tickerData} />
          {renderCards()}
        </>
      )}
    </div>
  );
}
