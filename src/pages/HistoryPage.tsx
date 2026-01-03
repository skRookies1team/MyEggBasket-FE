import { useEffect, useState } from "react";
import { fetchTradeHistory } from "../api/tradeApi";
import HistoryAsset from "../components/HistoryReport/HistoryAsset";
import HistoryGraph from "../components/HistoryReport/HistoryGraph";

export default function HistoryPage() {
  
  const [tradeData, setTradeData] = useState<any[]>([]); // 거래 데이터 상태 추가

  useEffect(() => {
    async function loadHistory() {
      try {
        // 실제 API 호출 (필요에 따라 status나 virtual 파라미터 조절)
        const data = await fetchTradeHistory("COMPLETED", false);
        setTradeData(data);
      } catch (error) {
        console.error("거래 내역 로드 실패:", error);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 pt-20 pb-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {(
          <div className="space-y-8">
            <HistoryAsset />
            {/* 가공된 tradeData 전달 */}
            <HistoryGraph
              trades={tradeData}
            />
          </div>
        )}
      </div>
    </div>
  );
}