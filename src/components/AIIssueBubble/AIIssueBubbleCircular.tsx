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

  const sorted = [...bubbles].sort((a, b) => b.mentions - a.mentions);
  const centerBubble = sorted[0];
  const others = sorted.slice(1);

  const count = others.length;
  const radiusPercent = 38;

  return (
    <div className="bubble-modern-container">

      {/* 중앙 버블 */}
      <div
        className="bubble-item modern-center"
        style={{
          ["--bubble-size" as any]: `${centerBubble.size * 1.2}px`,
          ["--bubble-color" as any]: centerBubble.color,
        }}
        title={`검색량: ${centerBubble.mentions.toLocaleString()}
등락률: ${centerBubble.change}%`}
        onClick={() => onSelect?.(centerBubble)}
      >
        <p className="bubble-label">{centerBubble.name}</p>
      </div>

      {/* 주변 버블 */}
      {others.map((item, idx) => {
        const angle = (2 * Math.PI * idx) / count;
        const dynamicRadius = radiusPercent + item.size * 0.08;
        const left = 50 + dynamicRadius * Math.cos(angle);
        const top = 50 + dynamicRadius * Math.sin(angle);

        return (
          <div
            key={idx}
            className="bubble-item modern-bubble"
            style={{
              ["--bubble-size" as any]: `${item.size}px`,
              ["--bubble-color" as any]: item.color,
              ["--bubble-left" as any]: `${left}%`,
              ["--bubble-top" as any]: `${top}%`,
            }}
            title={`검색량: ${item.mentions.toLocaleString()}
등락률: ${item.change}%`}
            onClick={() => onSelect?.(item)}
          >
            <p className="bubble-label">{item.name}</p>
          </div>
        );
      })}
    </div>
  );
}
