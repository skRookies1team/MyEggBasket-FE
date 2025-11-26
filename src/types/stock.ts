// types/stock.ts

export type Period = 'minute' | 'day' | 'week' | 'month' | 'year';
export type TabType = 'chart' | 'order' | 'news' | 'info' | 'indicators' | 'report';

export interface StockPriceData {
    time: string;
    price: number;
    volume: number;
}

export interface StockItem {
    code: string;
    name: string;
    price: number;
    change: number;     // 등락액
    percent: number;    // 등락률
    amount: number;     // 거래대금
    volume: number;     // 거래량
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
    url?: string; // 원문 링크 (옵션)
}

export interface FinancialItem {
    year: string;
    value: number;
}

export interface FinancialData {
    revenue: FinancialItem[];      // 매출액 enpSaleAmt
    profit: FinancialItem[];       // 영업이익 enpBzopPft
    capital?: FinancialItem[];     // 자본금 enpCptlAmt
    netProfit?: FinancialItem[];   // 당기순이익 enpCrtmNpf
    totalAssets?: FinancialItem[]; // 총자산 enpTastAmt
    equity?: FinancialItem[];      // 자기자본 enpTcptAmt
    totalDebt?: FinancialItem[];   // 총부채 enpTdbtAmt
    debtRatio?: FinancialItem[];   // 부채비율 fnclDebtRto
    comprehensiveIncome?: FinancialItem[]; // 포괄손익 iclsPalClcAmt
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