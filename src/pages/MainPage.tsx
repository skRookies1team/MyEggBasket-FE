import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { TrendingUp, Newspaper, Users } from "lucide-react";
import { type StompSubscription } from "@stomp/stompjs";

import { useWebSocket } from "../context/WebSocketContext";
import MarketIndexContainer from "../components/MarketIndex/MarketIndexContainer";
import Top10Rolling from "../components/Top10Rolling";
import LiveStockPanel from "../components/LiveStock/LiveStockPanel";
import AIIssueLayout from "../components/AIIssueBubble/AIIssueLayout";
import NewsTabs from "../components/News/NewsTabs";
import InvestorTrend from "../components/Investor/InvestorTrend";

import { fetchVolumeRankTop10 } from "../api/volumeRankApi";
import { getStockInfoFromDB } from "../api/stocksApi";
import { requestStockSubscription } from "../hooks/useRealtimeStock";
import { TICKERS } from "../data/stockInfo";
import { AiBubbleChart } from "../api/bubbleChartApi";

import type { VolumeRankItem } from "../components/Top10Rolling";
import type { StockItem } from "../types/stock";
import type { BubbleItem } from "../components/AIIssueBubble/AIIssueBubbleCircular";

/* ===================== */
/* NAV 높이 (중요) */
/* ===================== */
const NAV_HEIGHT = 64;

const BUBBLE_COLORS = [
  "#7c3aed",
  "#00e676",
  "#29b6f6",
  "#ff4d6a",
  "#ffa726",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#ff7043",
  "#5c6bc0",
];

export default function MainPageDarkRealtime() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [showTicker, setShowTicker] = useState(false);

  const indexRef = useRef<HTMLDivElement | null>(null);
  const { client, isConnected } = useWebSocket();
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  const [top10Rank, setTop10Rank] = useState<VolumeRankItem[]>([]);
  const [liveData, setLiveData] = useState<{
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  }>({ volume: [], amount: [], rise: [], fall: [] });

  const [issueBubbles, setIssueBubbles] = useState<BubbleItem[]>([]);

  /* ===================== */
  /* 주요 지수 Sticky 감지 */
  /* ===================== */
  useEffect(() => {
    if (!indexRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowTicker(!entry.isIntersecting),
      {
        rootMargin: `-${NAV_HEIGHT}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(indexRef.current);
    return () => observer.disconnect();
  }, []);

  /* ===================== */
  /* 거래량 TOP10 */
  /* ===================== */
  useEffect(() => {
    const load = async () => {
      const list = await fetchVolumeRankTop10();
      if (list) setTop10Rank(list);
    };
    load();

    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, []);

  /* ===================== */
  /* AI Bubble Chart */
  /* ===================== */
  useEffect(() => {
    const load = async () => {
      try {
        const AIChartData = await AiBubbleChart();
        const periodData = AIChartData?.["1_month"];
        console.log(periodData)
        if (!periodData) return;

        const combined = [
          ...(periodData.keywords || []),
          ...(periodData.categories || []),
        ];
        if (combined.length === 0) return;

        const maxCount = Math.max(...combined.map((i: any) => i.count));

        const processed: BubbleItem[] = combined.map(
          (item: any, index: number) => ({
            name: item.name,
            size: 70 + (item.count / maxCount) * 70,
            mentions: item.count,
            change: Number((Math.random() * 10 - 2).toFixed(1)),
            color: BUBBLE_COLORS[index % BUBBLE_COLORS.length],
          })
        );

        setIssueBubbles(processed);
      } catch (e) {
        console.error("Bubble Chart Load Error", e);
      }
    };
    load();
  }, []);

  /* ===================== */
  /* 실시간 주가 업데이트 */
  /* ===================== */
  const updateRealtimePrice = async (updated: any) => {
    const info = await getStockInfoFromDB(updated.stockCode);

    setLiveData((prev) => {
      const update = (list: StockItem[]) => {
        const idx = list.findIndex((i) => i.code === updated.stockCode);

        if (idx !== -1) {
          return list.map((item, i) =>
            i === idx
              ? {
                ...item,
                price: updated.price,
                percent: updated.diffRate,
                volume: updated.volume,
                amount: updated.tradingValue,
                change: updated.diff,
              }
              : item
          );
        }

        return [
          ...list,
          {
            code: updated.stockCode,
            name: info?.name ?? updated.stockCode,
            price: updated.price,
            percent: updated.diffRate,
            volume: updated.volume,
            amount: updated.tradingValue,
            change: updated.diff,
          },
        ];
      };

      return {
        volume: update(prev.volume),
        amount: update(prev.amount),
        rise: update(prev.rise),
        fall: update(prev.fall),
      };
    });
  };

  /* ===================== */
  /* STOMP 구독 */
  /* ===================== */
  useEffect(() => {
    if (!client || !isConnected) return;

    subscriptionsRef.current.forEach((s) => s.unsubscribe());
    subscriptionsRef.current = [];

    let mounted = true;

    TICKERS.forEach((code, index) => {
      setTimeout(() => {
        if (!mounted || !client.connected) return;

        const sub = requestStockSubscription(client, code, updateRealtimePrice);
        if (sub) subscriptionsRef.current.push(sub);
      }, index * 50);
    });

    return () => {
      mounted = false;
      subscriptionsRef.current.forEach((s) => s.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [client, isConnected]);

  /* ===================== */
  /* Render */
  /* ===================== */
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0f", py: 4, color: "#fff" }}>
      {/* Sticky Ticker (NAV 아래 고정) */}
      {showTicker && (
        <Box
          sx={{
            position: "sticky",
            top: `${NAV_HEIGHT}px`,
            zIndex: 1100,
            bgcolor: "#0a0a0f",
          }}
        >
          <MarketIndexContainer showTickerOnly />
        </Box>
      )}

      <Container maxWidth="xl">
        {/* 주요 지수 */}
        <Box
          ref={indexRef}
          sx={{
            mb: 4,
            pt: `${NAV_HEIGHT}px`,
            scrollMarginTop: `${NAV_HEIGHT + 16}px`,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            주요 지수
          </Typography>
          <MarketIndexContainer showCardsOnly />
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          거래량 TOP 10
        </Typography>
        {top10Rank.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Top10Rolling data={top10Rank} interval={2500} />
          </Box>
        )}

        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            AI 이슈포착
          </Typography>
          <AIIssueLayout bubbles={issueBubbles} />
        </Box>

        <Card sx={{ bgcolor: "#1a1a24", border: "1px solid #2a2a35" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: "#7c3aed", // 보라색 인디케이터
              },
            }}
            sx={{
              "& .MuiTab-root": {
                color: "#fff", 
                fontWeight: 500,
                minHeight: 42,
                textTransform: "none",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "#7c3aed", 
                fontWeight: 700,
              },
            }}
          >
            <Tab icon={<TrendingUp size={16} />} iconPosition="start" label="메인" />
            <Tab icon={<Newspaper size={16} />} iconPosition="start" label="뉴스" />
            <Tab icon={<Users size={16} />} iconPosition="start" label="투자자 동향" />
          </Tabs>

          <CardContent sx={{ p: 4 }}>
            {activeTab === 0 && <LiveStockPanel data={liveData} />}
            {activeTab === 1 && <NewsTabs />}
            {activeTab === 2 && <InvestorTrend data={liveData} />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
