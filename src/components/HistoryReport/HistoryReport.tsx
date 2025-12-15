import type { HistoryReport } from "../../types/portfolios";


interface Props {
    history: HistoryReport | undefined;
}

export default function HistoryReport({ history }: Props) {

    if (!history) {
        return <p className="text-gray-500">거래 기록 데이터를 불러오는 중입니다...</p>;
    }
    

    const totalReturnRate = history.totalReturnRate?.toFixed(2) ?? '0.00';
    const successRate = history.successRate?.toFixed(2) ?? '0.00';

    return (
        <div className="border-t pt-4 mt-4">
            <h3 className="text-xl font-bold text-gray-700 mb-3">거래 기록 분석</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-500">전체 수익률 (Total Return)</p>

                    <p className="text-2xl font-extrabold text-green-600 mt-1">{totalReturnRate}%</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-500">AI사용 시 수익률 (Win Rate)</p>
                    <p className="text-2xl font-extrabold text-blue-600 mt-1">{successRate}%</p>
                </div>
            </div>
            {/* 추가적인 history 필드를 여기에 표시할 수 있습니다. */}
        </div>
    );
};