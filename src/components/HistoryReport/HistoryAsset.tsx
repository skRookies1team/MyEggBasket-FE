import { useEffect } from 'react';
import { useHistoryStore, usePortfolioStore } from '../../store/historyStore';
import type { Portfolio } from '../../store/historyStore'
import HistoryReport from './HistoryReport';

interface Props {
  portfolioId: number | null;
}

export default function HistoryAsset({ portfolioId }: Props) {

  // ✅ 1. 포트폴리오 목록과 선택된 포트폴리오를 렌더링 단계에서 직접 파생
  const portfolios = usePortfolioStore((state: any) => state.portfolioList);
  const portfolio: Portfolio | undefined = portfolios.find((p:any) => p.portfolioId === portfolioId);

  // ✅ 2. History 상태와 함수 가져오기
  const history = useHistoryStore((state) => state.historyReport);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);

  // ✅ 3. 선택된 portfolioId가 유효할 때만 비동기 데이터 fetch (이펙트의 올바른 사용)
  useEffect(() => {
    if (portfolioId !== null) {
      fetchHistory(portfolioId);
    }
  }, [fetchHistory, portfolioId]);

  // 선택된 포트폴리오가 없는 경우 (portfolios 리스트 로딩 중이거나 잘못된 ID)
  if (!portfolio) {
    return <div className="p-6 text-center text-gray-500">포트폴리오 정보를 불러오는 중이거나 유효하지 않은 포트폴리오 ID입니다.</div>;
  }

  // ✅ 4. 성공률 관련 아이콘 표시 로직을 가독성 있게 정리
  const successRate = history?.successRate ?? null;
  console.log(history.successRate)

  let eggIcon = null;
  if (successRate !== null) { // 데이터 로드 후 successRate가 정해지면 아이콘을 결정합니다.
    if (successRate >= 10) {
      eggIcon = <img src="asset/icon/egg1.png" alt="Good Egg" className="w-8 h-8 ml-2" />;
    } else {
      eggIcon = <img src="asset/icon/egg2.png" alt="Bad Egg" className="w-8 h-8 ml-2" />;
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="border-b pb-4 mb-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-gray-800">{portfolio.name}</h2>
          {eggIcon} {/* 정리된 아이콘 변수 사용 */}
        </div>
        {/* portfolio가 이미 존재하는지 상단에서 체크했으므로 ?. 대신 . 사용 */}
        <p className="text-sm text-gray-500 mt-1">위험 수준: <span className="font-semibold text-blue-600">{portfolio.riskLevel}</span></p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
          <p className="text-gray-600">{portfolio.name}의 총 자산</p>
          <p className="text-lg font-bold text-gray-800">{portfolio.totalAsset?.toLocaleString() ?? 0}원</p>
        </div>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
          <p className="text-gray-600">{portfolio.name}의 예수금</p>
          <p className="text-lg font-bold text-gray-800">{portfolio.cashBalance?.toLocaleString() ?? 0}원</p>
        </div>
      </div>
      {/* portfolio는 이미 존재함을 보장했으므로, history만 확인 */}
      <div className="mt-6">
        <HistoryReport history={history} />
      </div>
    </div>
  )
}