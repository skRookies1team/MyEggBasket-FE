import { useState, useEffect } from "react"; // useEffect 추가
import {
  Box,
  Typography,
  Stack,
  Card,
  Divider,
} from "@mui/material";

import LiveStockTabs from "../LiveStock/LiveStockTabs";
import LiveStockTable from "../LiveStock/LiveStockTable";
import { useFavoriteStore } from "../../store/favoriteStore";

import Basket1 from "../../assets/icons/basket1.png";
import Basket2 from "../../assets/icons/basket3.png";

import type { StockItem } from "../../types/stock";

interface Props {
  data: {
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  };
}

export default function LiveStockPanel({ data }: Props) {
  const [category, setCategory] =
      useState<"volume" | "amount" | "rise" | "fall">("volume");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  /* 관심종목 Store */
  const favorites = useFavoriteStore((s) => s.favorites);
  const loadFavorites = useFavoriteStore((s) => s.loadFavorites); // 로드 함수 가져오기

  // [수정] 컴포넌트 마운트 시 관심종목 목록 최신화
  // 사이드바가 없거나 늦게 로딩되더라도 메인 패널에서 데이터를 확보함
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const favoriteCodes = favorites.map((f) => f.stockCode);

  const filteredData = {
    volume: data.volume.filter((item) =>
        favoriteCodes.includes(item.code)
    ),
    amount: data.amount.filter((item) =>
        favoriteCodes.includes(item.code)
    ),
    rise: data.rise.filter((item) =>
        favoriteCodes.includes(item.code)
    ),
    fall: data.fall.filter((item) =>
        favoriteCodes.includes(item.code)
    ),
  };

  // 관심종목 필터가 켜져있고 목록이 있으면 필터된 데이터, 아니면 전체 데이터
  const finalData =
      onlyFavorites
          ? filteredData
          : data;

  // 관심종목 필터는 켰는데, 실제 관심종목이 하나도 없는 경우
  const noFavoritesData = onlyFavorites && favoriteCodes.length === 0;

  return (
      <Card
          sx={{
            bgcolor: "#1a1a24",
            border: "1px solid #2a2a35",
          }}
      >
        <Box sx={{ p: 3 }}>
          {/* 헤더 */}
          <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
          >
            <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#ffffff" }}
            >
              실시간 종목 주가
            </Typography>

            {/* 관심종목 토글 */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setOnlyFavorites(!onlyFavorites)}
            >
              <Box
                  component="img"
                  src={onlyFavorites ? Basket2 : Basket1}
                  alt="favorites toggle"
                  sx={{
                    width: 36,
                    height: 36,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
              />
              <Typography
                  variant="caption"
                  sx={{
                    color: "#ffffff",
                    fontSize: "0.8rem",
                  }}
              >
                {onlyFavorites
                    ? "관심종목만 보는 중"
                    : "전체 종목 보기"}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: "#2a2a35", mb: 2 }} />

          {/* 정렬 탭 */}
          <LiveStockTabs
              selected={category}
              onChange={setCategory}
          />

          {/* 내용 */}
          <Box sx={{ mt: 2 }}>
            {noFavoritesData ? (
                <Box
                    sx={{
                      py: 4,
                      textAlign: "center",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                    }}
                >
                  등록된 관심종목이 없습니다.
                </Box>
            ) : (
                <LiveStockTable
                    stocks={finalData[category]}
                    category={category}
                />
            )}
          </Box>
        </Box>
      </Card>
  );
}