import { useEffect } from "react";
import { useOrderStore, type TradeHistoryItem } from "../../store/orderStore";

export default function TradeHistorySection() {
  const tradeHistory = useOrderStore((state) => state.tradeHistory);
  const fetchTradeHistory = useOrderStore((state) => state.fetchTradeHistory);
  const loading = useOrderStore((state) => state.loading);

  useEffect(() => {
    // COMPLETED 체결 내역만 조회
    fetchTradeHistory("COMPLETED");
  }, [fetchTradeHistory]);

  /* 날짜/시간 포맷 */
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const formattedDate = date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, "-")
      .replace(".", "");

    const formattedTime = date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return { formattedDate, formattedTime };
  };

  /* Loading */
  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <h3 className="mb-2 text-sm font-semibold text-indigo-300">
          체결 내역
        </h3>
        <p className="text-sm text-gray-400">
          체결 내역을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Title */}
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-indigo-300">
        체결 내역
      </h3>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2e2e44] text-left text-gray-400">
              <th className="pb-2 pr-2 font-medium">체결 시간</th>
              <th className="pb-2 pr-2 font-medium">종목</th>
              <th className="pb-2 pr-2 font-medium">구분</th>
              <th className="pb-2 pr-2 font-medium text-right">
                체결 가격
              </th>
              <th className="pb-2 text-right font-medium">
                체결 수량
              </th>
            </tr>
          </thead>

          <tbody>
            {tradeHistory.length > 0 ? (
              tradeHistory.map((order: TradeHistoryItem) => {
                const { formattedDate, formattedTime } =
                  formatDateTime(order.executedAt);

                const isBuy = order.type === "BUY";

                return (
                  <tr
                    key={order.transactionId}
                    className="border-b border-[#1f1f2e] transition hover:bg-[#1f1f2e]"
                  >
                    {/* Time */}
                    <td className="py-3 pr-2 text-xs text-gray-300">
                      <div>{formattedDate}</div>
                      <div className="text-gray-500">
                        {formattedTime}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 pr-2 font-medium text-gray-100">
                      {order.stockName}
                    </td>

                    {/* Type */}
                    <td
                      className={`py-3 pr-2 font-semibold ${
                        isBuy
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {order.typeDescription}
                    </td>

                    {/* Price */}
                    <td className="py-3 pr-2 text-right text-gray-200">
                      {order.price.toLocaleString()}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 text-right text-gray-200">
                      {order.quantity.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  완료된 거래 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
