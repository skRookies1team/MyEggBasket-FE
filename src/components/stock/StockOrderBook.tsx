import type { OrderBookData } from "../../types/stock";

interface Props {
    orderBook?: OrderBookData;
    currentPrice: number;
    stockCode: string;
    onSelectPrice?: (price: number) => void;
}

export function StockOrderBook({ orderBook, currentPrice, stockCode, onSelectPrice }: Props) {
    if (!orderBook) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl bg-[#0f0f17] text-sm text-gray-400">
                호가 정보를 불러오는 중입니다.
            </div>
        );
    }

    const { sell, buy, totalAskQty, totalBidQty } = orderBook;
    const sortedSell = [...sell].reverse();

    return (
        <div className="flex h-full flex-col rounded-xl bg-[#0f0f17] p-3">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-[#232332] pb-2">
                <span className="text-xs font-medium text-gray-500">{stockCode}</span>
                <strong className="text-base font-bold text-gray-100">
                    {currentPrice.toLocaleString()}원
                </strong>
            </div>

            {/* Sell Orders (매도 호가) */}
            <div className="flex flex-col gap-[1px]">
                {sortedSell.map((item, index) => {
                    const ratio = totalAskQty > 0 ? (item.volume / totalAskQty) * 100 : 0;

                    // [수정] 가격이 0이면 중복될 수 있으므로 index를 fallback key로 사용
                    const itemKey = item.price > 0 ? `sell-${item.price}` : `sell-idx-${index}`;

                    return (
                        <button
                            key={itemKey}
                            onClick={() => onSelectPrice?.(item.price)}
                            style={{
                                transition: "background-size 0.3s ease-in-out",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right",
                                backgroundSize: `${ratio}% 100%`,
                                backgroundImage: `linear-gradient(to left, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.2))`,
                            }}
                            className="flex items-center justify-between rounded-sm px-2 py-1 text-sm transition-colors hover:bg-red-500/20"
                        >
              <span className="font-medium text-red-400">
                {item.price > 0 ? item.price.toLocaleString() : "-"}
              </span>
                            <span className="text-xs text-gray-400 animate-pulse-once">
                {item.volume > 0 ? item.volume.toLocaleString() : ""}
              </span>
                        </button>
                    );
                })}
            </div>

            <div className="my-2 border-t border-[#232332] py-1 text-[10px] flex justify-between text-gray-500">
                <span>매도잔량: {totalAskQty?.toLocaleString()}</span>
            </div>

            {/* Buy Orders (매수 호가) */}
            <div className="flex flex-col gap-[1px]">
                {buy.map((item, index) => {
                    const ratio = totalBidQty > 0 ? (item.volume / totalBidQty) * 100 : 0;

                    // [수정] 매수 호가도 동일하게 키 중복 방지 처리
                    const itemKey = item.price > 0 ? `buy-${item.price}` : `buy-idx-${index}`;

                    return (
                        <button
                            key={itemKey}
                            style={{
                                transition: "background-size 0.3s ease-in-out",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right",
                                backgroundSize: `${ratio}% 100%`,
                                backgroundImage: `linear-gradient(to left, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.2))`,
                            }}
                            onClick={() => onSelectPrice?.(item.price)}
                            className="flex items-center justify-between rounded-sm px-2 py-1 text-sm transition-colors hover:bg-blue-500/20"
                        >
              <span className="font-medium text-blue-400">
                {item.price > 0 ? item.price.toLocaleString() : "-"}
              </span>
                            <span className="text-xs text-gray-400">
                {item.volume > 0 ? item.volume.toLocaleString() : ""}
              </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-2 border-t border-[#232332] pt-1 text-[10px] flex justify-between text-gray-500">
                <span>매수잔량: {totalBidQty?.toLocaleString()}</span>
            </div>
        </div>
    );
}