import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Divider,
  Pagination,
} from "@mui/material";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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

interface ValueChainStock {
  name: string;
  code: string;
}

interface ValueChainNode {
  sector: string;
  stage1?: string;
  stage2?: string;
  stage3?: string;
  stocks: ValueChainStock[];
}

/* ---- 트렌드 JSON 타입 ---- */
interface DailyItem {
  name: string;
  count: number;
}

interface DailyTrend {
  date: string;
  total: number;
  items: DailyItem[];
}

interface TrendResponse {
  period: string;
  period_start: string;
  period_end: string;
  daily_items: DailyTrend[];
}

/* ================= 상수 ================= */
const PANEL_HEIGHT = 720;
const HEADER_HEIGHT = 64;
const PAGINATION_HEIGHT = 48;

const NODES_PER_PAGE = 3;
const STOCKS_PER_NODE = 4;

/* ================= 컴포넌트 ================= */
export default function AIIssueDetailPanel({ bubble, bubbles = [] }: Props) {
  const navigate = useNavigate();

  /* ---------------- 대표 이슈 ---------------- */
  const activeBubble = useMemo(() => {
    if (bubble) return bubble;
    if (!bubbles.length) return null;
    return [...bubbles].sort((a, b) => b.mentions - a.mentions)[0];
  }, [bubble, bubbles]);

  /* ---------------- 원본 데이터 ---------------- */
  const [issueMap, setIssueMap] = useState<Record<string, string[]> | null>(null);
  const [valueChainData, setValueChainData] = useState<ValueChainNode[]>([]);
  const [trendData, setTrendData] = useState<TrendResponse | null>(null);
  const [panelPage, setPanelPage] = useState(1);

  /* ---------------- 외부 데이터 fetch ---------------- */
  useEffect(() => {
    fetch("/data/daily_items_3_months.json")
      .then((r) => r.json())
      .then(setTrendData)
      .catch(() => setTrendData(null));

    Promise.all([
      fetch("/data/issue_sector_map.json").then((r) => r.json()),
      fetch("/data/value_chain.json").then((r) => r.json()),
    ])
      .then(([issueMapRes, valueChainRes]) => {
        setIssueMap(issueMapRes);
        setValueChainData(valueChainRes);
      })
      .catch(() => {
        setIssueMap(null);
        setValueChainData([]);
      });
  }, []);

  /* ---------------- 파생 데이터 ---------------- */
  const valueChain = useMemo(() => {
    if (!activeBubble || !issueMap) return [];

    const keywords = issueMap[activeBubble.name] ?? [];

    return valueChainData.filter((node) => {
      const fields = [
        node.sector,
        node.stage1,
        node.stage2,
        node.stage3,
      ].filter(Boolean) as string[];

      return keywords.some((kw) =>
        fields.some((f) => f.includes(kw))
      );
    });
  }, [activeBubble, issueMap, valueChainData]);

  const totalPanelPages = Math.ceil(valueChain.length / NODES_PER_PAGE);

  const pagedValueChain = useMemo(() => {
    const start = (panelPage - 1) * NODES_PER_PAGE;
    return valueChain.slice(start, start + NODES_PER_PAGE);
  }, [valueChain, panelPage]);

  const searchTrend = useMemo(() => {
    if (!trendData || !activeBubble) return [];

    return trendData.daily_items.map((day) => {
      const found = day.items.find(
        (item) => item.name === activeBubble.name
      );
      return { date: day.date, value: found?.count ?? 0 };
    });
  }, [trendData, activeBubble]);

  if (!activeBubble) return null;

  return (
    <Card
      sx={{
        height: PANEL_HEIGHT,
        bgcolor: "#1a1a24",
        border: "1px solid #2a2a35",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ===== Header ===== */}
      <Box sx={{ px: 3, py: 2, height: HEADER_HEIGHT }}>
        <Typography sx={{ fontWeight: 700, color: "#fff" }}>
          <span style={{ color: "#7c3aed" }}>{activeBubble.name}</span> 상세 분석
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#2a2a35" }} />

      {/* ===== Scroll Area ===== */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 2,
        }}
      >
        {/* 검색 추이 */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
            검색 빈도 추이
          </Typography>

          <Box sx={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={searchTrend}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#b5b5c5" }}
                  tickFormatter={(v) => v.slice(5)}
                />
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

        {/* 밸류체인 */}
        <Typography sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
          관련 주식
        </Typography>

        {pagedValueChain.map((node, idx) => {
          const stageLabel =
            node.stage3 || node.stage2 || node.stage1 || "기타";

          return (
            <Box key={`${node.sector}-${idx}`} sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#7c3aed",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {node.sector} · {stageLabel}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1,
                }}
              >
                {node.stocks.slice(0, STOCKS_PER_NODE).map((stock) => (
                  <Box
                    key={stock.code}
                    onClick={() => navigate(`/stock/${stock.code}`)}
                    sx={{
                      px: 1.2,
                      py: 0.8,
                      bgcolor: "#232332",
                      border: "1px solid #2a2a35",
                      borderRadius: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#2a2a3d" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {stock.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ===== Pagination (고정) ===== */}
      {totalPanelPages > 1 && (
        <Box
          sx={{
            height: PAGINATION_HEIGHT,
            borderTop: "1px solid #2a2a35",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pagination
            size="small"
            count={totalPanelPages}
            page={panelPage}
            onChange={(_, v) => setPanelPage(v)}
            sx={{
              "& .MuiPaginationItem-root": { color: "#b5b5c5" },
              "& .Mui-selected": {
                bgcolor: "#7c3aed !important",
                color: "#fff",
              },
            }}
          />
        </Box>
      )}
    </Card>
  );
}
