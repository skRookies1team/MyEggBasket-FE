import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

interface NewsItem {
  title: string;
  link: string;
  time: string;
}

export default function TopNews() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // TODO: API 연동 (네이버 뉴스, 한국투자 뉴스, 자체 크롤링 등)
    setNews([
      {
        title: "삼성전자, AI 반도체 공급 확대 발표",
        link: "#",
        time: "2분 전",
      },
      {
        title: "코스피 상승…외국인 순매수 지속",
        link: "#",
        time: "7분 전",
      },
    ]);
  }, []);

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
          <CardContent sx={{ py: 1.8, px: 2 }}>
            <Stack spacing={0.5}>
              {/* 🔹 뉴스 제목 (레이블) */}
              <Typography
                sx={{
                  color: "#ffffff", // 레이블 흰색
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
