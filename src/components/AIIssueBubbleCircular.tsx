import React from "react";
import "../assets/AIIssueBubbleCircular.css";

interface BubbleItem {
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
  return (
    <div className="bubble-container">
      {bubbles.map((item, idx) => (
        <div
          key={idx}
          className="bubble-item"
          style={{
            width: item.size,
            height: item.size,
            backgroundColor: item.color,
          }}
          onClick={() => onSelect?.(item)}   // 🔥 핵심
        >
          <p className="bubble-name">{item.name}</p>
          <p className="bubble-mentions">{item.mentions.toLocaleString()}건</p>
          <p className={`bubble-change ${item.change >= 0 ? "up" : "down"}`}>
            {item.change > 0 ? "+" : ""}
            {item.change}%
          </p>
        </div>
      ))}
    </div>
  );
}
