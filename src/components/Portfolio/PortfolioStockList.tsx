import { useState } from "react";
import type { Holding } from "../../types/portfolios";
import type { stock } from "../../types/stock";

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

      {stocks.map(stock => {
        const isExpanded = expandedCode === stock.stockCode;

        return (
          <div key={stock.stockCode} className="stock-card">
            {/* === 요약 영역 === */}
            <div
              className="stock-summary"
              onClick={() => toggleExpand(stock.stockCode)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div>
                <strong>{stock.stockName}</strong>
                <span style={{ marginLeft: 8, color: "#888" }}>
                  {stock.stockCode}
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
                <div>보유 수량: {stock.quantity}주</div>
                <div>평균 단가: {stock.avgPrice.toLocaleString()}원</div>
                <div>평가 금액: {stock.evalAmount.toLocaleString()}원</div>
                <div
                  style={{
                    color: stock.profitRate >= 0 ? "#d4380d" : "#00e676",
                  }}
                >
                  수익률: {(stock.profitRate * 100).toFixed(2)}%
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
