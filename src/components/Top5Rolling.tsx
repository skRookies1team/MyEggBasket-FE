  import { useEffect, useState } from "react";
  import "../assets/Top5Rolling.css";

  interface StockItem {
    rank: number;
    name: string;
    price: number;
    change: string;
    percent: string;
    isUp: boolean;
  }

  interface Props {
    data: StockItem[];
    interval?: number; // 자동 전환 시간
  }

  export default function Top5Rolling({ data, interval = 2000 }: Props) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % data.length);
      }, interval);

      return () => clearInterval(timer);
    }, [data.length, interval]);

    const item = data[index];

    return (
      <div className="top5-rolling-box">
        <div className="rolling-rank">{item.rank}</div>

        <div className="rolling-info">
          <div className="rolling-name">{item.name}</div>

          <div className={`rolling-change ${item.isUp ? "up" : "down"}`}>
            {item.change} ({item.percent})
          </div>

          <div className="rolling-price">{item.price.toLocaleString()}</div>
        </div>
      </div>
    );
  }
