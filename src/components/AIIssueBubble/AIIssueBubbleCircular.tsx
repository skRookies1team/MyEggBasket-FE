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

  const processedBubbles = useMemo(() => {
    const width = 100; // % 기준
    const height = 100; // % 기준
    const padding = 2; // 원 사이의 최소 간격 (%)

    // 1. 초기 위치 설정 (중앙 부근에 모아서 시작)
    let nodes = bubbles.map((item) => ({
      ...item,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      r: (item.size / 400) * 50, // 컨테이너 높이 400px 기준 반지름 % 환산
    }));

    // 2. 물리 시뮬레이션 (300회 반복하여 겹침 해소)
    for (let i = 0; i < 300; i++) {
      for (let j = 0; j < nodes.length; j++) {
        const nodeA = nodes[j];
        
        for (let k = j + 1; k < nodes.length; k++) {
          const nodeB = nodes[k];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = nodeA.r + nodeB.r + padding;

          // 두 원이 겹쳤다면 밀어내기
          if (distance < minDistance) {
            const overlap = minDistance - distance;
            // 밀어낼 방향 벡터 (거리 0 방지)
            const nx = dx / (distance || 1);
            const ny = dy / (distance || 1);
            
            // 반반씩 서로 반대 방향으로 밀어냄
            const moveX = nx * overlap * 0.5;
            const moveY = ny * overlap * 0.5;

            nodeA.x -= moveX;
            nodeA.y -= moveY;
            nodeB.x += moveX;
            nodeB.y += moveY;
          }
        }

        // 컨테이너 경계선 밖으로 나가지 않게 고정
        nodeA.x = Math.max(nodeA.r, Math.min(width - nodeA.r, nodeA.x));
        nodeA.y = Math.max(nodeA.r, Math.min(height - nodeA.r, nodeA.y));
      }
    }

    return nodes;
  }, [bubbles]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 400,
        bgcolor: "#0f0f15",
        border: "1px solid #2a2a35",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {processedBubbles.map((item) => (
        <Tooltip
          key={item.name}
          title={`검색량: ${item.mentions.toLocaleString()}`}
          arrow
        >
          <Box
            onClick={() => onSelect?.(item)}
            sx={{
              position: "absolute",
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: item.size,
              height: item.size,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              bgcolor: item.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: `0 0 20px ${item.color}44`,
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              zIndex: 1,
              "&:hover": {
                transform: "translate(-50%, -50%) scale(1.1)",
                boxShadow: `0 0 30px ${item.color}88`,
                zIndex: 10,
              },
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 600,
                fontSize: item.size < 75 ? "0.65rem" : "0.8rem",
                textAlign: "center",
                px: 0.5,
                wordBreak: "keep-all",
                textShadow: "0px 1px 2px rgba(0,0,0,0.6)",
                userSelect: "none",
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