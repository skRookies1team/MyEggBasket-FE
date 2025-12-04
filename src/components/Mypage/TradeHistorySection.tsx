import React, { useEffect, useState } from "react";
import { useOrderStore } from "../../store/orderStore";

const TradeHistorySection: React.FC = () => {
  const tradeHistory = useOrderStore((state) => state.tradeHistory);
  const fetchTradeHistory = useOrderStore((state) => state.fetchTradeHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      await fetchTradeHistory();
      setLoading(false);
    };
    loadHistory();
  }, [fetchTradeHistory]);

  if (loading) {
    return <div>거래 내역을 불러오는 중입니다...</div>;
  }

  return (
    <div className="mypage-box">
      <h2>거래 내역</h2>
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
            tradeHistory.map((order) => (
              <tr key={order.id}>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.symbol}</td>
                <td style={{ color: order.side === "buy" ? "red" : "blue" }}>
                  {order.side === "buy" ? "매수" : "매도"}
                </td>
                <td>{order.price.toLocaleString()}</td>
                <td>{order.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>완료된 거래 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistorySection;