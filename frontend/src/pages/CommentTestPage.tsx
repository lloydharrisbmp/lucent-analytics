import React from "react";
import { CommentThread } from "components/CommentThread";

const CommentTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comment Thread Test Page</h1>
      
      {/* Example Usage */}
      <div className="border rounded-lg p-4 max-w-2xl">
        <h2 className="text-xl mb-2">Test Context (Type: report, ID: report-123)</h2>
        <CommentThread 
          contextType="report" 
          contextId="report-123" 
        />
      </div>

      <div className="border rounded-lg p-4 mt-4 max-w-2xl">
        <h2 className="text-xl mb-2">Test Context 2 (Type: widget, ID: widget-abc, SubId: metric-1)</h2>
        <CommentThread 
          contextType="widget" 
          contextId="widget-abc" 
          contextSubId="metric-1"
        />
      </div>
    </div>
  );
};

export default CommentTestPage;
