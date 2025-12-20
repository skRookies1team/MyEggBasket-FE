// src/components/stock/StockOrderBook.tsx
import type { OrderBookData } from "../../types/stock";

interface Props {
  orderBook?: OrderBookData;
  currentPrice: number;
  stockCode: string;
  onSelectPrice?: (price: number) => void;
}

export function StockOrderBook({
  orderBook,
  currentPrice,
  stockCode,
  onSelectPrice,
}: Props) {
  /* ------------------ guard ------------------ */
  if (!orderBook) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-[#0f0f17] text-sm text-gray-400">
        호가 정보를 불러오는 중입니다.
      </div>
    );
  }

  const { sell, buy } = orderBook;

  return (
    <div className="flex h-full flex-col rounded-xl bg-[#0f0f17] p-3">
      {/* ===================== */}
      {/* Header */}
      {/* ===================== */}
      <div className="mb-3 flex items-center justify-between border-b border-[#232332] pb-2">
        <span className="text-sm text-gray-400">{stockCode}</span>
        <strong className="text-base font-semibold text-gray-100">
          {currentPrice.toLocaleString()}원
        </strong>
      </div>

      {/* ===================== */}
      {/* Sell Orders */}
      {/* ===================== */}
      <div className="flex flex-col gap-1">
        {sell.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrice?.(item.price)}
            className="
              flex items-center justify-between
              rounded-md px-2 py-1
              text-sm
              transition
              hover:bg-red-500/10
            "
          >
            <span className="text-red-400">
              {item.price.toLocaleString()}
            </span>
            <span className="text-gray-400">
              {item.volume.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* ===================== */}
      {/* Divider */}
      {/* ===================== */}
      <div className="my-2 border-t border-[#232332]" />

      {/* ===================== */}
      {/* Buy Orders */}
      {/* ===================== */}
      <div className="flex flex-col gap-1">
        {buy.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrice?.(item.price)}
            className="
              flex items-center justify-between
              rounded-md px-2 py-1
              text-sm
              transition
              hover:bg-blue-500/10
            "
          >
            <span className="text-blue-400">
              {item.price.toLocaleString()}
            </span>
            <span className="text-gray-400">
              {item.volume.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
