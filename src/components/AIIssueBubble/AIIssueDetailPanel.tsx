import React from "react";
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

export default function AIIssueDetailPanel({ bubble, bubbles = [] }: Props) {
  /* ---------------- 안전한 버블 선택 ---------------- */
  const sortedByMention = [...bubbles].sort(
    (a, b) => b.mentions - a.mentions
  );
  const activeBubble = bubble ?? sortedByMention[0] ?? null;

  if (!activeBubble) {
    return (
      <Card
        sx={{
          bgcolor: "#1a1a24",
          border: "1px solid #2a2a35",
          p: 4,
        }}
      >
        <Typography sx={{ color: "#b5b5c5", textAlign: "center" }}>
          표시할 AI 이슈 데이터가 없습니다.
        </Typography>
      </Card>
    );
  }

  /* ---------------- 더미 데이터 ---------------- */
  const searchTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  const priceTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    change: Number((Math.sin(i / 3) * 5 + Math.random() * 2).toFixed(2)),
  }));

  const newsSamples = [
    `${activeBubble.name} 관련 이슈가 증가하고 있습니다.`,
    `${activeBubble.name} 업계에서 새로운 동향이 감지됨.`,
    `${activeBubble.name} 기업 실적 발표 예정.`,
  ];

  return (
    <Card
      sx={{
        bgcolor: "#1a1a24",
        border: "1px solid #2a2a35",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* 🔹 타이틀 */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffffff", mb: 1 }}>
          <span style={{ color: "#7c3aed" }}>{activeBubble.name}</span> 상세 분석
        </Typography>

        <Divider sx={{ borderColor: "#2a2a35", mb: 3 }} />

        {/* 🔹 검색 추이 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}
          >
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

        {/* 🔹 등락률 추이 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}
          >
            누적 등락률 추이
          </Typography>

          <Box sx={{ width: "100%", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrend}>
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
                  dataKey="change"
                  stroke="#ff4d6a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* 🔹 관련 뉴스 */}
        <Box>
          <Typography
            sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}
          >
            관련 뉴스
          </Typography>

          <List dense>
            {newsSamples.map((n, i) => (
              <ListItem
                key={i}
                sx={{
                  color: "#b5b5c5",
                  fontSize: "0.85rem",
                  pl: 0,
                }}
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
