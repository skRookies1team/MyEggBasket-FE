import "../../assets/LiveStock/LiveStockPeriodTabs.css";

interface Props {
  selected: string;
  onChange: (v: any) => void;
}

export default function LiveStockPeriodTabs({ selected, onChange }: Props) {
  const periods = [
    { id: "day", label: "일" },
    { id: "week", label: "주" },
    { id: "month", label: "월" },
    { id: "year", label: "년" },
  ];

  return (
    <div className="period-tabs">
      {periods.map((p) => (
        <button
          key={p.id}
          className={`period-tab ${selected === p.id ? "active" : ""}`}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
