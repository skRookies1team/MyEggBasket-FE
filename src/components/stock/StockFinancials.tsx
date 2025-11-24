import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { FinancialData } from '../../types/stock';

interface StockFinancialsProps {
    data: FinancialData;
}

export function StockFinancials({ data }: StockFinancialsProps) {
    if (!data || (!data.revenue.length && !data.profit.length)) {
        return <div className="text-center p-10">재무제표 데이터가 없습니다.</div>;
    }

    return (
        <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
            <h3 className="text-[#1e1e1e] mb-4">재무제표</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-[#1e1e1e] mb-3">매출 추이</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.revenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4f378a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <h4 className="text-[#1e1e1e] mb-3">영업이익 추이</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.profit}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#00b050" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}