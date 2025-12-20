import { useState } from "react";
import type { Holding } from "../../types/portfolios";

interface PortfolioStockListProps {
  stocks?: Holding[] | null;
  title?: string;
}

export function PortfolioStockList({
  stocks,
  title = "보유 종목 상세",
}: PortfolioStockListProps) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  if (!stocks || stocks.length === 0) {
    return null;
  }

  const toggleExpand = (code: string) => {
    setExpandedCode(prev => (prev === code ? null : code));
  };

  return (
    <div
      style={{
        marginTop: "24px",
        borderTop: "1px solid #d9d9d9",
        paddingTop: "24px",
      }}
    >
      <h3 className="section-title" style={{ marginBottom: "16px" }}>
        {title}
      </h3>

      {stocks.map((holding) => {
        const isExpanded = expandedCode === holding.stock.stockCode; // stock.stockCode로 접근

        return (
            <div key={holding.stock.stockCode} className="stock-card">
              <div
                  onClick={() => toggleExpand(holding.stock.stockCode)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div>
                <strong>{holding.stock.name}</strong> {/* stockName 대신 stock.name */}
                <span style={{ marginLeft: 8, color: "#888" }}>
                  {holding.stock.stockCode}
                </span>
              </div>

              <div>
                {isExpanded ? "▲" : "▼"}
              </div>
            </div>

            {/* === 상세 영역 === */}
            {isExpanded && (
              <div
                className="stock-detail"
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  background: "#fafafa",
                  borderRadius: "6px",
                }}
              >
                <div>보유 수량: {holding.quantity}주</div>
                <div>평균 단가: {holding.avgPrice.toLocaleString()}원</div>
                <div>평가 금액: {(holding.quantity * holding.avgPrice).toLocaleString()}원</div>
                <div
                  style={{
                    color: holding.profitRate >= 0 ? "#d4380d" : "#00e676",
                  }}
                >
                  수익률: {(holding.profitRate * 100).toFixed(2)}%
                </div>

                {/* 🔜 여기 아래에 AI 리밸런싱 정보 붙이기 좋음 */}
                {/* <AIRebalancingBadge /> */}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
