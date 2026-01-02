import { useEffect, useState } from "react";
import { fetchUserBalance } from "../../api/accountApi";
import type { AccountHolding } from "../../types/stock";
import type { Holding } from "../../types/portfolios";

interface AddHoldingModalProps {
  onClose: () => void;
  onAdd: (selectedHoldings: AccountHolding[]) => void;
  currentHoldings?: Holding[];
}

export function AddHoldingModal({ onClose, onAdd, currentHoldings }: AddHoldingModalProps) {
  const [holdings, setHoldings] = useState<AccountHolding[]>([]);
  const [selectedHoldings, setSelectedHoldings] = useState<AccountHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserBalance();
        if (data) {
          // 이미 포트폴리오에 있는 종목은 목록에서 제외 (필터링)
          const filtered = (data.holdings ?? []).filter(
            (h:any) => !currentHoldings?.some((ch) => ch.stock.stockCode === h.stockCode)
          );
          setHoldings(filtered);
        }
      } catch (error) {
        console.error("잔고 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentHoldings]);

  const handleStockSelection = (stockCode: string) => {
    const target = holdings.find((h) => h.stockCode === stockCode);
    if (!target) return;

    setSelectedHoldings((prev) =>
      prev.some((h) => h.stockCode === stockCode)
        ? prev.filter((h) => h.stockCode !== stockCode)
        : [...prev, target]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold text-purple-300">종목 추가하기</h2>
        
        {loading ? (
          <p className="py-10 text-center text-sm text-gray-400">보유 종목 로딩 중...</p>
        ) : holdings.length > 0 ? (
          <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-[#2e2e44] bg-[#14141c] p-2">
            {holdings.map((stock) => (
              <label key={stock.stockCode} className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-[#1f1f2e]">
                <input
                  type="checkbox"
                  checked={selectedHoldings.some((h) => h.stockCode === stock.stockCode)}
                  onChange={() => handleStockSelection(stock.stockCode)}
                  className="mt-1 accent-purple-500"
                />
                <div className="text-gray-200">
                  <div className="font-medium">{stock.stockName} ({stock.stockCode})</div>
                  <div className="text-xs text-gray-400">잔고: {stock.quantity}주</div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">추가할 수 있는 새로운 종목이 없습니다.</p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => onAdd(selectedHoldings)}
            disabled={selectedHoldings.length === 0}
            className="flex-1 rounded-lg bg-purple-500 py-2 text-sm font-semibold text-white transition disabled:opacity-30"
          >
            선택 종목 추가
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg bg-[#26263a] py-2 text-sm text-gray-300 transition hover:bg-[#2e2e44]">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}