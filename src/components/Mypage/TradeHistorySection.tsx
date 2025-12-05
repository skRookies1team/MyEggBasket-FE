import React, { useEffect, useState } from "react";
import { useOrderStore } from "../../store/orderStore";

export default function TradeHistorySection() {
  const tradeHistory = useOrderStore((state) => state.tradeHistory);
  const fetchTradeHistory = useOrderStore((state) => state.fetchTradeHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTradeHistory = async () => {
      setLoading(true);
      await fetchTradeHistory();
      setLoading(false);
    };
    loadTradeHistory();
  }, [fetchTradeHistory]);

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
            tradeHistory.map((order) => {
              const { formattedDate, formattedTime } = formatDateTime(order.createdAt);
              return (
                <tr key={order.id}>
                  <td>
                    {/* 날짜와 시간을 두 줄로 표시하여 가독성 개선 */}
                    {formattedDate}
                    <br />
                    {formattedTime}
                  </td>
                  <td>{order.symbol}</td>
                  <td style={{ color: order.side === "buy" ? "red" : "blue" }}>
                    {order.side === "buy" ? "매수" : "매도"}
                  </td>
                  <td>{order.price.toLocaleString()}</td>
                  <td>{order.quantity}</td>
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