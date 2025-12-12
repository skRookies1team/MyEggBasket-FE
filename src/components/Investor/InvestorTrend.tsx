import { useEffect, useState } from "react";
import InvestorSection from "../Investor/InvestorSection";
import "../../assets/Investor/InvestorTrend.css";
import { fetchMarketInvestorTrend } from "../../api/investorTrendApi";

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
  const [trendData, setTrendData] =
    useState<{ buy: TrendData; sell: TrendData } | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      setError(null);

      const buyData: TrendData = { foreign: [], institute: [], retail: [] };
      const sellData: TrendData = { foreign: [], institute: [], retail: [] };

      try {
        const list = await fetchMarketInvestorTrend();

        list.forEach((stock) => {
          stock.investors.forEach((inv) => {
            const target =
              inv.type === "외국인"
                ? "foreign"
                : inv.type === "기관"
                ? "institute"
                : "retail";

            // ✅ InvestorSection이 요구하는 shape을 완전히 맞춤
            const item: InvestorData = {
              name: stock.stockName ?? "알 수 없음",
              price: 0, // 현재가 정보 없음 → 0으로 고정
              rate: 0,  // 등락률 정보 없음 → 0으로 고정
              amount: Math.abs(inv.netBuyAmount ?? 0) / 1_0000_0000,
              volume: Math.abs(inv.netBuyQty ?? 0),
            };

            if (inv.netBuyAmount > 0) {
              buyData[target].push(item);
            } else if (inv.netBuyAmount < 0) {
              sellData[target].push(item);
            }
          });
        });

        setTrendData({ buy: buyData, sell: sellData });
      } catch (e) {
        console.error(e);
        setError("투자자 동향 데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []);

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
          <InvestorSection
            title="외국인"
            data={trendData[tab].foreign}
            tab={tab}
          />
          <InvestorSection
            title="기관"
            data={trendData[tab].institute}
            tab={tab}
          />
          <InvestorSection
            title="개인"
            data={trendData[tab].retail}
            tab={tab}
          />
        </div>
      )}
    </div>
  );
}
