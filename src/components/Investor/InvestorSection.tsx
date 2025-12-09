interface Item {
  name: string;    // 종목명
  price: number;   // 현재가
  rate: number;    // 등락률
  amount: number;  // 거래대금 
  volume: number;  // 거래수량
}

interface Props {
  title: string;
  data: Item[];
  tab: "buy" | "sell";
}

export default function InvestorSection({ title, data, tab }: Props) {
  // 거래대금(amount) 기준 내림차순 정렬
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);


  return (
    <div className="investor-section">
      <h3 className="investor-title">{title}</h3>

      <div className="investor-list" data-testid={`${title}-${tab}-list`}>
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

            {/* 오른쪽: 거래대금 + 거래수량 */}
            <div className="item-trade-details">
              {/* 거래대금이 1억원 미만이면 만원 단위, 이상이면 억원 단위로 표시 */}
              {item.amount < 1 ? (
                <div className="item-amount">{(item.amount * 10000).toLocaleString()}만원</div>
              ) : (
                <div className="item-amount">{item.amount.toFixed(2)}억원</div>
              )}
              <div className="item-volume">
                {item.volume.toLocaleString()}주
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
