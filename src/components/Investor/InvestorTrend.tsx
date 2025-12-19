import { useEffect, useState, useMemo } from "react";
import InvestorSection from "../Investor/InvestorSection";
import "../../assets/Investor/InvestorTrend.css";
import { fetchMarketInvestorTrend } from "../../api/investorTrendApi";
import type { StockItem } from "../../types/stock";

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

interface Props {
  // MainPage에서 전달받는 실시간 데이터
  data: {
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  };
}

export default function InvestorTrend({ data }: Props) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawTrendList, setRawTrendList] = useState<any[]>([]); // API 원본 데이터 저장

  // 1. 투자자 동향 원본 데이터는 최초 1회만 호출
  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      try {
        const list = await fetchMarketInvestorTrend();
        setRawTrendList(list);
      } catch (e) {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrendData();
  }, []);

  // 2. [핵심] 실시간 props(data)와 원본 데이터를 조합 (useMemo로 최적화)
  // data.volume 등 실시간 리스트를 하나로 합쳐서 가격을 찾기 쉽게 만듭니다.
  const processedData = useMemo(() => {
    if (!rawTrendList.length) return null;

    // 실시간 데이터에서 가격 정보를 빠르게 찾기 위한 Map 생성
    const priceMap = new Map<string, { price: number; rate: number }>();
    [...data.volume, ...data.amount, ...data.rise, ...data.fall].forEach(item => {
      priceMap.set(item.name, { price: item.price, rate: item.percent });
    });

    const buyData: TrendData = { foreign: [], institute: [], retail: [] };
    const sellData: TrendData = { foreign: [], institute: [], retail: [] };

    rawTrendList.forEach((stock) => {
      const liveInfo = priceMap.get(stock.stockName); // 실시간 가격 매칭

      stock.investors.forEach((inv: any) => {
        const target =
          inv.type === "외국인" ? "foreign" : 
          inv.type === "기관" ? "institute" : "retail";

        const item: InvestorData = {
          name: stock.stockName ?? "알 수 없음",
          price: liveInfo?.price ?? 0, // 실시간 가격 적용
          rate: liveInfo?.rate ?? 0,   // 실시간 등락률 적용
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

    return { buy: buyData, sell: sellData };
  }, [rawTrendList, data]); // 원본 데이터나 실시간 가격이 바뀔 때만 실행

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="trend-tabs">
        <button className={`trend-tab ${tab === "buy" ? "active" : ""}`} onClick={() => setTab("buy")}>순매수</button>
        <button className={`trend-tab ${tab === "sell" ? "active" : ""}`} onClick={() => setTab("sell")}>순매도</button>
      </div>

      {processedData && (
        <div className="investor-trend-container">
          <InvestorSection title="외국인" data={processedData[tab].foreign} tab={tab} />
          <InvestorSection title="기관" data={processedData[tab].institute} tab={tab} />
          <InvestorSection title="개인" data={processedData[tab].retail} tab={tab} />
        </div>
      )}
    </div>
  );
}