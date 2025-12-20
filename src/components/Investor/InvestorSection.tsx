import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

interface Item {
  name: string;    // 종목명
  price: number;   // 현재가
  rate: number;    // 등락률
  amount: number;  // 거래대금 (억원 기준)
  volume: number;  // 거래수량
}

interface Props {
  title: string;
  data: Item[];
  tab: "buy" | "sell";
}

export default function InvestorSection({ title, data }: Props) {
  // 거래대금(amount) 기준 내림차순 정렬
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <Card
      sx={{
        bgcolor: "#1a1a24",
        border: "1px solid #2a2a35",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* 🔹 섹션 제목 */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "#ffffff", 
          }}
        >
          {title}
        </Typography>

        {/* 🔹 리스트 */}
        <Stack spacing={1}>
          {sortedData.map((item, idx) => {
            const up = item.rate >= 0;

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "#1a1a24",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#232332",
                  },
                }}
              >
                {/* 왼쪽 영역 */}
                <Stack spacing={0.3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      sx={{
                        width: 22,
                        textAlign: "center",
                        fontSize: "0.75rem",
                        color: "#b5b5c5",
                      }}
                    >
                      {idx + 1}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: "#ffffff",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "#d0d0dd",
                      }}
                    >
                      {item.price.toLocaleString()}원
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: up ? "#00e676" : "#ff4d6a",
                      }}
                    >
                      {up ? `+${item.rate}%` : `${item.rate}%`}
                    </Typography>
                  </Stack>
                </Stack>

                {/* 오른쪽 영역 */}
                <Stack alignItems="flex-end" spacing={0.3}>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#ffffff",
                      fontWeight: 500,
                    }}
                  >
                    {item.amount < 1
                      ? `${(item.amount * 10000).toLocaleString()}만원`
                      : `${item.amount.toFixed(2)}억원`}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#b5b5c5",
                    }}
                  >
                    {item.volume.toLocaleString()}주
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
