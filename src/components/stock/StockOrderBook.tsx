import { useState, useEffect } from "react";
import type { OrderBookData } from "../../types/stock";
import { orderStock } from "../../api/tradeApi";

interface StockOrderBookProps {
  orderBook: OrderBookData;
  currentPrice: number;
  stockCode: string;
}

export function StockOrderBook({
  orderBook,
  currentPrice,
  stockCode,
}: StockOrderBookProps) {
  // ===================== 상태 =====================
  const [price, setPrice] = useState<number>(currentPrice);
  const [quantity, setQuantity] = useState<number | "">(""); // placeholder용
  const [loading, setLoading] = useState(false);

  // ===================== 현재가 변경 시 주문가 초기화 =====================
  useEffect(() => {
    if (currentPrice > 0) {
      setPrice(currentPrice);
    }
  }, [currentPrice]);

  // ===================== 주문 처리 =====================
  const handleOrder = async (type: "BUY" | "SELL") => {
    // 🔴 여기서 number로 확정
    const orderQuantity = Number(quantity);

    if (!orderQuantity || orderQuantity <= 0) {
      alert("주문 수량을 올바르게 입력해주세요.");
      return;
    }

    if (!price || price <= 0) {
      alert("주문 가격을 올바르게 입력해주세요.");
      return;
    }

    const totalAmount = price * orderQuantity;

    const confirmMsg = `
${type === "BUY" ? "매수" : "매도"} 주문을 하시겠습니까?

종목코드: ${stockCode}
주문가격: ${price.toLocaleString()}원
주문수량: ${orderQuantity}주
총금액: ${totalAmount.toLocaleString()}원
    `;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await orderStock(
        {
          stockCode,
          orderType: type,
          price,
          quantity: orderQuantity, // ✅ 항상 number
          triggerSource: "MANUAL",
        },
        false // virtual
      );

      alert(`${type === "BUY" ? "매수" : "매도"} 주문이 접수되었습니다.`);
      setQuantity(""); // 다시 placeholder 0 보이게
    } catch (e: any) {
      console.error(e);
      alert(
        e?.response?.data?.message ??
          "주문 처리 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* ===================== 호가 ===================== */}
      <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
        <h3 className="text-[#1e1e1e] mb-4">호가</h3>

        <div className="space-y-1">
          {/* 매도 호가 */}
          {orderBook.sell?.slice().reverse().map((order, idx) => (
            <div
              key={`sell-${idx}`}
              className="relative p-2 rounded cursor-pointer hover:bg-blue-50"
              onClick={() => setPrice(order.price)}
            >
              <div
                className="absolute inset-0 bg-[#e3f2fd] rounded opacity-50"
                style={{ width: `${order.percent}%` }}
              />
              <div className="relative flex justify-between text-[13px] z-10">
                <span className="text-[#0066ff]">
                  ₩{order.price.toLocaleString()}
                </span>
                <span className="text-[#49454f]">
                  {order.volume.toLocaleString()}
                </span>
              </div>
            </div>
          ))}

          {/* 현재가 */}
          <div className="my-2 py-2 bg-[#f3edf7] rounded text-center">
            <span className="font-bold">
              현재가 ₩{currentPrice.toLocaleString()}
            </span>
          </div>

          {/* 매수 호가 */}
          {orderBook.buy?.map((order, idx) => (
            <div
              key={`buy-${idx}`}
              className="relative p-2 rounded cursor-pointer hover:bg-red-50"
              onClick={() => setPrice(order.price)}
            >
              <div
                className="absolute inset-0 bg-[#ffebee] rounded opacity-50"
                style={{ width: `${order.percent}%` }}
              />
              <div className="relative flex justify-between text-[13px] z-10">
                <span className="text-[#ff383c]">
                  ₩{order.price.toLocaleString()}
                </span>
                <span className="text-[#49454f]">
                  {order.volume.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== 주문 ===================== */}
      <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6 h-fit">
        <h3 className="text-[#1e1e1e] mb-4">주문</h3>

        <div className="space-y-4">
          {/* 주문가격 */}
          <div>
            <label className="block text-[13px] mb-2">주문가격</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* 주문수량 */}
          <div>
            <label className="block text-[13px] mb-2">주문수량</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="0"
              min={1}
              step={1}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* 요약 */}
          <div className="p-3 bg-gray-50 rounded flex justify-between text-sm">
            <span>총 주문금액</span>
            <span className="font-bold">
              {quantity ? (price * Number(quantity)).toLocaleString() : 0}원
            </span>
          </div>

          {/* 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOrder("BUY")}
              disabled={loading}
              className="bg-red-500 text-white py-3 rounded font-bold"
            >
              {loading ? "처리중..." : "매수"}
            </button>
            <button
              onClick={() => handleOrder("SELL")}
              disabled={loading}
              className="bg-blue-500 text-white py-3 rounded font-bold"
            >
              {loading ? "처리중..." : "매도"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
