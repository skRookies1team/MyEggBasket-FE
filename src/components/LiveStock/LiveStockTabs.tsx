import "../../assets/LiveStock/LiveStockTabs.css";

interface Props {
  selected: string;
  onChange: (v: any) => void;
}

export default function LiveStockTabs({ selected, onChange }: Props) {
  const tabs = [
    { id: "volume", label: "거래량" },
    { id: "amount", label: "거래대금" },
    { id: "rise", label: "급상승" },
    { id: "fall", label: "급하락" }
  ];

  return (
    <div className="stock-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`stock-tab ${selected === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
