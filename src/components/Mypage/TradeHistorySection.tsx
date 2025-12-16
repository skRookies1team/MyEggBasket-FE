import { useEffect } from "react";
import { useOrderStore, type TradeHistoryItem } from "../../store/orderStore";

export default function TradeHistorySection() {
  const tradeHistory = useOrderStore((state) => state.tradeHistory);
  const fetchTradeHistory = useOrderStore((state) => state.fetchTradeHistory);
  const loading = useOrderStore((state) => state.loading);

  useEffect(() => {
    // COMPLETED 체결 내역만 조회 (필요 없으면 인자 제거)
    fetchTradeHistory("COMPLETED");
  }, [fetchTradeHistory]);

  // 날짜/시간 포맷
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

  if (loading) {
    return (
      <div className="mypage-box">
        <h3>체결 내역</h3>
        <p>체결 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="mypage-box">
      <h3>체결 내역</h3>

      <table>
        <thead>
          <tr>
            <th>체결 시간</th>
            <th>종목</th>
            <th>구분</th>
            <th>체결 가격</th>
            <th>체결 수량</th>
          </tr>
        </thead>
        <tbody>
          {tradeHistory.length > 0 ? (
            tradeHistory.map((order: TradeHistoryItem) => {
              const { formattedDate, formattedTime } =
                formatDateTime(order.executedAt);

              return (
                <tr key={order.transactionId}>
                  <td>
                    {formattedDate}
                    <br />
                    {formattedTime}
                  </td>
                  <td>{order.stockName}</td>
                  <td
                    style={{
                      color: order.type === "BUY" ? "red" : "blue",
                      fontWeight: 600,
                    }}
                  >
                    {order.typeDescription}
                  </td>
                  <td>{order.price.toLocaleString()}</td>
                  <td>{order.quantity.toLocaleString()}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5}>완료된 거래 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
