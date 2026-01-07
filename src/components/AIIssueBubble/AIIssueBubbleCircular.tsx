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

    // [핵심] 원 사이 간격을 음수로 설정하여 겹침 허용
    // 값이 작을수록(더 음수일수록) 더 많이 겹칩니다.
    const padding = -2;

    // 1. 초기 위치 설정 (중앙에 아주 밀집시켜 시작)
    let nodes = bubbles.map((item) => ({
      ...item,
      x: 50 + (Math.random() - 0.5) * 5, // 중앙 분산 범위 축소
      y: 50 + (Math.random() - 0.5) * 5,
      // 반지름 계산 (컨테이너 400px 기준 비율)
      r: (item.size / 400) * 50,
    }));

    // 2. 물리 시뮬레이션
    const iterations = 300;
    // [핵심] 중앙으로 당기는 힘(중력) 강화 -> 옹기종기 모임
    const gravity = 0.1;

    for (let i = 0; i < iterations; i++) {
      // 모든 노드를 중앙(50, 50)으로 당김
      nodes.forEach(node => {
        node.x += (50 - node.x) * gravity;
        node.y += (50 - node.y) * gravity;
      });

      // 충돌(겹침) 해결
      for (let j = 0; j < nodes.length; j++) {
        const nodeA = nodes[j];

        for (let k = j + 1; k < nodes.length; k++) {
          const nodeB = nodes[k];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // padding이 음수이므로, 두 원이 살짝 겹쳐도(minDistance보다 작아도) 밀어내지 않음
          const minDistance = nodeA.r + nodeB.r + padding;

          // 너무 많이 겹쳤을 때만 밀어냄
          if (distance < minDistance) {
            const overlap = minDistance - distance;
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
                    // 투명도를 살짝 주어 겹친 부분이 보이게 할 수도 있음 (선택 사항)
                    opacity: 0.9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: `0 0 20px ${item.color}44`,
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    zIndex: 1,
                    "&:hover": {
                      transform: "translate(-50%, -50%) scale(1.15)",
                      boxShadow: `0 0 30px ${item.color}88`,
                      zIndex: 10, // 호버 시 맨 위로
                      opacity: 1,
                    },
                  }}
              >
                <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      // 글자가 원 밖으로 나가지 않도록 사이즈 조절
                      fontSize: item.size < 60 ? "0.6rem" : item.size < 80 ? "0.75rem" : "0.9rem",
                      textAlign: "center",
                      px: 0.5,
                      lineHeight: 1.1,
                      wordBreak: "keep-all",
                      textShadow: "0px 1px 3px rgba(0,0,0,0.8)", // 글자 가독성 위해 그림자 강화
                      userSelect: "none",
                      pointerEvents: "none", // 클릭 이벤트가 Box로 전달되도록
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