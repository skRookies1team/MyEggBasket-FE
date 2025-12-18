import { useState, useEffect, useRef } from "react";
import { fetch50StocksByPeriod } from "../api/liveStockApi";
import MarketIndexContainer from "../components/MarketIndex/MarketIndexContainer";
import Top10Rolling from "../components/Top10Rolling";
import LiveStockPanel from "../components/LiveStock/LiveStockPanel";
import AIIssueLayout from "../components/AIIssueBubble/AIIssueLayout";
import NewsTabs from "../components/News/NewTabs";
import InvestorTrend from "../components/Investor/InvestorTrend";
import { fetchVolumeRankTop10 } from "../api/volumeRankApi";
import { useSnapshotStore } from "../store/snapshotStore";
import { TICKERS } from "../data/stockInfo";
import type { VolumeRankItem } from "../components/Top10Rolling";
import type { StockItem } from "../types/stock.ts";
import "../assets/MaingPage.css";
import { fetchRealtimePrice } from '../api/realtimePrice';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getStockInfoFromDB } from "../api/stocksApi.ts";


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
    volume: [], amount: [], rise: [], fall: [],
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

  // // --------------------------- Snapshot + 기간별 데이터 ----------------------------
  // useEffect(() => {
  //   async function load() {
  //     const data = await fetch50StocksByPeriod(period, TICKERS);
  //     setLiveData(data);
  //     useSnapshotStore.getState().setSnapshot(period, data);
  //   }

  //   load();
  // }, [period]);

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

  // -------------------구독---------------------
// 1. 실시간 가격 업데이트 및 "항목 추가" 로직
  const updateRealtimePrice = async(updatedStock: any) => {
    const stockData = await getStockInfoFromDB(updatedStock.stockCode)

    setLiveData((prev) => {
      const updateOrAdd = (list: StockItem[]) => {
        // 해당 종목이 이미 리스트에 있는지 확인
        const existingItemIndex = list.findIndex(item => item.code === updatedStock.stockCode);

        if (existingItemIndex !== -1) {
          // 1) 이미 있다면: 해당 항목만 업데이트
          return list.map((item, idx) =>
            idx === existingItemIndex
              ? { 
                  ...item, 
                  price: updatedStock.price, 
                  percent: updatedStock.diffRate,
                  volume: updatedStock.volume,
                  amount: updatedStock.tradingValue, // 거래대금
                  change: updatedStock.diff // 전일대비 변동액
                }
              : item
          );
        } else {
          // 2) 없다면: 새 항목으로 추가
          const newItem: StockItem = {
            code: updatedStock.stockCode,
            name: stockData?.name || updatedStock.stockCode, // 이름이 없으면 코드로 대체
            price: updatedStock.price,
            percent: updatedStock.diffRate,
            volume: updatedStock.volume,
            amount: updatedStock.tradingValue,
            change: updatedStock.diff,
          };
          // 기존 리스트 뒤에 추가
          return [...list, newItem];
        }
      };

      return {
        volume: updateOrAdd(prev.volume),
        amount: updateOrAdd(prev.amount),
        rise: updateOrAdd(prev.rise),
        fall: updateOrAdd(prev.fall),
      };
    });
  };

  // 2. 웹소켓 연결 및 구독 (API 호출 없이 트리거만 수행)
  useEffect(() => {
    // 백엔드에 증권사 실시간 데이터 요청 트리거
    TICKERS.forEach(code =>{ fetchRealtimePrice(code)});

    const socket = new SockJS(`http://localhost:8081/ws`);
    const stompClient = Stomp.over(socket);
    stompClient.debug = () => {}; 

    stompClient.connect({}, () => {
      console.log("Connected to WebSocket");
      TICKERS.forEach((stockCode) => {
        stompClient.subscribe(`/topic/realtime-price/${stockCode}`, (sdk: any) => {
          const data = JSON.parse(sdk.body);
          updateRealtimePrice(data); 
        });
      });
    });

    return () => {
      // 연결이 수립된 상태(connected === true)일 때만 disconnect 호출
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("STOMP Disconnected");
        });
      }
    };
  }, []);

  return (
    <div className="main-container">
      {/* 🔹 카드 영역 사라지면 → 상단 sticky 티커 */}
      {showTicker && (
        <div className="ticker-sticky">
          <MarketIndexContainer showTickerOnly />
        </div>
      )}

      {/* 🔹 메인 상단 → 카드만 표시 */}
      <div className="market-index-section" ref={indexSectionRef}>
        <h2 className="market-index-title"> 주요 지수 </h2>
        <MarketIndexContainer showCardsOnly /> {/* ✅ 변경 */}
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
          <div style={{ marginTop: "32px" }}>
            <LiveStockPanel
              data={liveData}
              period={period}
              onPeriodChange={setPeriod}
            />
          </div>
        )}

        {activeTab === "news" && <NewsTabs />}
        {activeTab === "investor" && <InvestorTrend />}
      </div>
    </div>
  );
}
