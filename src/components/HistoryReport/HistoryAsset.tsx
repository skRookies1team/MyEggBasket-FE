import { useEffect } from 'react';
import { useHistoryStore, usePortfolioStore } from '../../store/historyStore';
import type { Portfolio } from '../../store/historyStore';

import Egg1 from "../../assets/icons/egg1.png";
import Egg2 from "../../assets/icons/egg2.png";

import HistoryReport from './HistoryReport';
import { DollarSign } from 'lucide-react';

interface Props {
  portfolioId: number | null;
}

export default function HistoryAsset({ portfolioId }: Props) {
  const portfolios = usePortfolioStore((state) => state.portfolioList);
  const portfolio: Portfolio | undefined = portfolios.find(
    (p) => p.portfolioId === portfolioId
  );

  const history = useHistoryStore((state) => state.historyReport);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);

  useEffect(() => {
    if (portfolioId !== null) {
      fetchHistory(portfolioId);
    }
  }, [portfolioId, fetchHistory]);

  if (!portfolio) {
    return (
      <div className="p-6 text-center text-gray-500">
        포트폴리오 정보를 불러오는 중입니다...
      </div>
    );
  }

  const successRate = history?.successRate ?? null;

  let eggIcon = null;
  if (successRate !== null) {
    eggIcon =
      successRate >= 10 ? (
        <img src={Egg1} alt="Good Egg" className="w-8 h-8 ml-2" />
      ) : (
        <img src={Egg2} alt="Bad Egg" className="w-8 h-8 ml-2" />
      );
  }

  //더미 데이터
  // RQ-45: 주식 건당 수익
  const stockProfit = [
    { stock: '삼성전자', buy: 68000, current: 72500, profit: 112500, rate: 6.6, qty: 25 },
    { stock: 'SK하이닉스', buy: 125000, current: 135000, profit: 150000, rate: 8.0, qty: 15 },
    { stock: 'NAVER', buy: 215000, current: 208000, profit: -70000, rate: -3.3, qty: 10 },
    { stock: '카카오', buy: 52000, current: 55000, profit: 90000, rate: 5.8, qty: 30 },
    { stock: '현대차', buy: 185000, current: 195000, profit: 100000, rate: 5.4, qty: 10 },
  ];

  

  return (
    <div className="flex space-x-4">
      <div className="w-1/2 text-white">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="border-b pb-4 mb-4">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800">{portfolio.name}</h2>
              {eggIcon}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              위험 수준:{' '}
              <span className="font-semibold text-blue-600">
                {portfolio.riskLevel}
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="text-gray-600">총 자산</p>
              <p className="text-lg font-bold text-gray-800">
                {portfolio.totalAsset?.toLocaleString() ?? 0}원
              </p>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
              <p className="text-gray-600">예수금</p>
              <p className="text-lg font-bold text-gray-800">
                {portfolio.cashBalance?.toLocaleString() ?? 0}원
              </p>
            </div>
          </div>
          <hr className="h-px my-8 bg-gray-300 border-0"/>
          <div className="mt-6">
            <HistoryReport history={history} />
          </div>
        </div>
      </div>
      <div className="w-1/2 text-white">
        {/* RQ-45: 주식 건당 수익 */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-[#4f378a]" />
            <h2 className="text-2xl font-bold text-gray-800">종목별 수익 현황</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e8e8]">
                  <th className="text-left py-3 px-4 text-[#49454f] text-[13px]">종목명</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">보유수량</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">매입가</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">현재가</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">수익금액</th>
                  <th className="text-right py-3 px-4 text-[#49454f] text-[13px]">수익률</th>
                </tr>
              </thead>
              <tbody>
                {stockProfit.map((stock, index) => (
                  <tr key={index} className="border-b border-[#f3edf7] hover:bg-[#f3edf7]/50 transition-colors">
                    <td className="py-3 px-4 text-[#1e1e1e]">{stock.stock}</td>
                    <td className="py-3 px-4 text-right text-[#49454f]">{stock.qty}</td>
                    <td className="py-3 px-4 text-right text-[#49454f]">
                      ₩{stock.buy.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[#1e1e1e]">
                      ₩{stock.current.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right ${stock.profit >= 0 ? 'text-[#ff383c]' : 'text-[#0066ff]'
                        }`}
                    >
                      {stock.profit >= 0 ? '+' : ''}₩{stock.profit.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right ${stock.rate >= 0 ? 'text-[#ff383c]' : 'text-[#0066ff]'
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
      </div>
    </div>
  );
}
