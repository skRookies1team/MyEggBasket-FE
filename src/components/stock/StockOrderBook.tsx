import type { OrderBookData } from '../../types/stock.ts';

interface StockOrderBookProps {
    orderBook: OrderBookData;
    currentPrice: number;
}

export function StockOrderBook({ orderBook, currentPrice }: StockOrderBookProps) {
    return (
        <div className="grid grid-cols-2 gap-6">
            {/* 호가 리스트 */}
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                <h3 className="text-[#1e1e1e] mb-4">호가</h3>
                <div className="space-y-1">
                    {/* 매도 잔량 (역순) */}
                    {orderBook.sell?.slice().reverse().map((order, idx) => (
                        <div key={`sell-${idx}`} className="relative p-2 rounded">
                            <div
                                className="absolute inset-0 bg-[#e3f2fd] rounded transition-all duration-300"
                                style={{ width: `${order.percent}%` }}
                            />
                            <div className="relative flex justify-between text-[13px]">
                                <span className="text-[#0066ff]">₩{order.price.toLocaleString()}</span>
                                <span className="text-[#49454f]">{order.volume.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}

                    <div className="my-2 py-2 bg-[#f3edf7] rounded text-center">
                        <span className="text-[#1e1e1e] font-bold">₩{currentPrice.toLocaleString()}</span>
                    </div>

                    {/* 매수 잔량 */}
                    {orderBook.buy?.map((order, idx) => (
                        <div key={`buy-${idx}`} className="relative p-2 rounded">
                            <div
                                className="absolute inset-0 bg-[#ffebee] rounded transition-all duration-300"
                                style={{ width: `${order.percent}%` }}
                            />
                            <div className="relative flex justify-between text-[13px]">
                                <span className="text-[#ff383c]">₩{order.price.toLocaleString()}</span>
                                <span className="text-[#49454f]">{order.volume.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 주문 폼 (UI만 존재, 로직은 별도 처리 필요) */}
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                <h3 className="text-[#1e1e1e] mb-4">주문</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[#49454f] text-[13px] mb-2">주문가격</label>
                        <input
                            type="number"
                            defaultValue={currentPrice}
                            className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-[#49454f] text-[13px] mb-2">주문수량</label>
                        <input
                            type="number"
                            placeholder="수량 입력"
                            className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="px-4 py-3 bg-[#ff383c] hover:bg-[#e63339] text-white rounded-lg transition-colors">
                            매수
                        </button>
                        <button className="px-4 py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-lg transition-colors">
                            매도
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}