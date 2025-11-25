export interface StockItem {
  code: string;
  name: string;
  price: number;
  change: number;     // 등락액
  percent: number;    // 등락률
  amount: number;     // 거래대금
  volume: number;     // 거래량
}
