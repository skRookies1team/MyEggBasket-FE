import React, { useEffect, useState } from "react";
import { useOrderStore } from "../../store/orderStore";

export default function OrderHistorySection() {
  const pendingOrders = useOrderStore((state) => state.pendingOrders);
  const fetchPendingOrders = useOrderStore((state) => state.fetchPendingOrders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPendingOrders = async () => {
      setLoading(true);
      await fetchPendingOrders();
      setLoading(false);
    };
    loadPendingOrders();
  }, [fetchPendingOrders]);

  if (loading) {
    return (
      <div className="mypage-box">
        <h3>미체결 내역</h3>
        <p>미체결 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="mypage-box">
      <h3>미체결 내역</h3>
      <table>
        <thead>
          <tr>
            <th>주문 시간</th>
            <th>종목</th>
            <th>구분</th>
            <th>주문 가격</th>
            <th>주문 수량</th>
          </tr>
        </thead>
        <tbody>
          {pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
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
              <td colSpan={5}>미체결 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
