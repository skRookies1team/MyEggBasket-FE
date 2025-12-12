import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/Top10Rolling.css";

export interface VolumeRankItem {
  name: string;
  code: string;
  rank: number;
  price: number;
  change: number;
  rate: number;
  volume: number;
  prevVolume: number;
  turnover: number;
}

interface Props {
  data: VolumeRankItem[];
  interval?: number;
}

export default function Top10Rolling({ data, interval = 2000 }: Props) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (data.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.length);
    }, interval);

    return () => clearInterval(timer);
  }, [data.length, interval]);

  if (data.length === 0) return null;

  const item = data[index];
  const isUp = item.change >= 0;

  return (
    <div
      className="top-rolling-box"
      onClick={() => navigate(`/stock/${item.code}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="tr-rank">{item.rank}</div>

      <div className="tr-info">
        <div className="tr-name">{item.name}</div>

        <div className={`tr-change ${isUp ? "up" : "down"}`}>
          {isUp ? "+" : ""}
          {item.change} ({item.rate.toFixed(2)}%)
        </div>

        <div className="tr-price">
          {item.price.toLocaleString()} 원
        </div>

        <div className="tr-volume">
          거래량: {item.volume.toLocaleString()}
        </div>

        <div className="tr-turnover">
          증가율: {item.turnover.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
