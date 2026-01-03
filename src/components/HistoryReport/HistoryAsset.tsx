import { useEffect, useState } from "react";
import {
  useHistoryStore,
} from "../../store/historyStore";
import { Check, DollarSign, Pencil } from "lucide-react";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { fetchLowerTarget, fetchUpperTarget, fetchPriceTargets } from "../../api/targetPriceApi";

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";
import HistoryReport from "./HistoryReport";
import { fetchUserBalance } from "../../api/accountApi";

interface HoldingStockRowProps {
  holdingStock: any;
  initialTargets?: { upperTarget?: number; lowerTarget?: number };
  currentPrice: number; // [추가] 부모에서 전달받을 현재가
}

/* =========================
   개별 종목 Row (수정됨: API 호출 제거)
========================= */
function HoldingStockRow({ holdingStock, initialTargets, currentPrice }: HoldingStockRowProps) {
  // 입력값 및 확정 상태
  const [upperPrice, setUpperPrice] = useState<string>("");
  const [lowerPrice, setLowerPrice] = useState<string>("");
  const [isUpperConfirmed, setIsUpperConfirmed] = useState(false);
  const [isLowerConfirmed, setIsLowerConfirmed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 초기값 세팅 여부

  // [수정] 수익률은 props로 받은 currentPrice를 이용해 즉시 계산
  const rate = holdingStock.avgPrice > 0
    ? ((currentPrice - holdingStock.avgPrice) / holdingStock.avgPrice) * 100
    : 0;

  // 1. 초기 목표가 세팅 (currentPrice가 로드된 후 한 번만 실행)
  useEffect(() => {
    if (currentPrice > 0 && !isInitialized) {
      // 상한가 세팅
      if (initialTargets?.upperTarget) {
        setUpperPrice(initialTargets.upperTarget.toString());
        setIsUpperConfirmed(true);
      } else {
        setUpperPrice(Math.floor(currentPrice * 1.05).toString());
        setIsUpperConfirmed(false);
      }

      // 하한가 세팅
      if (initialTargets?.lowerTarget) {
        setLowerPrice(initialTargets.lowerTarget.toString());
        setIsLowerConfirmed(true);
      } else {
        setLowerPrice(Math.floor(currentPrice * 0.95).toString());
        setIsLowerConfirmed(false);
      }

      setIsInitialized(true);
    }
  }, [currentPrice, initialTargets, isInitialized]);

  // 확인 버튼 핸들러
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

  // 색상 결정
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
   메인 컴포넌트 (수정됨: 시세 조회 통합)
========================= */
export default function HistoryAsset() {
  const history = useHistoryStore((s) => s.historyReport);
  
  // API로부터 받아온 원본 데이터 상태
  const [holdings, setHoldings] = useState<any[]>([]);
  const [accountSummary, setAccountSummary] = useState<any>(null);
  
  const [existingTargets, setExistingTargets] = useState<any[]>([]);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [displaySummary, setDisplaySummary] = useState({ 
    totalPurchaseAmount: 0, 
    totalCurrentValue: 0, 
    totalReturnRate: 0 
  });

  // 1. 초기 데이터 로드 (잔고 및 목표가)
  useEffect(() => {
    const initData = async () => {
      // 잔고 조회
      const balanceData = await fetchUserBalance();
      if (balanceData) {
        setHoldings(balanceData.holdings);
        setAccountSummary(balanceData.summary);
        
        // 초기 가격 맵 설정
        const initialPrices: Record<string, number> = {};
        balanceData.holdings.forEach((h: any) => {
          initialPrices[h.stockCode] = h.currentPrice;
        });
        setPriceMap(initialPrices);
      }

      // 알림 목표가 조회
      const targets = await fetchPriceTargets();
      if (targets) setExistingTargets(targets);
    };

    initData();
  }, []);

  // 2. 실시간 시세 일괄 조회 및 요약 계산 (기존 로직 유지)
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
        const currentPrice = priceResults[i]?.currentPrice || h.currentPrice; // API 결과 없으면 기존가 사용

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

  // 수익률에 따른 아이콘 로직 (기존 유지)
  const successRate = history?.successRate ?? 0;
  const eggIcon = successRate >= 10 
    ? <img src={Egg1} className="ml-2 h-7 w-7" alt="egg1" /> 
    : <img src={Egg2} className="ml-2 h-7 w-7" alt="egg2" />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* LEFT 섹션: 포트폴리오 요약 */}
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

      {/* RIGHT 섹션: 종목 리스트 */}
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
                  // 하위 컴포넌트 호환성을 위해 stock 객체 구조 유지
                  holdingStock={{
                    ...h,
                    stock: { name: h.stockName, stockCode: h.stockCode }
                  }}
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