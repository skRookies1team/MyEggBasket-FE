import type { ReportItem } from "../../types/stock.ts";

interface StockReportsProps {
  data: ReportItem[];
}

export function StockReports({ data }: StockReportsProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
      {/* Header */}
      <h3 className="mb-4 text-lg font-semibold text-gray-100">
        애널리스트 리포트
      </h3>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#232332] py-10 text-center text-sm text-gray-400">
            리포트가 없습니다.
          </div>
        ) : (
          data.map((report) => (
            <div
              key={report.id}
              className="
                rounded-xl border border-[#232332]
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
                    {report.source} • {report.date}
                  </p>
                </div>

                {/* Sentiment Badge */}
                <span
                  className={`
                    shrink-0 rounded-md px-3 py-1 text-xs font-semibold
                    ${
                      report.sentiment === "buy"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : report.sentiment === "sell"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-gray-500/15 text-gray-300"
                    }
                  `}
                >
                  {report.sentiment.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-400">
                {report.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
