import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import { MarketIndexCard } from "./MarketIndexCard";
import MarketIndexTicker from "./MarketIndexTicker";
import { fetchKoreaIndex, fetchForeignIndex } from "../../api/indexApi";

interface IndexData {
  current: number;
  change: number;
  rate: number;
  volume?: number;
  miniChartData?: number[];
}

export default function MarketIndexContainer({ showTickerOnly = false, showCardsOnly = false }) {
  const [indices, setIndices] = useState<{ [key: string]: IndexData | undefined }>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [kp, kd, sp, nd, dow, cl] = await Promise.all([
        fetchKoreaIndex("0001") as Promise<IndexData>,
        fetchKoreaIndex("1001") as Promise<IndexData>,
        fetchForeignIndex("SPX") as Promise<IndexData>,
        fetchForeignIndex("NDX") as Promise<IndexData>,
        fetchForeignIndex("DOW") as Promise<IndexData>,
        fetchForeignIndex("CL") as Promise<IndexData>
      ]);

      

      // KOSPI/KOSDAQ 전용 미니차트 데이터 생성 로직 복구
      if (kp && !kp.miniChartData) {
        kp.miniChartData = [kp.current - 6, kp.current - 4, kp.current - 5, kp.current - 2, kp.current];
      }
      if (kd && !kd.miniChartData) {
        kd.miniChartData = [kd.current - 3, kd.current - 2, kd.current - 1, kd.current + 0.5, kd.current];
      }

      setIndices({ 
        KOSPI: kp, 
        KOSDAQ: kd, 
        "S&P 500": sp, 
        NASDAQ: nd, 
        DOW: dow, 
        WTI: cl 
      });
    } catch (err) {
      console.error("Failed to load index data:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };

    fetchData(); // 초기 데이터 로드

    const timer = setInterval(loadData, 60000); // 1분마다 데이터 갱신
    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []); // 마운트 시 한 번만 실행

  return (
    <Box sx={{ bgcolor: "#0f0f12", width: "100%" }}>
      {!showCardsOnly && (
        <MarketIndexTicker 
          indices={Object.entries(indices).map(([name, data]) => ({
            name,
            value: data?.current?.toFixed(2) || "0.00",
            percent: `${data?.rate?.toFixed(2) || "0.00"}%`,
            isUp: (data?.change || 0) >= 0
          }))} 
        />
      )}

      {!showTickerOnly && (
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            p: 2, 
            overflowX: "auto",
            "&::-webkit-scrollbar": { height: "6px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#333345", borderRadius: "10px" }
          }}
        >
          {loading ? Array.from(new Array(6)).map((_, index) => <MarketIndexCard key={index} loading={true} />) : Object.entries(indices).map(([name, data]) => (
            data && (
              <MarketIndexCard
                key={name}
                name={name}
                value={data.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                change={data.change.toFixed(2)}
                percent={`${data.rate?.toFixed(2)}%`}
                isUp={data.change >= 0}
                // KOSPI, KOSDAQ은 위에서 생성한 데이터가 전달됨
                miniChartData={data.miniChartData} 
              />
            )
          ))}
        </Stack>
      )}
    </Box>
  );
}