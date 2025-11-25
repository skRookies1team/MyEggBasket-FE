import { useEffect, useState, useRef, memo } from 'react';
import type { NewsItem } from '../../types/stock';

interface StockNewsProps {
    data: NewsItem[];
    query?: string; // 검색어
}

export const StockNews = memo(function StockNews({ data, query }: StockNewsProps) {
    const [articles, setArticles] = useState<NewsItem[]>(data || []);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeAllowed, setIframeAllowed] = useState<boolean | null>(null);
    const [iframeLoading, setIframeLoading] = useState<boolean>(false);
    const iframeTimeoutRef = useRef<number | null>(null);

    const openArticle = (news?: NewsItem) => {
        console.log('openArticle called', news?.url);
        if (!news) return;
        setSelectedNews(news);
    };
    const closeArticle = () => setSelectedNews(null);

    // 모달 열릴 때 body 스크롤 잠금, Esc로 닫기, 포커스 관리
    useEffect(() => {
        if (!selectedNews) return;
        console.log('modal open render', selectedNews.url);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeArticle();
        };
        window.addEventListener('keydown', onKey);

        // 포커스 이동
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        // iframe 탐색 허용 여부 초기화 및 타임아웃 설정
        setIframeAllowed(null);
        setIframeLoading(true);
        if (iframeTimeoutRef.current) {
            window.clearTimeout(iframeTimeoutRef.current);
            iframeTimeoutRef.current = null;
        }
        iframeTimeoutRef.current = window.setTimeout(() => {
            // 일정 시간 내에 onLoad 검사되지 않으면 차단된 것으로 간주
            setIframeAllowed(false);
            setIframeLoading(false);
        }, 1500);

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            // 모달 닫힐 때 iframe 타임아웃 정리
            if (iframeTimeoutRef.current) {
                window.clearTimeout(iframeTimeoutRef.current);
                iframeTimeoutRef.current = null;
            }
            // 로딩 상태 초기화
            setIframeLoading(false);
            setIframeAllowed(null);
        };
    }, [selectedNews]);

    // iframe onLoad 검사 핸들러
    const onIframeLoad = () => {
        if (!iframeRef.current) return;
        try {
            // cross-origin 접근 시 SecurityError 발생 -> 허용 여부 판별만
            iframeRef.current.contentWindow?.location?.href;
            setIframeAllowed(true);
        } catch {
            setIframeAllowed(false);
        } finally {
            setIframeLoading(false);
            if (iframeTimeoutRef.current) {
                window.clearTimeout(iframeTimeoutRef.current);
                iframeTimeoutRef.current = null;
            }
        }
    };

    useEffect(() => {
        // 기존 뉴스 로직
        if (data && data.length > 0) {
            const t = window.setTimeout(() => setArticles(data), 0);
            return () => window.clearTimeout(t);
        }

        if (!query) {
            const t = window.setTimeout(() => setArticles([]), 0);
            return () => window.clearTimeout(t);
        }

        const API_KEY = import.meta.env.VITE_NEWS_API_KEY as string | undefined;
        if (!API_KEY) {
            // setState를 동기적으로 바로 호출하면 render cascade 경고가 날 수 있으므로 비동기로 스케줄
            window.setTimeout(() => setError('뉴스 API 키가 설정되어 있지 않습니다. VITE_NEWS_API_KEY를 .env에 설정하세요.'), 0);
            return;
        }

        const controller = new AbortController();
        const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=publishedAt&apiKey=${API_KEY}`;

        setLoading(true);
        setError(null);

        fetch(url, { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`NewsAPI 오류: ${res.status} ${txt}`);
                }
                return res.json();
            })
            .then((json) => {
                const articlesRaw = Array.isArray(json.articles) ? (json.articles as unknown[]) : [];
                const items: NewsItem[] = articlesRaw.map((raw) => {
                    const a = raw as {
                        url?: string;
                        title?: string;
                        source?: { name?: string } | null;
                        publishedAt?: string;
                    };
                    return {
                        id: a.url || `${a.title}-${a.publishedAt}`,
                        title: a.title || '제목 없음',
                        source: (a.source && a.source.name) || '알 수 없음',
                        time: a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '',
                        url: a.url || undefined,
                    } as NewsItem;
                });
                setArticles(items);
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                console.error(err);
                setError(err.message || '뉴스를 불러오는 중 오류가 발생했습니다.');
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [data, query]);

    return (
        <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
            <h3 className="text-[#1e1e1e] mb-4">관련 뉴스</h3>
            <div className="space-y-3">
                {loading && <p className="text-gray-500">뉴스를 불러오는 중...</p>}
                {!loading && error && <p className="text-red-500">{error}</p>}
                {!loading && !error && articles.length === 0 && <p className="text-gray-500">관련 뉴스가 없습니다.</p>}
                {!loading && !error && articles.map((news, idx) => (
                    <div key={news.id || idx} className="p-4 border border-[#e8e8e8] rounded-lg hover:bg-[#f3edf7] cursor-pointer">
                        <button onClick={() => openArticle(news)} className="text-left w-full">
                            <p className="text-[#1e1e1e] mb-2 underline">{news.title}</p>
                            <div className="flex items-center gap-2 text-[13px] text-[#49454f]">
                                <span>{news.source}</span><span>•</span><span>{news.time}</span>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            {/* modal: 포털 대신 컴포넌트 내부에 인라인으로 렌더 (디버그/스택컨텍스트 확인용) */}
            {selectedNews && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2147483647 }}
                    onClick={closeArticle}
                    data-testid="inline-news-modal"
                >
                    <div onClick={(e) => e.stopPropagation()} className="relative w-[90%] max-w-3xl bg-white rounded-md overflow-hidden p-6" style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.35)' }}>
                        <button ref={closeBtnRef} onClick={closeArticle} className="absolute top-3 right-3 z-50 bg-white px-3 py-1 rounded shadow">닫기</button>
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold">{selectedNews.title}</h4>
                            <div className="text-[13px] text-[#666]">{selectedNews.source}</div>
                        </div>
                        <div className="mb-4" style={{ height: '80vh', width: '80vw'}}>
                            {/* iframe 시도: 로드 성공 여부를 onLoad에서 검사하여 차단 시 fallback 메시지를 표시함 */}
                            <iframe
                                ref={iframeRef}
                                src={selectedNews.url}
                                title={selectedNews.title}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                onLoad={onIframeLoad}
                                style={{ borderRadius: 6 }}
                            />
                            {/* 차단된 경우 또는 로드 실패 시 보이는 안내 */}
                            {iframeAllowed === false && (
                                <div className="mt-4 text-sm text-[#333]">
                                    <p>해당 뉴스는 외부 사이트에 호스팅되어 있어 모달 내에서 바로 표시되지 않습니다.</p>
                                    <p className="mt-2">아래 버튼을 눌러 새 탭에서 원문을 확인하세요.</p>
                                </div>
                            )}
                            {/* 로딩 중이면 간단한 안내 표시 */}
                            {iframeLoading && <div className="mt-4 text-sm text-[#666]">원문 로드 중...</div>}
                        </div>
                        <div className="flex gap-3">
                            <a href={selectedNews.url} target="_blank" rel="noopener noreferrer" className="bg-[#4f378a] text-white px-4 py-2 rounded">새 탭에서 열기</a>
                            <button onClick={() => { try { navigator.clipboard.writeText(selectedNews.url || ''); } catch { /* ignore */ } }} className="px-4 py-2 border rounded">링크 복사</button>
                        </div>
                     </div>
                 </div>
             )}
        </div>
    );
});
