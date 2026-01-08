import { useEffect, useState } from "react";
import { useHistoryStore } from "../../store/historyStore";
import { Check, DollarSign, Pencil } from "lucide-react";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { fetchLowerTarget, fetchUpperTarget, fetchPriceTargets } from "../../api/targetPriceApi";
import { fetchUserBalance } from "../../api/accountApi";

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";
import HistoryReport from "./HistoryReport";

interface HoldingStockRowProps {
  holdingStock: any;
  initialTargets?: { upperTarget?: number; lowerTarget?: number };
  currentPrice: number;
}

/* =========================
   개별 종목 Row
========================= */
function HoldingStockRow({ holdingStock, initialTargets, currentPrice }: HoldingStockRowProps) {
  const [upperPrice, setUpperPrice] = useState<string>("");
  const [lowerPrice, setLowerPrice] = useState<string>("");
  const [isUpperConfirmed, setIsUpperConfirmed] = useState(false);
  const [isLowerConfirmed, setIsLowerConfirmed] = useState(false);

  // 초기 제안값(Default) 설정 여부 확인용 플래그
  const [isDefaultsSet, setIsDefaultsSet] = useState(false);

  // 수익률 계산
  const rate = holdingStock.avgPrice > 0
      ? ((currentPrice - holdingStock.avgPrice) / holdingStock.avgPrice) * 100
      : 0;

  // 1. [핵심] 서버에서 저장된 목표가가 들어오면(또는 늦게 로드되면) 즉시 반영
  useEffect(() => {
    if (initialTargets) {
      if (initialTargets.upperTarget) {
        setUpperPrice(initialTargets.upperTarget.toString());
        setIsUpperConfirmed(true);
      }
      if (initialTargets.lowerTarget) {
        setLowerPrice(initialTargets.lowerTarget.toString());
        setIsLowerConfirmed(true);
      }
    }
  }, [initialTargets]);

  // 2. [제안값] 저장된 목표가가 없고, 현재가만 로드되었을 때 ±5% 자동 제안
  // (단, 사용자가 이미 값을 수정했거나, 서버 값을 받은 상태라면 건너뜀)
  useEffect(() => {
    // 조건: 현재가 로드됨 AND 서버 데이터 없음 AND 아직 제안값 세팅 안 함 AND 입력창 비어있음
    if (currentPrice > 0 && !initialTargets && !isDefaultsSet && !upperPrice && !lowerPrice) {
      setUpperPrice(Math.floor(currentPrice * 1.05).toString());
      setLowerPrice(Math.floor(currentPrice * 0.95).toString());

      // 제안값이므로 확정 상태는 false (사용자가 직접 체크 누르게 유도)
      setIsUpperConfirmed(false);
      setIsLowerConfirmed(false);

      setIsDefaultsSet(true); // 반복 실행 방지
    }
  }, [currentPrice, initialTargets, isDefaultsSet, upperPrice, lowerPrice]);

  const handleUpperConfirm = async () => {
    if (!upperPrice) return;
    const res = await fetchUpperTarget(holdingStock.stock.stockCode, Number(upperPrice));
    if (res) setIsUpperConfirmed(true);
  };

  const handleLowerConfirm = async () => {
    if (!lowerPrice) return;
    const res = await fetchLowerTarget(holdingStock.stock.stockCode, Number(lowerPrice));
    if (res) setIsLowerConfirmed(true);
  };

  const color = rate > 0 ? "text-red-400" : rate < 0 ? "text-blue-400" : "text-gray-300";

  return (
      <tr className="border-b border-[#232332] hover:bg-[#1f1f2e] transition">
        <td className="px-4 py-3 text-gray-200">{holdingStock.stock.name}</td>
        <td className="px-4 py-3 text-right text-gray-400">{holdingStock.quantity.toLocaleString()}</td>
        <td className="px-4 py-3 text-right text-gray-400">{holdingStock.avgPrice.toLocaleString()}원</td>
        <td className="px-4 py-3 text-right text-gray-200">
          {currentPrice > 0 ? `${currentPrice.toLocaleString()}원` : "-"}
        </td>
        <td className={`px-4 py-3 text-right font-medium ${color}`}>
          {rate > 0 ? "+" : ""}{rate.toFixed(2)}%
        </td>

        <td className="px-4 py-3 text-right space-y-2 min-w-[200px]">
          {/* 상한가 */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] text-red-400/70 border border-red-400/30 px-1 rounded">상한</span>
            {isUpperConfirmed ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-300 text-xs font-semibold">{Number(upperPrice).toLocaleString()}원</span>
                  <button onClick={() => setIsUpperConfirmed(false)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Pencil size={12} />
                  </button>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                  <input
                      type="number"
                      value={upperPrice}
                      onChange={(e) => setUpperPrice(e.target.value)}
                      className="w-24 rounded bg-[#0a0a0f] border border-[#2a2a35] px-2 py-0.5 text-right text-xs text-gray-200 focus:border-red-500 outline-none"
                  />
                  <button onClick={handleUpperConfirm} className="p-1 text-gray-500 hover:text-green-400">
                    <Check size={14} />
                  </button>
                </div>
            )}
          </div>

          {/* 하한가 */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-[10px] text-blue-400/70 border border-blue-400/30 px-1 rounded">하한</span>
            {isLowerConfirmed ? (
                <div className="flex items-center gap-2">
                  <span className="text-blue-300 text-xs font-semibold">{Number(lowerPrice).toLocaleString()}원</span>
                  <button onClick={() => setIsLowerConfirmed(false)} className="text-gray-500 hover:text-blue-400 transition-colors">
                    <Pencil size={12} />
                  </button>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                  <input
                      type="number"
                      value={lowerPrice}
                      onChange={(e) => setLowerPrice(e.target.value)}
                      className="w-24 rounded bg-[#0a0a0f] border border-[#2a2a35] px-2 py-0.5 text-right text-xs text-gray-200 focus:border-blue-500 outline-none"
                  />
                  <button onClick={handleLowerConfirm} className="p-1 text-gray-500 hover:text-green-400">
                    <Check size={14} />
                  </button>
                </div>
            )}
          </div>
        </td>
      </tr>
  );
}

/* =========================
   메인 컴포넌트
========================= */
export default function HistoryAsset() {
  const history = useHistoryStore((s) => s.historyReport);
  const [holdings, setHoldings] = useState<any[]>([]);

  // [수정 완료] 기존 코드의 문법 오류 수정 (배열 구조 분해 할당)
  const [accountSummary, setAccountSummary] = useState<any>(null);

  const [existingTargets, setExistingTargets] = useState<any[]>([]);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [displaySummary, setDisplaySummary] = useState({
    totalPurchaseAmount: 0,
    totalCurrentValue: 0,
    totalReturnRate: 0
  });

  useEffect(() => {
    const initData = async () => {
      // 1. 내 잔고 조회
      const balanceData = await fetchUserBalance();
      if (balanceData) {
        setHoldings(balanceData.holdings);
        setAccountSummary(balanceData.summary);

        const initialPrices: Record<string, number> = {};
        balanceData.holdings.forEach((h: any) => {
          initialPrices[h.stockCode] = h.currentPrice;
        });
        setPriceMap(initialPrices);
      }

      // 2. 내 목표가 목록 조회 (GET /price-targets)
      // 이 API가 호출되어야 저장해둔 목표가를 불러올 수 있습니다.
      const targets = await fetchPriceTargets();
      if (targets) {
        setExistingTargets(targets);
      }
    };

    initData();
  }, []);

  // 실시간 시세 업데이트 로직 (10초 주기)
  useEffect(() => {
    const fetchAllPricesAndCalc = async () => {
      if (holdings.length === 0) return;

      const priceResults = await Promise.all(
          holdings.map((h) => fetchStockCurrentPrice(h.stockCode))
      );

      const newPriceMap: Record<string, number> = {};
      let totalPurchase = 0;
      let totalValue = 0;

      holdings.forEach((h, i) => {
        const currentPrice = priceResults[i]?.currentPrice || h.currentPrice;
        newPriceMap[h.stockCode] = currentPrice;
        totalPurchase += h.avgPrice * h.quantity;
        totalValue += currentPrice * h.quantity;
      });

      setPriceMap(newPriceMap);

      const returnRate = totalPurchase > 0
          ? ((totalValue - totalPurchase) / totalPurchase) * 100
          : 0;

      setDisplaySummary({
        totalPurchaseAmount: totalPurchase,
        totalCurrentValue: totalValue,
        totalReturnRate: returnRate
      });
    };

    fetchAllPricesAndCalc();
    const id = setInterval(fetchAllPricesAndCalc, 10000);
    return () => clearInterval(id);
  }, [holdings]);

  const successRate = history?.successRate ?? 0;
  const eggIcon = successRate >= 10
      ? <img src={Egg1} className="ml-2 h-7 w-5" alt="egg1" />
      : <img src={Egg2} className="ml-2 h-7 w-5" alt="egg2" />;

  return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow-xl border border-[#1f1f2e]">
          <div className="mb-4 border-b border-[#232332] pb-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-100">내 실시간 잔고 요약</h2>
              {eggIcon}
            </div>
            <p className="mt-1 text-sm text-gray-400">
              총 수익률: <span className={`ml-1 font-semibold ${displaySummary.totalReturnRate >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
              {displaySummary.totalReturnRate.toFixed(2)}%
            </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#1f1f2e] p-4">
              <p className="text-sm text-gray-400">총 매입 금액</p>
              <p className="mt-1 text-lg font-bold text-gray-100">
                {displaySummary.totalPurchaseAmount.toLocaleString()}원
              </p>
            </div>
            <div className="rounded-lg bg-[#1f1f2e] p-4">
              <p className="text-sm text-gray-400">현재 평가 금액</p>
              <p className="mt-1 text-lg font-bold text-purple-400">
                {displaySummary.totalCurrentValue.toLocaleString()}원
              </p>
            </div>
          </div>
          <div className="mt-6">
            <HistoryReport history={{ totalReturnRate: displaySummary.totalReturnRate, successRate }} />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-[#14141c] p-6 shadow-xl border border-[#1f1f2e]">
          <div className="mb-6 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-100">보유 종목 현황</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b border-[#232332] text-gray-400">
                <th className="px-4 py-3 text-left">종목명</th>
                <th className="px-4 py-3 text-right">보유수량</th>
                <th className="px-4 py-3 text-right">매입가</th>
                <th className="px-4 py-3 text-right">현재가</th>
                <th className="px-4 py-3 text-right">수익률</th>
                <th className="px-4 py-3 text-center">알림 설정</th>
              </tr>
              </thead>
              <tbody>
              {holdings.map((h) => (
                  <HoldingStockRow
                      key={h.stockCode}
                      holdingStock={{
                        ...h,
                        stock: { name: h.stockName, stockCode: h.stockCode }
                      }}
                      // 내 전체 목표가 목록(existingTargets)에서 현재 종목 코드와 일치하는 것을 찾아 전달
                      initialTargets={existingTargets.find(t => t.stockCode === h.stockCode)}
                      currentPrice={priceMap[h.stockCode] || h.currentPrice}
                  />
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}