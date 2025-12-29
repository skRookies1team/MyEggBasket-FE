import { useState } from "react";
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

  /* 관심종목 */
  const favorites = useFavoriteStore((s) => s.favorites);
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

  const finalData =
    onlyFavorites && favoriteCodes.length > 0
      ? filteredData
      : data;

  const noFavorites = onlyFavorites && favoriteCodes.length === 0;

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
            sx={{ fontWeight: 600, color: "#ffffff" }} // 🔥 흰색
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
                color: "#ffffff", // 🔥 레이블 흰색
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
          {noFavorites ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                color: "#ffffff", // 🔥 흰색
                fontSize: "0.9rem",
              }}
            >
              관심종목이 없습니다. 관심종목을 추가해주세요.
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
