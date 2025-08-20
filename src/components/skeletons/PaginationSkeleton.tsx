// src/components/skeletons/PaginationSkeleton.tsx
import React from "react";

const PaginationSkeleton = () => {
  return (
    <div className="flex items-center justify-between my-8 px-4 sm:px-6 lg:px-8 h-10 animate-pulse">
      <div className="hidden md:block h-6 w-48 bg-gray-200 rounded-md"></div>
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>
      <div className="hidden md:block h-6 w-48 bg-gray-200 rounded-md"></div>
    </div>
  );
};

export default PaginationSkeleton;
