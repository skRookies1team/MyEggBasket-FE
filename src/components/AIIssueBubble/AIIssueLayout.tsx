import { useState } from "react";
import AIIssueBubbleCircular, {
  type BubbleItem,
} from "../AIIssueBubble/AIIssueBubbleCircular";
import AIIssueDetailPanel from "../AIIssueBubble/AIIssueDetailPanel";

interface Props {
  bubbles: BubbleItem[];
}

export default function AIIssueLayout({ bubbles }: Props) {
  const [selectedBubble, setSelectedBubble] =
    useState<BubbleItem | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-200">
        최근 7일간 뉴스 연관 종목
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
        ">
          <AIIssueDetailPanel bubble={selectedBubble} />
        </div>
      </div>
    </section>
  );
}
