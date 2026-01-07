import { useState } from "react";
import AIIssueBubbleCircular, {
    type BubbleItem,
} from "./AIIssueBubbleCircular";
import AIIssueDetailPanel from "./AIIssueDetailPanel";
import { MousePointerClick } from "lucide-react"; // 아이콘 예시 (없으면 생략 가능)

interface Props {
    bubbles: BubbleItem[];
}

export default function AIIssueLayout({ bubbles }: Props) {
    const [selectedBubble, setSelectedBubble] =
        useState<BubbleItem | null>(null);

    return (
        <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-200">
                최근 1달간 뉴스 연관 종목
            </h3>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                {/* Left : Bubble Panel */}
                <div className="
          flex items-center justify-center
          rounded-xl
          border border-[#2a2a35]
          bg-gradient-to-b from-[#1a1a24] to-[#14141c]
          p-3
          min-h-[380px]
        ">
                    <AIIssueBubbleCircular
                        bubbles={bubbles}
                        onSelect={setSelectedBubble}
                    />
                </div>

                {/* Right : Detail Panel */}
                <div className="
          rounded-xl
          border border-[#2a2a35]
          bg-gradient-to-b from-[#1a1a24] to-[#14141c]
          p-2
          min-h-[380px]
          flex flex-col
        ">
                    {selectedBubble ? (
                        <AIIssueDetailPanel bubble={selectedBubble} />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 animate-pulse">
                            <MousePointerClick size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-semibold text-gray-300">
                                키워드를 선택해주세요
                            </p>
                            <p className="text-sm mt-2">
                                좌측 버블 차트에서 원을 클릭하면<br />
                                관련된 상세 뉴스와 종목이 표시됩니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}