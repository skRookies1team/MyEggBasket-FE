import { useState, useEffect, useRef, useMemo } from "react";
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
// [추가] 초기 데이터 로딩을 위해 import
import { fetch50StocksByPeriod } from "../api/liveStockApi";
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
  const [issueBubbles, setIssueBubbles] = useState<BubbleItem[]>([]);

  // [변경] 개별 리스트 대신 전체 종목 Map으로 관리 (중복 방지 및 효율적 업데이트)
  const [stockMap, setStockMap] = useState<Map<string, StockItem>>(new Map());

  // [핵심] stockMap이 변할 때마다 각 탭에 맞는 리스트를 '자동으로' 분류 및 정렬
  const liveData = useMemo(() => {
    const allStocks = Array.from(stockMap.values());
    return {
      // 거래량 내림차순
      volume: [...allStocks].sort((a, b) => b.volume - a.volume),
      // 거래대금 내림차순
      amount: [...allStocks].sort((a, b) => b.amount - a.amount),
      // 급상승: 등락률 양수만, 높은 순
      rise: allStocks
          .filter((s) => s.percent > 0)
          .sort((a, b) => b.percent - a.percent),
      // 급하락: 등락률 음수만, 낮은 순 (하락폭 큰 순)
      fall: allStocks
          .filter((s) => s.percent < 0)
          .sort((a, b) => a.percent - b.percent),
    };
  }, [stockMap]);

  /* ===================== */
  /* 초기 데이터 로드 */
  /* ===================== */
  useEffect(() => {
    const loadInitialData = async () => {
      // TICKERS에 있는 종목들의 초기 데이터를 한 번에 가져옴
      const data = await fetch50StocksByPeriod("day", TICKERS);

      const newMap = new Map<string, StockItem>();
      // data.volume에는 전체 종목이 포함되어 있으므로 이를 이용해 Map 초기화
      data.volume.forEach((item) => {
        newMap.set(item.code, item);
      });
      setStockMap(newMap);
    };

    loadInitialData();
  }, []);

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
        if (!periodData || !periodData.keywords) return;

        const keywords = periodData.keywords;
        if (keywords.length === 0) return;

        const maxCount = Math.max(...keywords.map((k: any) => k.count));

        const processed: BubbleItem[] = keywords.map(
            (item: any, index: number) => ({
              name: item.name,
              mentions: item.count,
              size: 70 + (item.count / maxCount) * 70,
              change: 0,
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
    // 종목명이 Map에 없으면 DB에서 조회
    let name = stockMap.get(updated.stockCode)?.name;
    if (!name) {
      const info = await getStockInfoFromDB(updated.stockCode);
      name = info?.name ?? updated.stockCode;
    }

    setStockMap((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(updated.stockCode);

      // 기존 데이터가 있으면 업데이트, 없으면 새로 추가
      newMap.set(updated.stockCode, {
        code: updated.stockCode,
        name: name!,
        price: updated.price,
        percent: updated.diffRate,
        volume: updated.volume,
        amount: updated.tradingValue,
        change: updated.diff,
        // 기존 데이터가 있다면 나머지 필드 유지 필요시 ...existing 사용
        ...existing,
      });

      return newMap;
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
              {/* useMemo로 계산된 liveData를 전달 */}
              {activeTab === 0 && <LiveStockPanel data={liveData} />}
              {activeTab === 1 && <NewsTabs />}
              {activeTab === 2 && <InvestorTrend data={liveData} />}
            </CardContent>
          </Card>
        </Container>
      </Box>
  );
}