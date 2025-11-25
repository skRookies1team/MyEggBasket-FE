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
}

export default function AIIssueDetailPanel({ bubble }: Props) {
  if (!bubble) {
    return (
      <div className="empty-panel">
        <p>버블을 클릭하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }

  // 🔹 더미 검색 추이 데이터
  const searchTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}일`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  // 🔹 더미 등락률 데이터
  const priceTrend = Array.from({ length: 14 }).map((_, i) => ({
    day: `${i + 1}일`,
    change: (Math.sin(i / 3) * 5 + Math.random() * 2).toFixed(2),
  }));

  // 🔹 관련 뉴스 더미
  const newsSamples = [
    `${bubble.name} 관련 이슈가 증가하고 있습니다.`,
    `${bubble.name} 업계에서 새로운 동향이 감지됨.`,
    `${bubble.name} 기업 실적 발표 예정.`,
  ];

  return (
    <div className="detail-panel">
      <h2 className="panel-title">{bubble.name} 상세 분석</h2>

      <div className="panel-section">
        <h3> 검색 빈도 추이</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={searchTrend}>
              <XAxis dataKey="day" hide />
              <YAxis hide />
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

      <div className="panel-section">
        <h3> 누적 등락률 추이</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={priceTrend}>
              <XAxis dataKey="day" hide />
              <YAxis hide />
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

      <div className="panel-section">
        <h3> 관련 뉴스</h3>
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
