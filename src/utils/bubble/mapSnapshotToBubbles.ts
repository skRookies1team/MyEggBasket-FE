import type { BubbleSnapshot, BubbleItem } from "../../types/bubble";

/**
 * DB snapshot → BubbleChart 데이터
 */
export function mapSnapshotToBubbles(
  snapshot: BubbleSnapshot
): BubbleItem[] {
  return snapshot.keywords.map((k) => ({
    name: k.name,
    mentions: k.count,
    size: Math.sqrt(k.count) * 14, // bubble size 보정
  }));
}
