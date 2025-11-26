import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { StockPriceData, Period } from '../../types/stock.ts';

interface StockChartProps {
    data: StockPriceData[];
    period?: Period;
    fixedDomain?: [number, number];
}

export function StockChart({ data, period = 'day', fixedDomain }: StockChartProps) {
    if (!data || data.length === 0) return <div className="text-center p-10">데이터가 없습니다.</div>;

    // fixedDomain이 제공되면 우선 사용, 아니면 기존 로직으로 분봉 도메인 계산
    let priceDomain: any = ['auto', 'auto'];
    if (fixedDomain && fixedDomain.length === 2) {
        priceDomain = fixedDomain;
    } else if (period === 'minute') {
        const baseData = data.length > 1 ? data.slice(0, -1) : data;
        const prices = baseData.map((d) => d.price);
        const dataMin = Math.min(...prices);
        const dataMax = Math.max(...prices);
        const range = Math.max(1, dataMax - dataMin);
        const pad = Math.max(1, Math.round(range * 0.1));
        priceDomain = [Math.floor(dataMin - pad), Math.ceil(dataMax + pad)];
    }

    // X축 라벨 포맷터: 분봉일 때는 시:분(초가 있으면 시:분:초) 표시
    const formatTick = (value: string) => {
        if (period === 'minute') {
            if (/^\d{1,2}:\d{2}:\d{2}$/.test(value) || /^\d{1,2}:\d{2}$/.test(value)) return value;
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            return value;
        }
        return value;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                <h3 className="text-[#1e1e1e] mb-4">가격 차트</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tickFormatter={formatTick} />
                            <YAxis domain={priceDomain} />
                            <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                            <Line type="monotone" dataKey="price" stroke="#ff383c" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
                <h3 className="text-[#1e1e1e] mb-4">거래량</h3>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tickFormatter={formatTick} />
                            <YAxis />
                            <Tooltip formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value} />
                            <Bar dataKey="volume" fill="#4f378a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}