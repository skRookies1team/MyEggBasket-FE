import React, { useState } from "react";
import AIIssueBubbleCircular, { type BubbleItem } from "../AIIssueBubble/AIIssueBubbleCircular";
import AIIssueDetailPanel from "../AIIssueBubble/AIIssueDetailPanel";
import "../../assets/AIIssueBubble/AIIssueLayout.css";

export default function AIIssueLayout({ bubbles }: { bubbles: BubbleItem[] }) {
  const [selected, setSelected] = useState<BubbleItem | null>(null);

  return (
    <div className="ai-layout">
      <div className="left-area">
        <AIIssueBubbleCircular 
          bubbles={bubbles} 
          onSelect={(item) => setSelected(item)}   
        />
      </div>

      <div className="right-area">
        <AIIssueDetailPanel bubble={selected} />
      </div>
    </div>
  );
}
