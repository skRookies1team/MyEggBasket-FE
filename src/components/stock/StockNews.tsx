import { useEffect, useState, memo } from "react";
import type { NewsItem } from "../../types/stock";
import { fetchHoldingStockNews } from "../../api/newsApi";
import { getStockInfoFromDB } from "../../api/stocksApi";

interface StockNewsProps {
  data?: NewsItem[];
  query?: string;
}

export const StockNews = memo(function StockNews({
  data,
  query,
}: StockNewsProps) {
  const [articles, setArticles] = useState<NewsItem[]>(data || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setArticles(data);
      return;
    }

    if (!query) {
      setArticles([]);
      return;
    }

    const loadNews = async () => {
      setLoading(true);
      setError(null);

      try {
        let searchTerm = query;

        // 종목코드면 종목명으로 변환
        if (/^\d+$/.test(query)) {
          const stockInfo = await getStockInfoFromDB(query);
          if (stockInfo) searchTerm = stockInfo.name;
        }

        const response = await fetchHoldingStockNews(
          searchTerm,
          10,
          1,
          "sim"
        );

        const mappedItems: NewsItem[] = response.items.map((item: any) => ({
          id: item.link,
          title: item.title.replace(/<[^>]*>?/gm, ""),
          source: "네이버 뉴스",
          time: new Date(item.pubDate).toLocaleDateString(),
          url: item.link,
        }));

        setArticles(mappedItems);
      } catch (e) {
        console.error(e);
        setError("뉴스를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [data, query]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
      {/* Header */}
      <h3 className="mb-4 text-lg font-semibold text-gray-100">
        관련 뉴스
      </h3>

      <div className="space-y-3">
        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-400">
            뉴스 불러오는 중…
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && articles.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#232332] py-10 text-center text-sm text-gray-400">
            관련 뉴스가 없습니다.
          </div>
        )}

        {/* News List */}
        {!loading &&
          !error &&
          articles.map((news) => (
            <a
              key={news.id}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                block rounded-xl border border-[#232332]
                bg-[#0f0f17] p-4
                transition
                hover:border-indigo-400/60
                hover:bg-[#161622]
              "
            >
              <p className="mb-2 font-medium text-gray-100">
                {news.title}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-400">
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
