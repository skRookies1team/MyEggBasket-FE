import { useState } from 'react';
import { Newspaper, FileText } from 'lucide-react';
import type { Holding } from '../../store/historyStore';

interface StockReason {
    news: string[];
    reports: string[];
    valueChain: string[];
}

interface StockItem {
    name: string;
    allocation: number;
    reason: StockReason;
}

interface PortfolioStockListProps {
    stocks: Holding[];
}

export function PortfolioStockList({ stocks }: PortfolioStockListProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div style={{ marginTop: '24px', borderTop: '1px solid #d9d9d9', paddingTop: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>AI 추천 종목 상세 (참고용)</h3>

            {stocks.map((stock, index) => (
                <div key={index} className="stock-card">
                    <div
                        className="stock-header"
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: '#4f378a', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, color: '#1e1e1e', marginBottom: '4px' }}>{stock.name}</p>
                                <p style={{ fontSize: '13px', color: '#49454f' }}>
                                    추천 비중: <span className="text-purple" style={{ fontWeight: 600 }}>{stock.allocation}%</span>
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#4f378a', backgroundColor: '#eaddff', padding: '4px 12px', borderRadius: '12px' }}>
                                상세보기
                            </span>
                        </div>
                    </div>

                    {expandedIndex === index && (
                        <div className="stock-detail">
                            {/* 뉴스 */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Newspaper className="size-4 text-purple" />
                                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>관련 뉴스</h4>
                                </div>
                                {stock.reason.news.map((news, idx) => (
                                    <div key={idx} style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '4px', fontSize: '13px' }}>
                                        • {news}
                                    </div>
                                ))}
                            </div>

                            {/* 리포트, 밸류체인 생략 가능 혹은 동일 패턴 반복 */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <FileText className="size-4 text-purple" />
                                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>증권사 리포트</h4>
                                </div>
                                {stock.reason.reports.map((report, idx) => (
                                    <div key={idx} style={{ padding: '8px', background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '4px', fontSize: '13px' }}>
                                        • {report}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}