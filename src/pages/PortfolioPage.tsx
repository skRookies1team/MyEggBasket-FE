import { useState, useEffect, useMemo } from 'react';
import { Plus, X, TrendingUp } from 'lucide-react';
import { getStockInfoFromDB } from '../api/stockApi';
import type { AccountBalanceData } from '../types/stock';

// 스타일 및 컴포넌트 임포트
import '../assets/PortfolioPage.css';
import { fetchUserBalance } from '../api/accountApi';
import { addPortfolio, deletePortfolio } from '../api/portfolioApi';
import { useHistoryStore, useHoldingStore, usePortfolioStore } from '../store/historyStore';
import type { Holding, RiskLevel } from '../types/portfolios';
import { AssetSummary } from '../components/Portfolio/AssetSummary';
import { PortfolioCharts } from '../components/Portfolio/PortfolioCharts';
import StockTrendCard from '../components/Portfolio/StockTrendCard';
import { AddPortfolioModal } from '../components/Portfolio/AddPortfolioModal';

export function PortfolioPage() {
    const [balanceData, setBalanceData] = useState<AccountBalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sectorCompositionData, setSectorCompositionData] = useState<{ name: string, value: number, color: string }[]>([]);
    const [showAddPortfolio, setShowAddPortfolio] = useState(false);
    const [activePortfolioId, setActivePortfolioId] = useState<number>();

    const portfolios = usePortfolioStore((state) => state.portfolioList);
    const fetchPortfolios = usePortfolioStore((state) => state.fetchPortfolios);

    const holdings = useHoldingStore((state) => state.holdingList);
    const fetchHoldings = useHoldingStore((state) => state.fetchHoldings);

    useEffect(() => {
        fetchPortfolios();
    }, [fetchPortfolios])

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchUserBalance();
                if (data)
                    setBalanceData(data);
            } catch (error) {
                console.error("잔고 로딩 실패", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const myAssets = useMemo(() => {
        if (!balanceData) return { total: 0, cash: 0, profit: 0, profitRate: 0, stockEval: 0, investment: 0 };
        const { summary } = balanceData;

        const total = summary.totalEvaluationAmount;
        const cash = summary.cashAmount;
        const profit = summary.totalProfitLossAmount;
        const stockEval = total - cash;
        const investment = total - profit;
        const profitRate = investment !== 0 ? (profit / investment) * 100 : 0;
        return { total, cash, investment, profit, profitRate, stockEval }; // stockEval 추가
    }, [balanceData]);

    const assetCompositionData = useMemo(() => {
        if (myAssets.total === 0) return [];
        return [
            { name: '주식', value: myAssets.stockEval, color: '#4f378a' },
            { name: '현금', value: myAssets.cash, color: '#00b050' },
        ];
    }, [myAssets]);

    const stockCompositionData = useMemo(() => {
        if (!holdings) return [];

        // 1. 보유 수량이 0보다 큰 종목만 필터링
        const validHoldings = holdings.filter(item => item.quantity > 0);

        // 2. 평가금액 순으로 정렬
        const sorted = [...validHoldings].sort((a, b) => (b.avgPrice * b.quantity - a.avgPrice * a.quantity));

        // 3. 상위 4개 종목과 나머지(기타)로 분류
        const topStocks = sorted.slice(0, 4);
        const otherValue = sorted.slice(4).reduce((sum, item) => sum + item.avgPrice * item.quantity, 0);

        const data = topStocks.map((holdingStock, index) => ({
            name: holdingStock.stock.name,
            value: holdingStock.quantity * holdingStock.avgPrice,
            color: ['#ff383c', '#4f378a', '#00b050', '#ffa500'][index % 4]
        }));

        if (otherValue > 0) {
            data.push({ name: '기타', value: otherValue, color: '#d9d9d9' });
        }

        return data;
    }, [holdings]);

    useEffect(() => {
        const calculateSectorComposition = async () => {
            if (!holdings || holdings.length === 0) {
                setSectorCompositionData([]);
                return;
            }

            // 1. 보유 수량이 0보다 큰 종목만 필터링
            const validHoldings = holdings.filter(item => item.quantity > 0);

            if (validHoldings.length === 0) {
                setSectorCompositionData([]);
                return;
            }

            // 2. 각 종목의 섹터 정보 비동기 병렬 조회
            const promises = validHoldings.map(async (holdingStock: Holding) => {
                const info = await getStockInfoFromDB(holdingStock.stock.stockCode);
                const sectorName = (info && info.sector && info.sector.trim() !== "") ? info.sector : '기타';
                return {
                    sector: sectorName,
                    value: holdingStock.quantity * holdingStock.avgPrice,
                };
            });

            const results = await Promise.all(promises);

            // 3. 섹터별 금액 합산 (Grouping)
            const sectorMap: Record<string, number> = {};
            results.forEach(({ sector, value }: { sector: string; value: number }) => {
                sectorMap[sector] = (sectorMap[sector] || 0) + value;
            });

            // 4. 배열 변환 및 정렬 (금액 높은 순)
            const sortedSectors = Object.entries(sectorMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            // 5. 색상 할당
            const COLORS = ['#4f378a', '#ffa500', '#0066ff', '#ff383c', '#00b050', '#00bcd4', '#795548'];

            const finalData = sortedSectors.map((item, index) => ({
                name: item.name,
                value: item.value,
                // '기타'는 회색, 나머지는 순서대로 색상 부여
                color: item.name === '기타' ? '#d9d9d9' : COLORS[index % COLORS.length]
            }));

            setSectorCompositionData(finalData);
        };

        calculateSectorComposition();
    }, [holdings]);

    const getTypeColor = (type: string) => type === 'AGGRESSIVE' ? '#ff383c' : type === 'MODERATE' ? '#4f378a' : '#00b050';
    const getTypeLabel = (type: string) => type === 'AGGRESSIVE' ? '위험형' : type === 'MODERATE' ? '중립형' : '안전형';

    // 포트폴리오 추가
    const addNewPortfolio = async (data: { name: string, riskLevel: RiskLevel, totalAsset: 0, cashBalance: 0 }) => {
        try {
            const newPortfolio = await addPortfolio(data);
            if (newPortfolio) {
                await fetchPortfolios();
            }
        } catch (error) {
            console.error("포트폴리오 추가 실패:", error);
            alert("포트폴리오 추가에 실패했습니다.");
        } finally {
            setShowAddPortfolio(false); // 모달 닫기
        }
    };
    // 포트폴리오 삭제
    const removePortfolio = async (id: number) => {
        await deletePortfolio(id);
    };

    const activePortfolio = portfolios.find((portfolio) => portfolio.portfolioId === activePortfolioId);


    return (
        <div className="portfolio-container">
            <div className="portfolio-wrapper">

                {/* Header */}
                <div className="portfolio-header">
                    <h1 className="portfolio-title">AI 추천 포트폴리오</h1>
                    <button onClick={() => setShowAddPortfolio(true)} className="btn-add-portfolio">
                        <Plus size={16} />
                        새 포트폴리오 추가
                    </button>
                </div>

                {/* Tabs */}
                <div className="portfolio-tabs">
                    {portfolios.map((portfolio) => (
                        <div key={portfolio.portfolioId} className="tab-item">
                            <button
                                onClick={async () => {
                                    setActivePortfolioId(portfolio.portfolioId);
                                    await fetchHoldings(portfolio.portfolioId);
                                }}
                                className={`btn-tab ${activePortfolioId === portfolio.portfolioId ? 'active' : ''}`}
                            >
                                <span>{portfolio.name}</span>
                                <span style={{ fontSize: '12px', color: getTypeColor(portfolio.riskLevel) }}>
                                    ({getTypeLabel(portfolio.riskLevel)})
                                </span>
                            </button>
                            {
                                portfolios.length > 1 && (
                                    <button onClick={async () => {
                                        removePortfolio(portfolio.portfolioId)
                                        await fetchPortfolios();
                                    }
                                    } className="btn-remove-tab">
                                        <X size={12} color="#ff383c" />
                                    </button>
                                )
                            }
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                {activePortfolio && (
                    <div className="animate-in">
                        {/* 1. 자산 요약 */}
                        <AssetSummary balanceData={balanceData} loading={loading} />

                        {/* 2. 차트 영역 */}
                        <PortfolioCharts
                            assetData={assetCompositionData}
                            stockData={stockCompositionData}
                            sectorData={sectorCompositionData}
                        />

                        {/* 3. 내 보유 주식 추이 */}
                        {holdings && holdings.length > 0 && (
                            <div className="section-card">
                                <div className="section-header" style={{ marginBottom: '20px' }}>
                                    <TrendingUp className="size-5 text-purple" style={{ marginRight: '8px' }} />
                                    <h3 className="section-title">내 보유 주식 추이</h3>
                                </div>
                                {/* Grid Layout with Inline Style */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '24px'
                                }}>
                                    {holdings
                                        .filter(holdingStock => holdingStock.quantity > 0) // 필터 추가
                                        .map((stock) => (
                                            <StockTrendCard
                                                key={stock.stock.stockCode}
                                                stockCode={stock.stock.stockCode}
                                                name={stock.stock.name}
                                                quantity={stock.quantity}
                                                avgPrice={stock.avgPrice}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* 4. AI 추천 종목 리스트
                        <PortfolioStockList stocks={activePortfolio.holdings} /> */}
                    </div>
                )}

                {/* Modal */}
                {showAddPortfolio && (
                    <AddPortfolioModal
                        onClose={() => setShowAddPortfolio(false)}
                        onAdd={addNewPortfolio}
                    />
                )}
            </div>
        </div >
    );
}