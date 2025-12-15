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
    change: number;
    percent: number;
    volume: number;
    amount: number; // 거래대금 추가
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
export interface AccountHolding {
    stockCode: string;           // 종목번호 (005930)
    stockName: string;      // 종목명 (삼성전자)
    quantity: number;       // 보유수량
    orderableQuantity: number;   // 주문가능수량
    avgPrice: number;  // 매입평균가격
    currentPrice: number;           // 현재가
    evaluationAmount: number;       // 평가금액
    profitLossAmount: number;  // 평가손익금액
    profitLossRate: number;   // 평가손익율
}

// 주식 잔고 - 계좌 요약 (output2)
export interface AccountSummary {
    totalEvaluationAmount: number
    totalProfitLossAmount: number
    totalPurchaseAmount: number
    totalCashAmount: number
    d1CashAmount:number
    d2CashAmount:number
    netAssetAmount: number
    profitRate: number
}

export interface AccountBalanceData {
    summary: AccountSummary;
    holdings:AccountHolding[]
}

export interface InvestorInfo {
  type: "개인" | "외국인" | "기관";
  netBuyQty: number;
  netBuyAmount: number; // 원 단위
}

export interface InvestorTrendResponse {
  stockCode: string;
  stockName: string;
  investors: InvestorInfo[];
}
export interface Stock{
    stockCode: string;
    name: string;
    marketType: string;
    sector: string;
    industryCode: string;
}

export interface StockCurrentPrice {
    stockCode: string;
    stockname: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    volume: number;
    tradingValue:number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    closePrice:number;
}
