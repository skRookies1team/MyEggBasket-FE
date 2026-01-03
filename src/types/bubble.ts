export type BubblePeriod =
  | "1_week"
  | "2_weeks"
  | "1_month"
  | "3_months";

export interface BubbleKeyword {
  name: string;
  count: number;
}

export interface BubbleSnapshot {
  period: BubblePeriod;
  snapshotDate: string;
  keywords: BubbleKeyword[];
}

/* BubbleChart 렌더링용 */
export interface BubbleItem {
  name: string;
  mentions: number;
  size: number;
}
