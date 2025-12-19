import { useState, useEffect, useMemo } from "react";
import { Plus, X, TrendingUp } from "lucide-react";

import type { AccountBalanceData, AccountHolding } from "../types/stock";
import type { Holding, RiskLevel } from "../types/portfolios";

import { fetchUserBalance } from "../api/accountApi";
import { addPortfolio, deletePortfolio } from "../api/portfolioApi";
import { addHolding } from "../api/holdingApi";
import { getStockInfoFromDB } from "../api/stocksApi";

import { useHoldingStore, usePortfolioStore } from "../store/historyStore";

import { ProtfolioSummary } from "../components/Portfolio/PortfolioSummary";
import { PortfolioCharts } from "../components/Portfolio/PortfolioCharts";
import  StockTrendCard  from "../components/Portfolio/ProtfolioStockTrendCard";
import { PortfolioStockList } from "../components/Portfolio/PortfolioStockList";
import { AddPortfolioModal } from "../components/Portfolio/AddPortfolioModal";

import "../assets/PortfolioPage.css";

export function PortfolioPage() {
  /* =========================
     State
  ========================= */
  const [balanceData, setBalanceData] =
    useState<AccountBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectorCompositionData, setSectorCompositionData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [activePortfolioId, setActivePortfolioId] = useState<number>();

  /* =========================
     Store
  ========================= */
  const portfolios = usePortfolioStore((s) => s.portfolioList);
  const fetchPortfolios = usePortfolioStore((s) => s.fetchPortfolios);

  const holdings = useHoldingStore((s) => s.holdingList);
  const fetchHoldings = useHoldingStore((s) => s.fetchHoldings);

  /* =========================
     초기 로딩
  ========================= */
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

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
     자산 요약 계산
  ========================= */
  const myAssets = useMemo(() => {
    if (!balanceData || !holdings) {
      return {
        total: 0,
        totalCash: 0,
        D1Cash: 0,
        D2Cash: 0,
        profit: 0,
        profitRate: 0,
        stockEval: 0,
      };
    }

    const { summary } = balanceData;
    const accountHoldings = balanceData.holdings ?? [];

    let totalProfit = 0;
    let totalStockEval = 0;

    holdings.forEach((h) => {
      const found = accountHoldings.find(
        (a) => a.stockCode === h.stock.stockCode
      );
      if (found) {
        totalProfit += found.profitLossAmount || 0;
        totalStockEval += found.evaluationAmount || 0;
      }
    });

    const totalCash = summary.totalCashAmount;
    const total = totalCash + totalStockEval;
    const profitRate =
      totalStockEval > 0
        ? (totalProfit / (totalStockEval - totalProfit)) * 100
        : 0;

    return {
      total,
      totalCash,
      D1Cash: summary.d1CashAmount,
      D2Cash: summary.d2CashAmount,
      profit: totalProfit,
      profitRate,
      stockEval: totalStockEval,
    };
  }, [balanceData, holdings]);

  /* =========================
     차트 데이터
  ========================= */
  
  const stockCompositionData = useMemo(() => {
    if (!holdings) return [];

    const valid = holdings.filter((h) => h.quantity > 0);
    const sorted = [...valid].sort(
      (a, b) => b.avgPrice * b.quantity - a.avgPrice * a.quantity
    );

    const top = sorted.slice(0, 4);
    const otherValue = sorted
      .slice(4)
      .reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);

    const data = top.map((h, i) => ({
      name: h.stock.name,
      value: h.avgPrice * h.quantity,
      color: ["#ff383c", "#4f378a", "#00b050", "#ffa500"][i % 4],
    }));

    if (otherValue > 0) {
      data.push({ name: "기타", value: otherValue, color: "#d9d9d9" });
    }

    return data;
  }, [holdings]);

  /* =========================
     섹터 비중
  ========================= */
  useEffect(() => {
    const loadSectors = async () => {
      if (!holdings || holdings.length === 0) return;

      const valid = holdings.filter((h) => h.quantity > 0);
      const results = await Promise.all(
        valid.map(async (h: Holding) => {
          const info = await getStockInfoFromDB(h.stock.stockCode);
          return {
            sector: info?.sector?.trim() || "기타",
            value: h.avgPrice * h.quantity,
          };
        })
      );

      const sectorMap: Record<string, number> = {};
      results.forEach(({ sector, value }) => {
        sectorMap[sector] = (sectorMap[sector] || 0) + value;
      });

      const COLORS = [
        "#4f378a",
        "#ffa500",
        "#0066ff",
        "#ff383c",
        "#00b050",
      ];

      setSectorCompositionData(
        Object.entries(sectorMap).map(([name, value], i) => ({
          name,
          value,
          color: name === "기타" ? "#d9d9d9" : COLORS[i % COLORS.length],
        }))
      );
    };

    loadSectors();
  }, [holdings]);

  /* =========================
     포트폴리오 추가
  ========================= */
  const addNewPortfolio = async (data: {
    name: string;
    riskLevel: RiskLevel;
    totalAsset: 0;
    cashBalance: 0;
    selectedHoldings: AccountHolding[];
  }) => {
    const { selectedHoldings, ...portfolioData } = data;

    try {
      const newPortfolio = await addPortfolio(portfolioData);
      if (!newPortfolio?.portfolioId) return;

      await Promise.all(
        selectedHoldings.map((h) =>
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
      console.error("포트폴리오 추가 실패", e);
      alert("포트폴리오 추가 실패");
    } finally {
      setShowAddPortfolio(false);
    }
  };

  const removePortfolio = async (id: number) => {
    if (!confirm("정말 포트폴리오를 삭제하시겠습니까?")) return;
    await deletePortfolio(id);
    await fetchPortfolios();
  };

  const activePortfolio = portfolios.find(
    (p) => p.portfolioId === activePortfolioId
  );

  /* =========================
     Render
  ========================= */
  return (
    <div className="portfolio-container">
      <div className="portfolio-wrapper">
        {/* Header */}
        <div className="portfolio-header">
          <h1 className="portfolio-title">AI 추천 포트폴리오</h1>
          <button
            onClick={() => setShowAddPortfolio(true)}
            className="btn-add-portfolio"
          >
            <Plus size={16} /> 새 포트폴리오 추가
          </button>
        </div>

        {/* Tabs */}
        <div className="portfolio-tabs">
          {portfolios.map((p) => (
            <div key={p.portfolioId} className="tab-item">
              <button
                className={`btn-tab ${
                  activePortfolioId === p.portfolioId ? "active" : ""
                }`}
                onClick={async () => {
                  setActivePortfolioId(p.portfolioId);
                  await fetchHoldings(p.portfolioId);
                }}
              >
                {p.name}
              </button>
              {portfolios.length > 1 && (
                <button
                  className="btn-remove-tab"
                  onClick={() => removePortfolio(p.portfolioId)}
                >
                  <X size={12} color="#ff383c" />
                </button>
              )}
            </div>
          ))}
        </div>

        {activePortfolio && (
          <div className="animate-in">
            <ProtfolioSummary assetData={myAssets} loading={loading} />

            <PortfolioCharts
              stockData={stockCompositionData}
              sectorData={sectorCompositionData}
            />

            <div className="section-card">
              <div className="section-header">
                <TrendingUp size={18} />
                <h3 className="section-title">내 보유 주식 추이</h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                }}
              >
                {holdings
                  .filter((h) => h.quantity > 0)
                  .map((h) => (
                    <StockTrendCard
                      key={h.stock.stockCode}
                      stockCode={h.stock.stockCode}
                      name={h.stock.name}
                      quantity={h.quantity}
                      avgPrice={h.avgPrice}
                    />
                  ))}
              </div>
            </div>

            <PortfolioStockList stocks={activePortfolio.holdings} />
          </div>
        )}

        {showAddPortfolio && (
          <AddPortfolioModal
            onClose={() => setShowAddPortfolio(false)}
            onAdd={addNewPortfolio}
          />
        )}
      </div>
    </div>
  );
}
