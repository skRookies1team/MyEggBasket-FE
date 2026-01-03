import { useEffect, useState } from "react";
import type { RiskLevel } from "../../types/portfolios";
import { fetchUserBalance } from "../../api/accountApi";
import type { AccountHolding } from "../../types/stock";

interface AddPortfolioModalProps {
  onClose: () => void;
  onAdd: (data: {
    name: string;
    riskLevel: RiskLevel;
    totalAsset: 0;
    cashBalance: 0;
    selectedHoldings: AccountHolding[];
  }) => void;
}

export function AddPortfolioModal({
  onClose,
  onAdd,
}: AddPortfolioModalProps) {
  const [name, setName] = useState("");
  const [riskLevel, setRiskLevel] =
    useState<RiskLevel>("MODERATE");
  const [selectedHoldings, setSelectedHoldings] =
    useState<AccountHolding[]>([]);
  const [holdings, setHoldings] = useState<AccountHolding[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAdd = () => {
    if (!name.trim()) {
      alert("포트폴리오 이름을 입력해주세요.");
      return;
    }

    onAdd({
      name,
      riskLevel,
      totalAsset: 0,
      cashBalance: 0,
      selectedHoldings,
    });
    onClose();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserBalance();
        if (data)
          setHoldings(
            (data.holdings ?? []).filter((h: AccountHolding) => h.quantity > 0)
          );
      } catch (error) {
        console.error("잔고 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStockSelection = (stockCode: string) => {
    const target = holdings.find(
      (h) => h.stockCode === stockCode
    );
    if (!target) return;

    setSelectedHoldings((prev) =>
      prev.some((h) => h.stockCode === stockCode)
        ? prev.filter((h) => h.stockCode !== stockCode)
        : [...prev, target]
    );
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <ModalBackdrop onClose={onClose}>
        <p className="text-sm text-gray-400">
          보유 종목 로딩 중...
        </p>
      </ModalBackdrop>
    );
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="space-y-6">
        {/* Title */}
        <h2 className="text-lg font-semibold tracking-wide text-purple-300">
          새 포트폴리오 추가
        </h2>

        {/* Portfolio Name */}
        <Field label="포트폴리오 이름">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 나의 첫 번째 포트폴리오"
            className="w-full rounded-lg bg-[#1f1f2e] px-3 py-2 text-sm
                       text-gray-100 outline-none
                       focus:ring-2 focus:ring-purple-500/40"
          />
        </Field>

        {/* Risk Level */}
        <Field label="투자 성향">
          <select
            value={riskLevel}
            onChange={(e) =>
              setRiskLevel(e.target.value as RiskLevel)
            }
            className="w-full rounded-lg bg-[#1f1f2e] px-3 py-2 text-sm
                       text-gray-100 outline-none
                       focus:ring-2 focus:ring-purple-500/40"
          >
            <option value="AGGRESSIVE">
              위험형 (고수익 추구)
            </option>
            <option value="MODERATE">
              중립형 (균형 투자)
            </option>
            <option value="CONSERVATIVE">
              안전형 (안정성 중시)
            </option>
          </select>
        </Field>

        {/* Holdings */}
        {holdings.length > 0 ? (
          <div>
            <label className="mb-2 block text-xs text-gray-400">
              포트폴리오에 추가할 보유 종목
            </label>

            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg
                            border border-[#2e2e44] bg-[#14141c] p-2">
              {holdings.map((stock) => {
                const checked = selectedHoldings.some(
                  (h) => h.stockCode === stock.stockCode
                );

                return (
                  <label
                    key={stock.stockCode}
                    className="flex cursor-pointer items-start gap-3
                               rounded-md px-2 py-2 text-sm
                               hover:bg-[#1f1f2e]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        handleStockSelection(stock.stockCode)
                      }
                      className="mt-1 accent-purple-500"
                    />

                    <div className="text-gray-200">
                      <div className="font-medium">
                        {stock.stockName} ({stock.stockCode})
                      </div>
                      <div className="text-xs text-gray-400">
                        수량 {stock.quantity.toLocaleString()} ·
                        평단 {stock.avgPrice.toLocaleString()}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            추가할 수 있는 보유 종목이 없습니다.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 rounded-lg bg-purple-500/30 py-2
                       text-sm font-semibold text-purple-200
                       transition hover:bg-purple-500/40"
          >
            추가
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#26263a] py-2
                       text-sm text-gray-300
                       transition hover:bg-[#2e2e44]"
          >
            취소
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/* ---------------- Reusable UI ---------------- */

function ModalBackdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/60 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl
                   bg-gradient-to-b from-[#1a1a24] to-[#14141c]
                   p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
      >
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}
