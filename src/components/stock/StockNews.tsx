import { useEffect, useState, memo } from 'react';
import type { NewsItem } from '../../types/stock';
import { fetchHoldingStockNews } from '../../api/newsApi';
import { getStockInfoFromDB } from '../../api/stocksApi';

interface StockNewsProps {
    data?: NewsItem[];
    query?: string; // 종목코드 또는 검색어
}

export const StockNews = memo(function StockNews({ data, query }: StockNewsProps) {
    const [articles, setArticles] = useState<NewsItem[]>(data || []);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 데이터 페칭 로직
    useEffect(() => {
        // 1. props로 데이터가 이미 넘어온 경우 바로 설정
        if (data && data.length > 0) {
            setArticles(data);
            return;
        }

        // 2. 검색어가 없는 경우 리스트 비움
        if (!query) {
            setArticles([]);
            return;
        }

        const loadNaverNews = async () => {
            setLoading(true);
            setError(null);

            try {
                let searchTerm = query;

                // 입력값이 숫자(종목코드)인 경우 DB에서 종목명을 조회하여 검색 정확도 향상
                if (/^\d+$/.test(query)) {
                    const stockInfo = await getStockInfoFromDB(query);
                    if (stockInfo) {
                        searchTerm = stockInfo.name;
                    }
                }

                // 네이버 뉴스 API 호출 (정확도순 검색)
                const response = await fetchHoldingStockNews(searchTerm, 10, 1, 'sim');
                
                // 네이버 응답 데이터를 NewsItem 타입으로 변환 및 태그 정제
                const mappedItems: NewsItem[] = response.items.map((item: any) => ({
                    id: item.link,
                    title: item.title.replace(/<[^>]*>?/gm, ''), // <b> 태그 등 제거
                    source: '네이버 뉴스',
                    time: new Date(item.pubDate).toLocaleString(),
                    url: item.link,
                }));

                setArticles(mappedItems);
            } catch (err) {
                console.error('Failed to load news:', err);
                setError('뉴스를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadNaverNews();
    }, [data, query]);

    return (
        <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
            <h3 className="text-[#1e1e1e] font-bold mb-4">관련 뉴스</h3>
            
            <div className="space-y-3">
                {loading && <p className="text-gray-500 text-sm">뉴스를 불러오는 중...</p>}
                {!loading && error && <p className="text-red-500 text-sm">{error}</p>}
                {!loading && !error && articles.length === 0 && (
                    <p className="text-gray-500 text-sm">관련 뉴스가 없습니다.</p>
                )}
                
                {!loading && !error && articles.map((news) => (
                    <a 
                        key={news.id} 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 border border-[#e8e8e8] rounded-lg hover:bg-[#f3edf7] transition-colors group"
                    >
                        <p className="text-[#1e1e1e] mb-2 font-medium group-hover:text-[#4f378a] group-hover:underline">
                            {news.title}
                        </p>
                        <div className="flex items-center gap-2 text-[12px] text-[#49454f]">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{news.time}</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
});