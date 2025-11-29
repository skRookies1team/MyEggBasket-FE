import { useState, useEffect, useRef } from "react";
import MarketIndexContainer from "../components/MarketIndex/MarketIndexContainer.tsx";
import Top5Rolling from "../components/Top5Rolling";
import LiveStockPanel from "../components/LiveStock/LiveStockPanel";
import "../assets/MaingPage.css";
import type { StockItem } from "../types/stock.ts";
import AIIssueLayout from "../components/AIIssueBubble/AIIssueLayout";
import NewsTabs from "../components/News/NewTabs";
import InvestorTrend from "../components/Investor/InvestorTrend";

interface MainPageProps {
  isLoggedIn?: boolean;
}

export default function MainPage({ isLoggedIn = true }: MainPageProps) {
  const [activeTab, setActiveTab] = useState<
    "main" | "watchlist" | "news" | "investor"
  >("main");

  const [showTicker, setShowTicker] = useState(false);
  const indexSectionRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver → 주요지수 섹션 보임 여부 감지
  useEffect(() => {
    if (!indexSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowTicker(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(indexSectionRef.current);
    return () => observer.disconnect();
  }, []);

  const hotStocksTop5 = [
    { rank: 1, name: "삼성전자", price: 72500, change: "+1,650", percent: "+2.3%", isUp: true },
    { rank: 2, name: "SK하이닉스", price: 135000, change: "+5,130", percent: "+4.1%", isUp: true },
    { rank: 3, name: "NAVER", price: 208000, change: "-2,530", percent: "-1.2%", isUp: false },
    { rank: 4, name: "카카오", price: 55000, change: "+865", percent: "+1.6%", isUp: true },
    { rank: 5, name: "현대차", price: 195000, change: "+3,450", percent: "+1.8%", isUp: true }
  ];

  const issueBubbles = [
    { name: "AI 반도체", size: 140, mentions: 8800, change: 12.5, color: "#FF5A4E" },
    { name: "전기차", size: 110, mentions: 5029, change: 8.3, color: "#FF5A4E"  },
    { name: "2차전지", size: 95, mentions: 3123, change: 6.2, color: "#FF5A4E"  },
    { name: "K-POP", size: 75, mentions: 1850, change: 4.1, color: "#FF5A4E"  },
    { name: "바이오", size: 120, mentions: 7940, change: -2.8, color: "#4169E1" },
    { name: "메타버스", size: 65, mentions: 1200, change: 3.2, color: "#4169E1" },
    { name: "클라우드", size: 85, mentions: 2680, change: 5.6, color: "#4169E1" }
  ];

const dummyLiveStockData: {
  volume: StockItem[];
  amount: StockItem[];
  rise: StockItem[];
  fall: StockItem[];
} = {
  volume: [
    { code: "005930", name: "삼성전자", price: 72500, change: 1650, percent: 2.3, amount: 239000000000, volume: 32100000 },
    { code: "000660", name: "SK하이닉스", price: 135000, change: 5130, percent: 4.1, amount: 256000000000, volume: 18400000 },
    { code: "035420", name: "NAVER", price: 208000, change: -2530, percent: -1.2, amount: 181000000000, volume: 8700000 },
  ],

  amount: [
    { code: "000660", name: "SK하이닉스", price: 135000, change: 5130, percent: 4.1, amount: 256000000000, volume: 18400000 },
    { code: "005930", name: "삼성전자", price: 72500, change: 1650, percent: 2.3, amount: 239000000000, volume: 32100000 },
  ],

  rise: [
    { code: "000660", name: "SK하이닉스", price: 135000, change: 5130, percent: 4.1, amount: 256000000000, volume: 18400000 },
    { code: "005380", name: "현대차", price: 195000, change: 3450, percent: 1.8, amount: 136000000000, volume: 6100000 },
  ],

  fall: [
    { code: "035420", name: "NAVER", price: 208000, change: -2530, percent: -1.2, amount: 181000000000, volume: 8700000 },
    { code: "051910", name: "LG화학", price: 520000, change: -6500, percent: -1.1, amount: 89000000000, volume: 210000 },
  ],
};

  return (
    <div className="main-container">

      {showTicker && (
        <div className="ticker-sticky">
          <MarketIndexContainer showTickerOnly/>
        </div>
      )}

      <div className="market-index-section" ref={indexSectionRef}>
        <h2 className="market-index-title"> 주요 지수 </h2>

        <MarketIndexContainer />
      </div>

      <Top5Rolling data={hotStocksTop5} interval={2000} />

      <div className="tab-menu">
        {[
          { id: "main", label: "메인" },
          { id: "watchlist", label: "실시간 관심 종목 주가" },
          { id: "news", label: "뉴스" },
          { id: "investor", label: "투자자 동향" }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="tab-content">

        {/* 메인 탭일 때 AI 이슈포착 + 실시간 주가 포함 */}
        {activeTab === "main" && (
          <div>

            <h2 className="text-[#1e1e1e] mb-4 flex items-center gap-2">
              AI 이슈포착
            </h2>

            <AIIssueLayout bubbles={issueBubbles} />

            {/* 실시간 종목 주가 패널 추가 */}
            <div style={{ marginTop: "32px" }}>
              <LiveStockPanel data={dummyLiveStockData} />
            </div>

          </div>
        )}

        {activeTab === "watchlist" && "관심종목 콘텐츠"}

        {activeTab === "news" && (
          <NewsTabs />
        )}

        {activeTab === "investor" && (
          <InvestorTrend />
        )}
      </div>
    </div>
  );
}
