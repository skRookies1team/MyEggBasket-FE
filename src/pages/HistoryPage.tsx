import { useEffect, useState } from "react";
import { usePortfolioStore } from "../store/historyStore";
import HistoryAsset from "../components/HistoryReport/HistoryAsset";
import HistoryGraph from "../components/HistoryReport/HistoryGraph";

export default function HistoryPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] =
    useState<number | null>(null);

  const portfolios = usePortfolioStore((state) => state.portfolioList);
  const fetchPortfolio = usePortfolioStore((state) => state.fetchPortfolios);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return (
    // 🔥 Nav 높이 고려 (pt-20)
    <div className="min-h-screen bg-[#0a0a0f] px-4 pt-20 pb-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ---------- Portfolio Selector ---------- */}
        <div
          className="rounded-2xl bg-gradient-to-b
                     from-[#1a1a24] to-[#14141c]
                     p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-indigo-300">
            포트폴리오 선택
          </h2>

          {portfolios.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {portfolios.map((p) => (
                <button
                  key={p.portfolioId}
                  onClick={() => setSelectedPortfolioId(p.portfolioId)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition
                    ${
                      selectedPortfolioId === p.portfolioId
                        ? "bg-indigo-500/20 text-indigo-300 shadow-inner"
                        : "bg-[#14141c] text-gray-400 hover:text-gray-200 hover:bg-[#1f1f2e]"
                    }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              생성된 포트폴리오가 없습니다. 먼저 포트폴리오를 만들어주세요.
            </p>
          )}
        </div>

        {/* ---------- History Content ---------- */}
        {selectedPortfolioId !== null && (
          <div className="space-y-8">
            <HistoryAsset portfolioId={selectedPortfolioId} />
            <HistoryGraph />
          </div>
        )}
      </div>
    </div>
  );
}
