import { useEffect, useState } from "react";
import type { StockPriceData } from "../../types/stock";
import { fetchStockCurrentPrice } from "../../api/liveStockApi";
import { CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LineChart } from "lucide-react";

export default function StockTrendCard({ stockCode, name, quantity, avgPrice }: { stockCode: string, name: string, quantity: number, avgPrice: number }) {
    const [chartData, setChartData] = useState<StockPriceData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [changeRate, setChangeRate] = useState<number>(0);


    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {

            //수정사항1 : 주식 일, 주, 월, 년 API 연결

            // 1. 차트 데이터 (일봉, 최근 30일)
            // const history = await fetchHistoricalData(code, 'day', token);

            // 2. 현재가 정보
            const current = await fetchStockCurrentPrice(stockCode);

            if (isMounted) {
                // if (history && history.length > 0) {
                //     setChartData(history.slice(-30));
                // }
                if (current) {
                    setCurrentPrice(current.currentPrice);
                    setChangeRate(current.changeRate);
                }
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [stockCode]);

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