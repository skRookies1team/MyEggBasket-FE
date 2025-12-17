// stock/chart/utils.ts
import type { UTCTimestamp } from "lightweight-charts";

export function normalizeTime(
  time: string | number
): UTCTimestamp {
  if (typeof time === "string") {
    return (new Date(time).getTime() / 1000) as UTCTimestamp;
  }
  return (time > 1e12 ? time / 1000 : time) as UTCTimestamp;
}
