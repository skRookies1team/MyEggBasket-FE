import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

import type { AccountBalanceData } from "../../types/stock";
import { fetchUserBalance } from "../../api/accountApi";
import { fetchHoldingStockNews } from "../../api/newsApi";

/* ---------------- 타입 ---------------- */
interface NewsItem {
  stockName?: string;
  title: string;
  link: string;
  time: string;
}

/* ---------------- 날짜 포맷 ---------------- */
function formatNaverDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "유효하지 않은 날짜";

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? "오후" : "오전";
    const displayHour = hours % 12 || 12;

    return `${year}년 ${month}월 ${day}일 ${ampm} ${displayHour}시 ${minutes}분`;
  } catch {
    return dateString;
  }
}

export default function MyStocksNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [balanceData, setBalanceData] = useState<AccountBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- 잔고 로딩 ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserBalance();
        if (data) setBalanceData(data);
      } catch (error) {
        console.error("잔고 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* ---------------- 보유 종목 뉴스 ---------------- */
  useEffect(() => {
    const { holdings } = balanceData || {};
    if (!holdings || holdings.length === 0) return;

    const loadHoldingNews = async () => {
      try {
        const newsPromises = holdings.map((stock) =>
          fetchHoldingStockNews(stock.stockName)
        );

        const results = await Promise.all(newsPromises);

        const combinedNews: NewsItem[] = results.flatMap((naverNews, index) => {
          if (!naverNews?.items) return [];

          return naverNews.items.map((item: any) => ({
            stockName: holdings[index].stockName,
            title: item.title.replace(/<[^>]*>?/gm, ""),
            link: item.link,
            time: formatNaverDate(item.pubDate),
          }));
        });

        setNews(combinedNews);
      } catch (error) {
        console.error("보유 주식 뉴스 로딩 실패", error);
      }
    };

    loadHoldingNews();
  }, [balanceData]);

  /* ---------------- 렌더 ---------------- */
  if (loading) {
    return (
      <Typography sx={{ color: "#b5b5c5", textAlign: "center", py: 3 }}>
        잔고 데이터를 불러오는 중입니다…
      </Typography>
    );
  }

  if (!loading && news.length === 0) {
    return (
      <Typography sx={{ color: "#b5b5c5", textAlign: "center", py: 3 }}>
        보유 주식 뉴스가 없거나 로딩에 실패했습니다.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {news.map((n, i) => (
        <Card
          key={i}
          component="a"
          href={n.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: "none",
            bgcolor: "#1a1a24",
            border: "1px solid #2a2a35",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "#232332",
              borderColor: "#7c3aed",
            },
          }}
        >
          <CardContent sx={{ px: 2, py: 1.8 }}>
            <Stack spacing={0.6}>
              {/* 🔹 종목명 (레이블) */}
              {n.stockName && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#7c3aed",
                    fontWeight: 600,
                    letterSpacing: 0.2,
                  }}
                >
                  {n.stockName}
                </Typography>
              )}

              {/* 🔹 뉴스 제목 (레이블) */}
              <Typography
                sx={{
                  color: "#ffffff",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  lineHeight: 1.4,
                }}
              >
                {n.title}
              </Typography>

              {/* 🔹 시간 */}
              <Typography
                variant="caption"
                sx={{ color: "#b5b5c5" }}
              >
                {n.time}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
