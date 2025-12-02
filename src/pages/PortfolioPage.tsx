import { useState, useEffect, useMemo } from 'react';
import { Plus, X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAccountBalance, getAccessToken, fetchHistoricalData, fetchCurrentPrice, getStockInfoFromDB } from '../api/stockApi';
import type { AccountBalanceData, StockPriceData } from '../types/stock';

// 스타일 및 컴포넌트 임포트
import '../assets/PortfolioPage.css';
import { AssetSummary } from '../components/Portfolio/AssetSummary';
import { PortfolioCharts } from '../components/Portfolio/PortfolioCharts';
import { PortfolioStockList } from '../components/Portfolio/PortfolioStockList';
import { AddPortfolioModal } from '../components/Portfolio/AddPortfolioModal';

// ----------------------------------------------------------------------
// [수정] 개별 종목 트렌드 카드 (CSS 클래스 + 인라인 스타일 적용)
// ----------------------------------------------------------------------
function StockTrendCard({ code, name, quantity, avgPrice }: { code: string, name: string, quantity: number, avgPrice: number }) {
    const [chartData, setChartData] = useState<StockPriceData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [changeRate, setChangeRate] = useState<number>(0);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            const token = await getAccessToken();
            if (!token) return;

            // 1. 차트 데이터 (일봉, 최근 30일)
            const history = await fetchHistoricalData(code, 'day', token);

            // 2. 현재가 정보
            const current = await fetchCurrentPrice(token, code);

            if (isMounted) {
                if (history && history.length > 0) {
                    setChartData(history.slice(-30));
                }
                if (current) {
                    setCurrentPrice(current.stck_prpr);
                    setChangeRate(current.prdy_ctrt);
                }
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [code]);

    // 수익금/수익률 계산
    const profit = (currentPrice - avgPrice) * quantity;
    const profitRate = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
    const isPositive = changeRate >= 0;
    const isProfit = profit >= 0;

    const color = isPositive ? '#ff383c' : '#0066ff';
    const profitColor = isProfit ? '#ff383c' : '#0066ff';

    return (
        // 기존 CSS 클래스 .stock-card 재사용 또는 인라인 스타일 적용
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #d9d9d9',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e1e1e', marginBottom: '4px' }}>{name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e1e1e' }}>
                        {currentPrice ? `₩${currentPrice.toLocaleString()}` : '-'}
                    </p>
                    {currentPrice > 0 && (
                        <p style={{ fontSize: '14px', fontWeight: '600', color: color }}>
                            {isPositive ? '+' : ''}{changeRate}%
                        </p>
                    )}
                </div>
            </div>

            {/* 차트 영역 */}
            <div style={{ height: '120px', width: '100%', marginBottom: '12px' }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 10, fill: '#999' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => val.slice(5)}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                hide={true}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                formatter={(value: number) => [`₩${value.toLocaleString()}`, '주가']}
                                labelFormatter={(label) => label}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: '#999' }}>
                        데이터 로딩중...
                    </div>
                )}
            </div>

            <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
            }}>
                <span style={{ color: '#666' }}>
                    {quantity.toLocaleString()}주 (평단 ₩{avgPrice.toLocaleString()})
                </span>
                <span style={{ fontWeight: '600', color: profitColor }}>
                    {isProfit ? '+' : ''}₩{profit.toLocaleString()} ({isProfit ? '+' : ''}{profitRate.toFixed(2)}%)
                </span>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// 메인 페이지 컴포넌트
// ----------------------------------------------------------------------

export function PortfolioPage({ onNavigateToHistory }: PortfolioPageProps) {
    const [balanceData, setBalanceData] = useState<AccountBalanceData | null>(null);
    const [loading, setLoading] = useState(true);

    const [sectorCompositionData, setSectorCompositionData] = useState<{ name: string, value: number, color: string }[]>([]);
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
        if (!balanceData) return { total: 0, cash: 0, d1Cash: 0, d2Cash: 0, investment: 0, profit: 0, profitRate: 0, stockEval: 0 };
        const { summary } = balanceData;

        const total = summary.tot_evlu_amt;
        const stockEval = summary.scts_evlu_amt;
        const cash = summary.dnca_tot_amt;
        const d1Cash = summary.nxdy_excc_amt;
        const d2Cash = summary.prvs_rcdl_excc_amt;
        const profit = summary.evlu_pfls_smtl_amt;
        const investment = total - profit;
        const profitRate = investment !== 0 ? (profit / investment) * 100 : 0;

        return { total, cash, d1Cash, d2Cash, investment, profit, profitRate, stockEval };
    }, [balanceData]);

    const assetCompositionData = useMemo(() => {
        if (myAssets.total === 0) return [];
        return [
            { name: '주식', value: myAssets.stockEval, color: '#4f378a' },
            { name: '현금', value: myAssets.d2Cash, color: '#00b050' },
        ];
    }, [myAssets]);

    const stockCompositionData = useMemo(() => {
        if (!balanceData?.holdings) return [];

        // 1. 보유 수량이 0보다 큰 종목만 필터링
        const validHoldings = balanceData.holdings.filter(item => item.hldg_qty > 0);

        // 2. 평가금액 순으로 정렬
        const sorted = [...validHoldings].sort((a, b) => b.evlu_amt - a.evlu_amt);

        // 3. 상위 4개 종목과 나머지(기타)로 분류
        const topStocks = sorted.slice(0, 4);
        const otherValue = sorted.slice(4).reduce((sum, item) => sum + item.evlu_amt, 0);

        const data = topStocks.map((stock, index) => ({
            name: stock.prdt_name,
            value: stock.evlu_amt,
            color: ['#ff383c', '#4f378a', '#00b050', '#ffa500'][index % 4]
        }));

        if (otherValue > 0) {
            data.push({ name: '기타', value: otherValue, color: '#d9d9d9' });
        }

        return data;
    }, [balanceData]);

    useEffect(() => {
        const calculateSectorComposition = async () => {
            if (!balanceData?.holdings) return;

            // 1. 보유 수량이 0보다 큰 종목만 필터링
            const validHoldings = balanceData.holdings.filter(item => item.hldg_qty > 0);

            if (validHoldings.length === 0) {
                setSectorCompositionData([]);
                return;
            }

            // 2. 각 종목의 섹터 정보 비동기 병렬 조회
            const promises = validHoldings.map(async (stock) => {
                const info = await getStockInfoFromDB(stock.pdno);
                // 정보가 없거나 섹터가 빈 문자열이면 '기타'로 분류
                const sectorName = (info && info.sector && info.sector.trim() !== "") ? info.sector : '기타';
                return {
                    sector: sectorName,
                    value: stock.evlu_amt
                };
            });

            const results = await Promise.all(promises);

            // 3. 섹터별 금액 합산 (Grouping)
            const sectorMap: Record<string, number> = {};
            results.forEach(({ sector, value }) => {
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
    }, [balanceData]); // balanceData가 변경될 때마다 실행

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
            stocks: []
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
                            stockEval={myAssets.stockEval}
                            profit={myAssets.profit}
                            profitRate={myAssets.profitRate}
                            cash={myAssets.cash}
                            d1Cash={myAssets.d1Cash}
                            d2Cash={myAssets.d2Cash}
                            loading={loading}
                        />

                        {/* 2. 차트 영역 */}
                        <PortfolioCharts
                            assetData={assetCompositionData}
                            stockData={stockCompositionData}
                            sectorData={sectorCompositionData}
                        />

                        {/* 3. 내 보유 주식 추이 */}
                        {balanceData?.holdings && balanceData.holdings.length > 0 && (
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
                                    {balanceData.holdings
                                        .filter(stock => stock.hldg_qty > 0) // 필터 추가
                                        .map((stock) => (
                                            <StockTrendCard
                                                key={stock.pdno}
                                                code={stock.pdno}
                                                name={stock.prdt_name}
                                                quantity={stock.hldg_qty}
                                                avgPrice={stock.pchs_avg_pric}
                                            />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. AI 추천 종목 리스트 */}
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