import { Box, Stack, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFavoriteStore } from "../../store/favoriteStore";
import type { StockItem } from "../../types/stock";

import Egg2 from "../../assets/icons/egg2.png";
import Egg3 from "../../assets/icons/egg3.png";

interface Props {
  stocks: StockItem[];
  category: "volume" | "amount" | "rise" | "fall";
}

export default function LiveStockTable({ stocks, category }: Props) {
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const navigate = useNavigate();

  /* ================= 유틸 ================= */
  const isFavorite = (code: string) =>
    favorites.some((f) => f.stockCode === code);

  const formatToEok = (amount: number) =>
    (amount / 100_000_000).toFixed(1);

  return (
    <Box>
      {/* ================= 헤더 ================= */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          px: 2,
          py: 1,
          mb: 1,
          color: "#ffffff",
          fontSize: "0.75rem",
          fontWeight: 600,
          borderBottom: "1px solid #2a2a35",
        }}
      >
        <Box sx={{ width: 36, textAlign: "left" }}>관심</Box>
        <Box sx={{ width: 36, textAlign: "right" }}>순위</Box>
        <Box sx={{ flex: 1 }}>종목</Box>
        <Box sx={{ width: 100, textAlign: "right" }}>현재가</Box>
        <Box sx={{ width: 90, textAlign: "right" }}>등락률</Box>

        {category === "volume" && (
          <Box sx={{ width: 100, textAlign: "right" }}>거래량</Box>
        )}
        {category === "amount" && (
          <Box sx={{ width: 100, textAlign: "right" }}>거래대금</Box>
        )}
      </Stack>

      {/* ================= 행 ================= */}
      <Stack spacing={0.5}>
        {stocks.map((s, idx) => {
          const up = s.change >= 0;
          const fav = isFavorite(s.code);

          // ✅ 거래대금 = 현재가 × 거래량
          const tradeAmount =
            Number(s.price || 0) * Number(s.volume || 0);

          return (
            <Stack
              key={s.code}
              direction="row"
              spacing={2}
              alignItems="center"
              onClick={() => navigate(`/stock/${s.code}`)}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: 1,
                cursor: "pointer",
                bgcolor: "#1a1a24",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#232332",
                },
              }}
            >
              {/* 관심종목 */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(s.code);
                }}
                sx={{ p: 0.5, mr: 0.5 }}
              >
                <Box
                  component="img"
                  src={fav ? Egg3 : Egg2}
                  alt="fav"
                  sx={{
                    height: 22,
                    width: 20,
                    objectFit: "contain",
                  }}
                />
              </IconButton>

              {/* 순위 */}
              <Typography
                sx={{
                  width: 36,
                  textAlign: "right",
                  color: "#b5b5c5",
                  fontSize: "0.8rem",
                }}
              >
                {idx + 1}
              </Typography>

              {/* 종목명 */}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 500, color: "#ffffff" }}>
                  {s.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#7b7b8b" }}
                >
                  {s.code}
                </Typography>
              </Box>

              {/* 현재가 */}
              <Typography
                sx={{
                  width: 100,
                  textAlign: "right",
                  fontWeight: 600,
                  color: up ? "#ff4d6a" : "#3ca8ff",
                }}
              >
                {Number(s.price).toLocaleString()}원
              </Typography>

              {/* 등락률 */}
              <Typography
                sx={{
                  width: 90,
                  textAlign: "right",
                  fontWeight: 600,
                  color: up ? "#ff4d6a" : "#3ca8ff",
                }}
              >
                {s.percent}%
              </Typography>

              {/* 거래량 */}
              {category === "volume" && (
                <Typography
                  sx={{
                    width: 100,
                    textAlign: "right",
                    color: "#d0d0dd",
                  }}
                >
                  {Number(s.volume).toLocaleString()}
                </Typography>
              )}

              {/* 거래대금 */}
              {category === "amount" && (
                <Typography
                  sx={{
                    width: 100,
                    textAlign: "right",
                    color: "#d0d0dd",
                  }}
                >
                  {formatToEok(tradeAmount)}억
                </Typography>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
