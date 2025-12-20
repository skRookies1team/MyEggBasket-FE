import { useEffect, useState, useMemo } from "react";
import { Box, Stack, Button, Typography, Card } from "@mui/material";

import InvestorSection from "../Investor/InvestorSection";
import { fetchMarketInvestorTrend } from "../../api/investorTrendApi";
import type { StockItem } from "../../types/stock";

/* ---------------- 타입 ---------------- */
interface InvestorData {
  name: string;
  price: number;
  rate: number;
  amount: number;
  volume: number;
}

interface TrendData {
  foreign: InvestorData[];
  institute: InvestorData[];
  retail: InvestorData[];
}

interface Props {
  data: {
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  };
}

export default function InvestorTrend({ data }: Props) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawTrendList, setRawTrendList] = useState<any[]>([]);

  /* ---------------- 원본 데이터 1회 로딩 ---------------- */
  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      try {
        const list = await fetchMarketInvestorTrend();
        setRawTrendList(list);
      } catch {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrendData();
  }, []);

  /* ---------------- 실시간 데이터 결합 ---------------- */
  const processedData = useMemo(() => {
    if (!rawTrendList.length) return null;

    const priceMap = new Map<string, { price: number; rate: number }>();
    [...data.volume, ...data.amount, ...data.rise, ...data.fall].forEach(
      (item) => {
        priceMap.set(item.name, {
          price: item.price,
          rate: item.percent,
        });
      }
    );

    const buyData: TrendData = { foreign: [], institute: [], retail: [] };
    const sellData: TrendData = { foreign: [], institute: [], retail: [] };

    rawTrendList.forEach((stock) => {
      const liveInfo = priceMap.get(stock.stockName);

      stock.investors.forEach((inv: any) => {
        const target =
          inv.type === "외국인"
            ? "foreign"
            : inv.type === "기관"
            ? "institute"
            : "retail";

        const item: InvestorData = {
          name: stock.stockName ?? "알 수 없음",
          price: liveInfo?.price ?? 0,
          rate: liveInfo?.rate ?? 0,
          amount: Math.abs(inv.netBuyAmount ?? 0) / 1_0000_0000,
          volume: Math.abs(inv.netBuyQty ?? 0),
        };

        if (inv.netBuyAmount > 0) {
          buyData[target].push(item);
        } else if (inv.netBuyAmount < 0) {
          sellData[target].push(item);
        }
      });
    });

    return { buy: buyData, sell: sellData };
  }, [rawTrendList, data]);

  /* ---------------- 로딩 / 에러 ---------------- */
  if (loading) {
    return (
      <Typography sx={{ color: "#b5b5c5", textAlign: "center", py: 4 }}>
        투자자 동향 데이터를 불러오는 중입니다…
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: "#ff4d6a", textAlign: "center", py: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Card sx={{ bgcolor: "#1a1a24", border: "1px solid #2a2a35" }}>
      {/* 🔹 상단: 순매수 / 순매도 */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 1,
          borderBottom: "1px solid #2a2a35",
          bgcolor: "#0f0f15",
        }}
      >
        {(["buy", "sell"] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            variant={tab === t ? "contained" : "text"}
            sx={{
              px: 2,
              py: 0.8,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#ffffff",
              ...(tab === t && {
                bgcolor: "#7c3aed",
                "&:hover": { bgcolor: "#6d28d9" },
              }),
              ...(tab !== t && {
                opacity: 0.85,
                "&:hover": { bgcolor: "#232332", opacity: 1 },
              }),
            }}
          >
            {t === "buy" ? "순매수" : "순매도"}
          </Button>
        ))}
      </Stack>

      {/* 🔹 3컬럼 레이아웃 */}
      {processedData && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2,
            p: 3,
          }}
        >
          <InvestorSection
            title="외국인"
            data={processedData[tab].foreign}
            tab={tab}
          />

          <InvestorSection
            title="기관"
            data={processedData[tab].institute}
            tab={tab}
          />

          <InvestorSection
            title="개인"
            data={processedData[tab].retail}
            tab={tab}
          />
        </Box>
      )}
    </Card>
  );
}
