import { useEffect, useState } from "react";
import api from "../../store/axiosStore";
import "../../assets/Sidebar/MyBalance.css";

export default function MyBalance() {
  const [balance, setBalance] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/kis/trade/balance");
      setBalance(res.data);
    } catch (err) {
      console.error(err);
      setError("잔고 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  if (loading)
    return <div className="mybal-loading">자산 정보를 불러오는 중...</div>;

  if (error)
    return (
      <div className="mybal-error">
        {error} <button onClick={loadBalance}>재시도</button>
      </div>
    );

  if (!balance) return null;

  const summary = balance.summary;
  const holdings = balance.holdings ?? [];

  // 💡 백엔드 DTO 기반 매핑
  const totalAsset = Number(summary.totalEvaluationAmount ?? 0);
  const totalProfitLoss = Number(summary.totalProfitLossAmount ?? 0);
  const cashAmount = Number(summary.cashAmount ?? 0);
  const netAsset = Number(summary.netAssetAmount ?? 0);

  const filteredHoldings = holdings.filter((h: any) => h.quantity > 0);

  return (
    <div className="mybal-container">
      <div className="mybal-header">
        <h1>내 자산 현황</h1>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">총 자산</div>
        <div className="mybal-big-value">{totalAsset.toLocaleString()}원</div>
        <div className="mybal-sub-info">
          {totalProfitLoss >= 0 ? "+" : ""}
          {totalProfitLoss.toLocaleString()}원
        </div>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">현금(주문가능)</div>
        <div className="mybal-big-value">{cashAmount.toLocaleString()}원</div>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">순자산</div>
        <div className="mybal-big-value">{netAsset.toLocaleString()}원</div>
      </div>

      <div className="mybal-card-full">
        <h2>보유 종목 ({filteredHoldings.length})</h2>

        {filteredHoldings.length === 0 ? (
          <div className="mybal-empty">보유 중인 종목이 없습니다.</div>
        ) : (
          filteredHoldings.map((stock: any) => (
            <div key={stock.stockCode} className="mybal-stock-card">
              <div className="mybal-stock-name">{stock.stockName}</div>
              <div className="mybal-stock-code">{stock.stockCode}</div>

              <div className="mybal-stock-row">
                <span>보유수량</span>
                <span>{stock.quantity.toLocaleString()}주</span>
              </div>

              <div className="mybal-stock-row">
                <span>매입가</span>
                <span>{Number(stock.avgPrice).toLocaleString()}원</span>
              </div>

              <div className="mybal-stock-row">
                <span>현재가</span>
                <span>{Number(stock.currentPrice).toLocaleString()}원</span>
              </div>

              <div className="mybal-stock-row">
                <span>평가금액</span>
                <span>{Number(stock.evaluationAmount).toLocaleString()}원</span>
              </div>

              <div className="mybal-stock-row">
                <span>수익률</span>
                <span
                  className={
                    stock.profitLossRate >= 0 ? "positive" : "negative"
                  }
                >
                  {stock.profitLossRate >= 0 ? "+" : ""}
                  {Number(stock.profitLossRate).toFixed(2)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
