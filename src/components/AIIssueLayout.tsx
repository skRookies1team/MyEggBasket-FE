import React, { useState } from "react";
import AIIssueBubbleCircular, { BubbleItem } from "../components/AIIssueBubbleCircular";
import AIIssueDetailPanel from "../components/AIIssueDetailPanel";
import "../assets/AIIssueLayout.css";

export default function AIIssueLayout({ bubbles }: { bubbles: BubbleItem[] }) {
  const [selected, setSelected] = useState<BubbleItem | null>(null);

  return (
    <div className="ai-layout">
      <div className="left-area">
        <AIIssueBubbleCircular 
          bubbles={bubbles} 
          onSelect={(item) => setSelected(item)}   // 🔥 이제 타입 정상 적용
        />
      </div>

      <div className="right-area">
        <AIIssueDetailPanel bubble={selected} />
      </div>
    </div>
  );
}
