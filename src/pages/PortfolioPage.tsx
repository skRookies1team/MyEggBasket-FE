import { useState, useEffect, useMemo } from "react";
import { Plus, X, TrendingUp } from "lucide-react";
import axios from "axios";

import type { AccountBalanceData, AccountHolding } from "../types/stock";
import type { Holding } from "../types/portfolios";

import { fetchUserBalance } from "../api/accountApi";
import { addPortfolio, deletePortfolio } from "../api/portfolioApi";
import { addHolding } from "../api/holdingApi";
import { getStockInfoFromDB } from "../api/stocksApi";

// [중요] HistoryStore(목록용)와 GlobalStore(알림 연동용) 구분 import
import { usePortfolioStore as useHistoryPortfolioStore, useHoldingStore } from "../store/historyStore";
import { usePortfolioStore as useGlobalPortfolioStore } from "../store/portfolioStore";

import { ProtfolioSummary } from "../components/Portfolio/PortfolioSummary";
import { PortfolioCharts } from "../components/Portfolio/PortfolioCharts";
import StockTrendCard from "../components/Portfolio/PortfolioStockTrendCard";
import { PortfolioStockList } from "../components/Portfolio/PortfolioStockList";
import { AddPortfolioModal } from "../components/Portfolio/AddPortfolioModal";
import { AddHoldingModal } from "../components/Portfolio/AddHoldingModal";

export interface AiRecommendation {
  recommendationId: number;
  portfolioId: number;
  stockCode: string;
  stockName: string;
  aiScore: number;
  actionType: "BUY" | "SELL" | "HOLD";
  currentHolding: number;
  targetHoldingDisplay: string;
  adjustmentAmount: number;
  reasonSummary: string;
  riskWarning: string;
  createdAt: string;
}

export function PortfolioPage() {
  /* =========================
     State
  ========================= */
  const [balanceData, setBalanceData] = useState<AccountBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectorCompositionData, setSectorCompositionData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, AiRecommendation>>({});

  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [activePortfolioId, setActivePortfolioId] = useState<number>();

  /* =========================
     Store
  ========================= */
  // 1. HistoryStore (목록 조회용)
  const portfolios = useHistoryPortfolioStore((s) => s.portfolioList);
  const fetchPortfolios = useHistoryPortfolioStore((s) => s.fetchPortfolios);

  // 2. GlobalStore (Layout 알림 연동용)
  const setSelectedPortfolioId = useGlobalPortfolioStore((s) => s.setSelectedPortfolioId);

  // 3. HoldingStore
  const holdings = useHoldingStore((s) => s.holdingList);
  const fetchHoldings = useHoldingStore((s) => s.fetchHoldings);

  /* =========================
     초기 로딩 (수정된 부분)
  ========================= */

  // [복구됨] 이 코드가 없어서 포트폴리오 목록이 안 보였습니다.
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // [추가] 포트폴리오 목록이 로드되면 첫 번째 포트폴리오를 자동으로 선택 (UX 개선)
  useEffect(() => {
    if (!activePortfolioId && portfolios.length > 0) {
      const firstId = portfolios[0].portfolioId;
      setActivePortfolioId(firstId);
      fetchHoldings(firstId); // 해당 포트폴리오의 종목도 같이 로드
    }
  }, [portfolios, activePortfolioId, fetchHoldings]);

  // 선택된 포트폴리오가 변경되면 전역 스토어(Layout)에 알림
  useEffect(() => {
    if (activePortfolioId) {
      setSelectedPortfolioId(activePortfolioId);
    }
  }, [activePortfolioId, setSelectedPortfolioId]);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await fetchUserBalance();
        if (data) setBalanceData(data);
      } catch (e) {
        console.error("잔고 로딩 실패", e);
      } finally {
        setLoading(false);
      }
    };
    loadBalance();
  }, []);

  /* =========================
     AI 분석 데이터 Fetching
  ========================= */
  useEffect(() => {
    const fetchAiDetails = async () => {
      if (!activePortfolioId) return;

      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

        const response = await axios.get<AiRecommendation[]>(
            `http://localhost:8081/api/app/portfolios/${activePortfolioId}/ai-recommendations`,
            {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              }
            }
        );

        const data = response.data;
        const latestMap: Record<string, AiRecommendation> = {};

        const sortedData = data.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        sortedData.forEach((item) => {
          if (!latestMap[item.stockCode]) {
            latestMap[item.stockCode] = item;
          }
        });

        setAiAnalysisMap(latestMap);

      } catch (error: any) {
        setAiAnalysisMap({});
      }
    };

    fetchAiDetails();
  }, [activePortfolioId]);

  /* =========================
     자산 요약 계산
  ========================= */
  const myAssets = useMemo(() => {
    if (!balanceData || !holdings) {
      return { total: 0, totalCash: 0, D1Cash: 0, D2Cash: 0, profit: 0, profitRate: 0, stockEval: 0 };
    }
    const { summary } = balanceData;
    const accountHoldings = balanceData.holdings ?? [];
    let totalProfit = 0;
    let totalStockEval = 0;

    holdings.forEach((h) => {
      const found = accountHoldings.find((a) => a.stockCode === h.stock.stockCode);
      if (found) {
        totalProfit += found.profitLossAmount || 0;
        totalStockEval += found.evaluationAmount || 0;
      }
    });

    const totalCash = summary.totalCashAmount;
    const total = totalCash + totalStockEval;

    // 전체 자산 기준 수익률 (현금 포함)
    const totalPrincipal = total - totalProfit;
    const profitRate = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;

    return { total, totalCash, D1Cash: summary.d1CashAmount, D2Cash: summary.d2CashAmount, profit: totalProfit, profitRate, stockEval: totalStockEval };
  }, [balanceData, holdings]);

  /* =========================
     차트 데이터 계산
  ========================= */
  const stockCompositionData = useMemo(() => {
    const valid = holdings.filter((h) => h.quantity > 0);
    if (valid.length === 0) return [];
    const sorted = [...valid].sort((a, b) => b.avgPrice * b.quantity - a.avgPrice * a.quantity);
    const top = sorted.slice(0, 4);
    const otherValue = sorted.slice(4).reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
    const COLORS = ["#ff383c", "#4f378a", "#00b050", "#ffa500"];
    const data = top.map((h, i) => ({ name: h.stock.name, value: h.avgPrice * h.quantity, color: COLORS[i % COLORS.length] }));
    if (otherValue > 0) data.push({ name: "기타", value: otherValue, color: "#9ca3af" });
    return data;
  }, [holdings]);

  useEffect(() => {
    const loadSectors = async () => {
      if (!holdings || holdings.length === 0) return;
      const valid = holdings.filter((h) => h.quantity > 0);
      const results = await Promise.all(
          valid.map(async (h: Holding) => {
            const info = await getStockInfoFromDB(h.stock.stockCode);
            return { sector: info?.sector?.trim() || "기타", value: h.avgPrice * h.quantity };
          })
      );
      const sectorMap: Record<string, number> = {};
      results.forEach(({ sector, value }) => { sectorMap[sector] = (sectorMap[sector] || 0) + value; });
      const COLORS = ["#4f378a", "#ffa500", "#0066ff", "#ff383c", "#00b050"];
      setSectorCompositionData(Object.entries(sectorMap).map(([name, value], i) => ({ name, value, color: name === "기타" ? "#9ca3af" : COLORS[i % COLORS.length] })));
    };
    loadSectors();
  }, [holdings]);

  // 핸들러들
  const addNewHolding = async (selectedHoldings: AccountHolding[]) => {
    if (!activePortfolioId) return;
    try {
      await Promise.all(
          selectedHoldings.map((h) =>
              addHolding(activePortfolioId, {
                stockCode: h.stockCode,
                quantity: h.quantity,
                avgPrice: h.avgPrice,
                currentWeight: 0,
                targetWeight: 0,
              })
          )
      );
      await fetchHoldings(activePortfolioId);
      await fetchPortfolios();
    } catch (e) {
      console.error(e);
    } finally {
      setShowAddHolding(false);
    }
  };

  const addNewPortfolio = async (data: any) => {
    const { selectedHoldings, ...portfolioData } = data;
    try {
      const newPortfolio = await addPortfolio(portfolioData);
      if (!newPortfolio?.portfolioId) return;
      await Promise.all(
          selectedHoldings.map((h:any) =>
              addHolding(newPortfolio.portfolioId, {
                stockCode: h.stockCode,
                quantity: h.quantity,
                avgPrice: h.avgPrice,
                currentWeight: 0,
                targetWeight: 0,
              })
          )
      );
      await fetchPortfolios();
      setActivePortfolioId(newPortfolio.portfolioId);
    } catch (e) {
      console.error(e);
    } finally {
      setShowAddPortfolio(false);
    }
  };

  const removePortfolio = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await deletePortfolio(id);
    await fetchPortfolios();
    if (activePortfolioId === id) setActivePortfolioId(undefined);
  };

  const activePortfolio = portfolios.find((p) => p.portfolioId === activePortfolioId);

  return (
      <div className="min-h-screen bg-[#0a0a0f] px-4 pt-16 pb-6">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header & Tabs */}
          <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-lg font-semibold tracking-wide text-purple-300">AI 추천 포트폴리오</h1>
            <button onClick={() => setShowAddPortfolio(true)} className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600 transition">
              <Plus size={16} /> 포트폴리오 추가
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {portfolios.map((p) => (
                <div key={p.portfolioId} className="flex items-center gap-1 rounded-lg bg-[#14141c] px-2 py-1">
                  <button
                      onClick={async () => {
                        setActivePortfolioId(p.portfolioId);
                        await fetchHoldings(p.portfolioId);
                      }}
                      className={`rounded-md px-3 py-1 text-sm transition ${activePortfolioId === p.portfolioId ? "bg-purple-500/20 text-purple-300" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    {p.name}
                  </button>
                  {portfolios.length > 1 && <button onClick={() => removePortfolio(p.portfolioId)} className="rounded-md p-1 hover:bg-red-500/10"><X size={12} className="text-red-400" /></button>}
                </div>
            ))}
          </div>

          {activePortfolio && (
              <div className="flex justify-end">
                <button onClick={() => setShowAddHolding(true)} className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20">
                  <Plus size={14} /> 이 포트폴리오에 종목 추가
                </button>
              </div>
          )}

          {/* Content */}
          {activePortfolio && (
              <div className="space-y-8">
                <ProtfolioSummary assetData={myAssets} loading={loading} />
                <PortfolioCharts stockData={stockCompositionData} sectorData={sectorCompositionData} />

                {/* 내 보유 주식 추이 */}
                <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="mb-5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <h3 className="text-sm font-semibold tracking-wide text-purple-300">내 보유 주식 추이</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {holdings.filter((h) => h.quantity > 0).map((h) => {
                      const balanceItem = balanceData?.holdings?.find((b) => b.stockCode === h.stock.stockCode);
                      let currentProfitRate = 0;
                      if (balanceItem && balanceItem.evaluationAmount > 0) {
                        const invested = h.avgPrice * h.quantity;
                        if (invested > 0) currentProfitRate = ((balanceItem.evaluationAmount - invested) / invested) * 100;
                      }

                      const aiData = aiAnalysisMap[h.stock.stockCode];
                      const aiReason = aiData ? `${aiData.reasonSummary}` : "";
                      const aiScore = aiData?.aiScore;

                      return (
                          <StockTrendCard
                              key={h.stock.stockCode}
                              stockCode={h.stock.stockCode}
                              name={h.stock.name}
                              quantity={h.quantity}
                              avgPrice={h.avgPrice}
                              profitRate={currentProfitRate}
                              aiAnalysis={aiReason}
                              aiScore={aiScore}
                          />
                      );
                    })}
                  </div>
                </div>

                <PortfolioStockList
                    stocks={activePortfolio.holdings}
                    aiAnalysisMap={aiAnalysisMap}
                    balanceData={balanceData}
                />
              </div>
          )}

          {showAddPortfolio && <AddPortfolioModal onClose={() => setShowAddPortfolio(false)} onAdd={addNewPortfolio} />}
          {showAddHolding && <AddHoldingModal onClose={() => setShowAddHolding(false)} onAdd={addNewHolding} currentHoldings={activePortfolio?.holdings} />}
        </div>
      </div>
  );
}