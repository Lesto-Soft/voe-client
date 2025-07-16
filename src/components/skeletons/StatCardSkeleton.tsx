import React from "react";

// Define the types for the component's props
interface StatCardSkeletonProps {
  type: "text" | "pieChart";
}

const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ type }) => {
  // Common container classes to match the real cards' height and style
  const containerClasses =
    "bg-white p-4 rounded-lg shadow-md flex flex-col min-h-[270px]";

  // Render the Pie Chart variant
  if (type === "pieChart") {
    return (
      <div className={containerClasses}>
        <div className="animate-pulse h-full w-full flex flex-col">
          {/* Title Placeholder */}
          <div className="h-5 w-3/4 bg-gray-200 rounded-md mx-auto mb-4"></div>

          {/* Main content area: chart + legend */}
          <div className="flex-grow flex flex-row items-center gap-7">
            {/* Pie chart circle placeholder (larger) */}
            <div className="h-35 w-35 bg-gray-200 rounded-full flex-shrink-0"></div>

            {/* Legend item placeholders */}
            <div className="flex-grow flex flex-col gap-3 w-full">
              <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the Text/Stat variant (default)
  // This layout works well for both the "SummaryCard" and "TopUserCard"
  return (
    <div className={containerClasses}>
      <div className="animate-pulse h-full w-full flex flex-col items-center">
        {/* Title Placeholder */}
        <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-6"></div>

        <div className="flex-grow flex flex-col justify-center items-center gap-4 w-full">
          {/* Placeholder for a large number or an avatar */}
          <div className="h-16 w-28 bg-gray-200 rounded-full"></div>

          {/* Sub-text placeholders */}
          <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
        </div>

        {/* Footer text placeholder */}
        <div className="h-3 w-1/4 bg-gray-200 rounded-md mt-auto mb-1"></div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;
