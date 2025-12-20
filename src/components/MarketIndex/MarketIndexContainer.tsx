import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { MarketIndexCard } from "../MarketIndex/MarketIndexCard";
import MarketIndexTicker from "../MarketIndex/MarketIndexTicker";
import { fetchKoreaIndex, fetchForeignIndex } from "../../api/indexApi";

interface Props {
  showTickerOnly?: boolean;
  showCardsOnly?: boolean;
}

export default function MarketIndexContainer({
  showTickerOnly = false,
  showCardsOnly = false,
}: Props) {
  // 국내 지수
  const [kospi, setKospi] = useState<any>(null);
  const [kosdaq, setKosdaq] = useState<any>(null);

  // 해외 지수
  const [sp500, setSP500] = useState<any>(null);
  const [nasdaq, setNasdaq] = useState<any>(null);
  const [dow, setDow] = useState<any>(null);
  const [wti, setWTI] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // [수정] Promise.all 대신 순차적으로 실행하고, 중간에 딜레이를 줍니다.
        // 모의투자 TPS 제한(초당 2건)을 피하기 위해 하나씩 천천히 호출합니다.

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. 코스피
        const kospiData = await fetchKoreaIndex("0001");
        if (kospiData) setKospi(kospiData);
        await delay(300); // 0.3초 대기

        // 2. 코스닥
        const kosdaqData = await fetchKoreaIndex("1001");
        if (kosdaqData) setKosdaq(kosdaqData);
        await delay(300);

        // 3. S&P500
        const sp = await fetchForeignIndex("SPX");
        if (sp) setSP500(sp);
        await delay(300);

        // 4. 나스닥
        const nd = await fetchForeignIndex("NDX");
        if (nd) setNasdaq(nd);
        await delay(300);

        // 5. 다우존스
        const dw = await fetchForeignIndex("DOW");
        if (dw) setDow(dw);
        await delay(300);

        // 6. WTI
        const wt = await fetchForeignIndex("CL");
        if (wt) setWTI(wt);

      } catch (err) {
        console.error("Index load failed:", err);
      }
    };

    load();
    const interval = setInterval(load, 60_000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const kospiData = await fetchKoreaIndex("0001");
        const kosdaqData = await fetchKoreaIndex("1001");

        const sp = await fetchForeignIndex("SPX");
        const nd = await fetchForeignIndex("NDX");
        const dw = await fetchForeignIndex("DOW");
        const wt = await fetchForeignIndex("CL");

        if (kospiData) setKospi(kospiData);
        if (kosdaqData) setKosdaq(kosdaqData);
        if (sp) setSP500(sp);
        if (nd) setNasdaq(nd);
        if (dw) setDow(dw);
        if (wt) setWTI(wt);
      } catch (err) {
        console.error("Index load failed:", err);
      }
    };

    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  /* 🇰🇷 KOSPI / KOSDAQ 미니 차트 */
  const kospiMiniChart = kospi
    ? kospi.miniChartData ?? [
        kospi.current - 6,
        kospi.current - 4,
        kospi.current - 5,
        kospi.current - 2,
        kospi.current,
      ]
    : undefined;

  const kosdaqMiniChart = kosdaq
    ? kosdaq.miniChartData ?? [
        kosdaq.current - 3,
        kosdaq.current - 2,
        kosdaq.current - 1,
        kosdaq.current + 0.5,
        kosdaq.current,
      ]
    : undefined;

  /* ticker 데이터 */
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
  ].filter(Boolean) as any[];

  const renderTicker = !showCardsOnly;
  const renderCards = !showTickerOnly;

  return (
    <Box sx={{ width: "100%" }}>
      {/* 🔹 Ticker */}
      {renderTicker && <MarketIndexTicker indices={tickerData} />}

      {/* 🔹 Cards */}
      {renderCards && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#0a0a0f",
            overflowX: "auto",

            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#2a2a35",
              borderRadius: "10px",
            },
          }}
        >
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
        </Stack>
      )}
    </Box>
  );
}
