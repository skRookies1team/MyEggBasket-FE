import "../assets/MarketIndexTicker.css";

interface MarketIndex {
  name: string;
  value: string;
  percent: string;
  isUp: boolean;
}

interface Props {
  indices: MarketIndex[];
}

export default function MarketIndexTicker({ indices }: Props) {
  // 리스트를 2번 복제 → 무한 롤링 효과
  const data = [...indices, ...indices];

  return (
    <div className="ticker-container">
      <div className="ticker-track">
        {data.map((item, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-name">{item.name}</span>
            <span className="ticker-value">{item.value}</span>
            <span className={`ticker-percent ${item.isUp ? "up" : "down"}`}>
              {item.percent}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
