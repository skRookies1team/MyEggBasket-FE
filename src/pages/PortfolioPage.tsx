import { useState, useEffect, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { fetchAccountBalance, getAccessToken } from '../api/stockApi';
import type { AccountBalanceData } from '../types/stock';

// 스타일 및 컴포넌트 임포트
import '../assets/PortfolioPage.css';
import { AssetSummary } from '../components/Portfolio/AssetSummary';
import { PortfolioCharts } from '../components/Portfolio/PortfolioCharts';
import { PortfolioStockList } from '../components/Portfolio/PortfolioStockList';
import { AddPortfolioModal } from '../components/Portfolio/AddPortfolioModal';

interface PortfolioPageProps {
    onNavigateToHistory: () => void;
}

interface Portfolio {
    id: number;
    name: string;
    type: 'risk' | 'neutral' | 'safe';
    stocks: {
        name: string;
        allocation: number;
        reason: {
            news: string[];
            reports: string[];
            valueChain: string[];
        };
    }[];
}

export function PortfolioPage({ onNavigateToHistory }: PortfolioPageProps) {
    // ----------------------------------------------------------------------
    // 1. 실제 계좌 데이터 (Real Data)
    // ----------------------------------------------------------------------
    const [balanceData, setBalanceData] = useState<AccountBalanceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = await getAccessToken();
                if (token) {
                    const data = await fetchAccountBalance(token);
                    if (data) setBalanceData(data);
                }
            } catch (error) {
                console.error("잔고 로딩 실패", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const myAssets = useMemo(() => {
        if (!balanceData) return { total: 0, cash: 0, investment: 0, profit: 0, profitRate: 0, stockEval: 0 };
        const { summary } = balanceData;
        const total = summary.scts_evlu_amt;
        const stockEval = summary.tot_evlu_amt;
        const cash = summary.dnca_tot_amt;
        const profit = summary.evlu_pfls_smtl_amt;
        const investment = total - profit;
        const profitRate = investment !== 0 ? (profit / investment) * 100 : 0;
        return { total, cash, investment, profit, profitRate, stockEval };
    }, [balanceData]);

    const assetCompositionData = useMemo(() => {
        if (myAssets.total === 0) return [];
        return [
            { name: '주식', value: myAssets.stockEval, color: '#4f378a' },
            { name: '현금', value: myAssets.cash, color: '#00b050' },
        ];
    }, [myAssets]);

    const stockCompositionData = useMemo(() => {
        if (!balanceData?.holdings) return [];
        const sorted = [...balanceData.holdings].sort((a, b) => b.evlu_amt - a.evlu_amt);
        const topStocks = sorted.slice(0, 4);
        const otherValue = sorted.slice(4).reduce((sum, item) => sum + item.evlu_amt, 0);
        const data = topStocks.map((stock, index) => ({
            name: stock.prdt_name,
            value: stock.evlu_amt,
            color: ['#ff383c', '#4f378a', '#00b050', '#ffa500'][index % 4]
        }));
        if (otherValue > 0) data.push({ name: '기타', value: otherValue, color: '#d9d9d9' });
        return data;
    }, [balanceData]);

    // 섹터 데이터 (더미 - 실제 API가 제공하지 않음)
    const sectorCompositionData = [
        { name: 'IT/기술', value: 63, color: '#4f378a' },
        { name: '금융', value: 15, color: '#ffa500' },
        { name: '바이오', value: 12, color: '#0066ff' },
        { name: '기타', value: 10, color: '#d9d9d9' },
    ];

    // ----------------------------------------------------------------------
    // 2. 포트폴리오 관리 (Mock Data)
    // ----------------------------------------------------------------------
    const [portfolios, setPortfolios] = useState<Portfolio[]>([
        {
            id: 1,
            name: '포트폴리오 1',
            type: 'neutral',
            stocks: [
                {
                    name: '삼성전자',
                    allocation: 25,
                    reason: {
                        news: ['3분기 실적 시장 기대치 상회', 'HBM 수주 확대'],
                        reports: ['KB증권 목표주가 상향 (85,000원)', 'NH투자증권 투자의견 매수 유지'],
                        valueChain: ['반도체 공급망의 핵심 기업', 'AI 칩 수요 증가로 수혜'],
                    },
                },
                {
                    name: 'SK하이닉스',
                    allocation: 20,
                    reason: {
                        news: ['HBM3 생산 본격화', 'AI 반도체 시장 급성장'],
                        reports: ['미래에셋증권 매수 추천'],
                        valueChain: ['HBM 시장 점유율 1위'],
                    },
                },
            ],
        },
    ]);

    const [showAddPortfolio, setShowAddPortfolio] = useState(false);
    const [activePortfolioId, setActivePortfolioId] = useState(1);
    const activePortfolio = portfolios.find(p => p.id === activePortfolioId);

    const addNewPortfolio = (type: 'risk' | 'neutral' | 'safe') => {
        const newId = Math.max(...portfolios.map(p => p.id)) + 1;
        const newPortfolio: Portfolio = {
            id: newId,
            name: `포트폴리오 ${newId}`,
            type: type,
            stocks: [] // 실제로는 타입별 프리셋 데이터 로드
        };
        setPortfolios([...portfolios, newPortfolio]);
        setActivePortfolioId(newId);
        setShowAddPortfolio(false);
    };

    const removePortfolio = (id: number) => {
        if (portfolios.length === 1) return;
        setPortfolios(portfolios.filter(p => p.id !== id));
        if (activePortfolioId === id) setActivePortfolioId(portfolios[0].id);
    };

    const getTypeColor = (type: string) => type === 'risk' ? '#ff383c' : type === 'neutral' ? '#4f378a' : '#00b050';
    const getTypeLabel = (type: string) => type === 'risk' ? '위험형' : type === 'neutral' ? '중립형' : '안전형';

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
                        <div key={portfolio.id} className="tab-item">
                            <button
                                onClick={() => setActivePortfolioId(portfolio.id)}
                                className={`btn-tab ${activePortfolioId === portfolio.id ? 'active' : ''}`}
                            >
                                <span>{portfolio.name}</span>
                                <span style={{ fontSize: '12px', color: getTypeColor(portfolio.type) }}>
                                    ({getTypeLabel(portfolio.type)})
                                </span>
                            </button>
                            {portfolios.length > 1 && (
                                <button onClick={() => removePortfolio(portfolio.id)} className="btn-remove-tab">
                                    <X size={12} color="#ff383c" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                {activePortfolio && (
                    <div className="animate-in">
                        {/* 1. 자산 요약 */}
                        <AssetSummary
                            total={myAssets.total}
                            investment={myAssets.investment}
                            profit={myAssets.profit}
                            profitRate={myAssets.profitRate}
                            cash={myAssets.cash}
                            loading={loading}
                        />

                        {/* 2. 차트 영역 */}
                        <PortfolioCharts
                            assetData={assetCompositionData}
                            stockData={stockCompositionData}
                            sectorData={sectorCompositionData}
                        />

                        {/* 3. AI 추천 종목 리스트 */}
                        <PortfolioStockList stocks={activePortfolio.stocks} />
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
        </div>
    );
}