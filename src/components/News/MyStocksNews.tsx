import { useEffect, useState } from "react";

export default function MyStocksNews() {
  const [news, setNews] = useState<
    { ticker: string; title: string; link: string; time: string }[]
  >([]);

  useEffect(() => {
    setNews([
      {
        ticker: "005930",
        title: "삼성전자, 반도체 투자 확대",
        link: "#",
        time: "10분 전",
      },
      {
        ticker: "000660",
        title: "SK하이닉스 HBM 생산 라인 증설 추진",
        link: "#",
        time: "15분 전",
      },
    ]);
  }, []);

  return (
    <div>
      {news.map((n, i) => (
        <div key={i} className="news-item">
          <span className="ticker">{n.ticker}</span>
          <a href={n.link} target="_blank">{n.title}</a>
          <div className="time">{n.time}</div>
        </div>
      ))}
    </div>
  );
}
