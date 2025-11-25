import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "../../assets/AIIssueBubble/AIIssueDetailPanel.css";

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

  // mentions 기준 정렬
  const sortedByMention = [...bubbles].sort((a, b) => b.mentions - a.mentions);

  // 🔥 props.bubble이 null이면 내부에서 즉시 재정의 (초기 null 화면 방지)
  const safeBubble = bubble ?? sortedByMention[0] ?? null;

  if (!safeBubble) {
    return (
      <div className="empty-panel">
        <p>표시할 버블 데이터가 없습니다.</p>
      </div>
    );
  }

  const activeBubble = safeBubble;
  // 🔹 더미 검색 추이 데이터
  const searchTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  // 🔹 더미 등락률 데이터
  const priceTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}`,
    change: Number((Math.sin(i / 3) * 5 + Math.random() * 2).toFixed(2)),
  }));

  // 🔹 관련 뉴스 더미
  const newsSamples = [
    `${activeBubble.name} 관련 이슈가 증가하고 있습니다.`,
    `${activeBubble.name} 업계에서 새로운 동향이 감지됨.`,
    `${activeBubble.name} 기업 실적 발표 예정.`,
  ];

  return (
    <div className="detail-panel">
      <h2 className="panel-title">
        <span style={{ color: "#ff8a8a" }}>{activeBubble.name}</span>
        &nbsp;상세 분석
      </h2>

      {/* 검색 추이 */}
      <div className="panel-section">
        <h3>검색 빈도 추이</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={searchTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f378a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 등락률 추이 */}
      <div className="panel-section">
        <h3>누적 등락률 추이</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={priceTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="change"
                stroke="#ff383c"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 관련 뉴스 */}
      <div className="panel-section">
        <h3>관련 뉴스</h3>
        <ul className="news-list">
          {newsSamples.map((n, i) => (
            <li key={i} className="news-item">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
