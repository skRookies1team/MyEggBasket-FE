import React from "react";
import "../../assets/AIIssueBubble/AIIssueBubbleCircular.css";

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

  // 1) mentions 기준으로 내림차순 정렬
  const sorted = [...bubbles].sort((a, b) => b.mentions - a.mentions);

  // 2) 중심 버블 = mentions 가장 큰 항목
  const centerBubble = sorted[0];

  // 3) 주변 버블 = 나머지 항목들
  const others = sorted.slice(1);

  const count = others.length;
  const radiusPercent = 38; // 원둘레로 퍼지는 정도

  return (
    <div className="bubble-container">

      {/* ===== 중앙 버블 ===== */}
      <div
        className="bubble-item center-bubble"
        style={{
          width: centerBubble.size * 1.15, // 중앙 강조 효과
          height: centerBubble.size * 1.15,
          backgroundColor: centerBubble.color,
          left: "50%",
          top: "50%",
        }}
        onClick={() => onSelect?.(centerBubble)}
      >
        <p className="bubble-name">{centerBubble.name}</p>
        <p className="bubble-mentions">
          {centerBubble.mentions.toLocaleString()}건
        </p>
        <p
          className={`bubble-change ${centerBubble.change >= 0 ? "up" : "down"}`}
        >
          {centerBubble.change > 0 ? "+" : ""}
          {centerBubble.change}%
        </p>
      </div>

      {/* ===== 주변 버블들 (원형 균등 배치) ===== */}
      {others.map((item, idx) => {
        const angle = (2 * Math.PI * idx) / count;

        // 버블 크기 고려하여 여유 공간 자동 조절
        const dynamicRadius =
          radiusPercent + item.size * 0.1; // 겹침 자동 보정

        const left = 50 + dynamicRadius * Math.cos(angle);
        const top = 50 + dynamicRadius * Math.sin(angle);

        return (
          <div
            key={idx}
            className="bubble-item"
            style={{
              width: item.size,
              height: item.size,
              backgroundColor: item.color,
              left: `${left}%`,
              top: `${top}%`,
            }}
            onClick={() => onSelect?.(item)}
          >
            <p className="bubble-name">{item.name}</p>
            <p className="bubble-mentions">
              {item.mentions.toLocaleString()}건
            </p>
            <p
              className={`bubble-change ${item.change >= 0 ? "up" : "down"}`}
            >
              {item.change > 0 ? "+" : ""}
              {item.change}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
