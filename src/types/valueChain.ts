export interface ValueChainStock {
  name: string;
  code: string;
}

export interface ValueChainNode {
  sector: string;
  stage1?: string;
  stage2?: string;
  stage3?: string;
  stocks: ValueChainStock[];
}
