import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
} from "@mui/material";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Papa from "papaparse";

/* ================= 타입 ================= */
interface BubbleItem {
  name: string;
  size: number;
  mentions: number;
  change: number;
  color: string;
}

interface Props {
  bubble: BubbleItem | null;
  bubbles?: BubbleItem[];
}

interface ValueChainRow {
  sector: string;
  stage1?: string;
  stage2?: string;
  stage3?: string;
  stockCode: string;
}

interface ValueChainStock {
  sector: string;
  stage: string;
  stockName: string;
  stockCode: string;
}

/* ================= 유틸 ================= */

/** 🔥 sector 문자열 정규화 (NBSP, 공백, 줄바꿈 제거) */
function normalizeSector(value?: string) {
  return value
    ?.replace(/\u00A0/g, " ") // NBSP 제거
    ?.replace(/\s+/g, " ")   // 연속 공백 제거
    ?.trim();
}

function parseStockCodes(
  raw: string,
  sector: string,
  stage: string
): ValueChainStock[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => {
      const match = item.trim().match(/(.+?)\s*\((\d+)\)/);
      if (!match) return null;

      return {
        sector,
        stage,
        stockName: match[1].trim(),
        stockCode: match[2],
      };
    })
    .filter(Boolean) as ValueChainStock[];
}

function groupBySector(stocks: ValueChainStock[]) {
  return stocks.reduce<Record<string, ValueChainStock[]>>((acc, stock) => {
    if (!acc[stock.sector]) acc[stock.sector] = [];
    acc[stock.sector].push(stock);
    return acc;
  }, {});
}

/* ================= 컴포넌트 ================= */
export default function AIIssueDetailPanel({ bubble, bubbles = [] }: Props) {
  /* ---------------- 대표 이슈 선택 ---------------- */
  const sortedByMention = [...bubbles].sort(
    (a, b) => b.mentions - a.mentions
  );
  const activeBubble = bubble ?? sortedByMention[0] ?? null;

  /* ---------------- 상태 ---------------- */
  const [matchedSectors, setMatchedSectors] = useState<string[]>([]);
  const [valueChainStocks, setValueChainStocks] = useState<ValueChainStock[]>([]);

  /* ---------------- issue → sector 매핑 ---------------- */
  useEffect(() => {
    if (!activeBubble) return;

    fetch("/data/issue_sector_map.json")
      .then((res) => res.json())
      .then((map: Record<string, string[]>) => {
        const sectors = map[activeBubble.name] ?? [];
        setMatchedSectors(sectors.map(normalizeSector).filter(Boolean) as string[]);
      })
      .catch(() => setMatchedSectors([]));
  }, [activeBubble]);

  /* ---------------- CSV 로딩 + 정규화 필터 ---------------- */
  useEffect(() => {
    if (!activeBubble || matchedSectors.length === 0) {
      setValueChainStocks([]);
      return;
    }

    Papa.parse<ValueChainRow>("/data/value_chain.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.filter((row) =>
          matchedSectors.includes(normalizeSector(row.sector))
        );

        const parsed = rows.flatMap((row) => {
          const stage =
            row.stage3 || row.stage2 || row.stage1 || "기타";

          return parseStockCodes(
            row.stockCode,
            normalizeSector(row.sector)!,
            stage
          );
        });

        setValueChainStocks(parsed);
      },
    });
  }, [activeBubble, matchedSectors]);

  /* ---------------- 예외 처리 ---------------- */
  if (!activeBubble) {
    return (
      <Card sx={{ bgcolor: "#1a1a24", border: "1px solid #2a2a35", p: 4 }}>
        <Typography sx={{ color: "#b5b5c5", textAlign: "center" }}>
          표시할 AI 이슈 데이터가 없습니다.
        </Typography>
      </Card>
    );
  }

  const groupedBySector = groupBySector(valueChainStocks);

  /* ---------------- 더미 데이터 ---------------- */
  const searchTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  const newsSamples = [
    `${activeBubble.name} 관련 이슈가 증가하고 있습니다.`,
    `${activeBubble.name} 업계에서 새로운 동향이 감지됨.`,
    `${activeBubble.name} 기업 실적 발표 예정.`,
  ];

  return (
    <Card sx={{ bgcolor: "#1a1a24", border: "1px solid #2a2a35" }}>
      <CardContent sx={{ p: 3 }}>
        {/* 타이틀 */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffffff", mb: 1 }}>
          <span style={{ color: "#7c3aed" }}>{activeBubble.name}</span> 상세 분석
        </Typography>

        <Divider sx={{ borderColor: "#2a2a35", mb: 3 }} />

        {/* 검색 추이 */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
            검색 빈도 추이
          </Typography>

          <Box sx={{ width: "100%", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={searchTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#b5b5c5" }} />
                <YAxis tick={{ fontSize: 10, fill: "#b5b5c5" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#232332",
                    border: "1px solid #2a2a35",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* 밸류체인 관련 주식 */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
            관련 주식
          </Typography>

          {matchedSectors.length === 0 ? (
            <Typography sx={{ color: "#777", fontSize: "0.85rem" }}>
              해당 이슈는 산업 밸류체인 분석 대상이 아닙니다.
            </Typography>
          ) : Object.keys(groupedBySector).length === 0 ? (
            <Typography sx={{ color: "#777", fontSize: "0.85rem" }}>
              밸류체인 종목 정보가 없습니다.
            </Typography>
          ) : (
            Object.entries(groupedBySector).map(([sector, stocks]) => (
              <Box key={sector} sx={{ mb: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "#7c3aed",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {sector}
                </Typography>

                <List dense>
                  {stocks.map((stock, i) => (
                    <ListItem
                      key={i}
                      sx={{
                        px: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        "&:hover": { color: "#fff" },
                      }}
                      onClick={() =>
                        (window.location.href = `/stock/${stock.stockCode}`)
                      }
                    >
                      <span>
                        <b style={{ color: "#fff" }}>{stock.stockName}</b>
                        <span style={{ marginLeft: 6, color: "#777" }}>
                          · {stock.stage}
                        </span>
                      </span>

                      <span style={{ fontSize: "0.75rem", color: "#7c3aed" }}>
                        {stock.stockCode}
                      </span>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))
          )}
        </Box>

        {/* 관련 뉴스 */}
        <Box>
          <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
            관련 뉴스
          </Typography>

          <List dense>
            {newsSamples.map((n, i) => (
              <ListItem
                key={i}
                sx={{ color: "#b5b5c5", fontSize: "0.85rem", pl: 0 }}
              >
                • {n}
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
}
