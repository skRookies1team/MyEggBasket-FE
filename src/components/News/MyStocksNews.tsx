// MyStocksNews.tsx

import { useEffect, useState } from "react";
import type { AccountBalanceData } from "../../types/stock";
import { fetchUserBalance } from "../../api/accountApi";
import { fetchHoldingStockNews } from "../../api/newsApi";

// 뉴스 데이터 타입 정의 (fetchHoldingStockNews API 응답 구조에 맞게)
interface NewsItem {
  stockName?: string; // 주식 종목명 (보유 종목 식별용)
  title: string;
  link: string;
  time: string; // 포매팅된 날짜 문자열
}

// RFC 822 형식의 문자열을 받아 한국어 형식으로 포매팅하는 함수
function formatNaverDate(dateString: string): string {
  try {
    // 1. Date 객체 생성 (네이버 API의 날짜 형식은 JS Date 객체가 파싱 가능)
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }

    // 2. 원하는 형식으로 변환을 위한 구성 요소 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth()는 0부터 시작
    const day = date.getDate();
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 || 12; // 0시(자정)는 12시로 표시

    // 3. 한국어 형식 문자열로 조합
    return `${year}년 ${month}월 ${day}일 ${ampm} ${displayHour}시 ${minutes}분`;
    
  } catch (error) {
    console.error("날짜 포매팅 오류:", error);
    return dateString; // 변환 실패 시 원래 문자열 반환
  }
}


export default function MyStocksNews() {
  // 상태 초기화 시 타입을 지정하여 명확하게 관리
  const [news, setNews] = useState<NewsItem[]>([]); 

  const [balanceData, setBalanceData] = useState<AccountBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. 잔고 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserBalance();
        if (data)
          setBalanceData(data);
      } catch (error) {
        console.error("잔고 로딩 실패", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // 컴포넌트 마운트 시 한 번 실행

  // 2. 잔고 데이터(holdings)가 로딩되면, 해당 주식들의 뉴스를 가져오기
  useEffect(() => {
    const { holdings } = balanceData || {};
    
    // holdings가 존재하고, 데이터가 비어있지 않을 때만 실행
    if (holdings && holdings.length > 0) {
      const loadHoldingNews = async () => {
        try {
          // 모든 뉴스 가져오기 비동기 요청을 Promise 배열로 만듭니다.
          const newsPromises = holdings.map((stock) => 
            // stockName으로 뉴스 검색을 요청합니다.
            fetchHoldingStockNews(stock.stockName) 
          );

          // Promise.all로 모든 요청이 완료되기를 기다립니다.
          const newsResults = await Promise.all(newsPromises);

          // 가져온 뉴스 데이터를 하나의 배열로 합치고, 필요한 정보만 추출하여 포맷합니다.
          const combinedNews: NewsItem[] = newsResults.flatMap((naverNews, index) => {

             // 네이버 뉴스 API의 items 배열을 사용합니다.
             // 네이버 뉴스 API 응답에 items가 없을 경우를 대비하여 ?.items를 사용하거나 filter 처리 필요
             if (!naverNews || !naverNews.items) return [];

             return naverNews.items.map((item: any) => ({
                stockName: holdings[index].stockName,
                title: item.title.replace(/<[^>]*>?/gm, ''), // HTML 태그 제거
                link: item.link,
                // **추가된 포매팅 함수 적용**
                time: formatNaverDate(item.pubDate), 
             }));
          });
          
          setNews(combinedNews); // 상태 업데이트
        } catch (error) {
          // CORS 에러나 다른 API 호출 오류가 발생했을 때 처리됩니다.
          console.error("보유 주식 뉴스 로딩 실패", error);
        }
      };

      loadHoldingNews();
    }
  }, [balanceData]); // balanceData가 변경될 때마다 실행

  return (
    <div>
      {loading && <div>잔고 데이터를 로딩 중입니다...</div>}
      
      {!loading && news.length === 0 && (
          <div>보유 주식 뉴스가 없거나, 뉴스 로딩에 실패했습니다. (CORS 문제일 수 있습니다.)</div>
      )}
      
      {/* news 상태에 저장된 데이터를 렌더링 */}
      {news.map((n, i) => (
        <div key={i} className="news-item" style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <strong>
            <p className="stockName" style={{ margin: '0 0 5px 0', color: '#1a73e8' }}>{n.stockName || 'N/A'}</p>
          </strong>
          <a href={n.link} target="_blank" rel="noopener noreferrer" 
             style={{ display: 'block', textDecoration: 'none', color: '#333' }}
          >
             {n.title}
          </a> 
          <div className="time" style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
             {n.time}
          </div>
        </div>
      ))}
      
    </div>
  );
}