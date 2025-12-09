import { BarChart, BarChart3, Calendar, DollarSign, Download, Filter, LineChart, TrendingUp } from "lucide-react"
import { useState } from "react";
import { Bar, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function HistoryReportSection(){
      const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
      const [startDate, setStartDate] = useState('2025-01-01');
      const [endDate, setEndDate] = useState('2025-12-09');
      const [selectedStock, setSelectedStock] = useState('all');
    
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
        { month: '12월', profit: 410000, rate: 5.1 },
      ];
    
      // RQ-44: 주간 주이 (수익)
      const weeklyProfit = [
        { week: '1주차', profit: 85000, trades: 5 },
        { week: '2주차', profit: 120000, trades: 8 },
        { week: '3주차', profit: -30000, trades: 3 },
        { week: '4주차', profit: 95000, trades: 6 },
      ];
    
      // RQ-45: 주식 건당 수익
      const stockProfit = [
        { stock: '삼성전자', buy: 68000, current: 72500, profit: 112500, rate: 6.6, qty: 25 },
        { stock: 'SK하이닉스', buy: 125000, current: 135000, profit: 150000, rate: 8.0, qty: 15 },
        { stock: 'NAVER', buy: 215000, current: 208000, profit: -70000, rate: -3.3, qty: 10 },
        { stock: '카카오', buy: 52000, current: 55000, profit: 90000, rate: 5.8, qty: 30 },
        { stock: '현대차', buy: 185000, current: 195000, profit: 100000, rate: 5.4, qty: 10 },
      ];
    
      // RQ-46: 매출고가 비교
      const priceHistory = [
        { date: '01/01', low: 65000, high: 73000, current: 68000 },
        { date: '02/01', low: 67000, high: 75000, current: 71000 },
        { date: '03/01', low: 68000, high: 76000, current: 72500 },
        { date: '04/01', low: 70000, high: 78000, current: 74000 },
        { date: '05/01', low: 69000, high: 77000, current: 72500 },
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
        { date: '12월', myReturn: 5.1, kospi: 3.7, kosdaq: 4.1 },
      ];
    
      const stocks = ['전체', '삼성전자', 'SK하이닉스', 'NAVER', '카카오', '현대차'];
    

    return
    <div>
        {/* RQ-48: 종목 선택 및 기간 설정 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="size-5 text-[#4f378a]" />
          <h2 className="text-lg font-semibold text-[#1e1e1e]">조회 조건</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {/* 종목 선택 */}
          <div>
            <label className="block text-[#49454f] text-[13px] mb-2">종목 선택</label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f378a]/50 focus:border-[#4f378a]"
            >
              {stocks.map((stock) => (
                <option key={stock} value={stock}>
                  {stock}
                </option>
              ))}
            </select>
          </div>

          {/* 시작일 */}
          <div>
            <label className="block text-[#49454f] text-[13px] mb-2">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f378a]/50 focus:border-[#4f378a]"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-[#49454f] text-[13px] mb-2">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f378a]/50 focus:border-[#4f378a]"
            />
          </div>

          {/* 기간 버튼 */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`flex-1 px-3 py-2 text-[13px] rounded-lg border transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-[#4f378a] border-[#4f378a] text-white font-semibold'
                  : 'border-[#d9d9d9] hover:bg-[#f3edf7]'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`flex-1 px-3 py-2 text-[13px] rounded-lg border transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-[#4f378a] border-[#4f378a] text-white font-semibold'
                  : 'border-[#d9d9d9] hover:bg-[#f3edf7]'
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`flex-1 px-3 py-2 text-[13px] rounded-lg border transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-[#4f378a] border-[#4f378a] text-white font-semibold'
                  : 'border-[#d9d9d9] hover:bg-[#f3edf7]'
              }`}
            >
              연간
            </button>
          </div>
        </div>
      </section>

      {/* RQ-43: 월별 주이 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-[#4f378a]" />
            <h2 className="text-lg font-semibold text-[#1e1e1e]">월별 수익</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-[13px] border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="size-4" />
            다운로드
          </button>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProfit}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#4f378a" name="수익 (원)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-6">
        {/* RQ-44: 주간 주이 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-5 text-[#4f378a]" />
            <h2 className="text-lg font-semibold text-[#1e1e1e]">주간 수익</h2>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProfit}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="#00b050" name="수익 (원)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* RQ-47: 포트폴리오 수익률 비교 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-[#4f378a]" />
            <h2 className="text-lg font-semibold text-[#1e1e1e]">수익률 비교</h2>
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

      {/* RQ-45: 주식 건당 수익 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="size-5 text-[#4f378a]" />
          <h2 className="text-lg font-semibold text-[#1e1e1e]">종목별 수익 현황</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">종목명</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">보유수량</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">매입가</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">현재가</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">수익금액</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">수익률</th>
              </tr>
            </thead>
            <tbody>
              {stockProfit.map((stock, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-[#1e1e1e]">{stock.stock}</td>
                  <td className="py-3 px-4 text-right text-[#49454f]">{stock.qty}</td>
                  <td className="py-3 px-4 text-right text-[#49454f]">
                    ₩{stock.buy.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-[#1e1e1e]">
                    ₩{stock.current.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      stock.profit >= 0 ? 'text-[#ff383c]' : 'text-[#0066ff]'
                    }`}
                  >
                    {stock.profit >= 0 ? '+' : ''}₩{stock.profit.toLocaleString()}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      stock.rate >= 0 ? 'text-[#ff383c]' : 'text-[#0066ff]'
                    }`}
                  >
                    {stock.rate >= 0 ? '+' : ''}{stock.rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RQ-46: 매출고가 비교 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-5 text-[#4f378a]" />
          <h2 className="text-lg font-semibold text-[#1e1e1e]">매입가 대비 최저가/최고가</h2>
          <span className="ml-2 text-[13px] text-[#49454f]">(삼성전자 기준)</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="low" stroke="#0066ff" name="최저가" strokeWidth={2} />
              <Line type="monotone" dataKey="current" stroke="#49454f" name="매입가" strokeWidth={2} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="high" stroke="#ff383c" name="최고가" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      </div>
}