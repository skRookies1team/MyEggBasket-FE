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

import MarketIndexContainer from "../components/MarketIndex/MarketIndexContainer";
import Top10Rolling from "../components/Top10Rolling";
import LiveStockPanel from "../components/LiveStock/LiveStockPanel";
import AIIssueLayout from "../components/AIIssueBubble/AIIssueLayout";
import NewsTabs from "../components/News/NewsTabs";
import InvestorTrend from "../components/Investor/InvestorTrend";

import { fetchVolumeRankTop10 } from "../api/volumeRankApi";
import { getStockInfoFromDB } from "../api/stocksApi";

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

  /* ---------------- 실시간 WebSocket ---------------- */
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws?userId=1");

    socket.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type !== "STOCK_TICK") return;

        const { code, price, change_rate, volume, trade_value } = msg;
        const numericPrice =
          typeof price === "string" ? parseInt(price, 10) : price;

        const info = await getStockInfoFromDB(code);

        setLiveData((prev) => {
          const updateList = (list: StockItem[]) => {
            const idx = list.findIndex((i) => i.code === code);

            if (idx !== -1) {
              return list.map((item, i) =>
                i === idx
                  ? {
                      ...item,
                      price: numericPrice,
                      percent: change_rate,
                      volume,
                      amount: trade_value,
                      change: change_rate >= 0 ? 1 : -1,
                    }
                  : item
              );
            }

            return [
              ...list,
              {
                code,
                name: info?.name ?? code,
                price: numericPrice,
                percent: change_rate || 0,
                change: (change_rate || 0) >= 0 ? 1 : -1,
                volume: volume || 0,
                amount: trade_value || 0,
              },
            ];
          };

          return {
            volume: updateList(prev.volume).sort((a, b) => b.volume - a.volume),
            amount: updateList(prev.amount).sort((a, b) => b.amount - a.amount),
            rise: updateList(prev.rise).sort((a, b) => b.percent - a.percent),
            fall: updateList(prev.fall).sort((a, b) => a.percent - b.percent),
          };
        });
      } catch (error) {
        console.error("[WS] 메시지 처리 에러:", error);
      }
    };

    return () => socket.close();
  }, []);

  /* ---------------- AI 이슈 ---------------- */
  const issueBubbles = [
    { name: "AI 반도체", size: 140, mentions: 8800, change: 12.5, color: "#7c3aed" },
    { name: "전기차", size: 110, mentions: 5029, change: 8.3, color: "#00e676" },
    { name: "2차전지", size: 95, mentions: 3123, change: 6.2, color: "#29b6f6" },
    { name: "바이오", size: 120, mentions: 7940, change: 4.5, color: "#ff4d6a" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0a0a0f", py: 4, color: "#ffffff" }}>
      {showTicker && (
        <Box sx={{ position: "sticky", top: 0, zIndex: 10 }}>
          <MarketIndexContainer showTickerOnly />
        </Box>
      )}

      <Container maxWidth="xl">
        <Box ref={indexRef} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: "#fff" }}>
            주요 지수
          </Typography>
          <MarketIndexContainer showCardsOnly />
        </Box>

        {top10Rank.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Top10Rolling data={top10Rank} interval={2500} />
          </Box>
        )}

        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: "#fff" }}>
            AI 이슈포착
          </Typography>
          <AIIssueLayout bubbles={issueBubbles} />
        </Box>

        <Card sx={{ bgcolor: "#1a1a24", border: "1px solid #2a2a35" }}>
          {/* 🔥 탭 레이블 흰색 처리 */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              px: 2,
              borderBottom: "1px solid #2a2a35",
              "& .MuiTab-root": {
                color: "#ffffff",
                opacity: 0.8,
                fontWeight: 500,
                textTransform: "none",
              },
              "& .MuiTab-root:hover": {
                opacity: 1,
              },
              "& .Mui-selected": {
                color: "#ffffff",
                fontWeight: 700,
                opacity: 1,
              },
              "& .MuiSvgIcon-root": {
                color: "#ffffff",
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
