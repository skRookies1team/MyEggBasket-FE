import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
} from "@mui/material";

import { fetchKoreaBusinessNews } from "../../api/newsApi";

/* ================= 타입 ================= */
interface NewsItem {
  title: string;
  link: string;
  time: string;
}

/* ================= 컴포넌트 ================= */
export default function TopNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 10;

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchKoreaBusinessNews(PAGE_SIZE, page);

        setTotal(data.totalResults);

        setNews(
          data.articles.map((item: any) => ({
            title: item.title,
            link: item.url,
            time: formatTime(item.publishedAt),
          }))
        );
      } catch (error) {
        console.error("TopNews fetch error:", error);
      }
    };

    loadNews();
  }, [page]);

  const maxPage = Math.ceil(total / PAGE_SIZE);

  return (
    <Stack spacing={2}>
      {/* 뉴스 리스트 */}
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

                <Typography variant="caption" sx={{ color: "#b5b5c5" }}>
                  {n.time}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* 🔹 페이지네이션 */}
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          size="small"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          sx={{
            color: "#fff",
            borderColor: "#2a2a35",
          }}
          variant="outlined"
        >
          이전
        </Button>

        <Typography
          sx={{ color: "#b5b5c5", fontSize: "0.85rem", px: 1 }}
        >
          {page} / {maxPage || 1}
        </Typography>

        <Button
          size="small"
          disabled={page >= maxPage}
          onClick={() => setPage((p) => p + 1)}
          sx={{
            color: "#fff",
            borderColor: "#2a2a35",
          }}
          variant="outlined"
        >
          다음
        </Button>
      </Stack>
    </Stack>
  );
}

/* ================= 시간 포맷 ================= */
function formatTime(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60000);

  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;

  const day = Math.floor(hour / 24);
  return `${day}일 전`;
}
