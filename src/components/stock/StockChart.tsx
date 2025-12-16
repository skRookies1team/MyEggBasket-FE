import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Customized,
} from "recharts";
import type { StockPriceData, Period } from "../../types/stock";

/* ============================================================
   Candlestick Renderer (band scale 대응)
============================================================ */
function Candlestick(props: any) {
  const { xAxisMap, yAxisMap, data } = props;

  if (!xAxisMap || !yAxisMap || !data) return null;

  const xAxis: any = Object.values(xAxisMap)[0];
  const yAxis: any = Object.values(yAxisMap)[0];

  if (!xAxis?.scale || !yAxis?.scale) return null;

  const scaleX = xAxis.scale;
  const scaleY = yAxis.scale;

  // band scale 폭
  const bandWidth =
    typeof scaleX.bandwidth === "function"
      ? scaleX.bandwidth()
      : 10;

  const candleWidth = Math.max(4, bandWidth * 0.6);

  return (
    <>
      {data.map((d: any, i: number) => {
        if (
          d.open == null ||
          d.high == null ||
          d.low == null ||
          d.price == null
        ) {
          return null;
        }

        const x0 = scaleX(d.time);
        if (x0 == null) return null;

        const x = x0 + bandWidth / 2;

        const openY = scaleY(d.open);
        const closeY = scaleY(d.price);
        const highY = scaleY(d.high);
        const lowY = scaleY(d.low);

        if (
          [openY, closeY, highY, lowY].some(
            (v) => typeof v !== "number"
          )
        ) {
          return null;
        }

        const isUp = d.price >= d.open;
        const color = isUp ? "#ff383c" : "#1e6bff";

        return (
          <g key={i}>
            {/* High - Low */}
            <line
              x1={x}
              x2={x}
              y1={highY}
              y2={lowY}
              stroke={color}
              strokeWidth={1}
            />

            {/* Open - Close */}
            <rect
              x={x - candleWidth / 2}
              y={Math.min(openY, closeY)}
              width={candleWidth}
              height={Math.max(1, Math.abs(closeY - openY))}
              fill={color}
            />
          </g>
        );
      })}
    </>
  );
}

/* ============================================================
   StockChart
============================================================ */
interface StockChartProps {
  data: StockPriceData[];
  period?: Period;
  fixedDomain?: [number, number];
}

export function StockChart({
  data,
  period = "day",
  fixedDomain,
}: StockChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center p-10">데이터가 없습니다.</div>;
  }

  /* ---------------------------
     ✅ 데이터 오름차순 정렬 (중요)
  ---------------------------- */
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.time).getTime() -
      new Date(b.time).getTime()
  );

  /* ---------------------------
     Y축 도메인 계산
  ---------------------------- */
  let priceDomain: [number | "auto", number | "auto"] = [
    "auto",
    "auto",
  ];

  if (fixedDomain) {
    priceDomain = fixedDomain;
  } else {
    const prices = sortedData.flatMap((d) =>
      d.high != null && d.low != null
        ? [d.high, d.low]
        : [d.price]
    );

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = Math.max(1, Math.round((max - min) * 0.1));

    priceDomain = [min - pad, max + pad];
  }

  const formatTick = (value: string) => {
    if (period === "minute") {
      const d = new Date(value);
      return isNaN(d.getTime())
        ? value
        : d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
    }
    return value;
  };

  const isMinute = period === "minute";

  return (
    <div className="space-y-6">
      {/* ================= 가격 차트 ================= */}
      <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
        <h3 className="text-[#1e1e1e] mb-4">
          {isMinute ? "실시간 가격" : "캔들 차트"}
        </h3>

        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {isMinute ? (
              /* ---------- 분봉: LineChart ---------- */
              <LineChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  type="category"
                  allowDuplicatedCategory={false}
                  tickFormatter={formatTick}
                />
                <YAxis domain={priceDomain} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#ff383c"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              /* ---------- 일/주/월/년: Candlestick ---------- */
              <ComposedChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis domain={priceDomain} />
                <Tooltip />
                <Customized component={Candlestick} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= 거래량 ================= */}
      <div className="bg-white rounded-2xl border border-[#d9d9d9] p-6">
        <h3 className="text-[#1e1e1e] mb-4">거래량</h3>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="category"
                allowDuplicatedCategory={false}
                tickFormatter={formatTick}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="volume" fill="#ffb703" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
