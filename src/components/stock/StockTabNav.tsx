import type { TabType } from '../../types/stock.ts';

interface StockTabNavProps {
    activeTab: TabType;
    onTabChange: (t: TabType) => void;
}

export function StockTabNav({ activeTab, onTabChange }: StockTabNavProps) {
    const tabs: { id: TabType; label: string }[] = [
        { id: 'chart', label: '차트' },
        { id: 'news', label: '뉴스' },
        { id: 'info', label: '기업정보' },
        { id: 'report', label: '리포트' }
    ];
    return (
        <div className="bg-white border-b border-[#e8e8e8]">
            <div className="max-w-[1600px] mx-auto flex overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-6 py-4 whitespace-nowrap transition-colors ${
                            activeTab === tab.id
                                ? 'bg-[#eaddff] text-[#4f378a] border-b-2 border-[#4f378a]'
                                : 'text-[#49454f] hover:bg-[#f3edf7]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}