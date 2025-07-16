import React from "react";

const ControlsSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Skeleton for the top row of view mode tabs */}
      <div className="flex space-x-4 border-b border-gray-200 h-11 items-center px-2">
        <div className="h-7 w-20 bg-gray-300 rounded-md"></div>
        <div className="h-7 w-20 bg-gray-200 rounded-md"></div>{" "}
        {/* Mimics active tab */}
        <div className="h-7 w-20 bg-gray-200 rounded-md"></div>
        <div className="h-7 w-20 bg-gray-200 rounded-md"></div>
        <div className="h-7 w-20 bg-gray-200 rounded-md"></div>
      </div>

      {/* Skeleton for the bottom filter bar */}
      <div className="flex flex-wrap gap-3 items-center p-3 bg-gray-50 min-h-[64px]">
        {/* Placeholder for a dropdown or two */}
        <div className="h-8 w-56 bg-gray-200 rounded-md"></div>

        {/* This spacer pushes the right-side elements over */}
        <div className="flex-grow"></div>

        {/* Placeholder for the toggles on the right */}
        <div className="h-9 w-58 bg-gray-200 rounded-md"></div>
        <div className="h-9 w-58 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );
};

export default ControlsSkeleton;
