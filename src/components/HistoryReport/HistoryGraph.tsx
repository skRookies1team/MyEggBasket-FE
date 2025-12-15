import { useState } from "react";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


export default function HistoryGraph() {
    const [profitView, setProfitView] = useState<'monthly' | 'weekly'>('monthly');

    // RQ-43: 월별 주이 (수익)
    const monthlyProfit = [
        { month: '1월', profit: 150000, rate: 2.3 },
        { month: '2월', profit: 280000, rate: 4.1 },
        { month: '3월', profit: -120000, rate: -1.8 },
        { month: '4월', profit: 420000, rate: 6.2 },
        { month: '5월', profit: 310000, rate: 4.5 },
        { month: '6월', profit: 180000, rate: 2.6 },
        { month: '7월', profit: 520000, rate: 7.4 },
        { month: '8월', profit: 290000, rate: 4.0 },
        { month: '9월', profit: 380000, rate: 5.2 },
        { month: '10월', profit: 450000, rate: 6.1 },
        { month: '11월', profit: 360000, rate: 4.8 },
    ];

    // RQ-44: 주간 주이 (수익)
    const weeklyProfit = [
        { week: '1주차', profit: 85000, trades: 5 },
        { week: '2주차', profit: 120000, trades: 8 },
        { week: '3주차', profit: -30000, trades: 3 },
        { week: '4주차', profit: 95000, trades: 6 },
    ];

    // RQ-47: 포트폴리오 수익률 비교
    const portfolioComparison = [
        { date: '1월', myReturn: 2.3, kospi: 1.5, kosdaq: 2.1 },
        { date: '2월', myReturn: 4.1, kospi: 2.8, kosdaq: 3.5 },
        { date: '3월', myReturn: -1.8, kospi: -0.5, kosdaq: -1.2 },
        { date: '4월', myReturn: 6.2, kospi: 3.9, kosdaq: 4.8 },
        { date: '5월', myReturn: 4.5, kospi: 3.2, kosdaq: 3.8 },
        { date: '6월', myReturn: 2.6, kospi: 2.0, kosdaq: 2.3 },
        { date: '7월', myReturn: 7.4, kospi: 4.5, kosdaq: 5.6 },
        { date: '8월', myReturn: 4.0, kospi: 3.1, kosdaq: 3.4 },
        { date: '9월', myReturn: 5.2, kospi: 3.8, kosdaq: 4.2 },
        { date: '10월', myReturn: 6.1, kospi: 4.2, kosdaq: 4.9 },
        { date: '11월', myReturn: 4.8, kospi: 3.5, kosdaq: 3.9 },
    ];

    return (
        <div>
            <div className="mb-6">
                {/* RQ-47: 포트폴리오 수익률 비교 */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="size-5 text-[#4f378a]" />
                        <h2 className="text-2xl font-bold text-gray-800">수익률 비교</h2>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={portfolioComparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="myReturn" stroke="#4f378a" name="내 포트폴리오" strokeWidth={2} />
                                <Line type="monotone" dataKey="kospi" stroke="#ff383c" name="코스피" strokeWidth={2} />
                                <Line type="monotone" dataKey="kosdaq" stroke="#0066ff" name="코스닥" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

            </div>

            <div className="mb-6">
                {/* RQ-43, RQ-44: 월별/주간 수익 추이 통합 */}
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {profitView === 'monthly' ? <Calendar className="size-5 text-[#4f378a]" /> : <BarChart3 className="size-5 text-[#4f378a]" />}
                            <h2 className="text-2xl font-bold text-gray-800">{profitView === 'monthly' ? '월별' : '주간'} 수익</h2>
                        </div>
                        <div>
                            <button
                                onClick={() => setProfitView('monthly')}
                                className={`px-3 py-1 text-sm rounded-l-md transition-colors ${profitView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                            >
                                월
                            </button>
                            <button
                                onClick={() => setProfitView('weekly')}
                                className={`px-3 py-1 text-sm rounded-r-md transition-colors ${profitView === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                            >
                                주
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitView === 'monthly' ? monthlyProfit : weeklyProfit}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={profitView === 'monthly' ? 'month' : 'week'} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="profit" fill={profitView === 'monthly' ? "#4f378a" : "#00b050"} name="수익 (원)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </div>
    )
}