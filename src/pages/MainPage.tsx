import { useState, useEffect, useRef } from "react";
import { fetch50StocksByPeriod } from "../api/liveStockApi";
import MarketIndexContainer from "../components/MarketIndex/MarketIndexContainer";
import Top10Rolling from "../components/Top10Rolling";
import LiveStockPanel from "../components/LiveStock/LiveStockPanel";
import AIIssueLayout from "../components/AIIssueBubble/AIIssueLayout";
import NewsTabs from "../components/News/NewTabs";
import InvestorTrend from "../components/Investor/InvestorTrend";
import { fetchVolumeRankTop10 } from "../api/stockApi";
import { useSnapshotStore } from "../store/snapshotStore";
import { TICKERS } from "../data/stockInfo";
import type { VolumeRankItem } from "../components/Top10Rolling";
import type { StockItem } from "../types/stock.ts";
import "../assets/MaingPage.css";

export default function MainPage() {
  const [activeTab, setActiveTab] = useState<
    "main" | "news" | "investor"
  >("main");

  const [showTicker, setShowTicker] = useState(false);
  const indexSectionRef = useRef<HTMLDivElement | null>(null);

  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("day");

  const [top10Rank, setTop10Rank] = useState<VolumeRankItem[]>([]);

  const [liveData, setLiveData] = useState<{
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  }>({
    volume: [],
    amount: [],
    rise: [],
    fall: [],
  });

  // --------------------------- 거래량 순위 Top10 ----------------------------
  useEffect(() => {
    async function loadRank() {
      const list = await fetchVolumeRankTop10();
      if (list) setTop10Rank(list);
    }

    loadRank();
    const timer = setInterval(loadRank, 20000);
    return () => clearInterval(timer);
  }, []);

  // --------------------------- Snapshot + 기간별 데이터 로드 ----------------------------
  useEffect(() => {
    async function load() {
      const snapshot = useSnapshotStore.getState().cache[period];

      // 스냅샷에 데이터 있다면 사용
      if (snapshot.volume.length > 0) {
        setLiveData(snapshot);
        return;
      }

      // 없으면 API 호출
      const data = await fetch50StocksByPeriod(period, TICKERS);
      setLiveData(data);

      // 스냅샷 저장
      useSnapshotStore.getState().setSnapshot(period, data);
    }

    load();
  }, [period]);
  // --------------------------- 주요 지수 영역 sticky 처리 ----------------------------
  useEffect(() => {
    if (!indexSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowTicker(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(indexSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // --------------------------- AI Issue Dummy ----------------------------
  const issueBubbles = [
    { name: "AI 반도체", size: 140, mentions: 8800, change: 12.5, color: "#FF5A4E" },
    { name: "전기차", size: 110, mentions: 5029, change: 8.3, color: "#FF5A4E" },
    { name: "2차전지", size: 95, mentions: 3123, change: 6.2, color: "#FF5A4E" },
    { name: "K-POP", size: 75, mentions: 1850, change: 4.1, color: "#FF5A4E" },
    { name: "바이오", size: 120, mentions: 7940, change: -2.8, color: "#4169E1" },
    { name: "메타버스", size: 65, mentions: 1200, change: 3.2, color: "#4169E1" },
    { name: "클라우드", size: 85, mentions: 2680, change: 5.6, color: "#4169E1" }
  ];

  return (
    <div className="main-container">

      {/* 스크롤 내려서 주요 지수 섹션이 사라질 때 → 티커만 표시 */}
      {showTicker && (
        <div className="ticker-sticky">
          <MarketIndexContainer showTickerOnly />
        </div>
      )}

      {/* 메인 상단 → 카드만 표시 */}
      <div className="market-index-section" ref={indexSectionRef}>
        <h2 className="market-index-title"> 주요 지수 </h2>
        <MarketIndexContainer showCardsOnly />
      </div>

      {top10Rank.length > 0 && (
        <Top10Rolling data={top10Rank} interval={2500} />
      )}


      <h2 className="text-[#1e1e1e] mb-4 flex items-center gap-2">
        AI 이슈포착
      </h2>

      <AIIssueLayout bubbles={issueBubbles} />


      <div className="tab-menu">
        {[
          { id: "main", label: "메인" },
          { id: "news", label: "뉴스" },
          { id: "investor", label: "투자자 동향" },
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

      <div className="tab-content">
        {activeTab === "main" && (
          <>
            <div style={{ marginTop: "32px" }}>
              <LiveStockPanel
                data={liveData}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>
          </>
        )}

        {activeTab === "news" && <NewsTabs />}
        {activeTab === "investor" && <InvestorTrend />}
      </div>
    </div>
  );
}
