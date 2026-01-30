// src/components/skeletons/CaseSubmissionSkeleton.tsx
import React from "react";

const CaseSubmissionSkeleton: React.FC = () => {
  const categoryWidths = [
    "w-32",
    "w-28",
    "w-24",
    "w-28",
    "w-20",
    "w-36",
    "w-40",
    "w-24",
    "w-44",
    "w-32",
    "w-24",
    "w-40",
  ];

  const PrioritySkeleton = () => (
    <div className="space-y-3">
      <div className="h-4 w-1/4 bg-stone-200 rounded"></div>
      <div className="flex items-center gap-x-4 pt-1">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-stone-200 rounded-full"></div>
          <div className="h-4 w-10 bg-stone-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-stone-200 rounded-full"></div>
          <div className="h-4 w-12 bg-stone-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-stone-200 rounded-full"></div>
          <div className="h-4 w-12 bg-stone-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const FileAttachmentSkeleton = () => (
    <div className="space-y-2">
      <div className="h-4 w-2/5 bg-stone-200 rounded"></div>
      <div className="h-11 bg-stone-200 rounded-md"></div>
      <div className="h-20 bg-transparent rounded-md mt-2"></div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-200 animate-pulse grid-rows-[auto_1fr]">
      {/* --- Header Skeleton --- */}
      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 bg-stone-300 rounded-md"></div>
          <div>
            <div className="h-7 w-48 bg-stone-300 rounded mb-2"></div>
            <div className="h-4 w-64 bg-stone-300 rounded"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-24 bg-stone-300 rounded-md"></div>
          <div className="h-10 w-24 bg-stone-300 rounded-md"></div>
          <div className="h-10 w-28 bg-stone-300 rounded-md"></div>
        </div>
      </div>

      {/* --- Left Panel Skeleton --- */}
      <div className="rounded-2xl shadow-md bg-white p-6 h-full space-y-4">
        {/* Username/Full Name */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-stone-200 rounded"></div>
            <div className="h-12 bg-stone-200 rounded-md"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-stone-200 rounded"></div>
            <div className="h-12 bg-stone-200 rounded-md"></div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2 mt-9">
          <div className="h-4 w-1/4 bg-stone-200 rounded"></div>
          <div className="h-68 bg-stone-200 rounded-md"></div>
        </div>

        {/* Priority Section Skeleton */}
        <div>
          <PrioritySkeleton />
        </div>
      </div>

      {/* --- Right Panel Skeleton --- */}
      <div className="rounded-2xl shadow-md bg-white p-6 h-full space-y-6">
        {/* Categories Section */}
        <div className="space-y-3">
          <div className="h-4 w-1/2 bg-stone-200 rounded"></div>
          <div className="flex flex-wrap gap-2 pt-1">
            {categoryWidths.map((width, i) => (
              <div
                key={i}
                className={`h-9 ${width} bg-stone-200 rounded-md`}
              ></div>
            ))}
          </div>
        </div>

        {/* File Attachment Skeleton */}
        <div>
          <FileAttachmentSkeleton />
        </div>
      </div>
    </div>
  );
};

export default CaseSubmissionSkeleton;
