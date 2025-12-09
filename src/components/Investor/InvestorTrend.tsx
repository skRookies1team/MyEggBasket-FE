import { useState, useEffect } from "react";
import InvestorSection from "../Investor/InvestorSection";
import "../../assets/Investor/InvestorTrend.css";
import { fetchInvestorTrade, getAccessToken, fetchCurrentPrice } from "../../api/stockApi";
import { TICKERS, getStockName } from "../../data/stockInfo";

interface InvestorData {
  name: string;
  price: number;
  rate: number;
  amount: number;
  volume: number;
}

interface TrendData {
  foreign: InvestorData[];
  institute: InvestorData[];
  retail: InvestorData[];
}

export default function InvestorTrend() {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<{ buy: TrendData; sell: TrendData } | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);

      const buyData: TrendData = { foreign: [], institute: [], retail: [] };
      const sellData: TrendData = { foreign: [], institute: [], retail: [] };

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error("Access Token을 발급받지 못했습니다.");
        }

        // API 요청 속도 제한을 피하기 위해 10개씩 끊어서 요청하고 1초 대기
        const chunkSize = 10;
        for (let i = 0; i < TICKERS.length; i += chunkSize) {
          const chunk = TICKERS.slice(i, i + chunkSize);

          await Promise.all(chunk.map(async (stockCode) => {
            const [tradeData, priceData] = await Promise.all([
              fetchInvestorTrade(stockCode, accessToken),
              fetchCurrentPrice(accessToken, stockCode)
            ]);

            if (!tradeData || !priceData) return;

            const investorMap = {
              "외국인": "foreign",
              "기관": "institute",
              "개인": "retail",
            } as const;

            tradeData.forEach(data => {
              const investorKey = investorMap[data.investor as keyof typeof investorMap];
              if (!investorKey) return;

              const itemData: InvestorData = {
                name: getStockName(stockCode),
                price: priceData.stck_prpr,
                rate: priceData.prdy_ctrt,
                amount: data.netBuyAmount / 10000, // 만원 단위를 억원 단위로 변경
                volume: data.netBuyQty,
              };

              // 순매수/순매도에 따라 데이터 분리
              if (data.netBuyAmount > 0) {
                buyData[investorKey].push(itemData);
              } else if (data.netBuyAmount < 0) {
                // 순매도 데이터는 양수로 변환하여 저장
                sellData[investorKey].push({
                  ...itemData,
                  amount: Math.abs(itemData.amount),
                  volume: Math.abs(itemData.volume),
                });
              }
            });
          }));

          // 마지막 chunk가 아니면 1초 대기
          if (i + chunkSize < TICKERS.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        setTrendData({ buy: buyData, sell: sellData });

      } catch (err) {
        setError("데이터를 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []); // 컴포넌트 마운트 시 1회만 실행 (tab이 바뀔 때 다시 호출하지 않음)

  return (
    <div>
      {/* 상단 탭 */}
      <div className="trend-tabs">
        <button
          className={`trend-tab ${tab === "buy" ? "active" : ""}`}
          onClick={() => setTab("buy")}
        >
          순매수
        </button>
        <button
          className={`trend-tab ${tab === "sell" ? "active" : ""}`}
          onClick={() => setTab("sell")}
        >
          순매도
        </button>
      </div>

      {loading && <div>로딩 중...</div>}
      {error && <div>{error}</div>}
      {!loading && !error && trendData && (
        <div className="investor-trend-container">
          <InvestorSection title="외국인" data={trendData[tab].foreign} tab={tab} />
          <InvestorSection title="기관" data={trendData[tab].institute} tab={tab} />
          <InvestorSection title="개인" data={trendData[tab].retail} tab={tab} />
        </div>
      )}
    </div>
  );
}
