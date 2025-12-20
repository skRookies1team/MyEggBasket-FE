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
import { Client } from "@stomp/stompjs";

import MarketIndexContainer from "../components/MarketIndex/MarketIndexContainer";
import Top10Rolling from "../components/Top10Rolling";
import LiveStockPanel from "../components/LiveStock/LiveStockPanel";
import AIIssueLayout from "../components/AIIssueBubble/AIIssueLayout";
import NewsTabs from "../components/News/NewsTabs";
import InvestorTrend from "../components/Investor/InvestorTrend";

import { fetchVolumeRankTop10 } from "../api/volumeRankApi";
import { getStockInfoFromDB } from "../api/stocksApi";
import { requestStockSubscription } from "../hooks/useRealtimeStock";
import { BACKEND_WS_URL } from "../config/api";
import { TICKERS } from "../data/stockInfo";

import type { VolumeRankItem } from "../components/Top10Rolling";
import type { StockItem } from "../types/stock";

export default function MainPageDarkRealtime() {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [showTicker, setShowTicker] = useState(false);
  const indexRef = useRef<HTMLDivElement | null>(null);

  const [top10Rank, setTop10Rank] = useState<VolumeRankItem[]>([]);
  const [liveData, setLiveData] = useState<{
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  }>({ volume: [], amount: [], rise: [], fall: [] });

  /* ---------------- 거래량 TOP10 ---------------- */
  useEffect(() => {
    const load = async () => {
      const list = await fetchVolumeRankTop10();
      if (list) setTop10Rank(list);
    };
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- 주요 지수 sticky ---------------- */
  useEffect(() => {
    if (!indexRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowTicker(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(indexRef.current);
    return () => observer.disconnect();
  }, []);

  /* ---------------- 실시간 주가 업데이트 ---------------- */
  const updateRealtimePrice = async (updated: any) => {
    const info = await getStockInfoFromDB(updated.stockCode);

    setLiveData((prev) => {
      const update = (list: StockItem[]) => {
        const idx = list.findIndex(i => i.code === updated.stockCode);
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

  /* ---------------- STOMP 구독 ---------------- */
  useEffect(() => {
    const client = new Client({
      brokerURL: `ws://${new URL(BACKEND_WS_URL).host}/ws`,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      TICKERS.forEach(code => {
        requestStockSubscription(client, code, updateRealtimePrice);
      });
    };

    client.activate();
    return () => {
      client.deactivate(); // ❗ async 아님
    };
  }, []);

  /* ---------------- AI Issue ---------------- */
  const issueBubbles = [
    { name: "AI 반도체", size: 140, mentions: 8800, change: 12.5, color: "#7c3aed" },
    { name: "전기차", size: 110, mentions: 5029, change: 8.3, color: "#00e676" },
    { name: "2차전지", size: 95, mentions: 3123, change: 6.2, color: "#29b6f6" },
    { name: "바이오", size: 120, mentions: 7940, change: 4.5, color: "#ff4d6a" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0a0a0f",
        py: 4,

        /* ============================= */
        /* 메인페이지 레이블 전체 흰색 */
        /* ============================= */
        color: "#ffffff",

        "& .MuiTypography-root": {
          color: "#ffffff",
        },

        "& .MuiTab-root": {
          color: "#ffffff",
          opacity: 0.7,
          "&.Mui-selected": {
            color: "#ffffff",
            opacity: 1,
          },
        },

        "& .MuiButton-root": {
          color: "#ffffff",
        },

        "& .MuiChip-label": {
          color: "#ffffff",
        },

        /* 보조 텍스트 */
        "& .MuiTypography-colorTextSecondary": {
          color: "#b5b5c5",
        },
      }}
    >
      {/* 🔹 Sticky 지수 티커 */}
      {showTicker && (
        <Box sx={{ position: "sticky", top: 0, zIndex: 10 }}>
          <MarketIndexContainer showTickerOnly />
        </Box>
      )}

      <Container maxWidth="xl">
        {/* 🔹 주요 지수 카드 */}
        <Box ref={indexRef} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            주요 지수
          </Typography>
          <MarketIndexContainer showCardsOnly />
        </Box>

        {/* 🔹 거래량 TOP10 */}
        {top10Rank.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Top10Rolling data={top10Rank} interval={2500} />
          </Box>
        )}

        {/* 🔹 AI 이슈 */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              AI 이슈포착
            </Typography>
          </Box>
          <AIIssueLayout bubbles={issueBubbles} />
        </Box>

        {/* 🔹 메인 카드 */}
        <Card sx={{ bgcolor: "#1a1a24", border: "1px solid #2a2a35" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ px: 2, borderBottom: "1px solid #2a2a35" }}
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
