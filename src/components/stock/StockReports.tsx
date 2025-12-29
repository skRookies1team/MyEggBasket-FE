import type { S3ReportItem } from "../../types/stock";

interface StockReportsProps {
  data: S3ReportItem[];
}

const S3_BASE =
  "https://eggstockbasket.s3.ap-northeast-2.amazonaws.com/reports";

/* --------------------------------------------------
 * 중복 제거: title + date 기준
 * -------------------------------------------------- */
function dedupeReports(list: S3ReportItem[]) {
  const map = new Map<string, S3ReportItem>();

  list.forEach((r) => {
    const key = `${r.title}_${r.date}`;
    if (!map.has(key)) {
      map.set(key, r);
    }
  });

  return Array.from(map.values());
}

export function StockReports({ data }: StockReportsProps) {
  const reports = dedupeReports(data);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
      {/* Header */}
      <h3 className="mb-4 text-lg font-semibold text-gray-100">
        애널리스트 리포트
      </h3>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#232332] py-10 text-center text-sm text-gray-400">
            리포트가 없습니다.
          </div>
        ) : (
          reports.map((report) => (
            <a
              key={report.file}
              href={`${S3_BASE}/${report.file}`}
              target="_blank"
              rel="noreferrer"
              className="
                block rounded-xl border border-[#232332]
                bg-[#0f0f17] p-4
                transition
                hover:border-indigo-400/60
                hover:bg-[#161622]
              "
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 font-medium text-gray-100">
                    {report.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {report.date}
                  </p>
                </div>

                {/* Download Badge */}
                <span
                  className="
                    shrink-0 rounded-md
                    bg-indigo-500/15 px-3 py-1
                    text-xs font-semibold text-indigo-400
                  "
                >
                  PDF
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
