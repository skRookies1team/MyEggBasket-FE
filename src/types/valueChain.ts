// types/valueChain.ts
export interface ValueChainRow {
  sector: string;
  stage1?: string;
  stage2?: string;
  stage3?: string;
  stockName?: string;
  stockCode: string;
}

export interface ValueChainStock {
  sector: string;
  stage: string;
  stockName: string;
  stockCode: string;
}
