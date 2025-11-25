import type { StockItem } from "../../types/Stock";
import "../../assets/LiveStock/LiveStockTable.css";

interface Props {
  stocks: StockItem[];
}

export default function LiveStockTable({ stocks }: Props) {
  return (
    <div className="stock-table">
      <div className="table-header">
        <span>종목명</span>
        <span>현재가</span>
        <span>등락률</span>
        <span>거래대금</span>
        <span>거래량</span>
      </div>

      <div className="table-body">
        {stocks.map((s) => (
          <div className="table-row" key={s.code}>
            <span className="name">
              {s.name}
              <div className="code">{s.code}</div>
            </span>

            <span>{s.price.toLocaleString()}</span>

            <span className={s.percent > 0 ? "up" : s.percent < 0 ? "down" : ""}>
              {s.percent > 0 ? "+" : ""}
              {s.percent.toFixed(2)}%
            </span>

            <span>{s.amount.toLocaleString()}</span>

            <span>{s.volume.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
