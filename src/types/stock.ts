// types/stock.ts

export type Period = 'minute' | 'day' | 'week' | 'month' | 'year';
export type TabType = 'chart' | 'order' | 'news' | 'info' | 'indicators' | 'report';

export interface StockPriceData {
    time: string;
    price: number;
    volume: number;
}

export interface OrderItem {
    price: number;
    volume: number;
    percent: number; // 시각적 바 길이 (0-100)
}

export interface OrderBookData {
    sell: OrderItem[];
    buy: OrderItem[];
}

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
}

export interface FinancialItem {
    year: string;
    value: number;
}

export interface FinancialData {
    revenue: FinancialItem[];
    profit: FinancialItem[];
}

export interface ReportItem {
    id: string;
    title: string;
    source: string;
    date: string;
    sentiment: 'buy' | 'sell' | 'hold';
    summary: string;
}

// 메인 페이지에 전달될 전체 데이터 구조
export interface StockDetailData {
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    chartData: StockPriceData[];
    orderBook: OrderBookData;
    news: NewsItem[];
    financials: FinancialData;
    reports: ReportItem[];
}