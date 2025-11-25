interface Item {
  name: string;    // 종목명
  price: number;   // 현재가
  rate: number;    // 등락률
  amount: number;  // 거래대금 
}

interface Props {
  title: string;
  data: Item[];
}

export default function InvestorSection({ title, data }: Props) {
  // 거래대금(amount) 기준 내림차순 정렬
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  // 원 → 억 단위 변환
  const toEok = (value: number) => {
    return Math.floor(value / 100_000_000).toLocaleString() + "억";
  };

  return (
    <div className="investor-section">
      <h3 className="investor-title">{title}</h3>

      <div className="investor-list">
        {sortedData.map((item, idx) => (
          <div key={idx} className="investor-item">
            {/* 왼쪽: 종목명 + 현재가 + 등락률 */}
            <div className="item-info">
              <div className="item-name">{item.name}</div>

              <div className="price-rate">
                <div className="item-price">
                  {item.price.toLocaleString()}원
                </div>

                <div className={`item-rate ${item.rate >= 0 ? "plus" : "minus"}`}>
                  {item.rate > 0 ? `+${item.rate}%` : `${item.rate}%`}
                </div>
              </div>
            </div>

            {/* 오른쪽: 거래대금(억원 단위) */}
            <div className="item-amount">
              {toEok(item.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
