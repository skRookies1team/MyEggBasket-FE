import {useState, useEffect} from 'react';
import type {OrderBookData} from '../../types/stock';
import {placeOrder, getAccessToken} from '../../api/stockApi';
import MyBalance from "../MyBalance.tsx";

interface StockOrderBookProps {
    orderBook: OrderBookData,
    currentPrice: number,
    stockCode: string
}

export function StockOrderBook({orderBook, currentPrice, stockCode}: StockOrderBookProps) {
    // 입력 상태 관리
    const [price, setPrice] = useState<number>(currentPrice);
    const [quantity, setQuantity] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // 현재가가 바뀌면(초기 로딩 시) 주문 가격 기본값 업데이트
    useEffect(() => {
        if (currentPrice > 0) setPrice(currentPrice);
    }, [currentPrice]);

    // 주문 핸들러
    const handleOrder = async (type: 'buy' | 'sell') => {
        if (quantity <= 0) {
            alert('수량을 입력해주세요.');
            return;
        }
        if (price <= 0) {
            alert('가격을 입력해주세요.');
            return;
        }

        if (!confirm(`${type === 'buy' ? '매수' : '매도'} 주문을 하시겠습니까?\n가격: ${price.toLocaleString()}원\n수량: ${quantity}주`)) {
            return;
        }

        setLoading(true);
        try {
            // 1. 토큰 발급 (캐싱된 것 사용)
            const token = await getAccessToken();
            if (!token) {
                alert('접근 토큰 발급 실패. 설정(APP KEY)을 확인해주세요.');
                return;
            }

            // 2. 주문 요청
            const result = await placeOrder(stockCode, token, type, price, quantity);

            alert(result.msg);

            // 성공 시 입력 초기화
            if (result.success) {
                setQuantity(0);
            }
        } catch (e) {
            console.error(e);
            alert('주문 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* 호가 리스트 */}
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                <h3 className="text-[#1e1e1e] mb-4">호가</h3>
                <div className="space-y-1">
                    {/* 매도 잔량 (역순) */}
                    {orderBook.sell?.slice().reverse().map((order, idx) => (
                        <div key={`sell-${idx}`} className="relative p-2 rounded cursor-pointer hover:bg-blue-50"
                             onClick={() => setPrice(order.price)}>
                            <div
                                className="absolute inset-0 bg-[#e3f2fd] rounded transition-all duration-300 opacity-50"
                                style={{width: `${order.percent}%`}}
                            />
                            <div className="relative flex justify-between text-[13px] z-10">
                                <span className="text-[#0066ff]">₩{order.price.toLocaleString()}</span>
                                <span className="text-[#49454f]">{order.volume.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}

                    <div className="my-2 py-2 bg-[#f3edf7] rounded text-center">
                        <span className="text-[#1e1e1e] font-bold">현재가 ₩{currentPrice.toLocaleString()}</span>
                    </div>

                    {/* 매수 잔량 */}
                    {orderBook.buy?.map((order, idx) => (
                        <div key={`buy-${idx}`} className="relative p-2 rounded cursor-pointer hover:bg-red-50"
                             onClick={() => setPrice(order.price)}>
                            <div
                                className="absolute inset-0 bg-[#ffebee] rounded transition-all duration-300 opacity-50"
                                style={{width: `${order.percent}%`}}
                            />
                            <div className="relative flex justify-between text-[13px] z-10">
                                <span className="text-[#ff383c]">₩{order.price.toLocaleString()}</span>
                                <span className="text-[#49454f]">{order.volume.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <MyBalance/>
            {/* 주문 폼 */}
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6 h-fit">
                <h3 className="text-[#1e1e1e] mb-4">주문</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[#49454f] text-[13px] mb-2">주문가격</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:border-[#4f378a]"
                        />
                    </div>
                    <div>
                        <label className="block text-[#49454f] text-[13px] mb-2">주문수량</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            placeholder="수량 입력"
                            className="w-full px-4 py-2 border border-[#d9d9d9] rounded-lg focus:outline-none focus:border-[#4f378a]"
                        />
                    </div>

                    {/* 주문 정보 요약 */}
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 flex justify-between">
                        <span>총 주문금액</span>
                        <span className="font-bold">{(price * quantity).toLocaleString()}원</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => handleOrder('buy')}
                            disabled={loading}
                            className={`px-4 py-3 bg-[#ff383c] hover:bg-[#e63339] text-white rounded-lg transition-colors font-bold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? '처리중...' : '매수'}
                        </button>
                        <button
                            onClick={() => handleOrder('sell')}
                            disabled={loading}
                            className={`px-4 py-3 bg-[#0066ff] hover:bg-[#0052cc] text-white rounded-lg transition-colors font-bold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? '처리중...' : '매도'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}