import { useEffect, useMemo, useState } from "react";
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

/* ================= 유틸 ================= */
const takeTop3 = <T,>(arr: T[]) => arr.slice(0, 3);

/* ================= 컴포넌트 ================= */
export default function AIIssueDetailPanel({ bubble, bubbles = [] }: Props) {
  /* ---------------- 대표 이슈 선택 ---------------- */
  const sortedByMention = useMemo(
    () => [...bubbles].sort((a, b) => b.mentions - a.mentions),
    [bubbles]
  );

  const activeBubble = bubble ?? sortedByMention[0] ?? null;

  /* ---------------- 상태 ---------------- */
  const [valueChain, setValueChain] = useState<ValueChainNode[]>([]);

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

          if (keywords.length === 0) {
            setValueChain([]);
            return;
          }

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
        }
      )
      .catch(() => setValueChain([]));
  }, [activeBubble]);

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

  /* ---------------- 더미 검색 추이 ---------------- */
  const searchTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

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

          <Box sx={{ width: "100%", height: 180, minHeight: 180 }}>
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
        <Box>
          <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
            관련 주식
          </Typography>

          {valueChain.length === 0 ? (
            <Typography sx={{ color: "#777", fontSize: "0.85rem" }}>
              해당 이슈는 산업 밸류체인 분석 대상이 아닙니다.
            </Typography>
          ) : (
            valueChain.map((node, idx) => {
              const stageLabel =
                node.stage3 || node.stage2 || node.stage1 || "기타";

              const stocksToShow = takeTop3(node.stocks);

              return (
                <Box
                  key={`${node.sector}-${node.stage1 ?? "n1"}-${node.stage2 ?? "n2"}-${node.stage3 ?? "n3"}-${idx}`}
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: "#7c3aed",
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {node.sector} · {stageLabel}
                  </Typography>

                  <List dense>
                    {stocksToShow.map((stock) => (
                      <ListItem
                        key={stock.code}
                        sx={{
                          px: 0,
                          display: "flex",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          "&:hover": { color: "#fff" },
                        }}
                        onClick={() =>
                          (window.location.href = `/stock/${stock.code}`)
                        }
                      >
                        <span>
                          <b style={{ color: "#fff" }}>{stock.name}</b>
                        </span>

                        <span style={{ fontSize: "0.75rem", color: "#7c3aed" }}>
                          {stock.code}
                        </span>
                      </ListItem>
                    ))}
                  </List>

                  {node.stocks.length > 3 && (
                    <Typography
                      sx={{ fontSize: "0.7rem", color: "#777", mt: 0.5 }}
                    >
                      + {node.stocks.length - 3}개 종목 더 있음
                    </Typography>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
