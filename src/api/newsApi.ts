import axios from 'axios';

const naverApi = axios.create({
    baseURL: '/naver-api',
    headers: {
        'X-Naver-Client-Id': import.meta.env.VITE_NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_CLIENT_SECRET,
    },
});

export async function fetchHoldingStockNews(query = '주식', display = 2, start = 1, sort = 'sim') {
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