import { useEffect, useState } from "react";
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
  interval?: number; // 자동 롤링 간격
}

export default function Top10Rolling({ data, interval = 2000 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % data.length);
    }, interval);

    return () => clearInterval(timer);
  }, [data.length, interval]);

  const item = data[index];
  const isUp = item.change >= 0;

  return (
    <div className="top-rolling-box">
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
