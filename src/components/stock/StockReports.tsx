import type { ReportItem } from '../../types/stock.ts';

interface StockReportsProps {
    data: ReportItem[];
}

export function StockReports({ data }: StockReportsProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
            <h3 className="text-[#1e1e1e] mb-4">애널리스트 리포트</h3>
            <div className="space-y-3">
                {data.length === 0 ? <p className="text-gray-500">리포트가 없습니다.</p> :
                    data.map(report => (
                        <div key={report.id} className="p-4 border border-[#e8e8e8] rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-[#1e1e1e] mb-1">{report.title}</p>
                                    <p className="text-[13px] text-[#49454f]">{report.source} • {report.date}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-[13px] ${report.sentiment === 'buy' ? 'bg-[#eef8f3] text-[#00b050]' : 'bg-gray-100'}`}>
                                    {report.sentiment.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[13px] text-[#49454f]">{report.summary}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}