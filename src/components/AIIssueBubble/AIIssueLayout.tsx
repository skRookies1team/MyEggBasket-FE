import React, { useState } from "react";
import AIIssueBubbleCircular, { type BubbleItem } from "../AIIssueBubble/AIIssueBubbleCircular";
import AIIssueDetailPanel from "../AIIssueBubble/AIIssueDetailPanel";
import "../../assets/AIIssueBubble/AIIssueLayout.css";

interface Props {
  bubbles: BubbleItem[];
}

export default function AIIssueLayout({ bubbles }: Props) {
  const [selectedBubble, setSelectedBubble] = useState<BubbleItem | null>(null);

  return (
    <div className="ai-layout-wrapper">
      <h3 className="ai-layout-title">최근 7일간 뉴스 연관 종목</h3>

      <div className="ai-layout-panels">

        {/* 왼쪽 버블 패널 */}
        <div className="panel-box bubble-panel">
          <AIIssueBubbleCircular
            bubbles={bubbles}
            onSelect={(item) => setSelectedBubble(item)}
          />
        </div>

        {/* 오른쪽 상세 패널 */}
        <div className="panel-box detail-panel">
          <AIIssueDetailPanel bubble={selectedBubble} />
        </div>

      </div>
    </div>
  );
}
