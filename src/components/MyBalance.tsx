import { useEffect, useState } from "react";
import { fetchAccountBalance, getAccessToken } from "../api/stockApi";
import type { AccountBalanceData } from "../types/stock";
import "../assets/MyBalance.css";

export default function MyBalance() {
  const [balance, setBalance] = useState<AccountBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("토큰 발급 실패");

      const data = await fetchAccountBalance(token);
      if (data) setBalance(data);
      else setError("데이터를 불러오지 못했습니다.");
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

  if (loading) return <div className="mybal-loading">자산 정보를 불러오는 중...</div>;

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="mybal-error">
          {error} <button onClick={loadBalance}>재시도</button>
        </div>

        {/* 상단 자산 요약 카드 */}
        <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#1e1e1e]">내 자산 현황</h2>
            <button onClick={loadBalance} className="text-sm text-[#4f378a] hover:underline">
              새로고침
            </button>
          </div>
        </div>
      </div>
    );

  if (!balance) return null;

  const { summary, holdings } = balance;

  // 🔥 수량이 0보다 큰 종목만 필터링
  const filteredHoldings = holdings.filter((stock) => stock.hldg_qty > 0);

  return (
    <div className="mybal-container">
      <div className="mybal-header">
        <h1>내 자산 현황</h1>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">총 자산</div>
        <div className="mybal-big-value">{summary.tot_evlu_amt.toLocaleString()}원</div>
        <div className="mybal-sub-info">
          {summary.evlu_pfls_smtl_amt >= 0 ? "+" : ""}
          {summary.evlu_pfls_smtl_amt.toLocaleString()}원
        </div>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">현금(주문가능)</div>
        <div className="mybal-big-value">{summary.dnca_tot_amt.toLocaleString()}원</div>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">주식 평가금액</div>
        <div className="mybal-big-value">{summary.scts_evlu_amt.toLocaleString()}원</div>
      </div>

      <div className="mybal-card">
        <div className="mybal-card-title">손익 합계</div>
        <div className={`mybal-big-value ${summary.evlu_pfls_smtl_amt >= 0 ? "positive" : "negative"}`}>
          {summary.evlu_pfls_smtl_amt >= 0 ? "+" : ""}
          {summary.evlu_pfls_smtl_amt.toLocaleString()}원
        </div>
      </div>

      <div className="mybal-card-full">
        <h2>보유 종목 ({filteredHoldings.length})</h2>

        {filteredHoldings.length === 0 ? (
          <div className="mybal-empty">보유 중인 종목이 없습니다.</div>
        ) : (
          <div>
            {filteredHoldings.map((stock) => (
              <div key={stock.pdno} className="mybal-stock-card">
                <div className="mybal-stock-name">{stock.prdt_name}</div>
                <div className="mybal-stock-code">{stock.pdno}</div>

                <div className="mybal-stock-row">
                  <span>보유수량</span>
                  <span>{stock.hldg_qty.toLocaleString()}주</span>
                </div>

                <div className="mybal-stock-row">
                  <span>매입가</span>
                  <span>{stock.pchs_avg_pric.toLocaleString()}원</span>
                </div>

                <div className="mybal-stock-row">
                  <span>현재가</span>
                  <span>{stock.prpr.toLocaleString()}원</span>
                </div>

                <div className="mybal-stock-row">
                  <span>평가금액</span>
                  <span>{stock.evlu_amt.toLocaleString()}원</span>
                </div>

                <div className="mybal-stock-row">
                  <span>수익률</span>
                  <span className={stock.evlu_pfls_rt >= 0 ? "positive" : "negative"}>
                    {stock.evlu_pfls_rt >= 0 ? "+" : ""}
                    {stock.evlu_pfls_rt.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
