import { useState } from "react";
import { Box, Card, Stack, Button } from "@mui/material";
import TopNews from "../News/TopNews";
import MyStocksNews from "../News/MyStocksNews";

export default function NewsTabs() {
  const [tab, setTab] = useState<"top" | "my">("top");

  return (
    <Card
      sx={{
        bgcolor: "#1a1a24",
        border: "1px solid #2a2a35",
      }}
    >
      {/* 🔹 상단 탭 */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 1,
          borderBottom: "1px solid #2a2a35",
          bgcolor: "#0f0f15",
        }}
      >
        <Button
          onClick={() => setTab("top")}
          variant={tab === "top" ? "contained" : "text"}
          sx={{
            px: 2,
            py: 0.8,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#ffffff", // 레이블 흰색

            ...(tab === "top" && {
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
            }),

            ...(tab !== "top" && {
              opacity: 0.85,
              "&:hover": {
                bgcolor: "#232332",
                opacity: 1,
              },
            }),
          }}
        >
          실시간 주요 뉴스
        </Button>

        <Button
          onClick={() => setTab("my")}
          variant={tab === "my" ? "contained" : "text"}
          sx={{
            px: 2,
            py: 0.8,
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#ffffff", // 레이블 흰색

            ...(tab === "my" && {
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
            }),

            ...(tab !== "my" && {
              opacity: 0.85,
              "&:hover": {
                bgcolor: "#232332",
                opacity: 1,
              },
            }),
          }}
        >
          보유 종목 뉴스
        </Button>
      </Stack>

      {/* 🔹 컨텐츠 */}
      <Box sx={{ p: 3 }}>
        {tab === "top" ? <TopNews /> : <MyStocksNews />}
      </Box>
    </Card>
  );
}
