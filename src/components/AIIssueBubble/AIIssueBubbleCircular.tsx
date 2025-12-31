import { Box, Typography, Tooltip } from "@mui/material";
import { useMemo } from "react";

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

  /* ---------------- 데이터 정렬 및 고정 ---------------- */
  const { centerBubble, otherBubbles } = useMemo(() => {
    const sorted = [...bubbles].sort((a, b) => b.mentions - a.mentions);
    const center = sorted[0];
    const others = sorted.slice(1);

    // 1. 가상의 그리드 구역 설정 (8개 구역)
    // 중심을 제외한 주변을 8등분하여 각 영역에 버블을 하나씩 할당
    const othersWithPos = others.map((item, idx) => {
      // 8등분 각도 (0, 45, 90, 135...)
      const sectorAngle = (2 * Math.PI * idx) / others.length;

      // 2. 각 구역 내에서 랜덤 오차 부여 (너무 일직선이 되지 않게)
      const randomOffset = (Math.random() - 0.5) * 0.6;
      const finalAngle = sectorAngle + randomOffset;

      // 3. 거리 분산 (안쪽 원들과 겹치지 않게 최소 거리를 확보)
      // 큰 버블일수록 조금 더 바깥쪽으로 밀어내는 가중치 부여
      const sizeWeight = item.size / 150;
      const minDistance = 25 + (sizeWeight * 10); // 최소 거리 보장
      const distance = minDistance + Math.random() * 15;

      // 4. 좌표 계산
      let left = 50 + distance * Math.cos(finalAngle);
      let top = 50 + distance * Math.sin(finalAngle);

      // 5. 화면 경계값 보정 (컨테이너 밖으로 나가지 않게)
      left = Math.max(10, Math.min(90, left));
      top = Math.max(15, Math.min(85, top));

      return {
        ...item,
        left,
        top,
        zIndex: Math.floor(Math.random() * 10) + 1,
      };
    });

    return { centerBubble: center, otherBubbles: othersWithPos };
  }, [bubbles]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 360,
        bgcolor: "#0f0f15",
        border: "1px solid #2a2a35",
        borderRadius: 2,
        overflow: "hidden", // 버블이 컨테이너 밖으로 나가지 않게 처리
      }}
    >
      {/* ===================== */}
      {/* 중앙 버블 (가장 큰 이슈) */}
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
            zIndex: 20, // 항상 중앙이 위로 오도록
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
      {/* 주변 버블 (산발적 배치) */}
      {/* ===================== */}
      {otherBubbles.map((item) => (
        <Tooltip
          key={item.name}
          title={`검색량: ${item.mentions.toLocaleString()} · 등락률: ${item.change}%`}
          arrow
        >
          <Box
            onClick={() => onSelect?.(item)}
            sx={{
              position: "absolute",
              left: `${item.left}%`,
              top: `${item.top}%`,
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
              transition: "all 0.3s ease-out",
              zIndex: item.zIndex,
              "&:hover": {
                transform: "translate(-50%, -50%) scale(1.1)",
                boxShadow: `0 0 28px ${item.color}aa`,
                zIndex: 30, // 호버 시에는 가장 앞으로
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
                wordBreak: "keep-all",
              }}
            >
              {item.name}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}