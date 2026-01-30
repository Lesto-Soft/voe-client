import React from "react";

const BarChartSkeleton: React.FC = () => {
  return (
    // This container mimics the BarChart's main div, including padding and a fixed height.
    <div className="p-4 w-full h-66">
      <div className="animate-pulse flex flex-col items-center h-full">
        {/* Title Placeholder */}
        <div className="h-5 w-1/4 bg-gray-200 rounded-md mb-4"></div>

        {/* Legend Placeholders */}
        <div className="flex justify-center items-center gap-x-6 mb-5">
          <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
        </div>

        {/* Chart Area */}
        <div className="flex-grow w-full flex items-end justify-around px-4 border-b border-gray-300">
          {/* Group 1 */}
          <div className="flex items-end w-1/5 h-full gap-x-5">
            <div className="w-full h-[25%] bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-[10%] bg-gray-200 rounded-t-md"></div>
          </div>
          {/* Group 2 */}
          <div className="flex items-end w-1/5 h-full gap-x-5">
            <div className="w-full h-[85%] bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-[35%] bg-gray-200 rounded-t-md"></div>
          </div>
          {/* Group 3 */}
          <div className="flex items-end w-1/5 h-full gap-x-5">
            <div className="w-full h-[55%] bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-[28%] bg-gray-200 rounded-t-md"></div>
          </div>
          {/* Group 4 */}
          <div className="flex items-end w-1/5 h-full gap-x-5">
            <div className="w-full h-[20%] bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-[12%] bg-gray-200 rounded-t-md"></div>
          </div>
        </div>

        {/* X-Axis Label Placeholders - Aligned with the groups */}
        <div className="w-full h-5 flex justify-around px-4 mt-2">
          <div className="w-30 h-4 bg-gray-200 rounded-sm"></div>
          <div className="w-30 h-4 bg-gray-200 rounded-sm"></div>
          <div className="w-30 h-4 bg-gray-200 rounded-sm"></div>
          <div className="w-30 h-4 bg-gray-200 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default BarChartSkeleton;
