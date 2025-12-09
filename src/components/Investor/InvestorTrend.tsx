import { useState, useEffect } from "react";
import InvestorSection from "../Investor/InvestorSection";
import "../../assets/Investor/InvestorTrend.css";
import { fetchInvestorTrade, getAccessToken, fetchCurrentPrice } from "../../api/stockApi";

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

  // KOSPI, KOSDAQ 주요 50개 종목
  const stockList = [
    // 기존 종목
    { name: "삼성전자", code: "005930" },
    { name: "SK하이닉스", code: "000660" },
    { name: "NAVER", code: "035420" },
    { name: "에코프로", code: "086520" },
    { name: "두산로보틱스", code: "454910" },
    { name: "신성델타테크", code: "065350" },
    { name: "삼성제약", code: "001360" },
    // KOSPI 추가
    { name: "LG에너지솔루션", code: "373220" },
    { name: "삼성바이오로직스", code: "207940" },
    { name: "삼성전자우", code: "005935" },
    { name: "현대차", code: "005380" },
    { name: "기아", code: "000270" },
    { name: "셀트리온", code: "068270" },
    { name: "KB금융", code: "105560" },
    { name: "POSCO홀딩스", code: "005490" },
    { name: "LG화학", code: "051910" },
    { name: "삼성물산", code: "028260" },
    { name: "신한지주", code: "055550" },
    { name: "현대모비스", code: "012330" },
    { name: "삼성SDI", code: "006400" },
    { name: "카카오", code: "035720" },
    { name: "LG전자", code: "066570" },
    { name: "한국전력", code: "015760" },
    { name: "하나금융지주", code: "086790" },
    { name: "HMM", code: "011200" },
    { name: "삼성생명", code: "032830" },
    { name: "두산에너빌리티", code: "034020" },
    { name: "한화에어로스페이스", code: "012450" },
    { name: "포스코퓨처엠", code: "003670" },
    // KOSDAQ 추가
    { name: "에코프로비엠", code: "247540" },
    { name: "알테오젠", code: "196170" },
    { name: "HLB", code: "028300" },
    { name: "엔켐", code: "348370" },
    { name: "리가켐바이오", code: "141080" },
    { name: "클래시스", code: "214150" },
    { name: "리노공업", code: "058470" },
    { name: "HPSP", code: "403870" },
    { name: "셀트리온제약", code: "068760" },
    { name: "삼천당제약", code: "000250" },
    { name: "펄어비스", code: "263750" },
    { name: "동진쎄미켐", code: "005290" },
    { name: "이오테크닉스", code: "039030" },
    { name: "솔브레인", code: "357780" },
    { name: "ISC", code: "095340" },
    { name: "원익IPS", code: "240810" },
    { name: "휴젤", code: "145020" },
    { name: "덕산테코피아", code: "317330" },
    { name: "JYP Ent.", code: "035900" },
  ];

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

        // 모든 종목에 대한 API 호출을 병렬로 처리
        await Promise.all(stockList.map(async (stock) => {
          const [tradeData, priceData] = await Promise.all([
            fetchInvestorTrade(stock.code, accessToken),
            fetchCurrentPrice(accessToken, stock.code)
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
              name: stock.name,
              price: priceData.stck_prpr,
              rate: priceData.prdy_ctrt,
              amount: data.netBuyAmount / 10000, // 만원 단위를 억원 단위로 변경
              volume: data.netBuyQty,
            };


            // 순매수/순매도에 따라 데이터 분리
            // fetchInvestorTrade API는 순매수/매도를 합산한 순매매량을 반환하므로, 양수/음수로 구분합니다.
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
