import axios from 'axios';

/* ================================
 * Naver News API (기존 코드)
 * ================================ */
const naverApi = axios.create({
    baseURL: '/naver-api',
    headers: {
        'X-Naver-Client-Id': import.meta.env.VITE_NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_CLIENT_SECRET,
    },
});

export async function fetchHoldingStockNews(
    query = '주식',
    display = 2,
    start = 1,
    sort = 'sim'
) {
    try {
        const res = await naverApi.get('/v1/search/news.json', {
            params: {
                query,
                display,
                start,
                sort,
            },
        });
        return res.data;
    } catch (error) {
        console.error('Failed to fetch news from Naver API:', error);
        throw error;
    }
}

/* ================================
 * NewsAPI (한국 비즈니스/증시)
 * ================================ */
const newsApi = axios.create({
    baseURL: '/news-api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const NEWS_API_KEY = "83e964ec2d2e44e599dafd537f808802";

/**
 * 🇰🇷 한국 비즈니스 / 증시 뉴스
 */
export async function fetchKoreaBusinessNews(
  pageSize = 100,
  page = 1
) {
  const from = new Date(
    Date.now() - 1000 * 60 * 60 * 24 * 3
  ).toISOString();

  const res = await newsApi.get('/v2/everything', {
    params: {
      q: `
        코스피 OR
        코스닥 OR
        증시 OR
        주식 OR
        반도체 OR
        AI OR
        인공지능 OR
        금리 OR
        환율 OR
        경제
      `,
      language: 'ko',
      sortBy: 'publishedAt',
      from,
      pageSize,
      page,
      apiKey: NEWS_API_KEY,
    },
  });

  return res.data;
}
