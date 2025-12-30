import { useEffect, useState, useMemo } from "react";
import { useHoldingStore } from "../../store/historyStore";
import { Check, DollarSign, Pencil } from "lucide-react";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { fetchLowerTarget, fetchUpperTarget, fetchPriceTargets } from "../../api/targetPriceApi";

interface Props {
  portfolioId: number | null;
}

interface HoldingStockRowProps {
  holdingStock: any;
  initialTargets?: { upperPrice?: number; lowerPrice?: number };
}

function HoldingStockRow({ holdingStock, initialTargets }: HoldingStockRowProps) {
  const [stockData, setStockData] = useState<{ currentPrice: number; profit: number; rate: number } | null>(null);
  const [upperPrice, setUpperPrice] = useState<string>("");
  const [lowerPrice, setLowerPrice] = useState<string>("");
  const [isUpperConfirmed, setIsUpperConfirmed] = useState(false);
  const [isLowerConfirmed, setIsLowerConfirmed] = useState(false);

  // 1. 기존 설정값이 있으면 초기값으로 세팅 및 '확인' 상태로 변경
  useEffect(() => {
    if (initialTargets) {
      if (initialTargets.upperPrice) {
        setUpperPrice(initialTargets.upperPrice.toString());
        setIsUpperConfirmed(true);
      }
      if (initialTargets.lowerPrice) {
        setLowerPrice(initialTargets.lowerPrice.toString());
        setIsLowerConfirmed(true);
      }
    }
  }, [initialTargets]);

  // 2. 실시간 시세 조회
  useEffect(() => {
    async function getStockData() {
      const data = await fetchStockCurrentPrice(holdingStock.stock.stockCode);
      if (data) {
        const currentPrice = data.currentPrice;
        const profit = (currentPrice - holdingStock.avgPrice) * holdingStock.quantity;
        const rate = holdingStock.avgPrice > 0 ? ((currentPrice - holdingStock.avgPrice) / holdingStock.avgPrice) * 100 : 0;
        setStockData({ currentPrice, profit, rate });
      }
    }
    getStockData();
    const id = setInterval(getStockData, 3000);
    return () => clearInterval(id);
  }, [holdingStock]);

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

  if (!stockData) return null;

  const { currentPrice, rate } = stockData;
  const color = rate > 0 ? "text-red-400" : rate < 0 ? "text-blue-400" : "text-gray-300";

  // 3. Placeholder 값 계산 (현재가 기준 ±5%)
  const upperPlaceholder = Math.floor(currentPrice * 1.05).toLocaleString();
  const lowerPlaceholder = Math.floor(currentPrice * 0.95).toLocaleString();

  return (
    <tr className="border-b border-[#232332] hover:bg-[#1f1f2e] transition">
      <td className="px-4 py-3 text-gray-200">{holdingStock.stock.name}</td>
      <td className="px-4 py-3 text-right text-gray-400">{holdingStock.quantity.toLocaleString()}</td>
      <td className="px-4 py-3 text-right text-gray-400">{holdingStock.avgPrice.toLocaleString()}원</td>
      <td className="px-4 py-3 text-right text-gray-200">{currentPrice.toLocaleString()}원</td>
      <td className={`px-4 py-3 text-right font-medium ${color}`}>{rate > 0 ? "+" : ""}{rate.toFixed(2)}%</td>

      <td className="px-4 py-3 text-right space-y-2 min-w-[180px]">
        {/* 상한가 설정 */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] text-red-400/70 border border-red-400/30 px-1 rounded">상한</span>
          {isUpperConfirmed ? (
            <div className="flex items-center gap-1">
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
                placeholder={upperPlaceholder}
                className="w-20 rounded bg-[#0a0a0f] border border-[#2a2a35] px-1 py-0.5 text-right text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-red-500" 
              />
              <button onClick={handleUpperConfirm} className="text-gray-500 hover:text-green-400"><Check size={14} /></button>
            </div>
          )}
        </div>
        {/* 하한가 설정 */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] text-blue-400/70 border border-blue-400/30 px-1 rounded">하한</span>
          {isLowerConfirmed ? (
            <div className="flex items-center gap-1">
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
                placeholder={lowerPlaceholder}
                className="w-20 rounded bg-[#0a0a0f] border border-[#2a2a35] px-1 py-0.5 text-right text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500" 
              />
              <button onClick={handleLowerConfirm} className="text-gray-500 hover:text-green-400"><Check size={14} /></button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function HistoryAsset({ portfolioId }: Props) {
  const holdings = useHoldingStore((state) => state.holdingList);
  const fetchHoldings = useHoldingStore((state) => state.fetchHoldings);
  const [existingTargets, setExistingTargets] = useState<any[]>([]);

  useEffect(() => {
    if (portfolioId) {
      fetchHoldings(portfolioId);
      fetchPriceTargets().then(data => { 
        if (data) setExistingTargets(data); 
      });
    }
  }, [portfolioId, fetchHoldings]);

  return (
    <div className="rounded-2xl bg-[#14141c] p-6 shadow-xl border border-[#1f1f2e]">
      <div className="mb-6 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-gray-100">종목별 수익 및 알림 현황</h2>
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
              <th className="px-4 py-3 text-right">알림 설정</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <HoldingStockRow 
                key={h.holdingId} 
                holdingStock={h} 
                initialTargets={existingTargets.find(t => t.stockCode === h.stock.stockCode)} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}