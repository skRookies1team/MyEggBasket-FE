import { useEffect, useState } from "react";

export default function TopNews() {
  const [news, setNews] = useState<
    { title: string; link: string; time: string }[]
  >([]);

  useEffect(() => {
    // TODO: API 연동 (네이버 뉴스, 한국투자 뉴스, 자체 크롤링 등)
    setNews([
      {
        title: "삼성전자, AI 반도체 공급 확대 발표",
        link: "#",
        time: "2분 전",
      },
      {
        title: "코스피 상승…외국인 순매수 지속",
        link: "#",
        time: "7분 전",
      },
    ]);
  }, []);

  return (
    <div>
      {news.map((n, i) => (
        <div key={i} className="news-item">
          <a href={n.link} target="_blank">{n.title}</a>
          <div className="time">{n.time}</div>
        </div>
      ))}
    </div>
  );
}
