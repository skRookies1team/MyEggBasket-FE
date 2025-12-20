/* StockFinancials.tsx */
import { useState, useEffect } from "react";
import {
  fetchFinancialMetrics,
  REPRT_CODES,
  type QuarterType,
} from "../../api/financialDataApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function StockFinancials({ stockCode }: { stockCode: string }) {
  const [year, setYear] = useState("2024");
  const [quarter, setQuarter] = useState<QuarterType>("4Q");
  const [realFinancials, setRealFinancials] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isYearlyLoading, setIsYearlyLoading] = useState(false);

  const years = Array.from(
    { length: 2025 - 2015 + 1 },
    (_, i) => (2025 - i).toString()
  );

  const quarters: { label: string; value: QuarterType }[] = [
    { label: "1분기", value: "1Q" },
    { label: "2분기", value: "2Q" },
    { label: "3분기", value: "3Q" },
    { label: "결산(연간)", value: "4Q" },
  ];

  /* ---------------- 상세 지표 ---------------- */
  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      const result = await fetchFinancialMetrics(
        stockCode,
        year,
        REPRT_CODES[quarter]
      );
      setRealFinancials(result);
      setLoading(false);
    };
    loadDetail();
  }, [stockCode, year, quarter]);

  /* ---------------- 연간 트렌드 ---------------- */
  useEffect(() => {
    const loadYearlyTrend = async () => {
      setIsYearlyLoading(true);

      const promises = Object.entries(REPRT_CODES).map(
        async ([qKey, qCode]) => {
          const res = await fetchFinancialMetrics(stockCode, year, qCode);
          return {
            name: qKey === "4Q" ? "결산" : qKey,
            revenue: res?.revenue || 0,
            profit: res?.profit || 0,
            netProfit: res?.netProfit || 0,
            liabilities: res?.totalLiabilities || 0,
          };
        }
      );

      setYearlyData(await Promise.all(promises));
      setIsYearlyLoading(false);
    };
    loadYearlyTrend();
  }, [stockCode, year]);

  /* ---------------- Utils ---------------- */
  const formatMoney = (v?: number) => {
    if (!v || isNaN(v)) return "-";
    const trillion = 1_0000_0000_0000;
    const hundredMillion = 1_0000_0000;
    if (Math.abs(v) >= trillion) return `${(v / trillion).toFixed(1)}조`;
    if (Math.abs(v) >= hundredMillion)
      return `${(v / hundredMillion).toFixed(1)}억`;
    return v.toLocaleString();
  };

  const chartFormatter = (v: number) =>
    Math.abs(v) >= 1_0000_0000
      ? `${(v / 1_0000_0000).toFixed(0)}억`
      : v.toString();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-6 shadow">
        {/* ---------------- Header ---------------- */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-100">
              {year}년 재무 정보
            </h3>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-md bg-[#0f0f17] px-2 py-1 text-sm text-gray-200 border border-[#232332]"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-lg bg-[#0f0f17] p-1">
            {quarters.map((q) => (
              <button
                key={q.value}
                onClick={() => setQuarter(q.value)}
                className={`px-4 py-1.5 text-sm rounded-md transition
                  ${
                    quarter === q.value
                      ? "bg-indigo-500/20 text-indigo-300 font-semibold"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- Metrics ---------------- */}
        {loading ? (
          <div className="py-10 text-center text-gray-400">
            데이터 로딩 중…
          </div>
        ) : !realFinancials || realFinancials.status !== "000" ? (
          <div className="rounded-xl border border-dashed border-[#232332] py-10 text-center text-gray-400">
            보고서가 아직 업로드되지 않았습니다.
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4 rounded-xl bg-[#0f0f17] p-5">
              <MetricBox title="매출액" value={formatMoney(realFinancials.revenue)} />
              <MetricBox title="영업이익" value={formatMoney(realFinancials.profit)} highlight />
              <MetricBox title="당기순이익" value={formatMoney(realFinancials.netProfit)} />
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-xl bg-[#0f0f17] p-5">
              <MetricBox title="부채총계" value={formatMoney(realFinancials.totalLiabilities)} />
              <MetricBox title="자본총계" value={formatMoney(realFinancials.totalEquity)} />
              <MetricBox
                title="부채비율"
                value={
                  realFinancials.debtRatio
                    ? `${realFinancials.debtRatio.toFixed(2)}%`
                    : "-"
                }
              />
            </div>
          </div>
        )}

        {/* ---------------- Chart ---------------- */}
        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <h4 className="border-l-4 border-indigo-400 pl-2 text-sm font-semibold text-gray-200">
              분기별 재무 추이
            </h4>
            <span className="text-xs text-gray-500">
              * 결산은 누적 데이터
            </span>
          </div>

          <div className="h-[380px]">
            {isYearlyLoading ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                차트 로딩 중…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#232332"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={chartFormatter}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(v: number) => formatMoney(v)}
                    contentStyle={{
                      background: "#0f0f17",
                      border: "1px solid #232332",
                      borderRadius: 12,
                      color: "#e5e7eb",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="매출액" fill="#f59e0b" />
                  <Bar dataKey="profit" name="영업이익" fill="#10b981" />
                  <Bar dataKey="netProfit" name="순이익" fill="#6366f1" />
                  <Bar dataKey="liabilities" name="부채총계" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metric Box */
/* ------------------------------------------------------------------ */
function MetricBox({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400">{title}</span>
      <span
        className={`mt-1 truncate text-lg font-bold ${
          highlight ? "text-indigo-400" : "text-gray-100"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
