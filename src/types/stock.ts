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
    pdno: string;           // 종목번호 (005930)
    prdt_name: string;      // 종목명 (삼성전자)
    hldg_qty: number;       // 보유수량
    ord_psbl_qty: number;   // 주문가능수량
    pchs_avg_pric: number;  // 매입평균가격
    prpr: number;           // 현재가
    evlu_amt: number;       // 평가금액
    evlu_pfls_amt: number;  // 평가손익금액
    evlu_pfls_rt: number;   // 평가손익율
}
export interface CurrentPriceResult {
    stck_prpr: number; // 현재가
    prdy_vrss: number; // 전일대비
    prdy_ctrt: number; // 등락률
    acml_vol: number;  // 누적 거래량
}
// 주식 잔고 - 계좌 요약 (output2)
export interface AccountSummary {
    dnca_tot_amt: number;   // 예수금총금액
    nxdy_excc_amt: number;  // 익일정산금액 (D+1)
    prvs_rcdl_excc_amt: number; // 가수도정산금액 (D+2)
    scts_evlu_amt: number;  // 유가평가금액 (주식 총액)
    tot_evlu_amt: number;   // 총평가금액 (주식 + 예수금)
    nass_amt: number;       // 순자산금액
    asst_icdc_amt: number;  // 자산증감액
    tot_loan_amt: number;   // 총대출금액
    evlu_pfls_smtl_amt: number; // 총손익
}

export interface AccountBalanceData {
    holdings: AccountHolding[];
    summary: AccountSummary;
}