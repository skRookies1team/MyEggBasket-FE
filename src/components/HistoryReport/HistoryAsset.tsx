import { useEffect, useState } from "react";
import {
  useHistoryStore,
  useHoldingStore,
  usePortfolioStore,
} from "../../store/historyStore";

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";

import HistoryReport from "./HistoryReport";
import { Check, DollarSign, Pencil } from "lucide-react";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { fetchLowerTarget, fetchUpperTarget } from "../../api/targetPriceApi";

interface Props {
  portfolioId: number | null;
}

interface HoldingStockRowProps {
  holdingStock: any;
}

/* =========================
   개별 종목 Row (상한가/하한가 알림 추가)
========================= */
function HoldingStockRow({ holdingStock }: HoldingStockRowProps) {
  const [stockData, setStockData] = useState<{
    currentPrice: number;
    profit: number;
    rate: number;
  } | null>(null);

  // 상한가(Upper) 및 하한가(Lower) 상태 관리
  const [upperPrice, setUpperPrice] = useState<string>("");
  const [lowerPrice, setLowerPrice] = useState<string>("");
  
  // 각각의 확정 상태 관리
  const [isUpperConfirmed, setIsUpperConfirmed] = useState(false);
  const [isLowerConfirmed, setIsLowerConfirmed] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (stockData && !isInitialized) {
      // 초기값을 현재가 기준으로 세팅 (선택 사항)
      setUpperPrice(Math.floor(stockData.currentPrice * 1.1).toString()); // 10% 위
      setLowerPrice(Math.floor(stockData.currentPrice * 0.9).toString()); // 10% 아래
      setIsInitialized(true);
    }
  }, [stockData, isInitialized]);

  // 상한가 저장 핸들러
  const handleUpperConfirm = () => {
    setIsUpperConfirmed(true);
    console.log(`[상한가 알림 설정] ${holdingStock.stock.name}: ${upperPrice}원`);
    // TODO: 백엔드 API 호출 (Type: UPPER)
    const response = fetchUpperTarget(holdingStock.stock.stockCode, upperPrice);
    console.log(response);
  };

  // 하한가 저장 핸들러
  const handleLowerConfirm = () => {
    setIsLowerConfirmed(true);
    console.log(`[하한가 알림 설정] ${holdingStock.stock.name}: ${lowerPrice}원`);
    // TODO: 백엔드 API 호출 (Type: LOWER)
    const response = fetchLowerTarget(holdingStock.stock.stockCode, upperPrice);
    console.log(response);
  };

  useEffect(() => {
    async function getStockData() {
      const data = await fetchStockCurrentPrice(holdingStock.stock.stockCode);
      if (data) {
        const currentPrice = data.currentPrice;
        const profit = (currentPrice - holdingStock.avgPrice) * holdingStock.quantity;
        const rate = holdingStock.avgPrice > 0 
          ? ((currentPrice - holdingStock.avgPrice) / holdingStock.avgPrice) * 100 
          : 0;
        setStockData({ currentPrice, profit, rate });
      }
    }
    getStockData();
    const id = setInterval(getStockData, 1000);
    return () => clearInterval(id);
  }, [holdingStock]);

  if (!stockData) return null; // 생략 (기존 로딩 로직 유지)

  const { currentPrice, profit, rate } = stockData;
  const color = profit > 0 ? "text-red-400" : profit < 0 ? "text-blue-400" : "text-gray-300";

  return (
    <tr className="border-b border-[#232332] hover:bg-[#1f1f2e] transition">
      <td className="px-4 py-3 text-gray-200">{holdingStock.stock.name}</td>
      <td className="px-4 py-3 text-right text-gray-400">{holdingStock.quantity.toLocaleString()}</td>
      <td className="px-4 py-3 text-right text-gray-400">{holdingStock.avgPrice.toLocaleString()}원</td>
      <td className="px-4 py-3 text-right text-gray-200">{currentPrice.toLocaleString()}원</td>
      <td className={`px-4 py-3 text-right font-medium ${color}`}>
        {rate > 0 ? "+" : ""}{rate.toFixed(2)}%
      </td>

      {/* 알림 설정 구역 */}
      <td className="px-4 py-3 text-right space-y-2 min-w-[180px]">
        {/* --- 상한가 설정 --- */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] text-red-400/70 border border-red-400/30 px-1 rounded">상한</span>
          {isUpperConfirmed ? (
            <div className="flex items-center gap-1">
              <span className="text-red-300 text-xs">{Number(upperPrice).toLocaleString()}원</span>
              <button onClick={() => setIsUpperConfirmed(false)} className="text-gray-500 hover:text-red-400"><Pencil size={12} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input 
                type="number" value={upperPrice} 
                onChange={(e) => setUpperPrice(e.target.value)}
                className="w-20 rounded bg-[#0a0a0f] border border-[#2a2a35] px-1 py-0.5 text-right text-xs text-gray-200"
              />
              <button onClick={handleUpperConfirm} className="text-gray-500 hover:text-green-400"><Check size={14} /></button>
            </div>
          )}
        </div>

        {/* --- 하한가 설정 --- */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] text-blue-400/70 border border-blue-400/30 px-1 rounded">하한</span>
          {isLowerConfirmed ? (
            <div className="flex items-center gap-1">
              <span className="text-blue-300 text-xs">{Number(lowerPrice).toLocaleString()}원</span>
              <button onClick={() => setIsLowerConfirmed(false)} className="text-gray-500 hover:text-blue-400"><Pencil size={12} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <input 
                type="number" value={lowerPrice} 
                onChange={(e) => setLowerPrice(e.target.value)}
                className="w-20 rounded bg-[#0a0a0f] border border-[#2a2a35] px-1 py-0.5 text-right text-xs text-gray-200"
              />
              <button onClick={handleLowerConfirm} className="text-gray-500 hover:text-green-400"><Check size={14} /></button>
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
export default function HistoryAsset({ portfolioId }: Props) {
  const portfolios = usePortfolioStore((s) => s.portfolioList);
  const portfolio = portfolios.find((p) => p.portfolioId === portfolioId);

  // historyReport 대신 직접 계산할 상태 관리
  const history = useHistoryStore((s) => s.historyReport); // 성공률(Win Rate) 등을 위해 유지
  const fetchHistory = useHistoryStore((s) => s.fetchHistory);
  const holdings = useHoldingStore((s) => s.holdingList);
  const fetchHoldings = useHoldingStore((s) => s.fetchHoldings);

  // 실시간 합산 데이터 상태
  const [summary, setSummary] = useState({
    totalPurchaseAmount: 0, // 총 매입 금액
    totalCurrentValue: 0,   // 총 평가 금액
    totalReturnRate: 0      // 전체 수익률
  });

  useEffect(() => {
    if (portfolioId !== null) {
      fetchHistory(portfolioId);
      fetchHoldings(portfolioId);
    }
  }, [portfolioId, fetchHistory, fetchHoldings]);

  // 실시간 가격을 반영한 전체 합계 계산
  useEffect(() => {
    const calcTotalMetrics = async () => {
      if (holdings.length === 0) {
        setSummary({ totalPurchaseAmount: 0, totalCurrentValue: 0, totalReturnRate: 0 });
        return;
      }

      // 1. 모든 종목의 현재가 가져오기
      const priceResults = await Promise.all(
        holdings.map((h) => fetchStockCurrentPrice(h.stock.stockCode))
      );

      let totalPurchase = 0;
      let totalValue = 0;

      // 2. 합계 계산
      holdings.forEach((h, i) => {
        const currentPrice = priceResults[i]?.currentPrice ?? 0;
        totalPurchase += h.avgPrice * h.quantity;
        totalValue += currentPrice * h.quantity;
      });

      // 3. 수익률 계산
      const returnRate = totalPurchase > 0 
        ? ((totalValue - totalPurchase) / totalPurchase) * 100 
        : 0;

      setSummary({
        totalPurchaseAmount: totalPurchase,
        totalCurrentValue: totalValue,
        totalReturnRate: returnRate
      });
    };

    calcTotalMetrics();
    const interval = setInterval(calcTotalMetrics, 1000); // 1초마다 갱신
    return () => clearInterval(interval);
  }, [holdings]);

  if (!portfolio) {
    return <div className="rounded-xl bg-[#1a1a24] p-6 text-center text-gray-400">불러오는 중...</div>;
  }

  // UI용 가공 데이터
  const calculatedHistory = {
    totalReturnRate: summary.totalReturnRate,
    successRate: history?.successRate ?? 0, // 성공률은 기존 데이터 사용
  };

  const eggIcon = calculatedHistory.successRate >= 10 
    ? <img src={Egg1} className="ml-2 h-7 w-7" alt="egg" />
    : <img src={Egg2} className="ml-2 h-7 w-7" alt="egg" />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ---------- LEFT ---------- */}
      <div className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 border-b border-[#232332] pb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-100">{portfolio.name}</h2>
            {eggIcon}
          </div>
          <p className="mt-1 text-sm text-gray-400">
            위험 수준: <span className="ml-1 font-semibold text-indigo-400">{portfolio.riskLevel}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#1f1f2e] p-4">
            <p className="text-sm text-gray-400">총 매입 금액</p>
            <p className="mt-1 text-lg font-bold text-gray-100">
              {summary.totalPurchaseAmount.toLocaleString()}원
            </p>
          </div>
          <div className="rounded-lg bg-[#1f1f2e] p-4">
            <p className="text-sm text-gray-400">현재 평가 금액</p>
            <p className="mt-1 text-lg font-bold text-indigo-400">
              {summary.totalCurrentValue.toLocaleString()}원
            </p>
          </div>
        </div>

        <div className="mt-6">
          {/* 직접 계산한 calculatedHistory 전달 */}
          <HistoryReport history={calculatedHistory} />
        </div>
      </div>

      {/* ---------- RIGHT ---------- */}
      <div className="lg:col-span-3 rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            종목별 수익 현황
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#232332] text-gray-400">
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  종목명
                </th>
                <th className="px-4 py-3 text-right min-w-[80px] whitespace-nowrap">
                  보유수량
                </th>
                <th className="px-4 py-3 text-right min-w-[100px] whitespace-nowrap">
                  매입가
                </th>
                <th className="px-4 py-3 text-right min-w-[100px] whitespace-nowrap">
                  현재가
                </th>
                <th className="px-4 py-3 text-right min-w-[90px] whitespace-nowrap">
                  수익률
                </th>
                <th className="px-4 py-3 text-right min-w-[90px] whitespace-nowrap">
                  알림 설정가
                </th>

              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <HoldingStockRow
                  key={h.stock.stockCode}
                  holdingStock={h}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
