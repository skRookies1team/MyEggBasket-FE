import { useEffect, useState } from 'react';
import { usePortfolioStore } from '../store/historyStore';
import HistoryAsset from '../components/HistoryReport/HistoryAsset';

export default function HistoryPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number|null>(
    null,
  );
  
  const portfolios = usePortfolioStore((state) => state.portfolioList);
  const fetchPortfolio = usePortfolioStore((state) => state.fetchPortfolios);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]); 

  const handleClick = (portfolioId: number) => {
    setSelectedPortfolioId(portfolioId);
  };

  return (
    <div className="min-h-screen bg-yellow-50 mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">포트폴리오 선택</h2>
        {portfolios.length > 0 ? (
          portfolios.map((p) => (
            <button
              key={p.portfolioId}
              onClick={() => handleClick(p.portfolioId)}
              // className={`btn-tab ${...}`} 대신 Tailwind CSS 클래스를 직접 사용하거나 정의된 btn-tab 클래스를 유지합니다.
              // 여기서는 원본에 맞추어 `btn-tab`을 유지하되, Tailwind CSS를 사용하는 경우 다음과 같이 클래스를 수정할 수 있습니다.
              className={`px-4 py-2 mr-2 mb-2 rounded-lg transition-colors duration-200 ${
                selectedPortfolioId === p.portfolioId 
                  ? 'bg-blue-600 text-white font-semibold shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {p.name}
            </button>
          ))
        ) : (
          <p className="mt-4 text-gray-500">생성된 포트폴리오가 없습니다. 새로운 포트폴리오를 만들어주세요.</p>
        )}
      </div>

      {/* selectedPortfolioId가 null이 아닐 때만 HistoryReportSection 렌더링 */}
      {selectedPortfolioId !== null && (
        <HistoryAsset portfolioId={selectedPortfolioId} />
      )}
    </div>
  );
}