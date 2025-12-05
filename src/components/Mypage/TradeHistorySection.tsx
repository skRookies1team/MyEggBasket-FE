import React, { useEffect, useState } from "react";
import { useOrderStore, type TradeHistoryItem } from "../../store/orderStore";
import { useAuthStore } from "../../store/authStore";

export default function TradeHistorySection() {
  const tradeHistory = useOrderStore((state) => state.tradeHistory);
  const fetchTradeHistory = useOrderStore((state) => state.fetchTradeHistory);
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTradeHistory = async () => {
      if (!user) {
        return;
      }
      setLoading(true);
      await fetchTradeHistory(user.id);
      setLoading(false);
    };
    loadTradeHistory();
  }, [user, fetchTradeHistory]);

  if (loading) {
    return (
      <div className="mypage-box">
        <h3>체결 내역</h3>
        <p>체결 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  // 날짜와 시간을 포맷하는 함수 추가
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    // YYYY-MM-DD
    const formattedDate = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', ''); // 예: 2025-12-05

    // HH:MM:SS
    const formattedTime = date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    return { formattedDate, formattedTime };
  };

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
              const { formattedDate, formattedTime } = formatDateTime(order.executedAt);
              return (
                <tr key={order.transactionId}>
                  <td>
                    {/* 날짜와 시간을 두 줄로 표시하여 가독성 개선 */}
                    {formattedDate}
                    <br />
                    {formattedTime}
                  </td>
                  <td>{order.stockName}</td>
                  <td style={{ color: order.type === "BUY" ? "red" : "blue" }}>
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