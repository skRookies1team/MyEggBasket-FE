import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CompositionData {
    name: string;
    value: number;
    color: string;
}

interface PortfolioChartsProps {
    assetData: CompositionData[];
    stockData: CompositionData[];
    sectorData: CompositionData[]; // 섹터 데이터가 없다면 빈 배열 처리
}

export function PortfolioCharts({ assetData, stockData, sectorData }: PortfolioChartsProps) {
    const renderChart = (title: string, data: CompositionData[]) => (
        <div className="section-card">
            <div className="section-header">
                <PieChartIcon className="size-4 text-purple" />
                <h3 className="section-title" style={{ fontSize: '16px' }}>{title}</h3>
            </div>
            <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => `₩${val.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="charts-grid">
            {renderChart("자산 구성 (주식/현금)", assetData)}
            {renderChart("보유 종목 비중 (Top 5)", stockData)}
            {renderChart("섹터별 비중 (예시)", sectorData)}
        </div>
    );
}