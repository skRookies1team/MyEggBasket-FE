// src/components/stock/StockOrderBook.tsx
import type { OrderBookData } from "../../types/stock";

interface Props {
  orderBook?: OrderBookData;   // 🔹 undefined 허용
  currentPrice: number;
  stockCode: string;
  onSelectPrice?: (price: number) => void;
}

export function StockOrderBook({
  orderBook,
  currentPrice,
  stockCode,
}: Props) {
  /* ------------------ guard ------------------ */
  if (!orderBook) {
    return (
      <div className="orderbook orderbook-loading">
        호가 정보를 불러오는 중입니다.
      </div>
    );
  }

  const { sell, buy } = orderBook;

  /* ------------------ render ------------------ */
  return (
    <div className="orderbook">
      <div className="orderbook-header">
        <span>{stockCode}</span>
        <strong>{currentPrice.toLocaleString()}원</strong>
      </div>

      {/* 매도 호가 */}
      <div className="orderbook-sell">
        {sell.map((item, idx) => (
          <div key={idx} className="orderbook-row sell">
            <span className="price">{item.price.toLocaleString()}</span>
            <span className="volume">{item.volume.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* 매수 호가 */}
      <div className="orderbook-buy">
        {buy.map((item, idx) => (
          <div key={idx} className="orderbook-row buy">
            <span className="price">{item.price.toLocaleString()}</span>
            <span className="volume">{item.volume.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
