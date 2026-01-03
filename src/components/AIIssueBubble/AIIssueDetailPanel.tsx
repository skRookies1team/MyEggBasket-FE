import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
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

/* ================= 상수 ================= */
const PANEL_HEIGHT = 720;
const NODES_PER_PAGE = 3;
const STOCKS_PER_NODE = 4;

/* ================= 컴포넌트 ================= */
export default function AIIssueDetailPanel({ bubble, bubbles = [] }: Props) {
  const navigate = useNavigate();

  /* ---------------- 대표 이슈 선택 ---------------- */
  const sortedByMention = useMemo(
    () => [...bubbles].sort((a, b) => b.mentions - a.mentions),
    [bubbles]
  );

  const activeBubble = bubble ?? sortedByMention[0] ?? null;

  /* ---------------- 상태 ---------------- */
  const [valueChain, setValueChain] = useState<ValueChainNode[]>([]);
  const [panelPage, setPanelPage] = useState(1);

  /* ---------------- issue → sector → value_chain 매핑 ---------------- */
  useEffect(() => {
    if (!activeBubble) {
      setValueChain([]);
      return;
    }

    Promise.all([
      fetch("/data/issue_sector_map.json").then((r) => r.json()),
      fetch("/data/value_chain.json").then((r) => r.json()),
    ])
      .then(
        ([issueMap, valueChainData]: [
          Record<string, string[]>,
          ValueChainNode[]
        ]) => {
          const keywords = issueMap[activeBubble.name] ?? [];

          const filtered = valueChainData.filter((node) => {
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

          setValueChain(filtered);
          setPanelPage(1);
        }
      )
      .catch(() => setValueChain([]));
  }, [activeBubble]);

  /* ---------------- 페이지네이션 계산 ---------------- */
  const totalPanelPages = Math.ceil(valueChain.length / NODES_PER_PAGE);

  const pagedValueChain = useMemo(() => {
    const start = (panelPage - 1) * NODES_PER_PAGE;
    const end = start + NODES_PER_PAGE;
    return valueChain.slice(start, end);
  }, [valueChain, panelPage]);

  /* ---------------- 더미 검색 추이 ---------------- */
  const searchTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  if (!activeBubble) return null;

  return (
    <Card
      sx={{
        bgcolor: "#1a1a24",
        border: "1px solid #2a2a35",
        height: PANEL_HEIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "visible", // 🔥 레이블 잘림 방지
        }}
      >
        {/* 타이틀 */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#ffffff", mb: 1 }}
        >
          <span style={{ color: "#7c3aed" }}>{activeBubble.name}</span> 상세 분석
        </Typography>

        <Divider sx={{ borderColor: "#2a2a35", mb: 2 }} />

        {/* 검색 추이 */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
            검색 빈도 추이
          </Typography>

          <Box sx={{ height: 150 }}>
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

        {/* 밸류체인 영역 */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
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
                    lineHeight: 1.4,
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
                      onClick={() => navigate(`/stock/${stock.code}`)} // ✅ navigate 복구
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
                          color: "#ffffff",
                          lineHeight: 1.4,
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
      </CardContent>

      {/* 페이지네이션 */}
      {totalPanelPages > 1 && (
        <Box
          sx={{
            py: 1,
            borderTop: "1px solid #2a2a35",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pagination
            size="small"
            count={totalPanelPages}
            page={panelPage}
            onChange={(_, v) => setPanelPage(v)}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#b5b5c5",
              },
              "& .Mui-selected": {
                bgcolor: "#7c3aed !important",
                color: "#ffffff",
              },
            }}
          />
        </Box>
      )}
    </Card>
  );
}
