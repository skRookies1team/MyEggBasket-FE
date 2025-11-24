import type { NewsItem } from '../../types/stock';

interface StockNewsProps {
    data: NewsItem[];
}

export function StockNews({ data }: StockNewsProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
            <h3 className="text-[#1e1e1e] mb-4">관련 뉴스</h3>
            <div className="space-y-3">
                {data.length === 0 ? <p className="text-gray-500">관련 뉴스가 없습니다.</p> :
                    data.map((news, idx) => (
                        <div key={news.id || idx} className="p-4 border border-[#e8e8e8] rounded-lg hover:bg-[#f3edf7] cursor-pointer">
                            <p className="text-[#1e1e1e] mb-2">{news.title}</p>
                            <div className="flex items-center gap-2 text-[13px] text-[#49454f]">
                                <span>{news.source}</span><span>•</span><span>{news.time}</span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}