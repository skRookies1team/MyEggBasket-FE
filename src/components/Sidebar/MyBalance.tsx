import { useEffect, useState } from "react";
import { fetchUserBalance } from "../../api/accountApi";

export default function MyBalance() {
  const [balance, setBalance] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 실전 / 모의 (확장 가능)
  const [virtual] = useState(false);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);

    const data = await fetchUserBalance(virtual);

    if (!data) {
      setError("잔고 조회 중 오류가 발생했습니다.");
    } else {
      setBalance(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBalance();
  }, [virtual]);

  /* ---------------- 상태 UI ---------------- */
  if (loading)
    return (
      <div className="rounded-2xl bg-[#1a1a24] p-6 text-center text-sm text-gray-400">
        자산 정보를 불러오는 중...
      </div>
    );

  if (error)
    return (
      <div className="rounded-2xl bg-[#1a1a24] p-6 text-center text-sm text-red-400">
        {error}
        <button
          onClick={loadBalance}
          className="ml-2 rounded-md bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30"
        >
          재시도
        </button>
      </div>
    );

  if (!balance) return null;

  /* ---------------- 데이터 매핑 ---------------- */
  const summary = balance.summary ?? {};
  const holdings = balance.holdings ?? [];

  const totalAsset = Number(summary.totalEvaluationAmount ?? 0);
  const totalProfitLoss = Number(summary.totalProfitLossAmount ?? 0);
  const totalCashAmount = Number(summary.totalCashAmount ?? 0);
  const netAsset = Number(summary.netAssetAmount ?? 0);

  const filteredHoldings = holdings.filter(
    (h: any) => Number(h.quantity) > 0
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-4 rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <h2 className="text-sm font-semibold tracking-wide text-indigo-300">
        내 자산 현황
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* 총 자산 */}
        <div className="rounded-xl bg-[#1f1f2e] p-4">
          <div className="text-xs text-gray-400">총 자산</div>
          <div className="mt-1 text-xl font-bold text-white">
            {totalAsset.toLocaleString()}원
          </div>
          <div
            className={`mt-1 text-sm ${
              totalProfitLoss >= 0
                ? "text-red-400"
                : "text-blue-400"
            }`}
          >
            {totalProfitLoss >= 0 ? "+" : ""}
            {totalProfitLoss.toLocaleString()}원
          </div>
        </div>

        {/* 현금 */}
        <div className="rounded-xl bg-[#1f1f2e] p-4">
          <div className="text-xs text-gray-400">현금 (주문 가능)</div>
          <div className="mt-1 text-lg font-semibold text-white">
            {totalCashAmount.toLocaleString()}원
          </div>
        </div>

        {/* 순자산 */}
        <div className="rounded-xl bg-[#1f1f2e] p-4">
          <div className="text-xs text-gray-400">순자산</div>
          <div className="mt-1 text-lg font-semibold text-white">
            {netAsset.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="rounded-xl bg-[#1f1f2e] p-4">
        <h3 className="mb-3 text-sm font-semibold text-indigo-200">
          보유 종목 ({filteredHoldings.length})
        </h3>

        {filteredHoldings.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            보유 중인 종목이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHoldings.map((stock: any) => (
              <div
                key={stock.stockCode}
                className="rounded-xl bg-[#26263a] p-3 transition hover:bg-[#2e2e44]"
              >
                {/* 종목명 */}
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="font-medium text-white">
                    {stock.stockName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stock.stockCode}
                  </div>
                </div>

                {/* 정보 rows */}
                <div className="space-y-1 text-xs text-gray-300">
                  <Row label="보유수량" value={`${Number(stock.quantity).toLocaleString()}주`} />
                  <Row label="매입가" value={`${Number(stock.avgPrice).toLocaleString()}원`} />
                  <Row label="현재가" value={`${Number(stock.currentPrice).toLocaleString()}원`} />
                  <Row
                    label="평가금액"
                    value={`${Number(stock.evaluationAmount).toLocaleString()}원`}
                  />
                  <Row
                    label="수익률"
                    value={`${stock.profitLossRate >= 0 ? "+" : ""}${Number(
                      stock.profitLossRate
                    ).toFixed(2)}%`}
                    valueClass={
                      stock.profitLossRate >= 0
                        ? "text-red-400"
                        : "text-blue-400"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- 작은 Row 컴포넌트 ---------------- */
function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
