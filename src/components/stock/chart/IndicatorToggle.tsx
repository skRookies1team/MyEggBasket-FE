import "../../../assets/IndicatorToggle.css";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
export type IndicatorKey = "price" |"ma" | "bollinger" |"rsi" | "macd" | "stochastic";

interface IndicatorToggleProps {
  enabled: IndicatorKey[];
  onChange: (next: IndicatorKey[]) => void;
}

/* ------------------------------------------------------------------ */
/* Indicator Config */
/* ------------------------------------------------------------------ */
const INDICATORS: { key: IndicatorKey; label: string }[] = [
  { key: "ma", label: "이동평균선" },
  { key: "bollinger", label: "볼린저 밴드"},
  { key: "rsi", label: "RSI" },
  { key: "macd", label: "MACD" },
  { key: "stochastic", label: "스토캐스틱"}
];

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function IndicatorToggle({
  enabled,
  onChange,
}: IndicatorToggleProps) {
  const toggle = (key: IndicatorKey) => {
    if (enabled.includes(key)) {
      // 가격 차트는 항상 켜져 있어야 함
      if (key === "price") return;
      onChange(enabled.filter((k) => k !== key));
    } else {
      onChange([...enabled, key]);
    }
  };

  return (
    <div className="indicator-toggle">
      {INDICATORS.map(({ key, label }) => (
        <button
          key={key}
          className={`indicator-btn ${
            enabled.includes(key) ? "active" : ""
          }`}
          onClick={() => toggle(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
