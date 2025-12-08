import { useState } from "react";
import LiveStockTabs from "../LiveStock/LiveStockTabs";
import LiveStockPeriodTabs from "../LiveStock/LiveStockPeriodTabs";
import LiveStockTable from "../LiveStock/LiveStockTable";
import type { StockItem } from "../../types/stock.ts";

interface Props {
  data: {
    volume: StockItem[];
    amount: StockItem[];
    rise: StockItem[];
    fall: StockItem[];
  };
  period: "day" | "week" | "month" | "year";
  onPeriodChange: (v: any) => void;
}

export default function LiveStockPanel({ data, period, onPeriodChange }: Props) {
  const [category, setCategory] = useState<"volume" | "amount" | "rise" | "fall">("volume"); 
 
 
  return (
    <div style={{ marginTop: "28px" }}>
      <h2 style={{ marginBottom: "12px" }}> 실시간 종목 주가</h2>

      {/* 1) 정렬 탭 */}
      <LiveStockTabs selected={category} onChange={setCategory} />

      {/* 2) 기간 탭 */}
      <LiveStockPeriodTabs selected={period} onChange={onPeriodChange} />

      {/* 3) 테이블 */}
      <LiveStockTable stocks={data[category]} />
    </div>
  );
}
