import { Box, Typography, Tooltip } from "@mui/material";

export interface BubbleItem {
  name: string;
  size: number;
  mentions: number;
  change: number;
  color: string;
}

interface Props {
  bubbles: BubbleItem[];
  onSelect?: (item: BubbleItem) => void;
}

export default function AIIssueBubbleCircular({ bubbles, onSelect }: Props) {
  if (!bubbles || bubbles.length === 0) return null;

  /* ---------------- 데이터 정렬 ---------------- */
  const sorted = [...bubbles].sort((a, b) => b.mentions - a.mentions);
  const centerBubble = sorted[0];
  const others = sorted.slice(1);

  /* ---------------- 간격 파라미터 ---------------- */
  // 기본 반지름 (기존 38 → 30)
  const baseRadiusPercent = 15;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 360,
        bgcolor: "#0f0f15",
        border: "1px solid #2a2a35",
        borderRadius: 2,
      }}
    >
      {/* ===================== */}
      {/* 중앙 버블 */}
      {/* ===================== */}
      <Tooltip
        title={`검색량: ${centerBubble.mentions.toLocaleString()} · 등락률: ${centerBubble.change}%`}
        arrow
      >
        <Box
          onClick={() => onSelect?.(centerBubble)}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: centerBubble.size * 1.2,
            height: centerBubble.size * 1.2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            bgcolor: centerBubble.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 0 30px ${centerBubble.color}55`,
            transition: "all 0.25s ease",
            "&:hover": {
              transform: "translate(-50%, -50%) scale(1.05)",
              boxShadow: `0 0 40px ${centerBubble.color}aa`,
            },
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              textAlign: "center",
              fontSize: "0.95rem",
              px: 1,
            }}
          >
            {centerBubble.name}
          </Typography>
        </Box>
      </Tooltip>

      {/* ===================== */}
      {/* 주변 버블 */}
      {/* ===================== */}
      {others.map((item, idx) => {
        const angle = (2 * Math.PI * idx) / others.length;

        /**
         * 핵심 로직:
         * - baseRadiusPercent: 전체를 안쪽으로 끌어당김
         * - item.size / 2: 버블 반지름
         * - / 3.6: % 좌표계 보정값 (360px 컨테이너 기준)
         */
        const dynamicRadius =
          baseRadiusPercent + item.size / 2 / 3.6;

        const left = 50 + dynamicRadius * Math.cos(angle);
        const top = 50 + dynamicRadius * Math.sin(angle);

        return (
          <Tooltip
            key={item.name}
            title={`검색량: ${item.mentions.toLocaleString()} · 등락률: ${item.change}%`}
            arrow
          >
            <Box
              onClick={() => onSelect?.(item)}
              sx={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: item.size,
                height: item.size,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                bgcolor: item.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: `0 0 18px ${item.color}55`,
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translate(-50%, -50%) scale(1.1)",
                  boxShadow: `0 0 28px ${item.color}aa`,
                },
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textAlign: "center",
                  px: 0.5,
                }}
              >
                {item.name}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
