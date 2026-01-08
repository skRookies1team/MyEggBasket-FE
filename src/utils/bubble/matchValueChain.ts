export function extractTextValues(obj: any): string[] {
  if (!obj || typeof obj !== "object") return [];

  return Object.values(obj).flatMap((v) => {
    if (typeof v === "string") return [v];
    if (Array.isArray(v)) return [];
    if (typeof v === "object") return extractTextValues(v);
    return [];
  });
}
