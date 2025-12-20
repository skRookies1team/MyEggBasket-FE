import { PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CompositionData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface PortfolioChartsProps {
  assetData: CompositionData[];
  stockData: CompositionData[];
  sectorData: CompositionData[];
}

export function AssetCharts({
  assetData,
  stockData,
  sectorData,
}: PortfolioChartsProps) {
  const renderChart = (title: string, data: CompositionData[]) => (
    <div className="rounded-2xl bg-gradient-to-b from-[#1a1a24] to-[#14141c] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <PieChartIcon className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold tracking-wide text-indigo-300">
          {title}
        </h3>
      </div>

      {/* Chart */}
      <div className="h-[240px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            표시할 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(val: number) =>
                  `₩${val.toLocaleString()}`
                }
                contentStyle={{
                  backgroundColor: "#14141c",
                  borderRadius: "8px",
                  border: "1px solid #2e2e44",
                  color: "#e5e7eb",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#e5e7eb" }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  color: "#c7d2fe",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {renderChart("자산 구성 (주식 / 현금)", assetData)}
      {renderChart("보유 종목 비중 (Top 5)", stockData)}
      {renderChart("섹터별 비중", sectorData)}
    </div>
  );
}
